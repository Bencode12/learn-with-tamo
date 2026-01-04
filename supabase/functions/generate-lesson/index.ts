import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { subject, field, topic, difficulty, lessonNumber, weekNumber } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert educational content creator. Generate comprehensive, engaging lesson content for students. 
Your lessons should be:
- Clear and well-structured with multiple sections
- Include practical examples and exercises
- Have interactive quiz questions at the end
- Be appropriate for the difficulty level specified
- Include key concepts, explanations, and practice problems

Always respond with valid JSON in this exact format:
{
  "title": "Lesson title",
  "description": "Brief lesson overview",
  "duration_minutes": 45,
  "sections": [
    {
      "title": "Section title",
      "type": "theory|example|practice",
      "content": "Section content in markdown format"
    }
  ],
  "quiz": [
    {
      "question": "Question text",
      "options": ["A", "B", "C", "D"],
      "correct": 0,
      "explanation": "Why this answer is correct"
    }
  ],
  "key_concepts": ["concept1", "concept2"],
  "next_steps": "What to study next"
}`;

    const userPrompt = `Create a comprehensive lesson for:
- Subject: ${subject}
- Field: ${field}
- Topic: ${topic}
- Difficulty: ${difficulty}
- This is lesson ${lessonNumber} of week ${weekNumber}

Make the lesson engaging, educational, and include at least:
- 3-4 content sections (mix of theory, examples, and practice)
- 4-5 quiz questions of varying difficulty
- Clear explanations suitable for the difficulty level
- Real-world applications where appropriate`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No content generated");
    }

    // Parse JSON from the response, handling markdown code blocks
    let lessonContent;
    try {
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/```\n?([\s\S]*?)\n?```/);
      const jsonString = jsonMatch ? jsonMatch[1] : content;
      lessonContent = JSON.parse(jsonString.trim());
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      // Fallback lesson structure
      lessonContent = {
        title: `${topic} - Lesson ${lessonNumber}`,
        description: `Learn about ${topic} in ${field}`,
        duration_minutes: 45,
        sections: [
          {
            title: "Introduction",
            type: "theory",
            content: content
          }
        ],
        quiz: [
          {
            question: `What is the main topic of this lesson?`,
            options: [topic, "Something else", "Not sure", "None of the above"],
            correct: 0,
            explanation: `This lesson covers ${topic}`
          }
        ],
        key_concepts: [topic],
        next_steps: "Continue to the next lesson"
      };
    }

    return new Response(JSON.stringify({ lesson: lessonContent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating lesson:", error);
    return new Response(JSON.stringify({ error: error.message || "Failed to generate lesson" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});