import { request } from './httpClient';

// Authentication functions
export const login = async (username, password) => {
  const data = await request('/auth/login', {
    method: 'POST',
    body: { username, password },
    isPublic: true,
  });
  sessionStorage.setItem('accessToken', data.accessToken);
  return data;
};

export const logout = async () => {
  await request('/auth/logout', { method: 'POST', isPublic: true });
  sessionStorage.removeItem('accessToken');
};

export const register = async (userData) => {
  return request('/user/register', { 
    method: 'POST', 
    body: userData, 
    isPublic: true 
  });
};

// FIXED: Corrected typo in function names and endpoints
export const sendContactVerificationOtp = async (contact) => {
  return request('/user/send-contact-verification-otp', { 
    method: 'POST', 
    body: { contact }, 
    isPublic: true 
  });
};

export const verifyContactVerificationOtp = async (contact, otp) => {
  return request('/user/verify-contact-verification-otp', { 
    method: 'POST', 
    body: { contact, otp }, 
    isPublic: true 
  });
};

export const sendPasswordResetOtp = async (contact) => {
  return request('/user/send-password-reset-otp', { 
    method: 'POST', 
    body: { contact }, 
    isPublic: true 
  });
};

export const verifyPasswordResetOtp = async (contact, otp) => {
  return request('/user/verify-password-reset-otp', { 
    method: 'POST', 
    body: { contact, otp }, 
    isPublic: true 
  });
};

export const resetPassword = async (contact, newPassword) => {
  return request('/user/reset-password', { 
    method: 'POST', 
    body: { contact, newPassword }, 
    isPublic: true 
  });
};

// Export all functions as named exports and default object
export const authService = {
  login,
  logout,
  register,
  sendContactVerificationOtp,
  verifyContactVerificationOtp,
  sendPasswordResetOtp,
  verifyPasswordResetOtp,
  resetPassword
};

export default authService;