import { useState, FormEvent } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Typography, Box, TextField, Button, CircularProgress, Alert, Link, Paper, Container } from '@mui/material';
import AuthService from '../services/AuthService';
import { AutoAwesome, PersonAdd } from '@mui/icons-material';
import '../styles/responsive.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      await AuthService.register({ username, email, password });
      setSuccess('Registration successful! You will be redirected to login.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Registration failed. Please try again.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
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
            Join AI Try-On
          </Typography>
          <Typography variant="body1" className="responsive-body" color="text.secondary">
            Create your account and start your fashion journey
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoComplete="username"
            autoFocus
            className="touch-target"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            value={email}
            className="touch-target"
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
            autoComplete="new-password"
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
          
          {success && (
            <Alert severity="success" sx={{ mb: 3, borderRadius: 2, fontSize: { xs: '0.875rem', md: '1rem' } }}>
              {success}
            </Alert>
          )}
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size={{ xs: 'medium', sm: 'large' }}
            disabled={loading}
            className="touch-target"
            startIcon={loading ? <CircularProgress size={20} /> : <PersonAdd />}
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
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
          
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" className="responsive-body" color="text.secondary">
              Already have an account?{' '}
              <Link 
                component={RouterLink} 
                to="/login" 
                sx={{ 
                  fontWeight: 600,
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                Sign In
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default RegisterPage;