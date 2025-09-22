import api from './api';
import * as Models from '../models';

interface TrainModelResponse {
  message: string;
}

const getPersonalizedRecommendations = () => {
  return api.get<Models.Product[]>('/recommendations/');
};

const trainRecommendationModel = () => {
  return api.post<TrainModelResponse>('/recommendations/train');
};

const RecommendationService = {
  getPersonalizedRecommendations,
  trainRecommendationModel,
};

export default RecommendationService;
