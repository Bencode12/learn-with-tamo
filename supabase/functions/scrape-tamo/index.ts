import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Tamo.lt scraper - handles authentication and grade extraction
// Based on reverse-engineering of the Tamo.lt login flow

interface TamoGrade {
  subject: string;
  grade: number;
  gradeType: string;
  date: string;
  semester: string;
  teacher: string;
  comment?: string;
}

interface TamoResponse {
  success: boolean;
  grades?: TamoGrade[];
  schedule?: any[];
  homework?: any[];
  lastSync?: string;
  error?: string;
  sessionValid?: boolean;
}

// Helper to extract CSRF token from HTML
function extractCSRFToken(html: string): string | null {
  const match = html.match(/name="__RequestVerificationToken"[^>]*value="([^"]+)"/);
  return match ? match[1] : null;
}

// Helper to extract anti-forgery token
function extractAntiForgeryToken(html: string): string | null {
  const match = html.match(/name="antiforgery_token"[^>]*value="([^"]+)"/);
  if (match) return match[1];
  
  // Try alternative pattern
  const altMatch = html.match(/__RequestVerificationToken.*?value="([^"]+)"/);
  return altMatch ? altMatch[1] : null;
}

// Parse grades from the gradebook HTML page
function parseGrades(html: string, parser: DOMParser): TamoGrade[] {
  const grades: TamoGrade[] = [];
  
  try {
    const doc = parser.parseFromString(html, 'text/html');
    if (!doc) return grades;

    // Look for grade table rows
    const gradeRows = doc.querySelectorAll('.grade-row, .diary-grade, tr[data-grade]');
    
    gradeRows.forEach((row: any) => {
      try {
        const subjectEl = row.querySelector('.subject, .subject-name, td:first-child');
        const gradeEl = row.querySelector('.grade, .grade-value, .mark');
        const dateEl = row.querySelector('.date, .grade-date');
        const typeEl = row.querySelector('.type, .grade-type');
        const teacherEl = row.querySelector('.teacher, .teacher-name');
        
        if (subjectEl && gradeEl) {
          const gradeText = gradeEl.textContent?.trim();
          const gradeNum = parseInt(gradeText || '0', 10);
          
          if (!isNaN(gradeNum) && gradeNum >= 1 && gradeNum <= 10) {
            grades.push({
              subject: subjectEl.textContent?.trim() || 'Unknown',
              grade: gradeNum,
              gradeType: typeEl?.textContent?.trim() || 'Įvertinimas',
              date: dateEl?.textContent?.trim() || new Date().toISOString().split('T')[0],
              semester: getSemester(new Date()),
              teacher: teacherEl?.textContent?.trim() || 'Nenurodyta',
            });
          }
        }
      } catch (e) {
        console.error('Error parsing grade row:', e);
      }
    });

    // Alternative parsing for different HTML structure
    if (grades.length === 0) {
      const tables = doc.querySelectorAll('table');
      tables.forEach((table: any) => {
        const rows = table.querySelectorAll('tr');
        rows.forEach((row: any, index: number) => {
          if (index === 0) return; // Skip header
          
          const cells = row.querySelectorAll('td');
          if (cells.length >= 3) {
            const gradeText = cells[1]?.textContent?.trim();
            const gradeNum = parseInt(gradeText || '0', 10);
            
            if (!isNaN(gradeNum) && gradeNum >= 1 && gradeNum <= 10) {
              grades.push({
                subject: cells[0]?.textContent?.trim() || 'Unknown',
                grade: gradeNum,
                gradeType: cells[2]?.textContent?.trim() || 'Įvertinimas',
                date: cells[3]?.textContent?.trim() || new Date().toISOString().split('T')[0],
                semester: getSemester(new Date()),
                teacher: cells[4]?.textContent?.trim() || 'Nenurodyta',
              });
            }
          }
        });
      });
    }
  } catch (error) {
    console.error('Error parsing grades HTML:', error);
  }
  
  return grades;
}

