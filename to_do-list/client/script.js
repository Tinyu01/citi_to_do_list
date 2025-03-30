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
    taskDescription: document.getElementById('task-description'),

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
    editTaskDescription: document.getElementById('edit-task-description'),
    saveTaskBtn: document.getElementById('save-task-btn'),
    deleteTaskBtn: document.getElementById('delete-task-btn'),
    newSubtaskInput: document.getElementById('new-subtask'),
    addSubtaskBtn: document.getElementById('add-subtask-btn'),
    subtasksList: document.getElementById('subtasks-list'),

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
    calendarView: document.querySelector('.calendar-view'),
    calendarTitle: document.getElementById('calendar-title'),
    calendarGrid: document.getElementById('calendar-grid'),
    prevMonthBtn: document.getElementById('prev-month'),
    nextMonthBtn: document.getElementById('next-month'),

    // Sort Select Element
    sortSelect: document.getElementById('sort-select'),

    // Search Elements
    searchInput: document.getElementById('search'),
    voiceSearchBtn: document.getElementById('voice-search')
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
    currentEditTask: null,
    currentFilter: 'all',
    searchQuery: '',
    currentDate: new Date(),
    currentFilterDate: null
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
        <div class="task-header">
          <div class="task-title">${task.text}</div>
          <div class="task-priority priority-${task.priority}">
            <span class="priority-dot ${task.priority}" title="${task.priority} priority"></span>
          </div>
        </div>
        ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
        <div class="task-meta">
          <span class="task-category ${task.category}">${task.category || 'No Category'}</span>
          <span class="task-date">${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No Due Date'}</span>
        </div>
        ${task.subtasks && task.subtasks.length > 0 ? `
          <div class="subtasks-container">
            <button class="toggle-subtasks-btn">
              <i class="fas fa-chevron-down"></i>
              <span>${task.subtasks.length} subtask${task.subtasks.length !== 1 ? 's' : ''}</span>
            </button>
            <ul class="subtasks-list" style="display: none;">
              ${task.subtasks.map(subtask => `
                <li class="subtask-item ${subtask.completed ? 'completed' : ''}">
                  <input type="checkbox" ${subtask.completed ? 'checked' : ''}>
                  <span>${subtask.text}</span>
                </li>
              `).join('')}
            </ul>
          </div>
        ` : ''}
      </div>
      <div class="task-actions">
        <button class="edit-task-btn" title="Edit task"><i class="fas fa-edit"></i></button>
        <button class="delete-task-btn" title="Delete task"><i class="fas fa-trash"></i></button>
      </div>
    `;

    if (task.subtasks && task.subtasks.length > 0) {
      const toggleBtn = taskItem.querySelector('.toggle-subtasks-btn');
      const subtasksList = taskItem.querySelector('.subtasks-list');
      
      toggleBtn.addEventListener('click', () => {
        const isHidden = subtasksList.style.display === 'none';
        subtasksList.style.display = isHidden ? 'block' : 'none';
        toggleBtn.querySelector('i').className = isHidden 
          ? 'fas fa-chevron-up' 
          : 'fas fa-chevron-down';
      });
      
      taskItem.querySelectorAll('.subtask-item input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
          const subtaskItem = this.closest('.subtask-item');
          subtaskItem.classList.toggle('completed', this.checked);
        });
      });
    }

      const checkbox = taskItem.querySelector('.task-checkbox input');
      checkbox.addEventListener('change', () => taskManager.toggleTaskCompletion(task.id));

      const editBtn = taskItem.querySelector('.edit-task-btn');
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        modals.openTaskDetailsModal(task);
      });

      const deleteBtn = taskItem.querySelector('.delete-task-btn');
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        taskManager.deleteTask(task.id);
      });

      return taskItem;
    },

    sortTasks(tasks, sortBy) {
      const sortedTasks = [...tasks];
      
      switch(sortBy) {
        case 'date-asc':
          return sortedTasks.sort((a, b) => {
            const dateA = a.dueDate ? new Date(a.dueDate) : new Date('9999-12-31');
            const dateB = b.dueDate ? new Date(b.dueDate) : new Date('9999-12-31');
            return dateA - dateB;
          });
          
        case 'date-desc':
          return sortedTasks.sort((a, b) => {
            const dateA = a.dueDate ? new Date(a.dueDate) : new Date(0);
            const dateB = b.dueDate ? new Date(b.dueDate) : new Date(0);
            return dateB - dateA;
          });
          
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return sortedTasks.sort((a, b) => {
            return priorityOrder[b.priority] - priorityOrder[a.priority];
          });
          
        case 'alphabetical':
          return sortedTasks.sort((a, b) => {
            return a.text.localeCompare(b.text);
          });
          
        default:
          return sortedTasks;
      }
    },

    searchTasks(tasks, query) {
      if (!query) return tasks;

      const lowerQuery = query.toLowerCase();
      return tasks.filter(task => {
        return (
          task.text.toLowerCase().includes(lowerQuery) ||
          (task.description && task.description.toLowerCase().includes(lowerQuery)) ||
          (task.category && task.category.toLowerCase().includes(lowerQuery))
        );
      });
    },

    formatDate: (date) => {
      return date.toISOString().split('T')[0];
    },

    getDaysInMonth: (year, month) => {
      return new Date(year, month + 1, 0).getDate();
    },

    getFirstDayOfMonth: (year, month) => {
      return new Date(year, month, 1).getDay();
    },

    renderCalendar: function () {
      const year = state.currentDate.getFullYear();
      const month = state.currentDate.getMonth();

      elements.calendarTitle.textContent = new Date(year, month).toLocaleDateString('default', {
        month: 'long',
        year: 'numeric',
      });

      elements.calendarGrid.innerHTML = '';

      const daysInMonth = this.getDaysInMonth(year, month);
      const firstDayOfMonth = this.getFirstDayOfMonth(year, month);

      for (let i = 0; i < firstDayOfMonth; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'calendar-day empty';
        elements.calendarGrid.appendChild(emptyCell);
      }

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateString = this.formatDate(date);

        const dayCell = document.createElement('div');
        dayCell.className = 'calendar-day';
        dayCell.dataset.date = dateString;

        const today = new Date();
        if (
          date.getDate() === today.getDate() &&
          date.getMonth() === today.getMonth() &&
          date.getFullYear() === today.getFullYear()
        ) {
          dayCell.classList.add('today');
        }

        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = day;
        dayCell.appendChild(dayNumber);

        const tasksForDay = state.tasks.filter((task) => task.dueDate === dateString);
        if (tasksForDay.length > 0) {
          const tasksContainer = document.createElement('div');
          tasksContainer.className = 'day-tasks';

          tasksForDay.forEach((task) => {
            const taskDot = document.createElement('div');
            taskDot.className = `task-dot priority-${task.priority}`;
            taskDot.title = task.text;
            tasksContainer.appendChild(taskDot);
          });

          dayCell.appendChild(tasksContainer);
        }

        elements.calendarGrid.appendChild(dayCell);
      }
    },

    setupCalendarListeners: function () {
      elements.prevMonthBtn.addEventListener('click', () => {
        state.currentDate.setMonth(state.currentDate.getMonth() - 1);
        this.renderCalendar();
      });

      elements.nextMonthBtn.addEventListener('click', () => {
        state.currentDate.setMonth(state.currentDate.getMonth() + 1);
        this.renderCalendar();
      });

      elements.calendarGrid.addEventListener('click', (e) => {
        const dayCell = e.target.closest('.calendar-day:not(.empty)');
        if (dayCell) {
          const date = dayCell.dataset.date;
          state.currentFilter = 'date';
          state.currentFilterDate = date;
          taskManager.renderTasks();

          elements.listViewBtn.click();
        }
      });
    },

    getProductivityData: function (timeRange = 'weekly') {
      const now = new Date();
      const tasks = state.tasks;

      if (timeRange === 'weekly') {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const completed = [0, 0, 0, 0, 0, 0, 0];
        const created = [0, 0, 0, 0, 0, 0, 0];

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        tasks.forEach(task => {
          const taskDate = new Date(task.createdAt);
          if (taskDate >= oneWeekAgo) {
            const day = taskDate.getDay();
            created[day]++;
            if (task.completed) completed[day]++;
          }
        });

        return {
          labels: days,
          completed: completed,
          created: created
        };
      } else { // monthly
        const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
        const completed = [0, 0, 0, 0];
        const created = [0, 0, 0, 0];

        tasks.forEach(task => {
          const taskDate = new Date(task.createdAt);
          if (taskDate.getMonth() === now.getMonth() && taskDate.getFullYear() === now.getFullYear()) {
            const week = Math.floor((taskDate.getDate() - 1) / 7);
            if (week >= 0 && week < 4) {
              created[week]++;
              if (task.completed) completed[week]++;
            }
          }
        });

        return {
          labels: weeks,
          completed: completed,
          created: created
        };
      }
    }
  };

  // ======================
  // TASK MANAGEMENT
  // ======================
  const taskManager = {
    filterTasks() {
      const today = new Date().toISOString().split('T')[0];

      return state.tasks.filter((task) => {
        switch (state.currentFilter) {
          case 'pending':
            return !task.completed;
          case 'completed':
            return task.completed;
          case 'priority':
            return task.priority === 'high' || task.priority === 'medium';
          case 'today':
            return task.dueDate === today;
          case 'date':
            return task.dueDate === state.currentFilterDate;
          default:
            return true;
        }
      });
    },

    renderTasks() {
      [elements.tasksList, elements.todoList, elements.inProgressList, elements.completedList]
        .forEach(list => list.innerHTML = '');

      const filteredTasks = this.filterTasks();
      
      const sortBy = elements.sortSelect.value;
      
      const sortedTasks = utils.sortTasks(filteredTasks, sortBy);

      if (sortedTasks.length === 0) {
        elements.emptyState.style.display = 'flex';
        return;
      }

      elements.emptyState.style.display = 'none';

      sortedTasks.forEach(task => {
        const taskElement = utils.createTaskElement(task);

        elements.tasksList.appendChild(taskElement);

        if (task.completed) {
          elements.completedList.appendChild(taskElement.cloneNode(true));
        } else {
          elements.todoList.appendChild(taskElement.cloneNode(true));
        }
      });

      // Update the chart
      if (window.productivityChart) {
        const activeChartBtn = document.querySelector('.chart-btn.active');
        if (activeChartBtn) {
          const data = utils.getProductivityData(activeChartBtn.dataset.chart);
          window.productivityChart.data.labels = data.labels;
          window.productivityChart.data.datasets[0].data = data.completed;
          window.productivityChart.data.datasets[1].data = data.created;
          window.productivityChart.update();
        }
      }

      // Dispatch event to update chart
      document.dispatchEvent(new CustomEvent('tasksUpdated'));
    },

    addTask() {
      const taskText = elements.newTaskInput.value.trim();
      const taskDescription = elements.taskDescription.value.trim();
      const subtasks = Array.from(document.querySelectorAll('#subtasks-list li')).map(el => ({
        text: el.querySelector('span').textContent,
        completed: false
      }));

      if (!taskText) return;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const selectedDate = new Date(elements.dueDateInput.value);
      selectedDate.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        alert("Please select today's date or a future date");
        return;
      }

      const newTask = {
        id: Date.now(),
        text: taskText,
        description: taskDescription || null,
        completed: false,
        category: elements.taskCategorySelect.value !== 'none' ? elements.taskCategorySelect.value : null,
        dueDate: elements.dueDateInput.value || null,
        priority: state.selectedPriority,
        subtasks: subtasks,
        createdAt: new Date().toISOString()
      };

      state.tasks.unshift(newTask);
      utils.saveTasksToLocalStorage();
      this.renderTasks();

      elements.newTaskInput.value = '';
      elements.taskDescription.value = '';
      elements.taskCategorySelect.value = 'none';
      elements.dueDateInput.value = today.toISOString().split('T')[0];
      document.querySelector('.priority-dot.active').classList.remove('active');
      document.querySelector('.priority-dot[data-priority="low"]').classList.add('active');
      state.selectedPriority = 'low';
      elements.subtasksList.innerHTML = '';
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
      elements.editTaskTitle.value = task.text || '';
      
      const today = new Date().toISOString().split('T')[0];
      elements.editDueDate.setAttribute('min', today);

      if (task.dueDate && new Date(task.dueDate) < new Date()) {
        elements.editDueDate.value = today;
      } else {
        elements.editDueDate.value = task.dueDate || today;
      }

      elements.editTaskCategory.value = task.category || 'none';
      elements.editTaskDescription.value = task.description || '';

      document.querySelectorAll('#task-details-modal .priority-dot').forEach(dot => {
        dot.classList.remove('active');
        if (dot.dataset.priority === (task.priority || 'low')) {
          dot.classList.add('active');
        }
      });

      elements.subtasksList.innerHTML = '';
      if (task.subtasks && task.subtasks.length > 0) {
        task.subtasks.forEach(subtask => {
          const subtaskItem = document.createElement('li');
          subtaskItem.innerHTML = `
            <span>${subtask.text}</span>
            <button class="delete-subtask-btn"><i class="fas fa-trash"></i></button>
          `;
          elements.subtasksList.appendChild(subtaskItem);

          subtaskItem.querySelector('.delete-subtask-btn').addEventListener('click', () => {
            subtaskItem.remove();
          });
        });
      }

      elements.deleteTaskBtn.style.display = state.currentEditTask ? 'block' : 'none';
      
      const modalTitle = elements.taskDetailsModal.querySelector('.modal-header h2');
      modalTitle.textContent = state.currentEditTask ? 'Task Details' : 'Add New Task';

      elements.taskDetailsModal.style.display = 'flex';
      setTimeout(() => {
        elements.taskDetailsModal.querySelector('.modal-content').classList.add('active');
      }, 10);
      themeManager.applyThemeToModal(themeManager.getCurrentTheme());
    },

    closeModal(modal) {
      modal.querySelector('.modal-content')?.classList.remove('active');
      setTimeout(() => {
        modal.style.display = 'none';
      }, 300);
    },

    saveTaskChanges() {
      const subtasks = Array.from(document.querySelectorAll('#subtasks-list li')).map(el => ({
        text: el.querySelector('span').textContent,
        completed: false
      }));

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const selectedDate = new Date(elements.editDueDate.value);
      selectedDate.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        alert("Please select today's date or a future date");
        return;
      }

      const taskData = {
        id: state.currentEditTask ? state.currentEditTask.id : Date.now(),
        text: elements.editTaskTitle.value,
        description: elements.editTaskDescription.value,
        dueDate: elements.editDueDate.value,
        category: elements.editTaskCategory.value !== 'none' ? elements.editTaskCategory.value : null,
        priority: document.querySelector('#task-details-modal .priority-dot.active').dataset.priority,
        subtasks: subtasks,
        completed: false,
        createdAt: new Date().toISOString()
      };

      if (state.currentEditTask) {
        taskManager.updateTask(taskData);
      } else {
        state.tasks.unshift(taskData);
        utils.saveTasksToLocalStorage();
        taskManager.renderTasks();
      }

      modals.closeModal(elements.taskDetailsModal);
      state.currentEditTask = null;
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
      elements.currentYear.textContent = new Date().getFullYear();

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
    elements.addTaskBtn.addEventListener('click', () => taskManager.addTask());
    elements.emptyAddTaskBtn.addEventListener('click', () => {
      const newTask = {
        id: Date.now(),
        text: '',
        completed: false,
        category: null,
        dueDate: new Date().toISOString().split('T')[0],
        priority: 'low',
        description: '',
        subtasks: []
      };
      
      modals.openTaskDetailsModal(newTask);
      
      state.currentEditTask = null;
      elements.deleteTaskBtn.style.display = 'none';
    });
    elements.newTaskInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') taskManager.addTask();
    });

    elements.priorityDots.forEach(dot => {
      dot.addEventListener('click', () => {
        elements.priorityDots.forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
        state.selectedPriority = dot.dataset.priority;
      });
    });

    elements.closeModalBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        modals.closeModal(elements.taskDetailsModal);
        modals.closeModal(elements.settingsModal);
      });
    });

    elements.settingsBtn.addEventListener('click', () => {
      elements.settingsModal.style.display = 'flex';
      setTimeout(() => {
        elements.settingsModal.querySelector('.modal-content').classList.add('active');
      }, 10);
    });

    elements.saveTaskBtn.addEventListener('click', () => modals.saveTaskChanges());
    elements.deleteTaskBtn.addEventListener('click', () => {
      if (state.currentEditTask) {
        taskManager.deleteTask(state.currentEditTask.id);
        elements.taskDetailsModal.style.display = 'none';
      }
    });

    elements.addSubtaskBtn.addEventListener('click', () => {
      const subtaskText = elements.newSubtaskInput.value.trim();
      if (subtaskText) {
        const subtaskItem = document.createElement('li');
        subtaskItem.innerHTML = `
          <span>${subtaskText}</span>
          <button class="delete-subtask-btn"><i class="fas fa-trash"></i></button>
        `;
        elements.subtasksList.appendChild(subtaskItem);
        elements.newSubtaskInput.value = '';

        subtaskItem.querySelector('.delete-subtask-btn').addEventListener('click', () => {
          subtaskItem.remove();
        });
      }
    });

    elements.newSubtaskInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        elements.addSubtaskBtn.click();
      }
    });

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

    window.addEventListener('click', (e) => {
      if (e.target === elements.taskDetailsModal) modals.closeModal(elements.taskDetailsModal);
      if (e.target === elements.settingsModal) modals.closeModal(elements.settingsModal);
    });

    elements.kanbanViewBtn.addEventListener('click', () => {
      elements.kanbanView.style.display = 'block';
    });

    elements.listViewBtn.addEventListener('click', () => {
      elements.listView.style.display = 'block';
    });

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

    elements.sortSelect.addEventListener('change', () => {
      taskManager.renderTasks();
    });

    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        state.currentFilter = btn.dataset.filter;
        
        taskManager.renderTasks();
      });
    });

    elements.searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value.trim();
      taskManager.renderTasks();
    });

    elements.voiceSearchBtn.addEventListener('click', () => {
      if ('webkitSpeechRecognition' in window) {
        const recognition = new webkitSpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;

        recognition.onstart = () => {
          elements.searchInput.placeholder = 'Listening...';
        };

        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          elements.searchInput.value = transcript;
          state.searchQuery = transcript;
          taskManager.renderTasks();
        };

        recognition.onerror = (event) => {
          console.error('Voice recognition error', event.error);
          elements.searchInput.placeholder = 'Search tasks...';
        };

        recognition.onend = () => {
          elements.searchInput.placeholder = 'Search tasks...';
        };

        recognition.start();
      } else {
        alert('Voice search is not supported in your browser');
      }
    });

    document.addEventListener('requestProductivityData', (e) => {
      const data = utils.getProductivityData(e.detail.timeRange);
      const responseEvent = new CustomEvent('productivityDataResponse', {
        detail: { data }
      });
      document.dispatchEvent(responseEvent);
    });
  };

  // ======================
  // INITIALIZATION
  // ======================
  const init = () => {
    themeManager.initializeTheme();
    taskManager.renderTasks();
    utils.updateTaskStats();
    utils.renderCalendar();
    utils.setupCalendarListeners();

    const today = new Date();
    const todayFormatted = today.toISOString().split('T')[0];
    elements.dueDateInput.setAttribute('min', todayFormatted);
    elements.dueDateInput.value = todayFormatted;
    elements.editDueDate.setAttribute('min', todayFormatted);

    footerManager.init();
    setupEventListeners();
  };

  init();
});

