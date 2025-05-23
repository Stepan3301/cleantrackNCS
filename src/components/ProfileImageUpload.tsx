import React, { useState, useRef } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProfileImageUploadProps {
  initialImageUrl?: string | null;
  onImageUpload: (file: File) => Promise<string | void>;
  onImageRemove?: () => Promise<void>;
}

const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({
  initialImageUrl,
  onImageUpload,
  onImageRemove
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialImageUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    // Create a preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload the file
    try {
      setIsUploading(true);
      const result = await onImageUpload(file);
      if (result) {
        setPreviewUrl(result);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
      setPreviewUrl(initialImageUrl);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (onImageRemove) {
      try {
        setIsUploading(true);
        await onImageRemove();
        setPreviewUrl(null);
      } catch (error) {
        console.error('Error removing image:', error);
        alert('Failed to remove image. Please try again.');
      } finally {
        setIsUploading(false);
      }
    } else {
      setPreviewUrl(null);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="profile-image-upload">
      <div className="image-container relative w-32 h-32">
        {previewUrl ? (
          <>
            <img 
              src={previewUrl} 
              alt="Profile" 
              className="w-full h-full object-cover rounded-full border-4 border-primary/20"
            />
            <button 
              onClick={handleRemoveImage}
              className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
              type="button"
              disabled={isUploading}
            >
              <X size={16} />
            </button>
          </>
        ) : (
          <div className="w-full h-full rounded-full bg-primary/10 flex items-center justify-center">
            <Camera size={40} className="text-primary/40" />
          </div>
        )}
        
        {isUploading && (
          <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>

      <div className="mt-4">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/png, image/jpeg, image/gif"
          className="hidden"
          id="profile-image-input"
        />
        <Button 
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="mt-2"
        >
          <Upload size={16} className="mr-2" />
          {previewUrl ? 'Change Image' : 'Upload Image'}
        </Button>
      </div>
    </div>
  );
};

export default ProfileImageUpload; 