
// Funzione per mostrare l'avvertimento di eliminazione ordine e attendere la risposta
function chiediConfermaPersonalizzata(messaggio) {
    return new Promise((resolve) => {
        // 1. Crezione del contenitore pop up ( assicurarsi che l'utete sia intenzionato a canc ordine)
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style.display = 'flex'; // Lo mostriamo subito

        // 2. creazione dei tag html del pop up
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>⚠️ Conferma Eliminazione</h3>
                </div>
                <div class="modal-body">
                    <p>${messaggio}</p>
                    <p><small>L'azione è irreversibile.</small></p>
                </div>
                <div class="modal-footer">
                    <button id="btn-annulla-delete" class="btn-secondario">Annulla</button>
                    <button id="btn-conferma-delete" class="btn-pericolo">Elimina</button>
                </div>
            </div>
        `;

        // 3. Lo aggiungiamo al body della pagina
        document.body.appendChild(modal);

        // 4. Gestione dei click
        const btnSi = modal.querySelector('#btn-conferma-delete');
        const btnNo = modal.querySelector('#btn-annulla-delete');

        btnSi.onclick = () => {
            document.body.removeChild(modal); // Rimuove il popup dal DOM
            resolve(true);
        };

        btnNo.onclick = () => {
            document.body.removeChild(modal); // Rimuove il popup dal DOM
            resolve(false);
        };
    });
}


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
        const confermato = await chiediConfermaPersonalizzata(`Sei sicuro di voler eliminare ${ids.length} ordine/i?`);
    
        if (!confermato) return; // Se ha cliccato annulla, rolleback situazione

        // PREPARAZIONE DEGLI ID ORDINI DA MANDARE AL SERVER PER ESERE CESTINATI
        try {
            const response = await fetch('/api/delete-orders', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: ids })
            });

            const result = await response.json();

            // GENERAZIONE DEL TOAST CHECK RISULTATO OPERAZIONE DELEDE
            if (result.success) 
            {
                mostraToast(result.message, "success"); 
                setTimeout(() => { location.reload(); }, 2000);
            } 
            else 
            {
                mostraToast("❌ Errore: " + result.message, "error");
            }
        } catch (err) {
            console.error("Errore durante l'eliminazione:", err);
            mostraToast("⚠️ Si è verificato un errore di rete.", "error");
        }
    });
});