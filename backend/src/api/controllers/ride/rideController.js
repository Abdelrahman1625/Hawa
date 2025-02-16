import { Ride } from '../models/ride.js';
import { Driver } from '../models/driver.js';

class RideController {
  async requestRide(req, res) {
    try {
      const { pickup_location, dropoff_location } = req.body;
      
      // Find nearby available drivers
      const availableDrivers = await Driver.find({
        is_available: true,
        current_location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: pickup_location.coordinates
            },
            $maxDistance: 5000 // 5km radius
          }
        }
      });

      if (availableDrivers.length === 0) {
        return res.status(404).json({ message: 'No drivers available' });
      }

      const ride = new Ride({
        customer: req.user.id,
        driver: availableDrivers[0]._id,
        pickup_location,
        dropoff_location,
        ride_status: 'requested'
      });

      await ride.save();
      res.status(201).json(ride);
    } catch (error) {
      res.status(500).json({ message: 'Ride request failed', error: error.message });
    }
  }

  async updateRideStatus(req, res) {
    try {
      const { ride_status } = req.body;
      const ride = await Ride.findByIdAndUpdate(
        req.params.id,
        { ride_status },
        { new: true }
      );
      res.json(ride);
    } catch (error) {
      res.status(500).json({ message: 'Status update failed', error: error.message });
    }
  }

  async getRideHistory(req, res) {
    try {
      const rides = await Ride.find({
        $or: [
          { customer: req.user.id },
          { driver: req.user.id }
        ]
      }).sort({ ride_date: -1 });
      res.json(rides);
    } catch (error) {
      res.status(500).json({ message: 'History fetch failed', error: error.message });
    }
  }
}
