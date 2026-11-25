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

export interface PromoCampaignProductItem {
  id: number;
  name: string;
  slug?: string;
  image_url: string;
}

export interface PromoCampaignPreview {
  hero_url: string;
  title: string;
  subtitle: string;
  max_discount?: number;
  products: PromoCampaignProductItem[];
}

const AdminService = {
  clearRedisCache: () => {
    return api.post('/admin/clear-redis-cache');
  },
  createBackup: () => {
    return api.post<BackupResult>('/admin/backup');
  },
  previewPromoCampaign: (title: string, subtitle: string, productIds: number[]) => {
    return api.post<PromoCampaignPreview>('/admin/marketing/promo/preview', { title, subtitle, product_ids: productIds });
  },
  sendPromoCampaign: (preview: PromoCampaignPreview) => {
    return api.post<PromoCampaignResult>('/admin/marketing/promo/send', {
      title: preview.title,
      subtitle: preview.subtitle,
      hero_url: preview.hero_url,
      max_discount: preview.max_discount,
      products: preview.products,
    });
  },
};

export default AdminService;
