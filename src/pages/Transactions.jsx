import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import * as XLSX from 'xlsx';
import { budgetService } from '../services/api.js';

const API_URL = 'http://localhost:5000/api/transactions';

const defaultForm = {
  title: '',
  amount: '',
  type: 'expense',
  category: '',
  date: '',
  status: 'completed',
};

const Transactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [formLoading, setFormLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [search, setSearch] = useState('');
  const [budgets, setBudgets] = useState([]);

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch transactions');
      setTransactions(data);
    } catch (err) {
      setError(err.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  // Fetch budgets for dropdown
  useEffect(() => {
    async function fetchBudgets() {
      try {
        const data = await budgetService.getBudgets();
        setBudgets(data);
      } catch (err) {
        // Optionally handle error
      }
    }
    fetchBudgets();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const method = editId ? 'PUT' : 'POST';
      const url = editId ? `${API_URL}/${editId}` : API_URL;
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ ...form, amount: Number(form.amount) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save transaction');
      toast.success(editId ? 'Transaction updated!' : 'Transaction added!');
      setShowForm(false);
      setEditId(null);
      setForm(defaultForm);
      fetchTransactions();
    } catch (err) {
      toast.error(err.message || 'Failed to save transaction');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (tx) => {
    setEditId(tx._id || tx.id);
    setForm({
      title: tx.title,
      amount: tx.amount,
      type: tx.type,
      category: tx.category,
      date: tx.date ? tx.date.slice(0, 10) : '',
      status: tx.status,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    setDeleteLoading(true);
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete transaction');
      toast.success('Transaction deleted!');
      setDeleteId(null);
      fetchTransactions();
    } catch (err) {
      toast.error(err.message || 'Failed to delete transaction');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Filter and search
  const filtered = transactions.filter((tx) => {
    const matchesType = filterType === 'all' || tx.type === filterType;
    const matchesSearch =
      tx.title.toLowerCase().includes(search.toLowerCase()) ||
      tx.category.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600">View and manage all your transactions</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          onClick={() => {
            setShowForm((v) => !v);
            setEditId(null);
            setForm(defaultForm);
          }}
        >
          <Plus className="h-4 w-4" />
          <span>{editId ? 'Cancel Edit' : 'Add Transaction'}</span>
        </motion.button>
      </div>

      <div className="flex items-center space-x-4">
        <select
          className="border rounded px-3 py-2"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="all">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <input
          className="border rounded px-3 py-2"
          placeholder="Search by title or category"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          onClick={() => {
            const ws = XLSX.utils.json_to_sheet(filtered);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Transactions');
            XLSX.writeFile(wb, 'transactions.xlsx');
          }}
        >
          Export
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleFormSubmit} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4 max-w-lg mx-auto">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-lg text-gray-900">{editId ? 'Edit Transaction' : 'New Transaction'}</span>
            {editId && (
              <button type="button" onClick={() => { setEditId(null); setShowForm(false); setForm(defaultForm); }} className="text-gray-400 hover:text-gray-700"><X /></button>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900">Budget</label>
            <select
              name="title"
              value={form.title}
              onChange={handleFormChange}
              required
              className="w-full border rounded px-3 py-2 text-gray-900"
            >
              <option value="">Select a budget</option>
              {budgets.map((b) => (
                <option key={b._id || b.id} value={b.name}>{b.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900">Amount</label>
            <input name="amount" type="number" value={form.amount} onChange={handleFormChange} required className="w-full border rounded px-3 py-2 text-gray-900" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900">Type</label>
            <select name="type" value={form.type} onChange={handleFormChange} required className="w-full border rounded px-3 py-2 text-gray-900">
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900">Category</label>
            <input name="category" value={form.category} onChange={handleFormChange} required className="w-full border rounded px-3 py-2 text-gray-900" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900">Date</label>
            <input name="date" type="date" value={form.date} onChange={handleFormChange} required className="w-full border rounded px-3 py-2 text-gray-900" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900">Status</label>
            <select name="status" value={form.status} onChange={handleFormChange} className="w-full border rounded px-3 py-2 text-gray-900">
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <button type="submit" disabled={formLoading} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50">
            {formLoading ? (editId ? 'Saving...' : 'Adding...') : (editId ? 'Save Changes' : 'Add Transaction')}
          </button>
        </form>
      )}

      {loading && <div className="text-center text-gray-500">Loading transactions...</div>}
      {error && <div className="text-center text-red-600">{error}</div>}

      {!loading && !error && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">All Transactions</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {filtered.length === 0 && (
              <div className="p-6 text-center text-gray-500">No transactions found.</div>
            )}
            {filtered.map((tx, index) => (
              <motion.div
                key={tx._id || tx.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-6 hover:bg-gray-50 transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-gray-900">{tx.title}</div>
                  <div className="text-sm text-gray-600">{tx.category} • {tx.type} • {new Date(tx.date).toLocaleDateString()}</div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className={tx.type === 'income' ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                    {tx.type === 'income' ? '+' : '-'}₹{Number(tx.amount).toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500">{tx.status}</div>
                  <button onClick={() => handleEdit(tx)} className="text-blue-600 hover:text-blue-800"><Edit className="h-4 w-4" /></button>
                  <button onClick={() => setDeleteId(tx._id || tx.id)} className="text-red-600 hover:text-red-800"><Trash2 className="h-4 w-4" /></button>
                </div>
                {deleteId === (tx._id || tx.id) && (
                  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
                    <div className="bg-white p-6 rounded shadow-xl space-y-4">
                      <div>Are you sure you want to delete this transaction?</div>
                      <div className="flex space-x-2">
                        <button onClick={() => handleDelete(tx._id || tx.id)} disabled={deleteLoading} className="bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50">{deleteLoading ? 'Deleting...' : 'Delete'}</button>
                        <button onClick={() => setDeleteId(null)} className="bg-gray-200 px-4 py-2 rounded">Cancel</button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Transactions; 