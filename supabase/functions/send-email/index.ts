import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const RESEND_API_URL = "https://api.resend.com/emails";
const FROM_EMAIL = "KnowIt AI <noreply@sudzinas.pw>";

interface EmailRequest {
  type: string; // 'exam_results' | 'weekly_report' | 'ban_notice' | 'warning' | 'announcement'
  user_id?: string;
  user_ids?: string[]; // for bulk announcements
  subject: string;
  data: Record<string, any>;
}

function generateExamResultsHtml(data: Record<string, any>): string {
  const { username, exam_title, score, total_questions, percentage, time_taken, subject_breakdown, ai_insights } = data;
  
  const breakdownRows = subject_breakdown ? 
    Object.entries(subject_breakdown).map(([subject, stats]: [string, any]) => 
      `<tr><td style="padding:8px;border-bottom:1px solid #eee;">${subject}</td>
       <td style="padding:8px;border-bottom:1px solid #eee;">${stats.correct}/${stats.total}</td>
       <td style="padding:8px;border-bottom:1px solid #eee;">${Math.round((stats.correct/stats.total)*100)}%</td></tr>`
    ).join('') : '';

  return `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;">
      <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px;text-align:center;border-radius:12px 12px 0 0;">
        <h1 style="color:#fff;margin:0;font-size:24px;">📊 Exam Results</h1>
        <p style="color:rgba(255,255,255,0.9);margin:8px 0 0;">Your ${exam_title} results are in!</p>
      </div>
      <div style="padding:24px;">
        <p style="color:#374151;">Hi ${username},</p>
        <div style="background:#f9fafb;border-radius:12px;padding:20px;margin:16px 0;text-align:center;">
          <div style="font-size:48px;font-weight:700;color:${percentage >= 70 ? '#10b981' : percentage >= 50 ? '#f59e0b' : '#ef4444'};">${percentage}%</div>
          <p style="color:#6b7280;margin:4px 0;">${score}/${total_questions} correct · ${Math.floor(time_taken/60)}m ${time_taken%60}s</p>
        </div>
        ${breakdownRows ? `
        <h3 style="color:#374151;margin-top:24px;">Subject Breakdown</h3>
        <table style="width:100%;border-collapse:collapse;">
          <tr style="background:#f3f4f6;"><th style="padding:8px;text-align:left;">Subject</th><th style="padding:8px;">Score</th><th style="padding:8px;">%</th></tr>
          ${breakdownRows}
        </table>` : ''}
        ${ai_insights ? `
        <div style="background:#eff6ff;border-left:4px solid #6366f1;padding:16px;margin:20px 0;border-radius:0 8px 8px 0;">
          <h4 style="color:#6366f1;margin:0 0 8px;">🤖 AI Insights (Premium)</h4>
          <p style="color:#374151;margin:0;font-size:14px;">${ai_insights}</p>
        </div>` : ''}
        <p style="color:#6b7280;font-size:13px;margin-top:24px;">Keep learning and improving! 🚀</p>
      </div>
      <div style="background:#f9fafb;padding:16px;text-align:center;border-radius:0 0 12px 12px;">
        <p style="color:#9ca3af;font-size:12px;margin:0;">KnowIt AI · <a href="https://knower.lovable.app" style="color:#6366f1;">knower.lovable.app</a></p>
      </div>
    </div>`;
}

