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
      <div className="grid gap-6 mb-6">
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
                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:opacity-90 transition-opacity shadow-xs">
                <Plus className="w-4 h-4" />
                Add
              </button>
              <button 
                onClick={() => setIsImportModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-bold text-foreground hover:bg-muted transition-colors shadow-xs">
                <Upload className="w-4 h-4" />
                Import
              </button>
            </div>
          }
        >
          <div className="mb-5 grid gap-3 md:grid-cols-[1fr_220px]">
            <div className="relative">
              <Search className="w-4 h-4 pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={productQuery}
                onChange={(e) => setProductQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full rounded-2xl border border-border bg-background py-3 pl-11 pr-4 text-sm font-medium text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="relative">
              <Filter className="w-4 h-4 pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <select
                value={productCategory}
                onChange={(e) => setProductCategory(e.target.value)}
                className="w-full appearance-none rounded-2xl border border-border bg-background py-3 pl-11 pr-4 text-sm font-semibold text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                {categoryOptions.map((option) => (
                  <option key={option} value={option} className="bg-card text-foreground">
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-xs">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border text-left">
                <thead className="bg-surface-muted text-xs uppercase tracking-wider text-foreground font-bold">
                  <tr>
                    <th className="px-4 py-3.5 font-bold">Product</th>
                    <th className="px-4 py-3.5 font-bold">Category</th>
                    <th className="px-4 py-3.5 font-bold">Net wt</th>
                    <th className="px-4 py-3.5 font-bold">Price</th>
                    <th className="px-4 py-3.5 font-bold">Rating</th>
                    <th className="px-4 py-3.5 font-bold">Stock</th>
                    <th className="px-4 py-3.5 font-bold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {(filteredProducts || []).length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-4 py-8 text-center">
                        <p className="text-secondary-text font-medium">No products found. {adminProducts.length === 0 ? 'Create your first product by clicking "Add product".' : 'Try adjusting your search or filters.'}</p>
                      </td>
                    </tr>
                  ) : (
                    (filteredProducts || []).map((product) => (
                    <tr key={product.id || product._id} className="hover:bg-surface-muted/60 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 overflow-hidden rounded-2xl border border-border bg-muted shrink-0">
                            <img
                              src={product.images?.[0] || 'https://via.placeholder.com/48?text=No+Image'}
                              alt={product.name}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/48?text=No+Image';
                              }}
                            />
                          </div>
                          <div>
                            <p className="font-bold text-foreground text-sm">{product.name}</p>
                            <p className="text-xs text-secondary-text font-medium">ID {product.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-foreground">{product.category}</td>
                      <td className="px-4 py-4 text-sm font-medium text-foreground">{product.netWeight ? `${product.netWeight}${product.netWeightUnit || 'g'}` : '-'}</td>
                      <td className="px-4 py-4 text-sm font-bold text-primary">{formatINR(product.price)}</td>
                      <td className="px-4 py-4">
                        <div className="inline-flex items-center gap-1 text-sm font-bold text-amber-700">
                          <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                          {product.rating || 0}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${product.inStock ? 'border-emerald-300 bg-emerald-100 text-emerald-900' : 'border-rose-300 bg-rose-100 text-rose-900'}`}>
                          {product.inStock ? 'In stock' : 'Out of stock'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => beginEditProduct(product)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground hover:bg-muted transition-colors shadow-xs"
                            title="View/Edit"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors shadow-xs"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
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
              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:opacity-90 transition-opacity shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          }
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <div 
              onClick={() => {
                resetProductForm();
                setEditingProductId(null);
                setIsProductModalOpen(true);
              }}
              className="rounded-3xl border border-border bg-surface-muted p-5 text-center cursor-pointer hover:border-primary/50 transition-colors"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary mx-auto mb-3">
                <Plus className="w-5 h-5" />
              </div>
              <p className="font-bold text-foreground">Add New</p>
              <p className="text-xs text-secondary-text mt-1">Create a new product</p>
            </div>
            <div className="rounded-3xl border border-border bg-surface-muted p-5 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 mx-auto mb-3">
                <PackageCheck className="w-5 h-5" />
              </div>
              <p className="font-extrabold text-2xl text-foreground">{adminProducts.length}</p>
              <p className="text-xs text-secondary-text font-medium mt-1">Total products</p>
            </div>
            <div className="rounded-3xl border border-border bg-surface-muted p-5 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-800 mx-auto mb-3">
                <AlertCircle className="w-5 h-5" />
              </div>
              <p className="font-extrabold text-2xl text-foreground">{(adminProducts || []).filter((p) => !p.inStock).length}</p>
              <p className="text-xs text-secondary-text font-medium mt-1">Out of stock</p>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
