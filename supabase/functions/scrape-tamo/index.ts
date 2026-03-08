import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encode as hexEncode, decode as hexDecode } from "https://deno.land/std@0.168.0/encoding/hex.ts";

const _te = new TextEncoder();
const _td = new TextDecoder();

async function decryptPassword(stored: string): Promise<string> {
  if (!stored.startsWith('aes:')) return atob(stored); // legacy
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

function isInvalidTamoLogin(content: string): boolean {
  const normalized = content.toLowerCase();
  return normalized.includes('neteisingas prisijungimo vardas') || normalized.includes('neteisingas slaptažodis');
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

function parseGradesFromContent(_html: string, markdown: string, extractedJson?: any): TamoGrade[] {
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

  // Strict markdown table parser to avoid false positives from random dashboard numbers
  if (!markdown) return [];

  const blockedSubjectTokens = new Set([
    'dalykas', 'pažymys', 'vidurkis', 'komentaras', 'mokytojas', 'data', 'tipas',
    'nėra duomenų', 'pusmečio vidurkis', 'metinis vidurkis',
  ]);

  const lines = markdown.split('\n');
  let inGradeTable = false;
  let currentSubject = '';

  for (const line of lines) {
    if (!line.includes('|')) continue;

    const cells = line
      .split('|')
      .map((cell) => cell.trim())
      .filter((_, index, arr) => index > 0 && index < arr.length - 1);

    if (cells.length < 2) continue;
    if (cells.every((cell) => /^[-:]+$/.test(cell) || cell === '')) continue;

    const firstCellNormalized = cells[0].toLowerCase().replace(/\s+/g, ' ').trim();

    if (firstCellNormalized === 'dalykas' || firstCellNormalized.includes('mokomasis dalykas')) {
      inGradeTable = true;
      continue;
    }

    if (!inGradeTable) continue;

    if (cells[0]) {
      const maybeSubject = cells[0].replace(/<[^>]*>/g, '').trim();
      const normalizedSubject = maybeSubject.toLowerCase().replace(/\s+/g, ' ').trim();
      const containsLetters = /[a-ząčęėįšųūž]/i.test(maybeSubject);

      if (
        containsLetters &&
        !blockedSubjectTokens.has(normalizedSubject) &&
        !/^\d+$/.test(normalizedSubject)
      ) {
        currentSubject = maybeSubject.substring(0, 120);
      }
    }

    if (!currentSubject) continue;

    for (let i = 1; i < cells.length; i++) {
      const cell = cells[i];
      if (!cell) continue;

      const tokens = cell.split(/[\s,;]+/).map((token) => token.trim()).filter(Boolean);
      for (const token of tokens) {
        const parsed = Number.parseInt(token, 10);
        if (!Number.isFinite(parsed) || parsed < 1 || parsed > 10) continue;

        grades.push({
          subject: currentSubject,
          grade: parsed,
          gradeType: 'Įvertinimas',
          date: new Date().toISOString().split('T')[0],
          semester: getSemester(new Date()),
          teacher: 'Nenurodyta',
        });
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

    const html = loginResult.html || '';
    const markdown = loginResult.markdown || '';
    const loginPageContent = `${html}\n${markdown}`;

    if (
      html.includes('Įveskite naudotojo vardą') ||
      html.includes('Naudotojo vardas negali') ||
      isInvalidTamoLogin(loginPageContent)
    ) {
      return { success: false, grades: [], error: 'Login failed - invalid Tamo credentials' };
    }

    // Try parsing directly from the authenticated post-login page first
    const gradesFromLoginPage = parseGradesFromContent(html, markdown, loginResult.extractedJson);
    if (gradesFromLoginPage.length > 0) {
      return { success: true, grades: gradesFromLoginPage };
    }

    // Fallback: direct grades page request
    console.log('[Tamo] Navigating to grades page...');
    const gradesResult = await firecrawlScrapeWithActions('https://dienynas.tamo.lt/dienynas/pazymiai', [
      { type: 'wait', milliseconds: 4000 },
    ]);

    if (!gradesResult.success) {
      return {
        success: false,
        grades: [],
        error: `Failed to open Tamo gradebook page: ${gradesResult.error || 'Unknown error'}`,
      };
    }

    const gradesHtml = gradesResult.html || '';
    const gradesMarkdown = gradesResult.markdown || '';
    if (gradesHtml.includes('Įveskite naudotojo vardą') || isInvalidTamoLogin(`${gradesHtml}\n${gradesMarkdown}`)) {
      return { success: false, grades: [], error: 'Tamo session expired after login. Please retry sync.' };
    }

    const grades = parseGradesFromContent(gradesHtml, gradesMarkdown, gradesResult.extractedJson);
    if (grades.length === 0) {
      return { success: false, grades: [], error: 'No grades found in Tamo gradebook.' };
    }

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

      const password = await decryptPassword(decryptedCreds.password || decryptedCreds.passwordHash);
      const result = await loginAndScrapeGrades(
        decryptedCreds.username,
        password
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
