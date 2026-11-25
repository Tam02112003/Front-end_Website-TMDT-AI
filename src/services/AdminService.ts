import api from './api';

interface BackupResult {
  file_name: string;
  drive_link: string;
  table_row_counts: Record<string, number>;
}

interface PromoCampaignResult {
  recipients: number;
  products_included: number;
  sent: number;
  failed: number;
}

const AdminService = {
  clearRedisCache: () => {
    return api.post('/admin/clear-redis-cache');
  },
  createBackup: () => {
    return api.post<BackupResult>('/admin/backup');
  },
  sendPromoCampaign: () => {
    return api.post<PromoCampaignResult>('/admin/marketing/send-promo');
  },
};

export default AdminService;
