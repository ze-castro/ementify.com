// on load of page
document.addEventListener('DOMContentLoaded', () => {
  // check cookies
  if (!checkCookies()) {
    renderCookies();
  }

  // detail the cookies we use in the website
  console.log('%cCookies Disclaimer:', 'font-weight: bold; font-size: 1rem;');
  console.log('');
  console.log('%cAnalytics', 'font-weight: bold; font-size: 0.8rem;');
  console.log('We do not use any analytics software to track visitors of our website.');
  console.log('');
  console.log('%cLocal Storage', 'font-weight: bold; font-size: 0.8rem;');
  console.log(
    'We use local storage to store data that needs to be available in other pages of the website.'
  );
  console.log('');
  console.log('We do not store any user data.');
});

// accept cookies
function acceptCookies() {
  localStorage.setItem('cookies', true);
  const cookies = document.getElementById('cookies');
  cookies.style.bottom = '-5rem';
  setTimeout(() => {
    cookies.style.display = 'none';
  }, 500);
}

// check if cookies have been accepted
function checkCookies() {
  const cookies = localStorage.getItem('cookies');
  if (cookies) {
    return true;
  }
  return false;
}

// render cookies
function renderCookies() {
  const cookiesHTML = `
    <div id="cookies">
      <p>This website uses cookies to ensure you get the best experience on our website.</p>
      <button id="cookies-button">Ok 👌</button>
    </div>
  `;

  // insert cookies
  document.body.insertAdjacentHTML('afterbegin', cookiesHTML);

  // onclick of accept cookies button
  const cookiesBtn = document.getElementById('cookies-button');
  cookiesBtn.addEventListener('click', acceptCookies);

  // animate cookies
  setTimeout(() => {
    cookies.style.bottom = '2rem';
  }, 1000);
}
