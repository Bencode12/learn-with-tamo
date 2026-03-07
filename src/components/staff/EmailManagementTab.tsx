import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Send, History, CheckCircle, XCircle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface EmailLog {
  id: string;
  user_id: string;
  email_type: string;
  subject: string;
  recipient_email: string;
  status: string;
  created_at: string;
  sent_at: string | null;
  error_message: string | null;
}

export function EmailManagementTab() {
  const [emailType, setEmailType] = useState("announcement");
  const [subject, setSubject] = useState("");
  const [targetMode, setTargetMode] = useState<"all" | "specific">("all");
  const [targetUserId, setTargetUserId] = useState("");
  const [sending, setSending] = useState(false);
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Type-specific fields
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementBody, setAnnouncementBody] = useState("");
  const [ctaText, setCtaText] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [warningReason, setWarningReason] = useState("");
  const [warningDetails, setWarningDetails] = useState("");
  const [banReason, setBanReason] = useState("");
  const [banDuration, setBanDuration] = useState("");
  const [achievementName, setAchievementName] = useState("");
  const [achievementIcon, setAchievementIcon] = useState("🏆");
  const [achievementDesc, setAchievementDesc] = useState("");

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoadingLogs(true);
    const { data } = await supabase
      .from('email_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    setLogs((data as EmailLog[]) || []);
    setLoadingLogs(false);
  };

  const handleSend = async () => {
    if (!subject) { toast.error("Subject is required"); return; }
    setSending(true);

    try {
      let data: Record<string, any> = {};

      switch (emailType) {
        case 'announcement':
          data = { title: announcementTitle || subject, body: announcementBody, cta_text: ctaText, cta_url: ctaUrl };
          break;
        case 'warning':
          data = { reason: warningReason, details: warningDetails };
          break;
        case 'ban_notice':
          data = { reason: banReason, duration: banDuration };
          break;
        case 'achievement':
          data = { achievement_name: achievementName, achievement_icon: achievementIcon, achievement_description: achievementDesc };
          break;
        case 'welcome':
        case 'streak_reminder':
        case 'subscription_confirm':
          break;
      }

      const body: any = { type: emailType, subject, data };
      if (targetMode === 'specific' && targetUserId) {
        body.user_id = targetUserId;
      }

      const { data: result, error } = await supabase.functions.invoke('send-email', { body });

      if (error) throw error;

      const r = result?.results;
      toast.success(`Emails sent: ${r?.sent || 0}, skipped: ${r?.skipped || 0}, failed: ${r?.failed || 0}`);
      loadLogs();
    } catch (e: any) {
      toast.error(e.message || "Failed to send emails");
    } finally {
      setSending(false);
    }
  };

  const statusIcon = (status: string) => {
    if (status === 'sent') return <CheckCircle className="h-4 w-4 text-emerald-500" />;
    if (status === 'failed') return <XCircle className="h-4 w-4 text-destructive" />;
    return <Clock className="h-4 w-4 text-muted-foreground" />;
  };

  const emailTypes = [
    { value: 'announcement', label: '📢 Announcement', auto: false },
    { value: 'warning', label: '⚠️ Warning', auto: false },
    { value: 'ban_notice', label: '🚫 Ban Notice', auto: false },
    { value: 'welcome', label: '🚀 Welcome', auto: true },
    { value: 'streak_reminder', label: '🔥 Streak Reminder', auto: true },
    { value: 'subscription_confirm', label: '👑 Subscription Confirm', auto: true },
    { value: 'achievement', label: '🏆 Achievement', auto: false },
    { value: 'exam_results', label: '📊 Exam Results', auto: true },
    { value: 'weekly_report', label: '📈 Weekly Report', auto: true },
  ];

  return (
    <Tabs defaultValue="compose" className="space-y-4">
      <TabsList>
        <TabsTrigger value="compose" className="gap-2"><Mail className="h-4 w-4" /> Compose</TabsTrigger>
        <TabsTrigger value="logs" className="gap-2"><History className="h-4 w-4" /> Logs</TabsTrigger>
        <TabsTrigger value="templates">Templates</TabsTrigger>
      </TabsList>

      <TabsContent value="compose">
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Send className="h-5 w-5" /> Send Email</CardTitle>
            <CardDescription>Send transactional emails to users</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email Type</Label>
                <Select value={emailType} onValueChange={setEmailType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {emailTypes.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Target</Label>
                <Select value={targetMode} onValueChange={(v) => setTargetMode(v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="specific">Specific User</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {targetMode === 'specific' && (
              <div className="space-y-2">
                <Label>User ID</Label>
                <Input value={targetUserId} onChange={(e) => setTargetUserId(e.target.value)} placeholder="User UUID" />
              </div>
            )}

            <div className="space-y-2">
              <Label>Subject</Label>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Email subject line" />
            </div>

            {emailType === 'announcement' && (
              <>
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={announcementTitle} onChange={(e) => setAnnouncementTitle(e.target.value)} placeholder="Announcement title" />
                </div>
                <div className="space-y-2">
                  <Label>Body (HTML supported)</Label>
                  <Textarea value={announcementBody} onChange={(e) => setAnnouncementBody(e.target.value)} placeholder="Announcement content..." rows={4} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label>CTA Button Text</Label>
                    <Input value={ctaText} onChange={(e) => setCtaText(e.target.value)} placeholder="Learn More" />
                  </div>
                  <div className="space-y-2">
                    <Label>CTA URL</Label>
                    <Input value={ctaUrl} onChange={(e) => setCtaUrl(e.target.value)} placeholder="https://..." />
                  </div>
                </div>
              </>
            )}

            {emailType === 'warning' && (
              <>
                <div className="space-y-2">
                  <Label>Reason</Label>
                  <Input value={warningReason} onChange={(e) => setWarningReason(e.target.value)} placeholder="Violation reason" />
                </div>
                <div className="space-y-2">
                  <Label>Details</Label>
                  <Textarea value={warningDetails} onChange={(e) => setWarningDetails(e.target.value)} placeholder="Additional details..." rows={3} />
                </div>
              </>
            )}

            {emailType === 'ban_notice' && (
              <>
                <div className="space-y-2">
                  <Label>Reason</Label>
                  <Input value={banReason} onChange={(e) => setBanReason(e.target.value)} placeholder="Ban reason" />
                </div>
                <div className="space-y-2">
                  <Label>Duration</Label>
                  <Input value={banDuration} onChange={(e) => setBanDuration(e.target.value)} placeholder="e.g., 7 days, Permanent" />
                </div>
              </>
            )}

            {emailType === 'achievement' && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label>Achievement Name</Label>
                    <Input value={achievementName} onChange={(e) => setAchievementName(e.target.value)} placeholder="First Lesson Complete" />
                  </div>
                  <div className="space-y-2">
                    <Label>Icon</Label>
                    <Input value={achievementIcon} onChange={(e) => setAchievementIcon(e.target.value)} placeholder="🏆" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input value={achievementDesc} onChange={(e) => setAchievementDesc(e.target.value)} placeholder="Achievement description" />
                </div>
              </>
            )}

            <Button onClick={handleSend} disabled={sending} className="w-full gap-2">
              <Send className="h-4 w-4" />
              {sending ? 'Sending...' : 'Send Email'}
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="logs">
        <Card className="border-border/40">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2"><History className="h-5 w-5" /> Email Logs</CardTitle>
              <CardDescription>Recent email delivery history</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={loadLogs} disabled={loadingLogs}>
              Refresh
            </Button>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Sent At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map(log => (
                    <TableRow key={log.id}>
                      <TableCell>{statusIcon(log.status)}</TableCell>
                      <TableCell><Badge variant="outline" className="text-xs">{log.email_type}</Badge></TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{log.recipient_email}</TableCell>
                      <TableCell className="text-sm max-w-[200px] truncate">{log.subject}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {log.sent_at ? format(new Date(log.sent_at), 'MMM d, HH:mm') : '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                  {logs.length === 0 && (
                    <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No emails sent yet</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="templates">
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle>Email Templates</CardTitle>
            <CardDescription>Available email types and their triggers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {emailTypes.map((t, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/30">
                  <div>
                    <p className="font-medium text-sm">{t.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t.auto ? 'Triggered automatically by system events' : 'Manually triggered by staff'}
                    </p>
                  </div>
                  <Badge variant={t.auto ? 'secondary' : 'outline'} className="text-xs">
                    {t.auto ? 'Auto' : 'Manual'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
