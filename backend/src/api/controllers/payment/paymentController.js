import { CashPayment } from '../../models/cashPayment.js';
import { ProfitPayment } from '../../models/profitPayment.js';

class PaymentController {
  async processCashPayment(req, res) {
    try {
      const { ride_id, amount } = req.body;
      
      const payment = new CashPayment({
        driver: req.user.id,
        customer: req.body.customer_id,
        amount,
        ride: ride_id
      });

      await payment.save();
      res.status(201).json(payment);
    } catch (error) {
      res.status(500).json({ message: 'Payment processing failed', error: error.message });
    }
  }

  async processProfitPayment(req, res) {
    try {
      const { driver_id, amount } = req.body;
      
      const payment = new ProfitPayment({
        driver: driver_id,
        admin: req.user.id,
        amount,
        status: 'pending'
      });

      await payment.save();
      res.status(201).json(payment);
    } catch (error) {
      res.status(500).json({ message: 'Profit payment failed', error: error.message });
    }
  }

  async getPaymentHistory(req, res) {
    try {
      const payments = await CashPayment.find({
        $or: [
          { driver: req.user.id },
          { customer: req.user.id }
        ]
      }).sort({ payment_date: -1 });
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: 'History fetch failed', error: error.message });
    }
  }
}

export default new PaymentController();