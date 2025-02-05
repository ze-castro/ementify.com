import { isTokenInLocalStorage } from '/js/utils/isTokenInLocalStorage.js';
import { getDate } from '/js/utils/date.js';
import { renderConfirm } from '/js/components/confirm.js';
import { renderPopup } from '/js/components/popup.js';
import { getUser, updateUser, deleteUser } from '/js/functions/user.js';
import {
  createSubscriptionForExistingUser,
  getSubscription,
  updateSubscription,
} from '/js/functions/stripe.js';

// Variables
var user = {};
// Get the token from the local storage
const token = localStorage.getItem('token');

// On load
document.addEventListener('DOMContentLoaded', async function () {
  // Check if the token is stored in the local storage
  await isTokenInLocalStorage(token);

  // Get user
  user = await getUser(token);

  // Get the customer ID from the session storage
  const customerId = sessionStorage.getItem('customerId');

  // Update subscription
  if (user.paid && !customerId) {
    const updatedUser = await updateSubscription(user.subscription.id, token);
    user = updatedUser.user;
  }

  if (customerId) {
    // Remove the session ID from the session storage
    sessionStorage.removeItem('customerId');
    // Get subscription data from Stripe
    const subscription = await getSubscription(customerId);
    user = subscription.user;
    renderPopup(subscription.message);
  }

  // Set the user info
  document.getElementById('name').value = user.name;
  document.getElementById('email').innerText = user.email;

  // Set the subscription info
  if (user.paid) {
    document.getElementById('plan').innerText = 'Pro';
    document.getElementById('active').innerText = 'Yes';
    document.getElementById('renew').innerText = await getDate(
      user.subscription.current_period_end
    );
    if (user.subscription.cancel_at) {
      document.getElementById('renew-text').innerText = 'Cancels On';
      document.getElementById('cancel-subscription').remove();
    } else {
      document.getElementById('add-subscription').remove();
    }
  } else {
    document.getElementById('plan').innerText = 'Free';
    document.getElementById('active').innerText = 'N/A';
    document.getElementById('renew').innerText = 'N/A';
    document.getElementById('cancel-subscription').remove();
  }
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

// Update password
document.getElementById('change-password-button').addEventListener('click', async function () {
  // Save email to local storage
  localStorage.setItem('email', user.email);

  // Redirect to the recover password page
  window.location.href = '/recover-password';
});

// Delete user
document.getElementById('delete-button').addEventListener('click', async function () {
  // Confirm the action
  const isConfirmed = await renderConfirm(
    'Are you sure you want to delete your account? This action cannot be undone.'
  );

  if (isConfirmed) {
    // Delete the user
    await deleteUser(token);
  }
});

// Manage subscription
document.getElementById('subscription-button').addEventListener('click', async function () {
  // Redirect to the billing portal page in a new tab
  window.open(
    'https://billing.stripe.com/p/login/test_8wM6rDcj000u6D6bII?prefilled_email=' + user.email,
    '_blank',
    'noopener'
  );
});

// Upgrade subscription
document.getElementById('add-subscription-button').addEventListener('click', async function () {
  await createSubscriptionForExistingUser(token);
});
