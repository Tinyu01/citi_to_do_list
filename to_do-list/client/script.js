// ======================
// TASK MANAGER APPLICATION
// ======================

document.addEventListener('DOMContentLoaded', () => {
  // ======================
  // DOM ELEMENTS
  // ======================
  const elements = {
    // Task Input Elements
    newTaskInput: document.getElementById('new-task'),
    addTaskBtn: document.getElementById('add-task'),
    emptyAddTaskBtn: document.getElementById('empty-add-task'),
    dueDateInput: document.getElementById('due-date'),
    taskCategorySelect: document.getElementById('task-category'),
    priorityDots: document.querySelectorAll('.priority-selector .priority-dot'),

    // Task List Containers
    tasksList: document.getElementById('tasks-list'),
    todoList: document.getElementById('todo-list'),
    inProgressList: document.getElementById('in-progress-list'),
    completedList: document.getElementById('completed-list'),
    emptyState: document.getElementById('empty-state'),

    // Modal Elements
    taskDetailsModal: document.getElementById('task-details-modal'),
    settingsModal: document.getElementById('settings-modal'),
    closeModalBtns: document.querySelectorAll('.close-modal'),
    settingsBtn: document.getElementById('settings-btn'),

    // Modal Form Elements
    editTaskTitle: document.getElementById('edit-task-title'),
    editDueDate: document.getElementById('edit-due-date'),
    editTaskCategory: document.getElementById('edit-task-category'),
    saveTaskBtn: document.getElementById('save-task-btn'),
    deleteTaskBtn: document.getElementById('delete-task-btn'),

    // Theme Elements
    themeSelect: document.getElementById('theme-select'),
    settingsThemePreference: document.getElementById('theme-preference'),

    // Stats Elements
    totalTasks: document.getElementById('total-tasks'),
    completedTasks: document.getElementById('completed-tasks'),
    pendingTasks: document.getElementById('pending-tasks'),
    productivityScore: document.getElementById('productivity-score'),

    // Footer Elements
    currentYear: document.getElementById('current-year'),
    footerLinks: document.querySelectorAll('.footer-links a'),

    // Kanban View Elements
    kanbanViewBtn: document.getElementById('kanban-view-btn'),
    kanbanView: document.querySelector('.kanban-view'),

    // List View Elements
    listViewBtn: document.getElementById('list-view-btn'),
    listView: document.querySelector('.list-view'),

    // Calendar View Elements
    calendarViewBtn: document.getElementById('calender-view-btn'),
    calendarView: document.querySelector('.calendar-view')
  };

  // Ensure list view is shown by default
  elements.listViewBtn.classList.add('active');
  elements.listView.style.display = 'block';

  // ======================
  // APPLICATION STATE
  // ======================
  const state = {
    tasks: JSON.parse(localStorage.getItem('tasks')) || [],
    selectedPriority: 'low',
    currentEditTask: null
  };

  // ======================
  // UTILITY FUNCTIONS
  // ======================
  const utils = {
    saveTasksToLocalStorage() {
      localStorage.setItem('tasks', JSON.stringify(state.tasks));
      this.updateTaskStats();
    },

    updateTaskStats() {
      const totalTasks = state.tasks.length;
      const completedTasks = state.tasks.filter(task => task.completed).length;
      const pendingTasks = totalTasks - completedTasks;
      const productivityScore = totalTasks > 0 
        ? Math.round((completedTasks / totalTasks) * 100) 
        : 0;

      elements.totalTasks.textContent = totalTasks;
      elements.completedTasks.textContent = completedTasks;
      elements.pendingTasks.textContent = pendingTasks;
      elements.productivityScore.textContent = `${productivityScore}%`;
    },

    createTaskElement(task) {
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

      // Add event listeners to the task element
      const checkbox = taskItem.querySelector('.task-checkbox input');
      checkbox.addEventListener('change', () => taskManager.toggleTaskCompletion(task.id));

      const editBtn = taskItem.querySelector('.edit-task-btn');
      editBtn.addEventListener('click', () => modals.openTaskDetailsModal(task));

      const deleteBtn = taskItem.querySelector('.delete-task-btn');
      deleteBtn.addEventListener('click', () => taskManager.deleteTask(task.id));

      return taskItem;
    }
  };

  // ======================
  // TASK MANAGEMENT
  // ======================
  const taskManager = {
    renderTasks() {
      // Clear existing lists
      [elements.tasksList, elements.todoList, elements.inProgressList, elements.completedList]
        .forEach(list => list.innerHTML = '');

      if (state.tasks.length === 0) {
        elements.emptyState.style.display = 'flex';
        return;
      }

      elements.emptyState.style.display = 'none';

      state.tasks.forEach(task => {
        const taskElement = utils.createTaskElement(task);
        
        // Render in multiple views
        elements.tasksList.appendChild(taskElement);
        
        if (task.completed) {
          elements.completedList.appendChild(taskElement.cloneNode(true));
        } else {
          elements.todoList.appendChild(taskElement.cloneNode(true));
        }
      });
    },

    addTask() {
      const taskText = elements.newTaskInput.value.trim();
      if (!taskText) return;

      const newTask = {
        id: Date.now(),
        text: taskText,
        completed: false,
        category: elements.taskCategorySelect.value !== 'none' ? elements.taskCategorySelect.value : null,
        dueDate: elements.dueDateInput.value || null,
        priority: state.selectedPriority,
        createdAt: new Date().toISOString()
      };

      state.tasks.unshift(newTask);
      utils.saveTasksToLocalStorage();
      this.renderTasks();

      // Reset form
      elements.newTaskInput.value = '';
      elements.taskCategorySelect.value = 'none';
      elements.dueDateInput.value = '';
      document.querySelector('.priority-dot.active').classList.remove('active');
      document.querySelector('.priority-dot[data-priority="low"]').classList.add('active');
      state.selectedPriority = 'low';
    },

    toggleTaskCompletion(taskId) {
      state.tasks = state.tasks.map(task => 
        task.id === taskId ? { ...task, completed: !task.completed } : task
      );
      utils.saveTasksToLocalStorage();
      this.renderTasks();
    },

    deleteTask(taskId) {
      if (!confirm('Are you sure you want to delete this task?')) return;
      
      state.tasks = state.tasks.filter(task => task.id !== taskId);
      utils.saveTasksToLocalStorage();
      this.renderTasks();
    },

    updateTask(updatedTask) {
      state.tasks = state.tasks.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      );
      utils.saveTasksToLocalStorage();
      this.renderTasks();
    }
  };

  // ======================
  // MODAL MANAGEMENT
  // ======================
  const modals = {
    openTaskDetailsModal(task) {
      state.currentEditTask = task;
      elements.editTaskTitle.value = task.text;
      elements.editDueDate.value = task.dueDate || '';
      elements.editTaskCategory.value = task.category || 'none';
      
      // Reset priority dots
      document.querySelectorAll('#task-details-modal .priority-dot').forEach(dot => {
        dot.classList.remove('active');
        if (dot.dataset.priority === task.priority) {
          dot.classList.add('active');
        }
      });

      elements.taskDetailsModal.style.display = 'flex';
      themeManager.applyThemeToModal(themeManager.getCurrentTheme());
    },

    closeModal(modal) {
      modal.querySelector('.modal-content')?.classList.remove('active');
      setTimeout(() => {
        modal.style.display = 'none';
      }, 300);
    },

    saveTaskChanges() {
      if (state.currentEditTask) {
        const updatedTask = {
          ...state.currentEditTask,
          text: elements.editTaskTitle.value,
          dueDate: elements.editDueDate.value,
          category: elements.editTaskCategory.value,
          priority: document.querySelector('#task-details-modal .priority-dot.active').dataset.priority
        };

        taskManager.updateTask(updatedTask);
        elements.taskDetailsModal.style.display = 'none';
        state.currentEditTask = null;
      }
    }
  };

  // ======================
  // THEME MANAGEMENT
  // ======================
  const themeManager = {
    getCurrentTheme() {
      return localStorage.getItem('theme') || 'light';
    },

    updateTheme(theme) {
      document.body.className = '';
      document.body.classList.add(`theme-${theme}`);
      
      // Update footer appearance
      const footer = document.querySelector('footer');
      const accentMap = {
        dark: 'var(--dark-accent)',
        sunset: 'var(--sunset-accent)',
        forest: 'var(--forest-accent)',
        ocean: 'var(--ocean-accent)',
        light: 'var(--light-accent)'
      };
      
      footer.style.setProperty('--footer-accent', accentMap[theme] || accentMap.light);
      localStorage.setItem('theme', theme);
    },

    applyThemeToModal(theme) {
      elements.taskDetailsModal.classList.remove(
        'theme-dark', 'theme-sunset', 'theme-forest', 'theme-ocean'
      );
      if (theme !== 'light') {
        elements.taskDetailsModal.classList.add(`theme-${theme}`);
      }
    },

    initializeTheme() {
      const savedTheme = this.getCurrentTheme();
      this.updateTheme(savedTheme);
      
      if (elements.themeSelect) elements.themeSelect.value = savedTheme;
      if (elements.settingsThemePreference) elements.settingsThemePreference.value = savedTheme;
    }
  };

  // ======================
  // FOOTER MANAGEMENT
  // ======================
  const footerManager = {
    init() {
      // Set current year
      elements.currentYear.textContent = new Date().getFullYear();
      
      // Apply smooth scroll to footer links
      elements.footerLinks.forEach(link => {
        link.addEventListener('click', function(e) {
          const href = this.getAttribute('href');
          if (href.startsWith('#') && href.length > 1) {
            e.preventDefault();
            const targetElement = document.getElementById(href.substring(1));
            targetElement?.scrollIntoView({ behavior: 'smooth' });
          }
        });
      });
      
      // Add subtle animation to footer on scroll
      window.addEventListener('scroll', this.handleFooterScroll);
    },

    handleFooterScroll() {
      const footer = document.querySelector('footer');
      const footerPosition = footer.getBoundingClientRect().top;
      const windowHeight = window.innerHeight;
      
      if (footerPosition < windowHeight) {
        const scrollProgress = (windowHeight - footerPosition) / windowHeight;
        const clampedProgress = Math.min(scrollProgress, 1);
        
        footer.style.transform = `translateY(${(1 - clampedProgress) * 10}px)`;
        footer.style.opacity = 0.5 + (0.5 * clampedProgress);
      }
    }
  };

  // ======================
  // EVENT LISTENERS
  // ======================
  const setupEventListeners = () => {
    // Task Management
    elements.addTaskBtn.addEventListener('click', () => taskManager.addTask());
    elements.emptyAddTaskBtn.addEventListener('click', () => taskManager.addTask());
    elements.newTaskInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') taskManager.addTask();
    });

    // Priority Selector
    elements.priorityDots.forEach(dot => {
      dot.addEventListener('click', () => {
        elements.priorityDots.forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
        state.selectedPriority = dot.dataset.priority;
      });
    });

    // Modal Close Buttons
    elements.closeModalBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        modals.closeModal(elements.taskDetailsModal);
        modals.closeModal(elements.settingsModal);
      });
    });

    // Settings Modal
    elements.settingsBtn.addEventListener('click', () => {
      elements.settingsModal.style.display = 'flex';
      setTimeout(() => {
        elements.settingsModal.querySelector('.modal-content').classList.add('active');
      }, 10);
    });

    // Task Details Modal Actions
    elements.saveTaskBtn.addEventListener('click', () => modals.saveTaskChanges());
    elements.deleteTaskBtn.addEventListener('click', () => {
      if (state.currentEditTask) {
        taskManager.deleteTask(state.currentEditTask.id);
        elements.taskDetailsModal.style.display = 'none';
      }
    });

    // Theme Change Handlers
    if (elements.themeSelect) {
      elements.themeSelect.addEventListener('change', function() {
        themeManager.updateTheme(this.value);
        if (elements.settingsThemePreference) elements.settingsThemePreference.value = this.value;
      });
    }

    if (elements.settingsThemePreference) {
      elements.settingsThemePreference.addEventListener('change', function() {
        themeManager.updateTheme(this.value);
        if (elements.themeSelect) elements.themeSelect.value = this.value;
      });
    }

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
      if (e.target === elements.taskDetailsModal) modals.closeModal(elements.taskDetailsModal);
      if (e.target === elements.settingsModal) modals.closeModal(elements.settingsModal);
    });

    // Kanban View Button
    elements.kanbanViewBtn.addEventListener('click', () => {
      elements.kanbanView.style.display = 'block';
    });

    // List View Button
    elements.listViewBtn.addEventListener('click', () => {
      elements.listView.style.display = 'block';
    });

    // Calendar View Button
    elements.calendarViewBtn.addEventListener('click', () => {
      elements.calendarView.style.display = 'block';
    });

    const viewButtons = [elements.listViewBtn, elements.kanbanViewBtn, elements.calendarViewBtn];
    const views = [elements.listView, elements.kanbanView, elements.calendarView];

    viewButtons.forEach((btn, index) => {
      btn.addEventListener('click', () => {
        viewButtons.forEach((b, i) => {
          if (i === index) {
            b.classList.add('active');
            views[i].style.display = 'block';
          } else {
            b.classList.remove('active');
            views[i].style.display = 'none';
          }
        });
      });
    });
  };

  // ======================
  // INITIALIZATION
  // ======================
  const init = () => {
    themeManager.initializeTheme();
    taskManager.renderTasks();
    utils.updateTaskStats();
    elements.dueDateInput.valueAsDate = new Date();
    footerManager.init();
    setupEventListeners();
  };

  init();
});