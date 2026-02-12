import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Trophy, Medal, Award, TrendingUp, Users, Crown, Star, Zap, Loader2 } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
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

    const { data: profiles, count } = await supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url, experience, level, is_premium, created_at', { count: 'exact' })
      .order('experience', { ascending: false })
      .limit(50);

    const { data: roles } = await supabase
      .from('user_roles')
      .select('user_id, role');

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
    return <span className="font-medium text-muted-foreground">#{rank}</span>;
  };

  const getUserBadge = (isPremium: boolean, isStaff: boolean, isAdmin: boolean) => {
    if (isAdmin) return <Crown className="h-3.5 w-3.5 text-red-500" />;
    if (isStaff) return <Star className="h-3.5 w-3.5 text-yellow-500" />;
    if (isPremium) return <Zap className="h-3.5 w-3.5 text-blue-500" />;
    return null;
  };

  const ProfileHoverCard = ({ userData, children }: { userData: LeaderboardUser, children: React.ReactNode }) => (
    <HoverCard>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent className="w-72 border-border/40">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarImage src={userData.avatar_url} />
              <AvatarFallback className="bg-muted">{userData.avatar}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{userData.name}</h3>
                {getUserBadge(userData.isPremium, userData.isStaff, userData.isAdmin)}
              </div>
              <p className="text-sm text-muted-foreground">Level {userData.level}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">XP Progress</span>
              <span>{userData.score}/{(userData.level + 1) * 1000}</span>
            </div>
            <Progress value={(userData.score / ((userData.level + 1) * 1000)) * 100} className="h-1.5" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <div className="font-bold">{userData.totalLessons}</div>
              <div className="text-xs text-muted-foreground">Lessons</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <div className="font-bold">{userData.score}</div>
              <div className="text-xs text-muted-foreground">XP</div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Joined {userData.joinDate}
          </p>
        </div>
      </HoverCardContent>
    </HoverCard>
  );

  return (
    <AppLayout title="Leaderboard" subtitle="See how you compare with other learners">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="bg-muted/30 border-border/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Learners</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLearners.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="bg-muted/30 border-border/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Your Rank</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">#{userRank || '-'}</div>
          </CardContent>
        </Card>

        <Card className="bg-muted/30 border-border/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Your XP</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userScore.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Period Filter */}
      <div className="mb-6">
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-40 border-border/40">
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

      {/* Leaderboard Table */}
      <Card className="border-border/40">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border/40 hover:bg-transparent">
                  <TableHead className="w-16 text-center">Rank</TableHead>
                  <TableHead>Learner</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead className="text-center">Lessons</TableHead>
                  <TableHead className="text-right">XP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboardData.map((userData) => (
                  <TableRow 
                    key={userData.id} 
                    className={`border-border/40 ${
                      userData.rank <= 3 ? "bg-muted/30" : 
                      userData.id === user?.id ? "bg-foreground/5" : ""
                    }`}
                  >
                    <TableCell className="text-center">
                      {getRankIcon(userData.rank)}
                    </TableCell>
                    <TableCell>
                      <ProfileHoverCard userData={userData}>
                        <Link to={`/u/${userData.name}`} className="flex items-center gap-3 cursor-pointer hover:opacity-80">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={userData.avatar_url} />
                            <AvatarFallback className="bg-muted text-xs">{userData.avatar}</AvatarFallback>
                          </Avatar>
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium">{userData.name}</span>
                            {getUserBadge(userData.isPremium, userData.isStaff, userData.isAdmin)}
                          </div>
                        </Link>
                      </ProfileHoverCard>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-border/40 font-normal">
                        {userData.level}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">{userData.totalLessons}</TableCell>
                    <TableCell className="text-right font-medium">{userData.score.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default Leaderboard;
