PRAGMA foreign_keys = ON;

-- Stats v1.4.5 explicit schema hardening.
-- Safe to apply to an existing database after 0001_initial.sql and 0002_campaigns.sql.

CREATE UNIQUE INDEX IF NOT EXISTS idx_campaigns_slug_source ON campaigns(slug,source);
CREATE INDEX IF NOT EXISTS idx_campaigns_created ON campaigns(created_at);
CREATE INDEX IF NOT EXISTS idx_sessions_campaign ON sessions(session_campaign);
CREATE INDEX IF NOT EXISTS idx_events_session_campaign ON events(session_campaign);

CREATE TABLE IF NOT EXISTS collector_metrics (
  day_et TEXT PRIMARY KEY,
  received INTEGER NOT NULL DEFAULT 0,
  accepted INTEGER NOT NULL DEFAULT 0,
  duplicates INTEGER NOT NULL DEFAULT 0,
  rejected INTEGER NOT NULL DEFAULT 0,
  delayed INTEGER NOT NULL DEFAULT 0,
  last_received_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_collector_metrics_day ON collector_metrics(day_et);
