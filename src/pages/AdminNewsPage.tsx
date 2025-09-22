import { useEffect, useState } from 'react';
import { Typography, Box, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Switch, FormControlLabel, Select, MenuItem } from '@mui/material';
import { getNews, createNews, updateNews, deleteNews, generateAINews, getDeletedNews, restoreNews } from '../services/NewsService';
import ImageUploader from '../components/ImageUploader';

interface News {
  id: number;
  title: string;
  content?: string;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const AdminNewsPage = () => {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [currentNews, setCurrentNews] = useState<News | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [showDeleted, setShowDeleted] = useState<boolean>(false);

  const [openAIDialog, setOpenAIDialog] = useState<boolean>(false);
  const [aiTopic, setAiTopic] = useState<string>('');
  const [aiKeywords, setAiKeywords] = useState<string>('');
  const [aiLength, setAiLength] = useState<string>('vừa phải');
  const [aiGeneratedContent, setAiGeneratedContent] = useState<{ title: string; content: string } | null>(null);
  const [aiGenerating, setAiGenerating] = useState<boolean>(false);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = showDeleted ? await getDeletedNews() : await getNews();
      setNews(response.data);
    } catch (err) {
      setError('Failed to fetch news.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [showDeleted]);

  const handleCreateClick = () => {
    setCurrentNews({ id: 0, title: '', content: '', image_url: '', is_active: true, created_at: '', updated_at: '' });
    setIsEditing(false);
    setOpenDialog(true);
  };

  const handleEditClick = (newsItem: News) => {
    setCurrentNews(newsItem);
    setIsEditing(true);
    setOpenDialog(true);
  };

  const handleDeleteClick = async (newsId: number) => {
    if (window.confirm('Are you sure you want to delete this news item?')) {
      try {
        await deleteNews(newsId);
        fetchNews();
      } catch (err) {
        setError('Failed to delete news item.');
        console.error(err);
      }
    }
  };

  const handleRestoreClick = async (newsId: number) => {
    if (window.confirm('Are you sure you want to restore this news item?')) {
      try {
        await restoreNews(newsId);
        fetchNews();
      } catch (err) {
        setError('Failed to restore news item.');
        console.error(err);
      }
    }
  };

  const handleSaveNews = async () => {
    if (currentNews) {
      try {
        if (isEditing) {
          await updateNews(currentNews.id, currentNews);
        } else {
          await createNews(currentNews);
        }
        setOpenDialog(false);
        fetchNews();
      } catch (err) {
        setError('Failed to save news item.');
        console.error(err);
      }
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentNews(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, checked, type } = e.target;
    setCurrentNews((prevNews) => {
      if (prevNews) {
        return { ...prevNews, [name]: type === 'checkbox' ? checked : value };
      }
      return null;
    });
  };

  const handleImageUpload = (url: string) => {
    setCurrentNews((prevNews) => {
      if (prevNews) {
        return { ...prevNews, image_url: url };
      }
      return null;
    });
  };

  const handleGenerateAINews = async () => {
    setAiGenerating(true);
    setAiGeneratedContent(null);
    try {
      const response = await generateAINews({
        topic: aiTopic,
        keywords: aiKeywords,
        length: aiLength,
      });
      setAiGeneratedContent(response.data);
    } catch (err) {
      setError('Failed to generate AI news.');
      console.error(err);
    } finally {
      setAiGenerating(false);
    }
  };

  const handleUseGeneratedContent = () => {
    if (aiGeneratedContent) {
      setCurrentNews({
        id: 0,
        title: aiGeneratedContent.title,
        content: aiGeneratedContent.content,
        image_url: '',
        is_active: true,
        created_at: '',
        updated_at: '',
      });
      setIsEditing(false);
      setOpenAIDialog(false);
      setOpenDialog(true); // Open the main news dialog with generated content
    }
  };

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

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Manage News
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
        <Button variant="contained" onClick={handleCreateClick} disabled={showDeleted}>
          Create New News
        </Button>
        <Button variant="outlined" onClick={() => setOpenAIDialog(true)} disabled={showDeleted}>
          Generate News with AI
        </Button>
        <FormControlLabel
          control={
            <Switch
              checked={showDeleted}
              onChange={(e) => setShowDeleted(e.target.checked)}
              name="showDeleted"
              color="primary"
            />
          }
          label="Show Deleted"
        />
      </Box>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Active</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Updated At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {news.map((newsItem) => (
              <TableRow key={newsItem.id}>
                <TableCell>{newsItem.id}</TableCell>
                <TableCell>{newsItem.title}</TableCell>
                <TableCell>{newsItem.is_active ? 'Yes' : 'No'}</TableCell>
                <TableCell>{new Date(newsItem.created_at).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(newsItem.updated_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  {<Button variant="contained" size="small" onClick={() => handleEditClick(newsItem)} sx={{ mr: 1 }}>
                      Edit
                    </Button>}
                  {showDeleted ? (
                    <Button variant="contained" color="success" size="small" onClick={() => handleRestoreClick(newsItem.id)}>
                      Restore
                    </Button>
                  ) : (
                    <Button variant="outlined" color="error" size="small" onClick={() => handleDeleteClick(newsItem.id)}>
                      Delete
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogTitle>{isEditing ? 'Edit News' : 'Create News'}</DialogTitle>
        <DialogContent>
          {currentNews && (
            <Box component="form" sx={{ '& .MuiTextField-root': { m: 1, width: '100%' } }}>
              <TextField
                margin="dense"
                name="title"
                label="Title"
                type="text"
                fullWidth
                variant="standard"
                value={currentNews.title}
                onChange={handleInputChange}
              />
              <TextField
                margin="dense"
                name="content"
                label="Content"
                type="text"
                fullWidth
                multiline
                rows={4}
                variant="standard"
                value={currentNews.content}
                onChange={handleInputChange}
              />
              <ImageUploader onImageUpload={handleImageUpload} initialImageUrl={currentNews.image_url} />
              <FormControlLabel
                control={
                  <Switch
                    checked={currentNews.is_active}
                    onChange={handleInputChange}
                    name="is_active"
                    color="primary"
                  />
                }
                label="Is Active"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveNews}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openAIDialog} onClose={() => setOpenAIDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>Generate News with AI</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Topic"
            type="text"
            fullWidth
            value={aiTopic}
            onChange={(e) => setAiTopic(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Keywords (optional)"
            type="text"
            fullWidth
            value={aiKeywords}
            onChange={(e) => setAiKeywords(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Select
            value={aiLength}
            onChange={(e) => setAiLength(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          >
            <MenuItem value="ngắn">Ngắn</MenuItem>
            <MenuItem value="vừa phải">Vừa phải</MenuItem>
            <MenuItem value="dài">Dài</MenuItem>
          </Select>
          <Button variant="contained" onClick={handleGenerateAINews} disabled={aiGenerating}>
            {aiGenerating ? <CircularProgress size={24} /> : 'Generate'}
          </Button>
          {aiGeneratedContent && (
            <Box sx={{ mt: 3, p: 2, border: '1px solid #ccc', borderRadius: '4px' }}>
              <Typography variant="h6">Generated Title:</Typography>
              <Typography>{aiGeneratedContent.title}</Typography>
              <Typography variant="h6" sx={{ mt: 2 }}>Generated Content:</Typography>
              <Typography sx={{ whiteSpace: 'pre-wrap' }}>{aiGeneratedContent.content}</Typography>
              <Button variant="contained" sx={{ mt: 2 }} onClick={handleUseGeneratedContent}>
                Use This Content
              </Button>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAIDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminNewsPage;
