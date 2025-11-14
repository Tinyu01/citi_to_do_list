// Auth State Management

let currentUser = null;
let authToken = localStorage.getItem('authToken');
const API_BASE_URL = window.appConfig.apiUrl;

// DOM Elements
const authButtons = document.getElementById('auth-buttons');
const userProfileBtn = document.getElementById('user-profile');
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const loginModal = document.getElementById('login-modal');
const signupModal = document.getElementById('signup-modal');
const userProfileModal = document.getElementById('user-profile-modal');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const logoutBtn = document.getElementById('logout-btn');
const guestLoginBtn = document.getElementById('guest-login');
const switchToSignup = document.getElementById('switch-to-signup');
const switchToLogin = document.getElementById('switch-to-login');
const profileForm = document.getElementById('profile-form');

// Modal Management
function showModal(modal) {
  if (!modal) return;
  const allModals = document.querySelectorAll('.modal');
  allModals.forEach(m => m.classList.remove('show'));
  modal.classList.add('show');
}

function closeAllModals() {
  const allModals = document.querySelectorAll('.modal');
  allModals.forEach(modal => modal.classList.remove('show'));
}

// Handle successful authentication
async function handleAuthSuccess(token, user) {
  authToken = token;
  currentUser = user;
  localStorage.setItem('authToken', token);

  // Check if there's guest data to migrate
  if (window.guestStorage && window.guestStorage.getTasks().length > 0) {
    const shouldMigrate = confirm(
      'Would you like to migrate your existing tasks and categories to your new account?'
    );
    if (shouldMigrate) {
      await window.migrationUtils.migrateGuestData(token);
    } else {
      window.guestStorage.clearAll();
    }
  }

  // Update UI and reload data
  updateAuthUI();
  document.dispatchEvent(new CustomEvent('authStateChanged', {
    detail: { isAuthenticated: true, user }
  }));

  // Redirect to dashboard/main app
  window.location.href = 'dashboard.html';
}

// Update UI based on auth state

function updateAuthUI() {
  const isAuthenticated = !!authToken;

  if (authButtons) {
    authButtons.style.display = isAuthenticated ? 'none' : 'flex';
  }

  if (userProfileBtn) {
    userProfileBtn.style.display = isAuthenticated ? 'flex' : 'none';
    if (isAuthenticated && currentUser) {
      const usernameElem = userProfileBtn.querySelector('.username');
      if (usernameElem) usernameElem.textContent = currentUser.name;
    }
  }
}

// Form Submissions
if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = {
      username: document.getElementById('signup-username').value,
      email: document.getElementById('signup-email').value,
      password: document.getElementById('signup-password').value,
      name: document.getElementById('signup-name').value || undefined
    };

    try {
      await signupUser(formData);
    } catch (error) {
      console.error('Signup failed:', error);
    }
  });
}

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = {
      email: document.getElementById('login-email').value,
      password: document.getElementById('login-password').value,
      remember: document.getElementById('remember-me').checked
    };

    try {
      await loginUser(formData);
    } catch (error) {
      console.error('Login failed:', error);
    }
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    updateAuthUI();
    document.dispatchEvent(new CustomEvent('authStateChanged', {
      detail: { isAuthenticated: false }
    }));
    showToast('You have been logged out', 'info');
  });
}

// Password visibility toggle
document.querySelectorAll('.password-toggle').forEach(button => {
  button.addEventListener('click', (e) => {
    const input = e.target.closest('.form-group').querySelector('input');
    const icon = e.target.querySelector('i') || e.target;
    if (input.type === 'password') {
      input.type = 'text';
      icon.classList.remove('fa-eye');
      icon.classList.add('fa-eye-slash');
    } else {
      input.type = 'password';
      icon.classList.remove('fa-eye-slash');
      icon.classList.add('fa-eye');
    }
  });
});

// Social login buttons
document.querySelectorAll('.social-btn').forEach(button => {
  button.addEventListener('click', async () => {
    const provider = button.classList.contains('google') ? 'google' : 'github';
    try {
      window.location.href = `${API_BASE_URL}/api/auth/${provider}`;
    } catch (error) {
      showToast(`${provider} login failed`, 'error');
    }
  });
});

