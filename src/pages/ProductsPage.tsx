import { useEffect, useState } from 'react';
import { Typography, Grid, Card, CardMedia, CardContent, CircularProgress, Alert, Box, Button, CardActions, TextField, InputAdornment, Snackbar, Chip, Container, Paper } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { Product, Brand, Category } from '../models';
import ProductService from '../services/ProductService';
import CartService from '../services/CartService';
import BrandService from '../services/BrandService';
import CategoryService from '../services/CategoryService';
import { useAuth } from '../context/AuthContext';
import Countdown from '../components/Countdown';
import ProductFilter from '../components/ProductFilter';
import { Search, ShoppingCart, Visibility, AutoAwesome, FilterList } from '@mui/icons-material';
import '../styles/responsive.css';

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
        setError('Failed to fetch products. Please make sure the backend server is running.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const handler = setTimeout(() => {
      fetchProducts();
    }, 400);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery, filters]);

  const handleFilterChange = (newFilters: { brand_id?: number; category_id?: number; min_price?: number; max_price?: number; }) => {
    setFilters(prevFilters => ({ ...prevFilters, ...newFilters }));
  };

  const handleAddToCart = async (product: Product) => {
    if (!isLoggedIn) {
      setFeedback({ open: true, message: 'Please log in to add items to your cart.', severity: 'error' });
      return;
    }
    try {
      await CartService.addToCart(product.id, 1);
      setFeedback({ open: true, message: 'Added to cart successfully!', severity: 'success' });
    } catch (err) {
      setFeedback({ open: true, message: 'Failed to add to cart.', severity: 'error' });
      console.error(err);
    }
  };

  const handleTryOn = (productImageUrl: string) => {
    navigate('/try-on', { state: { productImageUrl } });
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

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }} className="responsive-container">
      {/* Header Section */}
      <Box sx={{ mb: { xs: 3, md: 4 } }}>
        <Typography 
          variant="h3" 
          component="h1" 
          className="responsive-heading-1"
          sx={{ 
            fontWeight: 700,
            fontSize: { xs: '1.8rem', sm: '2.3rem', md: '2.8rem' },
            background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2
          }}
        >
          Our Products
        </Typography>
        <Typography variant="h6" className="responsive-body" color="text.secondary" sx={{ mb: 3, fontSize: { xs: '0.9rem', md: '1.1rem' } }}>
          Discover our amazing collection of fashion items
        </Typography>
        
        {/* Search Bar */}
        <Paper 
          sx={{ 
            p: 1,
            display: 'flex',
            alignItems: 'center',
            maxWidth: { xs: '100%', sm: 600 },
            mx: 'auto',
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}
        >
          <TextField
            placeholder="Search for products..."
            variant="outlined"
            fullWidth
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                border: 'none',
                '& fieldset': { border: 'none' },
                '&:hover fieldset': { border: 'none' },
                '&.Mui-focused fieldset': { border: 'none' },
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="action" />
                </InputAdornment>
              ),
              endAdornment: loading && (
                <InputAdornment position="end">
                  <CircularProgress size={20} />
                </InputAdornment>
              ),
            }}
          />
        </Paper>
      </Box>

      <ProductFilter brands={brands} categories={categories} filters={filters} onFilterChange={handleFilterChange} />

      {/* Products Grid */}
      {products.length === 0 && !loading ? (
        <Paper sx={{ p: { xs: 4, md: 6 }, textAlign: 'center', borderRadius: 3 }}>
          <Typography variant="h5" color="text.secondary" gutterBottom sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
            No products found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}>
            Try adjusting your search terms or filters.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={{ xs: 2, sm: 3 }} className="responsive-grid" justifyContent="center">
          {products.map((product) => (
            <Grid item key={product.id}>
              <Card 
                sx={{ 
                  width: 300,
                  height: 450, 
                  display: 'flex', 
                  flexDirection: 'column',
                  borderRadius: 3,
                  overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-12px)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                  }
                }}
              >
                <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                  <Link to={`/products/${product.id}`} style={{ textDecoration: 'none' }}>
                    <CardMedia
                      component="img"
                      sx={{ 
                        height: 280,
                        objectFit: 'cover',
                        transition: 'transform 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.05)'
                        }
                      }}
                      image={product.image_urls?.[0] || 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=400'}
                      alt={product.name}
                    />
                  </Link>
                  {isDiscountActive(product) && (
                    <Chip
                      label={`${product.discount_percent}% OFF`}
                      color="error"
                      sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        fontWeight: 600,
                        fontSize: '0.75rem'
                      }}
                    />
                  )}
                </Box>
                
                <CardContent sx={{ flexGrow: 1, p: { xs: 2, md: 3 }, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Link to={`/products/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <Typography 
                      variant="h6" 
                      component="h2" 
                      gutterBottom
                      sx={{ 
                        fontWeight: 600,
                        fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                        lineHeight: 1.3,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {product.name}
                    </Typography>
                  </Link>
                  
                  <Box sx={{ mt: 2 }}>
                    {product.release_date && new Date(product.release_date) > new Date() ? (
                      <Countdown releaseDate={product.release_date} />
                    ) : product.discount_percent && product.final_price !== undefined ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                                                sx={{ textDecoration: 'line-through', fontSize: { xs: '0.75rem', sm: '0.85rem', md: '0.95rem' } }}
                                          >
                                            {product.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                                          </Typography>                        <Typography 
                          variant="h6" 
                          color="error.main" 
                          sx={{ fontWeight: 700, fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' } }}
                        >
                          {product.final_price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography 
                        variant="h6" 
                        color="primary.main" 
                        sx={{ fontWeight: 700, fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' } }}
                      >
                        {product.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                      </Typography>
                    )}
                  </Box>
                </CardContent>
                
                <CardActions sx={{ p: { xs: 2, md: 3 }, pt: 0, gap: 1, flexDirection: { xs: 'column', sm: 'row' } }}>
                  <Button 
                    variant="contained"
                    size="small"
                    color="primary"
                    onClick={() => handleAddToCart(product)} 
                    disabled={!isLoggedIn || (product.release_date && new Date(product.release_date) > new Date()) || product.quantity <= 0}
                    startIcon={<ShoppingCart />}
                    className="touch-target"
                    sx={{ 
                      flex: { xs: 'none', sm: 1 },
                      width: { xs: '100%', sm: 'auto' },
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600
                    }}
                  >
                    Add to Cart
                  </Button>
                  <Button 
                    variant="outlined"
                    size="small"
                    color="secondary"
                    onClick={() => handleTryOn(product.image_urls?.[0] || '')}
                    startIcon={<AutoAwesome />}
                    className="touch-target"
                    sx={{ 
                      flex: { xs: 'none', sm: 1 },
                      width: { xs: '100%', sm: 'auto' },
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600
                    }}
                  >
                    Try On
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

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
    </Container>
  );
};

export default ProductsPage;