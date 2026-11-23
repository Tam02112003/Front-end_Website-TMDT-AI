import api from './api';
import { Product } from '../models';

const API_URL = '/wishlist';

const getWishlist = () => {
  return api.get<Product[]>(`${API_URL}/`);
};

const getWishlistIds = () => {
  return api.get<number[]>(`${API_URL}/ids`);
};

const addToWishlist = (productId: number) => {
  return api.post(`${API_URL}/add`, { product_id: productId });
};

const removeFromWishlist = (productId: number) => {
  return api.delete(`${API_URL}/remove`, { params: { product_id: productId } });
};

const WishlistService = {
  getWishlist,
  getWishlistIds,
  addToWishlist,
  removeFromWishlist,
};

export default WishlistService;
