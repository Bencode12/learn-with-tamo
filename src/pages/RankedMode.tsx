
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Trophy, Crown, Zap, Target, Users, Timer, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import LanguageSelector from "@/components/LanguageSelector";

const RankedMode = () => {
  const currentRank = {
    name: "Gold III",
    progress: 65,
    points: 1850,
    nextRank: "Gold II"
  };

  const recentMatches = [
    { opponent: "Sarah M.", result: "Win", pointsGain: "+25", subject: "Mathematics" },
    { opponent: "Mike R.", result: "Loss", pointsGain: "-18", subject: "Science" },
    { opponent: "Emma T.", result: "Win", pointsGain: "+22", subject: "History" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Link to="/game-modes">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Gamemodes
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
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Competitive Learning</h2>
              <p className="text-gray-600">Climb the ranks by competing against players of similar skill</p>
            </div>
            <Badge className="bg-yellow-500 text-white">
              <Trophy className="h-4 w-4 mr-1" />
              Ranked
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Current Rank */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
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

            {/* Find Match */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>Find Ranked Match</span>
                </CardTitle>
                <CardDescription>Choose your team size and get matched with players of similar skill level</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Select Team Size:</h4>
                  <div className="grid grid-cols-1 gap-3">
                    <Button variant="outline" className="h-auto p-4 flex flex-col items-start hover:bg-blue-50">
                      <div className="flex items-center space-x-2 mb-1">
                        <Target className="h-5 w-5 text-blue-500" />
                        <span className="font-semibold">Solo (1v1)</span>
                      </div>
                      <p className="text-xs text-gray-600">Compete one-on-one against another player</p>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 flex flex-col items-start hover:bg-green-50">
                      <div className="flex items-center space-x-2 mb-1">
                        <Users className="h-5 w-5 text-green-500" />
                        <span className="font-semibold">Duo (2v2)</span>
                      </div>
                      <p className="text-xs text-gray-600">Team up with a partner</p>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 flex flex-col items-start hover:bg-purple-50">
                      <div className="flex items-center space-x-2 mb-1">
                        <Users className="h-5 w-5 text-purple-500" />
                        <span className="font-semibold">Squad (4v4)</span>
                      </div>
                      <p className="text-xs text-gray-600">Play with a team of 4</p>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 flex flex-col items-start hover:bg-red-50">
                      <div className="flex items-center space-x-2 mb-1">
                        <Users className="h-5 w-5 text-red-500" />
                        <span className="font-semibold">Full Team (5v5)</span>
                      </div>
                      <p className="text-xs text-gray-600">Compete with a full team of 5</p>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Matches */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Matches</CardTitle>
                <CardDescription>Your last ranked games</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentMatches.map((match, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Badge 
                          variant={match.result === "Win" ? "default" : "destructive"}
                          className={match.result === "Win" ? "bg-green-500" : ""}
                        >
                          {match.result}
                        </Badge>
                        <div>
                          <p className="font-medium">vs {match.opponent}</p>
                          <p className="text-sm text-gray-600">{match.subject}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${match.result === "Win" ? "text-green-600" : "text-red-600"}`}>
                          {match.pointsGain}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Leaderboard */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Players</CardTitle>
                <CardDescription>This season's leaders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { rank: 1, name: "Alex C.", points: 2450, badge: "🥇" },
                    { rank: 2, name: "Jordan M.", points: 2380, badge: "🥈" },
                    { rank: 3, name: "Taylor R.", points: 2310, badge: "🥉" },
                    { rank: 4, name: "Sam K.", points: 2250, badge: "" },
                    { rank: 5, name: "Casey L.", points: 2190, badge: "" }
                  ].map((player) => (
                    <div key={player.rank} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="w-8 text-center">{player.badge || `#${player.rank}`}</span>
                        <span className="font-medium">{player.name}</span>
                      </div>
                      <span className="text-sm text-gray-600">{player.points} pts</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rank Rewards</CardTitle>
                <CardDescription>Season end rewards</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Gold+</span>
                    <span className="text-yellow-600">500 coins</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Platinum+</span>
                    <span className="text-purple-600">1000 coins</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Diamond+</span>
                    <span className="text-blue-600">2000 coins</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RankedMode;
