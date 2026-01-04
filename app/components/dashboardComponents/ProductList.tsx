"use client";
import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useProducts, Product, ProductFormData } from "@/app/hooks/useProducts";
import ProductListHeader from "./ProductListHeader";
import MessageBanner from "./MessageBanner";
import ProductTable from "./ProductTable";
import ProductViewModal from "./ProductViewModal";
import ProductEditModal from "./ProductEditModal";

const ProductList = React.memo(() => {
  const {
    products,
    categories,
    loading,
    error,
    success,
    fetchProducts,
    fetchCategories,
    updateProduct,
    deleteProduct,
  } = useProducts();

  const handleCategoryCreated = async (category: {
    _id: string;
    name: string;
    slug: string;
  }) => {
    // Refresh categories list after creating a new one
    await fetchCategories();
    // Return the category so the form can use it
    return category;
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    price: "",
    oldPrice: "",
    discount: "",
    rating: "",
    brand: "",
    category: "",
    categoryName: "",
    variants: [],
  });
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

  useEffect(() => {
    // Fetch both in parallel for faster loading
    // Only fetch on initial mount, not when functions change
    let isMounted = true;

    Promise.all([fetchProducts(), fetchCategories()]).catch((error) => {
      if (isMounted) {
        console.error("Error fetching data:", error);
      }
    });

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Auto-clear messages
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        // Messages are auto-cleared by the hook
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      oldPrice: product.oldPrice?.toString() || "",
      discount: product.discount?.toString() || "",
      rating: product.rating.toString(),
      brand: product.brand,
      category: product.category,
      categoryName: product.categoryName,
      hideFromHome: product.hideFromHome ?? false,
      variants:
        product.variants?.map((variant) => ({
          _id: variant._id,
          color: variant.color,
          size: variant.size,
          quantity: variant.quantity.toString(),
          sku: variant.sku,
        })) || [],
    });
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingProduct(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      oldPrice: "",
      discount: "",
      rating: "",
      brand: "",
      category: "",
      categoryName: "",
      hideFromHome: false,
      variants: [],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    setSubmitting(true);
    const success = await updateProduct(editingProduct._id, formData);
    if (success) {
      handleCloseEditModal();
    }
    setSubmitting(false);
  };


  const handleDelete = async (id: string) => {
    if (deleteConfirm !== id) {
      setDeleteConfirm(id);
      return;
    }

    setDeleting(id);
    await deleteProduct(id);
    setDeleteConfirm(null);
    setDeleting(null);
  };

  // Filter products
  const filteredProducts = products.filter((product) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (product.name?.toLowerCase() || "").includes(searchLower) ||
      (product.brand?.toLowerCase() || "").includes(searchLower) ||
      (product.categoryName?.toLowerCase() || "").includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-orange" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <ProductListHeader
        productCount={products.length}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <MessageBanner type="error" message={error || ""} />
      <MessageBanner type="success" message={success || ""} />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <ProductTable
          products={filteredProducts}
          searchTerm={searchTerm}
          onView={setViewingProduct}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCancelDelete={() => setDeleteConfirm(null)}
          deleting={deleting}
          deleteConfirm={deleteConfirm}
        />
      </div>

      <ProductViewModal
        product={viewingProduct}
        onClose={() => setViewingProduct(null)}
      />

      <ProductEditModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        formData={formData}
        categories={categories}
        onSubmit={handleSubmit}
        onCancel={handleCloseEditModal}
        onChange={setFormData}
        onCategoryCreated={handleCategoryCreated}
        submitting={submitting}
      />
    </div>
  );
});

ProductList.displayName = "ProductList";

export default ProductList;
