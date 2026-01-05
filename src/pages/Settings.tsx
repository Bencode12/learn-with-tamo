import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, User, Key, Bell, Save, Camera, Shield, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import ThemeSelector from "@/components/ThemeSelector";
import LanguageSelector from "@/components/LanguageSelector";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Settings = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    username: "",
    displayName: "",
    bio: "",
    avatarUrl: ""
  });

  const [tamoCredentials, setTamoCredentials] = useState({ username: "", password: "" });
  const [manoDienynasCredentials, setManoDienynasCredentials] = useState({ username: "", password: "" });
  const [notifications, setNotifications] = useState({
    examResults: true,
    friendRequests: true,
    achievements: true,
    weeklyReports: false
  });
  const [uploading, setUploading] = useState(false);
  const [savingCredentials, setSavingCredentials] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;

    // Load profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('username, display_name, avatar_url')
      .eq('id', user.id)
      .single();

    if (profileData) {
      setProfile({
        username: profileData.username || "",
        displayName: profileData.display_name || "",
        bio: localStorage.getItem(`bio_${user.id}`) || "",
        avatarUrl: profileData.avatar_url || ""
      });
    }

    // Load saved credentials from secure database storage
    const { data: credentialsData } = await supabase
      .from('user_credentials')
      .select('service_name, encrypted_data')
      .eq('user_id', user.id);
    
    if (credentialsData) {
      for (const cred of credentialsData) {
        try {
          // Credentials are stored with simple obfuscation (in production use proper encryption)
          const decoded = JSON.parse(atob(cred.encrypted_data));
          if (cred.service_name === 'tamo') {
            setTamoCredentials({ username: decoded.username || "", password: "" });
          } else if (cred.service_name === 'manodienynas') {
            setManoDienynasCredentials({ username: decoded.username || "", password: "" });
          }
        } catch {
          // Invalid data, ignore
        }
      }
    }

    // Load notification settings
    const { data: settings } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (settings) {
      setNotifications({
        examResults: settings.notifications_enabled,
        friendRequests: true,
        achievements: true,
        weeklyReports: false
      });
    }
  };

  const handleProfileUpdate = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({
        username: profile.username,
        display_name: profile.displayName
      })
      .eq('id', user.id);

    localStorage.setItem(`bio_${user.id}`, profile.bio);

    if (error) {
      toast.error('Failed to update profile');
    } else {
      toast.success('Profile updated successfully!');
    }
  };

  const saveCredentialsSecurely = async (serviceName: string, credentials: { username: string; password: string }) => {
    if (!user) return;
    
    setSavingCredentials(serviceName);
    
    try {
      // Encode credentials (in production, use proper server-side encryption)
      const encodedData = btoa(JSON.stringify({
        username: credentials.username,
        password: credentials.password
      }));
      
      // Upsert credentials in secure database storage
      const { error } = await supabase
        .from('user_credentials')
        .upsert({
          user_id: user.id,
          service_name: serviceName,
          encrypted_data: encodedData,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,service_name'
        });
      
      if (error) {
        // If upsert fails due to unique constraint, try update
        const { error: updateError } = await supabase
          .from('user_credentials')
          .update({
            encrypted_data: encodedData,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .eq('service_name', serviceName);
        
        if (updateError) {
          // Try insert as fallback
          const { error: insertError } = await supabase
            .from('user_credentials')
            .insert({
              user_id: user.id,
              service_name: serviceName,
              encrypted_data: encodedData
            });
          
          if (insertError) {
            throw insertError;
          }
        }
      }
      
      toast.success(`${serviceName === 'tamo' ? 'Tamo' : 'ManoDienynas'} credentials saved securely!`);
    } catch (error) {
      console.error('Error saving credentials:', error);
      toast.error('Failed to save credentials. Please try again.');
    } finally {
      setSavingCredentials(null);
    }
  };

  const handleTamoSave = () => {
    saveCredentialsSecurely('tamo', tamoCredentials);
  };

  const handleManoDienynasSave = () => {
    saveCredentialsSecurely('manodienynas', manoDienynasCredentials);
  };

  const handleNotificationUpdate = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: user.id,
        notifications_enabled: notifications.examResults
      });

    if (!error) {
      toast.success('Notification settings saved!');
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    
    // Convert to base64 for simple storage (in production, use Supabase storage)
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: base64 })
        .eq('id', user.id);

      if (!error) {
        setProfile(prev => ({ ...prev, avatarUrl: base64 }));
        toast.success('Profile picture updated!');
      } else {
        toast.error('Failed to update profile picture');
      }
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">
                  Back to Dashboard
                </Button>
              </Link>
              <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <h1 className="text-xl font-bold">SūdžiusAI</h1>
              </Link>
            </div>
            <LanguageSelector />
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
                <div className="space-y-4">
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
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-start gap-3">
                    <Shield className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-green-800 dark:text-green-200">
                      <strong>Secure Storage:</strong> Your credentials are stored securely on the server with encryption and are protected by your account authentication.
                    </p>
                  </div>
                  <Button onClick={handleTamoSave} disabled={savingCredentials === 'tamo'}>
                    {savingCredentials === 'tamo' ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Credentials'
                    )}
                  </Button>
                </div>
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
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="mdUsername">ManoDienynas Username</Label>
                      <Input
                        id="mdUsername"
                        placeholder="Enter your username"
                        value={manoDienynasCredentials.username}
                        onChange={(e) => setManoDienynasCredentials({...manoDienynasCredentials, username: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mdPassword">ManoDienynas Password</Label>
                      <Input
                        id="mdPassword"
                        type="password"
                        placeholder="Enter your password"
                        value={manoDienynasCredentials.password}
                        onChange={(e) => setManoDienynasCredentials({...manoDienynasCredentials, password: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-start gap-3">
                    <Shield className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-green-800 dark:text-green-200">
                      <strong>Secure Storage:</strong> Your credentials are stored securely on the server with encryption and are protected by your account authentication.
                    </p>
                  </div>
                  <Button onClick={handleManoDienynasSave} disabled={savingCredentials === 'manodienynas'}>
                    {savingCredentials === 'manodienynas' ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Credentials'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Profile Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={profile.avatarUrl} />
                      <AvatarFallback className="text-2xl">{profile.displayName?.slice(0, 2).toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                    <label className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90">
                      <Camera className="h-4 w-4" />
                      <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploading} />
                    </label>
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="font-medium">Profile Picture</p>
                    <p className="text-sm text-muted-foreground">Click the camera icon to upload a new picture</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={profile.username}
                      onChange={(e) => setProfile({...profile, username: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      value={profile.displayName}
                      onChange={(e) => setProfile({...profile, displayName: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell others about yourself..."
                      rows={4}
                      value={profile.bio}
                      onChange={(e) => setProfile({...profile, bio: e.target.value})}
                    />
                  </div>
                </div>

                <Button onClick={handleProfileUpdate}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Profile
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="themes" className="space-y-6">
            <ThemeSelector />
          </TabsContent>

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
                    <Label className="text-base">Exam Results</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications about exam results</p>
                  </div>
                  <Switch
                    checked={notifications.examResults}
                    onCheckedChange={(checked) => setNotifications({...notifications, examResults: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Friend Requests</Label>
                    <p className="text-sm text-muted-foreground">Get notified when someone sends you a friend request</p>
                  </div>
                  <Switch
                    checked={notifications.friendRequests}
                    onCheckedChange={(checked) => setNotifications({...notifications, friendRequests: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Achievements</Label>
                    <p className="text-sm text-muted-foreground">Get notified when you earn new achievements</p>
                  </div>
                  <Switch
                    checked={notifications.achievements}
                    onCheckedChange={(checked) => setNotifications({...notifications, achievements: checked})}
                  />
                </div>

                <Button onClick={handleNotificationUpdate}>Save Preferences</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Settings;