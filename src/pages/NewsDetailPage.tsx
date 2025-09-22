import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Box, CircularProgress, Alert, Paper, CardMedia } from '@mui/material';
import { getPublicNewsById } from '../services/NewsServicePublic';
import { News } from '../types';

const NewsDetailPage = () => {
  const { newsId } = useParams<{ newsId: string }>();
  const [newsArticle, setNewsArticle] = useState<News | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNewsArticle = async () => {
      if (!newsId) {
        setError('News ID is missing.');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await getPublicNewsById(parseInt(newsId));
        setNewsArticle(response.data);
      } catch (err) {
        setError('Failed to fetch news article.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNewsArticle();
  }, [newsId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!newsArticle) {
    return <Alert severity="info">News article not found.</Alert>;
  }

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Typography variant="h4" gutterBottom>
        {newsArticle.title}
      </Typography>
      {newsArticle.image_url && (
        <CardMedia
          component="img"
          image={newsArticle.image_url}
          alt={newsArticle.title}
          sx={{ maxHeight: 400, objectFit: 'cover', mb: 2 }}
        />
      )}
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Published: {new Date(newsArticle.created_at).toLocaleDateString()}
      </Typography>
      <Typography variant="body1" paragraph>
        {newsArticle.content}
      </Typography>
    </Paper>
  );
};

export default NewsDetailPage;
