import api from './api';
import { Comment, CommentCreate } from '../types';

interface ProductCreate {
  name: string;
  description?: string;
  price: number;
  quantity: number;
  image_url?: string;
  is_active?: boolean;
}

interface ProductUpdate {
  name?: string;
  description?: string;
  price?: number;
  quantity?: number;
  image_url?: string;
  is_active?: boolean;
}

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const createProduct = (productData: ProductCreate) => {
  return api.post<Product>('/admin/products', productData);
};

const getAllProducts = (searchQuery?: string) => {
  return api.get<Product[]>('/products', { params: { search: searchQuery } });
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
