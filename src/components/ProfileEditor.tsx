import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Save, X, Shield, Award, CalendarCheck, BookOpen, Target } from 'lucide-react';
import { User as UserType } from '../types';
import { toast } from '../utils/toast';
import { ImageUploader } from './ImageUploader';

// Extend the User type with role-specific fields
interface ExtendedUser extends UserType {
  username?: string;
  avatar?: string;
  avatarType?: 'base64' | 'file' | 'url';
  avatarFilename?: string;
  // Admin fields
  systemAccess?: string;
  // Counselor fields
  specialization?: string;
  certification?: string;
  experience?: string;
  availability?: string;
  // Student fields
  tingkat?: string;
  kelas?: string;
  interests?: string;
  careerGoals?: string;
}

interface ProfileEditorProps {
  user: UserType;
  onUpdate: (user: Partial<UserType>) => Promise<void>;
}

export const ProfileEditor: React.FC<ProfileEditorProps> = ({ user, onUpdate }) => {
  const { t } = useLanguage();
  // Cast user to ExtendedUser to access the role-specific fields
  const extendedUser = user as ExtendedUser;
    const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [username, setUsername] = useState(user.username || '');  const [photo, setPhoto] = useState<string | null>(user.photo || null);
  const [avatarType, setAvatarType] = useState<'base64' | 'file' | 'url'>('url');
  const [avatarFilename, setAvatarFilename] = useState<string | undefined>(undefined);
  
  // Admin specific fields
  const [systemAccess, setSystemAccess] = useState(extendedUser.systemAccess || 'Full Access');
  
  // Counselor specific fields
  const [specialization, setSpecialization] = useState(extendedUser.specialization || '');
  const [certification, setCertification] = useState(extendedUser.certification || '');
  const [experience, setExperience] = useState(extendedUser.experience || '');
  const [availability, setAvailability] = useState(extendedUser.availability || '');
  
  // Student specific fields
  const [grade, setGrade] = useState(extendedUser.tingkat || '');
  const [className, setClassName] = useState(extendedUser.kelas || '');
  const [interests, setInterests] = useState(extendedUser.interests || '');
  const [careerGoals, setCareerGoals] = useState(extendedUser.careerGoals || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleImageChange = (imageData: {
    type: 'base64' | 'file' | 'url';
    url: string;
    filename?: string;
  }) => {
    setPhoto(imageData.url);
    setAvatarType(imageData.type);
    setAvatarFilename(imageData.filename);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate username hasn't been changed if user already exists
      if (user.userId && user.username && username !== user.username) {
        throw new Error('Username cannot be modified after account creation');
      }      // Create the base update data
      const updateData: Partial<ExtendedUser> = {
        name,
        email,
        photo: photo || undefined,
        avatar: photo || undefined, // Also update avatar field for consistency
        avatarType,
        avatarFilename,
        username,
        userId: user.userId // Keep the original userId, don't allow changes
      };
      
      // Add role-specific data to the update
      if (user.role === 'admin') {
        updateData.systemAccess = systemAccess;
      } else if (user.role === 'counselor') {
        updateData.specialization = specialization;
        updateData.certification = certification;
        updateData.experience = experience;
        updateData.availability = availability;
      } else if (user.role === 'student') {
        updateData.tingkat = grade;
        updateData.kelas = className;
        updateData.interests = interests;
        updateData.careerGoals = careerGoals;
      }
        await onUpdate(updateData as Partial<UserType>);
      toast.success(t('profile.profileUpdated'));
    } catch (error) {
      toast.error((error as Error).message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {t('profile.customizeYourProfile')}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-8">        {/* Profile photo section */}
        <div className="p-6 bg-gray-50 rounded-lg border border-gray-100">          <h3 className="text-lg font-medium text-gray-800 mb-4">
            {t('profile.visualIdentity')}
          </h3>
          <ImageUploader
            currentImage={photo || ''}
            onImageChange={handleImageChange}
            label={t('profile.photo', 'Profile Photo')}
            className="w-full"
          />
        </div>

        {/* Personal information */}
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {t('profile.aboutYou')}
          </h3>          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                {t('profile.name')}
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full px-4 py-3 rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                {t('profile.email')}
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full px-4 py-3 rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                {t('profile.username')}
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full px-4 py-3 rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
                  disabled={!!user.userId} // Disable editing if user already has an ID
                />
                {!!user.userId && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-gray-400 text-xs">Non-editable</span>
                  </div>
                )}
              </div>
              {!!user.userId && (
                <p className="mt-1 text-xs text-gray-500">Username cannot be changed after account creation.</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Role-specific fields - significantly enhanced */}
        <div className="pb-6">
          <div className="flex items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900">{t('profile.roleSpecificDetails')}</h3>
            <div className="ml-3 px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-semibold rounded-full">
              {t(`roles.${user.role}`)}
            </div>
          </div>
          
          {/* Admin-specific fields */}
          {user.role === 'admin' && (
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <Shield className="h-6 w-6 text-indigo-600 mr-2" />
                <h4 className="text-md font-semibold text-indigo-900">{t('profile.adminCapabilities')}</h4>
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                <div className="bg-white rounded-lg p-4 shadow-sm border border-indigo-100">
                  <label htmlFor="systemAccess" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('profile.systemAccess')}
                  </label>
                  <p className="text-xs text-gray-500 mb-3">{t('profile.systemAccessDescription')}</p>
                  
                  <div className="flex flex-col space-y-2">
                    {['Full Access', 'Limited Access', 'Read Only'].map(access => (
                      <label key={access} className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="systemAccess"
                          value={access}
                          checked={systemAccess === access}
                          onChange={() => setSystemAccess(access)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                        />
                        <span className="ml-3 text-sm font-medium text-gray-700">{access}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
            
          {/* Counselor-specific fields */}
          {user.role === 'counselor' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 rounded-xl overflow-hidden">
                  <div className="bg-blue-100 px-4 py-3 flex items-center">
                    <Award className="h-5 w-5 text-blue-700 mr-2" />
                    <h4 className="text-sm font-semibold text-blue-800">{t('profile.expertise')}</h4>
                  </div>
                  <div className="p-4">
                    <div className="mb-4">
                      <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-1">
                        {t('profile.specialization')}
                      </label>
                      <input
                        type="text"
                        id="specialization"
                        value={specialization}
                        onChange={(e) => setSpecialization(e.target.value)}
                        className="block w-full px-4 py-3 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 sm:text-sm"
                        placeholder={t('profile.specializationPlaceholder')}
                      />
                    </div>
                    <div>
                      <label htmlFor="certification" className="block text-sm font-medium text-gray-700 mb-1">
                        {t('profile.certification')}
                      </label>
                      <input
                        type="text"
                        id="certification"
                        value={certification}
                        onChange={(e) => setCertification(e.target.value)}
                        className="block w-full px-4 py-3 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 sm:text-sm"
                        placeholder={t('profile.certificationPlaceholder')}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 rounded-xl overflow-hidden">
                  <div className="bg-green-100 px-4 py-3 flex items-center">
                    <CalendarCheck className="h-5 w-5 text-green-700 mr-2" />
                    <h4 className="text-sm font-semibold text-green-800">{t('profile.availability')}</h4>
                  </div>
                  <div className="p-4">
                    <div className="mb-4">
                      <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
                        {t('profile.experience')}
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          id="experience"
                          value={experience}
                          onChange={(e) => setExperience(e.target.value)}
                          className="block w-full px-4 py-3 pr-12 rounded-md border border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50 sm:text-sm"
                          placeholder="e.g., 5 years"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">years</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="availability" className="block text-sm font-medium text-gray-700 mb-1">
                        {t('profile.schedule')}
                      </label>
                      <input
                        type="text"
                        id="availability"
                        value={availability}
                        onChange={(e) => setAvailability(e.target.value)}
                        className="block w-full px-4 py-3 rounded-md border border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50 sm:text-sm"
                        placeholder="e.g., Mon-Fri, 9AM-5PM"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
            
          {/* Student-specific fields */}
          {user.role === 'student' && (
            <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
                  <div className="flex items-center mb-3">
                    <BookOpen className="h-5 w-5 text-blue-600 mr-2" />
                    <h4 className="text-sm font-semibold text-blue-900">{t('profile.academicInfo')}</h4>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-1">
                        {t('profile.grade')}
                      </label>
                      <select
                        id="grade"
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                        className="block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 sm:text-sm"
                      >
                        <option value="">Select Grade</option>
                        {['X', 'XI', 'XII'].map(g => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="className" className="block text-sm font-medium text-gray-700 mb-1">
                        {t('profile.class')}
                      </label>
                      <select
                        id="className"
                        value={className}
                        onChange={(e) => setClassName(e.target.value)}
                        className="block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 sm:text-sm"
                      >
                        <option value="">Select Class</option>
                        {['IPA-1', 'IPA-2', 'IPA-3', 'IPS-1', 'IPS-2'].map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-4 shadow-sm border border-purple-100">
                  <div className="flex items-center mb-3">
                    <Target className="h-5 w-5 text-purple-600 mr-2" />
                    <h4 className="text-sm font-semibold text-purple-900">{t('profile.careerPreferences')}</h4>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="interests" className="block text-sm font-medium text-gray-700 mb-1">
                        {t('profile.interests')}
                      </label>
                      <textarea
                        id="interests"
                        value={interests}
                        onChange={(e) => setInterests(e.target.value)}
                        rows={2}
                        className="block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50 sm:text-sm"
                        placeholder={t('profile.interestsPlaceholder')}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="careerGoals" className="block text-sm font-medium text-gray-700 mb-1">
                        {t('profile.careerGoals')}
                      </label>
                      <textarea
                        id="careerGoals"
                        value={careerGoals}
                        onChange={(e) => setCareerGoals(e.target.value)}
                        rows={2}
                        className="block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50 sm:text-sm"
                        placeholder={t('profile.careerGoalsPlaceholder')}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
          >
            <X className="h-4 w-4 mr-2" />
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center px-5 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('profile.saving')}...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {t('profile.saveChanges')}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileEditor;