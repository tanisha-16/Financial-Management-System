import React, { useEffect, useState } from 'react';
import { Plus, Target, TrendingUp, AlertCircle, Edit, Trash2, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { budgetService } from '../services/api.js';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    category: '',
    amount: '',
    period: 'monthly',
  });
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    async function fetchBudgets() {
      setLoading(true);
      setError(null);
      try {
        const data = await budgetService.getBudgets();
        setBudgets(data);
      } catch (err) {
        setError(err.message || 'Failed to load budgets');
      } finally {
        setLoading(false);
      }
    }
    fetchBudgets();
  }, []);

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setShowForm(false);
    setEditId(null);
    setForm({ name: '', category: '', amount: '', period: 'monthly' });
    setFormLoading(true);
    try {
      if (editId) {
        const updated = await budgetService.updateBudget(editId, {
          ...form,
          amount: Number(form.amount),
        });
        setBudgets(budgets.map(b => (b.id === editId || b._id === editId ? updated : b)));
      } else {
        const newBudget = await budgetService.createBudget({
          ...form,
          amount: Number(form.amount),
          spent: 0,
        });
        setBudgets([newBudget, ...budgets]);
      }
    } catch (err) {
      // No toast, no error message
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (budget) => {
    setEditId(budget.id || budget._id);
    setForm({
      name: budget.name,
      category: budget.category,
      amount: budget.amount,
      period: budget.period,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    setDeleteLoading(true);
    try {
      await budgetService.deleteBudget(id);
      setBudgets(budgets.filter(b => (b.id || b._id) !== id));
      setDeleteId(null);
      toast.success('Budget deleted!');
    } catch (err) {
      toast.error(err.message || 'Failed to delete budget');
    } finally {
      setDeleteLoading(false);
    }
  };

  const getUtilizationColor = (spent, amount) => {
    const percentage = (spent / amount) * 100;
    if (percentage >= 100) return 'text-red-600';
    if (percentage >= 80) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getProgressBarColor = (spent, amount) => {
    const percentage = (spent / amount) * 100;
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Budget Management</h1>
          <p className="text-gray-600">Track and manage your monthly budgets</p>
        </div>
        <div className="flex items-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            onClick={() => {
              setShowForm((v) => !v);
              setEditId(null);
              setForm({ name: '', category: '', amount: '', period: 'monthly' });
            }}
          >
            <Plus className="h-4 w-4" />
            <span>{editId ? 'Cancel Edit' : 'Create Budget'}</span>
          </motion.button>
          <button
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            onClick={() => {
              const ws = XLSX.utils.json_to_sheet(budgets);
              const wb = XLSX.utils.book_new();
              XLSX.utils.book_append_sheet(wb, ws, 'Budgets');
              XLSX.writeFile(wb, 'budgets.xlsx');
            }}
          >
            Export
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleFormSubmit} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4 max-w-lg mx-auto">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-lg text-gray-900">{editId ? 'Edit Budget' : 'New Budget'}</span>
            {editId && (
              <button type="button" onClick={() => { setEditId(null); setShowForm(false); setForm({ name: '', category: '', amount: '', period: 'monthly' }); }} className="text-gray-400 hover:text-gray-700"><X /></button>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900">Name</label>
            <input name="name" value={form.name} onChange={handleFormChange} required className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900">Category</label>
            <input name="category" value={form.category} onChange={handleFormChange} required className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900">Amount</label>
            <input name="amount" type="number" value={form.amount} onChange={handleFormChange} required className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900">Period</label>
            <select name="period" value={form.period} onChange={handleFormChange} className="w-full border rounded px-3 py-2">
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          <button type="submit" disabled={formLoading} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50">
            {formLoading ? (editId ? 'Saving...' : 'Creating...') : (editId ? 'Save Changes' : 'Create Budget')}
          </button>
        </form>
      )}

      {loading && <div className="text-center text-gray-500">Loading budgets...</div>}
      {error && <div className="text-center text-red-600">{error}</div>}

      {!loading && !error && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Budget Categories</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {budgets.length === 0 && (
              <div className="p-6 text-center text-gray-500">No budgets found.</div>
            )}
            {budgets.map((budget, index) => {
              const percentage = Math.min((budget.spent / budget.amount) * 100, 100);
              const isOverBudget = budget.spent > budget.amount;
              const id = budget.id || budget._id;
              return (
                <motion.div
                  key={id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className={`w-4 h-4 rounded-full bg-blue-500`}></div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{budget.name}</h4>
                        <p className="text-sm text-gray-600">{budget.category} • {budget.period}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button onClick={() => handleEdit(budget)} className="p-2 rounded hover:bg-blue-100 text-blue-600"><Edit size={16} /></button>
                      <button onClick={() => setDeleteId(id)} className="p-2 rounded hover:bg-red-100 text-red-600"><Trash2 size={16} /></button>
                    </div>
                  </div>
                  <div className="text-right mb-2">
                    <p className={`text-lg font-bold ${getUtilizationColor(budget.spent, budget.amount)}`}>
                      ₹{budget.spent} / ₹{budget.amount}
                    </p>
                    <p className="text-sm text-gray-500">
                      {percentage.toFixed(1)}% used
                    </p>
                  </div>
                  <div className="mb-2">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{isOverBudget ? `Over budget by ₹${(budget.spent - budget.amount).toFixed(2)}` : `₹${budget.amount - budget.spent} remaining`}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(budget.spent, budget.amount)}`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  {isOverBudget && (
                    <div className="flex items-center space-x-2 text-red-600 text-sm mt-2">
                      <AlertCircle className="h-4 w-4" />
                      <span>Over budget by ₹{(budget.spent - budget.amount).toFixed(2)}</span>
                    </div>
                  )}
                  {/* Delete confirmation dialog */}
                  {deleteId === id && (
                    <div className="mt-4 bg-red-50 border border-red-200 rounded p-4 flex items-center justify-between">
                      <span>Are you sure you want to delete this budget?</span>
                      <div className="space-x-2">
                        <button onClick={() => setDeleteId(null)} className="px-3 py-1 rounded bg-gray-200 text-gray-700">Cancel</button>
                        <button onClick={() => handleDelete(id)} disabled={deleteLoading} className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50">
                          {deleteLoading ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Budgets;