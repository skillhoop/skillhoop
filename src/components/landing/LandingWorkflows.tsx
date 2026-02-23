import { useState } from 'react';
import React from 'react';
import { 
  Briefcase, 
  TrendingUp, 
  Award, 
  MessageSquare, 
  Zap, 
  FileText, 
  Globe, 
  ArrowRight 
} from 'lucide-react';

const LandingWorkflows = () => {
  const [activeTab, setActiveTab] = useState(0);

  // Added pastel background colors for each specific workflow
  const workflowItems = [
    { title: "Job Application", icon: Briefcase, desc: "End-to-end management from discovery to offer.", color: "text-sky-900", bg: "bg-sky-50", border: "border-sky-100" },
    { title: "Skill Advancement", icon: TrendingUp, desc: "Identify gaps, learn skills, showcase achievements.", color: "text-emerald-900", bg: "bg-emerald-50", border: "border-emerald-100" },
    { title: "Personal Brand", icon: Award, desc: "Audit and optimize your digital presence.", color: "text-purple-900", bg: "bg-purple-50", border: "border-purple-100" },
    { title: "Interview Prep", icon: MessageSquare, desc: "Practice with AI feedback based on real JDs.", color: "text-amber-900", bg: "bg-amber-50", border: "border-amber-100" },
    { title: "Continuous Loop", icon: Zap, desc: "Learn from every outcome to improve.", color: "text-slate-900", bg: "bg-slate-50", border: "border-slate-100" },
    { title: "Doc Consistency", icon: FileText, desc: "Maintain versions across all your documents.", color: "text-rose-900", bg: "bg-rose-50", border: "border-rose-100" },
    { title: "Market Strategy", icon: Globe, desc: "Use market data to inform your career path.", color: "text-cyan-900", bg: "bg-cyan-50", border: "border-cyan-100" },
  ];

  return (
    <section id="workflows" className="py-20 bg-slate-50 relative">
      {/* Decorative Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px]"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-neutral-900 font-bold tracking-widest uppercase text-xs mb-3 border border-neutral-900 px-3 py-1 inline-block rounded-full">The Engine</h2>
          <h3 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6 tracking-tight mt-4">7 Integrated Workflows</h3>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium">
            Career development isn't linear. SkillHoop's workflow system adapts to where you are, 
            guiding you through every stage of your professional journey.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-12">
          {/* Navigation Tabs */}
          <div className="w-full md:w-1/3 flex flex-col gap-3">
            {workflowItems.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setActiveTab(idx)}
                className={`flex items-center gap-4 p-5 rounded-xl transition-all duration-300 text-left group ${
                  activeTab === idx 
                    ? `bg-white shadow-xl scale-100 border-l-4 ${item.border.replace('border', 'border-l')}` 
                    : 'bg-white hover:bg-slate-50 border border-transparent text-slate-600'
                }`}
              >
                <div className={`p-2 rounded-lg transition-transform group-hover:scale-110 ${item.bg} ${item.color}`}>
                  <item.icon size={20} />
                </div>
                <div>
                  <h4 className={`font-bold text-sm ${activeTab === idx ? 'text-neutral-900' : 'text-slate-500'}`}>
                    {item.title}
                  </h4>
                </div>
                {activeTab === idx && <ArrowRight size={16} className={`ml-auto ${item.color}`} />}
              </button>
            ))}
          </div>

          {/* Content Display */}
          <div className="w-full md:w-2/3">
            <div className={`h-full bg-white border border-slate-100 rounded-[2rem] p-10 relative overflow-hidden shadow-xl ${workflowItems[activeTab].border}`}>
              {/* Dynamic Pastel Background Blob */}
              <div className={`absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 rounded-full blur-3xl opacity-30 ${workflowItems[activeTab].bg}`}></div>
              
              <div className="relative z-10 h-full flex flex-col justify-center animate-fade-in">
                <div className={`inline-block p-5 rounded-2xl mb-8 w-fit shadow-sm ${workflowItems[activeTab].bg} ${workflowItems[activeTab].color}`}>
                  {React.createElement(workflowItems[activeTab].icon, { size: 36 })}
                </div>
                <h3 className="text-4xl font-bold text-neutral-900 mb-4">{workflowItems[activeTab].title}</h3>
                <p className="text-xl text-slate-500 mb-10 leading-relaxed font-medium">
                  {workflowItems[activeTab].desc}
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="text-xs text-slate-400 mb-2 uppercase tracking-wider font-bold">Feature Focus</div>
                    <div className="font-bold text-neutral-900 text-lg">AI Analysis & Scoring</div>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="text-xs text-slate-400 mb-2 uppercase tracking-wider font-bold">Outcome</div>
                    <div className="font-bold text-neutral-900 text-lg">Actionable Steps</div>
                  </div>
                </div>

                <div className="mt-10 pt-8 border-t border-slate-100 flex items-center gap-4">
                  <span className="text-sm text-slate-400 font-bold uppercase tracking-wider">Powered by workflows engine</span>
                  <div className="flex gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full animate-pulse bg-neutral-900`}></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingWorkflows;

