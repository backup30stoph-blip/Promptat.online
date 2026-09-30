import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  itemType: string;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  itemType,
}) => {
  const [confirmationInput, setConfirmationInput] = useState('');

  // Reset input when modal opens/closes or target changes
  useEffect(() => {
    if (isOpen) {
      setConfirmationInput('');
    }
  }, [isOpen, itemName]);

  const normalizedTarget = itemName.trim();
  const normalizedInput = confirmationInput.trim();
  const isMatch = normalizedInput.toLowerCase() === normalizedTarget.toLowerCase();

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (isMatch) {
      onConfirm();
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="relative w-full max-w-md overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-xl"
            id="confirm-delete-modal-card"
          >
            {/* Header / Close button */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                    Confirm Deletion
                  </h3>
                  <p className="text-[11px] font-semibold text-rose-500 uppercase tracking-wider mt-0.5">
                    Critical Safeguard Active
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <div className="mt-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                You are about to permanently delete this {itemType.toLowerCase()}. This action is irreversible and will remove all corresponding metadata, associations, and statistics.
              </p>

              <div className="mt-3 rounded-lg bg-slate-50 border border-slate-100 p-3">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Target Asset Title
                </span>
                <span className="mt-1 block text-xs font-mono font-semibold text-slate-800 break-all select-all">
                  {itemName}
                </span>
              </div>
            </div>

            {/* Safeguard Form */}
            <form onSubmit={handleConfirm} className="mt-5 space-y-4">
              <div>
                <label 
                  htmlFor="delete-confirm-input" 
                  className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5"
                >
                  Type the asset title to confirm deletion:
                </label>
                <input
                  id="delete-confirm-input"
                  type="text"
                  required
                  autoFocus
                  placeholder="Type asset name exactly"
                  value={confirmationInput}
                  onChange={(e) => setConfirmationInput(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none transition-all focus:border-rose-500 focus:ring-1 focus:ring-rose-500 min-h-[38px] font-mono"
                  autoComplete="off"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer min-h-[38px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isMatch}
                  className={`inline-flex items-center justify-center space-x-2 rounded-lg px-4 py-2 text-xs font-bold text-white transition-all min-h-[38px] cursor-pointer shadow-sm ${
                    isMatch
                      ? 'bg-rose-600 hover:bg-rose-700 hover:shadow-md'
                      : 'bg-rose-300 opacity-60 cursor-not-allowed'
                  }`}
                  id="delete-confirm-modal-submit-btn"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete Permanently</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
