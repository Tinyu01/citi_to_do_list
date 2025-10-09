// DOM Elements
import { API_BASE_URL } from './config.js';

const categoryModal = document.getElementById('category-modal');
const categoryList = document.getElementById('category-list');
const categoryItems = document.getElementById('category-items');
const manageCategoriesBtn = document.getElementById('manage-categories');
const addCategoryForm = document.getElementById('add-category-form');
const taskCategorySelect = document.getElementById('task-category');
const editTaskCategorySelect = document.getElementById('edit-task-category');

let categories = [];
const authToken = localStorage.getItem('authToken');
const isGuest = !authToken;

// Toast notification function
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Initialize categories based on auth status
async function initializeCategories() {
    if (isGuest) {
        categories = window.guestStorage.getCategories();
        updateCategoryUI();
    } else {
        await loadCategories(); // Load from server
    }
}

// Update all category-related UI elements
function updateCategoryUI() {
    updateCategorySelects();
    updateSidebarCategories();
    updateCategoryModal();
}

// Update category dropdowns in forms
function updateCategorySelects() {
    const selectElements = [taskCategorySelect, editTaskCategorySelect];
    selectElements.forEach(select => {
        if (!select) return;
        select.innerHTML = '<option value="none">Select Category</option>';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.name;
            option.textContent = category.name;
            option.setAttribute('data-color', category.color);
            select.appendChild(option);
        });
    });
}

// Update sidebar category list
function updateSidebarCategories() {
    if (!categoryList) return;
    const totalTasks = window.tasks?.length || 0;
    let html = `
        <li class="category-item active" data-category="all">
            <span class="category-color" style="background-color: var(--primary-color)"></span>
            <span class="category-name">All Tasks</span>
            <span class="task-count">${totalTasks}</span>
        </li>
    `;
    categories.forEach(category => {
        const categoryTasks = window.tasks?.filter(task => task.category.name === category.name).length || 0;
        html += `
            <li class="category-item" data-category="${category.name}">
                <span class="category-color" style="background-color: ${category.color};"></span>
                <span class="category-name">${category.name}</span>
                <span class="task-count">${categoryTasks}</span>
                ${!category.isDefault ? `
                    <button class="delete-category-btn delete-btn" data-category="${category.name}">
                        <i class="fas fa-times"></i>
                    </button>
                ` : ''}
            </li>
        `;
    });
    categoryList.innerHTML = html;
}

// Update category management modal
function updateCategoryModal() {
    if (!categoryItems) return;
    categoryItems.innerHTML = '';
    categories.forEach(category => {
        const div = document.createElement('div');
        div.className = 'category-list-item';
        div.innerHTML = `
            <div class="category-info">
                <span class="category-color" style="background-color: ${category.color};"></span>
                <span class="category-name">${category.name}</span>
                ${category.isDefault ? '<span class="default-badge">Default</span>' : ''}
            </div>
            ${!category.isDefault ? `
                <div class="category-actions">
                    <button class="action-btn delete-btn" data-category="${category.name}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            ` : ''}
        `;
        categoryItems.appendChild(div);
    });
}

// Add new category
async function addCategory(name, color) {
    try {
        let newCategory;
        if (isGuest) {
            newCategory = window.guestStorage.addCategory({ name, color });
        } else {
            const response = await fetch(`${API_BASE_URL}/auth/categories`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ name, color })
            });
            if (!response.ok) throw new Error('Failed to add category');
            const data = await response.json();
            newCategory = data.category || data;
        }
        categories.push(newCategory);
        updateCategoryUI();
        showToast('Category added successfully', 'success');
    } catch (error) {
        showToast(error.message || 'Failed to add category', 'error');
    }
}

// Delete category
async function deleteCategory(categoryName) {
    try {
        if (isGuest) {
            window.guestStorage.deleteCategory(categoryName);
        } else {
            const response = await fetch(`${API_BASE_URL}/auth/categories/${categoryName}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            if (!response.ok) throw new Error('Failed to delete category');
        }
        categories = categories.filter(c => c.name !== categoryName);
        updateCategoryUI();
        showToast('Category deleted successfully', 'success');
    } catch (error) {
        showToast(error.message || 'Failed to delete category', 'error');
    }
}

// Load categories from server
async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/categories`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        if (!response.ok) throw new Error('Failed to load categories');
        const data = await response.json();
        categories = data.categories || data;
        updateCategoryUI();
    } catch (error) {
        showToast('Failed to load categories', 'error');
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    initializeCategories();

    // Add Category Form
    if (addCategoryForm) {
        addCategoryForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = e.target.categoryName.value.trim();
            const color = e.target.categoryColor.value;
            if (!name) {
                showToast('Please enter a category name', 'error');
                return;
            }
            await addCategory(name, color);
            e.target.reset();
            loadCategories();
        });
    }

    // Delete Category Buttons
    if (categoryItems) {
        categoryItems.addEventListener('click', async (e) => {
            const deleteBtn = e.target.closest('.delete-btn');
            if (deleteBtn) {
                const categoryName = deleteBtn.dataset.category;
                if (confirm(`Are you sure you want to delete the category "${categoryName}"?`)) {
                    await deleteCategory(categoryName);
                    loadCategories();
                }
            }
        });
    }

    // Category Filter in Sidebar
    if (categoryList) {
        categoryList.addEventListener('click', (e) => {
            const categoryItem = e.target.closest('.category-item');
            if (categoryItem) {
                document.querySelectorAll('.category-item').forEach(item => item.classList.remove('active'));
                categoryItem.classList.add('active');
                const category = categoryItem.dataset.category;
                document.dispatchEvent(new CustomEvent('categoryFilter', { detail: category }));
            }
        });
    }
});

// Manage Categories Modal
if (manageCategoriesBtn) {
    manageCategoriesBtn.addEventListener('click', () => {
        if (categoryModal) {
            categoryModal.classList.add('show');
            loadCategories();
        }
    });
}

// Auth state change
document.addEventListener('authStateChange', (event) => {
    if (event.detail.isAuthenticated) {
        loadCategories();
    }
});

// Initialize categories on page load if user is authenticated
if (authToken) {
    loadCategories();
}