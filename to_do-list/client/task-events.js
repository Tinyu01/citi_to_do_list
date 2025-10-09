// Task Event Handlers
class TaskEventHandler {
    constructor() {
        this.setupSocketListeners();
        this.bindUIEvents();
    }

    setupSocketListeners() {
        if (!socket) return;

        // Task CRUD events
        socket.on('taskCreated', this.handleTaskCreated.bind(this));
        socket.on('taskUpdated', this.handleTaskUpdated.bind(this));
        socket.on('taskDeleted', this.handleTaskDeleted.bind(this));
        socket.on('taskMoved', this.handleTaskMoved.bind(this));
        socket.on('subtaskUpdated', this.handleSubtaskUpdated.bind(this));
        socket.on('taskBatchUpdate', this.handleBatchUpdate.bind(this));

        // Error events
        socket.on('taskError', this.handleTaskError.bind(this));
    }

    bindUIEvents() {
        // Add task form
        const addTaskForm = document.querySelector('.add-task-container');
        addTaskForm?.addEventListener('submit', this.handleAddTask.bind(this));

        // Task actions
        document.addEventListener('click', (e) => {
            const target = e.target;

            if (target.matches('.edit-task-btn')) {
                const taskId = target.closest('.task-item').id;
                this.handleEditTaskClick(taskId);
            }

            if (target.matches('.delete-task-btn')) {
                const taskId = target.closest('.task-item').id;
                this.handleDeleteTaskClick(taskId);
            }

            if (target.matches('.task-checkbox')) {
                const taskId = target.closest('.task-item').id;
                this.handleTaskStatusToggle(taskId, target.checked);
            }
        });

        // Subtask events
        document.addEventListener('change', (e) => {
            if (e.target.matches('.subtask-checkbox')) {
                const taskId = e.target.closest('.task-item').id;
                const subtaskId = e.target.dataset.subtaskId;
                this.handleSubtaskToggle(taskId, subtaskId, e.target.checked);
            }
        });
    }

    // Event Emitters
    async emitCreateTask(taskData) {
        try {
            const response = await fetch(`${window.appConfig.apiUrl}/tasks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify(taskData)
            });

            if (!response.ok) throw new Error('Failed to create task');
            
            const task = await response.json();
            socket.emit('createTask', task);
            return task;
        } catch (error) {
            this.handleTaskError(error);
            throw error;
        }
    }

    async emitUpdateTask(taskId, updates) {
        try {
            const response = await fetch(`${window.appConfig.apiUrl}/tasks/${taskId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify(updates)
            });

            if (!response.ok) throw new Error('Failed to update task');
            
            const task = await response.json();
            socket.emit('updateTask', task);
            return task;
        } catch (error) {
            this.handleTaskError(error);
            throw error;
        }
    }

    async emitDeleteTask(taskId) {
        try {
            const response = await fetch(`${window.appConfig.apiUrl}/tasks/${taskId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            if (!response.ok) throw new Error('Failed to delete task');
            
            socket.emit('deleteTask', taskId);
            return true;
        } catch (error) {
            this.handleTaskError(error);
            throw error;
        }
    }

    async emitUpdateSubtask(taskId, subtaskId, updates) {
        try {
            const response = await fetch(`${window.appConfig.apiUrl}/tasks/${taskId}/subtasks/${subtaskId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify(updates)
            });

            if (!response.ok) throw new Error('Failed to update subtask');
            
            const subtask = await response.json();
            socket.emit('updateSubtask', { taskId, subtaskId, updates: subtask });
            return subtask;
        } catch (error) {
            this.handleTaskError(error);
            throw error;
        }
    }

