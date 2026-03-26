document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('filterBtn');
    const menu = document.getElementById('filterMenu');

    if (btn && menu) {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            menu.classList.toggle('show');
        });

        document.addEventListener('click', (e) => {
            if (!menu.contains(e.target) && e.target !== btn) {
                menu.classList.remove('show');
            }
        });
    } else {
        console.error("Errore: Bottone o Menu non trovati nell'HTML!");
    }
});