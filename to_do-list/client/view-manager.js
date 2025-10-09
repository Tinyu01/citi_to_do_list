// View Management System
class ViewManager {
    constructor() {
        this.currentView = 'list';
        this.views = {
            list: document.getElementById('list-view'),
            kanban: document.getElementById('kanban-view'),
            calendar: document.getElementById('calendar-view')
        };
        this.buttons = {
            list: document.getElementById('list-view-btn'),
            kanban: document.getElementById('kanban-view-btn'),
            calendar: document.getElementById('calendar-view-btn')
        };
        this.initialize();
    }

    initialize() {
        // Set up click handlers for view buttons
        Object.keys(this.buttons).forEach(viewType => {
            this.buttons[viewType].addEventListener('click', () => {
                this.switchView(viewType);
            });
        });

        // Initialize with default view
        this.switchView('list');
    }

    switchView(viewType) {
        // Deactivate all views and buttons
        Object.keys(this.views).forEach(type => {
            this.views[type].style.display = 'none';
            this.buttons[type].parentElement.classList.remove('active');
        });

        // Activate selected view and button
        if (this.views[viewType]) {
            this.views[viewType].style.display = 'block';
            this.buttons[viewType].parentElement.classList.add('active');
            this.currentView = viewType;
            
            // Update tasks display based on view
            if (typeof window.updateViews === 'function') {
                window.updateViews();
            }
        }

        // Dispatch view change event
        document.dispatchEvent(new CustomEvent('viewChanged', {
            detail: { view: viewType }
        }));
    }
}

// Initialize view manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.viewManager = new ViewManager();
});