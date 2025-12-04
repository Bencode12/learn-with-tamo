import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Trophy, Users, Target, Zap, Crown, Timer, Brain, Check, ArrowLeft, Briefcase, Presentation, Heart, Star, Flame, Award, TrendingUp, ChevronLeft, ChevronRight, Gamepad2, Medal, Clock, BookMarked } from "lucide-react";
import { Link } from "react-router-dom";
import LanguageSelector from "@/components/LanguageSelector";

const GameModes = () => {
  const statsScrollRef = useRef<HTMLDivElement>(null);

  const learningModules = [
    {
      id: "single",
      name: "Single Player",
      description: "Learn at your own pace with AI guidance",
      icon: Target,
      color: "bg-green-500",
      players: "Solo",
      difficulty: "Variable",
      rewards: "20-40 XP",
      features: ["Personalized learning", "Progress tracking", "Adaptive difficulty", "Flexible schedule"],
      route: "/single-mode"
    },
    {
      id: "duos",
      name: "Duos",
      description: "Learn together with a partner",
      icon: Users,
      color: "bg-blue-500",
      players: "2",
      difficulty: "Medium",
      rewards: "30-60 XP",
      features: ["Friend pairing", "Shared progress", "Cooperative challenges", "Duo achievements"],
      route: "/duos-mode"
    },
    {
      id: "competitive",
      name: "Team Competitive",
      description: "Competitive team battles on selected topics",
      icon: Zap,
      color: "bg-red-500",
      players: "Teams",
      difficulty: "Expert",
      rewards: "75-150 XP",
      features: ["Team coordination", "Voice chat support", "Tournament mode", "Team statistics"],
      route: "/team-mode"
    },
    {
      id: "team",
      name: "Team Mode",
      description: "Collaborative learning in groups",
      icon: Users,
      color: "bg-purple-500",
      players: "2-6",
      difficulty: "Medium",
      rewards: "40-80 XP",
      features: ["Room codes", "Team selection", "Collaborative workspace", "Team achievements"],
      route: "/team-mode"
    },
    {
      id: "ranked",
      name: "Ranked Mode",
      description: "Climb the ranks in competitive learning",
      icon: Trophy,
      color: "bg-yellow-500",
      players: "1-5 players",
      difficulty: "High",
      rewards: "50-100 XP",
      features: ["Skill-based matchmaking", "Seasonal rankings", "Exclusive rewards", "Multiple team sizes"],
      route: "/ranked-mode"
    }
  ];

  const specialModules = [
    {
      id: "job-interview",
      name: "Job Interview Prep",
      description: "AI-powered interview preparation for your dream job",
      icon: Briefcase,
      color: "bg-indigo-500",
      features: ["Custom job analysis", "Mock interviews", "AI feedback", "Company research"],
      route: "/job-interview-prep"
    },
    {
      id: "presentation",
      name: "Presentation Prep",
      description: "Perfect your public speaking and slide design",
      icon: Presentation,
      color: "bg-pink-500",
      features: ["Speech practice", "Slide templates", "Timing drills", "Audience simulation"],
      route: "/single-mode"
    },
    {
      id: "hobby",
      name: "Hobby Learning",
      description: "Explore new interests and hobbies",
      icon: Heart,
      color: "bg-rose-500",
      features: ["Art & Music", "Photography", "Cooking", "DIY Projects"],
      route: "/single-mode"
    }
  ];

  const currentRank = {
    name: "Gold III",
    progress: 65,
    points: 1850,
    nextRank: "Gold II"
  };

  const stats = [
    { icon: Trophy, label: "Ranked Wins", value: "127", color: "text-yellow-500" },
    { icon: Users, label: "Team Matches", value: "89", color: "text-blue-500" },
    { icon: Timer, label: "Play Time", value: "45h", color: "text-green-500" },
    { icon: Star, label: "XP Earned", value: "12,450", color: "text-purple-500" },
    { icon: Flame, label: "Day Streak", value: "23", color: "text-orange-500" },
    { icon: Award, label: "Achievements", value: "42", color: "text-pink-500" },
    { icon: TrendingUp, label: "Accuracy", value: "87%", color: "text-cyan-500" },
    { icon: Brain, label: "Lessons Done", value: "156", color: "text-indigo-500" },
    { icon: Target, label: "Quizzes Passed", value: "98", color: "text-emerald-500" },
    { icon: Zap, label: "Perfect Scores", value: "31", color: "text-amber-500" },
    { icon: Gamepad2, label: "Games Played", value: "234", color: "text-violet-500" },
    { icon: Medal, label: "Top 10 Finishes", value: "15", color: "text-red-500" },
    { icon: Clock, label: "Avg Session", value: "28m", color: "text-teal-500" },
    { icon: BookMarked, label: "Bookmarks", value: "45", color: "text-lime-500" },
  ];

  const scrollStats = (direction: "left" | "right") => {
    if (statsScrollRef.current) {
      const scrollAmount = 200;
      statsScrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
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
                <h1 className="text-xl font-bold text-gray-900">SūdžiusAI</h1>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSelector />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Learning Modules
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Challenge yourself and others in various learning formats
          </p>
        </div>

        {/* Current Rank Card */}
        <Card className="mb-8 bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Crown className="h-8 w-8" />
                <div>
                  <CardTitle className="text-2xl">Current Rank: {currentRank.name}</CardTitle>
                  <CardDescription className="text-yellow-100">
                    {currentRank.points} points • Next: {currentRank.nextRank}
                  </CardDescription>
                </div>
              </div>
              <Badge variant="secondary" className="bg-white/20 text-white">
                Season 3
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress to {currentRank.nextRank}</span>
                <span>{currentRank.progress}%</span>
              </div>
              <Progress value={currentRank.progress} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* Scrollable Stats */}
        <div className="mb-8 relative">
          <h3 className="text-lg font-semibold mb-4">Your Statistics</h3>
          <div className="relative">
            <Button
              variant="outline"
              size="icon"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg"
              onClick={() => scrollStats("left")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div
              ref={statsScrollRef}
              className="flex gap-4 overflow-x-auto scrollbar-hide px-10 pb-2"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {stats.map((stat, idx) => (
                <Card key={idx} className="flex-shrink-0 w-32">
                  <CardContent className="p-4 text-center">
                    <stat.icon className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
                    <div className="text-xl font-bold">{stat.value}</div>
                    <div className="text-xs text-gray-600">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg"
              onClick={() => scrollStats("right")}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Learning Modules Grid */}
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
                    <div>
                      <span className="font-medium">Players:</span> {mode.players}
                    </div>
                    <div>
                      <span className="font-medium">Difficulty:</span> {mode.difficulty}
                    </div>
                    <div>
                      <span className="font-medium">Rewards:</span> {mode.rewards}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-xs">Features:</h4>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {mode.features.slice(0, 3).map((feature, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <Check className="h-3 w-3 text-green-500" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link to={mode.route} className="w-full">
                    <Button className="w-full" size="sm">
                      <Target className="h-4 w-4 mr-2" />
                      Start
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Special Learning Modules */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Specialized Learning</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {specialModules.map((module) => (
              <Card key={module.id} className="hover:shadow-lg transition-shadow border-2 border-dashed border-gray-200 hover:border-primary">
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
                    {module.features.map((feature, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                  <Link to={module.route} className="w-full">
                    <Button className="w-full" variant="outline" size="sm">
                      Explore
                    </Button>
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
