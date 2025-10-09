require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const Task = require('./models/Task');
const User = require('./models/User');
const authRoutes = require('./routes/auth');
const { auth, allowGuest } = require('./middleware/auth');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"]
  }
});

// Middleware
app.use(cors({
  origin: "*",
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use('/auth', authRoutes);

// Socket.IO connection handling
io.on('connection', async (socket) => {
  console.log('Client connected:', socket.id);

  // Handle authentication
  const token = socket.handshake.auth.token;
  let userId;

  try {
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.userId;
      console.log('Authenticated user:', userId);
    } else {
      // Create guest user
      const guestToken = jwt.sign({ isGuest: true }, process.env.GUEST_TOKEN_SECRET);
      userId = guestToken;
      console.log('Guest user connected');
    }

    // Load initial tasks
    try {
      const tasks = await Task.find({ user: userId }).sort({ createdAt: -1 });
      console.log('Sending tasks to client:', tasks.length);
      socket.emit('loadTasks', tasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
      socket.emit('error', { message: 'Error loading tasks' });
    }

    // Handle task events
    socket.on('createTask', async (taskData) => {
      try {
        const task = new Task({
          ...taskData,
          user: userId
        });
        await task.save();
        io.emit('taskCreated', task);
      } catch (error) {
        console.error('Error creating task:', error);
        socket.emit('error', { message: 'Error creating task' });
      }
    });

    socket.on('updateTask', async ({ taskId, updates }) => {
      try {
        const task = await Task.findOneAndUpdate(
          { _id: taskId, user: userId },
          updates,
          { new: true }
        );
        if (task) {
          io.emit('taskUpdated', task);
        }
      } catch (error) {
        console.error('Error updating task:', error);
        socket.emit('error', { message: 'Error updating task' });
      }
    });

    socket.on('deleteTask', async (taskId) => {
      try {
        await Task.findOneAndDelete({ _id: taskId, user: userId });
        io.emit('taskDeleted', taskId);
      } catch (error) {
        console.error('Error deleting task:', error);
        socket.emit('error', { message: 'Error deleting task' });
      }
    });

  } catch (error) {
    console.error('Authentication error:', error);
    socket.emit('error', { message: 'Authentication failed' });
    socket.disconnect(true);
  }

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// API Routes
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks); // Ensure tasks is always an array
  } catch (err) {
    console.error('Error fetching tasks:', err); // Log the error for debugging
    res.status(500).json({ message: 'Failed to fetch tasks' });
  }
});

app.post('/api/tasks', async (req, res) => {
  const task = new Task(req.body);
  
  try {
    const newTask = await task.save();
    res.status(201).json(newTask);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedTask);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Handle undefined routes
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});