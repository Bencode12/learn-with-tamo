import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Users, MessageSquare, AlertTriangle, Lock, BookOpen, UserPlus, Search, Crown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import Header from "@/components/Header";

const StaffHub = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isStaff, setIsStaff] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [pin, setPin] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [antiCheatLogs, setAntiCheatLogs] = useState<any[]>([]);
  const [moderationLogs, setModerationLogs] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkStaffStatus();
  }, [user]);

  const checkStaffStatus = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error checking staff status:', error);
        toast.error("Error checking permissions");
        navigate('/dashboard');
        return;
      }

      const roles = data?.map(r => r.role) || [];
      const isAdminOrStaff = roles.includes('admin') || roles.includes('staff');

      if (!isAdminOrStaff) {
        toast.error("Access denied. Staff only.");
        navigate('/dashboard');
        return;
      }

      setIsStaff(true);
      setUserRole(roles.includes('admin') ? 'admin' : 'staff');
    } catch (err) {
      console.error('Error:', err);
      toast.error("Error checking permissions");
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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

    // Load all users (profiles)
    const { data: users } = await supabase
      .from('profiles')
      .select('id, username, display_name, is_premium, created_at, staff_badge')
      .order('created_at', { ascending: false })
      .limit(100);

    if (users) {
      // Get roles for each user
      const { data: roles } = await supabase
        .from('user_roles')
        .select('user_id, role');

      const usersWithRoles = users.map(u => ({
        ...u,
        roles: roles?.filter(r => r.user_id === u.id).map(r => r.role) || []
      }));

      setAllUsers(usersWithRoles);
    }
  };

  const handleAddAdmin = async () => {
    if (!newAdminEmail) {
      toast.error('Please enter an email');
      return;
    }

    // Find user by email (we'd need to look them up - simplified here)
    toast.info('This would add admin role to the user with this email');
    setNewAdminEmail('');
  };

  const handleChangeRole = async (userId: string, newRole: string) => {
    if (userRole !== 'admin') {
      toast.error('Only admins can change roles');
      return;
    }

    try {
      if (newRole === 'remove') {
        await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .in('role', ['admin', 'staff']);
      } else {
        // Remove existing admin/staff roles first
        await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .in('role', ['admin', 'staff']);

        // Add new role
        await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: newRole as 'admin' | 'staff' | 'user' });
      }

      toast.success('Role updated successfully');
      loadStaffData();
    } catch (error) {
      toast.error('Failed to update role');
    }
  };

  const filteredUsers = allUsers.filter(u => 
    u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.display_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

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
          <CardContent>
            <Link to="/dashboard">
              <Button className="w-full">Return to Dashboard</Button>
            </Link>
          </CardContent>
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
            <Badge variant="default" className="bg-yellow-600">
              {userRole === 'admin' ? 'Admin' : 'Staff'}
            </Badge>
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
                    <span>Total Users</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{allUsers.length}</div>
                  <p className="text-sm text-muted-foreground">Registered accounts</p>
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

            {userRole === 'admin' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <UserPlus className="h-5 w-5" />
                    <span>Add Staff Member</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="User email address" 
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                    />
                    <Button onClick={handleAddAdmin}>Add Staff</Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>View and manage user accounts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search users..." 
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Display Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Premium</TableHead>
                      <TableHead>Joined</TableHead>
                      {userRole === 'admin' && <TableHead>Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.username}</TableCell>
                        <TableCell>{u.display_name || '-'}</TableCell>
                        <TableCell>
                          {u.roles.includes('admin') && <Badge className="bg-red-600">Admin</Badge>}
                          {u.roles.includes('staff') && <Badge className="bg-yellow-600">Staff</Badge>}
                          {!u.roles.includes('admin') && !u.roles.includes('staff') && <Badge variant="secondary">User</Badge>}
                        </TableCell>
                        <TableCell>
                          {u.is_premium ? <Badge className="bg-purple-600">Premium</Badge> : <Badge variant="outline">Free</Badge>}
                        </TableCell>
                        <TableCell>{new Date(u.created_at).toLocaleDateString()}</TableCell>
                        {userRole === 'admin' && (
                          <TableCell>
                            <Select onValueChange={(value) => handleChangeRole(u.id, value)}>
                              <SelectTrigger className="w-32">
                                <SelectValue placeholder="Change role" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">Make Admin</SelectItem>
                                <SelectItem value="staff">Make Staff</SelectItem>
                                <SelectItem value="remove">Remove Role</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
