import { renderLoading, unrenderLoading } from '/js/components/loading.js';
import { renderPopup, unrenderPopup } from '/js/components/popup.js';

document.addEventListener('DOMContentLoaded', function () {
  // Get the login form elements
  const loginForm = document.getElementById('login-form');
  const loginButton = document.getElementById('login-button');

  // Add an event listener to handle form submission
  loginForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    // disable the login button
    loginButton.disabled = true;

    // Show loading
    renderLoading();

    // Get form data
    const formData = new FormData(loginForm);
    const email = formData.get('email');
    const password = formData.get('password');

    // Create a payload for the API request
    const payload = {
      email,
      password,
    };

    try {
      // Send POST request to the login serverless function
      const response = await fetch('/.netlify/functions/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      // Handle the response
      const result = await response.json();

      if (response.ok) {
        localStorage.setItem('token', result.token);
        window.location.href = '/app';
      } else {
        // Handle errors
        renderPopup(result.message || 'An error occurred during login 🤷‍♂️');
      }
    } catch (error) {
      // Handle any network errors
      console.error('Error during login:', error);
      renderPopup("⚠️ We're having internal problems. Please try again later.");
      // Go to the home page
      setTimeout(() => {
        window.location.href = '/';
      }, 2300);
    } finally {
      unrenderLoading();
      unrenderPopup(2000);
      loginButton.disabled = false;
    }
  });
});
