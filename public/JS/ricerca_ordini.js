document.addEventListener('DOMContentLoaded', () => {
    const inputRicerca = document.getElementById('inputRicerca');

    inputRicerca.addEventListener('input', () => {
        const query = inputRicerca.value.toLowerCase();
        // Cerchiamo i li creati dinamicamente
        const ordini = document.querySelectorAll('.lista_ordini > li');

        for (let i = 0; i < ordini.length; i++) {
            // Cerchiamo il testo dentro l'ordine (Cliente, Marca, Note...)
            const testoOrdine = ordini[i].innerText.toLowerCase();
            
            if (testoOrdine.includes(query)) {
                // Il tuo CSS usa display: flex per i li, quindi lo ripristiniamo
                ordini[i].style.display = 'flex';
            } else {
                ordini[i].style.display = 'none';
            }
        }
    });
});