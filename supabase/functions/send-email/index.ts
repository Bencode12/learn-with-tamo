import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const RESEND_API_URL = "https://api.resend.com/emails";
const FROM_EMAIL = "KnowIt AI <noreply@sudzinas.pw>";
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;
const RATE_LIMIT_PER_MINUTE = 50;

// In-memory rate limiter (resets per cold start)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + 60000 });
    return true;
  }
  if (entry.count >= RATE_LIMIT_PER_MINUTE) return false;
  entry.count++;
  return true;
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function sendWithRetry(resendKey: string, payload: Record<string, any>): Promise<{ ok: boolean; data: any }> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(RESEND_API_URL, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) return { ok: true, data };
      // Don't retry 4xx (client errors)
      if (res.status >= 400 && res.status < 500) return { ok: false, data };
      if (attempt < MAX_RETRIES) await sleep(RETRY_DELAY_MS * (attempt + 1));
    } catch (e) {
      if (attempt === MAX_RETRIES) return { ok: false, data: { error: e.message } };
      await sleep(RETRY_DELAY_MS * (attempt + 1));
    }
  }
  return { ok: false, data: { error: 'Max retries exceeded' } };
}

// ─── Shared layout ────────────────────────────────────────────────
function emailLayout(headerBg: string, headerIcon: string, headerTitle: string, body: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
<div style="max-width:600px;margin:24px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
  <div style="background:${headerBg};padding:36px 32px;text-align:center;">
    <div style="font-size:36px;margin-bottom:8px;">${headerIcon}</div>
    <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700;letter-spacing:-0.3px;">${headerTitle}</h1>
  </div>
  <div style="padding:28px 32px;">${body}</div>
  <div style="background:#fafafa;padding:20px 32px;text-align:center;border-top:1px solid #f0f0f0;">
    <p style="color:#a1a1aa;font-size:12px;margin:0;">KnowIt AI · <a href="https://knower.lovable.app" style="color:#6366f1;text-decoration:none;">knower.lovable.app</a></p>
    <p style="color:#d4d4d8;font-size:11px;margin:6px 0 0;">You received this because you have an account on KnowIt AI.</p>
  </div>
</div></body></html>`;
}

function greeting(username: string): string {
  return `<p style="color:#27272a;font-size:15px;margin:0 0 16px;">Hi <strong>${username}</strong>,</p>`;
}

function statCard(value: string, label: string, color: string): string {
  return `<div style="flex:1;background:${color}08;border:1px solid ${color}20;border-radius:12px;padding:16px;text-align:center;min-width:100px;">
    <div style="font-size:28px;font-weight:800;color:${color};">${value}</div>
    <div style="color:#71717a;font-size:12px;margin-top:4px;">${label}</div>
  </div>`;
}

function ctaButton(text: string, url: string, color = '#6366f1'): string {
  return `<div style="text-align:center;margin:24px 0;">
    <a href="${url}" style="display:inline-block;background:${color};color:#fff;padding:12px 32px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px;">${text}</a>
  </div>`;
}

function infoBox(bgColor: string, borderColor: string, textColor: string, content: string): string {
  return `<div style="background:${bgColor};border-left:4px solid ${borderColor};padding:16px 20px;margin:16px 0;border-radius:0 10px 10px 0;">
    ${content}
  </div>`;
}

// ─── Templates ────────────────────────────────────────────────────
function generateExamResultsHtml(data: Record<string, any>): string {
  const { username, exam_title, score, total_questions, percentage, time_taken, subject_breakdown, ai_insights } = data;
  const mins = Math.floor((time_taken || 0) / 60);
  const secs = (time_taken || 0) % 60;
  const scoreColor = percentage >= 70 ? '#10b981' : percentage >= 50 ? '#f59e0b' : '#ef4444';

  const breakdownRows = subject_breakdown ?
    Object.entries(subject_breakdown).map(([subject, stats]: [string, any]) =>
      `<tr><td style="padding:10px 12px;border-bottom:1px solid #f4f4f5;color:#3f3f46;font-size:14px;">${subject}</td>
       <td style="padding:10px 12px;border-bottom:1px solid #f4f4f5;text-align:center;color:#3f3f46;font-size:14px;">${stats.correct}/${stats.total}</td>
       <td style="padding:10px 12px;border-bottom:1px solid #f4f4f5;text-align:center;font-weight:600;color:${(stats.correct/stats.total)*100 >= 70 ? '#10b981' : '#ef4444'};font-size:14px;">${Math.round((stats.correct/stats.total)*100)}%</td></tr>`
    ).join('') : '';

  let body = greeting(username);
  body += `<p style="color:#52525b;font-size:14px;line-height:1.6;">Your results for <strong>${exam_title}</strong> are ready!</p>`;
  body += `<div style="display:flex;gap:12px;margin:20px 0;">`;
  body += statCard(`${percentage}%`, 'Score', scoreColor);
  body += statCard(`${score}/${total_questions}`, 'Correct', '#6366f1');
  body += statCard(`${mins}m ${secs}s`, 'Time', '#8b5cf6');
  body += `</div>`;

  if (breakdownRows) {
    body += `<h3 style="color:#27272a;font-size:15px;margin:24px 0 12px;">Subject Breakdown</h3>`;
    body += `<table style="width:100%;border-collapse:collapse;border-radius:8px;overflow:hidden;">
      <tr style="background:#f9fafb;"><th style="padding:10px 12px;text-align:left;font-size:13px;color:#71717a;">Subject</th><th style="padding:10px 12px;font-size:13px;color:#71717a;">Score</th><th style="padding:10px 12px;font-size:13px;color:#71717a;">%</th></tr>
      ${breakdownRows}</table>`;
  }

  if (ai_insights) {
    body += infoBox('#eff6ff', '#6366f1', '#3730a3',
      `<p style="color:#6366f1;margin:0 0 6px;font-weight:700;font-size:13px;">🤖 AI Insights (Premium)</p>
       <p style="color:#3f3f46;margin:0;font-size:14px;line-height:1.5;">${ai_insights}</p>`);
  }

  body += ctaButton('View Full Results', 'https://knower.lovable.app/progress');
  return emailLayout('linear-gradient(135deg,#6366f1,#8b5cf6)', '📊', 'Exam Results', body);
}

function generateWeeklyReportHtml(data: Record<string, any>): string {
  const { username, week_start, week_end, lessons_completed, time_spent_minutes, streak, level, xp_gained, top_subjects } = data;

  let body = greeting(username);
  body += `<p style="color:#52525b;font-size:14px;">Here's your weekly summary for <strong>${week_start} – ${week_end}</strong>:</p>`;
  body += `<div style="display:flex;gap:12px;margin:20px 0;">`;
  body += statCard(String(lessons_completed || 0), 'Lessons', '#10b981');
  body += statCard(`${Math.round((time_spent_minutes || 0) / 60)}h`, 'Study Time', '#6366f1');
  body += statCard(`🔥${streak || 0}`, 'Streak', '#f59e0b');
  body += `</div>`;

  body += `<p style="color:#27272a;font-size:14px;font-weight:600;margin:16px 0 8px;">Level ${level || 1} · +${xp_gained || 0} XP this week</p>`;

  if (top_subjects?.length) {
    body += `<h3 style="color:#27272a;font-size:15px;margin:20px 0 12px;">Top Subjects</h3>`;
    body += `<ul style="padding-left:20px;margin:0;">`;
    top_subjects.forEach((s: any) => {
      body += `<li style="padding:4px 0;color:#3f3f46;font-size:14px;">${s.name}: ${s.lessons} lessons, ${s.accuracy}% accuracy</li>`;
    });
    body += `</ul>`;
  }

  body += ctaButton('View Full Progress', 'https://knower.lovable.app/progress', '#10b981');
  return emailLayout('linear-gradient(135deg,#10b981,#059669)', '📈', 'Weekly Progress Report', body);
}

