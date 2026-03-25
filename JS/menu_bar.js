/* SWITCH STYLE MENU BAR DA PC A SMARTPHONE*/

document.addEventListener('DOMContentLoaded', function() {
    const men_sm = document.getElementById('menu_smartphone');
    const navMenu = document.getElementById('nav_menu');
    
    men_sm.addEventListener('click', () => 
    {
        // Aggiunge o toglie la classe "open" al menù e all'hamburger
        navMenu.classList.toggle('open');
        men_sm.classList.toggle('open');
    });
});