import { useResume } from '../../../context/ResumeContext';
import StandardListEditor from '../StandardListEditor';

export default function CertificationSectionEditor() {
  const { state } = useResume();
  const section = state.sections.find((s) => s.id === 'certifications');
  
  if (!section) return null;
  
  return (
    <StandardListEditor
      sectionId={section.id}
      sectionTitle="Certification"
      titleLabel="Certification Name"
      subtitleLabel="Issuing Organization"
      dateLabel="Date"
      descriptionLabel="Details"
      titlePlaceholder="e.g., AWS Certified Solutions Architect"
      subtitlePlaceholder="e.g., Amazon Web Services"
      datePlaceholder="e.g., March 2023"
      descriptionPlaceholder="Credential ID, expiration date, or additional details..."
    />
  );
}
