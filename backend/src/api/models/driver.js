


const driverSchema = new mongoose.Schema({
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    account_status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'inactive'
    },
    last_payment_date: {
      type: Date
    },
    vehicle_info: {
      type: String,
      required: true
    },
    license_number: {
      type: String,
      required: true,
      unique: true
    },
    current_location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        default: [0, 0]
      }
    },
    is_available: {
      type: Boolean,
      default: false
    }
  });
  
  driverSchema.index({ current_location: '2dsphere' });
  
  export const Driver = mongoose.model('Driver', driverSchema);