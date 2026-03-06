import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TamoGrade {
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

async function firecrawlScrapeWithActions(
  url: string,
  actions?: any[]
): Promise<{ success: boolean; html?: string; markdown?: string; extractedJson?: any; error?: string }> {
  const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
  if (!apiKey) {
    return { success: false, error: 'Firecrawl API key not configured' };
  }

  try {
    const body: any = {
      url,
      formats: ['html', 'markdown'],
    };

    if (actions && actions.length > 0) {
      body.actions = actions;
    }

    console.log('[Tamo] Firecrawl request to:', url, 'with', actions?.length || 0, 'actions');

    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('[Tamo] Firecrawl error:', JSON.stringify(data).substring(0, 500));
      return { success: false, error: data.error || `Firecrawl returned ${response.status}` };
    }

    return {
      success: true,
      html: data.data?.html || data.html || '',
      markdown: data.data?.markdown || data.markdown || '',
      extractedJson: null,
    };
  } catch (error) {
    console.error('[Tamo] Firecrawl fetch error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

function parseGradesFromContent(html: string, markdown: string, extractedJson?: any): TamoGrade[] {
  const grades: TamoGrade[] = [];

  const extractedGrades = Array.isArray(extractedJson?.grades)
    ? extractedJson.grades
    : Array.isArray(extractedJson)
      ? extractedJson
      : [];

  if (extractedGrades.length > 0) {
    for (const item of extractedGrades) {
      const parsedGrade = Number.parseInt(String(item?.grade), 10);
      if (!Number.isFinite(parsedGrade) || parsedGrade < 1 || parsedGrade > 10) continue;

      grades.push({
        subject: String(item?.subject || 'Unknown').trim() || 'Unknown',
        grade: parsedGrade,
        gradeType: String(item?.gradeType || 'Įvertinimas').trim() || 'Įvertinimas',
        date: String(item?.date || new Date().toISOString().split('T')[0]).slice(0, 10),
        semester: String(item?.semester || getSemester(new Date())).trim() || getSemester(new Date()),
        teacher: String(item?.teacher || 'Nenurodyta').trim() || 'Nenurodyta',
        comment: item?.comment ? String(item.comment).trim() : undefined,
      });
    }
  }

  if (grades.length > 0) {
    console.log('[Tamo] Parsed grades from JSON extraction:', grades.length);
    return grades;
  }

  // Try HTML-based parsing with various patterns
  const gradePatterns = [
    /class="[^"]*(?:grade|mark|pazymys|eval|assessment)[^"]*"[^>]*>\s*(\d{1,2})\s*</gi,
    /data-(?:grade|mark|value)="(\d{1,2})"/gi,
    /<td[^>]*class="[^"]*(?:mark|grade|pazymys)[^"]*"[^>]*>\s*(\d{1,2})\s*<\/td>/gi,
    // Generic: any small cell with just a number (common grade table pattern)
    /<td[^>]*>\s*<[^>]*>\s*(\d{1,2})\s*<\/[^>]*>\s*<\/td>/gi,
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

  // Parse from markdown tables
  if (grades.length === 0 && markdown) {
    const lines = markdown.split('\n');
    let currentSubject = '';
    
    for (const line of lines) {
      if (line.includes('|')) {
        const cells = line.split('|').map(c => c.trim()).filter(Boolean);
        // Skip separator rows
        if (cells.every(c => /^[-:]+$/.test(c))) continue;
        
        if (cells.length >= 2) {
          // First cell is likely subject name
          const firstCell = cells[0];
          if (firstCell && !/^\d+$/.test(firstCell) && !firstCell.startsWith('-')) {
            currentSubject = firstCell;
          }
          
          for (let i = 1; i < cells.length; i++) {
            const num = parseInt(cells[i], 10);
            if (!isNaN(num) && num >= 1 && num <= 10) {
              grades.push({
                subject: currentSubject || 'Unknown',
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

  console.log('[Tamo] Parsed grades count:', grades.length);
  return grades;
}

function normalizeGradeRows(userId: string, grades: TamoGrade[]) {
  const today = new Date().toISOString().split('T')[0];
  const nowIso = new Date().toISOString();
  const dedupe = new Set<string>();

  return grades
    .map((grade) => {
      const parsedGrade = Number.parseInt(String(grade.grade), 10);
      if (!Number.isFinite(parsedGrade) || parsedGrade < 1 || parsedGrade > 10) return null;

      const subject = (grade.subject || 'Unknown').trim().substring(0, 120) || 'Unknown';
      const gradeType = (grade.gradeType || 'Įvertinimas').trim().substring(0, 80) || 'Įvertinimas';
      const semester = (grade.semester || getSemester(new Date())).trim().substring(0, 10) || getSemester(new Date());
      const teacherName = (grade.teacher || 'Nenurodyta').trim().substring(0, 120) || 'Nenurodyta';
      const date = /^\d{4}-\d{2}-\d{2}$/.test(grade.date || '') ? grade.date : today;

      const fingerprint = `${subject}|${date}`;
      if (dedupe.has(fingerprint)) return null;
      dedupe.add(fingerprint);

      return {
        user_id: userId,
        source: 'tamo' as const,
        subject,
        grade: parsedGrade,
        grade_type: gradeType,
        date,
        semester,
        teacher_name: teacherName,
        notes: grade.comment?.trim()?.substring(0, 4000) || null,
        synced_at: nowIso,
      };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null);
}

async function persistGrades(supabase: ReturnType<typeof createClient>, userId: string, grades: TamoGrade[]) {
  const rows = normalizeGradeRows(userId, grades);
  if (rows.length === 0) {
    throw new Error('No valid grades were parsed to store.');
  }

  const { error: deleteError } = await supabase
    .from('synced_grades')
    .delete()
    .eq('user_id', userId)
    .eq('source', 'tamo');

  if (deleteError) {
    throw new Error(`Failed to clear previous Tamo grades: ${deleteError.message}`);
  }

  const { error: insertError } = await supabase
    .from('synced_grades')
    .insert(rows);

  if (insertError) {
    throw new Error(`Failed to save Tamo grades: ${insertError.message}`);
  }

  return rows.length;
}

async function loginAndScrapeGrades(username: string, password: string): Promise<{ success: boolean; grades: TamoGrade[]; error?: string }> {
  const loginUrl = 'https://dienynas.tamo.lt/prisijungimas/login';

  try {
    // Step 1: Use Firecrawl actions to fill login form and submit
    console.log('[Tamo] Logging in via Firecrawl actions...');
    const loginResult = await firecrawlScrapeWithActions(loginUrl, [
      { type: 'wait', milliseconds: 2000 },
      { type: 'click', selector: '#UserName' },
      { type: 'write', text: username },
      { type: 'click', selector: '#Password' },
      { type: 'write', text: password },
      { type: 'click', selector: '.c_btn.submit' },
      { type: 'wait', milliseconds: 5000 },
      // After login, we should be on the dashboard or redirected
      { type: 'screenshot' },
    ]);

    if (!loginResult.success) {
      return { success: false, grades: [], error: `Login failed: ${loginResult.error}` };
    }

    console.log('[Tamo] Post-login page HTML length:', loginResult.html?.length || 0);
    console.log('[Tamo] Post-login markdown preview:', loginResult.markdown?.substring(0, 300));

    // Check if still on login page (failed login)
    const html = loginResult.html || '';
    if (html.includes('Įveskite naudotojo vardą') || html.includes('Naudotojo vardas negali')) {
      return { success: false, grades: [], error: 'Login failed - invalid credentials' };
    }

    // Step 2: Navigate to grades page
    console.log('[Tamo] Navigating to grades page...');
    const gradesResult = await firecrawlScrapeWithActions('https://dienynas.tamo.lt/dienynas/pazymiai', [
      { type: 'wait', milliseconds: 3000 },
    ]);

    if (!gradesResult.success) {
      // If grades page fails, try parsing from the post-login page
      console.log('[Tamo] Direct grades page access failed, parsing from post-login page');
      const grades = parseGradesFromContent(html, loginResult.markdown || '', loginResult.extractedJson);
      return { success: grades.length > 0, grades, error: grades.length === 0 ? 'No grades found on page' : undefined };
    }

    // Check if redirected back to login
    const gradesHtml = gradesResult.html || '';
    if (gradesHtml.includes('Įveskite naudotojo vardą')) {
      return { success: false, grades: [], error: 'Session not maintained - try again' };
    }

    const grades = parseGradesFromContent(gradesHtml, gradesResult.markdown || '', gradesResult.extractedJson);
    return { success: true, grades };
  } catch (error) {
    console.error('[Tamo] Login and scrape error:', error);
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
      const result = await loginAndScrapeGrades(username, password);

      return new Response(JSON.stringify({
        success: result.success,
        message: result.success
          ? `Login successful! Found ${result.grades.length} grades.`
          : `Login test: ${result.error || 'Failed'}`,
        gradesFound: result.grades.length,
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (action === 'sync') {
      const { data: credentials, error: credError } = await supabase
        .from('user_credentials')
        .select('encrypted_data')
        .eq('user_id', user.id)
        .eq('service_name', 'tamo')
        .single();

      if (credError || !credentials) {
        return new Response(JSON.stringify({
          success: false,
          error: 'No Tamo credentials found. Please save your login details first.',
          requiresSetup: true,
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      let decryptedCreds;
      try {
        decryptedCreds = JSON.parse(credentials.encrypted_data);
      } catch {
        throw new Error('Failed to parse stored credentials');
      }

      const result = await loginAndScrapeGrades(
        decryptedCreds.username,
        atob(decryptedCreds.passwordHash)
      );

      if (!result.success) {
        return new Response(JSON.stringify({
          success: false,
          error: result.error || 'Failed to sync with Tamo',
          sessionValid: false,
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      const persistedCount = await persistGrades(supabase, user.id, result.grades);

      return new Response(JSON.stringify({
        success: true,
        grades: result.grades,
        gradesStored: persistedCount,
        lastSync: new Date().toISOString(),
        message: `Successfully synced and stored ${persistedCount} grades from Tamo`,
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    throw new Error('Invalid action. Use "test_login" or "sync"');
  } catch (error) {
    console.error('[Tamo] Scraper error:', error);
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
