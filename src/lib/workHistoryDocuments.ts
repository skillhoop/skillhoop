import { supabase } from './supabase';

export type WorkHistoryDocType =
  | 'resume'
  | 'tailored-resume'
  | 'application-tailor'
  | 'cover-letter';

export interface WorkHistoryDocument {
  id: string;
  title: string;
  type: WorkHistoryDocType;
  content: string;
  jobTitle: string;
  company: string;
  status: 'draft' | 'completed';
  atsScore: number | null;
  createdAt: string;
  updatedAt: string;
  personalInfo?: { name?: string };
}

interface WorkHistoryRow {
  id: string;
  user_id: string;
  title: string;
  type: string;
  content: string;
  job_title: string;
  company: string;
  status: string;
  ats_score: number | null;
  created_at: string;
  updated_at: string;
}

function rowToDocument(row: WorkHistoryRow): WorkHistoryDocument {
  return {
    id: row.id,
    title: row.title,
    type: (row.type as WorkHistoryDocType) || 'resume',
    content: row.content ?? '',
    jobTitle: row.job_title ?? '',
    company: row.company ?? '',
    status: row.status === 'completed' ? 'completed' : 'draft',
    atsScore: row.ats_score,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toRowFields(document: Partial<WorkHistoryDocument>) {
  return {
    title: document.title ?? '',
    type: document.type ?? 'resume',
    content: document.content ?? '',
    job_title: document.jobTitle ?? '',
    company: document.company ?? '',
    status: document.status ?? 'draft',
    ats_score: document.atsScore ?? null,
  };
}

export const WorkHistoryStorage = {
  async getAllDocuments(userId: string): Promise<WorkHistoryDocument[]> {
    const { data, error } = await supabase
      .from('work_history_documents')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error loading work history documents:', error);
      return [];
    }
    return ((data ?? []) as WorkHistoryRow[]).map(rowToDocument);
  },

  async getDocumentById(userId: string, id: string): Promise<WorkHistoryDocument | null> {
    const { data, error } = await supabase
      .from('work_history_documents')
      .select('*')
      .eq('user_id', userId)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error loading work history document:', error);
      return null;
    }
    if (!data) return null;
    return rowToDocument(data as WorkHistoryRow);
  },

  async saveDocument(userId: string, document: Partial<WorkHistoryDocument>): Promise<WorkHistoryDocument> {
    const isUpdate = !!document.id;

    if (isUpdate) {
      const { data, error } = await supabase
        .from('work_history_documents')
        .update(toRowFields(document))
        .eq('user_id', userId)
        .eq('id', document.id!)
        .select('*')
        .single();

      if (error) {
        console.error('Error updating work history document:', error);
        throw error;
      }
      return rowToDocument(data as WorkHistoryRow);
    }

    const { data, error } = await supabase
      .from('work_history_documents')
      .insert({ user_id: userId, ...toRowFields(document) })
      .select('*')
      .single();

    if (error) {
      console.error('Error inserting work history document:', error);
      throw error;
    }
    return rowToDocument(data as WorkHistoryRow);
  },

  async deleteDocument(userId: string, id: string): Promise<boolean> {
    const { error } = await supabase.from('work_history_documents').delete().eq('user_id', userId).eq('id', id);

    if (error) {
      console.error('Error deleting work history document:', error);
      return false;
    }
    return true;
  },

  async bulkDeleteDocuments(userId: string, ids: string[]): Promise<boolean> {
    if (ids.length === 0) return true;
    const { error } = await supabase.from('work_history_documents').delete().eq('user_id', userId).in('id', ids);

    if (error) {
      console.error('Bulk delete work history documents:', error);
      return false;
    }
    return true;
  },
};
