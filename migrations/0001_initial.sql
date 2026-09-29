PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS admin_users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  password_iterations INTEGER NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS admin_sessions (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_admin_sessions_user ON admin_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expiry ON admin_sessions(expires_at);

CREATE TABLE IF NOT EXISTS login_rate (
  rate_key TEXT PRIMARY KEY,
  window_started INTEGER NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS events (
  event_id TEXT PRIMARY KEY,
  visitor_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  acquisition_source TEXT NOT NULL,
  acquisition_campaign TEXT NOT NULL DEFAULT '',
  session_entry TEXT NOT NULL,
  display_mode TEXT NOT NULL,
  language TEXT NOT NULL,
  app_version TEXT NOT NULL,
  device_category TEXT NOT NULL,
  browser TEXT NOT NULL,
  action_name TEXT NOT NULL DEFAULT '',
  target TEXT NOT NULL DEFAULT '',
  client_ts TEXT,
  server_ts TEXT NOT NULL,
  server_day_et TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_events_day ON events(server_day_et);
CREATE INDEX IF NOT EXISTS idx_events_session ON events(session_id);
CREATE INDEX IF NOT EXISTS idx_events_visitor ON events(visitor_id);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_source ON events(acquisition_source);
CREATE INDEX IF NOT EXISTS idx_events_entry ON events(session_entry);
CREATE INDEX IF NOT EXISTS idx_events_day_type ON events(server_day_et,event_type);
