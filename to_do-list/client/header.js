// Header Interactions
document.addEventListener('DOMContentLoaded', () => {
    // Theme Selection with visual feedback
    const themeSelect = document.getElementById('theme-select');
    const html = document.documentElement;

    themeSelect?.addEventListener('change', async () => {
        const selectedTheme = themeSelect.value;
        html.setAttribute('data-theme', selectedTheme);
        localStorage.setItem('theme', selectedTheme);

        // Update theme preview in settings
        document.querySelectorAll('.theme-option').forEach(option => {
            option.classList.remove('active');
            if (option.dataset.theme === selectedTheme) {
                option.classList.add('active');
            }
        });

        // Persist to server if logged in
        try {
            const token = localStorage.getItem('authToken');
            if (token && window.appConfig?.apiUrl) {
                await fetch(`${window.appConfig.apiUrl}/auth/profile`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ preferences: { theme: selectedTheme } })
                });
            }
        } catch (e) {
            console.warn('Failed to persist theme preference:', e);
        }
    });

    // Load saved theme
    // Load theme preference (server takes precedence when logged in)
    (async () => {
        let initialTheme = localStorage.getItem('theme') || 'light';
        try {
            const token = localStorage.getItem('authToken');
            if (token && window.appConfig?.apiUrl) {
                const resp = await fetch(`${window.appConfig.apiUrl}/auth/profile`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (resp.ok) {
                    const data = await resp.json();
                    const serverTheme = data?.user?.preferences?.theme;
                    if (serverTheme) {
                        initialTheme = serverTheme;
                        localStorage.setItem('theme', serverTheme);
                    }
                }
            }
        } catch (e) {
            console.warn('Failed to load server theme preference:', e);
        }
        themeSelect && (themeSelect.value = initialTheme);
        html.setAttribute('data-theme', initialTheme);
    })();

    // Settings Modal
    const settingsBtn = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settings-modal');

    settingsBtn?.addEventListener('click', () => {
        settingsModal?.classList.add('show');
    });

    // Data Management Dropdown with loading states
    const dataManagementBtn = document.getElementById('data-management-btn');
    const dropdownContent = document.querySelector('.dropdown-content');

    dataManagementBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownContent?.classList.toggle('show');
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        // Close data management dropdown
        if (!e.target.closest('.data-management-dropdown')) {
            dropdownContent?.classList.remove('show');
        }
        
        // Close profile dropdown
        if (!e.target.closest('.user-profile-wrapper')) {
            document.querySelector('.profile-dropdown')?.classList.remove('show');
        }
    });

    // User Profile Management
    const userProfileBtn = document.getElementById('user-profile');
    const profileDropdown = document.querySelector('.profile-dropdown');
    const userProfileWrapper = document.getElementById('user-profile-wrapper');
    const authButtons = document.getElementById('auth-buttons');

    userProfileBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        profileDropdown?.classList.toggle('show');
    });

    // Login/Signup Modal Handlers
    const loginBtn = document.getElementById('login-btn');
    const signupBtn = document.getElementById('signup-btn');
    const loginModal = document.getElementById('login-modal');
    const signupModal = document.getElementById('signup-modal');

    loginBtn?.addEventListener('click', () => {
        loginModal?.classList.add('show');
    });

    signupBtn?.addEventListener('click', () => {
        signupModal?.classList.add('show');
    });

    // Update user info in profile dropdown
    function updateUserInfo(user) {
        const userNameDisplay = document.querySelector('.user-name');
        const userEmailDisplay = document.querySelector('.user-email');
        const usernameDisplay = document.querySelector('.username-display');

        if (user) {
            userNameDisplay.textContent = user.name || user.username;
            userEmailDisplay.textContent = user.email;
            usernameDisplay.textContent = user.username;
            userProfileWrapper.style.display = 'flex';
            authButtons.style.display = 'none';
        } else {
            userProfileWrapper.style.display = 'none';
            authButtons.style.display = 'flex';
        }
    }

    // Export/Import handlers with progress tracking
    const exportDataBtn = document.getElementById('export-data');
    const importDataBtn = document.getElementById('import-data');
    const progressBar = document.querySelector('.progress-bar .progress-fill');
    const statusText = document.querySelector('.status-text');
    const importExportStatus = document.querySelector('.import-export-status');

    exportDataBtn?.addEventListener('click', async () => {
        try {
            showLoading(exportDataBtn);
            importExportStatus.style.display = 'block';
            progressBar.style.width = '0%';
            statusText.textContent = 'Preparing data for export...';

            // Use the correct Excel export function (now available globally)
            const tasks = window.guestStorage ? window.guestStorage.getTasks() : [];
            window.exportTasksToExcel(tasks, 'tasks-export.xlsx');
            
            progressBar.style.width = '100%';
            statusText.textContent = 'Export complete!';
            showSuccess('Data exported successfully');
        } catch (error) {
            showError('Failed to export data: ' + error.message);
        } finally {
            hideLoading(exportDataBtn);
            setTimeout(() => {
                importExportStatus.style.display = 'none';
            }, 3000);
        }
    });

    // Import functionality is now handled in guest-app.js and dashboard-app.js
    // No need for duplicate handler here

    // Progress tracking for import/export
    function updateProgress(percent, message) {
        progressBar.style.width = `${percent}%`;
        if (message) {
            statusText.textContent = message;
        }
    }

    // Loading state handlers with animation
    function showLoading(button) {
        const loader = button.querySelector('.loader');
        const text = button.querySelector('.btn-text');
        if (loader && text) {
            loader.style.display = 'inline-block';
            text.style.visibility = 'hidden';
            button.disabled = true;
        }
    }

    function hideLoading(button) {
        const loader = button.querySelector('.loader');
        const text = button.querySelector('.btn-text');
        if (loader && text) {
            loader.style.display = 'none';
            text.style.visibility = 'visible';
            button.disabled = false;
        }
    }

    // Toast notification system
    function createToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icon = document.createElement('i');
        icon.className = `fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}`;
        
        const text = document.createElement('span');
        text.textContent = message;
        
        toast.appendChild(icon);
        toast.appendChild(text);
        
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => toast.classList.add('show'), 10);
        
        // Remove after delay
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Notification handlers
    function showSuccess(message) {
        createToast(message, 'success');
    }

    function showError(message) {
        createToast(message, 'error');
    }

    // Export functions for use in other modules
    window.headerUtils = {
        updateUserInfo,
        showLoading,
        hideLoading,
        showSuccess,
        showError,
        updateProgress
    };
});