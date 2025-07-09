
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Trophy, Target, Award, TrendingUp, BarChart3, Calendar, Clock, Settings, LogOut, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Tooltip } from "recharts";
import LanguageSelector from "@/components/LanguageSelector";
import { useState } from "react";

const Progress = () => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const progressData = [
    { month: "Jan", math: 65, science: 78, english: 82, history: 70 },
    { month: "Feb", math: 72, science: 80, english: 85, history: 75 },
    { month: "Mar", math: 78, science: 85, english: 88, history: 82 },
    { month: "Apr", math: 85, science: 88, english: 92, history: 86 },
    { month: "May", math: 88, science: 90, english: 94, history: 88 },
    { month: "Jun", math: 92, science: 92, english: 96, history: 90 }
  ];

  const studyTimeData = [
    { day: "Mon", hours: 2.5 },
    { day: "Tue", hours: 3.2 },
    { day: "Wed", hours: 1.8 },
    { day: "Thu", hours: 2.9 },
    { day: "Fri", hours: 2.1 },
    { day: "Sat", hours: 4.2 },
    { day: "Sun", hours: 3.8 }
  ];

  const subjectDistribution = [
    { name: "Mathematics", value: 35, color: "#3b82f6" },
    { name: "Science", value: 28, color: "#10b981" },
    { name: "English", value: 22, color: "#8b5cf6" },
    { name: "History", value: 15, color: "#f59e0b" }
  ];

  const achievements = [
    { id: 1, name: "Perfect Score", description: "Achieved 100% on a test", icon: Trophy, earned: true, date: "May 2024" },
    { id: 2, name: "Study Streak", description: "15 consecutive days of learning", icon: Target, earned: true, date: "June 2024" },
    { id: 3, name: "Math Wizard", description: "Completed advanced algebra", icon: Award, earned: true, date: "April 2024" },
    { id: 4, name: "Speed Learner", description: "Complete 5 lessons in one day", icon: TrendingUp, earned: false, date: null },
    { id: 5, name: "Knowledge Seeker", description: "Study for 100 total hours", icon: Clock, earned: false, date: null }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-friendly Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">Progress</h1>
            </div>
            
            {/* Mobile menu button */}
            <div className="sm:hidden">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>

            {/* Desktop navigation */}
            <div className="hidden sm:flex items-center space-x-4">
              <LanguageSelector />
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">Dashboard</Button>
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

          {/* Mobile menu dropdown */}
          {showMobileMenu && (
            <div className="sm:hidden border-t bg-white py-2 space-y-1">
              <LanguageSelector />
              <Link to="/dashboard" className="block">
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  Dashboard
                </Button>
              </Link>
              <Link to="/settings" className="block">
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </Link>
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Achievements Section */}
        <Card className="mb-6 sm:mb-8">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <span>Achievements</span>
            </CardTitle>
            <CardDescription className="text-sm">Your learning milestones and accomplishments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`p-3 sm:p-4 rounded-lg border transition-all hover:shadow-md ${
                    achievement.earned
                      ? "bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200"
                      : "bg-gray-50 border-gray-200 opacity-60"
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className={`p-2 rounded-full flex-shrink-0 ${
                        achievement.earned
                          ? "bg-yellow-100 text-yellow-600"
                          : "bg-gray-200 text-gray-400"
                      }`}
                    >
                      <achievement.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-semibold text-sm sm:text-base ${achievement.earned ? "text-gray-900" : "text-gray-500"}`}>
                        {achievement.name}
                      </h3>
                      <p className={`text-xs sm:text-sm ${achievement.earned ? "text-gray-600" : "text-gray-400"}`}>
                        {achievement.description}
                      </p>
                      {achievement.earned ? (
                        <Badge variant="secondary" className="mt-2 text-xs">
                          Earned {achievement.date}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="mt-2 text-xs">
                          Not Earned
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {/* Grade Progress Chart */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                <TrendingUp className="h-5 w-5" />
                <span>Grade Progress</span>
              </CardTitle>
              <CardDescription className="text-sm">Your academic performance over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] sm:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={progressData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="math" stroke="#3b82f6" strokeWidth={2} name="Mathematics" />
                    <Line type="monotone" dataKey="science" stroke="#10b981" strokeWidth={2} name="Science" />
                    <Line type="monotone" dataKey="english" stroke="#8b5cf6" strokeWidth={2} name="English" />
                    <Line type="monotone" dataKey="history" stroke="#f59e0b" strokeWidth={2} name="History" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Study Time Chart */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                <BarChart3 className="h-5 w-5" />
                <span>Weekly Study Time</span>
              </CardTitle>
              <CardDescription className="text-sm">Hours spent studying each day this week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] sm:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={studyTimeData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="hours" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Study Hours" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subject Distribution */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
              <Calendar className="h-5 w-5" />
              <span>Subject Distribution</span>
            </CardTitle>
            <CardDescription className="text-sm">How you spend your study time across different subjects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              <div className="h-[250px] sm:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={subjectDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {subjectDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, 'Time Spent']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col justify-center space-y-3 sm:space-y-4">
                {subjectDistribution.map((subject, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: subject.color }}
                    ></div>
                    <span className="font-medium text-sm sm:text-base">{subject.name}</span>
                    <span className="text-gray-500 ml-auto text-sm sm:text-base">{subject.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Progress;
