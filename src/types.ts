export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  image_url?: string;
  is_active?: boolean;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}

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
