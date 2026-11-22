import api from './api';
import { DashboardResponse } from '../types';

const getDashboard = (days: number = 30) => {
  return api.get<DashboardResponse>('/admin/dashboard', { params: { days } });
};

const DashboardService = {
  getDashboard,
};

export default DashboardService;
