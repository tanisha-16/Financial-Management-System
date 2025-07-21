const connectDB = require('../db');
const { ObjectId } = require('mongodb');

exports.getStats = async (req, res) => {
  const db = await connectDB();
  const userId = new ObjectId(req.user.id);

  // Budgets
  const budgets = await db.collection('budgets').find({ user_id: req.user.id }).toArray();
  const totalBudget = budgets.reduce((sum, b) => sum + (b.amount || 0), 0);

  // Expenses (from transactions)
  const expenses = await db.collection('transactions').find({ user_id: req.user.id, type: 'expense' }).toArray();
  const totalSpent = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  // Income (from transactions)
  const incomeAgg = await db.collection('transactions').aggregate([
    { $match: { user_id: req.user.id, type: 'income' } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]).toArray();
  const totalIncome = incomeAgg[0]?.total || 0;

  // Budget Utilization
  const budgetUtilization = totalBudget > 0 ? (totalSpent / totalBudget) : 0;

  // Monthly Trend (last 6 months)
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const monthlyTrend = await db.collection('transactions').aggregate([
    { $match: { user_id: req.user.id, date: { $gte: sixMonthsAgo.toISOString() } } },
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

  // Build a map of monthly budgets (assuming all budgets are monthly and always active)
  const totalMonthlyBudget = budgets.reduce((sum, b) => sum + (b.amount || 0), 0);
  const monthlyBudgets = {};
  for (let i = 0; i < 6; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${date.getMonth() + 1}/${date.getFullYear()}`;
    monthlyBudgets[key] = totalMonthlyBudget;
  }

  // Build a map for spent and income by month
  const spentMap = {};
  const incomeMap = {};
  monthlyTrend.forEach(item => {
    const key = `${item._id.month}/${item._id.year}`;
    if (item._id.type === 'expense') spentMap[key] = item.total;
    if (item._id.type === 'income') incomeMap[key] = item.total;
  });

  // Build a complete list of the last 6 months with correct budget and spent per month
  const trendWithBudget = [];
  let currentMonthSpent = 0;
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthNum = date.getMonth() + 1;
    const yearNum = date.getFullYear();
    const key = `${monthNum}/${yearNum}`;

    // Calculate total spent for this month
    const monthStart = new Date(yearNum, monthNum - 1, 1);
    const monthEnd = new Date(yearNum, monthNum, 1);
    const monthSpent = await db.collection('transactions').aggregate([
      { $match: {
        user_id: req.user.id,
        type: 'expense',
        date: { $gte: monthStart.toISOString(), $lt: monthEnd.toISOString() }
      }},
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]).toArray();
    const spent = monthSpent[0]?.total || 0;

    // Save current month spent
    if (monthNum === now.getMonth() + 1 && yearNum === now.getFullYear()) {
      currentMonthSpent = spent;
    }

    // For now, use totalMonthlyBudget for each month (can be improved for per-month budgets)
    trendWithBudget.push({
      _id: { month: monthNum, year: yearNum },
      budget: totalMonthlyBudget,
      spent,
      income: incomeMap[key] || 0,
      month: key
    });
  }

  // Category Breakdown (expenses)
  const categoryBreakdown = await db.collection('transactions').aggregate([
    { $match: { user_id: req.user.id, type: 'expense' } },
    { $group: { _id: '$category', spent: { $sum: '$amount' } } },
    { $sort: { spent: -1 } }
  ]).toArray();

  // Recent Transactions
  const recentTransactions = await db.collection('transactions')
    .find({ user_id: req.user.id })
    .sort({ date: -1 })
    .limit(5)
    .toArray();

  res.json({
    totalBudget,
    totalSpent,
    totalIncome,
    budgetUtilization,
    monthlyTrend: trendWithBudget,
    categoryBreakdown,
    recentTransactions,
    currentMonthSpent
  });
}; 