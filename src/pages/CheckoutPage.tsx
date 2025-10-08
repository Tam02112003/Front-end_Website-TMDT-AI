import React, { useEffect, useState } from 'react';
import { Typography, Box, CircularProgress, Alert, Button, Paper, TextField, Divider } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import CartService from '../services/CartService';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import OrderService from '../services/OrderService';
import { FormControl, FormLabel, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import { Product } from '../models';

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

const CheckoutPage = () => {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [shippingAddress, setShippingAddress] = useState({
    address: '',
    city: '',
    postalCode: '',
    country: '',
    phoneNumber: '',
  });
  const [paymentMethod, setPaymentMethod] = useState<string>('cod');

  // State for Sepay QR Code Flow
  const [sepayQrUrl, setSepayQrUrl] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState<boolean>(false);
  const [pollingOrderId, setPollingOrderId] = useState<string | null>(null);

  // Effect to fetch cart items
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    const fetchCart = async () => {
      try {
        setLoading(true);
        const response = await CartService.getCart();
        const rawCartItems: CartItem[] = response.data.cart;
        const cartItemsWithProductDetails = await Promise.all(
          rawCartItems.map(async (cartItem) => {
            const productResponse = await api.get<Product>(`/products/${cartItem.product_id}`);
            return { ...cartItem, product_details: productResponse.data };
          })
        );
        setCartItems(cartItemsWithProductDetails);
      } catch (err) {
        setError('Failed to fetch cart items.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [isLoggedIn, navigate]);

  // Effect for polling order status
  useEffect(() => {
    if (isPolling && pollingOrderId) {
      const interval = setInterval(async () => {
        try {
          const response = await api.get(`/orders/${pollingOrderId}/status`);
          if (response.data.status === 'paid') {
            clearInterval(interval);
            setIsPolling(false);
            await CartService.clearCart();
            navigate(`/order-result?success=true&orderId=${pollingOrderId}`);
          }
        } catch (err) {
          console.error('Polling for order status or clearing cart failed:', err);
        }
      }, 3000); // Poll every 3 seconds

      return () => clearInterval(interval); // Cleanup on component unmount
    }
  }, [isPolling, pollingOrderId, navigate]);

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.product_details.final_price ?? item.product_details.price) * item.quantity, 0);
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handlePaymentMethodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPaymentMethod(e.target.value);
  };

  const handlePlaceOrder = async () => {
    try {
      setLoading(true);
      const orderItems = cartItems.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.product_details.final_price ?? item.product_details.price,
      }));

      const orderData = {
        items: orderItems,
        shipping_address: {
          address: shippingAddress.address,
          city: shippingAddress.city,
          postal_code: shippingAddress.postalCode,
          country: shippingAddress.country,
          phone_number: shippingAddress.phoneNumber,
        },
        payment_method: paymentMethod,
      };

      const response = await OrderService.placeOrder(orderData);
      const orderId = response.data.order_code;

      if (paymentMethod === 'sepay') {
        const configResponse = await api.get('/payment/sepay/config');
        const { bankName, accountNumber } = configResponse.data;
        const totalAmount = Math.round(calculateTotal());
        const description = orderId;

        const qrUrl = `https://qr.sepay.vn/img?acc=${accountNumber}&bank=${bankName}&amount=${totalAmount}&des=${description}`;
        
        setSepayQrUrl(qrUrl);
        setPollingOrderId(orderId);
        setIsPolling(true);

      } else { // COD
        try {
          await CartService.clearCart();
          navigate(`/order-result?success=true&orderId=${orderId}`);
        } catch (clearErr) {
          console.error('Failed to clear cart for COD order:', clearErr);
          // Still navigate, but log the error
          navigate(`/order-result?success=true&orderId=${orderId}&cartError=true`);
        }
      }
    } catch (err) {
      setError('Failed to place order.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !sepayQrUrl) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  // Render QR Code view if sepayQrUrl is set
  if (sepayQrUrl) {
    return (
      <Paper sx={{ p: 4, maxWidth: 500, margin: 'auto', textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>Scan QR Code to Pay</Typography>
        <img src={sepayQrUrl} alt="Sepay QR Code" style={{ maxWidth: '100%', height: 'auto' }} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Total Amount: {calculateTotal().toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
          Please scan the QR code with your banking app to complete the payment.
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2 }}>
          <CircularProgress size={20} sx={{ mr: 1 }} />
          <Typography variant="body2">Waiting for payment confirmation...</Typography>
        </Box>
      </Paper>
    );
  }

  if (cartItems.length === 0) {
    return (
      <Alert severity="info">
        Your cart is empty. <Button onClick={() => navigate('/products')}>Continue Shopping</Button>
      </Alert>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
      <Box sx={{ width: { xs: '100%', md: 'calc(58.33% - 12px)' } }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>Shipping Address</Typography>
          <TextField fullWidth label="Address" name="address" value={shippingAddress.address} onChange={handleAddressChange} margin="normal" required />
          <TextField fullWidth label="City" name="city" value={shippingAddress.city} onChange={handleAddressChange} margin="normal" required />
          <TextField fullWidth label="Postal Code" name="postalCode" value={shippingAddress.postalCode} onChange={handleAddressChange} margin="normal" required />
          <TextField fullWidth label="Country" name="country" value={shippingAddress.country} onChange={handleAddressChange} margin="normal" required />
          <TextField fullWidth label="Phone Number" name="phoneNumber" value={shippingAddress.phoneNumber} onChange={handleAddressChange} margin="normal" required />
        </Paper>
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h5" gutterBottom>Payment Method</Typography>
          <FormControl component="fieldset" margin="normal">
            <FormLabel component="legend">Select a payment method</FormLabel>
            <RadioGroup name="paymentMethod" value={paymentMethod} onChange={handlePaymentMethodChange}>
              <FormControlLabel value="cod" control={<Radio />} label="Cash on Delivery" />
              <FormControlLabel value="sepay" control={<Radio />} label="Sepay" />
            </RadioGroup>
          </FormControl>
        </Paper>
      </Box>
      <Box sx={{ width: { xs: '100%', md: 'calc(41.66% - 12px)' } }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>Order Summary</Typography>
          <Divider sx={{ my: 2 }} />
          {cartItems.map((item) => (
            <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">{item.product_details.name} (x{item.quantity})</Typography>
              <Typography variant="body2">{(item.product_details.final_price ?? item.product_details.price).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</Typography>
            </Box>
          ))}
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Typography variant="h6">Total</Typography>
            <Typography variant="h6">{calculateTotal().toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 3 }}
            onClick={handlePlaceOrder}
            disabled={!shippingAddress.address || !shippingAddress.city || !shippingAddress.postalCode || !shippingAddress.country}
          >
            Place Order
          </Button>
        </Paper>
      </Box>
    </Box>
  );
};

export default CheckoutPage;