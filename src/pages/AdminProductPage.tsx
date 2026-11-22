import { useEffect, useState } from 'react';
import { Typography, Box, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Switch, FormControlLabel, InputAdornment, Select, MenuItem, InputLabel, FormControl, SelectChangeEvent } from '@mui/material';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import ProductService from '../services/ProductService';
import BrandService from '../services/BrandService';
import CategoryService from '../services/CategoryService';
import { Product, Brand, Category } from '../models';
import ImageUploader from '../components/ImageUploader';
import RichTextEditor from '../components/RichTextEditor';

const AdminProductPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [openCsvDialog, setOpenCsvDialog] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  const [showDeleted, setShowDeleted] = useState<boolean>(false);

  const fetchProducts = async (query: string = '') => {
    try {
      setLoading(true);
      const response = showDeleted 
        ? await ProductService.getDeletedProducts()
        : await ProductService.getAllProducts(query);
      setProducts(response.data);
    } catch (err) {
      setError('Không tải được danh sách sản phẩm.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBrandsAndCategories = async () => {
    try {
      const [brandsResponse, categoriesResponse] = await Promise.all([
        BrandService.getBrands(),
        CategoryService.getCategories(),
      ]);
      setBrands(brandsResponse.data);
      setCategories(categoriesResponse.data);
    } catch (err) {
      setError('Không tải được thương hiệu/danh mục.');
      console.error(err);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchProducts(searchQuery);
    }, 400); // Debounce search input

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery, showDeleted]); // Re-run effect when searchQuery or showDeleted changes

  useEffect(() => {
    fetchBrandsAndCategories();
  }, []);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

    const handleImageUploads = (urls: string[]) => {
      setCurrentProduct((prevProduct) => {
        if (prevProduct) {
          return { ...prevProduct, image_urls: urls };
        }
        return null;
      });
    };
  
    const handleCreateClick = () => {
      setCurrentProduct({ id: 0, name: '', description: '', price: 0, quantity: 0, image_urls: [], is_active: true, created_at: '', updated_at: '', release_date: undefined });
      setIsEditing(false);
      setOpenDialog(true);
    };
  
    const handleEditClick = (productItem: Product) => {
      setCurrentProduct(productItem);
      setIsEditing(true);
      setOpenDialog(true);
    };
  
    const handleDeleteClick = async (productId: number) => {
      if (window.confirm('Xóa sản phẩm này?')) {
        try {
          await ProductService.deleteProduct(productId);
          fetchProducts();
        } catch (err) {
          setError('Xóa sản phẩm thất bại.');
          console.error(err);
        }
      }
    };
  
    const handleRestoreClick = async (productId: number) => {
      if (window.confirm('Khôi phục sản phẩm này?')) {
        try {
          await ProductService.restoreProduct(productId);
          fetchProducts();
        } catch (err) {
          setError('Khôi phục sản phẩm thất bại.');
          console.error(err);
        }
      }
    };
  
    const handleSaveProduct = async () => {
      if (currentProduct) {
        try {
          if (isEditing) {
            await ProductService.updateProduct(currentProduct.id, currentProduct);
          } else {
            await ProductService.createProduct(currentProduct);
          }
          setOpenDialog(false);
          fetchProducts();
        } catch (err) {
          setError('Lưu sản phẩm thất bại.');
          console.error(err);
        }
      }
    };
  
    const handleCloseDialog = () => {
      setOpenDialog(false);
      setCurrentProduct(null);
    };
  
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setCurrentProduct((prevProduct) => {
        if (prevProduct) {
          return { ...prevProduct, [name as string]: value };
        }
        return null;
      });
    };

    const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setCurrentProduct((prevProduct) => {
            if (prevProduct) {
                return { ...prevProduct, [name]: checked };
            }
            return null;
        });
    };

    const handleSelectChange = (e: SelectChangeEvent<string | number>) => {
        const { name, value } = e.target;
        setCurrentProduct((prevProduct) => {
            if (prevProduct) {
                return { ...prevProduct, [name]: value };
            }
            return null;
        });
    };
  
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files && event.target.files[0]) {
        const file = event.target.files[0];
        setSelectedFile(file);
        setUploadMessage(null);
      }
    };
  
    const handleUploadCsv = async () => {
      if (!selectedFile) {
        setUploadMessage('Vui lòng chọn file CSV để tải lên.');
        return;
      }

      setUploading(true);
      setUploadMessage(null);
      try {
        const response = await ProductService.uploadProductsCsv(selectedFile);
        setUploadMessage(`Tải lên thành công: ${response.data.message || 'Đã nhập sản phẩm thành công.'}`);
        setOpenCsvDialog(false);
        setSelectedFile(null);
        fetchProducts(); // Refresh product list
      } catch (err: any) {
        setUploadMessage(`Tải lên thất bại: ${err.response?.data?.detail || err.message}`);
        console.error(err);
      } finally {
        setUploading(false);
      }
    };
  
  
  
    if (error) {
      return <Alert severity="error">{error}</Alert>;
    }
  
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Quản lý sản phẩm
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            label="Tìm sản phẩm"
            variant="outlined"
            value={searchQuery}
            onChange={handleSearchChange}
            sx={{ flexGrow: 1 }}
            disabled={showDeleted}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  {loading && <CircularProgress size={20} sx={{ color: 'primary.main' }} />}
                </InputAdornment>
              ),
            }}
          />
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
          <Button variant="contained" color="primary" onClick={handleCreateClick} disabled={showDeleted}>
            Thêm sản phẩm
          </Button>
          <Button variant="outlined" onClick={() => setOpenCsvDialog(true)} disabled={showDeleted} sx={{ borderColor: 'divider' }}>
            Nhập CSV
          </Button>
        </Box>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Ảnh</TableCell>
                <TableCell>Tên</TableCell>
                <TableCell>Giá</TableCell>
                <TableCell>SL</TableCell>
                <TableCell>Active</TableCell>
                <TableCell>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((productItem) => (
                <TableRow key={productItem.id}>
                  <TableCell>{productItem.id}</TableCell>
                  <TableCell>
                    <img
                      src={productItem.image_urls?.[0] || 'https://upload.wikimedia.org/wikipedia/commons/d/df/Mechanical_keyboard_example.jpg'}
                      alt={productItem.name}
                      style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: '4px' }}
                    />
                  </TableCell>
                  <TableCell>{productItem.name}</TableCell>
                  <TableCell>{productItem.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</TableCell>
                  <TableCell>{productItem.quantity}</TableCell>
                  <TableCell>{productItem.is_active ? 'Có' : 'Không'}</TableCell>
                  <TableCell>
                    {<Button variant="contained" color="primary" size="small" onClick={() => handleEditClick(productItem)} sx={{ mr: 1 }}>
                        Sửa
                      </Button>}
                    {showDeleted ? (
                      <Button variant="contained" color="success" size="small" onClick={() => handleRestoreClick(productItem.id)}>
                        Khôi phục
                      </Button>
                    ) : (
                      <Button variant="outlined" size="small" onClick={() => handleDeleteClick(productItem.id)} sx={{ borderColor: 'error.main', color: 'error.main' }}>
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
          <DialogTitle>{isEditing ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</DialogTitle>
          <DialogContent>
            {currentProduct && (
              <Box component="form" sx={{ '& .MuiTextField-root': { m: 1, width: '100%' } }}>
                <TextField
                  margin="dense"
                  name="name"
                  label="Tên"
                  type="text"
                  fullWidth
                  variant="standard"
                  value={currentProduct.name}
                  onChange={handleInputChange}
                />
                <RichTextEditor
                  value={currentProduct.description || ''}
                  onChange={(value) => {
                    setCurrentProduct((prevProduct) => {
                      if (prevProduct) {
                        return { ...prevProduct, description: value };
                      }
                      return null;
                    });
                  }}
                  placeholder="Mô tả sản phẩm"
                />
                <TextField
                  margin="dense"
                  name="price"
                  label="Giá (VNĐ)"
                  type="number"
                  fullWidth
                  variant="standard"
                  value={currentProduct.price}
                  onChange={handleInputChange}
                />
                <TextField
                  margin="dense"
                  name="quantity"
                  label="Số lượng"
                  type="number"
                  fullWidth
                  variant="standard"
                  value={currentProduct.quantity}
                  onChange={handleInputChange}
                />
                <FormControl fullWidth margin="dense">
                  <InputLabel>Thương hiệu</InputLabel>
                  <Select
                    name="brand_id"
                    value={currentProduct.brand_id || ''}
                    onChange={handleSelectChange}
                  >
                    {brands.map((brand) => (
                      <MenuItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth margin="dense">
                  <InputLabel>Danh mục</InputLabel>
                  <Select
                    name="category_id"
                    value={currentProduct.category_id || ''}
                    onChange={handleSelectChange}
                  >
                    {categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DateTimePicker
                    label="Ngày ra mắt"
                    value={currentProduct.release_date ? dayjs(currentProduct.release_date) : null}
                    onChange={(newValue) => {
                      setCurrentProduct((prevProduct) => {
                        if (prevProduct) {
                          return { ...prevProduct, release_date: newValue ? newValue.toISOString() : undefined };
                        }
                        return null;
                      });
                    }}
                    slotProps={{ textField: { fullWidth: true, variant: 'standard' } }}
                  />
                </LocalizationProvider>
                <ImageUploader onImageUpload={handleImageUploads} initialImageUrls={currentProduct.image_urls || []} />
                <FormControlLabel
                  control={
                    <Switch
                      checked={currentProduct.is_active}
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
            <Button onClick={handleSaveProduct} color="primary">Lưu</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={openCsvDialog} onClose={() => setOpenCsvDialog(false)}>
          <DialogTitle>Nhập sản phẩm từ CSV</DialogTitle>
          <DialogContent>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              style={{ display: 'block', marginBottom: '16px' }}
            />
            {uploadMessage && <Alert severity={uploadMessage.startsWith('Tải lên thành công') ? 'success' : 'error'}>{uploadMessage}</Alert>}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenCsvDialog(false)}>Hủy</Button>
            <Button onClick={handleUploadCsv} disabled={uploading || !selectedFile} color="primary">
              {uploading ? <CircularProgress size={22} sx={{ color: '#0D1210' }} /> : 'Tải lên'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  };
  
  export default AdminProductPage;
