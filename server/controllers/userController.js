const connectDB = require('../db');
const bcrypt = require('bcryptjs');
const { ObjectId } = require('mongodb');

exports.getProfile = async (req, res) => {
  const db = await connectDB();
  const user = await db.collection('users').findOne({ _id: new ObjectId(req.user.id) });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ email: user.email, full_name: user.full_name, created_at: user.created_at });
};

exports.updateProfile = async (req, res) => {
  const db = await connectDB();
  const { full_name } = req.body;
  const result = await db.collection('users').findOneAndUpdate(
    { _id: new ObjectId(req.user.id) },
    { $set: { full_name, updated_at: new Date() } },
    { returnDocument: 'after' }
  );
  if (!result.value) return res.status(404).json({ error: 'User not found' });
  res.json({ email: result.value.email, full_name: result.value.full_name, created_at: result.value.created_at });
};

exports.changePassword = async (req, res) => {
  const db = await connectDB();
  const { oldPassword, newPassword } = req.body;
  const user = await db.collection('users').findOne({ _id: new ObjectId(req.user.id) });
  if (!user) return res.status(404).json({ error: 'User not found' });
  const valid = await bcrypt.compare(oldPassword, user.password);
  if (!valid) return res.status(400).json({ error: 'Old password is incorrect' });
  const hashed = await bcrypt.hash(newPassword, 12);
  await db.collection('users').updateOne({ _id: new ObjectId(req.user.id) }, { $set: { password: hashed, updated_at: new Date() } });
  res.json({ success: true });
}; 