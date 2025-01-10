import { renderPopup, unrenderPopup } from '/js/components/popup.js';
import { verifyToken } from '/js/functions/user.js';
import { getMenus } from '/js/functions/menu.js';

// Variables
var menus = null;

// Error handling
var error = false;

// On load
document.addEventListener('DOMContentLoaded', async function () {
  // Check if the token is stored in the local storage
  const token = localStorage.getItem('token');
  if (!token) {
    renderPopup('⚠️ You are not logged in. Redirecting to login page.');
    unrenderPopup(2000);
    setTimeout(() => {
      window.location.href = '/login';
    }, 2300);
    return;
  }

  // Verify the token
  await verifyToken(token, error);

  // Get menus
  menus = await getMenus(token, error);

  // Render the menus
  renderMenus(menus);
});

// Render the menus
const menusList = document.getElementById('menus-list');
function renderMenus(menus) {
  if (menus || menus.length > 0) {
    menus.forEach((menu) => {
      // Create a menu card
      const menuCard = document.createElement('div');
      menuCard.classList.add('menu');

      // Create a menu button with an icon
      const menuButton = document.createElement('button');
      const menuI = document.createElement('i');
      menuI.classList.add('fa', 'fa-bars');
      menuButton.appendChild(menuI);
      menuButton.addEventListener('click', () => {
        window.location.href = `/app/menu?id=${menu._id}`;
      });

      // Create a menu name
      const menuName = document.createElement('p');
      menuName.textContent = menu.title;

      // Append the menu button and name to the menu card
      menuCard.appendChild(menuButton);
      menuCard.appendChild(menuName);

      // Append the menu card to the menus list
      menusList.appendChild(menuCard);
    });
  }
}