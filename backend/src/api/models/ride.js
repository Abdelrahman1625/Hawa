import mongoose from "mongoose";

const rideSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: false, // Initially, a driver may not be assigned
  },
  pickup_location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
  dropoff_location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
  ride_status: {
    type: String,
    enum: ['requested', 'accepted', 'in_progress', 'completed', 'cancelled'],
    default: 'requested',
  },
  fare: {
    type: Number,
    required: false,
  },
  ride_date: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

rideSchema.index({ pickup_location: '2dsphere' });
rideSchema.index({ dropoff_location: '2dsphere' });

const Ride = mongoose.model('Ride', rideSchema);
export default Ride;

