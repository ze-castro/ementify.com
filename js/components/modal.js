// render modal
function renderModal(text, button, url) {
  return new Promise((resolve) => {
    const popupHTML = `
    <div id="modal">
      <div id="modal-box">
        <p>${text}</p>
        <img src="${url}" alt="qr-code" />
        <div id="modal-buttons">
          <button id="modal-click">${button}</button>
        </div>
      </div>
    </div>
    `;

    // insert modal
    document.body.insertAdjacentHTML('afterbegin', popupHTML);

    // get modal element
    const modal = document.getElementById('modal');

    // animate modal
    modal.style.animation = 'fadeIn 0.3s';

    // modal click on the button
    document.getElementById('modal-click').addEventListener('click', () => {
      downloadQrCode(url);
      resolve(unrenderModal(0));
    });

    // modal click on the modal except modal-box
    modal.addEventListener('click', (e) => {
      if (e.target.id === 'modal') {
        resolve(unrenderModal(0));
      }
    });
  });
}

// unrender modal
function unrenderModal(time) {
  // get modal element
  const modal = document.getElementById('modal');

  // wait time before removing modal
  setTimeout(() => {
    // animate modal
    modal.style.animation = 'fadeOut 0.2s';
    setTimeout(() => {
      modal.remove();
    }, 150);
  }, time);
}

// download qr code
function downloadQrCode(qrCodeUrl) {
  fetch(qrCodeUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.blob();
    })
    .then((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'qr-code.png';
      a.click();
      URL.revokeObjectURL(url);
    })
    .catch((error) => {
      console.error('There was a problem with the fetch operation:', error);
    });
}

export { renderModal };
