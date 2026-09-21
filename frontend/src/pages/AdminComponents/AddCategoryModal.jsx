import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader, Plus, FolderPlus, Sparkles, AlertCircle, Tag, Check } from 'lucide-react';

const CATEGORY_PRESETS = [
  { name: 'Home Decor', subs: ['Wall Art', 'Candles', 'Vases', 'Fairy Lights'] },
  { name: 'Stationery', subs: ['Notebooks', 'Pens', 'Planners', 'Stickers'] },
  { name: 'Apparel & Kurtis', subs: ['Cotton Kurti', 'Anarkali', 'Dupatta', 'Ethnic Wear'] },
  { name: 'Organic Skincare', subs: ['Face Wash', 'Serums', 'Moisturizer', 'Masks'] },
  { name: 'Gifts & Souvenirs', subs: ['Custom Mugs', 'Photo Frames', 'Keychains', 'Gift Hampers'] },
  { name: 'Accessories', subs: ['Handbags', 'Wallets', 'Belts', 'Sunglasses'] },
];

export function AddCategoryModal({
  isOpen,
  onClose,
  onSaveCategory,
  existingCategories = [],
  loading,
}) {
  const [categoryName, setCategoryName] = useState('');
  const [subCategoriesInput, setSubCategoriesInput] = useState('');

  const subCategoryList = useMemo(() => {
    return subCategoriesInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }, [subCategoriesInput]);

  const isDuplicate = useMemo(() => {
    if (!categoryName.trim()) return false;
    const norm = categoryName.trim().toLowerCase();
    return (existingCategories || []).some((c) => {
      const name = typeof c === 'string' ? c : c?.name;
      return String(name || '').toLowerCase() === norm;
    });
  }, [categoryName, existingCategories]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    onSaveCategory({
      name: categoryName.trim(),
      subCategories: subCategoryList,
    }).then(() => {
      setCategoryName('');
      setSubCategoriesInput('');
    });
  };

  const applyPreset = (preset) => {
    setCategoryName(preset.name);
    setSubCategoriesInput(preset.subs.join(', '));
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
            <div className="w-full max-w-lg rounded-[28px] border border-border bg-card shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border p-6 bg-surface-muted">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary shadow-xs">
                    <FolderPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">
                      Add Custom Category
                    </h2>
                    <p className="text-xs font-medium text-secondary-text">
                      Create and permanently store new category in MongoDB
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

              {/* Body */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 bg-card">
                {/* Category Name */}
                <div>
                  <label className="block mb-2 text-xs font-bold uppercase tracking-wider text-foreground flex items-center justify-between">
                    <span>Category Name *</span>
                    {isDuplicate && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 dark:text-amber-400">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Exists in database (will merge)
                      </span>
                    )}
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Organic Skincare"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm font-medium text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {/* Subcategories Input */}
                <div>
                  <label className="block mb-2 text-xs font-bold uppercase tracking-wider text-foreground">
                    Sub Categories (Optional, comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Face Wash, Serums, Moisturizer"
                    value={subCategoriesInput}
                    onChange={(e) => setSubCategoriesInput(e.target.value)}
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm font-medium text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  <p className="mt-1.5 text-xs text-secondary-text">
                    Type subcategory names separated by commas.
                  </p>

                  {/* Subcategory Live Badges Preview */}
                  {subCategoryList.length > 0 && (
                    <div className="mt-3 rounded-2xl border border-border bg-surface-muted p-3">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-secondary-text mb-2 flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-primary" />
                        Subcategories Tag Preview ({subCategoryList.length})
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {subCategoryList.map((sub, i) => (
                          <span
                            key={`${sub}-${i}`}
                            className="inline-flex items-center gap-1 rounded-full bg-primary/15 border border-primary/30 px-3 py-1 text-xs font-bold text-primary"
                          >
                            <Check className="w-3 h-3" />
                            {sub}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Presets */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-secondary-text mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Quick Suggestions
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORY_PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => applyPreset(preset)}
                        className={`rounded-xl border border-border px-3 py-1.5 text-xs font-semibold transition-all ${
                          categoryName === preset.name
                            ? 'bg-primary text-white border-primary shadow-xs font-bold'
                            : 'bg-surface-muted text-foreground hover:bg-muted'
                        }`}
                      >
                        + {preset.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-3 flex gap-3 border-t border-border">
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
