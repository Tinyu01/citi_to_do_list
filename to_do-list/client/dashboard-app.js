// Dashboard Application Logic (Authenticated Users)
document.addEventListener('DOMContentLoaded', () => {
  // Create hidden file input for import functionality
  let hiddenFileInput = document.createElement('input');
  hiddenFileInput.type = 'file';
  hiddenFileInput.accept = '.xlsx,.xls';
  hiddenFileInput.id = 'hidden-import-excel-input';
  hiddenFileInput.style.display = 'none';
  document.body.appendChild(hiddenFileInput);
  
  hiddenFileInput.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
      window.importTasksFromExcel(file, async (importedTasks) => {
        try {
          console.log('Importing tasks to database:', importedTasks);
          const API_BASE_URL = window.appConfig.apiUrl;
          const authToken = localStorage.getItem('authToken');
          
          let successCount = 0;
          for (const task of importedTasks) {
            const taskData = {
              text: task.text,
              description: task.description || '',
              dueDate: task.dueDate || null,
              category: task.category || { name: 'Work', color: '#4CAF50' },
              priority: task.priority || 'medium',
              status: 'todo',
              completed: false,
              subtasks: task.subtasks || []
            };
            
            const response = await fetch(`${API_BASE_URL}/api/tasks`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
              },
              body: JSON.stringify(taskData)
            });
            
            if (response.ok) {
              successCount++;
              console.log(`Task "${task.text}" imported successfully`);
            } else {
              console.error(`Failed to import task "${task.text}"`);
            }
          }
          
          console.log(`Successfully imported ${successCount} out of ${importedTasks.length} tasks`);
          alert(`Successfully imported ${successCount} tasks!`);
          location.reload();
        } catch (error) {
          console.error('Error importing tasks:', error);
          alert('Error importing tasks: ' + error.message);
        }
      });
    }
  };
  // Import SheetJS and excel-utils
  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
  document.head.appendChild(script);
  script.onload = () => {
      // Export button
      const exportBtn = document.getElementById('export-data');
      if (exportBtn) {
        exportBtn.onclick = () => {
          window.exportTasksToExcel(tasks, 'dashboard-tasks.xlsx');
        };
      }
      // Import button - trigger hidden file input
      const importBtn = document.getElementById('import-data');
      if (importBtn) {
        importBtn.onclick = () => {
          hiddenFileInput.click();
        };
      }
  };
  console.log('Dashboard initialized');
  
  const API_BASE_URL = window.appConfig.apiUrl;
  const authToken = localStorage.getItem('authToken');
  
  if (!authToken) {
    window.location.href = 'login.html';
    return;
  }

  // Initialize data
  let tasks = [];
  let categories = [];
  let currentView = 'list';
  let currentFilter = 'all';
  let currentCategory = 'all';

  // Pagination state for list view
  let listCurrentPage = 1;
  const TASKS_PER_PAGE = 5;
  let listPaginationContainer = null;

  // Kanban pagination state
  let kanbanPages = {
    todo: 1,
    inProgress: 1,
    completed: 1
  };
  const KANBAN_TASKS_PER_PAGE = 5;
  let kanbanPaginationContainers = {
    todo: null,
    inProgress: null,
    completed: null
  };

  // DOM Elements
  const tasksList = document.getElementById('tasks-list');
  const addTaskModal = document.getElementById('add-task-modal');
  const addTaskForm = document.getElementById('add-task-form');
  const newTaskInput = document.getElementById('new-task');
  const taskDescription = document.getElementById('task-description');
  const taskCategory = document.getElementById('task-category');
  const taskPriority = document.getElementById('task-priority');
  const dueDate = document.getElementById('due-date');
  const addTaskBtn = document.getElementById('add-task');
  const fabAddBtn = document.getElementById('fab-add-task');
  const emptyAddTaskBtn = document.getElementById('empty-add-task');
  const closeModalBtns = document.querySelectorAll('.close-modal');
  const searchInput = document.getElementById('search');
  const sortSelect = document.getElementById('sort-select');
  const priorityDots = document.querySelectorAll('.priority-dot');
  const newSubtaskInput = document.getElementById('new-subtask');
  const addSubtaskBtn = document.getElementById('add-subtask-btn');
  const subtasksList = document.getElementById('subtasks-list');
  let subtasks = [];
  
  // Stats elements
  const totalTasksEl = document.getElementById('total-tasks');
  const completedTasksEl = document.getElementById('completed-tasks');
  const pendingTasksEl = document.getElementById('pending-tasks');
  const productivityScoreEl = document.getElementById('productivity-score');

  // Set minimum due date to today
  const today = new Date().toISOString().split('T')[0];
  if (dueDate) {
    dueDate.min = today;
  }

  // Load categories and tasks
  async function loadData() {
    try {
      await loadCategories();
      await loadTasks();
      updateAllViews();
    } catch (error) {
      console.error('Error loading data:', error);
      showToast('Error loading data', 'error');
    }
  }

  // Load categories from API
  async function loadCategories() {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        categories = data.user.categories || getDefaultCategories();
        initializeCategorySelect();
        updateCategoryList();
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      categories = getDefaultCategories();
      initializeCategorySelect();
    }
  }

  // Load tasks from API
  async function loadTasks() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        tasks = data.tasks || [];
        console.log('Loaded tasks:', tasks.length);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      tasks = [];
    }
  }

  // Get default categories
  function getDefaultCategories() {
    return [
      { name: 'Work', color: '#4CAF50', isDefault: true },
      { name: 'Personal', color: '#2196F3', isDefault: true },
      { name: 'Shopping', color: '#FF9800', isDefault: true },
      { name: 'Health', color: '#E91E63', isDefault: true }
    ];
  }

  // Initialize categories in select
  function initializeCategorySelect() {
    if (!taskCategory) return;
    taskCategory.innerHTML = '<option value="">Select Category</option>';
    categories.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat.name;
      option.textContent = cat.name;
      taskCategory.appendChild(option);
    });
  }

  // Modal management
  function openModal(modal) {
    if (modal) {
      modal.classList.add('show');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeModal(modal) {
    if (modal) {
      modal.classList.remove('show');
      document.body.style.overflow = '';
    }
  }

  // Add task to database
  async function addTask() {
    const text = newTaskInput.value.trim();
    if (!text) {
      showToast('Please enter a task title', 'error');
      return;
    }

    console.log('Adding task:', text);

    const newTask = {
      text: text,
      description: taskDescription.value.trim(),
      completed: false,
      status: 'todo',
      category: {
        name: taskCategory.value || 'Personal',
        color: categories.find(c => c.name === taskCategory.value)?.color || '#2196F3'
      },
      priority: taskPriority.value || 'low',
      dueDate: dueDate.value || null,
      subtasks: [...subtasks]
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(newTask)
      });

      if (response.ok) {
        const data = await response.json();
        tasks.push(data.task);
        
        console.log('Task added to database:', data.task);
        
        // Clear form
        newTaskInput.value = '';
        taskDescription.value = '';
        taskCategory.value = '';
        taskPriority.value = 'low';
        dueDate.value = '';
        subtasks = [];
        if (subtasksList) subtasksList.innerHTML = '';
        
        // Reset priority dots
        priorityDots.forEach(d => d.classList.remove('active'));
        const lowDot = document.querySelector('.priority-dot.low');
        if (lowDot) lowDot.classList.add('active');

        // Close modal
        closeModal(addTaskModal);

        // Update UI
        updateAllViews();
        showToast('Task added successfully!', 'success');
      } else {
        throw new Error('Failed to add task');
      }
    } catch (error) {
      console.error('Error adding task:', error);
      showToast('Error adding task', 'error');
    }
  }

  // Update all views
  function updateAllViews() {
    updateListView();
    updateKanbanView();
    updateCalendarView();
    updateStats();
    updateCategoryList();
  }

  // Update stats
  function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    const productivity = total > 0 ? Math.round((completed / total) * 100) : 0;

    if (totalTasksEl) totalTasksEl.textContent = total;
    if (completedTasksEl) completedTasksEl.textContent = completed;
    if (pendingTasksEl) pendingTasksEl.textContent = pending;
    if (productivityScoreEl) productivityScoreEl.textContent = `${productivity}%`;

    updateProductivityChart();
  }

  // Update list view
  function updateListView() {
    console.log('Updating list view with', tasks.length, 'tasks');
    if (!tasksList) {
      console.error('Tasks list element not found');
      return;
    }

    let filteredTasks = filterTasks(tasks);
    filteredTasks = sortTasks(filteredTasks);

    // Pagination logic
    const totalTasks = filteredTasks.length;
    const totalPages = Math.ceil(totalTasks / TASKS_PER_PAGE) || 1;
    if (listCurrentPage > totalPages) listCurrentPage = totalPages;
    const startIdx = (listCurrentPage - 1) * TASKS_PER_PAGE;
    const endIdx = startIdx + TASKS_PER_PAGE;
    const paginatedTasks = filteredTasks.slice(startIdx, endIdx);

    console.log('Filtered tasks:', filteredTasks.length);

    tasksList.innerHTML = '';
    const emptyState = document.getElementById('empty-state');

    if (totalTasks === 0) {
      console.log('No tasks to display, showing empty state');
      if (emptyState) emptyState.style.display = 'flex';
      tasksList.style.display = 'none';
      if (listPaginationContainer) listPaginationContainer.innerHTML = '';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';
    tasksList.style.display = 'block';

    paginatedTasks.forEach(task => {
      console.log('Creating task element for:', task.text);
      const li = createTaskElement(task);
      tasksList.appendChild(li);
    });

    // Pagination controls
    if (!listPaginationContainer) {
      listPaginationContainer = document.createElement('div');
      listPaginationContainer.className = 'pagination-container';
      tasksList.parentNode.appendChild(listPaginationContainer);
    }
    renderListPagination(totalPages);

    console.log('List view updated, tasks displayed:', paginatedTasks.length);
  }

  function renderListPagination(totalPages) {
    if (!listPaginationContainer) return;
    if (totalPages <= 1) {
      listPaginationContainer.innerHTML = '';
      return;
    }
    let html = '';
    html += `<button class="pagination-btn" ${listCurrentPage === 1 ? 'disabled' : ''} data-page="prev">&laquo;</button>`;
    for (let i = 1; i <= totalPages; i++) {
      html += `<button class="pagination-btn${i === listCurrentPage ? ' active' : ''}" data-page="${i}">${i}</button>`;
    }
    html += `<button class="pagination-btn" ${listCurrentPage === totalPages ? 'disabled' : ''} data-page="next">&raquo;</button>`;
    listPaginationContainer.innerHTML = html;
    // Add event listeners
    Array.from(listPaginationContainer.querySelectorAll('.pagination-btn')).forEach(btn => {
      btn.addEventListener('click', (e) => {
        const page = btn.getAttribute('data-page');
        if (page === 'prev' && listCurrentPage > 1) {
          listCurrentPage--;
        } else if (page === 'next' && listCurrentPage < totalPages) {
          listCurrentPage++;
        } else if (!isNaN(parseInt(page))) {
          listCurrentPage = parseInt(page);
        }
        updateListView();
      });
    });
  }

  // Create task element
  function createTaskElement(task) {
    const li = document.createElement('li');
    li.className = `task-item ${task.completed ? 'completed' : ''} priority-${task.priority}`;
    li.dataset.taskId = task._id || task.id;

    const priorityColors = {
      low: '#4CAF50',
      medium: '#FF9800',
      high: '#f44336'
    };

    li.innerHTML = `
      <div class="task-content">
        <div class="task-checkbox-container">
          <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
          <span class="custom-checkbox"></span>
        </div>
        <div class="task-info">
          <div class="task-header-row">
            <span class="task-text">${task.text}</span>
            <div class="task-badges">
              <span class="priority-badge" style="background-color: ${priorityColors[task.priority]}">
                ${task.priority}
              </span>
              <span class="category-badge" style="background-color: ${task.category.color}">
                ${task.category.name}
              </span>
            </div>
          </div>
          ${task.description ? `<p class="task-description">${task.description}</p>` : ''}
          ${task.dueDate ? `
            <div class="task-meta">
              <i class="fas fa-calendar"></i>
              <span>${new Date(task.dueDate).toLocaleDateString()}</span>
            </div>
          ` : ''}
        </div>
      </div>
      <div class="task-actions">
        <button class="icon-btn edit-task-btn" title="Edit task">
          <i class="fas fa-edit"></i>
        </button>
        <button class="icon-btn delete-task-btn" title="Delete task">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;

    // Add event listeners
    const checkbox = li.querySelector('.task-checkbox');
    checkbox.addEventListener('change', () => toggleTask(task._id || task.id));

    const deleteBtn = li.querySelector('.delete-task-btn');
    deleteBtn.addEventListener('click', () => deleteTask(task._id || task.id));

    return li;
  }

  // Toggle task completion
  async function toggleTask(taskId) {
    const task = tasks.find(t => (t._id || t.id) === taskId);
    if (!task) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          completed: !task.completed,
          status: !task.completed ? 'completed' : 'todo'
        })
      });

      if (response.ok) {
        task.completed = !task.completed;
        task.status = task.completed ? 'completed' : 'todo';
        updateAllViews();
        showToast('Task updated!', 'success');
      }
    } catch (error) {
      console.error('Error toggling task:', error);
      showToast('Error updating task', 'error');
    }
  }

  // Delete task
  async function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.ok) {
        tasks = tasks.filter(t => (t._id || t.id) !== taskId);
        updateAllViews();
        showToast('Task deleted successfully!', 'success');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      showToast('Error deleting task', 'error');
    }
  }

  // Filter tasks
  function filterTasks(tasksToFilter) {
    let filtered = [...tasksToFilter];

    if (currentCategory && currentCategory !== 'all') {
      filtered = filtered.filter(t => t.category.name === currentCategory);
    }

    if (currentFilter === 'completed') {
      filtered = filtered.filter(t => t.completed);
    } else if (currentFilter === 'pending') {
      filtered = filtered.filter(t => !t.completed);
    } else if (currentFilter === 'priority') {
      filtered = filtered.filter(t => t.priority === 'high');
    } else if (currentFilter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      filtered = filtered.filter(t => t.dueDate && t.dueDate.split('T')[0] === today);
    }

    if (searchInput && searchInput.value) {
      const searchTerm = searchInput.value.toLowerCase();
      filtered = filtered.filter(t => 
        t.text.toLowerCase().includes(searchTerm) ||
        (t.description && t.description.toLowerCase().includes(searchTerm))
      );
    }

    return filtered;
  }

  // Sort tasks
  function sortTasks(tasksToSort) {
    const sortValue = sortSelect ? sortSelect.value : 'date-desc';
    const sorted = [...tasksToSort];

    switch (sortValue) {
      case 'date-asc':
        return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case 'date-desc':
        return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return sorted.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
      case 'alphabetical':
        return sorted.sort((a, b) => a.text.localeCompare(b.text));
      default:
        return sorted;
    }
  }

  // Update Kanban view with pagination
  function updateKanbanView() {
    const todoList = document.getElementById('todo-list');
    const inProgressList = document.getElementById('in-progress-list');
    const completedList = document.getElementById('completed-list');

    if (!todoList || !inProgressList || !completedList) return;

    // Get tasks by status
    let filteredTasks = filterTasks(tasks);
    const todoTasks = filteredTasks.filter(t => t.status === 'todo');
    const inProgressTasks = filteredTasks.filter(t => t.status === 'in-progress');
    const completedTasks = filteredTasks.filter(t => t.status === 'completed');

    // Pagination logic for each column
    function paginate(tasksArr, page) {
      const totalPages = Math.ceil(tasksArr.length / KANBAN_TASKS_PER_PAGE) || 1;
      if (page > totalPages) page = totalPages;
      const startIdx = (page - 1) * KANBAN_TASKS_PER_PAGE;
      const endIdx = startIdx + KANBAN_TASKS_PER_PAGE;
      return {
        paginated: tasksArr.slice(startIdx, endIdx),
        totalPages
      };
    }

    // Render column with pagination
    function renderKanbanColumn(listEl, tasksArr, pageKey) {
      listEl.innerHTML = '';
      const { paginated, totalPages } = paginate(tasksArr, kanbanPages[pageKey]);
      paginated.forEach(task => {
        const taskEl = createKanbanTaskElement(task);
        listEl.appendChild(taskEl);
      });
      // Pagination controls
      if (!kanbanPaginationContainers[pageKey]) {
        kanbanPaginationContainers[pageKey] = document.createElement('div');
        kanbanPaginationContainers[pageKey].className = 'pagination-container kanban-pagination';
        listEl.parentNode.appendChild(kanbanPaginationContainers[pageKey]);
      }
      renderKanbanPagination(kanbanPaginationContainers[pageKey], pageKey, totalPages);
    }

    renderKanbanColumn(todoList, todoTasks, 'todo');
    renderKanbanColumn(inProgressList, inProgressTasks, 'inProgress');
    renderKanbanColumn(completedList, completedTasks, 'completed');
  }

  function renderKanbanPagination(container, pageKey, totalPages) {
    if (totalPages <= 1) {
      container.innerHTML = '';
      return;
    }
    let html = '';
    html += `<button class="pagination-btn" ${kanbanPages[pageKey] === 1 ? 'disabled' : ''} data-kanban-page="prev" data-kanban-key="${pageKey}">&laquo;</button>`;
    for (let i = 1; i <= totalPages; i++) {
      html += `<button class="pagination-btn${i === kanbanPages[pageKey] ? ' active' : ''}" data-kanban-page="${i}" data-kanban-key="${pageKey}">${i}</button>`;
    }
    html += `<button class="pagination-btn" ${kanbanPages[pageKey] === totalPages ? 'disabled' : ''} data-kanban-page="next" data-kanban-key="${pageKey}">&raquo;</button>`;
    container.innerHTML = html;
    Array.from(container.querySelectorAll('.pagination-btn')).forEach(btn => {
      btn.addEventListener('click', (e) => {
        const page = btn.getAttribute('data-kanban-page');
        const key = btn.getAttribute('data-kanban-key');
        if (page === 'prev' && kanbanPages[key] > 1) {
          kanbanPages[key]--;
        } else if (page === 'next' && kanbanPages[key] < totalPages) {
          kanbanPages[key]++;
        } else if (!isNaN(parseInt(page))) {
          kanbanPages[key] = parseInt(page);
        }
        updateKanbanView();
      });
    });
  }

  // Create Kanban task element
  function createKanbanTaskElement(task) {
    const div = document.createElement('div');
    div.className = 'kanban-task';
    div.dataset.taskId = task._id || task.id;

    const priorityColors = {
      low: '#4CAF50',
      medium: '#FF9800',
      high: '#f44336'
    };

    div.innerHTML = `
      <div class="task-header">
        <span class="task-text">${task.text}</span>
        <div class="task-actions">
          <button class="icon-btn delete-task-btn">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
      ${task.description ? `<p class="task-description">${task.description}</p>` : ''}
      <div class="task-badges">
        <span class="priority-badge" style="background-color: ${priorityColors[task.priority]}">
          ${task.priority}
        </span>
        <span class="category-badge" style="background-color: ${task.category.color}">
          ${task.category.name}
        </span>
      </div>
      ${task.dueDate ? `
        <div class="task-meta">
          <i class="fas fa-calendar"></i>
          <span>${new Date(task.dueDate).toLocaleDateString()}</span>
        </div>
      ` : ''}
    `;

    const deleteBtn = div.querySelector('.delete-task-btn');
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteTask(task._id || task.id);
    });

    return div;
  }

  // Update calendar view
  function updateCalendarView() {
    document.dispatchEvent(new CustomEvent('taskUpdated'));
  }

  // Update category list
  function updateCategoryList() {
    const categoryList = document.getElementById('category-list');
    if (!categoryList) return;

    const allTasksItem = categoryList.querySelector('[data-category="all"]');
    categoryList.innerHTML = '';
    if (allTasksItem) {
      categoryList.appendChild(allTasksItem);
      const count = allTasksItem.querySelector('.category-count');
      if (count) count.textContent = tasks.length;
    }

    categories.forEach(cat => {
      const count = tasks.filter(t => t.category.name === cat.name).length;
      const li = document.createElement('li');
      li.className = 'category-item';
      li.dataset.category = cat.name;
      
      li.innerHTML = `
        <button class="category-btn">
          <span class="category-color" style="background-color: ${cat.color};"></span>
          <span class="category-name">${cat.name}</span>
          <span class="category-count">${count}</span>
        </button>
      `;

      li.addEventListener('click', () => {
        currentCategory = cat.name;
        document.querySelectorAll('.category-item').forEach(item => item.classList.remove('active'));
        li.classList.add('active');
        updateAllViews();
      });

      categoryList.appendChild(li);
    });

    if (allTasksItem) {
      allTasksItem.addEventListener('click', () => {
        currentCategory = 'all';
        document.querySelectorAll('.category-item').forEach(item => item.classList.remove('active'));
        allTasksItem.classList.add('active');
        updateAllViews();
      });
    }
  }

  // Update productivity chart
  function updateProductivityChart() {
    const weekData = getWeeklyData();
    const monthData = getMonthlyData();

    document.dispatchEvent(new CustomEvent('productivityDataResponse', {
      detail: {
        weekly: weekData,
        monthly: monthData
      }
    }));
  }

  // Get weekly data
  function getWeeklyData() {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const data = new Array(7).fill(0);
    const completed = new Array(7).fill(0);

    const now = new Date();
    const dayOfWeek = now.getDay();

    tasks.forEach(task => {
      const taskDate = new Date(task.createdAt);
      const daysDiff = Math.floor((now - taskDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff < 7) {
        const index = (dayOfWeek - daysDiff + 7) % 7;
        data[index]++;
        if (task.completed) {
          completed[index]++;
        }
      }
    });

    return {
      labels: days,
      created: data,
      completed: completed
    };
  }

  // Get monthly data
  function getMonthlyData() {
    const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    const data = new Array(4).fill(0);
    const completed = new Array(4).fill(0);

    const now = new Date();

    tasks.forEach(task => {
      const taskDate = new Date(task.createdAt);
      const daysDiff = Math.floor((now - taskDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff < 28) {
        const weekIndex = Math.floor(daysDiff / 7);
        if (weekIndex < 4) {
          data[weekIndex]++;
          if (task.completed) {
            completed[weekIndex]++;
          }
        }
      }
    });

    return {
      labels: weeks,
      created: data,
      completed: completed
    };
  }

  // Toast notification
  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type} show`;
    toast.innerHTML = `
      <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
      <span>${message}</span>
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // Event listeners - FAB button
  if (fabAddBtn) {
    fabAddBtn.addEventListener('click', () => {
      openModal(addTaskModal);
    });
  }

  // Empty state button
  if (emptyAddTaskBtn) {
    emptyAddTaskBtn.addEventListener('click', () => {
      openModal(addTaskModal);
    });
  }

  // Add task button in modal
  if (addTaskBtn) {
    addTaskBtn.addEventListener('click', (e) => {
      e.preventDefault();
      addTask();
    });
  }

  // Close modal buttons
  closeModalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      closeModal(addTaskModal);
    });
  });

  // Close modal on outside click
  if (addTaskModal) {
    addTaskModal.addEventListener('click', (e) => {
      if (e.target === addTaskModal) {
        closeModal(addTaskModal);
      }
    });
  }

  // Priority selector
  priorityDots.forEach(dot => {
    dot.addEventListener('click', () => {
      priorityDots.forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
      if (taskPriority) {
        taskPriority.value = dot.dataset.priority;
      }
    });
  });

  // Subtask functionality
  if (addSubtaskBtn) {
    addSubtaskBtn.addEventListener('click', () => {
      const subtaskText = newSubtaskInput.value.trim();
      if (subtaskText) {
        subtasks.push({
          text: subtaskText,
          completed: false
        });
        
        const li = document.createElement('li');
        li.className = 'subtask-item';
        li.innerHTML = `
          <span>${subtaskText}</span>
          <button class="remove-subtask" data-index="${subtasks.length - 1}">
            <i class="fas fa-times"></i>
          </button>
        `;
        subtasksList.appendChild(li);
        
        newSubtaskInput.value = '';
        
        li.querySelector('.remove-subtask').addEventListener('click', function() {
          const index = parseInt(this.dataset.index);
          subtasks.splice(index, 1);
          li.remove();
        });
      }
    });

    newSubtaskInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addSubtaskBtn.click();
      }
    });
  }

  // Filter buttons
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      updateAllViews();
    });
  });

  // Sort select
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      updateAllViews();
    });
  }

  // Search input
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      updateAllViews();
    });
  }

  // Initialize
  loadData();
  
  console.log('Dashboard app initialized');
});
