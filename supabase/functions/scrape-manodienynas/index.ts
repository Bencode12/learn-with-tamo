import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
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
  if (!apiKey) return { success: false, error: 'Firecrawl API key not configured' };

  try {
    const body: any = {
      url,
      formats: ['html', 'markdown'],
      onlyMainContent: false,
    };
    if (actions && actions.length > 0) body.actions = actions;

    console.log('[MD] Firecrawl request to:', url, 'actions:', actions?.length || 0);

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
      console.error('[MD] Firecrawl error:', JSON.stringify(data).substring(0, 500));
      return { success: false, error: data.error || `Firecrawl returned ${response.status}` };
    }

    return {
      success: true,
      html: data.data?.html || data.html || '',
      markdown: data.data?.markdown || data.markdown || '',
    };
  } catch (error) {
    console.error('[MD] Firecrawl fetch error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

function cleanText(value: string): string {
  return value.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').replace(/\s+/g, ' ').trim();
}

function cleanSubjectName(raw: string): string {
  let name = raw
    .replace(/\s*\(-?\)\s*/g, ' ')
    .replace(/\s*I?MYP\d*/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  name = name.replace(/\s+I{1,2}$/, '').trim();
  return name;
}

// Strict blocklist: anything that is NOT a real school subject
const BLOCKED_SUBJECTS = new Set([
  'unknown', 'nenurodyta', 'dalykas', 'eil. nr.', 'eil. nr', 'eil.nr.', 'eil.nr',
  'nr.', 'nr', 'eilės numeris',
  'prisijungti', 'registruokis', 'dienos vaizdas', 'naujienos', 'pagalba',
  'atlikti iki', 'terminas', 'liko', 'užduotis', 'užduoties tipas',
  'pažymys', 'įvertinimas', 'vidurkis', 'svertinis vidurkis', 'komentaras',
  'mokytojas', 'data', 'tipas', 'pamoka', 'tema', 'skyrius', 'klasė',
  'grupė', 'mokslo metai', 'spausdinimo versija',
  'gruodis', 'sausis', 'vasaris', 'kovas', 'balandis', 'gegužė',
  'birželis', 'rugsėjis', 'spalis', 'lapkritis', 'gruodžio',
]);

function isLikelySubject(value: string): boolean {
  const text = cleanText(value).toLowerCase();
  if (text.length < 3 || text.length > 120) return false;
  if (BLOCKED_SUBJECTS.has(text)) return false;
  // Must contain letters
  if (!/[a-ząčęėįšųūž]/i.test(text)) return false;
  // Must not be purely numeric
  if (/^\d+$/.test(text)) return false;
  return true;
}

function isNumericGrade(value: string): boolean {
  return /^(10|[1-9])$/.test(value.trim());
}

/**
 * Extract teacher name from a subject cell.
 * ManoDienynas format: "Subject Name (-) CODE  Teacher Firstname Lastname"
 * The teacher name is usually at the end, with Lithuanian names.
 */
function extractTeacher(cellText: string): { subject: string; teacher: string } {
  // The PDF shows format: "Subject (-) IMYP2  TeacherLastname TeacherFirstname"
  // In the table: subject and teacher are in separate cells usually
  // But in markdown they may be merged
  
  // Try to find teacher name pattern at end: "Lastname Firstname" or "Lastname Firstname Middlename"
  // Lithuanian names: capital letter followed by lowercase
  const namePattern = /\s+((?:[A-ZĄČĘĖĮŠŲŪŽ][a-ząčęėįšųūž]+\s+){1,2}[A-ZĄČĘĖĮŠŲŪŽ][a-ząčęėįšųūž]+(?:\s+[A-ZĄČĘĖĮŠŲŪŽ][a-ząčęėįšųūž]+)?)$/;
  
  // Also handle "D. Sudarienė, R. Pranevičienė" format
  const multiTeacherPattern = /\s+([A-ZĄČĘĖĮŠŲŪŽ]\.\s*[A-ZĄČĘĖĮŠŲŪŽ][a-ząčęėįšųūž]+(?:,\s*[A-ZĄČĘĖĮŠŲŪŽ]\.\s*[A-ZĄČĘĖĮŠŲŪŽ][a-ząčęėįšųūž]+)+)$/;
  // Also: "S. Aleknienė, K. Gimpelson"
  const initialsPattern = /\s+([A-ZĄČĘĖĮŠŲŪŽ]\.\s*[A-ZĄČĘĖĮŠŲŪŽ][a-ząčęėįšųūž]+)$/;

  let cleaned = cleanSubjectName(cellText);
  
  const multiMatch = cleaned.match(multiTeacherPattern);
  if (multiMatch) {
    return {
      subject: cleanSubjectName(cleaned.replace(multiTeacherPattern, '')),
      teacher: multiMatch[1].trim(),
    };
  }
  
  const nameMatch = cleaned.match(namePattern);
  if (nameMatch) {
    return {
      subject: cleanSubjectName(cleaned.replace(namePattern, '')),
      teacher: nameMatch[1].trim(),
    };
  }
  
  const initMatch = cleaned.match(initialsPattern);
  if (initMatch) {
    return {
      subject: cleanSubjectName(cleaned.replace(initialsPattern, '')),
      teacher: initMatch[1].trim(),
    };
  }

  return { subject: cleaned, teacher: '' };
}

const FIRST_SEMESTER_MONTHS = ['rugsėjis', 'spalis', 'lapkritis', 'gruodis'];
const SECOND_SEMESTER_MONTHS = ['sausis', 'vasaris', 'kovas', 'balandis', 'gegužė', 'birželis'];

function normalizeHeaderText(value: string): string {
  return cleanText(value)
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()\[\]"]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function detectMonthColumns(cells: string[]): { monthIndexes: number[]; monthByIndex: Record<number, string> } {
  const monthIndexes: number[] = [];
  const monthByIndex: Record<number, string> = {};

  for (let i = 1; i < cells.length; i++) {
    const normalized = normalizeHeaderText(cells[i]);
    if (!normalized) continue;

    const month = [...FIRST_SEMESTER_MONTHS, ...SECOND_SEMESTER_MONTHS].find((m) => normalized.includes(m));
    if (!month) continue;

    monthIndexes.push(i);
    monthByIndex[i] = month;
  }

  return { monthIndexes, monthByIndex };
}

/**
 * Parse the ManoDienynas marks table from markdown.
 * Only the marks table (headed by "Dalykas") is parsed.
 */
function parseGradesFromMarkdown(markdown: string): ManoDienynasGrade[] {
  const grades: ManoDienynasGrade[] = [];
  const lines = markdown.split('\n');

  let currentSubject = '';
  let currentTeacher = '';
  let tableDetected = false;
  let monthIndexes: number[] = [];
  let monthByIndex: Record<number, string> = {};

  for (const line of lines) {
    if (!line.includes('|')) continue;

    const cells = line.split('|').map(c => c.trim()).filter((_, i, arr) => i > 0 && i < arr.length - 1);
    if (cells.length < 2) continue;

    // Skip separator rows (----)
    if (cells.every(c => /^[-:]+$/.test(c) || c === '')) continue;

    const firstCellNormalized = normalizeHeaderText(cells[0]);

    // Detect marks header row and capture real month columns only
    if (firstCellNormalized === 'dalykas') {
      tableDetected = true;
      const monthInfo = detectMonthColumns(cells);
      monthIndexes = monthInfo.monthIndexes;
      monthByIndex = monthInfo.monthByIndex;
      console.log('[MD] Detected month columns:', monthIndexes.map(i => `${i}:${monthByIndex[i]}`).join(', '));
      continue;
    }

    if (!tableDetected) continue;

    const firstCell = cleanText(cells[0]);
    const rowHasSubject = firstCell.length > 0 && !isNumericGrade(firstCell) && !/^[nN]$/.test(firstCell) && !/^įsk$/i.test(firstCell);

    if (rowHasSubject) {
      const { subject, teacher } = extractTeacher(firstCell);

      if (!isLikelySubject(subject)) {
        currentSubject = '';
        currentTeacher = '';
        continue;
      }

      currentSubject = subject;
      currentTeacher = teacher || 'Nenurodyta';
      console.log('[MD] Subject:', currentSubject, '| Teacher:', currentTeacher);
    }

    if (!currentSubject) continue;

    extractGradesFromCells({
      cells,
      subject: currentSubject,
      teacher: currentTeacher,
      monthIndexes,
      monthByIndex,
      rowHasSubject,
      grades,
    });
  }

  console.log('[MD] Total parsed from markdown:', grades.length, 'grades across', new Set(grades.map(g => g.subject)).size, 'subjects');
  return grades;
}

function extractGradesFromCells(params: {
  cells: string[];
  subject: string;
  teacher: string;
  monthIndexes: number[];
  monthByIndex: Record<number, string>;
  rowHasSubject: boolean;
  grades: ManoDienynasGrade[];
}) {
  const { cells, subject, teacher, monthIndexes, monthByIndex, rowHasSubject, grades } = params;

  const fallbackIndexes = cells
    .map((_, index) => index)
    .filter((index) => (rowHasSubject ? index > 0 : true));

  const gradeColumnIndexes = monthIndexes.length > 0 ? monthIndexes : fallbackIndexes;

  for (const columnIndex of gradeColumnIndexes) {
    if (columnIndex < 0 || columnIndex >= cells.length) continue;

    const cell = cells[columnIndex].trim();
    if (!cell) continue;

    // Skip non-grade values
    if (/^[nN]$/.test(cell)) continue;
    if (/^įsk$/i.test(cell)) continue;
    if (/val\.?$/i.test(cell)) continue;
    if (/^\d+\s*val\.?$/i.test(cell)) continue;

    const tokens = cell.split(/[\s,;]+/).map((token) => token.trim()).filter(Boolean);

    for (const token of tokens) {
      if (!isNumericGrade(token)) continue;

      const monthHeader = monthByIndex[columnIndex] || '';
      let semester = getSemester(new Date());
      if (FIRST_SEMESTER_MONTHS.some(m => monthHeader.includes(m))) semester = 'I';
      if (SECOND_SEMESTER_MONTHS.some(m => monthHeader.includes(m))) semester = 'II';

      grades.push({
        subject,
        grade: parseInt(token, 10),
        gradeType: subject.toLowerCase().startsWith('formuojamasis') ? 'Formuojamasis' : 'Įvertinimas',
        date: new Date().toISOString().split('T')[0],
        semester,
        teacher,
      });
    }
  }
}

function normalizeGradeRows(userId: string, grades: ManoDienynasGrade[]) {
  const nowIso = new Date().toISOString();
  const today = new Date().toISOString().split('T')[0];

  return grades
    .map((grade, index) => {
      if (!Number.isFinite(grade.grade) || grade.grade < 1 || grade.grade > 10) return null;
      const subject = grade.subject.substring(0, 120);
      if (!subject || subject.length < 3) return null;

      return {
        user_id: userId,
        source: 'manodienynas' as const,
        subject,
        grade: grade.grade,
        grade_type: (grade.gradeType || 'Įvertinimas').substring(0, 80),
        date: /^\d{4}-\d{2}-\d{2}$/.test(grade.date || '') ? grade.date : today,
        semester: (grade.semester || getSemester(new Date())).substring(0, 10),
        teacher_name: (grade.teacher || 'Nenurodyta').substring(0, 120),
        notes: grade.comment?.trim()?.substring(0, 4000) || null,
        synced_at: nowIso,
      };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null);
}

async function persistGrades(supabase: ReturnType<typeof createClient>, userId: string, grades: ManoDienynasGrade[]) {
  const rows = normalizeGradeRows(userId, grades);
  if (rows.length === 0) throw new Error('No valid grades were parsed to store.');

  console.log('[MD] Persisting', rows.length, 'grades. Subjects:', [...new Set(rows.map(r => r.subject))].join(', '));

  const { error: deleteError } = await supabase
    .from('synced_grades')
    .delete()
    .eq('user_id', userId)
    .eq('source', 'manodienynas');

  if (deleteError) throw new Error(`Failed to clear previous grades: ${deleteError.message}`);

  const { error: insertError } = await supabase
    .from('synced_grades')
    .insert(rows);

  if (insertError) throw new Error(`Failed to save grades: ${insertError.message}`);

  return rows.length;
}

async function loginAndScrapeGrades(username: string, password: string): Promise<{ success: boolean; grades: ManoDienynasGrade[]; error?: string }> {
  const loginUrl = 'https://www.manodienynas.lt/1/lt/public/public/login';

  try {
    console.log('[MD] Login + navigate to grades in single session...');
    const result = await firecrawlScrapeWithActions(loginUrl, [
      { type: 'wait', milliseconds: 2000 },
      { type: 'click', selector: '#dl_username' },
      { type: 'write', text: username },
      { type: 'click', selector: '#dl_password' },
      { type: 'write', text: password },
      { type: 'click', selector: '#login_submit' },
      { type: 'wait', milliseconds: 5000 },
      // Navigate to marks page
      { type: 'click', selector: 'a[href*="marks_pupil/marks"]' },
      { type: 'wait', milliseconds: 4000 },
    ]);

    if (!result.success) {
      return { success: false, grades: [], error: `Login failed: ${result.error}` };
    }

    const html = result.html || '';
    const markdown = result.markdown || '';

    console.log('[MD] HTML length:', html.length, '| Markdown length:', markdown.length);
    console.log('[MD] Markdown first 800 chars:', markdown.substring(0, 800));

    // Check if still on login page
    if (html.includes('dl_username') && html.includes('dienynas_form1') && html.length < 50000) {
      return { success: false, grades: [], error: 'Login failed - invalid credentials' };
    }

    // Parse from markdown (primary)
    let grades = parseGradesFromMarkdown(markdown);
    
    console.log('[MD] Markdown parser found:', grades.length, 'grades');

    // If too few, try a fallback navigation
    if (grades.length < 5) {
      console.log('[MD] Too few grades, trying fallback...');
      const fallback = await firecrawlScrapeWithActions(loginUrl, [
        { type: 'wait', milliseconds: 2000 },
        { type: 'click', selector: '#dl_username' },
        { type: 'write', text: username },
        { type: 'click', selector: '#dl_password' },
        { type: 'write', text: password },
        { type: 'click', selector: '#login_submit' },
        { type: 'wait', milliseconds: 5000 },
        // Try direct URL navigation via address bar approach
        { type: 'click', selector: 'a[href*="marks"]' },
        { type: 'wait', milliseconds: 4000 },
      ]);

      if (fallback.success) {
        console.log('[MD] Fallback markdown length:', fallback.markdown?.length);
        console.log('[MD] Fallback first 800:', fallback.markdown?.substring(0, 800));
        const fallbackGrades = parseGradesFromMarkdown(fallback.markdown || '');
        if (fallbackGrades.length > grades.length) {
          grades = fallbackGrades;
        }
      }
    }

    if (grades.length === 0) {
      return {
        success: false,
        grades: [],
        error: 'No grades found. The marks page may not have loaded correctly.',
      };
    }

    console.log('[MD] Final:', grades.length, 'grades across', new Set(grades.map(g => g.subject)).size, 'subjects');
    return { success: true, grades };
  } catch (error) {
    console.error('[MD] Error:', error);
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
          ? `Found ${result.grades.length} grades across ${new Set(result.grades.map(g => g.subject)).size} subjects.`
          : `${result.error || 'Failed'}`,
        gradesFound: result.grades.length,
        subjects: [...new Set(result.grades.map(g => g.subject))],
        sampleGrades: result.grades.slice(0, 10),
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
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      const persistedCount = await persistGrades(supabase, user.id, result.grades);

      return new Response(JSON.stringify({
        success: true,
        gradesStored: persistedCount,
        subjects: [...new Set(result.grades.map(g => g.subject))],
        lastSync: new Date().toISOString(),
        message: `Successfully synced ${persistedCount} grades from ManoDienynas`,
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    throw new Error('Invalid action. Use "test_login" or "sync"');
  } catch (error) {
    console.error('[MD] Error:', error);
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
