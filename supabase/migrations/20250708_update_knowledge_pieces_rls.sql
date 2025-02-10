-- Drop existing policies
DROP POLICY IF EXISTS "Users can view knowledge pieces in their sessions" ON knowledge_pieces;
DROP POLICY IF EXISTS "Users can create knowledge pieces in their sessions" ON knowledge_pieces;
DROP POLICY IF EXISTS "Users can update knowledge pieces in their sessions" ON knowledge_pieces;
DROP POLICY IF EXISTS "Users can delete knowledge pieces in their sessions" ON knowledge_pieces;

-- Create new policy that handles both insert and update
CREATE POLICY "Users can manage knowledge pieces in their sessions"
    ON knowledge_pieces
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM sessions
            WHERE sessions.id = knowledge_pieces.session_id
            AND sessions.user_id::text = auth.uid()::text
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM sessions
            WHERE sessions.id = knowledge_pieces.session_id
            AND sessions.user_id::text = auth.uid()::text
        )
    );
