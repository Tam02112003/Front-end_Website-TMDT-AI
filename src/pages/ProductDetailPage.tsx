import { useEffect, useState } from 'react';
import CommentItem from '../components/CommentItem';
import { useParams } from 'react-router-dom';
import { Typography, Box, CircularProgress, Alert, Card, CardMedia, CardContent, Button, TextField, Snackbar, List, IconButton } from '@mui/material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import CartService from '../services/CartService';
import ProductService from '../services/ProductService'; // Import ProductService
import ProductRecommendation from '../components/ProductRecommendation';
import Countdown from '../components/Countdown';
import { Product } from '../models'; // Import Product from models.ts
import { Comment, CommentCreate, CartItem } from '../types'; // Import Comment and CommentCreate
import { AutoFixHighOutlined } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { colors } from '../theme';

const formatVnd = (amount: number) => amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

const ProductDetailPage = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth(); // Get user from useAuth
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addLoading, setAddLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ open: boolean, message: string, severity: 'success' | 'error' } | null>(null);

  // Image carousel state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Comment states
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentContent, setNewCommentContent] = useState<string>(''); // Moved here
  const [commentLoading, setCommentLoading] = useState<boolean>(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  // Comment editing states
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingCommentContent, setEditingCommentContent] = useState<string>('');

  // Reply states
  const [replyingToCommentId, setReplyingToCommentId] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState<string>('');

  // Helper function to build a comment tree
  const buildCommentTree = (comments: Comment[]) => {
    const commentMap: { [key: number]: Comment & { children?: Comment[] } } = {};
    comments.forEach(comment => {
      commentMap[comment.id] = { ...comment, children: [] };
    });

    const rootComments: (Comment & { children?: Comment[] })[] = [];
    comments.forEach(comment => {
      if (comment.parent_comment_id && commentMap[comment.parent_comment_id]) {
        commentMap[comment.parent_comment_id].children?.push(commentMap[comment.id]);
      } else {
        rootComments.push(commentMap[comment.id]);
      }
    });
    return rootComments;
  };

  useEffect(() => {
    const fetchProductAndCart = async () => {
      if (!productId) return;
      console.log('DEBUG: isLoggedIn status at start of fetchProductAndCart:', isLoggedIn);
      try {
        setLoading(true);
        const productResponse = await api.get<Product>(`/products/${productId}`);
        let currentProduct = productResponse.data;
        let cartQuantity = 0;

        console.log('DEBUG: Backend product quantity (total stock):', currentProduct.quantity);
        
        if (isLoggedIn) {
          console.log('DEBUG: Inside isLoggedIn block.');
          try {
            const cartResponse = await CartService.getCart();
            console.log('DEBUG: Raw cartResponse:', cartResponse);
            if (cartResponse.data && Array.isArray(cartResponse.data.items)) {
              console.log('DEBUG: Cart items array:', cartResponse.data.items);
              const cartItem = cartResponse.data.items.find((item: CartItem) => {
                console.log('DEBUG: Comparing cart item product_id:', item.product_id, 'Type:', typeof item.product_id, 'with Number(currentProduct.id):', Number(currentProduct.id));
                return item.product_id === Number(currentProduct.id);
              });
              if (cartItem && typeof cartItem.quantity === 'number') {
                cartQuantity = cartItem.quantity;
              }
            }
          } catch (cartErr) {
            console.error('Failed to fetch cart for product quantity adjustment:', cartErr);
            // Continue even if cart fetch fails, just won't adjust quantity
          }
        }
        console.log('DEBUG: Quantity of this product in cart (after find):', cartQuantity);
        currentProduct = { ...currentProduct, quantity: (currentProduct.quantity ?? 0) - cartQuantity };
        console.log('DEBUG: Final calculated available quantity:', currentProduct.quantity);
        setProduct(currentProduct);
        setError(null);
      } catch (err) {
        setError('Failed to fetch product details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductAndCart();
  }, [productId, isLoggedIn]);

  // Fetch comments effect
  useEffect(() => {
    const fetchComments = async () => {
      if (!productId) return;
      try {
        setCommentLoading(true);
        const response = await ProductService.readProductComments(parseInt(productId));
        setComments(response.data);
      } catch (err) {
        setCommentError('Failed to fetch comments.');
        console.error(err);
      } finally {
        setCommentLoading(false);
      }
    };

    fetchComments();
  }, [productId]);

  const handleAddToCart = async () => {
    if (!product) return;
    setAddLoading(true);
    try {
      await CartService.addToCart(product.id, quantity);
      setFeedback({ open: true, message: 'Added to cart successfully!', severity: 'success' });
      // Update local product quantity and quantity in cart
      setProduct(prevProduct => {
        if (prevProduct) {
          return { ...prevProduct, quantity: (prevProduct.quantity ?? 0) - quantity };
        }
        return null;
      });
    } catch (err) {
      setFeedback({ open: true, message: 'Failed to add to cart.', severity: 'error' });
      console.error(err);
    } finally {
      setAddLoading(false);
    }
  };

  const handlePostComment = async (parentId: number | null = null) => {
    const contentToPost = parentId ? replyContent : newCommentContent;

    if (!productId || !user || !contentToPost.trim()) {
      return;
    }

    setCommentLoading(true);
    try {
      const commentData: CommentCreate = {
        product_id: parseInt(productId),
        content: contentToPost.trim(),
        user_name: user.username, // Use username from auth context
        parent_comment_id: parentId ?? undefined, // Include parent_comment_id if it's a reply
      };
      await ProductService.createCommentForProduct(parseInt(productId), commentData);
      if (parentId) {
        setReplyContent(''); // Clear reply input
        setReplyingToCommentId(null); // Close reply input
      } else {
        setNewCommentContent(''); // Clear main comment input
      }
      // Re-fetch comments to update the list
      const response = await ProductService.readProductComments(parseInt(productId));
      setComments(response.data);
      setFeedback({ open: true, message: 'Comment posted successfully!', severity: 'success' });
    } catch (err) {
      setCommentError('Failed to post comment.');
      setFeedback({ open: true, message: 'Failed to post comment.', severity: 'error' });
      console.error(err);
    } finally {
      setCommentLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingCommentContent('');
  };

  const handleSaveEditedComment = async (commentId: number) => {
    if (!productId || !editingCommentContent.trim()) return;

    setCommentLoading(true);
    try {
      await ProductService.updateProductComment(parseInt(productId), commentId, { content: editingCommentContent.trim() });
      setEditingCommentId(null);
      setEditingCommentContent('');
      // Re-fetch comments to update the list
      const response = await ProductService.readProductComments(parseInt(productId));
      setComments(response.data);
      setFeedback({ open: true, message: 'Comment updated successfully!', severity: 'success' });
    } catch (err) {
      setCommentError('Failed to update comment.');
      setFeedback({ open: true, message: 'Failed to update comment.', severity: 'error' });
      console.error(err);
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!productId) return;

    setCommentLoading(true);
    try {
      await ProductService.deleteProductComment(parseInt(productId), commentId);
      // Re-fetch comments to update the list
      const response = await ProductService.readProductComments(parseInt(productId));
      setComments(response.data);
      setFeedback({ open: true, message: 'Comment deleted successfully!', severity: 'success' });
    } catch (err) {
      setCommentError('Failed to delete comment.');
      setFeedback({ open: true, message: 'Failed to delete comment.', severity: 'error' });
      console.error(err);
    } finally {
      setCommentLoading(false);
    }
  };

  const handleCloseFeedback = () => {
    setFeedback(null);
  };

  const isDiscountActive = (product: Product) => {
    if (product.discount_percent === undefined || product.discount_percent === null) {
      return false;
    }
    const now = new Date();
    const startDate = product.start_date ? new Date(product.start_date) : null;
    const endDate = product.end_date ? new Date(product.end_date) : null;

    return (
      product.discount_percent > 0 &&
      (!startDate || now >= startDate) &&
      (!endDate || now <= endDate)
    );
  };

  const handlePreviousImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? (product?.image_urls?.length || 1) - 1 : prevIndex - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === (product?.image_urls?.length || 1) - 1 ? 0 : prevIndex + 1
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress sx={{ color: colors.jade }} />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!product) {
    return <Alert severity="info">Không tìm thấy sản phẩm.</Alert>;
  }

  return (
    <>
      <Card>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ width: { xs: '100%', md: 'calc(66.66% - 8px)' } }}>
            <Box sx={{ position: 'relative', width: '100%', paddingTop: '75%', overflow: 'hidden', bgcolor: '#0D0E10' }}>
              {product.image_urls && product.image_urls.length > 0 ? (
                <CardMedia
                  component="img"
                  sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'contain' }}
                  image={product.image_urls[currentImageIndex]}
                  alt={product.name}
                />
              ) : (
                <CardMedia
                  component="img"
                  sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'contain' }}
                  image={'https://upload.wikimedia.org/wikipedia/commons/d/df/Mechanical_keyboard_example.jpg'}
                  alt={product.name}
                />
              )}
              {product.image_urls && product.image_urls.length > 1 && (
                <>
                  <IconButton
                    sx={{ position: 'absolute', top: '50%', left: 8, transform: 'translateY(-50%)', bgcolor: 'rgba(22,24,28,0.7)', color: colors.ink, '&:hover': { bgcolor: 'rgba(22,24,28,0.9)' } }}
                    onClick={handlePreviousImage}
                    disabled={currentImageIndex === 0}
                  >
                    <ArrowBackIosIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    sx={{ position: 'absolute', top: '50%', right: 8, transform: 'translateY(-50%)', bgcolor: 'rgba(22,24,28,0.7)', color: colors.ink, '&:hover': { bgcolor: 'rgba(22,24,28,0.9)' } }}
                    onClick={handleNextImage}
                    disabled={currentImageIndex === (product.image_urls.length - 1)}
                  >
                    <ArrowForwardIosIcon fontSize="small" />
                  </IconButton>
                </>
              )}
            </Box>
            {/* Thumbnails */}
            {product.image_urls && product.image_urls.length > 1 && (
              <Box sx={{ display: 'flex', overflowX: 'auto', gap: 1, mt: 2, p: 1, border: `1px solid ${colors.border}` }}>
                {product.image_urls.map((url, index) => (
                  <CardMedia
                    key={index}
                    component="img"
                    sx={{
                      width: '100px',
                      height: '100px',
                      objectFit: 'cover',
                      flexShrink: 0,
                      cursor: 'pointer',
                      border: index === currentImageIndex ? `2px solid ${colors.jade}` : '2px solid transparent',
                      '&:hover': { borderColor: colors.jade }
                    }}
                    image={url}
                    alt={`Ảnh ${index + 1}`}
                    onClick={() => setCurrentImageIndex(index)}
                  />
                ))}
              </Box>
            )}
          </Box>
          <Box sx={{ width: { xs: '100%', md: 'calc(33.33% - 8px)' } }}>
            <CardContent>
              <Typography variant="h5" component="h1" gutterBottom>
                {product.name}
              </Typography>
              {isDiscountActive(product) ? (
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                  <Typography sx={{ color: colors.muted, textDecoration: 'line-through' }}>{formatVnd(product.price)}</Typography>
                  <Typography variant="h5" sx={{ fontFamily: '"IBM Plex Mono", monospace', fontWeight: 700, color: colors.camel }}>
                    {formatVnd(product.final_price ?? product.price)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.danger }}>(-{product.discount_percent}%)</Typography>
                </Box>
              ) : (
                <Typography variant="h5" sx={{ fontFamily: '"IBM Plex Mono", monospace', fontWeight: 700, color: colors.camel, mb: 1 }}>
                  {formatVnd(product.price)}
                </Typography>
              )}
              {product.release_date && new Date(product.release_date) > new Date() && (
                <Countdown releaseDate={product.release_date} />
              )}
              <Typography variant="body2" sx={{ color: colors.muted, mt: 1 }}>
                Còn hàng: {product.quantity ?? 0}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 3, gap: 2 }}>
                <TextField
                  label="SL"
                  type="number"
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(product.quantity ?? 1, parseInt(e.target.value, 10) || 1)))}
                  sx={{ width: '80px' }}
                  inputProps={{ min: 1, max: (product.quantity as number) ?? 1 }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAddToCart}
                  disabled={!isLoggedIn || addLoading || (product.quantity ?? 0) === 0 || quantity > (product.quantity ?? 0) || !!(product.release_date && new Date(product.release_date) > new Date())}
                  sx={{ flex: 1 }}
                >
                  {addLoading ? <CircularProgress size={22} sx={{ color: '#0D1210' }} /> : 'Thêm giỏ hàng'}
                </Button>
              </Box>
              <Button
                variant="outlined"
                startIcon={<AutoFixHighOutlined />}
                fullWidth
                sx={{ mt: 1.5, borderColor: colors.border, color: colors.ink, '&:hover': { borderColor: colors.camel, color: colors.camel } }}
                onClick={() => navigate('/try-on', { state: { productId: product.id, productName: product.name, productImage: product.image_urls?.[0] } })}
              >
                Ghép thử AI
              </Button>
              {!isLoggedIn && (
                <Typography variant="caption" sx={{ color: colors.danger, mt: 1, display: 'block' }}>
                  Đăng nhập để thêm vào giỏ hàng.
                </Typography>
              )}
            </CardContent>
          </Box>
        </Box>
      </Card>

      {/* Product Description */}
      <Box sx={{ mt: 4, p: 3, border: `1px solid ${colors.border}`, borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>
          Mô tả sản phẩm
        </Typography>
        <div dangerouslySetInnerHTML={{ __html: product.description || '' }} style={{ whiteSpace: 'pre-wrap' }} />
      </Box>

      {/* Comments Section */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Bình luận
        </Typography>
        {commentLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress sx={{ color: colors.jade }} />
          </Box>
        ) : commentError ? (
          <Alert severity="error">{commentError}</Alert>
        ) : comments.length === 0 ? (
          <Typography sx={{ color: colors.muted }}>Chưa có bình luận nào. Hãy là người đầu tiên!</Typography>
        ) : (
          <List>
            {buildCommentTree(comments).map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                level={0}
                productId={productId ?? ''}
                isLoggedIn={isLoggedIn}
                user={user}
                editingCommentId={editingCommentId}
                editingCommentContent={editingCommentContent}
                replyingToCommentId={replyingToCommentId}
                replyContent={replyContent}
                setEditingCommentId={setEditingCommentId}
                setEditingCommentContent={setEditingCommentContent}
                handleSaveEditedComment={handleSaveEditedComment}
                handleCancelEdit={handleCancelEdit}
                handleDeleteComment={handleDeleteComment}
                setReplyingToCommentId={setReplyingToCommentId}
                setReplyContent={setReplyContent}
                handlePostComment={handlePostComment}
                commentLoading={commentLoading}
              />
            ))}
          </List>
        )}

        {/* Add New Comment Form */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Viết bình luận
          </Typography>
          {isLoggedIn ? (
            <>
              <TextField
                label="Nội dung"
                multiline
                rows={4}
                fullWidth
                variant="outlined"
                value={newCommentContent}
                onChange={(e) => setNewCommentContent(e.target.value)}
                sx={{ mb: 2 }}
                disabled={commentLoading}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={() => handlePostComment(null)}
                disabled={commentLoading || !newCommentContent.trim()}
              >
                {commentLoading ? <CircularProgress size={22} sx={{ color: '#0D1210' }} /> : 'Đăng bình luận'}
              </Button>
            </>
          ) : (
            <Alert severity="info">
              Đăng nhập để viết bình luận.
            </Alert>
          )}
        </Box>
      </Box>

      {productId && <ProductRecommendation productId={parseInt(productId)} />}
      {feedback && (
        <Snackbar
          open={feedback.open}
          autoHideDuration={6000}
          onClose={handleCloseFeedback}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseFeedback} severity={feedback.severity} sx={{ width: '100%' }}>
            {feedback.message}
          </Alert>
        </Snackbar>
      )}
    </>
  );
};

export default ProductDetailPage;
