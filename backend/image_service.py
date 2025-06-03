"""
Image upload service for handling file system storage
Provides endpoints for uploading, retrieving, and managing image files
"""

import os
import uuid
from datetime import datetime
from werkzeug.utils import secure_filename
from PIL import Image
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ImageUploadService:
    def __init__(self, upload_folder='uploads/images', max_size_mb=5):
        self.upload_folder = upload_folder
        self.max_size_bytes = max_size_mb * 1024 * 1024
        self.allowed_extensions = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
        self.thumbnail_sizes = {
            'small': (150, 150),
            'medium': (300, 300),
            'large': (800, 800)
        }
        
        # Create upload directory if it doesn't exist
        os.makedirs(self.upload_folder, exist_ok=True)
        os.makedirs(os.path.join(self.upload_folder, 'thumbnails'), exist_ok=True)
    
    def allowed_file(self, filename):
        """Check if file extension is allowed"""
        return '.' in filename and \
               filename.rsplit('.', 1)[1].lower() in self.allowed_extensions
    
    def generate_filename(self, original_filename):
        """Generate unique filename while preserving extension"""
        ext = original_filename.rsplit('.', 1)[1].lower()
        unique_filename = f"{uuid.uuid4().hex}.{ext}"
        return unique_filename
    
    def optimize_image(self, file_path, max_width=800, max_height=800, quality=85):
        """Optimize image size and quality"""
        try:
            with Image.open(file_path) as img:
                # Convert RGBA to RGB if necessary (for JPEG)
                if img.mode in ('RGBA', 'LA'):
                    background = Image.new('RGB', img.size, (255, 255, 255))
                    background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                    img = background
                
                # Resize if necessary
                if img.width > max_width or img.height > max_height:
                    img.thumbnail((max_width, max_height), Image.Resampling.LANCZOS)
                
                # Save optimized version
                img.save(file_path, optimize=True, quality=quality)
                
                return True
        except Exception as e:
            logger.error(f"Error optimizing image {file_path}: {e}")
            return False
    
    def create_thumbnails(self, file_path, filename):
        """Create thumbnail versions of the image"""
        thumbnails = {}
        
        try:
            with Image.open(file_path) as img:
                for size_name, (width, height) in self.thumbnail_sizes.items():
                    # Create thumbnail
                    thumbnail = img.copy()
                    thumbnail.thumbnail((width, height), Image.Resampling.LANCZOS)
                    
                    # Generate thumbnail filename
                    name, ext = os.path.splitext(filename)
                    thumbnail_filename = f"{name}_{size_name}{ext}"
                    thumbnail_path = os.path.join(self.upload_folder, 'thumbnails', thumbnail_filename)
                    
                    # Save thumbnail
                    thumbnail.save(thumbnail_path, optimize=True, quality=85)
                    thumbnails[size_name] = thumbnail_filename
                    
        except Exception as e:
            logger.error(f"Error creating thumbnails for {file_path}: {e}")
        
        return thumbnails
    
    def upload_image(self, file):
        """
        Upload and process an image file
        Returns: dict with file info or error
        """
        try:
            # Validate file
            if not file or file.filename == '':
                return {'error': 'No file provided'}
            
            if not self.allowed_file(file.filename):
                return {'error': 'File type not allowed'}
            
            # Check file size
            file.seek(0, os.SEEK_END)
            file_size = file.tell()
            file.seek(0)
            
            if file_size > self.max_size_bytes:
                max_size_mb = self.max_size_bytes / (1024 * 1024)
                return {'error': f'File too large. Maximum size is {max_size_mb}MB'}
            
            # Generate secure filename
            original_filename = secure_filename(file.filename)
            unique_filename = self.generate_filename(original_filename)
            file_path = os.path.join(self.upload_folder, unique_filename)
            
            # Save original file
            file.save(file_path)
            
            # Optimize image
            if not self.optimize_image(file_path):
                os.remove(file_path)
                return {'error': 'Failed to process image'}
            
            # Create thumbnails
            thumbnails = self.create_thumbnails(file_path, unique_filename)
            
            # Get file info
            file_info = {
                'filename': unique_filename,
                'original_filename': original_filename,
                'file_size': os.path.getsize(file_path),
                'upload_date': datetime.now().isoformat(),
                'thumbnails': thumbnails,
                'url': f'/api/images/{unique_filename}'
            }
            
            logger.info(f"Successfully uploaded image: {unique_filename}")
            return {'success': True, 'file_info': file_info}
            
        except Exception as e:
            logger.error(f"Error uploading image: {e}")
            return {'error': 'Failed to upload image'}
    
    def get_image_path(self, filename, thumbnail_size=None):
        """Get the full path to an image file"""
        if thumbnail_size and thumbnail_size in self.thumbnail_sizes:
            name, ext = os.path.splitext(filename)
            thumbnail_filename = f"{name}_{thumbnail_size}{ext}"
            return os.path.join(self.upload_folder, 'thumbnails', thumbnail_filename)
        else:
            return os.path.join(self.upload_folder, filename)
    
    def delete_image(self, filename):
        """Delete an image and all its thumbnails"""
        try:
            # Delete main image
            main_path = os.path.join(self.upload_folder, filename)
            if os.path.exists(main_path):
                os.remove(main_path)
            
            # Delete thumbnails
            name, ext = os.path.splitext(filename)
            for size_name in self.thumbnail_sizes:
                thumbnail_filename = f"{name}_{size_name}{ext}"
                thumbnail_path = os.path.join(self.upload_folder, 'thumbnails', thumbnail_filename)
                if os.path.exists(thumbnail_path):
                    os.remove(thumbnail_path)
            
            logger.info(f"Successfully deleted image: {filename}")
            return True
            
        except Exception as e:
            logger.error(f"Error deleting image {filename}: {e}")
            return False
    
    def cleanup_orphaned_files(self, used_filenames):
        """Clean up files that are no longer referenced in the database"""
        try:
            # Get all files in upload directory
            all_files = set()
            for filename in os.listdir(self.upload_folder):
                if os.path.isfile(os.path.join(self.upload_folder, filename)):
                    all_files.add(filename)
            
            # Find orphaned files
            orphaned_files = all_files - set(used_filenames)
            
            # Delete orphaned files
            deleted_count = 0
            for filename in orphaned_files:
                if self.delete_image(filename):
                    deleted_count += 1
            
            logger.info(f"Cleaned up {deleted_count} orphaned image files")
            return deleted_count
            
        except Exception as e:
            logger.error(f"Error during cleanup: {e}")
            return 0

# Global instance
image_service = ImageUploadService()
