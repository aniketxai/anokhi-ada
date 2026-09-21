import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Plus, Trash2, Tag, Folder, FolderPlus, Loader } from 'lucide-react';

export function ManageCategoriesModal({
  isOpen,
  onClose,
  dbCategories = [],
  onOpenAddCategory,
  onAddSubCategory,
  onDeleteCategory,
  loading,
}) {
  const [query, setQuery] = useState('');
  const [addingSubCatFor, setAddingSubCatFor] = useState(null);
  const [newSubCatText, setNewSubCatText] = useState('');

  const filteredCategories = (dbCategories || []).filter((cat) => {
    const name = typeof cat === 'string' ? cat : cat?.name;
    return String(name || '').toLowerCase().includes(query.trim().toLowerCase());
  });

  const handleAddSubCategorySubmit = (catName) => {
    if (!newSubCatText.trim()) return;
    onAddSubCategory?.(catName, newSubCatText.trim()).then(() => {
      setAddingSubCatFor(null);
      setNewSubCatText('');
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
            <div className="w-full max-w-2xl max-h-[85vh] rounded-[28px] border border-border bg-card shadow-2xl overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border p-6 bg-surface-muted">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary shadow-xs">
                    <Folder className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">
                      Manage Database Categories
                    </h2>
                    <p className="text-xs font-medium text-secondary-text">
                      View, edit subcategories, or delete custom categories in MongoDB
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onClose();
                      onOpenAddCategory?.();
                    }}
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground hover:opacity-90 shadow-xs"
                  >
                    <FolderPlus className="w-4 h-4" />
                    + New Category
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground hover:bg-muted transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Search input */}
              <div className="p-4 border-b border-border bg-card">
                <div className="relative">
                  <Search className="w-4 h-4 pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search database categories..."
                    className="w-full rounded-2xl border border-border bg-background py-2.5 pl-11 pr-4 text-sm font-medium text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {/* Category List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-card divide-y divide-border/50">
                {filteredCategories.length === 0 ? (
                  <div className="py-12 text-center text-secondary-text">
                    <p className="font-semibold text-sm">No custom categories found.</p>
                    <p className="text-xs mt-1">Click "+ New Category" to create your first custom category.</p>
                  </div>
                ) : (
                  filteredCategories.map((item, index) => {
                    const catObj = typeof item === 'object' ? item : { name: item, isCustom: false };
                    const catName = catObj.name;
                    const subCats = catObj.subCategories || [];

                    return (
                      <div key={`${catName}-${index}`} className="pt-4 first:pt-0 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <h3 className="font-bold text-foreground text-sm">{catName}</h3>
                            {catObj.isCustom && (
                              <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                Custom DB
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setAddingSubCatFor(catName);
                                setNewSubCatText('');
                              }}
                              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-muted px-3 py-1 text-xs font-bold text-foreground hover:bg-muted transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5 text-primary" />
                              Add Subcategory
                            </button>

                            {catObj.isCustom && (
                              <button
                                type="button"
                                onClick={() => onDeleteCategory?.(catName)}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors"
                                title="Delete Custom Category"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Inline subcategory add input */}
                        {addingSubCatFor === catName && (
                          <div className="flex items-center gap-2 pt-2">
                            <input
                              autoFocus
                              type="text"
                              placeholder="New subcategory name..."
                              value={newSubCatText}
                              onChange={(e) => setNewSubCatText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddSubCategorySubmit(catName);
                                }
                              }}
                              className="flex-1 rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground outline-none focus:border-primary"
                            />
                            <button
                              type="button"
                              onClick={() => handleAddSubCategorySubmit(catName)}
                              disabled={loading || !newSubCatText.trim()}
                              className="rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50"
                            >
                              {loading ? <Loader className="w-3.5 h-3.5 animate-spin" /> : 'Save'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setAddingSubCatFor(null)}
                              className="rounded-xl border border-border px-3 py-1.5 text-xs font-bold text-foreground hover:bg-muted"
                            >
                              Cancel
                            </button>
                          </div>
                        )}

                        {/* Subcategory tags */}
                        {subCats.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {subCats.map((sub, sIdx) => (
                              <span
                                key={`${catName}-${sub}-${sIdx}`}
                                className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-muted px-2.5 py-0.5 text-xs font-semibold text-secondary-text"
                              >
                                <Tag className="w-3 h-3 text-muted-foreground" />
                                {sub}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground italic">No subcategories attached yet.</p>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-border p-4 bg-surface-muted flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full border border-border bg-card px-6 py-2.5 text-xs font-bold text-foreground hover:bg-muted transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
