document.addEventListener('DOMContentLoaded', () => {
  const chartContainer = document.querySelector('.chart-container');
  if (!chartContainer) return;

  const ctx = document.getElementById('task-completion-chart');
  if (!ctx) return;

  // Set a minimum height for the canvas
  ctx.style.minHeight = '300px';
  ctx.height = 300;

  let productivityChart = null;
  const chartControls = document.querySelectorAll('.chart-btn');

  // Function to initialize/update the chart
  function updateChart(timeRange = 'weekly') {
    // Dispatch an event to request productivity data from the main app
    const event = new CustomEvent('requestProductivityData', {
      detail: { timeRange }
    });
    document.dispatchEvent(event);
  }

  // Function to render the chart with data
  function renderChart(data) {
    if (productivityChart) {
      productivityChart.destroy();
    }

    productivityChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [
          {
            label: 'Tasks Completed',
            data: data.completed,
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            borderWidth: 2,
            tension: 0.3,
            fill: true
          },
          {
            label: 'Tasks Created',
            data: data.created,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderWidth: 2,
            tension: 0.3,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: getComputedStyle(document.body).getPropertyValue('--text')
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: getComputedStyle(document.body).getPropertyValue('--text-secondary')
            },
            grid: {
              color: getComputedStyle(document.body).getPropertyValue('--border')
            }
          },
          x: {
            ticks: {
              color: getComputedStyle(document.body).getPropertyValue('--text-secondary')
            },
            grid: {
              color: getComputedStyle(document.body).getPropertyValue('--border')
            }
          }
        }
      }
    });
  }

  // Handle chart control clicks
  chartControls.forEach(control => {
    control.addEventListener('click', () => {
      chartControls.forEach(btn => btn.classList.remove('active'));
      control.classList.add('active');
      updateChart(control.dataset.chart);
    });
  });

  // Listen for data responses
  document.addEventListener('productivityDataResponse', (e) => {
    renderChart(e.detail.data);
  });

  // Initialize with weekly view
  updateChart();
});
