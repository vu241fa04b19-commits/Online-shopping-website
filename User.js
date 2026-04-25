const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2 },
  email: { type: String, trim: true, lowercase: true, default: '' },
  phone: { type: String, trim: true, default: '' },
  passwordHash: { type: String, default: '' },
  memberSince: { type: String },
  addresses: [
    {
      name:      { type: String },
      phone:     { type: String },
      line1:     { type: String },
      line2:     { type: String },
      city:      { type: String },
      state:     { type: String },
      pin:       { type: String },
      type:      { type: String, default: 'Home' },
      isDefault: { type: Boolean, default: false }
    }
  ],
  cart: {
    type: Map,
    of: Number,
    default: {}
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
