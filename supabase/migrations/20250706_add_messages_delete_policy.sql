-- Add delete policy for messages
create policy "Users can delete their own messages"
  on public.messages for delete
  using (auth.uid() = user_id);

-- Notify PostgREST about the schema change
notify pgrst, 'reload schema';
