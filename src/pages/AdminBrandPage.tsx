import { useEffect, useState } from 'react';
import { Typography, Box, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import BrandService from '../services/BrandService';
import { Brand } from '../models';
import { colors } from '../theme';

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
      setError('Không tải được danh sách thương hiệu.');
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
    if (window.confirm('Xóa thương hiệu này?')) {
      try {
        await BrandService.deleteBrand(brandId);
        fetchBrands();
      } catch (err) {
        setError('Xóa thương hiệu thất bại.');
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
        setError('Lưu thương hiệu thất bại.');
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
        <CircularProgress sx={{ color: colors.jade }} />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Quản lý thương hiệu
      </Typography>
      <Box sx={{ mb: 2 }}>
        <Button variant="contained" color="primary" onClick={handleCreateClick}>
          Thêm thương hiệu
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Tên</TableCell>
              <TableCell>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {brands.map((brand) => (
              <TableRow key={brand.id}>
                <TableCell>{brand.id}</TableCell>
                <TableCell>{brand.name}</TableCell>
                <TableCell>
                  <Button variant="contained" color="primary" size="small" onClick={() => handleEditClick(brand)} sx={{ mr: 1 }}>
                    Sửa
                  </Button>
                  <Button variant="outlined" size="small" onClick={() => handleDeleteClick(brand.id)} sx={{ borderColor: colors.danger, color: colors.danger }}>
                    Xóa
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>{isEditing ? 'Sửa thương hiệu' : 'Thêm thương hiệu'}</DialogTitle>
        <DialogContent>
          {currentBrand && (
            <Box component="form" sx={{ '& .MuiTextField-root': { m: 1, width: '100%' } }}>
              <TextField
                margin="dense"
                name="name"
                label="Tên"
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
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button onClick={handleSaveBrand} color="primary">Lưu</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminBrandPage;
