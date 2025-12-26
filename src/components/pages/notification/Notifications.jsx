import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, Clock, Calendar, MapPin, Scale, AlertCircle, RefreshCw, User, Users, Gavel, Mail } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { notificationService } from '../../../services/notificationService';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  // Debug: Log user object to see its structure
  useEffect(() => {
    console.log('User object:', user);
  }, [user]);

  useEffect(() => {
    const userId = getUserUserId();
    if (userId) {
      fetchNotifications(userId);
    }
  }, [user]);

  // Helper function to safely extract userId from user object
  const getUserUserId = () => {
    if (!user) return null;
    
    // Try different possible property names for userId
    return user.userId || user.id || user._id || user.sub;
  };

  const fetchNotifications = async (userId) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching notifications for user ID:', userId);
      const data = await notificationService.getUserNotifications(userId);
      setNotifications(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    const userId = getUserUserId();
    if (userId) {
      setRefreshing(true);
      fetchNotifications(userId);
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, isRead: true } 
            : notification
        )
      );
    } catch (err) {
      setError(err.message);
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    const userId = getUserUserId();
    if (!userId) {
      setError('User ID not available');
      return;
    }

    try {
      await notificationService.markAllAsRead(userId);
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );
    } catch (err) {
      setError(err.message);
      console.error('Error marking all notifications as read:', err);
    }
  };

  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTimeToHearing = (hearingDateTime) => {
    const now = new Date();
    const hearingDate = new Date(hearingDateTime);
    const diffMs = hearingDate - now;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) return `in ${diffDays} day${diffDays !== 1 ? 's' : ''}`;
    if (diffHours > 0) return `in ${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
    return 'soon';
  };

  const formatCreationTime = (createdAt) => {
    const now = new Date();
    const createdDate = new Date(createdAt);
    const diffMs = now - createdDate;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    
    return formatDateTime(createdAt);
  };

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md w-full">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md w-full">
        <div className="flex items-center text-red-500 mb-4">
          <AlertCircle className="mr-2" size={20} />
          Error loading notifications
        </div>
        <button 
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const userId = getUserUserId();

  return (
    <div className="p-6 bg-white rounded-lg shadow-md w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
          <Bell className="mr-2" size={24} />
          Notifications
          {unreadCount > 0 && (
            <span className="ml-2 bg-red-500 text-white text-sm font-medium px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </h2>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing || !userId}
            className="p-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
            title="Refresh notifications"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
          </button>
          {unreadCount > 0 && userId && (
            <button
              onClick={markAllAsRead}
              className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              <CheckCircle size={16} className="mr-1" />
              Mark all as read
            </button>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Bell size={48} className="mx-auto mb-4 text-gray-300" />
          <p>You have no notifications</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map(notification => (
            <div
              key={notification.id}
              className={`border rounded-lg p-4 transition-all duration-200 ${
                notification.isRead 
                  ? 'bg-gray-50 border-gray-200' 
                  : 'bg-blue-50 border-blue-200 shadow-sm'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  {/* Header with Case Reference and Status */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <Scale size={18} className="text-blue-600 mr-2" />
                      <h3 className="font-semibold text-gray-900">
                        Case Ref: {notification.caseRef}
                      </h3>
                      {!notification.isRead && (
                        <span className="ml-2 bg-blue-500 h-2 w-2 rounded-full"></span>
                      )}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Mail size={14} className="mr-1" />
                      <span>Hearing ID: {notification.hearingId}</span>
                    </div>
                  </div>

                  {/* Hearing Date and Time Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700 mb-3 p-3 bg-white rounded border">
                    <div className="flex items-center">
                      <Calendar size={16} className="mr-2 text-green-600" />
                      <div>
                        <div className="font-medium">Hearing Date</div>
                        <div>{new Date(notification.hearingDate).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Clock size={16} className="mr-2 text-orange-600" />
                      <div>
                        <div className="font-medium">Hearing Time</div>
                        <div>{notification.hearingTime}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Clock size={16} className="mr-2 text-blue-600" />
                      <div>
                        <div className="font-medium">Time to Hearing</div>
                        <div>{formatTimeToHearing(`${notification.hearingDate}T${notification.hearingTime}`)}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <MapPin size={16} className="mr-2 text-purple-600" />
                      <div>
                        <div className="font-medium">Court</div>
                        <div>{notification.court}</div>
                      </div>
                    </div>
                  </div>

                  {/* Case Stage */}
                  {notification.stage && (
                    <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                      <div className="flex items-center text-sm">
                        <Gavel size={14} className="mr-2 text-yellow-600" />
                        <span className="font-medium text-yellow-800">Stage:</span>
                        <span className="ml-1 text-yellow-700">{notification.stage}</span>
                      </div>
                    </div>
                  )}

                  {/* Parties and Advocates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-3">
                    <div className="space-y-2">
                      <div className="flex items-center font-medium text-gray-700">
                        <Users size={14} className="mr-2" />
                        Parties Involved
                      </div>
                      <div className="pl-6 text-gray-600">
                        {notification.parties ? (
                          <div>{notification.parties}</div>
                        ) : (
                          <div className="text-gray-400">No parties information</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center font-medium text-gray-700">
                        <User size={14} className="mr-2" />
                        Advocates
                      </div>
                      <div className="pl-6 text-gray-600">
                        {notification.advocates ? (
                          <div>{notification.advocates}</div>
                        ) : (
                          <div className="text-gray-400">No advocates information</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Footer with Metadata */}
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                    <div className="text-xs text-gray-500">
                      Created: {formatCreationTime(notification.createdAt)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {notification.isSent ? 'Sent' : 'Pending'}
                    </div>
                  </div>
                </div>
                
                {/* Mark as Read Button */}
                {!notification.isRead && (
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="ml-4 p-2 text-blue-600 hover:text-blue-800 transition-colors rounded-full hover:bg-blue-100"
                    title="Mark as read"
                  >
                    <CheckCircle size={18} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;