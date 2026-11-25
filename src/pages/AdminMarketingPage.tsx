import { useEffect, useState } from 'react';
import {
  Typography, Box, TextField, Button, Autocomplete, Paper, CircularProgress,
  Snackbar, Alert, Chip, Divider,
} from '@mui/material';
import { SendOutlined, VisibilityOutlined } from '@mui/icons-material';
import ProductService from '../services/ProductService';
import AdminService, { PromoCampaignPreview } from '../services/AdminService';
import { Product } from '../models';
import { colors } from '../theme';

const formatVnd = (amount: number) => amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

const AdminMarketingPage = () => {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [title, setTitle] = useState('SALE CUỐI TUẦN');
  const [subtitle, setSubtitle] = useState('Giảm giá sốc cho hàng loạt bàn phím cơ, switch và phụ kiện chính hãng.');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const [preview, setPreview] = useState<PromoCampaignPreview | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await ProductService.getAllProducts();
        setAllProducts(data);
        // Pre-select products that currently have an active discount, as a starting point.
        setSelectedProducts(data.filter((p) => (p.discount_percent ?? 0) > 0).slice(0, 10));
      } catch (err) {
        console.error(err);
      }
    };
    fetchProducts();
  }, []);

  const handlePreview = async () => {
    if (selectedProducts.length === 0) {
      setSnackbar({ open: true, message: 'Chọn ít nhất 1 sản phẩm.', severity: 'error' });
      return;
    }
    setPreviewLoading(true);
    setPreview(null);
    try {
      const { data } = await AdminService.previewPromoCampaign(title, subtitle, selectedProducts.map((p) => p.id));
      setPreview(data);
    } catch (err: any) {
      setSnackbar({ open: true, message: err.response?.data?.detail || 'Tạo xem trước thất bại.', severity: 'error' });
    }
    setPreviewLoading(false);
  };

  const handleSend = async () => {
    if (!preview) return;
    setSendLoading(true);
    try {
      const { data } = await AdminService.sendPromoCampaign(preview);
      setSnackbar({ open: true, message: `Đã gửi tới ${data.sent}/${data.recipients} người nhận.`, severity: 'success' });
      setPreview(null);
    } catch (err: any) {
      setSnackbar({ open: true, message: err.response?.data?.detail || 'Gửi email thất bại.', severity: 'error' });
    }
    setSendLoading(false);
  };

  return (
    <Box sx={{ maxWidth: 900 }}>
      <Typography variant="h5" sx={{ mb: 1 }}>Email khuyến mãi</Typography>
      <Typography sx={{ color: colors.muted, mb: 3 }}>
        Soạn nội dung, chọn sản phẩm, xem trước rồi gửi tới toàn bộ người dùng đã đăng ký nhận email.
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <TextField
          label="Tiêu đề banner"
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Mô tả phụ"
          fullWidth
          multiline
          rows={2}
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Autocomplete
          multiple
          options={allProducts}
          value={selectedProducts}
          onChange={(_e, value) => setSelectedProducts(value)}
          getOptionLabel={(p) => p.name}
          isOptionEqualToValue={(a, b) => a.id === b.id}
          renderOption={(props, option) => (
            <li {...props} key={option.id}>
              {option.name} — {formatVnd(option.final_price ?? option.price)}
              {option.discount_percent ? ` (-${option.discount_percent}%)` : ''}
            </li>
          )}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip label={option.name} size="small" {...getTagProps({ index })} key={option.id} />
            ))
          }
          renderInput={(params) => <TextField {...params} label="Sản phẩm trong email" placeholder="Chọn sản phẩm..." />}
          sx={{ mb: 2 }}
        />
        <Button
          variant="outlined"
          startIcon={previewLoading ? <CircularProgress size={18} /> : <VisibilityOutlined />}
          onClick={handlePreview}
          disabled={previewLoading}
          sx={{ borderColor: colors.border, color: colors.ink, '&:hover': { borderColor: colors.jade } }}
        >
          Xem trước
        </Button>
      </Paper>

      {preview && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Xem trước email</Typography>
          <Box
            component="img"
            src={preview.hero_url}
            alt="Hero banner"
            sx={{ width: '100%', borderRadius: 2, mb: 2, border: `1px solid ${colors.border}` }}
          />
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
            {preview.products.map((p) => (
              <Box
                component="img"
                key={p.id}
                src={p.image_url}
                alt={p.name}
                sx={{ width: 180, borderRadius: 2, border: `1px solid ${colors.border}` }}
              />
            ))}
          </Box>
          <Divider sx={{ borderColor: colors.border, mb: 2 }} />
          <Button
            variant="contained"
            color="primary"
            startIcon={sendLoading ? <CircularProgress size={18} sx={{ color: '#0D1210' }} /> : <SendOutlined />}
            onClick={handleSend}
            disabled={sendLoading}
          >
            Gửi cho người dùng đã đăng ký
          </Button>
        </Paper>
      )}

      {snackbar && (
        <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={() => setSnackbar(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert onClose={() => setSnackbar(null)} severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
        </Snackbar>
      )}
    </Box>
  );
};

export default AdminMarketingPage;
