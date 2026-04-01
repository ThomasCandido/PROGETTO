document.addEventListener('DOMContentLoaded', function() {

    // Recuperiamo il bottone "Elimina Selezionati"
    const btnEliminaMultiplo = document.getElementById('btn-elimina-selezionati');

    /* =========================================
       1. LOGICA PER: AGGIUNGI CLIENTE
       ========================================= */
    const formAggiunta = document.querySelector('.form-aggiunta-cliente form');

    if (formAggiunta) {
        formAggiunta.addEventListener('submit', function(e) {
            e.preventDefault();

            const nuovoCliente = {
                societa: document.getElementById('societa').value,
                email: document.getElementById('email').value,
                telefono: document.getElementById('telefono').value,
                nome: document.getElementById('nome').value,
                cognome: document.getElementById('cognome').value
            };

            let clientiSalvati = JSON.parse(localStorage.getItem('databaseClienti')) || [];
            clientiSalvati.push(nuovoCliente);
            localStorage.setItem('databaseClienti', JSON.stringify(clientiSalvati));

            window.location.href = 'lista_clienti.html';
        });
    }

    /* =========================================
       2. LOGICA PER: LISTA CLIENTI (FLASHCARDS)
       ========================================= */
    const contenitoreClienti = document.getElementById('contenitore-clienti');

    if (contenitoreClienti) {
        let clientiSalvati = JSON.parse(localStorage.getItem('databaseClienti')) || [];

        if (clientiSalvati.length === 0) {
            contenitoreClienti.innerHTML = '<p style="text-align:center; grid-column: 1/-1; font-size: 1.2rem; color: #555;">Nessun cliente registrato. <br><br> <a href="aggiungi_cliente.html" style="color: cadetblue; text-decoration: underline;">Aggiungi il tuo primo cliente</a></p>';
            return;
        }

        clientiSalvati.forEach(function(cliente, index) {
            const card = document.createElement('div');
            card.className = 'card-cliente';

            card.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px;">
                    <input type="checkbox" class="seleziona-cliente" value="${index}">
                    <p class="nome-societa">${cliente.societa}</p>
                </div>
                    
                <ul class="dettagli">
                    <li><strong>Referente:</strong> ${cliente.nome} ${cliente.cognome}</li>
                    <li><strong>Email:</strong> <a href="mailto:${cliente.email}">${cliente.email}</a></li>
                    <li><strong>Telefono:</strong> <a href="tel:${cliente.telefono}">${cliente.telefono}</a></li>
                </ul>
                <div class="azioni">
                    <button class="botton_elemem_lista" onclick="modificaCliente(${index})">Modifica</button>
                    <button class="botton_elemem_lista btn-elimina" onclick="eliminaCliente(${index})">Elimina</button>
                </div>
            `;

            contenitoreClienti.appendChild(card);
        });

        // ---------------------------------------------------------
        // NOVITÀ: CONTROLLO DELLE SPUNTE PER MOSTRARE IL BOTTONE
        // ---------------------------------------------------------
        contenitoreClienti.addEventListener('change', function(e) {
            // Controlliamo se l'elemento cliccato è una nostra checkbox
            if (e.target.classList.contains('seleziona-cliente')) {
                // Contiamo quante checkbox hanno la spunta
                const spunteAttive = document.querySelectorAll('.seleziona-cliente:checked').length;
                
                // Se ce n'è almeno una, mostriamo il bottone, altrimenti lo nascondiamo
                if (spunteAttive > 0) {
                    btnEliminaMultiplo.style.display = 'inline-block';
                    // Aggiorniamo anche il testo del bottone per mostrare il numero!
                    btnEliminaMultiplo.innerHTML = `🗑️ Elimina ${spunteAttive} Clienti Selezionati`;
                } else {
                    btnEliminaMultiplo.style.display = 'none';
                }
            }
        });
    }

    /* =========================================
       3. LOGICA PER: ELIMINA CLIENTI SELEZIONATI
       ========================================= */
    if (btnEliminaMultiplo) {
        btnEliminaMultiplo.addEventListener('click', function() {
            const checkboxSelezionate = document.querySelectorAll('.seleziona-cliente:checked');
            
            if (confirm(`Sei sicuro di voler eliminare definitivamente ${checkboxSelezionate.length} clienti?`)) {
                let clientiSalvati = JSON.parse(localStorage.getItem('databaseClienti')) || [];
                
                let indiciDaEliminare = Array.from(checkboxSelezionate).map(cb => parseInt(cb.value));
                indiciDaEliminare.sort((a, b) => b - a);
                
                indiciDaEliminare.forEach(indice => {
                    clientiSalvati.splice(indice, 1);
                });
                
                localStorage.setItem('databaseClienti', JSON.stringify(clientiSalvati));
                location.reload();
            }
        });
    }
});

/* =========================================
   4. FUNZIONI GLOBALI (Singola Card)
   ========================================= */
window.eliminaCliente = function(index) {
    if (confirm("Sei sicuro di voler eliminare questo cliente? L'operazione non può essere annullata.")) {
        let clientiSalvati = JSON.parse(localStorage.getItem('databaseClienti')) || [];
        clientiSalvati.splice(index, 1);
        localStorage.setItem('databaseClienti', JSON.stringify(clientiSalvati));
        location.reload();
    }
};
//ALERT MODIFICA CLIENTE
window.modificaCliente = function(index) {
    alert("Hai cliccato Modifica per il cliente numero " + (index + 1) + "!\n\nPer renderlo funzionante, in futuro dovremo creare una pagina 'modifica_cliente.html' e passargli questo ID.");
};