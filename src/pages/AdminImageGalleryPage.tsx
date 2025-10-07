import { useEffect, useState } from 'react';
import { Typography, Box, CircularProgress, Alert, Card, CardMedia, CardActions, Button, Checkbox, FormControlLabel } from '@mui/material';
import UploadService from '../services/UploadService';

interface ImageResource {
  public_id: string;
  url: string;
  folder?: string;
}

const AdminImageGalleryPage = () => {
  const [images, setImages] = useState<ImageResource[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const response = await UploadService.listImages();
      setImages(response.data);
      setSelectedImages([]); // Clear selection on refresh
    } catch (err) {
      setError('Failed to fetch images.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleCheckboxChange = (publicId: string) => {
    setSelectedImages((prevSelected) =>
      prevSelected.includes(publicId)
        ? prevSelected.filter((id) => id !== publicId)
        : [...prevSelected, publicId]
    );
  };

  const handleDeleteSingleImage = async (publicId: string) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      try {
        setLoading(true);
        await UploadService.deleteImage(publicId);
        fetchImages(); // Refresh the list
      } catch (err) {
        setError('Failed to delete image.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteSelectedImages = async () => {
    if (selectedImages.length === 0) return;

    if (window.confirm(`Are you sure you want to delete ${selectedImages.length} selected images?`)) {
      try {
        setLoading(true);
        await UploadService.deleteMultipleImages(selectedImages);
        fetchImages(); // Refresh the list
      } catch (err) {
        setError('Failed to delete selected images.');
        console.error(err);
      } finally {
        setLoading(false);
      }
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
        Image Gallery
      </Typography>
      <Button
        variant="contained"
        color="error"
        sx={{ mb: 2 }}
        onClick={handleDeleteSelectedImages}
        disabled={selectedImages.length === 0 || loading}
      >
        Delete Selected ({selectedImages.length})
      </Button>
      {images.length === 0 ? (
        <Typography>No images found.</Typography>
      ) : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {images.map((image) => (
            <Box key={image.public_id} sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(33.33% - 16px)', lg: 'calc(25% - 18px)' } }}>
              <Card sx={{ position: 'relative' }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedImages.includes(image.public_id)}
                      onChange={() => handleCheckboxChange(image.public_id)}
                      sx={{ color: 'white' }} // Make checkbox white for better visibility on dark background
                    />
                  }
                  label=""
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    zIndex: 2, // Ensure it's above the image
                    bgcolor: 'rgba(0,0,0,0.5)', // Semi-transparent background
                    borderRadius: '4px',
                    p: 0.5,
                  }}
                />
                <CardMedia
                  component="img"
                  image={image.url}
                  alt={image.public_id}
                  sx={{ height: 200, objectFit: 'contain' }}
                />
                <CardActions sx={{ justifyContent: 'center' }}>
                  <Button 
                    variant="outlined" 
                    color="error" 
                    size="small" 
                    onClick={() => handleDeleteSingleImage(image.public_id)}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default AdminImageGalleryPage;
