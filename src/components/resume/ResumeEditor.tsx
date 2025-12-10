import { useResume } from '../../context/ResumeContext';
import ExperienceEditor from './ExperienceEditor';
import EducationEditor from './EducationEditor';
import SkillsEditor from './SkillsEditor';

export default function ResumeEditor() {
  const { state, dispatch } = useResume();
  const { personalInfo } = state;

  const handleInputChange = (field: keyof typeof personalInfo, value: string) => {
    dispatch({
      type: 'UPDATE_PERSONAL_INFO',
      payload: { [field]: value },
    });
  };

  return (
    <div className="p-6 space-y-8">
      {/* Personal Details Section */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-6">Personal Details</h2>
        
        <div className="space-y-4">
          {/* Full Name */}
          <div className="bg-white/50 backdrop-blur rounded-lg p-3">
            <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              value={personalInfo.fullName || ''}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              className="w-full bg-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/50 px-2 py-1.5"
              placeholder="John Doe"
            />
          </div>

          {/* Job Title */}
          <div className="bg-white/50 backdrop-blur rounded-lg p-3">
            <label htmlFor="jobTitle" className="block text-sm font-medium text-slate-700 mb-1">
              Job Title
            </label>
            <input
              type="text"
              id="jobTitle"
              value={personalInfo.jobTitle || ''}
              onChange={(e) => handleInputChange('jobTitle', e.target.value)}
              className="w-full bg-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/50 px-2 py-1.5"
              placeholder="Software Engineer"
            />
          </div>

          {/* Email */}
          <div className="bg-white/50 backdrop-blur rounded-lg p-3">
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={personalInfo.email || ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full bg-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/50 px-2 py-1.5"
              placeholder="john.doe@example.com"
            />
          </div>

          {/* Phone */}
          <div className="bg-white/50 backdrop-blur rounded-lg p-3">
            <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              id="phone"
              value={personalInfo.phone || ''}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full bg-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/50 px-2 py-1.5"
              placeholder="+1 (555) 123-4567"
            />
          </div>

          {/* LinkedIn */}
          <div className="bg-white/50 backdrop-blur rounded-lg p-3">
            <label htmlFor="linkedin" className="block text-sm font-medium text-slate-700 mb-1">
              LinkedIn
            </label>
            <input
              type="url"
              id="linkedin"
              value={personalInfo.linkedin || ''}
              onChange={(e) => handleInputChange('linkedin', e.target.value)}
              className="w-full bg-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/50 px-2 py-1.5"
              placeholder="https://linkedin.com/in/johndoe"
            />
          </div>

          {/* Website */}
          <div className="bg-white/50 backdrop-blur rounded-lg p-3">
            <label htmlFor="website" className="block text-sm font-medium text-slate-700 mb-1">
              Website
            </label>
            <input
              type="url"
              id="website"
              value={personalInfo.website || ''}
              onChange={(e) => handleInputChange('website', e.target.value)}
              className="w-full bg-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/50 px-2 py-1.5"
              placeholder="https://johndoe.com"
            />
          </div>

          {/* Professional Summary */}
          <div className="bg-white/50 backdrop-blur rounded-lg p-3">
            <label htmlFor="summary" className="block text-sm font-medium text-slate-700 mb-1">
              Professional Summary
            </label>
            <textarea
              id="summary"
              value={personalInfo.summary || ''}
              onChange={(e) => handleInputChange('summary', e.target.value)}
              rows={6}
              className="w-full bg-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/50 px-2 py-1.5 resize-none"
              placeholder="A brief summary of your professional background and key achievements..."
            />
          </div>
        </div>
      </div>

      {/* Experience Section */}
      <ExperienceEditor />

      {/* Education Section */}
      <EducationEditor />

      {/* Skills Section */}
      <SkillsEditor />
    </div>
  );
}
