document.addEventListener('DOMContentLoaded', () => {
  AOS.init({ duration: 800, once: true });

  // Navbar toggle
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    navToggle.querySelector('i').classList.toggle('fa-bars');
    navToggle.querySelector('i').classList.toggle('fa-times');
  });

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Demo tabs
  const demoTabs = document.querySelectorAll('.demo-tab');
  const demoWindow = document.querySelector('.demo-window .demo-preview');
  const demoContent = {
    list: `
      <div class="demo-list-view">
        <div class="demo-task">
          <input type="checkbox" checked>
          <span>Prepare project presentation</span>
          <span class="demo-tag high-priority">High Priority</span>
        </div>
        <div class="demo-task">
          <input type="checkbox">
          <span>Review team feedback</span>
          <span class="demo-tag in-progress">In Progress</span>
        </div>
        <div class="demo-task">
          <input type="checkbox">
          <span>Update documentation</span>
          <span class="demo-tag in-progress">In Progress</span>
        </div>
        <div class="demo-task">
          <input type="checkbox" checked>
          <span>Schedule team meeting</span>
          <span class="demo-tag high-priority">High Priority</span>
        </div>
      </div>
    `,
    kanban: `
      <div class="demo-kanban">
        <div class="demo-column">
          <h4><i class="fas fa-circle" style="color: #f59e0b"></i> To Do</h4>
          <div>Design new dashboard</div>
          <div>Write unit tests</div>
          <div>Review PRs</div>
        </div>
        <div class="demo-column">
          <h4><i class="fas fa-circle" style="color: #3b82f6"></i> In Progress</h4>
          <div>Implement API endpoints</div>
          <div>Update components</div>
        </div>
        <div class="demo-column">
          <h4><i class="fas fa-circle" style="color: #22c55e"></i> Done</h4>
          <div>Setup CI/CD pipeline</div>
          <div>Database migration</div>
          <div>Security audit</div>
        </div>
      </div>
    `,
    calendar: `
      <div class="demo-calendar">
        <div style="background: var(--primary); color: white; font-weight: 600;">Mon</div>
        <div style="background: var(--primary); color: white; font-weight: 600;">Tue</div>
        <div style="background: var(--primary); color: white; font-weight: 600;">Wed</div>
        <div style="background: var(--primary); color: white; font-weight: 600;">Thu</div>
        <div style="background: var(--primary); color: white; font-weight: 600;">Fri</div>
        <div style="background: var(--primary); color: white; font-weight: 600;">Sat</div>
        <div style="background: var(--primary); color: white; font-weight: 600;">Sun</div>
        <div>1</div>
        <div style="background: #fef3c7;">2 <i class="fas fa-circle" style="color: #d97706; font-size: 0.5rem;"></i></div>
        <div>3</div>
        <div style="background: #fee2e2;">4 <i class="fas fa-circle" style="color: #dc2626; font-size: 0.5rem;"></i></div>
        <div>5</div>
        <div>6</div>
        <div>7</div>
        <div>8</div>
        <div style="background: #dcfce7;">9 <i class="fas fa-circle" style="color: #22c55e; font-size: 0.5rem;"></i></div>
        <div>10</div>
        <div>11</div>
        <div style="background: #fef3c7;">12 <i class="fas fa-circle" style="color: #d97706; font-size: 0.5rem;"></i></div>
        <div>13</div>
        <div>14</div>
      </div>
    `
  };

  demoTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      demoTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      demoWindow.innerHTML = demoContent[tab.dataset.view];
    });
  });

  // Initialize demo with list view
  demoWindow.innerHTML = demoContent.list;

  // FAQ accordion
  document.querySelectorAll('.faq-item').forEach(item => {
    item.addEventListener('click', () => {
      item.classList.toggle('active');
    });
  });

  // Stats animation
  const stats = document.querySelectorAll('.hero-stats .number, .cta-metrics .metric-value');
  const animateStats = () => {
    stats.forEach(stat => {
      const target = parseInt(stat.textContent.replace(/[^0-9]/g, '')) || 0;
      let current = 0;
      const increment = target / 50;
      const updateCount = () => {
        if (current < target) {
          current += increment;
          stat.textContent = Math.ceil(current) + (stat.textContent.includes('%') ? '%' : stat.textContent.includes('K+') ? 'K+' : '');
          requestAnimationFrame(updateCount);
        } else {
          stat.textContent = stat.textContent.includes('%') ? `${target}%` : stat.textContent.includes('K+') ? `${target}K+` : target;
        }
      };
      updateCount();
    });
  };

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
});