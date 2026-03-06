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
): Promise<{ success: boolean; html?: string; markdown?: string; extractedJson?: any; error?: string }> {
  const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
  if (!apiKey) {
    return { success: false, error: 'Firecrawl API key not configured' };
  }

  try {
    const body: any = {
      url,
      formats: ['html', 'markdown', 'json'],
      onlyMainContent: false,
      jsonOptions: {
        prompt: 'Extract ONLY real school grade rows for the logged-in student. Return JSON object with key "grades" as array of items: subject, grade (1-10), gradeType, date (YYYY-MM-DD if available), teacher, comment. Ignore menu items, navigation labels, page numbers, IDs, and unrelated numeric values.'
      },
      proxy: 'auto',
      storeInCache: false,
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
      extractedJson: data.data?.json || data.json || null,
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

const blockedSubjectPatterns = [
  /^(unknown|nenurodyta)$/i,
  /^(prisijungti|registruokis|dienos vaizdas|naujienos|pagalba)$/i,
  /^(atlikti iki|terminas|liko|užduotis|užduoties tipas)$/i,
  /^(pažymys|įvertinimas|vidurkis|svertinis vidurkis|komentaras|mokytojas|data|tipas)$/i,
  /^(pamoka|tema|skyrius|klasė|grupė|mokslo metai)$/i,
];

function isLikelySubject(value: string): boolean {
  const text = cleanText(value);
  if (text.length < 3 || text.length > 80) return false;
  if (!/[A-Za-zĄČĘĖĮŠŲŪŽąčęėįšųūž]/.test(text)) return false;
  if (/\b\d{2,}\b/.test(text)) return false;
  return !blockedSubjectPatterns.some((pattern) => pattern.test(text));
}

function extractGradeTokens(value: string): number[] {
  const tokens = cleanText(value)
    .split(/[\s|;/]+/)
    .map((token) => token.replace(/[()\[\]{}]/g, '').trim())
    .filter(Boolean);

  const grades: number[] = [];
  for (const token of tokens) {
    const normalized = token.replace(',', '.');

    const isWholeGrade = /^(10|[1-9])(?:[+-])?$/.test(normalized);
    const isDecimalZeroGrade = /^(10|[1-9])\.0+$/.test(normalized);
    if (!isWholeGrade && !isDecimalZeroGrade) continue;

    const parsed = Number.parseInt(normalized, 10);
    if (Number.isFinite(parsed) && parsed >= 1 && parsed <= 10) {
      grades.push(parsed);
    }
  }

  return grades;
}

function createGrade(subject: string, gradeValue: number, date?: string): ManoDienynasGrade {
  return {
    subject,
    grade: gradeValue,
    gradeType: 'Įvertinimas',
    date: /^\d{4}-\d{2}-\d{2}$/.test(date || '') ? (date as string) : new Date().toISOString().split('T')[0],
    semester: getSemester(new Date()),
    teacher: 'Nenurodyta',
  };
}

function parseGradesFromContent(html: string, markdown: string, extractedJson?: any): ManoDienynasGrade[] {
  const grades: ManoDienynasGrade[] = [];

  const extractedGrades = Array.isArray(extractedJson?.grades)
    ? extractedJson.grades
    : Array.isArray(extractedJson)
      ? extractedJson
      : [];

  if (extractedGrades.length > 0) {
    for (const item of extractedGrades) {
      const subject = cleanText(String(item?.subject || ''));
      const parsedGrade = extractGradeTokens(String(item?.grade ?? ''))[0];
      if (!Number.isFinite(parsedGrade) || parsedGrade < 1 || parsedGrade > 10) continue;
      if (!isLikelySubject(subject)) continue;

      grades.push({
        subject,
        grade: parsedGrade,
        gradeType: String(item?.gradeType || 'Įvertinimas').trim() || 'Įvertinimas',
        date: String(item?.date || new Date().toISOString().split('T')[0]).slice(0, 10),
        semester: String(item?.semester || getSemester(new Date())).trim() || getSemester(new Date()),
        teacher: String(item?.teacher || 'Nenurodyta').trim() || 'Nenurodyta',
        comment: item?.comment ? String(item.comment).trim() : undefined,
      });
    }
  }

  if (markdown) {
    const lines = markdown.split('\n');
    for (const line of lines) {
      if (!line.includes('|')) continue;

      const cells = line.split('|').map((c) => cleanText(c)).filter(Boolean);
      if (cells.length < 2) continue;
      if (cells.every((c) => /^[-:]+$/.test(c))) continue;

      const subject = cells[0];
      if (!isLikelySubject(subject)) continue;

      for (const cell of cells.slice(1)) {
        const marks = extractGradeTokens(cell);
        for (const mark of marks) {
          grades.push(createGrade(subject, mark));
        }
      }
    }

    const plainLinePattern = /(?:^|\n)\s*([A-Za-zĄČĘĖĮŠŲŪŽąčęėįšųūž][^\n:|]{2,80})[:\-\s]+((?:10|[1-9])(?:[,\s;]+(?:10|[1-9]))*)/g;
    let plainMatch: RegExpExecArray | null;
    while ((plainMatch = plainLinePattern.exec(markdown)) !== null) {
      const subject = cleanText(plainMatch[1]);
      if (!isLikelySubject(subject)) continue;

      const marks = extractGradeTokens(plainMatch[2]);
      for (const mark of marks) {
        grades.push(createGrade(subject, mark));
      }
    }
  }

  const rowPattern = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let rowMatch: RegExpExecArray | null;
  while ((rowMatch = rowPattern.exec(html)) !== null) {
    const rowHtml = rowMatch[1];
    const cellPattern = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;
    const cells: string[] = [];

    let cellMatch: RegExpExecArray | null;
    while ((cellMatch = cellPattern.exec(rowHtml)) !== null) {
      cells.push(cleanText(cellMatch[1]));
    }

    if (cells.length < 2) continue;
    const subject = cells[0];
    if (!isLikelySubject(subject)) continue;

    for (const cell of cells.slice(1)) {
      const marks = extractGradeTokens(cell);
      for (const mark of marks) {
        grades.push(createGrade(subject, mark));
      }
    }
  }

  const seen = new Set<string>();
  const cleaned = grades.filter((grade) => {
    const key = [
      grade.subject,
      grade.grade,
      grade.gradeType,
      grade.date,
      grade.teacher,
      grade.comment || '',
    ].join('|');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  console.log('[ManoDienynas] Parsed grades count:', cleaned.length);
  return cleaned;
}

function normalizeGradeRows(userId: string, grades: ManoDienynasGrade[]) {
  const today = new Date().toISOString().split('T')[0];
  const nowIso = new Date().toISOString();
  const dedupe = new Set<string>();

  return grades
    .map((grade) => {
      const parsedGrade = Number.parseInt(String(grade.grade), 10);
      if (!Number.isFinite(parsedGrade) || parsedGrade < 1 || parsedGrade > 10) return null;

      const subject = cleanText((grade.subject || 'Unknown')).substring(0, 120) || 'Unknown';
      if (!isLikelySubject(subject)) return null;

      const gradeType = (grade.gradeType || 'Įvertinimas').trim().substring(0, 80) || 'Įvertinimas';
      const semester = (grade.semester || getSemester(new Date())).trim().substring(0, 10) || getSemester(new Date());
      const teacherName = (grade.teacher || 'Nenurodyta').trim().substring(0, 120) || 'Nenurodyta';
      const date = /^\d{4}-\d{2}-\d{2}$/.test(grade.date || '') ? grade.date : today;
      const notes = grade.comment?.trim()?.substring(0, 4000) || null;

      const fingerprint = `${subject}|${parsedGrade}|${gradeType}|${date}|${teacherName}|${notes || ''}`;
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
        notes,
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

function getGradeQualityScore(grades: ManoDienynasGrade[]): number {
  const uniqueSubjects = new Set(grades.map((g) => g.subject)).size;
  const completeRows = grades.filter((g) => isLikelySubject(g.subject) && Number.isFinite(g.grade)).length;
  return completeRows * 10 + uniqueSubjects * 5 + grades.length;
}

async function loginAndScrapeGrades(username: string, password: string): Promise<{ success: boolean; grades: ManoDienynasGrade[]; error?: string }> {
  const loginUrl = 'https://www.manodienynas.lt/1/lt/public/public/login';

  try {
    // ManoDienynas login form: email input #dl_username, password #dl_password, submit #login_submit
    console.log('[ManoDienynas] Logging in via Firecrawl actions...');
    const loginResult = await firecrawlScrapeWithActions(loginUrl, [
      { type: 'wait', milliseconds: 1500 },
      { type: 'click', selector: '#dl_username' },
      { type: 'write', text: username },
      { type: 'click', selector: '#dl_password' },
      { type: 'write', text: password },
      { type: 'click', selector: '#login_submit' },
      { type: 'wait', milliseconds: 3500 },
    ]);

    if (!loginResult.success) {
      return { success: false, grades: [], error: `Login failed: ${loginResult.error}` };
    }

    console.log('[ManoDienynas] Post-login HTML length:', loginResult.html?.length || 0);
    console.log('[ManoDienynas] Post-login markdown preview:', loginResult.markdown?.substring(0, 300));

    const html = loginResult.html || '';
    // Check if still on login page
    if (html.includes('dl_username') && html.includes('dienynas_form1')) {
      return { success: false, grades: [], error: 'Login failed - invalid credentials' };
    }

    const candidates: ManoDienynasGrade[][] = [];

    const loginPageGrades = parseGradesFromContent(html, loginResult.markdown || '', loginResult.extractedJson);
    if (loginPageGrades.length > 0) {
      candidates.push(loginPageGrades);
    }

    console.log('[ManoDienynas] Navigating to grades page...');
    const gradesUrls = [
      'https://www.manodienynas.lt/1/lt/diary/grades',
      'https://www.manodienynas.lt/1/lt/page/marks',
      'https://www.manodienynas.lt/1/lt/page/marks_pupil/marks',
    ];

    for (const url of gradesUrls) {
      const gradesResult = await firecrawlScrapeWithActions(url, [
        { type: 'wait', milliseconds: 3000 },
      ]);

      if (!gradesResult.success) continue;

      const gradesHtml = gradesResult.html || '';
      if (gradesHtml.includes('dl_username')) continue;

      const grades = parseGradesFromContent(gradesHtml, gradesResult.markdown || '', gradesResult.extractedJson);
      if (grades.length > 0) {
        candidates.push(grades);
      }
    }

    const bestCandidate = candidates
      .sort((a, b) => getGradeQualityScore(b) - getGradeQualityScore(a))[0] || [];

    if (bestCandidate.length < 2 || getGradeQualityScore(bestCandidate) < 20) {
      return {
        success: false,
        grades: [],
        error: 'Could not reliably extract your grade list yet. Please try sync again after opening grades once in ManoDienynas.',
      };
    }

    return { success: true, grades: bestCandidate };
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
        message: `Successfully synced and stored ${persistedCount} grades from ManoDienynas`,
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
