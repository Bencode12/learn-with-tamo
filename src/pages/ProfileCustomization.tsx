
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Code, Palette, Save, Eye, Settings, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import LanguageSelector from "@/components/LanguageSelector";

const ProfileCustomization = () => {
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

  const handleSave = () => {
    console.log("Saving profile customization:", { customCSS, customHTML, profileBio, profileTitle });
    // Here you would save to your backend
  };

  const generatePreviewHTML = () => {
    return customHTML
      .replace(/\{\{username\}\}/g, 'John Doe')
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
              <BookOpen className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">Profile Customization</h1>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSelector />
              <Link to="/profile">
                <Button variant="ghost" size="sm">Back to Profile</Button>
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
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Customize Your Profile</h2>
          <p className="text-gray-600">Create a unique look for your profile with custom code. All changes are sandboxed for security.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                      <Palette className="h-5 w-5" />
                      <span>Basic Customization</span>
                    </CardTitle>
                    <CardDescription>Customize your profile without code</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="title">Profile Title</Label>
                      <Input
                        id="title"
                        placeholder="e.g., Math Enthusiast, Science Explorer"
                        value={profileTitle}
                        onChange={(e) => setProfileTitle(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="bio">Profile Bio</Label>
                      <Textarea
                        id="bio"
                        placeholder="Tell others about yourself..."
                        rows={4}
                        value={profileBio}
                        onChange={(e) => setProfileBio(e.target.value)}
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

            <div className="flex space-x-4">
              <Button onClick={handleSave} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
              <Button variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Live Preview</CardTitle>
                <CardDescription>See how your profile will look</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 p-6 rounded-lg min-h-[400px]">
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
      </main>
    </div>
  );
};

export default ProfileCustomization;
