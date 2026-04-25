const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');

// GET /api/addresses
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json(user.addresses);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/addresses
router.post('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    const addr = req.body;
    if (addr.isDefault) user.addresses.forEach(a => a.isDefault = false);
    user.addresses.push(addr);
    await user.save();
    res.json(user.addresses);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/addresses/:idx
router.put('/:idx', authMiddleware, async (req, res) => {
  const idx = parseInt(req.params.idx);
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    if (idx < 0 || idx >= user.addresses.length)
      return res.status(404).json({ error: 'Address not found.' });
    const addr = req.body;
    if (addr.isDefault) user.addresses.forEach(a => a.isDefault = false);
    user.addresses[idx] = addr;
    user.markModified('addresses');
    await user.save();
    res.json(user.addresses);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/addresses/:idx
router.delete('/:idx', authMiddleware, async (req, res) => {
  const idx = parseInt(req.params.idx);
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    if (idx < 0 || idx >= user.addresses.length)
      return res.status(404).json({ error: 'Address not found.' });
    user.addresses.splice(idx, 1);
    await user.save();
    res.json(user.addresses);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
