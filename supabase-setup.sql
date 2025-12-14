-- AMIGO SECRETO - Base de Datos Supabase
-- Ejecutar este script en: Supabase Dashboard > SQL Editor

-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla: sorteos
CREATE TABLE sorteos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    organizer_email TEXT NOT NULL,
    organizer_name TEXT NOT NULL,
    budget_mode TEXT NOT NULL CHECK (budget_mode IN ('fixed', 'voting')),
    budget_amount INTEGER,
    budget_locked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: participants
CREATE TABLE participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sorteo_id UUID NOT NULL REFERENCES sorteos(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    secret_friend_id UUID REFERENCES participants(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: wishes (deseos por prioridad)
CREATE TABLE wishes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
    priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
    description TEXT,
    links JSONB DEFAULT '[]'::jsonb,
    images JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(participant_id, priority)
);

-- Tabla: clues (pistas)
CREATE TABLE clues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participant_id UUID NOT NULL UNIQUE REFERENCES participants(id) ON DELETE CASCADE,
    clue_1 TEXT,
    clue_2 TEXT,
    clue_3 TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: budget_votes
CREATE TABLE budget_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sorteo_id UUID NOT NULL REFERENCES sorteos(id) ON DELETE CASCADE,
    participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(sorteo_id, participant_id)
);

-- Índices
CREATE INDEX idx_participants_sorteo ON participants(sorteo_id);
CREATE INDEX idx_participants_code ON participants(code);
CREATE INDEX idx_wishes_participant ON wishes(participant_id);

-- Habilitar RLS
ALTER TABLE sorteos ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE clues ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_votes ENABLE ROW LEVEL SECURITY;

-- Políticas (acceso público para simplificar)
CREATE POLICY "Public access" ON sorteos FOR ALL USING (true);
CREATE POLICY "Public access" ON participants FOR ALL USING (true);
CREATE POLICY "Public access" ON wishes FOR ALL USING (true);
CREATE POLICY "Public access" ON clues FOR ALL USING (true);
CREATE POLICY "Public access" ON budget_votes FOR ALL USING (true);
