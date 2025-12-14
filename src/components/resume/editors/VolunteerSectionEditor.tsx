import { useResume } from '../../../context/ResumeContext';
import StandardListEditor from '../StandardListEditor';

export default function VolunteerSectionEditor() {
  const { state } = useResume();
  const section = state.sections.find((s) => s.id === 'volunteer');
  
  if (!section) return null;
  
  return (
    <StandardListEditor
      sectionId={section.id}
      sectionTitle="Volunteer Experience"
      titleLabel="Organization"
      subtitleLabel="Role / Position"
      dateLabel="Date"
      descriptionLabel="Description"
      titlePlaceholder="e.g., Local Food Bank"
      subtitlePlaceholder="e.g., Volunteer Coordinator"
      datePlaceholder="e.g., 2021 - Present"
      descriptionPlaceholder="Describe your volunteer work, responsibilities, and impact..."
    />
  );
}