function generateWeeklyReportHtml(data: Record<string, any>): string {
  const { username, week_start, week_end, lessons_completed, time_spent_minutes, streak, level, xp_gained, top_subjects } = data;
  
  const subjectsList = top_subjects?.map((s: any) => 
    `<li style="padding:4px 0;color:#374151;">${s.name}: ${s.lessons} lessons, ${s.accuracy}% accuracy</li>`
  ).join('') || '<li style="color:#6b7280;">No activity this week</li>';

  return `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;">
      <div style="background:linear-gradient(135deg,#10b981,#059669);padding:32px;text-align:center;border-radius:12px 12px 0 0;">
        <h1 style="color:#fff;margin:0;font-size:24px;">📈 Weekly Progress Report</h1>
        <p style="color:rgba(255,255,255,0.9);margin:8px 0 0;">${week_start} – ${week_end}</p>
      </div>
      <div style="padding:24px;">
        <p style="color:#374151;">Hi ${username}, here's your weekly summary:</p>
        <div style="display:flex;gap:12px;margin:16px 0;">
          <div style="flex:1;background:#f0fdf4;border-radius:8px;padding:16px;text-align:center;">
            <div style="font-size:28px;font-weight:700;color:#10b981;">${lessons_completed}</div>
            <div style="color:#6b7280;font-size:12px;">Lessons</div>
          </div>
          <div style="flex:1;background:#eff6ff;border-radius:8px;padding:16px;text-align:center;">
            <div style="font-size:28px;font-weight:700;color:#6366f1;">${Math.round(time_spent_minutes/60)}h</div>
            <div style="color:#6b7280;font-size:12px;">Study Time</div>
          </div>
          <div style="flex:1;background:#fef3c7;border-radius:8px;padding:16px;text-align:center;">
            <div style="font-size:28px;font-weight:700;color:#f59e0b;">🔥${streak}</div>
            <div style="color:#6b7280;font-size:12px;">Streak</div>
          </div>
        </div>
        <p style="color:#374151;margin:16px 0 8px;font-weight:600;">Level ${level} · +${xp_gained} XP this week</p>
        <h3 style="color:#374151;">Top Subjects</h3>
        <ul style="padding-left:20px;">${subjectsList}</ul>
      </div>
      <div style="background:#f9fafb;padding:16px;text-align:center;border-radius:0 0 12px 12px;">
        <a href="https://knower.lovable.app/progress" style="display:inline-block;background:#10b981;color:#fff;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:600;">View Full Progress</a>
        <p style="color:#9ca3af;font-size:12px;margin:12px 0 0;">KnowIt AI · <a href="https://knower.lovable.app" style="color:#6366f1;">knower.lovable.app</a></p>
      </div>
    </div>`;
}

function generateBanNoticeHtml(data: Record<string, any>): string {
  const { username, reason, duration, appeal_info } = data;
  return `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;">
      <div style="background:linear-gradient(135deg,#ef4444,#dc2626);padding:32px;text-align:center;border-radius:12px 12px 0 0;">
        <h1 style="color:#fff;margin:0;font-size:24px;">⚠️ Account Suspension</h1>
      </div>
      <div style="padding:24px;">
        <p style="color:#374151;">Hi ${username},</p>
        <p style="color:#374151;">Your account has been suspended due to a violation of our community guidelines.</p>
        <div style="background:#fef2f2;border-left:4px solid #ef4444;padding:16px;margin:16px 0;border-radius:0 8px 8px 0;">
          <p style="color:#991b1b;margin:0;font-weight:600;">Reason: ${reason}</p>
          ${duration ? `<p style="color:#991b1b;margin:8px 0 0;">Duration: ${duration}</p>` : ''}
        </div>
        ${appeal_info ? `<p style="color:#6b7280;font-size:14px;">${appeal_info}</p>` : ''}
        <p style="color:#6b7280;font-size:14px;">If you believe this was a mistake, please contact us at support@sudzinas.pw</p>
      </div>
      <div style="background:#f9fafb;padding:16px;text-align:center;border-radius:0 0 12px 12px;">
        <p style="color:#9ca3af;font-size:12px;margin:0;">KnowIt AI · <a href="https://knower.lovable.app" style="color:#6366f1;">knower.lovable.app</a></p>
      </div>
    </div>`;
}

function generateWarningHtml(data: Record<string, any>): string {
  const { username, reason, details } = data;
  return `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;">
      <div style="background:linear-gradient(135deg,#f59e0b,#d97706);padding:32px;text-align:center;border-radius:12px 12px 0 0;">
        <h1 style="color:#fff;margin:0;font-size:24px;">⚠️ Account Warning</h1>
      </div>
      <div style="padding:24px;">
        <p style="color:#374151;">Hi ${username},</p>
        <p style="color:#374151;">This is a warning regarding your activity on KnowIt AI.</p>
        <div style="background:#fffbeb;border-left:4px solid #f59e0b;padding:16px;margin:16px 0;border-radius:0 8px 8px 0;">
          <p style="color:#92400e;margin:0;font-weight:600;">Reason: ${reason}</p>
          ${details ? `<p style="color:#92400e;margin:8px 0 0;font-size:14px;">${details}</p>` : ''}
        </div>
        <p style="color:#374151;">Please review our community guidelines. Continued violations may result in account suspension.</p>
      </div>
      <div style="background:#f9fafb;padding:16px;text-align:center;border-radius:0 0 12px 12px;">
        <p style="color:#9ca3af;font-size:12px;margin:0;">KnowIt AI · <a href="https://knower.lovable.app" style="color:#6366f1;">knower.lovable.app</a></p>
      </div>
    </div>`;
}

