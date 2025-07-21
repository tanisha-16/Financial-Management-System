import React from 'react';

const SavingsProgressWidget = ({ goals }) => {
  if (!goals) return null;
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Goals Progress</h3>
      <div className="space-y-4">
        {goals.map((goal, i) => {
          const percent = Math.min(100, Math.round((goal.current / goal.target) * 100));
          return (
            <div key={goal.label}>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-900">{goal.label}</span>
                <span className="text-sm font-medium text-gray-900">{percent}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all"
                  style={{ width: `${percent}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SavingsProgressWidget; 