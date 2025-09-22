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
      setTrainingError(`Failed to trigger training: ${err.response?.data?.detail || err.message}`);
      console.error(err);
    } finally {
      setTrainingLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Recommendation Model Management
      </Typography>
      <Typography variant="body1" paragraph>
        Trigger the training of the personalized recommendation model. This is a background task and may take some time.
      </Typography>
      <Button 
        variant="contained" 
        onClick={handleTrainModel} 
        disabled={trainingLoading}
      >
        {trainingLoading ? <CircularProgress size={24} /> : 'Train Recommendation Model'}
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
