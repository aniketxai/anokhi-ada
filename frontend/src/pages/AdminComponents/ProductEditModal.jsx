import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader, Save, UploadCloud, Trash2 } from 'lucide-react';

function getImageList(images) {
  return String(images || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function ProductEditModal({
  isOpen,
  product,
  form,
  onChange,
  onUploadImages,
  onRemoveImage,
  onSave,
  onClose,
  loading,
  uploadingImages,
}) {
  const imageList = getImageList(form.images);

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
            className="fixed inset-0 z-50 flex items-start sm:items-center justify-center px-4 py-10 sm:py-12"
          >
            <div className="w-full max-w-2xl max-h-[90vh] rounded-[28px] border border-border bg-card shadow-2xl overflow-hidden flex flex-col">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border p-6 bg-surface-muted">
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    {product?.id || product?._id ? 'Edit Product' : 'Create Product'}
                  </h2>
                  {product?.id && (
                    <p className="mt-1 text-sm font-medium text-secondary-text">
                      ID: {product.id}
                    </p>
                  )}
                </div>

                <button
                  onClick={onClose}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground hover:bg-muted transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form
                onSubmit={onSave}
                className="flex-1 overflow-y-auto p-6 space-y-4 bg-card"
              >
                {/* Name + Category */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-foreground">
                      Name *
                    </span>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => onChange('name', e.target.value)}
                      className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm font-medium text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-foreground">
                      Category *
                    </span>
                    <input
                      required
                      value={form.category}
                      onChange={(e) => onChange('category', e.target.value)}
                      className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm font-medium text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </label>
                </div>

                {/* Price + Rating + Stock */}
                <div className="grid gap-4 sm:grid-cols-3">
                  <label className="block">
                    <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-foreground">
                      Price *
                    </span>
                    <input
                      required
                      type="number"
                      step="0.01"
                      value={form.price}
                      onChange={(e) => onChange('price', e.target.value)}
                      className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm font-medium text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-foreground">
                      Rating
                    </span>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      value={form.rating}
                      onChange={(e) => onChange('rating', e.target.value)}
                      placeholder="4.8"
                      className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm font-medium text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-foreground">
                      Stock Qty
                    </span>
                    <input
                      type="number"
                      value={form.stockQty}
                      onChange={(e) => onChange('stockQty', e.target.value)}
                      className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm font-medium text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </label>
                </div>

                {/* Net Weight (admin-only) */}
                <div className="grid gap-4 sm:grid-cols-3 items-end">
                  <label className="block">
                    <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-foreground">
                      Net Weight
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.netWeight}
                      onChange={(e) => onChange('netWeight', e.target.value)}
                      placeholder="e.g. 250"
                      className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm font-medium text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-foreground">
                      Unit
                    </span>
                    <select
                      value={form.netWeightUnit}
                      onChange={(e) => onChange('netWeightUnit', e.target.value)}
                      className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm font-medium text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="g" className="bg-card text-foreground">g</option>
                      <option value="kg" className="bg-card text-foreground">kg</option>
                    </select>
                  </label>

                  <div className="text-xs text-secondary-text pb-3">
                    Net weight is admin-only metadata used for pricing calculations.
                  </div>
                </div>

                {/* Description */}
                <label className="block">
                  <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-foreground">
                    Description *
                  </span>
                  <textarea
                    required
                    rows={4}
                    value={form.description}
                    onChange={(e) => onChange('description', e.target.value)}
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm font-medium text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                  />
                </label>

                {/* Images */}
                <div className="rounded-3xl border border-border bg-surface-muted p-4 space-y-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-bold text-foreground">
                        Product Images
                      </p>
                      <p className="text-xs text-secondary-text">
                        Upload one or more images to Cloudinary.
                      </p>
                    </div>

                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-bold text-foreground hover:bg-muted transition-colors shadow-xs">
                      <UploadCloud className="w-4 h-4 text-primary" />
                      {uploadingImages ? 'Uploading...' : 'Choose files'}
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        disabled={uploadingImages}
                        onChange={(e) =>
                          onUploadImages?.(e.target.files)
                        }
                      />
                    </label>
                  </div>

                  <label className="block">
                    <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-foreground">
                      Image URLs
                    </span>
                    <textarea
                      rows={3}
                      value={form.images}
                      onChange={(e) => onChange('images', e.target.value)}
                      placeholder="Paste Cloudinary URLs separated by commas"
                      className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                    />
                  </label>

                  {imageList.length > 0 ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {imageList.map((src, index) => (
                        <div
                          key={`${src}-${index}`}
                          className="group overflow-hidden rounded-2xl border border-border bg-card"
                        >
                          <div className="relative aspect-4/3 bg-muted">
                            <img
                              src={src}
                              alt={`Product ${index + 1}`}
                              className="h-full w-full object-contain"
                            />

                            <button
                              type="button"
                              onClick={() => onRemoveImage?.(index)}
                              className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-destructive text-white hover:opacity-90 shadow-md"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-border bg-card p-5 text-center text-sm font-medium text-secondary-text">
                      No images yet.
                    </div>
                  )}
                </div>
              </form>

              {/* Footer */}
              <div className="border-t border-border bg-surface-muted p-6 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex flex-1 items-center justify-center rounded-full border border-border bg-card px-4 py-3 text-sm font-bold text-foreground hover:bg-muted transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={onSave}
                  disabled={loading}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-bold text-primary-foreground hover:opacity-95 transition-opacity disabled:opacity-60 shadow-sm"
                >
                  {loading ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}

                  {product?.id || product?._id ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}