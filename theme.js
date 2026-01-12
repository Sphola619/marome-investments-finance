/* ============================================
   DARK MODE TOGGLE
============================================ */

// Get stored theme preference or default to light
const getTheme = () => localStorage.getItem('theme') || 'light';

// Apply theme and update UI
const applyTheme = (theme) => {
  const body = document.body;
  const themeLabel = document.getElementById('themeLabel');
  const themeIcon = document.getElementById('themeIcon');
  
  if (theme === 'dark') {
    body.classList.add('dark-mode');
    
    // Update label and icon for LIGHT mode (what you'll switch TO)
    if (themeLabel) themeLabel.textContent = 'Light Mode';
    if (themeIcon) themeIcon.textContent = '☀️';
    
  } else {
    body.classList.remove('dark-mode');
    
    // Update label and icon for DARK mode (what you'll switch TO)
    if (themeLabel) themeLabel.textContent = 'Dark Mode';
    if (themeIcon) themeIcon.textContent = '🌙';
  }
  
  console.log(`🎨 Current theme: ${theme} mode`);
};

// Toggle theme
const toggleTheme = () => {
  const currentTheme = getTheme();
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  // Save to localStorage
  localStorage.setItem('theme', newTheme);
  
  // Apply new theme
  applyTheme(newTheme);
  
  console.log(`✨ Switched to:  ${newTheme} mode`);
};

// Initialize theme on page load
document.addEventListener('DOMContentLoaded', () => {
  // Check for saved theme preference
  let savedTheme = getTheme();
  
  // If no saved preference, check system preference
  if (!localStorage. getItem('theme')) {
    const prefersDark = window.matchMedia('(prefers-color-scheme:  dark)');
    savedTheme = prefersDark.matches ? 'dark' : 'light';
    localStorage.setItem('theme', savedTheme);
  }
  
  // Apply theme
  applyTheme(savedTheme);
  
  // Add click listener to toggle button
  const toggleButton = document.getElementById('themeToggle');
  if (toggleButton) {
    toggleButton.addEventListener('click', toggleTheme);
  }
});