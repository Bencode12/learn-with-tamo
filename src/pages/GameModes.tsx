
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Trophy, Users, Target, Zap, Crown, Coins, Timer, Brain } from "lucide-react";
import { Link } from "react-router-dom";
import LanguageSelector from "@/components/LanguageSelector";

const GameModes = () => {
  const [selectedMode, setSelectedMode] = useState("ranked");

  const gameModes = [
    {
      id: "ranked",
      name: "Ranked Mode",
      description: "Climb the ranks in competitive learning",
      icon: Trophy,
      color: "bg-yellow-500",
      players: "1v1",
      difficulty: "High",
      rewards: "50-100 coins",
      features: ["Skill-based matchmaking", "Seasonal rankings", "Exclusive rewards", "Rank decay system"]
    },
    {
      id: "competitive",
      name: "Team Competitive",
      description: "5v5 team battles on selected topics",
      icon: Users,
      color: "bg-red-500",
      players: "5v5",
      difficulty: "Expert",
      rewards: "75-150 coins",
      features: ["Team coordination", "Voice chat support", "Tournament mode", "Team statistics"]
    },
    {
      id: "duos",
      name: "Duos",
      description: "Partner up for collaborative learning",
      icon: Users,
      color: "bg-blue-500",
      players: "2v2",
      difficulty: "Medium",
      rewards: "30-60 coins",
      features: ["Friend pairing", "Shared progress", "Cooperative challenges", "Duo achievements"]
    },
    {
      id: "squad",
      name: "Squad",
      description: "Team up with 3 friends for group challenges",
      icon: Users,
      color: "bg-green-500",
      players: "4v4",
      difficulty: "Medium",
      rewards: "40-80 coins",
      features: ["Group learning", "Squad leaderboards", "Team objectives", "Social features"]
    }
  ];

  const currentRank = {
    name: "Gold III",
    progress: 65,
    points: 1850,
    nextRank: "Gold II"
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
                <h1 className="text-xl font-bold text-gray-900">SūdžiusAI</h1>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-yellow-100 px-3 py-1 rounded-full">
                <Coins className="h-4 w-4 text-yellow-600" />
                <span className="font-medium text-yellow-800">2,450</span>
              </div>
              <LanguageSelector />
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Game Modes Header */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Game Modes
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Challenge yourself and others in various competitive learning formats
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

        {/* Game Modes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {gameModes.map((mode) => (
            <Card key={mode.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className={`w-16 h-16 ${mode.color} rounded-full flex items-center justify-center`}>
                    <mode.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl">{mode.name}</CardTitle>
                    <CardDescription className="mt-1">{mode.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
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
                  <h4 className="font-medium text-sm">Features:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {mode.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <Check className="h-3 w-3 text-green-500" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button className="w-full" size="lg">
                  <Target className="h-4 w-4 mr-2" />
                  Play {mode.name}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
          <Card>
            <CardContent className="p-4 text-center">
              <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">127</div>
              <div className="text-sm text-gray-600">Ranked Wins</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">89</div>
              <div className="text-sm text-gray-600">Team Matches</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Timer className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">45h</div>
              <div className="text-sm text-gray-600">Play Time</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Coins className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">12,450</div>
              <div className="text-sm text-gray-600">Coins Earned</div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default GameModes;
