import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mail, Send, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function EmailManagementTab() {
  const [emailType, setEmailType] = useState("announcement");
  const [subject, setSubject] = useState("");
  const [targetMode, setTargetMode] = useState<"all" | "specific">("all");
  const [targetUserId, setTargetUserId] = useState("");
  const [sending, setSending] = useState(false);

  // Type-specific fields
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementBody, setAnnouncementBody] = useState("");
  const [ctaText, setCtaText] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [warningReason, setWarningReason] = useState("");
  const [warningDetails, setWarningDetails] = useState("");
  const [banReason, setBanReason] = useState("");
  const [banDuration, setBanDuration] = useState("");

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
      }

      const body: any = { type: emailType, subject, data };
      if (targetMode === 'specific' && targetUserId) {
        body.user_id = targetUserId;
      }

      const { data: result, error } = await supabase.functions.invoke('send-email', { body });
      
      if (error) throw error;
      
      const r = result?.results;
      toast.success(`Emails sent: ${r?.sent || 0}, skipped: ${r?.skipped || 0}, failed: ${r?.failed || 0}`);
    } catch (e: any) {
      toast.error(e.message || "Failed to send emails");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="border-border/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5" /> Send Email</CardTitle>
          <CardDescription>Send transactional emails to users</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Email Type</Label>
            <Select value={emailType} onValueChange={setEmailType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="announcement">📢 Announcement</SelectItem>
                <SelectItem value="warning">⚠️ Warning</SelectItem>
                <SelectItem value="ban_notice">🚫 Ban Notice</SelectItem>
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

          <Button onClick={handleSend} disabled={sending} className="w-full gap-2">
            <Send className="h-4 w-4" />
            {sending ? 'Sending...' : 'Send Email'}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border/40">
        <CardHeader>
          <CardTitle>Email Templates</CardTitle>
          <CardDescription>Available email types</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { type: '📊 Exam Results', desc: 'Sent automatically after exam completion', auto: true },
              { type: '📈 Weekly Report', desc: 'Sent weekly to premium users', auto: true },
              { type: '📢 Announcement', desc: 'Platform-wide announcements', auto: false },
              { type: '⚠️ Warning', desc: 'User violation warnings', auto: false },
              { type: '🚫 Ban Notice', desc: 'Account suspension notifications', auto: false },
            ].map((t, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <p className="font-medium text-sm">{t.type}</p>
                  <p className="text-xs text-muted-foreground">{t.desc}</p>
                </div>
                <Badge variant={t.auto ? 'secondary' : 'outline'}>{t.auto ? 'Auto' : 'Manual'}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
