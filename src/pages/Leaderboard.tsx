import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Trophy, Medal, Award, TrendingUp, Users, Crown, Star, Zap, ArrowLeft, BookOpen, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import LanguageSelector from "@/components/LanguageSelector";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface LeaderboardUser {
  id: string;
  rank: number;
  name: string;
  score: number;
  streak: number;
  level: number;
  avatar: string;
  avatar_url?: string;
  isPremium: boolean;
  isStaff: boolean;
  isAdmin: boolean;
  totalLessons: number;
  joinDate: string;
}

const Leaderboard = () => {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [loading, setLoading] = useState(true);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
  const [userRank, setUserRank] = useState(0);
  const [userScore, setUserScore] = useState(0);
  const [totalLearners, setTotalLearners] = useState(0);

  useEffect(() => {
    fetchLeaderboard();
  }, [selectedPeriod]);

  const fetchLeaderboard = async () => {
    setLoading(true);

    // Fetch all profiles with their XP
    const { data: profiles, count } = await supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url, experience, level, is_premium, created_at', { count: 'exact' })
      .order('experience', { ascending: false })
      .limit(50);

    // Fetch roles
    const { data: roles } = await supabase
      .from('user_roles')
      .select('user_id, role');

    // Fetch lesson counts
    const { data: lessons } = await supabase
      .from('lesson_progress')
      .select('user_id, completed');

    if (profiles) {
      const leaderboard: LeaderboardUser[] = profiles.map((p, index) => {
        const userRoles = roles?.filter(r => r.user_id === p.id).map(r => r.role) || [];
        const userLessons = lessons?.filter(l => l.user_id === p.id && l.completed).length || 0;
        
        return {
          id: p.id,
          rank: index + 1,
          name: p.display_name || p.username,
          score: p.experience,
          streak: 0,
          level: p.level,
          avatar: (p.display_name || p.username)?.slice(0, 2).toUpperCase() || 'U',
          avatar_url: p.avatar_url,
          isPremium: p.is_premium || false,
          isStaff: userRoles.includes('staff'),
          isAdmin: userRoles.includes('admin'),
          totalLessons: userLessons,
          joinDate: new Date(p.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        };
      });

      setLeaderboardData(leaderboard);
      setTotalLearners(count || 0);

      // Find current user's rank
      if (user) {
        const userEntry = leaderboard.find(l => l.id === user.id);
        if (userEntry) {
          setUserRank(userEntry.rank);
          setUserScore(userEntry.score);
        }
      }
    }

    setLoading(false);
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Award className="h-5 w-5 text-amber-600" />;
    return <span className="font-bold text-muted-foreground">#{rank}</span>;
  };

  const getUserBadge = (isPremium: boolean, isStaff: boolean, isAdmin: boolean) => {
    if (isAdmin) return <Crown className="h-4 w-4 text-red-500" />;
    if (isStaff) return <Star className="h-4 w-4 text-yellow-500" />;
    if (isPremium) return <Zap className="h-4 w-4 text-blue-500" />;
    return null;
  };

  const ProfileHoverCard = ({ userData, children }: { userData: LeaderboardUser, children: React.ReactNode }) => (
    <HoverCard>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={userData.avatar_url} />
              <AvatarFallback className="text-lg">{userData.avatar}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-lg">{userData.name}</h3>
                {getUserBadge(userData.isPremium, userData.isStaff, userData.isAdmin)}
              </div>
              <div className="flex gap-1 mt-1">
                {userData.isAdmin && <Badge className="bg-red-600 text-xs">Admin</Badge>}
                {userData.isStaff && !userData.isAdmin && <Badge className="bg-yellow-600 text-xs">Staff</Badge>}
                {userData.isPremium && <Badge className="bg-purple-600 text-xs">Premium</Badge>}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Level {userData.level}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>XP Progress</span>
              <span>{userData.score}/{(userData.level + 1) * 1000}</span>
            </div>
            <Progress value={(userData.score / ((userData.level + 1) * 1000)) * 100} className="h-2" />
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-muted rounded-lg p-2">
              <div className="font-bold text-blue-600">{userData.totalLessons}</div>
              <div className="text-xs text-muted-foreground">Lessons</div>
            </div>
            <div className="bg-muted rounded-lg p-2">
              <div className="font-bold text-purple-600">{userData.score}</div>
              <div className="text-xs text-muted-foreground">XP</div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground text-center">
            Joined {userData.joinDate}
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );

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
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Trophy className="h-8 w-8 text-yellow-500" />
            <h2 className="text-3xl font-bold">Leaderboard</h2>
          </div>
          <p className="text-muted-foreground">See how you stack up against other learners</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Learners</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalLearners.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Active learners</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Your Rank</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">#{userRank || '-'}</div>
              <p className="text-xs text-muted-foreground">Keep learning to climb!</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Your Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userScore.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Total XP earned</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="h-5 w-5" />
              <span>Top Performers</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Rank</TableHead>
                    <TableHead>Learner</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead className="text-center">Lessons</TableHead>
                    <TableHead className="text-center">XP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaderboardData.map((userData) => (
                    <TableRow key={userData.id} className={userData.rank <= 3 ? "bg-yellow-50 dark:bg-yellow-900/10" : userData.id === user?.id ? "bg-blue-50 dark:bg-blue-900/10" : ""}>
                      <TableCell className="flex items-center justify-center">
                        {getRankIcon(userData.rank)}
                      </TableCell>
                      <TableCell>
                        <ProfileHoverCard userData={userData}>
                          <div className="flex items-center space-x-3 cursor-pointer">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={userData.avatar_url} />
                              <AvatarFallback>{userData.avatar}</AvatarFallback>
                            </Avatar>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{userData.name}</span>
                              {getUserBadge(userData.isPremium, userData.isStaff, userData.isAdmin)}
                            </div>
                          </div>
                        </ProfileHoverCard>
                      </TableCell>
                      <TableCell>
                        <Badge variant={userData.level >= 15 ? "default" : userData.level >= 10 ? "secondary" : "outline"}>
                          Level {userData.level}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">{userData.totalLessons}</TableCell>
                      <TableCell className="text-center font-medium">{userData.score.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Leaderboard;
