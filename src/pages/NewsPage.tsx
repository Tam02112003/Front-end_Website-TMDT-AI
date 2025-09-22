import { useEffect, useState } from 'react';
import { Typography, Box, CircularProgress, Alert, Grid, Card, CardContent, TextField, InputAdornment, CardMedia } from '@mui/material';
import { getPublicNews } from '../services/NewsServicePublic';
import { News } from '../types';
import { Link } from 'react-router-dom';

const NewsPage = () => {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const fetchNews = async (query: string = '') => {
      try {
        setLoading(true);
        const response = await getPublicNews(query);
        setNews(response.data);
      } catch (err) {
        setError('Failed to fetch news.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const handler = setTimeout(() => {
      fetchNews(searchQuery);
    }, 400);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        News & Updates
      </Typography>
      <TextField
        label="Search News"
        variant="outlined"
        fullWidth
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              {loading && <CircularProgress size={20} />}
            </InputAdornment>
          ),
        }}
      />
      {news.length === 0 && !loading ? (
        <Typography>No news articles found.</Typography>
      ) : (
        <Grid container spacing={3}>
          {news.map((article) => (
            <Grid item xs={12} sm={6} md={4} key={article.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Link to={`/news/${article.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  {article.image_url && (
                    <CardMedia
                      component="img"
                      height="140"
                      image={article.image_url}
                      alt={article.title}
                    />
                  )}
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="div">
                      {article.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(article.created_at).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                </Link>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default NewsPage;
