import { useEffect, useState } from 'react';
import { Typography, Box, CircularProgress, Alert, List, ListItem, ListItemText, ListItemAvatar, Avatar, IconButton, Button, Paper, Divider, Container, Card, CardContent } from '@mui/material';
import { Add, Remove, Delete, ShoppingCartOutlined, ArrowForward } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CartService from '../services/CartService';
import api from '../services/api';
import { colors } from '../theme';
import '../styles/responsive.css';

const formatVnd = (amount: number) => amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

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
        <Paper sx={{ p: { xs: 4, md: 6 } }}>
          <ShoppingCartOutlined sx={{ fontSize: 64, color: colors.muted, mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Đăng nhập để xem giỏ hàng
          </Typography>
          <Typography className="responsive-body" sx={{ color: colors.muted, mb: 3 }}>
            Bạn cần đăng nhập để truy cập giỏ hàng.
          </Typography>
          <Button variant="contained" component={Link} to="/login" size="large" color="primary" className="touch-target">
            Đăng nhập
          </Button>
        </Paper>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }} className="responsive-container">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress size={40} sx={{ color: colors.jade }} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }} className="responsive-container">
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }} className="responsive-container">
      <Typography variant="h3" className="responsive-heading-1" sx={{ fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.6rem' }, mb: 4 }}>
        Giỏ hàng
      </Typography>

      {items.length === 0 ? (
        <Paper sx={{ p: { xs: 4, md: 6 }, textAlign: 'center' }}>
          <ShoppingCartOutlined sx={{ fontSize: 64, color: colors.muted, mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Giỏ hàng trống
          </Typography>
          <Typography className="responsive-body" sx={{ color: colors.muted, mb: 3 }}>
            Bạn chưa thêm sản phẩm nào vào giỏ hàng.
          </Typography>
          <Button component={Link} to="/products" variant="contained" size="large" color="primary" startIcon={<ShoppingCartOutlined />} className="touch-target">
            Tiếp tục mua sắm
          </Button>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 2, md: 4 } }}>
          <Box sx={{ width: { xs: '100%', lg: 'calc(66.66% - 16px)' } }}>
            <Paper sx={{ overflow: 'hidden' }}>
              <List sx={{ p: 0 }}>
                {items.map((item, index) => (
                  <Box key={item.product_id}>
                    <ListItem sx={{ p: { xs: 2, md: 3 }, flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' } }}>
                      <ListItemAvatar>
                        <Avatar
                          variant="rounded"
                          src={item.product_details.image_urls?.[0] || 'https://upload.wikimedia.org/wikipedia/commons/d/df/Mechanical_keyboard_example.jpg'}
                          sx={{ width: { xs: 60, sm: 80 }, height: { xs: 60, sm: 80 }, mr: { xs: 0, sm: 2 }, mb: { xs: 2, sm: 0 } }}
                        />
                      </ListItemAvatar>
                      <ListItemText
                        sx={{ flex: 1, mb: { xs: 2, sm: 0 } }}
                        primary={
                          <Typography sx={{ fontWeight: 600, mb: 1 }}>
                            {item.product_details.name}
                          </Typography>
                        }
                        secondary={
                          item.product_details.final_price !== undefined && item.product_details.final_price < item.product_details.price ? (
                            <Box>
                              <Typography component="span" variant="body2" sx={{ textDecoration: 'line-through', mr: 1, color: colors.muted }}>
                                {formatVnd(item.product_details.price)}
                              </Typography>
                              <Typography component="span" sx={{ fontFamily: '"IBM Plex Mono", monospace', fontWeight: 700, color: colors.camel }}>
                                {formatVnd(item.product_details.final_price)}
                              </Typography>
                            </Box>
                          ) : (
                            <Typography sx={{ fontFamily: '"IBM Plex Mono", monospace', fontWeight: 700, color: colors.camel }}>
                              {formatVnd(item.product_details.price)}
                            </Typography>
                          )
                        }
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexDirection: { xs: 'column', sm: 'row' }, width: { xs: '100%', sm: 'auto' } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', border: `1px solid ${colors.border}` }}>
                          <IconButton size="small" className="touch-target" onClick={() => handleUpdateQuantity(item.product_id, item.quantity - 1)} sx={{ borderRadius: 0 }}>
                            <Remove fontSize="small" />
                          </IconButton>
                          <Typography sx={{ px: { xs: 3, sm: 2 }, py: 1, minWidth: { xs: 50, sm: 40 }, textAlign: 'center', fontWeight: 600 }}>
                            {item.quantity}
                          </Typography>
                          <IconButton size="small" className="touch-target" onClick={() => handleUpdateQuantity(item.product_id, item.quantity + 1)} sx={{ borderRadius: 0 }}>
                            <Add fontSize="small" />
                          </IconButton>
                        </Box>
                        <Typography sx={{ fontFamily: '"IBM Plex Mono", monospace', fontWeight: 700, minWidth: { xs: 'auto', sm: 90 }, textAlign: { xs: 'center', sm: 'right' } }}>
                          {formatVnd((item.product_details.final_price ?? item.product_details.price) * item.quantity)}
                        </Typography>
                        <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveItem(item.product_id)} sx={{ color: colors.danger }} className="touch-target">
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    </ListItem>
                    {index < items.length - 1 && <Divider sx={{ borderColor: colors.border }} />}
                  </Box>
                ))}
              </List>
            </Paper>
          </Box>

          <Box sx={{ width: { xs: '100%', lg: 'calc(33.33% - 16px)' } }}>
            <Card sx={{ position: { xs: 'static', lg: 'sticky' }, top: 24 }}>
              <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                <Typography variant="h6" gutterBottom>
                  Tóm tắt đơn hàng
                </Typography>
                <Divider sx={{ my: 2, borderColor: colors.border }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                  <Typography>Tạm tính ({items.reduce((total, item) => total + item.quantity, 0)} sản phẩm)</Typography>
                  <Typography sx={{ fontWeight: 600 }}>{formatVnd(calculateTotal())}</Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                  <Typography>Vận chuyển</Typography>
                  <Typography sx={{ color: colors.jade, fontWeight: 600 }}>Miễn phí</Typography>
                </Box>

                <Divider sx={{ my: 2, borderColor: colors.border }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 1 }}>
                  <Typography variant="h6">Tổng cộng</Typography>
                  <Typography variant="h6" sx={{ fontFamily: '"IBM Plex Mono", monospace', color: colors.camel }}>{formatVnd(calculateTotal())}</Typography>
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
                  sx={{ py: 1.5 }}
                >
                  Tiến hành thanh toán
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