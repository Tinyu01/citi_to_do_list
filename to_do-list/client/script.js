document.addEventListener('DOMContentLoaded', () => {
  // Core Elements
  const newTaskInput = document.getElementById('new-task');
  const addTaskBtn = document.getElementById('add-task');
  const emptyAddTaskBtn = document.getElementById('empty-add-task');
  const tasksList = document.getElementById('tasks-list');
  const todoList = document.getElementById('todo-list');
  const inProgressList = document.getElementById('in-progress-list');
  const completedList = document.getElementById('completed-list');
  const emptyState = document.getElementById('empty-state');

  // Modal Elements
  const taskDetailsModal = document.getElementById('task-details-modal');
  const settingsModal = document.getElementById('settings-modal');
  const closeModalBtns = document.querySelectorAll('.close-modal');
  const settingsBtn = document.getElementById('settings-btn');

  // Form Elements
  const dueDateInput = document.getElementById('due-date');
  const taskCategorySelect = document.getElementById('task-category');
  const priorityDots = document.querySelectorAll('.priority-selector .priority-dot');

  // State Management
  let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  let selectedPriority = 'low';
  let currentEditTask = null;

  // Utility Functions
  function saveTasksToLocalStorage() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    updateTaskStats();
  }

  function updateTaskStats() {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    const pendingTasks = totalTasks - completedTasks;
    const productivityScore = totalTasks > 0 
      ? Math.round((completedTasks / totalTasks) * 100) 
      : 0;

    document.getElementById('total-tasks').textContent = totalTasks;
    document.getElementById('completed-tasks').textContent = completedTasks;
    document.getElementById('pending-tasks').textContent = pendingTasks;
    document.getElementById('productivity-score').textContent = `${productivityScore}%`;
  }

  function createTaskElement(task) {
    const taskItem = document.createElement('li');
    taskItem.className = `task-item priority-${task.priority} ${task.completed ? 'completed' : ''}`;
    taskItem.dataset.id = task.id;
    taskItem.innerHTML = `
      <div class="task-checkbox">
        <input type="checkbox" ${task.completed ? 'checked' : ''}>
      </div>
      <div class="task-content">
        <div class="task-title">${task.text}</div>
        <div class="task-meta">
          <span class="task-category ${task.category}">${task.category || 'No Category'}</span>
          <span class="task-date">${task.dueDate || 'No Due Date'}</span>
        </div>
      </div>
      <div class="task-actions">
        <button class="edit-task-btn"><i class="fas fa-edit"></i></button>
        <button class="delete-task-btn"><i class="fas fa-trash"></i></button>
      </div>
    `;

    // Checkbox Event
    const checkbox = taskItem.querySelector('.task-checkbox input');
    checkbox.addEventListener('change', () => toggleTaskCompletion(task.id));

    // Edit Button Event
    const editBtn = taskItem.querySelector('.edit-task-btn');
    editBtn.addEventListener('click', () => openTaskDetailsModal(task));

    // Delete Button Event
    const deleteBtn = taskItem.querySelector('.delete-task-btn');
    deleteBtn.addEventListener('click', () => deleteTask(task.id));

    return taskItem;
  }

  function renderTasks() {
    // Clear existing lists
    [tasksList, todoList, inProgressList, completedList].forEach(list => list.innerHTML = '');

    if (tasks.length === 0) {
      emptyState.style.display = 'flex';
      return;
    }

    emptyState.style.display = 'none';

    tasks.forEach(task => {
      const taskElement = createTaskElement(task);
      
      // Render in multiple views
      tasksList.appendChild(taskElement.cloneNode(true));
      
      if (task.completed) {
        completedList.appendChild(taskElement.cloneNode(true));
      } else {
        todoList.appendChild(taskElement.cloneNode(true));
      }
    });
  }

  function addTask() {
    const taskText = newTaskInput.value.trim();
    if (!taskText) return;

    const newTask = {
      id: Date.now(),
      text: taskText,
      completed: false,
      category: taskCategorySelect.value !== 'none' ? taskCategorySelect.value : null,
      dueDate: dueDateInput.value || null,
      priority: selectedPriority,
      createdAt: new Date().toISOString()
    };

    tasks.unshift(newTask);
    saveTasksToLocalStorage();
    renderTasks();

    // Reset form
    newTaskInput.value = '';
    taskCategorySelect.value = 'none';
    dueDateInput.value = '';
    document.querySelector('.priority-dot.active').classList.remove('active');
    document.querySelector('.priority-dot[data-priority="low"]').classList.add('active');
    selectedPriority = 'low';
  }

  function toggleTaskCompletion(taskId) {
    tasks = tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    saveTasksToLocalStorage();
    renderTasks();
  }

  function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    tasks = tasks.filter(task => task.id !== taskId);
    saveTasksToLocalStorage();
    renderTasks();
  }

  function openTaskDetailsModal(task) {
    currentEditTask = task;
    document.getElementById('edit-task-title').value = task.text;
    document.getElementById('edit-due-date').value = task.dueDate || '';
    document.getElementById('edit-task-category').value = task.category || 'none';
    
    // Reset priority dots
    document.querySelectorAll('#task-details-modal .priority-dot').forEach(dot => {
      dot.classList.remove('active');
      if (dot.dataset.priority === task.priority) {
        dot.classList.add('active');
      }
    });

    taskDetailsModal.style.display = 'flex';
  }

  // Event Listeners
  addTaskBtn.addEventListener('click', addTask);
  emptyAddTaskBtn.addEventListener('click', addTask);
  newTaskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
  });

  // Priority Selector
  priorityDots.forEach(dot => {
    dot.addEventListener('click', () => {
      priorityDots.forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
      selectedPriority = dot.dataset.priority;
    });
  });

  // Modal Close Buttons
  closeModalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      taskDetailsModal.style.display = 'none';
      settingsModal.style.display = 'none';
    });
  });

  // Settings Modal
  settingsBtn.addEventListener('click', () => {
    settingsModal.style.display = 'flex';
  });

  // Task Details Modal Save
  document.getElementById('save-task-btn').addEventListener('click', () => {
    if (currentEditTask) {
      const updatedTask = {
        ...currentEditTask,
        text: document.getElementById('edit-task-title').value,
        dueDate: document.getElementById('edit-due-date').value,
        category: document.getElementById('edit-task-category').value,
        priority: document.querySelector('#task-details-modal .priority-dot.active').dataset.priority
      };

      tasks = tasks.map(task => 
        task.id === currentEditTask.id ? updatedTask : task
      );

      saveTasksToLocalStorage();
      renderTasks();
      taskDetailsModal.style.display = 'none';
      currentEditTask = null;
    }
  });

  // Delete Task in Modal
  document.getElementById('delete-task-btn').addEventListener('click', () => {
    if (currentEditTask) {
      deleteTask(currentEditTask.id);
      taskDetailsModal.style.display = 'none';
    }
  });

  // Initial Setup
  renderTasks();
  updateTaskStats();

  // Set default due date to today
  dueDateInput.valueAsDate = new Date();
});

