import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WorkflowNotifications, type WorkflowNotification } from '../../lib/workflowNotifications';
import { CheckCircle, Rocket, Clock, TrendingUp, Target, X, ArrowRight } from 'lucide-react';

interface ToastProps {
  notification: WorkflowNotification;
  onDismiss: (id: string) => void;
}

function WorkflowToast({ notification, onDismiss }: ToastProps) {
  const navigate = useNavigate();

  const getIcon = () => {
    switch (notification.type) {
      case 'workflow-completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'step-completed':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'workflow-started':
        return <Rocket className="w-5 h-5 text-purple-500" />;
      case 'milestone':
        return <TrendingUp className="w-5 h-5 text-amber-500" />;
      case 'inactivity':
        return <Clock className="w-5 h-5 text-orange-500" />;
      case 'step-started-reminder':
      case 'contextual-reminder':
        return <Clock className="w-5 h-5 text-slate-500" />;
      default:
        return <Target className="w-5 h-5 text-slate-500" />;
    }
  };

  const getBgColor = () => {
    switch (notification.type) {
      case 'workflow-completed':
        return 'bg-gradient-to-r from-green-500 to-emerald-600';
      case 'step-completed':
        return 'bg-gradient-to-r from-blue-500 to-slate-600';
      case 'workflow-started':
        return 'bg-gradient-to-r from-purple-500 to-pink-600';
      case 'milestone':
        return 'bg-gradient-to-r from-amber-500 to-orange-600';
      case 'inactivity':
        return 'bg-gradient-to-r from-orange-500 to-red-600';
      case 'step-started-reminder':
      case 'contextual-reminder':
        return 'bg-gradient-to-r from-slate-500 to-blue-600';
      default:
        return 'bg-gradient-to-r from-slate-500 to-purple-600';
    }
  };

  const handleAction = () => {
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
      onDismiss(notification.id);
    }
  };

  return (
    <div className={`${getBgColor()} rounded-xl p-4 text-white shadow-xl mb-3 animate-slideInRight`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-sm mb-1">{notification.title}</h4>
          <p className="text-white/90 text-sm mb-3">{notification.message}</p>
          {notification.actionUrl && notification.actionText && (
            <button
              onClick={handleAction}
              className="px-4 py-2 bg-white text-slate-700 rounded-lg font-semibold hover:bg-white/90 transition-all flex items-center gap-2 text-sm"
            >
              {notification.actionText}
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          onClick={() => onDismiss(notification.id)}
          className="flex-shrink-0 text-white/70 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function WorkflowToastContainer() {
  const [toasts, setToasts] = useState<WorkflowNotification[]>([]);
  const [dismissedToasts, setDismissedToasts] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Check for new notifications every 30 seconds
    const checkNotifications = () => {
      const newNotifications = WorkflowNotifications.checkAndGenerate();
      
      // Filter out dismissed and already shown toasts
      const filtered = newNotifications.filter(n => 
        !dismissedToasts.has(n.id) && 
        !toasts.some(t => t.id === n.id) &&
        (n.type === 'workflow-completed' || n.type === 'step-completed' || n.type === 'workflow-started' || n.priority === 'high')
      );

      if (filtered.length > 0) {
        setToasts(prev => [...prev, ...filtered].slice(-3)); // Max 3 toasts
      }
    };

    // Check immediately
    checkNotifications();

    // Then check every 30 seconds
    const interval = setInterval(checkNotifications, 30000);

    return () => clearInterval(interval);
  }, [dismissedToasts, toasts]);

  const handleDismiss = (id: string) => {
    setDismissedToasts(prev => new Set([...prev, id]));
    setToasts(prev => prev.filter(t => t.id !== id));
    WorkflowNotifications.markAsRead(id);
  };

  // Auto-dismiss toasts after 10 seconds
  useEffect(() => {
    toasts.forEach(toast => {
      const timer = setTimeout(() => {
        handleDismiss(toast.id);
      }, 10000);
      return () => clearTimeout(timer);
    });
  }, [toasts]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 w-full max-w-md space-y-3">
      {toasts.map(toast => (
        <WorkflowToast
          key={toast.id}
          notification={toast}
          onDismiss={handleDismiss}
        />
      ))}
    </div>
  );
}

