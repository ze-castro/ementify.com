import { isTokenInLocalStorage } from '/js/utils/isTokenInLocalStorage.js';
import { compressImage } from '/js/utils/compressImage.js';
import { uploadImage } from '/js/utils/imageUpload.js';
import { getMenu, updateMenu, deleteMenu } from '/js/functions/menu.js';
import { renderConfirm } from '/js/components/confirm.js';
import { renderModal } from '/js/components/modal.js';
import { renderContextMenu } from '/js/components/context-menu.js';
import { renderPopup } from '/js/components/popup.js';

// Variables
var menu = null;
let originalMenu = null;

// Get the token from the local storage
const token = localStorage.getItem('token');

// Get the menu ID from the URL
const urlParams = new URLSearchParams(window.location.search);
const menuId = urlParams.get('id');

// On load
document.addEventListener('DOMContentLoaded', async function () {
  // Check if the token is stored in the local storage
  await isTokenInLocalStorage(token);

  // Get menu
  menu = await getMenu(token, menuId);
  originalMenu = JSON.parse(JSON.stringify(menu));

  // Render the menu
  await populateCategorySelect();
  await populateMenu(menu);

  //// EVENT LISTENERS ////
  // Add event listener to the options button
  const optionsButton = document.getElementById('options-button');
  optionsButton.addEventListener('click', async function () {
    // Toggle category drag off - moveCategoryButton make it click
    if (moveCategoryBool) {
      moveCategoryButton.click();
    }

    // Check buttons
    const divider3 = document.getElementsByClassName('context-menu-divider')[2];
    if (menu.image === null) {
      removeImageButton.style.display = 'none';
      divider3.style.display = 'none';
    } else {
      removeImageButton.style.display = '';
      divider3.style.display = '';
    }

    // Render the context menu
    await renderContextMenu();
  });

  // Add event listener to the view button
  const viewButton = document.getElementById('view-button');
  viewButton.addEventListener('click', async function () {
    // Toggle category drag off - moveCategoryButton make it click
    if (moveCategoryBool) {
      moveCategoryButton.click();
    }
    // Open the menu in a new tab
    window.open('/view?id=' + menuId, '_blank', 'noopener');
  });

  // Add event listener to the change-color button
  const changeColorButton = document.getElementById('change-color-button');
  changeColorButton.addEventListener('click', async function () {
    // Toggle category drag off - moveCategoryButton make it click
    if (moveCategoryBool) {
      moveCategoryButton.click();
    }
    // Render the colors modal
    await renderColors();
  });

  // render colors
  function renderColors() {
    return new Promise((resolve) => {
      const colorsMenuHTML = `
      <div id="colors-menu">
        <div id="colors-menu-box">
          <h2>Pick a color</h2>
          <button id="color-1" class="color-option"></button>
          <button id="color-2" class="color-option"></button>
          <button id="color-3" class="color-option"></button>
          <button id="color-4" class="color-option"></button>
          <button id="color-5" class="color-option"></button>
          <button id="color-6" class="color-option"></button>
          <button id="color-7" class="color-option"></button>
          <button id="color-8" class="color-option"></button>
          <button id="color-9" class="color-option"></button>
          <button id="color-10" class="color-option"></button>
          <button id="color-11" class="color-option"></button>
          <button id="color-12" class="color-option"></button>
        </div>
      </div>
      `;

      // insert colors
      document.body.insertAdjacentHTML('afterbegin', colorsMenuHTML);

      // get colors element
      const colors = document.getElementById('colors-menu');

      // animate colors
      colors.style.animation = 'fadeIn 0.3s';

      // colors click on the colors except colors-box
      colors.addEventListener('click', async (e) => {
        // Toggle category drag off - moveCategoryButton make it click
        if (moveCategoryBool) {
          moveCategoryButton.click();
        }

        // change color
        const originalMenuColor = menu.color;
        switch (e.target.id) {
          case 'color-1':
            menu.color = '--green';
            break;
          case 'color-2':
            menu.color = '--blue';
            break;
          case 'color-3':
            menu.color = '--light-blue';
            break;
          case 'color-4':
            menu.color = '--yellow';
            break;
          case 'color-5':
            menu.color = '--red';
            break;
          case 'color-6':
            menu.color = '--orange';
            break;
          case 'color-7':
            menu.color = '--pink';
            break;
          case 'color-8':
            menu.color = '--purple';
            break;
          case 'color-9':
            menu.color = '--black';
            break;
          case 'color-10':
            menu.color = '--gray-5';
            break;
          case 'color-11':
            menu.color = '--gray-4';
            break;
          case 'color-12':
            menu.color = '--gray-3';
            break;
        }
        if (originalMenuColor !== menu.color) {
          await updateMenu(token, menu);
          originalMenu = JSON.parse(JSON.stringify(menu));
          await populateCategorySelect();
        }
        resolve(unrenderColors(0));
      });
    });
  }

  // unrender colors
  function unrenderColors(time) {
    // get colors element
    const colors = document.getElementById('colors-menu');

    // wait time before removing colors
    setTimeout(() => {
      // animate colors
      colors.style.animation = 'fadeOut 0.2s';
      setTimeout(() => {
        colors.remove();
      }, 150);
    }, time);
  }

  // Render add image to menu modal
  function renderAddImageToMenu() {
    return new Promise((resolve) => {
      const addImageToMenuHTML = `
      <div id="image-modal">
        <div id="image-modal-box">
          <h2>Add an image to the menu</h2>
          <form id="image-modal-form">
            <img id="preview-image" src="" alt="The preview of the image." />
            <label for="image">
              <i class="fa fa-photo"></i>
              The image should be in .jpg, .jpeg, or .png format. We recommend a 16:9 aspect ratio. Max file size: 5MB.
              <input type="file" name="image" id="image" accept=".jpg, .jpeg, .png" required />
            </label>
            <button type="submit">Add Image</button>
          </form>
        </div>
      </div>
      `;

      // insert add image to menu
      document.body.insertAdjacentHTML('afterbegin', addImageToMenuHTML);

      // get add image to menu element
      const addImageToMenu = document.getElementById('image-modal');

      // animate add image to menu
      addImageToMenu.style.animation = 'fadeIn 0.3s';

      // image input change
      const imageInput = document.getElementById('image');
      const previewImage = document.getElementById('preview-image');

      // compress the image
      let compressedFile = null;

      imageInput.addEventListener('change', async (e) => {
        // if nothing is changed
        if (!e.target.files.length) {
          return;
        }

        // show the preview image
        previewImage.style.display = 'block';
        // compress the image
        const file = e.target.files[0];
        compressedFile = await compressImage(file);

        // Check if the image is a valid file
        if (compressedFile) {
          const reader = new FileReader();
          reader.onload = () => {
            previewImage.src = reader.result;
          };
          reader.readAsDataURL(compressedFile);
        }
      });

      // add image to menu form
      const addImageToMenuForm = document.getElementById('image-modal-form');
      addImageToMenuForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        // Check if the image is compressed
        if (!compressedFile) {
          return renderPopup('⚠️ Please wait for the image to compress. Try again in 5 seconds.');
        }

        // upload the image
        const imageUrl = await uploadImage(compressedFile);
        if (!imageUrl) {
          return resolve(unrenderAddImageToMenu(0));
        }

        // update the menu image
        menu.image = imageUrl;
        await updateMenu(token, menu);
        resolve(unrenderAddImageToMenu(0));
      });

      // On click outside of the image-modal-box unrender add image to menu
      addImageToMenu.addEventListener('click', async (e) => {
        if (e.target.id === 'image-modal') {
          resolve(unrenderAddImageToMenu(0));
        }
      });
    });
  }

  // Unrender add image to menu
  function unrenderAddImageToMenu(time) {
    // get add image to menu element
    const addImageToMenu = document.getElementById('image-modal');

    // wait time before removing add image to menu
    setTimeout(() => {
      // animate add image to menu
      addImageToMenu.style.animation = 'fadeOut 0.2s';
      setTimeout(() => {
        addImageToMenu.remove();
      }, 150);
    }, time);
  }

  // Add event listener to the add image button
  const addImageButton = document.getElementById('add-photo-button');
  addImageButton.addEventListener('click', async function () {
    // Toggle category drag off - moveCategoryButton make it click
    if (moveCategoryBool) {
      moveCategoryButton.click();
    }
    // Render the add image to menu modal
    await renderAddImageToMenu();
  });

  // Add event listener to the remove image button
  const removeImageButton = document.getElementById('remove-photo-button');
  removeImageButton.addEventListener('click', async function () {
    // Toggle category drag off - moveCategoryButton make it click
    if (moveCategoryBool) {
      moveCategoryButton.click();
    }
    // Ask for confirmation
    const confirm = await renderConfirm('Are you sure you want to remove the image?');
    if (!confirm) {
      return;
    }

    // Remove the image
    menu.image = null;
    await updateMenu(token, menu);
  });

  // Add event listener to the QR code button
  const qrButton = document.getElementById('qr-code-button');
  qrButton.addEventListener('click', async function () {
    // Toggle category drag off - moveCategoryButton make it click
    if (moveCategoryBool) {
      moveCategoryButton.click();
    }
    // Get the QR code
    const qrCode =
      'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://www.ementify.com/view?id=' +
      menuId;

    // Render the modal
    await renderModal('Scan the QR code to view the menu or download it.', 'Download', qrCode);
  });

  // Add event listener to the move category button
  let moveCategoryBool = false;
  const moveCategoryButton = document.getElementById('move-menu-button');
  moveCategoryButton.addEventListener('click', async function () {
    // If the menu only has one category, return a message
    if (menu.categories.length === 1) {
      renderPopup('You need at least 2 categories to move them.');
      return;
    }
    // Toggle the move category appearance
    if (moveCategoryBool) {
      moveCategoryButton.innerHTML = '<i class="fa fa-arrows"></i> Move Categories';
    } else {
      moveCategoryButton.innerHTML = '<i class="fa fa-save"></i> Save Changes';
    }
    moveCategoryBool = !moveCategoryBool;

    // Get all menu categories
    const categories = document.getElementsByClassName('menu-category');

    if (moveCategoryBool) {
      // Remove menu-category-open
      for (const category of categories) {
        const menuCategoryOpen = category.getElementsByClassName('menu-category-open')[0];
        menuCategoryOpen.remove();
      }

      // Add move category buttons
      for (const category of categories) {
        // Create the move category button
        const moveCategoryButton = document.createElement('button');
        moveCategoryButton.className = 'menu-category-move';
        moveCategoryButton.innerHTML = '<i class="fa fa-arrows"></i>';
        const menuCategoryTitleBox = category.getElementsByClassName('menu-category-title-box')[0];
        menuCategoryTitleBox.appendChild(moveCategoryButton);
        category.draggable = true;
      }

      // Disable all the inputs and buttons in menu-category
      const categoryElements = document.getElementsByClassName('menu-category');
      for (const item of categoryElements) {
        for (const child of item.children) {
          child.disabled = true;
          for (const grandchild of child.children) {
            if (grandchild.className !== 'menu-category-move') {
              grandchild.disabled = true;
            }
            for (const greatgrandchild of grandchild.children) {
              greatgrandchild.disabled = true;
            }
          }
        }
      }

      // Make the categories draggable
      makeDraggable();
    } else {
      // Enable all the inputs and buttons in menu-category
      const categoryElements = document.getElementsByClassName('menu-category');
      for (const item of categoryElements) {
        for (const child of item.children) {
          child.disabled = false;
          for (const grandchild of child.children) {
            grandchild.disabled = false;
            for (const greatgrandchild of grandchild.children) {
              greatgrandchild.disabled = false;
            }
          }
        }
      }

      // Update the menu if the order of the categories has changed
      if (JSON.stringify(menu) !== JSON.stringify(originalMenu)) {
        await updateMenu(token, menu);
        originalMenu = JSON.parse(JSON.stringify(menu));
      }
      // Repopulate the menu
      await repopulateMenu(menu);
    }
  });

  // Make the categories draggable
  function makeDraggable() {
    let draggedElement = null;
    let initialY = 0;
    let ghostElement = null;
    const categories = document.querySelectorAll('.menu-category');
    const container = document.getElementById('menu-categories');
    categories.forEach((category) => {
      // Start dragging
      category.addEventListener('dragstart', (e) => {
        draggedElement = category;
        category.classList.add('dragging');
      });

      // End dragging
      category.addEventListener('dragend', () => {
        category.classList.remove('dragging');
        draggedElement = null;

        // Update the menu
        const newCategories = [];
        const menuCategories = document.getElementsByClassName('menu-category');
        for (const category of menuCategories) {
          const categoryName = category.getElementsByClassName('menu-category-title')[0].value;
          const categoryItems = category.getElementsByClassName('menu-category-item');
          const items = [];
          for (const item of categoryItems) {
            const itemTitle = item.getElementsByClassName('item-title')[0].value;
            const itemDescription = item.getElementsByClassName('item-description')[0].value;
            const itemPrice = item.getElementsByClassName('item-price')[0].value;
            items.push({
              title: itemTitle,
              description: itemDescription,
              price: itemPrice,
            });
          }
          newCategories.push({
            name: categoryName,
            items: items,
          });
        }

        menu.categories = newCategories;
      });

      // Handle touch start
      category.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        draggedElement = category;
        initialY = touch.clientY;

        // Create a ghost element
        ghostElement = category.cloneNode(true);
        ghostElement.classList.add('ghost');
        ghostElement.style.position = 'absolute';
        ghostElement.style.pointerEvents = 'none';
        ghostElement.style.opacity = '0.8';
        ghostElement.style.zIndex = '1000';
        ghostElement.style.width = `${category.offsetWidth}px`;

        // Position ghost at the initial touch location
        document.body.appendChild(ghostElement);
        updateGhostPosition(ghostElement, touch.clientX, touch.clientY);

        category.classList.add('dragging');
      });

      // Handle touch move
      category.addEventListener('touchmove', (e) => {
        if (!draggedElement) return;

        const touch = e.touches[0];
        const currentY = touch.clientY;

        // Update ghost element position
        updateGhostPosition(ghostElement, touch.clientX, currentY);

        const afterElement = getDragAfterElement(container, currentY);
        if (afterElement) {
          container.insertBefore(draggedElement, afterElement);
        } else {
          container.appendChild(draggedElement);
        }

        initialY = currentY;
      });

      // Handle touch end
      category.addEventListener('touchend', () => {
        if (!draggedElement) return;

        draggedElement.classList.remove('dragging');
        draggedElement = null;

        // Remove the ghost element
        if (ghostElement) {
          ghostElement.remove();
          ghostElement = null;
        }

        // Update the menu structure
        const newCategories = [];
        const menuCategories = document.getElementsByClassName('menu-category');
        for (const category of menuCategories) {
          const categoryName = category.getElementsByClassName('menu-category-title')[0].value;
          const categoryItems = category.getElementsByClassName('menu-category-item');
          const items = [];
          for (const item of categoryItems) {
            const itemTitle = item.getElementsByClassName('item-title')[0].value;
            const itemDescription = item.getElementsByClassName('item-description')[0].value;
            const itemPrice = item.getElementsByClassName('item-price')[0].value;
            items.push({
              title: itemTitle,
              description: itemDescription,
              price: itemPrice,
            });
          }
          newCategories.push({
            name: categoryName,
            items: items,
          });
        }

        menu.categories = newCategories;
      });
    });

    // Handle dragging over the container
    container.addEventListener('dragover', (e) => {
      e.preventDefault();

      if (!draggedElement) return;

      const afterElement = getDragAfterElement(container, e.clientY);
      if (afterElement) {
        container.insertBefore(draggedElement, afterElement);
      } else {
        container.appendChild(draggedElement);
      }
    });

    // Prevent scrolling while dragging
    container.addEventListener('touchmove', (e) => {
      if (draggedElement) {
        e.preventDefault();
      }
    });
  }

  // Get the closest element
  function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.menu-category:not(.dragging)')];

    return (
      draggableElements.reduce(
        (closest, child) => {
          const box = child.getBoundingClientRect();
          const offset = y - box.top - box.height / 2;
          if (offset < 0 && offset > closest.offset) {
            return { offset, element: child };
          } else {
            return closest;
          }
        },
        { offset: Number.NEGATIVE_INFINITY }
      ).element || null
    );
  }

  // Helper function to update ghost element position
  function updateGhostPosition(ghostElement, x, y) {
    if (ghostElement) {
      const rect = ghostElement.getBoundingClientRect();
      const offsetX = rect.width / 2; // Half the width of the ghost element
      const offsetY = rect.height / 2; // Half the height of the ghost element

      ghostElement.style.left = `${x - offsetX}px`; // Center horizontally
      ghostElement.style.top = `${y - offsetY}px`; // Center vertically
    }
  }

  // Add event listener to the delete button
  const deleteMenuButton = document.getElementById('delete-menu-button');
  deleteMenuButton.addEventListener('click', async function () {
    // Toggle category drag off - moveCategoryButton make it click
    if (moveCategoryBool) {
      moveCategoryButton.click();
    }
    // Ask for confirmation
    const confirm = await renderConfirm('This menu will be deleted permanently. Are you sure?');
    if (!confirm) {
      return;
    }

    // Delete the menu
    await deleteMenu(token, menuId);
  });

  // Get the menu title element
  const menuTitle = document.getElementById('menu-title');
  menuTitle.value = menu.title;

  // Add event listener to the title input when the user leaves the input
  menuTitle.addEventListener('blur', async function () {
    // Check if the title is empty and set it to the previous value
    if (menuTitle.value === '') {
      menuTitle.value = menu.title;
      return;
    }
    // Check if the title is the same as the previous value
    if (menuTitle.value !== menu.title) {
      // Update the menu title
      menu.title = menuTitle.value;
      // Update the menu
      await updateMenu(token, menu);
      originalMenu = JSON.parse(JSON.stringify(menu));
    }
  });

  // Get the menu description element
  const menuDescription = document.getElementById('menu-description');
  menuDescription.value = menu.description;

  // Add event listener to the description input when the user leaves the input
  menuDescription.addEventListener('blur', async function () {
    // Check if the description is empty and set it to the previous value
    if (menuDescription.value === '') {
      menuDescription.value = menu.description;
      return;
    }
    // Check if the description is the same as the previous value
    if (menuDescription.value !== menu.description) {
      // Update the menu description
      menu.description = menuDescription.value;
      // Update the menu
      await updateMenu(token, menu);
      originalMenu = JSON.parse(JSON.stringify(menu));
    }
  });

  // Add event listener to the category select
  const menuCategorySelect = document.getElementById('menu-category-select');
  const menuCategoryTitleNew = document.getElementById('menu-category-title-new');
  menuCategorySelect.addEventListener('change', function () {
    if (menuCategorySelect.value === 'new') {
      menuCategoryTitleNew.classList.remove('hide');
    } else {
      menuCategoryTitleNew.classList.add('hide');
    }
  });

  // Add event listener to the add item button
  const menuCategoryForm = document.getElementById('menu-category-form');
  menuCategoryForm.addEventListener('submit', async function (event) {
    // Prevent the form from submitting and refreshing the page
    event.preventDefault();

    // Get the category select
    const menuCategoryTitleNew = document.getElementById('menu-category-title-new');

    // Get the category name
    const categoryName =
      menuCategorySelect.value === 'new' ? menuCategoryTitleNew.value : menuCategorySelect.value;

    // Get the category
    const category = menu.categories.find((c) => c.name === categoryName);

    // Form data
    const formData = new FormData(menuCategoryForm);
    const itemTitle = formData.get('item-title');
    const itemDescription = formData.get('item-description');
    const itemPrice = parseFloat(formData.get('item-price')).toFixed(2);

    // Create the item
    const item = {
      title: itemTitle,
      description: itemDescription,
      price: itemPrice,
    };

    // Add the item to the category
    if (!category) {
      // Create a new category
      const newCategory = {
        name: categoryName,
        items: [item],
      };
      menu.categories.push(newCategory);
    } else {
      category.items.push(item);
    }

    // Update the menu
    const menuResponse = await updateMenu(token, menu);
    if (menuResponse) {
      // Repopulate the menu
      await populateCategorySelect();
      await repopulateMenu(menu);
      originalMenu = JSON.parse(JSON.stringify(menu));
    }

    // Reset the form
    menuCategoryForm.reset();
    menuCategoryTitleNew.classList.remove('hide');
    menuCategoryTitleNew.classList.add('hide');
  });
});

