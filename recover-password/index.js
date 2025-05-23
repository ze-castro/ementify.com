import { renderLoading, unrenderLoading } from '/js/components/loading.js';
import { renderPopup } from '/js/components/popup.js';

document.addEventListener('DOMContentLoaded', function () {
  // Search for email in local storage
  const email = localStorage.getItem('email');
  localStorage.removeItem('email');
  if (email) {
    // Fill the email input with the email from local storage
    document.getElementById('recover-email').value = email;
  }

  // Get the recover-password form elements
  const recoverPasswordForm = document.getElementById('recover-password-form');
  const recoverPasswordButton = document.getElementById('recover-password-button');

  // Add an event listener to handle form submission
  recoverPasswordForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    // disable the recover-password button
    recoverPasswordButton.disabled = true;

    // Show loading
    renderLoading();

    // Get form data
    const formData = new FormData(recoverPasswordForm);
    const email = formData.get('email');

    // Create a payload for the API request
    const payload = {
      email,
    };

    try {
      // Send POST request to the recover-password serverless function
      const response = await fetch('/.netlify/functions/recover-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      // Handle the response
      const result = await response.json();

      if (response.ok) {
        renderPopup(result.message || 'Email sent successfully. Check your inbox.');
        setTimeout(() => {
          window.location.href = '/';
        }, 2300);
      } else {
        // Handle errors
        renderPopup(result.message || 'An error occurred recovering the password.');
      }
    } catch (error) {
      // Handle any network errors
      console.error('Error recovering the password:', error);
      renderPopup("⚠️ We're having internal problems. Please try again later.");
      // Go to the home page
      setTimeout(() => {
        window.location.href = '/';
      }, 2300);
    } finally {
      unrenderLoading();
      recoverPasswordButton.disabled = false;
      localStorage.removeItem('email');
    }
  });
});
