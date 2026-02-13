import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Švietimo Centras scraper - handles authentication and grade extraction
// Based on reverse-engineering of the Švietimo Centras login flow

interface SvietimoCentrasGrade {
  subject: string;
  grade: number;
  gradeType: string;
  date: string;
  semester: string;
  teacher: string;
  comment?: string;
}

interface SvietimoCentrasResponse {
  success: boolean;
  grades?: SvietimoCentrasGrade[];
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

// Parse grades from Švietimo Centras HTML
function parseGrades(html: string, parser: DOMParser): SvietimoCentrasGrade[] {
  const grades: SvietimoCentrasGrade[] = [];
  
  try {
    const doc = parser.parseFromString(html, 'text/html');
    if (!doc) return grades;

    // Look for grade table rows with various selectors
    const selectors = [
      '.grade-row',
      '.pazymys-row',
      '.marks-table tr',
      '.grades-list .grade-item',
      '[data-grade]'
    ];

    for (const selector of selectors) {
      const gradeElements = doc.querySelectorAll(selector);
      if (gradeElements.length > 0) {
        gradeElements.forEach((el: any) => {
          try {
            // Extract grade information
            const subjectEl = el.querySelector('.subject, .dalykas, .subject-name');
            const gradeEl = el.querySelector('.grade, .pazymys, .mark, .grade-value');
            const dateEl = el.querySelector('.date, .data');
            const typeEl = el.querySelector('.type, .tipas');
            const teacherEl = el.querySelector('.teacher, .mokytojas');
            
            if (subjectEl && gradeEl) {
              const gradeText = gradeEl.textContent?.trim() || gradeEl.getAttribute('data-grade');
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
            console.error('Error parsing grade element:', e);
          }
        });
        break;
      }
    }

    // Fallback: Parse table structure
    if (grades.length === 0) {
      const tables = doc.querySelectorAll('table.grades, table.pazymiai, .marks-table');
      tables.forEach((table: any) => {
        const rows = table.querySelectorAll('tbody tr, tr:not(:first-child)');
        rows.forEach((row: any) => {
          const cells = row.querySelectorAll('td');
          if (cells.length >= 2) {
            // Look for grade cells (usually contain just a number)
            for (let i = 1; i < cells.length; i++) {
              const text = cells[i]?.textContent?.trim();
              const num = parseInt(text || '0', 10);
              
              if (!isNaN(num) && num >= 1 && num <= 10) {
                grades.push({
                  subject: cells[0]?.textContent?.trim() || 'Unknown',
                  grade: num,
                  gradeType: 'Įvertinimas',
                  date: new Date().toISOString().split('T')[0],
                  semester: getSemester(new Date()),
                  teacher: cells[cells.length - 1]?.textContent?.trim() || 'Nenurodyta',
                });
              }
            }
          }
        });
      });
    }
  } catch (error) {
    console.error('Error parsing Švietimo Centras grades:', error);
  }
  
  return grades;
}

// Main Švietimo Centras scraper class
class SvietimoCentrasScraper {
  private baseUrl = 'https://svietimocentras.lt';
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
      // Step 1: Get the login page to extract tokens
      const loginPageResponse = await fetch(`${this.baseUrl}/Prisijungimas`, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'lt,en;q=0.9',
        },
        redirect: 'manual',
      });

      this.updateCookies(loginPageResponse);
      const loginPageHtml = await loginPageResponse.text();
      const csrfToken = extractCSRFToken(loginPageHtml);
      const hiddenFields = extractHiddenFields(loginPageHtml);

      console.log('CSRF token found:', !!csrfToken);
      console.log('Hidden fields found:', Object.keys(hiddenFields));

      // Step 2: Submit login form
      const formData = new URLSearchParams();
      
      // Add hidden fields
      Object.entries(hiddenFields).forEach(([key, value]) => {
        formData.append(key, value);
      });
      
