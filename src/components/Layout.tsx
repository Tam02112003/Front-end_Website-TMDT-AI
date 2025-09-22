import { AppBar, Box, Button, Container, Toolbar, Typography } from '@mui/material';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Chat } from '@mui/icons-material';

const Layout = () => {
  const { isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <Button color="inherit" component={Link} to="/">AI Try-On</Button>
          </Typography>
          <Button color="inherit" component={Link} to="/products">Products</Button>
          <Button color="inherit" component={Link} to="/try-on">Try On</Button>
          <Button color="inherit" component={Link} to="/news">News</Button>
          <Button color="inherit" component={Link} to="/cart">Cart</Button>
          {isLoggedIn && (
            <>
              <Button color="inherit" component={Link} to="/orders">Orders</Button>
              <Button color="inherit" component={Link} to="/profile">Profile</Button>
            </>
          )}
          <Button color="inherit" component={Link} to="/chatbot">
            <Chat sx={{ mr: 0.5 }} /> Chatbot
          </Button>
          
          {isLoggedIn ? (
            <>
              <Typography sx={{ mr: 2 }}>
                Welcome, {user?.username}
              </Typography>
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <Button color="inherit" component={Link} to="/login">
              Login
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <Container component="main" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
        <Outlet />
      </Container>
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          backgroundColor: (theme) =>
            theme.palette.mode === 'light' ? theme.palette.grey[200] : theme.palette.grey[800],
        }}
      >
        <Container maxWidth="sm">
          <Typography variant="body2" color="text.secondary" align="center">
            {'Copyright © '}
            <Link to="/">AI Try-On</Link>{' '}
            {new Date().getFullYear()}
            {'.'}
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;
