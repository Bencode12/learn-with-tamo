import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Trophy, Calendar, Crown, Star, Zap, Loader2, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const PublicProfile = () => {
  const { username } = useParams<{ username: string }>();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [roles, setRoles] = useState<string[]>([]);

  useEffect(() => {
    if (username) fetchProfile();
  }, [username]);

  const fetchProfile = async () => {
    setLoading(true);

    const { data: profileData } = await supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url, level, experience, is_premium, created_at, total_learning_time')
      .eq('username', username)
      .single();

    if (!profileData) {
      setLoading(false);
      return;
    }

    setProfile(profileData);

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', profileData.id);
    setRoles(roleData?.map(r => r.role) || []);

    const { data: achData } = await supabase
      .from('user_achievements')
      .select('*, achievements(*)')
      .eq('user_id', profileData.id)
      .limit(8);
    if (achData) {
      setAchievements(achData.map(a => ({ ...a.achievements, earnedAt: a.earned_at })));
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md border-border/40">
          <CardContent className="pt-6 text-center">
            <p className="text-lg font-semibold mb-2">User not found</p>
            <p className="text-muted-foreground mb-4">No user with username "{username}" exists.</p>
            <Link to="/"><Button>Go Home</Button></Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isAdmin = roles.includes('admin');
  const isStaff = roles.includes('staff');
  const nextLevelXp = (profile.level || 1) * 1000;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/leaderboard">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          </Link>
          <span className="font-semibold">{profile.display_name || profile.username}'s Profile</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <Card className="border-border/40">
          <CardContent className="pt-8">
            <div className="text-center space-y-4">
              <Avatar className="w-24 h-24 mx-auto">
                <AvatarImage src={profile.avatar_url} />
                <AvatarFallback className="bg-muted text-2xl">
                  {(profile.display_name || profile.username)?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <div className="flex items-center justify-center gap-2">
                  <h1 className="text-2xl font-bold">{profile.display_name || profile.username}</h1>
                  {isAdmin && <Crown className="h-5 w-5 text-red-500" />}
                  {isStaff && !isAdmin && <Star className="h-5 w-5 text-yellow-500" />}
                  {profile.is_premium && <Zap className="h-5 w-5 text-blue-500" />}
                </div>
                <p className="text-muted-foreground">@{profile.username}</p>
              </div>

              <div className="flex justify-center gap-3">
                <Badge variant="outline" className="border-border/40">Level {profile.level}</Badge>
                {profile.is_premium && <Badge className="bg-foreground text-background">Premium</Badge>}
              </div>

              <div className="max-w-xs mx-auto space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">XP Progress</span>
                  <span>{profile.experience}/{nextLevelXp}</span>
                </div>
                <Progress value={(profile.experience / nextLevelXp) * 100} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-6 pt-4 max-w-xs mx-auto">
                <div className="text-center">
                  <div className="text-2xl font-bold">{Math.round((profile.total_learning_time || 0) / 60)}h</div>
                  <div className="text-sm text-muted-foreground">Learned</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{profile.level}</div>
                  <div className="text-sm text-muted-foreground">Level</div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-muted-foreground pt-2">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">
                  Joined {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Achievements ({achievements.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {achievements.length === 0 ? (
              <p className="text-center text-muted-foreground py-6">No achievements yet</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {achievements.map((a) => (
                  <div key={a.id} className="p-4 rounded-xl bg-muted/30 border border-border/40">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{a.icon}</div>
                      <div>
                        <h4 className="font-medium">{a.name}</h4>
                        <p className="text-sm text-muted-foreground">{a.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default PublicProfile;
