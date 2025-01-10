import { renderLoading, unrenderLoading } from '/js/components/loading.js';
import { renderPopup } from '/js/components/popup.js';

document.addEventListener('DOMContentLoaded', function () {
  // Get the change-password form elements
  const changePasswordForm = document.getElementById('change-password-form');
  const changePasswordButton = document.getElementById('change-password-button');

  // Add an event listener to handle form submission
  changePasswordForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    // disable the change-password button
    changePasswordButton.disabled = true;

    // Show loading
    renderLoading();

    // Get form data
    const formData = new FormData(changePasswordForm);
    const password = formData.get('password');
    const confirmPassword = formData.get('confirm-password');

    // Check if the passwords match
    if (password !== confirmPassword) {
      renderPopup('Passwords do not match.');
      unrenderLoading();
      
      changePasswordButton.disabled = false;
      return;
    }

    // Get the token from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    // Create a payload for the API request
    const payload = {
      token,
      password,
    };

    try {
      // Send POST request to the change-password serverless function
      const response = await fetch('/.netlify/functions/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      // Handle the response
      const result = await response.json();

      if (response.ok) {
        renderPopup(result.message || 'Password updated successfully.');
        localStorage.setItem('token', result.token);
        setTimeout(() => {
          window.location.href = '/app';
        }, 2300);
      } else {
        // Handle errors
        renderPopup(result.message || 'An error occurred updating the password.');
        setTimeout(() => {
          window.location.href = '/recover-password';
        }, 2300);
      }
    } catch (error) {
      // Handle any network errors
      console.error('Error updating the password:', error);
      renderPopup("⚠️ We're having internal problems. Please try again later.");
      // Go to the home page
      setTimeout(() => {
        window.location.href = '/';
      }, 2300);
    } finally {
      unrenderLoading();
      changePasswordButton.disabled = false;
    }
  });
});
