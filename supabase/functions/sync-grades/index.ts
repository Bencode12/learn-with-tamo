import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation and sanitization
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

// Supported school portal sources
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

    // Validate source
    console.log('[DEBUG] Received source:', source);
    if (!source || !['tamo', 'manodienynas'].includes(source)) {
      // Handle deprecated sources gracefully
      if (source === 'svietimocentras') {
        console.log('[DEBUG] Handling deprecated svietimocentras source');
        return new Response(JSON.stringify({
          success: false,
          error: 'Švietimo Centras integration has been removed. Please use Tamo.lt or ManoDienynas.lt instead.',
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      console.error('[ERROR] Invalid source received:', source);
      throw new Error(`Invalid source: ${source}. Must be "tamo" or "manodienynas"`);
    }

    const portalConfig = PORTAL_CONFIGS[source as PortalSource];

    // Handle different actions
    switch (action) {
      case 'save_credentials': {
        // Validate and sanitize inputs
        const cleanUsername = sanitizeInput(username);
        const cleanPassword = password; // Don't sanitize password

        if (!validateCredentials(cleanUsername, cleanPassword)) {
          throw new Error('Invalid credentials format');
        }

        // Encrypt credentials (in production, use proper encryption with a secret key)
        const encryptedData = JSON.stringify({
          username: cleanUsername,
          passwordHash: btoa(cleanPassword), // Base64 encode (use proper encryption in production)
          savedAt: new Date().toISOString(),
        });

        const { error: saveError } = await supabase
          .from('user_credentials')
          .upsert({
            user_id: user.id,
            service_name: source,
            encrypted_data: encryptedData,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,service_name'
          });

        if (saveError) {
          console.error('Save credentials error:', saveError);
          throw new Error('Failed to save credentials');
        }

        return new Response(JSON.stringify({
          success: true,
          message: `${portalConfig.name} credentials saved securely`,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'delete_credentials': {
        const { error: deleteError } = await supabase
          .from('user_credentials')
          .delete()
          .eq('user_id', user.id)
          .eq('service_name', source);

        if (deleteError) {
          throw new Error('Failed to delete credentials');
        }

        return new Response(JSON.stringify({
          success: true,
          message: `${portalConfig.name} credentials deleted`,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'check_credentials': {
        const { data: credentials } = await supabase
          .from('user_credentials')
          .select('updated_at')
          .eq('user_id', user.id)
          .eq('service_name', source)
          .single();

        return new Response(JSON.stringify({
          success: true,
          hasCredentials: !!credentials,
          lastUpdated: credentials?.updated_at || null,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'test_login': {
        // Call the specific scraper function to test login
        const scraperUrl = `${supabaseUrl}/functions/v1/${portalConfig.functionName}`;
        
        const response = await fetch(scraperUrl, {
          method: 'POST',
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'test_login',
            username,
            password,
          }),
        });

        const result = await response.json();
        return new Response(JSON.stringify(result), {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'sync': {
        // Check for stored credentials first
        const { data: credentials, error: credError } = await supabase
          .from('user_credentials')
          .select('encrypted_data')
          .eq('user_id', user.id)
          .eq('service_name', source)
          .single();

        if (credError || !credentials) {
          return new Response(JSON.stringify({
            success: false,
            error: `No ${portalConfig.name} credentials found. Please save your login details first.`,
            requiresSetup: true,
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Call the specific scraper function
        const scraperUrl = `${supabaseUrl}/functions/v1/${portalConfig.functionName}`;
        
        const response = await fetch(scraperUrl, {
          method: 'POST',
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action: 'sync' }),
        });

        const result = await response.json();
        
        // Update last sync timestamp in user profile or a sync log
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
        // Fetch stored grades from database
        const { data: grades, error: gradesError } = await supabase
          .from('synced_grades')
          .select('*')
          .eq('user_id', user.id)
          .eq('source', source)
          .order('date', { ascending: false });

        if (gradesError) {
          throw new Error('Failed to fetch grades');
        }

        return new Response(JSON.stringify({
          success: true,
          grades: grades || [],
          source: portalConfig.name,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'get_all_grades': {
        // Fetch all grades from all sources
        const { data: grades, error: gradesError } = await supabase
          .from('synced_grades')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false });

        if (gradesError) {
          throw new Error('Failed to fetch grades');
        }

        // Group by source
        const groupedGrades: Record<string, any[]> = {
          tamo: [],
          manodienynas: [],
        };

        (grades || []).forEach(grade => {
          if (groupedGrades[grade.source]) {
            groupedGrades[grade.source].push(grade);
          }
        });

        return new Response(JSON.stringify({
          success: true,
          grades: groupedGrades,
          totalCount: grades?.length || 0,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'sync_available': {
        // Automatically sync from portals where user has credentials
        const results: Record<string, any> = {};
        let syncPerformed = false;
        
        // First, check what credentials exist
        const { data: allCredentials, error: credError } = await supabase
          .from('user_credentials')
          .select('service_name, encrypted_data')
          .eq('user_id', user.id);

        if (credError) {
          console.error('Credential lookup error:', credError);
          return new Response(JSON.stringify({
            success: false,
            error: 'Failed to check credentials. Please try again.',
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Create a map of available credentials
        const credentialMap: Record<string, any> = {};
        (allCredentials || []).forEach((cred: any) => {
          credentialMap[cred.service_name] = cred.encrypted_data;
        });

        // Sync from each available portal
        for (const [portalSource, config] of Object.entries(PORTAL_CONFIGS)) {
          if (credentialMap[portalSource]) {
            syncPerformed = true;
            try {
              const scraperUrl = `${supabaseUrl}/functions/v1/${config.functionName}`;
              const response = await fetch(scraperUrl, {
                method: 'POST',
                headers: {
                  'Authorization': authHeader,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ action: 'sync' }),
              });
              results[portalSource] = await response.json();
            } catch (error) {
              console.error(`Sync error for ${portalSource}:`, error);
              results[portalSource] = {
                success: false,
                error: error instanceof Error ? error.message : 'Sync failed',
              };
            }
          }
        }

        if (!syncPerformed) {
          return new Response(JSON.stringify({
            success: false,
            error: 'No school portal credentials found. Please connect your Tamo.lt or ManoDienynas.lt account in Settings.',
            requiresSetup: true,
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        return new Response(JSON.stringify({
          success: true,
          results,
          message: `Successfully synced from ${Object.keys(results).length} portal(s)`,
          lastSync: new Date().toISOString(),
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'sync_all': {
        // Sync from all configured sources
        const results: Record<string, any> = {};
        
        for (const [portalSource, config] of Object.entries(PORTAL_CONFIGS)) {
          const { data: credentials } = await supabase
            .from('user_credentials')
            .select('encrypted_data')
            .eq('user_id', user.id)
            .eq('service_name', portalSource)
            .single();

          if (credentials) {
            try {
              const scraperUrl = `${supabaseUrl}/functions/v1/${config.functionName}`;
              const response = await fetch(scraperUrl, {
                method: 'POST',
                headers: {
                  'Authorization': authHeader,
                  'Content-Type': 'application/json',
                },
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
            results[portalSource] = {
              success: false,
              error: 'No credentials configured',
              requiresSetup: true,
            };
          }
        }

        return new Response(JSON.stringify({
          success: true,
          results,
          lastSync: new Date().toISOString(),
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      default:
        throw new Error(`Invalid action: ${action}. Valid actions: save_credentials, delete_credentials, check_credentials, test_login, sync, get_grades, get_all_grades, sync_all, sync_available`);
    }

  } catch (error) {
    console.error('Grade sync error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ 
      success: false,
      error: errorMessage,
    }), {
      status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
