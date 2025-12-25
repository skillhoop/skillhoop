import { 
  Zap, 
  Bot, 
  Cloud, 
  Smartphone 
} from 'lucide-react';

const LandingSmartFeatures = () => {
  return (
    <section id="features" className="py-20 bg-slate-50 border-t border-slate-200 relative overflow-hidden">
      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-neutral-900 font-bold tracking-widest uppercase text-xs mb-3 border border-neutral-900 px-3 py-1 inline-block rounded-full">Intelligent Core</h2>
          <h3 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4 tracking-tight">AI-Powered & Integration Ready</h3>
          <p className="text-slate-500 max-w-2xl mx-auto">
            A robust workflow system underpinned by smart features and seamless integrations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-neutral-900/20 transition-all">
            <div className="bg-blue-50 w-10 h-10 rounded-lg flex items-center justify-center text-blue-600 mb-4">
              <Zap size={20}/>
            </div>
            <h4 className="font-bold text-neutral-900 mb-2">Smart Features</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li>• Auto-save with Cloud Storage</li>
              <li>• Version History Tracking</li>
              <li>• Daily "Mystery Missions"</li>
              <li>• Smart Recommendations</li>
            </ul>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-neutral-900/20 transition-all">
            <div className="bg-purple-50 w-10 h-10 rounded-lg flex items-center justify-center text-purple-600 mb-4">
              <Bot size={20}/>
            </div>
            <h4 className="font-bold text-neutral-900 mb-2">AI Capabilities</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li>• Resume Parsing (PDF/DOCX)</li>
              <li>• Real-time Suggestions</li>
              <li>• ATS Scoring Engine</li>
              <li>• Interview Question Gen</li>
            </ul>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-neutral-900/20 transition-all">
            <div className="bg-emerald-50 w-10 h-10 rounded-lg flex items-center justify-center text-emerald-600 mb-4">
              <Cloud size={20}/>
            </div>
            <h4 className="font-bold text-neutral-900 mb-2">Integrations</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li>• LinkedIn Profile Import</li>
              <li>• GitHub Code Analysis</li>
              <li>• Portfolio Site Analysis</li>
              <li>• Supabase Backend</li>
            </ul>
          </div>

          {/* Card 4 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-neutral-900/20 transition-all">
            <div className="bg-amber-50 w-10 h-10 rounded-lg flex items-center justify-center text-amber-600 mb-4">
              <Smartphone size={20}/>
            </div>
            <h4 className="font-bold text-neutral-900 mb-2">UX Highlights</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li>• Onboarding Wizard</li>
              <li>• Personalized Dashboard</li>
              <li>• Smart Notifications</li>
              <li>• Responsive Design</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingSmartFeatures;

