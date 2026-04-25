const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { products } = require('../data/db');
const { authMiddleware } = require('../middleware/auth');

// GET /api/cart
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    const cart = user.cart || new Map();
    const enriched = [];
    for (const [productId, qty] of cart.entries()) {
      const product = products.find(p => p.id === parseInt(productId));
      if (product && qty > 0) enriched.push({ ...product, qty });
    }
    res.json(enriched);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/cart/:productId
router.put('/:productId', authMiddleware, async (req, res) => {
  const { qty } = req.body;
  const productId = req.params.productId;
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    if (!user.cart) user.cart = new Map();
    if (qty <= 0) {
      user.cart.delete(productId);
    } else {
      user.cart.set(productId, qty);
    }
    user.markModified('cart');
    await user.save();
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/cart
router.delete('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    user.cart = new Map();
    user.markModified('cart');
    await user.save();
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
