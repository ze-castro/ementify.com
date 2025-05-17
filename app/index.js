import { isTokenInLocalStorage } from '/js/utils/isTokenInLocalStorage.js';
import { getMenus, createMenu } from '/js/functions/menu.js';
import { renderContextMenu } from '/js/components/context-menu.js';

// Variables
var menus = null;

// Get the token from the local storage
const token = localStorage.getItem('token');

// On load
document.addEventListener('DOMContentLoaded', async function () {
  // Check if the token is stored in the local storage
  await isTokenInLocalStorage(token);

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
      menuButton.innerHTML += menu.title;
      menuButton.addEventListener('click', () => {
        window.location.href = `/app/menu?id=${menu._id}`;
      });

      // Append the menu button to the menu card
      menuCard.appendChild(menuButton);

      // Append the menu card to the menus list
      menusList.appendChild(menuCard);
    });
  }
});

// Add event listener to the options button
const optionsButton = document.getElementById('options-button');
optionsButton.addEventListener('click', async function () {
  // Render the context menu
  await renderContextMenu();
});

// Add event listener to the profile button
const profileButton = document.getElementById('profile-button');
profileButton.addEventListener('click', async function () {
  window.location.href = '/app/profile';
});

// Add event listener to the bug button
const bugButton = document.getElementById('bug-button');
bugButton.addEventListener('click', async function () {
  window.location.href = 'mailto:info@ementify.com?subject=Report a bug';
});

// Add event listener to the sign out button
const signOutButton = document.getElementById('sign-out-button');
signOutButton.addEventListener('click', async function () {
  // Remove the token from the local storage
  localStorage.removeItem('token');
  // Redirect to the home page
  window.location.href = '/';
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
