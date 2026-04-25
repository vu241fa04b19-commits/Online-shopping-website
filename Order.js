const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  id:       { type: Number, required: true },
  qty:      { type: Number, required: true },
  name:     { type: String },
  price:    { type: Number },
  emoji:    { type: String },
  img:      { type: String }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderId:     { type: String, required: true, unique: true },
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  customerName:  { type: String },
  customerEmail: { type: String },
  customerPhone: { type: String },
  status:      { type: String, default: 'Expected' },
  payment:     { type: String, required: true },
  address:     { type: Object, required: true },
  items:       [orderItemSchema],
  total:       { type: Number, required: true },
  totalDisplay:{ type: String },
  placedDate:  { type: String },
  arrivalDate: { type: String },
  trackingSteps: [{
    label:     { type: String },
    done:      { type: Boolean, default: false },
    timestamp: { type: String }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);