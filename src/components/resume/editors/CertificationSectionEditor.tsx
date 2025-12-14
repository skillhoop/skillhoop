import StandardListEditor from '../StandardListEditor';

export default function CertificationSectionEditor() {
  return (
    <StandardListEditor
      sectionId="certifications"
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
