import { AppBar, Box, Button, Container, Toolbar, Typography, Drawer, List, ListItemText, ListItemIcon, CircularProgress, Snackbar, Alert, ListItemButton } from '@mui/material';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingCartOutlined, PeopleOutlined, ArticleOutlined, CategoryOutlined, ModelTrainingOutlined, DiscountOutlined, ImageOutlined, BrandingWatermarkOutlined, DeleteSweepOutlined, KeyboardAltOutlined } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import AdminService from '../services/AdminService';
import { colors } from '../theme';

const drawerWidth = 240;

const navItems = [
  { to: '/admin/orders', label: 'Đơn hàng', icon: ShoppingCartOutlined },
  { to: '/admin/users', label: 'Người dùng', icon: PeopleOutlined },
  { to: '/admin/news', label: 'Tin tức', icon: ArticleOutlined },
  { to: '/admin/products', label: 'Sản phẩm', icon: CategoryOutlined },
  { to: '/admin/brands', label: 'Thương hiệu', icon: BrandingWatermarkOutlined },
  { to: '/admin/categories', label: 'Danh mục', icon: CategoryOutlined },
  { to: '/admin/recommendations', label: 'Gợi ý AI', icon: ModelTrainingOutlined },
  { to: '/admin/discounts', label: 'Khuyến mãi', icon: DiscountOutlined },
  { to: '/admin/images', label: 'Thư viện ảnh', icon: ImageOutlined },
];

const AdminLayout = () => {
  const { isLoggedIn, user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
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
      setSnackbar({ open: true, message: 'Đã xóa Redis cache!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Xóa Redis cache thất bại.', severity: 'error' });
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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: colors.bg }}>
        <CircularProgress sx={{ color: colors.jade }} />
      </Box>
    );
  }

  if (!isLoggedIn || (user && !user.is_admin)) {
    return null; // Should have been redirected by useEffects
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: colors.bg }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar sx={{ gap: 1 }}>
          <KeyboardAltOutlined sx={{ color: colors.jade }} />
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontSize: '1rem' }}>
            TamStore — Quản trị
          </Typography>
          <Button variant="outlined" size="small" sx={{ borderColor: colors.border, color: colors.ink, '&:hover': { borderColor: colors.jade } }} onClick={handleLogout}>
            Đăng xuất
          </Button>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', bgcolor: colors.surface, borderRight: `1px solid ${colors.border}` },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', py: 1 }}>
          <List sx={{ px: 1 }}>
            {navItems.map(({ to, label, icon: Icon }) => {
              const active = location.pathname === to;
              return (
                <ListItemButton
                  key={to}
                  component={Link}
                  to={to}
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                    color: active ? colors.jadeBright : colors.muted,
                    bgcolor: active ? 'rgba(63,163,140,0.12)' : 'transparent',
                    '&:hover': { bgcolor: 'rgba(63,163,140,0.08)', color: colors.ink },
                  }}
                >
                  <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>
                    <Icon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={label} primaryTypographyProps={{ fontSize: '0.9rem' }} />
                </ListItemButton>
              );
            })}
            <ListItemButton onClick={handleClearCache} disabled={clearingCache} sx={{ borderRadius: 1, mt: 1, color: colors.danger, '&:hover': { bgcolor: 'rgba(226,105,91,0.08)' } }}>
              <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>
                {clearingCache ? <CircularProgress size={20} sx={{ color: colors.danger }} /> : <DeleteSweepOutlined fontSize="small" />}
              </ListItemIcon>
              <ListItemText primary="Xóa Redis cache" primaryTypographyProps={{ fontSize: '0.9rem' }} />
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
