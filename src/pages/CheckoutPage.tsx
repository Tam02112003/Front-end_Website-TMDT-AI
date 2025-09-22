import React, { useEffect, useState } from 'react';
import { Typography, Box, CircularProgress, Alert, Button, Paper, Grid, TextField, Divider } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import CartService from '../services/CartService';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import OrderService from '../services/OrderService'; // Import OrderService
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
  const [paymentMethod, setPaymentMethod] = useState<string>('cash_on_delivery'); // Default payment method

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login'); // Redirect to login if not authenticated
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
        setError('Failed to fetch cart items or product details for checkout.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [isLoggedIn, navigate]);

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.product_details.final_price !== undefined ? item.product_details.final_price : item.product_details.price) * item.quantity, 0).toFixed(2);
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
        price: item.product_details.final_price !== undefined ? item.product_details.final_price : item.product_details.price, // Include final price here
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
      console.log('Order placed successfully:', response.data);
      const orderCode = response.data.order_code;

      if (paymentMethod === 'vnpay') {
        // For VNPay, initiate payment and redirect
        const vnpayRequest = {
          order_id: orderCode,
          amount: Math.round(parseFloat(calculateTotal()) * 100), // VNPay amount is in cents/smallest unit
          order_desc: `Payment for order ${orderCode}`,
          language: 'vn',
        };
        // The backend /payment/vnpay/create endpoint returns a RedirectResponse (303).
        // Axios will follow this redirect, so the browser will be redirected to VNPay.
        // We don't need to explicitly navigate here.
        const vnpayRedirectResponse = await api.post('/payment/vnpay/create', vnpayRequest);
        // Manually redirect the browser to the URL provided in the response data
        if (vnpayRedirectResponse.data && vnpayRedirectResponse.data.payment_url) {
          window.location.href = vnpayRedirectResponse.data.payment_url;
        } else {
          throw new Error("VNPay redirect URL not found in response data.");
        }
      } else {
        // For COD, navigate to the new result page
        await CartService.clearCart(); // Clear the cart after successful order
        navigate(`/order-result?success=true&orderId=${orderCode}`); // Navigate to the result page
        setError(null); // Clear any previous errors
      }
    } catch (err) {
      setError('Failed to place order.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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

  if (cartItems.length === 0) {
    return (
      <Alert severity="info">
        Your cart is empty. Please add items before checking out.
        <Button onClick={() => navigate('/products')} sx={{ ml: 2 }}>
          Continue Shopping
        </Button>
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Checkout
      </Typography>
      <Grid container spacing={4}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Shipping Address
            </Typography>
            <TextField
              fullWidth
              label="Address"
              name="address"
              value={shippingAddress.address}
              onChange={handleAddressChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="City"
              name="city"
              value={shippingAddress.city}
              onChange={handleAddressChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Postal Code"
              name="postalCode"
              value={shippingAddress.postalCode}
              onChange={handleAddressChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Country"
              name="country"
              value={shippingAddress.country}
              onChange={handleAddressChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Phone Number"
              name="phoneNumber"
              value={shippingAddress.phoneNumber}
              onChange={handleAddressChange}
              margin="normal"
              required
            />
          </Paper>
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h5" gutterBottom>
              Payment Method
            </Typography>
            <FormControl component="fieldset" margin="normal">
              <FormLabel component="legend">Select a payment method</FormLabel>
              <RadioGroup
                aria-label="payment-method"
                name="paymentMethod"
                value={paymentMethod}
                onChange={handlePaymentMethodChange}
              >
                <FormControlLabel value="cod" control={<Radio />} label="Cash on Delivery" />
                <FormControlLabel value="vnpay" control={<Radio />} label="VNPay" />
              </RadioGroup>
            </FormControl>
          </Paper>
        </Grid>
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Order Summary
            </Typography>
            <Divider sx={{ my: 2 }} />
            {cartItems.map((item) => (
              <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">{item.product_details.name} (x{item.quantity})</Typography>
                <Typography variant="body2">${((item.product_details.final_price !== undefined ? item.product_details.final_price : item.product_details.price) * item.quantity).toFixed(2)}</Typography>
              </Box>
            ))}
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Typography variant="h6">Total</Typography>
              <Typography variant="h6">${calculateTotal()}</Typography>
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
        </Grid>
      </Grid>
    </Box>
  );
};

export default CheckoutPage;
