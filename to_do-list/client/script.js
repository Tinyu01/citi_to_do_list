
// content of index.js
document.addEventListener('DOMContentLoaded', function () {
  const themeSelect = document.getElementById('theme-select');
  const body = document.body;

  // Function to set the theme
  function setTheme(theme) {
    body.className = ''; // Reset all theme classes
    body.classList.add(`theme-${theme}`);
    localStorage.setItem('theme', theme);
  }

  // Load saved theme from localStorage
  const savedTheme = localStorage.getItem('theme') || 'light';
  setTheme(savedTheme);
  themeSelect.value = savedTheme;

  // Event listener for theme change
  themeSelect.addEventListener('change', function () {
    setTheme(this.value);
  });

  // Additional theme-related functionality can be added here
});

// Function to apply theme to the modal
function applyThemeToModal(theme) {
  const modal = document.getElementById('task-details-modal');
  modal.classList.remove('theme-dark', 'theme-sunset', 'theme-forest', 'theme-ocean');
  if (theme !== 'light') {
    modal.classList.add(`theme-${theme}`);
  }
}

// Event listener for theme change
document.getElementById('theme-select').addEventListener('change', function() {
  const selectedTheme = this.value;
  applyThemeToModal(selectedTheme);
});

// Function to open the modal
function openTaskDetailsModal() {
  const modal = document.getElementById('task-details-modal');
  modal.style.display = 'flex';
  applyThemeToModal(document.getElementById('theme-select').value);
}

// Function to close the modal
function closeTaskDetailsModal() {
  const modal = document.getElementById('task-details-modal');
  modal.style.display = 'none';
}

// Event listeners for opening and closing the modal
document.querySelectorAll('.task-item').forEach(item => {
  item.addEventListener('click', openTaskDetailsModal);
});

document.querySelector('.close-modal').addEventListener('click', closeTaskDetailsModal);
document.querySelector('.modal').addEventListener('click', function(event) {
  if (event.target === this) {
    closeTaskDetailsModal();
  }
});

// Function to apply the selected theme
function applyTheme(theme) {
  document.documentElement.className = ''; // Reset all theme classes
  document.documentElement.classList.add(`theme-${theme}`);
  localStorage.setItem('theme', theme);
}

// Function to initialize the theme from localStorage
function initializeTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  applyTheme(savedTheme);
  document.getElementById('theme-preference').value = savedTheme;
}

// Event listener for theme selection
document.getElementById('theme-preference').addEventListener('change', (e) => {
  applyTheme(e.target.value);
});

// Initialize theme on page load
initializeTheme();

// Modal open/close functionality
const modal = document.getElementById('settings-modal');
const openModalBtn = document.getElementById('settings-btn');
const closeModalBtn = document.querySelector('.close-modal');

openModalBtn.addEventListener('click', () => {
  modal.style.display = 'flex';
  setTimeout(() => {
    modal.querySelector('.modal-content').classList.add('active');
  }, 10);
});

closeModalBtn.addEventListener('click', () => {
  modal.querySelector('.modal-content').classList.remove('active');
  setTimeout(() => {
    modal.style.display = 'none';
  }, 300);
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.querySelector('.modal-content').classList.remove('active');
    setTimeout(() => {
      modal.style.display = 'none';
    }, 300);
  }
});

/* Fooeter Script */
document.addEventListener('DOMContentLoaded', function() {
  // Set current year
  document.getElementById('current-year').textContent = new Date().getFullYear();
  
  // Theme switcher
  const themeSelect = document.getElementById('theme-select');
  const settingsThemePreference = document.getElementById('theme-preference');
  
  // Function to update theme
  function updateTheme(theme) {
    document.body.className = '';
    document.body.classList.add(`theme-${theme}`);
    
    // Update footer appearance based on theme
    const footer = document.querySelector('footer');
    
    // Apply theme-specific gradient animations
    switch(theme) {
      case 'dark':
        footer.style.setProperty('--footer-accent', 'var(--dark-accent)');
        break;
      case 'sunset':
        footer.style.setProperty('--footer-accent', 'var(--sunset-accent)');
        break;
      case 'forest':
        footer.style.setProperty('--footer-accent', 'var(--forest-accent)');
        break;
      case 'ocean':
        footer.style.setProperty('--footer-accent', 'var(--ocean-accent)');
        break;
      default:
        footer.style.setProperty('--footer-accent', 'var(--light-accent)');
    }
    
    // Save theme preference
    localStorage.setItem('theme', theme);
  }
  
  // Apply theme from localStorage
  const savedTheme = localStorage.getItem('theme') || 'light';
  updateTheme(savedTheme);
  
  // Update select elements to match saved theme
  if (themeSelect) {
    themeSelect.value = savedTheme;
  }
  
  if (settingsThemePreference) {
    settingsThemePreference.value = savedTheme;
  }
  
  // Listen for theme changes
  if (themeSelect) {
    themeSelect.addEventListener('change', function() {
      updateTheme(this.value);
      
      // Update settings theme preference to match
      if (settingsThemePreference) {
        settingsThemePreference.value = this.value;
      }
    });
  }
  
  // Listen for theme changes from settings
  if (settingsThemePreference) {
    settingsThemePreference.addEventListener('change', function() {
      updateTheme(this.value);
      
      // Update header theme selector to match
      if (themeSelect) {
        themeSelect.value = this.value;
      }
    });
  }
  
  // Apply smooth scroll to footer links
  document.querySelectorAll('.footer-links a').forEach(link => {
    link.addEventListener('click', function(e) {
      // Only apply if the href points to a section on the page
      const href = this.getAttribute('href');
      if (href.startsWith('#') && href.length > 1) {
        e.preventDefault();
        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth'
          });
        }
      }
    });
  });
  
  // Add subtle animation to footer on scroll
  window.addEventListener('scroll', function() {
    const footer = document.querySelector('footer');
    const footerPosition = footer.getBoundingClientRect().top;
    const windowHeight = window.innerHeight;
    
    if (footerPosition < windowHeight) {
      // Footer is in view
      const scrollProgress = (windowHeight - footerPosition) / windowHeight;
      const clampedProgress = Math.min(scrollProgress, 1);
      
      // Apply subtle animation
      footer.style.transform = `translateY(${(1 - clampedProgress) * 10}px)`;
      footer.style.opacity = 0.5 + (0.5 * clampedProgress);
    }
  });
});