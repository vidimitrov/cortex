-- Create the match_messages function for similarity search
create or replace function match_messages(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  p_session_id uuid
)
returns table (
  id uuid,
  session_id uuid,
  user_id uuid,
  role text,
  content text,
  created_at timestamptz,
  embedding vector(1536),
  similarity float
)
language sql
stable
parallel safe
as $$
  select
    messages.id,
    messages.session_id,
    messages.user_id,
    messages.role,
    messages.content,
    messages.created_at,
    messages.embedding,
    1 - (messages.embedding <=> query_embedding) as similarity
  from messages
  where
    messages.session_id = p_session_id
    and messages.embedding is not null
    and 1 - (messages.embedding <=> query_embedding) > match_threshold
  order by messages.embedding <=> query_embedding
  limit match_count;
$$;

-- Update RLS policy to allow executing the function
grant execute on function match_messages(vector(1536), float, int, uuid) to authenticated;

-- Notify PostgREST about the schema change
notify pgrst, 'reload schema';
