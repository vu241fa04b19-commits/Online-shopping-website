const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');
const { authMiddleware } = require('../middleware/auth');

// GET /api/orders
router.get('/', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(orders.map(formatOrder));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/orders  (place order)
router.post('/', authMiddleware, async (req, res) => {
  const { addressIdx, payment, items, total } = req.body;

  if (!items || items.length === 0)
    return res.status(400).json({ error: 'Cart is empty.' });
  if (!payment)
    return res.status(400).json({ error: 'Payment method required.' });

  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const address = user.addresses[addressIdx];
    if (!address) return res.status(400).json({ error: 'Invalid address selected.' });

    const orderId = 'SG' + Date.now().toString().slice(-8);
    const now = new Date();
    const placedDate = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const eta = new Date(now);
    eta.setDate(eta.getDate() + 5);
    const arrivalDate = `Expected: ${eta.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`;

    const orderItems = items.map(i => ({
      id:    i.id,
      qty:   i.qty,
      name:  i.product?.name  || '',
      price: i.product?.price || 0,
      emoji: i.product?.emoji || '',
      img:   i.product?.img   || ''
    }));

    const order = new Order({
      orderId,
      userId:        user._id,
      customerName:  user.name,
      customerEmail: user.email,
      customerPhone: user.phone,
      status:       'Expected',
      payment,
      address:      address.toObject(),
      items:        orderItems,
      total:        Number(total),
      totalDisplay: `₹${Number(total).toLocaleString('en-IN')}`,
      placedDate,
      arrivalDate
    });
    await order.save();

    // Clear cart in MongoDB
    user.cart = new Map();
    await user.save();

    res.json(formatOrder(order));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

function formatOrder(o) {
  return {
    id:          o.orderId,
    status:      o.status,
    placedDate:  o.placedDate,
    arrivalDate: o.arrivalDate,
    total:       o.totalDisplay || `₹${Number(o.total).toLocaleString('en-IN')}`,
    payment:     o.payment,
    address:     o.address,
    items:       o.items,
    customerName:  o.customerName,
    customerEmail: o.customerEmail
  };
}

module.exports = router;
