import express from "express";
import RideController from "../controllers/ride/rideController.js";
import { adminMiddleware } from "../middlewares/auth.js";
import { validateRideRequest } from "../middlewares/validator.js";

const router = express.Router();

router.use(adminMiddleware);

router.post("/request", validateRideRequest, RideController.requestRide);
router.put("/:id/status", RideController.updateRideStatus);
router.get("/history", RideController.getRideHistory);
// router.get('/active', RideController.getActiveRide);
// router.get('/:id', RideController.getRideDetails);
// router.post('/:id/cancel', RideController.cancelRide);

export default router;
