import { useResume } from '../../context/ResumeContext';

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
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              value={personalInfo.fullName || ''}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              className="w-full rounded-md border border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
              placeholder="John Doe"
            />
          </div>

          {/* Job Title */}
          <div>
            <label htmlFor="jobTitle" className="block text-sm font-medium text-slate-700 mb-1">
              Job Title
            </label>
            <input
              type="text"
              id="jobTitle"
              value={personalInfo.jobTitle || ''}
              onChange={(e) => handleInputChange('jobTitle', e.target.value)}
              className="w-full rounded-md border border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
              placeholder="Software Engineer"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={personalInfo.email || ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full rounded-md border border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
              placeholder="john.doe@example.com"
            />
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              id="phone"
              value={personalInfo.phone || ''}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full rounded-md border border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
              placeholder="+1 (555) 123-4567"
            />
          </div>

          {/* LinkedIn */}
          <div>
            <label htmlFor="linkedin" className="block text-sm font-medium text-slate-700 mb-1">
              LinkedIn
            </label>
            <input
              type="url"
              id="linkedin"
              value={personalInfo.linkedin || ''}
              onChange={(e) => handleInputChange('linkedin', e.target.value)}
              className="w-full rounded-md border border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
              placeholder="https://linkedin.com/in/johndoe"
            />
          </div>

          {/* Website */}
          <div>
            <label htmlFor="website" className="block text-sm font-medium text-slate-700 mb-1">
              Website
            </label>
            <input
              type="url"
              id="website"
              value={personalInfo.website || ''}
              onChange={(e) => handleInputChange('website', e.target.value)}
              className="w-full rounded-md border border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
              placeholder="https://johndoe.com"
            />
          </div>

          {/* Professional Summary */}
          <div>
            <label htmlFor="summary" className="block text-sm font-medium text-slate-700 mb-1">
              Professional Summary
            </label>
            <textarea
              id="summary"
              value={personalInfo.summary || ''}
              onChange={(e) => handleInputChange('summary', e.target.value)}
              rows={6}
              className="w-full rounded-md border border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
              placeholder="A brief summary of your professional background and key achievements..."
            />
          </div>
        </div>
      </div>

      {/* TODO: Add Experience and Education sections here */}
    </div>
  );
}
