// routes/payment.mjs
import express from 'express';
import { checkout, iniciarPago, showCheckout } from '../controllers/paymentController.mjs';
import { success } from '../controllers/paymentController.mjs';

const router = express.Router();

router.get('/checkout', showCheckout);

router.post('/checkout', checkout);

router.get('/success', success);

router.get('/failure', (req, res) => {
  res.send('❌ El pago ha fallado. Contacta con tu banco o intenta nuevamente!');
});

router.get('/pending', (req, res) => {
  res.send('⏳ El pago está pendiente.');
});

export default router;
