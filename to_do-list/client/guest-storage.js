// Guest Storage Management
class GuestStorage {
  constructor() {
    this.tasks = JSON.parse(localStorage.getItem('guestTasks')) || [];
    this.categories = JSON.parse(localStorage.getItem('guestCategories')) || this.getDefaultCategories();
  }

  // Default categories for new guests
  getDefaultCategories() {
    return [
      { name: 'Work', color: '#4CAF50', isDefault: true },
      { name: 'Personal', color: '#2196F3', isDefault: true },
      { name: 'Shopping', color: '#FF9800', isDefault: true },
      { name: 'Health', color: '#E91E63', isDefault: true }
    ];
  }

  // Save tasks to localStorage
  saveTasks() {
    localStorage.setItem('guestTasks', JSON.stringify(this.tasks));
  }

  // Save categories to localStorage
  saveCategories() {
    localStorage.setItem('guestCategories', JSON.stringify(this.categories));
  }

  // Add a new task
  addTask(task) {
    this.tasks.push({
      ...task,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    });
    this.saveTasks();
    return this.tasks[this.tasks.length - 1];
  }

  // Add a new category
  addCategory(category) {
    if (this.categories.find(c => c.name === category.name)) {
      throw new Error('Category already exists');
    }
    this.categories.push({
      ...category,
      isDefault: false
    });
    this.saveCategories();
    return this.categories[this.categories.length - 1];
  }

  // Delete a category (prevent deleting default categories)
  deleteCategory(categoryName) {
    const category = this.categories.find(c => c.name === categoryName);
    if (!category) {
      throw new Error('Category not found');
    }
    if (category.isDefault) {
      throw new Error('Cannot delete default category');
    }
    this.categories = this.categories.filter(c => c.name !== categoryName);
    this.saveCategories();
  }

  // Get all tasks
  getTasks() {
    return this.tasks;
  }

  // Get all categories
  getCategories() {
    return this.categories;
  }

  // Update a task
  updateTask(taskId, updates) {
    const index = this.tasks.findIndex(t => t.id === taskId);
    if (index === -1) return null;
    
    this.tasks[index] = {
      ...this.tasks[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.saveTasks();
    return this.tasks[index];
  }

  // Delete a task
  deleteTask(taskId) {
    this.tasks = this.tasks.filter(t => t.id !== taskId);
    this.saveTasks();
  }

  // Clear all guest data (used when user logs in)
  clearAll() {
    localStorage.removeItem('guestTasks');
    localStorage.removeItem('guestCategories');
    this.tasks = [];
    this.categories = this.getDefaultCategories();
  }
}

// Initialize guest storage
window.guestStorage = new GuestStorage();