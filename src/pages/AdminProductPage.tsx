import { useEffect, useState } from 'react';
import { Typography, Box, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Switch, FormControlLabel, InputAdornment, Select, MenuItem, InputLabel, FormControl, SelectChangeEvent, ToggleButton, ToggleButtonGroup, Chip } from '@mui/material';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import ProductService from '../services/ProductService';
import BrandService from '../services/BrandService';
import CategoryService from '../services/CategoryService';
import { Product, Brand, Category, ProductCandidate } from '../models';
import ImageUploader from '../components/ImageUploader';
import RichTextEditor from '../components/RichTextEditor';
import { colors } from '../theme';

const AdminProductPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [openCsvDialog, setOpenCsvDialog] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<'active' | 'pending_ai' | 'deleted'>('active');

  const [openResearchDialog, setOpenResearchDialog] = useState<boolean>(false);
  const [researchTopic, setResearchTopic] = useState<string>('');
  const [researchKeywords, setResearchKeywords] = useState<string>('');
  const [researching, setResearching] = useState<boolean>(false);
  const [researchCandidates, setResearchCandidates] = useState<ProductCandidate[] | null>(null);
  const [researchError, setResearchError] = useState<string | null>(null);

  const fetchProducts = async (query: string = '') => {
    try {
      setLoading(true);
      const response = viewMode === 'deleted'
        ? await ProductService.getDeletedProducts()
        : viewMode === 'pending_ai'
          ? await ProductService.getPendingAiProducts()
          : await ProductService.getAllProducts(query);
      setProducts(response.data);
    } catch (err) {
      setError('Không tải được danh sách sản phẩm.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBrandsAndCategories = async () => {
    try {
      const [brandsResponse, categoriesResponse] = await Promise.all([
        BrandService.getBrands(),
        CategoryService.getCategories(),
      ]);
      setBrands(brandsResponse.data);
      setCategories(categoriesResponse.data);
    } catch (err) {
      setError('Không tải được thương hiệu/danh mục.');
      console.error(err);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchProducts(searchQuery);
    }, 400); // Debounce search input

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery, viewMode]); // Re-run effect when searchQuery or viewMode changes

  useEffect(() => {
    fetchBrandsAndCategories();
  }, []);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

    const handleImageUploads = (urls: string[]) => {
      setCurrentProduct((prevProduct) => {
        if (prevProduct) {
          return { ...prevProduct, image_urls: urls };
        }
        return null;
      });
    };
  
    const handleCreateClick = () => {
      setCurrentProduct({ id: 0, name: '', description: '', price: 0, quantity: 0, image_urls: [], is_active: true, created_at: '', updated_at: '', release_date: undefined });
      setIsEditing(false);
      setOpenDialog(true);
    };
  
    const handleResearchProducts = async () => {
      if (!researchTopic.trim()) {
        setResearchError('Vui lòng nhập chủ đề tìm kiếm.');
        return;
      }
      setResearching(true);
      setResearchError(null);
      setResearchCandidates(null);
      try {
        const response = await ProductService.researchProducts({ topic: researchTopic, keywords: researchKeywords || undefined });
        setResearchCandidates(response.data.candidates);
        if (response.data.candidates.length === 0) {
          setResearchError('Không tìm thấy sản phẩm mới phù hợp (có thể đã trùng với sản phẩm hiện có, hoặc chưa đủ thông tin thật từ nguồn tìm kiếm).');
        }
      } catch (err: any) {
        setResearchError('Tìm kiếm sản phẩm thất bại.');
        console.error(err);
      } finally {
        setResearching(false);
      }
    };

    const handleUseCandidate = (candidate: ProductCandidate) => {
      // The candidate was already inserted into the products table (pending
      // review) by the research endpoint - this opens it for editing, it does
      // NOT create a new row. Using isEditing:false here would double-create it.
      setCurrentProduct({
        id: candidate.id,
        name: candidate.name,
        description: candidate.description || '',
        price: candidate.estimated_price || 0,
        quantity: 0,
        image_urls: candidate.image_url ? [candidate.image_url] : [],
        is_active: false,
        is_ai_generated: true,
        category_id: candidate.category_id,
        brand_id: candidate.brand_id,
        created_at: '',
        updated_at: '',
        release_date: undefined,
      });
      setIsEditing(true);
      setOpenResearchDialog(false);
      setOpenDialog(true);
    };

    const handleEditClick = (productItem: Product) => {
      setCurrentProduct(productItem);
      setIsEditing(true);
      setOpenDialog(true);
    };
  
    const handleDeleteClick = async (productId: number) => {
      if (window.confirm('Xóa sản phẩm này?')) {
        try {
          await ProductService.deleteProduct(productId);
          fetchProducts();
        } catch (err) {
          setError('Xóa sản phẩm thất bại.');
          console.error(err);
        }
      }
    };
  
    const handleRestoreClick = async (productId: number) => {
      if (window.confirm('Khôi phục sản phẩm này?')) {
        try {
          await ProductService.restoreProduct(productId);
          fetchProducts();
        } catch (err) {
          setError('Khôi phục sản phẩm thất bại.');
          console.error(err);
        }
      }
    };
  
    const handleSaveProduct = async () => {
      if (currentProduct) {
        try {
          if (isEditing) {
            await ProductService.updateProduct(currentProduct.id, currentProduct);
          } else {
            await ProductService.createProduct(currentProduct);
          }
          setOpenDialog(false);
          fetchProducts();
        } catch (err) {
          setError('Lưu sản phẩm thất bại.');
          console.error(err);
        }
      }
    };
  
    const handleCloseDialog = () => {
      setOpenDialog(false);
      setCurrentProduct(null);
    };
  
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setCurrentProduct((prevProduct) => {
        if (prevProduct) {
          return { ...prevProduct, [name as string]: value };
        }
        return null;
      });
    };

    const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setCurrentProduct((prevProduct) => {
            if (prevProduct) {
                return { ...prevProduct, [name]: checked };
            }
            return null;
        });
    };

    const handleSelectChange = (e: SelectChangeEvent<string | number>) => {
        const { name, value } = e.target;
        setCurrentProduct((prevProduct) => {
            if (prevProduct) {
                return { ...prevProduct, [name]: value };
            }
            return null;
        });
    };
  
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files && event.target.files[0]) {
        const file = event.target.files[0];
        setSelectedFile(file);
        setUploadMessage(null);
      }
    };
  
    const pollCsvJobStatus = async (jobId: string) => {
      const POLL_INTERVAL_MS = 2000;
      const MAX_POLLS = 60; // ~2 minutes before giving up

      for (let i = 0; i < MAX_POLLS; i++) {
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
        try {
          const { data: job } = await ProductService.getCsvUploadJobStatus(jobId);
          if (job.status === 'completed') {
            const r = job.result;
            setUploadMessage(`Tải lên thành công: Đã nhập ${r?.successful_imports ?? 0} sản phẩm (${(r?.raw_failed_imports ?? 0) + (r?.llm_failed_imports ?? 0)} dòng lỗi).`);
            setSelectedFile(null);
            setOpenCsvDialog(false);
            fetchProducts();
            return;
          }
          if (job.status === 'failed') {
            setUploadMessage(`Tải lên thất bại: ${job.result?.detail || 'Đã có lỗi xảy ra.'}`);
            return;
          }
          // still processing, keep polling
        } catch (err) {
          console.error('Failed to poll CSV job status:', err);
          setUploadMessage('Không thể kiểm tra trạng thái xử lý CSV.');
          return;
        }
      }
      setUploadMessage('Quá trình xử lý CSV đang mất nhiều thời gian hơn dự kiến. Vui lòng kiểm tra lại danh sách sản phẩm sau ít phút.');
    };

    const handleUploadCsv = async () => {
      if (!selectedFile) {
        setUploadMessage('Vui lòng chọn file CSV để tải lên.');
        return;
      }

      setUploading(true);
      setUploadMessage(null);
      try {
        const response = await ProductService.uploadProductsCsv(selectedFile);
        setUploadMessage('Đang xử lý CSV, vui lòng đợi...');
        await pollCsvJobStatus(response.data.job_id);
      } catch (err: any) {
        setUploadMessage(`Tải lên thất bại: ${err.response?.data?.detail || err.message}`);
        console.error(err);
      } finally {
        setUploading(false);
      }
    };
  
  
  
    if (error) {
      return <Alert severity="error">{error}</Alert>;
    }
  
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Quản lý sản phẩm
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            label="Tìm sản phẩm"
            variant="outlined"
            value={searchQuery}
            onChange={handleSearchChange}
            sx={{ flexGrow: 1 }}
            disabled={viewMode !== 'active'}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  {loading && <CircularProgress size={20} sx={{ color: 'primary.main' }} />}
                </InputAdornment>
              ),
            }}
          />
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_e, value) => value && setViewMode(value)}
            size="small"
          >
            <ToggleButton value="active">Đang bán</ToggleButton>
            <ToggleButton value="pending_ai">Chờ duyệt AI</ToggleButton>
            <ToggleButton value="deleted">Đã xóa</ToggleButton>
          </ToggleButtonGroup>
          <Button variant="contained" color="primary" onClick={handleCreateClick} disabled={viewMode !== 'active'}>
            Thêm sản phẩm
          </Button>
          <Button variant="outlined" onClick={() => setOpenCsvDialog(true)} disabled={viewMode !== 'active'} sx={{ borderColor: 'divider' }}>
            Nhập CSV
          </Button>
          <Button variant="outlined" onClick={() => setOpenResearchDialog(true)} disabled={viewMode !== 'active'} sx={{ borderColor: colors.jade, color: colors.jade }}>
            Tìm sản phẩm mới bằng AI
          </Button>
        </Box>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Ảnh</TableCell>
                <TableCell>Tên</TableCell>
                <TableCell>Giá</TableCell>
                <TableCell>SL</TableCell>
                <TableCell>Active</TableCell>
                <TableCell>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((productItem) => (
                <TableRow key={productItem.id}>
                  <TableCell>{productItem.id}</TableCell>
                  <TableCell>
                    <img
                      src={productItem.image_urls?.[0] || 'https://upload.wikimedia.org/wikipedia/commons/d/df/Mechanical_keyboard_example.jpg'}
                      alt={productItem.name}
                      style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: '4px' }}
                    />
                  </TableCell>
                  <TableCell>{productItem.name}</TableCell>
                  <TableCell>{productItem.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</TableCell>
                  <TableCell>{productItem.quantity}</TableCell>
                  <TableCell>
                    {productItem.is_active ? 'Có' : 'Không'}
                    {productItem.is_ai_generated && (
                      <Chip label="AI" size="small" sx={{ ml: 1, bgcolor: colors.jade, color: '#0D1210', height: 18, fontSize: '0.7rem' }} />
                    )}
                  </TableCell>
                  <TableCell>
                    {<Button variant="contained" color="primary" size="small" onClick={() => handleEditClick(productItem)} sx={{ mr: 1 }}>
                        Sửa
                      </Button>}
                    {viewMode === 'pending_ai' ? (
                      <Button variant="contained" color="success" size="small" onClick={() => handleRestoreClick(productItem.id)}>
                        Duyệt
                      </Button>
                    ) : viewMode === 'deleted' ? (
                      <Button variant="contained" color="success" size="small" onClick={() => handleRestoreClick(productItem.id)}>
                        Khôi phục
                      </Button>
                    ) : (
                      <Button variant="outlined" size="small" onClick={() => handleDeleteClick(productItem.id)} sx={{ borderColor: 'error.main', color: 'error.main' }}>
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
          <DialogTitle>{isEditing ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</DialogTitle>
          <DialogContent>
            {currentProduct && (
              <Box component="form" sx={{ '& .MuiTextField-root': { m: 1, width: '100%' } }}>
                <TextField
                  margin="dense"
                  name="name"
                  label="Tên"
                  type="text"
                  fullWidth
                  variant="standard"
                  value={currentProduct.name}
                  onChange={handleInputChange}
                />
                <RichTextEditor
                  value={currentProduct.description || ''}
                  onChange={(value) => {
                    setCurrentProduct((prevProduct) => {
                      if (prevProduct) {
                        return { ...prevProduct, description: value };
                      }
                      return null;
                    });
                  }}
                  placeholder="Mô tả sản phẩm"
                />
                <TextField
                  margin="dense"
                  name="price"
                  label="Giá (VNĐ)"
                  type="number"
                  fullWidth
                  variant="standard"
                  value={currentProduct.price}
                  onChange={handleInputChange}
                />
                <TextField
                  margin="dense"
                  name="quantity"
                  label="Số lượng"
                  type="number"
                  fullWidth
                  variant="standard"
                  value={currentProduct.quantity}
                  onChange={handleInputChange}
                />
                <FormControl fullWidth margin="dense">
                  <InputLabel>Thương hiệu</InputLabel>
                  <Select
                    name="brand_id"
                    value={currentProduct.brand_id || ''}
                    onChange={handleSelectChange}
                  >
                    {brands.map((brand) => (
                      <MenuItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth margin="dense">
                  <InputLabel>Danh mục</InputLabel>
                  <Select
                    name="category_id"
                    value={currentProduct.category_id || ''}
                    onChange={handleSelectChange}
                  >
                    {categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth margin="dense">
                  <InputLabel>Loại switch</InputLabel>
                  <Select
                    name="switch_type"
                    value={currentProduct.switch_type || ''}
                    onChange={handleSelectChange}
                  >
                    <MenuItem value=""><em>Không rõ</em></MenuItem>
                    <MenuItem value="linear">Linear</MenuItem>
                    <MenuItem value="tactile">Tactile</MenuItem>
                    <MenuItem value="clicky">Clicky</MenuItem>
                    <MenuItem value="magnetic">Magnetic (Hall Effect)</MenuItem>
                    <MenuItem value="optical">Optical</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth margin="dense">
                  <InputLabel>Layout</InputLabel>
                  <Select
                    name="layout"
                    value={currentProduct.layout || ''}
                    onChange={handleSelectChange}
                  >
                    <MenuItem value=""><em>Không rõ</em></MenuItem>
                    <MenuItem value="full">Full-size</MenuItem>
                    <MenuItem value="tkl">TKL (87-96%)</MenuItem>
                    <MenuItem value="75">75%</MenuItem>
                    <MenuItem value="65">65%</MenuItem>
                    <MenuItem value="60">60%</MenuItem>
                    <MenuItem value="40">40%</MenuItem>
                  </Select>
                </FormControl>
                <FormControlLabel
                  control={
                    <Switch
                      checked={!!currentProduct.hot_swappable}
                      onChange={handleSwitchChange}
                      name="hot_swappable"
                      color="primary"
                    />
                  }
                  label="Hỗ trợ hot-swap"
                />
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DateTimePicker
                    label="Ngày ra mắt"
                    value={currentProduct.release_date ? dayjs(currentProduct.release_date) : null}
                    onChange={(newValue) => {
                      setCurrentProduct((prevProduct) => {
                        if (prevProduct) {
                          return { ...prevProduct, release_date: newValue ? newValue.toISOString() : undefined };
                        }
                        return null;
                      });
                    }}
                    slotProps={{ textField: { fullWidth: true, variant: 'standard' } }}
                  />
                </LocalizationProvider>
                <ImageUploader onImageUpload={handleImageUploads} initialImageUrls={currentProduct.image_urls || []} />
                <FormControlLabel
                  control={
                    <Switch
                      checked={currentProduct.is_active}
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
            <Button onClick={handleSaveProduct} color="primary">Lưu</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={openCsvDialog} onClose={() => !uploading && setOpenCsvDialog(false)}>
          <DialogTitle>Nhập sản phẩm từ CSV</DialogTitle>
          <DialogContent>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              style={{ display: 'block', marginBottom: '16px' }}
            />
            {uploadMessage && (
              <Alert severity={
                uploadMessage.startsWith('Tải lên thành công') ? 'success'
                  : uploadMessage.startsWith('Đang xử lý') ? 'info'
                  : 'error'
              }>
                {uploadMessage}
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenCsvDialog(false)} disabled={uploading}>Hủy</Button>
            <Button onClick={handleUploadCsv} disabled={uploading || !selectedFile} color="primary">
              {uploading ? <CircularProgress size={22} sx={{ color: '#0D1210' }} /> : 'Tải lên'}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={openResearchDialog} onClose={() => setOpenResearchDialog(false)} fullWidth maxWidth="md">
          <DialogTitle>Tìm sản phẩm mới bằng AI</DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ color: colors.muted, mb: 2 }}>
              AI sẽ tìm kiếm web thật để tìm sản phẩm bàn phím cơ đang có trên thị trường, loại bỏ sản phẩm trùng với
              những gì cửa hàng đã có. Mọi sản phẩm tìm thấy được <strong>tự động lưu vào hàng chờ duyệt</strong> (ẩn,
              tồn kho 0, giá 0 nếu nguồn không nêu giá) ngay cả khi bạn đóng cửa sổ này - vào tab <strong>"Chờ duyệt AI"</strong> để
              kiểm tra giá/thông tin rồi duyệt.
            </Typography>
            <TextField
              margin="dense"
              label="Chủ đề tìm kiếm"
              placeholder="VD: bàn phím cơ gaming mới ra mắt 2026"
              type="text"
              fullWidth
              value={researchTopic}
              onChange={(e) => setResearchTopic(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Từ khóa (tùy chọn)"
              type="text"
              fullWidth
              value={researchKeywords}
              onChange={(e) => setResearchKeywords(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button variant="contained" color="primary" onClick={handleResearchProducts} disabled={researching}>
              {researching ? <CircularProgress size={22} sx={{ color: '#0D1210' }} /> : 'Tìm kiếm'}
            </Button>

            {researchError && <Alert severity="warning" sx={{ mt: 2 }}>{researchError}</Alert>}

            {researchCandidates && researchCandidates.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Alert severity="success" sx={{ mb: 2 }}>
                  Đã lưu {researchCandidates.length} sản phẩm vào hàng chờ duyệt AI.
                </Alert>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {researchCandidates.map((candidate, i) => (
                  <Box key={i} sx={{ display: 'flex', gap: 2, p: 2, border: `1px solid ${colors.border}`, borderRadius: 1 }}>
                    {candidate.image_url && (
                      <Box
                        component="img"
                        src={candidate.image_url}
                        alt=""
                        sx={{ width: 96, height: 72, objectFit: 'cover', borderRadius: 1, flexShrink: 0 }}
                      />
                    )}
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontWeight: 600 }}>{candidate.name}</Typography>
                      <Typography variant="body2" sx={{ color: colors.muted, mt: 0.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {candidate.description}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                        {candidate.estimated_price ? (
                          <Typography variant="caption" sx={{ color: colors.jade, fontFamily: '"IBM Plex Mono", monospace' }}>
                            ~{candidate.estimated_price.toLocaleString('vi-VN')} đ
                          </Typography>
                        ) : (
                          <Typography variant="caption" sx={{ color: colors.muted }}>Chưa rõ giá - cần tự kiểm tra</Typography>
                        )}
                        {candidate.category_name && <Typography variant="caption" sx={{ color: colors.muted }}>· {candidate.category_name}</Typography>}
                        {candidate.brand_name && <Typography variant="caption" sx={{ color: colors.muted }}>· {candidate.brand_name}</Typography>}
                      </Box>
                      {candidate.source_url && (
                        <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                          <a href={candidate.source_url} target="_blank" rel="noopener noreferrer" style={{ color: colors.jadeBright }}>
                            Nguồn tham khảo
                          </a>
                        </Typography>
                      )}
                    </Box>
                    <Button variant="outlined" size="small" onClick={() => handleUseCandidate(candidate)} sx={{ alignSelf: 'center', flexShrink: 0, borderColor: colors.jade, color: colors.jade }}>
                      Sửa ngay
                    </Button>
                  </Box>
                ))}
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenResearchDialog(false)}>Đóng</Button>
            {researchCandidates && researchCandidates.length > 0 && (
              <Button
                variant="contained"
                color="primary"
                onClick={() => { setOpenResearchDialog(false); setViewMode('pending_ai'); }}
              >
                Xem trong "Chờ duyệt AI"
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Box>
    );
  };
  
  export default AdminProductPage;
