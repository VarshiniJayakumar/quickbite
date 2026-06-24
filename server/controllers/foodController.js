const Food = require('../models/Food');
const path = require('path');
const fs = require('fs');

// @desc    Get all foods (with search, filter, sort, pagination)
// @route   GET /api/foods
// @access  Public
const getFoods = async (req, res, next) => {
  try {
    const {
      search = '',
      category,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 20,
    } = req.query;

    const query = { available: true };

    if (search && search.trim()) {
      const keyword = search.trim().substring(0, 100);
      query.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
      ];
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    const sortOptions = {};
    if (sortBy === 'price') sortOptions.price = order === 'asc' ? 1 : -1;
    else if (sortBy === 'rating') sortOptions.rating = -1;
    else sortOptions.createdAt = -1;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [foods, total] = await Promise.all([
      Food.find(query).sort(sortOptions).skip(skip).limit(limitNum),
      Food.countDocuments(query),
    ]);

    res.json({
      success: true,
      foods,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured foods (for home page)
// @route   GET /api/foods/featured
// @access  Public
const getFeaturedFoods = async (req, res, next) => {
  try {
    const foods = await Food.find({ available: true, featured: true }).limit(8);
    res.json({ success: true, foods });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single food
// @route   GET /api/foods/:id
// @access  Public
const getFoodById = async (req, res, next) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) {
      return res.status(404).json({ success: false, message: 'Food item not found' });
    }
    res.json({ success: true, food });
  } catch (error) {
    next(error);
  }
};

// @desc    Create food item
// @route   POST /api/foods
// @access  Admin
const createFood = async (req, res, next) => {
  try {
    const { title, description, price, category, ingredients, available, featured } = req.body;

    let image = '';
    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    }

    const ingredientsArr = ingredients
      ? (typeof ingredients === 'string' ? JSON.parse(ingredients) : ingredients)
      : [];

    const food = await Food.create({
      title,
      description,
      price: parseFloat(price),
      image,
      category,
      ingredients: ingredientsArr,
      available: available !== undefined ? available === 'true' || available === true : true,
      featured: featured === 'true' || featured === true,
    });

    res.status(201).json({ success: true, message: 'Food item created', food });
  } catch (error) {
    next(error);
  }
};

// @desc    Update food item
// @route   PUT /api/foods/:id
// @access  Admin
const updateFood = async (req, res, next) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) {
      return res.status(404).json({ success: false, message: 'Food item not found' });
    }

    const { title, description, price, category, ingredients, available, featured } = req.body;

    if (req.file) {
      // Delete old image
      if (food.image && food.image.startsWith('/uploads/')) {
        const oldPath = path.join(__dirname, '..', food.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      food.image = `/uploads/${req.file.filename}`;
    }

    if (title !== undefined) food.title = title;
    if (description !== undefined) food.description = description;
    if (price !== undefined) food.price = parseFloat(price);
    if (category !== undefined) food.category = category;
    if (ingredients !== undefined) {
      food.ingredients = typeof ingredients === 'string' ? JSON.parse(ingredients) : ingredients;
    }
    if (available !== undefined) food.available = available === 'true' || available === true;
    if (featured !== undefined) food.featured = featured === 'true' || featured === true;

    await food.save();
    res.json({ success: true, message: 'Food item updated', food });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle food availability
// @route   PATCH /api/foods/:id/availability
// @access  Admin
const toggleAvailability = async (req, res, next) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) {
      return res.status(404).json({ success: false, message: 'Food item not found' });
    }

    food.available = !food.available;
    await food.save();

    res.json({ success: true, message: `Food item marked as ${food.available ? 'available' : 'unavailable'}`, food });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete food item
// @route   DELETE /api/foods/:id
// @access  Admin
const deleteFood = async (req, res, next) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) {
      return res.status(404).json({ success: false, message: 'Food item not found' });
    }

    if (food.image && food.image.startsWith('/uploads/')) {
      const imgPath = path.join(__dirname, '..', food.image);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    await food.deleteOne();
    res.json({ success: true, message: 'Food item deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getFoods, getFeaturedFoods, getFoodById, createFood, updateFood, toggleAvailability, deleteFood };
