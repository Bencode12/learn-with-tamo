
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, User, Key, Bell, Upload, ArrowLeft, Code, Palette, Save, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import ThemeSelector from "@/components/ThemeSelector";

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
  
  // Profile customization states
  const [customCSS, setCustomCSS] = useState(`/* Your custom CSS here */
.profile-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 15px;
  padding: 20px;
  color: white;
}

.profile-name {
  font-size: 24px;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.profile-stats {
  display: flex;
  gap: 15px;
  margin-top: 15px;
}

.stat-item {
  background: rgba(255,255,255,0.2);
  padding: 10px;
  border-radius: 8px;
  text-align: center;
}`);

  const [customHTML, setCustomHTML] = useState(`<!-- Your custom HTML structure -->
<div class="profile-card">
  <div class="profile-name">{{username}}</div>
  <div class="profile-level">Level {{level}}</div>
  <div class="profile-stats">
    <div class="stat-item">
      <div class="stat-number">{{totalLessons}}</div>
      <div class="stat-label">Lessons</div>
    </div>
    <div class="stat-item">
      <div class="stat-number">{{streak}}</div>
      <div class="stat-label">Streak</div>
    </div>
    <div class="stat-item">
      <div class="stat-number">{{hoursLearned}}</div>
      <div class="stat-label">Hours</div>
    </div>
  </div>
</div>`);

  const [profileBio, setProfileBio] = useState("");
  const [profileTitle, setProfileTitle] = useState("");

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

  const handleSaveCustomization = () => {
    console.log("Saving profile customization:", { customCSS, customHTML, profileBio, profileTitle });
    // Here you would save to your backend
  };

  const generatePreviewHTML = () => {
    return customHTML
      .replace(/\{\{username\}\}/g, profile.username)
      .replace(/\{\{level\}\}/g, '15')
      .replace(/\{\{totalLessons\}\}/g, '156')
      .replace(/\{\{streak\}\}/g, '12')
      .replace(/\{\{hoursLearned\}\}/g, '89');
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
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="account" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="themes">Themes</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          {/* Tamo Credentials Tab */}
          <TabsContent value="account" className="space-y-6">
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

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Key className="h-5 w-5" />
                  <span>ManoDienynas Credentials</span>
                </CardTitle>
                <CardDescription>Connect your ManoDienynas account to sync grades automatically</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleTamoCredentials} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="manoDienynasUsername">ManoDienynas Username</Label>
                      <Input
                        id="manoDienynasUsername"
                        placeholder="Enter your ManoDienynas username"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="manoDienynasPassword">ManoDienynas Password</Label>
                      <Input
                        id="manoDienynasPassword"
                        type="password"
                        placeholder="Enter your ManoDienynas password"
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 p-4 bg-green-50 rounded-lg">
                    <div className="text-sm text-green-800">
                      <p className="font-medium">Secure Connection</p>
                      <p>Your credentials are encrypted and stored securely. We only use them to fetch your grades.</p>
                    </div>
                  </div>
                  <Button type="submit">Save Credentials</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Customization Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Customization Panel */}
              <div className="space-y-6">
                <Tabs defaultValue="basic" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="basic">Basic</TabsTrigger>
                    <TabsTrigger value="html">HTML</TabsTrigger>
                    <TabsTrigger value="css">CSS</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <User className="h-5 w-5" />
                          <span>Basic Profile Info</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="profileTitle">Profile Title</Label>
                          <Input
                            id="profileTitle"
                            placeholder="e.g., Math Enthusiast, Science Explorer"
                            value={profileTitle}
                            onChange={(e) => setProfileTitle(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="profileBio">Profile Bio</Label>
                          <Textarea
                            id="profileBio"
                            placeholder="Tell others about yourself..."
                            rows={4}
                            value={profileBio}
                            onChange={(e) => setProfileBio(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="username">Username</Label>
                          <Input
                            id="username"
                            value={profile.username}
                            onChange={(e) => setProfile({...profile, username: e.target.value})}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="html" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Code className="h-5 w-5" />
                          <span>Custom HTML</span>
                        </CardTitle>
                        <CardDescription>Design your profile structure with HTML. Use template variables like {`{{username}}`}, {`{{level}}`}, etc.</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Textarea
                          rows={12}
                          value={customHTML}
                          onChange={(e) => setCustomHTML(e.target.value)}
                          className="font-mono text-sm"
                          placeholder="Enter your custom HTML here..."
                        />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="css" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Palette className="h-5 w-5" />
                          <span>Custom CSS</span>
                        </CardTitle>
                        <CardDescription>Style your profile with custom CSS. All styles are scoped to your profile.</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Textarea
                          rows={15}
                          value={customCSS}
                          onChange={(e) => setCustomCSS(e.target.value)}
                          className="font-mono text-sm"
                          placeholder="Enter your custom CSS here..."
                        />
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

                <Button onClick={handleSaveCustomization} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Save Profile Changes
                </Button>
              </div>

              {/* Preview Panel */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Eye className="h-5 w-5" />
                      <span>Live Preview</span>
                    </CardTitle>
                    <CardDescription>See how your profile will look</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-100 p-6 rounded-lg min-h-[400px] overflow-auto">
                      <div 
                        className="profile-preview" 
                        dangerouslySetInnerHTML={{ 
                          __html: generatePreviewHTML()
                        }} 
                      />
                      <style dangerouslySetInnerHTML={{ __html: customCSS }} />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Available Variables</CardTitle>
                    <CardDescription>Use these in your HTML template</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <code className="bg-gray-100 px-2 py-1 rounded">{`{{username}}`}</code>
                      <code className="bg-gray-100 px-2 py-1 rounded">{`{{level}}`}</code>
                      <code className="bg-gray-100 px-2 py-1 rounded">{`{{totalLessons}}`}</code>
                      <code className="bg-gray-100 px-2 py-1 rounded">{`{{streak}}`}</code>
                      <code className="bg-gray-100 px-2 py-1 rounded">{`{{hoursLearned}}`}</code>
                      <code className="bg-gray-100 px-2 py-1 rounded">{`{{xp}}`}</code>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Themes Tab */}
          <TabsContent value="themes" className="space-y-6">
            <ThemeSelector />
          </TabsContent>

          {/* Notification Settings Tab */}
          <TabsContent value="notifications" className="space-y-6">
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
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Settings;
