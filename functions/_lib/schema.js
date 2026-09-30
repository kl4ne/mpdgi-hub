let schemaReadyPromise=null;

function hasColumn(result,name){
  return Array.isArray(result?.results)&&result.results.some(row=>String(row.name)===name);
}

async function addColumnIfMissing(db,table,column,definition){
  const info=await db.prepare('PRAGMA table_info('+table+')').all();
  if(hasColumn(info,column))return;
  try{
    await db.prepare('ALTER TABLE '+table+' ADD COLUMN '+column+' '+definition).run();
  }catch(error){
    if(!/duplicate column/i.test(String(error?.message||error)))throw error;
  }
}

async function upgrade(db){
  await db.prepare(`CREATE TABLE IF NOT EXISTS campaigns (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    source TEXT NOT NULL,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    created_by TEXT NOT NULL DEFAULT ''
  )`).run();
  await db.prepare('CREATE UNIQUE INDEX IF NOT EXISTS idx_campaigns_slug_source ON campaigns(slug,source)').run();
  await db.prepare('CREATE INDEX IF NOT EXISTS idx_campaigns_created ON campaigns(created_at)').run();

  await addColumnIfMissing(db,'sessions','session_campaign',"TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing(db,'events','session_campaign',"TEXT NOT NULL DEFAULT ''");
  await db.prepare('CREATE INDEX IF NOT EXISTS idx_sessions_campaign ON sessions(session_campaign)').run();
  await db.prepare('CREATE INDEX IF NOT EXISTS idx_events_session_campaign ON events(session_campaign)').run();

  await db.prepare(`CREATE TABLE IF NOT EXISTS collector_metrics (
    day_et TEXT PRIMARY KEY,
    received INTEGER NOT NULL DEFAULT 0,
    accepted INTEGER NOT NULL DEFAULT 0,
    duplicates INTEGER NOT NULL DEFAULT 0,
    rejected INTEGER NOT NULL DEFAULT 0,
    delayed INTEGER NOT NULL DEFAULT 0,
    last_received_at TEXT
  )`).run();
  await db.prepare('CREATE INDEX IF NOT EXISTS idx_collector_metrics_day ON collector_metrics(day_et)').run();

  await db.prepare(`INSERT OR IGNORE INTO campaigns(id,name,slug,source,active,created_at,created_by)
    SELECT 'legacy:'||acquisition_source||':'||acquisition_campaign,
           acquisition_campaign,acquisition_campaign,acquisition_source,1,MIN(first_seen_at),'legacy'
    FROM visitors
    WHERE acquisition_campaign<>'' AND acquisition_source IN ('link','qr','nfc')
    GROUP BY acquisition_source,acquisition_campaign`).run();
}

export function ensureCampaignSchema(env){
  if(!env?.STATS_DB)throw Object.assign(new Error('database_not_configured'),{status:503});
  if(!schemaReadyPromise){
    schemaReadyPromise=upgrade(env.STATS_DB).catch(error=>{schemaReadyPromise=null;throw error;});
  }
  return schemaReadyPromise;
}
