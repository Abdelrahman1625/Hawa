import mongoose from 'mongoose';

const profitPaymentSchema = new mongoose.Schema({
  profit_payment_id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true,
    primary: true
  },
  driver_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: true
  },
  admin_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  amount: {
    type: mongoose.Schema.Types.Decimal128,
    required: true,
    get: v => parseFloat(v)
  },
  payment_date: {
    type: Date,
    default: Date.now
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  }
}, {
  toJSON: { getters: true }
});

export const ProfitPayment = mongoose.model('ProfitPayment', profitPaymentSchema);
