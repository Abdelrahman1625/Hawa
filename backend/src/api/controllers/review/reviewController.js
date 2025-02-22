import { Review } from "../../models/review.js";

class ReviewController {
  async createReview(req, res) {
    try {
      const { ride_id, rating, comment } = req.body;

      const review = new Review({
        ride: ride_id,
        customer: req.user.id,
        driver: req.body.driver_id,
        rating,
        comment,
      });

      await review.save();
      res.status(201).json(review);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Review creation failed", error: error.message });
    }
  }

  async getDriverReviews(req, res) {
    try {
      const reviews = await Review.find({ driver: req.params.driver_id }).sort({
        created_at: -1,
      });
      res.json(reviews);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Reviews fetch failed", error: error.message });
    }
  }
}

export default new ReviewController();
