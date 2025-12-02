import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Users, MessageSquare, AlertTriangle, Lock, BookOpen } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import Header from "@/components/Header";

const StaffHub = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isStaff, setIsStaff] = useState(false);
  const [pin, setPin] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [antiCheatLogs, setAntiCheatLogs] = useState<any[]>([]);
  const [moderationLogs, setModerationLogs] = useState<any[]>([]);

  useEffect(() => {
    checkStaffStatus();
  }, [user]);

  const checkStaffStatus = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['admin', 'staff']);

    if (error || !data || data.length === 0) {
      toast.error("Access denied. Staff only.");
      navigate('/dashboard');
      return;
    }

    setIsStaff(true);
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // In production, verify PIN against database
    // For now, using a simple check
    if (pin === "2025") {
      setIsAuthenticated(true);
      toast.success("Authentication successful");
      loadStaffData();
    } else {
      toast.error("Invalid PIN");
    }
  };

  const loadStaffData = async () => {
    // Load anti-cheat logs
    const { data: antiCheat } = await supabase
      .from('anti_cheat_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (antiCheat) setAntiCheatLogs(antiCheat);

    // Load moderation logs
    const { data: moderation } = await supabase
      .from('moderation_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (moderation) setModerationLogs(moderation);
  };

  if (!isStaff) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-red-600" />
              <span>Access Denied</span>
            </CardTitle>
            <CardDescription>You do not have permission to access this page</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-2 border-yellow-500/50">
          <CardHeader className="text-center">
            <Lock className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <CardTitle className="text-2xl">Staff Hub Authentication</CardTitle>
            <CardDescription>Enter your PIN code to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePinSubmit} className="space-y-4">
              <Input
                type="password"
                placeholder="Enter PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="text-center text-2xl tracking-widest"
                maxLength={4}
              />
              <Button type="submit" className="w-full bg-yellow-600 hover:bg-yellow-700">
                Authenticate
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header showAuth={true} showIcons={true} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Shield className="h-8 w-8 text-yellow-600" />
            <h2 className="text-3xl font-bold">Staff Hub</h2>
            <Badge variant="default" className="bg-yellow-600">Admin</Badge>
          </div>
          <p className="text-muted-foreground">Manage users, view logs, and monitor platform activity</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="anticheat">Anti-Cheat</TabsTrigger>
            <TabsTrigger value="moderation">Moderation</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Active Users</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">1,247</div>
                  <p className="text-sm text-muted-foreground">+12% from last week</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <span>Alerts</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-600">{antiCheatLogs.length}</div>
                  <p className="text-sm text-muted-foreground">Anti-cheat events</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageSquare className="h-5 w-5" />
                    <span>Reports</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{moderationLogs.filter(l => !l.reviewed).length}</div>
                  <p className="text-sm text-muted-foreground">Pending review</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>View and manage user accounts</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">User management interface coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="anticheat" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Anti-Cheat Logs</CardTitle>
                <CardDescription>Recent suspicious activity detected</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {antiCheatLogs.map((log) => (
                    <div key={log.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <Badge variant={log.severity === 'critical' ? 'destructive' : 'default'}>
                            {log.severity}
                          </Badge>
                          <span className="ml-2 font-medium">{log.event_type}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(log.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">{log.game_mode}</p>
                    </div>
                  ))}
                  {antiCheatLogs.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No anti-cheat events logged</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="moderation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Moderation Queue</CardTitle>
                <CardDescription>Review flagged content and users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {moderationLogs.map((log) => (
                    <div key={log.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant={log.reviewed ? 'secondary' : 'default'}>
                          {log.reviewed ? 'Reviewed' : 'Pending'}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(log.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="font-medium">{log.flagged_reason}</p>
                      <p className="text-sm text-muted-foreground">Severity: {log.severity}</p>
                    </div>
                  ))}
                  {moderationLogs.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No moderation items pending</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default StaffHub;