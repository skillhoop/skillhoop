import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  published_at: string;
  category: string | null;
  featured_image: string | null;
  related_feature_link: string | null;
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      fetchPost(slug);
    }
  }, [slug]);

  const fetchPost = async (postSlug: string) => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', postSlug)
        .not('published_at', 'is', null)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      if (!data) {
        throw new Error('Post not found');
      }

      setPost(data);
    } catch (err) {
      console.error('Error fetching blog post:', err);
      setError(err instanceof Error ? err.message : 'Failed to load blog post');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-12">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-slate-600">Loading blog post...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-slate-50 py-12">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error: {error || 'Post not found'}</p>
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Back Link */}
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </Link>

        {/* Category Badge */}
        {post.category && (
          <span className="inline-block px-3 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-full mb-6">
            {post.category}
          </span>
        )}

        {/* Title */}
        <h1 className="text-4xl font-bold text-slate-900 mb-3 text-center">
          {post.title}
        </h1>

        {/* Author - Subtle */}
        <p className="text-sm text-slate-500 text-center mb-8">
          SkillHoop Team
        </p>

        {/* Hero Image */}
        {post.featured_image ? (
          <img
            src={post.featured_image}
            alt={post.title}
            className="w-full h-64 object-cover rounded-xl shadow-md my-8"
          />
        ) : (
          <div className="w-full h-64 bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200 rounded-xl shadow-md my-8 flex items-center justify-center">
            <div className="text-slate-400 text-sm">No image available</div>
          </div>
        )}

        {/* Content */}
        <article>
          <div className="prose prose-lg prose-slate max-w-none mx-auto" dangerouslySetInnerHTML={{ __html: post.content }} />
        </article>

        {/* Related Feature CTA - Professional Card */}
        {post.related_feature_link && (
          <div className="mt-12 bg-white border border-slate-200 rounded-xl shadow-sm p-8">
            <h3 className="text-2xl font-semibold text-slate-900 mb-3">
              Ready to take action?
            </h3>
            <p className="text-slate-600 mb-6 text-lg">
              Use our tools to implement what you've learned and advance your career.
            </p>
            <Link
              to={post.related_feature_link}
              className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Get Started
            </Link>
          </div>
        )}

        {/* Footer spacing */}
        <div className="h-12"></div>
      </div>
    </div>
  );
}

