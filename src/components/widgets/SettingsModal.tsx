import { useState, useEffect } from 'react';
import { Bug, Lightbulb, Bell, CheckCircle, Clock } from 'lucide-react';
import { WorkflowNotifications, type NotificationPreferences } from '../../lib/workflowNotifications';
import { getModalZIndexClass, getModalBackdropZIndexClass } from '../../lib/zIndex';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsTab = 'profile' | 'integrations' | 'billing' | 'invoices' | 'security' | 'notifications-settings' | 'support';

// Notification Settings Component
function NotificationSettingsContent() {
  const [preferences, setPreferences] = useState<NotificationPreferences>(
    WorkflowNotifications.getPreferences()
  );

  useEffect(() => {
    setPreferences(WorkflowNotifications.getPreferences());
  }, []);

  const handleToggle = (key: keyof NotificationPreferences) => {
    if (key === 'quietHours') return; // Handle separately
    const updated = { ...preferences, [key]: !preferences[key] };
    setPreferences(updated);
    WorkflowNotifications.savePreferences(updated);
  };

  const handleFrequencyChange = (frequency: 'immediate' | 'daily' | 'weekly') => {
    const updated = { ...preferences, reminderFrequency: frequency };
    setPreferences(updated);
    WorkflowNotifications.savePreferences(updated);
  };

  const handleQuietHoursToggle = () => {
    const updated = {
      ...preferences,
      quietHours: { ...preferences.quietHours, enabled: !preferences.quietHours.enabled }
    };
    setPreferences(updated);
    WorkflowNotifications.savePreferences(updated);
  };

  const handleQuietHoursTimeChange = (type: 'start' | 'end', value: string) => {
    const updated = {
      ...preferences,
      quietHours: { ...preferences.quietHours, [type]: value }
    };
    setPreferences(updated);
    WorkflowNotifications.savePreferences(updated);
  };

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-xl font-semibold text-slate-900 dark:text-white">Notification Settings</h4>
        <p className="text-slate-600 dark:text-slate-400 mt-1">Choose how and when you want to be notified about your workflows.</p>
      </div>

      {/* Master Toggle */}
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h5 className="font-semibold text-slate-900 dark:text-white">Enable Notifications</h5>
              <p className="text-sm text-slate-600 dark:text-slate-400">Turn all workflow notifications on or off</p>
            </div>
          </div>
          <button
            onClick={() => handleToggle('enabled')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              preferences.enabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                preferences.enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Notification Types */}
      <div className="space-y-4">
        <h5 className="font-semibold text-slate-900 dark:text-white">Notification Types</h5>
        
        <div className="space-y-3">
          <NotificationToggle
            label="Workflow Completed"
            description="Get notified when you complete a workflow"
            enabled={preferences.workflowCompleted}
            disabled={!preferences.enabled}
            onChange={() => handleToggle('workflowCompleted')}
          />
          <NotificationToggle
            label="Step Completed"
            description="Get notified when you complete a workflow step"
            enabled={preferences.stepCompleted}
            disabled={!preferences.enabled}
            onChange={() => handleToggle('stepCompleted')}
          />
          <NotificationToggle
            label="Milestones"
            description="Get notified at 25%, 50%, and 75% progress"
            enabled={preferences.milestones}
            disabled={!preferences.enabled}
            onChange={() => handleToggle('milestones')}
          />
          <NotificationToggle
            label="Inactivity Reminders"
            description="Get reminded if you haven't made progress in a while"
            enabled={preferences.inactivityReminders}
            disabled={!preferences.enabled}
            onChange={() => handleToggle('inactivityReminders')}
          />
          <NotificationToggle
            label="Contextual Reminders"
            description="Get reminded about steps you started but haven't completed"
            enabled={preferences.contextualReminders}
            disabled={!preferences.enabled}
            onChange={() => handleToggle('contextualReminders')}
          />
        </div>
      </div>

      {/* Reminder Frequency */}
      <div className="space-y-4">
        <h5 className="font-semibold text-slate-900 dark:text-white">Reminder Frequency</h5>
        <div className="flex gap-3">
          {(['immediate', 'daily', 'weekly'] as const).map((freq) => (
            <button
              key={freq}
              onClick={() => handleFrequencyChange(freq)}
              disabled={!preferences.enabled}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                preferences.reminderFrequency === freq
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              } ${!preferences.enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {freq.charAt(0).toUpperCase() + freq.slice(1)}
            </button>
          ))}
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {preferences.reminderFrequency === 'immediate' && 'Get notifications as soon as they occur'}
          {preferences.reminderFrequency === 'daily' && 'Get a daily summary of notifications'}
          {preferences.reminderFrequency === 'weekly' && 'Get a weekly summary of notifications'}
        </p>
      </div>

      {/* Quiet Hours */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h5 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Quiet Hours
            </h5>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Pause notifications during specific hours</p>
          </div>
          <button
            onClick={handleQuietHoursToggle}
            disabled={!preferences.enabled}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              preferences.quietHours.enabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
            } ${!preferences.enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                preferences.quietHours.enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {preferences.quietHours.enabled && (
          <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Start Time</label>
              <input
                type="time"
                value={preferences.quietHours.start}
                onChange={(e) => handleQuietHoursTimeChange('start', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">End Time</label>
              <input
                type="time"
                value={preferences.quietHours.end}
                onChange={(e) => handleQuietHoursTimeChange('end', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Notification Toggle Component
function NotificationToggle({
  label,
  description,
  enabled,
  disabled,
  onChange
}: {
  label: string;
  description: string;
  enabled: boolean;
  disabled: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
      <div className="flex-1">
        <p className="font-medium text-slate-900 dark:text-white">{label}</p>
        <p className="text-sm text-slate-600 dark:text-slate-400">{description}</p>
      </div>
      <button
        onClick={onChange}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  if (!isOpen) return null;

  const tabs: { id: SettingsTab; label: string }[] = [
    { id: 'profile', label: 'Profile' },
    { id: 'integrations', label: 'Integrations' },
    { id: 'billing', label: 'Manage Billing' },
    { id: 'invoices', label: 'Invoices' },
    { id: 'security', label: 'Security' },
    { id: 'notifications-settings', label: 'Notifications' },
    { id: 'support', label: 'Support' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div>
              <h4 className="text-xl font-semibold text-slate-900 dark:text-white">Personal Profile</h4>
              <p className="text-slate-600 dark:text-slate-400 mt-1">This is how your profile looks to others.</p>
            </div>
            <div className="flex items-center gap-4">
              <img 
                src="https://placehold.co/64x64/e2e8f0/64748b?text=U" 
                className="w-16 h-16 rounded-full object-cover" 
                alt="User Avatar" 
              />
              <div>
                <button className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg text-sm font-medium hover:bg-indigo-200 dark:hover:bg-indigo-900/50">
                  Change
                </button>
                <button className="p-2 text-slate-500 hover:text-red-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-slate-900 dark:text-white">
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                defaultValue="User Name"
                className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white/70 dark:bg-slate-700/50 text-slate-900 dark:text-white p-2"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-900 dark:text-white">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                defaultValue="user.name@example.com"
                className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white/70 dark:bg-slate-700/50 text-slate-900 dark:text-white p-2"
              />
            </div>
          </div>
        );

      case 'integrations':
        return (
          <div>
            <h4 className="text-xl font-semibold text-slate-900 dark:text-white">Integrations</h4>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Connect your favorite apps to streamline your workflow.</p>
          </div>
        );

      case 'billing':
        return (
          <div>
            <h4 className="text-xl font-semibold text-slate-900 dark:text-white">Manage Billing</h4>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Update your payment method and view your subscription details.</p>
          </div>
        );

      case 'invoices':
        return (
          <div>
            <h4 className="text-xl font-semibold text-slate-900 dark:text-white">Invoices</h4>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Review and download your past invoices.</p>
          </div>
        );

      case 'security':
        return (
          <div>
            <h4 className="text-xl font-semibold text-slate-900 dark:text-white">Security</h4>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Manage your password and two-factor authentication.</p>
          </div>
        );

      case 'notifications-settings':
        return <NotificationSettingsContent />;

      case 'support':
        return (
          <div className="space-y-6">
            <div>
              <h4 className="text-xl font-semibold text-slate-900 dark:text-white">Help & Support</h4>
              <p className="text-slate-600 dark:text-slate-400 mt-1">Get help or share your feedback with us.</p>
            </div>
            <div className="space-y-4">
              <a
                href="mailto:team@skillhoop.com?subject=Bug Report"
                className="flex items-center gap-3 p-4 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                <Bug className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span className="text-slate-900 dark:text-white font-medium">Report a Bug</span>
              </a>
              <a
                href="mailto:team@skillhoop.com?subject=Feature Request"
                className="flex items-center gap-3 p-4 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                <Lightbulb className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span className="text-slate-900 dark:text-white font-medium">Request a Feature</span>
              </a>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-4xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 dark:border-slate-700 m-4 flex flex-col" style={{ maxHeight: '90vh' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 flex-shrink-0 border-b border-white/30 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Settings</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-grow overflow-hidden">
          {/* Left Navigation */}
          <nav className="w-1/4 p-4 border-r border-white/30 dark:border-slate-700 overflow-y-auto custom-scrollbar">
            <ul className="space-y-1">
              {tabs.map((tab) => (
                <li key={tab.id}>
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={`settings-tab w-full text-left hover:bg-slate-100 dark:hover:bg-slate-700 ${
                      activeTab === tab.id ? 'active' : ''
                    }`}
                  >
                    {tab.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Right Content Panels */}
          <div className="w-3/4 p-6 overflow-y-auto custom-scrollbar">
            {renderTabContent()}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 flex-shrink-0 flex items-center justify-end gap-4 border-t border-white/30 dark:border-slate-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-lg font-medium hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors"
          >
            Cancel
          </button>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

