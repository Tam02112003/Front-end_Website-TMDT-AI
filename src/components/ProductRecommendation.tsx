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
    return <Typography variant="body1">No recommendations found for this product.</Typography>;
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Recommended Products
      </Typography>
      <Grid container spacing={3}>
        {recommendations.map((product) => (
          <Grid item key={product.id} xs={12} sm={6} md={4} lg={3}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="img"
                sx={{ height: 140, objectFit: 'contain', pt: 2 }}
                image={product.image_url || 'https://via.placeholder.com/150'}
                alt={product.name}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h6" component="h2">
                  {product.name}
                </Typography>
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
                  <Typography variant="body2" color="text.secondary">
                    ${product.price.toFixed(2)}
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
