import { useState, ChangeEvent, useEffect } from 'react';
import { Box, Button, CircularProgress, Alert, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import UploadService from '../services/UploadService';

interface ImageUploaderProps {
  onImageUpload: (urls: string[]) => void;
  initialImageUrls?: string[];
}

const ImageUploader = ({ onImageUpload, initialImageUrls }: ImageUploaderProps) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>(initialImageUrls || []);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  useEffect(() => {
    // Update uploadedUrls when initialImageUrls prop changes
    setUploadedUrls(initialImageUrls || []);
  }, [initialImageUrls]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      setSelectedFiles(prevFiles => [...prevFiles, ...filesArray]);

      const newPreviewUrls = filesArray.map(file => URL.createObjectURL(file));
      setPreviewUrls(prevUrls => [...prevUrls, ...newPreviewUrls]);

      setUploadError(null);
      setUploadSuccess(null);
    }
  };

  const handleRemovePreview = (indexToRemove: number) => {
    setSelectedFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
    setPreviewUrls(prevUrls => {
      URL.revokeObjectURL(prevUrls[indexToRemove]); // Clean up object URL
      return prevUrls.filter((_, index) => index !== indexToRemove);
    });
  };

  const handleRemoveUploaded = (urlToRemove: string) => {
    const updatedUrls = uploadedUrls.filter(url => url !== urlToRemove);
    setUploadedUrls(updatedUrls);
    onImageUpload(updatedUrls); // Notify parent about the change
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setUploadError('Please select at least one file first.');
      return;
    }

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    const newUploadedUrls: string[] = [];
    for (const file of selectedFiles) {
      try {
        const response = await UploadService.uploadImage(file);
        newUploadedUrls.push(response.data.url);
      } catch (err: any) {
        setUploadError(`Upload failed for ${file.name}: ${err.response?.data?.detail || err.message}`);
        console.error('Upload error:', err);
        setUploading(false);
        return; // Stop on first error
      }
    }

    const finalUploadedUrls = [...uploadedUrls, ...newUploadedUrls];
    setUploadedUrls(finalUploadedUrls);
    onImageUpload(finalUploadedUrls);

    // Clear selected files and previews after successful upload
    selectedFiles.forEach(file => URL.revokeObjectURL(URL.createObjectURL(file)));
    setSelectedFiles([]);
    setPreviewUrls([]);

    setUploadSuccess('Images uploaded successfully!');
    setUploading(false);
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
          Select Images
        </Button>
      </label>
      
      {/* Display uploaded images */}
      {uploadedUrls.length > 0 && (
        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
          {uploadedUrls.map((url, index) => (
            <Box key={index} sx={{ position: 'relative', width: '100px', height: '100px', border: '1px solid #ddd' }}>
              <img src={url} alt={`Uploaded ${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <IconButton
                size="small"
                sx={{ position: 'absolute', top: 0, right: 0, bgcolor: 'rgba(255,255,255,0.7)' }}
                onClick={() => handleRemoveUploaded(url)}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
        </Box>
      )}

      {/* Display new image previews */}
      {previewUrls.length > 0 && (
        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
          {previewUrls.map((url, index) => (
            <Box key={index} sx={{ position: 'relative', width: '100px', height: '100px', border: '1px solid #ddd' }}>
              <img src={url} alt={`Preview ${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <IconButton
                size="small"
                sx={{ position: 'absolute', top: 0, right: 0, bgcolor: 'rgba(255,255,255,0.7)' }}
                onClick={() => handleRemovePreview(index)}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
        </Box>
      )}

      <Button
        variant="outlined"
        color="primary"
        onClick={handleUpload}
        disabled={selectedFiles.length === 0 || uploading}
        sx={{ mt: 2 }}
      >
        {uploading ? <CircularProgress size={24} /> : 'Upload Selected Images'}
      </Button>

      {uploadSuccess && <Alert severity="success" sx={{ mt: 2 }}>{uploadSuccess}</Alert>}
      {uploadError && <Alert severity="error" sx={{ mt: 2 }}>{uploadError}</Alert>}
    </Box>
  );
};

export default ImageUploader;
