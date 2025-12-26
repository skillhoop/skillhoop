import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Loader2 } from 'lucide-react';
import ProtectedRoute from './components/auth/ProtectedRoute';

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
const DashboardLayout = lazy(() => import('./components/layout/DashboardLayout'));
const DashboardHome = lazy(() => import('./pages/DashboardHome'));
const ResumeEditorPage = lazy(() => import('./pages/ResumeEditorPage'));
const ApplicationTailor = lazy(() => import('./pages/ApplicationTailor'));
const SmartCoverLetter = lazy(() => import('./pages/SmartCoverLetter'));
const JobFinder = lazy(() => import('./pages/JobFinder'));
const JobTracker = lazy(() => import('./pages/JobTracker'));
const InterviewPrep = lazy(() => import('./pages/InterviewPrep'));
const WorkHistoryManager = lazy(() => import('./pages/WorkHistoryManager'));
const BrandAudit = lazy(() => import('./pages/BrandAudit'));
const ContentEngine = lazy(() => import('./pages/ContentEngine'));
const AICareerPortfolio = lazy(() => import('./pages/AICareerPortfolio'));
const CareerEventScout = lazy(() => import('./pages/CareerEventScout'));
const EventScout = lazy(() => import('./pages/EventScout'));
const LinkedInOptimizer = lazy(() => import('./pages/LinkedInOptimizer'));
const UpskillingDashboard = lazy(() => import('./pages/UpskillingDashboard'));
const SkillRadar = lazy(() => import('./pages/SkillRadar'));
const LearningPath = lazy(() => import('./pages/LearningPath'));
const Sprints = lazy(() => import('./pages/Sprints'));
const Certifications = lazy(() => import('./pages/Certifications'));
const SkillBenchmarking = lazy(() => import('./pages/SkillBenchmarking'));
const BlogIndex = lazy(() => import('./pages/BlogIndex'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const AdminBlog = lazy(() => import('./pages/AdminBlog'));

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
      <Toaster position="top-center" richColors closeButton />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Landing pages - outside DashboardLayout */}
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
          
          {/* Auth routes - outside DashboardLayout */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/email-sent" element={<EmailSentPage />} />
          
          {/* Dashboard routes with layout - Protected */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardHome />} />
              
              {/* Career Hub Routes */}
              <Route path="resume-studio" element={<ResumeEditorPage />} />
              <Route path="application-tailor" element={<ApplicationTailor />} />
              <Route path="ai-cover-letter" element={<SmartCoverLetter />} />
              <Route path="job-finder" element={<JobFinder />} />
              <Route path="job-tracker" element={<JobTracker />} />
              <Route path="interview-prep" element={<InterviewPrep />} />
              <Route path="work-history" element={<WorkHistoryManager />} />
              
              {/* Brand Building Routes */}
              <Route path="brand-audit" element={<BrandAudit />} />
              <Route path="content-engine" element={<ContentEngine />} />
              <Route path="portfolio" element={<AICareerPortfolio />} />
              <Route path="career-event-scout" element={<CareerEventScout />} />
              <Route path="event-scout" element={<EventScout />} />
              <Route path="linkedin-optimizer" element={<LinkedInOptimizer />} />
              
              {/* Upskilling Routes */}
              <Route path="upskilling" element={<UpskillingDashboard />} />
              <Route path="skill-radar" element={<SkillRadar />} />
              <Route path="learning-path" element={<LearningPath />} />
              <Route path="sprints" element={<Sprints />} />
              <Route path="certifications" element={<Certifications />} />
              <Route path="benchmarking" element={<SkillBenchmarking />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
