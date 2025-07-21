import React from 'react';
import { Bell, Search, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';

const Header = () => {
  const { user, signOut } = useAuth();
  const { notifications, unreadCount, markAllRead } = useNotifications();
  const [showNotifications, setShowNotifications] = React.useState(false);

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
            onClick={() => {
              setShowNotifications((v) => !v);
              markAllRead();
            }}
            aria-label="Show notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">
                {unreadCount}
              </span>
            )}
          </motion.button>
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-100 z-50 p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Notifications</h4>
              {notifications.length === 0 ? (
                <div className="text-gray-400 text-sm">No notifications</div>
              ) : (
                <ul className="space-y-2">
                  {notifications.map((alert, i) => (
                    <li key={i} className="text-yellow-800 text-sm font-medium flex items-center">
                      <span className="w-2 h-2 rounded-full bg-yellow-400 mr-2"></span>
                      {alert}
                    </li>
                  ))}
                </ul>
              )}
              <button
                className="mt-3 w-full text-xs text-blue-600 hover:underline"
                onClick={() => setShowNotifications(false)}
              >
                Close
              </button>
            </div>
          )}

          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user?.user_metadata?.full_name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={signOut}
              className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <User className="h-4 w-4 text-gray-600" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;