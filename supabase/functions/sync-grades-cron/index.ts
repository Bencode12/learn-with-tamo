import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Background cron job to sync grades for all users with saved credentials
// This function is called by a scheduled cron job

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    if (!supabaseServiceKey) {
      throw new Error('Missing service role key for cron job');
    }

    // Use service role for cron job (no user auth)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('[Cron] Starting scheduled grade sync...');

    // Get all users with saved credentials
    const { data: credentials, error: credError } = await supabase
      .from('user_credentials')
      .select('user_id, service_name, updated_at')
      .in('service_name', ['tamo', 'manodienynas']);

    if (credError) {
      console.error('[Cron] Error fetching credentials:', credError);
      throw new Error('Failed to fetch user credentials');
    }

    if (!credentials || credentials.length === 0) {
      console.log('[Cron] No users with saved credentials found');
      return new Response(JSON.stringify({
        success: true,
        message: 'No users to sync',
        synced: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`[Cron] Found ${credentials.length} credential entries to sync`);

    // Group by user
    const userCredentials: Record<string, string[]> = {};
    credentials.forEach(cred => {
      if (!userCredentials[cred.user_id]) {
        userCredentials[cred.user_id] = [];
      }
      userCredentials[cred.user_id].push(cred.service_name);
    });

    let successCount = 0;
    let failCount = 0;
    const results: Array<{ userId: string; source: string; success: boolean; error?: string }> = [];

    // Process each user's credentials
    for (const [userId, sources] of Object.entries(userCredentials)) {
      for (const source of sources) {
        try {
          console.log(`[Cron] Syncing ${source} for user ${userId.slice(0, 8)}...`);

          // Get the user's auth token by creating a session impersonation
          // Note: For cron jobs, we call the scraper directly with stored credentials
          const { data: storedCreds, error: fetchError } = await supabase
            .from('user_credentials')
            .select('encrypted_data')
            .eq('user_id', userId)
            .eq('service_name', source)
            .single();

          if (fetchError || !storedCreds) {
            throw new Error('Credentials not found');
          }

          // Parse stored credentials
          let decryptedCreds;
          try {
            decryptedCreds = JSON.parse(storedCreds.encrypted_data);
          } catch {
            throw new Error('Invalid credential format');
          }

          // Call the appropriate scraper function using internal URL
          const scraperName = source === 'tamo' ? 'scrape-tamo' : 'scrape-manodienynas';
          const scraperUrl = `${supabaseUrl}/functions/v1/${scraperName}`;

          // Create a mock auth header for the user
          // In production, you'd use proper service-to-service auth
          const response = await fetch(scraperUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${supabaseServiceKey}`,
              'Content-Type': 'application/json',
              'x-cron-user-id': userId, // Custom header to identify the user
            },
            body: JSON.stringify({
              action: 'sync_for_user',
              userId,
              username: decryptedCreds.username,
              password: atob(decryptedCreds.passwordHash),
            }),
          });

          const result = await response.json();

          if (result.success) {
            successCount++;
            results.push({ userId, source, success: true });
            console.log(`[Cron] Successfully synced ${source} for user ${userId.slice(0, 8)}`);
          } else {
            failCount++;
            results.push({ userId, source, success: false, error: result.error });
            console.log(`[Cron] Failed to sync ${source} for user ${userId.slice(0, 8)}: ${result.error}`);
          }

        } catch (error) {
          failCount++;
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          results.push({ userId, source, success: false, error: errorMsg });
          console.error(`[Cron] Error syncing ${source} for user ${userId.slice(0, 8)}:`, error);
        }

        // Add a small delay between syncs to avoid overwhelming the school portals
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log(`[Cron] Sync complete. Success: ${successCount}, Failed: ${failCount}`);

    // Log the sync run
    await supabase
      .from('synced_grades')
      .update({ synced_at: new Date().toISOString() })
      .in('user_id', Object.keys(userCredentials));

    return new Response(JSON.stringify({
      success: true,
      message: `Synced grades for ${successCount} credential entries`,
      synced: successCount,
      failed: failCount,
      totalUsers: Object.keys(userCredentials).length,
      timestamp: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[Cron] Grade sync cron error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ 
      success: false,
      error: errorMessage,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
