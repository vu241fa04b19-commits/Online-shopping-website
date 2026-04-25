const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { SECRET } = require('../middleware/auth');

// POST /api/auth/signin  — login with email+password
router.post('/signin', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !email.trim())
    return res.status(400).json({ error: 'Email is required.' });
  if (!password || password.length < 4)
    return res.status(400).json({ error: 'Password must be at least 4 characters.' });

  try {
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user)
      return res.status(401).json({ error: 'No account found with this email. Please register.' });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match)
      return res.status(401).json({ error: 'Incorrect password.' });

    const token = jwt.sign({ userId: user._id }, SECRET, { expiresIn: '30d' });
    res.json({ token, user: safeUser(user), isReturning: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

// POST /api/auth/register  — create new account
router.post('/register', async (req, res) => {
  const { name, email, phone, password } = req.body;
  if (!name || name.trim().length < 2)
    return res.status(400).json({ error: 'Name is required (min 2 chars).' });
  if (!email || !email.trim())
    return res.status(400).json({ error: 'Email is required.' });
  if (!password || password.length < 4)
    return res.status(400).json({ error: 'Password must be at least 4 characters.' });

  try {
    const existing = await User.findOne({ email: email.trim().toLowerCase() });
    if (existing)
      return res.status(409).json({ error: 'An account with this email already exists. Please sign in.' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : '',
      passwordHash,
      memberSince: new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
    });
    await user.save();

    const token = jwt.sign({ userId: user._id }, SECRET, { expiresIn: '30d' });
    res.status(201).json({ token, user: safeUser(user), isReturning: false });
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

// POST /api/auth/signout
router.post('/signout', (req, res) => {
  res.json({ message: 'Signed out.' });
});

function safeUser(u) {
  return {
    id: u._id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    memberSince: u.memberSince
  };
}

module.exports = router;
