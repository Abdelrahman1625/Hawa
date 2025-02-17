import { Admin } from '../../models/admin.js';
import { Driver } from '../../models/driver.js';

class AdminController {
  async updateDriverStatus(req, res) {
    try {
      const { driver_id, account_status } = req.body;
      
      const driver = await Driver.findByIdAndUpdate(
        driver_id,
        { account_status },
        { new: true }
      );
      
      res.json(driver);
    } catch (error) {
      res.status(500).json({ message: 'Status update failed', error: error.message });
    }
  }

  async getSystemStats(req, res) {
    try {
      const stats = {
        totalDrivers: await Driver.countDocuments(),
        activeDrivers: await Driver.countDocuments({ account_status: 'active' }),
        totalCustomers: await Customer.countDocuments(),
        totalRides: await Ride.countDocuments(),
        completedRides: await Ride.countDocuments({ ride_status: 'completed' })
      };
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: 'Stats fetch failed', error: error.message });
    }
  }

  async manageProfitPercentage(req, res) {
    try {
      const { driver_id, profit_percentage } = req.body;
      
      const driver = await Driver.findByIdAndUpdate(
        driver_id,
        { profit_percentage },
        { new: true }
      );
      
      res.json(driver);
    } catch (error) {
      res.status(500).json({ message: 'Profit update failed', error: error.message });
    }
  }
}

// Export all controllers
export default new AdminController();