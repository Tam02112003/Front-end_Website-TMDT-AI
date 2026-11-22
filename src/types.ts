export interface CartItem {
  product_id: number;
  name: string;
  price: number;
  image_url?: string;
  quantity: number;
}

export interface Comment {
  id: number;
  product_id: number;
  content: string;
  user_name?: string;
  user_avatar_url?: string;
  created_at: string;
  isEditing?: boolean; // Added for frontend editing state
  parent_comment_id?: number; // Added for replies
}

export interface CommentCreate {
  product_id: number;
  content: string;
  user_name?: string;
  parent_comment_id?: number; // Added for replies
}

export interface Review {
  id: number;
  product_id: number;
  user_id: number;
  username: string;
  user_avatar_url?: string;
  rating: number;
  content?: string;
  verified_purchase: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReviewCreate {
  rating: number;
  content?: string;
}

export interface ReviewSummary {
  avg_rating?: number;
  review_count: number;
}

export interface DashboardSummary {
  total_revenue: number;
  total_orders: number;
  total_customers: number;
  avg_order_value: number;
  pending_orders: number;
  revenue_change_pct?: number;
  orders_change_pct?: number;
}

export interface RevenuePoint {
  day: string;
  revenue: number;
  order_count: number;
}

export interface TopProduct {
  id: number;
  name: string;
  image_url?: string;
  quantity_sold: number;
  revenue: number;
}

export interface OrderStatusCount {
  status: string;
  count: number;
}

export interface RecentOrder {
  id: number;
  order_code: string;
  username?: string;
  total_amount: number;
  status: string;
  created_at: string;
}

export interface DashboardResponse {
  summary: DashboardSummary;
  revenue_timeseries: RevenuePoint[];
  top_products: TopProduct[];
  order_status_breakdown: OrderStatusCount[];
  recent_orders: RecentOrder[];
}
