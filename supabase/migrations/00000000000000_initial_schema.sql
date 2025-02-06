-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create sessions table
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create resources table
CREATE TABLE resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('text', 'url', 'pdf', 'video')),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create knowledge_pieces table
CREATE TABLE knowledge_pieces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    structured_output TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create RLS policies
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_pieces ENABLE ROW LEVEL SECURITY;

-- Sessions policies
CREATE POLICY "Users can view their own sessions"
    ON sessions FOR SELECT
    USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create their own sessions"
    ON sessions FOR INSERT
    WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own sessions"
    ON sessions FOR UPDATE
    USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own sessions"
    ON sessions FOR DELETE
    USING (auth.uid()::text = user_id::text);

-- Resources policies
CREATE POLICY "Users can view resources in their sessions"
    ON resources FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM sessions
        WHERE sessions.id = resources.session_id
        AND sessions.user_id::text = auth.uid()::text
    ));

CREATE POLICY "Users can create resources in their sessions"
    ON resources FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM sessions
        WHERE sessions.id = resources.session_id
        AND sessions.user_id::text = auth.uid()::text
    ));

CREATE POLICY "Users can update resources in their sessions"
    ON resources FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM sessions
        WHERE sessions.id = resources.session_id
        AND sessions.user_id::text = auth.uid()::text
    ));

CREATE POLICY "Users can delete resources in their sessions"
    ON resources FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM sessions
        WHERE sessions.id = resources.session_id
        AND sessions.user_id::text = auth.uid()::text
    ));

-- Knowledge pieces policies
CREATE POLICY "Users can view knowledge pieces in their sessions"
    ON knowledge_pieces FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM sessions
        WHERE sessions.id = knowledge_pieces.session_id
        AND sessions.user_id::text = auth.uid()::text
    ));

CREATE POLICY "Users can create knowledge pieces in their sessions"
    ON knowledge_pieces FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM sessions
        WHERE sessions.id = knowledge_pieces.session_id
        AND sessions.user_id::text = auth.uid()::text
    ));

CREATE POLICY "Users can update knowledge pieces in their sessions"
    ON knowledge_pieces FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM sessions
        WHERE sessions.id = knowledge_pieces.session_id
        AND sessions.user_id::text = auth.uid()::text
    ));

CREATE POLICY "Users can delete knowledge pieces in their sessions"
    ON knowledge_pieces FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM sessions
        WHERE sessions.id = knowledge_pieces.session_id
        AND sessions.user_id::text = auth.uid()::text
    ));

-- Create indexes
CREATE INDEX sessions_user_id_idx ON sessions(user_id);
CREATE INDEX resources_session_id_idx ON resources(session_id);
CREATE INDEX knowledge_pieces_session_id_idx ON knowledge_pieces(session_id);
