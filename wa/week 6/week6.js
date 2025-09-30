const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu'); 

function showMenu() {
    console.log("Button clicked!"); 
    const show = navMenu.classList.toggle("show");
    console.log("Show class added:", show); 
    
    // Update aria-expanded for accessibility
    if (show) {
        navToggle.setAttribute("aria-expanded", "true");
    }
    else {
        navToggle.setAttribute("aria-expanded", "false");
    }
}

navToggle.addEventListener('click', showMenu);

navToggle.addEventListener('keydown', function(event) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        showMenu();
    }
});
// Dropdown functionality
const dropdownBtn = document.querySelector('.dropdown-btn');
const dropdownMenu = document.querySelector('.dropdown-menu');

dropdownBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdownMenu.classList.toggle('show');
    dropdownBtn.classList.toggle('active');
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.dropdown')) {
        dropdownMenu.classList.remove('show');
        dropdownBtn.classList.remove('active');
    }
});

// Close dropdown when clicking a link
dropdownMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        dropdownMenu.classList.remove('show');
        dropdownBtn.classList.remove('active');
    });
});

// Contact form functionality
const contactForm = document.getElementById('contactForm');
const successMessage = document.getElementById('successMessage');

if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            subject: document.getElementById('subject').value,
            message: document.getElementById('message').value
        };
        
        console.log('Form submitted with data:', formData);
        console.log('Simulating email send to backend...');
        
        successMessage.classList.add('show');
        contactForm.reset();
        
        setTimeout(() => {
            successMessage.classList.remove('show');
        }, 5000);
    });
}