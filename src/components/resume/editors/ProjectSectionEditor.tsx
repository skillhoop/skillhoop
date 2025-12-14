import StandardListEditor from '../StandardListEditor';

export default function ProjectSectionEditor() {
  return (
    <StandardListEditor
      sectionId="projects"
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
