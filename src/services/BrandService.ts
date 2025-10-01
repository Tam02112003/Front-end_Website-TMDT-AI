import api from './api';
import { Brand } from '../models';

const getBrands = () => {
  return api.get<Brand[]>('/brands');
};

const createBrand = (brandData: { name: string }) => {
  return api.post<Brand>('/brands', brandData);
};

const updateBrand = (brandId: number, brandData: { name: string }) => {
  return api.put<Brand>(`/brands/${brandId}`, brandData);
};

const deleteBrand = (brandId: number) => {
  return api.delete(`/brands/${brandId}`);
};

const BrandService = {
  getBrands,
  createBrand,
  updateBrand,
  deleteBrand,
};

export default BrandService;