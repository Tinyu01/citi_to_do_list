// Migration Utilities for Guest to Authenticated User
class MigrationUtils {
    constructor() {
        this.API_BASE_URL = window.appConfig?.apiUrl || 'http://localhost:5000';
    }

    // Migrate guest data to authenticated user account
    async migrateGuestData(authToken) {
        try {
            if (!window.guestStorage) {
                throw new Error('No guest data found');
            }

            // Show migration progress
            this.showMigrationProgress('Starting data migration...');

            // 1. Migrate categories first
            const categories = window.guestStorage.getCategories();
            const nonDefaultCategories = categories.filter(cat => !cat.isDefault);
            
            this.showMigrationProgress('Migrating categories...');
            for (const category of nonDefaultCategories) {
                await this.migrateCategory(category, authToken);
            }

            // 2. Migrate tasks
            const tasks = window.guestStorage.getTasks();
            this.showMigrationProgress('Migrating tasks...');
            await this.migrateTasks(tasks, authToken);

            // 3. Clear guest storage
            window.guestStorage.clearAll();
            
            this.showMigrationProgress('Migration completed successfully!', 'success');
            
            // 4. Trigger reload of data
            document.dispatchEvent(new CustomEvent('dataMigrationComplete'));
            
            return true;
        } catch (error) {
            this.showMigrationProgress('Migration failed: ' + error.message, 'error');
            console.error('Migration error:', error);
            return false;
        }
    }

    // Migrate individual category
    async migrateCategory(category, authToken) {
        try {
            await fetch(`${this.API_BASE_URL}/auth/categories`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    name: category.name,
                    color: category.color
                })
            });
        } catch (error) {
            console.warn(`Failed to migrate category ${category.name}:`, error);
            // Continue with other categories even if one fails
        }
    }

    // Migrate tasks
    async migrateTasks(tasks, authToken) {
        const failedTasks = [];
        let progress = 0;
        const total = tasks.length;

        for (const task of tasks) {
            try {
                await fetch(`${this.API_BASE_URL}/tasks`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify({
                        text: task.text,
                        description: task.description,
                        status: task.status,
                        category: task.category,
                        dueDate: task.dueDate,
                        priority: task.priority,
                        completed: task.completed,
                        subtasks: task.subtasks || []
                    })
                });

                progress++;
                this.showMigrationProgress(`Migrating tasks (${progress}/${total})...`);
            } catch (error) {
                failedTasks.push(task);
                console.warn(`Failed to migrate task ${task.text}:`, error);
            }
        }

        if (failedTasks.length > 0) {
            console.warn('Failed to migrate some tasks:', failedTasks);
        }
    }

    // Show migration progress
    showMigrationProgress(message, type = 'info') {
        const existingProgress = document.getElementById('migration-progress');
        if (existingProgress) {
            existingProgress.remove();
        }

        const progressElement = document.createElement('div');
        progressElement.id = 'migration-progress';
        progressElement.className = `toast toast-${type} show`;
        progressElement.innerHTML = `
            <i class="fas fa-sync-alt ${type !== 'error' ? 'fa-spin' : ''}"></i>
            <span>${message}</span>
        `;

        document.body.appendChild(progressElement);

        if (type === 'success' || type === 'error') {
            setTimeout(() => {
                progressElement.remove();
            }, 5000);
        }
    }
}

// Initialize migration utils
window.migrationUtils = new MigrationUtils();