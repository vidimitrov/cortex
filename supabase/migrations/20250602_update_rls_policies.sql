-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own sessions" ON sessions;
DROP POLICY IF EXISTS "Users can create their own sessions" ON sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON sessions;
DROP POLICY IF EXISTS "Users can delete their own sessions" ON sessions;

DROP POLICY IF EXISTS "Users can view resources in their sessions" ON resources;
DROP POLICY IF EXISTS "Users can create resources in their sessions" ON resources;
DROP POLICY IF EXISTS "Users can update resources in their sessions" ON resources;
DROP POLICY IF EXISTS "Users can delete resources in their sessions" ON resources;

DROP POLICY IF EXISTS "Users can view knowledge pieces in their sessions" ON knowledge_pieces;
DROP POLICY IF EXISTS "Users can create knowledge pieces in their sessions" ON knowledge_pieces;
DROP POLICY IF EXISTS "Users can update knowledge pieces in their sessions" ON knowledge_pieces;
DROP POLICY IF EXISTS "Users can delete knowledge pieces in their sessions" ON knowledge_pieces;

-- Recreate policies with proper type casting
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
