import React, { useState } from 'react';
import { useLocation, Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Button, CircularProgress, Alert, Paper, Container } from '@mui/material';
import { AutoFixHighOutlined, UploadFileOutlined } from '@mui/icons-material';
import { performTryOn } from '../services/TryOnService';
import { colors } from '../theme';

interface TryOnLocationState {
  productId?: number;
  productName?: string;
  productImage?: string;
}

const TryOnPage = () => {
  const location = useLocation();
  const { productId, productName, productImage } = (location.state as TryOnLocationState) || {};

  const [selectedUserImage, setSelectedUserImage] = useState<string | null>(null);
  const [tryOnResult, setTryOnResult] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSelectedUserImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleTryOn = async () => {
    if (!productId || !selectedUserImage) {
      setError('Cần có sản phẩm và ảnh của bạn trước khi ghép.');
      return;
    }
    setLoading(true);
    setError(null);
    setTryOnResult(null);
    try {
      const result = await performTryOn({ product_id: productId, user_image_base64: selectedUserImage });
      if (result.result_image_url) {
        setTryOnResult(result.result_image_url);
      } else {
        setError(result.detail || result.error || 'AI không tạo được ảnh ghép, thử lại nhé.');
      }
    } catch (err) {
      setError('Ghép AI thất bại, thử lại sau.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 1 }}>Ghép thử AI</Typography>
        <Typography sx={{ color: colors.muted }}>
          Tính năng thử nghiệm vui: tải ảnh của bạn lên, AI sẽ ghép sản phẩm vào khung hình. Kết quả mang tính minh họa, không phản ánh chính xác kích thước/màu sắc thật.
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {!productId && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Chưa chọn sản phẩm. Vào <RouterLink to="/products" style={{ color: colors.jadeBright }}>trang sản phẩm</RouterLink> và bấm "Ghép thử AI" trên một sản phẩm trước.
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        <Paper sx={{ p: 3, flex: 1, minWidth: 240 }}>
          <Typography variant="overline" sx={{ color: colors.muted, letterSpacing: 0 }}>Sản phẩm</Typography>
          {productImage ? (
            <Box component="img" src={productImage} alt={productName || 'Sản phẩm'} sx={{ width: '100%', borderRadius: 1, mt: 1, border: `1px solid ${colors.border}` }} />
          ) : (
            <Box sx={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.muted, mt: 1 }}>Chưa chọn</Box>
          )}
          {productName && <Typography sx={{ mt: 1.5, fontWeight: 600 }}>{productName}</Typography>}
        </Paper>

        <Paper sx={{ p: 3, flex: 1, minWidth: 240 }}>
          <Typography variant="overline" sx={{ color: colors.muted, letterSpacing: 0 }}>Ảnh của bạn</Typography>
          {selectedUserImage ? (
            <Box component="img" src={selectedUserImage} alt="Ảnh đã tải lên" sx={{ width: '100%', borderRadius: 1, mt: 1, border: `1px solid ${colors.border}` }} />
          ) : (
            <Box sx={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.muted, mt: 1 }}>Chưa có ảnh</Box>
          )}
          <input accept="image/*" style={{ display: 'none' }} id="user-avatar-upload-button" type="file" onChange={handleFileChange} />
          <label htmlFor="user-avatar-upload-button">
            <Button component="span" variant="outlined" startIcon={<UploadFileOutlined />} sx={{ mt: 2, borderColor: colors.border, color: colors.ink }} fullWidth>
              Tải ảnh lên
            </Button>
          </label>
        </Paper>
      </Box>

      <Button
        variant="contained"
        color="primary"
        size="large"
        startIcon={!loading && <AutoFixHighOutlined />}
        sx={{ mt: 3 }}
        onClick={handleTryOn}
        disabled={loading || !productId || !selectedUserImage}
      >
        {loading ? <CircularProgress size={22} sx={{ color: '#0D1210' }} /> : 'Ghép AI'}
      </Button>

      {tryOnResult && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" sx={{ mb: 1.5 }}>Kết quả</Typography>
          <Box component="img" src={tryOnResult} alt="Kết quả ghép AI" sx={{ maxWidth: '100%', borderRadius: 1, border: `1px solid ${colors.border}` }} />
        </Box>
      )}
    </Container>
  );
};

export default TryOnPage;
