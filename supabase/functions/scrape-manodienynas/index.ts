import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ManoDienynas.lt scraper - handles authentication and grade extraction
// Based on reverse-engineering of the ManoDienynas login flow

interface ManoDienynasGrade {
  subject: string;
  grade: number;
  gradeType: string;
  date: string;
  semester: string;
  teacher: string;
  comment?: string;
}

interface ManoDienynasResponse {
  success: boolean;
  grades?: ManoDienynasGrade[];
  schedule?: any[];
  homework?: any[];
  messages?: any[];
  lastSync?: string;
  error?: string;
  sessionValid?: boolean;
}

// Helper to extract CSRF/verification tokens
function extractToken(html: string, name: string): string | null {
  const regex = new RegExp(`name="${name}"[^>]*value="([^"]+)"`, 'i');
  const match = html.match(regex);
  return match ? match[1] : null;
}

// Helper to extract hidden form fields
function extractHiddenFields(html: string): Record<string, string> {
  const fields: Record<string, string> = {};
  const regex = /<input[^>]*type="hidden"[^>]*>/gi;
  const matches = html.match(regex) || [];
  
  matches.forEach(input => {
    const nameMatch = input.match(/name="([^"]+)"/);
    const valueMatch = input.match(/value="([^"]*)"/);
    if (nameMatch && valueMatch) {
      fields[nameMatch[1]] = valueMatch[1];
    }
  });
  
  return fields;
}

// Determine semester based on date
function getSemester(date: Date): string {
  const month = date.getMonth();
  return month >= 8 || month <= 0 ? 'I' : 'II';
}

// Parse grades from ManoDienynas HTML
function parseGrades(html: string, parser: DOMParser): ManoDienynasGrade[] {
  const grades: ManoDienynasGrade[] = [];
  
  try {
    const doc = parser.parseFromString(html, 'text/html');
    if (!doc) return grades;

    // ManoDienynas uses various class patterns for grades
    const selectors = [
      '.grade-cell',
      '.mark',
      '.pazymys',
      'td.grade',
      '.diary-mark',
      '[data-mark]',
    ];

    for (const selector of selectors) {
      const gradeElements = doc.querySelectorAll(selector);
      if (gradeElements.length > 0) {
        gradeElements.forEach((el: any) => {
          const gradeText = el.textContent?.trim() || el.getAttribute('data-mark');
          const gradeNum = parseInt(gradeText || '0', 10);
          
          if (!isNaN(gradeNum) && gradeNum >= 1 && gradeNum <= 10) {
            // Try to find parent row for context
            const row = el.closest('tr') || el.parentElement;
            const cells = row?.querySelectorAll('td') || [];
            
            grades.push({
              subject: cells[0]?.textContent?.trim() || 'Unknown',
              grade: gradeNum,
              gradeType: el.getAttribute('data-type') || 'Įvertinimas',
              date: el.getAttribute('data-date') || new Date().toISOString().split('T')[0],
              semester: getSemester(new Date()),
              teacher: cells[cells.length - 1]?.textContent?.trim() || 'Nenurodyta',
            });
          }
        });
        break;
      }
    }

    // Fallback: Parse table structure
    if (grades.length === 0) {
      const tables = doc.querySelectorAll('table.grades, table.pazymiai, .grades-table');
      tables.forEach((table: any) => {
        const rows = table.querySelectorAll('tbody tr, tr:not(:first-child)');
        rows.forEach((row: any) => {
          const cells = row.querySelectorAll('td');
          if (cells.length >= 2) {
            // Look for grade cells (usually contain just a number)
            cells.forEach((cell: any, index: number) => {
              if (index === 0) return; // Skip subject name column
              
              const text = cell.textContent?.trim();
              const num = parseInt(text || '0', 10);
              
              if (!isNaN(num) && num >= 1 && num <= 10) {
                grades.push({
                  subject: cells[0]?.textContent?.trim() || 'Unknown',
                  grade: num,
                  gradeType: 'Įvertinimas',
                  date: new Date().toISOString().split('T')[0],
                  semester: getSemester(new Date()),
                  teacher: 'Nenurodyta',
                });
              }
            });
          }
        });
      });
    }
  } catch (error) {
    console.error('Error parsing ManoDienynas grades:', error);
  }
  
  return grades;
}

