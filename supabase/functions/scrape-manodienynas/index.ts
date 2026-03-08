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

function getSemester(monthNum: number): string {
  // Lithuanian school: Sept-Dec = I, Jan-June = II
  return (monthNum >= 9 && monthNum <= 12) ? 'I' : 'II';
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
    };
    if (actions?.length) body.actions = actions;

    console.log('[MD] Firecrawl scrape:', url, 'actions:', actions?.length || 0);

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
        console.log('[MD] Timeout, retrying...');
        const retry = await fetch('https://api.firecrawl.dev/v1/scrape', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...body, waitFor: 8000, timeout: 120000 }),
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
    console.error('[MD] Fetch error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// ====== Utility functions ======

function cleanText(value: string): string {
  return value.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').replace(/\s+/g, ' ').trim();
}

function cleanSubjectName(raw: string): string {
  return raw
    .replace(/\s*\(-[^)]*\)?\s*/g, ' ')  // (-), (-, (-xxx)
    .replace(/\s*\([^)]*$/, '')           // unclosed parens
    .replace(/\s*I?MYP\d*/gi, '')
    .replace(/\.\.\.$/, '')
    .replace(/\s+/g, ' ')
    .replace(/\s+I{1,2}$/, '')
    .trim();
}

function stripFormativePrefix(subject: string): { baseSubject: string; isFormative: boolean } {
  const normalized = subject.replace(/[\s\u00a0]+/g, ' ').trim();
  const lower = normalized.toLowerCase();
  for (const prefix of ['formuojamasis vertinimas ', 'formojamasis vertinimas ']) {
    if (lower.startsWith(prefix)) {
      return { baseSubject: cleanSubjectName(normalized.substring(prefix.length).trim()), isFormative: true };
    }
  }
  return { baseSubject: subject, isFormative: false };
}

const BLOCKED_SUBJECTS = new Set([
  'unknown', 'nenurodyta', 'dalykas', 'eil. nr.', 'eil. nr', 'eil.nr.', 'eil.nr',
  'nr.', 'nr', 'eilės numeris', 'prisijungti', 'registruokis', 'dienos vaizdas',
  'naujienos', 'pagalba', 'atlikti iki', 'terminas', 'liko', 'užduotis',
  'užduoties tipas', 'pažymys', 'įvertinimas', 'vidurkis', 'svertinis vidurkis',
  'komentaras', 'mokytojas', 'data', 'tipas', 'pamoka', 'tema', 'skyrius',
  'klasė', 'grupė', 'mokslo metai', 'spausdinimo versija',
  'gruodis', 'sausis', 'vasaris', 'kovas', 'balandis', 'gegužė',
  'birželis', 'rugsėjis', 'spalis', 'lapkritis',
]);

function isLikelySubject(value: string): boolean {
  const text = cleanText(value).toLowerCase();
  if (text.length < 3 || text.length > 120) return false;
  if (BLOCKED_SUBJECTS.has(text)) return false;
  if (!/[a-ząčęėįšųūž]/i.test(text)) return false;
  if (/^\d+$/.test(text)) return false;
  return true;
}

// ====== Month detection ======

const MONTH_TO_NUMBER: Record<string, number> = {
  'rugsėjis': 9, 'spalis': 10, 'lapkritis': 11, 'gruodis': 12,
  'sausis': 1, 'vasaris': 2, 'kovas': 3, 'balandis': 4, 'gegužė': 5, 'birželis': 6,
};

const MONTH_PATTERNS: [RegExp, string][] = [
  [/rugs[eė]j/i, 'rugsėjis'],
  [/spal/i, 'spalis'],
  [/lapkrit/i, 'lapkritis'],
  [/gruod/i, 'gruodis'],
  [/saus/i, 'sausis'],
  [/vasar/i, 'vasaris'],
  [/kov[ao]/i, 'kovas'],
  [/baland/i, 'balandis'],
  [/gegu[zž]/i, 'gegužė'],
  [/bir[zž]el/i, 'birželis'],
];

