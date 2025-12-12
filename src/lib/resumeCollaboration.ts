/**
 * Resume Collaboration Utility
 * Handles sharing, permissions, and collaboration features for resumes
 * Uses Supabase for data persistence
 */

import { supabase } from './supabase';

export interface SharePermission {
  id: string;
  email: string;
  permission: 'view' | 'edit' | 'comment';
  createdAt: string;
  expiresAt?: string;
}

export interface ResumeComment {
  id: string;
  resumeId: string;
  author: string;
  authorEmail?: string;
  authorId?: string;
  content: string;
  sectionId?: string;
  createdAt: string;
  resolved?: boolean;
}

export interface SharedResume {
  id: string;
  resumeId: string;
  token: string;
  expiresAt?: string;
  createdAt: string;
}

/**
 * Create a shareable link for a resume
 */
export async function createShareableLink(
  resumeId: string,
  title: string,
  permission: 'view' | 'edit' = 'view',
  expiresInDays?: number
): Promise<{ shareId: string; url: string }> {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be authenticated to create shareable links');
    }

    // Generate a unique token
    const token = `share_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Calculate expiration date
    const expiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
      : null;

    // Insert into resume_shares table
    const { data, error } = await supabase
      .from('resume_shares')
      .insert({
        resume_id: resumeId,
        token: token,
        expires_at: expiresAt,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating shareable link:', error);
      throw error;
    }

    const baseUrl = window.location.origin;
    const shareUrl = `${baseUrl}/dashboard/resume-studio?share=${token}`;
    
    return { shareId: data.id, url: shareUrl };
  } catch (error) {
    console.error('Error creating shareable link:', error);
    throw error;
  }
}

/**
 * Get shared resume by token
 */
export async function getSharedResumeByToken(token: string): Promise<SharedResume | null> {
  try {
    const { data, error } = await supabase
      .from('resume_shares')
      .select('*')
      .eq('token', token)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      console.error('Error getting shared resume:', error);
      throw error;
    }

    // Check if expired
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return null;
    }

    return {
      id: data.id,
      resumeId: data.resume_id,
      token: data.token,
      expiresAt: data.expires_at,
      createdAt: data.created_at,
    };
  } catch (error) {
    console.error('Error getting shared resume:', error);
    return null;
  }
}

/**
 * Get all shared resumes for a resume ID
 */
export async function getSharedResumesForResume(resumeId: string): Promise<SharedResume[]> {
  try {
    const { data, error } = await supabase
      .from('resume_shares')
      .select('*')
      .eq('resume_id', resumeId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error getting shared resumes:', error);
      throw error;
    }

    // Filter out expired shares
    const now = new Date();
    return (data || [])
      .filter(share => !share.expires_at || new Date(share.expires_at) > now)
      .map(share => ({
        id: share.id,
        resumeId: share.resume_id,
        token: share.token,
        expiresAt: share.expires_at,
        createdAt: share.created_at,
      }));
  } catch (error) {
    console.error('Error getting shared resumes:', error);
    return [];
  }
}

/**
 * Add permission to a resume
 */
export async function addSharePermission(
  resumeId: string,
  email: string,
  role: 'view' | 'edit' | 'comment',
  expiresInDays?: number
): Promise<boolean> {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be authenticated to add permissions');
    }

    // Calculate expiration date
    const expiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
      : null;

    // Insert into resume_permissions table
    const { error } = await supabase
      .from('resume_permissions')
      .insert({
        resume_id: resumeId,
        user_email: email,
        role: role,
      });

    if (error) {
      console.error('Error adding share permission:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error adding share permission:', error);
    return false;
  }
}

/**
 * Get permissions for a resume
 */
export async function getResumePermissions(resumeId: string): Promise<SharePermission[]> {
  try {
    const { data, error } = await supabase
      .from('resume_permissions')
      .select('*')
      .eq('resume_id', resumeId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error getting permissions:', error);
      throw error;
    }

    return (data || []).map(perm => ({
      id: perm.id,
      email: perm.user_email,
      permission: perm.role as 'view' | 'edit' | 'comment',
      createdAt: perm.created_at,
      expiresAt: perm.expires_at,
    }));
  } catch (error) {
    console.error('Error getting permissions:', error);
    return [];
  }
}

/**
 * Remove permission from a resume
 */
export async function removeSharePermission(permissionId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('resume_permissions')
      .delete()
      .eq('id', permissionId);

    if (error) {
      console.error('Error removing share permission:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error removing share permission:', error);
    return false;
  }
}

/**
 * Delete a shareable link
 */
export async function deleteShareableLink(shareId: string): Promise<boolean> {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be authenticated to delete shareable links');
    }

    // Delete the share
    const { error } = await supabase
      .from('resume_shares')
      .delete()
      .eq('id', shareId);

    if (error) {
      console.error('Error deleting shareable link:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error deleting shareable link:', error);
    return false;
  }
}

/**
 * Add a comment to a resume
 */
export async function addResumeComment(
  resumeId: string,
  content: string,
  sectionId?: string
): Promise<ResumeComment> {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be authenticated to add comments');
    }

    // Get user email for display
    const userEmail = user.email || undefined;
    const authorName = user.user_metadata?.full_name || user.email || 'Anonymous';

    // Insert into resume_comments table
    const { data, error } = await supabase
      .from('resume_comments')
      .insert({
        resume_id: resumeId,
        content: content,
        section_id: sectionId || null,
        resolved: false,
        author_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding comment:', error);
      throw error;
    }

    return {
      id: data.id,
      resumeId: data.resume_id,
      author: authorName,
      authorEmail: userEmail,
      authorId: user.id,
      content: data.content,
      sectionId: data.section_id,
      createdAt: data.created_at,
      resolved: data.resolved || false,
    };
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
}

/**
 * Get comments for a resume
 */
export async function getResumeComments(resumeId: string): Promise<ResumeComment[]> {
  try {
    // Get current user to identify their own comments
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    const currentUserId = currentUser?.id;

    const { data, error } = await supabase
      .from('resume_comments')
      .select('*')
      .eq('resume_id', resumeId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error getting comments:', error);
      throw error;
    }

    // Map comments with author information
    return (data || []).map((comment: any) => {
      // If this is the current user's comment, show their info
      const isCurrentUser = currentUserId && comment.author_id === currentUserId;
      const authorEmail = isCurrentUser ? currentUser?.email : undefined;
      const authorName = isCurrentUser
        ? (currentUser?.user_metadata?.full_name || currentUser?.email || 'You')
        : 'User';

      return {
        id: comment.id,
        resumeId: comment.resume_id,
        author: authorName,
        authorEmail: authorEmail,
        authorId: comment.author_id,
        content: comment.content,
        sectionId: comment.section_id,
        createdAt: comment.created_at,
        resolved: comment.resolved || false,
      };
    });
  } catch (error) {
    console.error('Error getting comments:', error);
    return [];
  }
}

/**
 * Resolve/unresolve a comment
 */
export async function toggleCommentResolved(commentId: string): Promise<boolean> {
  try {
    // First get the current resolved status
    const { data: comment, error: fetchError } = await supabase
      .from('resume_comments')
      .select('resolved')
      .eq('id', commentId)
      .single();

    if (fetchError || !comment) {
      console.error('Error fetching comment:', fetchError);
      return false;
    }

    // Toggle the resolved status
    const { error } = await supabase
      .from('resume_comments')
      .update({ resolved: !comment.resolved })
      .eq('id', commentId);

    if (error) {
      console.error('Error toggling comment resolved:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error toggling comment resolved:', error);
    return false;
  }
}

/**
 * Delete a comment
 */
export async function deleteResumeComment(commentId: string): Promise<boolean> {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be authenticated to delete comments');
    }

    const { error } = await supabase
      .from('resume_comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error deleting comment:', error);
    return false;
  }
}
