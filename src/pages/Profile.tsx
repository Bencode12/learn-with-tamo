import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Trophy, Target, Award, Calendar, Clock, TrendingUp, UserPlus, Users, Search, Star, Zap, Crown, ArrowLeft, BookOpen, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import LanguageSelector from "@/components/LanguageSelector";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    name: "",
    email: "",
    avatar_url: "",
    joinDate: "",
    totalLessons: 0,
    hoursLearned: 0,
    streak: 0,
    level: 1,
    xp: 0,
    nextLevelXp: 1000,
    isPremium: false,
    isStaff: false,
    isAdmin: false
  });

  const [achievements, setAchievements] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [showAddPeople, setShowAddPeople] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [showAllAchievements, setShowAllAchievements] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserData();
      fetchFriends();
      fetchAchievements();
      fetchRecentActivity();
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;
    setLoading(true);

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const { data: lessons } = await supabase
      .from('lesson_progress')
      .select('*')
      .eq('user_id', user.id);

    if (profile) {
      const totalMinutes = lessons?.reduce((sum, l) => sum + l.time_spent, 0) || 0;
      const completedLessons = lessons?.filter(l => l.completed).length || 0;
      const userRoles = roles?.map(r => r.role) || [];

      setUserStats({
        name: profile.display_name || profile.username,
        email: user.email || "",
        avatar_url: profile.avatar_url || "",
        joinDate: new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        totalLessons: completedLessons,
        hoursLearned: Math.round(totalMinutes / 60),
        streak: calculateStreak(lessons || []),
        level: profile.level || 1,
        xp: profile.experience || 0,
        nextLevelXp: (profile.level || 1) * 1000,
        isPremium: profile.is_premium || false,
        isStaff: userRoles.includes('staff'),
        isAdmin: userRoles.includes('admin')
      });
    }
    setLoading(false);
  };

  const calculateStreak = (lessons: any[]) => {
    if (!lessons.length) return 0;
    const dates = lessons.map(l => new Date(l.last_accessed).toDateString());
    const uniqueDates = [...new Set(dates)].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < uniqueDates.length; i++) {
      const date = new Date(uniqueDates[i]);
      const diffDays = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === i) streak++;
      else break;
    }
    return streak;
  };

  const fetchFriends = async () => {
    if (!user) return;

    const { data: friendships } = await supabase
      .from('friendships')
      .select('id, user_id, friend_id, status')
      .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
      .eq('status', 'accepted');

    if (friendships && friendships.length > 0) {
      const friendIds = friendships.map(f => f.user_id === user.id ? f.friend_id : f.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url, level, is_premium')
        .in('id', friendIds);

      if (profiles) {
        setFriends(profiles.map(p => ({ ...p, friendshipId: friendships.find(f => f.friend_id === p.id || f.user_id === p.id)?.id })));
      }
    }

    const { data: pending } = await supabase
      .from('friendships')
      .select('id, user_id')
      .eq('friend_id', user.id)
      .eq('status', 'pending');

    if (pending && pending.length > 0) {
      const senderIds = pending.map(p => p.user_id);
      const { data: senders } = await supabase.from('profiles').select('id, username, display_name, avatar_url').in('id', senderIds);
      if (senders) {
        setPendingRequests(senders.map(s => ({ ...s, friendshipId: pending.find(p => p.user_id === s.id)?.id })));
      }
    }
  };

  const fetchAchievements = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('user_achievements')
      .select('*, achievements(*)')
      .eq('user_id', user.id);

    if (data) {
      setAchievements(data.map(a => ({
        ...a.achievements,
        earned: true,
        earnedAt: a.earned_at
      })));
    }
  };

  const fetchRecentActivity = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('lesson_progress')
      .select('*')
      .eq('user_id', user.id)
      .order('last_accessed', { ascending: false })
      .limit(5);

    if (data) {
      setRecentActivity(data.map(l => ({
        color: l.completed ? 'bg-green-500' : 'bg-blue-500',
        text: `${l.completed ? 'Completed' : 'Started'} ${l.lesson_id.replace(/-/g, ' ')} lesson`,
        time: formatTimeAgo(new Date(l.last_accessed))
      })));
    }
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);

    const { data } = await supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url, level')
      .or(`username.ilike.%${searchQuery}%,display_name.ilike.%${searchQuery}%`)
      .neq('id', user?.id)
      .limit(10);

    setSearchResults(data || []);
    setSearching(false);
  };

  const sendFriendRequest = async (friendId: string) => {
    if (!user) return;

    const { error } = await supabase.from('friendships').insert({
      user_id: user.id,
      friend_id: friendId,
      status: 'pending'
    });

    if (error) {
      toast.error('Failed to send friend request');
    } else {
      toast.success('Friend request sent!');
      setSearchResults(prev => prev.filter(r => r.id !== friendId));
    }
  };

  const acceptFriendRequest = async (friendshipId: string) => {
    const { error } = await supabase
      .from('friendships')
      .update({ status: 'accepted' })
      .eq('id', friendshipId);

    if (!error) {
      toast.success('Friend request accepted!');
      fetchFriends();
    }
  };

  const getRankIcon = (isPremium: boolean, isStaff: boolean, isAdmin: boolean) => {
    if (isAdmin) return <Crown className="h-4 w-4 text-red-500" />;
    if (isStaff) return <Star className="h-4 w-4 text-yellow-500" />;
    if (isPremium) return <Zap className="h-4 w-4 text-blue-500" />;
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <h1 className="text-xl font-bold">SūdžiusAI</h1>
              </Link>
            </div>
            <LanguageSelector />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showAddPeople && (
          <Card className="mb-8 border-blue-200 bg-blue-50 dark:bg-blue-900/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UserPlus className="h-5 w-5" />
                <span>Add People</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search for people..." 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10" 
                  />
                </div>
                <Button onClick={handleSearch} disabled={searching}>
                  {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
                </Button>
              </div>
              {searchResults.length > 0 && (
                <div className="space-y-2">
                  {searchResults.map((result) => (
                    <div key={result.id} className="flex items-center justify-between p-3 bg-card rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={result.avatar_url} />
                          <AvatarFallback>{(result.display_name || result.username)?.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{result.display_name || result.username}</p>
                          <p className="text-sm text-muted-foreground">Level {result.level}</p>
                        </div>
                      </div>
                      <Button size="sm" onClick={() => sendFriendRequest(result.id)}>
                        <UserPlus className="h-4 w-4 mr-1" /> Add
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              {pendingRequests.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Pending Requests</h4>
                  {pendingRequests.map((req) => (
                    <div key={req.friendshipId} className="flex items-center justify-between p-3 bg-card rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={req.avatar_url} />
                          <AvatarFallback>{(req.display_name || req.username)?.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <p className="font-medium">{req.display_name || req.username}</p>
                      </div>
                      <Button size="sm" onClick={() => acceptFriendRequest(req.friendshipId)}>Accept</Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader className="text-center">
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarImage src={userStats.avatar_url} />
                  <AvatarFallback className="text-2xl">{userStats.name?.slice(0, 2).toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex items-center justify-center space-x-2">
                  <CardTitle>{userStats.name}</CardTitle>
                  {getRankIcon(userStats.isPremium, userStats.isStaff, userStats.isAdmin)}
                </div>
                <CardDescription>{userStats.email}</CardDescription>
                <div className="flex justify-center gap-2 mt-2">
                  <Badge variant="secondary">Level {userStats.level}</Badge>
                  {userStats.isPremium && <Badge className="bg-purple-600">Premium</Badge>}
                  {userStats.isAdmin && <Badge className="bg-red-600">Admin</Badge>}
                  {userStats.isStaff && !userStats.isAdmin && <Badge className="bg-yellow-600">Staff</Badge>}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>XP Progress</span>
                    <span>{userStats.xp}/{userStats.nextLevelXp}</span>
                  </div>
                  <Progress value={(userStats.xp / userStats.nextLevelXp) * 100} />
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{userStats.totalLessons}</div>
                    <div className="text-sm text-muted-foreground">Lessons</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{userStats.hoursLearned}h</div>
                    <div className="text-sm text-muted-foreground">Hours</div>
                  </div>
                </div>
                <div className="flex items-center justify-center space-x-2 text-orange-600">
                  <Calendar className="h-5 w-5" />
                  <span className="font-medium">{userStats.streak} day streak!</span>
                </div>
                <p className="text-xs text-center text-muted-foreground">Member since {userStats.joinDate}</p>
              </CardContent>
            </Card>

            <Button variant="outline" className="w-full" onClick={() => setShowAddPeople(!showAddPeople)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add People
            </Button>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Friends ({friends.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {friends.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No friends yet. Add some!</p>
                  ) : (
                    friends.map((friend) => (
                      <div key={friend.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted cursor-pointer">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={friend.avatar_url} />
                          <AvatarFallback>{(friend.display_name || friend.username)?.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-1">
                            <p className="font-medium text-sm">{friend.display_name || friend.username}</p>
                            {friend.is_premium && <Zap className="h-3 w-3 text-blue-500" />}
                          </div>
                          <p className="text-xs text-muted-foreground">Level {friend.level}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5" />
                  <span>Achievements ({achievements.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(showAllAchievements ? achievements : achievements.slice(0, 4)).map((achievement) => (
                    <div key={achievement.id} className="p-4 rounded-lg border bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 dark:from-yellow-900/20 dark:to-orange-900/20">
                      <div className="flex items-start space-x-3">
                        <div className="text-2xl">{achievement.icon}</div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{achievement.name}</h3>
                          <p className="text-sm text-muted-foreground">{achievement.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {achievements.length === 0 && (
                    <div className="col-span-2 text-center py-8">
                      <Award className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">No achievements yet. Keep learning!</p>
                    </div>
                  )}
                </div>
                {achievements.length > 4 && !showAllAchievements && (
                  <Button variant="outline" className="w-full" onClick={() => setShowAllAchievements(true)}>
                    See all Achievements
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivity.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No recent activity</p>
                  ) : (
                    recentActivity.map((item, i) => (
                      <div key={i} className="flex items-center space-x-3 text-sm">
                        <div className={`w-2 h-2 ${item.color} rounded-full`} />
                        <span className="text-muted-foreground">{item.text}</span>
                        <span className="text-muted-foreground/60 ml-auto">{item.time}</span>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