const DATE_MONTH_PATTERNS: Array<{ regex: RegExp; month: number }> = [
  { regex: /rugs[eė]j/i, month: 9 },
  { regex: /spal/i, month: 10 },
  { regex: /lapkrit/i, month: 11 },
  { regex: /gruod/i, month: 12 },
  { regex: /saus/i, month: 1 },
  { regex: /vasar/i, month: 2 },
  { regex: /kov[ao]/i, month: 3 },
  { regex: /baland/i, month: 4 },
  { regex: /gegu[zž]/i, month: 5 },
  { regex: /bir[zž]el/i, month: 6 },
  { regex: /jan(?:uary)?/i, month: 1 },
  { regex: /feb(?:ruary)?/i, month: 2 },
  { regex: /mar(?:ch)?/i, month: 3 },
  { regex: /apr(?:il)?/i, month: 4 },
  { regex: /may/i, month: 5 },
  { regex: /jun(?:e)?/i, month: 6 },
  { regex: /jul(?:y)?/i, month: 7 },
  { regex: /aug(?:ust)?/i, month: 8 },
  { regex: /sep(?:t(?:ember)?)?/i, month: 9 },
  { regex: /oct(?:ober)?/i, month: 10 },
  { regex: /nov(?:ember)?/i, month: 11 },
  { regex: /dec(?:ember)?/i, month: 12 },
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

function toIsoDate(year: number, month: number, day: number): string | null {
  if (year < 2000 || year > 2100) return null;
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function resolveMonthFromText(text: string): number | null {
  for (const { regex, month } of DATE_MONTH_PATTERNS) {
    if (regex.test(text)) return month;
  }
  return null;
}

function extractDateFromText(text: string, fallbackMonthName?: string): string | null {
  if (!text) return null;

  const isoMatch = text.match(/(?:^|\D)(20\d{2})[.\/-](\d{1,2})[.\/-](\d{1,2})(?!\d)/);
  if (isoMatch) {
    return toIsoDate(Number(isoMatch[1]), Number(isoMatch[2]), Number(isoMatch[3]));
  }

  const ltMatch = text.match(/(?:^|\D)(\d{1,2})[.\/-](\d{1,2})[.\/-](20\d{2})(?!\d)/);
  if (ltMatch) {
    return toIsoDate(Number(ltMatch[3]), Number(ltMatch[2]), Number(ltMatch[1]));
  }

  const monthFirstMatch = text.match(/([A-Za-zĄČĘĖĮŠŲŪŽąčęėįšųūž]+)\s*(\d{1,2})(?:\s*d\.?)?/);
  if (monthFirstMatch) {
    const month = resolveMonthFromText(monthFirstMatch[1]);
    if (month) {
      const day = Number(monthFirstMatch[2]);
      return toIsoDate(resolveSchoolYearForMonth(month), month, day);
    }
  }

  const dayFirstMatch = text.match(/(\d{1,2})(?:\s*d\.?)?\s*([A-Za-zĄČĘĖĮŠŲŪŽąčęėįšųūž]+)/);
  if (dayFirstMatch) {
    const month = resolveMonthFromText(dayFirstMatch[2]);
    if (month) {
      const day = Number(dayFirstMatch[1]);
      return toIsoDate(resolveSchoolYearForMonth(month), month, day);
    }
  }

  const fallbackMonthNum = fallbackMonthName ? MONTH_TO_NUMBER[fallbackMonthName] : null;
  if (fallbackMonthNum) {
    // IMPORTANT: never infer date from a bare number (e.g. grade "5" => day 5).
    // Accept fallback only when a day marker is explicitly present ("8 d." / "8 dien.").
    const explicitDayMatch = text.match(/(?:^|\D)(\d{1,2})\s*(?:d\.?|dien\.?)(?:\D|$)/i);
    if (explicitDayMatch) {
      const day = Number(explicitDayMatch[1]);
      return toIsoDate(resolveSchoolYearForMonth(fallbackMonthNum), fallbackMonthNum, day);
    }
  }

  return null;
}

function extractNumericGradesFromCell(cellValue: string, maxGrade: number): number[] {
  const cleaned = cellValue
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/https?:\/\/[^\s"'<>]+/gi, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned) return [];

  const boundaryMatches = [...cleaned.matchAll(/\b(10|[1-9])\b/g)]
    .map((m) => Number(m[1]))
    .filter((grade) => Number.isFinite(grade) && grade >= 1 && grade <= maxGrade);

  if (boundaryMatches.length > 0) return boundaryMatches;

  // Fallback for concatenated grades like "6791" in a single rendered cell
  const compact = cleaned.replace(/\d{3,}/g, ' ').replace(/[^\d]/g, '');
  if (!compact || compact.length > 8) return [];

  const grades: number[] = [];
  for (let i = 0; i < compact.length; i++) {
    if (compact[i] === '1' && compact[i + 1] === '0') {
      const grade = 10;
      if (grade <= maxGrade) grades.push(grade);
      i += 1;
      continue;
    }

    const grade = Number(compact[i]);
    if (grade >= 1 && grade <= maxGrade) grades.push(grade);
  }

  return grades;
}

function extractGradesWithDatesFromCell(
  cellRaw: string,
  maxGrade: number,
  fallbackMonthName?: string
): Array<{ grade: number; date: string | null }> {
  const entries: Array<{ grade: number; date: string | null }> = [];
  const dedupe = new Set<string>();

  const pushEntry = (grade: number, date: string | null) => {
    if (!date) return;
    const key = `${grade}|${date}`;
    if (dedupe.has(key)) return;
    dedupe.add(key);
    entries.push({ grade, date });
  };

  const anchorRegex = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
  for (const match of cellRaw.matchAll(anchorRegex)) {
    const attrs = match[1] || '';
    const inner = match[2] || '';
    const grades = extractNumericGradesFromCell(cleanText(inner), maxGrade);
    if (grades.length === 0) continue;

    const date = extractDateFromText(`${attrs} ${inner}`, fallbackMonthName);
    grades.forEach((grade) => pushEntry(grade, date));
  }

  const markdownLinkRegex = /\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/gi;
  for (const match of cellRaw.matchAll(markdownLinkRegex)) {
    const label = cleanText(match[1] || '');
    const url = match[2] || '';
    const title = match[3] || '';
    const grades = extractNumericGradesFromCell(label, maxGrade);
    if (grades.length === 0) continue;

    const date = extractDateFromText(`${title} ${url} ${label}`, fallbackMonthName);
    grades.forEach((grade) => pushEntry(grade, date));
  }

  if (entries.length > 0) return entries;

  const date = extractDateFromText(cellRaw, fallbackMonthName);
  if (!date) return [];

  const grades = extractNumericGradesFromCell(cleanText(cellRaw), maxGrade);
  grades.forEach((grade) => pushEntry(grade, date));
  return entries;
}

// ====== Teacher map builder ======

function buildTeacherMap(markdown: string): Record<string, string> {
  const map: Record<string, string> = {};
  const lines = markdown.split('\n');
  let inSubjectList = false;

  for (const line of lines) {
    if (!line.includes('|')) continue;
    const cells = line.split('|').map(c => c.trim()).filter((_, i, arr) => i > 0 && i < arr.length - 1);
    if (cells.length < 2) continue;
    if (cells.every(c => /^[-:]+$/.test(c) || c === '')) continue;

    const firstNorm = cleanText(cells[0]).toLowerCase().replace(/[.]/g, '');
    if (firstNorm.includes('eil') && firstNorm.includes('nr')) {
      inSubjectList = true;
      continue;
    }

    if (!inSubjectList) continue;
    if (cells[0] && !/^\d+$/.test(cells[0].trim())) {
      inSubjectList = false;
      continue;
    }

    const subjectCell = cells[1] || '';
    const teacherMatch = subjectCell.match(/\[([^\]]+)\]\([^)]*\)/);
    const teacherName = teacherMatch ? teacherMatch[1].trim() : '';

    let subjectName = subjectCell
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '')
      .replace(/\s*\(-?\)\s*/g, ' ')
      .replace(/\s*I?MYP\d*/gi, '')
      .replace(/\"[^\"]*\"/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    const { baseSubject } = stripFormativePrefix(subjectName);
    subjectName = cleanSubjectName(baseSubject);

    if (subjectName && teacherName && isLikelySubject(subjectName)) {
      map[subjectName.toLowerCase()] = teacherName;
    }
  }

  console.log('[MD] Teacher map:', Object.keys(map).length, 'entries -', 
    Object.entries(map).slice(0, 8).map(([s, t]) => `${s}:${t}`).join(', '));
  return map;
}

// ====== MARKDOWN TABLE PARSER ======

function parseGradesFromMarkdown(markdown: string, teacherMapInput?: Record<string, string>): ManoDienynasGrade[] {
  const grades: ManoDienynasGrade[] = [];
  const lines = markdown.split('\n');
  const teacherMap = teacherMapInput ?? buildTeacherMap(markdown);

  // Detect MYP
  const isMYP = /\bI?MYP\d?\b/i.test(markdown);
  const maxGrade = isMYP ? 7 : 10;
  console.log('[MD] Program:', isMYP ? 'MYP (1-7)' : 'Standard (1-10)');

  let currentSubject = '';
  let currentTeacher = '';
  let currentIsFormative = false;
  let tableDetected = false;
  let monthByIndex: Record<number, string> = {};
  let monthIndexes: number[] = [];

  // Log ALL table lines for debugging
  const tableLines = lines.filter(l => l.includes('|'));
  console.log('[MD] Total table lines:', tableLines.length);
  // Log first 20 lines
  for (let i = 0; i < Math.min(20, tableLines.length); i++) {
    console.log(`[MD] TL${i}: ${tableLines[i].substring(0, 250)}`);
  }

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx];
    if (!line.includes('|')) continue;

    const rawCells = line.split('|');
    // Keep all cells including empty ones at edges for proper indexing
    const cells = rawCells.map(c => c.trim());
    // Filter to inner cells (between first and last pipe)
    const innerCells = cells.slice(1, cells.length - 1);
    
    if (innerCells.length < 2) continue;
    if (innerCells.every(c => /^[-:]+$/.test(c) || c === '')) continue;

    const firstCell = cleanText(innerCells[0]).toLowerCase();

    // Detect marks table header: has "dalykas" and month names
    if (firstCell.includes('dalykas') || firstCell === 'dalykas') {
      // Check for months in other cells
      const newMonthByIndex: Record<number, string> = {};
      const newMonthIndexes: number[] = [];
      
      for (let i = 1; i < innerCells.length; i++) {
        const month = findMonth(innerCells[i]);
        if (month) {
          newMonthByIndex[i] = month;
          newMonthIndexes.push(i);
        }
      }

      if (newMonthIndexes.length > 0) {
        tableDetected = true;
        monthByIndex = newMonthByIndex;
        monthIndexes = newMonthIndexes;
        console.log('[MD] ✓ Marks table found! Month cols:', 
          newMonthIndexes.map(i => `${i}:${newMonthByIndex[i]}`).join(', '));
      } else {
        console.log('[MD] Table with "dalykas" but no months, skipping. Cells:', 
          innerCells.slice(0, 6).map((c, i) => `${i}:"${c.substring(0, 30)}"`).join(', '));
      }
      continue;
    }

    if (!tableDetected) continue;

    // Try to detect subject from first cell
    const firstCellClean = cleanText(innerCells[0]);
    const isSubjectRow = firstCellClean.length > 2 
      && !/^(10|[1-9])$/.test(firstCellClean)
      && !/^[nN]$/.test(firstCellClean) 
      && !/^įsk$/i.test(firstCellClean)
      && !/^\d+[.,]\d+$/.test(firstCellClean);

    if (isSubjectRow) {
      // Extract teacher from cell if embedded
      let rawSubject = firstCellClean;
      let teacher = '';

      // Check for inline teacher: "Subject TeacherLastname TeacherFirstname"
      const nameMatch = rawSubject.match(/\s+((?:[A-ZĄČĘĖĮŠŲŪŽ][a-ząčęėįšųūž]+\s+){1,2}[A-ZĄČĘĖĮŠŲŪŽ][a-ząčęėįšųūž]+)$/);
      if (nameMatch) {
        teacher = nameMatch[1].trim();
        rawSubject = rawSubject.replace(nameMatch[0], '').trim();
      }

      const { baseSubject, isFormative } = stripFormativePrefix(rawSubject);
      const cleanedSubject = cleanSubjectName(baseSubject);

      if (isLikelySubject(cleanedSubject)) {
        currentSubject = cleanedSubject;
        currentIsFormative = isFormative;
        currentTeacher = teacher || teacherMap[cleanedSubject.toLowerCase()] || '';
        console.log(`[MD] Subject: "${currentSubject}" | Formative: ${isFormative} | Teacher: "${currentTeacher}"`);
      } else {
        // Might be a continuation row (grade values in a second row for same subject)
        // Don't reset currentSubject
        console.log(`[MD] Non-subject row: "${firstCellClean.substring(0, 50)}"`);
      }
    }

    if (!currentSubject) continue;

    // Extract grades ONLY from month columns
    for (const colIdx of monthIndexes) {
      if (colIdx >= innerCells.length) continue;
      const cell = innerCells[colIdx].trim();
      if (!cell) continue;
      
      // Skip non-grade values
      if (/^[nN]$/.test(cell)) continue;
      if (/^įsk/i.test(cell)) continue;
      if (/val\.?\s*$/i.test(cell)) continue;
      if (/^\d+\s*val/i.test(cell)) continue;
      if (/^\d+[.,]\d+$/.test(cell)) continue; // averages
      if (/^[-–—]+$/.test(cell)) continue;

      const monthName = monthByIndex[colIdx];
      const entries = extractGradesWithDatesFromCell(cell, maxGrade, monthName);

      for (const entry of entries) {
        if (!entry.date) continue;

        const parsedDate = new Date(entry.date);
        const monthNum = Number.isNaN(parsedDate.getTime())
          ? (monthName ? MONTH_TO_NUMBER[monthName] : undefined)
          : parsedDate.getMonth() + 1;
        const semester = monthNum ? getSemester(monthNum) : 'I';

        grades.push({
          subject: currentSubject,
          grade: entry.grade,
          gradeType: currentIsFormative ? 'Formuojamasis' : 'Įvertinimas',
          date: entry.date,
          semester,
          teacher: currentTeacher || 'Nenurodyta',
        });
      }
    }
  }

  console.log('[MD] Markdown parser found:', grades.length, 'grades across', 
    new Set(grades.map(g => g.subject)).size, 'subjects');
  if (grades.length > 0) {
    console.log('[MD] Subjects:', [...new Set(grades.map(g => g.subject))].join(', '));
    console.log('[MD] Grade values:', [...new Set(grades.map(g => g.grade))].sort().join(', '));
    console.log('[MD] Dates:', [...new Set(grades.map(g => g.date))].sort().join(', '));
  }
  
  return grades;
}

