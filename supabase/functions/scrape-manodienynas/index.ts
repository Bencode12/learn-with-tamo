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
  'Accept-Language': 'lt-LT,lt;q=0.9,en-US;q=0.8,en;q=0.7',
  'Accept-Encoding': 'gzip, deflate, br',
  'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"Windows"',
};

class ManoDienynasScraper {
  private baseUrl = 'https://www.manodienynas.lt';
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
      // Step 1: Load login page for session cookies
      console.log('[ManoDienynas] Step 1: Loading login page...');
      const loginPageRes = await fetch(`${this.baseUrl}/1/lt/public/public/login`, {
        method: 'GET',
        headers: {
          ...BROWSER_HEADERS,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'sec-fetch-dest': 'document',
          'sec-fetch-mode': 'navigate',
          'sec-fetch-site': 'none',
          'sec-fetch-user': '?1',
          'Upgrade-Insecure-Requests': '1',
        },
        redirect: 'manual',
      });
      this.updateCookies(loginPageRes);
      await loginPageRes.text();
      console.log('[ManoDienynas] Login page status:', loginPageRes.status, 'Cookies:', this.cookies.size);

      // Follow redirect if any
      if (loginPageRes.status === 301 || loginPageRes.status === 302) {
        const loc = loginPageRes.headers.get('location') || '';
        const redirectUrl = loc.startsWith('http') ? loc : `${this.baseUrl}${loc}`;
        console.log('[ManoDienynas] Following redirect to:', redirectUrl);
        const r = await fetch(redirectUrl, {
          method: 'GET',
          headers: { ...BROWSER_HEADERS, 'Cookie': this.getCookieHeader() },
          redirect: 'manual',
        });
        this.updateCookies(r);
        await r.text();
      }

      // Step 2: AJAX login - form posts to /1/lt/ajax/user/login
      console.log('[ManoDienynas] Step 2: Submitting AJAX login...');
      const formData = new URLSearchParams();
      formData.append('username', username.trim());
      formData.append('password', password);
      formData.append('dienynas_remember_me', '1');

      const loginRes = await fetch(`${this.baseUrl}/1/lt/ajax/user/login`, {
        method: 'POST',
        headers: {
          ...BROWSER_HEADERS,
          'Accept': 'application/json, text/javascript, */*; q=0.01',
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'X-Requested-With': 'XMLHttpRequest',
          'Cookie': this.getCookieHeader(),
          'Origin': this.baseUrl,
          'Referer': `${this.baseUrl}/1/lt/public/public/login`,
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-origin',
        },
        body: formData.toString(),
        redirect: 'manual',
      });
      this.updateCookies(loginRes);
      const loginStatus = loginRes.status;
      const responseText = await loginRes.text();
      console.log('[ManoDienynas] Login status:', loginStatus, 'Response length:', responseText.length);
      console.log('[ManoDienynas] Response preview:', responseText.substring(0, 300));

      if (loginStatus === 403) {
        console.log('[ManoDienynas] Got 403 - portal is blocking automated requests');
        return false;
      }

      // Check for JSON response indicating success/failure
      try {
        const jsonRes = JSON.parse(responseText);
        console.log('[ManoDienynas] JSON response:', JSON.stringify(jsonRes).substring(0, 200));
        if (jsonRes.success === false || jsonRes.error) return false;
        if (jsonRes.redirect || jsonRes.success) return true;
      } catch {
        // Not JSON - check if it's HTML with error messages
        const lower = responseText.toLowerCase();
        if (lower.includes('neteising') || lower.includes('neteisingas')) return false;
      }

      // Step 3: Verify by accessing a protected page
      console.log('[ManoDienynas] Step 3: Verifying session...');
      const verifyRes = await fetch(`${this.baseUrl}/1/lt/diary/grades`, {
        method: 'GET',
        headers: {
          ...BROWSER_HEADERS,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Cookie': this.getCookieHeader(),
          'Referer': `${this.baseUrl}/1/lt/public/public/login`,
          'sec-fetch-dest': 'document',
          'sec-fetch-mode': 'navigate',
          'sec-fetch-site': 'same-origin',
        },
        redirect: 'manual',
      });
      this.updateCookies(verifyRes);
      const verifyLocation = (verifyRes.headers.get('location') || '').toLowerCase();
      console.log('[ManoDienynas] Verify status:', verifyRes.status, 'Location:', verifyLocation);

      const isLoggedIn = verifyRes.status === 200 ||
        (verifyRes.status === 302 && !verifyLocation.includes('/public/public/login'));

      console.log('[ManoDienynas] Login result:', isLoggedIn);
      return isLoggedIn;
    } catch (error) {
      console.error('[ManoDienynas] Login error:', error);
      return false;
    }
  }

  async getGrades(): Promise<ManoDienynasGrade[]> {
    const grades: ManoDienynasGrade[] = [];

    try {
      // Try multiple possible grade page URLs
      const urls = [
        `${this.baseUrl}/1/lt/diary/grades`,
        `${this.baseUrl}/1/lt/page/marks`,
        `${this.baseUrl}/1/lt/diary/marks`,
      ];

      for (const url of urls) {
        console.log('[ManoDienynas] Trying grades URL:', url);
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            ...BROWSER_HEADERS,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Cookie': this.getCookieHeader(),
            'Referer': this.baseUrl,
          },
          redirect: 'manual',
        });

        if (response.status === 302) {
          const loc = (response.headers.get('location') || '').toLowerCase();
          if (loc.includes('/public/public/login')) throw new Error('Session expired');
          continue;
        }

        if (response.status !== 200) continue;

        const html = await response.text();
        console.log('[ManoDienynas] Grades page length:', html.length);

        // Parse grade values from HTML using regex
        const gradeRegex = /class="[^"]*(?:grade|mark|pazymys|pazymiai)[^"]*"[^>]*>(\d{1,2})<\//gi;
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

        if (grades.length > 0) break;

        // Try data attributes
        const dataMarkRegex = /data-mark="(\d{1,2})"/gi;
        while ((match = dataMarkRegex.exec(html)) !== null) {
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

        if (grades.length > 0) break;
      }

      console.log('[ManoDienynas] Parsed grades count:', grades.length);
    } catch (error) {
      console.error('[ManoDienynas] Error fetching grades:', error);
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
    const scraper = new ManoDienynasScraper();

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

      const loginSuccess = await scraper.login(
        decryptedCreds.username,
        atob(decryptedCreds.passwordHash)
      );

      if (!loginSuccess) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Failed to login to ManoDienynas. The portal may be blocking automated access.',
          sessionValid: false,
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      const grades = await scraper.getGrades();

      for (const grade of grades) {
        await supabase.from('synced_grades').upsert({
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
        }, { onConflict: 'user_id,source,subject,date' });
      }

      return new Response(JSON.stringify({
        success: true,
        grades,
        lastSync: new Date().toISOString(),
        message: `Successfully synced ${grades.length} grades from ManoDienynas`,
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
