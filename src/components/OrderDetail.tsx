import { Typography, Box, Paper, Grid, Divider } from '@mui/material';
import { Order } from '../models'; // Assuming Order model is defined in models.ts

// Helper function to validate URL
const isValidUrl = (url: string | undefined) => {
  try {
    if (!url) return false;
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

interface OrderDetailProps {
  order: Order;
}

const OrderDetail = ({ order }: OrderDetailProps) => {
  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Typography variant="h5" gutterBottom>
        Order Details
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Typography><strong>Order Code:</strong> {order.order_code}</Typography>
          <Typography><strong>Date:</strong> {new Date(order.created_at).toLocaleDateString()}</Typography>
          <Typography><strong>Customer:</strong> {order.customer_name}</Typography>
          <Typography><strong>Phone:</strong> {order.shipping_phone_number || order.customer_phone || 'N/A'}</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography><strong>Total:</strong> ${order.total_amount.toFixed(2)}</Typography>
          <Typography><strong>Status:</strong> {order.status}</Typography>
          <Typography><strong>Shipping Address:</strong></Typography>
          <Typography>{order.shipping_address}</Typography>
          <Typography>{order.shipping_city}, {order.shipping_postal_code}</Typography>
          <Typography>{order.shipping_country}</Typography>
        </Grid>
      </Grid>
      <Divider sx={{ my: 2 }} />
      <Typography variant="h6" gutterBottom>
        Items
      </Typography>
      {order.items && order.items.length > 0 ? (
        order.items.map((item) => (
          <Box key={item.product_id} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <img src={(item.image_urls && item.image_urls.length > 0 && isValidUrl(item.image_urls[0]) && item.image_urls[0]) || 'https://dummyimage.com/80x80/000/fff&text=No+Image'} alt={item.product_name} style={{ width: 80, height: 80, marginRight: 16, objectFit: 'cover', border: '1px solid #e0e0e0', borderRadius: 4 }} />
            <Box sx={{ flexGrow: 1 }}>
              <Typography>{item.product_name || `Product ID: ${item.product_id}`}</Typography>
              <Typography color="text.secondary">Quantity: {item.quantity}</Typography>
            </Box>
            <Typography>${(item.price * item.quantity).toFixed(2)}</Typography>
          </Box>
        ))
      ) : (
        <Typography>No items found in this order.</Typography>
      )}
    </Paper>
  );
};

export default OrderDetail;
