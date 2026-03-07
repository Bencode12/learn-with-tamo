import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const sanitizeInput = (input: string): string => {
  if (!input) return '';
  return input
    .replace(/['";\-\-/*\\]/g, '')
    .replace(/\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|EXEC|EXECUTE)\b/gi, '')
    .trim()
    .substring(0, 255);
};

const validateCredentials = (username: string, password: string): boolean => {
  if (!username || !password) return false;
  if (username.length < 3 || username.length > 100) return false;
  if (password.length < 1 || password.length > 200) return false;
  return true;
};

type PortalSource = 'tamo' | 'manodienynas';

const PORTAL_CONFIGS: Record<PortalSource, { name: string; functionName: string }> = {
  tamo: { name: 'Tamo.lt', functionName: 'scrape-tamo' },
  manodienynas: { name: 'ManoDienynas.lt', functionName: 'scrape-manodienynas' },
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const body = await req.json();
    const { source, action, username, password } = body;

    // Actions that DON'T require a source
    const sourceOptionalActions = ['sync_all', 'sync_available', 'get_all_grades'];

    // Validate source only for actions that require it
    if (!sourceOptionalActions.includes(action)) {
      if (!source || !['tamo', 'manodienynas'].includes(source)) {
        if (source === 'svietimocentras') {
          return new Response(JSON.stringify({
            success: false,
            error: 'Švietimo Centras integration has been removed. Please use Tamo.lt or ManoDienynas.lt instead.',
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        throw new Error(`Invalid source: ${source}. Must be "tamo" or "manodienynas"`);
      }
    }

    const portalConfig = source ? PORTAL_CONFIGS[source as PortalSource] : null;

    switch (action) {
      case 'save_credentials': {
        if (!portalConfig) throw new Error('Source required for save_credentials');
        const cleanUsername = sanitizeInput(username);
        const cleanPassword = password;

        if (!validateCredentials(cleanUsername, cleanPassword)) {
          throw new Error('Invalid credentials format');
        }

        const encryptedData = JSON.stringify({
          username: cleanUsername,
          passwordHash: btoa(cleanPassword),
          savedAt: new Date().toISOString(),
        });

        const { error: saveError } = await supabase
          .from('user_credentials')
          .upsert({
            user_id: user.id,
            service_name: source,
            encrypted_data: encryptedData,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id,service_name' });

        if (saveError) throw new Error('Failed to save credentials');

        return new Response(JSON.stringify({
          success: true,
          message: `${portalConfig.name} credentials saved securely`,
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'delete_credentials': {
        if (!portalConfig) throw new Error('Source required');
        const { error: deleteError } = await supabase
          .from('user_credentials')
          .delete()
          .eq('user_id', user.id)
          .eq('service_name', source);

        if (deleteError) throw new Error('Failed to delete credentials');

        return new Response(JSON.stringify({
          success: true,
          message: `${portalConfig.name} credentials deleted`,
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'check_credentials': {
        if (!portalConfig) throw new Error('Source required');
        const { data: credentials } = await supabase
          .from('user_credentials')
          .select('updated_at')
          .eq('user_id', user.id)
          .eq('service_name', source)
          .maybeSingle();

        return new Response(JSON.stringify({
          success: true,
          hasCredentials: !!credentials,
          lastUpdated: credentials?.updated_at || null,
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'test_login': {
        if (!portalConfig) throw new Error('Source required');
        const scraperUrl = `${supabaseUrl}/functions/v1/${portalConfig.functionName}`;
        const response = await fetch(scraperUrl, {
          method: 'POST',
          headers: { 'Authorization': authHeader, 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'test_login', username, password }),
        });
        const result = await response.json();
        return new Response(JSON.stringify(result), {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'sync': {
        if (!portalConfig) throw new Error('Source required');
        const { data: credentials, error: credError } = await supabase
          .from('user_credentials')
          .select('encrypted_data')
          .eq('user_id', user.id)
          .eq('service_name', source)
          .maybeSingle();

        if (credError || !credentials) {
          return new Response(JSON.stringify({
            success: false,
            error: `No ${portalConfig.name} credentials found. Please save your login details first.`,
            requiresSetup: true,
          }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const scraperUrl = `${supabaseUrl}/functions/v1/${portalConfig.functionName}`;
        const response = await fetch(scraperUrl, {
          method: 'POST',
          headers: { 'Authorization': authHeader, 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'sync' }),
        });
        const result = await response.json();

        if (result.success) {
          await supabase
            .from('synced_grades')
            .update({ synced_at: new Date().toISOString() })
            .eq('user_id', user.id)
            .eq('source', source);
        }

        return new Response(JSON.stringify(result), {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'get_grades': {
        if (!portalConfig) throw new Error('Source required');
        const { data: grades, error: gradesError } = await supabase
          .from('synced_grades')
          .select('*')
          .eq('user_id', user.id)
          .eq('source', source)
          .order('date', { ascending: false });

        if (gradesError) throw new Error('Failed to fetch grades');

        return new Response(JSON.stringify({
          success: true,
          grades: grades || [],
          source: portalConfig.name,
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'get_all_grades': {
        const { data: grades, error: gradesError } = await supabase
          .from('synced_grades')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false });

        if (gradesError) throw new Error('Failed to fetch grades');

        const groupedGrades: Record<string, any[]> = { tamo: [], manodienynas: [] };
        (grades || []).forEach(grade => {
          if (groupedGrades[grade.source]) groupedGrades[grade.source].push(grade);
        });

        return new Response(JSON.stringify({
          success: true,
          grades: groupedGrades,
          totalCount: grades?.length || 0,
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'sync_available': {
        const results: Record<string, any> = {};
        let syncPerformed = false;

        const { data: allCredentials, error: credError } = await supabase
          .from('user_credentials')
          .select('service_name, encrypted_data')
          .eq('user_id', user.id);

        if (credError) {
          return new Response(JSON.stringify({
            success: false,
            error: 'Failed to check credentials.',
          }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const credentialMap: Record<string, any> = {};
        (allCredentials || []).forEach((cred: any) => {
          if (['tamo', 'manodienynas'].includes(cred.service_name)) {
            credentialMap[cred.service_name] = cred.encrypted_data;
          }
        });

        for (const [portalSource, config] of Object.entries(PORTAL_CONFIGS)) {
          if (!credentialMap[portalSource]) continue;

          syncPerformed = true;
          try {
            const scraperUrl = `${supabaseUrl}/functions/v1/${config.functionName}`;
            const response = await fetch(scraperUrl, {
              method: 'POST',
              headers: { 'Authorization': authHeader, 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'sync' }),
            });
            results[portalSource] = await response.json();
          } catch (error) {
            results[portalSource] = {
              success: false,
              error: error instanceof Error ? error.message : 'Sync failed',
            };
          }
        }

        if (!syncPerformed) {
          return new Response(JSON.stringify({
            success: false,
            error: 'No school portal credentials found. Please connect your Tamo.lt or ManoDienynas.lt account in Settings.',
            requiresSetup: true,
          }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const successfulSyncs = Object.values(results).filter((result: any) => result?.success).length;
        const failedSources = Object.entries(results)
          .filter(([, result]: [string, any]) => !result?.success)
          .map(([portalSource]) => portalSource);

        if (successfulSyncs === 0) {
          return new Response(JSON.stringify({
            success: false,
            results,
            error: `Sync failed for all connected portals (${failedSources.join(', ')}).`,
          }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        return new Response(JSON.stringify({
          success: true,
          results,
          warning: failedSources.length > 0 ? `Some portals failed: ${failedSources.join(', ')}` : null,
          message: `Synced ${successfulSyncs} portal(s) successfully`,
          lastSync: new Date().toISOString(),
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'sync_all': {
        const results: Record<string, any> = {};

        for (const [portalSource, config] of Object.entries(PORTAL_CONFIGS)) {
          const { data: credentials } = await supabase
            .from('user_credentials')
            .select('encrypted_data')
            .eq('user_id', user.id)
            .eq('service_name', portalSource)
            .maybeSingle();

          if (credentials) {
            try {
              const scraperUrl = `${supabaseUrl}/functions/v1/${config.functionName}`;
              const response = await fetch(scraperUrl, {
                method: 'POST',
                headers: { 'Authorization': authHeader, 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'sync' }),
              });
              results[portalSource] = await response.json();
            } catch (error) {
              results[portalSource] = {
                success: false,
                error: error instanceof Error ? error.message : 'Sync failed',
              };
            }
          } else {
            results[portalSource] = { success: false, error: 'No credentials configured', requiresSetup: true };
          }
        }

        return new Response(JSON.stringify({
          success: true,
          results,
          lastSync: new Date().toISOString(),
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      default:
        throw new Error(`Invalid action: ${action}. Valid actions: save_credentials, delete_credentials, check_credentials, test_login, sync, get_grades, get_all_grades, sync_all, sync_available`);
    }

  } catch (error) {
    console.error('Grade sync error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});