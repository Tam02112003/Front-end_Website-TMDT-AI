import { AppBar, Box, Button, Container, Toolbar, Typography, Drawer, List, ListItemText, ListItemIcon, CircularProgress, Snackbar, Alert, ListItemButton } from '@mui/material';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, People, Article, Category, ModelTraining, Discount, Image, BrandingWatermark, DeleteSweep } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import AdminService from '../services/AdminService';

const drawerWidth = 240;

const AdminLayout = () => {
  const { isLoggedIn, user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [clearingCache, setClearingCache] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' } | null>(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleClearCache = async () => {
    setClearingCache(true);
    try {
      await AdminService.clearRedisCache();
      setSnackbar({ open: true, message: 'Redis cache cleared successfully!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to clear Redis cache.', severity: 'error' });
    }
    setClearingCache(false);
  };

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      navigate('/login');
    }
  }, [loading, isLoggedIn, navigate]);

  useEffect(() => {
    if (!loading && isLoggedIn && user && !user.is_admin) {
      navigate('/');
    }
  }, [loading, isLoggedIn, user, navigate]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isLoggedIn || (user && !user.is_admin)) {
    return null; // Should have been redirected by useEffects
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Admin Dashboard
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            <ListItemButton component={Link} to="/admin/orders">
              <ListItemIcon>
                <ShoppingCart />
              </ListItemIcon>
              <ListItemText primary="Orders" />
            </ListItemButton>
            <ListItemButton component={Link} to="/admin/users">
              <ListItemIcon>
                <People />
              </ListItemIcon>
              <ListItemText primary="Users" />
            </ListItemButton>
            <ListItemButton component={Link} to="/admin/news">
              <ListItemIcon>
                <Article />
              </ListItemIcon>
              <ListItemText primary="News" />
            </ListItemButton>
            <ListItemButton component={Link} to="/admin/products">
              <ListItemIcon>
                <Category />
              </ListItemIcon>
              <ListItemText primary="Products" />
            </ListItemButton>
            <ListItemButton component={Link} to="/admin/brands">
              <ListItemIcon>
                <BrandingWatermark />
              </ListItemIcon>
              <ListItemText primary="Brands" />
            </ListItemButton>
            <ListItemButton component={Link} to="/admin/categories">
              <ListItemIcon>
                <Category />
              </ListItemIcon>
              <ListItemText primary="Categories" />
            </ListItemButton>
            <ListItemButton component={Link} to="/admin/recommendations">
              <ListItemIcon>
                <ModelTraining />
              </ListItemIcon>
              <ListItemText primary="Recommendations" />
            </ListItemButton>
            <ListItemButton component={Link} to="/admin/discounts">
              <ListItemIcon>
                <Discount />
              </ListItemIcon>
              <ListItemText primary="Discounts" />
            </ListItemButton>
            <ListItemButton component={Link} to="/admin/images">
              <ListItemIcon>
                <Image />
              </ListItemIcon>
              <ListItemText primary="Image Gallery" />
            </ListItemButton>
            <ListItemButton onClick={handleClearCache} disabled={clearingCache}>
              <ListItemIcon>
                {clearingCache ? <CircularProgress size={24} /> : <DeleteSweep />}
              </ListItemIcon>
              <ListItemText primary="Clear Redis Cache" />
            </ListItemButton>
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Container>
          <Outlet />
        </Container>
      </Box>
      {snackbar && (
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={() => setSnackbar(null)} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      )}
    </Box>
  );
};

export default AdminLayout;
