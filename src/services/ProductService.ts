import api from './api';
import { Comment, CommentCreate } from '../types';
import { Product } from '../models'; // Import Product from models.ts

// Define ProductCreate and ProductUpdate based on the imported Product interface
interface ProductCreate extends Omit<Product, 'id' | 'created_at' | 'updated_at' | 'discount_percent' | 'final_price'> {}
interface ProductUpdate extends Partial<ProductCreate> {}
const createProduct = (productData: ProductCreate) => {
  return api.post<Product>('/admin/products', productData);
};

const getAllProducts = (searchQuery?: string, category_id?: number, brand_id?: number, min_price?: number, max_price?: number) => {
  return api.get<Product[]>('/products', { params: { search: searchQuery, category_id, brand_id, min_price, max_price } });
};

const getProductById = (productId: number) => {
  return api.get<Product>(`/admin/products/${productId}`);
};

const updateProduct = (productId: number, productData: ProductUpdate) => {
  return api.put<Product>(`/admin/products/${productId}`, productData);
};

const deleteProduct = (productId: number) => {
  return api.delete(`/admin/products/${productId}`);
};

const uploadProductsCsv = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/products/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

const getProductRecommendations = (productId: number) => {
  return api.get<Product[]>(`/products/${productId}/recommendations`);
};

const readProductComments = (productId: number) => {
  return api.get<Comment[]>(`/products/${productId}/comments`);
};

const createCommentForProduct = (productId: number, commentData: CommentCreate) => {
  return api.post<Comment>(`/products/${productId}/comments`, commentData);
};

const updateProductComment = (productId: number, commentId: number, commentData: { content: string }) => {
  return api.put<Comment>(`/products/${productId}/comments/${commentId}`, commentData);
};

const deleteProductComment = (productId: number, commentId: number) => {
  return api.delete(`/products/${productId}/comments/${commentId}`);
};

const getDeletedProducts = () => {
  return api.get<Product[]>('/admin/products/deleted');
};

const restoreProduct = (productId: number) => {
  return api.put<Product>(`/admin/products/${productId}/restore`);
};

const ProductService = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  uploadProductsCsv,
  getProductRecommendations,
  readProductComments,
  createCommentForProduct,
  updateProductComment,
  deleteProductComment,
  getDeletedProducts,
  restoreProduct,
};

export default ProductService;
