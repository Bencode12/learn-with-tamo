import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      throw new Error('Username and password required');
    }

    // Tamo login endpoint
    const loginResponse = await fetch('https://www.tamo.lt/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        username,
        password
      })
    });

    if (!loginResponse.ok) {
      throw new Error('Failed to login to Tamo');
    }

    const cookies = loginResponse.headers.get('set-cookie') || '';
    
    // Fetch grades
    const gradesResponse = await fetch('https://www.tamo.lt/Gradebook/Progress', {
      headers: {
        'Cookie': cookies
      }
    });

    const html = await gradesResponse.text();
    
    // Parse HTML to extract grades
    // This is a simplified parser - real implementation would need proper HTML parsing
    const gradeMatches = html.matchAll(/<td class="grade">(\d+)<\/td>/g);
    const grades = Array.from(gradeMatches).map(match => parseInt(match[1]));

    return new Response(JSON.stringify({
      success: true,
      grades,
      lastSync: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Tamo scraper error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ 
      error: errorMessage,
      note: 'This is a mock implementation. Real Tamo API requires proper authentication flow and HTML parsing.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});