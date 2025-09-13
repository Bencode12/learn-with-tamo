
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BookOpen, Users, UserPlus, Crown, Target, Timer, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import LanguageSelector from "@/components/LanguageSelector";

const TeamMode = () => {
  const [currentTeam] = useState([
    { id: 1, name: "You", level: 15, role: "Leader", status: "online" },
    { id: 2, name: "Sarah M.", level: 14, role: "Member", status: "online" },
    { id: 3, name: "Mike R.", level: 16, role: "Member", status: "offline" },
    { id: 4, name: "Empty Slot", level: 0, role: "Empty", status: "empty" }
  ]);

  const teamModes = [
    {
      id: "duos",
      name: "Duos (2v2)",
      description: "Team up with a friend",
      players: "2v2",
      waitTime: "~1 min"
    },
    {
      id: "squad",
      name: "Squad (4v4)",
      description: "Full team coordination",
      players: "4v4",
      waitTime: "~3 min"
    }
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
                <h1 className="text-xl font-bold text-gray-900">SūdžiusAI</h1>
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
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Team Learning</h2>
              <p className="text-gray-600">Collaborate with friends to master subjects together</p>
            </div>
            <Badge className="bg-blue-500 text-white">
              <Users className="h-4 w-4 mr-1" />
              Team Mode
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Team Management */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Your Team</span>
                  </CardTitle>
                  <Button variant="outline" size="sm">
                    <UserPlus className="h-4 w-4 mr-1" />
                    Invite
                  </Button>
                </div>
                <CardDescription>Manage your learning squad</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentTeam.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>
                              {member.status === "empty" ? "?" : member.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          {member.status === "online" && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-medium">{member.name}</p>
                            {member.role === "Leader" && <Crown className="h-4 w-4 text-yellow-500" />}
                          </div>
                          {member.status !== "empty" && (
                            <p className="text-sm text-gray-600">Level {member.level}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={member.status === "online" ? "default" : member.status === "empty" ? "secondary" : "outline"}>
                          {member.status === "empty" ? "Empty" : member.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Team Chat */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageCircle className="h-5 w-5" />
                  <span>Team Chat</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                  <div className="text-sm">
                    <span className="font-medium text-blue-600">Sarah M.:</span>
                    <span className="ml-2">Ready for some math challenges!</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium text-green-600">You:</span>
                    <span className="ml-2">Let's do this! 💪</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <input 
                    type="text" 
                    placeholder="Type a message..." 
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <Button size="sm">Send</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Game Modes */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Select Team Mode</CardTitle>
                <CardDescription>Choose your team competition format</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teamModes.map((mode) => (
                    <Card key={mode.id} className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-blue-300">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-lg">{mode.name}</h4>
                            <p className="text-sm text-gray-600">{mode.description}</p>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Users className="h-4 w-4" />
                                <span>{mode.players}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Timer className="h-4 w-4" />
                                <span>{mode.waitTime}</span>
                              </div>
                            </div>
                          </div>
                          <Button>Select</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Team Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Team Statistics</CardTitle>
                <CardDescription>Your team's performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">67%</div>
                    <div className="text-sm text-gray-600">Win Rate</div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">24</div>
                    <div className="text-sm text-gray-600">Games Played</div>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">1,450</div>
                    <div className="text-sm text-gray-600">Team XP</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">12</div>
                    <div className="text-sm text-gray-600">Win Streak</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="space-y-3">
              <Button className="w-full" size="lg" disabled={currentTeam.some(m => m.status === "empty")}>
                <Target className="h-4 w-4 mr-2" />
                Start Team Match
              </Button>
              <Button variant="outline" className="w-full">
                Practice with Team
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TeamMode;