      // Add credentials with various field names
      formData.append('UserName', username);
      formData.append('Password', password);
      formData.append('username', username);
      formData.append('password', password);
      formData.append('vartotojas', username);
      formData.append('slaptazodis', password);
      
      if (csrfToken) {
        formData.append('__RequestVerificationToken', csrfToken);
      }

      const loginResponse = await fetch(`${this.baseUrl}/Prisijungimas`, {
        method: 'POST',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'lt,en;q=0.9',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': this.getCookieHeader(),
          'Referer': `${this.baseUrl}/Prisijungimas`,
          'Origin': this.baseUrl,
        },
        body: formData.toString(),
        redirect: 'manual',
      });

      this.updateCookies(loginResponse);

      // Check if login was successful
      const location = loginResponse.headers.get('location');
      const responseText = await loginResponse.text();
      
      const isRedirectSuccess = loginResponse.status === 302 && 
                               location && 
                               (location.includes('dienynas') || 
                                location.includes('pagrindinis') ||
                                location.includes('dashboard'));
      
      const hasSessionCookie = this.cookies.some(c => 
        c.toLowerCase().includes('session') || 
        c.toLowerCase().includes('auth') ||
        c.toLowerCase().includes('asp.net')
      );

      const noErrorInResponse = !responseText.toLowerCase().includes('klaida') &&
                                !responseText.toLowerCase().includes('neteisingas') &&
                                !responseText.toLowerCase().includes('error') &&
                                !responseText.toLowerCase().includes('invalid');

      console.log('Login response status:', loginResponse.status);
      console.log('Redirect location:', location);
      console.log('Has session cookie:', hasSessionCookie);

      return (isRedirectSuccess || hasSessionCookie) && noErrorInResponse;
    } catch (error) {
      console.error('Švietimo Centras login error:', error);
      return false;
    }
  }

  async getGrades(): Promise<SvietimoCentrasGrade[]> {
    try {
      // Try multiple possible grade page URLs
      const gradeUrls = [
        `${this.baseUrl}/Dienynas/Pazymiai`,
        `${this.baseUrl}/Pazymiai`,
        `${this.baseUrl}/ManoPazymiai`,
        `${this.baseUrl}/Dienynas/Rezultatai`,
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
      console.error('Error fetching Švietimo Centras grades:', error);
      throw error;
    }
  }

  async getSchedule(): Promise<any[]> {
    try {
      const scheduleUrls = [
        `${this.baseUrl}/Dienynas/Tvarkarastis`,
        `${this.baseUrl}/Tvarkarastis`,
        `${this.baseUrl}/ManoTvarkarastis`,
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
          // Parse schedule HTML (simplified for now)
          return [];
        }
      }

      return [];
    } catch (error) {
      console.error('Error fetching schedule:', error);
      throw error;
    }
  }

  async getHomework(): Promise<any[]> {
    try {
      const homeworkUrls = [
        `${this.baseUrl}/Dienynas/NamuDarbai`,
        `${this.baseUrl}/NamuDarbai`,
        `${this.baseUrl}/ManoNamuDarbai`,
      ];

      for (const url of homeworkUrls) {
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
          // Parse homework HTML (simplified for now)
          return [];
        }
      }

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

    const scraper = new SvietimoCentrasScraper();

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
        .eq('service_name', 'svietimocentras')
        .single();

      if (credError || !credentials) {
        return new Response(JSON.stringify({
          success: false,
          error: 'No Švietimo Centras credentials found. Please save your login details first.',
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
          error: 'Failed to login to Švietimo Centras. Please check your credentials.',
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
            source: 'svietimocentras',
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
        message: `Successfully synced ${grades.length} grades from Švietimo Centras`,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    throw new Error('Invalid action. Use "test_login" or "sync"');

  } catch (error) {
    console.error('Švietimo Centras scraper error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ 
      success: false,
      error: errorMessage,
      note: 'This scraper attempts to parse Švietimo Centras. The HTML structure may change, requiring updates.',
    }), {
      status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});