import express from 'express';
import { rideController } from '../controllers/rideController.js';
import { authenticate } from '../middlewares/auth.js';
import { validateRideRequest } from '../middlewares/validation.js';

const router = express.Router();

router.use(authenticate);

router.post('/request', validateRideRequest, rideController.requestRide);
router.put('/:id/status', rideController.updateRideStatus);
router.get('/history', rideController.getRideHistory);
router.get('/active', rideController.getActiveRide);
router.get('/:id', rideController.getRideDetails);
router.post('/:id/cancel', rideController.cancelRide);

export default router;
