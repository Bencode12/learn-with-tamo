import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ManoDienynasGrade {
  subject: string;
  grade: number;
  gradeType: string;
  date: string;
  semester: string;
  teacher: string;
  comment?: string;
}

function getSemester(date: Date): string {
  const month = date.getMonth();
  return month >= 8 || month <= 0 ? 'I' : 'II';
}

// Use Firecrawl to scrape ManoDienynas pages (bypasses Cloudflare)
async function firecrawlScrape(url: string): Promise<{ success: boolean; html?: string; markdown?: string; error?: string }> {
  const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
  if (!apiKey) {
    return { success: false, error: 'Firecrawl API key not configured' };
  }

  try {
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        formats: ['html', 'markdown'],
        waitFor: 3000,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('[ManoDienynas] Firecrawl error:', JSON.stringify(data).substring(0, 500));
      return { success: false, error: data.error || `Firecrawl returned ${response.status}` };
    }

    return {
      success: true,
      html: data.data?.html || data.html || '',
      markdown: data.data?.markdown || data.markdown || '',
    };
  } catch (error) {
    console.error('[ManoDienynas] Firecrawl fetch error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Parse grades from ManoDienynas HTML/markdown
function parseGradesFromContent(html: string, markdown: string): ManoDienynasGrade[] {
  const grades: ManoDienynasGrade[] = [];

  // Try parsing from HTML
  const gradePatterns = [
    /class="[^"]*(?:grade|mark|pazymys|pazymiai)[^"]*"[^>]*>\s*(\d{1,2})\s*</gi,
    /data-(?:grade|mark|value)="(\d{1,2})"/gi,
    /<td[^>]*class="[^"]*(?:mark|grade)[^"]*"[^>]*>\s*(\d{1,2})\s*<\/td>/gi,
  ];

  for (const pattern of gradePatterns) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      const num = parseInt(match[1], 10);
      if (num >= 1 && num <= 10) {
        grades.push({
          subject: 'Unknown',
          grade: num,
          gradeType: 'Įvertinimas',
          date: new Date().toISOString().split('T')[0],
          semester: getSemester(new Date()),
          teacher: 'Nenurodyta',
        });
      }
    }
    if (grades.length > 0) break;
  }

  // Try markdown tables
  if (grades.length === 0 && markdown) {
    const lines = markdown.split('\n');
    for (const line of lines) {
      if (line.includes('|')) {
        const cells = line.split('|').map(c => c.trim()).filter(Boolean);
        if (cells.length >= 2) {
          const subject = cells[0];
          for (let i = 1; i < cells.length; i++) {
            const num = parseInt(cells[i], 10);
            if (!isNaN(num) && num >= 1 && num <= 10) {
              grades.push({
                subject: subject || 'Unknown',
                grade: num,
                gradeType: 'Įvertinimas',
                date: new Date().toISOString().split('T')[0],
                semester: getSemester(new Date()),
                teacher: 'Nenurodyta',
              });
            }
          }
        }
      }
    }
  }

  console.log('[ManoDienynas] Parsed grades count:', grades.length);
  return grades;
}

async function scrapeGrades(username: string, password: string): Promise<{ success: boolean; grades: ManoDienynasGrade[]; error?: string }> {
  const baseUrl = 'https://www.manodienynas.lt';

  try {
    console.log('[ManoDienynas] Using Firecrawl to access login page...');
    const loginPageResult = await firecrawlScrape(`${baseUrl}/1/lt/public/public/login`);

    if (!loginPageResult.success) {
      console.log('[ManoDienynas] Firecrawl could not access login page:', loginPageResult.error);
      return { success: false, grades: [], error: loginPageResult.error };
    }

    console.log('[ManoDienynas] Login page fetched. HTML length:', loginPageResult.html?.length || 0);

    // Try accessing grades page directly
    console.log('[ManoDienynas] Attempting to scrape grades page...');
    const gradesUrls = [
      `${baseUrl}/1/lt/diary/grades`,
      `${baseUrl}/1/lt/page/marks`,
    ];

    for (const url of gradesUrls) {
      const result = await firecrawlScrape(url);
      if (result.success && result.html) {
        console.log('[ManoDienynas] Page HTML length:', result.html.length);

        // Check if redirected to login
        if (result.html.includes('dl_username') || result.html.includes('dienynas_form1')) {
          console.log('[ManoDienynas] Redirected to login - auth required');
          continue;
        }

        const grades = parseGradesFromContent(result.html, result.markdown || '');
        if (grades.length > 0) {
          return { success: true, grades };
        }
      }
    }

    return {
      success: false,
      grades: [],
      error: 'ManoDienynas requires authenticated session. Firecrawl cannot submit login forms. Manual grade entry or API integration needed.',
    };
  } catch (error) {
    console.error('[ManoDienynas] Scrape error:', error);
    return { success: false, grades: [], error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) throw new Error('Missing authorization header');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('Unauthorized');

    const body = await req.json();
    const { action, username, password } = body;

    if (action === 'test_login') {
      if (!username || !password) throw new Error('Username and password required');
      const result = await scrapeGrades(username, password);

      return new Response(JSON.stringify({
        success: result.success,
        message: result.success
          ? 'Connection to ManoDienynas successful'
          : `Connection test: ${result.error || 'Failed'}`,
        note: 'ManoDienynas uses Cloudflare protection. Grade scraping uses Firecrawl to bypass bot detection.',
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (action === 'sync') {
      const { data: credentials, error: credError } = await supabase
        .from('user_credentials')
        .select('encrypted_data')
        .eq('user_id', user.id)
        .eq('service_name', 'manodienynas')
        .single();

      if (credError || !credentials) {
        return new Response(JSON.stringify({
          success: false,
          error: 'No ManoDienynas credentials found. Please save your login details first.',
          requiresSetup: true,
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      let decryptedCreds;
      try {
        decryptedCreds = JSON.parse(credentials.encrypted_data);
      } catch {
        throw new Error('Failed to parse stored credentials');
      }

      const result = await scrapeGrades(
        decryptedCreds.username,
        atob(decryptedCreds.passwordHash)
      );

      if (!result.success) {
        return new Response(JSON.stringify({
          success: false,
          error: result.error || 'Failed to sync with ManoDienynas',
          sessionValid: false,
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      for (const grade of result.grades) {
        await supabase.from('synced_grades').upsert({
          user_id: user.id,
          source: 'manodienynas',
          subject: grade.subject,
          grade: grade.grade,
          grade_type: grade.gradeType,
          date: grade.date,
          semester: grade.semester,
          teacher_name: grade.teacher,
          notes: grade.comment,
          synced_at: new Date().toISOString()
        }, { onConflict: 'user_id,source,subject,date' });
      }

      return new Response(JSON.stringify({
        success: true,
        grades: result.grades,
        lastSync: new Date().toISOString(),
        message: `Successfully synced ${result.grades.length} grades from ManoDienynas`,
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    throw new Error('Invalid action. Use "test_login" or "sync"');
  } catch (error) {
    console.error('[ManoDienynas] Scraper error:', error);
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