// content of index.js
document.addEventListener('DOMContentLoaded', function () {
  const themeSelect = document.getElementById('theme-select');
  const body = document.body;

  // Function to set the theme
  function setTheme(theme) {
    body.className = ''; // Reset all theme classes
    body.classList.add(`theme-${theme}`);
    localStorage.setItem('theme', theme);
  }

  // Load saved theme from localStorage
  const savedTheme = localStorage.getItem('theme') || 'light';
  setTheme(savedTheme);
  themeSelect.value = savedTheme;

  // Event listener for theme change
  themeSelect.addEventListener('change', function () {
    setTheme(this.value);
  });

  // Additional theme-related functionality can be added here
});

// Function to apply theme to the modal
function applyThemeToModal(theme) {
  const modal = document.getElementById('task-details-modal');
  modal.classList.remove('theme-dark', 'theme-sunset', 'theme-forest', 'theme-ocean');
  if (theme !== 'light') {
    modal.classList.add(`theme-${theme}`);
  }
}

// Event listener for theme change
document.getElementById('theme-select').addEventListener('change', function() {
  const selectedTheme = this.value;
  applyThemeToModal(selectedTheme);
});

// Function to open the modal
function openTaskDetailsModal() {
  const modal = document.getElementById('task-details-modal');
  modal.style.display = 'flex';
  applyThemeToModal(document.getElementById('theme-select').value);
}

// Function to close the modal
function closeTaskDetailsModal() {
  const modal = document.getElementById('task-details-modal');
  modal.style.display = 'none';
}

// Event listeners for opening and closing the modal
document.querySelectorAll('.task-item').forEach(item => {
  item.addEventListener('click', openTaskDetailsModal);
});

document.querySelector('.close-modal').addEventListener('click', closeTaskDetailsModal);
document.querySelector('.modal').addEventListener('click', function(event) {
  if (event.target === this) {
    closeTaskDetailsModal();
  }
});

