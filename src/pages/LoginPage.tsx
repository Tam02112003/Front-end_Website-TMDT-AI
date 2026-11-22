import { useState, FormEvent } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Typography, Box, TextField, Button, CircularProgress, Alert, Link, Divider, Paper, Container } from '@mui/material';
import AuthService from '../services/AuthService';
import { useAuth } from '../context/AuthContext';
import GoogleIcon from '@mui/icons-material/Google';
import { KeyboardAltOutlined, LoginOutlined } from '@mui/icons-material';
import { colors } from '../theme';
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
        setError('Đăng nhập thất bại. Vui lòng thử lại.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_BACKEND_URL}/auth/login/google`;
  };

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 4, md: 8 } }} className="responsive-container">
      <Paper sx={{ p: { xs: 3, sm: 4, md: 6 } }}>
        <Box sx={{ textAlign: 'center', mb: { xs: 3, md: 4 } }}>
          <KeyboardAltOutlined sx={{ fontSize: { xs: 36, md: 44 }, color: colors.jade, mb: 2 }} />
          <Typography component="h1" variant="h4" className="responsive-heading-1" sx={{ mb: 1 }}>
            Chào mừng trở lại
          </Typography>
          <Typography className="responsive-body" sx={{ color: colors.muted }}>
            Đăng nhập để tiếp tục mua sắm tại TamStore
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email"
            name="email"
            autoComplete="email"
            autoFocus
            className="touch-target"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Mật khẩu"
            type="password"
            id="password"
            autoComplete="current-password"
            className="touch-target"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 3 }}
          />

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            className="touch-target"
            startIcon={loading ? <CircularProgress size={20} sx={{ color: '#0D1210' }} /> : <LoginOutlined />}
            sx={{ mb: 3, py: 1.5 }}
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </Button>

          <Divider sx={{ my: 3, borderColor: colors.border }}>
            <Typography variant="body2" sx={{ color: colors.muted }}>HOẶC</Typography>
          </Divider>

          <Button
            fullWidth
            variant="outlined"
            size="large"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleLogin}
            className="touch-target"
            sx={{ mb: 3, py: 1.5, borderColor: colors.border, color: colors.ink, '&:hover': { borderColor: colors.jade } }}
          >
            Đăng nhập với Google
          </Button>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: colors.muted }}>
              Chưa có tài khoản?{' '}
              <Link component={RouterLink} to="/register" sx={{ color: colors.jadeBright, fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                Đăng ký
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginPage;
