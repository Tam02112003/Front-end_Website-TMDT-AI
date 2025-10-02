import api from './api';

const AdminService = {
  clearRedisCache: () => {
    return api.post('/admin/clear-redis-cache');
  },
};

export default AdminService;
