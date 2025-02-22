import { User } from "../models/user.js";

export const checkRole = (roles) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: "Authentication required",
      });
    }

    try {
      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({
          error: "User not found",
        });
      }

      if (!roles.includes(user.user_type)) {
        return res.status(403).json({
          error: "Access denied. Insufficient permissions",
        });
      }

      // Add role-specific checks
      if (user.user_type === "driver" && user.account_status !== "active") {
        return res.status(403).json({
          error: "Driver account is not active",
        });
      }

      if (user.user_type === "admin" && !user.is_active) {
        return res.status(403).json({
          error: "Admin account is inactive",
        });
      }

      next();
    } catch (error) {
      res.status(500).json({
        error: "Role verification failed",
        details: error.message,
      });
    }
  };
};

// Specific role check middlewares
export const isCustomer = checkRole(["customer"]);
export const isDriver = checkRole(["driver"]);
export const isAdmin = checkRole(["admin"]);
export const isAdminOrDriver = checkRole(["admin", "driver"]);
