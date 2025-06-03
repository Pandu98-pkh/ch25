/**
 * Image compression and processing utilities
 * Provides functions to compress images before base64 encoding
 */

export interface ImageCompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

/**
 * Compress an image file and return base64 string
 * @param file - The image file to compress
 * @param options - Compression options
 * @returns Promise that resolves to compressed base64 string
 */
export const compressImageToBase64 = (
  file: File,
  options: ImageCompressOptions = {}
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const {
      maxWidth = 800,
      maxHeight = 800,
      quality = 0.8,
      format = 'jpeg'
    } = options;

    // Create image element
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.floor(width * ratio);
        height = Math.floor(height * ratio);
      }

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Draw and compress image
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to base64
      const mimeType = format === 'png' ? 'image/png' : 
                     format === 'webp' ? 'image/webp' : 'image/jpeg';
      
      const base64String = canvas.toDataURL(mimeType, quality);
      resolve(base64String);
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    // Load the image
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    reader.readAsDataURL(file);
  });
};

/**
 * Validate image file before processing
 * @param file - The file to validate
 * @param maxSizeBytes - Maximum file size in bytes
 * @returns Validation result
 */
export const validateImageFile = (
  file: File,
  maxSizeBytes: number = 2 * 1024 * 1024 // 2MB default
): { isValid: boolean; error?: string } => {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { isValid: false, error: 'File must be an image' };
  }

  // Check file size
  if (file.size > maxSizeBytes) {
    const maxSizeMB = maxSizeBytes / (1024 * 1024);
    return { isValid: false, error: `Image size must be less than ${maxSizeMB}MB` };
  }

  // Check if it's a supported image type
  const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!supportedTypes.includes(file.type)) {
    return { isValid: false, error: 'Unsupported image format. Please use JPEG, PNG, GIF, or WebP' };
  }

  return { isValid: true };
};

/**
 * Get optimal compression settings based on file size
 * @param fileSize - Original file size in bytes
 * @returns Optimal compression options
 */
export const getOptimalCompressionSettings = (fileSize: number): ImageCompressOptions => {
  if (fileSize > 1024 * 1024) { // > 1MB
    return {
      maxWidth: 400,
      maxHeight: 400,
      quality: 0.6,
      format: 'jpeg'
    };
  } else if (fileSize > 512 * 1024) { // > 512KB
    return {
      maxWidth: 600,
      maxHeight: 600,
      quality: 0.7,
      format: 'jpeg'
    };
  } else {
    return {
      maxWidth: 800,
      maxHeight: 800,
      quality: 0.8,
      format: 'jpeg'
    };
  }
};

/**
 * Calculate approximate base64 size from compressed dimensions
 * @param width - Image width
 * @param height - Image height
 * @param quality - Compression quality
 * @returns Estimated base64 size in bytes
 */
export const estimateBase64Size = (width: number, height: number, quality: number): number => {
  // Rough estimation: base64 adds ~33% overhead, JPEG compression varies by quality
  const pixelCount = width * height;
  const bytesPerPixel = quality * 3; // RGB, adjusted by quality
  const compressedSize = pixelCount * bytesPerPixel * quality;
  const base64Size = compressedSize * 1.33; // Base64 overhead
  return Math.floor(base64Size);
};
