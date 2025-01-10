// Verify the token
async function verifyToken(token, errorTrigger) {
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
      errorTrigger = true;
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
    errorTrigger = true;
    console.error('Error validating the token:', error);
    renderPopup("⚠️ We're having internal problems. Please try again later.");
    // Go to the home page
    setTimeout(() => {
      window.location.href = '/';
    }, 2300);
  } finally {
    if (errorTrigger) {
      unrenderLoading();
      unrenderPopup(2000);
    }
  }
}

export { verifyToken };
