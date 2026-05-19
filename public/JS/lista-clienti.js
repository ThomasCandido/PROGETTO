/*POPUP CONFERMA ELIMINAZIONE*/
function chiediConfermaEliminazione(messaggio) {
    return new Promise((resolve) => {

        // Creazione popup
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style.display = 'flex';

        // Contenuto popup
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

        // Aggiunge popup al body
        document.body.appendChild(modal);

        const btnSi = modal.querySelector('#btn-conferma-delete');
        const btnNo = modal.querySelector('#btn-annulla-delete');

        // Conferma eliminazione
        btnSi.onclick = () => {
            document.body.removeChild(modal);
            resolve(true);
        };

        // Annulla eliminazione
        btnNo.onclick = () => {
            document.body.removeChild(modal);
            resolve(false);
        };
    });
}

/*AVVIO PAGINA*/
document.addEventListener('DOMContentLoaded', () => {
    caricaClienti();
});

let tuttiIClienti = []; // Array usato per ricerca e ordinamento

/*CARICAMENTO CLIENTI DAL DATABASE*/
async function caricaClienti() {
    try {
        const response = await fetch('/api/get-full-clients');
        const result = await response.json();

        if (result.success) {
            tuttiIClienti = result.data;
            disegnaGriglia(tuttiIClienti);
        } else {
            console.error('Errore nel caricamento:', result.message);
        }

    } catch (error) {
        console.error('Errore di connessione:', error);
    }
}

/* CREAZIONE CARD CLIENTI */
function disegnaGriglia(clienti) {

    const contenitore = document.getElementById('contenitore-clienti');
    contenitore.innerHTML = '';

    // Nessun cliente trovato
    if (clienti.length === 0) {
        contenitore.innerHTML = `
            <p style="text-align:center; grid-column: 1/-1; font-size: 1.2rem; color: #555;">
                Nessun cliente registrato nel database.
            </p>
        `;
        return;
    }

    clienti.forEach(cliente => {

        const email = cliente.utenti ? cliente.utenti.email : cliente.email_contatto;
        const nomeCompleto = `${cliente.nome || ''} ${cliente.cognome || ''}`.trim();

        const card = document.createElement('div');
        card.className = 'card-cliente';

        // Contenuto card
        card.innerHTML = `
            <div class="intestazione">

                <p class="nome-societa">
                    <strong>${cliente.societa || 'Privato'}</strong>
                </p>

                <div class="azioni-card">

                    <!-- Modifica cliente -->
                    <button class="btn-modifica-card"
                        onclick="toggleModifica(this, '${cliente.id}')"
                        title="Modifica Cliente">

                        ✏️
                    </button>

                    <!-- Checkbox selezione -->
                    <input type="checkbox"
                        class="seleziona-cliente"
                        value="${cliente.id}"
                        onchange="gestisciAzioniFluttuanti()">

                </div>
            </div>

            <ul class="dettagli">
                <li>
                    <strong>Referente:</strong>
                    <input type="text"
                        class="campo-editabile"
                        id="nome-${cliente.id}"
                        value="${nomeCompleto || '-'}"
                        readonly>
                </li>

                <li>
                    <strong>Email:</strong>
                    <input type="email"
                        class="campo-editabile"
                        id="email-${cliente.id}"
                        value="${email || '-'}"
                        readonly>
                </li>

                <li>
                    <strong>Telefono:</strong>
                    <input type="text"
                        class="campo-editabile"
                        id="tel-${cliente.id}"
                        value="${cliente.telefono || '-'}"
                        readonly>
                </li>
            </ul>
        `;

        contenitore.appendChild(card);
    });
}

/* GESTIONE PULSANTE ELIMINA */
window.gestisciAzioniFluttuanti = function() {

    const checkboxes = document.querySelectorAll('.seleziona-cliente:checked');
    const btnElimina = document.getElementById('btn-elimina-fluttuante');

    // Mostra/nasconde pulsante elimina
    if (checkboxes.length > 0) {
        btnElimina.classList.add('mostra');
    } else {
        btnElimina.classList.remove('mostra');
    }
};

/* ELIMINAZIONE MULTIPLA */
document.addEventListener('DOMContentLoaded', () => {

    const btnElimina = document.getElementById('btn-elimina-fluttuante');

    if (btnElimina) {

        btnElimina.addEventListener('click', async () => {

            const checkboxes = document.querySelectorAll('.seleziona-cliente:checked');

            if (await chiediConfermaEliminazione(
                `Vuoi davvero eliminare ${checkboxes.length} clienti dal database?`
            )) {

                // Elimina tutti i clienti selezionati
                for (let cb of checkboxes) {

                    await fetch('/api/delete-client', {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: cb.value })
                    });
                }

                mostraToast('✅ Clienti eliminati con successo!', 'success');

                caricaClienti();
                btnElimina.classList.remove('mostra');
            }
        });
    }
});

/* VALIDAZIONE CAMPI IN TEMPO REALE */
document.addEventListener('input', function(e) {

    /* Formattazione telefono */
    if (e.target && e.target.id && e.target.id.startsWith('tel-')) {

        let numeri = e.target.value.replace(/\D/g, '');
        let formattato = '';

        if (numeri.length > 0) formattato += numeri.substring(0, 3);
        if (numeri.length > 3) formattato += '-' + numeri.substring(3, 6);
        if (numeri.length > 6) formattato += '-' + numeri.substring(6, 10);

        e.target.value = formattato;
    }

    /* Validazione email */
    if (e.target && e.target.id && e.target.id.startsWith('email-')) {

        const emailRegex = /(\w+)@(\w+\.\w+)+/;

        if (e.target.value === '') {
            e.target.style.borderColor = 'transparent';

        } else if (emailRegex.test(e.target.value)) {
            e.target.style.borderColor = '#27ae60';

        } else {
            e.target.style.borderColor = '#e74c3c';
        }
    }
});

