import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encode as hexEncode, decode as hexDecode } from "https://deno.land/std@0.168.0/encoding/hex.ts";

const _te = new TextEncoder();
const _td = new TextDecoder();

async function decryptPassword(stored: string): Promise<string> {
  if (!stored.startsWith('aes:')) return atob(stored);
  const [, ivHex, ctHex] = stored.split(':');
  const keyHex = Deno.env.get('CREDENTIAL_ENCRYPTION_KEY') || '';
  const keyMaterial = await crypto.subtle.digest('SHA-256', _te.encode(keyHex));
  const key = await crypto.subtle.importKey('raw', keyMaterial, 'AES-GCM', false, ['decrypt']);
  const iv = hexDecode(_te.encode(ivHex));
  const ct = hexDecode(_te.encode(ctHex));
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
  return _td.decode(decrypted);
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
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

function getSemesterFromMonth(monthNum: number): string {
  return (monthNum >= 9 && monthNum <= 12) || monthNum === 1 ? 'I' : 'II';
}

function isInvalidTamoLogin(content: string): boolean {
  const normalized = content.toLowerCase();
  return normalized.includes('neteisingas prisijungimo vardas') || 
         normalized.includes('neteisingas slaptažodis') ||
         normalized.includes('incorrect username') ||
         normalized.includes('incorrect password');
}

async function firecrawlScrape(
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
      waitFor: 6000,
      timeout: 120000,
    };
    if (actions?.length) body.actions = actions;

    console.log('[Tamo] Firecrawl scrape:', url, 'actions:', actions?.length || 0);

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

      // Retry on timeout
      if (data?.code === 'SCRAPE_TIMEOUT') {
        console.log('[Tamo] Timeout, retrying with extended timeout...');
        const retryBody = { ...body, waitFor: 12000, timeout: 180000 };
        const retry = await fetch('https://api.firecrawl.dev/v1/scrape', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(retryBody),
        });
        const retryData = await retry.json();
        if (retry.ok) {
          return {
            success: true,
            html: retryData.data?.html || retryData.html || '',
            markdown: retryData.data?.markdown || retryData.markdown || '',
          };
        }
        return { success: false, error: retryData.error || 'Retry failed' };
      }
      return { success: false, error: data.error || `Status ${response.status}` };
    }

    return {
      success: true,
      html: data.data?.html || data.html || '',
      markdown: data.data?.markdown || data.markdown || '',
    };
  } catch (error) {
    console.error('[Tamo] Fetch error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// ====== Grade parsing ======

const BLOCKED_SUBJECTS = new Set([
  'dalykas', 'pažymys', 'vidurkis', 'komentaras', 'mokytojas', 'data', 'tipas',
  'nėra duomenų', 'pusmečio vidurkis', 'metinis vidurkis', 'pamoka', 'tema',
  'klasė', 'grupė', 'mokslo metai',
]);

const MONTH_TO_NUMBER: Record<string, number> = {
  'rugsėjis': 9, 'spalis': 10, 'lapkritis': 11, 'gruodis': 12,
  'sausis': 1, 'vasaris': 2, 'kovas': 3, 'balandis': 4, 'gegužė': 5, 'birželis': 6,
};

const MONTH_PATTERNS: [RegExp, string][] = [
  [/rugs[eė]j/i, 'rugsėjis'], [/spal/i, 'spalis'], [/lapkrit/i, 'lapkritis'],
  [/gruod/i, 'gruodis'], [/saus/i, 'sausis'], [/vasar/i, 'vasaris'],
  [/kov[ao]/i, 'kovas'], [/baland/i, 'balandis'], [/gegu[zž]/i, 'gegužė'],
  [/bir[zž]el/i, 'birželis'],
];

function findMonth(text: string): string | null {
  const clean = text.toLowerCase().replace(/[^a-ząčęėįšųūž]/g, '');
  for (const [pattern, month] of MONTH_PATTERNS) {
    if (pattern.test(clean)) return month;
  }
  return null;
}

function getSchoolYear(): { startYear: number; endYear: number } {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  if (month >= 9) return { startYear: year, endYear: year + 1 };
  return { startYear: year - 1, endYear: year };
}

function resolveSchoolYearForMonth(month: number): number {
  const { startYear, endYear } = getSchoolYear();
  return month >= 9 ? startYear : endYear;
}

function cleanText(value: string): string {
  return value.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').replace(/\s+/g, ' ').trim();
}

function cleanSubjectName(raw: string): string {
  return raw
    .replace(/\s*\(-[^)]*\)?\s*/g, ' ')
    .replace(/\s*\([^)]*$/, '')
    .replace(/\s*I?MYP\d*/gi, '')
    .replace(/\.\.\.$/, '')
    .replace(/\s+/g, ' ')
    .replace(/\s+I{1,2}$/, '')
    .trim();
}

function isLikelySubject(value: string): boolean {
  const text = cleanText(value).toLowerCase();
  if (text.length < 3 || text.length > 120) return false;
  if (BLOCKED_SUBJECTS.has(text)) return false;
  if (!/[a-ząčęėįšųūž]/i.test(text)) return false;
  if (/^\d+$/.test(text)) return false;
  return true;
}

function extractDateFromText(text: string, fallbackMonthName?: string): string | null {
  if (!text) return null;

  // ISO date: 2024-09-15
  const isoMatch = text.match(/(?:^|\D)(20\d{2})[.\/-](\d{1,2})[.\/-](\d{1,2})(?!\d)/);
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  // LT date: 15.09.2024
  const ltMatch = text.match(/(?:^|\D)(\d{1,2})[.\/-](\d{1,2})[.\/-](20\d{2})(?!\d)/);
  if (ltMatch) {
    const [, d, m, y] = ltMatch;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  // "8 d." with month context
  if (fallbackMonthName) {
    const monthNum = MONTH_TO_NUMBER[fallbackMonthName];
    if (monthNum) {
      const dayMatch = text.match(/(?:^|\D)(\d{1,2})\s*(?:d\.?|dien\.?)(?:\D|$)/i);
      if (dayMatch) {
        const day = Number(dayMatch[1]);
        if (day >= 1 && day <= 31) {
          const year = resolveSchoolYearForMonth(monthNum);
          return `${year}-${String(monthNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        }
      }
    }
  }

  return null;
}

function extractGradesFromCell(cellValue: string, maxGrade: number): number[] {
  const cleaned = cellValue
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/https?:\/\/[^\s"'<>]+/gi, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned) return [];

  return [...cleaned.matchAll(/\b(10|[1-9])\b/g)]
    .map(m => Number(m[1]))
    .filter(g => g >= 1 && g <= maxGrade);
}

function parseGradesFromContent(_html: string, markdown: string): TamoGrade[] {
  const grades: TamoGrade[] = [];
  if (!markdown) return [];

  const isMYP = /\bI?MYP\d?\b/i.test(markdown);
  const maxGrade = isMYP ? 7 : 10;

  const lines = markdown.split('\n');
  let inGradeTable = false;
  let currentSubject = '';
  let monthByIndex: Record<number, string> = {};
  let monthIndexes: number[] = [];

  for (const line of lines) {
    if (!line.includes('|')) continue;

    const cells = line.split('|').map(c => c.trim()).filter((_, i, arr) => i > 0 && i < arr.length - 1);
    if (cells.length < 2) continue;
    if (cells.every(c => /^[-:]+$/.test(c) || c === '')) continue;

    const firstCellNormalized = cells[0].toLowerCase().replace(/\s+/g, ' ').trim();

    // Detect table header with months
    if (firstCellNormalized === 'dalykas' || firstCellNormalized.includes('mokomasis dalykas')) {
      const newMonthByIndex: Record<number, string> = {};
      const newMonthIndexes: number[] = [];
      
      for (let i = 1; i < cells.length; i++) {
        const month = findMonth(cells[i]);
        if (month) {
          newMonthByIndex[i] = month;
          newMonthIndexes.push(i);
        }
      }

      if (newMonthIndexes.length > 0) {
        inGradeTable = true;
        monthByIndex = newMonthByIndex;
        monthIndexes = newMonthIndexes;
        console.log('[Tamo] Grade table found. Month cols:', newMonthIndexes.map(i => `${i}:${newMonthByIndex[i]}`).join(', '));
      }
      continue;
    }

    if (!inGradeTable) continue;

    // Subject detection
    if (cells[0]) {
      const maybeSubject = cleanSubjectName(cleanText(cells[0]));
      if (isLikelySubject(maybeSubject)) {
        currentSubject = maybeSubject.substring(0, 120);
      }
    }

    if (!currentSubject) continue;

    // Extract grades from month columns
    for (const colIdx of monthIndexes) {
      if (colIdx >= cells.length) continue;
      const cell = cells[colIdx];
      if (!cell || /^[-–—]+$/.test(cell) || /^\d+[.,]\d+$/.test(cell)) continue;

      const monthName = monthByIndex[colIdx];
      const gradeValues = extractGradesFromCell(cell, maxGrade);

      for (const gradeVal of gradeValues) {
        const date = extractDateFromText(cell, monthName);
        // If no date found, use mid-month fallback
        let finalDate = date;
        if (!finalDate && monthName) {
          const monthNum = MONTH_TO_NUMBER[monthName];
          if (monthNum) {
            const year = resolveSchoolYearForMonth(monthNum);
            finalDate = `${year}-${String(monthNum).padStart(2, '0')}-15`;
          }
        }
        if (!finalDate) finalDate = new Date().toISOString().split('T')[0];

        const parsedDate = new Date(finalDate);
        const monthNum = parsedDate.getMonth() + 1;

        grades.push({
          subject: currentSubject,
          grade: gradeVal,
          gradeType: 'Įvertinimas',
          date: finalDate,
          semester: getSemesterFromMonth(monthNum),
          teacher: 'Nenurodyta',
        });
      }
    }
  }

  // Fallback: simple row-based parsing if no month-column table found
  if (grades.length === 0) {
    let subj = '';
    for (const line of lines) {
      if (!line.includes('|')) continue;
      const cells = line.split('|').map(c => c.trim()).filter((_, i, arr) => i > 0 && i < arr.length - 1);
      if (cells.length < 2) continue;
      if (cells.every(c => /^[-:]+$/.test(c) || c === '')) continue;

      const first = cleanText(cells[0]);
      if (isLikelySubject(cleanSubjectName(first))) {
        subj = cleanSubjectName(first).substring(0, 120);
      }
      if (!subj) continue;

      for (let i = 1; i < cells.length; i++) {
        const vals = extractGradesFromCell(cells[i], maxGrade);
        for (const v of vals) {
          grades.push({
            subject: subj,
            grade: v,
            gradeType: 'Įvertinimas',
            date: new Date().toISOString().split('T')[0],
            semester: getSemester(new Date()),
            teacher: 'Nenurodyta',
          });
        }
      }
    }
  }

  console.log('[Tamo] Parsed grades count:', grades.length, '| Subjects:', [...new Set(grades.map(g => g.subject))].join(', '));
  return grades;
}

function normalizeGradeRows(userId: string, grades: TamoGrade[]) {
  const today = new Date().toISOString().split('T')[0];
  const nowIso = new Date().toISOString();
  const dedupe = new Set<string>();

  return grades
    .map(grade => {
      const parsedGrade = Number.parseInt(String(grade.grade), 10);
      if (!Number.isFinite(parsedGrade) || parsedGrade < 1 || parsedGrade > 10) return null;

      const subject = (grade.subject || 'Unknown').trim().substring(0, 120) || 'Unknown';
      const gradeType = (grade.gradeType || 'Įvertinimas').trim().substring(0, 80);
      const semester = (grade.semester || getSemester(new Date())).trim().substring(0, 10);
      const teacherName = (grade.teacher || 'Nenurodyta').trim().substring(0, 120);
      const date = /^\d{4}-\d{2}-\d{2}$/.test(grade.date || '') ? grade.date : today;
      const notes = grade.comment?.trim()?.substring(0, 4000) || null;

      const fingerprint = `${subject}|${parsedGrade}|${gradeType}|${date}|${teacherName}|${notes || ''}`;
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
        notes,
        synced_at: nowIso,
      };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null);
}

async function persistGrades(supabase: ReturnType<typeof createClient>, userId: string, grades: TamoGrade[]) {
  const rows = normalizeGradeRows(userId, grades);
  if (rows.length === 0) throw new Error('No valid grades were parsed to store.');

  console.log('[Tamo] Persisting', rows.length, 'grades. Subjects:', [...new Set(rows.map(r => r.subject))].join(', '));

  const { error: deleteError } = await supabase
    .from('synced_grades')
    .delete()
    .eq('user_id', userId)
    .eq('source', 'tamo');

  if (deleteError) throw new Error(`Failed to clear previous Tamo grades: ${deleteError.message}`);

  const { error: insertError } = await supabase
    .from('synced_grades')
    .insert(rows);

  if (insertError) throw new Error(`Failed to save Tamo grades: ${insertError.message}`);

  return rows.length;
}

// ====== Login & Scrape ======

async function loginAndScrapeGrades(username: string, password: string): Promise<{ success: boolean; grades: TamoGrade[]; error?: string }> {
  // KEY FIX: Do login + navigate to grades page in a SINGLE Firecrawl call
  // This maintains session cookies across actions
  const attempts = [
    {
      label: 'login-then-grades',
      url: 'https://dienynas.tamo.lt/prisijungimas/login',
      actions: [
        { type: 'wait', milliseconds: 2000 },
        { type: 'click', selector: '#UserName' },
        { type: 'write', text: username },
        { type: 'click', selector: '#Password' },
        { type: 'write', text: password },
        { type: 'click', selector: '.c_btn.submit' },
        { type: 'wait', milliseconds: 5000 },
        // Navigate to grades page within the same session
        { type: 'click', selector: 'a[href*="pazymiai"], a[href*="dienynas"]' },
        { type: 'wait', milliseconds: 5000 },
      ],
    },
    {
      label: 'direct-grades-page',
      url: 'https://dienynas.tamo.lt/prisijungimas/login',
      actions: [
        { type: 'wait', milliseconds: 2000 },
        { type: 'click', selector: '#UserName' },
        { type: 'write', text: username },
        { type: 'click', selector: '#Password' },
        { type: 'write', text: password },
        { type: 'click', selector: '.c_btn.submit' },
        { type: 'wait', milliseconds: 6000 },
        // Try navigating directly
        { type: 'scrapeAndNavigate', url: 'https://dienynas.tamo.lt/dienynas/pazymiai' },
        { type: 'wait', milliseconds: 5000 },
      ],
    },
    {
      label: 'login-only',
      url: 'https://dienynas.tamo.lt/prisijungimas/login',
      actions: [
        { type: 'wait', milliseconds: 2000 },
        { type: 'click', selector: '#UserName' },
        { type: 'write', text: username },
        { type: 'click', selector: '#Password' },
        { type: 'write', text: password },
        { type: 'click', selector: '.c_btn.submit' },
        { type: 'wait', milliseconds: 8000 },
      ],
    },
  ];

  let bestGrades: TamoGrade[] = [];
  let lastError = 'No grades found';

  for (const attempt of attempts) {
    console.log(`[Tamo] Attempt: ${attempt.label}`);

    const result = await firecrawlScrape(attempt.url, attempt.actions);
    if (!result.success) {
      lastError = `${attempt.label}: ${result.error}`;
      continue;
    }

    const html = result.html || '';
    const markdown = result.markdown || '';

    console.log(`[Tamo] ${attempt.label} - HTML: ${html.length}, Markdown: ${markdown.length}`);

    // Check for failed login
    if (isInvalidTamoLogin(`${html}\n${markdown}`)) {
      return { success: false, grades: [], error: 'Login failed - invalid Tamo credentials' };
    }

    // Still on login page
    if (html.includes('Įveskite naudotojo vardą') || html.includes('#UserName')) {
      if (html.length < 30000) {
        lastError = 'Session expired or login failed';
        continue;
      }
    }

    const grades = parseGradesFromContent(html, markdown);
    console.log(`[Tamo] ${attempt.label}: Found ${grades.length} grades`);

    if (grades.length > bestGrades.length) {
      bestGrades = grades;
    }

    if (grades.length >= 5) break;
  }

  if (bestGrades.length === 0) {
    return { success: false, grades: [], error: lastError };
  }

  return { success: true, grades: bestGrades };
}

// ====== HTTP Handler ======

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
        sampleGrades: result.grades.slice(0, 10),
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

      const pwd = await decryptPassword(decryptedCreds.password || decryptedCreds.passwordHash);
      const result = await loginAndScrapeGrades(decryptedCreds.username, pwd);

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
        subjects: [...new Set(result.grades.map(g => g.subject))],
        lastSync: new Date().toISOString(),
        message: `Successfully synced ${persistedCount} grades from Tamo`,
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
