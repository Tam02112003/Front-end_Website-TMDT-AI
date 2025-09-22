import api from './api';
import { News } from '../types'; // Assuming News type is defined in types.ts

export const getPublicNews = (searchQuery?: string) => {
  return api.get<News[]>('/news', { params: { search: searchQuery } });
};

export const getPublicNewsById = (newsId: number) => {
  return api.get<News>(`/news/${newsId}`);
};
