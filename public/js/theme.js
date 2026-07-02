// This file runs on every page (included in footer.ejs)
// It reads the saved theme from localStorage and toggles it when the button is clicked

const themeBtn = document.getElementById('theme-toggle');
const body = document.body;

// Update the button emoji to match the current theme
function updateBtn() {
  const isDark = body.classList.contains('dark-mode');
  themeBtn.textContent = isDark ? '☀️' : '🌙';
}

// Run once on load to set the correct button icon
updateBtn();

// When the button is clicked, flip the theme and save the choice
themeBtn.addEventListener('click', () => {
  const isDark = body.classList.contains('dark-mode');

  if (isDark) {
    body.classList.remove('dark-mode');
    body.classList.add('light-mode');
    localStorage.setItem('theme', 'light');
  } else {
    body.classList.remove('light-mode');
    body.classList.add('dark-mode');
    localStorage.setItem('theme', 'dark');
  }

  updateBtn();
});
