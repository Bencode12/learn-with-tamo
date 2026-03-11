import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  { auth: { persistSession: false } }
);

async function hashKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function validateApiKey(apiKey: string, requiredPermission: string): Promise<boolean> {
  const keyHash = await hashKey(apiKey);
  const { data } = await supabase
    .from('api_keys')
    .select('*')
    .eq('key_hash', keyHash)
    .eq('is_active', true)
    .maybeSingle();

  if (!data) return false;
  if (data.expires_at && new Date(data.expires_at) < new Date()) return false;
  if (!data.permissions.includes(requiredPermission) && !data.permissions.includes('all')) return false;

  await supabase.from('api_keys').update({ last_used_at: new Date().toISOString() }).eq('id', data.id);
  return true;
}

async function getUserAnalytics(): Promise<Record<string, any>> {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { count: totalUsers },
    { count: activeUsersMonth },
    { count: activeUsersWeek },
    { count: premiumUsers },
    { data: roleBreakdown },
    { data: recentSignups },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('updated_at', thirtyDaysAgo),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('updated_at', sevenDaysAgo),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_premium', true),
    supabase.from('user_roles').select('role'),
    supabase.from('profiles').select('id, created_at').gte('created_at', thirtyDaysAgo).order('created_at', { ascending: false }),
  ]);

  const roleCounts: Record<string, number> = {};
  roleBreakdown?.forEach(r => { roleCounts[r.role] = (roleCounts[r.role] || 0) + 1; });

  const signupsByDay: Record<string, number> = {};
  recentSignups?.forEach(u => {
    const day = u.created_at.split('T')[0];
    signupsByDay[day] = (signupsByDay[day] || 0) + 1;
  });

  return {
    total_users: totalUsers,
    active_users_30d: activeUsersMonth,
    active_users_7d: activeUsersWeek,
    premium_users: premiumUsers,
    free_users: (totalUsers || 0) - (premiumUsers || 0),
    role_breakdown: roleCounts,
    signups_by_day: signupsByDay,
    retention_rate_30d: totalUsers ? Math.round(((activeUsersMonth || 0) / totalUsers) * 100) : 0,
  };
}

async function getSubscriptionData(): Promise<Record<string, any>> {
  const [
    { count: totalPremium },
    { data: tierBreakdown },
    { data: recentPremium },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_premium', true),
    supabase.from('profiles').select('subscription_tier').eq('is_premium', true),
    supabase.from('profiles').select('id, subscription_tier, premium_expires_at, updated_at')
      .eq('is_premium', true)
      .order('updated_at', { ascending: false })
      .limit(50),
  ]);

  const tiers: Record<string, number> = {};
  tierBreakdown?.forEach(p => {
    const t = p.subscription_tier || 'unknown';
    tiers[t] = (tiers[t] || 0) + 1;
  });

  const expiringIn7d = recentPremium?.filter(p => {
    if (!p.premium_expires_at) return false;
    const exp = new Date(p.premium_expires_at);
    const now = new Date();
    return exp > now && exp < new Date(now.getTime() + 7 * 86400000);
  }).length || 0;

  return {
    total_subscribers: totalPremium,
    tier_breakdown: tiers,
    expiring_in_7_days: expiringIn7d,
    recent_subscribers: recentPremium?.slice(0, 10).map(p => ({
      id: p.id,
      tier: p.subscription_tier,
      expires_at: p.premium_expires_at,
    })),
  };
}

async function getTicketData(): Promise<Record<string, any>> {
  const [
    { count: totalTickets },
    { count: openTickets },
    { count: resolvedTickets },
    { data: recentTickets },
    { data: priorityBreakdown },
  ] = await Promise.all([
    supabase.from('support_tickets').select('*', { count: 'exact', head: true }),
    supabase.from('support_tickets').select('*', { count: 'exact', head: true }).eq('status', 'open'),
    supabase.from('support_tickets').select('*', { count: 'exact', head: true }).eq('status', 'resolved'),
    supabase.from('support_tickets').select('id, subject, status, priority, created_at')
      .order('created_at', { ascending: false }).limit(20),
    supabase.from('support_tickets').select('priority, status'),
  ]);

  const byPriority: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  priorityBreakdown?.forEach(t => {
    byPriority[t.priority] = (byPriority[t.priority] || 0) + 1;
    byStatus[t.status] = (byStatus[t.status] || 0) + 1;
  });

  return {
    total_tickets: totalTickets,
    open_tickets: openTickets,
    resolved_tickets: resolvedTickets,
    by_priority: byPriority,
    by_status: byStatus,
    recent_tickets: recentTickets,
  };
}

