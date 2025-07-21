import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LabelList } from 'recharts';
import { motion } from 'framer-motion';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#eab308'];

const ExpenseChart = ({ stats }) => {
  if (!stats) return null;
  // Prepare monthly trend data
  let monthlyData = [];
  if (stats.monthlyTrend && stats.monthlyTrend.length > 0) {
    // If the backend already provides budget, spent, and income for each month, use them directly
    if (
      typeof stats.monthlyTrend[0].budget !== 'undefined' &&
      typeof stats.monthlyTrend[0].spent !== 'undefined' &&
      typeof stats.monthlyTrend[0].income !== 'undefined'
    ) {
      monthlyData = stats.monthlyTrend.map((item) => ({
        month: item.month || `${item._id.month}/${item._id.year}`,
        budget: item.budget || 0,
        spent: item.spent || 0,
        income: item.income || 0,
      }));
    } else {
      // Fallback to old grouping logic if needed
      const monthMap = {};
      stats.monthlyTrend.forEach((item) => {
        const key = `${item._id.month}/${item._id.year}`;
        if (!monthMap[key]) monthMap[key] = { month: key, budget: 0, spent: 0, income: 0 };
        if (item._id.type === 'income') monthMap[key].income = item.total;
        if (item._id.type === 'expense') monthMap[key].spent = item.total;
        if (item.budget) monthMap[key].budget = item.budget;
      });
      monthlyData = Object.values(monthMap);
    }
  }
  // Prepare profit/loss data for each month
  const profitLossData = monthlyData.map((month) => ({
    month: month.month,
    profit: Math.max(0, (month.budget || 0) - (month.spent || 0)),
    loss: Math.max(0, (month.spent || 0) - (month.budget || 0)),
  }));

  // Debug: Log monthlyData to verify backend/frontend data
  console.log('monthlyData', monthlyData);
  // Prepare category breakdown data
  const categoryData = (stats.categoryBreakdown || []).map((c, i) => ({
    name: c._id,
    value: c.spent,
    color: COLORS[i % COLORS.length],
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Monthly Trend Chart */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Monthly Trends</h3>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span className="text-gray-600 dark:text-gray-200">Budget</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              <span className="text-gray-600 dark:text-gray-200">Spent</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-gray-600 dark:text-gray-200">Income</span>
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="month" className="text-sm" />
            <YAxis className="text-sm" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Bar dataKey="budget" fill="#3B82F6" radius={[2, 2, 0, 0]} name="Budget" />
            <Bar dataKey="spent" fill="#EF4444" radius={[2, 2, 0, 0]} name="Spent" />
            <Bar dataKey="income" fill="#10B981" radius={[2, 2, 0, 0]} name="Income" />
            <g>
              {/* Force legend to always show */}
            </g>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Profit/Loss Chart */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Profit / Loss</h3>
        {/* Legend for Profit/Loss */}
        <div className="flex items-center space-x-4 mb-4 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-gray-600 dark:text-gray-200">Profit</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span className="text-gray-600 dark:text-gray-200">Loss</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={profitLossData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="month" className="text-sm" />
            <YAxis className="text-sm" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value, name) => [
                `₹${value.toLocaleString()}`,
                name.charAt(0).toUpperCase() + name.slice(1)
              ]}
            />
            <Bar dataKey="profit" fill="#10B981" radius={[2, 2, 0, 0]} name="Profit" >
              <LabelList dataKey="profit" position="top" formatter={v => v > 0 ? `₹${v}` : ''} />
            </Bar>
            <Bar dataKey="loss" fill="#EF4444" radius={[2, 2, 0, 0]} name="Loss" >
              <LabelList dataKey="loss" position="top" formatter={v => v > 0 ? `₹${v}` : ''} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
};

export default ExpenseChart;