/**
 * File upload service for handling image uploads to the backend
 * Supports both base64 fallback and file system storage
 */

export interface UploadResponse {
  success: boolean;
  file_info?: {
    filename: string;
    original_filename: string;
    file_size: number;
    upload_date: string;
    thumbnails: { [key: string]: string };
    url: string;
  };
  error?: string;
}

export interface ImageUploadOptions {
  useCompression?: boolean;
  maxSizeMB?: number;
  fallbackToBase64?: boolean;
  onProgress?: (progress: number) => void;
}

class FileUploadService {
  private baseUrl: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  /**
   * Upload an image file to the server
   */
  async uploadImage(
    file: File, 
    options: ImageUploadOptions = {}
  ): Promise<{ type: 'file' | 'base64'; data: string | UploadResponse }> {
    const {
      useCompression = true,
      maxSizeMB = 5,
      fallbackToBase64 = true,
      onProgress
    } = options;

    // Validate file
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      throw new Error(`File size must be less than ${maxSizeMB}MB`);
    }

    try {
      // Try file upload first
      if (onProgress) onProgress(10);
      
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${this.baseUrl}/images/upload`, {
        method: 'POST',
        body: formData,
      });

      if (onProgress) onProgress(80);

      if (response.ok) {
        const result: UploadResponse = await response.json();
        if (onProgress) onProgress(100);
        return { type: 'file', data: result };
      } else {
        throw new Error(`Upload failed: ${response.statusText}`);
      }
    } catch (error) {
      console.warn('File upload failed, trying base64 fallback:', error);
      
      if (fallbackToBase64) {
        if (onProgress) onProgress(50);
        
        // Fallback to base64 with compression
        const { compressImageToBase64, getOptimalCompressionSettings } = await import('./imageUtils');
        
        const compressionOptions = getOptimalCompressionSettings(file.size);
        const base64Data = await compressImageToBase64(file, compressionOptions);
        
        if (onProgress) onProgress(100);
        return { type: 'base64', data: base64Data };
      } else {
        throw error;
      }
    }
  }

  /**
   * Get the URL for an image
   */
  getImageUrl(filename: string, size?: 'small' | 'medium' | 'large'): string {
    const params = size ? `?size=${size}` : '';
    return `${this.baseUrl}/images/${filename}${params}`;
  }

  /**
   * Delete an uploaded image
   */
  async deleteImage(filename: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/images/${filename}`, {
        method: 'DELETE',
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error deleting image:', error);
      return false;
    }
  }

  /**
   * Validate and get image info without uploading
   */
  async validateImage(file: File): Promise<{ isValid: boolean; error?: string; info?: any }> {
    if (!file.type.startsWith('image/')) {
      return { isValid: false, error: 'File must be an image' };
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return { isValid: false, error: 'File size must be less than 5MB' };
    }

    try {
      // Create image to get dimensions
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      return new Promise((resolve) => {
        img.onload = () => {
          URL.revokeObjectURL(url);
          resolve({
            isValid: true,
            info: {
              width: img.width,
              height: img.height,
              size: file.size,
              type: file.type
            }
          });
        };
        
        img.onerror = () => {
          URL.revokeObjectURL(url);
          resolve({ isValid: false, error: 'Invalid image file' });
        };
        
        img.src = url;
      });
    } catch (error) {
      return { isValid: false, error: 'Failed to validate image' };
    }
  }
}

// Create singleton instance
export const fileUploadService = new FileUploadService();

/**
 * Hook for React components to handle image uploads
 */
export const useImageUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = async (
    file: File, 
    options: ImageUploadOptions = {}
  ): Promise<{ type: 'file' | 'base64'; data: string | UploadResponse } | null> => {
    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      const result = await fileUploadService.uploadImage(file, {
        ...options,
        onProgress: setProgress
      });
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      return null;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return {
    uploadImage,
    uploading,
    progress,
    error,
    clearError: () => setError(null)
  };
};

// Import React hooks if in React environment
import { useState } from 'react';
