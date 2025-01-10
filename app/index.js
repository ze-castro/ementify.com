import { renderLoading, unrenderLoading } from '../js/components/loading.js';
import { renderPopup, unrenderPopup } from '../js/components/popup.js';

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

  // Create a payload for the API requests
  const payload = {
    token,
  };

  // Verify the token
  await verifyToken(payload);

  // Get menus
  menus = await getMenus(payload);

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
      menuCard.appendChild(menuName);
      menuCard.appendChild(menuButton);

      // Append the menu card to the menus list
      menusList.appendChild(menuCard);
    });
  }
}

// Get menus
async function getMenus(payload) {
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
      return result.menus;
    } else {
      // Handle errors
      error = true;
      renderPopup(result.message || '⚠️ Something went wrong. Please try again.');
      // Refresh the page
      setTimeout(() => {
        window.location.reload();
      }, 2300);
    }
  } catch (error) {
    // Handle any network errors
    console.error('Error fetching menus:', error);
    renderPopup('An error occurred. Please try again.');
    // Refresh the page
    // setTimeout(() => {
    //   window.location.reload();
    // }, 2300);
  } finally {
    unrenderLoading();
    if (error) {
      unrenderPopup(2000);
    }
  }
}

// Verify the token
async function verifyToken(payload) {
  try {
    // Send POST request to the verify-token serverless function
    const response = await fetch('/.netlify/functions/verify-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    // Handle the response
    const result = await response.json();

    if (!response.ok) {
      error = true;
      // Handle errors
      renderPopup(result.message || '⚠️ Something went wrong. Please log in again.');
      // Delete the token
      localStorage.removeItem('token');
      // Redirect to login page
      setTimeout(() => {
        window.location.href = '/login';
      }, 2300);
    }
  } catch (error) {
    // Handle any network errors
    error = true;
    console.error('Error validating the token:', error);
    renderPopup('An error occurred. Please try again.');
  } finally {
    if (error) {
      unrenderLoading();
      unrenderPopup(2000);
    }
  }
}