//// FUNCTIONS ////
// Repopulate the menu
async function repopulateMenu(menu) {
  await depopulateMenu();
  await populateMenu(menu);
}

// Delete every element in the menu
async function depopulateMenu() {
  // Get the menu categories element
  const menuCategories = document.getElementById('menu-categories');

  // Loop through the children and remove them
  let child = menuCategories.firstChild;
  while (child) {
    const nextSibling = child.nextSibling;
    if (child.id !== 'menu-category-form' && child.id !== 'menu-top-buttons') {
      menuCategories.removeChild(child);
    }
    child = nextSibling;
  }
}

// Populate the category select
async function populateCategorySelect() {
  const menuCategorySelect = document.getElementById('menu-category-select');
  if (menu.color !== null && menu.color !== undefined && menu.color !== '') {
    menuCategorySelect.style.backgroundColor = 'var(' + menu.color + ')';
  }
  const categories = menu.categories;

  // Delete the current options except the first 2 (default and new)
  for (let i = menuCategorySelect.options.length - 1; i >= 2; i--) {
    menuCategorySelect.remove(i);
  }

  // Loop through the categories
  for (const category of categories) {
    const option = document.createElement('option');
    option.value = category.name;
    option.text = category.name;
    menuCategorySelect.add(option);
  }
}

