const themeToggle = document.getElementById('theme-toggle');

// Check for saved theme preference or default to light mode
const currentTheme = localStorage.getItem('theme') || 'light';
if (currentTheme === 'dark') {
  document.body.classList.add('dark-mode');
  themeToggle.textContent = 'Light Mode';
}

// Listen for theme toggle button clicks
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  
  // Update button text and save preference
  if (document.body.classList.contains('dark-mode')) {
    themeToggle.textContent = 'Light Mode';
    localStorage.setItem('theme', 'dark');
  } else {
    themeToggle.textContent = 'Dark Mode';
    localStorage.setItem('theme', 'light');
  }
});
