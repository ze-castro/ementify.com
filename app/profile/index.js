import { isTokenInLocalStorage } from '/js/utils/isTokenInLocalStorage.js';
import { verifyToken, getUser, updateUser, deleteUser } from '/js/functions/user.js';
import { renderConfirm } from '/js/components/confirm.js';

// Variables
var user = {};
// Get the token from the local storage
const token = localStorage.getItem('token');

// On load
document.addEventListener('DOMContentLoaded', async function () {
  // Check if the token is stored in the local storage
  await isTokenInLocalStorage(token);

  // Verify the token
  await verifyToken(token);

  // Get menu
  user = await getUser(token);

  // Set the info
  document.getElementById('name').value = user.name;
  document.getElementById('email').innerText = user.email;
});

// Update name
document.getElementById('name').addEventListener('blur', async function () {
  // Get the new name
  const name = document.getElementById('name').value;

  // Check if the name is empty
  if (!name) {
    name = user.name;
    return;
  }

  // Check if the name is the same
  if (name === user.name) {
    return;
  }

  // Update the user
  user.name = name;

  // Update the user in the database
  await updateUser(token, user);
});

// Delete user
document.getElementById('delete').addEventListener('click', async function () {
  // Confirm the action
  const isConfirmed = await renderConfirm(
    'Are you sure you want to delete your account? This action cannot be undone.'
  );

  if (isConfirmed) {
    // Delete the user
    await deleteUser(token);
  }
});
