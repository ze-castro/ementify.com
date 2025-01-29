import { renderLoading, unrenderLoading } from '/js/components/loading.js';
import { renderPopup } from '/js/components/popup.js';

async function uploadImage(file) {
  // Render the loading animation
  renderLoading();

  // Update the menu image in the database
  try {
    // Create a body for the API request
    const body = new FormData();
    body.append('file', file);
    body.append('upload_preset', 'ementify');

    // Send POST request to the Cloudinary API
    const response = await fetch('https://api.cloudinary.com/v1_1/duoppksqw/image/upload', {
      method: 'POST',
      body,
    });

    // Handle the response
    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    // Handle errors
    console.error('Error uploading menu image:', error);
    renderPopup('⚠️ Something went wrong. Please try again later.');
  } finally {
    unrenderLoading();
  }
}

export { uploadImage };
