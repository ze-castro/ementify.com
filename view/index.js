import { getMenuClient } from '/js/functions/clientMenu.js';

// Variables
var menu = null;

// On load
document.addEventListener('DOMContentLoaded', async function () {
  // Update the footer
  const footer = document.getElementsByTagName('footer')[0];
  footer.innerHTML = `<p>Created at <a href="https://www.ementify.com" target="_blank">Ementify.com</a></p>`;

  // Get the menu ID from the URL
  const urlParams = new URLSearchParams(window.location.search);
  const menuId = urlParams.get('id');

  // Get menu
  menu = await getMenuClient(menuId);

  // Change the menu name
  const menuName = document.getElementById('menu-name');
  menuName.innerHTML = menu.title;

  //// Populate the menu ////
  const viewList = document.getElementById('view-list');

  // Populate categories dynamically
  menu.categories.forEach((category, index) => {
    const categoryButton = document.createElement('button');
    categoryButton.className = 'category';
    if (menu.color) {
      categoryButton.style.backgroundColor = 'var(' + menu.color + ')';
    }
    categoryButton.dataset.index = index;
    categoryButton.innerHTML = `${category.name} <i class="fa fa-angle-left"></i>`;
    viewList.appendChild(categoryButton);

    const itemsContainer = document.createElement('div');
    itemsContainer.className = 'view-items';
    itemsContainer.dataset.index = index;
    itemsContainer.style.display = 'none';
    viewList.appendChild(itemsContainer);

    categoryButton.addEventListener('click', () => {
      toggleCategory(index, category.items);
    });
  });
});

//// FUNCTIONS ////
// Toggle category and display its items
function toggleCategory(index, items) {
  // Toggle the class of the fa
  document.querySelectorAll('.category').forEach((categoryButton) => {
    if (categoryButton.dataset.index === index.toString()) {
      categoryButton.querySelector('i').className =
        categoryButton.querySelector('i').className === 'fa fa-angle-left'
          ? 'fa fa-angle-down'
          : 'fa fa-angle-left';
    } else {
      categoryButton.querySelector('i').className = 'fa fa-angle-left';
    }
  });
  // Clear other categories' items
  document.querySelectorAll('.view-items').forEach((container) => {
    if (container.dataset.index === index.toString()) {
      container.style.display = container.style.display === 'none' ? 'flex' : 'none';
      if (container.style.display === 'flex') {
        populateItems(container, items);
      }
    } else {
      container.style.display = 'none';
      container.innerHTML = '';
    }
  });

  // Scroll to the selected category
  const categoryButton = document.querySelector(`.category[data-index="${index}"]`);
  categoryButton.scrollIntoView({ behavior: 'smooth' });
}

// Populate items under the selected category
function populateItems(container, items) {
  container.innerHTML = '';
  items.forEach((item) => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'item';
    itemDiv.innerHTML = `
      <h2 class="item-name">${item.title}</h2>
      <p class="item-description">${item.description}</p>
      <p class="item-price">${'€ ' + item.price}</p>
    `;
    container.appendChild(itemDiv);
  });
}
