// render popup
function renderPopup(text, time = 2000) {
  const popupHTML = `
    <div id="popup">
      <p>${text}</p>
    </div>
  `;

  // insert popup
  document.body.insertAdjacentHTML('afterbegin', popupHTML);

  // get popup element
  const popup = document.getElementById('popup');

  // animate popup
  popup.style.animation = 'fadeIn 0.3s';

  // unrender popup after time
  unrenderPopup(time);
}

// unrender popup
function unrenderPopup(time) {
  // get popup element
  const popup = document.getElementById('popup');

  // wait time before removing popup
  setTimeout(() => {
    // animate popup
    popup.style.animation = 'fadeOut 0.3s';
    setTimeout(() => {
      popup.remove();
    }, 250);
  }, time);
}

export { renderPopup };
