import { useEffect, useState } from 'react';
import { Typography, Box, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Switch, FormControlLabel, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import DiscountService from '../services/DiscountService';
import ProductService from '../services/ProductService'; // To fetch product names for product_id
import { Product } from '../models';

interface Discount {
  id: number;
  name: string;
  percent: number;
  start_date?: string;
  end_date?: string;
  product_id?: number;
  is_active: boolean;
}

const AdminDiscountPage = () => {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [products, setProducts] = useState<Product[]>([]); // For product dropdown
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [currentDiscount, setCurrentDiscount] = useState<Discount | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [showDeleted, setShowDeleted] = useState<boolean>(false);

  const fetchDiscountsAndProducts = async () => {
    try {
      setLoading(true);
      const [discountResponse, productResponse] = await Promise.all([
        showDeleted ? DiscountService.getDeletedDiscounts() : DiscountService.getAllDiscounts(undefined, true), // include_expired=true for admin
        ProductService.getAllProducts(),
      ]);
      setDiscounts(discountResponse.data);
      setProducts(productResponse.data);
    } catch (err) {
      setError('Không tải được dữ liệu.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscountsAndProducts();
  }, [showDeleted]);

  const handleCreateClick = () => {
    setCurrentDiscount({ id: 0, name: '', percent: 0, is_active: true });
    setIsEditing(false);
    setOpenDialog(true);
  };

  const handleEditClick = (discountItem: Discount) => {
    setCurrentDiscount(discountItem);
    setIsEditing(true);
    setOpenDialog(true);
  };

  const handleDeleteClick = async (discountId: number) => {
    if (window.confirm('Xóa khuyến mãi này?')) {
      try {
        await DiscountService.deleteDiscount(discountId);
        fetchDiscountsAndProducts();
      } catch (err) {
        setError('Xóa khuyến mãi thất bại.');
        console.error(err);
      }
    }
  };

  const handleRestoreClick = async (discountId: number) => {
    if (window.confirm('Khôi phục khuyến mãi này?')) {
      try {
        await DiscountService.restoreDiscount(discountId);
        fetchDiscountsAndProducts();
      } catch (err) {
        setError('Khôi phục khuyến mãi thất bại.');
        console.error(err);
      }
    }
  };

  const handleSaveDiscount = async () => {
    if (currentDiscount) {
      try {
        if (isEditing) {
          await DiscountService.updateDiscount(currentDiscount.id, currentDiscount);
        } else {
          await DiscountService.createDiscount(currentDiscount);
        }
        setOpenDialog(false);
        fetchDiscountsAndProducts();
      } catch (err) {
        setError('Lưu khuyến mãi thất bại.');
        console.error(err);
      }
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentDiscount(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentDiscount((prevDiscount) => {
      if (prevDiscount) {
        return { ...prevDiscount, [name]: value };
      }
      return null;
    });
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setCurrentDiscount((prevDiscount) => {
      if (prevDiscount) {
        return { ...prevDiscount, [name]: checked };
      }
      return null;
    });
  };

  const handleSelectChange = (e: SelectChangeEvent<string | number>) => {
    const { name, value } = e.target;
    setCurrentDiscount((prevDiscount) => {
      if (prevDiscount) {
        return { ...prevDiscount, [name]: value };
      }
      return null;
    });
  };

  const getProductName = (productId?: number) => {
    if (!productId) return 'Không có';
    const product = products.find(p => p.id === productId);
    return product ? product.name : 'Sản phẩm không rõ';
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

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        <Typography variant="h4" gutterBottom>
          Quản lý khuyến mãi
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
          <Button variant="contained" color="primary" onClick={handleCreateClick} disabled={showDeleted}>
            Thêm khuyến mãi
          </Button>
          <FormControlLabel
            control={
              <Switch
                checked={showDeleted}
                onChange={(e) => setShowDeleted(e.target.checked)}
                name="showDeleted"
                color="primary"
              />
            }
            label="Hiện đã xóa"
          />
        </Box>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Tên</TableCell>
                <TableCell>%</TableCell>
                <TableCell>Bắt đầu</TableCell>
                <TableCell>Kết thúc</TableCell>
                <TableCell>Sản phẩm</TableCell>
                <TableCell>Active</TableCell>
                <TableCell>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {discounts.map((discountItem) => (
                <TableRow key={discountItem.id}>
                  <TableCell>{discountItem.id}</TableCell>
                  <TableCell>{discountItem.name}</TableCell>
                  <TableCell>{discountItem.percent}%</TableCell>
                  <TableCell>{discountItem.start_date ? new Date(discountItem.start_date).toLocaleDateString('vi-VN') : 'Không có'}</TableCell>
                  <TableCell>{discountItem.end_date ? new Date(discountItem.end_date).toLocaleDateString('vi-VN') : 'Không có'}</TableCell>
                  <TableCell>{getProductName(discountItem.product_id)}</TableCell>
                  <TableCell>{discountItem.is_active ? 'Có' : 'Không'}</TableCell>
                  <TableCell>
                    {<Button variant="contained" color="primary" size="small" onClick={() => handleEditClick(discountItem)} sx={{ mr: 1 }}>
                        Sửa
                      </Button>}
                    {showDeleted ? (
                      <Button variant="contained" color="success" size="small" onClick={() => handleRestoreClick(discountItem.id)}>
                        Khôi phục
                      </Button>
                    ) : (
                      <Button variant="outlined" size="small" onClick={() => handleDeleteClick(discountItem.id)} sx={{ borderColor: 'error.main', color: 'error.main' }}>
                        Xóa
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="md">
          <DialogTitle>{isEditing ? 'Sửa khuyến mãi' : 'Thêm khuyến mãi'}</DialogTitle>
          <DialogContent>
            {currentDiscount && (
              <Box component="form" sx={{ '& .MuiTextField-root': { m: 1, width: '100%' } }}>
                <TextField
                  margin="dense"
                  name="name"
                  label="Tên"
                  type="text"
                  fullWidth
                  variant="standard"
                  value={currentDiscount.name}
                  onChange={handleInputChange}
                />
                <TextField
                  margin="dense"
                  name="percent"
                  label="Phần trăm giảm"
                  type="number"
                  fullWidth
                  variant="standard"
                  value={currentDiscount.percent}
                  onChange={handleInputChange}
                />
                <DatePicker
                  label="Ngày bắt đầu"
                  value={currentDiscount.start_date ? dayjs(currentDiscount.start_date) : null}
                  onChange={(newValue) => {
                    setCurrentDiscount((prevDiscount) => {
                      if (prevDiscount) {
                        return { ...prevDiscount, start_date: newValue ? newValue.toISOString() : undefined };
                      }
                      return null;
                    });
                  }}
                  slotProps={{ textField: { fullWidth: true, margin: "dense", variant: "standard" } }}
                />
                <DatePicker
                  label="Ngày kết thúc"
                  value={currentDiscount.end_date ? dayjs(currentDiscount.end_date) : null}
                  onChange={(newValue) => {
                    setCurrentDiscount((prevDiscount) => {
                      if (prevDiscount) {
                        return { ...prevDiscount, end_date: newValue ? newValue.toISOString() : undefined };
                      }
                      return null;
                    });
                  }}
                  slotProps={{ textField: { fullWidth: true, margin: "dense", variant: "standard" } }}
                />
                <FormControl fullWidth margin="dense">
                  <InputLabel id="product-select-label">Sản phẩm (tùy chọn)</InputLabel>
                  <Select
                    labelId="product-select-label"
                    id="product-select"
                    name="product_id"
                    value={currentDiscount.product_id || ''}
                    label="Sản phẩm (tùy chọn)"
                    onChange={handleSelectChange}
                  >
                    <MenuItem value=""><em>Không chọn</em></MenuItem>
                    {products.map((product) => (
                      <MenuItem key={product.id} value={product.id}>
                        {product.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControlLabel
                  control={
                    <Switch
                      checked={currentDiscount.is_active}
                      onChange={handleSwitchChange}
                      name="is_active"
                      color="primary"
                    />
                  }
                  label="Đang kích hoạt"
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Hủy</Button>
            <Button onClick={handleSaveDiscount} color="primary">Lưu</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default AdminDiscountPage;