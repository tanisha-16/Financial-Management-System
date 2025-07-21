import React from 'react';

const AlertsWidget = ({ alerts }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-yellow-200 dark:border-yellow-600 mb-6 h-full">
      <h3 className="text-lg font-semibold text-yellow-700 mb-4 text-gray-900">Alerts</h3>
      {alerts && alerts.length > 0 ? (
        <ul className="space-y-2">
          {alerts.map((alert, i) => (
            <li key={i} className="text-yellow-800 text-sm font-medium flex items-center">
              <span className="w-2 h-2 rounded-full bg-yellow-400 mr-2"></span>
              {alert}
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-gray-600 text-sm">No alerts</div>
      )}
    </div>
  );
};

export default AlertsWidget; 