// Parse schedule from HTML
function parseSchedule(html: string, parser: DOMParser): any[] {
  const schedule: any[] = [];
  
  try {
    const doc = parser.parseFromString(html, 'text/html');
    if (!doc) return schedule;

    const lessonElements = doc.querySelectorAll('.lesson, .pamoka, .schedule-item');
    lessonElements.forEach((el: any) => {
      const timeEl = el.querySelector('.time, .laikas');
      const subjectEl = el.querySelector('.subject, .dalykas');
      const teacherEl = el.querySelector('.teacher, .mokytojas');
      const roomEl = el.querySelector('.room, .kabinetas');

      if (subjectEl) {
        schedule.push({
          time: timeEl?.textContent?.trim() || '',
          subject: subjectEl.textContent?.trim() || '',
          teacher: teacherEl?.textContent?.trim() || '',
          room: roomEl?.textContent?.trim() || '',
        });
      }
    });
  } catch (error) {
    console.error('Error parsing schedule:', error);
  }
  
  return schedule;
}

// Main ManoDienynas scraper class
class ManoDienynasScraper {
  private baseUrl = 'https://www.manodienynas.lt';
  private cookies: string[] = [];
  private parser: DOMParser;

  constructor() {
    this.parser = new DOMParser();
  }

  private updateCookies(response: Response) {
    const setCookies = response.headers.getSetCookie?.() || [];
    setCookies.forEach(cookie => {
      const [cookiePart] = cookie.split(';');
      const existingIndex = this.cookies.findIndex(c => 
        c.split('=')[0] === cookiePart.split('=')[0]
      );
      if (existingIndex >= 0) {
        this.cookies[existingIndex] = cookiePart;
      } else {
        this.cookies.push(cookiePart);
      }
    });
  }

  private getCookieHeader(): string {
    return this.cookies.join('; ');
  }

  async login(username: string, password: string): Promise<boolean> {
    try {
      // Step 1: Get the login page to extract tokens and establish session
      const loginPageResponse = await fetch(`${this.baseUrl}/`, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'lt,en;q=0.9',
        },
        redirect: 'manual',
      });

      this.updateCookies(loginPageResponse);
      const loginPageHtml = await loginPageResponse.text();
      
      // Extract all hidden form fields
      const hiddenFields = extractHiddenFields(loginPageHtml);
      console.log('Found hidden fields:', Object.keys(hiddenFields));

      // Step 2: Submit login form
      const formData = new URLSearchParams();
      
      // Add hidden fields
      Object.entries(hiddenFields).forEach(([key, value]) => {
        formData.append(key, value);
      });
      
      // Add credentials - ManoDienynas uses various field names
      formData.append('username', username);
      formData.append('password', password);
      formData.append('vartotojas', username);
      formData.append('slaptazodis', password);
      formData.append('email', username);

