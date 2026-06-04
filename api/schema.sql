-- ============================================
-- 时光留声机 - PostgreSQL Schema
-- 数据库: Neon Serverless Postgres
-- ============================================

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  avatar TEXT,
  heartbeat_interval INTEGER DEFAULT 30,
  last_heartbeat TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 留声舱消息表
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('text', 'audio', 'video')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  recipient VARCHAR(200) NOT NULL,
  contact TEXT,
  send_type VARCHAR(30) NOT NULL CHECK (send_type IN ('death_immediate', 'fixed_date', 'death_delay')),
  send_time TEXT,
  file_url TEXT,
  file_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 资产库表
CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL,
  title VARCHAR(200) NOT NULL,
  content TEXT,
  file_url TEXT,
  file_name TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 数字亲人表
CREATE TABLE IF NOT EXISTS relatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  relation VARCHAR(50) NOT NULL,
  personality TEXT NOT NULL,
  memories JSONB DEFAULT '[]'::jsonb,
  trained_assets JSONB DEFAULT '[]'::jsonb,
  avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI 对话消息表
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  relative_id UUID NOT NULL REFERENCES relatives(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 心跳记录表
CREATE TABLE IF NOT EXISTS heartbeats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== 索引 ====================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_assets_user_id ON assets(user_id);
CREATE INDEX IF NOT EXISTS idx_relatives_user_id ON relatives(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_relative_id ON chat_messages(relative_id);
CREATE INDEX IF NOT EXISTS idx_chat_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_heartbeats_user_id ON heartbeats(user_id);
CREATE INDEX IF NOT EXISTS idx_heartbeats_created ON heartbeats(created_at DESC);
