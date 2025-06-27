
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Trophy, Medal, Award, TrendingUp, Users, Crown } from "lucide-react";
import { Link } from "react-router-dom";
import LanguageSelector from "@/components/LanguageSelector";

const Leaderboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const [selectedSubject, setSelectedSubject] = useState("all");

  const leaderboardData = [
    { rank: 1, name: "Emma Wilson", score: 2850, streak: 15, level: "Expert", avatar: "EW", change: "up" },
    { rank: 2, name: "Liam Chen", score: 2720, streak: 12, level: "Expert", avatar: "LC", change: "up" },
    { rank: 3, name: "Sofia Rodriguez", score: 2680, streak: 8, level: "Advanced", avatar: "SR", change: "down" },
    { rank: 4, name: "Noah Kumar", score: 2540, streak: 10, level: "Advanced", avatar: "NK", change: "up" },
    { rank: 5, name: "Olivia Johnson", score: 2420, streak: 6, level: "Advanced", avatar: "OJ", change: "same" },
    { rank: 6, name: "Alexander Smith", score: 2380, streak: 7, level: "Intermediate", avatar: "AS", change: "up" },
    { rank: 7, name: "Mia Taylor", score: 2290, streak: 4, level: "Intermediate", avatar: "MT", change: "down" },
    { rank: 8, name: "Ethan Brown", score: 2180, streak: 9, level: "Intermediate", avatar: "EB", change: "up" }
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Link to="/dashboard" className="flex items-center space-x-3">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">LearnAI</h1>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSelector />
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

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
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                          {user.avatar}
                        </div>
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        user.level === "Expert" ? "default" :
                        user.level === "Advanced" ? "secondary" : "outline"
                      }>
                        {user.level}
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
