import { AppBar, Box, Button, Container, Toolbar, Typography, Avatar, Menu, MenuItem, IconButton, Badge } from '@mui/material';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Chat, ShoppingCart, AccountCircle, Store, AutoAwesome, Article, Person, ExitToApp } from '@mui/icons-material';
import { useState } from 'react';

const Layout = () => {
  const { isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

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

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar 
        position="static" 
        sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
            {/* Logo */}
            <Typography 
              variant="h5" 
              component="div" 
              sx={{ 
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <Button 
                color="inherit" 
                component={Link} 
                to="/"
                sx={{ 
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                <AutoAwesome sx={{ mr: 1 }} />
                AI Try-On
              </Button>
            </Typography>

            {/* Navigation Links */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button 
                color="inherit" 
                component={Link} 
                to="/products"
                startIcon={<Store />}
                sx={{ 
                  textTransform: 'none',
                  fontWeight: 500,
                  px: 2,
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                Products
              </Button>
              <Button 
                color="inherit" 
                component={Link} 
                to="/try-on"
                startIcon={<AutoAwesome />}
                sx={{ 
                  textTransform: 'none',
                  fontWeight: 500,
                  px: 2,
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                Try On
              </Button>
              <Button 
                color="inherit" 
                component={Link} 
                to="/news"
                startIcon={<Article />}
                sx={{ 
                  textTransform: 'none',
                  fontWeight: 500,
                  px: 2,
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                News
              </Button>
              <Button 
                color="inherit" 
                component={Link} 
                to="/chatbot"
                startIcon={<Chat />}
                sx={{ 
                  textTransform: 'none',
                  fontWeight: 500,
                  px: 2,
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                Chatbot
              </Button>
              
              {/* Cart Button */}
              <IconButton 
                color="inherit" 
                component={Link} 
                to="/cart"
                sx={{ 
                  mx: 1,
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                <Badge color="error">
                  <ShoppingCart />
                </Badge>
              </IconButton>

              {/* User Menu */}
              {isLoggedIn ? (
                <>
                  <IconButton
                    onClick={handleMenuOpen}
                    sx={{ 
                      ml: 1,
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.1)'
                      }
                    }}
                  >
                    <Avatar 
                      sx={{ 
                        width: 32, 
                        height: 32,
                        bgcolor: 'rgba(255,255,255,0.2)',
                        border: '2px solid rgba(255,255,255,0.3)'
                      }}
                    >
                      {user?.username?.charAt(0).toUpperCase()}
                    </Avatar>
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    PaperProps={{
                      sx: {
                        mt: 1,
                        minWidth: 200,
                        borderRadius: 2,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
                      }
                    }}
                  >
                    <MenuItem onClick={handleProfileClick}>
                      <Person sx={{ mr: 2 }} />
                      Profile
                    </MenuItem>
                    <MenuItem onClick={handleOrdersClick}>
                      <ShoppingCart sx={{ mr: 2 }} />
                      Orders
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>
                      <ExitToApp sx={{ mr: 2 }} />
                      Logout
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <Button 
                  color="inherit" 
                  component={Link} 
                  to="/login"
                  variant="outlined"
                  sx={{ 
                    ml: 2,
                    borderColor: 'rgba(255,255,255,0.5)',
                    textTransform: 'none',
                    fontWeight: 500,
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255,255,255,0.1)'
                    }
                  }}
                >
                  Login
                </Button>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Container component="main" sx={{ mt: 4, mb: 4, flexGrow: 1 }} maxWidth="xl">
        <Outlet />
      </Container>

      <Box
        component="footer"
        sx={{
          py: 4,
          px: 2,
          mt: 'auto',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}
      >
        <Container maxWidth="xl">
          <Typography variant="body1" align="center" sx={{ fontWeight: 500 }}>
            {'Copyright © '}
            <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
              AI Try-On
            </Link>{' '}
            {new Date().getFullYear()}
            {'. Experience the future of fashion.'}
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;