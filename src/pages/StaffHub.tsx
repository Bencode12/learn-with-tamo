import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Shield, Users, MessageSquare, AlertTriangle, BookOpen, UserPlus, Search, Crown, 
  Activity, Clock, TrendingUp, Send, BarChart3, Ticket, School, Plus, Eye, Ban, Hash, Trash2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { AppLayout } from "@/components/AppLayout";

interface ChatMessage {
  id: string;
  sender_id: string;
  message: string;
  created_at: string;
  sender_name?: string;
}

interface StaffChannel {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
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
  const [channels, setChannels] = useState<StaffChannel[]>([]);
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const [newChannelName, setNewChannelName] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  
  // Tickets state
  const [tickets, setTickets] = useState<any[]>([]);
  
  // Pilots state
  const [pilots, setPilots] = useState<any[]>([]);
  const [showAddPilot, setShowAddPilot] = useState(false);
  const [showEditPilot, setShowEditPilot] = useState(false);
  const [editingPilot, setEditingPilot] = useState<any>(null);
  const [newPilot, setNewPilot] = useState({ 
    school_name: '', 
    contact_email: '', 
    students_count: 0, 
    teachers_count: 0, 
    notes: '',
    start_date: '',
    end_date: '',
    status: 'active'
  });
  
  // Statistics
  const [stats, setStats] = useState({
    activeUsersToday: 0,
    totalLessonsCompleted: 0,
    avgSessionTime: 0,
    premiumUsers: 0,
    openTickets: 0,
    activePilots: 0
  });

