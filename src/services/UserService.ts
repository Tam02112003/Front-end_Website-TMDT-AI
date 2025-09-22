import api from './api';

const getAllUsers = () => {
  return api.get('/admin/users');
};

const getUserById = (userId: number) => {
  return api.get(`/admin/users/${userId}`);
};

const updateUser = (userId: number, userData: any) => {
  return api.put(`/admin/users/${userId}`, userData);
};

const deleteUser = (userId: number) => {
  return api.delete(`/admin/users/${userId}`);
};

const getMe = () => {
  return api.get('/users/me');
};

const updateMe = (userData: any) => {
  return api.put('/users/me', userData);
};

const sendOtp = (phoneNumber: string) => {
  return api.post('/users/send-otp', { phone_number: phoneNumber });
};

const verifyOtp = (phoneNumber: string, otp: string) => {
  return api.post('/users/verify-otp', { phone_number: phoneNumber, otp: otp });
};

const UserService = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getMe,
  updateMe,
  sendOtp,
  verifyOtp,
};

export default UserService;
