//// MENU HELPER FUNCTIONS ////

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

export { compareCategoriesOrder, getCategoriesByOrder, getDragAfterElement, updateGhostPosition, generateRandomId };
