import api from './api';
import { News } from '../models'; // Assuming News type is defined in models.ts

export const getPublicNews = (searchQuery?: string) => {
  return api.get<News[]>('/news', { params: { search: searchQuery } });
};

export const getPublicNewsById = (newsId: number) => {
  return api.get<News>(`/news/${newsId}`);
};
