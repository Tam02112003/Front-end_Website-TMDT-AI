import { AppBar, Box, Button, Container, Toolbar, Typography, Avatar, Menu, MenuItem, IconButton, Badge, Divider } from '@mui/material';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingCartOutlined, KeyboardAltOutlined, ArticleOutlined, PersonOutline, LogoutOutlined, MenuOutlined, FavoriteBorderOutlined } from '@mui/icons-material';
import { useState } from 'react';
import '../styles/responsive.css';
import Chatbot from './Chatbot';
import { colors } from '../theme';

const navLinkSx = {
  textTransform: 'none',
  fontWeight: 500,
  color: colors.muted,
  px: 2,
  borderRadius: 1,
  '&:hover': {
    color: colors.ink,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
};

const Layout = () => {
  const { isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setAnchorEl(null);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    navigate('/profile');
    setAnchorEl(null);
  };

  const handleOrdersClick = () => {
    navigate('/orders');
    setAnchorEl(null);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: colors.bg }}>
      <AppBar position="static">
        <Container maxWidth="xl" className="responsive-container">
          <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
            <Button
              color="inherit"
              component={Link}
              to="/"
              sx={{
                fontFamily: '"IBM Plex Mono", monospace',
                fontSize: '1.15rem',
                fontWeight: 700,
                textTransform: 'none',
                color: colors.ink,
                gap: 1,
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.04)' },
              }}
            >
              <KeyboardAltOutlined sx={{ color: colors.jade }} />
              TamStore
            </Button>

            <IconButton
              onClick={toggleMobileMenu}
              sx={{ display: { xs: 'block', md: 'none' }, color: colors.ink }}
            >
              <MenuOutlined />
            </IconButton>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button component={Link} to="/products" startIcon={<KeyboardAltOutlined />} sx={{ ...navLinkSx, display: { xs: 'none', md: 'flex' } }}>
                Sản phẩm
              </Button>
              <Button component={Link} to="/news" startIcon={<ArticleOutlined />} sx={{ ...navLinkSx, display: { xs: 'none', md: 'flex' } }}>
                Tin tức
              </Button>

              <IconButton component={Link} to="/wishlist" className="touch-target" sx={{ mx: 0.5, display: { xs: 'none', sm: 'flex' }, color: colors.ink }}>
                <Badge color="secondary">
                  <FavoriteBorderOutlined />
                </Badge>
              </IconButton>

              <IconButton component={Link} to="/cart" className="touch-target" sx={{ mx: 1, display: { xs: 'none', sm: 'flex' }, color: colors.ink }}>
                <Badge color="secondary">
                  <ShoppingCartOutlined />
                </Badge>
              </IconButton>

              {isLoggedIn ? (
                <>
                  <IconButton className="touch-target" onClick={handleMenuOpen} sx={{ ml: 1 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: colors.jade, color: '#0D1210', fontFamily: '"IBM Plex Mono", monospace', fontWeight: 700 }}>
                      {user?.username?.charAt(0).toUpperCase()}
                    </Avatar>
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    PaperProps={{
                      sx: { mt: 1, minWidth: 200, bgcolor: colors.surfaceRaised, border: `1px solid ${colors.border}` },
                    }}
                  >
                    <MenuItem onClick={handleProfileClick}><PersonOutline sx={{ mr: 2 }} fontSize="small" />Hồ sơ</MenuItem>
                    <MenuItem onClick={handleOrdersClick}><ShoppingCartOutlined sx={{ mr: 2 }} fontSize="small" />Đơn hàng</MenuItem>
                    <Divider sx={{ borderColor: colors.border }} />
                    <MenuItem onClick={handleLogout}><LogoutOutlined sx={{ mr: 2 }} fontSize="small" />Đăng xuất</MenuItem>
                  </Menu>
                </>
              ) : (
                <Button component={Link} to="/login" variant="outlined" color="primary" className="touch-target" sx={{ ml: 1 }}>
                  Đăng nhập
                </Button>
              )}
            </Box>
          </Toolbar>
        </Container>

        <Box sx={{ display: { xs: mobileMenuOpen ? 'block' : 'none', md: 'none' }, borderTop: `1px solid ${colors.border}` }}>
          <Container maxWidth="xl" className="responsive-container">
            <Box sx={{ py: 1 }}>
              <Button component={Link} to="/products" fullWidth startIcon={<KeyboardAltOutlined />} onClick={() => setMobileMenuOpen(false)} sx={{ ...navLinkSx, justifyContent: 'flex-start', py: 1.5, mb: 1 }}>
                Sản phẩm
              </Button>
              <Button component={Link} to="/news" fullWidth startIcon={<ArticleOutlined />} onClick={() => setMobileMenuOpen(false)} sx={{ ...navLinkSx, justifyContent: 'flex-start', py: 1.5, mb: 1 }}>
                Tin tức
              </Button>
              <Button component={Link} to="/wishlist" fullWidth startIcon={<FavoriteBorderOutlined />} onClick={() => setMobileMenuOpen(false)} sx={{ ...navLinkSx, justifyContent: 'flex-start', py: 1.5, mb: 1 }}>
                Yêu thích
              </Button>
            </Box>
          </Container>
        </Box>
      </AppBar>

      <Container component="main" sx={{ mt: 4, mb: 4, flexGrow: 1 }} maxWidth="xl" className="responsive-container">
        <Outlet />
      </Container>

      <Chatbot />

      <Box component="footer" sx={{ py: 5, px: 2, mt: 'auto', borderTop: `1px solid ${colors.border}`, bgcolor: colors.surface }}>
        <Container maxWidth="xl" className="responsive-container">
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 4, md: 6 }, mb: 4 }}>
            <Box sx={{ flex: '1 1 220px', minWidth: 200 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <KeyboardAltOutlined sx={{ color: colors.jade }} />
                <Typography sx={{ fontFamily: '"IBM Plex Mono", monospace', fontWeight: 700, color: colors.ink }}>
                  TamStore
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: colors.muted, maxWidth: 280 }}>
                Bàn phím cơ, switch và keycap tuyển chọn cho dân văn phòng, game thủ và người mê gõ phím.
              </Typography>
            </Box>

            <Box sx={{ flex: '1 1 160px', minWidth: 140 }}>
              <Typography variant="subtitle2" sx={{ color: colors.ink, fontWeight: 600, mb: 1.5 }}>
                Mua sắm
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Link to="/products" style={{ color: colors.muted, textDecoration: 'none' }}>Sản phẩm</Link>
                <Link to="/news" style={{ color: colors.muted, textDecoration: 'none' }}>Tin tức</Link>
                <Link to="/try-on" style={{ color: colors.muted, textDecoration: 'none' }}>Thử ghép AI</Link>
                <Link to="/wishlist" style={{ color: colors.muted, textDecoration: 'none' }}>Yêu thích</Link>
              </Box>
            </Box>

            <Box sx={{ flex: '1 1 160px', minWidth: 140 }}>
              <Typography variant="subtitle2" sx={{ color: colors.ink, fontWeight: 600, mb: 1.5 }}>
                Tài khoản
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Link to="/cart" style={{ color: colors.muted, textDecoration: 'none' }}>Giỏ hàng</Link>
                <Link to="/orders" style={{ color: colors.muted, textDecoration: 'none' }}>Đơn hàng</Link>
                <Link to="/login" style={{ color: colors.muted, textDecoration: 'none' }}>Đăng nhập</Link>
                <Link to="/register" style={{ color: colors.muted, textDecoration: 'none' }}>Đăng ký</Link>
              </Box>
            </Box>
          </Box>

          <Divider sx={{ borderColor: colors.border, mb: 2 }} />

          <Typography variant="body2" align="center" sx={{ color: colors.muted }}>
            {'© '}
            <Link to="/" style={{ color: colors.muted, textDecoration: 'none' }}>TamStore</Link>{' '}
            {new Date().getFullYear()}
            {' — Bàn phím cơ & phụ kiện cho dân gõ phím.'}
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;
