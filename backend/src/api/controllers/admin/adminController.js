// import { Admin } from "../../models/admin.js";
// import { Driver } from "../../models/driver.js";

// class AdminController {
//   async updateDriverStatus(req, res) {
//     try {
//       const { driver_id, account_status } = req.body;

//       const driver = await Driver.findByIdAndUpdate(
//         driver_id,
//         { account_status },
//         { new: true }
//       );

//       res.json(driver);
//     } catch (error) {
//       res
//         .status(500)
//         .json({ message: "Status update failed", error: error.message });
//     }
//   }

//   async getSystemStats(req, res) {
//     try {
//       const stats = {
//         totalDrivers: await Driver.countDocuments(),
//         activeDrivers: await Driver.countDocuments({
//           account_status: "active",
//         }),
//         totalCustomers: await Customer.countDocuments(),
//         totalRides: await Ride.countDocuments(),
//         completedRides: await Ride.countDocuments({ ride_status: "completed" }),
//       };

//       res.json(stats);
//     } catch (error) {
//       res
//         .status(500)
//         .json({ message: "Stats fetch failed", error: error.message });
//     }
//   }

//   async manageProfitPercentage(req, res) {
//     try {
//       const { driver_id, profit_percentage } = req.body;

//       const driver = await Driver.findByIdAndUpdate(
//         driver_id,
//         { profit_percentage },
//         { new: true }
//       );

//       res.json(driver);
//     } catch (error) {
//       res
//         .status(500)
//         .json({ message: "Profit update failed", error: error.message });
//     }
//   }
// }

// // Export all controllers
// export default new AdminController();
import { Admin } from "../../models/admin.js";
import { Driver } from "../../models/driver.js";
import { Customer } from "../../models/customer.js";
import Ride from "../../models/ride.js";

class AdminController {
  async updateDriverStatus(req, res) {
    try {
      const { driver_id, account_status } = req.body;

      const driver = await Driver.findByIdAndUpdate(
        driver_id,
        { account_status },
        { new: true }
      );

      if (!driver) {
        return res.status(404).json({ message: "Driver not found" });
      }

      res.json(driver);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Status update failed", error: error.message });
    }
  }

  async getSystemStats(req, res) {
    try {
      const stats = {
        totalDrivers: await Driver.countDocuments(),
        activeDrivers: await Driver.countDocuments({
          account_status: "active",
        }),
        totalCustomers: await Customer.countDocuments(),
        totalRides: await Ride.countDocuments(),
        completedRides: await Ride.countDocuments({ ride_status: "completed" }),
      };

      res.json(stats);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Stats fetch failed", error: error.message });
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

      if (!driver) {
        return res.status(404).json({ message: "Driver not found" });
      }

      res.json(driver);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Profit update failed", error: error.message });
    }
  }

  async deleteUser(req, res) {
    try {
      const { id } = req.params;

      const user = await Admin.findByIdAndDelete(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Cannot delete user", error: error.message });
    }
  }

  async getAllUsers(req, res) {
    try {
      const users = await Admin.find({});

      if (!users.length) {
        return res.status(404).json({ message: "No users found" });
      }

      res.status(200).json(users);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Cannot get users", error: error.message });
    }
  }
}
export const adminController = new AdminController();

export const {
  updateDriverStatus,
  getSystemStats,
  manageProfitPercentage,
  deleteUser,
  getAllUsers,
} = adminController;
