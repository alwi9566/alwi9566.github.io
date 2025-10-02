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