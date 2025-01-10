import { renderPopup } from '/js/components/popup.js';

async function isTokenInLocalStorage(token) {
  if (!token) {
    renderPopup('⚠️ You are not logged in. Redirecting to login page.');

    setTimeout(() => {
      window.location.href = '/login';
    }, 2300);
    return;
  }
}

export { isTokenInLocalStorage };