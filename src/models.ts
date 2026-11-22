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
  avatar_url?: string;
  phone_number?: string;
}

export interface Brand {
  id: number;
  name: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  image_urls?: string[];
  is_active: boolean;
  is_ai_generated?: boolean;
  created_at: string;
  updated_at: string;
  discount_percent?: number;
  final_price?: number;
  release_date?: string;
  start_date?: string;
  end_date?: string;
  brand?: Brand;
  category?: Category;
  brand_id?: number;
  category_id?: number;
  quantity?: number;
  avg_rating?: number;
  review_count?: number;
}

export interface OrderItem {
  product_id: number;
  quantity: number;
  price: number;
  product_name: string;
  image_urls?: string[];
}

export interface OrderSummary {
  id: number;
  user_id: number;
  total_amount: number;
  status: string;
  created_at: string;
  order_code: string;
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
  shipping_phone_number?: string;
}

export interface NewsCreate {
  title: string;
  content?: string;
  image_url?: string;
  is_active?: boolean;
}

export interface NewsUpdate {
  title?: string;
  content?: string;
  image_url?: string;
  is_active?: boolean;
}

export interface News {
  id: number;
  title: string;
  content?: string;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AINewsGenerateRequest {
  topic: string;
  keywords?: string;
  length: string;
}

export interface NewsSource {
  title: string;
  url: string;
}

export interface NewsImageCandidate {
  url: string;
  description?: string;
}

export interface AINewsGenerateResponse {
  title: string;
  content: string;
  sources: NewsSource[];
  images: NewsImageCandidate[];
}

export interface ProductResearchRequest {
  topic: string;
  keywords?: string;
}

export interface ProductCandidate {
  id: number;
  name: string;
  description?: string;
  estimated_price?: number;
  category_id?: number;
  category_name?: string;
  brand_id?: number;
  brand_name?: string;
  image_url?: string;
  source_url?: string;
}

export interface ProductResearchResponse {
  candidates: ProductCandidate[];
  sources: NewsSource[];
  images: NewsImageCandidate[];
}