function generateBanNoticeHtml(data: Record<string, any>): string {
  const { username, reason, duration } = data;
  let body = greeting(username);
  body += `<p style="color:#52525b;font-size:14px;line-height:1.6;">Your account has been suspended due to a violation of our community guidelines.</p>`;
  body += infoBox('#fef2f2', '#ef4444', '#991b1b',
    `<p style="color:#991b1b;margin:0;font-weight:700;font-size:14px;">Reason: ${reason}</p>
     ${duration ? `<p style="color:#991b1b;margin:8px 0 0;font-size:14px;">Duration: ${duration}</p>` : ''}`);
  body += `<p style="color:#71717a;font-size:13px;margin-top:20px;">If you believe this was a mistake, please contact us at <a href="mailto:support@sudzinas.pw" style="color:#6366f1;">support@sudzinas.pw</a></p>`;
  return emailLayout('linear-gradient(135deg,#ef4444,#dc2626)', '⚠️', 'Account Suspension', body);
}

function generateWarningHtml(data: Record<string, any>): string {
  const { username, reason, details } = data;
  let body = greeting(username);
  body += `<p style="color:#52525b;font-size:14px;line-height:1.6;">This is a warning regarding your activity on KnowIt AI.</p>`;
  body += infoBox('#fffbeb', '#f59e0b', '#92400e',
    `<p style="color:#92400e;margin:0;font-weight:700;font-size:14px;">Reason: ${reason}</p>
     ${details ? `<p style="color:#92400e;margin:8px 0 0;font-size:13px;">${details}</p>` : ''}`);
  body += `<p style="color:#52525b;font-size:14px;line-height:1.6;">Please review our community guidelines. Continued violations may result in account suspension.</p>`;
  return emailLayout('linear-gradient(135deg,#f59e0b,#d97706)', '⚠️', 'Account Warning', body);
}

