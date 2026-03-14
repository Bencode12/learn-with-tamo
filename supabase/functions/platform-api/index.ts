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

// ====== Auth ======

async function hashKey(key: string): Promise<string> {
  const data = new TextEncoder().encode(key);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
}

async function validateApiKey(apiKey: string, requiredPermission: string): Promise<boolean> {
  const keyHash = await hashKey(apiKey);
  const { data } = await supabase
    .from("api_keys")
    .select("*")
    .eq("key_hash", keyHash)
    .eq("is_active", true)
    .maybeSingle();

  if (!data) return false;
  if (data.expires_at && new Date(data.expires_at) < new Date()) return false;
  if (!data.permissions.includes(requiredPermission) && !data.permissions.includes("all")) return false;

  await supabase.from("api_keys").update({ last_used_at: new Date().toISOString() }).eq("id", data.id);
  return true;
}

// ====== Data fetchers ======

async function getUsers() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000).toISOString();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000).toISOString();

  const [
    { count: totalUsers },
    { count: activeMonth },
    { count: activeWeek },
    { count: premiumUsers },
    { data: roles },
    { data: signups },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }).gte("updated_at", thirtyDaysAgo),
    supabase.from("profiles").select("*", { count: "exact", head: true }).gte("updated_at", sevenDaysAgo),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("is_premium", true),
    supabase.from("user_roles").select("role"),
    supabase.from("profiles").select("id, created_at").gte("created_at", thirtyDaysAgo).order("created_at", { ascending: false }),
  ]);

  const roleCounts: Record<string, number> = {};
  roles?.forEach(r => { roleCounts[r.role] = (roleCounts[r.role] || 0) + 1; });

  const signupsByDay: Record<string, number> = {};
  signups?.forEach(u => {
    const day = u.created_at.split("T")[0];
    signupsByDay[day] = (signupsByDay[day] || 0) + 1;
  });

  return {
    total_users: totalUsers ?? 0,
    active_users_30d: activeMonth ?? 0,
    active_users_7d: activeWeek ?? 0,
    premium_users: premiumUsers ?? 0,
    free_users: (totalUsers ?? 0) - (premiumUsers ?? 0),
    role_breakdown: roleCounts,
    signups_by_day: signupsByDay,
    retention_rate_30d: totalUsers ? Math.round(((activeMonth ?? 0) / totalUsers) * 100) : 0,
  };
}

async function getSubscriptions() {
  const [
    { count: totalPremium },
    { data: tiers },
    { data: recent },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("is_premium", true),
    supabase.from("profiles").select("subscription_tier").eq("is_premium", true),
    supabase.from("profiles").select("id, subscription_tier, premium_expires_at, updated_at")
      .eq("is_premium", true).order("updated_at", { ascending: false }).limit(50),
  ]);

  const tierCounts: Record<string, number> = {};
  tiers?.forEach(p => { tierCounts[p.subscription_tier || "unknown"] = (tierCounts[p.subscription_tier || "unknown"] || 0) + 1; });

  const expiringIn7d = recent?.filter(p => {
    if (!p.premium_expires_at) return false;
    const exp = new Date(p.premium_expires_at);
    const now = new Date();
    return exp > now && exp < new Date(now.getTime() + 7 * 86400000);
  }).length ?? 0;

  return {
    total_subscribers: totalPremium ?? 0,
    tier_breakdown: tierCounts,
    expiring_in_7_days: expiringIn7d,
    recent_subscribers: recent?.slice(0, 10).map(p => ({
      id: p.id, tier: p.subscription_tier, expires_at: p.premium_expires_at,
    })) ?? [],
  };
}

