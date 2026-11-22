import { useState, FormEvent } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Typography, Box, TextField, Button, CircularProgress, Alert, Link, Paper, Container } from '@mui/material';
import AuthService from '../services/AuthService';
import { KeyboardAltOutlined, PersonAddOutlined } from '@mui/icons-material';
import { colors } from '../theme';
import '../styles/responsive.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
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
      await AuthService.register({ username, full_name: fullName, email, password });
      setSuccess('Đăng ký thành công! Đang chuyển tới trang đăng nhập...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Đăng ký thất bại. Vui lòng thử lại.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 4, md: 8 } }} className="responsive-container">
      <Paper sx={{ p: { xs: 3, sm: 4, md: 6 } }}>
        <Box sx={{ textAlign: 'center', mb: { xs: 3, md: 4 } }}>
          <KeyboardAltOutlined sx={{ fontSize: { xs: 36, md: 44 }, color: colors.jade, mb: 2 }} />
          <Typography component="h1" variant="h4" className="responsive-heading-1" sx={{ mb: 1 }}>
            Tạo tài khoản
          </Typography>
          <Typography className="responsive-body" sx={{ color: colors.muted }}>
            Tham gia TamStore để lưu giỏ hàng và theo dõi đơn hàng
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField margin="normal" required fullWidth id="username" label="Tên đăng nhập" name="username" autoComplete="username" autoFocus className="touch-target" value={username} onChange={(e) => setUsername(e.target.value)} sx={{ mb: 2 }} />
          <TextField margin="normal" required fullWidth id="fullName" label="Họ và tên" name="fullName" autoComplete="name" className="touch-target" value={fullName} onChange={(e) => setFullName(e.target.value)} sx={{ mb: 2 }} />
          <TextField margin="normal" required fullWidth id="email" label="Email" name="email" autoComplete="email" value={email} className="touch-target" onChange={(e) => setEmail(e.target.value)} sx={{ mb: 2 }} />
          <TextField margin="normal" required fullWidth name="password" label="Mật khẩu" type="password" id="password" autoComplete="new-password" className="touch-target" value={password} onChange={(e) => setPassword(e.target.value)} sx={{ mb: 3 }} />

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            disabled={loading}
            className="touch-target"
            startIcon={loading ? <CircularProgress size={20} sx={{ color: '#0D1210' }} /> : <PersonAddOutlined />}
            sx={{ mb: 3, py: 1.5 }}
          >
            {loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
          </Button>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: colors.muted }}>
              Đã có tài khoản?{' '}
              <Link component={RouterLink} to="/login" sx={{ color: colors.jadeBright, fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                Đăng nhập
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default RegisterPage;
