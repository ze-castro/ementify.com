// On page load update the year
document.addEventListener('DOMContentLoaded', () => {
  const year = document.getElementById('year');
  year.innerHTML = thisYear;
});

// Current year
const thisYear = new Date().getFullYear();
