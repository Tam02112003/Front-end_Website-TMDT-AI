import { useEffect, useState } from 'react';
import { Typography, Box, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import CategoryService from '../services/CategoryService';
import { Category } from '../models';
import { colors } from '../theme';

const AdminCategoryPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await CategoryService.getCategories();
      setCategories(response.data);
    } catch (err) {
      setError('Không tải được danh sách danh mục.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateClick = () => {
    setCurrentCategory({ id: 0, name: '' });
    setIsEditing(false);
    setOpenDialog(true);
  };

  const handleEditClick = (category: Category) => {
    setCurrentCategory(category);
    setIsEditing(true);
    setOpenDialog(true);
  };

  const handleDeleteClick = async (categoryId: number) => {
    if (window.confirm('Xóa danh mục này?')) {
      try {
        await CategoryService.deleteCategory(categoryId);
        fetchCategories();
      } catch (err) {
        setError('Xóa danh mục thất bại.');
        console.error(err);
      }
    }
  };

  const handleSaveCategory = async () => {
    if (currentCategory) {
      try {
        if (isEditing) {
          await CategoryService.updateCategory(currentCategory.id, currentCategory);
        } else {
          await CategoryService.createCategory(currentCategory);
        }
        setOpenDialog(false);
        fetchCategories();
      } catch (err) {
        setError('Lưu danh mục thất bại.');
        console.error(err);
      }
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentCategory(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentCategory((prevCategory) => {
      if (prevCategory) {
        return { ...prevCategory, [name]: value };
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
        Quản lý danh mục
      </Typography>
      <Box sx={{ mb: 2 }}>
        <Button variant="contained" color="primary" onClick={handleCreateClick}>
          Thêm danh mục
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
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>{category.id}</TableCell>
                <TableCell>{category.name}</TableCell>
                <TableCell>
                  <Button variant="contained" color="primary" size="small" onClick={() => handleEditClick(category)} sx={{ mr: 1 }}>
                    Sửa
                  </Button>
                  <Button variant="outlined" size="small" onClick={() => handleDeleteClick(category.id)} sx={{ borderColor: colors.danger, color: colors.danger }}>
                    Xóa
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>{isEditing ? 'Sửa danh mục' : 'Thêm danh mục'}</DialogTitle>
        <DialogContent>
          {currentCategory && (
            <Box component="form" sx={{ '& .MuiTextField-root': { m: 1, width: '100%' } }}>
              <TextField
                margin="dense"
                name="name"
                label="Tên"
                type="text"
                fullWidth
                variant="standard"
                value={currentCategory.name}
                onChange={handleInputChange}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button onClick={handleSaveCategory} color="primary">Lưu</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminCategoryPage;
