// Landing Page Interactions
document.addEventListener('DOMContentLoaded', () => {
    // Initialize AOS (Animate on Scroll)
    AOS.init({
        duration: 800,
        easing: 'ease-out',
        once: true
    });

    // Demo View Tabs Functionality
    const demoTabs = document.querySelectorAll('.demo-tab');
    const demoWindow = document.querySelector('.demo-window');

    // Sample demo content for each view
    const demoContent = {
        list: `
            <div class="demo-list-view">
                <div class="demo-task">
                    <input type="checkbox" checked>
                    <span>Prepare project presentation</span>
                    <span class="demo-tag">High Priority</span>
                </div>
                <div class="demo-task">
                    <input type="checkbox">
                    <span>Review team feedback</span>
                    <span class="demo-tag">In Progress</span>
                </div>
                <!-- More demo tasks -->
            </div>
        `,
        kanban: `
            <div class="demo-kanban">
                <div class="demo-column">
                    <h4>To Do</h4>
                    <!-- Demo cards -->
                </div>
                <div class="demo-column">
                    <h4>In Progress</h4>
                    <!-- Demo cards -->
                </div>
                <div class="demo-column">
                    <h4>Done</h4>
                    <!-- Demo cards -->
                </div>
            </div>
        `,
        calendar: `
            <div class="demo-calendar">
                <!-- Demo calendar content -->
            </div>
        `
    };

    demoTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            demoTabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            tab.classList.add('active');
            
            // Update demo content
            const view = tab.dataset.view;
            demoWindow.innerHTML = demoContent[view];
        });
    });

    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Animated stats counter
    const stats = document.querySelectorAll('.stat .number');
    const animateStats = () => {
        stats.forEach(stat => {
            const target = parseInt(stat.textContent);
            let current = 0;
            const increment = target / 50; // Adjust for animation speed
            const updateCount = () => {
                if (current < target) {
                    current += increment;
                    stat.textContent = Math.ceil(current);
                    requestAnimationFrame(updateCount);
                } else {
                    stat.textContent = target;
                }
            };
            updateCount();
        });
    };

    // Intersection Observer for Stats Animation
    const statsSection = document.querySelector('.hero-stats');
    if (statsSection) {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        animateStats();
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.5 }
        );
        observer.observe(statsSection);
    }

    // Navbar scroll behavior
    const nav = document.querySelector('nav');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll <= 0) {
            nav.classList.remove('scroll-up');
            return;
        }
        
        if (currentScroll > lastScroll && !nav.classList.contains('scroll-down')) {
            nav.classList.remove('scroll-up');
            nav.classList.add('scroll-down');
        } else if (currentScroll < lastScroll && nav.classList.contains('scroll-down')) {
            nav.classList.remove('scroll-down');
            nav.classList.add('scroll-up');
        }
        lastScroll = currentScroll;
    });

    // Handle sign up and login redirects
    const signupButtons = document.querySelectorAll('a[href*="action=signup"]');
    const loginButtons = document.querySelectorAll('a[href*="action=login"]');

    signupButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            sessionStorage.setItem('showModal', 'signup');
            window.location.href = btn.href;
        });
    });

    loginButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            sessionStorage.setItem('showModal', 'login');
            window.location.href = btn.href;
        });
    });
});