function generateAnnouncementHtml(data: Record<string, any>): string {
  const { username, title, body: content, cta_text, cta_url } = data;
  let body = greeting(username);
  body += `<div style="color:#3f3f46;font-size:14px;line-height:1.7;">${content || ''}</div>`;
  if (cta_text && cta_url) body += ctaButton(cta_text, cta_url);
  return emailLayout('linear-gradient(135deg,#6366f1,#8b5cf6)', '📢', title || 'Announcement', body);
}

function generateWelcomeHtml(data: Record<string, any>): string {
  const { username } = data;
  let body = greeting(username);
  body += `<p style="color:#52525b;font-size:14px;line-height:1.7;">Welcome to <strong>KnowIt AI</strong>! 🎉 We're excited to have you on board.</p>`;
  body += `<div style="display:flex;gap:12px;margin:20px 0;">`;
  body += statCard('5', 'Lives', '#ef4444');
  body += statCard('Lv.1', 'Level', '#6366f1');
  body += statCard('0', 'XP', '#f59e0b');
  body += `</div>`;
  body += `<h3 style="color:#27272a;font-size:15px;margin:20px 0 12px;">Getting Started</h3>`;
  body += `<ol style="padding-left:20px;margin:0;color:#3f3f46;font-size:14px;line-height:2;">
    <li>Pick a subject and start learning</li>
    <li>Complete lessons to earn XP and level up</li>
    <li>Challenge friends in multiplayer modes</li>
    <li>Track your progress with weekly reports</li>
  </ol>`;
  body += ctaButton('Start Learning', 'https://knower.lovable.app/dashboard', '#10b981');
  return emailLayout('linear-gradient(135deg,#6366f1,#a855f7)', '🚀', 'Welcome to KnowIt AI!', body);
}

function generateStreakReminderHtml(data: Record<string, any>): string {
  const { username, current_streak, last_activity } = data;
  let body = greeting(username);
  body += `<p style="color:#52525b;font-size:14px;line-height:1.7;">Your <strong>🔥 ${current_streak}-day streak</strong> is about to expire! Don't let it slip away.</p>`;
  body += infoBox('#fffbeb', '#f59e0b', '#92400e',
    `<p style="color:#92400e;margin:0;font-size:14px;">Last activity: <strong>${last_activity || 'yesterday'}</strong></p>
     <p style="color:#92400e;margin:6px 0 0;font-size:13px;">Complete just one lesson today to keep your streak alive!</p>`);
  body += ctaButton('Keep My Streak 🔥', 'https://knower.lovable.app/dashboard', '#f59e0b');
  return emailLayout('linear-gradient(135deg,#f59e0b,#ea580c)', '🔥', 'Your Streak is at Risk!', body);
}

function generateSubscriptionConfirmHtml(data: Record<string, any>): string {
  const { username, plan_name, amount, next_billing } = data;
  let body = greeting(username);
  body += `<p style="color:#52525b;font-size:14px;line-height:1.7;">Your premium subscription is now active! 🎉</p>`;
  body += infoBox('#f0fdf4', '#10b981', '#166534',
    `<p style="color:#166534;margin:0;font-weight:700;font-size:14px;">Plan: ${plan_name || 'Premium'}</p>
     ${amount ? `<p style="color:#166534;margin:6px 0 0;font-size:14px;">Amount: ${amount}</p>` : ''}
     ${next_billing ? `<p style="color:#166534;margin:6px 0 0;font-size:14px;">Next billing: ${next_billing}</p>` : ''}`);
  body += `<h3 style="color:#27272a;font-size:15px;margin:20px 0 12px;">What's Included</h3>`;
  body += `<ul style="padding-left:20px;margin:0;color:#3f3f46;font-size:14px;line-height:2;">
    <li>✨ Unlimited AI insights</li>
    <li>📊 Weekly progress reports</li>
    <li>❤️ Unlimited lives</li>
    <li>🎨 Exclusive themes & customization</li>
  </ul>`;
  body += ctaButton('Explore Premium Features', 'https://knower.lovable.app/dashboard', '#10b981');
  return emailLayout('linear-gradient(135deg,#10b981,#6366f1)', '👑', 'Subscription Confirmed!', body);
}

