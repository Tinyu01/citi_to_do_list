// Calendar View Functionality
class CalendarView {
    constructor() {
        this.calendarGrid = document.getElementById('calendar-grid');
        this.calendarTitle = document.getElementById('calendar-title');
        this.prevMonthBtn = document.getElementById('prev-month');
        this.nextMonthBtn = document.getElementById('next-month');
        this.currentDate = new Date();
        
        this.initialize();
    }

    initialize() {
        this.setupEventListeners();
        this.renderCalendar();
    }

    setupEventListeners() {
        this.prevMonthBtn.addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.renderCalendar();
        });

        this.nextMonthBtn.addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.renderCalendar();
        });

        // Listen for task updates
        document.addEventListener('taskUpdated', () => this.renderCalendar());
        document.addEventListener('taskCreated', () => this.renderCalendar());
        document.addEventListener('taskDeleted', () => this.renderCalendar());
    }

    renderCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        // Update calendar title
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                          'July', 'August', 'September', 'October', 'November', 'December'];
        this.calendarTitle.textContent = `${monthNames[month]} ${year}`;

        // Clear existing calendar
        this.calendarGrid.innerHTML = '';

        // Add day headers
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayNames.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'calendar-header-cell';
            dayHeader.textContent = day;
            this.calendarGrid.appendChild(dayHeader);
        });

        // Get the first day of the month and total days
        const firstDay = new Date(year, month, 1).getDay();
        const totalDays = new Date(year, month + 1, 0).getDate();

        // Get tasks for this month
        const tasks = window.guestStorage.getTasks().filter(task => {
            if (!task.dueDate) return false;
            const taskDate = new Date(task.dueDate);
            return taskDate.getMonth() === month && taskDate.getFullYear() === year;
        });

        // Create calendar cells
        for (let i = 0; i < 42; i++) {
            const cell = document.createElement('div');
            cell.className = 'calendar-cell';
            
            const dayNumber = i - firstDay + 1;
            if (i >= firstDay && dayNumber <= totalDays) {
                cell.innerHTML = `<span class="date-number">${dayNumber}</span>`;
                
                // Add tasks for this day
                const dayTasks = tasks.filter(task => {
                    const taskDate = new Date(task.dueDate);
                    return taskDate.getDate() === dayNumber;
                });

                if (dayTasks.length > 0) {
                    const taskList = document.createElement('div');
                    taskList.className = 'calendar-task-list';
                    
                    dayTasks.forEach(task => {
                        const taskElement = document.createElement('div');
                        taskElement.className = `calendar-task ${task.completed ? 'completed' : ''}`;
                        taskElement.style.backgroundColor = task.category.color + '40'; // Add transparency
                        taskElement.innerHTML = `
                            <span class="task-text">${task.text}</span>
                            <span class="category-dot" style="background-color: ${task.category.color}"></span>
                        `;
                        
                        // Add click handler to show task details
                        taskElement.addEventListener('click', () => this.showTaskDetails(task));
                        
                        taskList.appendChild(taskElement);
                    });
                    
                    cell.appendChild(taskList);
                }
            }
            
            this.calendarGrid.appendChild(cell);
        }
    }

    showTaskDetails(task) {
        // Create a modal to show task details
        const modal = document.createElement('div');
        modal.className = 'modal task-details-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Task Details</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="task-header">
                        <h4>${task.text}</h4>
                        <span class="category-tag" style="background-color: ${task.category.color}">
                            ${task.category.name}
                        </span>
                    </div>
                    ${task.description ? `
                        <div class="task-description">${task.description}</div>
                    ` : ''}
                    <div class="task-details">
                        <p><strong>Status:</strong> ${task.status}</p>
                        <p><strong>Due Date:</strong> ${new Date(task.dueDate).toLocaleDateString()}</p>
                        <p><strong>Created:</strong> ${new Date(task.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>
            </div>
        `;

        // Add close functionality
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.remove();
        });

        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        document.body.appendChild(modal);
    }
}

// Initialize Calendar view when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.calendarView = new CalendarView();
});