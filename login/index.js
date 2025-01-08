document.addEventListener('DOMContentLoaded', function () {
    // Get the login form element
    const loginForm = document.getElementById('login-form');
  
    // Add an event listener to handle form submission
    loginForm.addEventListener('submit', async function (event) {
      event.preventDefault();
  
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
          alert(result.message || 'An error occurred during login.');
        }
      } catch (error) {
        // Handle any network errors
        console.error('Error during login:', error);
        alert('An error occurred. Please try again.');
      }
    });
  });
  