/* RICERCA CLIENTI */
window.filtraClienti = function() {

    const termine = document.getElementById('barraRicerca').value.toLowerCase();

    const clientiFiltrati = tuttiIClienti.filter(cliente => {

        const email = (cliente.utenti ? cliente.utenti.email : cliente.email_contatto) || "";
        const societa = cliente.societa || "";
        const nome = cliente.nome || "";
        const cognome = cliente.cognome || "";
        const telefono = cliente.telefono || "";

        return societa.toLowerCase().includes(termine) ||
               email.toLowerCase().includes(termine) ||
               nome.toLowerCase().includes(termine) ||
               cognome.toLowerCase().includes(termine) ||
               telefono.toLowerCase().includes(termine);
    });

    disegnaGriglia(clientiFiltrati);
};

/* ORDINAMENTO CLIENTI */
window.ordinaClienti = function() {

    const criterio = document.getElementById('filtroOrdinamento').value;

    if (!criterio) return;

    tuttiIClienti.sort((a, b) => {

        let valA = "";
        let valB = "";

        // Campo da ordinare
        if (criterio.includes('societa')) {
            valA = (a.societa || "Privato").toLowerCase();
            valB = (b.societa || "Privato").toLowerCase();

        } else if (criterio.includes('cognome')) {
            valA = (a.cognome || "").toLowerCase();
            valB = (b.cognome || "").toLowerCase();

        } else if (criterio.includes('nome')) {
            valA = (a.nome || "").toLowerCase();
            valB = (b.nome || "").toLowerCase();
        }

        // Ordinamento crescente/decrescente
        if (criterio.includes('asc')) {
            return valA.localeCompare(valB);

        } else {
            return valB.localeCompare(valA);
        }
    });

    // Mantiene eventuale filtro ricerca
    if (typeof window.filtraClienti === 'function') {
        window.filtraClienti();

    } else {
        disegnaGriglia(tuttiIClienti);
    }
};

/* ELIMINAZIONE SINGOLA */
window.eliminaClienteDalDb = async function(id) {

    if (await chiediConfermaEliminazione(
        "Sei sicuro di voler eliminare questo cliente?"
    )) {

        try {
            const response = await fetch('/api/delete-client', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: id })
            });

            const result = await response.json();

            if (result.success) {
                mostraToast('✅ Cliente eliminato!', 'success');
                caricaClienti();

            } else {
                mostraToast('❌ Errore: ' + result.message, 'error');
            }

        } catch (error) {
            mostraToast('❌ Errore di connessione.', 'error');
        }
    }
};

/* MODIFICA CLIENTE */
window.toggleModifica = async function(btn, id) {

    const inModifica = btn.innerHTML.includes('💾');
    const inputs = document.querySelectorAll(`input[id$="-${id}"]`);

    // Attiva modifica
    if (!inModifica) {

        inputs.forEach(input => {
            input.removeAttribute('readonly');
            input.classList.add('attivo');
        });

        btn.innerHTML = '💾';
        btn.title = "Salva Modifiche";
        btn.style.backgroundColor = '#ffefd5';
        btn.style.borderColor = '#f39c12';

    } else {

        // Recupero campi
        const inputNome = document.getElementById(`nome-${id}`);
        const inputEmail = document.getElementById(`email-${id}`);
        const inputTel = document.getElementById(`tel-${id}`);

        const emailRegex = /(\w+)@(\w+\.\w+)+/;

        /* Validazione email */
        if (!emailRegex.test(inputEmail.value)) {

            mostraToast("❌ Inserisci un'email valida.",'error');

            inputEmail.focus();
            return;
        }

        /* Validazione telefono */
        const numeriTel = inputTel.value.replace(/\D/g, '');

        if (numeriTel.length > 0 && numeriTel.length < 9) {

            mostraToast("❌ Numero di telefono non valido.",'error');

            inputTel.focus();
            return;
        }

        // Dati aggiornati
        const datiAggiornati = {
            id: id,
            referente: inputNome.value,
            email: inputEmail.value,
            telefono: inputTel.value
        };

        try {

            // Salvataggio database
            const response = await fetch('/api/admin-update-client', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datiAggiornati)
            });

            const result = await response.json();

            if (result.success) {

                // Ripristina campi readonly
                inputs.forEach(input => {
                    input.setAttribute('readonly', 'true');
                    input.classList.remove('attivo');
                    input.style.borderColor = 'transparent';
                });

                // Ripristina bottone modifica
                btn.innerHTML = '✏️';
                btn.title = "Modifica Cliente";
                btn.style.backgroundColor = 'transparent';
                btn.style.borderColor = 'transparent';

                mostraToast('✅ Modifiche salvate con successo!', 'success');

            } else {
                mostraToast('❌ Errore durante il salvataggio: ' + result.message,'error');
            }

        } catch (error) {

            console.error(error);

            mostraToast('❌ Errore di connessione al server.','error');
        }
    }
};

