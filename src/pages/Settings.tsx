import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { User, Key, Bell, Camera, Save, Globe, Shield, CheckCircle } from "lucide-react";
import ThemeSelector from "@/components/ThemeSelector";
import LanguageSelector from "@/components/LanguageSelector";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AppLayout } from "@/components/AppLayout";

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
  const [svietimoCentrasCredentials, setSvietimoCentrasCredentials] = useState({ username: "", password: "" });
  const [tamoConnected, setTamoConnected] = useState(false);
  const [manoDienynasConnected, setManoDienynasConnected] = useState(false);
  const [svietimoCentrasConnected, setSvietimoCentrasConnected] = useState(false);
  const [savingCredentials, setSavingCredentials] = useState(false);
  const [notifications, setNotifications] = useState({
    examResults: true,
    friendRequests: true,
    achievements: true,
    weeklyReports: false
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;

    const { data: profileData } = await supabase
      .from('profiles')
      .select('username, display_name, avatar_url')
      .eq('id', user.id)
      .single();

    if (profileData) {
      setProfile({
        username: profileData.username || "",
        displayName: profileData.display_name || "",
        bio: "",
        avatarUrl: profileData.avatar_url || ""
      });
    }

    // Check if credentials are saved (server-side)
    const { data: credentials } = await supabase
      .from('user_credentials')
      .select('service_name')
      .eq('user_id', user.id);

    if (credentials) {
      setTamoConnected(credentials.some(c => c.service_name === 'tamo'));
      setManoDienynasConnected(credentials.some(c => c.service_name === 'manodienynas'));
      setSvietimoCentrasConnected(credentials.some(c => c.service_name === 'svietimocentras'));
    }

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

    // Validate inputs - SQL injection protection
    const cleanUsername = profile.username.trim().replace(/[<>'";&]/g, '').substring(0, 50);
    const cleanDisplayName = profile.displayName.trim().replace(/[<>'";&]/g, '').substring(0, 100);

    if (cleanUsername.length < 3) {
      toast.error('Username must be at least 3 characters');
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        username: cleanUsername,
        display_name: cleanDisplayName
      })
      .eq('id', user.id);

    if (error) {
      toast.error('Failed to update profile');
    } else {
      toast.success('Profile updated successfully');
    }
  };

  const handleCredentialsSave = async (source: 'tamo' | 'manodienynas') => {
    if (!user) return;

    const credentials = 
      source === 'tamo' ? tamoCredentials : 
      manoDienynasCredentials;
    
    // Validate inputs
    if (!credentials.username.trim() || !credentials.password) {
      toast.error('Please enter both username and password');
      return;
    }

    if (credentials.username.length < 3 || credentials.username.length > 100) {
      toast.error('Invalid username length');
      return;
    }

    setSavingCredentials(true);

    try {
      const { data, error } = await supabase.functions.invoke('sync-grades', {
        body: { 
          source, 
          action: 'save_credentials',
          username: credentials.username.trim(),
          password: credentials.password
        }
      });

      if (error) throw error;

      if (data.success) {
        toast.success('Credentials saved securely');
        if (source === 'tamo') {
          setTamoConnected(true);
          setTamoCredentials({ username: '', password: '' });
        } else if (source === 'manodienynas') {
          setManoDienynasConnected(true);
          setManoDienynasCredentials({ username: '', password: '' });
        } else {
          setSvietimoCentrasConnected(true);
          setSvietimoCentrasCredentials({ username: '', password: '' });
        }
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Save credentials error:', error);
      toast.error('Failed to save credentials');
    } finally {
      setSavingCredentials(false);
    }
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
      toast.success('Preferences saved');
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      toast.error('Image must be less than 2MB');
      return;
    }

    setUploading(true);
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: base64 })
        .eq('id', user.id);

      if (!error) {
        setProfile(prev => ({ ...prev, avatarUrl: base64 }));
        toast.success('Profile picture updated');
      } else {
        toast.error('Failed to update profile picture');
      }
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <AppLayout title="Settings" subtitle="Manage your account preferences">
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-muted/50 border border-border/40">
          <TabsTrigger value="profile" className="data-[state=active]:bg-background">Profile</TabsTrigger>
          <TabsTrigger value="accounts" className="data-[state=active]:bg-background">School Accounts</TabsTrigger>
          <TabsTrigger value="appearance" className="data-[state=active]:bg-background">Appearance</TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-background">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card className="border-border/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5" />
                Profile Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={profile.avatarUrl} />
                    <AvatarFallback className="bg-muted text-lg">
                      {profile.displayName?.slice(0, 2).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <label className="absolute bottom-0 right-0 bg-foreground text-background rounded-full p-2 cursor-pointer hover:bg-foreground/90 transition-colors">
                    <Camera className="h-3.5 w-3.5" />
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploading} />
                  </label>
                </div>
                <div className="flex-1">
                  <p className="font-medium">Profile Picture</p>
                  <p className="text-sm text-muted-foreground">Click the camera to upload (max 2MB)</p>
                </div>
              </div>

              <div className="grid gap-4 max-w-lg">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={profile.username}
                    onChange={(e) => setProfile({...profile, username: e.target.value})}
                    className="bg-muted/50 border-border/50"
                    maxLength={50}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={profile.displayName}
                    onChange={(e) => setProfile({...profile, displayName: e.target.value})}
                    className="bg-muted/50 border-border/50"
                    maxLength={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell others about yourself..."
                    rows={3}
                    value={profile.bio}
                    onChange={(e) => setProfile({...profile, bio: e.target.value})}
                    className="bg-muted/50 border-border/50"
                    maxLength={500}
                  />
                </div>
              </div>

              <Button onClick={handleProfileUpdate} className="bg-foreground text-background hover:bg-foreground/90">
                <Save className="h-4 w-4 mr-2" />
                Save Profile
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accounts" className="space-y-6">
          <div className="bg-muted/30 border border-border/40 rounded-lg p-4 flex items-start gap-3">
            <Shield className="h-5 w-5 text-foreground mt-0.5" />
            <div>
              <p className="font-medium">Secure Credential Storage</p>
              <p className="text-sm text-muted-foreground">
                Your school credentials are encrypted and stored securely on our servers. 
                They are only used to sync your grades and are never shared.
              </p>
            </div>
          </div>

          <Card className="border-border/40">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Key className="h-5 w-5" />
                    Tamo
                  </CardTitle>
                  <CardDescription>Connect your Tamo account to sync grades</CardDescription>
                </div>
                {tamoConnected && (
                  <Badge variant="outline" className="gap-1 border-green-500/50 text-green-600">
                    <CheckCircle className="h-3 w-3" />
                    Connected
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 max-w-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tamoUsername">Username</Label>
                    <Input
                      id="tamoUsername"
                      placeholder="Tamo username"
                      value={tamoCredentials.username}
                      onChange={(e) => setTamoCredentials({...tamoCredentials, username: e.target.value})}
                      className="bg-muted/50 border-border/50"
                      maxLength={100}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tamoPassword">Password</Label>
                    <Input
                      id="tamoPassword"
                      type="password"
                      placeholder="Tamo password"
                      value={tamoCredentials.password}
                      onChange={(e) => setTamoCredentials({...tamoCredentials, password: e.target.value})}
                      className="bg-muted/50 border-border/50"
                    />
                  </div>
                </div>
                <Button 
                  onClick={() => handleCredentialsSave('tamo')} 
                  variant="outline" 
                  className="w-fit border-border/40"
                  disabled={savingCredentials}
                >
                  {savingCredentials ? 'Saving...' : (tamoConnected ? 'Update Credentials' : 'Save Credentials')}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/40">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Key className="h-5 w-5" />
                    ManoDienynas
                  </CardTitle>
                  <CardDescription>Connect your ManoDienynas account</CardDescription>
                </div>
                {manoDienynasConnected && (
                  <Badge variant="outline" className="gap-1 border-green-500/50 text-green-600">
                    <CheckCircle className="h-3 w-3" />
                    Connected
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 max-w-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="mdUsername">Username</Label>
                    <Input
                      id="mdUsername"
                      placeholder="Username"
                      value={manoDienynasCredentials.username}
                      onChange={(e) => setManoDienynasCredentials({...manoDienynasCredentials, username: e.target.value})}
                      className="bg-muted/50 border-border/50"
                      maxLength={100}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mdPassword">Password</Label>
                    <Input
                      id="mdPassword"
                      type="password"
                      placeholder="Password"
                      value={manoDienynasCredentials.password}
                      onChange={(e) => setManoDienynasCredentials({...manoDienynasCredentials, password: e.target.value})}
                      className="bg-muted/50 border-border/50"
                    />
                  </div>
                </div>
                <Button 
                  onClick={() => handleCredentialsSave('manodienynas')} 
                  variant="outline" 
                  className="w-fit border-border/40"
                  disabled={savingCredentials}
                >
                  {savingCredentials ? 'Saving...' : (manoDienynasConnected ? 'Update Credentials' : 'Save Credentials')}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/40">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Key className="h-5 w-5" />
                    Švietimo Centras
                  </CardTitle>
                  <CardDescription>Connect your Švietimo Centras account</CardDescription>
                </div>
                {svietimoCentrasConnected && (
                  <Badge variant="outline" className="gap-1 border-green-500/50 text-green-600">
                    <CheckCircle className="h-3 w-3" />
                    Connected
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 max-w-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="scUsername">Username</Label>
                    <Input
                      id="scUsername"
                      placeholder="Username"
                      value={svietimoCentrasCredentials.username}
                      onChange={(e) => setSvietimoCentrasCredentials({...svietimoCentrasCredentials, username: e.target.value})}
                      className="bg-muted/50 border-border/50"
                      maxLength={100}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="scPassword">Password</Label>
                    <Input
                      id="scPassword"
                      type="password"
                      placeholder="Password"
                      value={svietimoCentrasCredentials.password}
                      onChange={(e) => setSvietimoCentrasCredentials({...svietimoCentrasCredentials, password: e.target.value})}
                      className="bg-muted/50 border-border/50"
                    />
                  </div>
                </div>
                <Button 
                  onClick={() => handleCredentialsSave('svietimocentras')} 
                  variant="outline" 
                  className="w-fit border-border/40"
                  disabled={savingCredentials}
                >
                  {savingCredentials ? 'Saving...' : (svietimoCentrasConnected ? 'Update Credentials' : 'Save Credentials')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card className="border-border/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Globe className="h-5 w-5" />
                Language
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LanguageSelector />
            </CardContent>
          </Card>
          
          <ThemeSelector />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="border-border/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>Manage your notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { key: 'examResults', label: 'Exam Results', desc: 'Receive notifications about exam results' },
                { key: 'friendRequests', label: 'Friend Requests', desc: 'Get notified when someone sends a friend request' },
                { key: 'achievements', label: 'Achievements', desc: 'Get notified when you earn achievements' },
                { key: 'weeklyReports', label: 'Weekly Reports', desc: 'Receive weekly learning summaries' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between max-w-lg">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium">{item.label}</Label>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch
                    checked={notifications[item.key as keyof typeof notifications]}
                    onCheckedChange={(checked) => setNotifications({...notifications, [item.key]: checked})}
                  />
                </div>
              ))}

              <Button onClick={handleNotificationUpdate} className="bg-foreground text-background hover:bg-foreground/90">
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default Settings;
