/**
 * Enhanced image handling for AddStudentForm with file upload support
 * This component can be used to replace the image handling section in AddStudentForm.tsx
 */

import React, { useState, useRef } from 'react';
import { Camera, Upload, Check, AlertCircle, User } from 'lucide-react';
import { useImageUpload } from '../utils/fileUploadService';

interface ImageUploaderProps {
  currentImage: string;
  onImageChange: (imageData: { type: 'file' | 'base64' | 'url'; url: string; filename?: string }) => void;
  label?: string;
  className?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  currentImage,
  onImageChange,
  label = 'Profile Photo',
  className = ''
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadImage, uploading, progress, error, clearError } = useImageUpload();
  const [previewUrl, setPreviewUrl] = useState<string>(currentImage);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    clearError();

    try {
      // Show immediate preview
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      // Upload the file
      const result = await uploadImage(file, {
        maxSizeMB: 5,
        fallbackToBase64: true,
        useCompression: true
      });

      if (result) {
        if (result.type === 'file' && typeof result.data === 'object') {
          // File upload successful
          const fileData = result.data;
          onImageChange({
            type: 'file',
            url: fileData.file_info?.url || '',
            filename: fileData.file_info?.filename
          });
        } else if (result.type === 'base64' && typeof result.data === 'string') {
          // Fallback to base64
          onImageChange({
            type: 'base64',
            url: result.data
          });
        }
      }

      // Clean up object URL
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      console.error('Error uploading image:', err);
      // Revert preview on error
      setPreviewUrl(currentImage);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  const getImageSrc = () => {
    if (previewUrl && previewUrl.trim() !== '') {
      return previewUrl;
    }
    return null; // Return null when no image, we'll show icon instead
  };

  const hasImage = () => {
    return getImageSrc() !== null;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
        {/* Image Preview */}
      <div className="flex flex-col items-center space-y-4">
        <div className="relative w-32 h-32">
          {hasImage() ? (
            <img
              src={getImageSrc()!}
              alt="Preview"
              className="w-full h-full object-cover rounded-full border-2 border-gray-300"
              onError={(e) => {
                // If image fails to load, hide it and show the default icon
                const img = e.target as HTMLImageElement;
                img.style.display = 'none';
                setPreviewUrl(''); // Clear the preview URL to show icon
              }}
            />
          ) : (
            <div className="w-full h-full rounded-full border-2 border-gray-300 bg-gray-100 flex items-center justify-center">
              <User className="w-16 h-16 text-gray-400" />
            </div>
          )}
          
          {/* Upload overlay when uploading */}
          {uploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
              <div className="text-white text-center">
                <Upload className="w-6 h-6 mx-auto mb-1 animate-pulse" />
                <div className="text-xs">{progress}%</div>
              </div>
            </div>
          )}
          
          {/* Camera icon overlay */}
          <button
            type="button"
            onClick={triggerFileInput}
            disabled={uploading}
            className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 shadow-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>

        {/* Upload button */}
        <button
          type="button"
          onClick={triggerFileInput}
          disabled={uploading}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {uploading ? (
            <>
              <Upload className="w-4 h-4 animate-pulse" />
              <span>Uploading... {progress}%</span>
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              <span>Choose Photo</span>
            </>
          )}
        </button>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Status messages */}
      {error && (
        <div className="flex items-center space-x-2 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload success indicator */}
      {!uploading && !error && previewUrl !== currentImage && (
        <div className="flex items-center space-x-2 text-green-600 text-sm">
          <Check className="w-4 h-4" />
          <span>Image uploaded successfully</span>
        </div>
      )}

      {/* File requirements */}
      <div className="text-xs text-gray-500 text-center space-y-1">
        <p>Supported formats: JPG, PNG, GIF, WebP</p>
        <p>Maximum size: 5MB</p>
        <p>Recommended: Square images work best</p>
      </div>
    </div>
  );
};
