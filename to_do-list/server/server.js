// server/server.js
const express = require('express');
const app = express();
const PORT = 3000;

// Middleware to parse JSON requests
app.use(express.json());

// Serve static files from the client folder
app.use(express.static('../client'));

// In-memory array to store to-do items
let todos = [];

// API Routes
// Get all to-dos
app.get('/api/todos', (req, res) => {
  res.json(todos);
});

// Add a new to-do
app.post('/api/todos', (req, res) => {
  const { task } = req.body;
  if (!task) return res.status(400).json({ error: 'Task is required' });
  const newTodo = {
    id: Date.now(), // Unique ID based on timestamp
    task,
    completed: false,
  };
  todos.push(newTodo);
  res.status(201).json(newTodo);
});

// Remove a to-do
app.delete('/api/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  todos = todos.filter((todo) => todo.id !== id);
  res.status(204).send();
});

// Mark a to-do as completed
app.put('/api/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const todo = todos.find((t) => t.id === id);
  if (!todo) return res.status(404).json({ error: 'Todo not found' });
  todo.completed = !todo.completed;
  res.json(todo);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});