// Close all modals when clicking outside
window.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal')) {
    closeAllModals();
  }
});

// API Calls

async function signupUser(userData) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create account');
    }

    await handleAuthSuccess(data.token, data.user);
    closeAllModals();
    showToast('Account created successfully!', 'success');
    return data;
  } catch (error) {
    const errorElem = document.getElementById('signup-error');
    if (errorElem) {
      errorElem.querySelector('.error-message').textContent = error.message;
      errorElem.style.display = 'flex';
    }
    throw error;
  }
}

async function loginUser(credentials) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Invalid credentials');
    }

    await handleAuthSuccess(data.token, data.user);
    closeAllModals();
    showToast('Welcome back!', 'success');
    return data;
  } catch (error) {
    const errorElem = document.getElementById('login-error');
    if (errorElem) {
      errorElem.querySelector('.error-message').textContent = error.message;
      errorElem.style.display = 'flex';
    }
    throw error;
  }
}

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
    <span>${message}</span>
  `;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }, 100);
}

async function updateProfile(updates) {
  try {
    const response = await fetch('http://localhost:5000/api/auth/profile', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(updates),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message);
    }

    currentUser = data.user;
    closeAllModals();
    showToast('Profile updated successfully!');
  } catch (error) {
    document.getElementById('profile-error').textContent = error.message;
  }
}

async function logout() {
  currentUser = null;
  authToken = null;
  localStorage.removeItem('authToken');
  updateAuthUI();
  closeAllModals();
  showToast('Logged out successfully!');
  window.location.href = 'landing.html';
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  // Login form submission
  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    await loginUser({ email, password });
  });

  // Signup form submission
  signupForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('signup-username').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const name = document.getElementById('signup-name').value;
    await signupUser({ username, email, password, name });
  });

  // Switch between login and signup
  switchToSignup?.addEventListener('click', (e) => {
    e.preventDefault();
    showModal(signupModal);
  });

  switchToLogin?.addEventListener('click', (e) => {
    e.preventDefault();
    showModal(loginModal);
  });

  // Profile form submission
  profileForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('profile-name').value;
    const email = document.getElementById('profile-email').value;
    const password = document.getElementById('profile-password').value;
    const updates = { name, email };
    if (password) updates.password = password;
    await updateProfile(updates);
  });

  // Logout button
  logoutBtn?.addEventListener('click', logout);

  // Guest login
  guestLoginBtn?.addEventListener('click', async () => {
    try {
      const response = await fetch('http://localhost:5000/api/tasks', {
        method: 'GET'
      });
      // Only need to check for guest token, no need to use 'data'
      if (response.headers.has('X-Guest-Token')) {
        const guestToken = response.headers.get('X-Guest-Token');
        localStorage.setItem('authToken', guestToken);
        authToken = guestToken;
        currentUser = { isGuest: true };
        updateAuthUI();
        closeAllModals();
        showToast('Logged in as guest', 'success');
      }
    } catch (error) {
      document.getElementById('login-error').textContent = 'Failed to create guest session';
    }
  });
});

// Event Listeners
loginBtn.addEventListener('click', () => showModal(loginModal));
signupBtn.addEventListener('click', () => showModal(signupModal));
userProfileBtn.addEventListener('click', () => {
  showModal(userProfileModal);
  // Fill profile form with current user data
  if (currentUser) {
    document.getElementById('profile-name').value = currentUser.name || '';
    document.getElementById('profile-email').value = currentUser.email || '';
    document.getElementById('profile-username').value = currentUser.username || '';
  }
});

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

// Initialize auth state
updateAuthUI();

// Check auth token on page load
if (authToken) {
  fetch('http://localhost:5000/api/auth/profile', {
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  })
  .then(response => response.json())
  .then(data => {
    if (data.user) {
      currentUser = data.user;
      updateAuthUI();
    } else {
      localStorage.removeItem('authToken');
    }
  })
  .catch(() => {
    localStorage.removeItem('authToken');
  });
}