// ====== HTML TABLE PARSER (fallback) ======

function parseGradesFromHtml(html: string, teacherMap: Record<string, string> = {}): ManoDienynasGrade[] {
  type ParsedRow = { rawCells: string[]; textCells: string[] };

  const isMYP = /\bI?MYP\d?\b/i.test(html);
  const maxGrade = isMYP ? 7 : 10;

  const tableRegex = /<table[^>]*>([\s\S]*?)<\/table>/gi;
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  const cellRegex = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;

  const tables = [...html.matchAll(tableRegex)].map((m) => m[1]);
  console.log('[MD-HTML] Total tables found:', tables.length);

  let bestGrades: ManoDienynasGrade[] = [];

  for (const tableHtml of tables) {
    const rows: ParsedRow[] = [];

    for (const rowMatch of tableHtml.matchAll(rowRegex)) {
      const rowHtml = rowMatch[1];
      const rawCells: string[] = [];
      const textCells: string[] = [];

      for (const cellMatch of rowHtml.matchAll(cellRegex)) {
        const raw = cellMatch[1] || '';
        rawCells.push(raw);
        textCells.push(cleanText(raw));
      }

      if (textCells.length >= 2) {
        rows.push({ rawCells, textCells });
      }
    }

    if (rows.length < 3) continue;

    let headerRowIdx = -1;
    let monthByCol: Record<number, string> = {};
    let monthCols: number[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i].textCells;
      const rowJoined = row.join(' ').toLowerCase();
      if (!rowJoined.includes('dalyk')) continue;

      const tempMonths: Record<number, string> = {};
      const tempCols: number[] = [];

      for (let j = 0; j < row.length; j++) {
        const month = findMonth(row[j]);
        if (month) {
          tempMonths[j] = month;
          tempCols.push(j);
        }
      }

      if (tempCols.length >= 2) {
        headerRowIdx = i;
        monthByCol = tempMonths;
        monthCols = tempCols;
        break;
      }
    }

    if (headerRowIdx < 0) continue;

    let currentSubject = '';
    let currentTeacher = '';
    let currentIsFormative = false;
    const parsedGrades: ManoDienynasGrade[] = [];

    for (let i = headerRowIdx + 1; i < rows.length; i++) {
      const { rawCells, textCells } = rows[i];
      if (textCells.every((c) => !c || /^[-–—]+$/.test(c))) continue;

      const candidates = [textCells[0], textCells[1]].filter(Boolean);
      for (const candidate of candidates) {
        if (/^\d+$/.test(candidate.trim())) continue;

        const { baseSubject, isFormative } = stripFormativePrefix(candidate);
        const cleaned = cleanSubjectName(baseSubject);
        if (!isLikelySubject(cleaned)) continue;

        currentSubject = cleaned;
        currentIsFormative = isFormative;
        currentTeacher = teacherMap[cleaned.toLowerCase()] || currentTeacher || 'Nenurodyta';
        break;
      }

      if (!currentSubject) continue;

      for (const colIdx of monthCols) {
        if (colIdx >= textCells.length || colIdx >= rawCells.length) continue;

        const cellText = textCells[colIdx].trim();
        const cellRaw = rawCells[colIdx] || '';
        if (!cellText && !cellRaw) continue;
        if (/^[nN]$/.test(cellText) || /^įsk/i.test(cellText) || /^\d+[.,]\d+$/.test(cellText)) continue;

        const monthName = monthByCol[colIdx];
        const entries = extractGradesWithDatesFromCell(cellRaw || cellText, maxGrade, monthName);

        for (const entry of entries) {
          if (!entry.date) continue;

          const parsedDate = new Date(entry.date);
          const monthNum = Number.isNaN(parsedDate.getTime())
            ? (monthName ? MONTH_TO_NUMBER[monthName] : undefined)
            : parsedDate.getMonth() + 1;
          const semester = monthNum ? getSemester(monthNum) : 'I';

          parsedGrades.push({
            subject: currentSubject,
            grade: entry.grade,
            gradeType: currentIsFormative ? 'Formuojamasis' : 'Įvertinimas',
            date: entry.date,
            semester,
            teacher: currentTeacher || 'Nenurodyta',
          });
        }
      }
    }

    const uniqueSubjects = new Set(parsedGrades.map((g) => g.subject)).size;
    const score = parsedGrades.length + uniqueSubjects * 2;
    const bestScore = bestGrades.length + new Set(bestGrades.map((g) => g.subject)).size * 2;

    if (score > bestScore) {
      bestGrades = parsedGrades;
    }
  }

  console.log('[MD-HTML] HTML parser best result:', bestGrades.length, 'grades across', new Set(bestGrades.map(g => g.subject)).size, 'subjects');
  return bestGrades;
}