    // Event Handlers
    async handleAddTask(e) {
        e.preventDefault();
        const form = e.target;
        
        try {
            headerUtils.showLoading(form.querySelector('button[type="submit"]'));

            const taskData = {
                title: form.querySelector('#new-task').value,
                description: form.querySelector('#task-description').value,
                dueDate: form.querySelector('#due-date').value,
                category: form.querySelector('#task-category').value,
                priority: form.querySelector('.priority-dot.active').dataset.priority,
                subtasks: Array.from(form.querySelectorAll('#subtasks-list li')).map(li => ({
                    text: li.textContent,
                    completed: false
                }))
            };

            const task = await this.emitCreateTask(taskData);
            form.reset();
            headerUtils.showSuccess('Task created successfully');
        } catch (error) {
            headerUtils.showError('Failed to create task');
        } finally {
            headerUtils.hideLoading(form.querySelector('button[type="submit"]'));
        }
    }

    async handleTaskStatusToggle(taskId, completed) {
        try {
            await this.emitUpdateTask(taskId, { completed });
        } catch (error) {
            // Revert checkbox state on error
            const checkbox = document.querySelector(`#${taskId} .task-checkbox`);
            if (checkbox) checkbox.checked = !completed;
        }
    }

    async handleSubtaskToggle(taskId, subtaskId, completed) {
        try {
            await this.emitUpdateSubtask(taskId, subtaskId, { completed });
        } catch (error) {
            // Revert checkbox state on error
            const checkbox = document.querySelector(`#${taskId} .subtask-checkbox[data-subtask-id="${subtaskId}"]`);
            if (checkbox) checkbox.checked = !completed;
        }
    }

    async handleDeleteTaskClick(taskId) {
        if (!confirm('Are you sure you want to delete this task?')) return;

        try {
            await this.emitDeleteTask(taskId);
            headerUtils.showSuccess('Task deleted successfully');
        } catch (error) {
            headerUtils.showError('Failed to delete task');
        }
    }

    // Socket Event Handlers
    handleTaskCreated(task) {
        const taskElement = this.createTaskElement(task);
        const targetList = document.getElementById(`${task.status}-list`);
        
        if (targetList) {
            targetList.appendChild(taskElement);
            window.kanbanBoard.makeTaskDraggable(taskElement);
            this.animateTask(taskElement, 'add');
            this.updateTaskCounters();
        }
    }

    handleTaskUpdated(task) {
        const taskElement = document.getElementById(task._id);
        if (!taskElement) return;

        this.updateTaskElement(taskElement, task);
        this.animateTask(taskElement, 'update');
        this.updateTaskCounters();
    }

    handleTaskDeleted(taskId) {
        const taskElement = document.getElementById(taskId);
        if (!taskElement) return;

        this.animateTask(taskElement, 'remove').then(() => {
            taskElement.remove();
            this.updateTaskCounters();
        });
    }

    handleTaskMoved(data) {
        const { taskId, newStatus, userId } = data;
        const taskElement = document.getElementById(taskId);
        if (!taskElement) return;

        const targetList = document.getElementById(`${newStatus}-list`);
        if (!targetList) return;

        // Don't animate if it's our own move
        const isOwnMove = userId === localStorage.getItem('userId');
        
        if (!isOwnMove) {
            this.animateTask(taskElement, 'move').then(() => {
                targetList.appendChild(taskElement);
                taskElement.dataset.status = newStatus;
                this.updateTaskCounters();
            });
        }
    }

    handleSubtaskUpdated(data) {
        const { taskId, subtaskId, updates } = data;
        const taskElement = document.getElementById(taskId);
        if (!taskElement) return;

        const subtaskElement = taskElement.querySelector(`[data-subtask-id="${subtaskId}"]`);
        if (!subtaskElement) return;

        subtaskElement.checked = updates.completed;
        this.updateTaskProgress(taskElement);
    }

    handleBatchUpdate(updates) {
        updates.forEach(update => {
            switch (update.type) {
                case 'create':
                    this.handleTaskCreated(update.task);
                    break;
                case 'update':
                    this.handleTaskUpdated(update.task);
                    break;
                case 'delete':
                    this.handleTaskDeleted(update.taskId);
                    break;
            }
        });
    }

    handleTaskError(error) {
        console.error('Task operation error:', error);
        headerUtils.showError(error.message || 'An error occurred with the task operation');
    }

