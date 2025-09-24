import { useState, FormEvent } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Typography, Box, TextField, Button, CircularProgress, Alert, Link, Divider, Paper, Container } from '@mui/material';
import AuthService from '../services/AuthService';
import { useAuth } from '../context/AuthContext';
import GoogleIcon from '@mui/icons-material/Google';
import { AutoAwesome, Login } from '@mui/icons-material';
import '../styles/responsive.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await AuthService.login({ email, password });
      login(response.data.access_token);
      navigate('/');
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Login failed. Please try again.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://127.0.0.1:8000/auth/login/google';
  };

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 4, md: 8 } }} className="responsive-container">
      <Paper 
        elevation={0}
        sx={{ 
          p: { xs: 3, sm: 4, md: 6 },
          borderRadius: 4,
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
          border: '1px solid rgba(102, 126, 234, 0.2)'
        }}
      >
        <Box sx={{ textAlign: 'center', mb: { xs: 3, md: 4 } }}>
          <AutoAwesome 
            sx={{ 
              fontSize: { xs: 40, md: 48 }, 
              color: 'primary.main',
              mb: 2
            }} 
          />
          <Typography 
            component="h1" 
            className="responsive-heading-1"
            sx={{ 
              fontWeight: 700,
              fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
              background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1
            }}
          >
            Welcome Back
          </Typography>
          <Typography variant="body1" className="responsive-body" color="text.secondary">
            Sign in to continue your fashion journey
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            className="touch-target"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              }
            }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            className="touch-target"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              }
            }}
          />
          
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2, fontSize: { xs: '0.875rem', md: '1rem' } }}>
              {error}
            </Alert>
          )}
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            className="touch-target"
            startIcon={loading ? <CircularProgress size={20} /> : <Login />}
            sx={{ 
              mb: 3,
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: { xs: '1rem', md: '1.1rem' },
              fontWeight: 600,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
              }
            }}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
          
          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" className="responsive-body" color="text.secondary">
              OR
            </Typography>
          </Divider>
          
          <Button
            fullWidth
            variant="outlined"
            size="large"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleLogin}
            className="touch-target"
            sx={{ 
              mb: 3,
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: { xs: '1rem', md: '1.1rem' },
              fontWeight: 600,
              borderColor: 'rgba(102, 126, 234, 0.3)',
              '&:hover': {
                borderColor: 'primary.main',
                backgroundColor: 'rgba(102, 126, 234, 0.05)'
              }
            }}
          >
            Continue with Google
          </Button>
          
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" className="responsive-body" color="text.secondary">
              Don't have an account?{' '}
              <Link 
                component={RouterLink} 
                to="/register" 
                sx={{ 
                  fontWeight: 600,
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                Sign Up
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginPage;