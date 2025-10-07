import { useEffect, useState } from 'react';
import { Typography, Box, CircularProgress, Alert, List, ListItem, ListItemText, ListItemAvatar, Avatar, IconButton, Button, Paper, Divider, Container, Card, CardContent } from '@mui/material';
import { Add, Remove, Delete, ShoppingCart, ArrowForward } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CartService from '../services/CartService';
import api from '../services/api';
import '../styles/responsive.css';

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  image_urls?: string[];
  is_active?: boolean;
  created_at: string;
  updated_at: string;
  final_price?: number;
}

interface CartItem {
  id: number;
  user_id: number;
  product_id: number;
  quantity: number;
  created_at: string;
}

interface CartItemWithProduct extends CartItem {
  product_details: Product;
}

const CartPage = () => {
  const { isLoggedIn } = useAuth();
  const [items, setItems] = useState<CartItemWithProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await CartService.getCart();
      console.log('Raw Cart API Response:', response.data.cart);

      const cartItemsWithProductDetails = await Promise.all(
        response.data.cart.map(async (cartItem: CartItem) => {
          const productResponse = await api.get<Product>(`/products/${cartItem.product_id}`);
          return { ...cartItem, product_details: productResponse.data };
        })
      );
      setItems(cartItemsWithProductDetails);
    } catch (err) {
      setError('Failed to fetch cart items or product details.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchCart();
    } else {
      setLoading(false);
    }
  }, [isLoggedIn]);

  const handleUpdateQuantity = async (productId: number, quantity: number) => {
    if (quantity <= 0) {
      await handleRemoveItem(productId);
    } else {
      try {
        await CartService.updateCart(productId, quantity);
        fetchCart();
      } catch (err) {
        console.error("Failed to update quantity", err);
        setError("Failed to update item quantity.");
      }
    }
  };

  const handleRemoveItem = async (productId: number) => {
    try {
      await CartService.removeFromCart(productId);
      fetchCart();
    } catch (err) {
      console.error("Failed to remove item", err);
      setError("Failed to remove item from cart.");
    }
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => total + (item.product_details.final_price !== undefined ? item.product_details.final_price : item.product_details.price) * item.quantity, 0);
  };

  if (!isLoggedIn) {
    return (
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 8 }, textAlign: 'center' }} className="responsive-container">
        <Paper sx={{ p: { xs: 4, md: 6 }, borderRadius: 3 }}>
          <ShoppingCart sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Please log in to view your cart
          </Typography>
          <Typography variant="body1" className="responsive-body" color="text.secondary" sx={{ mb: 3 }}>
            You need to be signed in to access your shopping cart.
          </Typography>
            <Button 
              variant="contained" 
              component={Link} 
              to="/login"
              size="large"
              color="primary"
              className="touch-target"
              sx={{ borderRadius: 2 }}
            >
            Sign In
          </Button>
        </Paper>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }} className="responsive-container">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress size={40} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }} className="responsive-container">
        <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }} className="responsive-container">
      <Typography 
        variant="h3" 
        className="responsive-heading-1"
        sx={{ 
          fontWeight: 700,
          fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
          background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 4
        }}
      >
        Your Shopping Cart
      </Typography>
      
      {items.length === 0 ? (
        <Paper sx={{ p: { xs: 4, md: 6 }, textAlign: 'center', borderRadius: 3 }}>
          <ShoppingCart sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Your cart is empty
          </Typography>
          <Typography variant="body1" className="responsive-body" color="text.secondary" sx={{ mb: 3 }}>
            Looks like you haven't added any items to your cart yet.
          </Typography>
          <Button 
            component={Link} 
            to="/products" 
            variant="contained" 
            size="large"
            color="primary"
            startIcon={<ShoppingCart />}
            className="touch-target"
            sx={{ borderRadius: 2 }}
          >
            Continue Shopping
          </Button>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 2, md: 4 } }}>
          <Box sx={{ width: { xs: '100%', lg: 'calc(66.66% - 16px)' } }}>
            <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
              <List sx={{ p: 0 }}>
                {items.map((item, index) => (
                  <Box key={item.product_id}>
                    <ListItem sx={{ p: { xs: 2, md: 3 }, flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' } }}>
                      <ListItemAvatar>
                        <Avatar 
                          variant="rounded" 
                          src={item.product_details.image_urls?.[0] || 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=150'} 
                          sx={{ width: { xs: 60, sm: 80 }, height: { xs: 60, sm: 80 }, mr: { xs: 0, sm: 2 }, mb: { xs: 2, sm: 0 } }} 
                        />
                      </ListItemAvatar>
                      <ListItemText
                        sx={{ flex: 1, mb: { xs: 2, sm: 0 } }}
                        primary={
                          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                            {item.product_details.name}
                          </Typography>
                        }
                        secondary={
                          item.product_details.final_price !== undefined && item.product_details.final_price < item.product_details.price ? (
                            <Box>
                              <Typography component="span" variant="body2" sx={{ textDecoration: 'line-through', mr: 1, color: 'text.secondary' }}>
                                {item.product_details.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                              </Typography>
                              <Typography component="span" variant="h6" color="error.main" sx={{ fontWeight: 600 }}>
                                {item.product_details.final_price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                              </Typography>
                            </Box>
                          ) : (
                            <Typography variant="h6" color="primary.main" sx={{ fontWeight: 600 }}>
                              {item.product_details.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                            </Typography>
                          )
                        }
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexDirection: { xs: 'column', sm: 'row' }, width: { xs: '100%', sm: 'auto' } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                          <IconButton 
                            size="small"
                            className="touch-target"
                            onClick={() => handleUpdateQuantity(item.product_id, item.quantity - 1)}
                            sx={{ borderRadius: 0 }}
                          >
                            <Remove />
                          </IconButton>
                          <Typography sx={{ px: { xs: 3, sm: 2 }, py: 1, minWidth: { xs: 50, sm: 40 }, textAlign: 'center', fontWeight: 600 }}>
                            {item.quantity}
                          </Typography>
                          <IconButton 
                            size="small"
                            className="touch-target"
                            onClick={() => handleUpdateQuantity(item.product_id, item.quantity + 1)}
                            sx={{ borderRadius: 0 }}
                          >
                            <Add />
                          </IconButton>
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, minWidth: { xs: 'auto', sm: 80 }, textAlign: { xs: 'center', sm: 'right' } }}>
                          {((item.product_details.final_price !== undefined ? item.product_details.final_price : item.product_details.price) * item.quantity).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                        </Typography>
                        <IconButton 
                          edge="end" 
                          aria-label="delete" 
                          onClick={() => handleRemoveItem(item.product_id)}
                          color="error"
                          className="touch-target"
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </ListItem>
                    {index < items.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>
            </Paper>
          </Box>
          
          <Box sx={{ width: { xs: '100%', lg: 'calc(33.33% - 16px)' } }}>
            <Card sx={{ borderRadius: 3, position: { xs: 'static', lg: 'sticky' }, top: 24 }}>
              <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                  Order Summary
                </Typography>
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                  <Typography variant="body1">
                    Subtotal ({items.reduce((total, item) => total + item.quantity, 0)} items)
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {calculateTotal().toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                  <Typography variant="body1">Shipping</Typography>
                  <Typography variant="body1" color="success.main" sx={{ fontWeight: 600 }}>
                    Free
                  </Typography>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>Total</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>{calculateTotal().toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</Typography>
                </Box>
                
                <Button 
                  component={Link} 
                  to="/checkout" 
                  variant="contained" 
                  fullWidth
                  size="large"
                  color="primary"
                  endIcon={<ArrowForward />}
                  className="touch-target"
                  sx={{ 
                    borderRadius: 2,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    textTransform: 'none'
                  }}
                >
                  Proceed to Checkout
                </Button>
              </CardContent>
            </Card>
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default CartPage;