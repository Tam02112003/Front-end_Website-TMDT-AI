import { useEffect, useState } from 'react';
import { Typography, Box, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import CategoryService from '../services/CategoryService';
import { Category } from '../models';

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
      setError('Failed to fetch categories.');
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
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await CategoryService.deleteCategory(categoryId);
        fetchCategories();
      } catch (err) {
        setError('Failed to delete category.');
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
        setError('Failed to save category.');
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
        Manage Categories
      </Typography>
      <Box sx={{ mb: 2 }}>
        <Button variant="contained" onClick={handleCreateClick}>
          Create New Category
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
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>{category.id}</TableCell>
                <TableCell>{category.name}</TableCell>
                <TableCell>
                  <Button variant="contained" size="small" onClick={() => handleEditClick(category)} sx={{ mr: 1 }}>
                    Edit
                  </Button>
                  <Button variant="outlined" color="error" size="small" onClick={() => handleDeleteClick(category.id)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>{isEditing ? 'Edit Category' : 'Create Category'}</DialogTitle>
        <DialogContent>
          {currentCategory && (
            <Box component="form" sx={{ '& .MuiTextField-root': { m: 1, width: '100%' } }}>
              <TextField
                margin="dense"
                name="name"
                label="Name"
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
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveCategory}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminCategoryPage;