    // Utility Methods
    createTaskElement(task) {
        const template = document.createElement('template');
        template.innerHTML = this.getTaskTemplate(task);
        return template.content.firstElementChild;
    }

    updateTaskElement(element, task) {
        element.querySelector('.task-title').textContent = task.title;
        element.querySelector('.task-description').textContent = task.description || '';
        element.querySelector('.due-date').textContent = this.formatDate(task.dueDate);
        element.className = `task-item priority-${task.priority}`;
        
        const checkbox = element.querySelector('.task-checkbox');
        if (checkbox) checkbox.checked = task.completed;

        this.updateTaskProgress(element);
    }

    updateTaskProgress(element) {
        const progressBar = element.querySelector('.progress-bar');
        if (!progressBar) return;

        const subtaskCheckboxes = element.querySelectorAll('.subtask-checkbox');
        if (subtaskCheckboxes.length === 0) {
            progressBar.style.width = element.querySelector('.task-checkbox').checked ? '100%' : '0%';
            return;
        }

        const completed = Array.from(subtaskCheckboxes).filter(cb => cb.checked).length;
        const progress = Math.round((completed / subtaskCheckboxes.length) * 100);
        progressBar.style.width = `${progress}%`;
    }

    async animateTask(element, type) {
        const animationMap = {
            add: 'create',
            remove: 'delete',
            update: 'update',
            move: 'move'
        };

        await window.animationSystem[`animateTask${animationMap[type].charAt(0).toUpperCase() + animationMap[type].slice(1)}`](element);
    }

    updateTaskCounters() {
        const lists = ['todo', 'in-progress', 'completed'];
        lists.forEach(status => {
            const count = document.getElementById(`${status}-list`)?.children.length || 0;
            const counter = document.querySelector(`[data-status="${status}"] .task-count`);
            if (counter) counter.textContent = count;
        });

        // Update dashboard stats
        this.updateDashboardStats();
    }

    updateDashboardStats() {
        const totalTasks = document.querySelectorAll('.task-item').length;
        const completedTasks = document.querySelectorAll('.task-item .task-checkbox:checked').length;
        const pendingTasks = totalTasks - completedTasks;
        const productivityScore = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

        document.getElementById('total-tasks').textContent = totalTasks;
        document.getElementById('completed-tasks').textContent = completedTasks;
        document.getElementById('pending-tasks').textContent = pendingTasks;
        document.getElementById('productivity-score').textContent = `${productivityScore}%`;
    }

    formatDate(date) {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    getTaskTemplate(task) {
        return `
            <div id="${task._id}" class="task-item priority-${task.priority}" data-status="${task.status}">
                <div class="task-header">
                    <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                    <h3 class="task-title">${task.title}</h3>
                    <div class="task-actions">
                        <button class="edit-task-btn"><i class="fas fa-edit"></i></button>
                        <button class="delete-task-btn"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
                <p class="task-description">${task.description || ''}</p>
                <div class="task-meta">
                    <span class="category-tag" style="background-color: ${task.category.color}">${task.category.name}</span>
                    <span class="due-date"><i class="fas fa-calendar"></i> ${this.formatDate(task.dueDate)}</span>
                </div>
                ${this.getSubtasksTemplate(task.subtasks)}
                <div class="progress-bar" style="width: ${this.calculateProgress(task)}%"></div>
            </div>
        `;
    }

    getSubtasksTemplate(subtasks) {
        if (!subtasks || subtasks.length === 0) return '';

        return `
            <div class="subtasks">
                ${subtasks.map(subtask => `
                    <div class="subtask">
                        <input type="checkbox" class="subtask-checkbox" 
                            data-subtask-id="${subtask._id}" ${subtask.completed ? 'checked' : ''}>
                        <span>${subtask.text}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    calculateProgress(task) {
        if (!task.subtasks || task.subtasks.length === 0) {
            return task.completed ? 100 : 0;
        }

        const completed = task.subtasks.filter(subtask => subtask.completed).length;
        return Math.round((completed / task.subtasks.length) * 100);
    }
}

// Initialize task event handler when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.taskEventHandler = new TaskEventHandler();
});