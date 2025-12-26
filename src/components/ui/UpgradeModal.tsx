import { X, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Unlock this Feature</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gray-700 mb-6">
            This feature is available on the Job Seeker and Career Architect plans. Upgrade now to access unlimited AI tools.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/pricing"
              onClick={onClose}
              className="flex-1 py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all duration-200 text-center"
            >
              View Pricing
            </Link>
            <button
              onClick={onClose}
              className="flex-1 py-3 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}




























