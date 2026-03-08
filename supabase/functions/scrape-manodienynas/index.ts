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

function monthToDateString(monthName: string): string {
  const monthNum = MONTH_TO_NUMBER[monthName];
  if (!monthNum) return new Date().toISOString().split('T')[0];
  const { startYear, endYear } = getSchoolYear();
  const year = monthNum >= 9 ? startYear : endYear;
  return `${year}-${String(monthNum).padStart(2, '0')}-15`;
}

function toIsoDate(year: number, month: number, day: number): string | null {
  if (year < 2000 || year > 2100) return null;
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function extractDateFromText(text: string): string | null {
  if (!text) return null;

  const isoMatch = text.match(/(20\d{2})[.\/-](\d{1,2})[.\/-](\d{1,2})/);
  if (isoMatch) {
    return toIsoDate(Number(isoMatch[1]), Number(isoMatch[2]), Number(isoMatch[3]));
  }

  const ltMatch = text.match(/(\d{1,2})[.\/-](\d{1,2})[.\/-](20\d{2})/);
  if (ltMatch) {
    return toIsoDate(Number(ltMatch[3]), Number(ltMatch[2]), Number(ltMatch[1]));
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

function extractGradesWithDatesFromCell(cellRaw: string, maxGrade: number): Array<{ grade: number; date: string | null }> {
  const entries: Array<{ grade: number; date: string | null }> = [];
  const anchorRegex = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;

  for (const match of cellRaw.matchAll(anchorRegex)) {
    const attrs = match[1] || '';
    const inner = match[2] || '';
    const grades = extractNumericGradesFromCell(cleanText(inner), maxGrade);
    if (grades.length === 0) continue;

    const date = extractDateFromText(`${attrs} ${inner}`);
    grades.forEach((grade) => entries.push({ grade, date }));
  }

  if (entries.length > 0) return entries;

  const date = extractDateFromText(cellRaw);
  const grades = extractNumericGradesFromCell(cleanText(cellRaw), maxGrade);
  return grades.map((grade) => ({ grade, date }));
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
  let gradeCounter: Record<string, number> = {};

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

      // Extract grade numbers from cell
      // Remove markdown links and formatting
      const cleaned = cell
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/[*_`~]/g, ' ')
        .replace(/&nbsp;/gi, ' ');

      const gradeMatches = [...cleaned.matchAll(/\b(10|[1-9])\b/g)];
      
      for (const match of gradeMatches) {
        const gradeValue = parseInt(match[1], 10);
        if (gradeValue < 1 || gradeValue > maxGrade) continue;

        const monthName = monthByIndex[colIdx];
        const monthNum = MONTH_TO_NUMBER[monthName];
        const semester = monthNum ? getSemester(monthNum) : 'I';

        // Date: use 15th of month since we can't get exact dates from summary table
        const dateStr = monthName ? monthToDateString(monthName) : new Date().toISOString().split('T')[0];

        // Distribute within month: 8th, 12th, 15th, 18th, 22nd to avoid all on 15th
        const key = `${currentSubject}|${monthName}`;
        const count = gradeCounter[key] || 0;
        gradeCounter[key] = count + 1;
        const dayOptions = [8, 12, 15, 18, 22, 25];
        const day = dayOptions[count % dayOptions.length];
        const adjustedDate = dateStr.replace(/-\d{2}$/, `-${String(day).padStart(2, '0')}`);

        grades.push({
          subject: currentSubject,
          grade: gradeValue,
          gradeType: currentIsFormative ? 'Formuojamasis' : 'Įvertinimas',
          date: adjustedDate,
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

function parseGradesFromHtml(html: string): ManoDienynasGrade[] {
  const grades: ManoDienynasGrade[] = [];
  
  // Detect MYP
  const isMYP = /\bI?MYP\d?\b/i.test(html);
  const maxGrade = isMYP ? 7 : 10;
  
  // Strategy: find all <table> elements, look for ones with grade data
  // ManoDienynas marks table has <td> cells with grade numbers
  
  // Find table rows with grade-like content
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  const cellRegex = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;
  
  // First pass: find header row with months to identify the marks table
  const allRows: string[][] = [];
  let match;
  
  while ((match = rowRegex.exec(html)) !== null) {
    const rowHtml = match[1];
    const cells: string[] = [];
    let cellMatch;
    cellRegex.lastIndex = 0;
    while ((cellMatch = cellRegex.exec(rowHtml)) !== null) {
      cells.push(cleanText(cellMatch[1]));
    }
    if (cells.length >= 2) {
      allRows.push(cells);
    }
  }
  
  console.log('[MD-HTML] Total table rows found:', allRows.length);
  
  // Find the header row with month names
  let headerRowIdx = -1;
  let monthByCol: Record<number, string> = {};
  let monthCols: number[] = [];
  
  for (let i = 0; i < allRows.length; i++) {
    const row = allRows[i];
    const first = row[0].toLowerCase();
    if (!first.includes('dalykas')) continue;
    
    const tempMonths: Record<number, string> = {};
    const tempCols: number[] = [];
    for (let j = 1; j < row.length; j++) {
      const m = findMonth(row[j]);
      if (m) { tempMonths[j] = m; tempCols.push(j); }
    }
    
    if (tempCols.length > 0) {
      headerRowIdx = i;
      monthByCol = tempMonths;
      monthCols = tempCols;
      console.log('[MD-HTML] ✓ Marks table header at row', i, 'months:', 
        tempCols.map(c => `${c}:${tempMonths[c]}`).join(', '));
      break;
    }
  }
  
  if (headerRowIdx < 0) {
    console.log('[MD-HTML] No marks table header found');
    return grades;
  }
  
  // Parse data rows after header
  let currentSubject = '';
  let currentTeacher = '';
  let currentIsFormative = false;
  let gradeCounter: Record<string, number> = {};
  
  for (let i = headerRowIdx + 1; i < allRows.length; i++) {
    const row = allRows[i];
    if (row.length < 2) continue;
    // Skip separator/empty rows
    if (row.every(c => !c || /^[-–—]+$/.test(c))) continue;
    
    const firstCell = row[0];
    if (!firstCell) continue;
    
    // Check if this is a subject row
    const isSubjectCell = firstCell.length > 2 
      && !/^(10|[1-9])$/.test(firstCell)
      && !/^\d+[.,]\d+$/.test(firstCell)
      && /[a-ząčęėįšųūž]/i.test(firstCell);
    
    if (isSubjectCell) {
      const { baseSubject, isFormative } = stripFormativePrefix(firstCell);
      const cleaned = cleanSubjectName(baseSubject);
      if (isLikelySubject(cleaned)) {
        currentSubject = cleaned;
        currentIsFormative = isFormative;
        currentTeacher = '';
      }
    }
    
    if (!currentSubject) continue;
    
    // Extract grades from month columns
    for (const colIdx of monthCols) {
      if (colIdx >= row.length) continue;
      const cell = row[colIdx];
      if (!cell) continue;
      if (/^[nN]$/.test(cell) || /^įsk/i.test(cell) || /^\d+[.,]\d+$/.test(cell)) continue;
      
      const gradeMatches = [...cell.matchAll(/\b(10|[1-9])\b/g)];
      for (const gm of gradeMatches) {
        const gradeValue = parseInt(gm[1], 10);
        if (gradeValue < 1 || gradeValue > maxGrade) continue;
        
        const monthName = monthByCol[colIdx];
        const monthNum = MONTH_TO_NUMBER[monthName];
        const semester = monthNum ? getSemester(monthNum) : 'I';
        const dateStr = monthName ? monthToDateString(monthName) : new Date().toISOString().split('T')[0];
        
        const key = `${currentSubject}|${monthName}`;
        const count = gradeCounter[key] || 0;
        gradeCounter[key] = count + 1;
        const dayOptions = [8, 12, 15, 18, 22, 25];
        const day = dayOptions[count % dayOptions.length];
        const adjustedDate = dateStr.replace(/-\d{2}$/, `-${String(day).padStart(2, '0')}`);
        
        grades.push({
          subject: currentSubject,
          grade: gradeValue,
          gradeType: currentIsFormative ? 'Formuojamasis' : 'Įvertinimas',
          date: adjustedDate,
          semester,
          teacher: currentTeacher || 'Nenurodyta',
        });
      }
    }
  }
  
  console.log('[MD-HTML] HTML parser found:', grades.length, 'grades across',
    new Set(grades.map(g => g.subject)).size, 'subjects');
  return grades;
}

// ====== Persistence ======

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

    // Try markdown parser first
    let grades = parseGradesFromMarkdown(markdown);
    console.log('[MD] Markdown parser result:', grades.length, 'grades');

    // If too few, try HTML parser as fallback
    if (grades.length < 5 && html.length > 0) {
      console.log('[MD] Trying HTML parser fallback...');
      const htmlGrades = parseGradesFromHtml(html);
      console.log('[MD] HTML parser result:', htmlGrades.length, 'grades');
      if (htmlGrades.length > grades.length) {
        grades = htmlGrades;
        console.log('[MD] Using HTML parser results');
      }
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

        const fbGrades = parseGradesFromMarkdown(fbMarkdown);
        if (fbGrades.length <= grades.length && fbHtml.length > 0) {
          const fbHtmlGrades = parseGradesFromHtml(fbHtml);
          if (fbHtmlGrades.length > grades.length) {
            grades = fbHtmlGrades;
          }
        } else if (fbGrades.length > grades.length) {
          grades = fbGrades;
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
