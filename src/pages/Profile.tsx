import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Trophy, Calendar, Clock, UserPlus, Users, Search, Star, Zap, Crown, Loader2 } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

const Profile = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
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
  const [friends, setFriends] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [showAddPeople, setShowAddPeople] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserData();
      fetchFriends();
      fetchAchievements();
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
        streak: 0,
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
        setFriends(profiles);
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
      .eq('user_id', user.id)
      .limit(6);

    if (data) {
      setAchievements(data.map(a => ({
        ...a.achievements,
        earnedAt: a.earned_at
      })));
    }
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
      toast.success('Friend request sent');
      setSearchResults(prev => prev.filter(r => r.id !== friendId));
    }
  };

  const acceptFriendRequest = async (friendshipId: string) => {
    const { error } = await supabase
      .from('friendships')
      .update({ status: 'accepted' })
      .eq('id', friendshipId);

    if (!error) {
      toast.success('Friend request accepted');
      fetchFriends();
    }
  };

  if (loading) {
    return (
      <AppLayout title="Profile">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-border/40">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <Avatar className="w-24 h-24 mx-auto">
                  <AvatarImage src={userStats.avatar_url} />
                  <AvatarFallback className="bg-muted text-2xl">
                    {userStats.name?.slice(0, 2).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <div className="flex items-center justify-center gap-2">
                    <h2 className="text-xl font-bold">{userStats.name}</h2>
                    {userStats.isAdmin && <Crown className="h-4 w-4 text-red-500" />}
                    {userStats.isStaff && !userStats.isAdmin && <Star className="h-4 w-4 text-yellow-500" />}
                    {userStats.isPremium && <Zap className="h-4 w-4 text-blue-500" />}
                  </div>
                  <p className="text-sm text-muted-foreground">{userStats.email}</p>
                </div>

                <div className="flex justify-center gap-2">
                  <Badge variant="outline" className="border-border/40">Level {userStats.level}</Badge>
                  {userStats.isPremium && <Badge className="bg-foreground text-background">Premium</Badge>}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">XP Progress</span>
                    <span>{userStats.xp}/{userStats.nextLevelXp}</span>
                  </div>
                  <Progress value={(userStats.xp / userStats.nextLevelXp) * 100} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{userStats.totalLessons}</div>
                    <div className="text-sm text-muted-foreground">Lessons</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{userStats.hoursLearned}h</div>
                    <div className="text-sm text-muted-foreground">Learned</div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 text-muted-foreground pt-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">Joined {userStats.joinDate}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Add Friends */}
          <Button 
            variant="outline" 
            className="w-full border-border/40"
            onClick={() => setShowAddPeople(!showAddPeople)}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add Friends
          </Button>

          {showAddPeople && (
            <Card className="border-border/40">
              <CardContent className="pt-4 space-y-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search users..." 
                      value={searchQuery} 
                      onChange={(e) => setSearchQuery(e.target.value)} 
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      className="pl-10 bg-muted/50 border-border/50" 
                    />
                  </div>
                  <Button onClick={handleSearch} disabled={searching} size="sm">
                    {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
                  </Button>
                </div>
                
                {searchResults.length > 0 && (
                  <div className="space-y-2">
                    {searchResults.map((result) => (
                      <div key={result.id} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={result.avatar_url} />
                            <AvatarFallback className="bg-muted text-xs">
                              {(result.display_name || result.username)?.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{result.display_name || result.username}</span>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => sendFriendRequest(result.id)}>
                          Add
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {pendingRequests.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Pending Requests</p>
                    {pendingRequests.map((req) => (
                      <div key={req.friendshipId} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={req.avatar_url} />
                            <AvatarFallback className="bg-muted text-xs">
                              {(req.display_name || req.username)?.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{req.display_name || req.username}</span>
                        </div>
                        <Button size="sm" onClick={() => acceptFriendRequest(req.friendshipId)}>Accept</Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Friends List */}
          <Card className="border-border/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" />
                Friends ({friends.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {friends.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No friends yet</p>
              ) : (
                <div className="space-y-2">
                  {friends.slice(0, 5).map((friend) => (
                    <div key={friend.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={friend.avatar_url} />
                        <AvatarFallback className="bg-muted text-xs">
                          {(friend.display_name || friend.username)?.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{friend.display_name || friend.username}</p>
                        <p className="text-xs text-muted-foreground">Level {friend.level}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Achievements */}
        <div className="lg:col-span-2">
          <Card className="border-border/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Achievements ({achievements.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {achievements.length === 0 ? (
                <div className="text-center py-8">
                  <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No achievements yet</p>
                  <p className="text-sm text-muted-foreground">Complete lessons to earn achievements</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {achievements.map((achievement) => (
                    <div 
                      key={achievement.id} 
                      className="p-4 rounded-xl bg-muted/30 border border-border/40"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{achievement.icon}</div>
                        <div className="flex-1">
                          <h4 className="font-medium">{achievement.name}</h4>
                          <p className="text-sm text-muted-foreground">{achievement.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Profile;
