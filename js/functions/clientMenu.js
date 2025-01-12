import { renderPopup } from '/js/components/popup.js';
import { renderLoading, unrenderLoading } from '/js/components/loading.js';

// Get menu
async function getMenuClient(menuId) {
  // Render the loading animation
  renderLoading();

  // Create a payload for the API request
  const payload = {
    menuId,
  };

  try {
    // Send GET request to the get-menu serverless function
    const response = await fetch('/.netlify/functions/menu-get-menu-client', {
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
        window.location.href = '/';
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

export { getMenuClient };
