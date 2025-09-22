import api from './api';

interface OrderItemRequest {
  product_id: number;
  quantity: number;
}

interface ShippingAddressRequest {
  address: string;
  city: string;
  postal_code: string;
  country: string;
}

interface PlaceOrderRequest {
  items: OrderItemRequest[];
  shipping_address: ShippingAddressRequest;
  payment_method: string;
}

interface PlaceOrderResponse {
  order_id: number;
  status: string;
}

const placeOrder = (data: PlaceOrderRequest) => {
  return api.post<PlaceOrderResponse>('/orders', data);
};

const getOrders = (searchQuery?: string) => {
  return api.get('/orders', { params: { search: searchQuery } });
};

const getAllOrders = (searchQuery?: string) => {
  return api.get('/admin/all_orders', { params: { search: searchQuery } });
};

const getOrderByCode = (orderCode: string) => {
  return api.get(`/orders/${orderCode}`);
};

const updateOrderStatus = (orderCode: string, status: string) => {
  return api.put('/orders/status', { order_code: orderCode, status });
};

const OrderService = {
  placeOrder,
  getOrders,
  getAllOrders,
  getOrderByCode,
  updateOrderStatus,
};

export default OrderService;
