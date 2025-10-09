// Sample Data Initialization
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if no tasks exist
    if (window.guestStorage.getTasks().length === 0) {
        // Add some sample tasks
        const sampleTasks = [
            {
                text: "Complete project documentation",
                description: "Write comprehensive documentation for the TaskFlow project",
                status: "in-progress",
                category: { name: "Work", color: "#4CAF50" },
                dueDate: new Date(2025, 9, 15).toISOString(),
                priority: "high",
                completed: false
            },
            {
                text: "Buy groceries",
                description: "Get items for the week",
                status: "todo",
                category: { name: "Personal", color: "#2196F3" },
                dueDate: new Date(2025, 9, 10).toISOString(),
                priority: "medium",
                completed: false
            },
            {
                text: "Gym session",
                description: "30 minutes cardio, 30 minutes strength training",
                status: "completed",
                category: { name: "Health", color: "#E91E63" },
                dueDate: new Date(2025, 9, 9).toISOString(),
                priority: "medium",
                completed: true
            },
            {
                text: "Team meeting",
                description: "Weekly sync with the development team",
                status: "todo",
                category: { name: "Work", color: "#4CAF50" },
                dueDate: new Date(2025, 9, 11).toISOString(),
                priority: "high",
                completed: false
            },
            {
                text: "Review pull requests",
                description: "Review and merge pending PRs",
                status: "in-progress",
                category: { name: "Work", color: "#4CAF50" },
                dueDate: new Date(2025, 9, 12).toISOString(),
                priority: "high",
                completed: false
            }
        ];

        // Add tasks to storage
        sampleTasks.forEach(task => {
            window.guestStorage.addTask(task);
        });

        // Trigger updates
        document.dispatchEvent(new CustomEvent('tasksInitialized'));
    }
});