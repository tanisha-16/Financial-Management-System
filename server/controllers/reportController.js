const connectDB = require('../db');

exports.getSummary = async (req, res) => {
  const db = await connectDB();
  const userId = req.user.id;
  const transactions = db.collection('transactions');

  // Total income and expenses
  const totals = await transactions.aggregate([
    { $match: { user_id: userId } },
    { $group: {
      _id: '$type',
      total: { $sum: '$amount' }
    }}
  ]).toArray();

  // Totals by category
  const byCategory = await transactions.aggregate([
    { $match: { user_id: userId } },
    { $group: {
      _id: '$category',
      total: { $sum: '$amount' },
      type: { $first: '$type' }
    }}
  ]).toArray();

  // Totals by month (last 12 months)
  const byMonth = await transactions.aggregate([
    { $match: { user_id: userId } },
    { $addFields: {
      year: { $year: { $toDate: '$date' } },
      month: { $month: { $toDate: '$date' } }
    }},
    { $group: {
      _id: { year: '$year', month: '$month', type: '$type' },
      total: { $sum: '$amount' }
    }},
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]).toArray();

  res.json({ totals, byCategory, byMonth });
}; 