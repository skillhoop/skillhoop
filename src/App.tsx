import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Loader2 } from 'lucide-react';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';

// Lazy load components for code splitting
const LandingPage = lazy(() => import('@/pages/LandingPage'));
const NewLandingPage = lazy(() => import('./pages/NewLandingPage'));
const Pricing = lazy(() => import('./pages/Pricing'));
const About = lazy(() => import('./pages/About'));
const FAQ = lazy(() => import('./pages/FAQ'));
const HelpCenter = lazy(() => import('./pages/HelpCenter'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const EmailSentPage = lazy(() => import('./pages/EmailSentPage'));
const BlogIndex = lazy(() => import('./pages/BlogIndex'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const AdminBlog = lazy(() => import('./pages/AdminBlog'));
const Test = lazy(() => import('./pages/Test'));
const MI = lazy(() => import('./pages/MI'));

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Loader2 className="w-16 h-16 text-indigo-600 animate-spin" />
        </div>
        <p className="text-indigo-600 font-medium mb-2">Just a moment...</p>
        <p className="text-indigo-500 text-sm">Loading Application</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Toaster position="top-center" richColors closeButton />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Landing pages */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/landing" element={<NewLandingPage />} />
          
          {/* Admin routes - Protected - MUST be near the top to avoid catch-all conflicts */}
          <Route element={<ProtectedRoute />}>
            <Route path="/admin/blog" element={<AdminBlog />} />
          </Route>
          
          {/* Test route for debugging */}
          <Route path="/test-admin" element={<div>Admin Route Works</div>} />
          
          {/* Pricing page - accessible to everyone */}
          <Route path="/pricing" element={<Pricing />} />
          
          {/* About page - accessible to everyone */}
          <Route path="/about" element={<About />} />
          
          {/* Test page - accessible to everyone */}
          <Route path="/test" element={<Test />} />
          
          {/* FAQ page - accessible to everyone */}
          <Route path="/faq" element={<FAQ />} />
          
          {/* Help Center page - accessible to everyone */}
          <Route path="/help" element={<HelpCenter />} />
          
          {/* Legal pages - accessible to everyone */}
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          
          {/* Blog routes - accessible to everyone */}
          <Route path="/blog" element={<BlogIndex />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          
          {/* Auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/email-sent" element={<EmailSentPage />} />
          
          {/* Main app (auth) - MI with SkillHoopSidebar */}
          <Route element={<ProtectedRoute />}>
            <Route path="/mi" element={<MI />} />
          </Route>
          
          {/* Redirect old dashboard URLs to main app */}
          <Route path="/dashboard" element={<Navigate to="/mi" replace />} />
          <Route path="/dashboard/*" element={<Navigate to="/mi" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