      const loginResponse = await fetch(`${this.baseUrl}/prisijungimas`, {
        method: 'POST',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'lt,en;q=0.9',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': this.getCookieHeader(),
          'Referer': `${this.baseUrl}/`,
          'Origin': this.baseUrl,
        },
        body: formData.toString(),
        redirect: 'manual',
      });

      this.updateCookies(loginResponse);

      // Check if login was successful
      const location = loginResponse.headers.get('location');
      const responseText = await loginResponse.text();
      
      // Success indicators
      const isRedirectSuccess = loginResponse.status === 302 && 
                                location && 
                                (location.includes('dienynas') || 
                                 location.includes('pagrindinis') ||
                                 location.includes('dashboard'));
      
      const hasSessionCookie = this.cookies.some(c => 
        c.toLowerCase().includes('session') || 
        c.toLowerCase().includes('auth') ||
        c.toLowerCase().includes('phpsessid')
      );

      const noErrorInResponse = !responseText.toLowerCase().includes('klaida') &&
                                !responseText.toLowerCase().includes('neteisingas') &&
                                !responseText.toLowerCase().includes('error');

      console.log('Login response status:', loginResponse.status);
      console.log('Redirect location:', location);
      console.log('Has session cookie:', hasSessionCookie);

      return (isRedirectSuccess || hasSessionCookie) && noErrorInResponse;
    } catch (error) {
      console.error('ManoDienynas login error:', error);
      return false;
    }
  }

  async getGrades(): Promise<ManoDienynasGrade[]> {
    try {
      // Try multiple possible grade page URLs
      const gradeUrls = [
        `${this.baseUrl}/dienynas/pazymiai`,
        `${this.baseUrl}/pazymiai`,
        `${this.baseUrl}/dienynas/grades`,
        `${this.baseUrl}/mokinys/pazymiai`,
      ];

      for (const url of gradeUrls) {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Cookie': this.getCookieHeader(),
          },
          redirect: 'manual',
        });

        if (response.status === 200) {
          const html = await response.text();
          const grades = parseGrades(html, this.parser);
          if (grades.length > 0) {
            return grades;
          }
        }
      }

      return [];
    } catch (error) {
      console.error('Error fetching ManoDienynas grades:', error);
      throw error;
    }
  }

  async getSchedule(): Promise<any[]> {
    try {
      const scheduleUrls = [
        `${this.baseUrl}/dienynas/tvarkarastis`,
        `${this.baseUrl}/tvarkarastis`,
        `${this.baseUrl}/mokinys/tvarkarastis`,
      ];

      for (const url of scheduleUrls) {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Cookie': this.getCookieHeader(),
          },
        });

        if (response.status === 200) {
          const html = await response.text();
          const schedule = parseSchedule(html, this.parser);
          if (schedule.length > 0) {
            return schedule;
          }
        }
      }

      return [];
    } catch (error) {
      console.error('Error fetching schedule:', error);
      throw error;
    }
  }

  async getHomework(): Promise<any[]> {
    // Placeholder for homework parsing
    return [];
  }

  async getMessages(): Promise<any[]> {
    // Placeholder for messages parsing
    return [];
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const body = await req.json();
    const { action, username, password } = body;

    const scraper = new ManoDienynasScraper();

    if (action === 'test_login') {
      if (!username || !password) {
        throw new Error('Username and password required for login test');
      }

      const loginSuccess = await scraper.login(username, password);
      
      return new Response(JSON.stringify({
        success: loginSuccess,
        message: loginSuccess ? 'Login successful' : 'Login failed - check credentials',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'sync') {
      // Fetch stored credentials
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
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Decrypt credentials
      let decryptedCreds;
      try {
        decryptedCreds = JSON.parse(credentials.encrypted_data);
      } catch {
        throw new Error('Failed to parse stored credentials');
      }

      // Attempt login
      const loginSuccess = await scraper.login(
        decryptedCreds.username,
        atob(decryptedCreds.passwordHash)
      );

      if (!loginSuccess) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Failed to login to ManoDienynas. Please check your credentials.',
          sessionValid: false,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Fetch grades
      const grades = await scraper.getGrades();

      // Store synced grades
      for (const grade of grades) {
        await supabase
          .from('synced_grades')
          .upsert({
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
          }, {
            onConflict: 'user_id,source,subject,date'
          });
      }

      return new Response(JSON.stringify({
        success: true,
        grades,
        lastSync: new Date().toISOString(),
        message: `Successfully synced ${grades.length} grades from ManoDienynas`,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    throw new Error('Invalid action. Use "test_login" or "sync"');

  } catch (error) {
    console.error('ManoDienynas scraper error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ 
      success: false,
      error: errorMessage,
      note: 'This scraper attempts to parse ManoDienynas.lt. The HTML structure may change, requiring updates.',
    }), {
      status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
