import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Phone, Briefcase, Shield, 
  Edit3, Save, X, Trash2, Key, Lock, ChevronDown, ChevronUp, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { userService } from '../../../services/userService';
import { authService } from '../../../services/authService';
const ProfilePage = () => {
  const { user: currentUser, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    phoneNumber: '',
    advocateName: '',
  });
  // Fixed: Initialize with proper structure instead of empty object
  const [originalData, setOriginalData] = useState({
    userName: '',
    email: '',
    phoneNumber: '',
    advocateName: '',
  });
  const [errors, setErrors] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // OTP Verification States
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [otpData, setOtpData] = useState({
    contact: '',
    otp: '',
    isSendingOtp: false,
    isVerifyingOtp: false,
    fieldType: '' // 'email' or 'phoneNumber'
  });
  const [pendingUpdate, setPendingUpdate] = useState(null);

  // Initialize form data when currentUser is available
  useEffect(() => {
    if (currentUser) {
      const userData = {
        userName: currentUser.username || currentUser.userName || '',
        email: currentUser.email || '',
        phoneNumber: currentUser.phoneNumber || '',
        advocateName: currentUser.advocateName || '',
      };
      setFormData(userData);
      setOriginalData(userData);
    }
  }, [currentUser]);

  // Show alert function
  const showAlert = (message, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: '' }), 3000);
  };

  // Clear specific error when field changes
  const clearError = (fieldName) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  };

  // Check if email or phone has changed
  const hasSensitiveChanges = () => {
    return formData.email !== originalData.email || formData.phoneNumber !== originalData.phoneNumber;
  };

  // Get changed sensitive fields
  const getChangedSensitiveFields = () => {
    const changes = [];
    if (formData.email !== originalData.email) {
      changes.push({ 
        type: 'email', 
        value: formData.email, 
        original: originalData.email,
        fieldType: 'email'
      });
    }
    if (formData.phoneNumber !== originalData.phoneNumber) {
      changes.push({ 
        type: 'phone', 
        value: formData.phoneNumber, 
        original: originalData.phoneNumber,
        fieldType: 'phoneNumber'
      });
    }
    return changes;
  };

  const handleSave = async () => {
    if (!currentUser) return;
    
    // Check if sensitive fields changed
    const sensitiveChanges = getChangedSensitiveFields();
    
    if (sensitiveChanges.length > 0) {
      // For now, handle one change at a time. You can extend this to handle multiple changes
      const firstChange = sensitiveChanges[0];
      
      setPendingUpdate({
        formData: { ...formData },
        changeType: firstChange.type,
        contact: firstChange.value,
        fieldType: firstChange.fieldType
      });
      
      // Initiate OTP verification using existing endpoint
      await initiateOtpVerification(firstChange.value, firstChange.fieldType);
      return;
    }
    
    // If no sensitive changes, update directly
    await updateProfileDirectly();
  };

  const initiateOtpVerification = async (contact, fieldType) => {
    setOtpData(prev => ({
      ...prev,
      contact,
      fieldType,
      otp: '',
      isSendingOtp: true
    }));

    try {
      // Use your existing OTP endpoint
      await authService.sendContactVerificationOtp(contact);
      setShowOtpVerification(true);
      showAlert(`Verification code sent to your ${fieldType === 'email' ? 'email' : 'phone'}`, 'info');
    } catch (error) {
      console.error('Error sending OTP:', error);
      const errorMessage = error.data?.error || error.message || 'Failed to send verification code';
      showAlert(errorMessage, 'error');
    } finally {
      setOtpData(prev => ({ ...prev, isSendingOtp: false }));
    }
  };

  const handleOtpVerification = async () => {
    if (!otpData.otp || otpData.otp.length < 4) {
      showAlert('Please enter a valid verification code', 'error');
      return;
    }

    setOtpData(prev => ({ ...prev, isVerifyingOtp: true }));

    try {
      // Use your existing OTP verification endpoint
      await authService.verifyContactVerificationOtp(otpData.contact, otpData.otp);
      
      // OTP verified successfully, proceed with profile update
      await updateProfileWithVerifiedChange();
      
    } catch (error) {
      console.error('Error verifying OTP:', error);
      const errorMessage = error.data?.error || error.message || 'Invalid verification code';
      showAlert(errorMessage, 'error');
    } finally {
      setOtpData(prev => ({ ...prev, isVerifyingOtp: false }));
    }
  };

  const updateProfileWithVerifiedChange = async () => {
    if (!pendingUpdate) return;

    setIsUpdating(true);
    try {
      await userService.updateUserProfile(pendingUpdate.formData);
      
      setEditing(false);
      setShowOtpVerification(false);
      setOriginalData(pendingUpdate.formData);
      setPendingUpdate(null);
      showAlert('Profile updated successfully!');
      
    } catch (error) {
      console.error('Error updating profile:', error);
      handleUpdateError(error);
    } finally {
      setIsUpdating(false);
    }
  };

  const updateProfileDirectly = async () => {
    setIsUpdating(true);
    setErrors({});
    
    try {
      await userService.updateUserProfile(formData);
      
      setEditing(false);
      setOriginalData(formData);
      showAlert('Profile updated successfully!');
      
    } catch (error) {
      console.error('Error updating profile:', error);
      handleUpdateError(error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateError = (error) => {
    if (error.data?.error?.includes('Email already registered') || 
        error.message?.includes('Email already registered')) {
      setErrors({ email: 'Email already registered. Please use a different email address.' });
      showAlert('Email already registered. Please use a different email address.', 'error');
    } else if (error.data?.error?.includes('Mobile number already registered')) {
      setErrors({ phoneNumber: 'Phone number already registered. Please use a different phone number.' });
      showAlert('Phone number already registered. Please use a different phone number.', 'error');
    } else if (error.data?.error) {
      setErrors({ general: error.data.error });
      showAlert(error.data.error, 'error');
    } else if (error.message) {
      setErrors({ general: error.message });
      showAlert(error.message, 'error');
    } else {
      setErrors({ general: 'Failed to update profile. Please try again.' });
      showAlert('Failed to update profile. Please try again.', 'error');
    }
  };

  const handleCancel = () => {
    if (currentUser) {
      setFormData({
        userName: currentUser.username || currentUser.userName || '',
        email: currentUser.email || '',
        phoneNumber: currentUser.phoneNumber || '',
        advocateName: currentUser.advocateName || '',
      });
    }
    setEditing(false);
    setErrors({});
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    clearError(field);
  };

  const handleCancelOtpVerification = () => {
    setShowOtpVerification(false);
    setOtpData({
      contact: '',
      otp: '',
      isSendingOtp: false,
      isVerifyingOtp: false,
      fieldType: ''
    });
    setPendingUpdate(null);
    showAlert('Update cancelled', 'info');
  };

  const handleResendOtp = async () => {
    await initiateOtpVerification(otpData.contact, otpData.fieldType);
  };

  // OTP Verification Modal Component - Fixed: Remove Fragment wrapper
  const OtpVerificationModal = () => (
    <AnimatePresence>
      {showOtpVerification && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={handleCancelOtpVerification}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-100 p-2 rounded-full">
                <Shield size={20} className="text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Verification Required</h3>
                <p className="text-sm text-gray-600">
                  We sent a verification code to your {otpData.fieldType === 'email' ? 'email' : 'phone'}
                </p>
              </div>
            </div>
            
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                For security reasons, we need to verify your new {otpData.fieldType === 'email' ? 'email' : 'phone number'}. 
                Please enter the 6-digit code sent to:
              </p>
              <p className="text-sm font-medium text-blue-900 mt-1">
                {otpData.contact}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  maxLength="6"
                  value={otpData.otp}
                  onChange={(e) => setOtpData(prev => ({ 
                    ...prev, 
                    otp: e.target.value.replace(/\D/g, '') 
                  }))}
                  placeholder="Enter 6-digit code"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-center text-lg font-mono"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleCancelOtpVerification}
                  disabled={otpData.isVerifyingOtp}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResendOtp}
                  disabled={otpData.isSendingOtp}
                  className="flex-1 px-4 py-2 text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {otpData.isSendingOtp ? 'Sending...' : 'Resend Code'}
                </button>
                <button
                  onClick={handleOtpVerification}
                  disabled={otpData.isVerifyingOtp || !otpData.otp || otpData.otp.length !== 6}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {otpData.isVerifyingOtp ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Verifying...
                    </>
                  ) : (
                    'Verify & Update'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Show loading state while user data is being fetched
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Handle delete functions (keep your existing implementation)
  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!currentUser) return;
    
    setShowDeleteConfirm(false);
    
    try {
      await userService.deleteAccount();
      showAlert('Account deleted successfully', 'success');
      logout();
    } catch (error) {
      console.error('Error deleting account:', error);
      showAlert('Failed to delete account. Please try again.', 'error');
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const handleUpdatePassword = async (passwordData) => {
    try {
      await userService.updatePassword(
        passwordData.currentPassword, 
        passwordData.newPassword
      );
      showAlert('Password updated successfully!');
      return true;
    } catch (error) {
      console.error('Error updating password:', error);
      
      // Handle password update errors
      let errorMessage = 'Failed to update password. Please try again.';
      if (error.data?.error) {
        errorMessage = error.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showAlert(errorMessage, 'error');
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {/* Alert Notification */}
      {alert.show && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          alert.type === 'error' ? 'bg-red-500' : 
          alert.type === 'info' ? 'bg-blue-500' : 'bg-green-500'
        } text-white`}>
          {alert.message}
        </div>
      )}

      {/* NEW: OTP Verification Modal - Added to main return */}
      <OtpVerificationModal />

      {/* Delete Account Confirmation Modal - Fixed: Remove Fragment wrapper */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={handleCancelDelete}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-red-100 p-2 rounded-full">
                  <AlertTriangle size={20} className="text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Account</h3>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-600 mb-2">
                  <strong>Warning:</strong> This action cannot be undone. This will permanently delete:
                </p>
                <ul className="text-sm text-gray-600 space-y-1 ml-4">
                  <li>• Your account information</li>
                  <li>• All your case subscriptions</li>
                  <li>• Your personal data</li>
                  <li>• All associated records</li>
                </ul>
                <p className="text-red-600 font-medium mt-3">
                  Are you sure you want to delete your account?
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleCancelDelete}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 justify-center"
                >
                  <Trash2 size={16} />
                  Delete Account
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ProfileHeader />
          </div>
          <div className="lg:col-span-1">
            <CaseSummaryCard user={currentUser} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2">
            <AccountInfoCard 
              user={currentUser}
              editing={editing}
              formData={formData}
              errors={errors}
              onEditToggle={() => setEditing(!editing)}
              onSave={handleSave}
              onCancel={handleCancel}
              onChange={handleChange}
              isUpdating={isUpdating}
            />
          </div>
          <div className="lg:col-span-1">
            <SecurityCard 
              onDelete={handleDeleteClick}
              onUpdatePassword={handleUpdatePassword}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Keep all your existing sub-components (ProfileHeader, AccountInfoCard, etc.) exactly as you have them
// They look great and don't need modification for this integration

const ProfileHeader = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full bg-white rounded-2xl p-6 shadow-lg"
    >
      <div className="flex items-center gap-4">
        <div className="bg-indigo-100 p-3 rounded-full">
          <User size={32} className="text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600">Manage your account information and preferences</p>
        </div>
      </div>
    </motion.div>
  );
};

// Include all your other sub-components (AccountInfoCard, CaseSummaryCard, SecurityCard, InputField, InfoRow, StatItem) 
// exactly as you have them in your original code - they work perfectly with your new OTP system
// Account Info Card Component with error display
const AccountInfoCard = ({ user, editing, formData, errors, onEditToggle, onSave, onCancel, onChange, isUpdating }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 }}
      className="h-full bg-white rounded-2xl p-6 shadow-lg"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-100 p-2 rounded-lg">
          <User size={20} className="text-blue-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Account Information</h2>
      </div>

      {/* General Error Display */}
      {errors.general && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg">
          <p className="text-red-700 text-sm">{errors.general}</p>
        </div>
      )}

      {editing ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Username"
            type="text"
            value={formData.userName}
            onChange={(val) => onChange('userName', val)}
            placeholder="Enter your username"
            icon={<User size={18} />}
            error={errors.userName}
          />
          <InputField
            label="Email"
            type="email"
            value={formData.email}
            onChange={(val) => onChange('email', val)}
            placeholder="Enter your email"
            icon={<Mail size={18} />}
            error={errors.email}
          />
          <InputField
            label="Phone Number"
            type="tel"
            value={formData.phoneNumber}
            onChange={(val) => onChange('phoneNumber', val)}
            placeholder="Enter your phone number"
            icon={<Phone size={18} />}
            error={errors.phoneNumber}
          />
          {user.role === 'advocate' && (
            <InputField
              label="Advocate Name"
              type="text"
              value={formData.advocateName}
              onChange={(val) => onChange('advocateName', val)}
              placeholder="Enter your advocate name"
              icon={<Briefcase size={18} />}
              error={errors.advocateName}
            />
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <InfoRow label="Username" value={formData.userName} />
          <InfoRow label="Email" value={formData.email} />
          <InfoRow label="Phone Number" value={formData.phoneNumber} />
          {user.role === 'advocate' && (
            <InfoRow label="Advocate Name" value={formData.advocateName} />
          )}
          <InfoRow label="Role" value={user.role} />
        </div>
      )}

      <div className="mt-8 flex justify-end gap-2">
        {!editing ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
            onClick={onEditToggle}
          >
            <Edit3 size={16} />
            Edit Information
          </motion.button>
        ) : (
          <>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium"
              onClick={onCancel}
              disabled={isUpdating}
            >
              <X size={16} />
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
              onClick={onSave}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Changes
                </>
              )}
            </motion.button>
          </>
        )}
      </div>
    </motion.div>
  );
};

// Case Summary Card Component
const CaseSummaryCard = ({ user }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="h-full bg-white rounded-2xl p-6 shadow-lg flex flex-col"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-green-100 p-2 rounded-lg">
          <User size={20} className="text-green-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">User Summary</h2>
      </div>

      <div className="space-y-4 flex-grow">
        <StatItem 
          icon={<User size={18} className="text-blue-600" />}
          label="Account Type"
          value={user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}
          bgColor="bg-blue-50"
        />
        <StatItem 
          icon={<Mail size={18} className="text-amber-600" />}
          label="Email Verified"
          value={user.isVerified ? 'Yes' : 'No'}
          bgColor={user.isVerified ? 'bg-green-50' : 'bg-amber-50'}
        />
      </div>
    </motion.div>
  );
};

// Security Card Component with Collapsible Password Section
const SecurityCard = ({ onDelete, onUpdatePassword }) => {
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  
  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };
  
  const handlePasswordUpdate = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    
    setIsUpdatingPassword(true);
    try {
      const success = await onUpdatePassword(passwordData);
      if (success) {
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setShowPasswordForm(false);
      }
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
      className="h-full bg-white rounded-2xl p-6 shadow-lg"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-red-100 p-2 rounded-lg">
          <Shield size={20} className="text-red-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Security Settings</h2>
      </div>

      <div className="space-y-5">
        {/* Change Password Section - Collapsible */}
        <div>
          <button
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="w-full flex items-center justify-between p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2">
              <Key size={18} className="text-gray-700" />
              <span className="font-medium text-gray-800">Change Password</span>
            </div>
            {showPasswordForm ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          <AnimatePresence>
            {showPasswordForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-3 overflow-hidden"
              >
                <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
                  <InputField
                    label="Current Password"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(val) => handlePasswordChange('currentPassword', val)}
                    placeholder="Enter current password"
                    icon={<Lock size={16} />}
                  />
                  <InputField
                    label="New Password"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(val) => handlePasswordChange('newPassword', val)}
                    placeholder="Enter new password"
                    icon={<Lock size={16} />}
                  />
                  <InputField
                    label="Confirm New Password"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(val) => handlePasswordChange('confirmPassword', val)}
                    placeholder="Confirm new password"
                    icon={<Lock size={16} />}
                  />
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium mt-2"
                    onClick={handlePasswordUpdate}
                    disabled={isUpdatingPassword}
                  >
                    {isUpdatingPassword ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Updating...
                      </>
                    ) : (
                      'Update Password'
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="pt-4 border-t border-gray-200">
          <h3 className="font-medium text-gray-800 mb-3">Danger Zone</h3>
          <p className="text-gray-600 text-sm mb-4">Permanently delete your account and all data</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-red-100 hover:bg-red-200 text-red-700 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2"
            onClick={onDelete}
          >
            <Trash2 size={16} />
            Delete Account
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

// Updated Input Field Component with error display
const InputField = ({ label, type, value, onChange, placeholder, icon, error }) => {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
          {icon}
        </div>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
        />
      </div>
      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}
    </div>
  );
};

// Reusable Info Row Component
const InfoRow = ({ label, value }) => {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
      <span className="text-gray-600 font-medium">{label}</span>
      <span className="text-gray-900">{value || 'Not provided'}</span>
    </div>
  );
};

// Reusable Stat Item Component
const StatItem = ({ icon, label, value, bgColor }) => {
  return (
    <div className={`flex items-center justify-between p-4 ${bgColor} rounded-lg`}>
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white rounded-lg shadow-sm">
          {icon}
        </div>
        <span className="text-gray-700">{label}</span>
      </div>
      <span className="font-bold text-gray-900">{value}</span>
    </div>
  );
};

export default ProfilePage;