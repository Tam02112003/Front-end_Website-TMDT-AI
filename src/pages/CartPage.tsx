import { useEffect, useState } from 'react';
import { Typography, Box, CircularProgress, Alert, List, ListItem, ListItemText, ListItemAvatar, Avatar, IconButton, Button, Paper, Grid, Divider } from '@mui/material';
import { Add, Remove, Delete } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CartService from '../services/CartService';
import api from '../services/api'; // Import api for product details

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  image_url?: string;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
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
        response.data.cart.map(async (cartItem) => {
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
        fetchCart(); // Refetch cart to show updated state
      } catch (err) {
        console.error("Failed to update quantity", err);
        setError("Failed to update item quantity.");
      }
    }
  };

  const handleRemoveItem = async (productId: number) => {
    try {
      await CartService.removeFromCart(productId);
      fetchCart(); // Refetch cart
    } catch (err) {
      console.error("Failed to remove item", err);
      setError("Failed to remove item from cart.");
    }
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => total + (item.product_details.final_price !== undefined ? item.product_details.final_price : item.product_details.price) * item.quantity, 0).toFixed(2);
  };

  if (!isLoggedIn) {
    return (
      <Alert severity="warning">
        Please <Link to="/login">log in</Link> to view your cart.
      </Alert>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Your Shopping Cart
      </Typography>
      {items.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6">Your cart is empty.</Typography>
          <Button component={Link} to="/products" variant="contained" sx={{ mt: 2 }}>
            Continue Shopping
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <List>
              {items.map((item) => (
                <Paper key={item.product_id} sx={{ mb: 2 }}>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar variant="square" src={item.product_details.image_url || 'https://via.placeholder.com/150'} sx={{ width: 80, height: 80, mr: 2 }} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={item.product_details.name}
                      secondary={
                        item.product_details.final_price !== undefined && item.product_details.final_price < item.product_details.price ? (
                          <Box component="span">
                            <Typography component="span" variant="body2" sx={{ textDecoration: 'line-through', mr: 1 }}>
                              ${item.product_details.price.toFixed(2)}
                            </Typography>
                            <Typography component="span" variant="body1" color="error">
                              ${item.product_details.final_price.toFixed(2)}
                            </Typography>
                          </Box>
                        ) : (
                          `${item.product_details.price.toFixed(2)}`
                        )
                      }
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                      <IconButton size="small" onClick={() => handleUpdateQuantity(item.product_id, item.quantity - 1)}>
                        <Remove />
                      </IconButton>
                      <Typography sx={{ mx: 2 }}>{item.quantity}</Typography>
                      <IconButton size="small" onClick={() => handleUpdateQuantity(item.product_id, item.quantity + 1)}>
                        <Add />
                      </IconButton>
                    </Box>
                    <Typography variant="h6" sx={{ mr: 2 }}>
                      ${((item.product_details.final_price !== undefined ? item.product_details.final_price : item.product_details.price) * item.quantity).toFixed(2)}
                    </Typography>
                    <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveItem(item.product_id)}>
                      <Delete />
                    </IconButton>
                  </ListItem>
                </Paper>
              ))}
            </List>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body1">Subtotal</Typography>
                <Typography variant="h6">${calculateTotal()}</Typography>
              </Box>
              <Button component={Link} to="/checkout" variant="contained" fullWidth>
                Proceed to Checkout
              </Button>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default CartPage;