import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader, Plus, FolderPlus } from 'lucide-react';

export function AddCategoryModal({
  isOpen,
  onClose,
  onSaveCategory,
  loading,
}) {
  const [categoryName, setCategoryName] = useState('');
  const [subCategoriesInput, setSubCategoriesInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    const subCats = subCategoriesInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    onSaveCategory({
      name: categoryName.trim(),
      subCategories: subCats,
    }).then(() => {
      setCategoryName('');
      setSubCategoriesInput('');
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
          >
            <div className="w-full max-w-md rounded-[28px] border border-border bg-card shadow-2xl overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border p-6 bg-surface-muted">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                    <FolderPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">
                      Add Custom Category
                    </h2>
                    <p className="text-xs font-medium text-secondary-text">
                      Save custom category directly to DB
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground hover:bg-muted transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-card">
                <div>
                  <label className="block mb-2 text-xs font-bold uppercase tracking-wider text-foreground">
                    Category Name *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Handmade Crafts"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm font-medium text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-xs font-bold uppercase tracking-wider text-foreground">
                    Sub Categories (Optional, comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Wooden, Resin, Clay"
                    value={subCategoriesInput}
                    onChange={(e) => setSubCategoriesInput(e.target.value)}
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm font-medium text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  <p className="mt-1 text-xs text-secondary-text">
                    Subcategories will be available in dropdowns for this category.
                  </p>
                </div>

                {/* Footer buttons */}
                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 rounded-full border border-border bg-card px-4 py-3 text-sm font-bold text-foreground hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !categoryName.trim()}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-bold text-primary-foreground hover:opacity-95 transition-opacity disabled:opacity-60 shadow-sm"
                  >
                    {loading ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    Save to DB
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
