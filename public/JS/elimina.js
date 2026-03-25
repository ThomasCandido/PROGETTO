document.addEventListener('DOMContentLoaded', function() {
    // Peschiamo tutte le caselline di spunta e il bottone cestino
    const checkboxes = document.querySelectorAll('input[name="ordine_sel"]');
    const btnElimina = document.getElementById('btn_elimina_multiplo');
    
    // Funzione che conta le spunte
    function controllaSelezioni() {
            // Cerca quante caselline hanno lo stato "checked" (spuntato)
            const selezionati = document.querySelectorAll('input[name="ordine_sel"]:checked').length;
            
            // Se c'è almeno 1 spunta, aggiungi la classe per far apparire il bottone
            if (selezionati > 0) {
                btnElimina.classList.add('mostra');
            } else {
                // Altrimenti togli la classe per farlo rimpicciolire e sparire
                btnElimina.classList.remove('mostra');
            }
        }

        // Diamo l'ordine a ogni casellina di eseguire la funzione quando viene cliccata
        checkboxes.forEach(box => {
            box.addEventListener('change', controllaSelezioni);
        });
}); 