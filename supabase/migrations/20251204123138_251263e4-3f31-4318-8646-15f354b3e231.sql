
-- Add learning time tracking to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS daily_learning_time INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS learning_time_reset DATE NOT NULL DEFAULT CURRENT_DATE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_learning_time INTEGER NOT NULL DEFAULT 0;

-- Create random events table
CREATE TABLE IF NOT EXISTS public.random_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  questions JSONB NOT NULL,
  time_limit_seconds INTEGER DEFAULT 60,
  xp_reward INTEGER DEFAULT 50,
  active_from TIMESTAMP WITH TIME ZONE DEFAULT now(),
  active_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create random event completions
CREATE TABLE IF NOT EXISTS public.random_event_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  event_id UUID NOT NULL REFERENCES public.random_events(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, event_id)
);

-- Enable RLS
ALTER TABLE public.random_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.random_event_completions ENABLE ROW LEVEL SECURITY;

-- RLS policies for random events
CREATE POLICY "Random events viewable by authenticated users" ON public.random_events
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Staff can manage random events" ON public.random_events
  FOR ALL USING (has_role(auth.uid(), 'staff'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for completions
CREATE POLICY "Users can view own event completions" ON public.random_event_completions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own event completions" ON public.random_event_completions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create job interview sessions table
CREATE TABLE IF NOT EXISTS public.job_interview_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  job_title TEXT NOT NULL,
  company_name TEXT,
  experience_level TEXT NOT NULL,
  skills JSONB,
  ai_analysis JSONB,
  questions_asked JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.job_interview_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own interview sessions" ON public.job_interview_sessions
  FOR ALL USING (auth.uid() = user_id);

-- Insert sample random events
INSERT INTO public.random_events (event_type, title, description, questions, time_limit_seconds, xp_reward) VALUES
('integration_bee', 'Integration Bee Challenge', 'Solve as many integrals as possible in 60 seconds!', 
 '[{"question": "∫ 2x dx", "answer": "x² + C"}, {"question": "∫ cos(x) dx", "answer": "sin(x) + C"}, {"question": "∫ e^x dx", "answer": "e^x + C"}]'::jsonb, 60, 100),
('quick_quiz', 'Speed Math Quiz', 'Answer 5 math questions as fast as you can!',
 '[{"question": "15 × 7 = ?", "options": ["95", "105", "115", "85"], "correct": "105"}, {"question": "144 ÷ 12 = ?", "options": ["10", "11", "12", "13"], "correct": "12"}]'::jsonb, 30, 50),
('vocabulary_blitz', 'Vocabulary Blitz', 'Match words to their definitions!',
 '[{"word": "Ephemeral", "definition": "Lasting for a very short time"}, {"word": "Ubiquitous", "definition": "Present everywhere"}]'::jsonb, 45, 75);
