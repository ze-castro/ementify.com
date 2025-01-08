document.addEventListener('DOMContentLoaded', function () {
  // Get the signup form element
  const signupForm = document.getElementById('signup-form');

  // Add an event listener to handle form submission
  signupForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    // Get form data
    const formData = new FormData(signupForm);
    const name = formData.get('name');
    const email = formData.get('email');
    const password = formData.get('password');

    // Create a payload for the API request
    const payload = {
      name,
      email,
      password,
    };

    try {
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
        alert('Account created successfully!');
        //window.location.href = '/app';
      } else {
        // Handle errors
        alert(result.message || 'An error occurred during signup.');
      }
    } catch (error) {
      // Handle any network errors
      console.error('Error during signup:', error);
      alert('An error occurred. Please try again.');
    }
  });
});
