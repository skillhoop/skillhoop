import { ResumeProvider } from '../context/ResumeContext';
import ResumeEditor from '../components/resume/ResumeEditor';
import ResumePreview from '../components/resume/ResumePreview';
import ResumeToolbar from '../components/resume/ResumeToolbar';

export default function ResumeStudio() {
        return (
    <ResumeProvider>
      <div className="h-screen flex flex-col bg-white">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
                            <div className="flex items-center gap-3">
            {/* Logo */}
                            <div className="flex items-center gap-2">
              <svg
                className="h-8 w-8 text-indigo-600"
                viewBox="0 0 32 32"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M4 4H20V20H4V4Z" />
                <path d="M12 12H28V28H12V12Z" fillOpacity="0.7" />
              </svg>
              <span className="font-bold text-xl text-slate-900">Career Clarified</span>
                            </div>
                        </div>
          <ResumeToolbar />
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden flex">
          {/* Left Column - Editor */}
          <div className="w-1/2 bg-white overflow-y-auto border-r border-slate-200">
            <ResumeEditor />
                                </div>

          {/* Right Column - Preview */}
          <div className="flex-1 bg-slate-50 overflow-y-auto">
            <ResumePreview />
                            </div>
        </main>
                                    </div>
    </ResumeProvider>
  );
}
