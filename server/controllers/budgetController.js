const connectDB = require('../db');
const { ObjectId } = require('mongodb');

exports.getBudgets = async (req, res) => {
  const db = await connectDB();
  const budgets = await db.collection('budgets').find({ user_id: req.user.id }).toArray();
  const transactions = await db.collection('transactions').find({ user_id: req.user.id, type: 'expense' }).toArray();

  // For each budget, sum the transactions that match the budget's category
  const budgetsWithSpent = budgets.map(budget => {
    const spent = transactions
      .filter(tx => tx.category === budget.category)
      .reduce((sum, tx) => sum + (tx.amount || 0), 0);
    return { ...budget, spent };
  });

  res.json(budgetsWithSpent);
};

exports.createBudget = async (req, res) => {
  const db = await connectDB();
  const newBudget = {
    ...req.body,
    user_id: req.user.id,
    created_at: new Date(),
    updated_at: new Date(),
  };
  const result = await db.collection('budgets').insertOne(newBudget);
  res.json({ ...newBudget, id: result.insertedId, spent: 0 });
};

exports.updateBudget = async (req, res) => {
  const db = await connectDB();
  const { id } = req.params;
  // Ensure month is always present for monthly budgets
  let updates = { ...req.body, updated_at: new Date() };
  if (updates.period === 'monthly' && (typeof updates.month === 'undefined' || updates.month === null)) {
    updates.month = '';
  }
  try {
    const result = await db.collection('budgets').findOneAndUpdate(
      { _id: new ObjectId(id), user_id: req.user.id },
      { $set: updates },
      { returnDocument: 'after' }
    );
    if (!result.value) return res.status(404).json({ error: 'Budget not found' });
    // Calculate spent for the updated budget
    const transactions = await db.collection('transactions').find({ user_id: req.user.id, type: 'expense', category: result.value.category }).toArray();
    const spent = transactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
    res.json({ ...result.value, spent });
  } catch (err) {
    console.error('Failed to update budget:', err);
    res.status(500).json({ error: 'Failed to update budget', details: err.message });
  }
};

exports.deleteBudget = async (req, res) => {
  const db = await connectDB();
  const { id } = req.params;
  const result = await db.collection('budgets').deleteOne({ _id: new ObjectId(id), user_id: req.user.id });
  if (result.deletedCount === 0) return res.status(404).json({ error: 'Budget not found' });
  res.json({ success: true });
};
