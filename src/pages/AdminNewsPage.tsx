import { useEffect, useState } from 'react';
import { Typography, Box, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Switch, FormControlLabel, Select, MenuItem } from '@mui/material';
import { getNews, createNews, updateNews, deleteNews, generateAINews, getDeletedNews, restoreNews } from '../services/NewsService';
import ImageUploader from '../components/ImageUploader';
import RichTextEditor from '../components/RichTextEditor';
import { News } from '../models';
import { colors } from '../theme';

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
      setError('Không tải được danh sách tin tức.');
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
    if (window.confirm('Xóa tin này?')) {
      try {
        await deleteNews(newsId);
        fetchNews();
      } catch (err) {
        setError('Xóa tin thất bại.');
        console.error(err);
      }
    }
  };

  const handleRestoreClick = async (newsId: number) => {
    if (window.confirm('Khôi phục tin này?')) {
      try {
        await restoreNews(newsId);
        fetchNews();
      } catch (err) {
        setError('Khôi phục tin thất bại.');
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
        setError('Lưu tin thất bại.');
        console.error(err);
      }
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentNews(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentNews((prevNews) => {
      if (prevNews) {
        return { ...prevNews, [name]: value };
      }
      return null;
    });
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setCurrentNews((prevNews) => {
      if (prevNews) {
        return { ...prevNews, [name]: checked };
      }
      return null;
    });
  };

  const handleImageUpload = (urls: string[]) => {
    setCurrentNews((prevNews) => {
      if (prevNews) {
        return { ...prevNews, image_url: urls.length > 0 ? urls[0] : undefined };
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
      setError('Tạo tin bằng AI thất bại.');
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
        Quản lý tin tức
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
        <Button variant="contained" color="primary" onClick={handleCreateClick} disabled={showDeleted}>
          Thêm tin tức
        </Button>
        <Button variant="outlined" onClick={() => setOpenAIDialog(true)} disabled={showDeleted} sx={{ borderColor: colors.border, color: colors.ink }}>
          Tạo tin bằng AI
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
          label="Hiện đã xóa"
        />
      </Box>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Tiêu đề</TableCell>
              <TableCell>Active</TableCell>
              <TableCell>Ngày tạo</TableCell>
              <TableCell>Cập nhật</TableCell>
              <TableCell>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {news.map((newsItem) => (
              <TableRow key={newsItem.id}>
                <TableCell>{newsItem.id}</TableCell>
                <TableCell>{newsItem.title}</TableCell>
                <TableCell>{newsItem.is_active ? 'Có' : 'Không'}</TableCell>
                <TableCell>{new Date(newsItem.created_at).toLocaleDateString('vi-VN')}</TableCell>
                <TableCell>{new Date(newsItem.updated_at).toLocaleDateString('vi-VN')}</TableCell>
                <TableCell>
                  {<Button variant="contained" color="primary" size="small" onClick={() => handleEditClick(newsItem)} sx={{ mr: 1 }}>
                      Sửa
                    </Button>}
                  {showDeleted ? (
                    <Button variant="contained" color="success" size="small" onClick={() => handleRestoreClick(newsItem.id)}>
                      Khôi phục
                    </Button>
                  ) : (
                    <Button variant="outlined" size="small" onClick={() => handleDeleteClick(newsItem.id)} sx={{ borderColor: 'error.main', color: 'error.main' }}>
                      Xóa
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogTitle>{isEditing ? 'Sửa tin tức' : 'Thêm tin tức'}</DialogTitle>
        <DialogContent>
          {currentNews && (
            <Box component="form" sx={{ '& .MuiTextField-root': { m: 1, width: '100%' } }}>
              <TextField
                margin="dense"
                name="title"
                label="Tiêu đề"
                type="text"
                fullWidth
                variant="standard"
                value={currentNews.title}
                onChange={handleInputChange}
              />
              <RichTextEditor
                value={currentNews.content || ''}
                onChange={(value) => {
                  setCurrentNews((prevNews) => {
                    if (prevNews) {
                      return { ...prevNews, content: value };
                    }
                    return null;
                  });
                }}
                placeholder="Nội dung tin tức"
              />
              <ImageUploader onImageUpload={handleImageUpload} initialImageUrls={currentNews.image_url ? [currentNews.image_url] : []} />
              <FormControlLabel
                control={
                  <Switch
                    checked={currentNews.is_active}
                    onChange={handleSwitchChange}
                    name="is_active"
                    color="primary"
                  />
                }
                label="Đang kích hoạt"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button onClick={handleSaveNews} color="primary">Lưu</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openAIDialog} onClose={() => setOpenAIDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>Tạo tin bằng AI</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Chủ đề"
            type="text"
            fullWidth
            value={aiTopic}
            onChange={(e) => setAiTopic(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Từ khóa (tùy chọn)"
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
          <Button variant="contained" color="primary" onClick={handleGenerateAINews} disabled={aiGenerating}>
            {aiGenerating ? <CircularProgress size={22} sx={{ color: '#0D1210' }} /> : 'Tạo nội dung'}
          </Button>
          {aiGeneratedContent && (
            <Box sx={{ mt: 3, p: 2, border: `1px solid ${colors.border}`, borderRadius: 1 }}>
              <Typography variant="h6">Tiêu đề tạo ra:</Typography>
              <Typography>{aiGeneratedContent.title}</Typography>
              <Typography variant="h6" sx={{ mt: 2 }}>Nội dung tạo ra:</Typography>
              <Typography sx={{ whiteSpace: 'pre-wrap' }}>{aiGeneratedContent.content}</Typography>
              <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={handleUseGeneratedContent}>
                Dùng nội dung này
              </Button>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAIDialog(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminNewsPage;
