import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ScopedModel {
  id: string;
  user_id: string;
  client_id: string | null;
  project_id: string | null;
  scope: string;
  name: string;
  image_url: string;
  metadata: any;
  created_at: string;
}

interface ScopedPrompt {
  id: string;
  user_id: string;
  client_id: string | null;
  project_id: string | null;
  scope: string;
  name: string;
  content: string;
  created_at: string;
}

export function useScopedData(userId: string | null, clientId: string | null, projectId: string | null) {
  const [models, setModels] = useState<ScopedModel[]>([]);
  const [prompts, setPrompts] = useState<ScopedPrompt[]>([]);

  const fetchModels = useCallback(async () => {
    if (!userId) return;
    let query = supabase.from('saved_models').select('*').eq('user_id', userId);

    // Build scope filter: global + client-scoped + project-scoped
    const scopeFilters: string[] = ['scope.eq.global'];
    if (clientId) scopeFilters.push(`and(scope.eq.client,client_id.eq.${clientId})`);
    if (projectId) scopeFilters.push(`and(scope.eq.project,project_id.eq.${projectId})`);

    query = query.or(scopeFilters.join(','));
    const { data } = await query.order('created_at', { ascending: false });
    if (data) setModels(data as ScopedModel[]);
  }, [userId, clientId, projectId]);

  const fetchPrompts = useCallback(async () => {
    if (!userId) return;
    let query = supabase.from('saved_prompts' as any).select('*').eq('user_id', userId);

    const scopeFilters: string[] = ['scope.eq.global'];
    if (clientId) scopeFilters.push(`and(scope.eq.client,client_id.eq.${clientId})`);
    if (projectId) scopeFilters.push(`and(scope.eq.project,project_id.eq.${projectId})`);

    query = query.or(scopeFilters.join(','));
    const { data } = await query.order('created_at', { ascending: false });
    if (data) setPrompts(data as ScopedPrompt[]);
  }, [userId, clientId, projectId]);

  useEffect(() => {
    fetchModels();
    fetchPrompts();
  }, [fetchModels, fetchPrompts]);

  const saveModel = async (name: string, imageUrl: string, scope: 'global' | 'client' | 'project', metadata?: any) => {
    if (!userId) return;
    const row: any = { user_id: userId, name, image_url: imageUrl, scope, metadata: metadata || null };
    if (scope === 'client' && clientId) row.client_id = clientId;
    if (scope === 'project' && projectId) row.project_id = projectId;
    await supabase.from('saved_models').insert(row);
    fetchModels();
  };

  const savePrompt = async (name: string, content: string, scope: 'global' | 'client' | 'project') => {
    if (!userId) return;
    const row: any = { user_id: userId, name, content, scope };
    if (scope === 'client' && clientId) row.client_id = clientId;
    if (scope === 'project' && projectId) row.project_id = projectId;
    await (supabase.from('saved_prompts' as any) as any).insert(row);
    fetchPrompts();
  };

  const deleteModel = async (id: string) => {
    await supabase.from('saved_models').delete().eq('id', id);
    fetchModels();
  };

  const deletePrompt = async (id: string) => {
    await (supabase.from('saved_prompts' as any) as any).delete().eq('id', id);
    fetchPrompts();
  };

  return { models, prompts, saveModel, savePrompt, deleteModel, deletePrompt, refetch: () => { fetchModels(); fetchPrompts(); } };
}
