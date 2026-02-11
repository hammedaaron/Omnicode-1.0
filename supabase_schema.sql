
-- OMNICODE CLOUD ARCHITECTURE v3.2
-- Execute this in your Supabase SQL Editor

-- 1. CLEANUP (Optional: Only use if resetting)
-- DROP TABLE IF EXISTS public.conversions;
-- DROP TABLE IF EXISTS public.app_state;

-- 2. HISTORY TABLE (Archives)
CREATE TABLE IF NOT EXISTS public.conversions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    source_language TEXT NOT NULL,
    target_language TEXT NOT NULL,
    source_code TEXT NOT NULL,
    target_code TEXT NOT NULL,
    error_context TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. PERSISTENT STATE TABLE (Auto-save)
CREATE TABLE IF NOT EXISTS public.app_state (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    source_code TEXT,
    target_code TEXT,
    source_language TEXT DEFAULT 'auto',
    target_language TEXT DEFAULT 'python',
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 4. ROW LEVEL SECURITY (RLS)
-- This is what keeps your keys safe even if they are public
ALTER TABLE public.conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_state ENABLE ROW LEVEL SECURITY;

-- Conversions Policies
CREATE POLICY "Users can only insert their own data" 
ON public.conversions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only view their own data" 
ON public.conversions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own data" 
ON public.conversions FOR DELETE 
USING (auth.uid() = user_id);

-- App State Policies
CREATE POLICY "Users can fully manage their own workspace state" 
ON public.app_state FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 5. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_conversions_uid_date ON public.conversions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_app_state_uid ON public.app_state(user_id);

-- 6. TIMESTAMP AUTOMATION
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    return NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_state_update
    BEFORE UPDATE ON public.app_state
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();
