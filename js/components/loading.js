// render loading
function renderLoading() {
  const loadingHTML = `
    <div id="loading">
      <div id="loading-circle"></div>
    </div>
  `;

  // insert loading
  document.body.insertAdjacentHTML('afterbegin', loadingHTML);

  // get loading element
  const loading = document.getElementById('loading');

  // animate loading
  loading.style.animation = 'fadeIn 0.3s';
}

// unrender loading
function unrenderLoading() {
  // get loading element
  const loading = document.getElementById('loading');

  // animate loading
  loading.style.animation = 'fadeOut 0.3s';
  setTimeout(() => {
    loading.remove();
  }, 280);
}

export { renderLoading, unrenderLoading };
