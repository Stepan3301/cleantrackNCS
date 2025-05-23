import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/components/ui/use-toast';
import {
  User, 
  Lock, 
  Loader2, 
  Save, 
  Camera
} from 'lucide-react';
import '../styles/modern-settings.css';
import ProfileImageUpload from '@/components/ProfileImageUpload';
import { fileUploadService } from '@/lib/services/file-upload-service';
import { profilesService } from '@/lib/services/profiles-service';

export const Settings = () => {
  const { user, updateUserProfile } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Form state
  const [firstName, setFirstName] = useState(user?.name?.split(' ')[0] || '');
  const [lastName, setLastName] = useState(user?.name?.split(' ')[1] || '');
  const [email, setEmail] = useState(user?.email || '');
  const [address, setAddress] = useState(user?.address || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formIsDirty, setFormIsDirty] = useState(false);

  // Apply modern-settings class to body
  useEffect(() => {
    document.body.classList.add('modern-settings');
    return () => {
      document.body.classList.remove('modern-settings');
    };
  }, []);

  // Set initial form values from user context
  useEffect(() => {
    if (user) {
      const nameParts = user.name?.split(' ') || ['', ''];
      setFirstName(nameParts[0] || '');
      setLastName(nameParts.slice(1).join(' ') || '');
      setEmail(user.email || '');
      setAddress(user.address || '');
      setPhoneNumber(user.phone_number || '');
    }
  }, [user]);

  // Track form changes
  useEffect(() => {
    if (user) {
      const nameParts = user.name?.split(' ') || ['', ''];
      const originalFirstName = nameParts[0] || '';
      const originalLastName = nameParts.slice(1).join(' ') || '';
      
      const isDirty = 
        firstName !== originalFirstName ||
        lastName !== originalLastName ||
        address !== (user.address || '') ||
        phoneNumber !== (user.phone_number || '');
      
      setFormIsDirty(isDirty);
    }
  }, [firstName, lastName, address, phoneNumber, user]);

  const handleImageUpload = async (file: File) => {
    if (!user) return;
    
    try {
      setIsUploadingImage(true);
      
      // 1. Upload the file to storage
      const imageUrl = await fileUploadService.uploadProfileImage(user.id, file);
      
      // 2. Update the user's profile with the new avatar URL
      await profilesService.updateProfileAvatar(user.id, imageUrl);
      
      // 3. Update the local user state
      if (updateUserProfile) {
        await updateUserProfile(user.id, { avatar_url: imageUrl });
      }
      
      toast({
        title: "Profile picture updated",
        description: "Your profile picture has been updated successfully"
      });
      
      return imageUrl;
    } catch (error: any) {
      console.error('Error uploading profile image:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload profile image",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsUploadingImage(false);
    }
  };
  
  const handleImageRemove = async () => {
    if (!user || !user.avatar_url) return;
    
    try {
      setIsUploadingImage(true);
      
      // 1. Delete the file from storage
      await fileUploadService.deleteProfileImage(user.avatar_url);
      
      // 2. Update the user's profile to remove the avatar URL
      await profilesService.updateProfileAvatar(user.id, null);
      
      // 3. Update the local user state
      if (updateUserProfile) {
        await updateUserProfile(user.id, { avatar_url: null });
      }
      
      toast({
        title: "Profile picture removed",
        description: "Your profile picture has been removed"
      });
    } catch (error: any) {
      console.error('Error removing profile image:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove profile image",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsUploadingImage(false);
    }
  };

  const onProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    try {
      setIsUpdatingProfile(true);
      
      // Prepare updated user data
      const fullName = `${firstName} ${lastName}`.trim();
      const userData = {
        name: fullName,
        phone_number: phoneNumber || null,
        address: address || null
      };
      
      // Call the updateUserProfile function from auth context
      const success = await updateUserProfile(user.id, userData);
      
      if (success) {
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully"
        });
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const onPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Please make sure your passwords match",
        variant: "destructive"
      });
      return;
    }
    
    if (newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsUpdatingPassword(true);
      
      // Here you would implement your password update logic
      // For example, using the authentication service
      
      // Simulate API call with timeout
      setTimeout(() => {
        toast({
          title: "Password updated",
          description: "Your password has been updated successfully"
        });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setIsUpdatingPassword(false);
      }, 1500);
      
    } catch (error: any) {
      console.error('Error updating password:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update password",
        variant: "destructive"
      });
      setIsUpdatingPassword(false);
    }
  };

  const renderProfileTab = () => {
    return (
      <div className="settings-fade-in">
        <div className="settings-card">
          <div className="settings-card-header">
            <h3 className="settings-card-title">Profile Information</h3>
            <p className="settings-card-description">Update your personal information</p>
          </div>
          <div className="settings-card-content">
            <form onSubmit={onProfileSubmit}>
              <div className="settings-profile-section">
                <div className="settings-avatar-container">
                  <ProfileImageUpload
                    initialImageUrl={user?.avatar_url}
                    onImageUpload={handleImageUpload}
                    onImageRemove={handleImageRemove}
                  />
                </div>
                
                <div className="settings-form-section">
                  <div className="settings-form-grid">
                    <div className="settings-form-field">
                      <label className="settings-form-label">First Name</label>
                      <div className="relative">
                        <input
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="settings-form-input"
                          placeholder="John"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="settings-form-field">
                      <label className="settings-form-label">Last Name</label>
                      <div className="relative">
                        <input
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="settings-form-input"
                          placeholder="Doe"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="settings-form-field">
                      <label className="settings-form-label">Email Address</label>
                      <div className="relative">
                        <input
                          value={email}
                          className="settings-form-input"
                          placeholder="john.doe@example.com"
                          disabled
                        />
                      </div>
                    </div>
                    
                    <div className="settings-form-field">
                      <label className="settings-form-label">Phone Number</label>
                      <div className="relative">
                        <input
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="settings-form-input"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="settings-form-field">
                    <label className="settings-form-label">Address</label>
                    <div className="relative">
                      <input
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="settings-form-input"
                        placeholder="123 Main St, City, State"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="settings-card-footer">
                <button 
                  type="submit" 
                  className="settings-button"
                  disabled={isUpdatingProfile || (!formIsDirty && !isUploadingImage)}
                >
                  {isUpdatingProfile ? (
                    <>
                      <Loader2 className="settings-button-icon" size={16} />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const renderPasswordTab = () => {
    return (
      <div className="settings-fade-in">
        <div className="settings-card">
          <div className="settings-card-header">
            <h3 className="settings-card-title">Change Password</h3>
            <p className="settings-card-description">Update your password to keep your account secure</p>
          </div>
          <div className="settings-card-content">
            <form onSubmit={onPasswordSubmit}>
              <div className="settings-form-field">
                <label className="settings-form-label">Current Password</label>
                <div className="relative">
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="settings-form-input"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
              
              <div className="settings-form-field">
                <label className="settings-form-label">New Password</label>
                <div className="relative">
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="settings-form-input"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
              </div>
              
              <div className="settings-form-field">
                <label className="settings-form-label">Confirm New Password</label>
                <div className="relative">
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="settings-form-input"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
              
              <div className="settings-card-footer">
                <button 
                  type="submit" 
                  className="settings-button"
                  disabled={isUpdatingPassword}
                >
                  {isUpdatingPassword ? (
                    <>
                      <Loader2 className="settings-button-icon" size={16} />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Lock size={16} />
                      Update Password
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="settings-container">
      <div className="settings-page-header">
        <div>
          <h1 className="settings-page-title">Settings</h1>
          <p className="settings-page-subtitle">Manage your account settings and preferences</p>
        </div>
      </div>
      
      <div className="settings-tabs">
        <div className="settings-tabs-list">
          <div 
            className={`settings-tab ${activeTab === 'profile' ? 'active' : ''}`} 
            onClick={() => setActiveTab('profile')}
          >
            <User className="settings-tab-icon" />
            Profile
          </div>
          <div 
            className={`settings-tab ${activeTab === 'password' ? 'active' : ''}`} 
            onClick={() => setActiveTab('password')}
          >
            <Lock className="settings-tab-icon" />
            Password
          </div>
        </div>
      </div>
      
      {activeTab === 'profile' && renderProfileTab()}
      {activeTab === 'password' && renderPasswordTab()}
    </div>
  );
};

export default Settings;
