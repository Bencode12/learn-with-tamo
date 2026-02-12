import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Fetch user's lesson progress
    const { data: progress } = await supabaseClient
      .from('lesson_progress')
      .select('*')
      .eq('user_id', user.id)
      .order('last_accessed', { ascending: false });

    // Analyze weak areas
    const weakAreas = progress?.filter(p => p.score && p.score < 70) || [];
    const strongAreas = progress?.filter(p => p.score && p.score >= 85) || [];

    const prompt = `Analyze this student's learning data and provide 3-5 personalized recommendations.

Weak areas (score < 70%): ${weakAreas.map(w => `${w.subject_id} - ${w.chapter_id}: ${w.score}%`).join(', ')}
Strong areas (score >= 85%): ${strongAreas.map(s => `${s.subject_id} - ${s.chapter_id}: ${s.score}%`).join(', ')}
Total lessons completed: ${progress?.filter(p => p.completed).length || 0}
Recent subjects: ${progress?.slice(0, 5).map(p => p.subject_id).join(', ')}

Provide specific, actionable recommendations in this JSON format:
{
  "recommendations": [
    {
      "title": "Focus on weak topic",
      "description": "Why and how to improve",
      "priority": "high/medium/low",
      "subjectId": "math",
      "chapterId": "algebra"
    }
  ]
}`;

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': Deno.env.get('GEMINI_API_KEY') || ''
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000
        }
      })
    });

    const aiData = await response.json();
    const aiText = aiData.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    
    // Parse JSON from AI response
    const jsonMatch = aiText.match(/\{[\s\S]*\}/);
    const recommendations = jsonMatch ? JSON.parse(jsonMatch[0]) : { recommendations: [] };

    return new Response(JSON.stringify(recommendations), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('AI Recommendations error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});