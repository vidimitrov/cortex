-- Enable the pgvector extension
create extension if not exists vector;

-- Add embedding column to messages table
alter table public.messages 
add column if not exists embedding vector(1536);

-- Create a vector index for similarity search
create index if not exists messages_embedding_idx 
on public.messages 
using ivfflat (embedding vector_cosine_ops)
with (lists = 100);

-- Notify PostgREST about the schema change
notify pgrst, 'reload schema';
