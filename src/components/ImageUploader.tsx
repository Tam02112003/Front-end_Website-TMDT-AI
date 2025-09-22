import { useState, ChangeEvent } from 'react';
import { Box, Button, CircularProgress, Alert, Typography } from '@mui/material';
import UploadService from '../services/UploadService';

interface ImageUploaderProps {
  onImageUpload: (url: string) => void;
  initialImageUrl?: string;
}

const ImageUploader = ({ onImageUpload, initialImageUrl }: ImageUploaderProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(initialImageUrl);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setUploadError(null);
      setUploadSuccess(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError('Please select a file first.');
      return;
    }

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const response = await UploadService.uploadImage(selectedFile);
      setUploadSuccess('Image uploaded successfully!');
      onImageUpload(response.data.url);
      // Clean up object URL after upload
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    } catch (err: any) {
      setUploadError(`Upload failed: ${err.response?.data?.detail || err.message}`);
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box sx={{ border: '1px dashed grey', p: 2, mt: 2, mb: 2, textAlign: 'center' }}>
      <input
        accept="image/*"
        style={{ display: 'none' }}
        id="raised-button-file"
        multiple
        type="file"
        onChange={handleFileChange}
      />
      <label htmlFor="raised-button-file">
        <Button variant="contained" component="span" disabled={uploading}>
          {selectedFile ? 'Change Image' : 'Select Image'}
        </Button>
      </label>
      {selectedFile && (
        <Typography variant="body2" sx={{ mt: 1 }}>
          {selectedFile.name}
        </Typography>
      )}
      
      {previewUrl && (
        <Box sx={{ mt: 2, maxWidth: '100%', maxHeight: '200px', overflow: 'hidden' }}>
          <img src={previewUrl} alt="Preview" style={{ width: 'auto', height: '100%', objectFit: 'contain' }} />
        </Box>
      )}

      <Button
        variant="outlined"
        color="primary"
        onClick={handleUpload}
        disabled={!selectedFile || uploading}
        sx={{ mt: 2 }}
      >
        {uploading ? <CircularProgress size={24} /> : 'Upload Image'}
      </Button>

      {uploadSuccess && <Alert severity="success" sx={{ mt: 2 }}>{uploadSuccess}</Alert>}
      {uploadError && <Alert severity="error" sx={{ mt: 2 }}>{uploadError}</Alert>}
    </Box>
  );
};

export default ImageUploader;
