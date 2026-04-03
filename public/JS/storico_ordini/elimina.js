document.addEventListener('DOMContentLoaded', () => {
    const btnElimina = document.getElementById('btn_elimina_multiplo');
    const listaUl = document.querySelector('.lista_ordini');

    // Mostra/Nasconde il tasto
    listaUl.addEventListener('change', () => {
        const selezionati = listaUl.querySelectorAll('input[name="ordine_sel"]:checked').length;
        if (selezionati > 0) 
        {
            btnElimina.classList.add('mostra');
        } 
        else 
        {
            btnElimina.classList.remove('mostra');
        }
    });

    // Azione di eliminazione al click sul cestino
    btnElimina.addEventListener('click', async () => {
        const checkboxSelezionate = listaUl.querySelectorAll('input[name="ordine_sel"]:checked');
        const ids = Array.from(checkboxSelezionate).map(cb => cb.value);

        if (ids.length === 0) return;

        // Chiediamo conferma (sempre meglio non cancellare per errore!)
        if (!confirm(`Sei sicuro di voler eliminare ${ids.length} ordine/i? L'azione è irreversibile.`)) {
            return;
        }

        try {
            const response = await fetch('/api/delete-orders', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: ids })
            });

            const result = await response.json();

            if (result.success) {
                alert(result.message);
                // Invece di ricaricare la pagina, chiamiamo la funzione che aggiorna la lista
                // Se la funzione è globale in storico_ordini.js, possiamo usarla qui
                location.reload(); 
            } else {
                alert("Errore: " + result.message);
            }
        } catch (err) {
            console.error("Errore durante l'eliminazione:", err);
            alert("Si è verificato un errore di rete.");
        }
    });
});