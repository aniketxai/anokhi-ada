import { Search, Filter, Plus, Upload, Eye, Trash2, Star, PackageCheck, AlertCircle } from 'lucide-react';
import { SectionCard } from './Helpers';
import { formatINR } from '../../utils/currency';

export function CatalogSection({
  productQuery,
  setProductQuery,
  productCategory,
  setProductCategory,
  categoryOptions,
  filteredProducts,
  adminProducts,
  beginEditProduct,
  handleDeleteProduct,
  resetProductForm,
  setEditingProductId,
  setIsProductModalOpen,
  setIsImportModalOpen,
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 2xl:grid-cols-[1.35fr_0.95fr] mb-6">
        <SectionCard
          title="Product Catalog"
          description="Search, filter, and manage published products."
          action={
            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                  resetProductForm();
                  setEditingProductId(null);
                  setIsProductModalOpen(true);
                }}
                className="inline-flex items-center gap-2 rounded-full border border-primary/50 bg-primary/15 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/25 transition-material">
                <Plus className="w-[14px] h-[14px]" />
                Add
              </button>
              <button 
                onClick={() => setIsImportModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/5 px-3 py-2 text-xs font-semibold text-secondary-text hover:bg-white/10 transition-material">
                <Upload className="w-[14px] h-[14px]" />
                Import
              </button>
            </div>
          }
        >
          <div className="mb-4 grid gap-3 md:grid-cols-[1fr_220px]">
            <div className="relative">
              <Search className="w-[16px] h-[16px] pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-outline" />
              <input
                value={productQuery}
                onChange={(e) => setProductQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full rounded-2xl border border-white/8 bg-black/20 py-3 pl-11 pr-4 text-sm text-foreground placeholder:text-outline outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="relative">
              <Filter className="w-[16px] h-[16px] pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-outline" />
              <select
                value={productCategory}
                onChange={(e) => setProductCategory(e.target.value)}
                className="w-full appearance-none rounded-2xl border border-white/8 bg-black/20 py-3 pl-11 pr-4 text-sm text-foreground outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
              >
                {categoryOptions.map((option) => (
                  <option key={option} value={option} className="bg-background">
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-white/8">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/8 text-left">
                <thead className="bg-white/4 text-xs uppercase tracking-[0.18em] text-outline">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Product</th>
                    <th className="px-4 py-3 font-semibold">Category</th>
                    <th className="px-4 py-3 font-semibold">Net wt</th>
                    <th className="px-4 py-3 font-semibold">Price</th>
                    <th className="px-4 py-3 font-semibold">Rating</th>
                    <th className="px-4 py-3 font-semibold">Stock</th>
                    <th className="px-4 py-3 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/8 bg-black/15">
                  {(filteredProducts || []).length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-4 py-8 text-center">
                        <p className="text-secondary-text">No products found. {adminProducts.length === 0 ? 'Create your first product by clicking "Add product".' : 'Try adjusting your search or filters.'}</p>
                      </td>
                    </tr>
                  ) : (
                    (filteredProducts || []).map((product) => (
                    <tr key={product.id || product._id} className="hover:bg-white/4 transition-material">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 overflow-hidden rounded-2xl bg-white/5">
                            <img
                              src={product.images?.[0] || 'https://placehold.co/48/1a1a1a/666?text=No+Image'}
                              alt={product.name}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.target.src = 'https://placehold.co/48/1a1a1a/666?text=No+Image';
                              }}
                            />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{product.name}</p>
                            <p className="text-xs text-secondary-text">ID {product.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-secondary-text">{product.category}</td>
                      <td className="px-4 py-4 text-sm text-secondary-text">{product.netWeight ? `${product.netWeight}${product.netWeightUnit || 'g'}` : '-'}</td>
                      <td className="px-4 py-4 text-sm font-semibold text-foreground">{formatINR(product.price)}</td>
                      <td className="px-4 py-4">
                        <div className="inline-flex items-center gap-1 text-sm font-semibold text-amber-300">
                          <Star className="w-[14px] h-[14px] fill-current" />
                          {product.rating || 0}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${product.inStock ? 'border-emerald-500/25 bg-emerald-500/15 text-emerald-300' : 'border-red-500/25 bg-red-500/15 text-red-300'}`}>
                          {product.inStock ? 'In stock' : 'Out of stock'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => beginEditProduct(product)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/8 bg-white/5 text-secondary-text hover:bg-white/10 hover:text-foreground transition-material"
                            title="View/Edit"
                          >
                            <Eye className="w-[14px] h-[14px]" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10 text-red-300 hover:bg-red-500/20 transition-material"
                            title="Delete"
                          >
                            <Trash2 className="w-[14px] h-[14px]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Quick Actions"
          description="Manage your product catalog efficiently."
          action={
            <button 
              onClick={() => {
                resetProductForm();
                setEditingProductId(null);
                setIsProductModalOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-full border border-primary/50 bg-primary/15 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/25 transition-material"
            >
              <Plus className="w-[16px] h-[16px]" />
              Add Product
            </button>
          }
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-white/8 bg-black/20 p-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary mx-auto mb-3">
                <Plus className="w-[20px] h-[20px]" />
              </div>
              <p className="font-semibold text-foreground">Add New</p>
              <p className="text-xs text-secondary-text mt-1">Create a new product</p>
            </div>
            <div className="rounded-3xl border border-white/8 bg-black/20 p-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300 mx-auto mb-3">
                <PackageCheck className="w-[20px] h-[20px]" />
              </div>
              <p className="font-semibold text-foreground">{adminProducts.length}</p>
              <p className="text-xs text-secondary-text mt-1">Total products</p>
            </div>
            <div className="rounded-3xl border border-white/8 bg-black/20 p-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/15 text-amber-300 mx-auto mb-3">
                <AlertCircle className="w-[20px] h-[20px]" />
              </div>
              <p className="font-semibold text-foreground">{(adminProducts || []).filter((p) => !p.inStock).length}</p>
              <p className="text-xs text-secondary-text mt-1">Out of stock</p>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
