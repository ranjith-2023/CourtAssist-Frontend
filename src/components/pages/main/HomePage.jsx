import { useState, useEffect } from 'react';
import { Menu, X, LogOut, LayoutDashboard, FolderPlus, FolderOpen, Bell, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CaseSubscriptionForm from '../case/CaseSubscriptionForm';
import CaseSubscriptionList from '../case/CaseSubscriptionList';
import Profile from '../profile/ProfilePage';
// import Dashboard from '../dashboard/DashboardPage';
import Notifications from '../notification/Notifications';
import { useAuth } from '../../../contexts/AuthContext';
import { notificationService } from '../../../services/notificationService';
import { getToken, getMessaging, onMessage} from "firebase/messaging";
import { messaging } from '../../../firebase/firebaseConfig';
import { request } from '../../../services/httpClient';

export default function HomePage() {
  const [activeSection, setActiveSection] = useState('Notifications');
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { user, logout } = useAuth();  
  const { VITE_APP_VAPID_KEY } = import.meta.env;

  async function requestPermission() {
    try {
      // 1. Explicitly register the service worker
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log('ServiceWorker registration successful');

      // 2. Wait for the service worker to be fully active
      if (registration.active) {
        await subscribeToPush(registration);
      } else if (registration.installing) {
        registration.installing.addEventListener('statechange', (event) => {
          if (event.target.state === 'activated') {
            subscribeToPush(registration);
          }
        });
      } else if (registration.waiting) {
        registration.waiting.addEventListener('statechange', (event) => {
          if (event.target.state === 'activated') {
            subscribeToPush(registration);
          }
        });
      }
    } catch (error) {
      console.error('ServiceWorker registration failed:', error);
    }
  }

// Helper function to get the token once the service worker is ready
  async function subscribeToPush(serviceWorkerRegistration) {
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        // 3. Pass the serviceWorkerRegistration to getToken
        const token = await getToken(messaging, {
          vapidKey: VITE_APP_VAPID_KEY,
          serviceWorkerRegistration: serviceWorkerRegistration // This is key
        });

        // Send the token to your backend
        if (token) {
          await request('/user/fcm-token', {
            method: 'PATCH',
            body: { fcmToken: token }
          });
          console.log("Token saved to server.");
        }
      } else {
        console.log("Permission not granted.");
      }
    } catch (error) {
      console.error("Error getting push token:", error);
    }
  }

  // Request notification permission on mount
  useEffect(() => {
      requestPermission();
  },[]);

  // Listen for foreground messages
  useEffect(() => {
    const messaging = getMessaging();

    // This listener only works when the app is in the foreground.
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Foreground message received: ', payload);
      
      // You can display an alert, update state, or show a custom notification component.
      alert(`Foreground message: ${payload.notification.title} - ${payload.notification.body}`);
      
      // Example of creating a browser notification manually.
      // Note: This may not work in all foreground scenarios; a custom in-app UI is often better.
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(payload.notification.title, {
          body: payload.notification.body,
          icon: "/your-icon.png"
        });
      }
    });

    return unsubscribe; // Cleanup on unmount
  }, []);
  
  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (user && user.id) {
      fetchUnreadCount();
    }
  }, [user, activeSection]);

  // Auto-close mobile menu
  useEffect(() => {
    if (isMobile && menuOpen) {
      setMenuOpen(false);
    }
  }, [activeSection, isMobile]);

  const fetchUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const menuItems = [
    // { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Add Case', icon: FolderPlus },
    { name: 'My Cases', icon: FolderOpen },
    { name: 'Notifications', icon: Bell },
    { name: 'Profile', icon: User }
  ];

  const renderSection = () => {
    switch (activeSection) {
      // case 'Dashboard':
      //   return <Dashboard />;
      case 'Add Case':
        return <CaseSubscriptionForm />;
      case 'My Cases':
        return <CaseSubscriptionList />;
      case 'Notifications':
        return <Notifications onUpdateUnreadCount={fetchUnreadCount} />;
      case 'Profile':
        return <Profile />;
      default:
        return <Dashboard />;
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleConfirmLogout = async () => {
    setShowLogoutConfirm(false);
    setMenuOpen(false);
    await logout();
  };

  const handleCancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const handleMenuToggle = () => {
    setMenuOpen(!menuOpen);
  };

  const handleSectionChange = (sectionName) => {
    setActiveSection(sectionName);
    if (isMobile) {
      setMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-white sm:bg-[#D6E9FF] font-sans">
      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={handleCancelLogout}
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
                  <LogOut size={20} className="text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Confirm Logout</h3>
              </div>

              <p className="text-gray-600 mb-6">
                Are you sure you want to logout? You'll need to login again to access your account.
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={handleCancelLogout}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmLogout}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Header */}
      <div className="sm:hidden flex justify-between items-center p-4 bg-[#000F1F] text-white sticky top-0 z-40 shadow-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={handleMenuToggle}
            className="p-2 rounded-md focus:outline-none"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h1 className="text-xl font-semibold">Court Assist</h1>
        </div>

        {/* Mobile notification badge */}
        {unreadCount > 0 && activeSection !== 'Notifications' && (
          <div className="bg-red-500 text-white text-xs font-medium w-6 h-6 rounded-full flex items-center justify-center">
            {unreadCount}
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && isMobile && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-30 sm:hidden"
              onClick={() => setMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 left-0 h-full w-80 bg-[#000F1F] z-40 sm:hidden flex flex-col p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-semibold text-white">Court Assist</h1>
                <button onClick={() => setMenuOpen(false)} className="p-2 text-white rounded-md">
                  <X size={24} />
                </button>
              </div>

              <div className="text-white text-sm mb-8 p-4 bg-gray-800 rounded-lg">
                <div className="font-medium">Welcome, {user?.username || 'User'}</div>
                {user?.advocateName && (
                  <div className="text-xs text-gray-300 mt-1">{user.advocateName}</div>
                )}
              </div>

              <nav className="flex-1">
                {menuItems.map((item) => {
                  const isActive = activeSection === item.name;
                  const isNotifications = item.name === 'Notifications';

                  return (
                    <button
                      key={item.name}
                      onClick={() => handleSectionChange(item.name)}
                      className={`w-full text-left my-2 px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-between ${
                        isActive
                          ? 'bg-white text-[#000F1F] transform scale-105'
                          : 'text-white hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="w-5 h-5 text-[#FFD700]" />
                        <span className="font-medium">{item.name}</span>
                      </div>
                      {isNotifications && unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full min-w-[20px] text-center">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>

              <button
                onClick={handleLogoutClick}
                className="mt-auto text-orange-500 font-semibold hover:text-orange-400 transition-colors duration-200 flex items-center gap-2 p-4 rounded-lg hover:bg-gray-800"
              >
                <LogOut size={18} />
                Logout
              </button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row min-h-screen">
        {/* Desktop Sidebar */}
        <aside className="hidden sm:flex bg-[#000F1F] rounded-lg flex-col items-center p-6 w-64 m-2 h-[calc(100vh-1rem)] sticky top-2">
          <h1 className="text-2xl font-semibold text-white mb-8 text-center">Court Assist</h1>

          <div className="text-white text-sm mb-4 text-center">
            <div className="font-medium">Welcome, {user?.username || 'User'}</div>
            {user?.advocateName && (
              <div className="text-xs text-gray-300 mt-1">({user.advocateName})</div>
            )}
          </div>

          <nav className="flex flex-col space-y-2 w-full flex-1">
            {menuItems.map((item) => {
              const isActive = activeSection === item.name;
              const isNotifications = item.name === 'Notifications';

              return (
                <button
                  key={item.name}
                  onClick={() => handleSectionChange(item.name)}
                  className={`cursor-pointer my-1 px-4 py-3 rounded-md text-left transition-all duration-200 flex justify-between items-center ${
                    isActive
                      ? 'bg-white text-[#000F1F] shadow-lg'
                      : 'text-white hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5 text-[#FFD700]" />
                    <span>{item.name}</span>
                  </div>
                  {isNotifications && unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full min-w-[20px] text-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <button
            onClick={handleLogoutClick}
            className="mt-auto text-orange-500 font-semibold hover:text-orange-400 transition-colors duration-200 flex items-center gap-2 p-3 rounded-lg hover:bg-gray-800 w-full justify-center"
          >
            <LogOut size={16} />
            Logout
          </button>
        </aside>

        {/* Main Content */}
        <main
          className={`flex-1 bg-white transition-all duration-300 overflow-auto ${
            isMobile
              ? 'min-h-[calc(100vh-80px)]'
              : 'rounded-lg m-2 p-6 sm:p-8 shadow-lg'
          }`}
        >
          {renderSection()}
        </main>
      </div>
    </div>
  );
}