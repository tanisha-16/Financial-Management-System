import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

const COLORS = ['#2563eb', '#22c55e', '#f59e42', '#ef4444', '#a21caf', '#eab308', '#0ea5e9'];

const Reports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/reports', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const d = await res.json();
        if (!res.ok) throw new Error(d.error || 'Failed to fetch reports');
        setData(d);
      } catch (err) {
        setError(err.message || 'Failed to load reports');
        toast.error(err.message || 'Failed to load reports');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Prepare chart data
  // Group by month and fill both income and expense for each month
  const monthlyMap = {};
  (data?.byMonth || []).forEach((m) => {
    const key = `${m._id.month}/${m._id.year}`;
    if (!monthlyMap[key]) monthlyMap[key] = { name: key, income: 0, expense: 0 };
    if (m._id.type === 'income') monthlyMap[key].income = m.total;
    if (m._id.type === 'expense') monthlyMap[key].expense = m.total;
  });
  const monthly = Object.values(monthlyMap).sort((a, b) => {
    const [ma, ya] = a.name.split('/').map(Number);
    const [mb, yb] = b.name.split('/').map(Number);
    return yb !== ya ? ya - yb : ma - mb;
  });

  const categories = (data?.byCategory || []).map((c, i) => ({
    name: c._id,
    value: c.total,
    type: c.type,
    color: COLORS[i % COLORS.length],
  }));

  const totalIncome = data?.totals?.find((t) => t._id === 'income')?.total || 0;
  const totalExpense = data?.totals?.find((t) => t._id === 'expense')?.total || 0;

  // Split categories into income and expense
  const incomeCategories = categories.filter((c) => c.type === 'income');
  const expenseCategories = categories.filter((c) => c.type === 'expense');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600">Visualize your financial data</p>
        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mt-2"
          onClick={() => {
            if (!data) return;
            const wb = XLSX.utils.book_new();
            // Summary
            const summarySheet = XLSX.utils.json_to_sheet([
              { label: 'Total Income', value: totalIncome },
              { label: 'Total Expenses', value: totalExpense },
            ]);
            XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');
            // By Category
            const categorySheet = XLSX.utils.json_to_sheet(categories);
            XLSX.utils.book_append_sheet(wb, categorySheet, 'Categories');
            // By Month
            const monthSheet = XLSX.utils.json_to_sheet(monthly);
            XLSX.utils.book_append_sheet(wb, monthSheet, 'Monthly');
            XLSX.writeFile(wb, 'reports.xlsx');
          }}
        >
          Export
        </button>
      </div>
      {loading && <div className="text-center text-gray-500">Loading reports...</div>}
      {error && <div className="text-center text-red-600">{error}</div>}
      {!loading && !error && data && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Summary</h3>
              <div className="flex space-x-8">
                <div>
                  <div className="text-gray-500">Total Income</div>
                  <div className="text-2xl font-bold text-green-600">₹{totalIncome.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-gray-500">Total Expenses</div>
                  <div className="text-2xl font-bold text-red-600">₹{totalExpense.toFixed(2)}</div>
                </div>
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-4 w-full">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex-1">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Income Category Breakdown</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={incomeCategories}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {incomeCategories.map((entry, index) => (
                        <Cell key={`income-cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex-1">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Expense Category Breakdown</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={expenseCategories}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {expenseCategories.map((entry, index) => (
                        <Cell key={`expense-cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Monthly Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthly} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="income" name="Income" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="expense" name="Expense" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
};

export default Reports; 