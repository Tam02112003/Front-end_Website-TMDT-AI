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
