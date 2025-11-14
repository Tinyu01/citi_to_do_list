// Shared Footer Component Injection
(function () {
  function buildFooterHTML() {
    const year = new Date().getFullYear();
    return (
      '<footer>' +
      '  <div class="footer-wave">' +
      '    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">' +
      '      <path fill="rgba(255,255,255,0.1)" d="M0,96L48,112C96,128,192,160,288,186.7C384,213,480,235,576,213.3C672,192,768,128,864,128C960,128,1056,192,1152,202.7C1248,213,1344,171,1392,149.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>' +
      '    </svg>' +
      '  </div>' +
      '  <div class="footer-container">' +
      `    <p>TaskFlow &copy; <span id="current-year">${year}</span> | Designed by <a href="https://tinyu01.github.io/citi_portfolio_website/" target="_blank" rel="noopener noreferrer">MASINGITA OTTIS MALULEKE</a> with <i class="fas fa-heart"></i></p>` +
      '    <div class="footer-links">' +
      '      <a href="https://tinyu01.github.io/citi_portfolio_website/about.html" target="_blank" rel="noopener noreferrer">About</a>' +
      '      <a href="#" rel="noopener">Privacy Policy</a>' +
      '      <a href="https://tinyu01.github.io/citi_portfolio_website/contact.html" target="_blank" rel="noopener noreferrer">Contact</a>' +
      '    </div>' +
      '    <div class="footer-social">' +
      '      <a href="https://github.com/Tinyu01" target="_blank" rel="noopener noreferrer" aria-label="GitHub"><i class="fab fa-github"></i></a>' +
      '      <a href="https://www.linkedin.com/in/thefreelancer201/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><i class="fab fa-linkedin"></i></a>' +
      '      <a href="https://x.com/TheFreelancer20" target="_blank" rel="noopener noreferrer" aria-label="Twitter/X"><i class="fab fa-twitter"></i></a>' +
      '    </div>' +
      '  </div>' +
      '</footer>'
    );
  }

  function injectFooter() {
    // Avoid duplicating if already injected
    if (document.querySelector('footer .footer-container')) return;

    const mount = document.getElementById('app-footer');
    const html = buildFooterHTML();

    if (mount) {
      mount.outerHTML = html;
    } else {
      const temp = document.createElement('div');
      temp.innerHTML = html;
      document.body.appendChild(temp.firstChild);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectFooter);
  } else {
    injectFooter();
  }
})();