  useEffect(() => {
    checkStaffStatus();
  }, [user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const checkStaffStatus = async () => {
    if (!user) { navigate('/login'); return; }
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (error) { navigate('/dashboard'); return; }

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
      loadChannels();
      loadTickets();
      loadPilots();
    } catch (err) {
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const loadStaffData = async () => {
    const { data: antiCheat } = await supabase
      .from('anti_cheat_logs').select('*').order('created_at', { ascending: false }).limit(50);
    if (antiCheat) setAntiCheatLogs(antiCheat);

    const { data: moderation } = await supabase
      .from('moderation_logs').select('*').order('created_at', { ascending: false }).limit(50);
    if (moderation) setModerationLogs(moderation);

    const { data: users } = await supabase
      .from('profiles')
      .select('id, username, display_name, is_premium, created_at, staff_badge, daily_learning_time, total_learning_time')
      .order('created_at', { ascending: false }).limit(100);

    if (users) {
      const { data: roles } = await supabase.from('user_roles').select('user_id, role');
      const usersWithRoles = users.map(u => ({
        ...u,
        roles: roles?.filter(r => r.user_id === u.id).map(r => r.role) || []
      }));
      setAllUsers(usersWithRoles);
      
      const premiumCount = users.filter(u => u.is_premium).length;
      const totalTime = users.reduce((acc, u) => acc + (u.total_learning_time || 0), 0);
      
      setStats(prev => ({
        ...prev,
        activeUsersToday: Math.floor(users.length * 0.3),
        totalLessonsCompleted: Math.floor(totalTime / 30),
        avgSessionTime: users.length > 0 ? Math.floor(totalTime / users.length) : 0,
        premiumUsers: premiumCount
      }));
    }
  };

  const loadTickets = async () => {
    const { data } = await supabase
      .from('support_tickets')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    if (data) {
      setTickets(data);
      setStats(prev => ({ ...prev, openTickets: data.filter(t => t.status === 'open').length }));
    }
  };

  const loadPilots = async () => {
    const { data } = await supabase
      .from('school_pilots')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) {
      setPilots(data);
      setStats(prev => ({ ...prev, activePilots: data.filter(p => p.status === 'active').length }));
    }
  };

  const loadChannels = async () => {
    const { data } = await supabase
      .from('staff_chat_channels')
      .select('id,name,description,created_by')
      .order('created_at', { ascending: true });

    if (data) {
      setChannels(data);
      if (!selectedChannelId && data.length > 0) {
        setSelectedChannelId(data[0].id);
      }
    }
  };

  const loadChatMessages = async () => {
    if (!selectedChannelId) return;
    const { data } = await supabase
      .from('staff_chat_messages_enhanced')
      .select('*')
      .eq('channel_id', selectedChannelId)
      .order('created_at', { ascending: true })
      .limit(100);
    if (data) {
      const enrichedMessages = await Promise.all(
        data.map(async (msg) => {
          const { data: profile } = await supabase
            .from('profiles').select('display_name, username').eq('id', msg.sender_id).single();
          return { ...msg, sender_name: profile?.display_name || profile?.username || 'Unknown' };
        })
      );
      setChatMessages(enrichedMessages);
    }
  };

  const setupChatSubscription = () => {
    if (!selectedChannelId) return;
    const channel = supabase
      .channel('staff-chat')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'staff_chat_messages_enhanced', filter: `channel_id=eq.${selectedChannelId}` },
        async (payload) => {
          const newMsg = payload.new as ChatMessage;
          const { data: profile } = await supabase
            .from('profiles').select('display_name, username').eq('id', newMsg.sender_id).single();
          setChatMessages(prev => [...prev, {
            ...newMsg, sender_name: profile?.display_name || profile?.username || 'Unknown'
          }]);
        }
      ).subscribe();
    return () => { supabase.removeChannel(channel); };
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || sendingMessage || !selectedChannelId) return;
    setSendingMessage(true);
    const { error } = await supabase
      .from('staff_chat_messages_enhanced').insert({ sender_id: user?.id, message: newMessage.trim(), channel_id: selectedChannelId });
    if (error) toast.error("Failed to send message");
    else setNewMessage("");
    setSendingMessage(false);
  };

  useEffect(() => {
    if (!selectedChannelId) return;
    loadChatMessages();
    const unsubscribe = setupChatSubscription();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [selectedChannelId]);

  const createChannel = async () => {
    if (!newChannelName.trim()) return;
    const { data, error } = await supabase
      .from('staff_chat_channels')
      .insert({ name: newChannelName.trim(), created_by: user?.id })
      .select('id,name,description,created_by')
      .single();

    if (error || !data) {
      toast.error('Failed to create channel');
      return;
    }

    await supabase.from('staff_channel_members').insert({
      channel_id: data.id,
      user_id: user?.id,
      role: 'admin'
    });

    setChannels((prev) => [...prev, data]);
    setSelectedChannelId(data.id);
    setNewChannelName('');
    toast.success('Channel created');
  };

  const deleteChannel = async (channelId: string) => {
    const { error } = await supabase.from('staff_chat_channels').delete().eq('id', channelId);
    if (error) {
      toast.error('Failed to delete channel');
      return;
    }

    const remaining = channels.filter((c) => c.id !== channelId);
    setChannels(remaining);
    setSelectedChannelId(remaining[0]?.id ?? null);
    toast.success('Channel deleted');
  };

  const banUser = async (targetUserId: string) => {
    if (userRole !== 'admin' && userRole !== 'staff') return;
    if (targetUserId === user?.id) {
      toast.error('You cannot ban yourself');
      return;
    }

    const reason = prompt('Provide ban reason (optional):') || null;
    const { error } = await supabase.from('banned_users').insert({
      user_id: targetUserId,
      banned_by: user?.id,
      reason,
      is_permanent: false,
      ban_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    });

    if (error) {
      toast.error(`Failed to ban user: ${error.message}`);
      return;
    }

    toast.success('User banned for 7 days');
  };

  const handleChangeRole = async (userId: string, newRole: string) => {
    if (userRole !== 'admin') { toast.error('Only admins can change roles'); return; }
    try {
      await supabase.from('user_roles').delete().eq('user_id', userId).in('role', ['admin', 'staff']);
      if (newRole !== 'remove') {
        await supabase.from('user_roles').insert({ user_id: userId, role: newRole as 'admin' | 'staff' | 'user' });
      }
      toast.success('Role updated successfully');
      loadStaffData();
    } catch (error) {
      toast.error('Failed to update role');
    }
  };

  const updateTicketStatus = async (ticketId: string, status: string) => {
    await supabase.from('support_tickets').update({ status, updated_at: new Date().toISOString() }).eq('id', ticketId);
    toast.success('Ticket updated');
    loadTickets();
  };

  const createPilot = async () => {
    if (!newPilot.school_name.trim()) { toast.error('School name required'); return; }
    if (!newPilot.start_date || !newPilot.end_date) { toast.error('Start and end dates required'); return; }
    
    const { error } = await supabase.from('school_pilots').insert({
      ...newPilot,
      created_by: user?.id,
      start_date: newPilot.start_date,
      end_date: newPilot.end_date
    });
    
    if (error) toast.error('Failed to create pilot: ' + error.message);
    else {
      toast.success('Pilot created successfully');
      setShowAddPilot(false);
      setNewPilot({ 
        school_name: '', 
        contact_email: '', 
        students_count: 0, 
        teachers_count: 0, 
        notes: '',
        start_date: '',
        end_date: '',
        status: 'active'
      });
      loadPilots();
    }
  };

  const updatePilot = async () => {
    if (!editingPilot) return;
    if (!newPilot.school_name.trim()) { toast.error('School name required'); return; }
    if (!newPilot.start_date || !newPilot.end_date) { toast.error('Start and end dates required'); return; }
    
    const { error } = await supabase
      .from('school_pilots')
      .update({
        ...newPilot,
        start_date: newPilot.start_date,
        end_date: newPilot.end_date
      })
      .eq('id', editingPilot.id);
    
    if (error) toast.error('Failed to update pilot: ' + error.message);
    else {
      toast.success('Pilot updated successfully');
      setShowEditPilot(false);
      setEditingPilot(null);
      setNewPilot({ 
        school_name: '', 
        contact_email: '', 
        students_count: 0, 
        teachers_count: 0, 
        notes: '',
        start_date: '',
        end_date: '',
        status: 'active'
      });
      loadPilots();
    }
  };

  const deletePilot = async (pilotId: string) => {
    if (!confirm('Are you sure you want to delete this pilot? This action cannot be undone.')) return;
    
    const { error } = await supabase
      .from('school_pilots')
      .delete()
      .eq('id', pilotId);
    
    if (error) toast.error('Failed to delete pilot: ' + error.message);
    else {
      toast.success('Pilot deleted successfully');
      loadPilots();
    }
  };

  const openEditPilot = (pilot: any) => {
    setEditingPilot(pilot);
    setNewPilot({
      school_name: pilot.school_name,
      contact_email: pilot.contact_email || '',
      students_count: pilot.students_count || 0,
      teachers_count: pilot.teachers_count || 0,
      notes: pilot.notes || '',
      start_date: pilot.start_date || '',
      end_date: pilot.end_date || '',
      status: pilot.status || 'active'
    });
    setShowEditPilot(true);
  };

  const filteredUsers = allUsers.filter(u => 
    u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.display_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <AppLayout title="Staff Hub">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </AppLayout>
    );
  }

  if (!isStaff) {
    return (
      <AppLayout title="Staff Hub">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-destructive" />
              Access Denied
            </CardTitle>
            <CardDescription>You do not have permission to access this page</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/dashboard"><Button className="w-full">Return to Dashboard</Button></Link>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Staff Hub" subtitle="Manage users, view logs, monitor platform activity">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="h-7 w-7 text-yellow-600" />
        <Badge variant="default" className="bg-yellow-600">
          {userRole === 'admin' ? 'Admin / Owner' : 'Staff'}
        </Badge>
        <Link to="/teacher">
          <Button variant="outline" size="sm" className="gap-1">
            <Eye className="h-4 w-4" /> Teacher Dashboard
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7 lg:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pilots">Pilots</TabsTrigger>
          <TabsTrigger value="tickets">Tickets</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="moderation">Moderation</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card className="bg-muted/30 border-border/40">
              <CardContent className="pt-6 text-center">
                <Users className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                <div className="text-2xl font-bold">{allUsers.length}</div>
                <p className="text-xs text-muted-foreground">Total Users</p>
              </CardContent>
            </Card>
            <Card className="bg-muted/30 border-border/40">
              <CardContent className="pt-6 text-center">
                <Activity className="h-5 w-5 mx-auto mb-2 text-green-500" />
                <div className="text-2xl font-bold text-green-600">{stats.activeUsersToday}</div>
                <p className="text-xs text-muted-foreground">Active Today</p>
              </CardContent>
            </Card>
            <Card className="bg-muted/30 border-border/40">
              <CardContent className="pt-6 text-center">
                <Crown className="h-5 w-5 mx-auto mb-2 text-purple-500" />
                <div className="text-2xl font-bold text-purple-600">{stats.premiumUsers}</div>
                <p className="text-xs text-muted-foreground">Premium</p>
              </CardContent>
            </Card>
            <Card className="bg-muted/30 border-border/40">
              <CardContent className="pt-6 text-center">
                <AlertTriangle className="h-5 w-5 mx-auto mb-2 text-yellow-500" />
                <div className="text-2xl font-bold text-yellow-600">{antiCheatLogs.length}</div>
                <p className="text-xs text-muted-foreground">Alerts</p>
              </CardContent>
            </Card>
            <Card className="bg-muted/30 border-border/40">
              <CardContent className="pt-6 text-center">
                <Ticket className="h-5 w-5 mx-auto mb-2 text-blue-500" />
                <div className="text-2xl font-bold text-blue-600">{stats.openTickets}</div>
                <p className="text-xs text-muted-foreground">Open Tickets</p>
              </CardContent>
            </Card>
            <Card className="bg-muted/30 border-border/40">
              <CardContent className="pt-6 text-center">
                <School className="h-5 w-5 mx-auto mb-2 text-emerald-500" />
                <div className="text-2xl font-bold text-emerald-600">{stats.activePilots}</div>
                <p className="text-xs text-muted-foreground">Active Pilots</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-border/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <BarChart3 className="h-5 w-5" /> Platform Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2"><BookOpen className="h-4 w-4" /><span className="text-sm">Lessons Completed</span></div>
                  <span className="font-bold">{stats.totalLessonsCompleted}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2"><Clock className="h-4 w-4" /><span className="text-sm">Avg Session</span></div>
                  <span className="font-bold">{stats.avgSessionTime} min</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2"><TrendingUp className="h-4 w-4" /><span className="text-sm">Weekly Growth</span></div>
                  <span className="font-bold text-green-600">+12%</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Activity className="h-5 w-5" /> Recent Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-48">
                  <div className="space-y-2">
                    {allUsers.slice(0, 8).map((u) => (
                      <div key={u.id} className="flex items-center justify-between p-2 border-b border-border/20">
                        <div>
                          <span className="font-medium text-sm">{u.display_name || u.username}</span>
                          <p className="text-xs text-muted-foreground">{u.total_learning_time || 0} min total</p>
                        </div>
                        <Badge variant={u.is_premium ? "default" : "secondary"} className="text-xs">
                          {u.is_premium ? "Premium" : "Free"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {userRole === 'admin' && (
            <Card className="border-border/40">
              <CardHeader><CardTitle className="flex items-center gap-2 text-base"><UserPlus className="h-5 w-5" /> Add Staff Member</CardTitle></CardHeader>
              <CardContent>
                <div className="flex gap-2 max-w-md">
                  <Input placeholder="User email address" value={newAdminEmail} onChange={(e) => setNewAdminEmail(e.target.value)} />
                  <Button onClick={() => { toast.info('This would add staff role to the user'); setNewAdminEmail(''); }}>Add</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Pilots Tab */}
        <TabsContent value="pilots" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">School Pilots</h3>
            <div className="flex gap-2">
              <Dialog open={showAddPilot} onOpenChange={setShowAddPilot}>
                <DialogTrigger asChild>
                  <Button className="gap-2"><Plus className="h-4 w-4" /> New Pilot</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Create School Pilot</DialogTitle></DialogHeader>
                  <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <Label>School Name *</Label>
                      <Input value={newPilot.school_name} onChange={(e) => setNewPilot({ ...newPilot, school_name: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Contact Email</Label>
                      <Input value={newPilot.contact_email} onChange={(e) => setNewPilot({ ...newPilot, contact_email: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Students</Label>
                        <Input type="number" value={newPilot.students_count} onChange={(e) => setNewPilot({ ...newPilot, students_count: Number(e.target.value) })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Teachers</Label>
                        <Input type="number" value={newPilot.teachers_count} onChange={(e) => setNewPilot({ ...newPilot, teachers_count: Number(e.target.value) })} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Start Date *</Label>
                        <Input 
                          type="date" 
                          value={newPilot.start_date} 
                          onChange={(e) => setNewPilot({ ...newPilot, start_date: e.target.value })} 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>End Date *</Label>
                        <Input 
                          type="date" 
                          value={newPilot.end_date} 
                          onChange={(e) => setNewPilot({ ...newPilot, end_date: e.target.value })} 
                          min={newPilot.start_date}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select value={newPilot.status} onValueChange={(value) => setNewPilot({ ...newPilot, status: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Notes</Label>
                      <Textarea value={newPilot.notes} onChange={(e) => setNewPilot({ ...newPilot, notes: e.target.value })} />
                    </div>
                    <Button onClick={createPilot} className="w-full">Create Pilot</Button>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Dialog open={showEditPilot} onOpenChange={(open) => {
                setShowEditPilot(open);
                if (!open) {
                  setEditingPilot(null);
                  setNewPilot({ 
                    school_name: '', 
                    contact_email: '', 
                    students_count: 0, 
                    teachers_count: 0, 
                    notes: '',
                    start_date: '',
                    end_date: '',
                    status: 'active'
                  });
                }
              }}>
                <DialogContent>
                  <DialogHeader><DialogTitle>Edit School Pilot</DialogTitle></DialogHeader>
                  <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <Label>School Name *</Label>
                      <Input value={newPilot.school_name} onChange={(e) => setNewPilot({ ...newPilot, school_name: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Contact Email</Label>
                      <Input value={newPilot.contact_email} onChange={(e) => setNewPilot({ ...newPilot, contact_email: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Students</Label>
                        <Input type="number" value={newPilot.students_count} onChange={(e) => setNewPilot({ ...newPilot, students_count: Number(e.target.value) })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Teachers</Label>
                        <Input type="number" value={newPilot.teachers_count} onChange={(e) => setNewPilot({ ...newPilot, teachers_count: Number(e.target.value) })} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Start Date *</Label>
                        <Input 
                          type="date" 
                          value={newPilot.start_date} 
                          onChange={(e) => setNewPilot({ ...newPilot, start_date: e.target.value })} 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>End Date *</Label>
                        <Input 
                          type="date" 
                          value={newPilot.end_date} 
                          onChange={(e) => setNewPilot({ ...newPilot, end_date: e.target.value })} 
                          min={newPilot.start_date}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select value={newPilot.status} onValueChange={(value) => setNewPilot({ ...newPilot, status: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Notes</Label>
                      <Textarea value={newPilot.notes} onChange={(e) => setNewPilot({ ...newPilot, notes: e.target.value })} />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={updatePilot} className="flex-1">Update Pilot</Button>
                      <Button variant="destructive" onClick={() => deletePilot(editingPilot?.id)} className="flex-1">Delete Pilot</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {pilots.length === 0 ? (
            <Card className="border-border/40">
              <CardContent className="py-12 text-center">
                <School className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No school pilots yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pilots.map((pilot) => (
                <Card key={pilot.id} className="border-border/40">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{pilot.school_name}</CardTitle>
                      <Badge variant={pilot.status === 'active' ? 'default' : 'secondary'}>{pilot.status}</Badge>
                    </div>
                    {pilot.contact_email && <CardDescription>{pilot.contact_email}</CardDescription>}
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-4 text-sm text-muted-foreground mb-2">
                      <span>{pilot.students_count} students</span>
                      <span>{pilot.teachers_count} teachers</span>
                      {pilot.start_date && <span>Start: {new Date(pilot.start_date).toLocaleDateString()}</span>}
                      {pilot.end_date && <span>End: {new Date(pilot.end_date).toLocaleDateString()}</span>}
                    </div>
                    {pilot.notes && <p className="text-sm mb-3">{pilot.notes}</p>}
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => openEditPilot(pilot)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => deletePilot(pilot.id)}>
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tickets Tab */}
        <TabsContent value="tickets" className="space-y-6">
          <Card className="border-border/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Ticket className="h-5 w-5" /> Support Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              {tickets.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No tickets yet</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tickets.map((ticket) => (
                      <TableRow key={ticket.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{ticket.subject}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-xs">{ticket.message}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={ticket.status === 'open' ? 'default' : ticket.status === 'closed' ? 'secondary' : 'outline'}>
                            {ticket.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={ticket.priority === 'high' ? 'destructive' : ticket.priority === 'normal' ? 'outline' : 'secondary'}>
                            {ticket.priority}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(ticket.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Select onValueChange={(value) => updateTicketStatus(ticket.id, value)}>
                            <SelectTrigger className="w-28"><SelectValue placeholder="Status" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="open">Open</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="closed">Closed</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monitoring Tab */}
        <TabsContent value="monitoring" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-border/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base"><BarChart3 className="h-5 w-5" /> Learning Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2"><BookOpen className="h-4 w-4" /><span className="text-sm">Lessons Today</span></div>
                  <span className="font-bold">{stats.totalLessonsCompleted}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2"><Clock className="h-4 w-4" /><span className="text-sm">Avg. Session</span></div>
                  <span className="font-bold">{stats.avgSessionTime} min</span>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base"><Activity className="h-5 w-5" /> Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-48">
                  <div className="space-y-2">
                    {allUsers.slice(0, 10).map((u) => (
                      <div key={u.id} className="flex items-center justify-between p-2 border-b border-border/20">
                        <span className="font-medium text-sm">{u.display_name || u.username}</span>
                        <Badge variant={u.is_premium ? "default" : "secondary"} className="text-xs">
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
          <Card className="border-border/40">
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>View and manage user accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search users..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
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
                    {(userRole === 'admin' || userRole === 'staff') && <TableHead>Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.username}</TableCell>
                      <TableCell>{u.display_name || '-'}</TableCell>
                      <TableCell>
                        {u.roles.includes('admin') && <Badge className="bg-red-600">Admin</Badge>}
                        {u.roles.includes('staff') && !u.roles.includes('admin') && <Badge className="bg-yellow-600">Staff</Badge>}
                        {!u.roles.includes('admin') && !u.roles.includes('staff') && <Badge variant="secondary">User</Badge>}
                      </TableCell>
                      <TableCell>
                        {u.is_premium ? <Badge className="bg-purple-600">Premium</Badge> : <Badge variant="outline">Free</Badge>}
                      </TableCell>
                      <TableCell>{u.total_learning_time || 0} min</TableCell>
                      <TableCell>{new Date(u.created_at).toLocaleDateString()}</TableCell>
                      {(userRole === 'admin' || userRole === 'staff') && (
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {userRole === 'admin' && (
                              <Select onValueChange={(value) => handleChangeRole(u.id, value)}>
                                <SelectTrigger className="w-32"><SelectValue placeholder="Change role" /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="admin">Make Admin</SelectItem>
                                  <SelectItem value="staff">Make Staff</SelectItem>
                                  <SelectItem value="remove">Remove Role</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                            <Button variant="destructive" size="sm" onClick={() => banUser(u.id)}>
                              <Ban className="h-4 w-4 mr-1" /> Ban
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Chat Tab */}
        <TabsContent value="chat" className="space-y-6">
          <Card className="h-[600px] flex flex-col border-border/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5" /> Staff Chat</CardTitle>
              <CardDescription>Communicate with other staff members in real-time</CardDescription>
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <Select value={selectedChannelId || undefined} onValueChange={setSelectedChannelId}>
                  <SelectTrigger className="w-56"><SelectValue placeholder="Select channel" /></SelectTrigger>
                  <SelectContent>
                    {channels.map((channel) => (
                      <SelectItem key={channel.id} value={channel.id}>#{channel.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  placeholder="New channel"
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  className="w-48"
                />
                <Button variant="outline" size="sm" onClick={createChannel}>
                  <Hash className="h-4 w-4 mr-1" /> Create
                </Button>
                {selectedChannelId && (
                  <Button variant="outline" size="sm" onClick={() => deleteChannel(selectedChannelId)}>
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col overflow-hidden">
              <ScrollArea className="flex-1 pr-4 mb-4">
                <div className="space-y-4">
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-lg p-3 ${
                        msg.sender_id === user?.id ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      }`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium opacity-70">{msg.sender_name}</span>
                          <span className="text-xs opacity-50">{new Date(msg.created_at).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-sm">{msg.message}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
              </ScrollArea>
              <div className="flex gap-2">
                <Input placeholder="Type a message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()} disabled={sendingMessage} />
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
            <Card className="border-border/40">
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
                        <div key={log.id} className="p-4 border border-border/40 rounded-lg">
                          <div className="flex items-center justify-between">
                            <Badge variant={log.severity === 'critical' ? 'destructive' : 'default'}>{log.severity}</Badge>
                            <span className="text-xs text-muted-foreground">{new Date(log.created_at).toLocaleString()}</span>
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
            <Card className="border-border/40">
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
                        <div key={log.id} className="p-4 border border-border/40 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant={log.reviewed ? 'secondary' : 'default'}>{log.reviewed ? 'Reviewed' : 'Pending'}</Badge>
                            <span className="text-xs text-muted-foreground">{new Date(log.created_at).toLocaleString()}</span>
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
    </AppLayout>
  );
};

export default StaffHub;
