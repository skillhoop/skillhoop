import React, { useState } from 'react';
import {
  User,
  Lock,
  Bell,
  CreditCard as CreditCardIcon,
  Link,
  Camera,
  Upload,
  Trash2,
  Map,
  Globe,
  Mail,
  ShieldCheck,
  Briefcase,
  Zap,
  Sparkles,
  Linkedin,
  Github,
  Calendar,
  CheckCircle,
} from 'lucide-react';

const SettingsView = ({ onBack }: { onBack?: () => void }) => {
  const [activeSettingsTab, setActiveSettingsTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'account', label: 'Account Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'billing', label: 'Billing & Plans', icon: CreditCardIcon },
    { id: 'integrations', label: 'Integrations', icon: Link },
  ];

  return (
    <div className="animate-fade-in-up max-w-6xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden h-[calc(100vh-theme(spacing.32))] flex flex-col">
      {/* Settings title and description with border — shown across all sections */}
      <div className="px-8 pt-6 pb-4 border-b border-slate-200 flex-shrink-0">
        <h2 className="text-lg font-bold text-neutral-900">Settings</h2>
        <p className="text-sm text-slate-500 mt-0.5">Manage your profile, security, notifications, billing, and integrations.</p>
      </div>
      <div className="flex flex-row flex-1 min-h-0">
        {/* Settings Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col overflow-y-auto custom-scrollbar font-sans flex-shrink-0">
          <div className="px-4 pt-6 pb-4 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSettingsTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  activeSettingsTab === tab.id
                    ? 'bg-neutral-900 text-white shadow-md'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-neutral-900'
                }`}
              >
                <tab.icon
                  size={18}
                  className={`${activeSettingsTab === tab.id ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`}
                />
                {tab.label}
              </button>
            ))}
          </div>
        </aside>

        {/* Settings Content Area */}
        <main className="flex-1 p-8 overflow-auto">
          {/* Profile Section */}
          {activeSettingsTab === 'profile' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                <div>
                  <h3 className="text-lg font-bold text-neutral-900">Personal Information</h3>
                  <p className="text-sm text-slate-500">Update your photo and personal details here.</p>
                </div>
                <div className="flex gap-3">
                  <button className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50">
                    Cancel
                  </button>
                  <button className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-sm font-bold hover:bg-neutral-800 shadow-sm">
                    Save Changes
                  </button>
                </div>
              </div>

              {/* Avatar Section */}
              <div className="flex items-center gap-6">
                <div className="relative group">
                  <img
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    alt="Profile"
                    className="w-24 h-24 rounded-full border-4 border-slate-50 shadow-sm"
                  />
                  <button className="absolute bottom-0 right-0 p-2 bg-[#111827] text-white rounded-full shadow-lg hover:bg-[#1f2937] transition-colors">
                    <Camera size={14} />
                  </button>
                </div>
                <div>
                  <h4 className="font-bold text-neutral-900 text-sm mb-1">Profile Photo</h4>
                  <p className="text-xs text-slate-500 mb-3">Min 400x400px, PNG or JPG.</p>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2">
                      <Upload size={12} /> Upload
                    </button>
                    <button className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2">
                      <Trash2 size={12} /> Remove
                    </button>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase">First Name</label>
                  <input
                    type="text"
                    defaultValue="Alex"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-[#111827]/20 focus:border-[#111827] outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase">Last Name</label>
                  <input
                    type="text"
                    defaultValue="Rivera"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-[#111827]/20 focus:border-[#111827] outline-none transition-all"
                  />
                </div>
                <div className="col-span-full space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase">Professional Headline</label>
                  <input
                    type="text"
                    defaultValue="Senior Product Designer | Building scalable design systems"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-[#111827]/20 focus:border-[#111827] outline-none transition-all"
                  />
                </div>
                <div className="col-span-full space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase">Bio</label>
                  <textarea
                    rows={4}
                    defaultValue="Passionate about bridging the gap between design and engineering. Currently obsessed with AI-driven interfaces and accessibility."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-[#111827]/20 focus:border-[#111827] outline-none transition-all resize-none"
                  />
                  <p className="text-xs text-slate-400 text-right">240 characters left</p>
                </div>
              </div>

              {/* Location & Website */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase">Location</label>
                  <div className="relative">
                    <Map className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="text"
                      defaultValue="San Francisco, CA"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-[#111827]/20 focus:border-[#111827] outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase">Portfolio Website</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="text"
                      defaultValue="alexrivera.design"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-[#111827]/20 focus:border-[#111827] outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Account Security Section */}
          {activeSettingsTab === 'account' && (
            <div className="space-y-6">
              <div className="rounded-xl border border-slate-100 p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-neutral-900">Sign-in Method</h3>
                  <p className="text-sm text-slate-500">Manage how you log in to SkillHoop.</p>
                </div>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-white rounded-lg border border-slate-200 text-slate-500">
                        <Mail size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-neutral-900">Email Address</p>
                        <p className="text-xs text-slate-500">alex.rivera@example.com</p>
                      </div>
                    </div>
                    <button className="text-xs font-bold text-[#111827] hover:underline">Update</button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-white rounded-lg border border-slate-200 text-slate-500">
                        <Lock size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-neutral-900">Password</p>
                        <p className="text-xs text-slate-500">Last updated 3 months ago</p>
                      </div>
                    </div>
                    <button className="text-xs font-bold text-[#111827] hover:underline">Reset</button>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 p-6 space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-neutral-900">Two-Factor Authentication</h3>
                    <p className="text-sm text-slate-500 mb-4">Add an extra layer of security to your account.</p>
                    <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg w-fit">
                      <ShieldCheck size={14} />
                      <span className="text-xs font-bold">Enabled</span>
                    </div>
                  </div>
                  <button className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-bold">
                    Manage
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-red-100 bg-red-50/30 p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-red-600">Delete Account</h3>
                    <p className="text-sm text-slate-500">Permanently remove your account and all data.</p>
                  </div>
                  <button className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-bold">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Section */}
          {activeSettingsTab === 'notifications' && (
            <div className="space-y-8">
              <div className="border-b border-slate-100 pb-6">
                <h3 className="text-lg font-bold text-neutral-900">Notification Preferences</h3>
                <p className="text-sm text-slate-500">Choose what updates you want to receive.</p>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-black text-slate-400 uppercase tracking-wider mb-4">
                    Activity & Alerts
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          <Briefcase size={16} className="text-[#111827]" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-neutral-900">Job Applications</p>
                          <p className="text-xs text-slate-500">Status updates on your tracked applications.</p>
                        </div>
                      </div>
                      <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#111827] transition-colors cursor-pointer">
                        <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          <Zap size={16} className="text-[#111827]" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-neutral-900">Daily AI Briefing</p>
                          <p className="text-xs text-slate-500">Morning summary of action items and insights.</p>
                        </div>
                      </div>
                      <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#111827] transition-colors cursor-pointer">
                        <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-slate-100"></div>

                <div>
                  <h4 className="text-sm font-black text-slate-400 uppercase tracking-wider mb-4">Marketing</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          <Sparkles size={16} className="text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-neutral-900">Product Updates</p>
                          <p className="text-xs text-slate-500">New features and improvements to SkillHoop.</p>
                        </div>
                      </div>
                      <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#111827] transition-colors cursor-pointer">
                        <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          <Mail size={16} className="text-slate-400" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-neutral-900">Newsletter</p>
                          <p className="text-xs text-slate-500">Weekly career tips and industry news.</p>
                        </div>
                      </div>
                      <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200 transition-colors cursor-pointer">
                        <span className="translate-x-1 inline-block h-4 w-4 transform rounded-full bg-white transition" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Billing Section */}
          {activeSettingsTab === 'billing' && (
            <div className="space-y-6">
              <div className="bg-neutral-900 rounded-2xl p-8 text-white relative overflow-hidden">
                <div className="relative z-10 flex justify-between items-start">
                  <div>
                    <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-2">
                      CURRENT PLAN
                    </p>
                    <h3 className="text-3xl font-bold mb-2">Pro Plan</h3>
                    <p className="text-slate-400 text-sm mb-6">$29/month • Renews on Nov 14, 2023</p>
                    <button className="bg-white text-neutral-900 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors">
                      Manage Subscription
                    </button>
                  </div>
                  <div className="text-right">
                    <div className="bg-white/10 p-2 rounded-lg inline-block mb-2">
                      <CreditCardIcon size={24} className="text-white" />
                    </div>
                    <p className="text-xs font-medium text-slate-400">.... 4242</p>
                  </div>
                </div>
                <div className="absolute -right-10 -bottom-20 w-64 h-64 bg-[#111827] rounded-full blur-3xl opacity-20"></div>
              </div>

              <div className="rounded-xl border border-slate-100 p-6">
                <h3 className="text-lg font-bold text-neutral-900 mb-6">Usage</h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-end mb-2">
                      <p className="text-sm font-bold text-slate-700">AI Credits</p>
                      <p className="text-xs font-bold text-slate-500">340 / 500 used</p>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-[#111827] h-full rounded-full" style={{ width: '68%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-end mb-2">
                      <p className="text-sm font-bold text-slate-700">Resume Tailoring</p>
                      <p className="text-xs font-bold text-slate-500">12 / 20 used</p>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-purple-600 h-full rounded-full" style={{ width: '60%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                  <h3 className="text-lg font-bold text-neutral-900">Billing History</h3>
                </div>
                <table className="w-full text-left">
                  <thead className="bg-slate-50">
                    <tr className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Invoice</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    <tr>
                      <td className="px-6 py-4 font-medium text-slate-700">Oct 14, 2023</td>
                      <td className="px-6 py-4 text-slate-600">$29.00</td>
                      <td className="px-6 py-4">
                        <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded text-[10px] font-bold uppercase">
                          Paid
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-[#111827] hover:underline font-bold text-xs">Download</button>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-medium text-slate-700">Sep 14, 2023</td>
                      <td className="px-6 py-4 text-slate-600">$29.00</td>
                      <td className="px-6 py-4">
                        <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded text-[10px] font-bold uppercase">
                          Paid
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-[#111827] hover:underline font-bold text-xs">Download</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Integrations Section */}
          {activeSettingsTab === 'integrations' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-neutral-900">Connected Apps</h3>
                <p className="text-sm text-slate-500">
                  Supercharge your workflow by connecting your favorite tools.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-slate-300 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#0077b5] rounded-lg flex items-center justify-center text-white">
                      <Linkedin size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-neutral-900">LinkedIn</h4>
                      <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                        <CheckCircle size={10} /> Connected as Alex Rivera
                      </p>
                    </div>
                  </div>
                  <button className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors">
                    Disconnect
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-slate-300 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#333] rounded-lg flex items-center justify-center text-white">
                      <Github size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-neutral-900">GitHub</h4>
                      <p className="text-xs text-slate-500">Import projects for your portfolio.</p>
                    </div>
                  </div>
                  <button className="px-3 py-1.5 bg-neutral-900 text-white rounded-lg text-xs font-bold hover:bg-neutral-800 transition-colors">
                    Connect
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-slate-300 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-white">
                      <Calendar size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-neutral-900">Google Calendar</h4>
                      <p className="text-xs text-slate-500">Sync interview schedules automatically.</p>
                    </div>
                  </div>
                  <button className="px-3 py-1.5 bg-neutral-900 text-white rounded-lg text-xs font-bold hover:bg-neutral-800 transition-colors">
                    Connect
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

/** Wrapper used when rendering Settings inside the dashboard. No extra padding — spacing matches other views (e.g. Smart Resume Studio) via dashboard content area p-6 lg:p-8. */
export const SettingsModule = () => {
  return (
    <div className="bg-slate-50 min-h-screen">
      <SettingsView />
    </div>
  );
};

export default SettingsModule;
