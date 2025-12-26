// src/services/userService.js
import { request } from './httpClient';

export const getUserProfile = async () => {
  return request('/user/profile');
};

export const updateUserProfile = async (profileData) => {
  return request('/user/profile', {
    method: 'PUT',
    body: profileData
  });
};

export const updatePassword = async (currentPassword, newPassword) => {
  return request('/user/update-password', {
    method: 'POST',
    body: { currentPassword, newPassword }
  });
};

export const deleteAccount = async () => {
  return request('/user/account', {
    method: 'DELETE'
  });
};

export const userService = {
  getUserProfile,
  updateUserProfile,
  updatePassword,
  deleteAccount
};

export default userService;