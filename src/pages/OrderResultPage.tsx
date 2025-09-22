import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Paper } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const OrderResultPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isSuccess = searchParams.get('vnp_ResponseCode') === '00' || searchParams.get('success') === 'true';
  const orderId = searchParams.get('vnp_TxnRef') || searchParams.get('orderId');
  const message = searchParams.get('message');

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '80vh',
        p: 3,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          textAlign: 'center',
          maxWidth: '500px',
          width: '100%',
        }}
      >
        {isSuccess ? (
          <CheckCircleOutlineIcon color="success" sx={{ fontSize: 80, mb: 2 }} />
        ) : (
          <ErrorOutlineIcon color="error" sx={{ fontSize: 80, mb: 2 }} />
        )}
        <Typography variant="h4" gutterBottom>
          {isSuccess ? 'Order Placed Successfully!' : 'Order Failed'}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {isSuccess
            ? `Thank you for your purchase. Your order ID is ${orderId}. It will be processed shortly.`
            : `There was an issue with your order. ${message || 'Please try again.'}`}
        </Typography>
        <Button variant="contained" onClick={() => navigate('/products')}>
          Continue Shopping
        </Button>
        {!isSuccess && (
          <Button variant="outlined" onClick={() => navigate('/checkout')} sx={{ ml: 2 }}>
            Back to Checkout
          </Button>
        )}
      </Paper>
    </Box>
  );
};

export default OrderResultPage;
