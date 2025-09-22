import { Typography, Button, Container, Grid, Paper, Box, CircularProgress, Alert, Card, CardContent, CardMedia, CardActions, Chip } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import RecommendationService from '../services/RecommendationService';
import ProductService from '../services/ProductService';
import { useAuth } from '../context/AuthContext';
import { Product } from '../models';
import { TrendingUp, ShoppingBag, AutoAwesome, Visibility } from '@mui/icons-material';

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
        const response = await ProductService.getAllProducts(); 
        setFeaturedProducts(response.data.slice(0, 6));
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
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 4,
          color: 'white',
          p: { xs: 4, md: 8 },
          mb: 6,
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1") center/cover',
            opacity: 0.1,
            zIndex: 0,
          }
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography 
            variant="h2" 
            component="h1" 
            gutterBottom
            sx={{ 
              fontWeight: 700,
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              mb: 2
            }}
          >
            AI Virtual Try-On
          </Typography>
          <Typography 
            variant="h5" 
            component="p" 
            gutterBottom
            sx={{ 
              fontWeight: 300,
              opacity: 0.9,
              mb: 3
            }}
          >
            Experience the future of fashion shopping
          </Typography>
          <Typography 
            variant="body1" 
            paragraph
            sx={{ 
              fontSize: '1.1rem',
              maxWidth: 600,
              mx: 'auto',
              mb: 4,
              opacity: 0.8
            }}
          >
            Discover and try on clothes from the comfort of your home. Upload your photo and see how our collection looks on you with cutting-edge AI technology.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button 
              variant="contained" 
              size="large"
              component={RouterLink} 
              to="/try-on"
              startIcon={<AutoAwesome />}
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: 'white',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.3)',
                }
              }}
            >
              Start Virtual Try-On
            </Button>
            <Button 
              variant="outlined" 
              size="large"
              component={RouterLink} 
              to="/products"
              startIcon={<ShoppingBag />}
              sx={{
                borderColor: 'rgba(255,255,255,0.5)',
                color: 'white',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)',
                }
              }}
            >
              Browse Products
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Personalized Recommendations Section */}
      {isLoggedIn && (
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <TrendingUp sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="h4" component="h2" sx={{ fontWeight: 600 }}>
              Your Personalized Recommendations
            </Typography>
          </Box>
          {recLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
              <CircularProgress size={40} />
            </Box>
          ) : recError ? (
            <Alert severity="error" sx={{ borderRadius: 2 }}>{recError}</Alert>
          ) : personalizedRecommendations.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No personalized recommendations yet
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                Explore some products to get started with AI-powered recommendations!
              </Typography>
              <Button variant="contained" component={RouterLink} to="/products">
                Explore Products
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {personalizedRecommendations.map((product) => (
                <Grid item key={product.id} xs={12} sm={6} md={4} lg={3}>
                  <Card 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      transition: 'all 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                      }
                    }}
                  >
                    <CardMedia
                      component="img"
                      sx={{ height: 200, objectFit: 'cover' }}
                      image={product.image_url || 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=400'}
                      alt={product.name}
                    />
                    <CardContent sx={{ flexGrow: 1, p: 2 }}>
                      <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                        {product.name}
                      </Typography>
                      {product.discount_percent && product.final_price !== undefined ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                            ${product.price.toFixed(2)}
                          </Typography>
                          <Typography variant="h6" color="error.main" sx={{ fontWeight: 600 }}>
                            ${product.final_price.toFixed(2)}
                          </Typography>
                          <Chip 
                            label={`${product.discount_percent}% OFF`} 
                            color="error" 
                            size="small"
                            sx={{ fontSize: '0.75rem' }}
                          />
                        </Box>
                      ) : (
                        <Typography variant="h6" color="primary.main" sx={{ fontWeight: 600, mb: 1 }}>
                          ${product.price.toFixed(2)}
                        </Typography>
                      )}
                    </CardContent>
                    <CardActions sx={{ p: 2, pt: 0 }}>
                      <Button 
                        variant="contained" 
                        fullWidth
                        component={RouterLink} 
                        to={`/products/${product.id}`}
                        startIcon={<Visibility />}
                      >
                        View Details
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {/* Featured Products Section */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <ShoppingBag sx={{ mr: 2, color: 'primary.main' }} />
          <Typography variant="h4" component="h2" sx={{ fontWeight: 600 }}>
            Featured Products
          </Typography>
        </Box>
        {featuredLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
            <CircularProgress size={40} />
          </Box>
        ) : featuredError ? (
          <Alert severity="error" sx={{ borderRadius: 2 }}>{featuredError}</Alert>
        ) : featuredProducts.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
            <Typography variant="h6" color="text.secondary">
              No featured products available at the moment.
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {featuredProducts.map((product) => (
              <Grid item key={product.id} xs={12} sm={6} md={4}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                    }
                  }}
                >
                  <CardMedia
                    component="img"
                    sx={{ height: 250, objectFit: 'cover' }}
                    image={product.image_url || 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=400'}
                    alt={product.name}
                  />
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                      {product.name}
                    </Typography>
                    {product.discount_percent && product.final_price !== undefined ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                          ${product.price.toFixed(2)}
                        </Typography>
                        <Typography variant="h6" color="error.main" sx={{ fontWeight: 600 }}>
                          ${product.final_price.toFixed(2)}
                        </Typography>
                        <Chip 
                          label={`${product.discount_percent}% OFF`} 
                          color="error" 
                          size="small"
                          sx={{ fontSize: '0.75rem' }}
                        />
                      </Box>
                    ) : (
                      <Typography variant="h6" color="primary.main" sx={{ fontWeight: 600, mb: 2 }}>
                        ${product.price.toFixed(2)}
                      </Typography>
                    )}
                  </CardContent>
                  <CardActions sx={{ p: 3, pt: 0 }}>
                    <Button 
                      variant="contained" 
                      fullWidth
                      component={RouterLink} 
                      to={`/products/${product.id}`}
                      startIcon={<Visibility />}
                    >
                      View Details
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default HomePage;