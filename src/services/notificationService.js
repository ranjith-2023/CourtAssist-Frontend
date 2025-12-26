// src/services/notificationService.js
import { request } from './httpClient';

export const notificationService = {
  getUserNotifications: async (userId) => {
    if (!userId) {
      throw new Error('User ID is required');
    }
    return request(`/notifications/user/${userId}`);
  },

  markAsRead: async (notificationId) => {
    if (!notificationId) {
      throw new Error('Notification ID is required');
    }
    return request(`/notifications/${notificationId}/read`, {
      method: 'PUT'
    });
  },

  markAllAsRead: async (userId) => {
    if (!userId) {
      throw new Error('User ID is required');
    }
    return request(`/notifications/user/${userId}/read-all`, {
      method: 'PUT'
    });
  },

  getUnreadCount: async (userId) => {
    if (!userId) {
      throw new Error('User ID is required');
    }
    const response = await request(`/notifications/user/${userId}/unread-count`);
    return response.count || response;
  }
};