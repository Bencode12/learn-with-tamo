import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Trophy, Users, Target, Zap, Crown, Timer, Brain, Check, ArrowLeft, Briefcase, Presentation, Heart, Star, Flame, Award, TrendingUp, ChevronLeft, ChevronRight, Gamepad2, Medal, Clock, BookMarked } from "lucide-react";
import { Link } from "react-router-dom";
import LanguageSelector from "@/components/LanguageSelector";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const RANKS = [
  { name: "Bronze III", minXp: 0, color: "from-amber-700 to-amber-900" },
  { name: "Bronze II", minXp: 500, color: "from-amber-600 to-amber-800" },
  { name: "Bronze I", minXp: 1000, color: "from-amber-500 to-amber-700" },
  { name: "Silver III", minXp: 1500, color: "from-gray-400 to-gray-600" },
  { name: "Silver II", minXp: 2000, color: "from-gray-300 to-gray-500" },
  { name: "Silver I", minXp: 2500, color: "from-gray-200 to-gray-400" },
  { name: "Gold III", minXp: 3000, color: "from-yellow-400 to-yellow-600" },
  { name: "Gold II", minXp: 4000, color: "from-yellow-300 to-yellow-500" },
  { name: "Gold I", minXp: 5000, color: "from-yellow-200 to-yellow-400" },
  { name: "Platinum III", minXp: 6500, color: "from-cyan-400 to-cyan-600" },
  { name: "Platinum II", minXp: 8000, color: "from-cyan-300 to-cyan-500" },
  { name: "Platinum I", minXp: 10000, color: "from-cyan-200 to-cyan-400" },
  { name: "Diamond", minXp: 15000, color: "from-blue-400 to-purple-500" },
  { name: "Master", minXp: 25000, color: "from-purple-500 to-pink-500" },
  { name: "Grandmaster", minXp: 50000, color: "from-red-500 to-orange-500" },
];

