/**
 * ui.js
 * ----------------------------------------------------
 * Handles global UI micro-interactions:
 * - Navbar scroll shrink
 * - Scroll reveal animations
 * - Dark mode toggle
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbarScroll();
  initScrollReveal();
  initThemeToggle();
});

// 1. Navbar Scroll Effect
function initNavbarScroll() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });
}

// 2. Scroll Reveal Animations
function initScrollReveal() {
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // We add 'reveal-item' to elements in HTML that we want to animate in
  document.querySelectorAll('.reveal-item').forEach((el, index) => {
    // Add staggered delay based on DOM order for grid items
    el.style.transitionDelay = `${(index % 5) * 60}ms`;
    observer.observe(el);
  });
}

// 3. Dark Mode Toggle
function initThemeToggle() {
  // Try to find an existing toggle button, or create one if it doesn't exist in the nav
  let themeBtn = document.getElementById('themeToggleBtn');
  
  const currentTheme = localStorage.getItem('theme') || 'light';
  if (currentTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  }

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const theme = document.documentElement.getAttribute('data-theme');
      if (theme === 'dark') {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
      } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
      }
    });
  }
}
