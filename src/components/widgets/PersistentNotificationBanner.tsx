import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { WorkflowNotifications, type WorkflowNotification } from '../../lib/workflowNotifications';
import { CheckCircle, X, ArrowRight, Rocket, Clock } from 'lucide-react';

export default function PersistentNotificationBanner() {
  const navigate = useNavigate();
  const [persistentNotifications, setPersistentNotifications] = useState<WorkflowNotification[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadPersistentNotifications = () => {
      const notifications = WorkflowNotifications.getPersistentNotifications();
      setPersistentNotifications(notifications.filter(n => !dismissedIds.has(n.id)));
    };

    loadPersistentNotifications();
    
    // Check every 30 seconds for new persistent notifications
    const interval = setInterval(loadPersistentNotifications, 30000);
    
    return () => clearInterval(interval);
  }, [dismissedIds]);

  if (persistentNotifications.length === 0) {
    return null;
  }

  // Show only the most recent persistent notification
  const notification = persistentNotifications[0];

  const handleDismiss = () => {
    setDismissedIds(prev => new Set([...prev, notification.id]));
    WorkflowNotifications.markAsRead(notification.id);
  };

  const handleAction = () => {
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
      handleDismiss();
    }
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'workflow-completed':
        return <CheckCircle className="w-6 h-6" />;
      case 'step-completed':
        return <CheckCircle className="w-6 h-6" />;
      case 'workflow-started':
        return <Rocket className="w-6 h-6" />;
      default:
        return <Clock className="w-6 h-6" />;
    }
  };

  const getBgColor = () => {
    switch (notification.type) {
      case 'workflow-completed':
        return 'bg-gradient-to-r from-green-500 to-emerald-600';
      case 'step-completed':
        return 'bg-gradient-to-r from-blue-500 to-indigo-600';
      case 'workflow-started':
        return 'bg-gradient-to-r from-purple-500 to-pink-600';
      default:
        return 'bg-gradient-to-r from-indigo-500 to-purple-600';
    }
  };

  return (
    <div className={`${getBgColor()} text-white shadow-xl rounded-xl p-4 mb-4 relative overflow-hidden animate-slideDown`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full -ml-12 -mb-12"></div>
      </div>

      <div className="relative z-10 flex items-start gap-4">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-lg mb-1">{notification.title}</h4>
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
          onClick={handleDismiss}
          className="flex-shrink-0 text-white/70 hover:text-white transition-colors p-1"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
