import { useEffect, useState } from 'react';
import { Typography, Box, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Switch, FormControlLabel, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
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
        showDeleted ? DiscountService.getDeletedDiscounts() : DiscountService.getAllDiscounts(),
        ProductService.getAllProducts(),
      ]);
      setDiscounts(discountResponse.data);
      setProducts(productResponse.data);
    } catch (err) {
      setError('Failed to fetch data.');
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
    if (window.confirm('Are you sure you want to delete this discount?')) {
      try {
        await DiscountService.deleteDiscount(discountId);
        fetchDiscountsAndProducts();
      } catch (err) {
        setError('Failed to delete discount.');
        console.error(err);
      }
    }
  };

  const handleRestoreClick = async (discountId: number) => {
    if (window.confirm('Are you sure you want to restore this discount?')) {
      try {
        await DiscountService.restoreDiscount(discountId);
        fetchDiscountsAndProducts();
      } catch (err) {
        setError('Failed to restore discount.');
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
        setError('Failed to save discount.');
        console.error(err);
      }
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentDiscount(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, checked, type } = e.target;
    setCurrentDiscount((prevDiscount) => {
      if (prevDiscount) {
        return { ...prevDiscount, [name]: type === 'checkbox' ? checked : value };
      }
      return null;
    });
  };

  const getProductName = (productId?: number) => {
    if (!productId) return 'N/A';
    const product = products.find(p => p.id === productId);
    return product ? product.name : 'Unknown Product';
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
          Manage Discounts
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
          <Button variant="contained" onClick={handleCreateClick} disabled={showDeleted}>
            Create New Discount
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
            label="Show Deleted"
          />
        </Box>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Percent</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell>Product</TableCell>
                <TableCell>Active</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {discounts.map((discountItem) => (
                <TableRow key={discountItem.id}>
                  <TableCell>{discountItem.id}</TableCell>
                  <TableCell>{discountItem.name}</TableCell>
                  <TableCell>{discountItem.percent}%</TableCell>
                  <TableCell>{discountItem.start_date ? new Date(discountItem.start_date).toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell>{discountItem.end_date ? new Date(discountItem.end_date).toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell>{getProductName(discountItem.product_id)}</TableCell>
                  <TableCell>{discountItem.is_active ? 'Yes' : 'No'}</TableCell>
                  <TableCell>
                    {<Button variant="contained" size="small" onClick={() => handleEditClick(discountItem)} sx={{ mr: 1 }}>
                        Edit
                      </Button>}
                    {showDeleted ? (
                      <Button variant="contained" color="success" size="small" onClick={() => handleRestoreClick(discountItem.id)}>
                        Restore
                      </Button>
                    ) : (
                      <Button variant="outlined" color="error" size="small" onClick={() => handleDeleteClick(discountItem.id)}>
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
          <DialogTitle>{isEditing ? 'Edit Discount' : 'Create Discount'}</DialogTitle>
          <DialogContent>
            {currentDiscount && (
              <Box component="form" sx={{ '& .MuiTextField-root': { m: 1, width: '100%' } }}>
                <TextField
                  margin="dense"
                  name="name"
                  label="Name"
                  type="text"
                  fullWidth
                  variant="standard"
                  value={currentDiscount.name}
                  onChange={handleInputChange}
                />
                <TextField
                  margin="dense"
                  name="percent"
                  label="Percent"
                  type="number"
                  fullWidth
                  variant="standard"
                  value={currentDiscount.percent}
                  onChange={handleInputChange}
                />
                <DatePicker
                  label="Start Date"
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
                  label="End Date"
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
                  <InputLabel id="product-select-label">Product (optional)</InputLabel>
                  <Select
                    labelId="product-select-label"
                    id="product-select"
                    name="product_id"
                    value={currentDiscount.product_id || ''}
                    label="Product (optional)"
                    onChange={handleInputChange}
                  >
                    <MenuItem value=""><em>None</em></MenuItem>
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
            <Button onClick={handleSaveDiscount}>Save</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default AdminDiscountPage;