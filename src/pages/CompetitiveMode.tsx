
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Zap, Users, Crown, Timer, Trophy, Target, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import LanguageSelector from "@/components/LanguageSelector";

const CompetitiveMode = () => {
  const [isQueued, setIsQueued] = useState(false);
  const [queueTime, setQueueTime] = useState(0);

  const currentTournament = {
    name: "Mathematics Masters Cup",
    phase: "Quarter Finals",
    timeLeft: "2h 15m",
    participants: 128,
    prizePool: "5,000 coins"
  };

  const topPlayers = [
    { rank: 1, name: "Lightning", rating: 2850, wins: 89 },
    { rank: 2, name: "Prodigy", rating: 2780, wins: 76 },
    { rank: 3, name: "Scholar", rating: 2720, wins: 82 },
    { rank: 4, name: "Genius", rating: 2680, wins: 71 },
    { rank: 5, name: "Mastermind", rating: 2650, wins: 69 }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Link to="/dashboard" className="flex items-center space-x-3">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">Competitive Mode</h1>
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
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">5v5 Competitive</h2>
              <p className="text-gray-600">Elite team battles with algorithm-selected subjects</p>
            </div>
            <Badge className="bg-red-500 text-white">
              <Zap className="h-4 w-4 mr-1" />
              Competitive
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Warning Banner */}
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="font-medium text-orange-900">High-Stakes Competition</p>
                    <p className="text-sm text-orange-700">Subjects and difficulty are algorithm-selected. Leaving penalties apply.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Queue/Match Section */}
            {!isQueued ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5" />
                    <span>Enter Competitive Queue</span>
                  </CardTitle>
                  <CardDescription>Join a 5v5 team battle with skilled players</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-red-50 p-4 rounded-lg">
                      <Timer className="h-8 w-8 text-red-500 mx-auto mb-2" />
                      <h4 className="font-medium">Avg. Wait</h4>
                      <p className="text-sm text-gray-600">4-8 minutes</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                      <h4 className="font-medium">Team Size</h4>
                      <p className="text-sm text-gray-600">5 vs 5</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <Trophy className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      <h4 className="font-medium">Rewards</h4>
                      <p className="text-sm text-gray-600">100-200 coins</p>
                    </div>
                  </div>
                  <Button 
                    className="w-full bg-red-600 hover:bg-red-700" 
                    size="lg"
                    onClick={() => setIsQueued(true)}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Join Competitive Queue
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Timer className="h-5 w-5 animate-pulse" />
                    <span>Finding Match...</span>
                  </CardTitle>
                  <CardDescription>Matching you with players of similar skill</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-2">Searching</div>
                    <div className="flex justify-center space-x-1 mb-4">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    <Progress value={33} className="h-2 mb-4" />
                    <p className="text-sm text-gray-600">Estimated time: 3-5 minutes</p>
                  </div>
                  <Button variant="outline" className="w-full" onClick={() => setIsQueued(false)}>
                    Cancel Search
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Tournament Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Crown className="h-5 w-5" />
                  <span>Active Tournament</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-lg">{currentTournament.name}</h4>
                      <p className="text-sm text-gray-600">{currentTournament.phase}</p>
                    </div>
                    <Badge variant="secondary">{currentTournament.timeLeft} left</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span>Participants:</span>
                      <span className="font-medium">{currentTournament.participants}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Prize Pool:</span>
                      <span className="font-medium text-yellow-600">{currentTournament.prizePool}</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    View Tournament Bracket
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Top Competitive Players */}
            <Card>
              <CardHeader>
                <CardTitle>Competitive Leaderboard</CardTitle>
                <CardDescription>Top competitive players</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topPlayers.map((player) => (
                    <div key={player.rank} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="w-6 text-center font-medium">#{player.rank}</span>
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">{player.name.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{player.name}</p>
                          <p className="text-xs text-gray-600">{player.wins}W</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {player.rating}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Your Competitive Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Competitive Rating</span>
                    <span className="font-medium">2,150</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Matches Played</span>
                    <span className="font-medium">45</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Win Rate</span>
                    <span className="font-medium text-green-600">62%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Rank</span>
                    <span className="font-medium">#127</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rules */}
            <Card>
              <CardHeader>
                <CardTitle>Competitive Rules</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2 text-gray-600">
                  <li>• 5v5 team format</li>
                  <li>• Algorithm selects subjects</li>
                  <li>• No communication tools</li>
                  <li>• Leaving penalty: -50 rating</li>
                  <li>• Match duration: 15-25 min</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CompetitiveMode;
