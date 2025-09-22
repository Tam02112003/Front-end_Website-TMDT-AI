import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Box, Typography, Button, CircularProgress, Alert, Grid, Card, CardMedia, CardActionArea } from '@mui/material';
import { performTryOn } from '../services/TryOnService';
import api from '../services/api'; // Import the API client
import ProductService from '../services/ProductService'; // Import ProductService
import { Product } from '../models'; // Assuming Product model is defined here

const TryOnPage = () => {
  const location = useLocation();
  const { productImageUrl } = location.state || {};

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductImage, setSelectedProductImage] = useState<string | null>(productImageUrl || null);
  const [selectedUserImage, setSelectedUserImage] = useState<string | null>(null);
  const [userAvatarFile, setUserAvatarFile] = useState<File | null>(null);
  const [tryOnResult, setTryOnResult] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If productImageUrl is received, no need to fetch all products
    if (productImageUrl) {
      setLoading(false);
      return;
    }

    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await ProductService.getAllProducts();
        setProducts(response.data);
      } catch (err) {
        setError('Failed to fetch products.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [productImageUrl]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedUserImage(reader.result as string); // Store Base64 string
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTryOn = async () => {
    if (!selectedProductImage || !selectedUserImage) {
      setError('Please select both a product and a user image.');
      return;
    }

    setLoading(true);
    setError(null);
    setTryOnResult(null);

    try {
      const result = await performTryOn({
        product_image_url: selectedProductImage,
        user_image_base64: selectedUserImage,
      });

      if (result.result_image_url) {
        setTryOnResult(result.result_image_url);
      } else if (result.detail) {
        // Handle error details from the external API
        setError(result.detail);
      } else if (result.error) {
        // Handle generic error from the external API
        setError(result.error);
      } else {
        setError('Unknown error occurred during try-on.');
      }

    } catch (err) {
      setError('Failed to perform try-on. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>AI Try-On</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {!productImageUrl && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Please select a product image from the products page to use the AI Try-On feature.
        </Alert>
      )}

      {selectedProductImage && (
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Typography variant="h5" sx={{ mb: 1 }}>Selected Product Image</Typography>
          <img src={selectedProductImage} alt="Selected Product" style={{ maxWidth: '200px', border: '1px solid #ccc' }} />
        </Box>
      )}

      <Typography variant="h5" sx={{ mt: 3, mb: 1 }}>Upload Your Image</Typography>
      <input
        accept="image/*"
        style={{ display: 'none' }}
        id="user-avatar-upload-button"
        type="file"
        onChange={handleFileChange}
      />
      <label htmlFor="user-avatar-upload-button">
        <Button variant="contained" component="span">
          Upload Avatar
        </Button>
      </label>

      {selectedUserImage && (
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ mb: 1 }}>Uploaded Avatar</Typography>
          <img src={selectedUserImage} alt="Uploaded Avatar" style={{ maxWidth: '200px', border: '1px solid #ccc' }} />
        </Box>
      )}

      <Button
        variant="contained"
        color="primary"
        sx={{ mt: 4 }}
        onClick={handleTryOn}
        disabled={loading || !selectedProductImage || !selectedUserImage}
      >
        {loading ? <CircularProgress size={24} /> : 'Try On'}
      </Button>

      {tryOnResult && (
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>Try-On Result</Typography>
          <img src={tryOnResult} alt="Try-On Result" style={{ maxWidth: '100%', height: 'auto', border: '1px solid #ccc' }} />
        </Box>
      )}
    </Box>
  );
};

export default TryOnPage;