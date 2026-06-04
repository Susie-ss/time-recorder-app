const { Pool } = require('@neondatabase/serverless');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Helper: test connection on startup
pool.query('SELECT 1').then(() => console.log('[DB] Postgres connected')).catch(err => console.error('[DB] Connection failed:', err.message));

// Run schema migration
async function migrate() {
  try {
    // Create tables + indexes
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name VARCHAR(100) NOT NULL, email VARCHAR(255) UNIQUE NOT NULL, password VARCHAR(255) NOT NULL, avatar TEXT, heartbeat_interval INTEGER DEFAULT 30, last_heartbeat TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT NOW());
      CREATE TABLE IF NOT EXISTS messages (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, type VARCHAR(20) NOT NULL, title TEXT NOT NULL, content TEXT NOT NULL, recipient VARCHAR(200) NOT NULL, contact TEXT, send_type VARCHAR(30) NOT NULL, send_time TEXT, file_url TEXT, file_name TEXT, created_at TIMESTAMPTZ DEFAULT NOW());
      CREATE TABLE IF NOT EXISTS assets (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, type VARCHAR(20) NOT NULL, title VARCHAR(200) NOT NULL, content TEXT, file_url TEXT, file_name TEXT, tags JSONB DEFAULT '[]'::jsonb, created_at TIMESTAMPTZ DEFAULT NOW());
      CREATE TABLE IF NOT EXISTS relatives (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, name VARCHAR(100) NOT NULL, relation VARCHAR(50) NOT NULL, personality TEXT NOT NULL, memories JSONB DEFAULT '[]'::jsonb, trained_assets JSONB DEFAULT '[]'::jsonb, avatar TEXT, created_at TIMESTAMPTZ DEFAULT NOW());
      CREATE TABLE IF NOT EXISTS chat_messages (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), relative_id UUID NOT NULL REFERENCES relatives(id) ON DELETE CASCADE, role VARCHAR(20) NOT NULL, content TEXT NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW());
      CREATE TABLE IF NOT EXISTS heartbeats (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, created_at TIMESTAMPTZ DEFAULT NOW());
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_messages_uid ON messages(user_id);
      CREATE INDEX IF NOT EXISTS idx_messages_ca ON messages(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_assets_uid ON assets(user_id);
      CREATE INDEX IF NOT EXISTS idx_relatives_uid ON relatives(user_id);
      CREATE INDEX IF NOT EXISTS idx_chat_rid ON chat_messages(relative_id);
      CREATE INDEX IF NOT EXISTS idx_heartbeats_uid ON heartbeats(user_id);
    `);
    console.log('[DB] Migration complete');
  } catch (err) {
    console.error('[DB] Migration error:', err.message);
  }
}

migrate();

module.exports = pool;
