import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  profit_percentage: {
    type: mongoose.Schema.Types.Decimal128,
    required: true,
    get: v => parseFloat(v)
  },
  admin_level: {
    type: String,
    enum: ['super_admin', 'manager', 'support'],
    required: true
  }
}, {
  toJSON: { getters: true }
});

export const Admin = mongoose.model('Admin', adminSchema);
