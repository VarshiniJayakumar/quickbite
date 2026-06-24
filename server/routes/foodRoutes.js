const express = require('express');
const router = express.Router();
const {
  getFoods,
  getFeaturedFoods,
  getFoodById,
  createFood,
  updateFood,
  toggleAvailability,
  deleteFood,
} = require('../controllers/foodController');
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getFoods);
router.get('/featured', getFeaturedFoods);
router.get('/:id', getFoodById);

router.post('/', protect, adminOnly, upload.single('image'), createFood);
router.put('/:id', protect, adminOnly, upload.single('image'), updateFood);
router.patch('/:id/availability', protect, adminOnly, toggleAvailability);
router.delete('/:id', protect, adminOnly, deleteFood);

module.exports = router;
