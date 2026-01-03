import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, Users, MessageSquare, AlertTriangle, BookOpen, UserPlus, Search, Crown, Activity, Clock, TrendingUp, Send, BarChart3 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import Header from "@/components/Header";

interface ChatMessage {
  id: string;
  sender_id: string;
  message: string;
  created_at: string;
  sender_name?: string;
}

const StaffHub = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  const [isStaff, setIsStaff] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [antiCheatLogs, setAntiCheatLogs] = useState<any[]>([]);
  const [moderationLogs, setModerationLogs] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  
  // Statistics
  const [stats, setStats] = useState({
    activeUsersToday: 0,
    totalLessonsCompleted: 0,
    avgSessionTime: 0,
    premiumUsers: 0
  });

  useEffect(() => {
    checkStaffStatus();
  }, [user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

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
      loadStaffData();
      loadChatMessages();
      setupChatSubscription();
    } catch (err) {
      console.error('Error:', err);
      toast.error("Error checking permissions");
      navigate('/dashboard');
    } finally {
      setLoading(false);
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
      .select('id, username, display_name, is_premium, created_at, staff_badge, daily_learning_time, total_learning_time')
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
      
      // Calculate statistics
      const premiumCount = users.filter(u => u.is_premium).length;
      const totalTime = users.reduce((acc, u) => acc + (u.total_learning_time || 0), 0);
      
      setStats({
        activeUsersToday: Math.floor(users.length * 0.3), // Simulated
        totalLessonsCompleted: Math.floor(totalTime / 30), // Estimated
        avgSessionTime: users.length > 0 ? Math.floor(totalTime / users.length) : 0,
        premiumUsers: premiumCount
      });
    }
  };

  const loadChatMessages = async () => {
    const { data, error } = await supabase
      .from('staff_chat_messages')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(100);

    if (data) {
      // Enrich with sender names
      const enrichedMessages = await Promise.all(
        data.map(async (msg) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name, username')
            .eq('id', msg.sender_id)
            .single();
          
          return {
            ...msg,
            sender_name: profile?.display_name || profile?.username || 'Unknown'
          };
        })
      );
      setChatMessages(enrichedMessages);
    }
  };

  const setupChatSubscription = () => {
    const channel = supabase
      .channel('staff-chat')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'staff_chat_messages'
        },
        async (payload) => {
          const newMsg = payload.new as ChatMessage;
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name, username')
            .eq('id', newMsg.sender_id)
            .single();
          
          setChatMessages(prev => [...prev, {
            ...newMsg,
            sender_name: profile?.display_name || profile?.username || 'Unknown'
          }]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || sendingMessage) return;

    setSendingMessage(true);
    const { error } = await supabase
      .from('staff_chat_messages')
      .insert({
        sender_id: user?.id,
        message: newMessage.trim()
      });

    if (error) {
      toast.error("Failed to send message");
    } else {
      setNewMessage("");
    }
    setSendingMessage(false);
  };

  const handleAddAdmin = async () => {
    if (!newAdminEmail) {
      toast.error('Please enter an email');
      return;
    }

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
        await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .in('role', ['admin', 'staff']);

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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="chat">Staff Chat</TabsTrigger>
            <TabsTrigger value="moderation">Moderation</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm font-medium">
                    <Users className="h-4 w-4" />
                    Total Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{allUsers.length}</div>
                  <p className="text-xs text-muted-foreground">Registered accounts</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm font-medium">
                    <Activity className="h-4 w-4 text-green-500" />
                    Active Today
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{stats.activeUsersToday}</div>
                  <p className="text-xs text-muted-foreground">Learning now</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm font-medium">
                    <Crown className="h-4 w-4 text-purple-500" />
                    Premium Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">{stats.premiumUsers}</div>
                  <p className="text-xs text-muted-foreground">Active subscriptions</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm font-medium">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-600">{antiCheatLogs.length}</div>
                  <p className="text-xs text-muted-foreground">Anti-cheat events</p>
                </CardContent>
              </Card>
            </div>

            {userRole === 'admin' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    Add Staff Member
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

          {/* Monitoring Tab */}
          <TabsContent value="monitoring" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Learning Statistics
                  </CardTitle>
                  <CardDescription>Platform-wide learning metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      <span>Lessons Completed Today</span>
                    </div>
                    <span className="font-bold">{stats.totalLessonsCompleted}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>Avg. Session Time</span>
                    </div>
                    <span className="font-bold">{stats.avgSessionTime} min</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      <span>Growth (This Week)</span>
                    </div>
                    <span className="font-bold text-green-600">+12%</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>Latest user actions</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      {allUsers.slice(0, 10).map((u, idx) => (
                        <div key={u.id} className="flex items-center justify-between p-2 border-b">
                          <div>
                            <span className="font-medium text-sm">{u.display_name || u.username}</span>
                            <p className="text-xs text-muted-foreground">
                              {u.total_learning_time || 0} min total learning
                            </p>
                          </div>
                          <Badge variant={u.is_premium ? "default" : "secondary"}>
                            {u.is_premium ? "Premium" : "Free"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
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
                      <TableHead>Learning Time</TableHead>
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
                        <TableCell>{u.total_learning_time || 0} min</TableCell>
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

          {/* Staff Chat Tab */}
          <TabsContent value="chat" className="space-y-6">
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Staff Chat
                </CardTitle>
                <CardDescription>Communicate with other staff members</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col overflow-hidden">
                <ScrollArea className="flex-1 pr-4 mb-4">
                  <div className="space-y-4">
                    {chatMessages.map((msg) => (
                      <div 
                        key={msg.id} 
                        className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] rounded-lg p-3 ${
                          msg.sender_id === user?.id 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted'
                        }`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium opacity-70">
                              {msg.sender_name}
                            </span>
                            <span className="text-xs opacity-50">
                              {new Date(msg.created_at).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm">{msg.message}</p>
                        </div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                </ScrollArea>
                
                <div className="flex gap-2">
                  <Input 
                    placeholder="Type a message..." 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    disabled={sendingMessage}
                  />
                  <Button onClick={sendMessage} disabled={sendingMessage || !newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Moderation Tab */}
          <TabsContent value="moderation" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Anti-Cheat Logs</CardTitle>
                  <CardDescription>Suspicious activity detected</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-80">
                    <div className="space-y-3">
                      {antiCheatLogs.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">No anti-cheat events</p>
                      ) : (
                        antiCheatLogs.map((log) => (
                          <div key={log.id} className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between">
                              <Badge variant={log.severity === 'critical' ? 'destructive' : 'default'}>
                                {log.severity}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(log.created_at).toLocaleString()}
                              </span>
                            </div>
                            <p className="font-medium mt-2">{log.event_type}</p>
                            <p className="text-sm text-muted-foreground">{log.game_mode}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Moderation Queue</CardTitle>
                  <CardDescription>Flagged content pending review</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-80">
                    <div className="space-y-3">
                      {moderationLogs.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">No pending items</p>
                      ) : (
                        moderationLogs.map((log) => (
                          <div key={log.id} className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <Badge variant={log.reviewed ? 'secondary' : 'default'}>
                                {log.reviewed ? 'Reviewed' : 'Pending'}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(log.created_at).toLocaleString()}
                              </span>
                            </div>
                            <p className="font-medium">{log.flagged_reason}</p>
                            <p className="text-sm text-muted-foreground">Severity: {log.severity}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default StaffHub;