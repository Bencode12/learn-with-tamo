import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

function getSetCookies(response: Response): string[] {
  const direct = (response.headers as any).getSetCookie?.();
  if (Array.isArray(direct) && direct.length > 0) return direct;
  const cookies: string[] = [];
  for (const [key, value] of response.headers.entries()) {
    if (key.toLowerCase() === 'set-cookie') cookies.push(value);
  }
  return cookies;
}

const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'lt-LT,lt;q=0.9,en-US;q=0.8,en;q=0.7',
  'Accept-Encoding': 'gzip, deflate, br',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache',
  'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"Windows"',
  'Upgrade-Insecure-Requests': '1',
};

class TamoScraper {
  private baseUrl = 'https://dienynas.tamo.lt';
  private cookies: Map<string, string> = new Map();

  private updateCookies(response: Response) {
    const setCookies = getSetCookies(response);
    for (const cookie of setCookies) {
      const [cookiePart] = cookie.split(';');
      const eqIdx = cookiePart.indexOf('=');
      if (eqIdx > 0) {
        this.cookies.set(cookiePart.substring(0, eqIdx), cookiePart.substring(eqIdx + 1));
      }
    }
  }

  private getCookieHeader(): string {
    return Array.from(this.cookies.entries()).map(([k, v]) => `${k}=${v}`).join('; ');
  }

