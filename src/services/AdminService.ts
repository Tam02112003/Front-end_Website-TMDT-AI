import api from './api';

interface BackupResult {
  file_name: string;
  drive_link: string;
  table_row_counts: Record<string, number>;
}

const AdminService = {
  clearRedisCache: () => {
    return api.post('/admin/clear-redis-cache');
  },
  createBackup: () => {
    return api.post<BackupResult>('/admin/backup');
  },
};

export default AdminService;
