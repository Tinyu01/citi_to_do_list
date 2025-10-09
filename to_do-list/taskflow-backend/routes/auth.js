const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, name } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });
    
    if (existingUser) {
      return res.status(400).json({
        message: existingUser.email === email ? 
          'Email already registered' : 
          'Username already taken'
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      name
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        preferences: user.preferences,
        categories: user.categories
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user || !(await user.verifyPassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        preferences: user.preferences,
        categories: user.categories
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        name: req.user.name,
        preferences: req.user.preferences,
        categories: req.user.categories
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update user profile
router.patch('/profile', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'email', 'password'];
  const isValidOperation = updates.every(update => 
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).json({ message: 'Invalid updates' });
  }

  try {
    updates.forEach(update => {
      req.user[update] = req.body[update];
    });

    await req.user.save();
    res.json({ 
      message: 'Profile updated successfully',
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        name: req.user.name,
        preferences: req.user.preferences,
        categories: req.user.categories
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add custom category
router.post('/categories', auth, async (req, res) => {
  try {
    const { name, color } = req.body;
    
    // Check if category already exists
    if (req.user.categories.some(cat => cat.name === name)) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    req.user.categories.push({ name, color, isDefault: false });
    await req.user.save();

    res.status(201).json({ 
      message: 'Category added successfully',
      categories: req.user.categories 
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete custom category
router.delete('/categories/:name', auth, async (req, res) => {
  try {
    const categoryName = req.params.name;
    const category = req.user.categories.find(cat => cat.name === categoryName);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    if (category.isDefault) {
      return res.status(400).json({ message: 'Cannot delete default category' });
    }

    req.user.categories = req.user.categories.filter(cat => cat.name !== categoryName);
    await req.user.save();

    res.json({ 
      message: 'Category deleted successfully',
      categories: req.user.categories 
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;