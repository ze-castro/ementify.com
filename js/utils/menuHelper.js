import { compressImage } from '/js/utils/compressImage.js';
import { uploadImage } from '/js/utils/imageUpload.js';

//// MENU HELPER FUNCTIONS ////
//// COLOR CHANGING ////
// render colors
function renderColors(originalColor) {
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
      let color = null;
      // change color
      switch (e.target.id) {
        case 'color-1':
          color = '--green';
          break;
        case 'color-2':
          color = '--blue';
          break;
        case 'color-3':
          color = '--light-blue';
          break;
        case 'color-4':
          color = '--yellow';
          break;
        case 'color-5':
          color = '--red';
          break;
        case 'color-6':
          color = '--orange';
          break;
        case 'color-7':
          color = '--pink';
          break;
        case 'color-8':
          color = '--purple';
          break;
        case 'color-9':
          color = '--black';
          break;
        case 'color-10':
          color = '--gray-5';
          break;
        case 'color-11':
          color = '--gray-4';
          break;
        case 'color-12':
          color = '--gray-3';
          break;
        default:
          color = originalColor;
          break;
      }
      resolve(color, unrenderColors(0));
    });
  });
}

// unrender colors
function unrenderColors(time = 0) {
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

//// ADD IMAGE ////
// Render add image to menu modal
function renderAddImageToMenu() {
  return new Promise((resolve) => {
    const addImageToMenuHTML = `
      <div id="image-modal">
        <div id="image-modal-box">
          <h2>Add an image to the menu</h2>
          <form id="image-modal-form" autocomplete="new-password">
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
        resolve(unrenderAddImageToMenu());
      }

      // show the preview image
      previewImage.style.display = 'block';
      // compress the image
      const file = e.target.files[0];
      compressedFile = await compressImage(file);

      // Check if the image is a valid file
      if (!compressedFile.error) {
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
      // unrender add image to menu
      unrenderAddImageToMenu();

      // upload the image
      const imageUrl = await uploadImage(compressedFile);
      resolve(imageUrl);
    });

    // On click outside of the image-modal-box unrender add image to menu
    addImageToMenu.addEventListener('click', async (e) => {
      if (e.target.id === 'image-modal') {
        resolve(unrenderAddImageToMenu());
      }
    });
  });
}

// Unrender add image to menu
function unrenderAddImageToMenu(time = 0) {
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

//// CATEGORY AND ITEM ID GENERATION ////
function generateRandomId(menu, length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';

  // Generate a random id
  for (let i = 0; i < length; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }

  // Check if the id already exists in categories
  if (menu.some((category) => category.id === id)) {
    return generateRandomId(menu, length);
  }

  // Check if the id already exists in items
  if (menu.some((category) => category.items.some((item) => item.id === id))) {
    return generateRandomId(menu, length);
  }

  return id;
}

//// CATEGORY DRAG AND DROP ////
// When category drag on click the button to save the order
function checkCategoryDrag(moveCategoryBool) {
  const moveCategoryButton = document.getElementById('move-menu-button');
  if (moveCategoryBool) {
    moveCategoryButton.click();
  }
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

// Helper function to check if the categories order has changed
async function compareCategoriesOrder(newCategories, oldCategories) {
  // If the length of the categories is different, the order has changed
  if (newCategories.length !== oldCategories.length) {
    return true;
  }

  // If the id of the categories is different, the order has changed
  for (let i = 0; i < newCategories.length; i++) {
    if (newCategories[i].id !== oldCategories[i].id) {
      return true;
    }
  }

  return false;
}

// Helper function to get the categories in the order they appear on the page
async function getCategoriesByOrder(categories) {
  // Create an array to store the categories in the order they appear on the page
  const categoriesArray = [];
  const categoriesElements = document.getElementsByClassName('menu-category');
  for (const category of categoriesElements) {
    const categoryName = category.getElementsByClassName('menu-category-title')[0].value;

    categoriesArray.push({
      name: categoryName,
    });
  }

  // Organize the categories in the order they appear on the page
  for (let i = 0; i < categoriesArray.length; i++) {
    for (let j = 0; j < categories.length; j++) {
      if (categoriesArray[i].name === categories[j].name) {
        categoriesArray[i].id = categories[j].id;
        categoriesArray[i].items = categories[j].items;
      }
    }
  }

  return categoriesArray;
}

export {
  renderColors,
  renderAddImageToMenu,
  checkCategoryDrag,
  compareCategoriesOrder,
  getCategoriesByOrder,
  getDragAfterElement,
  updateGhostPosition,
  generateRandomId,
};
