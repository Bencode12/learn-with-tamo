
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookOpen, User, Key, Bell, Upload, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Settings = () => {
  const [profile, setProfile] = useState({
    username: "student123",
    email: "student@example.com",
    bio: "Passionate learner focused on STEM subjects"
  });

  const [tamoCredentials, setTamoCredentials] = useState({
    username: "",
    password: ""
  });

  const [notifications, setNotifications] = useState({
    gradeUpdates: true,
    aiRecommendations: true,
    weeklyReports: false
  });

  const [profileImage, setProfileImage] = useState<string | null>(null);

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement profile update
    console.log("Profile updated:", profile);
  };

  const handleTamoCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement Tamo credentials save
    console.log("Tamo credentials saved:", tamoCredentials);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
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
              <BookOpen className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">Settings</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Profile Settings</span>
              </CardTitle>
              <CardDescription>Update your personal information and profile picture</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="flex items-center space-x-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profileImage || undefined} />
                    <AvatarFallback className="text-lg">
                      {profile.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Label htmlFor="profileImage" className="cursor-pointer">
                      <Button type="button" variant="outline" size="sm" asChild>
                        <span>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Photo
                        </span>
                      </Button>
                    </Label>
                    <input
                      id="profileImage"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <p className="text-sm text-gray-500 mt-2">JPG, PNG up to 5MB</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={profile.username}
                      onChange={(e) => setProfile({...profile, username: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({...profile, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself..."
                    value={profile.bio}
                    onChange={(e) => setProfile({...profile, bio: e.target.value})}
                  />
                </div>

                <Button type="submit">Save Profile</Button>
              </form>
            </CardContent>
          </Card>

          {/* Tamo Credentials */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Key className="h-5 w-5" />
                <span>Tamo Credentials</span>
              </CardTitle>
              <CardDescription>Connect your Tamo account to sync grades automatically</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTamoCredentials} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tamoUsername">Tamo Username</Label>
                    <Input
                      id="tamoUsername"
                      placeholder="Enter your Tamo username"
                      value={tamoCredentials.username}
                      onChange={(e) => setTamoCredentials({...tamoCredentials, username: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tamoPassword">Tamo Password</Label>
                    <Input
                      id="tamoPassword"
                      type="password"
                      placeholder="Enter your Tamo password"
                      value={tamoCredentials.password}
                      onChange={(e) => setTamoCredentials({...tamoCredentials, password: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2 p-4 bg-blue-50 rounded-lg">
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Secure Connection</p>
                    <p>Your credentials are encrypted and stored securely. We only use them to fetch your grades.</p>
                  </div>
                </div>
                <Button type="submit">Save Credentials</Button>
              </form>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notifications</span>
              </CardTitle>
              <CardDescription>Manage your notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Grade Updates</Label>
                  <p className="text-sm text-gray-500">Get notified when your grades are updated</p>
                </div>
                <Switch
                  checked={notifications.gradeUpdates}
                  onCheckedChange={(checked) => setNotifications({...notifications, gradeUpdates: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">AI Recommendations</Label>
                  <p className="text-sm text-gray-500">Receive personalized learning suggestions</p>
                </div>
                <Switch
                  checked={notifications.aiRecommendations}
                  onCheckedChange={(checked) => setNotifications({...notifications, aiRecommendations: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Weekly Reports</Label>
                  <p className="text-sm text-gray-500">Get weekly progress summaries</p>
                </div>
                <Switch
                  checked={notifications.weeklyReports}
                  onCheckedChange={(checked) => setNotifications({...notifications, weeklyReports: checked})}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Settings;
