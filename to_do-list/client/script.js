// client/script.js
const API_URL = 'http://localhost:3000/api/todos';

// DOM Elements
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');

// Fetch and display all to-dos
const fetchTodos = async () => {
  try {
    const response = await fetch(API_URL);
    const todos = await response.json();
    renderTodos(todos);
  } catch (error) {
    console.error('Error fetching todos:', error);
  }
};

// Render to-do items to the DOM
const renderTodos = (todos) => {
  todoList.innerHTML = ''; // Clear current list
  todos.forEach(({ id, task, completed }) => {
    const li = document.createElement('li');
    li.className = `todo-item ${completed ? 'completed' : ''}`;
    li.innerHTML = `
      <span>${task}</span>
      <div>
        <button onclick="toggleTodo(${id})">✔️</button>
        <button onclick="deleteTodo(${id})">🗑️</button>
      </div>
    `;
    todoList.appendChild(li);
  });
};

// Add a new to-do
const addTodo = async (task) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task }),
    });
    if (!response.ok) throw new Error('Failed to add todo');
    fetchTodos(); // Refresh the list
  } catch (error) {
    console.error('Error adding todo:', error);
  }
};

// Delete a to-do
const deleteTodo = async (id) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete todo');
    fetchTodos(); // Refresh the list
  } catch (error) {
    console.error('Error deleting todo:', error);
  }
};

// Toggle to-do completion
const toggleTodo = async (id) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, { method: 'PUT' });
    if (!response.ok) throw new Error('Failed to toggle todo');
    fetchTodos(); // Refresh the list
  } catch (error) {
    console.error('Error toggling todo:', error);
  }
};

// Event Listeners
todoForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const task = todoInput.value.trim();
  if (task) {
    addTodo(task);
    todoInput.value = ''; // Clear input
  }
});

// Load todos on page load
window.addEventListener('load', fetchTodos);