async function getTickets() {
  const [
    { count: total },
    { count: open },
    { count: resolved },
    { data: recent },
    { data: breakdown },
  ] = await Promise.all([
    supabase.from("support_tickets").select("*", { count: "exact", head: true }),
    supabase.from("support_tickets").select("*", { count: "exact", head: true }).eq("status", "open"),
    supabase.from("support_tickets").select("*", { count: "exact", head: true }).eq("status", "resolved"),
    supabase.from("support_tickets").select("id, subject, status, priority, created_at")
      .order("created_at", { ascending: false }).limit(20),
    supabase.from("support_tickets").select("priority, status"),
  ]);

  const byPriority: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  breakdown?.forEach(t => {
    byPriority[t.priority] = (byPriority[t.priority] || 0) + 1;
    byStatus[t.status] = (byStatus[t.status] || 0) + 1;
  });

  return {
    total_tickets: total ?? 0,
    open_tickets: open ?? 0,
    resolved_tickets: resolved ?? 0,
    by_priority: byPriority,
    by_status: byStatus,
    recent_tickets: recent ?? [],
  };
}

async function getAntiCheat() {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000).toISOString();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000).toISOString();

  const [
    { count: total },
    { count: week },
    { count: month },
    { data: recent },
    { data: breakdown },
  ] = await Promise.all([
    supabase.from("anti_cheat_logs").select("*", { count: "exact", head: true }),
    supabase.from("anti_cheat_logs").select("*", { count: "exact", head: true }).gte("created_at", sevenDaysAgo),
    supabase.from("anti_cheat_logs").select("*", { count: "exact", head: true }).gte("created_at", thirtyDaysAgo),
    supabase.from("anti_cheat_logs").select("id, user_id, event_type, game_mode, severity, created_at")
      .order("created_at", { ascending: false }).limit(30),
    supabase.from("anti_cheat_logs").select("severity, event_type"),
  ]);

  const bySeverity: Record<string, number> = {};
  const byEventType: Record<string, number> = {};
  breakdown?.forEach(l => {
    bySeverity[l.severity || "unknown"] = (bySeverity[l.severity || "unknown"] || 0) + 1;
    byEventType[l.event_type] = (byEventType[l.event_type] || 0) + 1;
  });

  return {
    total_flags: total ?? 0,
    flags_7d: week ?? 0,
    flags_30d: month ?? 0,
    unique_flagged_users: new Set(recent?.map(f => f.user_id)).size,
    by_severity: bySeverity,
    by_event_type: byEventType,
    recent_flags: recent?.slice(0, 15) ?? [],
  };
}

