import { useResume } from '../../../context/ResumeContext';
import StandardListEditor from '../StandardListEditor';

export default function ProjectSectionEditor() {
  const { state } = useResume();
  const section = state.sections.find((s) => s.id === 'projects');
  
  if (!section) return null;
  
  return (
    <StandardListEditor
      sectionId={section.id}
      sectionTitle="Project"
      titleLabel="Project Name"
      subtitleLabel="Role / Technology"
      dateLabel="Date"
      descriptionLabel="Description"
      titlePlaceholder="e.g., E-Commerce Platform"
      subtitlePlaceholder="e.g., Full Stack Developer / React, Node.js"
      datePlaceholder="e.g., Jan 2023 - Present"
      descriptionPlaceholder="Describe the project, your role, technologies used, and key achievements..."
    />
  );
}
