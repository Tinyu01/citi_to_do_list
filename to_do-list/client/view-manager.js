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
        console.log('ViewManager initializing...');
        console.log('Views found:', {
            list: !!this.views.list,
            kanban: !!this.views.kanban,
            calendar: !!this.views.calendar
        });
        console.log('Buttons found:', {
            list: !!this.buttons.list,
            kanban: !!this.buttons.kanban,
            calendar: !!this.buttons.calendar
        });
        
        // Set up click handlers for view buttons
        Object.keys(this.buttons).forEach(viewType => {
            if (this.buttons[viewType]) {
                this.buttons[viewType].addEventListener('click', () => {
                    console.log('View button clicked:', viewType);
                    this.switchView(viewType);
                });
            } else {
                console.warn('Button not found for view:', viewType);
            }
        });

        // Initialize with default view
        console.log('Setting initial view to list');
        this.switchView('list');
    }

    switchView(viewType) {
        console.log('Switching to view:', viewType);
        
        // Deactivate all views and buttons - ensure complete hiding
        Object.keys(this.views).forEach(type => {
            if (this.views[type]) {
                this.views[type].style.display = 'none';
                this.views[type].style.visibility = 'hidden';
                this.views[type].style.opacity = '0';
                this.views[type].classList.remove('active');
                this.views[type].classList.remove('active-view');
            }
            if (this.buttons[type]) {
                this.buttons[type].parentElement.classList.remove('active');
            }
        });

        // Activate selected view and button - ensure complete showing
        if (this.views[viewType]) {
            this.views[viewType].style.display = 'block';
            this.views[viewType].style.visibility = 'visible';
            this.views[viewType].style.opacity = '1';
            this.views[viewType].classList.add('active');
            this.views[viewType].classList.add('active-view');
            this.buttons[viewType].parentElement.classList.add('active');
            this.currentView = viewType;
            
            console.log('View switched to:', viewType);
            
            // Update tasks display based on view
            if (typeof window.updateViews === 'function') {
                window.updateViews();
            }
            
            // Trigger view-specific updates
            if (viewType === 'kanban' && typeof updateKanbanBoard === 'function') {
                updateKanbanBoard();
            } else if (viewType === 'calendar' && typeof updateCalendarView === 'function') {
                updateCalendarView();
            } else if (viewType === 'list' && typeof updateListView === 'function') {
                updateListView();
            }
        } else {
            console.error('View not found:', viewType);
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