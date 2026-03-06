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

async function firecrawlScrapeWithActions(
  url: string,
  actions?: any[]
): Promise<{ success: boolean; html?: string; markdown?: string; error?: string }> {
  const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
  if (!apiKey) {
    return { success: false, error: 'Firecrawl API key not configured' };
  }

  try {
    const body: any = {
      url,
      formats: ['html', 'markdown'],
      onlyMainContent: false,
    };
    if (actions && actions.length > 0) {
      body.actions = actions;
    }

    console.log('[ManoDienynas] Firecrawl request to:', url, 'with', actions?.length || 0, 'actions');

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

function cleanText(value: string): string {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

// Clean subject name: remove class codes like "(-) IMYP2", trailing dashes, etc.
function cleanSubjectName(raw: string): string {
  let name = raw
    .replace(/\s*\(-\)\s*/g, ' ')
    .replace(/\s*IMYP\d*/gi, '')
    .replace(/\s*MYP\d*/gi, '')
    .replace(/\s*I\s*MYP\d*/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  // Remove trailing " I" or " II" semester markers
  name = name.replace(/\s+I{1,2}$/, '').trim();
  return name;
}

const blockedSubjectPatterns = [
  /^(unknown|nenurodyta)$/i,
  /^(prisijungti|registruokis|dienos vaizdas|naujienos|pagalba)$/i,
  /^(atlikti iki|terminas|liko|užduotis|užduoties tipas)$/i,
  /^(pažymys|įvertinimas|vidurkis|svertinis vidurkis|komentaras|mokytojas|data|tipas)$/i,
  /^(pamoka|tema|skyrius|klasė|grupė|mokslo metai)$/i,
  /^(dalykas|gruodis|sausis|vasaris|kovas|balandis|gegužė|birželis|rugsėjis|spalis|lapkritis)$/i,
  /^(spausdinimo versija)$/i,
  /^(klasės vadovo veikla)$/i,
  /^(socialinė.pilietinė veikla)$/i,
];

function isLikelySubject(value: string): boolean {
  const text = cleanText(value);
  if (text.length < 3 || text.length > 100) return false;
  if (!/[A-Za-zĄČĘĖĮŠŲŪŽąčęėįšųūž]/.test(text)) return false;
  const cleaned = cleanSubjectName(text);
  if (cleaned.length < 3) return false;
  return !blockedSubjectPatterns.some((pattern) => pattern.test(cleaned));
}

function isNumericGrade(value: string): boolean {
  const trimmed = value.trim();
  return /^(10|[1-9])$/.test(trimmed);
}

/**
 * Parse the ManoDienynas marks table from markdown.
 * The table format from the PDF/page is:
 * | Subject (with teacher on first row) | Month1 grades | Month2 grades | ...
 * Continuation rows have empty first cell and more grades.
 */
function parseGradesFromMarkdown(markdown: string): ManoDienynasGrade[] {
  const grades: ManoDienynasGrade[] = [];
  const lines = markdown.split('\n');
  
  let currentSubject = '';
  let currentTeacher = '';
  let inTable = false;

  for (const line of lines) {
    // Skip non-table lines
    if (!line.includes('|')) {
      inTable = false;
      continue;
    }

    const cells = line.split('|').map(c => c.trim()).filter((_, i, arr) => i > 0 && i < arr.length - 1);
    
    // Skip separator rows
    if (cells.every(c => /^[-:]+$/.test(c) || c === '')) continue;
    
    // Skip header rows
    if (cells.length >= 2 && cells[0] === 'Dalykas') {
      inTable = true;
      continue;
    }

    if (cells.length < 2) continue;
    inTable = true;

    const firstCell = cleanText(cells[0]);
    
    // Determine if this is a new subject row or a continuation row
    if (firstCell.length > 0 && !/^(10|[1-9])$/.test(firstCell) && !/^[nN]$/.test(firstCell) && firstCell !== 'įsk') {
      // This is a subject row - extract subject name and teacher
      // The format is: "Subject Name (-) CODE  Teacher Name"
      // But in markdown it's in one cell
      
      // Try to split subject from teacher name
      // Teacher names typically start with a capital letter and contain first + last name
      const subjectTeacherMatch = firstCell.match(/^(.+?)\s+((?:[A-ZĄČĘĖĮŠŲŪŽ][a-ząčęėįšųūž]+\s+){1,2}[A-ZĄČĘĖĮŠŲŪŽ][a-ząčęėįšųūž]+(?:\s+[A-ZĄČĘĖĮŠŲŪŽ][a-ząčęėįšųūž]+)?)$/);
      
      if (subjectTeacherMatch) {
        currentSubject = cleanSubjectName(subjectTeacherMatch[1]);
        currentTeacher = subjectTeacherMatch[2].trim();
      } else {
        currentSubject = cleanSubjectName(firstCell);
        currentTeacher = 'Nenurodyta';
      }

      if (!isLikelySubject(currentSubject)) {
        currentSubject = '';
        continue;
      }
    }

    if (!currentSubject) continue;

    // Extract grades from all cells (including first cell for continuation rows)
    const gradeCells = firstCell.length === 0 || /^(10|[1-9])$/.test(firstCell) 
      ? cells 
      : cells.slice(1);

    for (const cell of gradeCells) {
      const trimmed = cell.trim();
      // Skip non-grade values: "n", "įsk", "val.", empty, dates, teacher names
      if (!trimmed) continue;
      if (/^[nN]$/.test(trimmed)) continue;
      if (/įsk/i.test(trimmed)) continue;
      if (/val\./i.test(trimmed)) continue;
      if (/^\d+\s*val\.?$/i.test(trimmed)) continue;
      
      // Extract all numeric grades from the cell
      const tokens = trimmed.split(/[\s,;]+/);
      for (const token of tokens) {
        if (isNumericGrade(token)) {
          grades.push({
            subject: currentSubject,
            grade: parseInt(token, 10),
            gradeType: currentSubject.startsWith('Formuojamasis') ? 'Formuojamasis' : 'Įvertinimas',
            date: new Date().toISOString().split('T')[0],
            semester: getSemester(new Date()),
            teacher: currentTeacher,
          });
        }
      }
    }
  }

  console.log('[ManoDienynas] Parsed grades from markdown:', grades.length);
  return grades;
}

/**
 * Parse grades from HTML table rows as fallback
 */
function parseGradesFromHtml(html: string): ManoDienynasGrade[] {
  const grades: ManoDienynasGrade[] = [];
  
  const rowPattern = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let rowMatch: RegExpExecArray | null;
  let currentSubject = '';
  let currentTeacher = '';

  while ((rowMatch = rowPattern.exec(html)) !== null) {
    const rowHtml = rowMatch[1];
    const cellPattern = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;
    const cells: string[] = [];

    let cellMatch: RegExpExecArray | null;
    while ((cellMatch = cellPattern.exec(rowHtml)) !== null) {
      cells.push(cleanText(cellMatch[1]));
    }

    if (cells.length < 2) continue;

    const firstCell = cells[0];
    
    if (firstCell.length > 3 && !isNumericGrade(firstCell) && !/^[nN]$/.test(firstCell)) {
      const cleaned = cleanSubjectName(firstCell);
      if (isLikelySubject(cleaned)) {
        currentSubject = cleaned;
        // Try second cell as teacher
        if (cells.length >= 3 && cells[1].length > 5 && /[A-ZĄČĘĖĮŠŲŪŽ]/.test(cells[1])) {
          currentTeacher = cells[1];
        }
      }
    }

    if (!currentSubject) continue;

    const gradeCells = firstCell.length === 0 || isNumericGrade(firstCell) ? cells : cells.slice(1);

    for (const cell of gradeCells) {
      const trimmed = cell.trim();
      if (!trimmed || /^[nN]$/.test(trimmed) || /įsk/i.test(trimmed) || /val\./i.test(trimmed)) continue;

      const tokens = trimmed.split(/[\s,;]+/);
      for (const token of tokens) {
        if (isNumericGrade(token)) {
          grades.push({
            subject: currentSubject,
            grade: parseInt(token, 10),
            gradeType: currentSubject.startsWith('Formuojamasis') ? 'Formuojamasis' : 'Įvertinimas',
            date: new Date().toISOString().split('T')[0],
            semester: getSemester(new Date()),
            teacher: currentTeacher || 'Nenurodyta',
          });
        }
      }
    }
  }

  console.log('[ManoDienynas] Parsed grades from HTML:', grades.length);
  return grades;
}

function normalizeGradeRows(userId: string, grades: ManoDienynasGrade[]) {
  const nowIso = new Date().toISOString();
  const today = new Date().toISOString().split('T')[0];
  const dedupe = new Set<string>();

  return grades
    .map((grade, index) => {
      const parsedGrade = grade.grade;
      if (!Number.isFinite(parsedGrade) || parsedGrade < 1 || parsedGrade > 10) return null;

      const subject = grade.subject.substring(0, 120);
      if (!subject || subject.length < 3) return null;

      const gradeType = (grade.gradeType || 'Įvertinimas').substring(0, 80);
      const semester = (grade.semester || getSemester(new Date())).substring(0, 10);
      const teacherName = (grade.teacher || 'Nenurodyta').substring(0, 120);
      const date = /^\d{4}-\d{2}-\d{2}$/.test(grade.date || '') ? grade.date : today;

      // Use index in fingerprint to allow multiple same-grade entries for same subject
      const fingerprint = `${subject}|${parsedGrade}|${gradeType}|${teacherName}|${index}`;
      if (dedupe.has(fingerprint)) return null;
      dedupe.add(fingerprint);

      return {
        user_id: userId,
        source: 'manodienynas' as const,
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

async function persistGrades(supabase: ReturnType<typeof createClient>, userId: string, grades: ManoDienynasGrade[]) {
  const rows = normalizeGradeRows(userId, grades);
  if (rows.length === 0) {
    throw new Error('No valid grades were parsed to store.');
  }

  console.log('[ManoDienynas] Persisting', rows.length, 'grade rows. Subjects:', [...new Set(rows.map(r => r.subject))].join(', '));

  const { error: deleteError } = await supabase
    .from('synced_grades')
    .delete()
    .eq('user_id', userId)
    .eq('source', 'manodienynas');

  if (deleteError) {
    throw new Error(`Failed to clear previous ManoDienynas grades: ${deleteError.message}`);
  }

  const { error: insertError } = await supabase
    .from('synced_grades')
    .insert(rows);

  if (insertError) {
    throw new Error(`Failed to save ManoDienynas grades: ${insertError.message}`);
  }

  return rows.length;
}

async function loginAndScrapeGrades(username: string, password: string): Promise<{ success: boolean; grades: ManoDienynasGrade[]; error?: string }> {
  const loginUrl = 'https://www.manodienynas.lt/1/lt/public/public/login';

  try {
    // KEY FIX: Login AND navigate to grades page in ONE action sequence
    // Firecrawl doesn't maintain sessions between separate calls
    console.log('[ManoDienynas] Login + navigate to grades in single session...');
    const result = await firecrawlScrapeWithActions(loginUrl, [
      { type: 'wait', milliseconds: 1500 },
      { type: 'click', selector: '#dl_username' },
      { type: 'write', text: username },
      { type: 'click', selector: '#dl_password' },
      { type: 'write', text: password },
      { type: 'click', selector: '#login_submit' },
      { type: 'wait', milliseconds: 4000 },
      // Navigate to grades page within the same session
      { type: 'click', selector: 'a[href*="marks_pupil/marks"], a[title*="Pažy"]' },
      { type: 'wait', milliseconds: 3000 },
    ]);

    if (!result.success) {
      return { success: false, grades: [], error: `Login failed: ${result.error}` };
    }

    console.log('[ManoDienynas] Result HTML length:', result.html?.length || 0);
    console.log('[ManoDienynas] Result markdown length:', result.markdown?.length || 0);
    console.log('[ManoDienynas] Markdown preview:', result.markdown?.substring(0, 500));

    const html = result.html || '';
    const markdown = result.markdown || '';

    // Check if still on login page
    if (html.includes('dl_username') && html.includes('dienynas_form1') && html.length < 50000) {
      return { success: false, grades: [], error: 'Login failed - invalid credentials' };
    }

    // Try markdown parsing first (most reliable for table data)
    let grades = parseGradesFromMarkdown(markdown);
    
    // Fallback to HTML parsing
    if (grades.length < 3) {
      console.log('[ManoDienynas] Markdown parsing got', grades.length, 'grades, trying HTML...');
      const htmlGrades = parseGradesFromHtml(html);
      if (htmlGrades.length > grades.length) {
        grades = htmlGrades;
      }
    }

    // If we still don't have enough grades, try the direct URL approach as fallback
    if (grades.length < 3) {
      console.log('[ManoDienynas] Few grades found, trying direct navigate action...');
      const fallback = await firecrawlScrapeWithActions(loginUrl, [
        { type: 'wait', milliseconds: 1500 },
        { type: 'click', selector: '#dl_username' },
        { type: 'write', text: username },
        { type: 'click', selector: '#dl_password' },
        { type: 'write', text: password },
        { type: 'click', selector: '#login_submit' },
        { type: 'wait', milliseconds: 4000 },
        // Try clicking through navigation
        { type: 'click', selector: 'a[href*="marks"]' },
        { type: 'wait', milliseconds: 3000 },
      ]);

      if (fallback.success) {
        const fallbackGrades = parseGradesFromMarkdown(fallback.markdown || '');
        if (fallbackGrades.length > grades.length) {
          grades = fallbackGrades;
        }
        const fallbackHtmlGrades = parseGradesFromHtml(fallback.html || '');
        if (fallbackHtmlGrades.length > grades.length) {
          grades = fallbackHtmlGrades;
        }
      }
    }

    if (grades.length === 0) {
      return {
        success: false,
        grades: [],
        error: 'No grades found. Please open ManoDienynas grades page once manually, then try syncing again.',
      };
    }

    console.log('[ManoDienynas] Total grades found:', grades.length, 'across', new Set(grades.map(g => g.subject)).size, 'subjects');
    return { success: true, grades };
  } catch (error) {
    console.error('[ManoDienynas] Login and scrape error:', error);
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
          ? `Login successful! Found ${result.grades.length} grades across ${new Set(result.grades.map(g => g.subject)).size} subjects.`
          : `Login test: ${result.error || 'Failed'}`,
        gradesFound: result.grades.length,
        subjects: [...new Set(result.grades.map(g => g.subject))],
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

      const result = await loginAndScrapeGrades(
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

      const persistedCount = await persistGrades(supabase, user.id, result.grades);

      return new Response(JSON.stringify({
        success: true,
        grades: result.grades,
        gradesStored: persistedCount,
        lastSync: new Date().toISOString(),
        message: `Successfully synced ${persistedCount} grades from ManoDienynas`,
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