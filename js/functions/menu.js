import { renderPopup } from '/js/components/popup.js';
import { renderLoading, unrenderLoading } from '/js/components/loading.js';

// Get menus
async function getMenus(token) {
  // Render the loading animation
  renderLoading();

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
      return result.menus;
    } else {
      // Handle errors
      renderPopup(result.message || '⚠️ Something went wrong. Please try again.');
      // Refresh the page
      setTimeout(() => {
        window.location.reload();
      }, 2300);
    }
  } catch (error) {
    // Handle any network errors
    console.error('Error fetching menus:', error);
    renderPopup("⚠️ We're having internal problems. Please try again later.");
    // Go to the home page
    setTimeout(() => {
      window.location.href = '/';
    }, 2300);
  } finally {
    unrenderLoading();
  }
}

// Get menu
async function getMenu(token, menuId) {
  // Render the loading animation
  renderLoading();

  // Create a payload for the API request
  const payload = {
    token,
    menuId,
  };

  try {
    // Send GET request to the get-menu serverless function
    const response = await fetch('/.netlify/functions/menu-get-menu', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    // Handle the response
    const result = await response.json();

    if (response.ok) {
      return result.menu;
    } else {
      // Handle errors
      renderPopup(result.message || '⚠️ Something went wrong. Please try again.');
      // Refresh the page
      setTimeout(() => {
        window.location.reload();
      }, 2300);
    }
  } catch (error) {
    // Handle any network errors
    console.error('Error fetching menu:', error);
    renderPopup("⚠️ We're having internal problems. Please try again later.");
    // Go to the home page
    setTimeout(() => {
      window.location.href = '/';
    }, 2300);
  } finally {
    unrenderLoading();
  }
}

// Create a menu
async function createMenu(token, title) {
  // Render the loading animation
  renderLoading();

  // Create a payload for the API request
  const payload = {
    token,
    title,
  };

  try {
    // Send POST request to the create-menu serverless function
    const response = await fetch('/.netlify/functions/menu-create-menu', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    // Handle the response
    const result = await response.json();

    if (response.ok) {
      // Show a success message
      renderPopup(result.message || '✅ Menu created successfully.', 1000);
      // Redirect to the new menu
      setTimeout(() => {
        window.location.href = `/app/menu?id=${result.id}`;
      }, 1300);
    } else {
      // Handle errors
      renderPopup(result.message || '⚠️ Something went wrong. Please try again.');
      // Refresh the page
      setTimeout(() => {
        window.location.reload();
      }, 2300);
    }
  } catch (error) {
    // Handle any network errors
    console.error('Error creating a menu:', error);
    renderPopup("⚠️ We're having internal problems. Please try again later.");
    // Go to the home page
    setTimeout(() => {
      window.location.href = '/';
    }, 2300);
  } finally {
    unrenderLoading();
  }
}

async function updateMenu(token, menu) {
  // Render the loading animation
  renderLoading();

  // Create a payload for the API request
  const payload = {
    token,
    menu,
  };

  try {
    // Send POST request to the update-menu serverless function
    const response = await fetch('/.netlify/functions/menu-update-menu', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    // Handle the response
    const result = await response.json();

    if (response.ok) {
      // Show a success message
      renderPopup(result.message || '✅ Menu updated successfully.', 1000);
      return result;
    } else {
      // Handle errors
      renderPopup(result.message || '⚠️ Something went wrong. Please try again.');
      // Refresh the page
      setTimeout(() => {
        window.location.reload();
      }, 2300);
    }
  } catch (error) {
    // Handle any network errors
    console.error('Error updating a menu:', error);
    renderPopup("⚠️ We're having internal problems. Please try again later.");
    // Go to the home page
    setTimeout(() => {
      window.location.href = '/';
    }, 2300);
  } finally {
    unrenderLoading();
  }
}

export { getMenus, getMenu, createMenu, updateMenu };
