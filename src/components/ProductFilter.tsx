import { Brand, Category } from '../models';
import { TextField, MenuItem, Paper, Typography, Box } from '@mui/material';

interface ProductFilterProps {
  brands: Brand[];
  categories: Category[];
  filters: { brand_id?: number; category_id?: number; min_price?: number; max_price?: number; };
  onFilterChange: (filters: { brand_id?: number; category_id?: number; min_price?: number; max_price?: number; }) => void;
}

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

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>Filters</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(33.33% - 10.66px)' } }}>
          <TextField
            select
            label="Brand"
            fullWidth
            value={filters.brand_id || ''}
            onChange={handleBrandChange}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value=""><em>None</em></MenuItem>
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
            label="Category"
            fullWidth
            value={filters.category_id || ''}
            onChange={handleCategoryChange}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value=""><em>None</em></MenuItem>
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </TextField>
        </Box>
        <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(16.66% - 13.33px)' } }}>
          <TextField
            label="Min Price"
            type="number"
            fullWidth
            value={filters.min_price || ''}
            onChange={handleMinPriceChange}
          />
        </Box>
        <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(16.66% - 13.33px)' } }}>
          <TextField
            label="Max Price"
            type="number"
            fullWidth
            value={filters.max_price || ''}
            onChange={handleMaxPriceChange}
          />
          </Box>
      </Box>
    </Paper>
  );
};

export default ProductFilter;
