import StandardListEditor from '../StandardListEditor';

export default function VolunteerSectionEditor() {
  return (
    <StandardListEditor
      sectionId="volunteer"
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
