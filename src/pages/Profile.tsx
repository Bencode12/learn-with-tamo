import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Trophy, Target, Award, Calendar, Clock, TrendingUp, UserPlus, Users, Search, Star, Zap, Crown, ArrowLeft, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import LanguageSelector from "@/components/LanguageSelector";

const Profile = () => {
  const [userStats] = useState({
    name: "Alex Johnson",
    email: "alex.johnson@email.com",
    joinDate: "September 2024",
    totalLessons: 156,
    hoursLearned: 89,
    streak: 12,
    level: 15,
    xp: 2340,
    nextLevelXp: 2500
  });

  const [achievements] = useState([
    { id: 1, name: "First Steps", description: "Complete your first lesson", icon: Trophy, earned: true },
    { id: 2, name: "Week Warrior", description: "Maintain a 7-day streak", icon: Target, earned: true },
    { id: 3, name: "Math Master", description: "Score 90%+ in 5 math lessons", icon: Award, earned: true },
    { id: 4, name: "Study Buddy", description: "Learn for 10 hours total", icon: Clock, earned: true },
    { id: 5, name: "Perfectionist", description: "Get 100% on any test", icon: TrendingUp, earned: false },
    { id: 6, name: "Speed Demon", description: "Complete a lesson in under 10 minutes", icon: Zap, earned: true },
  ]);

  const [showAllAchievements, setShowAllAchievements] = useState(false);

  const [friends] = useState([
    { id: 1, name: "Sarah Chen", level: 12, streak: 8, status: "online", xp: 1850, rank: "Premium" },
    { id: 2, name: "Mike Rodriguez", level: 18, streak: 15, status: "offline", xp: 2890, rank: "Developer" },
    { id: 3, name: "Emma Thompson", level: 14, streak: 20, status: "online", xp: 2100, rank: "VIP" },
  ]);

  const [showAddPeople, setShowAddPeople] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const getRankIcon = (rank: string) => {
    switch (rank) {
      case "Developer": return <Crown className="h-4 w-4 text-purple-500" />;
      case "VIP": return <Star className="h-4 w-4 text-yellow-500" />;
      case "Premium": return <Zap className="h-4 w-4 text-blue-500" />;
      default: return null;
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
                <BookOpen className="h-8 w-8 text-primary" />
                <h1 className="text-xl font-bold">SūdžiusAI</h1>
              </Link>
            </div>
            <LanguageSelector />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showAddPeople && (
          <Card className="mb-8 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UserPlus className="h-5 w-5" />
                <span>Add People</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Search for people..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader className="text-center">
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback className="text-2xl">AJ</AvatarFallback>
                </Avatar>
                <CardTitle>{userStats.name}</CardTitle>
                <CardDescription>{userStats.email}</CardDescription>
                <Badge variant="secondary" className="mt-2">Level {userStats.level}</Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>XP Progress</span>
                    <span>{userStats.xp}/{userStats.nextLevelXp}</span>
                  </div>
                  <Progress value={(userStats.xp / userStats.nextLevelXp) * 100} />
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{userStats.totalLessons}</div>
                    <div className="text-sm text-muted-foreground">Lessons</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{userStats.hoursLearned}h</div>
                    <div className="text-sm text-muted-foreground">Hours</div>
                  </div>
                </div>
                <div className="flex items-center justify-center space-x-2 text-orange-600">
                  <Calendar className="h-5 w-5" />
                  <span className="font-medium">{userStats.streak} day streak!</span>
                </div>
              </CardContent>
            </Card>

            <Button variant="outline" className="w-full" onClick={() => setShowAddPeople(!showAddPeople)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add People
            </Button>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Friends ({friends.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {friends.map((friend) => (
                    <div key={friend.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted cursor-pointer">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>{friend.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${friend.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-1">
                          <p className="font-medium text-sm">{friend.name}</p>
                          {getRankIcon(friend.rank)}
                        </div>
                        <p className="text-xs text-muted-foreground">Level {friend.level}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5" />
                  <span>Achievements</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(showAllAchievements ? achievements : achievements.slice(0, 4)).map((achievement) => (
                    <div key={achievement.id} className={`p-4 rounded-lg border ${achievement.earned ? "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200" : "bg-muted border-border"}`}>
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-full ${achievement.earned ? "bg-yellow-100 text-yellow-600" : "bg-muted text-muted-foreground"}`}>
                          <achievement.icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className={`font-semibold ${achievement.earned ? "" : "text-muted-foreground"}`}>{achievement.name}</h3>
                          <p className={`text-sm ${achievement.earned ? "text-muted-foreground" : "text-muted-foreground/60"}`}>{achievement.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {!showAllAchievements && (
                  <Button variant="outline" className="w-full" onClick={() => setShowAllAchievements(true)}>
                    See all Achievements
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { color: "bg-green-500", text: "Completed Mathematics lesson - Algebra Basics", time: "2 hours ago" },
                    { color: "bg-blue-500", text: 'Earned "Week Warrior" achievement', time: "1 day ago" },
                    { color: "bg-purple-500", text: "Started AI tutoring session in Science", time: "2 days ago" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center space-x-3 text-sm">
                      <div className={`w-2 h-2 ${item.color} rounded-full`} />
                      <span className="text-muted-foreground">{item.text}</span>
                      <span className="text-muted-foreground/60 ml-auto">{item.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
