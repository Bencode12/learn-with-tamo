
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Trophy, Target, Award, TrendingUp, BarChart3, Calendar, Clock, Settings, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Tooltip } from "recharts";
import LanguageSelector from "@/components/LanguageSelector";

const Progress = () => {
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
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">Progress</h1>
            </div>
            <div className="flex items-center space-x-4">
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
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Achievements Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <span>Achievements</span>
            </CardTitle>
            <CardDescription>Your learning milestones and accomplishments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                    achievement.earned
                      ? "bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200"
                      : "bg-gray-50 border-gray-200 opacity-60"
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
                      <h3 className={`font-semibold ${achievement.earned ? "text-gray-900" : "text-gray-500"}`}>
                        {achievement.name}
                      </h3>
                      <p className={`text-sm ${achievement.earned ? "text-gray-600" : "text-gray-400"}`}>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Grade Progress Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Grade Progress</span>
              </CardTitle>
              <CardDescription>Your academic performance over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
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
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Weekly Study Time</span>
              </CardTitle>
              <CardDescription>Hours spent studying each day this week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={studyTimeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
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
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Subject Distribution</span>
            </CardTitle>
            <CardDescription>How you spend your study time across different subjects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={subjectDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
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
              <div className="flex flex-col justify-center space-y-4">
                {subjectDistribution.map((subject, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: subject.color }}
                    ></div>
                    <span className="font-medium">{subject.name}</span>
                    <span className="text-gray-500 ml-auto">{subject.value}%</span>
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
