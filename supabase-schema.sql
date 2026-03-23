-- ═══════════════════════════════════════════════════════
-- TaskFlow Database Schema
-- Run this in Supabase → SQL Editor
-- ═══════════════════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── PROFILES (extends Supabase auth.users) ──────────────
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT NOT NULL,
  email       TEXT NOT NULL UNIQUE,
  role        TEXT NOT NULL CHECK (role IN ('manager','employee')),
  department  TEXT,
  avatar_color TEXT DEFAULT '#4361ee',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── TASKS ───────────────────────────────────────────────
CREATE TABLE tasks (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  note         TEXT,
  deadline     TEXT,                          -- e.g. "17:00"
  priority     TEXT NOT NULL DEFAULT 'mid'
               CHECK (priority IN ('high','mid','low')),
  status       TEXT NOT NULL DEFAULT 'todo'
               CHECK (status IN ('todo','inprogress','done','overdue')),
  progress     INT NOT NULL DEFAULT 0
               CHECK (progress BETWEEN 0 AND 100),
  task_date    DATE NOT NULL DEFAULT CURRENT_DATE,   -- which day this task belongs to
  locked       BOOLEAN DEFAULT FALSE,                -- locked after 11pm
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─── TASK AUDIT LOG ──────────────────────────────────────
CREATE TABLE task_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id     UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action      TEXT NOT NULL CHECK (action IN ('created','status_changed','progress_updated','note_updated','locked')),
  old_value   JSONB,
  new_value   JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── DAILY EMAIL LOG (prevent duplicate sends) ───────────
CREATE TABLE email_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  email_type  TEXT NOT NULL CHECK (email_type IN ('daily_summary','weekly_report')),
  sent_at     TIMESTAMPTZ DEFAULT NOW(),
  log_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  status      TEXT DEFAULT 'sent'
);

-- ═══════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════

ALTER TABLE profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks      ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_logs  ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: users see own, managers see all
CREATE POLICY "profiles_own"    ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_manager_read" ON profiles FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'manager'));

-- Tasks: employees see own tasks, managers see all
CREATE POLICY "tasks_own_select" ON tasks FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'manager')
  );
CREATE POLICY "tasks_own_insert" ON tasks FOR INSERT
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "tasks_own_update" ON tasks FOR UPDATE
  USING (user_id = auth.uid() AND locked = FALSE);
CREATE POLICY "tasks_manager_update" ON tasks FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'manager'));

-- Task logs: see own, managers see all
CREATE POLICY "logs_own_select" ON task_logs FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'manager')
  );
CREATE POLICY "logs_insert" ON task_logs FOR INSERT WITH CHECK (user_id = auth.uid());

-- ═══════════════════════════════════════════════════════
-- FUNCTIONS & TRIGGERS
-- ═══════════════════════════════════════════════════════

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tasks_updated_at    BEFORE UPDATE ON tasks    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-lock tasks at 11pm (called by cron)
CREATE OR REPLACE FUNCTION lock_todays_tasks()
RETURNS void AS $$
BEGIN
  UPDATE tasks SET locked = TRUE
  WHERE task_date = CURRENT_DATE AND locked = FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════
-- INDEXES (performance)
-- ═══════════════════════════════════════════════════════
CREATE INDEX idx_tasks_user_date    ON tasks (user_id, task_date DESC);
CREATE INDEX idx_tasks_date_status  ON tasks (task_date, status);
CREATE INDEX idx_task_logs_task_id  ON task_logs (task_id, created_at DESC);
CREATE INDEX idx_task_logs_user     ON task_logs (user_id, created_at DESC);

-- ═══════════════════════════════════════════════════════
-- SAMPLE DATA (optional — delete before production)
-- ═══════════════════════════════════════════════════════
-- First create users via Supabase Auth Dashboard or Auth API,
-- then insert into profiles:
--
-- INSERT INTO profiles (id, full_name, email, role, avatar_color) VALUES
--   ('AUTH_USER_UUID_1', 'Ahmed Hossain',    'manager@yourco.com',  'manager',  '#7c5cfc'),
--   ('AUTH_USER_UUID_2', 'রাহেলা আক্তার',    'rahela@yourco.com',   'employee', '#4361ee'),
--   ('AUTH_USER_UUID_3', 'সজীব হোসেন',       'sajib@yourco.com',    'employee', '#10b981'),
--   ('AUTH_USER_UUID_4', 'তানজিলা ইসলাম',    'tanzila@yourco.com',  'employee', '#f59e0b');
