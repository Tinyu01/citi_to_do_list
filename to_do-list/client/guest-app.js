// Guest Mode Application Logic
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
      window.importTasksFromExcel(file, (importedTasks) => {
        // Merge: prepend imported tasks on top of existing ones (do NOT replace)
        const existingTasks = guestStorage.getTasks() || [];
        const now = Date.now();
        const newTasks = importedTasks.map((task, idx) => ({
          ...task,
          // Ensure string id for consistency with GuestStorage.addTask
          id: `${now + idx}-${Math.random().toString(36).slice(2, 8)}`,
          completed: false,
          status: task.status || 'todo',
          createdAt: new Date().toISOString()
        }));
        // Put new tasks first, then the existing ones
        guestStorage.tasks = [...newTasks, ...existingTasks];
        // Persist and refresh UI
        guestStorage.saveTasks();
        // Optional: simple feedback
        if (typeof showToast === 'function') {
          showToast(`Imported ${newTasks.length} task(s)`, 'success');
        }
        location.reload();
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
          const tasks = guestStorage.getTasks();
          window.exportTasksToExcel(tasks, 'guest-tasks.xlsx');
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
  console.log('Guest mode initialized');
  
  // Initialize guest data
  const guestStorage = window.guestStorage;
  let tasks = guestStorage.getTasks();
  let categories = guestStorage.getCategories();
  let currentView = 'list';
  let currentFilter = 'all';
  let currentCategory = 'all';

  // DOM Elements
  const tasksList = document.getElementById('tasks-list');
  // Pagination state for list view
  let listCurrentPage = 1;
  const TASKS_PER_PAGE = 5;
  // Pagination container (created dynamically if not present)
  let listPaginationContainer = null;
  const newTaskInput = document.getElementById('new-task');
  const taskDescription = document.getElementById('task-description');
  const taskCategory = document.getElementById('task-category');
  const taskPriority = document.getElementById('task-priority');
  const dueDate = document.getElementById('due-date');
  const addTaskBtn = document.getElementById('add-task');
  const emptyState = document.getElementById('empty-state');
  const emptyAddTaskBtn = document.getElementById('empty-add-task');
  const searchInput = document.getElementById('search');
  const sortSelect = document.getElementById('sort-select');
  const priorityDots = document.querySelectorAll('.priority-dot');
  const newSubtaskInput = document.getElementById('new-subtask');
  const addSubtaskBtn = document.getElementById('add-subtask-btn');
  const subtasksList = document.getElementById('subtasks-list');
  let subtasks = [];
  
    // Modal elements
    const addTaskModal = document.getElementById('add-task-modal');
    const addTaskForm = document.getElementById('add-task-form');
    const fabAddBtn = document.getElementById('fab-add-task');
    const closeModalBtns = document.querySelectorAll('.close-modal');
  
  // Stats elements
  const totalTasksEl = document.getElementById('total-tasks');
  const completedTasksEl = document.getElementById('completed-tasks');
  const pendingTasksEl = document.getElementById('pending-tasks');
  const productivityScoreEl = document.getElementById('productivity-score');

  // Initialize categories in select
  function initializeCategorySelect() {
    taskCategory.innerHTML = '<option value="">Select Category</option>';
    categories.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat.name;
      option.textContent = cat.name;
      taskCategory.appendChild(option);
    });
  }

  // Set minimum due date to today
  const today = new Date().toISOString().split('T')[0];
  if (dueDate) {
    dueDate.min = today;
  }

  // Add task
  function addTask() {
    const text = newTaskInput.value.trim();
    if (!text) {
      showToast('Please enter a task title', 'error');
      return;
    }

    console.log('Adding task:', text);
    console.log('Category:', taskCategory.value);
    console.log('Priority:', taskPriority.value);
    console.log('Due date:', dueDate.value);
    console.log('Subtasks:', subtasks);

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

    const addedTask = guestStorage.addTask(newTask);
    tasks = guestStorage.getTasks();
    
    console.log('Task added to storage:', addedTask);
    console.log('Total tasks now:', tasks.length);
    
    // Clear inputs
    newTaskInput.value = '';
    taskDescription.value = '';
    taskCategory.value = '';
    taskPriority.value = 'low';
    dueDate.value = '';
    subtasks = [];
    if (subtasksList) subtasksList.innerHTML = '';
    
    // Reset priority dots to low
    priorityDots.forEach(d => d.classList.remove('active'));
    const lowDot = document.querySelector('.priority-dot.low');
    if (lowDot) lowDot.classList.add('active');

    // Update UI
    updateAllViews();
    updateStats();
    showToast('Task added successfully!', 'success');
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

    // Trigger chart update
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

    tasksList.innerHTML = '';

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
    li.dataset.taskId = task.id;

    const defaultPriorityColors = {
      low: '#22c55e',
      medium: '#f59e0b',
      high: '#ef4444'
    };
    const priorityColor = task.priorityColor || defaultPriorityColors[task.priority] || '#9CA3AF';

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
              <span class="priority-badge" style="background-color: ${priorityColor}">
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
    checkbox.addEventListener('change', () => toggleTask(task.id));

    const deleteBtn = li.querySelector('.delete-task-btn');
    deleteBtn.addEventListener('click', () => deleteTask(task.id));

    return li;
  }

  // Toggle task completion
  function toggleTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      task.completed = !task.completed;
      task.status = task.completed ? 'completed' : 'todo';
      guestStorage.updateTask(taskId, { completed: task.completed, status: task.status });
      tasks = guestStorage.getTasks();
      updateAllViews();
    }
  }

  // Delete task
  function deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
      guestStorage.deleteTask(taskId);
      tasks = guestStorage.getTasks();
      updateAllViews();
      showToast('Task deleted successfully!', 'success');
    }
  }

  // Filter tasks
  function filterTasks(tasksToFilter) {
    let filtered = [...tasksToFilter];

    // Filter by category
    if (currentCategory && currentCategory !== 'all') {
      filtered = filtered.filter(t => t.category.name === currentCategory);
    }

    // Filter by status
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

    // Search filter
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

  // Update Kanban view
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
    div.dataset.taskId = task.id;
    div.draggable = true;

    const priorityColors = {
      low: '#22c55e',
      medium: '#f59e0b',
      high: '#ef4444'
    };
    const priorityColor = task.priorityColor || priorityColors[task.priority] || '#9CA3AF';

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
        <span class="priority-badge" style="background-color: ${priorityColor}">
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

    // Add delete listener
    const deleteBtn = div.querySelector('.delete-task-btn');
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteTask(task.id);
    });

    // Add drag listeners
    div.addEventListener('dragstart', (e) => {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', task.id);
      div.classList.add('dragging');
    });

    div.addEventListener('dragend', () => {
      div.classList.remove('dragging');
    });

    return div;
  }

  // Setup drag and drop for Kanban
  function setupKanbanDragDrop() {
    const kanbanLists = document.querySelectorAll('.kanban-list');
    
    kanbanLists.forEach(list => {
      list.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        list.classList.add('drop-target');
      });

      list.addEventListener('dragleave', () => {
        list.classList.remove('drop-target');
      });

      list.addEventListener('drop', (e) => {
        e.preventDefault();
        list.classList.remove('drop-target');
        
        const taskId = e.dataTransfer.getData('text/plain');
        const newStatus = list.closest('.kanban-column').dataset.status;
        
        const task = tasks.find(t => t.id === taskId);
        if (task) {
          task.status = newStatus;
          task.completed = newStatus === 'completed';
          guestStorage.updateTask(taskId, { status: newStatus, completed: task.completed });
          tasks = guestStorage.getTasks();
          updateAllViews();
          showToast(`Task moved to ${newStatus}`, 'success');
        }
      });
    });
  }

  // Update calendar view
  function updateCalendarView() {
    // Calendar update is handled by calendar.js
    document.dispatchEvent(new CustomEvent('taskUpdated'));
  }

  // Update category list in sidebar
  function updateCategoryList() {
    const categoryList = document.getElementById('category-list');
    if (!categoryList) return;

    // Keep "All Tasks" item
    const allTasksItem = categoryList.querySelector('[data-category="all"]');
    categoryList.innerHTML = '';
    if (allTasksItem) {
      categoryList.appendChild(allTasksItem);
      const count = allTasksItem.querySelector('.category-count');
      if (count) count.textContent = tasks.length;
    }

    // Add category items
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

    // "All Tasks" click handler
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
    // Get last 7 days data
    const weekData = getWeeklyData();
    const monthData = getMonthlyData();

    // Dispatch event for chart.js to handle
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

  // Event listeners
  if (addTaskBtn) {
    addTaskBtn.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('Add task button clicked');
      addTask();
    });
  }

  if (newTaskInput) {
    newTaskInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addTask();
      }
    });
  }

  if (emptyAddTaskBtn) {
    emptyAddTaskBtn.addEventListener('click', () => {
      if (newTaskInput) newTaskInput.focus();
    });
  }

  // Priority selector functionality
  priorityDots.forEach(dot => {
    dot.addEventListener('click', () => {
      // Remove active class from all dots
      priorityDots.forEach(d => d.classList.remove('active'));
      // Add active class to clicked dot
      dot.classList.add('active');
      // Update hidden input value
      if (taskPriority) {
        taskPriority.value = dot.dataset.priority;
        console.log('Priority set to:', dot.dataset.priority);
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
        
        // Add to UI
        const li = document.createElement('li');
        li.className = 'subtask-item';
        li.innerHTML = `
          <span>${subtaskText}</span>
          <button class="remove-subtask" data-index="${subtasks.length - 1}">
            <i class="fas fa-times"></i>
          </button>
        `;
        subtasksList.appendChild(li);
        
        // Clear input
        newSubtaskInput.value = '';
        
        // Add remove listener
        li.querySelector('.remove-subtask').addEventListener('click', function() {
          const index = parseInt(this.dataset.index);
          subtasks.splice(index, 1);
          li.remove();
        });
      }
    });

    // Also allow Enter key to add subtask
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

  // View switchers
  const viewBtns = document.querySelectorAll('.view-btn');
  viewBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const viewType = btn.closest('[data-view]').dataset.view;
      currentView = viewType;

      // Update active states
      document.querySelectorAll('.sidebar-item').forEach(item => item.classList.remove('active'));
      btn.closest('.sidebar-item').classList.add('active');

      // Hide all views
      const listView = document.getElementById('list-view');
      const kanbanView = document.getElementById('kanban-view');
      const calendarView = document.getElementById('calendar-view');
      if (listView) {
        listView.style.display = 'none';
        listView.classList.remove('active-view');
      }
      if (kanbanView) {
        kanbanView.style.display = 'none';
        kanbanView.classList.remove('active-view');
      }
      if (calendarView) {
        calendarView.style.display = 'none';
        calendarView.classList.remove('active-view');
      }

      // Show only the selected view
      if (viewType === 'list' && listView) {
        listView.style.display = 'block';
        listView.classList.add('active-view');
        updateListView();
      } else if (viewType === 'kanban' && kanbanView) {
        kanbanView.style.display = 'block';
        kanbanView.classList.add('active-view');
        updateKanbanView();
        setupKanbanDragDrop();
      } else if (viewType === 'calendar' && calendarView) {
        calendarView.style.display = 'block';
        calendarView.classList.add('active-view');
        updateCalendarView();
      }
    });
  });

  // Initialize view - make sure list view is shown by default
  function initializeViews() {
    console.log('Initializing views...');
    
    // Hide all views first
    document.querySelectorAll('.view-container > div').forEach(view => {
      view.style.display = 'none';
      view.classList.remove('active-view');
      view.classList.remove('active');
    });

    // Show list view
    const listView = document.getElementById('list-view');
    if (listView) {
      listView.style.display = 'block';
      listView.classList.add('active-view');
      listView.classList.add('active');
      console.log('List view activated');
    } else {
      console.error('List view element not found!');
    }

    // Set list view button as active
    document.querySelectorAll('.sidebar-item').forEach(item => item.classList.remove('active'));
    const listViewBtn = document.querySelector('[data-view="list"]');
    if (listViewBtn) {
      listViewBtn.classList.add('active');
      console.log('List view button activated');
    }

    currentView = 'list';
  }

  // Initialize
  initializeViews();
  initializeCategorySelect();
  updateAllViews();
  setupKanbanDragDrop();
  
  // Add sample data if no tasks exist
  if (tasks.length === 0) {
    // Add a welcome task
    guestStorage.addTask({
      text: 'Welcome to TaskFlow! 🎉',
      description: 'Try adding your first task or explore the different views (List, Kanban, Calendar)',
      completed: false,
      status: 'todo',
      category: { name: 'Personal', color: '#2196F3' },
      priority: 'low',
      dueDate: today,
      subtasks: []
    });
    
    tasks = guestStorage.getTasks();
    updateAllViews();
  }

  console.log('Guest app initialized with', tasks.length, 'tasks');
});