async function getAntiCheatData(): Promise<Record<string, any>> {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000).toISOString();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000).toISOString();

  const [
    { count: totalFlags },
    { count: flagsWeek },
    { count: flagsMonth },
    { data: recentFlags },
    { data: severityBreakdown },
  ] = await Promise.all([
    supabase.from('anti_cheat_logs').select('*', { count: 'exact', head: true }),
    supabase.from('anti_cheat_logs').select('*', { count: 'exact', head: true }).gte('created_at', sevenDaysAgo),
    supabase.from('anti_cheat_logs').select('*', { count: 'exact', head: true }).gte('created_at', thirtyDaysAgo),
    supabase.from('anti_cheat_logs').select('id, user_id, event_type, game_mode, severity, created_at')
      .order('created_at', { ascending: false }).limit(30),
    supabase.from('anti_cheat_logs').select('severity, event_type'),
  ]);

  const bySeverity: Record<string, number> = {};
  const byEventType: Record<string, number> = {};
  severityBreakdown?.forEach(l => {
    bySeverity[l.severity || 'unknown'] = (bySeverity[l.severity || 'unknown'] || 0) + 1;
    byEventType[l.event_type] = (byEventType[l.event_type] || 0) + 1;
  });

  // Unique flagged users
  const uniqueUsers = new Set(recentFlags?.map(f => f.user_id));

  return {
    total_flags: totalFlags,
    flags_7d: flagsWeek,
    flags_30d: flagsMonth,
    unique_flagged_users: uniqueUsers.size,
    by_severity: bySeverity,
    by_event_type: byEventType,
    recent_flags: recentFlags?.slice(0, 15),
  };
}

async function getRevenueData(): Promise<Record<string, any>> {
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeKey) return { error: "Stripe not configured" };

  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

  try {
    const [balance, subscriptions, customers] = await Promise.all([
      stripe.balance.retrieve(),
      stripe.subscriptions.list({ status: 'active', limit: 100 }),
      stripe.customers.list({ limit: 100 }),
    ]);

    let mrr = 0;
    const tierCounts: Record<string, number> = {};
    subscriptions.data.forEach(sub => {
      const amount = sub.items.data[0]?.price?.unit_amount || 0;
      mrr += amount;
      const productId = sub.items.data[0]?.price?.product as string;
      tierCounts[productId] = (tierCounts[productId] || 0) + 1;
    });

    const charges = await stripe.charges.list({ limit: 100, created: { gte: Math.floor(Date.now() / 1000) - 30 * 86400 } });
    const revenueByDay: Record<string, number> = {};
    charges.data.filter(c => c.paid).forEach(c => {
      const day = new Date(c.created * 1000).toISOString().split('T')[0];
      revenueByDay[day] = (revenueByDay[day] || 0) + (c.amount / 100);
    });

    return {
      mrr: mrr / 100,
      arr: (mrr / 100) * 12,
      active_subscriptions: subscriptions.data.length,
      total_customers: customers.data.length,
      tier_breakdown: tierCounts,
      available_balance: balance.available.map(b => ({ amount: b.amount / 100, currency: b.currency })),
      pending_balance: balance.pending.map(b => ({ amount: b.amount / 100, currency: b.currency })),
      revenue_by_day_30d: revenueByDay,
      churn_rate: null,
    };
  } catch (e) {
    return { error: e.message };
  }
}

async function getContentMetrics(): Promise<Record<string, any>> {
  const [
    { count: totalLessons },
    { count: totalExams },
    { data: recentProgress },
    { count: totalCompletions },
  ] = await Promise.all([
    supabase.from('lessons').select('*', { count: 'exact', head: true }),
    supabase.from('exams').select('*', { count: 'exact', head: true }),
    supabase.from('lesson_progress').select('subject_id, completed, time_spent').eq('completed', true).limit(1000),
    supabase.from('lesson_progress').select('*', { count: 'exact', head: true }).eq('completed', true),
  ]);

  const subjectPopularity: Record<string, number> = {};
  let totalTime = 0;
  recentProgress?.forEach(p => {
    subjectPopularity[p.subject_id] = (subjectPopularity[p.subject_id] || 0) + 1;
    totalTime += p.time_spent || 0;
  });

  return {
    total_lessons: totalLessons,
    total_exams: totalExams,
    total_completions: totalCompletions,
    total_study_time_hours: Math.round(totalTime / 3600),
    popular_subjects: Object.entries(subjectPopularity)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([subject, count]) => ({ subject, completions: count })),
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = req.headers.get("x-api-key");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing x-api-key header" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const url = new URL(req.url);
    const path = url.pathname.split('/').pop() || '';

    let permission = 'analytics';
    if (path === 'revenue') permission = 'revenue';
    if (path === 'subscriptions') permission = 'analytics';
    if (path === 'tickets') permission = 'analytics';
    if (path === 'anti-cheat') permission = 'analytics';

    const isValid = await validateApiKey(apiKey, permission);
    if (!isValid) {
      return new Response(JSON.stringify({ error: "Invalid or expired API key" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    let data: Record<string, any>;
    switch (path) {
      case 'users':
        data = await getUserAnalytics();
        break;
      case 'subscriptions':
        data = await getSubscriptionData();
        break;
      case 'tickets':
        data = await getTicketData();
        break;
      case 'anti-cheat':
        data = await getAntiCheatData();
        break;
      case 'revenue':
        data = await getRevenueData();
        break;
      case 'content':
        data = await getContentMetrics();
        break;
      case 'overview':
      default:
        const [users, subscriptions, tickets, antiCheat, revenue, content] = await Promise.all([
          getUserAnalytics(),
          getSubscriptionData(),
          getTicketData(),
          getAntiCheatData(),
          getRevenueData(),
          getContentMetrics(),
        ]);
        data = { users, subscriptions, tickets, anti_cheat: antiCheat, revenue, content, timestamp: new Date().toISOString() };
        break;
    }

    return new Response(JSON.stringify({ data, timestamp: new Date().toISOString() }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[PLATFORM-API] Error:', msg);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