// Populate the menu
async function populateMenu(menu) {
  // Get the menu categories element
  const menuCategories = document.getElementById('menu-categories');

  // Loop through the categories
  for (const category of menu.categories) {
    // Create the category element
    const menuCategory = document.createElement('div');
    menuCategory.className = 'menu-category';

    // Create the category title box element
    const menuCategoryTitleBox = document.createElement('div');
    menuCategoryTitleBox.className = 'menu-category-title-box';

    // Create the category title element
    const menuCategoryTitle = document.createElement('input');
    menuCategoryTitle.className = 'menu-category-title changable-title';
    menuCategoryTitle.type = 'text';
    menuCategoryTitle.placeholder = 'Category';
    menuCategoryTitle.value = category.name;

    // Category open button
    const menuCategoryOpen = document.createElement('button');
    menuCategoryOpen.className = 'menu-category-open';
    menuCategoryOpen.innerHTML = '<i class="fa fa-angle-left"></i>';

    // Append the elements to the category title box element
    menuCategoryTitleBox.appendChild(menuCategoryTitle);
    menuCategoryTitleBox.appendChild(menuCategoryOpen);

    // Append the category title box element to the category element
    menuCategory.appendChild(menuCategoryTitleBox);

    // Add event listener to the title input
    menuCategoryTitle.addEventListener('blur', async function () {
      // Check if the title is empty and set it to the previous value
      if (menuCategoryTitle.value === '') {
        menuCategoryTitle.value = category.name;
        return;
      }
      // Check if the title is the same as the previous value
      if (menuCategoryTitle.value !== category.name) {
        // Update the category title
        category.name = menuCategoryTitle.value;
        // Update the menu
        await updateMenu(token, menu);
        originalMenu = JSON.parse(JSON.stringify(menu));
        await populateCategorySelect();
      }
    });

    // Add event listener to the open button
    menuCategoryOpen.addEventListener('click', function () {
      // Toggle the items
      menuCategoryItems.classList.toggle('hide');
      // Change the icon
      if (menuCategoryItems.classList.contains('hide')) {
        menuCategoryOpen.innerHTML = '<i class="fa fa-angle-left"></i>';
      } else {
        menuCategoryOpen.innerHTML = '<i class="fa fa-angle-down"></i>';
      }
    });

    // Create the category items element
    const menuCategoryItems = document.createElement('div');
    menuCategoryItems.className = 'menu-category-items hide';

    // Create the category delete button
    const categoryDelete = document.createElement('button');
    categoryDelete.className = 'menu-category-delete';
    categoryDelete.innerHTML = '<i class="fa fa-trash"></i> Delete Category';

    // Add event listener to the delete button
    categoryDelete.addEventListener('click', async function () {
      // Ask for confirmation
      const confirm = await renderConfirm(
        'You will lose all the items in this category. Are you sure?'
      );
      if (!confirm) {
        return;
      }

      // Delete the category
      menu.categories = menu.categories.filter((c) => c !== category);

      // Update category select
      await populateCategorySelect();

      // Update the menu
      await updateMenu(token, menu);
      originalMenu = JSON.parse(JSON.stringify(menu));

      // Repopulate the menu
      await repopulateMenu(menu);
    });

    // Create a divider element
    const divider = document.createElement('div');
    divider.className = 'divider';

    // Append the divider to the categories element
    menuCategories.appendChild(divider);

    // Loop through the items
    for (const item of category.items) {
      // Create the item element
      const menuCategoryItem = document.createElement('div');

      if (item.image) {
        menuCategoryItem.className = 'menu-category-item menu-category-item-with-image';

        // Create the item image element
        const itemImage = document.createElement('img');
        itemImage.className = 'item-image';
        itemImage.src = item.image;
        itemImage.alt = 'Item Image';

        // Append the image to the item element
        menuCategoryItem.appendChild(itemImage);

        // Add event listener to the item image
        itemImage.addEventListener('click', async function () {
          // Create the item context element
          const contextForItemHTML = `
          <div id="context-item">
            <div id="context-item-box">
              <button id="context-item-edit" class="context-item-button"><i class="fa fa-edit"></i> Change Image</button>
              <div class="context-item-divider"></div>
              <button id="context-item-delete" class="context-item-button"><i class="fa fa-close"></i> Delete Image</button>
            </div>
          </div>
          `;

          // insert context item
          menuCategoryItem.insertAdjacentHTML('afterbegin', contextForItemHTML);

          // get context item
          const contextItem = document.getElementById('context-item');

          // animate context item
          contextItem.style.animation = 'fadeIn 0.3s';

          // Add event listener to the edit button
          const contextItemEdit = document.getElementById('context-item-edit');
          contextItemEdit.addEventListener('click', async function () {
            // Remove the context item
            contextItem.style.animation = 'fadeOut 0.2s';
            setTimeout(() => {
              contextItem.remove();
            }, 100);

            // Create the item add image input
            const itemAddImage = document.createElement('input');
            itemAddImage.className = 'item-add-image';
            itemAddImage.id = 'item-add-image';
            itemAddImage.name = 'item-add-image';
            itemAddImage.type = 'file';
            itemAddImage.accept = '.jpg, .jpeg, .png';
            itemAddImage.style.display = 'none';

            // Click the item add image input
            itemAddImage.click();

            // Add event listener to the item add image input
            itemAddImage.addEventListener('change', async function (e) {
              // Check if the image is compressed
              const compressedFile = await compressImage(e.target.files[0]);
              if (!compressedFile) {
                return renderPopup(
                  '⚠️ Please wait for the image to compress. Try again in 5 seconds.'
                );
              }

              // Upload the image
              const imageUrl = await uploadImage(compressedFile);
              if (!imageUrl) {
                return renderPopup(
                  '⚠️ There was an error uploading the image. Try again in 5 seconds.'
                );
              }

              // Change the item image
              itemImage.src = imageUrl;

              // Update the item image
              item.image = imageUrl;

              // Update the menu
              await updateMenu(token, menu);
              originalMenu = JSON.parse(JSON.stringify(menu));

            });
          });

          // Add event listener to the delete button
          const contextItemDelete = document.getElementById('context-item-delete');
          contextItemDelete.addEventListener('click', async function () {
            // Remove the context item
            contextItem.style.animation = 'fadeOut 0.2s';
            setTimeout(() => {
              contextItem.remove();
            }, 100);

            // Ask for confirmation
            const confirm = await renderConfirm('Are you sure you want to delete this image?');
            if (!confirm) {
              return;
            }

            // Delete the item image
            item.image = null;

            // Update the menu
            await updateMenu(token, menu);
            originalMenu = JSON.parse(JSON.stringify(menu));

            // Repopulate the menu
            await repopulateMenu(menu);
          });

          // On click outside of the context-item-box unrender context item
          contextItem.addEventListener('click', async (e) => {
            if (
              e.target.id !== 'context-item-box' &&
              e.target.id !== 'context-item-edit' &&
              e.target.id !== 'context-item-delete'
            ) {
              // Remove the context item
              contextItem.style.animation = 'fadeOut 0.2s';
              setTimeout(() => {
                contextItem.remove();
              }, 100);
            }
          });
        });
      } else {
        menuCategoryItem.className = 'menu-category-item';

        // Create the item add image input
        const itemAddImage = document.createElement('input');
        itemAddImage.className = 'item-add-image';
        itemAddImage.id = 'item-add-image';
        itemAddImage.name = 'item-add-image';
        itemAddImage.type = 'file';
        itemAddImage.accept = '.jpg, .jpeg, .png';
        itemAddImage.style.display = 'none';

        // Create label for the item add image input
        const itemAddImageLabel = document.createElement('label');
        itemAddImageLabel.innerHTML = '<i class="fa fa-photo"></i> Add Image';
        itemAddImageLabel.htmlFor = 'item-add-image';

        // Append the label to the item element
        menuCategoryItem.appendChild(itemAddImageLabel);
        menuCategoryItem.appendChild(itemAddImage);

        // Add event listener to the item add image input
        itemAddImage.addEventListener('change', async function (e) {
          // Check if the image is compressed
          const compressedFile = await compressImage(e.target.files[0]);
          if (!compressedFile) {
            return renderPopup('⚠️ Please wait for the image to compress. Try again in 5 seconds.');
          }

          // Upload the image
          const imageUrl = await uploadImage(compressedFile);
          if (!imageUrl) {
            return renderPopup(
              '⚠️ There was an error uploading the image. Try again in 5 seconds.'
            );
          }

          // Update the item image
          item.image = imageUrl;

          // Update the menu
          await updateMenu(token, menu);
          originalMenu = JSON.parse(JSON.stringify(menu));

          // Repopulate the menu
          await repopulateMenu(menu);
        });
      }

      // Create the item title element
      const itemTitle = document.createElement('input');
      itemTitle.className = 'item-title changable-title';
      itemTitle.type = 'text';
      itemTitle.placeholder = 'Item';
      itemTitle.value = item.title;

      // Create the item description element
      const itemDescription = document.createElement('input');
      itemDescription.className = 'item-description changable-title';
      itemDescription.type = 'text';
      itemDescription.placeholder = 'Description';
      itemDescription.value = item.description;

      // Create the item price element
      const itemPrice = document.createElement('input');
      itemPrice.className = 'item-price changable-title';
      itemPrice.type = 'number';
      itemPrice.placeholder = '0.00';
      itemPrice.value = item.price;

      // Create the item delete button
      const itemDelete = document.createElement('button');
      itemDelete.className = 'item-delete';
      itemDelete.innerHTML = '<i class="fa fa-trash"></i> Remove Item';

      // Add event listener to item delete button
      itemDelete.addEventListener('click', async function () {
        // Ask for confirmation
        const confirm = await renderConfirm('Are you sure you want to delete this item?');
        if (!confirm) {
          return;
        }

        // Delete the item
        category.items = category.items.filter((i) => i !== item);

        // Update the menu
        await updateMenu(token, menu);
        originalMenu = JSON.parse(JSON.stringify(menu));

        // Repopulate the menu
        await repopulateMenu(menu);
      });

      // Append the elements to the item element
      menuCategoryItem.appendChild(itemTitle);
      menuCategoryItem.appendChild(itemDescription);
      menuCategoryItem.appendChild(itemPrice);
      menuCategoryItem.appendChild(itemDelete);

      // Append the item element to the items element
      menuCategoryItems.appendChild(menuCategoryItem);

      // Create a divider element
      const divider = document.createElement('div');
      divider.className = 'divider-dark';

      // Append the divider after the categories items element
      menuCategoryItems.appendChild(divider);

      // Add event listener to the title input
      itemTitle.addEventListener('blur', async function () {
        // Check if the title is empty and set it to the previous value
        if (itemTitle.value === '') {
          itemTitle.value = item.title;
          return;
        }
        // Check if the title is the same as the previous value
        if (itemTitle.value !== item.title) {
          // Update the item title
          item.title = itemTitle.value;
          // Update the menu
          await updateMenu(token, menu);
          originalMenu = JSON.parse(JSON.stringify(menu));
        }
      });

      // Add event listener to the description input
      itemDescription.addEventListener('blur', async function () {
        // Check if the description is empty and set it to the previous value
        if (itemDescription.value === '') {
          itemDescription.value = item.description;
          return;
        }
        // Check if the description is the same as the previous value
        if (itemDescription.value !== item.description) {
          // Update the item description
          item.description = itemDescription.value;
          // Update the menu
          await updateMenu(token, menu);
          originalMenu = JSON.parse(JSON.stringify(menu));
        }
      });

      // Add event listener to the price input
      itemPrice.addEventListener('blur', async function () {
        // Check if the price is empty and set it to the previous value
        if (itemPrice.value === '') {
          itemPrice.value = item.price;
          return;
        }
        // Check if the price is the same as the previous value
        if (itemPrice.value !== item.price) {
          // Update the item price
          item.price = parseFloat(itemPrice.value).toFixed(2);
          // Update the menu
          await updateMenu(token, menu);
          originalMenu = JSON.parse(JSON.stringify(menu));
        }
      });
    }

    // Append the items element to the category element
    menuCategory.appendChild(menuCategoryItems);

    // Append the category to the categories element
    menuCategories.appendChild(menuCategory);

    // Append the delete button to the category element
    menuCategory.appendChild(categoryDelete);
  }
}
