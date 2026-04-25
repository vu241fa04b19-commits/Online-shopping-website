const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');

function safeUser(u) {
  return { id: u._id, name: u.name, email: u.email, phone: u.phone, memberSince: u.memberSince };
}

// GET /api/users/me
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json(safeUser(user));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/users/me
router.put('/me', authMiddleware, async (req, res) => {
  const { name, email, phone } = req.body;
  if (!name || name.trim().length < 2)
    return res.status(400).json({ error: 'Name is required.' });
  try {
    const user = await User.findByIdAndUpdate(
      req.userId,
      { name: name.trim(), email: email || '', phone: phone || '' },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json(safeUser(user));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
