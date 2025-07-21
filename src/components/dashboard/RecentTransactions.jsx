import React from 'react';
import { ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

const RecentTransactions = ({ transactions, onViewAll }) => {
  if (!transactions) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Transactions</h3>
        <motion.button
          whileHover={{ x: 2 }}
          className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
          onClick={onViewAll}
        >
          View all
          <ChevronRight className="h-4 w-4 ml-1" />
        </motion.button>
      </div>

      <div className="space-y-4">
        {transactions.map((transaction, index) => (
          <motion.div
            key={transaction._id || transaction.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${
                transaction.type === 'income' 
                  ? 'bg-green-50 text-green-600' 
                  : 'bg-red-50 text-red-600'
              }`}>
                {transaction.type === 'income' ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900">{transaction.title}</p>
                <p className="text-sm text-gray-600">{transaction.category}</p>
              </div>
            </div>

            <div className="text-right">
              <p className={`font-semibold ${
                transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
              }`}>
                {transaction.type === 'income' ? '+' : '-'}₹{Number(transaction.amount).toFixed(2)}
              </p>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-600">
                  {new Date(transaction.date).toLocaleDateString()}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  transaction.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {transaction.status}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default RecentTransactions;