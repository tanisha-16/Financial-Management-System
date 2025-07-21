const connectDB = require('../db');
const { ObjectId } = require('mongodb');

exports.getTransactions = async (req, res) => {
  const db = await connectDB();
  const transactions = await db.collection('transactions').find({ user_id: req.user.id }).toArray();
  res.json(transactions);
};

exports.createTransaction = async (req, res) => {
  const db = await connectDB();
  const newTransaction = {
    ...req.body,
    status: 'completed', // Always set status to completed
    user_id: req.user.id,
    created_at: new Date(),
    updated_at: new Date(),
  };
  const result = await db.collection('transactions').insertOne(newTransaction);
  res.json({ ...newTransaction, id: result.insertedId });
};

exports.updateTransaction = async (req, res) => {
  const db = await connectDB();
  const { id } = req.params;
  const updates = { ...req.body, status: 'completed', updated_at: new Date() }; // Always set status to completed
  const result = await db.collection('transactions').findOneAndUpdate(
    { _id: new ObjectId(id), user_id: req.user.id },
    { $set: updates },
    { returnDocument: 'after' }
  );
  if (!result.value) return res.status(404).json({ error: 'Transaction not found' });
  res.json(result.value);
};

exports.deleteTransaction = async (req, res) => {
  const db = await connectDB();
  const { id } = req.params;
  const result = await db.collection('transactions').deleteOne({ _id: new ObjectId(id), user_id: req.user.id });
  if (result.deletedCount === 0) return res.status(404).json({ error: 'Transaction not found' });
  res.json({ success: true });
}; 