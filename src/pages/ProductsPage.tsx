import { useEffect, useState } from 'react';
import { Typography, Grid, Card, CardMedia, CardContent, CircularProgress, Alert, Box, Button, CardActions, TextField, InputAdornment, Snackbar, Chip, Container, Paper } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { Product } from '../models';
import ProductService from '../services/ProductService';
import CartService from '../services/CartService';
import { useAuth } from '../context/AuthContext';
import { Search, ShoppingCart, Visibility, AutoAwesome, FilterList } from '@mui/icons-material';

const ProductsPage = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [feedback, setFeedback] = useState<{ open: boolean, message: string, severity: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await ProductService.getAllProducts(searchQuery);
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
  }, [searchQuery]);

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

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom
          sx={{ 
            fontWeight: 700,
            background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2
          }}
        >
          Our Products
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          Discover our amazing collection of fashion items
        </Typography>
        
        {/* Search Bar */}
        <Paper 
          sx={{ 
            p: 1,
            display: 'flex',
            alignItems: 'center',
            maxWidth: 600,
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

      {/* Products Grid */}
      {products.length === 0 && !loading ? (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
          <Typography variant="h5" color="text.secondary" gutterBottom>
            No products found
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Try adjusting your search terms or browse all products.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {products.map((product) => (
            <Grid item key={product.id} xs={12} sm={6} md={4} lg={3}>
              <Card 
                sx={{ 
                  height: '100%', 
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
                      image={product.image_url || 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=400'}
                      alt={product.name}
                    />
                  </Link>
                  {product.discount_percent && (
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
                
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Link to={`/products/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <Typography 
                      variant="h6" 
                      component="h2" 
                      gutterBottom
                      sx={{ 
                        fontWeight: 600,
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
                    {product.discount_percent && product.final_price !== undefined ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          sx={{ textDecoration: 'line-through' }}
                        >
                          ${product.price.toFixed(2)}
                        </Typography>
                        <Typography 
                          variant="h6" 
                          color="error.main" 
                          sx={{ fontWeight: 700 }}
                        >
                          ${product.final_price.toFixed(2)}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography 
                        variant="h6" 
                        color="primary.main" 
                        sx={{ fontWeight: 700 }}
                      >
                        ${product.price.toFixed(2)}
                      </Typography>
                    )}
                  </Box>
                </CardContent>
                
                <CardActions sx={{ p: 3, pt: 0, gap: 1 }}>
                  <Button 
                    variant="contained"
                    size="small"
                    onClick={() => handleAddToCart(product)} 
                    disabled={!isLoggedIn}
                    startIcon={<ShoppingCart />}
                    sx={{ 
                      flex: 1,
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
                    onClick={() => handleTryOn(product.image_url || '')}
                    startIcon={<AutoAwesome />}
                    sx={{ 
                      flex: 1,
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