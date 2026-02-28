import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import LoadingScreen from '../ui/LoadingScreen';

export default function ProtectedRoute() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkSession = async () => {
      // Secure tunnel: if ghost session exists, allow Dashboard access without touching Supabase auth.
      const ghostSession = localStorage.getItem('skillhoop_ghost_session');
      if (ghostSession && location.pathname.startsWith('/dashboard')) {
        setIsAuthenticated(true);
        setIsLoading(false);
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);
      } catch (error) {
        console.error('Error checking session:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, [location.pathname]);

  if (isLoading) {
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


