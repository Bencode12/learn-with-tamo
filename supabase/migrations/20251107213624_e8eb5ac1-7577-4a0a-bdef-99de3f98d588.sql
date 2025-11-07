-- Create exams table
CREATE TABLE IF NOT EXISTS public.exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  time_limit_minutes INTEGER NOT NULL DEFAULT 60,
  questions JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  is_published BOOLEAN DEFAULT false
);

-- Create exam_attempts table
CREATE TABLE IF NOT EXISTS public.exam_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  time_taken_seconds INTEGER NOT NULL,
  answers JSONB NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  subject_breakdown JSONB
);

-- Create multiplayer_matches table
CREATE TABLE IF NOT EXISTS public.multiplayer_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code TEXT UNIQUE NOT NULL,
  room_name TEXT,
  mode TEXT NOT NULL CHECK (mode IN ('duos', 'team', 'ranked')),
  max_players INTEGER NOT NULL,
  current_players INTEGER DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('waiting', 'in_progress', 'completed')) DEFAULT 'waiting',
  subject TEXT,
  chapter TEXT,
  lesson TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create match_participants table
CREATE TABLE IF NOT EXISTS public.match_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES public.multiplayer_matches(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER DEFAULT 0,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  left_at TIMESTAMP WITH TIME ZONE,
  is_ready BOOLEAN DEFAULT false,
  UNIQUE(match_id, user_id)
);

-- Enable RLS
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.multiplayer_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_participants ENABLE ROW LEVEL SECURITY;

-- RLS Policies for exams
CREATE POLICY "Published exams viewable by everyone"
  ON public.exams FOR SELECT
  USING (is_published = true OR created_by = auth.uid());

CREATE POLICY "Staff can manage exams"
  ON public.exams FOR ALL
  USING (has_role(auth.uid(), 'staff') OR has_role(auth.uid(), 'admin'));

-- RLS Policies for exam_attempts
CREATE POLICY "Users can view own exam attempts"
  ON public.exam_attempts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own exam attempts"
  ON public.exam_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for multiplayer_matches
CREATE POLICY "Anyone can view active matches"
  ON public.multiplayer_matches FOR SELECT
  USING (status IN ('waiting', 'in_progress'));

CREATE POLICY "Users can create matches"
  ON public.multiplayer_matches FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Match creator can update"
  ON public.multiplayer_matches FOR UPDATE
  USING (auth.uid() = created_by);

-- RLS Policies for match_participants
CREATE POLICY "Participants can view match participants"
  ON public.match_participants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.match_participants mp
      WHERE mp.match_id = match_participants.match_id
      AND mp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join matches"
  ON public.match_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own participation"
  ON public.match_participants FOR UPDATE
  USING (auth.uid() = user_id);

-- Enable realtime for multiplayer
ALTER PUBLICATION supabase_realtime ADD TABLE public.multiplayer_matches;
ALTER PUBLICATION supabase_realtime ADD TABLE public.match_participants;

-- Create indexes for performance
CREATE INDEX idx_exams_subject ON public.exams(subject);
CREATE INDEX idx_exam_attempts_user ON public.exam_attempts(user_id);
CREATE INDEX idx_multiplayer_matches_status ON public.multiplayer_matches(status);
CREATE INDEX idx_match_participants_match ON public.match_participants(match_id);