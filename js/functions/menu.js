import { renderPopup, unrenderPopup } from '/js/components/popup.js';
import { renderLoading, unrenderLoading } from '/js/components/loading.js';

// Get menus
async function getMenus(token) {
  // Popup trigger
  var popupTrigger = false;

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
      popupTrigger = true;
      renderPopup(result.message || '⚠️ Something went wrong. Please try again.');
      // Refresh the page
      setTimeout(() => {
        window.location.reload();
      }, 2300);
    }
  } catch (error) {
    // Handle any network errors
    popupTrigger = true;
    console.error('Error fetching menus:', error);
    renderPopup("⚠️ We're having internal problems. Please try again later.");
    // Go to the home page
    setTimeout(() => {
      window.location.href = '/';
    }, 2300);
  } finally {
    unrenderLoading();
    if (popupTrigger) unrenderPopup(2000);
  }
}

export { getMenus };
