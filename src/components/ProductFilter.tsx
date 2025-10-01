import { Brand, Category } from '../models';
import { TextField, MenuItem, Grid, Paper, Typography } from '@mui/material';

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
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4}>
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
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
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
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <TextField
            label="Min Price"
            type="number"
            fullWidth
            value={filters.min_price || ''}
            onChange={handleMinPriceChange}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <TextField
            label="Max Price"
            type="number"
            fullWidth
            value={filters.max_price || ''}
            onChange={handleMaxPriceChange}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ProductFilter;
