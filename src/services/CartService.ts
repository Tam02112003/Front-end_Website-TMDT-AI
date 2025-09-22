import api from './api';

const API_URL = '/cart';

const addToCart = (productId: number, quantity: number) => {
  return api.post(`${API_URL}/add`, { product_id: productId, quantity });
};

const getCart = () => {
  return api.get(`${API_URL}/`);
};

const removeFromCart = (productId: number) => {
  return api.delete(`${API_URL}/remove`, { params: { product_id: productId } });
};

const updateCart = (productId: number, quantity: number) => {
  return api.put(`${API_URL}/update`, { product_id: productId, quantity });
};

const clearCart = () => {
  return api.delete(`${API_URL}/clear`);
};

const CartService = {
  addToCart,
  getCart,
  removeFromCart,
  updateCart,
  clearCart,
};

export default CartService;