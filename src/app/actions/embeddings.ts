'use server'

import { revalidatePath } from 'next/cache';
import OpenAI from 'openai';
import { generateEmbedding } from '@/lib/embeddings';
import { createAdminClient } from '@/lib/supabase';
import { Message, MessageRole } from '@/types';

export async function createMessageWithEmbedding(
  userId: string,
  sessionId: string,
  role: MessageRole,
  content: string
) {
  // Generate embedding server-side
  const embedding = await generateEmbedding(content);

  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from("messages")
    .insert([
      {
        user_id: userId,
        session_id: sessionId,
        role,
        content,
        embedding,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Supabase error:', error);
    throw new Error(error.message);
  }

  // Revalidate the session page to reflect the new message
  revalidatePath(`/dashboard/sessions/${sessionId}`, 'page');
  
  // Return a plain object instead of the Supabase response
  return {
    id: data.id,
    session_id: data.session_id,
    user_id: data.user_id,
    role: data.role as MessageRole,
    content: data.content,
    created_at: data.created_at,
    embedding: data.embedding
  } as Message;
}

export async function findSimilarMessages(
  sessionId: string,
  content: string,
  limit: number = 5
) {
  // Generate embedding server-side
  const embedding = await generateEmbedding(content);

  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .rpc('match_messages', {
      query_embedding: embedding,
      match_threshold: 0.7,
      match_count: limit,
      p_session_id: sessionId
    });

  if (error) {
    console.error('Supabase error:', error);
    throw new Error(error.message);
  }

  // Return plain objects instead of the Supabase response
  return data.map(item => ({
    id: item.id,
    session_id: item.session_id,
    user_id: item.user_id,
    role: item.role as MessageRole,
    content: item.content,
    created_at: item.created_at,
    embedding: item.embedding,
    similarity: item.similarity
  })) as (Message & { similarity: number })[];
}

export async function updateMessageEmbedding(messageId: string, content: string) {
  const embedding = await generateEmbedding(content);

  const adminClient = createAdminClient();
  const { error } = await adminClient
    .from("messages")
    .update({ embedding })
    .eq("id", messageId);

  if (error) {
    console.error('Supabase error:', error);
    throw new Error(error.message);
  }
}
