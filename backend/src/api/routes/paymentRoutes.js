import express from "express";
import PaymentController from "../controllers/payment/paymentController.js";
import { authorize } from "../middlewares/auth.js";
import { validatePayment } from "../middlewares/validator.js";

const router = express.Router();

router.use(authorize);

router.post("/cash", validatePayment, PaymentController.processCashPayment);
router.post("/profit", validatePayment, PaymentController.processProfitPayment);
router.get("/history", PaymentController.getPaymentHistory);
// router.get('/:id', PaymentController.getPaymentDetails);
// router.put('/:id/status', PaymentController.updatePaymentStatus);

export default router;
