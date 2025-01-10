import { renderPopup, unrenderPopup } from '/js/components/popup.js';
import { renderLoading, unrenderLoading } from '/js/components/loading.js';

// Verify the token
async function verifyToken(token) {
  // Popup trigger
  var popupTrigger = false;

  // Render the loading animation
  renderLoading();

  // Create a payload for the API request
  const payload = {
    token,
  };

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
      // Handle errors
      popupTrigger = true;
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
    popupTrigger = true;
    console.error('Error validating the token:', error);
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

export { verifyToken };
