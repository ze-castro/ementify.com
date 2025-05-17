// Animate on scroll
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  },
  { threshold: 0.2 }
);

const elementsToObserve = ['.logo', '.card', '.box', '.contact-box']
  .flatMap((selector) =>
    selector.includes('.')
      ? Array.from(document.querySelectorAll(selector))
      : [document.querySelector(selector)]
  )
  .filter(Boolean);

elementsToObserve.forEach((el) => observer.observe(el));

// HOME
// when scroll, hide arrow
const arrow = document.getElementById('arrow');

window.addEventListener('scroll', () => {
  if (window.scrollY > 10) {
    arrow.style.opacity = 0;
  } else {
    arrow.style.opacity = 1;
  }
});

// start button click redirects to pricing
const startButton = document.getElementById('start-button');
startButton.addEventListener('click', () => {
  const pricing = document.getElementById('pricing');
  pricing.scrollIntoView({ behavior: 'smooth' });
});

// learn-more-link click redirects to pricing
const learnMoreLink = document.getElementById('learn-more-link');
learnMoreLink.addEventListener('click', () => {
  const pricing = document.getElementById('pricing');
  pricing.scrollIntoView({ behavior: 'smooth' });
});

// FEATURES
// onclick of the demo button open in new tab
const demoButton = document.getElementById('demo-button');
demoButton.addEventListener('click', () => {
  window.open('https://ementify.com/demo', '_blank', 'noopener');
});

// PRICING
// onclick of the pricing buttons
const freeButton = document.getElementById('free-button');

// redirect to sign up page
freeButton.addEventListener('click', () => {
  window.location.href = '/sign-up';
});

// FAQ
// onclick of the faq boxes
document
  .querySelectorAll('.box')
  .forEach((box) => box.addEventListener('click', () => toggleDescription(box)));

// expand faq boxes
function toggleDescription(box) {
  // get all the boxes
  var boxes = document.querySelectorAll('.box');

  // add border-top to all boxes
  boxes.forEach((b) => {
    b.style.borderTop = '1px solid var(--gray-1)';
  });

  // check if the box is expanded
  if (box.classList.contains('expanded')) {
    box.classList.remove('expanded');
    return;
  }

  // the border-top of the next sibling must be removed
  var nextSibling = box.nextElementSibling;
  if (nextSibling) {
    nextSibling.style.borderTop = 'none';
  }

  // toggle the expanded class
  box.classList.toggle('expanded');

  // if any other box is expanded, close it
  boxes.forEach((b) => {
    if (b !== box) {
      b.classList.remove('expanded');
    }
  });
}

// CONTACT
// onclick of the contact box
const contactEmail = document.getElementById('contact-email');
contactEmail.addEventListener('click', () => {
  window.location.href = 'mailto:info@ementify.com';
});
