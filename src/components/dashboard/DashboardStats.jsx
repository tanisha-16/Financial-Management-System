import React from 'react';
import { TrendingUp, TrendingDown, IndianRupee, Wallet, Target, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, change, changeType, icon, color }) => {
  const changeIcon = changeType === 'positive' ? TrendingUp : changeType === 'negative' ? TrendingDown : null;
  const changeColor = changeType === 'positive' ? 'text-green-600' : changeType === 'negative' ? 'text-red-600' : 'text-gray-600';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-gray-600 dark:text-gray-200 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
          {change && (
            <div className={`flex items-center mt-2 ${changeColor}`}>
              {changeIcon && <changeIcon className="h-4 w-4 mr-1" />}
              <span className="text-sm font-medium">{change}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
};

const DashboardStats = ({ stats }) => {
  if (!stats) return null;
  console.log(stats);
  // Get current month data from monthlyTrend (last entry)
  const currentMonthData = stats.monthlyTrend && stats.monthlyTrend.length > 0 ? stats.monthlyTrend[stats.monthlyTrend.length - 1] : null;
  const currentMonthSpent = currentMonthData?.spent ?? 0;
  const currentMonthBudget = currentMonthData?.budget ?? 0;

  const statCards = [
    {
      title: 'Total Budget',
      value: `₹${stats.totalBudget?.toLocaleString() ?? 0}`,
      icon: <Target className="h-6 w-6 text-blue-600" />,
      color: 'bg-blue-50',
    },
    {
      title: 'Total Spent',
      value: `₹${currentMonthSpent.toLocaleString()}`,
      icon: <CreditCard className="h-6 w-6 text-red-600" />,
      color: 'bg-red-50',
    },
    {
      title: 'Available Budget',
      value: `₹${(currentMonthBudget - currentMonthSpent).toLocaleString()}`,
      icon: <Wallet className="h-6 w-6 text-green-600" />,
      color: 'bg-green-50',
    },
    {
      title: 'Total Income',
      value: `₹${stats.totalIncome?.toLocaleString() ?? 0}`,
      icon: <IndianRupee className="h-6 w-6 text-purple-600" />,
      color: 'bg-purple-50',
    },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <StatCard {...stat} />
        </motion.div>
      ))}
    </div>
  );
};

export default DashboardStats;