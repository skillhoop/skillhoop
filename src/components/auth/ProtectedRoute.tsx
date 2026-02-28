import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { isUserAuthenticated } from '../../lib/supabase';
import LoadingScreen from '../ui/LoadingScreen';

export default function ProtectedRoute() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkSession = async () => {
      // Secure tunnel: if ghost session exists, allow Dashboard access without touching Supabase auth.
      const ghostSession = localStorage.getItem('skillhoop_ghost_session');
      if (ghostSession && location.pathname.startsWith('/dashboard')) {
        setIsAuthenticated(true);
        setIsChecking(false);
        return;
      }

      try {
        // Give the browser a moment to persist any recent auth writes (proxy/localStorage bridge).
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Primary: Supabase SDK session; Fallback: proxy/localStorage token to avoid false negatives.
        const authenticated = await isUserAuthenticated();
        setIsAuthenticated(authenticated);
      } catch (error) {
        console.error('Error checking session:', error);
        setIsAuthenticated(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkSession();
  }, [location.pathname]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, []);

  if (isChecking || isLoading) {
    return (
      <LoadingScreen
        message="Just a moment..."
        subMessage="Screen loading"
      />
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Render child routes if authenticated
  return <Outlet />;
}


