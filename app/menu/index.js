import { isTokenInLocalStorage } from '/js/utils/isTokenInLocalStorage.js';
import { getMenu, updateMenu, deleteMenu } from '/js/functions/menu.js';
import { renderConfirm } from '/js/components/confirm.js';
import { renderModal } from '/js/components/modal.js';

// Variables
var menu = null;

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

  // Render the menu
  await populateCategorySelect();
  await populateMenu(menu);

  //// EVENT LISTENERS ////
  // Add event listener to the view button
  const viewButton = document.getElementById('view-button');
  viewButton.addEventListener('click', async function () {
    window.location.href = '/view?id=' + menuId;
  });

  // Add event listener to the QR code button
  const qrButton = document.getElementById('qr-code-button');
  qrButton.addEventListener('click', async function () {
    // Get the QR code
    const qrCode =
      'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://www.ementify.com/view?id=' +
      menuId;

    // Render the modal
    await renderModal('Scan the QR code to view the menu or download it.', 'Download', qrCode);
  });

  // Add event listener to the delete button
  const deleteMenuButton = document.getElementById('delete-menu-button');
  deleteMenuButton.addEventListener('click', async function () {
    // Ask for confirmation
    const confirm = await renderConfirm('Are you sure you want to delete this menu?');
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
    const itemPrice = formData.get('item-price');

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
    }

    // Reset the form
    menuCategoryForm.reset();
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
    if (child.id !== 'menu-category-form') {
      menuCategories.removeChild(child);
    }
    child = nextSibling;
  }
}

// Populate the category select
async function populateCategorySelect() {
  const menuCategorySelect = document.getElementById('menu-category-select');
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
      const confirm = await renderConfirm('Are you sure you want to delete this category?');
      if (!confirm) {
        return;
      }

      // Delete the category
      menu.categories = menu.categories.filter((c) => c !== category);

      // Update category select
      await populateCategorySelect();

      // Update the menu
      await updateMenu(token, menu);

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
      menuCategoryItem.className = 'menu-category-item';

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
      itemPrice.placeholder = '0.0';
      itemPrice.value = item.price;

      // Create the item delete button
      const itemDelete = document.createElement('button');
      itemDelete.className = 'item-delete';
      itemDelete.innerHTML = '<i class="fa fa-trash"></i> Remove Item';

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
          item.price = itemPrice.value;
          // Update the menu
          await updateMenu(token, menu);
        }
      });

      // Add event listener to the delete button
      itemDelete.addEventListener('click', async function () {
        // Delete the item
        category.items = category.items.filter((i) => i !== item);

        // Update the menu
        await updateMenu(token, menu);

        // Repopulate the menu
        await repopulateMenu(menu);
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
