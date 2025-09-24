import { useEffect, useState } from 'react';
import CommentItem from '../components/CommentItem';
import { useParams } from 'react-router-dom';
import { Typography, Box, CircularProgress, Alert, Card, CardMedia, CardContent, Grid, Button, TextField, Snackbar, List, ListItem, ListItemText, Divider, IconButton } from '@mui/material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import CartService from '../services/CartService';
import ProductService from '../services/ProductService'; // Import ProductService
import ProductRecommendation from '../components/ProductRecommendation';
import { Product } from '../models'; // Import Product from models.ts
import { Comment, CommentCreate } from '../types'; // Import Comment and CommentCreate

// This comment is added to force re-compilation

const ProductDetailPage = () => {
  const { productId } = useParams<{ productId: string }>();
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
    const fetchProduct = async () => {
      if (!productId) return;
      try {
        setLoading(true);
        const response = await api.get<Product>(`/products/${productId}`);
        setProduct(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch product details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

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
    } catch (err) {
      setFeedback({ open: true, message: 'Failed to add to cart.', severity: 'error' });
      console.error(err);
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
        parent_comment_id: parentId, // Include parent_comment_id if it's a reply
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

  const handleEditComment = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditingCommentContent(comment.content);
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
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!product) {
    return <Alert severity="info">Product not found.</Alert>;
  }

  return (
    <>
      <Card>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Box sx={{ position: 'relative', width: '100%', paddingTop: '100%', overflow: 'hidden', borderRadius: 2, boxShadow: 3 }}>
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
                  image={'https://via.placeholder.com/400'}
                  alt={product.name}
                />
              )}
              {product.image_urls && product.image_urls.length > 1 && (
                <>
                  <IconButton
                    sx={{ position: 'absolute', top: '50%', left: 8, transform: 'translateY(-50%)', bgcolor: 'rgba(255,255,255,0.7)', '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' } }}
                    onClick={handlePreviousImage}
                    disabled={currentImageIndex === 0}
                  >
                    <ArrowBackIosIcon />
                  </IconButton>
                  <IconButton
                    sx={{ position: 'absolute', top: '50%', right: 8, transform: 'translateY(-50%)', bgcolor: 'rgba(255,255,255,0.7)', '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' } }}
                    onClick={handleNextImage}
                    disabled={currentImageIndex === (product.image_urls.length - 1)}
                  >
                    <ArrowForwardIosIcon />
                  </IconButton>
                </>
              )}
            </Box>
            {/* Thumbnails */}
            {product.image_urls && product.image_urls.length > 1 && (
              <Box sx={{ display: 'flex', overflowX: 'auto', gap: 1, mt: 2, p: 1, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                {product.image_urls.map((url, index) => (
                  <CardMedia
                    key={index}
                    component="img"
                    sx={{
                      width: '80px', 
                      height: '80px', 
                      objectFit: 'cover', 
                      flexShrink: 0,
                      cursor: 'pointer',
                      border: index === currentImageIndex ? '2px solid primary.main' : '2px solid transparent',
                      borderRadius: 1,
                      '&:hover': { borderColor: 'primary.light' }
                    }}
                    image={url}
                    alt={`Thumbnail ${index + 1}`}
                    onClick={() => setCurrentImageIndex(index)}
                  />
                ))}
              </Box>
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            <CardContent>
              <Typography variant="h4" component="h1" gutterBottom>
                {product.name}
              </Typography>
              {product.discount_percent && product.final_price !== undefined ? (
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                  <Typography variant="h5" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                    ${product.price.toFixed(2)}
                  </Typography>
                  <Typography variant="h4" color="error">
                    ${product.final_price.toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="error">
                    ({product.discount_percent}% OFF)
                  </Typography>
                </Box>
              ) : (
                <Typography variant="h5" color="text.secondary" gutterBottom>
                  ${product.price.toFixed(2)}
                </Typography>
              )}
              <Typography variant="body1" paragraph>
                {product.description}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                In stock: {product.quantity}
              </Typography>
              <Box sx={{ mt: 4, display: 'flex', alignItems: 'center' }}>
                <TextField
                  label="Qty"
                  type="number"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  variant="outlined"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  sx={{ width: '80px', mr: 2 }}
                  inputProps={{ min: 1, max: product.quantity }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAddToCart}
                  disabled={!isLoggedIn || addLoading || product.quantity === 0}
                >
                  {addLoading ? <CircularProgress size={24} /> : 'Add to Cart'}
                </Button>
              </Box>
              {!isLoggedIn && (
                <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                  Please log in to add items to your cart.
                </Typography>
              )}
            </CardContent>
          </Grid>
        </Grid>
      </Card>

      {/* Comments Section */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Comments
        </Typography>
        {commentLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress />
          </Box>
        ) : commentError ? (
          <Alert severity="error">{commentError}</Alert>
        ) : comments.length === 0 ? (
          <Typography>No comments yet. Be the first to comment!</Typography>
        ) : (
          <List>
            {buildCommentTree(comments).map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                level={0}
                productId={productId}
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
            Add a Comment
          </Typography>
          {isLoggedIn ? (
            <>
              <TextField
                label="Your Comment"
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
                {commentLoading ? <CircularProgress size={24} /> : 'Post Comment'}
              </Button>
            </>
          ) : (
            <Alert severity="info">
              Please log in to post a comment.
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
