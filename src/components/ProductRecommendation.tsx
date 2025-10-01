import { useEffect, useState } from 'react';
import { Typography, Box, CircularProgress, Alert, Grid, Card, CardMedia, CardContent, CardActions, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import ProductService from '../services/ProductService';
import { Product } from '../models';

interface ProductRecommendationProps {
  productId: number;
}

const ProductRecommendation = ({ productId }: ProductRecommendationProps) => {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const response = await ProductService.getProductRecommendations(productId);
        setRecommendations(response.data);
      } catch (err) {
        setError('Failed to fetch recommendations.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchRecommendations();
    }
  }, [productId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (recommendations.length === 0) {
    return <Typography variant="body1" sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}>No recommendations found for this product.</Typography>;
  }

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

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
        Recommended Products
      </Typography>
      <Grid container spacing={3}>
        {recommendations.map((product) => (
          <Grid item key={product.id} xs={12} sm={6} md={4} lg={3}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="img"
                sx={{ height: 140, objectFit: 'contain', pt: 2 }}
                image={product.image_urls?.[0] || 'https://via.placeholder.com/150'}
                alt={product.name}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h6" component="h2" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' } }}>
                  {product.name}
                </Typography>
                {isDiscountActive(product) ? (
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through', fontSize: { xs: '0.75rem', sm: '0.85rem', md: '0.95rem' } }}>
                      {product.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                    </Typography>
                    <Typography variant="h6" color="error" sx={{ fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' } }}>
                      {product.final_price?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                    </Typography>
                    <Typography variant="body2" color="error">
                      ({product.discount_percent}% OFF)
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.85rem', md: '0.95rem' } }}>
                    {product.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                  </Typography>
                )}
              </CardContent>
              <CardActions>
                <Button size="small" component={Link} to={`/products/${product.id}`}>
                  View Details
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ProductRecommendation;