const GameModes = () => {
  const { user } = useAuth();
  const statsScrollRef = useRef<HTMLDivElement>(null);
  const [userXp, setUserXp] = useState(0);
  const [stats, setStats] = useState({
    rankedWins: 0, teamMatches: 0, playTime: 0, xpEarned: 0, dayStreak: 0,
    achievements: 0, accuracy: 0, lessonsDone: 0, quizzesPassed: 0, perfectScores: 0,
    gamesPlayed: 0, top10Finishes: 0, avgSession: 0, bookmarks: 0
  });

  useEffect(() => {
    if (user) fetchUserStats();
    
    // Auto-scroll stats
    const interval = setInterval(() => {
      if (statsScrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = statsScrollRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          statsScrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          statsScrollRef.current.scrollBy({ left: 150, behavior: 'smooth' });
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [user]);

  const fetchUserStats = async () => {
    if (!user) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('experience, total_learning_time')
      .eq('id', user.id)
      .single();

    const { data: lessons } = await supabase
      .from('lesson_progress')
      .select('*')
      .eq('user_id', user.id);

    const { data: achievements } = await supabase
      .from('user_achievements')
      .select('id')
      .eq('user_id', user.id);

    if (profile) {
      setUserXp(profile.experience || 0);
      const completedLessons = lessons?.filter(l => l.completed) || [];
      const avgScore = completedLessons.length > 0 
        ? completedLessons.reduce((sum, l) => sum + (l.score || 0), 0) / completedLessons.length 
        : 0;

      setStats({
        rankedWins: Math.floor((profile.experience || 0) / 100),
        teamMatches: Math.floor((profile.experience || 0) / 150),
        playTime: Math.round((profile.total_learning_time || 0) / 60),
        xpEarned: profile.experience || 0,
        dayStreak: 0,
        achievements: achievements?.length || 0,
        accuracy: Math.round(avgScore),
        lessonsDone: completedLessons.length,
        quizzesPassed: completedLessons.filter(l => (l.score || 0) >= 70).length,
        perfectScores: completedLessons.filter(l => l.score === 100).length,
        gamesPlayed: lessons?.length || 0,
        top10Finishes: Math.floor((profile.experience || 0) / 500),
        avgSession: lessons?.length ? Math.round(lessons.reduce((sum, l) => sum + l.time_spent, 0) / lessons.length) : 0,
        bookmarks: 0
      });
    }
  };

  const getCurrentRank = () => {
    for (let i = RANKS.length - 1; i >= 0; i--) {
      if (userXp >= RANKS[i].minXp) return { current: RANKS[i], next: RANKS[i + 1] || null, index: i };
    }
    return { current: RANKS[0], next: RANKS[1], index: 0 };
  };

  const rankInfo = getCurrentRank();
  const progressToNext = rankInfo.next 
    ? ((userXp - rankInfo.current.minXp) / (rankInfo.next.minXp - rankInfo.current.minXp)) * 100 
    : 100;

  const learningModules = [
    { id: "single", name: "Single Player", description: "Learn at your own pace with AI guidance", icon: Target, color: "bg-green-500", players: "Solo", difficulty: "Variable", rewards: "20-40 XP", features: ["Personalized learning", "Progress tracking", "Adaptive difficulty"], route: "/single-mode" },
    { id: "duos", name: "Duos", description: "Learn together with a partner", icon: Users, color: "bg-blue-500", players: "2", difficulty: "Medium", rewards: "30-60 XP", features: ["Friend pairing", "Shared progress", "Cooperative challenges"], route: "/duos-mode" },
    { id: "competitive", name: "Team Competitive", description: "Competitive team battles on selected topics", icon: Zap, color: "bg-red-500", players: "Teams", difficulty: "Expert", rewards: "75-150 XP", features: ["Team coordination", "Voice chat support", "Tournament mode"], route: "/team-mode" },
    { id: "team", name: "Team Mode", description: "Collaborative learning in groups", icon: Users, color: "bg-purple-500", players: "2-6", difficulty: "Medium", rewards: "40-80 XP", features: ["Room codes", "Team selection", "Collaborative workspace"], route: "/team-mode" },
    { id: "ranked", name: "Ranked Mode", description: "Climb the ranks in competitive learning", icon: Trophy, color: "bg-yellow-500", players: "1-5", difficulty: "High", rewards: "50-100 XP", features: ["Skill-based matchmaking", "Seasonal rankings", "Exclusive rewards"], route: "/ranked-mode" }
  ];

  const specialModules = [
    { id: "job-interview", name: "Job Interview Prep", description: "AI-powered interview preparation", icon: Briefcase, color: "bg-indigo-500", features: ["Custom job analysis", "Mock interviews", "AI feedback", "Company research"], route: "/job-interview-prep" },
    { id: "presentation", name: "Presentation Prep", description: "Perfect your public speaking", icon: Presentation, color: "bg-pink-500", features: ["Speech practice", "Webcam analysis", "AI feedback", "Posture tips"], route: "/presentation-prep" },
    { id: "hobby", name: "Hobby Learning", description: "Explore new interests", icon: Heart, color: "bg-rose-500", features: ["Art & Music", "Photography", "Cooking", "DIY Projects"], route: "/hobby-learning" }
  ];

  const statItems = [
    { icon: Trophy, label: "Ranked Wins", value: stats.rankedWins.toString(), color: "text-yellow-500" },
    { icon: Users, label: "Team Matches", value: stats.teamMatches.toString(), color: "text-blue-500" },
    { icon: Timer, label: "Play Time", value: `${stats.playTime}h`, color: "text-green-500" },
    { icon: Star, label: "XP Earned", value: stats.xpEarned.toLocaleString(), color: "text-purple-500" },
    { icon: Flame, label: "Day Streak", value: stats.dayStreak.toString(), color: "text-orange-500" },
    { icon: Award, label: "Achievements", value: stats.achievements.toString(), color: "text-pink-500" },
    { icon: TrendingUp, label: "Accuracy", value: `${stats.accuracy}%`, color: "text-cyan-500" },
    { icon: Brain, label: "Lessons Done", value: stats.lessonsDone.toString(), color: "text-indigo-500" },
    { icon: Target, label: "Quizzes Passed", value: stats.quizzesPassed.toString(), color: "text-emerald-500" },
    { icon: Zap, label: "Perfect Scores", value: stats.perfectScores.toString(), color: "text-amber-500" },
    { icon: Gamepad2, label: "Games Played", value: stats.gamesPlayed.toString(), color: "text-violet-500" },
    { icon: Medal, label: "Top 10", value: stats.top10Finishes.toString(), color: "text-red-500" },
    { icon: Clock, label: "Avg Session", value: `${stats.avgSession}m`, color: "text-teal-500" },
  ];

  const scrollStats = (direction: "left" | "right") => {
    if (statsScrollRef.current) {
      statsScrollRef.current.scrollBy({ left: direction === "left" ? -200 : 200, behavior: "smooth" });
    }
  };

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
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Learning Modules</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">Challenge yourself and others in various learning formats</p>
        </div>

        <Card className={`mb-8 bg-gradient-to-r ${rankInfo.current.color} text-white`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Crown className="h-8 w-8" />
                <div>
                  <CardTitle className="text-2xl">Current Rank: {rankInfo.current.name}</CardTitle>
                  <CardDescription className="text-white/80">
                    {userXp.toLocaleString()} XP • {rankInfo.next ? `Next: ${rankInfo.next.name}` : 'Max Rank!'}
                  </CardDescription>
                </div>
              </div>
              <Badge variant="secondary" className="bg-white/20 text-white">Season 3</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress to {rankInfo.next?.name || 'Max'}</span>
                <span>{Math.round(progressToNext)}%</span>
              </div>
              <Progress value={progressToNext} className="h-3 bg-white/20" />
            </div>
          </CardContent>
        </Card>

        <div className="mb-8 relative">
          <h3 className="text-lg font-semibold mb-4">Your Statistics</h3>
          <div className="relative">
            <Button variant="outline" size="icon" className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-card shadow-lg" onClick={() => scrollStats("left")}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div ref={statsScrollRef} className="flex gap-4 overflow-x-auto scrollbar-hide px-10 pb-2" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
              {statItems.map((stat, idx) => (
                <Card key={idx} className="flex-shrink-0 w-32">
                  <CardContent className="p-4 text-center">
                    <stat.icon className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
                    <div className="text-xl font-bold">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Button variant="outline" size="icon" className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-card shadow-lg" onClick={() => scrollStats("right")}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mb-12">
          <h3 className="text-lg font-semibold mb-4">Learning Modules</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {learningModules.map((mode) => (
              <Card key={mode.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className={`w-14 h-14 ${mode.color} rounded-full flex items-center justify-center`}>
                      <mode.icon className="h-7 w-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{mode.name}</CardTitle>
                      <CardDescription className="mt-1 text-sm">{mode.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-xs">
                    <span><strong>Players:</strong> {mode.players}</span>
                    <span><strong>Difficulty:</strong> {mode.difficulty}</span>
                    <span><strong>Rewards:</strong> {mode.rewards}</span>
                  </div>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {mode.features.map((f, i) => (
                      <li key={i} className="flex items-center space-x-2">
                        <Check className="h-3 w-3 text-green-500" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to={mode.route}>
                    <Button className="w-full" size="sm">
                      <Target className="h-4 w-4 mr-2" />Start
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Specialized Learning</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {specialModules.map((module) => (
              <Card key={module.id} className="hover:shadow-lg transition-shadow border-2 border-dashed hover:border-primary">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 ${module.color} rounded-full flex items-center justify-center`}>
                      <module.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{module.name}</CardTitle>
                      <CardDescription className="text-sm">{module.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-1">
                    {module.features.map((f, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">{f}</Badge>
                    ))}
                  </div>
                  <Link to={module.route}>
                    <Button className="w-full" variant="outline" size="sm">Explore</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default GameModes;
