// render confirm
function renderConfirm(text) {
  return new Promise((resolve) => {
    const popupHTML = `
      <div id="confirm">
        <div id="confirm-box">
          <p>${text}</p>
          <div id="confirm-buttons">
            <button id="confirm-yes">👍</button>
            <button id="confirm-no">👎</button>
          </div>
        </div>
      </div>
    `;

    // insert confirm
    document.body.insertAdjacentHTML('afterbegin', popupHTML);

    // get confirm element
    const confirm = document.getElementById('confirm');

    // animate confirm
    confirm.style.animation = 'fadeIn 0.3s';

    // confirm yes
    document.getElementById('confirm-yes').addEventListener('click', () => {
      resolve(true);
      unrenderConfirm(0);
    });

    // confirm no
    document.getElementById('confirm-no').addEventListener('click', () => {
      resolve(false);
      unrenderConfirm(0);
    });
  });
}

// unrender confirm
function unrenderConfirm(time) {
  // get confirm element
  const confirm = document.getElementById('confirm');

  // wait time before removing confirm
  setTimeout(() => {
    // animate confirm
    confirm.style.animation = 'fadeOut 0.2s';
    setTimeout(() => {
      confirm.remove();
    }, 150);
  }, time);
}

export { renderConfirm };
