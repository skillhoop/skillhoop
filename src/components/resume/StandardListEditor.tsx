import { useState } from 'react';
import { useResume } from '../../context/ResumeContext';
import { SectionItem } from '../../types/resume';
import { generateSectionItemId } from '../../lib/sectionItemHelpers';
import ConfirmDialog from '../ui/ConfirmDialog';

interface StandardListEditorProps {
  sectionId: string;
  sectionTitle: string;
  titleLabel?: string;
  subtitleLabel?: string;
  dateLabel?: string;
  descriptionLabel?: string;
  titlePlaceholder?: string;
  subtitlePlaceholder?: string;
  datePlaceholder?: string;
  descriptionPlaceholder?: string;
  showDate?: boolean;
}

export default function StandardListEditor({
  sectionId,
  sectionTitle,
  titleLabel = 'Title',
  subtitleLabel = 'Subtitle',
  dateLabel = 'Date',
  descriptionLabel = 'Description',
  titlePlaceholder = 'Enter title',
  subtitlePlaceholder = 'Enter subtitle',
  datePlaceholder = 'e.g., 2020 - 2022',
  descriptionPlaceholder = 'Enter description...',
  showDate = true,
}: StandardListEditorProps) {
  const { state, dispatch } = useResume();
  const section = state.sections.find((s) => s.id === sectionId);
  const items = section?.items || [];

  const [editingItem, setEditingItem] = useState<SectionItem | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    date: '',
    description: '',
  });
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleAddClick = () => {
    setFormData({
      title: '',
      subtitle: '',
      date: '',
      description: '',
    });
    setTouchedFields(new Set());
    setIsAdding(true);
    setEditingItem(null);
  };

  const handleEditClick = (item: SectionItem) => {
    setFormData({
      title: item.title || '',
      subtitle: item.subtitle || '',
      date: item.date || '',
      description: item.description || '',
    });
    setTouchedFields(new Set());
    setEditingItem(item);
    setIsAdding(false);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingItem(null);
    setFormData({
      title: '',
      subtitle: '',
      date: '',
      description: '',
    });
    setTouchedFields(new Set());
  };

  const handleSave = () => {
    if (!section) return;

    const itemData: SectionItem = {
      id: editingItem?.id || generateSectionItemId(sectionId),
      title: formData.title,
      subtitle: formData.subtitle,
      date: formData.date,
      description: formData.description,
    };

    if (editingItem) {
      // Update existing item
      dispatch({
        type: 'UPDATE_SECTION_ITEM',
        payload: {
          sectionId,
          itemId: editingItem.id,
          data: itemData,
        },
      });
    } else {
      // Add new item
      dispatch({
        type: 'ADD_SECTION_ITEM',
        payload: {
          sectionId,
          item: itemData,
        },
      });
    }

    handleCancel();
  };

  const handleDelete = (itemId: string) => {
    setDeleteItemId(itemId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (deleteItemId) {
      dispatch({
        type: 'REMOVE_SECTION_ITEM',
        payload: {
          sectionId,
          itemId: deleteItemId,
        },
      });
      setDeleteItemId(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteItemId(null);
    setIsDeleteDialogOpen(false);
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setTouchedFields((prev) => new Set(prev).add(field));
  };

  const handleBlur = (field: keyof typeof formData) => {
    setTouchedFields((prev) => new Set(prev).add(field));
  };

  const isTitleEmpty = !formData.title.trim();
  const isTitleTouched = touchedFields.has('title');
  const isTitleInvalid = isTitleTouched && isTitleEmpty;

  const isFormVisible = isAdding || editingItem !== null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">{sectionTitle}</h2>
        {!isFormVisible && (
          <button
            onClick={handleAddClick}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
          >
            <span>+</span>
            <span>Add {sectionTitle}</span>
          </button>
        )}
      </div>

      {/* Form */}
      {isFormVisible && (
        <div className="bg-white/50 backdrop-blur rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-medium text-slate-900">
            {editingItem ? `Edit ${sectionTitle}` : `Add ${sectionTitle}`}
          </h3>

          <div className="space-y-4">
            {/* Title */}
            <div className="bg-white/50 backdrop-blur rounded-lg p-3">
              <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">
                {titleLabel}
              </label>
              <input
                type="text"
                id="title"
                value={formData.title || ''}
                onChange={(e) => handleInputChange('title', e.target.value)}
                onBlur={() => handleBlur('title')}
                className={`w-full bg-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/50 px-2 py-1.5 ${
                  isTitleInvalid ? 'border-2 border-red-500' : ''
                }`}
                placeholder={titlePlaceholder}
              />
            </div>

            {/* Subtitle */}
            <div className="bg-white/50 backdrop-blur rounded-lg p-3">
              <label htmlFor="subtitle" className="block text-sm font-medium text-slate-700 mb-1">
                {subtitleLabel}
              </label>
              <input
                type="text"
                id="subtitle"
                value={formData.subtitle || ''}
                onChange={(e) => handleInputChange('subtitle', e.target.value)}
                className="w-full bg-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/50 px-2 py-1.5"
                placeholder={subtitlePlaceholder}
              />
            </div>

            {/* Date */}
            {showDate && dateLabel && (
              <div className="bg-white/50 backdrop-blur rounded-lg p-3">
                <label htmlFor="date" className="block text-sm font-medium text-slate-700 mb-1">
                  {dateLabel}
                </label>
                <input
                  type="month"
                  id="date"
                  value={formData.date || ''}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className="w-full bg-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/50 px-2 py-1.5"
                  placeholder={datePlaceholder}
                />
              </div>
            )}

            {/* Description */}
            <div className="bg-white/50 backdrop-blur rounded-lg p-3">
              <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
                {descriptionLabel}
              </label>
              <textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={6}
                className="w-full bg-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/50 px-2 py-1.5 resize-none"
                placeholder={descriptionPlaceholder}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSave}
              disabled={isTitleEmpty}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed disabled:hover:bg-slate-400"
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
                <div className="font-medium text-slate-900">{item.title || ''}</div>
                <div className="text-sm text-slate-600">{item.subtitle || ''}</div>
                {item.date && (
                  <div className="text-xs text-slate-500 mt-1">{item.date}</div>
                )}
                {item.description && (
                  <div className="text-sm text-slate-600 mt-2 whitespace-pre-line">{item.description}</div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEditClick(item)}
                  className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                  title="Edit"
                  aria-label={`Edit ${sectionTitle.toLowerCase()} entry`}
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
                  aria-label={`Delete ${sectionTitle.toLowerCase()} entry`}
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
          <p>No {sectionTitle.toLowerCase()} entries yet. Click "Add {sectionTitle}" to get started.</p>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title={`Delete ${sectionTitle} Entry`}
        description={`Are you sure you want to delete this ${sectionTitle.toLowerCase()} entry? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
