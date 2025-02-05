// Variables
var menu = {
  title: 'The Rustic Spoon',
  description: 'WIFI: TheRustic123 | Opening hours: 10:00 - 22:00',
  image: 'https://i.ibb.co/kVxrmCBH/menu.jpg',
  color: '--green',
  categories: [
    {
      name: 'Breakfast',
      items: [
        {
          title: 'Classic Pancakes',
          description: 'Fluffy pancakes served with maple syrup and butter.',
          price: 8,
          image: 'https://i.ibb.co/dwWDjB23/1.jpg',
        },
        {
          title: 'Avocado Toast',
          description:
            'Sourdough toast topped with fresh avocado, cherry tomatoes, and feta cheese.',
          price: 10,
          image: 'https://i.ibb.co/HMrKQ0p/2.jpg',
        },
      ],
    },
    {
      name: 'Lunch & Dinner',
      items: [
        {
          title: 'Grilled Chicken Salad',
          description: 'Mixed greens, grilled chicken, cherry tomatoes, and a light vinaigrette.',
          price: 12,
          image: 'https://i.ibb.co/b5bjYsjn/3.jpg',
        },
        {
          title: 'Rustic Burger',
          description: 'Juicy beef patty, lettuce, tomato, cheddar cheese, and special sauce.',
          price: 15,
          image: 'https://i.ibb.co/gLPLNs0L/4.jpg',
        },
      ],
    },
    {
      name: 'Desserts',
      items: [
        {
          title: 'Homemade Apple Pie',
          description: 'Classic apple pie with a flaky crust and a scoop of vanilla ice cream.',
          price: 7,
          image: 'https://i.ibb.co/VcVBk6NT/5.jpg',
        },
        {
          title: 'Chocolate Brownie',
          description: 'Rich and fudgy brownie served with a drizzle of chocolate sauce.',
          price: 6,
          image: 'https://i.ibb.co/xKTw9yBb/6.jpg',
        },
      ],
    },
    {
      name: 'Beverages',
      items: [
        {
          title: 'Fresh Lemonade',
          description: 'Refreshing homemade lemonade with a hint of mint.',
          price: 5,
          image: 'https://i.ibb.co/gZzVc3m2/7.jpg',
        },
        {
          title: 'Cappuccino',
          description: 'Freshly brewed espresso with steamed milk and frothy foam.',
          price: 4,
          image: 'https://i.ibb.co/C5C6sZJR/8.jpg',
        },
      ],
    },
  ],
};

// On load
document.addEventListener('DOMContentLoaded', async function () {
  // Update the footer
  const footer = document.getElementsByTagName('footer')[0];
  footer.innerHTML = `<p>Created at <a href="https://www.ementify.com" target="_blank">Ementify.com</a></p>`;

  // Change the menu image
  if (menu.image) {
    const menuImage = document.getElementById('menu-image');
    menuImage.src = menu.image;
    menuImage.style.display = 'block';
  }

  // Change the menu name
  const menuName = document.getElementById('menu-name');
  menuName.innerHTML = menu.title;

  // Change the menu description
  const menuDescription = document.getElementById('menu-description');
  menuDescription.innerHTML = menu.description;

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
    if (item.image) {
      itemDiv.className = 'item item-with-image';
      itemDiv.innerHTML = `
        <img class="item-image" src="${item.image}" alt="${item.title}">
        <h2 class="item-name">${item.title}</h2>
        <p class="item-description">${item.description}</p>
        <p class="item-price">${'€ ' + item.price}</p>
      `;
    } else {
      itemDiv.className = 'item';
      itemDiv.innerHTML = `
        <h2 class="item-name">${item.title}</h2>
        <p class="item-description">${item.description}</p>
        <p class="item-price">${'€ ' + item.price}</p>
      `;
    }

    container.appendChild(itemDiv);
  });
}
