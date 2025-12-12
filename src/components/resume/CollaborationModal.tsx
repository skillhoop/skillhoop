import React, { useState, useEffect } from 'react';
import { X, Share2, Copy, Check, Mail, Eye, Edit, MessageSquare, Trash2, Plus, Clock, Loader2 } from 'lucide-react';
import {
  createShareableLink,
  getSharedResumesForResume,
  addSharePermission,
  getResumePermissions,
  removeSharePermission,
  deleteShareableLink,
  addResumeComment,
  getResumeComments,
  toggleCommentResolved,
  deleteResumeComment,
  type SharedResume,
  type SharePermission,
  type ResumeComment,
} from '../../lib/resumeCollaboration';

interface CollaborationModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeId: string;
  resumeTitle: string;
}

type TabType = 'share' | 'permissions' | 'comments';

export default function CollaborationModal({
  isOpen,
  onClose,
  resumeId,
  resumeTitle,
}: CollaborationModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('share');
  const [sharedResumes, setSharedResumes] = useState<SharedResume[]>([]);
  const [permissions, setPermissions] = useState<SharePermission[]>([]);
  const [comments, setComments] = useState<ResumeComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPermission, setNewPermission] = useState<'view' | 'edit' | 'comment'>('view');
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);
  const [expiresInDays, setExpiresInDays] = useState<number | undefined>(30);
  
  // Loading states
  const [isLoadingShares, setIsLoadingShares] = useState(false);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isCreatingShare, setIsCreatingShare] = useState(false);
  const [isAddingPermission, setIsAddingPermission] = useState(false);
  const [isAddingComment, setIsAddingComment] = useState(false);

  useEffect(() => {
    if (isOpen && resumeId) {
      loadSharedResumes();
      loadPermissions();
      loadComments();
    }
  }, [isOpen, resumeId]);

  const loadSharedResumes = async () => {
    setIsLoadingShares(true);
    try {
      const shared = await getSharedResumesForResume(resumeId);
      setSharedResumes(shared);
    } catch (error) {
      console.error('Error loading shared resumes:', error);
    } finally {
      setIsLoadingShares(false);
    }
  };

  const loadPermissions = async () => {
    setIsLoadingPermissions(true);
    try {
      const perms = await getResumePermissions(resumeId);
      setPermissions(perms);
    } catch (error) {
      console.error('Error loading permissions:', error);
    } finally {
      setIsLoadingPermissions(false);
    }
  };

  const loadComments = async () => {
    setIsLoadingComments(true);
    try {
      const resumeComments = await getResumeComments(resumeId);
      setComments(resumeComments.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleCreateShareLink = async () => {
    setIsCreatingShare(true);
    try {
      const { shareId, url } = await createShareableLink(resumeId, resumeTitle, 'view', expiresInDays);
      await loadSharedResumes();
      
      // Copy to clipboard
      navigator.clipboard.writeText(url).then(() => {
        setCopiedLinkId(shareId);
        setTimeout(() => setCopiedLinkId(null), 2000);
      });
    } catch (error: any) {
      console.error('Error creating share link:', error);
      alert(error.message || 'Failed to create share link. Please try again.');
    } finally {
      setIsCreatingShare(false);
    }
  };

  const handleCopyLink = (url: string, shareId: string) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLinkId(shareId);
      setTimeout(() => setCopiedLinkId(null), 2000);
    });
  };

  const handleAddPermission = async () => {
    if (!newEmail.trim()) return;
    
    setIsAddingPermission(true);
    try {
      const success = await addSharePermission(resumeId, newEmail.trim(), newPermission, expiresInDays);
      if (success) {
        await loadPermissions();
        setNewEmail('');
        setNewPermission('view');
      } else {
        alert('Failed to add permission. Please try again.');
      }
    } catch (error: any) {
      console.error('Error adding permission:', error);
      alert(error.message || 'Failed to add permission. Please try again.');
    } finally {
      setIsAddingPermission(false);
    }
  };

  const handleRemovePermission = async (permissionId: string) => {
    try {
      const success = await removeSharePermission(permissionId);
      if (success) {
        await loadPermissions();
      } else {
        alert('Failed to remove permission. Please try again.');
      }
    } catch (error: any) {
      console.error('Error removing permission:', error);
      alert(error.message || 'Failed to remove permission. Please try again.');
    }
  };

  const handleDeleteShare = async (shareId: string) => {
    if (!confirm('Are you sure you want to delete this shareable link?')) return;
    
    try {
      const success = await deleteShareableLink(shareId);
      if (success) {
        await loadSharedResumes();
      } else {
        alert('Failed to delete share link. Please try again.');
      }
    } catch (error: any) {
      console.error('Error deleting share:', error);
      alert(error.message || 'Failed to delete share link. Please try again.');
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    setIsAddingComment(true);
    try {
      await addResumeComment(resumeId, newComment.trim());
      setNewComment('');
      await loadComments();
    } catch (error: any) {
      console.error('Error adding comment:', error);
      alert(error.message || 'Failed to add comment. Please try again.');
    } finally {
      setIsAddingComment(false);
    }
  };

  const handleToggleResolved = async (commentId: string) => {
    try {
      const success = await toggleCommentResolved(commentId);
      if (success) {
        await loadComments();
      } else {
        alert('Failed to update comment. Please try again.');
      }
    } catch (error: any) {
      console.error('Error toggling comment:', error);
      alert(error.message || 'Failed to update comment. Please try again.');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    
    try {
      const success = await deleteResumeComment(commentId);
      if (success) {
        await loadComments();
      } else {
        alert('Failed to delete comment. Please try again.');
      }
    } catch (error: any) {
      console.error('Error deleting comment:', error);
      alert(error.message || 'Failed to delete comment. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Collaborate & Share</h2>
            <p className="text-sm text-gray-600 mt-1">{resumeTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('share')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'share'
                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Share2 className="w-5 h-5" />
              <span>Share Links</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'permissions'
                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Mail className="w-5 h-5" />
              <span>Permissions</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'comments'
                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <MessageSquare className="w-5 h-5" />
              <span>Comments</span>
              {comments.filter(c => !c.resolved).length > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {comments.filter(c => !c.resolved).length}
                </span>
              )}
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'share' && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  Create shareable links to collaborate on your resume. Share with recruiters, mentors, or team members.
                </p>
                
                <div className="flex items-center gap-3 mb-4">
                  <select
                    value={expiresInDays || ''}
                    onChange={(e) => setExpiresInDays(e.target.value ? parseInt(e.target.value) : undefined)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="">Never expires</option>
                    <option value="7">7 days</option>
                    <option value="30">30 days</option>
                    <option value="90">90 days</option>
                  </select>
                  <button
                    onClick={handleCreateShareLink}
                    disabled={isCreatingShare}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isCreatingShare ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    Create Share Link
                  </button>
                </div>
              </div>

              {/* Existing Share Links */}
              {isLoadingShares ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                  <span className="ml-2 text-sm text-gray-600">Loading share links...</span>
                </div>
              ) : sharedResumes.length > 0 ? (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-900">Active Share Links</h3>
                  {sharedResumes.map((shared) => {
                    const url = `${window.location.origin}/dashboard/resume-studio?share=${shared.token}`;
                    return (
                      <div
                        key={shared.id}
                        className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-gray-900">
                                Share Link
                              </span>
                              <span className="text-xs text-gray-500">
                                Created {new Date(shared.createdAt).toLocaleDateString()}
                              </span>
                              {shared.expiresAt && (
                                <span className="text-xs text-orange-600">
                                  Expires {new Date(shared.expiresAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <input
                                type="text"
                                value={url}
                                readOnly
                                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white"
                              />
                              <button
                                onClick={() => handleCopyLink(url, shared.id)}
                                className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                title="Copy link"
                              >
                                {copiedLinkId === shared.id ? (
                                  <Check className="w-4 h-4 text-green-600" />
                                ) : (
                                  <Copy className="w-4 h-4 text-gray-600" />
                                )}
                              </button>
                              <button
                                onClick={() => handleDeleteShare(shared.id)}
                                className="px-3 py-2 bg-white border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                title="Delete link"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-8">
                  No share links created yet. Create one to get started.
                </p>
              )}
            </div>
          )}

          {activeTab === 'permissions' && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  Manage who can view, edit, or comment on your resume.
                </p>
                
                <div className="flex items-center gap-3 mb-4">
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <select
                    value={newPermission}
                    onChange={(e) => setNewPermission(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="view">View Only</option>
                    <option value="edit">Can Edit</option>
                    <option value="comment">Can Comment</option>
                  </select>
                  <button
                    onClick={handleAddPermission}
                    disabled={!newEmail.trim() || isAddingPermission}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isAddingPermission ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {isLoadingPermissions ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                  <span className="ml-2 text-sm text-gray-600">Loading permissions...</span>
                </div>
              ) : permissions.length > 0 ? (
                <div className="space-y-2">
                  {permissions.map((perm) => (
                    <div
                      key={perm.id}
                      className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {perm.permission === 'view' && <Eye className="w-4 h-4 text-gray-500" />}
                        {perm.permission === 'edit' && <Edit className="w-4 h-4 text-blue-500" />}
                        {perm.permission === 'comment' && <MessageSquare className="w-4 h-4 text-purple-500" />}
                        <div>
                          <p className="text-sm font-medium text-gray-900">{perm.email}</p>
                          <p className="text-xs text-gray-500 capitalize">{perm.permission} access</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {perm.expiresAt && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Expires {new Date(perm.expiresAt).toLocaleDateString()}
                          </span>
                        )}
                        <button
                          onClick={() => handleRemovePermission(perm.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-8">
                  No permissions added yet. Add someone to collaborate.
                </p>
              )}
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  Add comments and feedback on your resume. Great for getting input from mentors or reviewers.
                </p>
                
                <div className="flex gap-2 mb-4">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment or feedback..."
                    rows={3}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || isAddingComment}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors self-start"
                  >
                    {isAddingComment ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Comments List */}
              {isLoadingComments ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                  <span className="ml-2 text-sm text-gray-600">Loading comments...</span>
                </div>
              ) : comments.length > 0 ? (
                <div className="space-y-3">
                  {comments.map((comment) => (
                    <div
                      key={comment.id}
                      className={`p-4 border rounded-lg ${
                        comment.resolved
                          ? 'bg-gray-50 border-gray-200 opacity-75'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{comment.author}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(comment.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleResolved(comment.id)}
                            className={`text-xs px-2 py-1 rounded ${
                              comment.resolved
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {comment.resolved ? 'Resolved' : 'Mark Resolved'}
                          </button>
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700">{comment.content}</p>
                      {comment.sectionId && (
                        <p className="text-xs text-gray-500 mt-2">
                          Section: {comment.sectionId}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-8">
                  No comments yet. Add your first comment to get started.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
