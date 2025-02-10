-- Add unique constraint to knowledge_pieces table
ALTER TABLE knowledge_pieces ADD CONSTRAINT knowledge_pieces_session_id_key UNIQUE (session_id);