// Determine semester based on date
function getSemester(date: Date): string {
  const month = date.getMonth();
  // September - January = Semester I, February - June = Semester II
  return month >= 8 || month <= 0 ? 'I' : 'II';
}

// Main Tamo scraper class
class TamoScraper {
  private baseUrl = 'https://dienynas.tamo.lt';
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
      // Step 1: Get the login page to extract CSRF token
      const loginPageResponse = await fetch(`${this.baseUrl}/Prisijungimas`, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        redirect: 'manual',
      });

      this.updateCookies(loginPageResponse);
      const loginPageHtml = await loginPageResponse.text();
      const csrfToken = extractCSRFToken(loginPageHtml) || extractAntiForgeryToken(loginPageHtml);

      console.log('CSRF token found:', !!csrfToken);

      // Step 2: Submit login form
      const formData = new URLSearchParams();
      formData.append('UserName', username);
      formData.append('Password', password);
      if (csrfToken) {
        formData.append('__RequestVerificationToken', csrfToken);
      }

      const loginResponse = await fetch(`${this.baseUrl}/Prisijungimas`, {
        method: 'POST',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': this.getCookieHeader(),
          'Referer': `${this.baseUrl}/Prisijungimas`,
        },
        body: formData.toString(),
        redirect: 'manual',
      });

      this.updateCookies(loginResponse);

      // Check if login was successful (usually redirects to dashboard)
      const location = loginResponse.headers.get('location');
      const isSuccess = loginResponse.status === 302 && 
                       location && 
                       !location.includes('Prisijungimas') &&
                       !location.includes('error');

      console.log('Login response status:', loginResponse.status);
      console.log('Redirect location:', location);

      return isSuccess;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }

  async getGrades(): Promise<TamoGrade[]> {
    try {
      // Fetch the gradebook page
      const response = await fetch(`${this.baseUrl}/Dienynas/Pazymiai`, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Cookie': this.getCookieHeader(),
        },
      });

      if (response.status === 302) {
        // Session expired, need to re-login
        throw new Error('Session expired');
      }

      const html = await response.text();
      return parseGrades(html, this.parser);
    } catch (error) {
      console.error('Error fetching grades:', error);
      throw error;
    }
  }

  async getSchedule(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/Dienynas/Tvarkarastis`, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Cookie': this.getCookieHeader(),
        },
      });

      if (response.status === 302) {
        throw new Error('Session expired');
      }

      const html = await response.text();
      // Parse schedule HTML (simplified)
      return [];
    } catch (error) {
      console.error('Error fetching schedule:', error);
      throw error;
    }
  }

  async getHomework(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/Dienynas/NamuDarbai`, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Cookie': this.getCookieHeader(),
        },
      });

      if (response.status === 302) {
        throw new Error('Session expired');
      }

      const html = await response.text();
      // Parse homework HTML (simplified)
      return [];
    } catch (error) {
      console.error('Error fetching homework:', error);
      throw error;
    }
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

    const scraper = new TamoScraper();

    if (action === 'test_login') {
      // Test login with provided credentials
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
        .eq('service_name', 'tamo')
        .single();

      if (credError || !credentials) {
        return new Response(JSON.stringify({
          success: false,
          error: 'No Tamo credentials found. Please save your login details first.',
          requiresSetup: true,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Decrypt credentials (in production, use proper encryption)
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
          error: 'Failed to login to Tamo. Please check your credentials.',
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
            source: 'tamo',
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
        message: `Successfully synced ${grades.length} grades from Tamo`,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    throw new Error('Invalid action. Use "test_login" or "sync"');

  } catch (error) {
    console.error('Tamo scraper error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ 
      success: false,
      error: errorMessage,
      note: 'This scraper attempts to parse Tamo.lt. The HTML structure may change, requiring updates.',
    }), {
      status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
