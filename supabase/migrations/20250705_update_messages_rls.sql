-- Drop existing policies
drop policy if exists "Users can view their own messages" on public.messages;
drop policy if exists "Users can insert their own messages" on public.messages;

-- Create updated policies
create policy "Users can view their own messages"
  on public.messages for select
  using (auth.uid() = user_id);

create policy "Users can insert their own messages"
  on public.messages for insert
  with check (
    auth.uid() = user_id AND
    exists (
      select 1 from public.sessions s
      where s.id = session_id
      and s.user_id = auth.uid()
    )
  );

create policy "Users can update their own messages"
  on public.messages for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Notify PostgREST about the schema change
notify pgrst, 'reload schema';
