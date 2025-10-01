import api from './api';
import { Category } from '../models';

const getCategories = () => {
  return api.get<Category[]>('/categories');
};

const createCategory = (categoryData: { name: string }) => {
  return api.post<Category>('/categories', categoryData);
};

const updateCategory = (categoryId: number, categoryData: { name: string }) => {
  return api.put<Category>(`/categories/${categoryId}`, categoryData);
};

const deleteCategory = (categoryId: number) => {
  return api.delete(`/categories/${categoryId}`);
};

const CategoryService = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};

export default CategoryService;