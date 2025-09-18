const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu'); 


var menu_show = false

function showMenu() {
    var shown = navMenu.classList.toggle("show");
    navMenu.classList.toggle("hide");

    if (show) {
        navToggle.setAttribute("aria-expanded", "true");
    }

    else {
        navToggle.setAttribute("aria-expanded", "false");
    }

}

navToggle.addEventListener('click', showMenu);

/*kjasdhflkjahfjharefi*/