async function getRevenue() {
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeKey) return { error: "Stripe not configured" };

  try {
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const [balance, subscriptions, customers] = await Promise.all([
      stripe.balance.retrieve(),
      stripe.subscriptions.list({ status: "active", limit: 100 }),
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

    const charges = await stripe.charges.list({
      limit: 100,
      created: { gte: Math.floor(Date.now() / 1000) - 30 * 86400 },
    });

    const revenueByDay: Record<string, number> = {};
    charges.data.filter(c => c.paid).forEach(c => {
      const day = new Date(c.created * 1000).toISOString().split("T")[0];
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
    };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Unknown Stripe error" };
  }
}

async function getContent() {
  const [
    { count: totalLessons },
    { count: totalExams },
    { data: progress },
    { count: totalCompletions },
  ] = await Promise.all([
    supabase.from("lessons").select("*", { count: "exact", head: true }),
    supabase.from("exams").select("*", { count: "exact", head: true }),
    supabase.from("lesson_progress").select("subject_id, completed, time_spent").eq("completed", true).limit(1000),
    supabase.from("lesson_progress").select("*", { count: "exact", head: true }).eq("completed", true),
  ]);

  const subjectPopularity: Record<string, number> = {};
  let totalTime = 0;
  progress?.forEach(p => {
    subjectPopularity[p.subject_id] = (subjectPopularity[p.subject_id] || 0) + 1;
    totalTime += p.time_spent || 0;
  });

  return {
    total_lessons: totalLessons ?? 0,
    total_exams: totalExams ?? 0,
    total_completions: totalCompletions ?? 0,
    total_study_time_hours: Math.round(totalTime / 3600),
    popular_subjects: Object.entries(subjectPopularity)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([subject, count]) => ({ subject, completions: count })),
  };
}

async function getClasses() {
  const [
    { count: totalClasses },
    { count: activeClasses },
    { count: totalStudentEnrollments },
    { data: recentClasses },
  ] = await Promise.all([
    supabase.from("classes").select("*", { count: "exact", head: true }),
    supabase.from("classes").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("class_students").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("classes").select("id, name, subject, grade_level, is_active, created_at")
      .order("created_at", { ascending: false }).limit(20),
  ]);

  return {
    total_classes: totalClasses ?? 0,
    active_classes: activeClasses ?? 0,
    total_student_enrollments: totalStudentEnrollments ?? 0,
    recent_classes: recentClasses ?? [],
  };
}

async function getEngagement() {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000).toISOString();

  const [
    { count: totalStreaks },
    { data: activeStreaks },
    { count: dailyChallengeCompletions },
    { count: examAttempts },
    { data: recentExams },
  ] = await Promise.all([
    supabase.from("user_streaks").select("*", { count: "exact", head: true }).gt("current_streak", 0),
    supabase.from("user_streaks").select("current_streak, longest_streak").gt("current_streak", 0).order("current_streak", { ascending: false }).limit(50),
    supabase.from("daily_challenge_completions").select("*", { count: "exact", head: true }).gte("completed_at", sevenDaysAgo),
    supabase.from("exam_attempts").select("*", { count: "exact", head: true }).gte("completed_at", sevenDaysAgo),
    supabase.from("exam_attempts").select("score, total_questions, time_taken_seconds").gte("completed_at", sevenDaysAgo).limit(100),
  ]);

  const avgExamScore = recentExams && recentExams.length > 0
    ? Math.round(recentExams.reduce((sum, e) => sum + (e.score / e.total_questions) * 100, 0) / recentExams.length)
    : 0;

  const avgStreakLength = activeStreaks && activeStreaks.length > 0
    ? Math.round(activeStreaks.reduce((sum, s) => sum + s.current_streak, 0) / activeStreaks.length)
    : 0;

  return {
    active_streaks: totalStreaks ?? 0,
    avg_streak_length: avgStreakLength,
    longest_streak: activeStreaks?.[0]?.longest_streak ?? 0,
    daily_challenges_completed_7d: dailyChallengeCompletions ?? 0,
    exam_attempts_7d: examAttempts ?? 0,
    avg_exam_score_7d: avgExamScore,
  };
}

// ====== Permission mapping ======

const ENDPOINT_PERMISSIONS: Record<string, string> = {
  users: "analytics",
  subscriptions: "analytics",
  tickets: "analytics",
  "anti-cheat": "analytics",
  revenue: "revenue",
  content: "analytics",
  classes: "analytics",
  engagement: "analytics",
  overview: "analytics",
};

// ====== Router ======

const ENDPOINTS: Record<string, () => Promise<Record<string, any>>> = {
  users: getUsers,
  subscriptions: getSubscriptions,
  tickets: getTickets,
  "anti-cheat": getAntiCheat,
  revenue: getRevenue,
  content: getContent,
  classes: getClasses,
  engagement: getEngagement,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = req.headers.get("x-api-key");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Missing x-api-key header", code: "UNAUTHORIZED" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    const url = new URL(req.url);
    const path = url.pathname.split("/").pop() || "overview";
    const permission = ENDPOINT_PERMISSIONS[path] || "analytics";

    const isValid = await validateApiKey(apiKey, permission);
    if (!isValid) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired API key", code: "FORBIDDEN" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
      );
    }

    let data: Record<string, any>;

    if (path === "overview" || !ENDPOINTS[path]) {
      const results = await Promise.all(
        Object.entries(ENDPOINTS).map(async ([key, fn]) => [key, await fn()])
      );
      data = Object.fromEntries(results);
    } else {
      data = await ENDPOINTS[path]();
    }

    return new Response(
      JSON.stringify({
        data,
        endpoint: path === "overview" || !ENDPOINTS[path] ? "overview" : path,
        timestamp: new Date().toISOString(),
        version: "1.0",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("[PLATFORM-API] Error:", msg);
    return new Response(
      JSON.stringify({ error: msg, code: "INTERNAL_ERROR" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
