
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Trophy, Medal, Award, TrendingUp, Users, Crown, Star, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";

const Leaderboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const [selectedSubject, setSelectedSubject] = useState("all");

  const leaderboardData = [
    { rank: 1, name: "Emma Wilson", score: 2850, streak: 15, level: 18, avatar: "EW", change: "up", rank_title: "Developer", joinDate: "January 2024", totalLessons: 203 },
    { rank: 2, name: "Liam Chen", score: 2720, streak: 12, level: 16, avatar: "LC", change: "up", rank_title: "VIP", joinDate: "February 2024", totalLessons: 187 },
    { rank: 3, name: "Sofia Rodriguez", score: 2680, streak: 8, level: 15, avatar: "SR", change: "down", rank_title: "Premium", joinDate: "March 2024", totalLessons: 156 },
    { rank: 4, name: "Noah Kumar", score: 2540, streak: 10, level: 14, avatar: "NK", change: "up", rank_title: "Premium", joinDate: "April 2024", totalLessons: 142 },
    { rank: 5, name: "Olivia Johnson", score: 2420, streak: 6, level: 13, avatar: "OJ", change: "same", rank_title: "Standard", joinDate: "May 2024", totalLessons: 128 },
    { rank: 6, name: "Alexander Smith", score: 2380, streak: 7, level: 12, avatar: "AS", change: "up", rank_title: "Premium", joinDate: "June 2024", totalLessons: 115 },
    { rank: 7, name: "Mia Taylor", score: 2290, streak: 4, level: 11, avatar: "MT", change: "down", rank_title: "Standard", joinDate: "July 2024", totalLessons: 98 },
    { rank: 8, name: "Ethan Brown", score: 2180, streak: 9, level: 10, avatar: "EB", change: "up", rank_title: "Standard", joinDate: "August 2024", totalLessons: 87 }
  ];

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Award className="h-5 w-5 text-amber-600" />;
    return <span className="font-bold text-gray-600">#{rank}</span>;
  };

  const getChangeIcon = (change: string) => {
    if (change === "up") return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (change === "down") return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
    return <span className="text-gray-400">-</span>;
  };

  const getRankTitleIcon = (rank_title: string) => {
    switch (rank_title) {
      case "Developer": return <Crown className="h-4 w-4 text-purple-500" />;
      case "VIP": return <Star className="h-4 w-4 text-yellow-500" />;
      case "Premium": return <Zap className="h-4 w-4 text-blue-500" />;
      default: return null;
    }
  };

  const getRankColor = (rank_title: string) => {
    switch (rank_title) {
      case "Developer": return "bg-purple-100 text-purple-800 border-purple-200";
      case "VIP": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Premium": return "bg-blue-100 text-blue-800 border-blue-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const ProfileHoverCard = ({ user, children }: { user: any, children: React.ReactNode }) => (
    <HoverCard>
      <HoverCardTrigger asChild>
        {children}
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg">{user.avatar}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-lg">{user.name}</h3>
                {getRankTitleIcon(user.rank_title)}
              </div>
              <Badge className={`text-xs ${getRankColor(user.rank_title)}`}>
                {user.rank_title}
              </Badge>
              <p className="text-sm text-gray-500 mt-1">Level {user.level}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>XP Progress</span>
              <span>{user.score}/{(user.level + 1) * 200}</span>
            </div>
            <Progress value={(user.score / ((user.level + 1) * 200)) * 100} className="h-2" />
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-gray-50 rounded-lg p-2">
              <div className="font-bold text-blue-600">{user.totalLessons}</div>
              <div className="text-xs text-gray-600">Lessons</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-2">
              <div className="font-bold text-orange-600">{user.streak}</div>
              <div className="text-xs text-gray-600">Day Streak</div>
            </div>
          </div>

          <div className="text-xs text-gray-500 text-center">
            Joined {user.joinDate}
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showBackButton={true} hideAuthButtons={true} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Trophy className="h-8 w-8 text-yellow-500" />
            <h2 className="text-3xl font-bold text-gray-900">Leaderboard</h2>
          </div>
          <p className="text-gray-600">See how you stack up against other learners</p>
        </div>

        {/* Filters */}
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

          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Select subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              <SelectItem value="math">Mathematics</SelectItem>
              <SelectItem value="science">Science</SelectItem>
              <SelectItem value="english">English</SelectItem>
              <SelectItem value="history">History</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Learners</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,247</div>
              <p className="text-xs text-muted-foreground">+12% from last week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Your Rank</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">#42</div>
              <p className="text-xs text-muted-foreground">+5 positions this week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Your Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,850</div>
              <p className="text-xs text-muted-foreground">+150 points this week</p>
            </CardContent>
          </Card>
        </div>

        {/* Leaderboard Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="h-5 w-5" />
              <span>Top Performers</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Rank</TableHead>
                  <TableHead>Learner</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead className="text-center">Streak</TableHead>
                  <TableHead className="text-center">Score</TableHead>
                  <TableHead className="text-center">Change</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboardData.map((user) => (
                  <TableRow key={user.rank} className={user.rank <= 3 ? "bg-yellow-50" : ""}>
                    <TableCell className="flex items-center justify-center">
                      {getRankIcon(user.rank)}
                    </TableCell>
                    <TableCell>
                      <ProfileHoverCard user={user}>
                        <div className="flex items-center space-x-3 cursor-pointer">
                          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                            {user.avatar}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{user.name}</span>
                            {getRankTitleIcon(user.rank_title)}
                          </div>
                        </div>
                      </ProfileHoverCard>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        user.level >= 15 ? "default" :
                        user.level >= 10 ? "secondary" : "outline"
                      }>
                        Level {user.level}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <span className="text-orange-500">🔥</span>
                        <span>{user.streak}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      {user.score.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center">
                      {getChangeIcon(user.change)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Leaderboard;
