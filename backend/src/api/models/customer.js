import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    national_id: {
      type: String,
      required: true,
      unique: true
    },
    wallet_balance: {
      type: mongoose.Schema.Types.Decimal128,
      default: 0.0,
      get: v => parseFloat(v)
    }
  }, {
    toJSON: { getters: true }
  });
  
  export const Customer = mongoose.model('Customer', customerSchema);
  