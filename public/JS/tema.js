document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('themeBtn');
    const menu = document.getElementById('themeMenu');

    // Apre/Chiude la tendina
    btn.onclick = (e) => {
        e.stopPropagation();
        menu.classList.toggle('show');
    };

    // Chiude se clicchi fuori
    window.onclick = () => menu.classList.remove('show');

    // Applica il tema salvato all'avvio
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);
});


function applyTheme(theme) {
   
    document.body.classList.toggle('theme-dark', theme === 'dark');
    localStorage.setItem('theme', theme);
    const radio = document.querySelector(`input[value="${theme}"]`);
    if (radio) radio.checked = true;
}