import { renderPopup } from '/js/components/popup.js';
import { renderLoading, unrenderLoading } from '/js/components/loading.js';

// Get user
async function getUser(token) {
  // Render the loading animation
  renderLoading();

  // Create a payload for the API request
  const payload = {
    token,
  };

  try {
    // Send POST request to the get-user serverless function
    const response = await fetch('/.netlify/functions/user-get-user', {
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
      renderPopup(result.message || '⚠️ Something went wrong. Please log in again.');
      // Delete the token
      localStorage.removeItem('token');
      // Redirect to login page
      setTimeout(() => {
        window.location.href = '/login';
      }, 2300);
    }

    return result;
  } catch (error) {
    // Handle any network errors
    console.error('Error getting the user:', error);
    renderPopup("⚠️ We're having internal problems. Please try again later.");
    // Go to the home page
    setTimeout(() => {
      window.location.href = '/';
    }, 2300);
  } finally {
    unrenderLoading();
  }
}

// Update user
async function updateUser(token, userData) {
  // Render the loading animation
  renderLoading();

  // Create a payload for the API request
  const payload = {
    token,
    userData,
  };

  try {
    // Send POST request to the update-user serverless function
    const response = await fetch('/.netlify/functions/user-update-user', {
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
      renderPopup(result.message || '⚠️ Something went wrong. Please try again.');
      // Refresh the page
      setTimeout(() => {
        window.location.href = '/';
      }, 2300);
    } else {
      renderPopup(result.message || '✅ Your profile was updated successfully.');
    }
  } catch (error) {
    // Handle any network errors
    console.error('Error updating the user:', error);
    renderPopup("⚠️ We're having internal problems. Please try again later.");
  } finally {
    unrenderLoading();
  }
}

// Delete user
async function deleteUser(token) {
  // Render the loading animation
  renderLoading();

  // Create a payload for the API request
  const payload = {
    token,
  };

  try {
    // Send POST request to the delete-user serverless function
    const response = await fetch('/.netlify/functions/user-delete-user', {
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
      renderPopup(result.message || '⚠️ Something went wrong. Please try again.');
      // Refresh the page
      setTimeout(() => {
        window.location.href = '/';
      }, 2300);
    } else {
      renderPopup("😢 We're sorry to see you go. Your account has been deleted.", 3000);
      // Delete the token
      localStorage.removeItem('token');
      // Redirect to home page
      setTimeout(() => {
        window.location.href = '/';
      }, 3300);
    }
  } catch (error) {
    // Handle any network errors
    console.error('Error deleting the user:', error);
    renderPopup("⚠️ We're having internal problems. Please try again later.");
  } finally {
    unrenderLoading();
  }
}

export { getUser, updateUser, deleteUser };
