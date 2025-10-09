// Kanban Board Functionality
class KanbanBoard {
    constructor() {
        this.draggedItem = null;
        this.dragSourceList = null;
        this.dragPlaceholder = null;
        this.isDragging = false;
        this.initialized = false;
        this.touchTimeout = null;
    }

    initialize() {
        if (this.initialized) return;
        
        this.setupDragAndDrop();
        this.setupTouchEvents();
        this.initialized = true;
    }

    setupDragAndDrop() {
        const kanbanLists = document.querySelectorAll('.kanban-list');
        
        kanbanLists.forEach(list => {
            // Make tasks draggable
            const tasks = list.querySelectorAll('.task-item');
            tasks.forEach(task => this.makeTaskDraggable(task));

            // Make lists droppable
            this.makeListDroppable(list);
        });

        // Global events for drag feedback
        document.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.updateDragFeedback(e);
        });

        document.addEventListener('dragend', () => {
            this.cleanupDrag();
        });
    }

    makeTaskDraggable(task) {
        task.setAttribute('draggable', true);

        task.addEventListener('dragstart', (e) => {
            this.handleDragStart(e, task);
        });

        task.addEventListener('dragend', (e) => {
            this.handleDragEnd(e);
        });
    }

    makeListDroppable(list) {
        list.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.handleDragOver(e, list);
        });

        list.addEventListener('drop', (e) => {
            this.handleDrop(e, list);
        });

        list.addEventListener('dragleave', (e) => {
            this.handleDragLeave(e, list);
        });
    }

    async handleDragStart(e, task) {
        this.isDragging = true;
        this.draggedItem = task;
        this.dragSourceList = task.closest('.kanban-list');

        // Create and style placeholder
        this.dragPlaceholder = document.createElement('div');
        this.dragPlaceholder.className = 'task-placeholder';
        this.dragPlaceholder.style.height = `${task.offsetHeight}px`;

        // Set drag image and data
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', task.id);
        
        // Start drag animation
        await window.animationSystem.animateTaskDrag(task);
        
        // Add dragging class after animation
        task.classList.add('dragging');
        this.dragPlaceholder.style.display = 'block';

        // Emit drag start event
        this.emitDragStart(task);
    }

    handleDragOver(e, list) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        const afterElement = this.getDragAfterElement(list, e.clientY);
        const task = this.draggedItem;

        if (!task) return;

        // Remove placeholder from its current position
        this.dragPlaceholder.remove();

        // Insert placeholder at new position
        if (afterElement) {
            list.insertBefore(this.dragPlaceholder, afterElement);
        } else {
            list.appendChild(this.dragPlaceholder);
        }

        // Add drop target indication
        list.classList.add('drop-target');
    }

    async handleDrop(e, list) {
        e.preventDefault();
        const taskId = e.dataTransfer.getData('text/plain');
        const task = document.getElementById(taskId);
        const newStatus = list.dataset.status;

        if (task && task.dataset.status !== newStatus) {
            // Replace placeholder with actual task
            list.insertBefore(task, this.dragPlaceholder);
            task.dataset.status = newStatus;

            // Animate the drop
            await window.animationSystem.animateTaskDrop(task);

            // Emit task moved event
            this.emitTaskMoved(taskId, newStatus);

            // Update UI
            this.updateTaskCounters();
        }

        this.cleanupDrag();
    }

    handleDragEnd(e) {
        this.cleanupDrag();
    }

    handleDragLeave(e, list) {
        if (e.target === list) {
            list.classList.remove('drop-target');
        }
    }

    // Touch event handling
    setupTouchEvents() {
        const tasks = document.querySelectorAll('.task-item');
        
        tasks.forEach(task => {
            task.addEventListener('touchstart', (e) => this.handleTouchStart(e, task));
            task.addEventListener('touchmove', (e) => this.handleTouchMove(e, task));
            task.addEventListener('touchend', (e) => this.handleTouchEnd(e, task));
        });
    }

    handleTouchStart(e, task) {
        // Start touch timer for long press
        this.touchTimeout = setTimeout(() => {
            task.classList.add('touch-dragging');
            this.draggedItem = task;
        }, 500); // 500ms for long press

        // Store initial touch position
        const touch = e.touches[0];
        task.dataset.touchStartX = touch.clientX;
        task.dataset.touchStartY = touch.clientY;
    }

    handleTouchMove(e, task) {
        if (!this.draggedItem) return;

        e.preventDefault();
        const touch = e.touches[0];
        const moveX = touch.clientX - task.dataset.touchStartX;
        const moveY = touch.clientY - task.dataset.touchStartY;

        task.style.transform = `translate(${moveX}px, ${moveY}px)`;

        // Find potential drop target
        const dropTarget = this.findDropTargetFromTouch(touch);
        if (dropTarget) {
            this.highlightDropTarget(dropTarget);
        }
    }

    async handleTouchEnd(e, task) {
        clearTimeout(this.touchTimeout);
        
        if (!this.draggedItem) return;

        const touch = e.changedTouches[0];
        const dropTarget = this.findDropTargetFromTouch(touch);

        if (dropTarget) {
            const newStatus = dropTarget.dataset.status;
            if (task.dataset.status !== newStatus) {
                dropTarget.appendChild(task);
                task.dataset.status = newStatus;

                // Animate the touch drop
                await window.animationSystem.animateTaskDrop(task);

                this.emitTaskMoved(task.id, newStatus);
                this.updateTaskCounters();
            }
        }

        // Cleanup
        task.classList.remove('touch-dragging');
        task.style.transform = '';
        this.draggedItem = null;
        this.removeDropTargetHighlights();
    }

    // Utility functions
    getDragAfterElement(container, y) {
        const draggableElements = [
            ...container.querySelectorAll('.task-item:not(.dragging), .task-placeholder')
        ];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;

            if (offset < 0 && offset > closest.offset) {
                return { offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    findDropTargetFromTouch(touch) {
        const elements = document.elementsFromPoint(touch.clientX, touch.clientY);
        return elements.find(el => el.classList.contains('kanban-list'));
    }

    highlightDropTarget(target) {
        this.removeDropTargetHighlights();
        target.classList.add('drop-target');
    }

    removeDropTargetHighlights() {
        document.querySelectorAll('.drop-target').forEach(el => {
            el.classList.remove('drop-target');
        });
    }

    cleanupDrag() {
        if (this.draggedItem) {
            this.draggedItem.classList.remove('dragging');
            this.draggedItem = null;
        }

        if (this.dragPlaceholder) {
            this.dragPlaceholder.remove();
            this.dragPlaceholder = null;
        }

        this.removeDropTargetHighlights();
        this.isDragging = false;
    }

    updateTaskCounters() {
        window.realTimeUtils.updateTaskCounters();
    }

    // Event emission
    emitDragStart(task) {
        const event = new CustomEvent('kanban:dragstart', {
            detail: {
                taskId: task.id,
                sourceStatus: task.dataset.status
            }
        });
        document.dispatchEvent(event);
    }

    emitTaskMoved(taskId, newStatus) {
        socket.emit('moveTask', {
            taskId,
            newStatus,
            userId: localStorage.getItem('userId')
        });
    }
}

// Initialize Kanban board when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.kanbanBoard = new KanbanBoard();
    window.kanbanBoard.initialize();
});