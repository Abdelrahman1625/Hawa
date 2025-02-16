import { User } from '../../models/user.js';
import { Customer } from '../../models/customer.js';
import { Driver } from '../../models/driver.js';
import { Admin } from '../../models/admin.js';
import { Vehicle } from '../../models/vehicle.js';

class UserController {
  async createUser(req, res) {
    try {
      const { user_type, ...userData } = req.body;
      
      let newUser;
      switch (user_type) {
        case 'customer':
          newUser = new Customer({
            ...userData,
            wallet_balance: 0, 
            loyalty_points: 0
          });
          break;
        case 'driver':
          newUser = new Driver({
            ...userData,
            account_status: 'inactive',
            is_available: false
          });
          break;
        case 'admin':
          newUser = new Admin({
            ...userData,
            profit_percentage: userData.profit_percentage || 0
          });
          break;
      }

      await newUser.save();
      res.status(201).json(newUser);
    } catch (error) {
      res.status(500).json({ message: 'User creation failed', error: error.message });
    }
  }

  async getProfile(req, res) {
    try {
      const user = await User.findById(req.user.id);
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Profile fetch failed', error: error.message });
    }
  }

  async updateProfile(req, res) {
    try {
      const user = await User.findByIdAndUpdate(req.user.id, req.body, { new: true });
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Profile update failed', error: error.message });
    }
  }
}