function generateAchievementHtml(data: Record<string, any>): string {
  const { username, achievement_name, achievement_icon, achievement_description, xp_reward, coins_reward } = data;
  let body = greeting(username);
  body += `<p style="color:#52525b;font-size:14px;line-height:1.7;">Congratulations! You've unlocked a new achievement!</p>`;
  body += `<div style="text-align:center;margin:24px 0;padding:24px;background:linear-gradient(135deg,#faf5ff,#eff6ff);border-radius:16px;border:2px solid #e9d5ff;">
    <div style="font-size:48px;margin-bottom:8px;">${achievement_icon || '🏆'}</div>
    <h2 style="color:#6d28d9;margin:0 0 8px;font-size:20px;">${achievement_name}</h2>
    <p style="color:#7c3aed;margin:0;font-size:14px;">${achievement_description || ''}</p>
  </div>`;
  if (xp_reward || coins_reward) {
    body += `<div style="display:flex;gap:12px;margin:16px 0;justify-content:center;">`;
    if (xp_reward) body += statCard(`+${xp_reward}`, 'XP', '#6366f1');
    if (coins_reward) body += statCard(`+${coins_reward}`, 'Coins', '#f59e0b');
    body += `</div>`;
  }
  body += ctaButton('View All Achievements', 'https://knower.lovable.app/progress', '#7c3aed');
  return emailLayout('linear-gradient(135deg,#7c3aed,#6366f1)', '🏆', 'Achievement Unlocked!', body);
}

// ─── Template router ──────────────────────────────────────────────
function getHtmlForType(type: string, data: Record<string, any>): string {
  switch (type) {
    case 'exam_results': return generateExamResultsHtml(data);
    case 'weekly_report': return generateWeeklyReportHtml(data);
    case 'ban_notice': return generateBanNoticeHtml(data);
    case 'warning': return generateWarningHtml(data);
    case 'announcement': return generateAnnouncementHtml(data);
    case 'welcome': return generateWelcomeHtml(data);
    case 'streak_reminder': return generateStreakReminderHtml(data);
    case 'subscription_confirm': return generateSubscriptionConfirmHtml(data);
    case 'achievement': return generateAchievementHtml(data);
    default: return generateAnnouncementHtml(data);
  }
}

// ─── Main handler ─────────────────────────────────────────────────
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
    // Auth check
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

    // Rate limit check
    if (!checkRateLimit(userData.user.id)) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded. Try again in a minute.' }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 429,
      });
    }

    const { type, user_id, user_ids, subject, data } = await req.json();
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) throw new Error("RESEND_API_KEY not configured");

    // Resolve targets
    let targetUserIds: string[] = [];
    if (user_ids?.length) {
      targetUserIds = user_ids;
    } else if (user_id) {
      targetUserIds = [user_id];
    } else if (type === 'announcement') {
      const { data: allUsers } = await supabase.from('profiles').select('id');
      targetUserIds = allUsers?.map(u => u.id) || [];
    } else {
      throw new Error("No target users specified");
    }

    // Get preferences
    const { data: prefs } = await supabase
      .from('email_preferences')
      .select('*')
      .in('user_id', targetUserIds);

    const prefMap = new Map(prefs?.map(p => [p.user_id, p]) || []);
    const prefKey = type === 'exam_results' ? 'exam_results' :
                    type === 'weekly_report' ? 'weekly_reports' :
                    type === 'announcement' ? 'announcements' :
                    'warnings';

    const results = { sent: 0, failed: 0, skipped: 0 };

    // Process in batches of 10 for performance
    const BATCH_SIZE = 10;
    for (let i = 0; i < targetUserIds.length; i += BATCH_SIZE) {
      const batch = targetUserIds.slice(i, i + BATCH_SIZE);
      const promises = batch.map(async (uid) => {
        const userPref = prefMap.get(uid);
        if (userPref && userPref[prefKey] === false) {
          results.skipped++;
          return;
        }

        const { data: authUser } = await supabase.auth.admin.getUserById(uid);
        if (!authUser?.user?.email) { results.failed++; return; }

        const { data: profile } = await supabase.from('profiles').select('username, display_name').eq('id', uid).maybeSingle();
        const username = profile?.display_name || profile?.username || 'User';

        const emailData = { ...data, username };
        const html = getHtmlForType(type, emailData);

        const { ok, data: resData } = await sendWithRetry(resendKey, {
          from: FROM_EMAIL,
          to: [authUser.user.email],
          subject,
          html,
        });

        await supabase.from('email_logs').insert({
          user_id: uid,
          email_type: type,
          subject,
          recipient_email: authUser.user.email,
          status: ok ? 'sent' : 'failed',
          metadata: { resend_id: resData?.id, ...data },
          error_message: ok ? null : JSON.stringify(resData),
          sent_at: ok ? new Date().toISOString() : null,
        });

        if (ok) results.sent++;
        else results.failed++;
      });

      await Promise.allSettled(promises);
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
