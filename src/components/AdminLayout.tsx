import { AppBar, Box, Button, Container, Toolbar, Typography, Drawer, List, ListItem, ListItemText, ListItemIcon, CircularProgress } from '@mui/material';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, People, Article, Category, ModelTraining, Discount, Image, BrandingWatermark } from '@mui/icons-material';
import { useEffect } from 'react';

const drawerWidth = 240;

const AdminLayout = () => {
  const { isLoggedIn, user, logout, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
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
            <ListItem button="true" component={Link} to="/admin/orders">
              <ListItemIcon>
                <ShoppingCart />
              </ListItemIcon>
              <ListItemText primary="Orders" />
            </ListItem>
            <ListItem button="true" component={Link} to="/admin/users">
              <ListItemIcon>
                <People />
              </ListItemIcon>
              <ListItemText primary="Users" />
            </ListItem>
            <ListItem button="true" component={Link} to="/admin/news">
              <ListItemIcon>
                <Article />
              </ListItemIcon>
              <ListItemText primary="News" />
            </ListItem>
            <ListItem button="true" component={Link} to="/admin/products">
              <ListItemIcon>
                <Category />
              </ListItemIcon>
              <ListItemText primary="Products" />
            </ListItem>
            <ListItem button="true" component={Link} to="/admin/brands">
              <ListItemIcon>
                <BrandingWatermark />
              </ListItemIcon>
              <ListItemText primary="Brands" />
            </ListItem>
            <ListItem button="true" component={Link} to="/admin/categories">
              <ListItemIcon>
                <Category />
              </ListItemIcon>
              <ListItemText primary="Categories" />
            </ListItem>
            <ListItem button="true" component={Link} to="/admin/recommendations">
              <ListItemIcon>
                <ModelTraining />
              </ListItemIcon>
              <ListItemText primary="Recommendations" />
            </ListItem>
            <ListItem button="true" component={Link} to="/admin/discounts">
              <ListItemIcon>
                <Discount />
              </ListItemIcon>
              <ListItemText primary="Discounts" />
            </ListItem>
            <ListItem button="true" component={Link} to="/admin/images">
              <ListItemIcon>
                <Image />
              </ListItemIcon>
              <ListItemText primary="Image Gallery" />
            </ListItem>
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Container>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};

export default AdminLayout;
