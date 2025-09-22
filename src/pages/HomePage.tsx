import { Typography, Button, Container, Grid, Paper, Box, CircularProgress, Alert } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import RecommendationService from '../services/RecommendationService';
import ProductService from '../services/ProductService';
import { useAuth } from '../context/AuthContext';
import { Product } from '../models';

const HomePage = () => {
  const { isLoggedIn } = useAuth();
  const [personalizedRecommendations, setPersonalizedRecommendations] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [recLoading, setRecLoading] = useState<boolean>(true);
  const [recError, setRecError] = useState<string | null>(null);
  const [featuredLoading, setFeaturedLoading] = useState<boolean>(true);
  const [featuredError, setFeaturedError] = useState<string | null>(null);

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
        setRecError('Failed to fetch personalized recommendations.');
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
        // Assuming you have an endpoint to get featured products, or just get all and pick some
        const response = await ProductService.getAllProducts(); 
        setFeaturedProducts(response.data.slice(0, 3)); // Take first 3 as featured
      } catch (err) {
        setFeaturedError('Failed to fetch featured products.');
        console.error(err);
      } finally {
        setFeaturedLoading(false);
      }
    };
    fetchFeaturedProducts();
  }, []);

  return (
    <Container maxWidth="lg">
      {/* Hero Section */}
      <Paper 
        elevation={3}
        sx={{ 
          padding: 4, 
          marginTop: 4, 
          marginBottom: 4, 
          backgroundColor: 'primary.main', 
          color: 'white' 
        }}
      >
        <Typography variant="h2" component="h1" gutterBottom>
          Welcome to AI Virtual Try-On
        </Typography>
        <Typography variant="h5" component="p" gutterBottom>
          The future of fashion is here.
        </Typography>
        <Typography variant="body1" paragraph>
          Discover and try on clothes from the comfort of your home. Upload your photo and see how our collection looks on you.
        </Typography>
        <Button 
          variant="contained" 
          color="secondary" 
          size="large" 
          component={RouterLink} 
          to="/try-on"
        >
          Start Your Virtual Try-On
        </Button>
      </Paper>

      {/* Personalized Recommendations Section */}
      {isLoggedIn && (
        <Box sx={{ marginTop: 4 }}>
          <Typography variant="h4" component="h2" gutterBottom>
            Your Personalized Recommendations
          </Typography>
          {recLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
              <CircularProgress />
            </Box>
          ) : recError ? (
            <Alert severity="error">{recError}</Alert>
          ) : personalizedRecommendations.length === 0 ? (
            <Typography variant="body1">No personalized recommendations yet. Explore some products to get started!</Typography>
          ) : (
            <Grid container spacing={4}>
              {personalizedRecommendations.map((product) => (
                <Grid item key={product.id} xs={12} sm={6} md={4} lg={3}>
                  <Paper elevation={2} sx={{ padding: 2 }}>
                    <Box sx={{ height: 200, backgroundColor: 'grey.300', marginBottom: 2 }} />
                    <Typography variant="h6" component="h3">{product.name}</Typography>
                    {product.discount_percent && product.final_price !== undefined ? (
                      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                          ${product.price.toFixed(2)}
                        </Typography>
                        <Typography variant="h6" color="error">
                          ${product.final_price.toFixed(2)}
                        </Typography>
                        <Typography variant="body2" color="error">
                          ({product.discount_percent}% OFF)
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">${product.price.toFixed(2)}</Typography>
                    )}
                    <Button 
                      variant="outlined" 
                      sx={{ marginTop: 2 }} 
                      component={RouterLink} 
                      to={`/products/${product.id}`}
                    >
                      View Details
                    </Button>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {/* Featured Products Section */}
      <Typography variant="h4" component="h2" gutterBottom sx={{ marginTop: 4 }}>
        Featured Products
      </Typography>
      {featuredLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          <CircularProgress />
        </Box>
      ) : featuredError ? (
        <Alert severity="error">{featuredError}</Alert>
      ) : featuredProducts.length === 0 ? (
        <Typography variant="body1">No featured products available.</Typography>
      ) : (
        <Grid container spacing={4}>
          {featuredProducts.map((product) => (
            <Grid item key={product.id} xs={12} sm={6} md={4}>
              <Paper elevation={2} sx={{ padding: 2 }}>
                <Box sx={{ height: 200, backgroundColor: 'grey.300', marginBottom: 2 }} />
                <Typography variant="h6" component="h3">{product.name}</Typography>
                {product.discount_percent && product.final_price !== undefined ? (
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                      ${product.price.toFixed(2)}
                    </Typography>
                    <Typography variant="h6" color="error">
                      ${product.final_price.toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color="error">
                      ({product.discount_percent}% OFF)
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">${product.price.toFixed(2)}</Typography>
                )}
                <Button 
                  variant="outlined" 
                  sx={{ marginTop: 2 }} 
                  component={RouterLink} 
                  to={`/products/${product.id}`}
                >
                  View Details
                </Button>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default HomePage;
