import { renderLoading, unrenderLoading } from '/js/components/loading.js';
import { renderPopup } from '/js/components/popup.js';
import { createSubscription } from '/js/functions/stripe.js';

document.addEventListener('DOMContentLoaded', function () {
  // Get the signup form elements
  const signupForm = document.getElementById('signup-form');
  const signupButton = document.getElementById('signup-button');

  // Add an event listener to handle form submission
  signupForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    // disable the signup button
    signupButton.disabled = true;

    // Show loading
    renderLoading();

    // Get form data
    const formData = new FormData(signupForm);
    const name = formData.get('name');
    const email = formData.get('email');
    const password = formData.get('password');

    // Get paid from session storage
    const paid = sessionStorage.getItem('paid');
    // Remove paid from session storage
    sessionStorage.removeItem('paid');

    // Create a payload for the API request
    const payload = {
      name,
      email,
      password,
      paid,
    };

    try {
      // If paid is true, show stripe payment form
      if (paid === 'true') {
        return await createSubscription(payload);
      }

      // Send POST request to the signup serverless function
      const response = await fetch('/.netlify/functions/signup', {
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
        renderPopup(result.message || '⚠️ An error occurred during signup');
      }
    } catch (error) {
      // Handle any network errors
      console.error('Error during signup:', error);
      renderPopup("⚠️ Internal error. Please try again later.");
    } finally {
      unrenderLoading();
      signupButton.disabled = false;
    }
  });
});
