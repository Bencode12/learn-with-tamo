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

      if (data?.code === 'SCRAPE_TIMEOUT') {
        console.log('[MD] Firecrawl timeout, retrying once with extended wait...');
        const retryResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...body,
            waitFor: Math.max(body.waitFor || 0, 5000),
            timeout: 120000,
          }),
        });

        const retryData = await retryResponse.json();
        if (retryResponse.ok) {
          return {
            success: true,
            html: retryData.data?.html || retryData.html || '',
            markdown: retryData.data?.markdown || retryData.markdown || '',
          };
        }

        console.error('[MD] Firecrawl retry failed:', JSON.stringify(retryData).substring(0, 500));
        return { success: false, error: retryData.error || `Firecrawl retry returned ${retryResponse.status}` };
      }

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
    .replace(/\.\.\.$/, '')  // Remove trailing ellipsis
    .replace(/\s+/g, ' ')
    .trim();
  // Remove trailing semester markers like " I" or " II"
  name = name.replace(/\s+I{1,2}$/, '').trim();
  return name;
}

/**
 * Strip "Formuojamasis vertinimas" or "Formojamasis vertinimas" prefix from subject name.
 * Returns { baseSubject, isFormative }
 */
function stripFormativePrefix(subject: string): { baseSubject: string; isFormative: boolean } {
  // Match both correct and common misspelling
  const formativePattern = /^form[ou]jamasis\s+vertinimas\s+/i;
  if (formativePattern.test(subject)) {
    const base = subject.replace(formativePattern, '').trim();
    return { baseSubject: cleanSubjectName(base), isFormative: true };
  }
  return { baseSubject: subject, isFormative: false };
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
  if (!/[a-ząčęėįšųūž]/i.test(text)) return false;
  if (/^\d+$/.test(text)) return false;
  return true;
}

function isNumericGrade(value: string): boolean {
  return /^(10|[1-9])$/.test(value.trim());
}

