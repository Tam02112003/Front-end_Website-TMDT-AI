import api from './api';

interface NewsCreate {
  title: string;
  content?: string;
  image_url?: string;
  is_active?: boolean;
}

interface NewsUpdate {
  title?: string;
  content?: string;
  image_url?: string;
  is_active?: boolean;
}

interface News {
  id: number;
  title: string;
  content?: string;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface AINewsGenerateRequest {
  topic: string;
  keywords?: string;
  length: string;
}

interface AINewsGenerateResponse {
  title: string;
  content: string;
}

export const createNews = (newsData: NewsCreate) => {
  return api.post<News>('/admin/news', newsData);
};

export const getNews = (searchQuery?: string) => {
  return api.get<News[]>('/admin/news', { params: { search: searchQuery } });
};

export const getNewsById = (newsId: number) => {
  return api.get<News>(`/admin/news/${newsId}`);
};

export const updateNews = (newsId: number, newsData: NewsUpdate) => {
  return api.put<News>(`/admin/news/${newsId}`, newsData);
};

export const deleteNews = (newsId: number) => {
  return api.delete(`/admin/news/${newsId}`);
};

export const getDeletedNews = () => {
  return api.get<News[]>('/admin/news/deleted');
};

export const restoreNews = (newsId: number) => {
  return api.put<News>(`/admin/news/${newsId}/restore`);
};

export const generateAINews = (request: AINewsGenerateRequest) => {
  return api.post<AINewsGenerateResponse>('/admin/news/generate-ai', request);
};
