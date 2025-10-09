import api from './api';

interface DiscountCreate {
  name: string;
  percent: number;
  start_date?: string;
  end_date?: string;
  product_id?: number;
  is_active?: boolean;
}

interface DiscountUpdate {
  name?: string;
  percent?: number;
  start_date?: string;
  end_date?: string;
  product_id?: number;
  is_active?: boolean;
}

interface Discount {
  id: number;
  name: string;
  percent: number;
  start_date?: string;
  end_date?: string;
  product_id?: number;
  is_active: boolean;
}

const createDiscount = (discountData: DiscountCreate) => {
  return api.post<Discount>('/admin/discounts', discountData);
};

const getAllDiscounts = (is_active?: boolean, include_expired: boolean = false) => {
  let url = '/discounts';
  const params = new URLSearchParams();
  if (is_active !== undefined) {
    params.append('is_active', is_active.toString());
  }
  if (include_expired) {
    params.append('include_expired', 'true');
  }
  if (params.toString()) {
    url += `?${params.toString()}`;
  }
  return api.get<Discount[]>(url);
};

const getActiveDiscounts = () => {
  return api.get<Discount[]>('/discounts/active');
};

const getDiscountById = (discountId: number) => {
  return api.get<Discount>(`/admin/discounts/${discountId}`);
};

const updateDiscount = (discountId: number, discountData: DiscountUpdate) => {
  return api.put<Discount>(`/admin/discounts/${discountId}`, discountData);
};

const deleteDiscount = (discountId: number) => {
  return api.delete(`/admin/discounts/${discountId}`);
};

const getDeletedDiscounts = () => {
  return api.get<Discount[]>('/admin/discounts/deleted');
};

const restoreDiscount = (discountId: number) => {
  return api.put<Discount>(`/admin/discounts/${discountId}/restore`);
};

const DiscountService = {
  createDiscount,
  getAllDiscounts,
  getDiscountById,
  updateDiscount,
  deleteDiscount,
  getDeletedDiscounts,
  restoreDiscount,
};

export default DiscountService;
