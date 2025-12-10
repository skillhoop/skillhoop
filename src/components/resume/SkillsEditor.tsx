import { useState } from 'react';
import { useResume } from '../../context/ResumeContext';
import { SectionItem } from '../../types/resume';

export default function SkillsEditor() {
  const { state, dispatch } = useResume();
  const skillsSection = state.sections.find((section) => section.id === 'skills');
  const items = skillsSection?.items || [];

  const [editingItem, setEditingItem] = useState<SectionItem | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    skillName: '',
    proficiency: '',
  });

  const handleAddClick = () => {
    setFormData({
      skillName: '',
      proficiency: '',
    });
    setIsAdding(true);
    setEditingItem(null);
  };

  const handleEditClick = (item: SectionItem) => {
    setFormData({
      skillName: item.title || '',
      proficiency: item.subtitle || '',
    });
    setEditingItem(item);
    setIsAdding(false);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingItem(null);
    setFormData({
      skillName: '',
      proficiency: '',
    });
  };

  const handleSave = () => {
    if (!skillsSection) return;

    const itemData: SectionItem = {
      id: editingItem?.id || `skill-${Date.now()}`,
      title: formData.skillName,
      subtitle: formData.proficiency,
      date: '',
      description: '',
    };

    if (editingItem) {
      // Update existing item
      dispatch({
        type: 'UPDATE_SECTION_ITEM',
        payload: {
          sectionId: 'skills',
          itemId: editingItem.id,
          data: itemData,
        },
      });
    } else {
      // Add new item
      dispatch({
        type: 'ADD_SECTION_ITEM',
        payload: {
          sectionId: 'skills',
          item: itemData,
        },
      });
    }

    handleCancel();
  };

  const handleDelete = (itemId: string) => {
    if (window.confirm('Are you sure you want to delete this skill?')) {
      dispatch({
        type: 'REMOVE_SECTION_ITEM',
        payload: {
          sectionId: 'skills',
          itemId,
        },
      });
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isFormVisible = isAdding || editingItem !== null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">Skills</h2>
        {!isFormVisible && (
          <button
            onClick={handleAddClick}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
          >
            <span>+</span>
            <span>Add Skill</span>
          </button>
        )}
      </div>

      {/* Form */}
      {isFormVisible && (
        <div className="bg-white/50 backdrop-blur rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-medium text-slate-900">
            {editingItem ? 'Edit Skill' : 'Add Skill'}
          </h3>

          <div className="space-y-4">
            {/* Skill Name */}
            <div className="bg-white/50 backdrop-blur rounded-lg p-3">
              <label htmlFor="skillName" className="block text-sm font-medium text-slate-700 mb-1">
                Skill Name
              </label>
              <input
                type="text"
                id="skillName"
                value={formData.skillName}
                onChange={(e) => handleInputChange('skillName', e.target.value)}
                className="w-full bg-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/50 px-2 py-1.5"
                placeholder="React"
              />
            </div>

            {/* Level/Proficiency */}
            <div className="bg-white/50 backdrop-blur rounded-lg p-3">
              <label htmlFor="proficiency" className="block text-sm font-medium text-slate-700 mb-1">
                Level/Proficiency <span className="text-slate-500 text-xs">(Optional)</span>
              </label>
              <input
                type="text"
                id="proficiency"
                value={formData.proficiency}
                onChange={(e) => handleInputChange('proficiency', e.target.value)}
                className="w-full bg-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/50 px-2 py-1.5"
                placeholder="Advanced"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* List View */}
      {!isFormVisible && items.length > 0 && (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
            >
              <div className="flex-1">
                <div className="font-medium text-slate-900">{item.title}</div>
                {item.subtitle && (
                  <div className="text-sm text-slate-600">{item.subtitle}</div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEditClick(item)}
                  className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                  title="Edit"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  title="Delete"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isFormVisible && items.length === 0 && (
        <div className="text-center py-8 text-slate-500">
          <p>No skills yet. Click "Add Skill" to get started.</p>
        </div>
      )}
    </div>
  );
}

