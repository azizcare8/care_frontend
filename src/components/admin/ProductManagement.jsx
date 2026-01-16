"use client";
import { useState, useEffect } from "react";
import { BiSearch, BiEdit, BiTrash, BiPlus, BiX, BiImage } from "react-icons/bi";
import api from "@/utils/api";
import toast from "react-hot-toast";
import { uploadService } from "@/services/uploadService";

const PRODUCT_CATEGORIES = [
  'medical',
  'food',
  'education',
  'clothing',
  'shelter',
  'other'
];

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    image: "", // Image URL (optional)
    imageFile: null, // Uploaded image file (required)
    imagePreview: null,
    price: 0,
    isDonationItem: true,
    targetQuantity: 0,
    currentQuantity: 0,
    unit: "piece",
    status: "active",
    featured: false,
    priority: 0,
    tags: ""
  });

  useEffect(() => {
    fetchProducts();
  }, [filterCategory, filterStatus]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const params = {};
      if (filterCategory !== "all") params.category = filterCategory;
      if (filterStatus !== "all") params.status = filterStatus;
      const response = await api.get("/products", { params });
      setProducts(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      toast.error("Failed to load products");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error('Image file size should be less than 5MB');
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageFile: file, imagePreview: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required image
    if (!formData.imageFile && !editingProduct) {
      toast.error('Please choose an image file');
      return;
    }
    
    try {
      let imageUrl = formData.image; // Use URL if provided
      
      // Upload image file if provided
      if (formData.imageFile) {
        toast.loading('Uploading image...');
        const formDataUpload = new FormData();
        formDataUpload.append('image', formData.imageFile);
        const uploadResponse = await uploadService.uploadSingle(formDataUpload);
        imageUrl = uploadResponse.data.url;
        toast.dismiss();
      }
      
      // If editing and no new image uploaded, keep existing image
      if (editingProduct && !formData.imageFile && !imageUrl) {
        imageUrl = editingProduct.image?.url || '';
      }
      
      const backendBaseURL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
      const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `${backendBaseURL}${imageUrl}`;
      
      const submitData = {
        ...formData,
        image: {
          url: fullImageUrl,
          publicId: null
        },
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };
      
      // Remove imageFile from submitData
      delete submitData.imageFile;
      delete submitData.imagePreview;

      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, submitData);
        toast.success("Product updated successfully!");
      } else {
        await api.post("/products", submitData);
        toast.success("Product created successfully!");
      }
      setShowModal(false);
      setEditingProduct(null);
      resetForm();
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save product");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success("Product deleted successfully!");
      fetchProducts();
    } catch (error) {
      toast.error("Failed to delete product");
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || "",
      description: product.description || "",
      category: product.category || "",
      image: product.image?.url || "",
      imageFile: null,
      imagePreview: product.image?.url || null,
      price: product.price || 0,
      isDonationItem: product.isDonationItem !== false,
      targetQuantity: product.targetQuantity || 0,
      currentQuantity: product.currentQuantity || 0,
      unit: product.unit || "piece",
      status: product.status || "active",
      featured: product.featured || false,
      priority: product.priority || 0,
      tags: product.tags?.join(', ') || ""
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category: "",
      image: "",
      imageFile: null,
      imagePreview: null,
      price: 0,
      isDonationItem: true,
      targetQuantity: 0,
      currentQuantity: 0,
      unit: "piece",
      status: "active",
      featured: false,
      priority: 0,
      tags: ""
    });
  };

  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Product Management
          </h1>
          <p className="text-gray-600">Manage products that appear on the home page</p>
        </div>
        <button
          onClick={() => {
            setEditingProduct(null);
            resetForm();
            setShowModal(true);
          }}
          className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl font-semibold flex items-center gap-2"
        >
          <BiPlus size={20} />
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <BiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="border-2 border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          >
            <option value="all">All Categories</option>
            {PRODUCT_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border-2 border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 overflow-hidden">
        <div className="max-h-[600px] overflow-y-auto">
          <table className="w-full">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gradient-to-r from-green-500 via-blue-500 to-green-500">
                <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">Image</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">Name</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">Category</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">Price</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">Quantity</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">Status</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">Featured</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No products found
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product, idx) => (
                  <tr
                    key={product._id}
                    className={`border-b border-gray-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 transition-all duration-200 ${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                    }`}
                  >
                    <td className="px-6 py-4">
                      {product.image?.url ? (
                        <img src={product.image.url} alt={product.name} className="w-16 h-16 rounded-lg object-cover" />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center">
                          <BiImage className="text-gray-400" size={24} />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{product.name}</div>
                      <div className="text-xs text-gray-500 line-clamp-1">{product.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-400 to-purple-600 text-white">
                        {product.category?.charAt(0).toUpperCase() + product.category?.slice(1) || "Other"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">₹{product.price?.toFixed(2) || "0.00"}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {product.currentQuantity || 0} / {product.targetQuantity || 0} {product.unit}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          product.status === "active"
                            ? "bg-gradient-to-r from-green-400 to-green-600 text-white"
                            : product.status === "out_of_stock"
                            ? "bg-gradient-to-r from-red-400 to-red-600 text-white"
                            : "bg-gradient-to-r from-gray-400 to-gray-600 text-white"
                        }`}
                      >
                        {product.status?.charAt(0).toUpperCase() + product.status?.slice(1).replace(/_/g, ' ') || "Active"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          product.featured
                            ? "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white"
                            : "bg-gradient-to-r from-gray-300 to-gray-400 text-gray-700"
                        }`}
                      >
                        {product.featured ? "Featured" : "Regular"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
                          title="Edit"
                        >
                          <BiEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="p-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg"
                          title="Delete"
                        >
                          <BiTrash size={18} />
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

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-green-500 to-blue-500 text-white p-6 rounded-t-2xl flex items-center justify-between">
              <h2 className="text-2xl font-bold">{editingProduct ? "Edit Product" : "Add Product"}</h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingProduct(null);
                }}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <BiX size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="Enter product name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select category</option>
                    {PRODUCT_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows="3"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Product description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Choose Images <span className="text-red-500">*</span></label>
                <div className="flex items-center gap-3 mb-3">
                  <label className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl cursor-pointer hover:from-green-600 hover:to-green-700 transition-all duration-200 text-sm font-bold shadow-lg hover:shadow-xl">
                    Choose Image File
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleImageFileChange}
                      accept="image/*"
                      required={!editingProduct}
                    />
                  </label>
                  <span className="text-sm text-gray-600 font-medium">
                    {formData.imageFile ? formData.imageFile.name : formData.imagePreview ? 'Current image' : 'No file chosen'}
                  </span>
                </div>
                {formData.imagePreview && (
                  <div className="mt-2">
                    <img src={formData.imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-lg border-2 border-gray-300" />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="https://example.com/image.jpg (Optional)"
                />
                <p className="text-xs text-gray-500 mt-1">Optional: Provide image URL if not uploading a file</p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Quantity</label>
                  <input
                    type="number"
                    value={formData.currentQuantity}
                    onChange={(e) => setFormData({ ...formData, currentQuantity: parseInt(e.target.value) || 0 })}
                    min="0"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target Quantity</label>
                  <input
                    type="number"
                    value={formData.targetQuantity}
                    onChange={(e) => setFormData({ ...formData, targetQuantity: parseInt(e.target.value) || 0 })}
                    min="0"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="piece, kg, liter, etc."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <input
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma separated)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="tag1, tag2, tag3"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>
                <div className="flex items-center gap-4 pt-8">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Featured</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isDonationItem}
                      onChange={(e) => setFormData({ ...formData, isDonationItem: e.target.checked })}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Donation Item</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl font-semibold"
                >
                  {editingProduct ? "Update Product" : "Create Product"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingProduct(null);
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-xl hover:from-gray-500 hover:to-gray-600 transition-all shadow-lg hover:shadow-xl font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

