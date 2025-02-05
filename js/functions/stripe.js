import { renderPopup } from '/js/components/popup.js';
import { renderLoading, unrenderLoading } from '/js/components/loading.js';
import { loadStripe } from 'https://cdn.jsdelivr.net/npm/@stripe/stripe-js/+esm';

const stripePromise = loadStripe(
  'pk_live_51P35TXL5Ad6XODbG9VFvjaJPLF2fkbE9i8ZZRK80vwjGkKNbDUBJL00NGq0RUy8igHOTkhTVyuKZZXLoPcQTwbAa00FkpO69JB'
);

async function createSubscription(payload) {
  const stripe = await stripePromise;

  try {
    const response = await fetch('/.netlify/functions/stripe-checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    // Handle the response
    const result = await response.json();

    if (response.ok) {
      // Get the session ID
      const { sessionId, token, customerId } = result;

      // Save the token to local storage
      localStorage.setItem('token', token);

      // Save the customer ID to session storage
      sessionStorage.setItem('customerId', customerId);

      // Redirect to Stripe Checkout
      const { error } = await stripe.redirectToCheckout({ sessionId });

      if (error) {
        console.error('Stripe Checkout Error:', error);
        renderPopup('⚠️ Checkout failed. Please log in and try again in the Profile page.', 3000);
        return setTimeout(() => {
          window.location.href = '/app/profile';
        }, 2900);
      }
    } else {
      if (response.status === 409) {
        sessionStorage.removeItem('customerId');
        renderPopup(result.message, 3000);
        return setTimeout(() => {
          window.location.href = '/login';
        }, 3300);
      } else {
        return renderPopup(result.message, 3000);
      }
    }
  } catch (error) {
    console.error('Checkout initiation error:', error);
    renderPopup('⚠️ Unable to start checkout. Refresh the page and try again.');
  }
}

async function createSubscriptionForExistingUser(token) {
  // Render the loading animation
  renderLoading();

  const stripe = await stripePromise;

  try {
    const response = await fetch('/.netlify/functions/stripe-checkout-for-existing-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    // Handle the response
    const result = await response.json();

    // Get the session ID and customer ID
    const { sessionId, customerId } = result;

    // Save the customer ID to session storage
    sessionStorage.setItem('customerId', customerId);

    // Redirect to Stripe Checkout
    const { error } = await stripe.redirectToCheckout({ sessionId });

    if (error) {
      console.error('Stripe Checkout Error:', error);
      return renderPopup('⚠️ Checkout failed. Refresh the page and try again.', 3000);
    }
  } catch (error) {
    console.error('Checkout initiation error:', error);
    renderPopup('⚠️ Unable to start checkout. Refresh the page and try again.');
  } finally {
    unrenderLoading();
  }
}

async function getSubscription(customerId) {
  // Render the loading animation
  renderLoading();

  try {
    const response = await fetch('/.netlify/functions/stripe-get-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ customerId }),
    });

    // Handle the response
    const result = await response.json();

    return result;
  } catch (error) {
    console.error('Subscription error:', error);
    renderPopup('⚠️ Unable to get subscription data. Refresh the page and try again.');
  } finally {
    unrenderLoading();
  }
}

async function updateSubscription(subscriptionId, token) {
  // Render the loading animation
  renderLoading();

  try {
    const response = await fetch('/.netlify/functions/stripe-update-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ subscriptionId, token }),
    });

    // Handle the response
    const result = await response.json();

    return result;
  } catch (error) {
    console.error('Subscription error:', error);
    renderPopup('⚠️ Unable to get subscription data. Refresh the page and try again.');
  } finally {
    unrenderLoading();
  }
}

async function updateSubscriptionFromToken(token) {
  // Render the loading animation
  renderLoading();

  try {
    const response = await fetch('/.netlify/functions/stripe-update-subscription-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });
    // Handle the response
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Subscription error:', error);
    renderPopup('⚠️ Unable to get subscription data. Refresh the page and try again.');
  } finally {
    unrenderLoading();
  }
}

export {
  createSubscription,
  createSubscriptionForExistingUser,
  getSubscription,
  updateSubscription,
  updateSubscriptionFromToken,
};
