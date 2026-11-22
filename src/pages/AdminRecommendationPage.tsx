import { useState } from 'react';
import { Typography, Box, Button, CircularProgress, Alert } from '@mui/material';
import RecommendationService from '../services/RecommendationService';

const AdminRecommendationPage = () => {
  const [trainingStatus, setTrainingStatus] = useState<string | null>(null);
  const [trainingLoading, setTrainingLoading] = useState<boolean>(false);
  const [trainingError, setTrainingError] = useState<string | null>(null);

  const handleTrainModel = async () => {
    setTrainingLoading(true);
    setTrainingStatus(null);
    setTrainingError(null);
    try {
      const response = await RecommendationService.trainRecommendationModel();
      setTrainingStatus(response.data.message);
    } catch (err: any) {
      setTrainingError(`Kích hoạt huấn luyện thất bại: ${err.response?.data?.detail || err.message}`);
      console.error(err);
    } finally {
      setTrainingLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Mô hình gợi ý AI
      </Typography>
      <Typography variant="body1" paragraph>
        Kích hoạt huấn luyện lại mô hình gợi ý cá nhân hóa. Đây là tác vụ chạy nền và có thể mất một lúc.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={handleTrainModel}
        disabled={trainingLoading}
      >
        {trainingLoading ? <CircularProgress size={24} sx={{ color: '#0D1210' }} /> : 'Huấn luyện mô hình'}
      </Button>
      {trainingStatus && (
        <Alert severity="success" sx={{ mt: 2 }}>
          {trainingStatus}
        </Alert>
      )}
      {trainingError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {trainingError}
        </Alert>
      )}
    </Box>
  );
};

export default AdminRecommendationPage;
