import { useEffect, useState } from 'react';
import { Typography, Box, CircularProgress, Alert, Paper, TextField, Button } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import UserService from '../services/UserService';

import ImageUploader from '../components/ImageUploader';

const ProfilePage = () => {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    phone_number: '',
    avatar_url: '',
  });
  const [originalPhoneNumber, setOriginalPhoneNumber] = useState<string>('');

  const [otp, setOtp] = useState<string>('');
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otpVerified, setOtpVerified] = useState<boolean>(false);
  const [otpLoading, setOtpLoading] = useState<boolean>(false);
  const [otpError, setOtpError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await UserService.getMe();
        setUser(response.data);
        setFormData({
          phone_number: response.data.phone_number || '',
          avatar_url: response.data.avatar_url || '',
        });
        setOriginalPhoneNumber(response.data.phone_number || '');
      } catch (err) {
        setError('Failed to fetch user data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
        setFormData({
          phone_number: user.phone_number || '',
          avatar_url: user.avatar_url || '',
        });
        setOriginalPhoneNumber(user.phone_number || '');
        setLoading(false);
    } else {
        fetchUser();
    }
  }, [user, setUser]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'phone_number') {
      setOtpSent(false);
      setOtpVerified(false);
      setOtpError(null);
    }
  };

  const handleImageUpload = (urls: string[]) => {
    setFormData((prev) => ({ ...prev, avatar_url: urls.length > 0 ? urls[0] : '' }));
  };

  const handleSendOtp = async () => {
    if (!formData.phone_number) {
      setOtpError('Please enter a phone number.');
      return;
    }
    setOtpLoading(true);
    setOtpError(null);
    try {
      await UserService.sendOtp(formData.phone_number);
      setOtpSent(true);
      alert('OTP sent to your phone number.');
    } catch (err: any) {
      setOtpError(err.response?.data?.detail || 'Failed to send OTP.');
      console.error(err);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      setOtpError('Please enter the OTP.');
      return;
    }
    setOtpLoading(true);
    setOtpError(null);
    try {
      await UserService.verifyOtp(formData.phone_number, otp);
      setOtpVerified(true);
      setOriginalPhoneNumber(formData.phone_number); // Update original phone number after successful verification
      alert('Phone number verified and updated successfully!');
    } catch (err: any) {
      setOtpError(err.response?.data?.detail || 'Failed to verify OTP.');
      console.error(err);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if phone number changed and is not verified
    if (formData.phone_number !== originalPhoneNumber && !otpVerified) {
      setError('Please verify your new phone number with OTP.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await UserService.updateMe(formData);
      setUser(response.data);
      setOriginalPhoneNumber(response.data.phone_number || ''); // Update original phone number
      setOtpVerified(false); // Reset OTP verification status
      alert('Profile updated successfully!');
    } catch (err) {
      setError('Failed to update profile.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Your Profile
      </Typography>
      {user && (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Username"
            value={user.username}
            disabled
            margin="normal"
          />
          <TextField
            fullWidth
            label="Email"
            value={user.email}
            disabled
            margin="normal"
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2, mb: 1 }}>
            <TextField
              fullWidth
              label="Phone Number"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleInputChange}
              margin="none"
              disabled={otpVerified}
            />
            {formData.phone_number !== originalPhoneNumber && !otpVerified && (
              <Button
                variant="outlined"
                onClick={handleSendOtp}
                disabled={otpLoading || !formData.phone_number}
              >
                {otpLoading ? <CircularProgress size={24} /> : 'Send OTP'}
              </Button>
            )}
            {otpVerified && (
              <Typography variant="body2" color="success.main">
                Verified
              </Typography>
            )}
          </Box>
          {otpError && <Alert severity="error" sx={{ mb: 2 }}>{otpError}</Alert>}

          {otpSent && !otpVerified && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <TextField
                fullWidth
                label="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                margin="normal"
              />
              <Button
                variant="contained"
                onClick={handleVerifyOtp}
                disabled={otpLoading || !otp}
              >
                {otpLoading ? <CircularProgress size={24} /> : 'Verify OTP'}
              </Button>
            </Box>
          )}

          <ImageUploader onImageUpload={handleImageUpload} initialImageUrls={formData.avatar_url ? [formData.avatar_url] : []} />
          <Button type="submit" variant="contained" sx={{ mt: 2 }} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Save Changes'}
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default ProfilePage;
