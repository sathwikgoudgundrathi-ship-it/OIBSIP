const router = require('express').Router();
const controller = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/', protect, controller.createOrder);
router.post('/:id/confirm-payment', protect, controller.confirmPayment);
router.get('/mine', protect, controller.myOrders);
router.get('/', protect, adminOnly, controller.allOrders);
router.patch('/:id/status', protect, adminOnly, controller.updateStatus);

module.exports = router;
