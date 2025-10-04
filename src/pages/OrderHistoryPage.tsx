import { useEffect, useState } from 'react';
import { Typography, Box, CircularProgress, Alert, List, ListItem, ListItemText, Paper, Grid, Button, TextField, InputAdornment } from '@mui/material';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import OrderService from '../services/OrderService';
import OrderDetail from '../components/OrderDetail';
import { Order, OrderSummary } from '../models';

const OrderHistoryPage = () => {
  const { isLoggedIn } = useAuth();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchOrders = async (query: string = '') => {
      try {
        setLoading(true);
        const response = await OrderService.getOrders(query);
        setOrders(response.data.orders); // Correctly access the 'orders' array
      } catch (err) {
        setError('Failed to fetch orders.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (isLoggedIn) {
      const handler = setTimeout(() => {
        fetchOrders(searchQuery);
      }, 400);
      return () => clearTimeout(handler);
    } else {
      setLoading(false);
    }
  }, [isLoggedIn, searchQuery]);

  const handleViewDetails = async (orderCode: string) => {
    try {
      setLoading(true);
      const response = await OrderService.getOrderByCode(orderCode);
      setSelectedOrder(response.data);
    } catch (err) {
      setError('Failed to fetch order details.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <Alert severity="warning">
        Please <Link to="/login">log in</Link> to view your order history.
      </Alert>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (selectedOrder) {
    return (
      <Box>
        <Button onClick={() => setSelectedOrder(null)} sx={{ mb: 2 }}>Back to Orders</Button>
        <OrderDetail order={selectedOrder} />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Your Order History
      </Typography>
      <TextField
        label="Search by Order Code"
        variant="outlined"
        fullWidth
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ mb: 2 }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              {loading && <CircularProgress size={20} />}
            </InputAdornment>
          ),
        }}
      />
      {orders.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6">You have no orders.</Typography>
          <Button component={Link} to="/products" variant="contained" sx={{ mt: 2 }}>
            Start Shopping
          </Button>
        </Paper>
      ) : (
        <List>
          {orders.map((order) => (
            <Paper key={order.id} sx={{ mb: 2 }}>
              <ListItem>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={2}>
                    <ListItemText primary="Order Code" secondary={order.order_code} />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <ListItemText primary="Date" secondary={new Date(order.created_at).toLocaleDateString()} />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <ListItemText primary="Total" secondary={`${order.total_amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}`} />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <ListItemText primary="Status" secondary={order.status} />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <Button variant="contained" size="small" onClick={() => handleViewDetails(order.order_code)}>
                      View Details
                    </Button>
                  </Grid>
                </Grid>
              </ListItem>
            </Paper>
          ))}
        </List>
      )}
    </Box>
  );
};

export default OrderHistoryPage;
