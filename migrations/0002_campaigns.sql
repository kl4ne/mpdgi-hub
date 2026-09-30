PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS campaigns (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  source TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  created_by TEXT NOT NULL DEFAULT ''
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_campaigns_slug_source ON campaigns(slug,source);
CREATE INDEX IF NOT EXISTS idx_campaigns_created ON campaigns(created_at);

ALTER TABLE sessions ADD COLUMN session_campaign TEXT NOT NULL DEFAULT '';
ALTER TABLE events ADD COLUMN session_campaign TEXT NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_sessions_campaign ON sessions(session_campaign);
CREATE INDEX IF NOT EXISTS idx_events_session_campaign ON events(session_campaign);
