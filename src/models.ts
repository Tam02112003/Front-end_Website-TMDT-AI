export interface UserLogin {
    email: string;
    password: string;
}

export interface UserCreate {
    email: string;
    password: string;
    username: string;
    full_name: string;
}
export interface User {
  id: number;
  username: string;
  email: string;
  is_admin: boolean;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  image_urls?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  discount_percent?: number;
  final_price?: number;
}

export interface OrderItem {
  product_id: number;
  quantity: number;
  price: number;
  product_name: string;
  image_urls?: string[];
}

export interface Order {
  id: number;
  order_code: string;
  user_id: number;
  total_amount: number;
  status: string;
  created_at: string;
  items: OrderItem[];
  shipping_address: string;
  shipping_city: string;
  shipping_postal_code: string;
  shipping_country: string;
  customer_name: string;
  customer_phone?: string;
}
