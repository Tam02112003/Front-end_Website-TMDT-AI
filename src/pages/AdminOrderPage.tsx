import { useEffect, useState } from 'react';
import { Typography, Box, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Select, MenuItem, TextField, InputAdornment } from '@mui/material';
import OrderService from '../services/OrderService';
import OrderDetail from '../components/OrderDetail';

// This interface represents a single order in the list
interface OrderSummary {
  id: number;
  user_id: number;
  total_amount: number; // Changed from total_price
  status: string;
  created_at: string;
  order_code: string;
}

// This interface represents the full order with items
interface Order extends OrderSummary {
  items: any[]; // Changed from order_items and simplified for now
}

const AdminOrderPage = () => {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchOrders = async (query: string = '') => {
    try {
      setLoading(true);
      const response = await OrderService.getAllOrders(query);
      setOrders(response.data.orders);
    } catch (err) {
      setError('Failed to fetch orders.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchOrders(searchQuery);
    }, 400); // Debounce search input

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]); // Re-run effect when searchQuery changes

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

  const handleStatusChange = async (orderCode: string, status: string) => {
    try {
      await OrderService.updateOrderStatus(orderCode, status);
      fetchOrders(searchQuery); // Refetch orders to show updated status
    } catch (err) {
      setError('Failed to update order status.');
      console.error(err);
    }
  };

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
        Manage Orders
      </Typography>
      <TextField
        label="Search Orders"
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
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Order Code</TableCell>
              <TableCell>User ID</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.order_code}</TableCell>
                <TableCell>{order.user_id}</TableCell>
                <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                <TableCell>${order.total_amount.toFixed(2)}</TableCell>
                <TableCell>
                  <Select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.order_code, e.target.value)}
                    size="small"
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="processing">Processing</MenuItem>
                    <MenuItem value="paid">Paid</MenuItem>
                    <MenuItem value="delivered">Delivered</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                  </Select>
                </TableCell>
                <TableCell>
                  <Button variant="contained" size="small" onClick={() => handleViewDetails(order.order_code)}>
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AdminOrderPage;