function generateAnnouncementHtml(data: Record<string, any>): string {
  const { username, title, body, cta_text, cta_url } = data;
  return `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;">
      <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px;text-align:center;border-radius:12px 12px 0 0;">
        <h1 style="color:#fff;margin:0;font-size:24px;">📢 ${title}</h1>
      </div>
      <div style="padding:24px;">
        <p style="color:#374151;">Hi ${username},</p>
        <div style="color:#374151;line-height:1.6;">${body}</div>
        ${cta_text && cta_url ? `
        <div style="text-align:center;margin:24px 0;">
          <a href="${cta_url}" style="display:inline-block;background:#6366f1;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;">${cta_text}</a>
        </div>` : ''}
      </div>
      <div style="background:#f9fafb;padding:16px;text-align:center;border-radius:0 0 12px 12px;">
        <p style="color:#9ca3af;font-size:12px;margin:0;">KnowIt AI · <a href="https://knower.lovable.app" style="color:#6366f1;">knower.lovable.app</a></p>
      </div>
    </div>`;
}

function getHtmlForType(type: string, data: Record<string, any>): string {
  switch (type) {
    case 'exam_results': return generateExamResultsHtml(data);
    case 'weekly_report': return generateWeeklyReportHtml(data);
    case 'ban_notice': return generateBanNoticeHtml(data);
    case 'warning': return generateWarningHtml(data);
    case 'announcement': return generateAnnouncementHtml(data);
    default: return generateAnnouncementHtml(data);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    // Auth check - only staff/admin can send emails
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: authError } = await supabase.auth.getUser(token);
    if (authError) throw new Error(`Auth error: ${authError.message}`);

    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userData.user.id);
    
    const isStaffOrAdmin = roles?.some(r => r.role === 'admin' || r.role === 'staff');
    if (!isStaffOrAdmin) throw new Error("Unauthorized: staff/admin only");

    const { type, user_id, user_ids, subject, data }: EmailRequest = await req.json();
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) throw new Error("RESEND_API_KEY not configured");

    // Resolve target users
    let targetUserIds: string[] = [];
    if (user_ids && user_ids.length > 0) {
      targetUserIds = user_ids;
    } else if (user_id) {
      targetUserIds = [user_id];
    } else if (type === 'announcement') {
      // Send to all users with announcement preference enabled
      const { data: allUsers } = await supabase.from('profiles').select('id');
      targetUserIds = allUsers?.map(u => u.id) || [];
    } else {
      throw new Error("No target users specified");
    }

    // Check email preferences
    const { data: prefs } = await supabase
      .from('email_preferences')
      .select('*')
      .in('user_id', targetUserIds);
    
    const prefMap = new Map(prefs?.map(p => [p.user_id, p]) || []);
    const prefKey = type === 'exam_results' ? 'exam_results' : 
                    type === 'weekly_report' ? 'weekly_reports' :
                    type === 'announcement' ? 'announcements' :
                    'warnings';

    // Get user profiles for email addresses
    const results: { sent: number; failed: number; skipped: number } = { sent: 0, failed: 0, skipped: 0 };

    for (const uid of targetUserIds) {
      // Check preference
      const userPref = prefMap.get(uid);
      if (userPref && userPref[prefKey] === false) {
        results.skipped++;
        continue;
      }

      // Get user email from auth
      const { data: authUser } = await supabase.auth.admin.getUserById(uid);
      if (!authUser?.user?.email) { results.failed++; continue; }

      const { data: profile } = await supabase.from('profiles').select('username, display_name').eq('id', uid).maybeSingle();
      const username = profile?.display_name || profile?.username || 'User';

      const emailData = { ...data, username };
      const html = getHtmlForType(type, emailData);

      try {
        const res = await fetch(RESEND_API_URL, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: FROM_EMAIL,
            to: [authUser.user.email],
            subject,
            html,
          }),
        });

        const resData = await res.json();
        
        await supabase.from('email_logs').insert({
          user_id: uid,
          email_type: type,
          subject,
          recipient_email: authUser.user.email,
          status: res.ok ? 'sent' : 'failed',
          metadata: { resend_id: resData.id, ...data },
          error_message: res.ok ? null : JSON.stringify(resData),
          sent_at: res.ok ? new Date().toISOString() : null,
        });

        if (res.ok) results.sent++;
        else results.failed++;
      } catch (e) {
        results.failed++;
        await supabase.from('email_logs').insert({
          user_id: uid,
          email_type: type,
          subject,
          recipient_email: authUser.user.email,
          status: 'failed',
          error_message: e.message,
        });
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[SEND-EMAIL] Error:', msg);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
