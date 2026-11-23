import { Typography, Button, Container, Paper, Box, CircularProgress, Alert, Card, CardContent, CardMedia, Chip, Snackbar } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import RecommendationService from '../services/RecommendationService';
import ProductService from '../services/ProductService';
import { useAuth } from '../context/AuthContext';
import { Product } from '../models';
import { TrendingUp, KeyboardAltOutlined, AutoFixHighOutlined } from '@mui/icons-material';
import Countdown from '../components/Countdown';
import ReviewStars from '../components/ReviewStars';
import WishlistButton from '../components/WishlistButton';
import { colors } from '../theme';

import '../styles/responsive.css';

const formatVnd = (amount: number) => amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

const ProductCard = ({ product }: { product: Product }) => (
  <Card
    sx={{
      width: 260,
      height: 400,
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      transition: 'border-color 0.15s ease',
      '&:hover': { borderColor: colors.jade },
    }}
  >
    <CardMedia
      component="img"
      sx={{ height: 200, objectFit: 'cover', bgcolor: '#0D0E10' }}
      image={product.image_urls?.[0] || 'https://upload.wikimedia.org/wikipedia/commons/d/df/Mechanical_keyboard_example.jpg'}
      alt={product.name}
    />
    <Box sx={{ position: 'absolute', top: 8, left: 8, zIndex: 1 }}>
      <WishlistButton productId={product.id} size="small" />
    </Box>
    {product.release_date && new Date(product.release_date) > new Date() && (
      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 200, bgcolor: 'rgba(22,24,28,0.85)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: colors.ink, textAlign: 'center' }}>
        <Typography variant="body2" sx={{ fontFamily: '"IBM Plex Mono", monospace', mb: 1 }}>Sắp ra mắt</Typography>
        <Countdown releaseDate={product.release_date} />
      </Box>
    )}
    <CardContent sx={{ flexGrow: 1, p: 2.5, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <RouterLink to={`/products/${product.slug || product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <Typography variant="body1" sx={{ fontWeight: 600, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', mb: 1 }}>
          {product.name}
        </Typography>
      </RouterLink>
      <Box sx={{ mb: 1 }}>
        <ReviewStars rating={product.avg_rating} reviewCount={product.review_count} />
      </Box>
      {product.discount_percent && product.final_price !== undefined ? (
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, flexWrap: 'wrap' }}>
          <Typography variant="body2" sx={{ color: colors.muted, textDecoration: 'line-through' }}>{formatVnd(product.price)}</Typography>
          <Typography sx={{ fontFamily: '"IBM Plex Mono", monospace', fontWeight: 700, color: colors.camel }}>{formatVnd(product.final_price)}</Typography>
          <Chip label={`-${product.discount_percent}%`} size="small" sx={{ bgcolor: colors.danger, color: '#fff' }} />
        </Box>
      ) : (
        <Typography sx={{ fontFamily: '"IBM Plex Mono", monospace', fontWeight: 700, color: colors.camel }}>{formatVnd(product.price)}</Typography>
      )}
    </CardContent>
  </Card>
);

const ProductRow = ({ products }: { products: Product[] }) => (
  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
    {products.map((p) => <ProductCard key={p.id} product={p} />)}
  </Box>
);

const HomePage = () => {
  const { isLoggedIn } = useAuth();
  const [personalizedRecommendations, setPersonalizedRecommendations] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [recLoading, setRecLoading] = useState<boolean>(true);
  const [recError, setRecError] = useState<string | null>(null);
  const [featuredLoading, setFeaturedLoading] = useState<boolean>(true);
  const [featuredError, setFeaturedError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ open: boolean, message: string, severity: 'success' | 'error' } | null>(null);

  const handleCloseFeedback = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    setFeedback(null);
  };

  useEffect(() => {
    const fetchPersonalizedRecommendations = async () => {
      if (!isLoggedIn) {
        setRecLoading(false);
        return;
      }
      try {
        setRecLoading(true);
        const response = await RecommendationService.getPersonalizedRecommendations();
        setPersonalizedRecommendations(response.data);
      } catch (err) {
        setRecError('Không tải được gợi ý cá nhân hóa.');
        console.error(err);
      } finally {
        setRecLoading(false);
      }
    };
    fetchPersonalizedRecommendations();
  }, [isLoggedIn]);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setFeaturedLoading(true);
        const response = await ProductService.getAllProducts();
        const now = new Date();
        const special = response.data.filter(product => {
          const isReleasing = product.release_date && new Date(product.release_date) > now;
          const isDiscountActive = product.discount_percent && product.discount_percent > 0 &&
                                   (!product.start_date || new Date(product.start_date) <= now) &&
                                   (!product.end_date || new Date(product.end_date) >= now);
          return isReleasing || isDiscountActive;
        });
        // Fall back to the latest catalog items so the homepage is never empty
        // when nothing is currently on sale or upcoming.
        const toShow = special.length > 0 ? special : response.data;
        setFeaturedProducts(toShow.slice(0, 8));
      } catch (err) {
        setFeaturedError('Không tải được danh sách sản phẩm.');
        console.error(err);
      } finally {
        setFeaturedLoading(false);
      }
    };
    fetchFeaturedProducts();
  }, []);

  const heroImage = featuredProducts[0]?.image_urls?.[0]
    || 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Keychron_K8_Non-Backlight_Wireless_Mechanical_Keyboard_with_Cherry_Profile_Double_-_Shot_PBT_Full_Set_Keycaps_-_Camel.jpg';

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }} className="responsive-container">
      {/* Hero */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'center',
          gap: { xs: 4, md: 8 },
          mb: 8,
          pt: { xs: 2, md: 4 },
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography
            component="h1"
            sx={{
              fontFamily: '"IBM Plex Mono", monospace',
              fontWeight: 700,
              fontSize: { xs: '2rem', sm: '2.6rem', md: '3.2rem' },
              lineHeight: 1.1,
              mb: 2,
            }}
          >
            Gõ đúng cảm giác.
          </Typography>
          <Typography variant="h6" component="p" sx={{ color: colors.muted, fontWeight: 400, mb: 3, maxWidth: 480 }}>
            Bàn phím cơ, switch và keycap tuyển chọn cho dân văn phòng, game thủ và người mê gõ phím — từ linear êm nhẹ đến tactile rõ ràng.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              size="large"
              variant="contained"
              color="primary"
              component={RouterLink}
              to="/products"
              startIcon={<KeyboardAltOutlined />}
              className="touch-target"
            >
              Xem sản phẩm
            </Button>
            <Button
              size="large"
              variant="outlined"
              component={RouterLink}
              to="/try-on"
              startIcon={<AutoFixHighOutlined />}
              className="touch-target"
              sx={{ borderColor: colors.border, color: colors.ink, '&:hover': { borderColor: colors.jade } }}
            >
              Thử ghép AI
            </Button>
          </Box>
        </Box>

        <Box
          sx={{
            flex: 1,
            width: '100%',
            position: 'relative',
            borderRadius: 2,
            overflow: 'hidden',
            border: `1px solid ${colors.border}`,
            boxShadow: `0 0 80px -20px ${colors.jade}55`,
          }}
        >
          <Box
            component="img"
            src={heroImage}
            alt="Bàn phím cơ nổi bật"
            sx={{ width: '100%', height: { xs: 240, md: 360 }, objectFit: 'cover', display: 'block' }}
          />
        </Box>
      </Box>

      {/* Personalized Recommendations */}
      {isLoggedIn && (
        <Box sx={{ mb: 8 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <TrendingUp sx={{ color: colors.jade }} />
            <Typography variant="h5" component="h2">Gợi ý dành cho bạn</Typography>
          </Box>
          {recLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress size={32} sx={{ color: colors.jade }} /></Box>
          ) : recError ? (
            <Alert severity="error">{recError}</Alert>
          ) : personalizedRecommendations.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography sx={{ color: colors.muted, mb: 2 }}>Chưa có gợi ý — khám phá thêm sản phẩm để AI hiểu gu của bạn hơn.</Typography>
              <Button variant="outlined" component={RouterLink} to="/products" sx={{ borderColor: colors.border, color: colors.ink }}>Khám phá sản phẩm</Button>
            </Paper>
          ) : (
            <ProductRow products={personalizedRecommendations} />
          )}
        </Box>
      )}

      {/* Featured */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <KeyboardAltOutlined sx={{ color: colors.jade }} />
          <Typography variant="h5" component="h2">Sản phẩm nổi bật</Typography>
        </Box>
        {featuredLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress size={32} sx={{ color: colors.jade }} /></Box>
        ) : featuredError ? (
          <Alert severity="error">{featuredError}</Alert>
        ) : featuredProducts.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography sx={{ color: colors.muted }}>Chưa có sản phẩm nào.</Typography>
          </Paper>
        ) : (
          <ProductRow products={featuredProducts} />
        )}
      </Box>

      {feedback && (
        <Snackbar open={feedback.open} autoHideDuration={6000} onClose={handleCloseFeedback} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert onClose={handleCloseFeedback} severity={feedback.severity} sx={{ width: '100%' }}>{feedback.message}</Alert>
        </Snackbar>
      )}
    </Container>
  );
};

export default HomePage;
