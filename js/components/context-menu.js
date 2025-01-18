// render context-menu
function renderContextMenu() {
  return new Promise((resolve) => {
    // get context-menu element
    const contextMenu = document.getElementById('context-menu');

    // animate context-menu
    contextMenu.style.display = 'flex';
    contextMenu.style.animation = 'fadeIn 0.3s';

    // context-menu click on the context-menu except context-menu-box
    contextMenu.addEventListener('click', (e) => {
      resolve(unrenderContextMenu(0));
    });
  });
}

// unrender context-menu
function unrenderContextMenu(time) {
  // get context-menu element
  const contextMenu = document.getElementById('context-menu');

  // wait time before removing context-menu
  setTimeout(() => {
    // animate context-menu
    contextMenu.style.animation = 'fadeOut 0.2s';
    setTimeout(() => {
      contextMenu.style.display = 'none';
    }, 150);
  }, time);
}

export { renderContextMenu };
