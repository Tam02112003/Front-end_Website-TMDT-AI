import api from './api';

interface UploadImageResponse {
  message: string;
  url: string;
}

interface ImageResource {
  public_id: string;
  url: string;
  folder?: string;
}

const uploadImage = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post<UploadImageResponse>('/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

const listImages = (folder?: string) => {
  return api.get<ImageResource[]>('/upload/images', { params: { folder } });
};

const deleteImage = (publicId: string) => {
  return api.delete(`/upload/image/${publicId}`);
};

const deleteMultipleImages = (publicIds: string[]) => {
  return api.post('/upload/delete-multiple', { public_ids: publicIds });
};

const UploadService = {
  uploadImage,
  listImages,
  deleteImage,
  deleteMultipleImages,
};

export default UploadService;
