import { useEffect, useState } from 'react';
import { Typography, Card, CardMedia, CardContent, CircularProgress, Alert, Box, Button, CardActions, TextField, InputAdornment, Snackbar, Chip, Container, Paper } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { Product, Brand, Category } from '../models';
import ProductService from '../services/ProductService';
import CartService from '../services/CartService';
import BrandService from '../services/BrandService';
import CategoryService from '../services/CategoryService';
import { useAuth } from '../context/AuthContext';
import Countdown from '../components/Countdown';
import ProductFilter from '../components/ProductFilter';
import ReviewStars from '../components/ReviewStars';
import { Search, ShoppingCartOutlined, AutoFixHighOutlined } from '@mui/icons-material';
import { colors } from '../theme';
import '../styles/responsive.css';

const formatVnd = (amount: number) => amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

const ProductsPage = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filters, setFilters] = useState<{ brand_id?: number; category_id?: number; min_price?: number; max_price?: number; }>({});
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [feedback, setFeedback] = useState<{ open: boolean, message: string, severity: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [brandsResponse, categoriesResponse] = await Promise.all([
          BrandService.getBrands(),
          CategoryService.getCategories(),
        ]);
        setBrands(brandsResponse.data);
        setCategories(categoriesResponse.data);
      } catch (err) {
        console.error('Failed to fetch filters', err);
      }
    };
    fetchFilters();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await ProductService.getAllProducts(searchQuery, filters.category_id, filters.brand_id, filters.min_price, filters.max_price);
        setProducts(response.data);
        setError(null);
      } catch (err) {
        setError('Không tải được danh sách sản phẩm. Kiểm tra lại kết nối backend.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const handler = setTimeout(() => {
      fetchProducts();
    }, 400);

    return () => clearTimeout(handler);
  }, [searchQuery, filters]);

  const handleFilterChange = (newFilters: { brand_id?: number; category_id?: number; min_price?: number; max_price?: number; }) => {
    setFilters(prevFilters => ({ ...prevFilters, ...newFilters }));
  };

  const handleAddToCart = async (product: Product) => {
    if (!isLoggedIn) {
      setFeedback({ open: true, message: 'Đăng nhập để thêm vào giỏ hàng.', severity: 'error' });
      return;
    }
    try {
      await CartService.addToCart(product.id, 1);
      setFeedback({ open: true, message: 'Đã thêm vào giỏ hàng!', severity: 'success' });
    } catch (err) {
      setFeedback({ open: true, message: 'Thêm vào giỏ hàng thất bại.', severity: 'error' });
      console.error(err);
    }
  };

  const handleTryOn = (product: Product) => {
    navigate('/try-on', { state: { productId: product.id, productName: product.name, productImage: product.image_urls?.[0] } });
  };

  const handleCloseFeedback = () => setFeedback(null);

  const isDiscountActive = (product: Product) => {
    if (product.discount_percent === undefined || product.discount_percent === null) return false;
    const now = new Date();
    const startDate = product.start_date ? new Date(product.start_date) : null;
    const endDate = product.end_date ? new Date(product.end_date) : null;
    return product.discount_percent > 0 && (!startDate || now >= startDate) && (!endDate || now <= endDate);
  };

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }} className="responsive-container">
      <Box sx={{ mb: { xs: 3, md: 4 } }}>
        <Typography variant="h3" component="h1" sx={{ fontSize: { xs: '1.8rem', sm: '2.3rem', md: '2.6rem' }, mb: 1 }}>
          Sản phẩm
        </Typography>
        <Typography sx={{ color: colors.muted, mb: 3 }}>
          Bàn phím cơ, switch và keycap — lọc theo thương hiệu, danh mục hoặc khoảng giá bạn cần.
        </Typography>

        <TextField
          placeholder="Tìm sản phẩm..."
          variant="outlined"
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ maxWidth: { xs: '100%', sm: 600 } }}
          InputProps={{
            startAdornment: <InputAdornment position="start"><Search sx={{ color: colors.muted }} /></InputAdornment>,
            endAdornment: loading && <InputAdornment position="end"><CircularProgress size={18} sx={{ color: colors.jade }} /></InputAdornment>,
          }}
        />
      </Box>

      <ProductFilter brands={brands} categories={categories} filters={filters} onFilterChange={handleFilterChange} />

      {products.length === 0 && !loading ? (
        <Paper sx={{ p: { xs: 4, md: 6 }, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ color: colors.muted, mb: 1 }}>Không tìm thấy sản phẩm</Typography>
          <Typography sx={{ color: colors.muted }}>Thử đổi từ khóa hoặc bộ lọc khác.</Typography>
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
                  {isDiscountActive(product) && (
                    <Chip label={`-${product.discount_percent}%`} sx={{ position: 'absolute', top: 10, right: 10, bgcolor: colors.danger, color: '#fff', fontWeight: 700 }} />
                  )}
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

                  {product.release_date && new Date(product.release_date) > new Date() ? (
                    <Countdown releaseDate={product.release_date} />
                  ) : product.discount_percent && product.final_price !== undefined ? (
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, flexWrap: 'wrap' }}>
                      <Typography variant="body2" sx={{ color: colors.muted, textDecoration: 'line-through' }}>{formatVnd(product.price)}</Typography>
                      <Typography sx={{ fontFamily: '"IBM Plex Mono", monospace', fontWeight: 700, color: colors.camel }}>{formatVnd(product.final_price)}</Typography>
                    </Box>
                  ) : (
                    <Typography sx={{ fontFamily: '"IBM Plex Mono", monospace', fontWeight: 700, color: colors.camel }}>{formatVnd(product.price)}</Typography>
                  )}
                </CardContent>

                <CardActions sx={{ p: 2.5, pt: 0, gap: 1 }}>
                  <Button
                    variant="contained"
                    size="small"
                    color="primary"
                    onClick={() => handleAddToCart(product)}
                    disabled={!isLoggedIn || (!!product.release_date && new Date(product.release_date) > new Date()) || (product.quantity ?? 0) <= 0}
                    startIcon={<ShoppingCartOutlined />}
                    className="touch-target"
                    sx={{ flex: 1 }}
                  >
                    Thêm giỏ
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleTryOn(product)}
                    startIcon={<AutoFixHighOutlined />}
                    className="touch-target"
                    sx={{ flex: 1, borderColor: colors.border, color: colors.ink, '&:hover': { borderColor: colors.camel, color: colors.camel } }}
                  >
                    Ghép AI
                  </Button>
                </CardActions>
              </Card>
            </Box>
          ))}
        </Box>
      )}

      {feedback && (
        <Snackbar open={feedback.open} autoHideDuration={6000} onClose={handleCloseFeedback} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert onClose={handleCloseFeedback} severity={feedback.severity} sx={{ width: '100%' }}>{feedback.message}</Alert>
        </Snackbar>
      )}
    </Container>
  );
};

export default ProductsPage;
