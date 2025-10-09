const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  color: {
    type: String,
    default: '#4CAF50'
  },
  isDefault: {
    type: Boolean,
    default: false
  }
});

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    trim: true
  },
  categories: [categorySchema],
  isGuest: {
    type: Boolean,
    default: false
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'sunset', 'forest', 'ocean'],
      default: 'light'
    },
    defaultView: {
      type: String,
      enum: ['list', 'kanban', 'calendar'],
      default: 'list'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Add default categories for new users
userSchema.pre('save', function(next) {
  if (this.isNew) {
    const defaultCategories = [
      { name: 'All', color: '#808080', isDefault: true },
      { name: 'Work', color: '#4CAF50', isDefault: true },
      { name: 'Personal', color: '#2196F3', isDefault: true },
      { name: 'Health', color: '#F44336', isDefault: true }
    ];
    this.categories = defaultCategories;
  }
  next();
});

// Method to verify password
userSchema.methods.verifyPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);