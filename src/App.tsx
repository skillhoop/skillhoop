import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import LoadingScreen from './components/ui/LoadingScreen';
import { useSilentRefresh } from './hooks/useSilentRefresh';

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
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const BlogIndex = lazy(() => import('./pages/BlogIndex'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const AdminBlog = lazy(() => import('./pages/AdminBlog'));
const Test = lazy(() => import('./pages/Test'));
const DashboardShell = lazy(() => import('./pages/DashboardShell'));

function LoadingFallback() {
  return <LoadingScreen subMessage="Loading Application" />;
}

function RedirectMiToDashboard() {
  const location = useLocation();
  const to = location.pathname.replace(/^\/mi\/?/, '/dashboard') || '/dashboard';
  return <Navigate to={to + location.search + location.hash} replace />;
}

function AppContent() {
  useSilentRefresh();
  return (
    <>
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
          <Route path="/verify-email" element={<VerifyEmail />} />
          
          {/* Main app (auth) - Dashboard with dynamic routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardShell />} />
            <Route path="/dashboard/*" element={<DashboardShell />} />
          </Route>
          
          {/* Redirect legacy /mi URLs to /dashboard (preserve subpath) */}
          <Route path="/mi/*" element={<RedirectMiToDashboard />} />
        </Routes>
      </Suspense>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
