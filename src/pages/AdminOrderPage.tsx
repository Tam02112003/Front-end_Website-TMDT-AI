import { useEffect, useState } from 'react';
import { Typography, Box, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Select, MenuItem, TextField, InputAdornment } from '@mui/material';
import { Order, OrderSummary } from '../models';
import OrderService from '../services/OrderService';
import OrderDetail from '../components/OrderDetail';



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
      setError('Không tải được danh sách đơn hàng.');
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
      setError('Không tải được chi tiết đơn hàng.');
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
      setError('Cập nhật trạng thái đơn hàng thất bại.');
      console.error(err);
    }
  };

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (selectedOrder) {
    return (
      <Box>
        <Button variant="text" color="primary" onClick={() => setSelectedOrder(null)} sx={{ mb: 2 }}>← Quay lại danh sách đơn hàng</Button>
        <OrderDetail order={selectedOrder} />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Quản lý đơn hàng
      </Typography>
      <TextField
        label="Tìm đơn hàng"
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
              <TableCell>Mã đơn</TableCell>
              <TableCell>User ID</TableCell>
              <TableCell>Ngày</TableCell>
              <TableCell>Tổng tiền</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.order_code}</TableCell>
                <TableCell>{order.user_id}</TableCell>
                <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                <TableCell>{order.total_amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</TableCell>
                <TableCell>
                  <Select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.order_code, e.target.value)}
                    size="small"
                  >
                    <MenuItem value="pending">Chờ xử lý</MenuItem>
                    <MenuItem value="processing">Đang xử lý</MenuItem>
                    <MenuItem value="paid">Đã thanh toán</MenuItem>
                    <MenuItem value="delivered">Đã giao</MenuItem>
                    <MenuItem value="cancelled">Đã hủy</MenuItem>
                  </Select>
                </TableCell>
                <TableCell>
                  <Button variant="contained" color="primary" size="small" onClick={() => handleViewDetails(order.order_code)}>
                    Chi tiết
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
