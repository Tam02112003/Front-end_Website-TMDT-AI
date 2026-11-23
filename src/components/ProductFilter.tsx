import { Brand, Category } from '../models';
import { TextField, MenuItem, Paper, Typography, Box } from '@mui/material';

export interface ProductFilters {
  brand_id?: number;
  category_id?: number;
  min_price?: number;
  max_price?: number;
  switch_type?: string;
  layout?: string;
  hot_swappable?: boolean;
}

interface ProductFilterProps {
  brands: Brand[];
  categories: Category[];
  filters: ProductFilters;
  onFilterChange: (filters: ProductFilters) => void;
}

const SWITCH_TYPE_OPTIONS = [
  { value: 'linear', label: 'Linear' },
  { value: 'tactile', label: 'Tactile' },
  { value: 'clicky', label: 'Clicky' },
  { value: 'magnetic', label: 'Magnetic (Hall Effect)' },
  { value: 'optical', label: 'Optical' },
];

const LAYOUT_OPTIONS = [
  { value: 'full', label: 'Full-size' },
  { value: 'tkl', label: 'TKL (87-96%)' },
  { value: '75', label: '75%' },
  { value: '65', label: '65%' },
  { value: '60', label: '60%' },
  { value: '40', label: '40%' },
];

const ProductFilter = ({ brands, categories, filters, onFilterChange }: ProductFilterProps) => {
  const handleBrandChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    onFilterChange({ brand_id: value ? parseInt(value) : undefined });
  };

  const handleCategoryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    onFilterChange({ category_id: value ? parseInt(value) : undefined });
  };

  const handleMinPriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    onFilterChange({ min_price: value ? parseFloat(value) : undefined });
  };

  const handleMaxPriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    onFilterChange({ max_price: value ? parseFloat(value) : undefined });
  };

  const handleSwitchTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ switch_type: event.target.value || undefined });
  };

  const handleLayoutChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ layout: event.target.value || undefined });
  };

  const handleHotSwappableChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    onFilterChange({ hot_swappable: value === '' ? undefined : value === 'true' });
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>Bộ lọc</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(33.33% - 10.66px)' } }}>
          <TextField
            select
            label="Thương hiệu"
            fullWidth
            value={filters.brand_id || ''}
            onChange={handleBrandChange}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value=""><em>Tất cả</em></MenuItem>
            {brands.map((brand) => (
              <MenuItem key={brand.id} value={brand.id}>
                {brand.name}
              </MenuItem>
            ))}
          </TextField>
        </Box>
        <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(33.33% - 10.66px)' } }}>
          <TextField
            select
            label="Danh mục"
            fullWidth
            value={filters.category_id || ''}
            onChange={handleCategoryChange}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value=""><em>Tất cả</em></MenuItem>
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </TextField>
        </Box>
        <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(16.66% - 13.33px)' } }}>
          <TextField
            label="Giá từ"
            type="number"
            fullWidth
            value={filters.min_price || ''}
            onChange={handleMinPriceChange}
          />
        </Box>
        <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(16.66% - 13.33px)' } }}>
          <TextField
            label="Giá đến"
            type="number"
            fullWidth
            value={filters.max_price || ''}
            onChange={handleMaxPriceChange}
          />
        </Box>
        <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(33.33% - 10.66px)' } }}>
          <TextField
            select
            label="Loại switch"
            fullWidth
            value={filters.switch_type || ''}
            onChange={handleSwitchTypeChange}
          >
            <MenuItem value=""><em>Tất cả</em></MenuItem>
            {SWITCH_TYPE_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </TextField>
        </Box>
        <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(33.33% - 10.66px)' } }}>
          <TextField
            select
            label="Layout"
            fullWidth
            value={filters.layout || ''}
            onChange={handleLayoutChange}
          >
            <MenuItem value=""><em>Tất cả</em></MenuItem>
            {LAYOUT_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </TextField>
        </Box>
        <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(33.33% - 10.66px)' } }}>
          <TextField
            select
            label="Hot-swap"
            fullWidth
            value={filters.hot_swappable === undefined ? '' : String(filters.hot_swappable)}
            onChange={handleHotSwappableChange}
          >
            <MenuItem value=""><em>Tất cả</em></MenuItem>
            <MenuItem value="true">Có hot-swap</MenuItem>
            <MenuItem value="false">Không hot-swap</MenuItem>
          </TextField>
        </Box>
      </Box>
    </Paper>
  );
};

export default ProductFilter;