function extractNumericGradesFromCell(value: string): number[] {
  const normalized = value
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_`~]/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ');

  return [...normalized.matchAll(/\b(10|[1-9])\b/g)]
    .map((match) => parseInt(match[1], 10))
    .filter((num) => Number.isFinite(num) && num >= 1 && num <= 10);
}

/**
 * Extract teacher name from a subject cell.
 */
function extractTeacher(cellText: string): { subject: string; teacher: string } {
  const namePattern = /\s+((?:[A-ZĄČĘĖĮŠŲŪŽ][a-ząčęėįšųūž]+\s+){1,2}[A-ZĄČĘĖĮŠŲŪŽ][a-ząčęėįšųūž]+(?:\s+[A-ZĄČĘĖĮŠŲŪŽ][a-ząčęėįšųūž]+)?)$/;
  const multiTeacherPattern = /\s+([A-ZĄČĘĖĮŠŲŪŽ]\.\s*[A-ZĄČĘĖĮŠŲŪŽ][a-ząčęėįšųūž]+(?:,\s*[A-ZĄČĘĖĮŠŲŪŽ]\.\s*[A-ZĄČĘĖĮŠŲŪŽ][a-ząčęėįšųūž]+)+)$/;
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

// All Lithuanian month names (including alternate forms and partial matches)
const ALL_MONTH_NAMES = [
  'rugsėjis', 'rugsej', 'rugs',
  'spalis', 'spal',
  'lapkritis', 'lapkrit', 'lapkr',
  'gruodis', 'gruodž', 'gruod',
  'sausis', 'saus',
  'vasaris', 'vasar', 'vas',
  'kovas', 'kov',
  'balandis', 'baland', 'bal',
  'gegužė', 'geguz', 'geg',
  'birželis', 'birzel', 'birž',
];

const MONTH_CANONICAL: Record<string, string> = {
  'rugsėjis': 'rugsėjis', 'rugsej': 'rugsėjis', 'rugs': 'rugsėjis',
  'spalis': 'spalis', 'spal': 'spalis',
  'lapkritis': 'lapkritis', 'lapkrit': 'lapkritis', 'lapkr': 'lapkritis',
  'gruodis': 'gruodis', 'gruodž': 'gruodis', 'gruod': 'gruodis',
  'sausis': 'sausis', 'saus': 'sausis',
  'vasaris': 'vasaris', 'vasar': 'vasaris', 'vas': 'vasaris',
  'kovas': 'kovas', 'kov': 'kovas',
  'balandis': 'balandis', 'baland': 'balandis', 'bal': 'balandis',
  'gegužė': 'gegužė', 'geguz': 'gegužė', 'geg': 'gegužė',
  'birželis': 'birželis', 'birzel': 'birželis', 'birž': 'birželis',
};

const FIRST_SEMESTER_MONTHS = ['rugsėjis', 'spalis', 'lapkritis', 'gruodis'];
const SECOND_SEMESTER_MONTHS = ['sausis', 'vasaris', 'kovas', 'balandis', 'gegužė', 'birželis'];

const MONTH_TO_NUMBER: Record<string, number> = {
  'rugsėjis': 9, 'spalis': 10, 'lapkritis': 11, 'gruodis': 12,
  'sausis': 1, 'vasaris': 2, 'kovas': 3, 'balandis': 4, 'gegužė': 5, 'birželis': 6,
};

function monthNameToDate(monthName: string): string {
  const monthNum = MONTH_TO_NUMBER[monthName];
  if (!monthNum) return new Date().toISOString().split('T')[0];
  const now = new Date();
  let year = now.getFullYear();
  if (monthNum >= 9) {
    if (now.getMonth() + 1 < 9) year = year - 1;
  }
  return `${year}-${String(monthNum).padStart(2, '0')}-15`;
}

function normalizeHeaderText(value: string): string {
  return cleanText(value)
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()\[\]"]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Try to find which canonical month a header cell refers to.
 * Handles: full names, partial names, accented/unaccented, case-insensitive.
 */
function findMonthInHeader(headerText: string): string | null {
  const normalized = normalizeHeaderText(headerText);
  if (!normalized) return null;

  // Try exact and partial matches against all known month name forms
  for (const monthForm of ALL_MONTH_NAMES) {
    if (normalized.includes(monthForm)) {
      return MONTH_CANONICAL[monthForm] || null;
    }
  }

  // Also try without diacritics
  const stripped = normalized
    .replace(/ą/g, 'a').replace(/č/g, 'c').replace(/ę/g, 'e')
    .replace(/ė/g, 'e').replace(/į/g, 'i').replace(/š/g, 's')
    .replace(/ų/g, 'u').replace(/ū/g, 'u').replace(/ž/g, 'z');

  const MONTH_NO_DIACRITICS: Record<string, string> = {
    'rugsejis': 'rugsėjis', 'spalis': 'spalis', 'lapkritis': 'lapkritis',
    'gruodis': 'gruodis', 'sausis': 'sausis', 'vasaris': 'vasaris',
    'kovas': 'kovas', 'balandis': 'balandis', 'geguze': 'gegužė',
    'birzelis': 'birželis',
  };

  for (const [noDiac, canonical] of Object.entries(MONTH_NO_DIACRITICS)) {
    if (stripped.includes(noDiac)) {
      return canonical;
    }
  }

  return null;
}

function detectMonthColumns(cells: string[]): { monthIndexes: number[]; monthByIndex: Record<number, string> } {
  const monthIndexes: number[] = [];
  const monthByIndex: Record<number, string> = {};

  for (let i = 1; i < cells.length; i++) {
    const month = findMonthInHeader(cells[i]);
    if (!month) continue;

    monthIndexes.push(i);
    monthByIndex[i] = month;
  }

  console.log('[MD] Detected month columns:', monthIndexes.length, '-', monthIndexes.map(i => `col${i}:${monthByIndex[i]}`).join(', '));
  return { monthIndexes, monthByIndex };
}

/**
 * Build a subject -> teacher map from the "Eil. Nr. | Dalykas" table.
 * ManoDienynas shows teacher names as markdown links: [TeacherName](url "tooltip")
 */
function buildTeacherMap(markdown: string): Record<string, string> {
  const map: Record<string, string> = {};
  const lines = markdown.split('\n');
  let inSubjectList = false;

  for (const line of lines) {
    if (!line.includes('|')) continue;
    const cells = line.split('|').map(c => c.trim()).filter((_, i, arr) => i > 0 && i < arr.length - 1);
    if (cells.length < 2) continue;
    if (cells.every(c => /^[-:]+$/.test(c) || c === '')) continue;

    const firstNorm = normalizeHeaderText(cells[0]);
    if (firstNorm === 'eil nr' || firstNorm === 'eil. nr.' || firstNorm === 'eil nr.') {
      inSubjectList = true;
      continue;
    }

    if (!inSubjectList) continue;
    // End of subject list table
    if (cells[0] && !/^\d+$/.test(cells[0].trim())) {
      inSubjectList = false;
      continue;
    }

    // Parse subject and teacher from second cell
    // Format: "Subject (-) IMYP2<br>[TeacherLastname TeacherFirstname](url)"
    const subjectCell = cells[1] || '';
    const teacherMatch = subjectCell.match(/\[([^\]]+)\]\([^)]*\)/);
    const teacherName = teacherMatch ? teacherMatch[1].trim() : '';

    // Extract subject name (before <br> or before the link)
    let subjectName = subjectCell
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '')
      .replace(/\s*\(-?\)\s*/g, ' ')
      .replace(/\s*I?MYP\d*/gi, '')
      .replace(/"[^"]*"/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    const { baseSubject } = stripFormativePrefix(subjectName);
    subjectName = cleanSubjectName(baseSubject);

    if (subjectName && teacherName && isLikelySubject(subjectName)) {
      map[subjectName.toLowerCase()] = teacherName;
    }
  }

  console.log('[MD] Teacher map built:', Object.keys(map).length, 'subjects -', Object.entries(map).slice(0, 5).map(([s, t]) => `${s}: ${t}`).join(', '));
  return map;
}

/**
 * Find the nearest month for a column index based on detected month columns.
 * Assigns each column to the closest preceding or exact month column.
 */
function getMonthForColumn(colIndex: number, monthIndexes: number[], monthByIndex: Record<number, string>): string {
  if (monthByIndex[colIndex]) return monthByIndex[colIndex];
  if (monthIndexes.length === 0) return '';

  // Find closest preceding month
  let closest = '';
  for (const mi of monthIndexes) {
    if (mi <= colIndex) closest = monthByIndex[mi];
    else break;
  }
  return closest;
}

/**
 * Parse the ManoDienynas marks table from markdown.
 */
function parseGradesFromMarkdown(markdown: string): ManoDienynasGrade[] {
  const grades: ManoDienynasGrade[] = [];
  const lines = markdown.split('\n');
  const teacherMap = buildTeacherMap(markdown);

  let currentSubject = '';
  let currentTeacher = '';
  let currentIsFormative = false;
  let tableDetected = false;
  let monthIndexes: number[] = [];
  let monthByIndex: Record<number, string> = {};

  // Log first few table lines for debugging
  const tableLines = lines.filter(l => l.includes('|')).slice(0, 5);
  console.log('[MD] First 5 table lines:', tableLines.map(l => l.substring(0, 200)));

  for (const line of lines) {
    if (!line.includes('|')) continue;

    const cells = line.split('|').map(c => c.trim()).filter((_, i, arr) => i > 0 && i < arr.length - 1);
    if (cells.length < 2) continue;

    // Skip separator rows (----)
    if (cells.every(c => /^[-:]+$/.test(c) || c === '')) continue;

    const firstCellNormalized = normalizeHeaderText(cells[0]);

    // Detect marks header row: must have "dalykas" AND at least one month in other cells
    if (firstCellNormalized === 'dalykas' || firstCellNormalized.includes('dalykas')) {
      const monthInfo = detectMonthColumns(cells);

      // Only treat as marks table if months are found (to skip the subject list table)
      if (monthInfo.monthIndexes.length > 0) {
        tableDetected = true;
        monthIndexes = monthInfo.monthIndexes;
        monthByIndex = monthInfo.monthByIndex;
        console.log('[MD] Marks table header found with', monthInfo.monthIndexes.length, 'month columns');
      } else {
        console.log('[MD] Skipping table with "Dalykas" header but no months:', cells.map((c, i) => `${i}:"${c.substring(0, 30)}"`).join(', '));
      }
      continue;
    }

    if (!tableDetected) continue;

    const firstCell = cleanText(cells[0]);
    const rowHasSubject = firstCell.length > 0 && !isNumericGrade(firstCell) && !/^[nN]$/.test(firstCell) && !/^įsk$/i.test(firstCell);

    if (rowHasSubject) {
      const { subject: rawSubject, teacher } = extractTeacher(firstCell);

      if (!isLikelySubject(rawSubject)) {
        currentSubject = '';
        currentTeacher = '';
        continue;
      }

      // Check if this is a "Formuojamasis vertinimas" row
      const { baseSubject, isFormative } = stripFormativePrefix(rawSubject);
      currentSubject = cleanSubjectName(baseSubject);
      currentIsFormative = isFormative;

      // Look up teacher from subject list table
      const lookupKey = currentSubject.toLowerCase();
      currentTeacher = teacher || teacherMap[lookupKey] || 'Nenurodyta';
      console.log('[MD] Subject:', currentSubject, '| Formative:', isFormative, '| Teacher:', currentTeacher);
    }

    if (!currentSubject) continue;

    // Scan ALL columns (not just month columns) for grades
    // Use month mapping to determine dates
    for (let colIdx = (rowHasSubject ? 1 : 0); colIdx < cells.length; colIdx++) {
      const cell = cells[colIdx].trim();
      if (!cell) continue;
      if (/^[nN]$/.test(cell)) continue;
      if (/^įsk$/i.test(cell)) continue;
      if (/val\.?$/i.test(cell)) continue;
      if (/^\d+\s*val\.?$/i.test(cell)) continue;
      // Skip average columns (typically labeled "vid." or contain decimal numbers)
      if (/^\d+[.,]\d+$/.test(cell)) continue;

      const numericGrades = extractNumericGradesFromCell(cell);

      for (const parsedGrade of numericGrades) {
        const monthHeader = getMonthForColumn(colIdx, monthIndexes, monthByIndex);
        let semester = getSemester(new Date());
        let gradeDate = new Date().toISOString().split('T')[0];

        if (monthHeader) {
          gradeDate = monthNameToDate(monthHeader);
          if (FIRST_SEMESTER_MONTHS.includes(monthHeader)) {
            semester = 'I';
          } else if (SECOND_SEMESTER_MONTHS.includes(monthHeader)) {
            semester = 'II';
          }
        }

        grades.push({
          subject: currentSubject,
          grade: parsedGrade,
          gradeType: currentIsFormative ? 'Formuojamasis' : 'Įvertinimas',
          date: gradeDate,
          semester,
          teacher: currentTeacher,
        });
      }
    }
  }

  console.log('[MD] Total parsed from markdown:', grades.length, 'grades across', new Set(grades.map(g => g.subject)).size, 'subjects');
  return grades;
}

function extractGradesFromCells(params: {
  cells: string[];
  subject: string;
  teacher: string;
  isFormative: boolean;
  monthIndexes: number[];
  monthByIndex: Record<number, string>;
  rowHasSubject: boolean;
  grades: ManoDienynasGrade[];
}) {
  const { cells, subject, teacher, isFormative, monthIndexes, monthByIndex, rowHasSubject, grades } = params;

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

    const numericGrades = extractNumericGradesFromCell(cell);

    for (const parsedGrade of numericGrades) {
      const monthHeader = monthByIndex[columnIndex] || '';
      let semester = getSemester(new Date());
      let gradeDate = new Date().toISOString().split('T')[0];

      if (monthHeader) {
        gradeDate = monthNameToDate(monthHeader);
        if (FIRST_SEMESTER_MONTHS.includes(monthHeader)) {
          semester = 'I';
        } else if (SECOND_SEMESTER_MONTHS.includes(monthHeader)) {
          semester = 'II';
        }
      }

      grades.push({
        subject,
        grade: parsedGrade,
        gradeType: isFormative ? 'Formuojamasis' : 'Įvertinimas',
        date: gradeDate,
        semester,
        teacher,
      });
    }
  }
}

function normalizeGradeRows(userId: string, grades: ManoDienynasGrade[]) {
  const nowIso = new Date().toISOString();
  const today = new Date().toISOString().split('T')[0];
  const dedupe = new Set<string>();

  return grades
    .map((grade) => {
      if (!Number.isFinite(grade.grade) || grade.grade < 1 || grade.grade > 10) return null;
      const subject = grade.subject.substring(0, 120);
      if (!subject || subject.length < 3) return null;

      const rowDate = /^\d{4}-\d{2}-\d{2}$/.test(grade.date || '') ? grade.date : today;
      const semester = (grade.semester || getSemester(new Date())).substring(0, 10);
      const teacherName = (grade.teacher || 'Nenurodyta').substring(0, 120);
      const notes = grade.comment?.trim()?.substring(0, 4000) || null;

      const fingerprint = `${subject}|${grade.grade}|${grade.gradeType}|${rowDate}|${semester}|${teacherName}|${notes || ''}`;
      if (dedupe.has(fingerprint)) return null;
      dedupe.add(fingerprint);

      return {
        user_id: userId,
        source: 'manodienynas' as const,
        subject,
        grade: grade.grade,
        grade_type: (grade.gradeType || 'Įvertinimas').substring(0, 80),
        date: rowDate,
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
  if (rows.length === 0) throw new Error('No valid grades were parsed to store.');

  console.log('[MD] Persisting', rows.length, 'grades. Subjects:', [...new Set(rows.map(r => r.subject))].join(', '));
  console.log('[MD] Date distribution:', [...new Set(rows.map(r => r.date))].sort().join(', '));

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
    console.log('[MD] Markdown first 1200 chars:', markdown.substring(0, 1200));

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
        { type: 'click', selector: 'a[href*="marks"]' },
        { type: 'wait', milliseconds: 4000 },
      ]);

      if (fallback.success) {
        console.log('[MD] Fallback markdown length:', fallback.markdown?.length);
        console.log('[MD] Fallback first 1200:', fallback.markdown?.substring(0, 1200));
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

    // Log summary
    const subjects = [...new Set(grades.map(g => g.subject))];
    const dates = [...new Set(grades.map(g => g.date))].sort();
    console.log('[MD] Final:', grades.length, 'grades across', subjects.length, 'subjects');
    console.log('[MD] Subjects:', subjects.join(', '));
    console.log('[MD] Date range:', dates[0], '-', dates[dates.length - 1]);

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
