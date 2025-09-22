import api from './api';
import type { UserLogin, UserCreate } from '../models';

const login = (credentials: UserLogin) => {
  return api.post('/auth/login', credentials);
};

const register = (userData: UserCreate) => {
  return api.post('/auth/register', userData);
};

const AuthService = {
  login,
  register,
};

export default AuthService;