const mongoose = require('mongoose');

const subtaskSchema = new mongoose.Schema({
  text: { type: String, required: true },
  completed: { type: Boolean, default: false }
});

const taskSchema = new mongoose.Schema({
  text: { type: String, required: true },
  description: { type: String },
  completed: { type: Boolean, default: false },
  category: { type: String },
  dueDate: { type: Date },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high'], 
    default: 'low' 
  },
  subtasks: [subtaskSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Task', taskSchema);