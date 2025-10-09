const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error('No authentication token provided');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      throw new Error('User not found');
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Please authenticate' });
  }
};

const allowGuest = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      // Create a temporary guest user
      const guestUser = new User({
        username: `guest_${Date.now()}`,
        email: `guest_${Date.now()}@taskflow.temp`,
        password: Math.random().toString(36).slice(-8),
        isGuest: true
      });
      await guestUser.save();
      
      const guestToken = jwt.sign(
        { userId: guestUser._id, isGuest: true },
        process.env.GUEST_TOKEN_SECRET,
        { expiresIn: '24h' }
      );
      
      req.user = guestUser;
      req.guestToken = guestToken;
      return next();
    }

    // If token exists, verify it
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid authentication' });
  }
};

module.exports = { auth, allowGuest };