// ====== Persistence ======

function normalizeGradeRows(userId: string, grades: ManoDienynasGrade[]) {
  const nowIso = new Date().toISOString();
  const dedupe = new Set<string>();

  return grades
    .map((grade) => {
      if (!Number.isFinite(grade.grade) || grade.grade < 1 || grade.grade > 10) return null;
      const subject = grade.subject.substring(0, 120);
      if (!subject || subject.length < 3) return null;

      if (!/^\d{4}-\d{2}-\d{2}$/.test(grade.date || '')) return null;
      const rowDate = grade.date;
      const semester = (grade.semester || 'I').substring(0, 10);
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

// ====== Main scraping logic ======

async function loginAndScrapeGrades(username: string, password: string): Promise<{ success: boolean; grades: ManoDienynasGrade[]; error?: string }> {
  const loginUrl = 'https://www.manodienynas.lt/1/lt/public/public/login';

  try {
    console.log('[MD] Starting login + scrape...');
    const result = await firecrawlScrape(loginUrl, [
      { type: 'wait', milliseconds: 2000 },
      { type: 'click', selector: '#dl_username' },
      { type: 'write', text: username },
      { type: 'click', selector: '#dl_password' },
      { type: 'write', text: password },
      { type: 'click', selector: '#login_submit' },
      { type: 'wait', milliseconds: 5000 },
      { type: 'click', selector: 'a[href*="marks_pupil/marks"]' },
      { type: 'wait', milliseconds: 4000 },
    ]);

    if (!result.success) {
      return { success: false, grades: [], error: `Login failed: ${result.error}` };
    }

    const html = result.html || '';
    const markdown = result.markdown || '';

    console.log('[MD] HTML length:', html.length, '| Markdown length:', markdown.length);
    
    // Log markdown in chunks for debugging
    const chunkSize = 2000;
    const maxChunks = 10;
    for (let i = 0; i < Math.min(markdown.length, chunkSize * maxChunks); i += chunkSize) {
      console.log(`[MD] MD[${i}-${i + chunkSize}]: ${markdown.substring(i, i + chunkSize)}`);
    }

    // Check if still on login page
    if (html.includes('dl_username') && html.includes('dienynas_form1') && html.length < 50000) {
      return { success: false, grades: [], error: 'Login failed - invalid credentials' };
    }

    const teacherMap = buildTeacherMap(markdown);

    const markdownGrades = parseGradesFromMarkdown(markdown, teacherMap);
    console.log('[MD] Markdown parser result:', markdownGrades.length, 'grades');

    const htmlGrades = html.length > 0 ? parseGradesFromHtml(html, teacherMap) : [];
    console.log('[MD] HTML parser result:', htmlGrades.length, 'grades');

    let grades = htmlGrades.length > markdownGrades.length ? htmlGrades : markdownGrades;
    if (htmlGrades.length > markdownGrades.length) {
      console.log('[MD] Using HTML parser results');
    }

    // If still too few, try fallback navigation
    if (grades.length < 5) {
      console.log('[MD] Too few grades, trying fallback navigation...');
      const fallback = await firecrawlScrape(loginUrl, [
        { type: 'wait', milliseconds: 2000 },
        { type: 'click', selector: '#dl_username' },
        { type: 'write', text: username },
        { type: 'click', selector: '#dl_password' },
        { type: 'write', text: password },
        { type: 'click', selector: '#login_submit' },
        { type: 'wait', milliseconds: 5000 },
        // Try different selector for marks page
        { type: 'click', selector: 'a[href*="marks"]' },
        { type: 'wait', milliseconds: 5000 },
      ]);

      if (fallback.success) {
        const fbMarkdown = fallback.markdown || '';
        const fbHtml = fallback.html || '';
        console.log('[MD] Fallback MD length:', fbMarkdown.length, '| HTML length:', fbHtml.length);
        
        // Log fallback markdown
        for (let i = 0; i < Math.min(fbMarkdown.length, chunkSize * 5); i += chunkSize) {
          console.log(`[MD] FB-MD[${i}-${i + chunkSize}]: ${fbMarkdown.substring(i, i + chunkSize)}`);
        }

        const fallbackTeacherMap = buildTeacherMap(fbMarkdown);
        const fbMarkdownGrades = parseGradesFromMarkdown(fbMarkdown, fallbackTeacherMap);
        const fbHtmlGrades = fbHtml.length > 0 ? parseGradesFromHtml(fbHtml, fallbackTeacherMap) : [];
        const bestFallback = fbHtmlGrades.length > fbMarkdownGrades.length ? fbHtmlGrades : fbMarkdownGrades;

        if (bestFallback.length > grades.length) {
          grades = bestFallback;
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

    const subjects = [...new Set(grades.map(g => g.subject))];
    console.log('[MD] FINAL:', grades.length, 'grades across', subjects.length, 'subjects');
    console.log('[MD] Subjects:', subjects.join(', '));

    return { success: true, grades };
  } catch (error) {
    console.error('[MD] Error:', error);
    return { success: false, grades: [], error: error instanceof Error ? error.message : 'Unknown error' };
  }
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
