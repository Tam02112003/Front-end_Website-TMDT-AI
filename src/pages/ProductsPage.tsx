import { useEffect, useState } from 'react';
import { Typography, Grid, Card, CardMedia, CardContent, CircularProgress, Alert, Box, Button, CardActions, TextField, InputAdornment, Snackbar } from '@mui/material';
import api from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { Product } from '../models';
import ProductService from '../services/ProductService';
import CartService from '../services/CartService'; // Import CartService
import { useAuth } from '../context/AuthContext'; // Import useAuth

const ProductsPage = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth(); // Get isLoggedIn from useAuth
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [feedback, setFeedback] = useState<{ open: boolean, message: string, severity: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await ProductService.getAllProducts(searchQuery); // Use ProductService and pass search query
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
    }, 400); // Debounce search input

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]); // Re-run effect when searchQuery changes

  const handleAddToCart = async (product: Product) => {
    if (!isLoggedIn) {
      setFeedback({ open: true, message: 'Please log in to add items to your cart.', severity: 'error' });
      return;
    }
    try {
      await CartService.addToCart(product.id, 1); // Add 1 quantity by default
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
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Our Products
      </Typography>
      <TextField
        label="Search Products"
        variant="outlined"
        fullWidth
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              {loading && <CircularProgress size={20} />}
            </InputAdornment>
          ),
        }}
      />
      <Grid container spacing={4}>
        {products.map((product) => (
          <Grid item key={product.id} xs={12} sm={6} md={4}>
            <Card sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              '&:hover': {
                boxShadow: 6,
              },
            }}>
              <Link to={`/products/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <CardMedia
                  component="img"
                  sx={{ height: 250 }}
                  image={product.image_url || 'https://via.placeholder.com/250'} // Placeholder image
                  alt={product.name}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="h2">
                    {product.name}
                  </Typography>
                  {product.discount_percent && product.final_price !== undefined ? (
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                      <Typography variant="h6" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                        ${product.price.toFixed(2)}
                      </Typography>
                      <Typography variant="h5" color="error">
                        ${product.final_price.toFixed(2)}
                      </Typography>
                      <Typography variant="body2" color="error">
                        ({product.discount_percent}% OFF)
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="h6" component="p" sx={{ mt: 2 }}>
                      ${product.price.toFixed(2)}
                    </Typography>
                  )}
                </CardContent>
              </Link>
              <CardActions>
                <Button size="small" onClick={() => handleAddToCart(product)} disabled={!isLoggedIn}>Add to Cart</Button>
                <Button size="small" onClick={() => handleTryOn(product.image_url || '')}>AI Try On</Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

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
    </div>
  );
};

export default ProductsPage;