const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const connectDB = require('../db');

exports.register = async (req, res) => {
  const { email, password, fullName } = req.body;
  const db = await connectDB();
  const users = db.collection('users');
  const existing = await users.findOne({ email });
  if (existing) return res.status(400).json({ error: 'User already exists' });

  const hashed = await bcrypt.hash(password, 12);
  const user = { email, password: hashed, full_name: fullName, created_at: new Date(), updated_at: new Date() };
  await users.insertOne(user);

  res.json({ message: 'User registered' });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const db = await connectDB();
  const users = db.collection('users');
  const user = await users.findOne({ email });
  if (!user) return res.status(400).json({ error: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { email: user.email, full_name: user.full_name } });
};
