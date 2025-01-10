import { isTokenInLocalStorage } from '/js/utils/isTokenInLocalStorage.js';
import { verifyToken } from '/js/functions/user.js';
import { getMenu } from '/js/functions/menu.js';

// Variables
var menu = null;

// Get the token from the local storage
const token = localStorage.getItem('token');

// On load
document.addEventListener('DOMContentLoaded', async function () {
  // Check if the token is stored in the local storage
  await isTokenInLocalStorage(token);

  // Get the menu ID from the URL
  const urlParams = new URLSearchParams(window.location.search);
  const menuId = urlParams.get('id');

  // Verify the token
  await verifyToken(token);

  // Get menu
  menu = await getMenu(token, menuId);

  // Render the menu
  console.log(menu);
  await populateMenu(menu);
});

// Populate the menu
async function populateMenu(menu) {
  // Get the menu title element
  const menuTitle = document.getElementById('menu-title');
  menuTitle.value = menu.title;

  // TODO: just for now, place the menu object into the code element
  const menuCode = document.getElementById('menu-code');
  menuCode.innerText = JSON.stringify(menu, null, 2);
}
