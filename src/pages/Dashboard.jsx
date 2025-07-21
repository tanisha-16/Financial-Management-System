import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import DashboardStats from '../components/dashboard/DashboardStats';
import ExpenseChart from '../components/dashboard/ExpenseChart';
import RecentTransactions from '../components/dashboard/RecentTransactions';
import AlertsWidget from '../components/dashboard/AlertsWidget';
import { dashboardService } from '../services/api.js';
import { Navigate, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Bell } from 'lucide-react';
import { useNotifications } from '../contexts/AuthContext';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { notifications, addNotifications } = useNotifications();
  const [alerts, setAlerts] = useState([]); 

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      setError(null);
      try {
        const data = await dashboardService.getDashboardStats();
        setStats(data);
        
        const newAlerts = [];
        // Get current month data from monthlyTrend (last entry)
        const currentMonthData = data.monthlyTrend && data.monthlyTrend.length > 0 ? data.monthlyTrend[data.monthlyTrend.length - 1] : null;
        const currentMonthSpent = currentMonthData?.spent ?? 0;
        const currentMonthBudget = currentMonthData?.budget ?? 0;
        // Only show alerts for the current month
        if (currentMonthBudget > 0 && currentMonthSpent > currentMonthBudget) newAlerts.push('You are over your total budget!');
        if (currentMonthBudget > 0 && currentMonthSpent / currentMonthBudget > 0.8 && currentMonthSpent <= currentMonthBudget) newAlerts.push('You have used over 80% of your budget.');
        setAlerts(newAlerts);
        addNotifications(newAlerts);
        newAlerts.forEach(alert => toast.error(alert));
      } catch (err) {
        setError(err.message || 'Failed to load dashboard stats');
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-white p-6 rounded-xl border border-blue-100 mb-2 shadow-sm relative">
        <div>
          <h1 className="text-3xl font-extrabold text-blue-900 dark:text-gray-800 tracking-tight">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-600">Welcome back! Here's your financial overview.</p>
        </div>
        <div className="text-right flex items-center gap-4">
          <div className="relative">
            <button
              className="relative focus:outline-none"
              onClick={() => {
                
              }}
              aria-label="Show notifications"
            >
              <Bell className="h-6 w-6 text-blue-700" />
              {/* {unreadCount > 0 && ( // Removed local state
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">
                  {unreadCount}
                </span>
              )} */}
            </button>
            {/* {showNotifications && ( // Removed local state
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-100 z-50 p-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Notifications</h4>
                {alerts.length === 0 ? (
                  <div className="text-gray-400 text-sm">No notifications</div>
                ) : (
                  <ul className="space-y-2">
                    {alerts.map((alert, i) => (
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
            )} */}
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-500">Last updated</p>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-700">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>
      </div>

      {loading && <div className="text-center text-gray-500">Loading dashboard...</div>}
      {error && <div className="text-center text-red-600">{error}</div>}

      {!loading && !error && stats && (
        <>
          {/* Stats Row */}
          <div className="mb-6">
            <DashboardStats stats={stats} />
          </div>

          {/* Alerts Row */}
          <div className="mb-6">
            <AlertsWidget alerts={alerts} />
          </div>

          {/* Chart Row */}
          <div className="mb-6">
            <ExpenseChart stats={stats} />
          </div>

          {/* Transactions & Quick Actions Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <RecentTransactions transactions={stats.recentTransactions} onViewAll={() => navigate('/transactions')} />
            </div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 h-full flex flex-col"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Actions</h3>
              <div className="space-y-3 flex-1">
                {[
                  { title: 'Create Budget', color: 'bg-blue-50 text-blue-600 hover:bg-blue-100', action: () => navigate('/budgets') },
                  { title: 'Generate Report', color: 'bg-green-50 text-green-600 hover:bg-green-100', action: () => navigate('/reports') },
                  { title: 'Import Data', color: 'bg-purple-50 text-purple-600 hover:bg-purple-100', action: () => alert('Import feature coming soon!') },
                ].map((action, index) => (
                  <motion.button
                    key={action.title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full p-3 rounded-lg text-left font-medium transition-colors ${action.color}`}
                    onClick={action.action}
                  >
                    {action.title}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default Dashboard;