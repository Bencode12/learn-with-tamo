import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { BookOpen, User, Settings, LogOut, Trophy, Target, Award, Calendar, Clock, TrendingUp, UserPlus, Users, Search, Star, Zap, Crown, Palette } from "lucide-react";
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
    { id: 7, name: "Night Owl", description: "Study after 10 PM for 5 days", icon: Star, earned: false },
    { id: 8, name: "Social Learner", description: "Add 10 friends", icon: Users, earned: true },
    { id: 9, name: "Curious Mind", description: "Explore all subjects", icon: BookOpen, earned: false },
    { id: 10, name: "Consistency King", description: "Study 30 days in a row", icon: Crown, earned: false }
  ]);

  const [friends] = useState([
    { id: 1, name: "Sarah Chen", level: 12, streak: 8, status: "online", xp: 1850, rank: "Premium", joinDate: "March 2024", totalLessons: 89 },
    { id: 2, name: "Mike Rodriguez", level: 18, streak: 15, status: "offline", xp: 2890, rank: "Developer", joinDate: "January 2024", totalLessons: 156 },
    { id: 3, name: "Emma Thompson", level: 14, streak: 20, status: "online", xp: 2100, rank: "VIP", joinDate: "February 2024", totalLessons: 120 },
    { id: 4, name: "David Kim", level: 16, streak: 5, status: "offline", xp: 2450, rank: "Premium", joinDate: "April 2024", totalLessons: 98 }
  ]);

  const [showAddPeople, setShowAddPeople] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const suggestedPeople = [
    { id: 5, name: "Lisa Park", level: 13, mutualFriends: 2, xp: 1950, rank: "Standard", joinDate: "May 2024", totalLessons: 67 },
    { id: 6, name: "James Wilson", level: 11, mutualFriends: 1, xp: 1650, rank: "Premium", joinDate: "June 2024", totalLessons: 45 },
    { id: 7, name: "Anna Foster", level: 17, mutualFriends: 3, xp: 2650, rank: "VIP", joinDate: "March 2024", totalLessons: 134 }
  ];

  const getRankIcon = (rank: string) => {
    switch (rank) {
      case "Developer": return <Crown className="h-4 w-4 text-purple-500" />;
      case "VIP": return <Star className="h-4 w-4 text-yellow-500" />;
      case "Premium": return <Zap className="h-4 w-4 text-blue-500" />;
      default: return null;
    }
  };

  const getRankColor = (rank: string) => {
    switch (rank) {
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
              <AvatarFallback className="text-lg">{user.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-lg">{user.name}</h3>
                {getRankIcon(user.rank)}
              </div>
              <Badge className={`text-xs ${getRankColor(user.rank)}`}>
                {user.rank}
              </Badge>
              <p className="text-sm text-gray-500 mt-1">Level {user.level}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>XP Progress</span>
              <span>{user.xp}/{(user.level + 1) * 200}</span>
            </div>
            <Progress value={(user.xp / ((user.level + 1) * 200)) * 100} className="h-2" />
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-gray-50 rounded-lg p-2">
              <div className="font-bold text-blue-600">{user.totalLessons || 0}</div>
              <div className="text-xs text-gray-600">Lessons</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-2">
              <div className="font-bold text-orange-600">{user.streak || 0}</div>
              <div className="text-xs text-gray-600">Day Streak</div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Joined {user.joinDate}</span>
            {user.status && (
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${user.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span>{user.status}</span>
              </div>
            )}
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">Profile</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowAddPeople(!showAddPeople)}
                className="flex items-center space-x-2"
              >
                <UserPlus className="h-4 w-4" />
                <span>Add People</span>
              </Button>
              <LanguageSelector />
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">Dashboard</Button>
              </Link>
              <Link to="/store">
                <Button variant="ghost" size="sm">Store</Button>
              </Link>
              <Link to="/profile/customize">
                <Button variant="outline" size="sm">
                  <Palette className="h-4 w-4 mr-2" />
                  Customize
                </Button>
              </Link>
              <Link to="/settings">
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </Link>
              <Button variant="ghost" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add People Modal */}
        {showAddPeople && (
          <Card className="mb-8 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UserPlus className="h-5 w-5" />
                <span>Add People</span>
              </CardTitle>
              <CardDescription>Find and connect with other learners</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search for people..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Suggested People</h4>
                {suggestedPeople.map((person) => (
                  <div key={person.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                    <ProfileHoverCard user={person}>
                      <div className="flex items-center space-x-3 cursor-pointer">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>{person.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-medium">{person.name}</p>
                            {getRankIcon(person.rank)}
                          </div>
                          <p className="text-sm text-gray-500">Level {person.level} • {person.mutualFriends} mutual friends</p>
                        </div>
                      </div>
                    </ProfileHoverCard>
                    <Button size="sm" variant="outline">
                      <UserPlus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
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
                    <div className="text-sm text-gray-600">Lessons</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{userStats.hoursLearned}h</div>
                    <div className="text-sm text-gray-600">Hours</div>
                  </div>
                </div>
                <div className="flex items-center justify-center space-x-2 text-orange-600">
                  <Calendar className="h-5 w-5" />
                  <span className="font-medium">{userStats.streak} day streak!</span>
                </div>
              </CardContent>
            </Card>

            {/* Friends Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Friends ({friends.length})</span>
                </CardTitle>
                <CardDescription>Your learning companions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {friends.map((friend) => (
                    <ProfileHoverCard key={friend.id} user={friend}>
                      <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>{friend.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div 
                            className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                              friend.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                            }`}
                          ></div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-1">
                            <p className="font-medium text-sm">{friend.name}</p>
                            {getRankIcon(friend.rank)}
                          </div>
                          <p className="text-xs text-gray-500">Level {friend.level} • {friend.streak} day streak</p>
                        </div>
                      </div>
                    </ProfileHoverCard>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Achievements */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5" />
                  <span>Achievements</span>
                </CardTitle>
                <CardDescription>Your learning milestones and accomplishments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className={`p-4 rounded-lg border ${
                        achievement.earned
                          ? "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div
                          className={`p-2 rounded-full ${
                            achievement.earned
                              ? "bg-yellow-100 text-yellow-600"
                              : "bg-gray-200 text-gray-400"
                          }`}
                        >
                          <achievement.icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <h3
                            className={`font-semibold ${
                              achievement.earned ? "text-gray-900" : "text-gray-500"
                            }`}
                          >
                            {achievement.name}
                          </h3>
                          <p
                            className={`text-sm ${
                              achievement.earned ? "text-gray-600" : "text-gray-400"
                            }`}
                          >
                            {achievement.description}
                          </p>
                          {achievement.earned && (
                            <Badge variant="secondary" className="mt-2 text-xs">
                              Earned
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest learning activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600">Completed Mathematics lesson - Algebra Basics</span>
                    <span className="text-gray-400 ml-auto">2 hours ago</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-600">Earned "Week Warrior" achievement</span>
                    <span className="text-gray-400 ml-auto">1 day ago</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-gray-600">Started AI tutoring session in Science</span>
                    <span className="text-gray-400 ml-auto">2 days ago</span>
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

export default Profile;
