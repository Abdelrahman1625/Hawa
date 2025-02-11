import mongoose from 'mongoose';

const cashPaymentSchema = new mongoose.Schema({
  payment_id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true,
    primary: true
  },
  driver_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: true
  },
  customer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
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
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  ride_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ride',
    required: true
  }
}, {
  toJSON: { getters: true }
});

export const CashPayment = mongoose.model('CashPayment', cashPaymentSchema);
