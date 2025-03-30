# To-Do List Application

A simple browser-based To-Do List application with a Node.js backend. This project demonstrates the use of **HTML**, **CSS**, **JavaScript (ES6+)**, and **Node.js** with **Express**.

---

## Features
- **Add tasks**: Add new tasks to the list.
- **Mark tasks as completed**: Toggle task completion status.
- **Delete tasks**: Remove tasks from the list.
- **Real-time updates**: The list updates dynamically without refreshing the page.

---

## Technologies Used
- **Frontend**:
  - HTML
  - CSS
  - JavaScript (ES6+ features like arrow functions, template literals, and async/await)
- **Backend**:
  - Node.js
  - Express.js
- **APIs**:
  - RESTful API for CRUD operations (Create, Read, Update, Delete)

---

## Project Structure
```
todo-list/
├── client/ # Frontend files
│   ├── index.html # Main HTML file
│   ├── styles.css # CSS for styling
│   └── script.js # JavaScript for frontend logic
├── server/ # Backend files
│   └── server.js # Node.js server with Express
└── package.json # Node.js configuration
```

---

## Setup Instructions

### Prerequisites
- **Node.js**: Make sure Node.js is installed on your machine. Download it from [here](https://nodejs.org/).

### Steps
1. **Clone the repository** (if applicable):
   ```bash
   git clone <repository-url>
   cd todo-list
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Start the server**:
   ```bash
   node server/server.js
   ```
4. **Open the application**:
   - Go to [http://localhost:3000](http://localhost:3000) in your browser.

---

## API Endpoints
The backend provides the following RESTful API endpoints:

| Method | Endpoint         | Description                          |
|--------|----------------|----------------------------------|
| GET    | /api/todos     | Fetch all to-do items.          |
| POST   | /api/todos     | Add a new to-do item.           |
| DELETE | /api/todos/:id | Delete a to-do item by ID.      |
| PUT    | /api/todos/:id | Toggle the completion status of a to-do item. |

---

## Usage
### Add a task:
Type a task in the input field and click "Add".

### Mark a task as completed:
Click the ✔️ button next to the task.

### Delete a task:
Click the 🗑️ button next to the task.

---

## Code Examples
### Backend (Node.js + Express)
```javascript
// server/server.js
const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('../client'));

let todos = [];

app.get('/api/todos', (req, res) => {
  res.json(todos);
});

app.post('/api/todos', (req, res) => {
  const { task } = req.body;
  if (!task) return res.status(400).json({ error: 'Task is required' });
  const newTodo = { id: Date.now(), task, completed: false };
  todos.push(newTodo);
  res.status(201).json(newTodo);
});

app.delete('/api/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  todos = todos.filter((todo) => todo.id !== id);
  res.status(204).send();
});

app.put('/api/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const todo = todos.find((t) => t.id === id);
  if (!todo) return res.status(404).json({ error: 'Todo not found' });
  todo.completed = !todo.completed;
  res.json(todo);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

### Frontend (JavaScript)
```javascript
// client/script.js
const API_URL = 'http://localhost:3000/api/todos';

const fetchTodos = async () => {
  try {
    const response = await fetch(API_URL);
    const todos = await response.json();
    renderTodos(todos);
  } catch (error) {
    console.error('Error fetching todos:', error);
  }
};

const renderTodos = (todos) => {
  todoList.innerHTML = '';
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
```

---

## Enhancements (Optional)
- **Persistence**: Use a database (e.g., SQLite, MongoDB) to store tasks.
- **Error Handling**: Add user-friendly error messages for API failures.
- **Styling**: Use a CSS framework like Bootstrap or Tailwind for better UI.

---

## License
This project is open-source and available under the MIT License.

---

## Author
[Your Name]  
[Your GitHub Profile]  
[Your Email]

---

## How to Use the README.md File
1. Replace placeholders like `<repository-url>`, `[Your Name]`, `[Your GitHub Profile]`, and `[Your Email]` with your actual details.
2. Save the file as `README.md` in the root of your project folder.
3. Commit and push it to your GitHub repository (if applicable).

This README file will help you understand this project and get it up and running quickly! 🚀

## 🌐 Live Demo

[Live Demo Link](https://tinyu01.github.io/citi_to_do_list/to_do-list/client/)
