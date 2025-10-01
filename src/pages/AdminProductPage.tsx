import { useEffect, useState } from 'react';
import { Typography, Box, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Switch, FormControlLabel, InputAdornment, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
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
      setError('Failed to fetch products.');
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
      setError('Failed to fetch brands and categories.');
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
      setCurrentProduct({ id: 0, name: '', description: '', price: 0, quantity: 0, image_urls: [], is_active: true, created_at: '', updated_at: '', release_date: null });
      setIsEditing(false);
      setOpenDialog(true);
    };
  
    const handleEditClick = (productItem: Product) => {
      setCurrentProduct(productItem);
      setIsEditing(true);
      setOpenDialog(true);
    };
  
    const handleDeleteClick = async (productId: number) => {
      if (window.confirm('Are you sure you want to delete this product?')) {
        try {
          await ProductService.deleteProduct(productId);
          fetchProducts();
        } catch (err) {
          setError('Failed to delete product.');
          console.error(err);
        }
      }
    };
  
    const handleRestoreClick = async (productId: number) => {
      if (window.confirm('Are you sure you want to restore this product?')) {
        try {
          await ProductService.restoreProduct(productId);
          fetchProducts();
        } catch (err) {
          setError('Failed to restore product.');
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
          setError('Failed to save product.');
          console.error(err);
        }
      }
    };
  
    const handleCloseDialog = () => {
      setOpenDialog(false);
      setCurrentProduct(null);
    };
  
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | { name?: string; value: unknown }>) => {
      const { name, value } = e.target;
      setCurrentProduct((prevProduct) => {
        if (prevProduct) {
          return { ...prevProduct, [name as string]: value };
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
        setUploadMessage('Please select a CSV file to upload.');
        return;
      }
  
      setUploading(true);
      setUploadMessage(null);
      try {
        const response = await ProductService.uploadProductsCsv(selectedFile);
        setUploadMessage(`Upload successful: ${response.data.message || 'Products imported successfully.'}`);
        setOpenCsvDialog(false);
        setSelectedFile(null);
        fetchProducts(); // Refresh product list
      } catch (err: any) {
        setUploadMessage(`Upload failed: ${err.response?.data?.detail || err.message}`);
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
          Manage Products
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
          <TextField
            label="Search Products"
            variant="outlined"
            value={searchQuery}
            onChange={handleSearchChange}
            sx={{ flexGrow: 1 }}
            disabled={showDeleted}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  {loading && <CircularProgress size={20} />}
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
            label="Show Deleted"
          />
          <Button variant="contained" onClick={handleCreateClick} disabled={showDeleted}>
            Create New Product
          </Button>
          <Button variant="outlined" onClick={() => setOpenCsvDialog(true)} disabled={showDeleted}>
            Import Products (CSV)
          </Button>
        </Box>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Image</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Active</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((productItem) => (
                <TableRow key={productItem.id}>
                  <TableCell>{productItem.id}</TableCell>
                  <TableCell>
                    <img 
                      src={productItem.image_urls?.[0] || 'https://via.placeholder.com/50'}
                      alt={productItem.name}
                      style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: '4px' }}
                    />
                  </TableCell>
                  <TableCell>{productItem.name}</TableCell>
                  <TableCell>{productItem.price}</TableCell>
                  <TableCell>{productItem.quantity}</TableCell>
                  <TableCell>{productItem.is_active ? 'Yes' : 'No'}</TableCell>
                  <TableCell>
                    {<Button variant="contained" size="small" onClick={() => handleEditClick(productItem)} sx={{ mr: 1 }}>
                        Edit
                      </Button>}
                    {showDeleted ? (
                      <Button variant="contained" color="success" size="small" onClick={() => handleRestoreClick(productItem.id)}>
                        Restore
                      </Button>
                    ) : (
                      <Button variant="outlined" color="error" size="small" onClick={() => handleDeleteClick(productItem.id)}>
                        Delete
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
  
        <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="md">
          <DialogTitle>{isEditing ? 'Edit Product' : 'Create Product'}</DialogTitle>
          <DialogContent>
            {currentProduct && (
              <Box component="form" sx={{ '& .MuiTextField-root': { m: 1, width: '100%' } }}>
                <TextField
                  margin="dense"
                  name="name"
                  label="Name"
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
                  placeholder="Product Description"
                />
                <TextField
                  margin="dense"
                  name="price"
                  label="Price"
                  type="number"
                  fullWidth
                  variant="standard"
                  value={currentProduct.price}
                  onChange={handleInputChange}
                />
                <TextField
                  margin="dense"
                  name="quantity"
                  label="Quantity"
                  type="number"
                  fullWidth
                  variant="standard"
                  value={currentProduct.quantity}
                  onChange={handleInputChange}
                />
                <FormControl fullWidth margin="dense">
                  <InputLabel>Brand</InputLabel>
                  <Select
                    name="brand_id"
                    value={currentProduct.brand_id || ''}
                    onChange={handleInputChange}
                  >
                    {brands.map((brand) => (
                      <MenuItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth margin="dense">
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="category_id"
                    value={currentProduct.category_id || ''}
                    onChange={handleInputChange}
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
                    label="Release Date"
                    value={currentProduct.release_date ? dayjs(currentProduct.release_date) : null}
                    onChange={(newValue) => {
                      setCurrentProduct((prevProduct) => {
                        if (prevProduct) {
                          return { ...prevProduct, release_date: newValue ? newValue.toISOString() : null };
                        }
                        return null;
                      });
                    }}
                    renderInput={(params) => <TextField {...params} />}
                  />
                </LocalizationProvider>
                <ImageUploader onImageUpload={handleImageUploads} initialImageUrls={currentProduct.image_urls || []} />
                <FormControlLabel
                  control={
                    <Switch
                      checked={currentProduct.is_active}
                      onChange={handleInputChange}
                      name="is_active"
                      color="primary"
                    />
                  }
                  label="Is Active"
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSaveProduct}>Save</Button>
          </DialogActions>
        </Dialog>
  
        <Dialog open={openCsvDialog} onClose={() => setOpenCsvDialog(false)}>
          <DialogTitle>Import Products from CSV</DialogTitle>
          <DialogContent>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              style={{ display: 'block', marginBottom: '16px' }}
            />
            {uploadMessage && <Alert severity={uploadMessage.startsWith('Upload successful') ? 'success' : 'error'}>{uploadMessage}</Alert>}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenCsvDialog(false)}>Cancel</Button>
            <Button onClick={handleUploadCsv} disabled={uploading || !selectedFile}>
              {uploading ? <CircularProgress size={24} /> : 'Upload'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  };
  
  export default AdminProductPage;
