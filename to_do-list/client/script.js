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

  // Category Management Button Interaction
  document.addEventListener('DOMContentLoaded', () => {
    const addCategoryBtn = document.getElementById('add-category');

    // Prevent multiple click event listeners
    addCategoryBtn.removeEventListener('click', addCategoryHandler);
    addCategoryBtn.addEventListener('click', addCategoryHandler);

    // Add hover and active states for better UX
    addCategoryBtn.addEventListener('mouseenter', () => {
      addCategoryBtn.style.transform = 'scale(1.05)';
      addCategoryBtn.style.opacity = '0.9';
    });

    addCategoryBtn.addEventListener('mouseleave', () => {
      addCategoryBtn.style.transform = 'scale(1)';
      addCategoryBtn.style.opacity = '1';
    });

    // Ensure button is not disabled
    addCategoryBtn.disabled = false;
  });

  // Category addition handler
  function addCategoryHandler() {
    // Temporary disable button to prevent multiple clicks
    const addCategoryBtn = document.getElementById('add-category');
    addCategoryBtn.disabled = true;

    // Show modal for better user experience
    const categoryModal = createCategoryModal();
    document.body.appendChild(categoryModal);

    // Focus on input for immediate interaction
    const categoryInput = categoryModal.querySelector('#new-category-input');
    categoryInput.focus();
  }

  // Create a modal for adding categories
  function createCategoryModal() {
    const modal = document.createElement('div');
    modal.innerHTML = `
      <div class="category-modal" style="
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
      ">
          <div class="category-modal-content" style="
              background: white;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
              width: 300px;
          ">
              <h2 style="margin-bottom: 15px;">Add New Category</h2>
              <input 
                  type="text" 
                  id="new-category-input" 
                  placeholder="Enter category name" 
                  style="
                      width: 100%;
                      padding: 10px;
                      margin-bottom: 15px;
                      border: 1px solid #ddd;
                      border-radius: 4px;
                  "
              >
              <div style="display: flex; justify-content: space-between;">
                  <button id="cancel-category" style="
                      background-color: #f3f4f6;
                      color: #374151;
                      border: none;
                      padding: 10px 15px;
                      border-radius: 4px;
                      cursor: pointer;
                  ">Cancel</button>
                  <button id="confirm-category" style="
                      background-color: #3b82f6;
                      color: white;
                      border: none;
                      padding: 10px 15px;
                      border-radius: 4px;
                      cursor: pointer;
                  ">Add Category</button>
              </div>
          </div>
      </div>
  `;

    // Cancel button
    const cancelBtn = modal.querySelector('#cancel-category');
    cancelBtn.addEventListener('click', () => {
      document.body.removeChild(modal);
      document.getElementById('add-category').disabled = false;
    });

    // Confirm button
    const confirmBtn = modal.querySelector('#confirm-category');
    confirmBtn.addEventListener('click', () => {
      const categoryInput = modal.querySelector('#new-category-input');
      const categoryName = categoryInput.value.trim();

      // Check if category name is provided
      if (!categoryName) {
        showNotification('Category name cannot be empty', 'error');
        return;
      }

      // Check if category already exists
      if (categoryExists(categoryName)) {
        showNotification(`Category "${categoryName}" already exists`, 'error');
        return;
      }

      // Add the new category
      const categoryData = {
        name: categoryName,
        color: categoryColors[Math.floor(Math.random() * categoryColors.length)]
      };
      addCategoryToUI(categoryData);

      // Show success notification
      showNotification(`Category "${categoryName}" added successfully`);

      // Remove modal and re-enable button
      document.body.removeChild(modal);
      document.getElementById('add-category').disabled = false;
    });

    // Allow Enter key to submit
    const categoryInput = modal.querySelector('#new-category-input');
    categoryInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        confirmBtn.click();
      }
    });

    return modal;
  }

  // Existing helper functions (categoryExists, showNotification, etc.) remain the same as in previous implementation

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
  // CATEGORY MANAGEMENT
  // ======================
  const categoryManager = {
    init() {
      this.addCategoryBtn = document.getElementById('add-category');
      this.categoryList = document.getElementById('category-list');
      this.taskCategorySelect = document.getElementById('task-category');
      this.editTaskCategorySelect = document.getElementById('edit-task-category');

      // Predefined color palette
      this.categoryColors = [
        '#6366f1', '#f59e0b', '#10b981', '#ef4444',
        '#8b5cf6', '#ec4899', '#14b8a6', '#f97316',
        '#0ea5e9', '#84cc16'
      ];

      this.defaultCategories = ['all', 'work', 'personal', 'health'];
      this.setupEventListeners();
    },

    setupEventListeners() {
      this.addCategoryBtn.addEventListener('click', () => this.showAddCategoryModal());
    },

    showAddCategoryModal() {
      // Create modal elements
      const modalOverlay = document.createElement('div');
      modalOverlay.className = 'category-modal-overlay';

      modalOverlay.innerHTML = `
      <div class="category-modal">
        <div class="modal-header">
          <h3>Add New Category</h3>
          <button class="close-modal">&times;</button>
        </div>
        <div class="modal-body">
          <input type="text" id="new-category-input" placeholder="Enter category name">
          <div class="error-message" id="category-error"></div>
        </div>
        <div class="modal-footer">
          <button class="secondary-btn" id="cancel-category">Cancel</button>
          <button class="primary-btn" id="confirm-category">Add Category</button>
        </div>
      </div>
    `;

      document.body.appendChild(modalOverlay);

      // Get DOM references
      const input = modalOverlay.querySelector('#new-category-input');
      const errorElement = modalOverlay.querySelector('#category-error');
      const confirmBtn = modalOverlay.querySelector('#confirm-category');
      const cancelBtn = modalOverlay.querySelector('#cancel-category');
      const closeBtn = modalOverlay.querySelector('.close-modal');

      // Focus input field immediately
      input.focus();

      // Clear any previous errors
      errorElement.textContent = '';

      // Event handler for adding category
      const handleAddCategory = () => {
        const categoryName = input.value.trim();

        // Validate input
        if (!categoryName) {
          this.showError(errorElement, 'Please enter a category name');
          return;
        }

        if (categoryName.length > 20) {
          this.showError(errorElement, 'Category name too long (max 20 chars)');
          return;
        }

        const categorySlug = categoryName.toLowerCase().replace(/\s+/g, '-');

        if (this.categoryExists(categorySlug)) {
          this.showError(errorElement, 'This category already exists');
          return;
        }

        // Add the category
        this.addCategory(categorySlug, categoryName);

        // Close the modal
        document.body.removeChild(modalOverlay);
      };

      // Set up event listeners
      confirmBtn.addEventListener('click', handleAddCategory);

      cancelBtn.addEventListener('click', () => {
        document.body.removeChild(modalOverlay);
      });

      closeBtn.addEventListener('click', () => {
        document.body.removeChild(modalOverlay);
      });

      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          handleAddCategory();
        }
      });

      // Close when clicking outside modal
      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
          document.body.removeChild(modalOverlay);
        }
      });
    },

    showError(element, message) {
      element.textContent = message;
      element.style.display = 'block';
      setTimeout(() => {
        element.style.display = 'none';
      }, 3000);
    },

    categoryExists(slug) {
      return !!document.querySelector(`[data-category="${slug}"]`);
    },

    addCategory(slug, name) {
      const randomColor = this.categoryColors[
        Math.floor(Math.random() * this.categoryColors.length)
      ];

      // Create list item
      const listItem = document.createElement('li');
      listItem.className = 'category-item';
      listItem.dataset.category = slug;
      listItem.innerHTML = `
      <span class="category-color" style="background-color: ${randomColor};"></span>
      <span class="category-name">${name}</span>
      ${this.defaultCategories.includes(slug) ? '' : `
        <button class="delete-category-btn" title="Delete category">
          <i class="fas fa-times"></i>
        </button>
      `}
    `;

      // Add to sidebar list (before the add button)
      this.categoryList.insertBefore(listItem, this.addCategoryBtn.parentNode);

      // Add to both dropdowns
      this.addToDropdown(this.taskCategorySelect, slug, name);
      this.addToDropdown(this.editTaskCategorySelect, slug, name);

      // Add delete handler if not default category
      if (!this.defaultCategories.includes(slug)) {
        listItem.querySelector('.delete-category-btn').addEventListener('click', (e) => {
          e.stopPropagation();
          if (confirm(`Are you sure you want to delete the "${name}" category?`)) {
            this.removeCategory(slug);
          }
        });
      }
    },

    addToDropdown(select, value, text) {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = text;
      select.appendChild(option);
    },

    removeCategory(slug) {
      // Remove from list
      const item = document.querySelector(`[data-category="${slug}"]`);
      if (item) item.remove();

      // Remove from dropdowns
      this.removeFromDropdown(this.taskCategorySelect, slug);
      this.removeFromDropdown(this.editTaskCategorySelect, slug);
    },

    removeFromDropdown(select, value) {
      const option = select.querySelector(`option[value="${value}"]`);
      if (option) option.remove();
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
        link.addEventListener('click', function (e) {
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
      elements.themeSelect.addEventListener('change', function () {
        themeManager.updateTheme(this.value);
        if (elements.settingsThemePreference) elements.settingsThemePreference.value = this.value;
      });
    }

    if (elements.settingsThemePreference) {
      elements.settingsThemePreference.addEventListener('change', function () {
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
    categoryManager.init();
    setupEventListeners();
  };

  init();
});