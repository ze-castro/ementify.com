import { isTokenInLocalStorage } from '/js/utils/isTokenInLocalStorage.js';
import { verifyToken } from '/js/functions/user.js';
import { getMenus, createMenu } from '/js/functions/menu.js';

// Variables
var menus = null;

// Get the token from the local storage
const token = localStorage.getItem('token');

// On load
document.addEventListener('DOMContentLoaded', async function () {
  // Check if the token is stored in the local storage
  await isTokenInLocalStorage(token);

  // Verify the token
  await verifyToken(token);

  // Get menus
  menus = await getMenus(token);

  // Render the menus
  const menusList = document.getElementById('menus-list');
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
});


// On Add Menu button click
const addMenuForm = document.getElementById('add-menu-form');
addMenuForm.addEventListener('submit', async function (event) {
  // Prevent the default form submission
  event.preventDefault();

  // Get the form data
  const form = new FormData(addMenuForm);
  const title = form.get('title');

  // Create a new menu
  await createMenu(token, title);
});
