import { useResume } from '../../../context/ResumeContext';
import StandardListEditor from '../StandardListEditor';

export default function LanguageSectionEditor() {
  const { state } = useResume();
  const section = state.sections.find((s) => s.id === 'languages');
  
  if (!section) return null;
  
  return (
    <StandardListEditor
      sectionId={section.id}
      sectionTitle="Language"
      titleLabel="Language"
      subtitleLabel="Proficiency Level"
      dateLabel=""
      descriptionLabel="Notes"
      titlePlaceholder="e.g., Spanish"
      subtitlePlaceholder="e.g., Fluent, Intermediate, Basic"
      datePlaceholder=""
      descriptionPlaceholder="Additional notes about your language skills..."
      showDate={false}
    />
  );
}
