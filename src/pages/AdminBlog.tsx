import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Plus, Publish, Eye, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  author: string;
  published_at: string | null;
  category: string | null;
  related_feature_link: string | null;
  created_at: string;
}

// Admin user ID - you can set this in environment variables or hardcode your user ID
const ADMIN_USER_ID = import.meta.env.VITE_ADMIN_USER_ID || '';

export default function AdminBlog() {
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState<BlogPost[]>([]);
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [topic, setTopic] = useState('');
  const [targetFeature, setTargetFeature] = useState('');
  const [featurePath, setFeaturePath] = useState('');

  useEffect(() => {
    checkAuthorization();
  }, []);

  useEffect(() => {
    if (isAuthorized) {
      fetchDrafts();
    }
  }, [isAuthorized]);

  const checkAuthorization = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsAuthorized(false);
        setLoading(false);
        return;
      }

      // Check if user is admin
      // If ADMIN_USER_ID is set, check against it
      // Otherwise, allow any authenticated user (you can restrict this further)
      if (ADMIN_USER_ID && user.id !== ADMIN_USER_ID) {
        setIsAuthorized(false);
        setLoading(false);
        return;
      }

      setIsAuthorized(true);
    } catch (err) {
      console.error('Error checking authorization:', err);
      setIsAuthorized(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchDrafts = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('blog_posts')
        .select('*')
        .is('published_at', null)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setDrafts(data || []);
    } catch (err) {
      console.error('Error fetching drafts:', err);
      setError('Failed to load drafts');
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || !targetFeature.trim() || !featurePath.trim()) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setGenerating(true);
      setError(null);
      setSuccess(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/api/admin/generate-blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: topic.trim(),
          targetFeature: targetFeature.trim(),
          featurePath: featurePath.trim(),
          userId: user.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate blog post');
      }

      const result = await response.json();
      setSuccess(`Blog post "${result.post.title}" generated successfully!`);
      setTopic('');
      setTargetFeature('');
      setFeaturePath('');
      await fetchDrafts();
    } catch (err) {
      console.error('Error generating blog post:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate blog post');
    } finally {
      setGenerating(false);
    }
  };

  const handlePublish = async (postId: string) => {
    try {
      setPublishing(postId);
      setError(null);
      setSuccess(null);

      const { error: updateError } = await supabase
        .from('blog_posts')
        .update({ published_at: new Date().toISOString() })
        .eq('id', postId);

      if (updateError) {
        throw updateError;
      }

      setSuccess('Blog post published successfully!');
      await fetchDrafts();
    } catch (err) {
      console.error('Error publishing blog post:', err);
      setError(err instanceof Error ? err.message : 'Failed to publish blog post');
    } finally {
      setPublishing(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
          <p className="text-slate-600 mb-4">You don't have permission to access this page.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Blog Admin Dashboard</h1>
          <p className="text-slate-600">Generate and manage blog posts</p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-800">
            <CheckCircle2 className="w-5 h-5" />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-800">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Generate Form */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Generate New Blog Post
          </h2>
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label htmlFor="topic" className="block text-sm font-medium text-slate-700 mb-2">
                Topic *
              </label>
              <input
                type="text"
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., How to Write a Standout Resume"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label htmlFor="targetFeature" className="block text-sm font-medium text-slate-700 mb-2">
                Target Feature Name *
              </label>
              <input
                type="text"
                id="targetFeature"
                value={targetFeature}
                onChange={(e) => setTargetFeature(e.target.value)}
                placeholder="e.g., Resume Studio"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label htmlFor="featurePath" className="block text-sm font-medium text-slate-700 mb-2">
                Feature Path *
              </label>
              <input
                type="text"
                id="featurePath"
                value={featurePath}
                onChange={(e) => setFeaturePath(e.target.value)}
                placeholder="e.g., /dashboard/resume-studio"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={generating}
              className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
            >
              {generating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Generate Draft
                </>
              )}
            </button>
          </form>
        </div>

        {/* Drafts List */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Drafts ({drafts.length})</h2>
          {drafts.length === 0 ? (
            <p className="text-slate-600 text-center py-8">No drafts available. Generate a new blog post above.</p>
          ) : (
            <div className="space-y-4">
              {drafts.map((draft) => (
                <div
                  key={draft.id}
                  className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900 mb-1">{draft.title}</h3>
                      {draft.excerpt && (
                        <p className="text-slate-600 text-sm mb-2 line-clamp-2">{draft.excerpt}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span>Author: {draft.author}</span>
                        <span>Created: {new Date(draft.created_at).toLocaleDateString()}</span>
                        {draft.related_feature_link && (
                          <span>Feature: {draft.related_feature_link}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => window.open(`/blog/${draft.slug}`, '_blank')}
                        className="px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg flex items-center gap-1"
                        title="Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handlePublish(draft.id)}
                        disabled={publishing === draft.id}
                        className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        {publishing === draft.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Publish className="w-4 h-4" />
                            Publish
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

