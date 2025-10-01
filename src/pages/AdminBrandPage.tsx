import { useEffect, useState } from 'react';
import { Typography, Box, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import BrandService from '../services/BrandService';
import { Brand } from '../models';

const AdminBrandPage = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [currentBrand, setCurrentBrand] = useState<Brand | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const response = await BrandService.getBrands();
      setBrands(response.data);
    } catch (err) {
      setError('Failed to fetch brands.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleCreateClick = () => {
    setCurrentBrand({ id: 0, name: '' });
    setIsEditing(false);
    setOpenDialog(true);
  };

  const handleEditClick = (brand: Brand) => {
    setCurrentBrand(brand);
    setIsEditing(true);
    setOpenDialog(true);
  };

  const handleDeleteClick = async (brandId: number) => {
    if (window.confirm('Are you sure you want to delete this brand?')) {
      try {
        await BrandService.deleteBrand(brandId);
        fetchBrands();
      } catch (err) {
        setError('Failed to delete brand.');
        console.error(err);
      }
    }
  };

  const handleSaveBrand = async () => {
    if (currentBrand) {
      try {
        if (isEditing) {
          await BrandService.updateBrand(currentBrand.id, currentBrand);
        } else {
          await BrandService.createBrand(currentBrand);
        }
        setOpenDialog(false);
        fetchBrands();
      } catch (err) {
        setError('Failed to save brand.');
        console.error(err);
      }
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentBrand(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentBrand((prevBrand) => {
      if (prevBrand) {
        return { ...prevBrand, [name]: value };
      }
      return null;
    });
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
    <Box>
      <Typography variant="h4" gutterBottom>
        Manage Brands
      </Typography>
      <Box sx={{ mb: 2 }}>
        <Button variant="contained" onClick={handleCreateClick}>
          Create New Brand
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {brands.map((brand) => (
              <TableRow key={brand.id}>
                <TableCell>{brand.id}</TableCell>
                <TableCell>{brand.name}</TableCell>
                <TableCell>
                  <Button variant="contained" size="small" onClick={() => handleEditClick(brand)} sx={{ mr: 1 }}>
                    Edit
                  </Button>
                  <Button variant="outlined" color="error" size="small" onClick={() => handleDeleteClick(brand.id)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>{isEditing ? 'Edit Brand' : 'Create Brand'}</DialogTitle>
        <DialogContent>
          {currentBrand && (
            <Box component="form" sx={{ '& .MuiTextField-root': { m: 1, width: '100%' } }}>
              <TextField
                margin="dense"
                name="name"
                label="Name"
                type="text"
                fullWidth
                variant="standard"
                value={currentBrand.name}
                onChange={handleInputChange}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveBrand}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminBrandPage;
