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

async function compareCategoriesOrder(newCategories, oldCategories) {
  // If the length of the categories is different, the order has changed
  if (newCategories.length !== oldCategories.length) {
    return false;
  }

  // If the id of the categories is different, the order has changed
  for (let i = 0; i < newCategories.length; i++) {
    if (newCategories[i].id !== oldCategories[i].id) {
      return false;
    }
  }

  return true;
}

async function processDraggedCategories(categories) {
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

export { compareCategoriesOrder, processDraggedCategories, generateRandomId };
