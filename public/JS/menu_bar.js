/* GESTIONE NAVBAR (Smartphone + Profilo) */

document.addEventListener('DOMContentLoaded', async function() {
    
    const men_sm = document.getElementById('menu_smartphone');
    const navMenu = document.getElementById('nav_menu');
    
    if (men_sm && navMenu) 
    {
        men_sm.addEventListener('click', () => {
            navMenu.classList.toggle('open');
            men_sm.classList.toggle('open');
        });
    }


    const userBtn = document.getElementById('userBtn');
    const userMenu = document.getElementById('userMenu');

    if (userBtn && userMenu) {
        userBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Impedisce la chiusura immediata
            userMenu.classList.toggle('show');
        });

        // Chiudi la tendina se clicchi ovunque fuori dal menu
        document.addEventListener('click', (e) => {
            if (!userMenu.contains(e.target) && !userBtn.contains(e.target)) {
                userMenu.classList.remove('show');
            }
        });
    }

    
});