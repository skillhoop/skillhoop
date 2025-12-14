import StandardListEditor from '../StandardListEditor';

export default function LanguageSectionEditor() {
  return (
    <StandardListEditor
      sectionId="languages"
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