// Function to apply the selected theme
function applyTheme(theme) {
  document.documentElement.className = ''; // Reset all theme classes
  document.documentElement.classList.add(`theme-${theme}`);
  localStorage.setItem('theme', theme);
}

// Function to initialize the theme from localStorage
function initializeTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  applyTheme(savedTheme);
  document.getElementById('theme-preference').value = savedTheme;
}

// Event listener for theme selection
document.getElementById('theme-preference').addEventListener('change', (e) => {
  applyTheme(e.target.value);
});

// Initialize theme on page load
initializeTheme();

// Modal open/close functionality
const modal = document.getElementById('settings-modal');
const openModalBtn = document.getElementById('settings-btn');
const closeModalBtn = document.querySelector('.close-modal');

openModalBtn.addEventListener('click', () => {
  modal.style.display = 'flex';
  setTimeout(() => {
    modal.querySelector('.modal-content').classList.add('active');
  }, 10);
});

closeModalBtn.addEventListener('click', () => {
  modal.querySelector('.modal-content').classList.remove('active');
  setTimeout(() => {
    modal.style.display = 'none';
  }, 300);
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.querySelector('.modal-content').classList.remove('active');
    setTimeout(() => {
      modal.style.display = 'none';
    }, 300);
  }
});

/* Fooeter Script */
document.addEventListener('DOMContentLoaded', function() {
  // Set current year
  document.getElementById('current-year').textContent = new Date().getFullYear();
  
  // Theme switcher
  const themeSelect = document.getElementById('theme-select');
  const settingsThemePreference = document.getElementById('theme-preference');
  
  // Function to update theme
  function updateTheme(theme) {
    document.body.className = '';
    document.body.classList.add(`theme-${theme}`);
    
    // Update footer appearance based on theme
    const footer = document.querySelector('footer');
    
    // Apply theme-specific gradient animations
    switch(theme) {
      case 'dark':
        footer.style.setProperty('--footer-accent', 'var(--dark-accent)');
        break;
      case 'sunset':
        footer.style.setProperty('--footer-accent', 'var(--sunset-accent)');
        break;
      case 'forest':
        footer.style.setProperty('--footer-accent', 'var(--forest-accent)');
        break;
      case 'ocean':
        footer.style.setProperty('--footer-accent', 'var(--ocean-accent)');
        break;
      default:
        footer.style.setProperty('--footer-accent', 'var(--light-accent)');
    }
    
    // Save theme preference
    localStorage.setItem('theme', theme);
  }
  
  // Apply theme from localStorage
  const savedTheme = localStorage.getItem('theme') || 'light';
  updateTheme(savedTheme);
  
  // Update select elements to match saved theme
  if (themeSelect) {
    themeSelect.value = savedTheme;
  }
  
  if (settingsThemePreference) {
    settingsThemePreference.value = savedTheme;
  }
  
  // Listen for theme changes
  if (themeSelect) {
    themeSelect.addEventListener('change', function() {
      updateTheme(this.value);
      
      // Update settings theme preference to match
      if (settingsThemePreference) {
        settingsThemePreference.value = this.value;
      }
    });
  }
  
  // Listen for theme changes from settings
  if (settingsThemePreference) {
    settingsThemePreference.addEventListener('change', function() {
      updateTheme(this.value);
      
      // Update header theme selector to match
      if (themeSelect) {
        themeSelect.value = this.value;
      }
    });
  }
  
  // Apply smooth scroll to footer links
  document.querySelectorAll('.footer-links a').forEach(link => {
    link.addEventListener('click', function(e) {
      // Only apply if the href points to a section on the page
      const href = this.getAttribute('href');
      if (href.startsWith('#') && href.length > 1) {
        e.preventDefault();
        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth'
          });
        }
      }
    });
  });
  
  // Add subtle animation to footer on scroll
  window.addEventListener('scroll', function() {
    const footer = document.querySelector('footer');
    const footerPosition = footer.getBoundingClientRect().top;
    const windowHeight = window.innerHeight;
    
    if (footerPosition < windowHeight) {
      // Footer is in view
      const scrollProgress = (windowHeight - footerPosition) / windowHeight;
      const clampedProgress = Math.min(scrollProgress, 1);
      
      // Apply subtle animation
      footer.style.transform = `translateY(${(1 - clampedProgress) * 10}px)`;
      footer.style.opacity = 0.5 + (0.5 * clampedProgress);
    }
  });
});