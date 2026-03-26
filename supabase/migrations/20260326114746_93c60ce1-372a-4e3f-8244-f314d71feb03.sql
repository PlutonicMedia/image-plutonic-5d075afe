
ALTER TABLE saved_models
  ADD COLUMN IF NOT EXISTS client_id uuid,
  ADD COLUMN IF NOT EXISTS project_id uuid,
  ADD COLUMN IF NOT EXISTS scope text NOT NULL DEFAULT 'global',
  ADD COLUMN IF NOT EXISTS metadata jsonb;

CREATE TABLE IF NOT EXISTS saved_prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  client_id uuid,
  project_id uuid,
  scope text NOT NULL DEFAULT 'global',
  name text NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE saved_prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved_prompts" ON saved_prompts
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own saved_prompts" ON saved_prompts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own saved_prompts" ON saved_prompts
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own saved_prompts" ON saved_prompts
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
