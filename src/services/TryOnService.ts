import api from './api';

interface TryOnRequest {
  product_image_url: string;
  user_image_base64: string;
}

interface TryOnResponse {
  result_image_url?: string;
  detail?: any; // For error details from FastAPI/external API
  error?: string; // For generic error messages
  status_code?: number; // For HTTP status code in error responses
}

export const performTryOn = async (request: TryOnRequest) => {
  const response = await api.post<TryOnResponse>('/tryon/', request);
  return response.data;
};
