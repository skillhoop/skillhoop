import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowUp,
  Bot,
  BrainCircuit,
  Briefcase,
  Cpu,
  Eraser,
  FileSearch,
  Languages,
  Loader2,
  Sparkles,
  Target,
  User,
  Wand,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { useResume } from '../../context/ResumeContext';
import type { ResumeData } from '../../types/resume';
import { resumeDataToText } from '../../lib/atsScanner';
import {
  enhanceResumeText,
  getContextAwareSuggestions,
  type ToneType,
} from '../../lib/resumeAI';

interface CopilotActionPayload {
  type: string;
  title: string;
  content: string;
  btnLabel: string;
  sectionId?: string;
  itemId?: string;
}

interface CopilotMessage {
  id: number;
  type: 'user' | 'ai';
  text: string;
  chips?: string[];
  changes?: string[];
  milestones?: { before: string; after: string }[];
  action?: CopilotActionPayload;
}

interface CopilotSidebarProps {
  onApplyChanges?: (type: string, content: string) => void;
}

type EnhanceIntent = {
  kind: 'enhance';
  selectedText: string;
  context: string;
  tone: ToneType;
  targetLanguage?: string;
  applyType: string;
  applyTitle: string;
  sectionId?: string;
  itemId?: string;
};

type SuggestIntent = {
  kind: 'suggest';
  selectedText: string;
  sectionName?: string;
};

type CopilotIntent = EnhanceIntent | SuggestIntent;

function getExperienceSection(state: ResumeData) {
  return state.sections.find((s) => s.id === 'experience' || s.type === 'experience');
}

function getFirstExperienceItem(state: ResumeData) {
  return getExperienceSection(state)?.items?.[0];
}

function buildTargetJobContext(state: ResumeData): string {
  return [state.targetJob.title, state.targetJob.description, state.targetJob.industry]
    .filter((p) => p.trim().length > 0)
    .join(' — ');
}

function resolveCopilotIntent(message: string, state: ResumeData): CopilotIntent {
  const lower = message.toLowerCase();
  const fullContext = resumeDataToText(state);
  const targetJobContext = buildTargetJobContext(state);
  const expItem = getFirstExperienceItem(state);

  if (lower.includes('german') || lower.includes('translate') || lower.includes('localize')) {
    const targetLanguage = lower.includes('german')
      ? 'German'
      : lower.includes('spanish')
        ? 'Spanish'
        : lower.includes('french')
          ? 'French'
          : 'the requested language';

    return {
      kind: 'enhance',
      selectedText: state.personalInfo.summary?.trim() || fullContext.slice(0, 1500),
      context: `Target job: ${targetJobContext || state.personalInfo.jobTitle || 'General role'}. Localize for ${targetLanguage} professional resume conventions.`,
      tone: 'professional',
      targetLanguage,
      applyType: 'UPDATE_SUMMARY',
      applyTitle: 'Localized Summary',
    };
  }

  if (lower.includes('summary') || lower.includes('polish')) {
    return {
      kind: 'enhance',
      selectedText:
        state.personalInfo.summary?.trim() ||
        `Professional ${state.personalInfo.jobTitle || 'candidate'} seeking opportunities in ${state.targetJob.title || 'their field'}.`,
      context: `Target role: ${state.targetJob.title || state.personalInfo.jobTitle || 'General'}. ${targetJobContext}`,
      tone: 'professional',
      applyType: 'UPDATE_SUMMARY',
      applyTitle: 'Optimized Summary',
    };
  }

  if (lower.includes('bullet') || lower.includes('metric') || (lower.includes('experience') && !lower.includes('verb'))) {
    const description = expItem?.description?.trim() || '';
    return {
      kind: 'enhance',
      selectedText: description || 'Describe your recent role, scope, and measurable outcomes.',
      context: `Position: ${expItem?.title || 'Role'} at ${expItem?.subtitle || 'Company'}. ${targetJobContext}`,
      tone: 'professional',
      applyType: 'UPDATE_EXPERIENCE_DESCRIPTION',
      applyTitle: 'Enhanced Experience Entry',
      sectionId: 'experience',
      itemId: expItem?.id,
    };
  }

  if (lower.includes('verb') || lower.includes('action')) {
    return {
      kind: 'suggest',
      selectedText: expItem?.description?.trim() || state.personalInfo.summary || fullContext.slice(0, 600),
      sectionName: 'Experience',
    };
  }

  if (lower.includes('keyword') || lower.includes('ats') || lower.includes('gap') || lower.includes('skill')) {
    const skillsSection = state.sections.find((s) => s.type === 'skills');
    const skillsText = skillsSection?.items.map((i) => i.title).filter(Boolean).join(', ') || '';
    return {
      kind: 'suggest',
      selectedText: skillsText || state.personalInfo.summary || fullContext.slice(0, 600),
      sectionName: lower.includes('skill') ? 'Skills' : 'Resume',
    };
  }

  return {
    kind: 'suggest',
    selectedText: state.personalInfo.summary?.trim() || fullContext.slice(0, 800),
    sectionName: 'Resume',
  };
}

