import { useEffect, useState } from 'react';
import { Typography, Box, CircularProgress, Alert, Paper, Button, Container, Card, CardMedia, CardContent, CardActions, Snackbar } from '@mui/material';
import { FavoriteBorder, ShoppingCartOutlined } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import WishlistService from '../services/WishlistService';
import CartService from '../services/CartService';
import WishlistButton from '../components/WishlistButton';
import ReviewStars from '../components/ReviewStars';
import { Product } from '../models';
import { colors } from '../theme';
import '../styles/responsive.css';

const formatVnd = (amount: number) => amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

const WishlistPage = () => {
  const { isLoggedIn } = useAuth();
  const { wishlistIds } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ open: boolean; message: string; severity: 'success' | 'error' } | null>(null);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await WishlistService.getWishlist();
      setProducts(response.data);
      setError(null);
    } catch (err) {
      setError('Không tải được danh sách yêu thích.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchWishlist();
    } else {
      setLoading(false);
    }
  }, [isLoggedIn]);

  // Re-sync the list whenever the heart icon toggles something elsewhere
  // (e.g. the user removes an item from its card right here on this page).
  useEffect(() => {
    if (isLoggedIn) {
      setProducts((prev) => prev.filter((p) => wishlistIds.has(p.id)));
    }
  }, [wishlistIds, isLoggedIn]);

  const handleAddToCart = async (product: Product) => {
    try {
      await CartService.addToCart(product.id, 1);
      setFeedback({ open: true, message: 'Đã thêm vào giỏ hàng!', severity: 'success' });
    } catch (err) {
      setFeedback({ open: true, message: 'Thêm vào giỏ hàng thất bại.', severity: 'error' });
      console.error(err);
    }
  };

  if (!isLoggedIn) {
    return (
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 8 }, textAlign: 'center' }} className="responsive-container">
        <Paper sx={{ p: { xs: 4, md: 6 } }}>
          <FavoriteBorder sx={{ fontSize: 64, color: colors.muted, mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Đăng nhập để xem danh sách yêu thích
          </Typography>
          <Button variant="contained" component={Link} to="/login" size="large" color="primary">
            Đăng nhập
          </Button>
        </Paper>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }} className="responsive-container">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress size={40} sx={{ color: colors.jade }} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }} className="responsive-container">
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }} className="responsive-container">
      <Typography variant="h3" sx={{ fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.6rem' }, mb: 4 }}>
        Sản phẩm yêu thích
      </Typography>

      {products.length === 0 ? (
        <Paper sx={{ p: { xs: 4, md: 6 }, textAlign: 'center' }}>
          <FavoriteBorder sx={{ fontSize: 64, color: colors.muted, mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Chưa có sản phẩm yêu thích
          </Typography>
          <Typography sx={{ color: colors.muted, mb: 3 }}>
            Bấm biểu tượng trái tim trên sản phẩm để lưu lại xem sau.
          </Typography>
          <Button component={Link} to="/products" variant="contained" size="large" color="primary" startIcon={<ShoppingCartOutlined />}>
            Khám phá sản phẩm
          </Button>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }} className="responsive-grid">
          {products.map((product) => (
            <Box key={product.id} sx={{ width: 280 }}>
              <Card sx={{ width: 280, height: 480, display: 'flex', flexDirection: 'column', transition: 'border-color 0.15s ease', '&:hover': { borderColor: colors.jade } }}>
                <Box sx={{ position: 'relative' }}>
                  <Link to={`/products/${product.id}`} style={{ textDecoration: 'none' }}>
                    <CardMedia
                      component="img"
                      sx={{ height: 220, objectFit: 'cover', bgcolor: '#0D0E10' }}
                      image={product.image_urls?.[0] || 'https://upload.wikimedia.org/wikipedia/commons/d/df/Mechanical_keyboard_example.jpg'}
                      alt={product.name}
                    />
                  </Link>
                  <Box sx={{ position: 'absolute', top: 8, left: 8 }}>
                    <WishlistButton productId={product.id} size="small" />
                  </Box>
                </Box>
                <CardContent sx={{ flexGrow: 1, p: 2.5, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Link to={`/products/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <Typography variant="body1" sx={{ fontWeight: 600, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', mb: 1 }}>
                      {product.name}
                    </Typography>
                  </Link>
                  <Box sx={{ mb: 1 }}>
                    <ReviewStars rating={product.avg_rating} reviewCount={product.review_count} />
                  </Box>
                  <Typography sx={{ fontFamily: '"IBM Plex Mono", monospace', fontWeight: 700, color: colors.camel }}>
                    {formatVnd(product.final_price ?? product.price)}
                  </Typography>
                </CardContent>
                <CardActions sx={{ p: 2.5, pt: 0 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    startIcon={<ShoppingCartOutlined />}
                    onClick={() => handleAddToCart(product)}
                    disabled={(product.quantity ?? 0) === 0}
                  >
                    Thêm giỏ hàng
                  </Button>
                </CardActions>
              </Card>
            </Box>
          ))}
        </Box>
      )}

      {feedback && (
        <Snackbar open={feedback.open} autoHideDuration={4000} onClose={() => setFeedback(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert onClose={() => setFeedback(null)} severity={feedback.severity} sx={{ width: '100%' }}>{feedback.message}</Alert>
        </Snackbar>
      )}
    </Container>
  );
};

export default WishlistPage;
