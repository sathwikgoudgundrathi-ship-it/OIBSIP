const router = require('express').Router();
const controller = require('../controllers/inventoryController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, controller.listInventory);
router.post('/', protect, adminOnly, controller.createInventory);
router.put('/:id', protect, adminOnly, controller.upsertInventory);
router.delete('/:id', protect, adminOnly, controller.deleteInventory);

module.exports = router;
