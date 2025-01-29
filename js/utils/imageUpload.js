import { renderLoading, unrenderLoading } from '/js/components/loading.js';
import { renderPopup } from '/js/components/popup.js';

async function uploadImage(file) {
  // Render the loading animation
  renderLoading();

  // Update the menu image in the database
  try {
    // Create a body for the API request
    const body = new FormData();
    body.append('image', file);

    // Send POST request to the Cloudinary API
    const response = await fetch('https://api.imgbb.com/1/upload?key=add19f6b5699e341b8a57fec5f29ba44', {
      method: 'POST',
      body,
    });

    // Handle the response
    const data = await response.json();
    return data.data.display_url;
  } catch (error) {
    // Handle errors
    return { error: '⚠️ Error uploading image. Please try again.' };
  } finally {
    unrenderLoading();
  }
}

export { uploadImage };
