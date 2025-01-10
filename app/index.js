import { renderLoading, unrenderLoading } from '/js/components/loading.js';
import { renderPopup, unrenderPopup } from '/js/components/popup.js';
import { verifyToken } from '/js/functions/user.js';

// Variables
var menus = null;

// Error handling
var error = false;

// On load
document.addEventListener('DOMContentLoaded', async function () {
  // Show loading
  renderLoading();

  // Check if the token is stored in the local storage
  const token = localStorage.getItem('token');
  if (!token) {
    unrenderLoading();
    renderPopup('⚠️ You are not logged in. Redirecting to login page.');
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

// Get menus
async function getMenus(token, errorTrigger) {
  // Create a payload for the API request
  const payload = {
    token,
  };

  try {
    // Send GET request to the get-menus serverless function
    const response = await fetch('/.netlify/functions/menu-get-menus', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    // Handle the response
    const result = await response.json();

    if (response.ok) {
      console.log('Menus:', result.menus);
      return result.menus;
    } else {
      // Handle errors
      errorTrigger = true;
      renderPopup(result.message || '⚠️ Something went wrong. Please try again.');
      // Refresh the page
      setTimeout(() => {
        window.location.reload();
      }, 2300);
    }
  } catch (error) {
    // Handle any network errors
    console.error('Error fetching menus:', error);
    renderPopup('⚠️ We\'re having internal problems. Please try again later.');
    // Go to the home page
    setTimeout(() => {
      window.location.href = '/';
    }, 2300);
  } finally {
    unrenderLoading();
    if (errorTrigger) {
      unrenderPopup(2000);
    }
  }
}