const CopilotAction = ({
  icon: Icon,
  label,
  description,
  onClick,
  disabled,
  colorClass = 'text-slate-500',
  bgClass = 'bg-slate-50',
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  description: string;
  onClick: () => void;
  disabled?: boolean;
  colorClass?: string;
  bgClass?: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="group w-full p-3 flex items-start gap-3 bg-white border border-slate-100 rounded-xl hover:border-slate-200 hover:shadow-md transition-all text-left disabled:opacity-50 disabled:pointer-events-none"
  >
    <div className={`p-2 rounded-lg transition-transform group-hover:scale-110 ${bgClass} ${colorClass}`}>
      <Icon size={16} />
    </div>
    <div className="flex-1 min-w-0">
      <h5 className="text-[11px] font-bold text-slate-800 uppercase tracking-tight">{label}</h5>
      <p className="text-[10px] text-slate-400 font-medium leading-tight mt-0.5">{description}</p>
    </div>
  </button>
);

const InsightChip = ({
  icon: Icon,
  label,
  onClick,
  disabled,
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-full text-[10px] font-bold text-slate-500 hover:bg-slate-50 hover:border-slate-100 hover:text-slate-600 transition-all whitespace-nowrap disabled:opacity-50"
  >
    <Icon size={12} />
    {label}
  </button>
);

export default function CopilotSidebar({ onApplyChanges }: CopilotSidebarProps) {
  const { state, dispatch, isSaving } = useResume();
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<CopilotMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = useCallback(
    async (textOverride: string | null = null) => {
      const messageText = typeof textOverride === 'string' ? textOverride : inputValue;
      if (!messageText.trim() || isTyping) return;

      const userMsg: CopilotMessage = { id: Date.now(), type: 'user', text: messageText };
      setMessages((prev) => [...prev, userMsg]);
      setInputValue('');
      setIsTyping(true);

      try {
        const intent = resolveCopilotIntent(messageText, state);
        const fullContext = resumeDataToText(state);

        if (intent.kind === 'enhance') {
          const result = await enhanceResumeText(
            intent.selectedText,
            intent.context,
            intent.tone,
            intent.targetLanguage,
          );

          const aiResponse: CopilotMessage = {
            id: Date.now() + 1,
            type: 'ai',
            text: 'Here is an optimized version based on your current resume content:',
            changes: result.changes?.length ? result.changes : undefined,
            milestones: result.beforeAfterComparison?.length ? result.beforeAfterComparison : undefined,
            action: {
              type: intent.applyType,
              title: intent.applyTitle,
              content: result.enhancedText,
              btnLabel: 'Apply Improvement',
              sectionId: intent.sectionId,
              itemId: intent.itemId,
            },
          };

          setMessages((prev) => [...prev, aiResponse]);
        } else {
          const result = await getContextAwareSuggestions(
            intent.selectedText,
            fullContext,
            intent.sectionName,
          );

          const chips = result.suggestions.slice(0, 6).map((s) => s.suggestion);
          const recommended =
            result.recommendedActions.length > 0
              ? `\n\nRecommended next steps:\n${result.recommendedActions.map((a) => `• ${a}`).join('\n')}`
              : '';

          const aiResponse: CopilotMessage = {
            id: Date.now() + 1,
            type: 'ai',
            text: `${result.contextAnalysis || 'Here are context-aware suggestions for your resume:'}${recommended}`,
            chips: chips.length > 0 ? chips : undefined,
          };

          setMessages((prev) => [...prev, aiResponse]);
        }
      } catch (error) {
        console.error('Copilot request failed:', error);
        toast.error('Copilot could not complete that request. Please try again.');
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            type: 'ai',
            text: 'I ran into an issue processing that request. Please try again or rephrase your prompt.',
          },
        ]);
      } finally {
        setIsTyping(false);
      }
    },
    [inputValue, isTyping, state],
  );

  const handleApply = useCallback(
    (action: CopilotActionPayload) => {
      try {
        switch (action.type) {
          case 'UPDATE_SUMMARY':
            dispatch({ type: 'UPDATE_PERSONAL_INFO', payload: { summary: action.content } });
            break;
          case 'UPDATE_EXPERIENCE_DESCRIPTION':
            if (action.sectionId && action.itemId) {
              dispatch({
                type: 'UPDATE_SECTION_ITEM',
                payload: {
                  sectionId: action.sectionId,
                  itemId: action.itemId,
                  data: { description: action.content },
                },
              });
            } else {
              const expItem = getFirstExperienceItem(state);
              if (expItem) {
                dispatch({
                  type: 'UPDATE_SECTION_ITEM',
                  payload: {
                    sectionId: 'experience',
                    itemId: expItem.id,
                    data: { description: action.content },
                  },
                });
              }
            }
            break;
          default:
            onApplyChanges?.(action.type, action.content);
        }

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            type: 'ai',
            text: '✓ Action applied successfully! Your layout has been optimized.',
          },
        ]);
      } catch (error) {
        console.error('Failed to apply copilot action:', error);
        toast.error('Could not apply this improvement to your resume.');
      }
    },
    [dispatch, onApplyChanges, state],
  );

  const busy = isTyping || isSaving === true;

  return (
    <div className="flex flex-col h-full bg-white relative w-full border-r border-slate-200 min-w-0">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-slate-600 flex items-center justify-center shadow-lg shadow-slate-100 shrink-0">
            {busy ? <Loader2 size={16} className="text-white animate-spin" /> : <Cpu size={16} className="text-white" />}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-xs uppercase tracking-widest text-slate-800">Copilot Pro</h3>
            <div className="flex items-center gap-1.5">
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  isSaving ? 'bg-sky-500 animate-pulse' : 'bg-emerald-500 animate-pulse'
                }`}
              />
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter truncate">
                {isSaving ? 'Syncing changes…' : isTyping ? 'Generating…' : 'AI Core v3.1'}
              </span>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setMessages([])}
          disabled={busy}
          className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50 shrink-0"
          title="Clear History"
        >
          <Eraser size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col min-w-0">
        {messages.length === 0 ? (
          <div className="p-6 space-y-6">
            <div className="bg-gradient-to-br from-slate-50 to-white p-5 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={16} className="text-slate-500" />
                <span className="text-xs font-black uppercase text-slate-900 tracking-wide">Suggested Actions</span>
              </div>
              <div className="grid grid-cols-1 gap-2">
                <CopilotAction
                  icon={Wand}
                  label="Polish Summary"
                  description="Transform your profile into a high-impact hook."
                  disabled={busy}
                  onClick={() => void handleSendMessage('Improve my professional summary to sound more senior.')}
                />
                <CopilotAction
                  icon={Target}
                  label="ATS Keyword Injection"
                  description="Optimize your skills for specific job descriptions."
                  colorClass="text-emerald-500"
                  bgClass="bg-emerald-50"
                  disabled={busy}
                  onClick={() => void handleSendMessage('What keywords am I missing for my target role?')}
                />
                <CopilotAction
                  icon={Languages}
                  label="Translate / Localize"
                  description="Localize your resume for international markets."
                  colorClass="text-amber-500"
                  bgClass="bg-amber-50"
                  disabled={busy}
                  onClick={() => void handleSendMessage('Translate my professional summary into professional German.')}
                />
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 px-1">Common Queries</span>
              <div className="flex flex-wrap gap-2">
                <InsightChip
                  icon={Zap}
                  label="Add Action Verbs"
                  disabled={busy}
                  onClick={() => void handleSendMessage('Suggest strong action verbs for my experience bullets.')}
                />
                <InsightChip
                  icon={Briefcase}
                  label="Bullet Point Optimization"
                  disabled={busy}
                  onClick={() => void handleSendMessage('How can I improve my bullet points with metrics?')}
                />
                <InsightChip
                  icon={FileSearch}
                  label="Check ATS Flow"
                  disabled={busy}
                  onClick={() => void handleSendMessage("Analyze my resume's structure for ATS readability.")}
                />
                <InsightChip
                  icon={Target}
                  label="Identify Gaps"
                  disabled={busy}
                  onClick={() => void handleSendMessage('What key skills or sections are missing from my resume?')}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-5 flex-1 bg-slate-50/50 min-w-0">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 animate-fade-in-up min-w-0 ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div
                  className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center shadow-sm ${
                    msg.type === 'user' ? 'bg-slate-200' : 'bg-slate-600'
                  }`}
                >
                  {msg.type === 'user' ? <User size={14} className="text-slate-600" /> : <Bot size={14} className="text-white" />}
                </div>
                <div className={`flex flex-col max-w-[85%] min-w-0 ${msg.type === 'user' ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`p-3 text-[11px] leading-relaxed shadow-sm whitespace-pre-wrap break-words ${
                      msg.type === 'user'
                        ? 'bg-neutral-900 text-white rounded-2xl rounded-tr-none'
                        : 'bg-white border border-slate-100 text-slate-700 rounded-2xl rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                    {msg.changes && msg.changes.length > 0 && (
                      <ul className="mt-3 space-y-1 border-t border-slate-100 pt-2">
                        {msg.changes.map((change, i) => (
                          <li key={i} className="text-[10px] text-slate-500 flex gap-1.5">
                            <span className="text-slate-400 shrink-0">•</span>
                            <span>{change}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {msg.milestones && msg.milestones.length > 0 && (
                      <div className="mt-3 space-y-1.5 border-t border-slate-100 pt-2">
                        {msg.milestones.map((milestone, i) => (
                          <div key={i} className="text-[9px] p-1.5 bg-slate-50 rounded leading-snug break-words">
                            <span className="line-through text-slate-400">{milestone.before}</span>
                            <span className="mx-1 text-slate-300">→</span>
                            <span className="text-slate-700 font-medium">{milestone.after}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {msg.chips && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {msg.chips.map((chip) => (
                          <span
                            key={chip}
                            className="px-2 py-0.5 bg-slate-100 rounded text-[9px] font-black text-slate-500 uppercase tracking-tighter break-words"
                          >
                            {chip}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {msg.action && (
                    <div className="mt-2 w-full bg-slate-600 rounded-xl p-3 shadow-lg shadow-slate-100 border border-slate-400 overflow-hidden relative min-w-0">
                      <div className="absolute -right-4 -top-4 opacity-10">
                        <Sparkles size={64} className="text-white" />
                      </div>
                      <h4 className="text-[10px] font-black text-slate-100 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <Wand size={10} /> {msg.action.title}
                      </h4>
                      <p className="text-[11px] text-white font-medium mb-3 italic leading-relaxed break-words">
                        &ldquo;{msg.action.content}&rdquo;
                      </p>
                      <button
                        type="button"
                        onClick={() => handleApply(msg.action!)}
                        disabled={busy}
                        className="w-full py-2 bg-white text-slate-600 text-[10px] font-black uppercase rounded-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-2 group disabled:opacity-60"
                      >
                        {msg.action.btnLabel}
                        <ArrowUp size={12} className="group-hover:-translate-y-0.5 transition-transform" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3 px-1">
                <div className="shrink-0 w-7 h-7 rounded-lg bg-slate-600 flex items-center justify-center">
                  <Loader2 size={14} className="text-white animate-spin" />
                </div>
                <div className="flex items-center gap-2 bg-white border border-slate-100 px-3 py-2 rounded-2xl rounded-tl-none">
                  <span className="text-[10px] font-bold text-slate-500">Optimizing with AI…</span>
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-slate-100 shrink-0">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 focus-within:border-slate-400 focus-within:ring-1 focus-within:ring-slate-50 transition-all rounded-xl p-1.5">
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && void handleSendMessage()}
              placeholder="Improve my experience bullets..."
              disabled={busy}
              className="flex-1 bg-transparent border-none text-[11px] font-medium focus:ring-0 px-3 py-2 text-slate-700 outline-none disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => void handleSendMessage()}
              disabled={!inputValue.trim() || busy}
              className={`p-2 rounded-lg transition-all ${
                inputValue.trim() && !busy ? 'bg-slate-600 text-white shadow-md' : 'bg-slate-200 text-slate-400'
              }`}
            >
              {isTyping ? <Loader2 size={16} className="animate-spin" /> : <ArrowUp size={16} />}
            </button>
          </div>
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-1.5 opacity-50">
              <BrainCircuit size={10} className="text-slate-500" />
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                {isSaving ? 'Saving to cloud…' : 'Live optimization active'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