  async login(username: string, password: string): Promise<boolean> {
    try {
      // Step 1: GET the login page to collect session cookies
      console.log('[Tamo] Step 1: Loading login page...');
      const loginPageRes = await fetch(`${this.baseUrl}/prisijungimas/login`, {
        method: 'GET',
        headers: {
          ...BROWSER_HEADERS,
          'sec-fetch-dest': 'document',
          'sec-fetch-mode': 'navigate',
          'sec-fetch-site': 'none',
          'sec-fetch-user': '?1',
        },
        redirect: 'manual',
      });
      this.updateCookies(loginPageRes);
      const pageHtml = await loginPageRes.text();
      console.log('[Tamo] Login page status:', loginPageRes.status, 'Cookies:', this.cookies.size);
      
      // Check for any verification token in the page
      const tokenMatch = pageHtml.match(/name="__RequestVerificationToken"[^>]*value="([^"]+)"/i);
      const token = tokenMatch ? tokenMatch[1] : null;
      console.log('[Tamo] CSRF token found:', !!token);

      // Follow any redirects from the login page
      const location = loginPageRes.headers.get('location');
      if (location) {
        console.log('[Tamo] Login page redirected to:', location);
        const redirectUrl = location.startsWith('http') ? location : `${this.baseUrl}${location}`;
        const redirectRes = await fetch(redirectUrl, {
          method: 'GET',
          headers: {
            ...BROWSER_HEADERS,
            'Cookie': this.getCookieHeader(),
            'Referer': `${this.baseUrl}/prisijungimas/login`,
          },
          redirect: 'manual',
        });
        this.updateCookies(redirectRes);
        await redirectRes.text();
      }

      // Step 2: POST login credentials
      // The form action is https://dienynas.tamo.lt/ (root)
      console.log('[Tamo] Step 2: Submitting credentials...');
      const formData = new URLSearchParams();
      formData.append('UserName', username.trim());
      formData.append('Password', password);
      if (token) {
        formData.append('__RequestVerificationToken', token);
      }

      const loginRes = await fetch(`${this.baseUrl}/`, {
        method: 'POST',
        headers: {
          ...BROWSER_HEADERS,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': this.getCookieHeader(),
          'Origin': this.baseUrl,
          'Referer': `${this.baseUrl}/prisijungimas/login`,
          'sec-fetch-dest': 'document',
          'sec-fetch-mode': 'navigate',
          'sec-fetch-site': 'same-origin',
          'sec-fetch-user': '?1',
        },
        body: formData.toString(),
        redirect: 'manual',
      });
      this.updateCookies(loginRes);
      const loginStatus = loginRes.status;
      const loginLocation = loginRes.headers.get('location') || '';
      console.log('[Tamo] Login POST status:', loginStatus, 'Location:', loginLocation);

      // If we get a redirect, follow it
      if (loginStatus === 301 || loginStatus === 302) {
        const redirectUrl = loginLocation.startsWith('http') ? loginLocation : `${this.baseUrl}${loginLocation}`;
        console.log('[Tamo] Following login redirect to:', redirectUrl);
        const afterLoginRes = await fetch(redirectUrl, {
          method: 'GET',
          headers: {
            ...BROWSER_HEADERS,
            'Cookie': this.getCookieHeader(),
            'Referer': `${this.baseUrl}/prisijungimas/login`,
            'sec-fetch-dest': 'document',
            'sec-fetch-mode': 'navigate',
            'sec-fetch-site': 'same-origin',
          },
          redirect: 'manual',
        });
        this.updateCookies(afterLoginRes);
        const afterStatus = afterLoginRes.status;
        const afterLocation = afterLoginRes.headers.get('location') || '';
        console.log('[Tamo] After-login status:', afterStatus, 'Location:', afterLocation);
        
        // Follow one more redirect if needed
        if (afterStatus === 301 || afterStatus === 302) {
          const url2 = afterLocation.startsWith('http') ? afterLocation : `${this.baseUrl}${afterLocation}`;
          const res2 = await fetch(url2, {
            method: 'GET',
            headers: {
              ...BROWSER_HEADERS,
              'Cookie': this.getCookieHeader(),
              'Referer': redirectUrl,
            },
            redirect: 'manual',
          });
          this.updateCookies(res2);
          await res2.text();
          console.log('[Tamo] Second redirect status:', res2.status);
        }
      } else if (loginStatus === 200) {
        // 200 on login POST usually means login failed (stayed on login page)
        const body = await loginRes.text();
        if (body.includes('Naudotojo vardas') && body.includes('Slaptažodis')) {
          console.log('[Tamo] Login appears to have failed (still on login page)');
          return false;
        }
      } else if (loginStatus === 403) {
        const body = await loginRes.text();
        console.log('[Tamo] Got 403. Response length:', body.length, 'First 200 chars:', body.substring(0, 200));
        return false;
      }

      // Step 3: Verify session by accessing grades page
      console.log('[Tamo] Step 3: Verifying session...');
      const verifyRes = await fetch(`${this.baseUrl}/dienynas/pazymiai`, {
        method: 'GET',
        headers: {
          ...BROWSER_HEADERS,
          'Cookie': this.getCookieHeader(),
          'Referer': this.baseUrl,
          'sec-fetch-dest': 'document',
          'sec-fetch-mode': 'navigate',
          'sec-fetch-site': 'same-origin',
        },
        redirect: 'manual',
      });
      this.updateCookies(verifyRes);
      const verifyLocation = (verifyRes.headers.get('location') || '').toLowerCase();
      console.log('[Tamo] Verify status:', verifyRes.status, 'Location:', verifyLocation);

      const isLoggedIn = verifyRes.status === 200 || 
        (verifyRes.status === 302 && !verifyLocation.includes('prisijungimas'));
      
      console.log('[Tamo] Login result:', isLoggedIn);
      return isLoggedIn;
    } catch (error) {
      console.error('[Tamo] Login error:', error);
      return false;
    }
  }

  async getGrades(): Promise<TamoGrade[]> {
    const grades: TamoGrade[] = [];
    
    try {
      const response = await fetch(`${this.baseUrl}/dienynas/pazymiai`, {
        method: 'GET',
        headers: {
          ...BROWSER_HEADERS,
          'Cookie': this.getCookieHeader(),
          'Referer': this.baseUrl,
        },
        redirect: 'manual',
      });

      if (response.status === 302) {
        const loc = (response.headers.get('location') || '').toLowerCase();
        if (loc.includes('prisijungimas')) throw new Error('Session expired');
      }

      if (response.status !== 200) {
        console.log('[Tamo] Grades page status:', response.status);
        return grades;
      }

      const html = await response.text();
      console.log('[Tamo] Grades page length:', html.length);

      // Parse grade data - Tamo uses tables with subject rows
      // Look for grade values in the HTML
      const gradeRegex = /class="[^"]*(?:grade|mark|pazymys)[^"]*"[^>]*>(\d{1,2})<\//gi;
      let match;
      while ((match = gradeRegex.exec(html)) !== null) {
        const num = parseInt(match[1], 10);
        if (num >= 1 && num <= 10) {
          grades.push({
            subject: 'Unknown',
            grade: num,
            gradeType: 'Įvertinimas',
            date: new Date().toISOString().split('T')[0],
            semester: getSemester(new Date()),
            teacher: 'Nenurodyta',
          });
        }
      }

      // Try table-based parsing
      if (grades.length === 0) {
        // Look for subject-grade patterns in table rows
        const rowRegex = /<tr[^>]*>[\s\S]*?<td[^>]*>([\s\S]*?)<\/td>[\s\S]*?<td[^>]*class="[^"]*(?:grade|mark)[^"]*"[^>]*>(\d{1,2})<\/td>/gi;
        while ((match = rowRegex.exec(html)) !== null) {
          const subject = match[1].replace(/<[^>]+>/g, '').trim();
          const num = parseInt(match[2], 10);
          if (subject && num >= 1 && num <= 10) {
            grades.push({
              subject,
              grade: num,
              gradeType: 'Įvertinimas',
              date: new Date().toISOString().split('T')[0],
              semester: getSemester(new Date()),
              teacher: 'Nenurodyta',
            });
          }
        }
      }

      console.log('[Tamo] Parsed grades count:', grades.length);
    } catch (error) {
      console.error('[Tamo] Error fetching grades:', error);
      throw error;
    }

    return grades;
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
    const scraper = new TamoScraper();

    if (action === 'test_login') {
      if (!username || !password) throw new Error('Username and password required');
      const success = await scraper.login(username, password);
      return new Response(JSON.stringify({
        success,
        message: success ? 'Login successful' : 'Login failed - check credentials or try again later',
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

      const loginSuccess = await scraper.login(
        decryptedCreds.username,
        atob(decryptedCreds.passwordHash)
      );

      if (!loginSuccess) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Failed to login to Tamo. The portal may be blocking automated access. Please try again later.',
          sessionValid: false,
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      const grades = await scraper.getGrades();

      for (const grade of grades) {
        await supabase.from('synced_grades').upsert({
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
        }, { onConflict: 'user_id,source,subject,date' });
      }

      return new Response(JSON.stringify({
        success: true,
        grades,
        lastSync: new Date().toISOString(),
        message: `Successfully synced ${grades.length} grades from Tamo`,
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
