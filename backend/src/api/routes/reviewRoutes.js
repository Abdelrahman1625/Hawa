import express from "express";
import ReviewController from "../controllers/review/reviewController.js";
import { authorize } from "../middlewares/auth.js";
import { validateReview } from "../middlewares/validator.js";

const router = express.Router();

router.use(authorize);

router.post("/", validateReview, ReviewController.createReview);
router.get("/driver/:driver_id", ReviewController.getDriverReviews);
// router.get('/user', ReviewController.getUserReviews);
// router.put('/:id', validateReview, ReviewController.updateReview);
// router.delete('/:id', ReviewController.deleteReview);

export default router;
