document.addEventListener('DOMContentLoaded', () => {
    caricaClienti();
});

let tuttiIClienti = []; // Array per la barra di ricerca

//RECUPERO DATI DAL DB
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

//DISEGNO DELLE CARD DEI CLIENTI
function disegnaGriglia(clienti) {
    const contenitore = document.getElementById('contenitore-clienti');
    contenitore.innerHTML = ''; 

    if (clienti.length === 0) {
        contenitore.innerHTML = '<p style="text-align:center; grid-column: 1/-1; font-size: 1.2rem; color: #555;">Nessun cliente registrato nel database.</p>';
        return;
    }

    clienti.forEach(cliente => {
        const email = cliente.utenti ? cliente.utenti.email : cliente.email_contatto;
        const nomeCompleto = `${cliente.nome || ''} ${cliente.cognome || ''}`.trim();

        const card = document.createElement('div');
        card.className = 'card-cliente';

        // ECCO LA PARTE CORRETTA:
        card.innerHTML = `
            <div class="intestazione">
                <p class="nome-societa"><strong>${cliente.societa || 'Privato'}</strong></p>
                
                <div class="azioni-card">
                    <button class="btn-modifica-card" onclick="toggleModifica(this, '${cliente.id}')" title="Modifica Cliente">✏️</button>
                    <input type="checkbox" class="seleziona-cliente" value="${cliente.id}" onchange="gestisciAzioniFluttuanti()">
                </div>
            </div>
                
            <ul class="dettagli">
                <li><strong>Referente:</strong> <input type="text" class="campo-editabile" id="nome-${cliente.id}" value="${nomeCompleto || '-'}" readonly></li>
                <li><strong>Email:</strong> <input type="email" class="campo-editabile" id="email-${cliente.id}" value="${email || '-'}" readonly></li>
                <li><strong>Telefono:</strong> <input type="text" class="campo-editabile" id="tel-${cliente.id}" value="${cliente.telefono || '-'}" readonly></li>
            </ul>
        `;
        contenitore.appendChild(card);
    });
}


window.gestisciAzioniFluttuanti = function() {
    const checkboxes = document.querySelectorAll('.seleziona-cliente:checked');
    const btnElimina = document.getElementById('btn-elimina-fluttuante');
    
    // Aggiunge o rimuove la classe 'mostra' per attivare l'animazione del tuo collega
    if (checkboxes.length > 0) {
        btnElimina.classList.add('mostra');
    } else {
        btnElimina.classList.remove('mostra');
    }
};

// Esecuzione dell'eliminazione multipla tramite il pulsante fluttuante
document.addEventListener('DOMContentLoaded', () => {
    const btnElimina = document.getElementById('btn-elimina-fluttuante');
    
    if (btnElimina) {
        btnElimina.addEventListener('click', async () => {
            const checkboxes = document.querySelectorAll('.seleziona-cliente:checked');
            
            if (confirm(`Vuoi davvero eliminare ${checkboxes.length} clienti dal database? L'operazione non può essere annullata.`)) {
                
                // Cicla tutti gli ID selezionati e invia la richiesta al server
                for (let cb of checkboxes) {
                    await fetch('/api/delete-client', {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: cb.value })
                    });
                }
                
                alert('✅ Clienti eliminati con successo!');
                caricaClienti(); // Ricarica la griglia aggiornata
                btnElimina.classList.remove('mostra'); // Nasconde il bottone con animazione inversa
            }
        });
    }
});

//CONTROLLO IN TEMPO REALE DEI CAMPI EMAIL E TELEFONO NELLE CARD

document.addEventListener('input', function(e) {
    
    // 1. FORMATTAZIONE TELEFONO (se l'ID inizia con "tel-")
    if (e.target && e.target.id && e.target.id.startsWith('tel-')) {
        let numeri = e.target.value.replace(/\D/g, '');
        let formattato = '';
        
        if (numeri.length > 0) formattato += numeri.substring(0, 3);
        if (numeri.length > 3) formattato += '-' + numeri.substring(3, 6);
        if (numeri.length > 6) formattato += '-' + numeri.substring(6, 10);
        
        e.target.value = formattato;
    }

    // 2. VALIDAZIONE EMAIL VISIVA (se l'ID inizia con "email-")
    if (e.target && e.target.id && e.target.id.startsWith('email-')) {
        const emailRegex = /(\w+)@(\w+\.\w+)+/;
        
        if (e.target.value === '') {
            e.target.style.borderColor = 'transparent'; // Colore neutro per campo vuoto
        } else if (emailRegex.test(e.target.value)) {
            e.target.style.borderColor = '#27ae60'; // Verde se valida
        } else {
            e.target.style.borderColor = '#e74c3c'; // Rosso se non valida
        }
    }
});

//BARRA DI RICERCA
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


window.ordinaClienti = function() {
    const criterio = document.getElementById('filtroOrdinamento').value;
    
    // Se l'utente torna su "Ordina per..." (valore vuoto), non facciamo nulla
    if (!criterio) return;

    // Ordiniamo l'array globale tuttiIClienti
    tuttiIClienti.sort((a, b) => {
        let valA = "";
        let valB = "";

        // Scegliamo quale campo confrontare in base alla selezione
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

        // Determiniamo se è crescente (asc) o decrescente (desc)
        // localeCompare garantisce che l'ordine alfabetico italiano (con accenti ecc.) sia perfetto
        if (criterio.includes('asc')) {
            return valA.localeCompare(valB);
        } else {
            return valB.localeCompare(valA);
        }
    });

    // Ridisegniamo le card. 
    // Se hai già una funzione filtraClienti() attiva, la chiamiamo per mantenere
    // attiva un'eventuale ricerca testuale in corso, altrimenti chiamiamo disegnaGriglia
    if (typeof window.filtraClienti === 'function') {
        window.filtraClienti();
    } else {
        disegnaGriglia(tuttiIClienti);
    }
};

//ELIMINAZIONE SINGOLA
window.eliminaClienteDalDb = async function(id) {
    if (confirm("Sei sicuro di voler eliminare questo cliente dal database? L'operazione non può essere annullata.")) {
        try {
            const response = await fetch('/api/delete-client', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: id })
            });
            const result = await response.json();
            
            if (result.success) {
                alert('✅ Cliente eliminato!');
                caricaClienti(); // Ricarica la griglia aggiornata
            } else {
                alert('❌ Errore: ' + result.message);
            }
        } catch (error) {
            alert('❌ Errore di connessione.');
        }
    }
};


//Funzione per modificare e salvare i dati del cliente
window.toggleModifica = async function(btn, id) {
    const inModifica = btn.innerHTML.includes('💾');
    const inputs = document.querySelectorAll(`input[id$="-${id}"]`);
    
    if (!inModifica) {
        // ENTRA IN MODALITÀ MODIFICA
        inputs.forEach(input => {
            input.removeAttribute('readonly');
            input.classList.add('attivo');
        });
        
        btn.innerHTML = '💾';
        btn.title = "Salva Modifiche";
        btn.style.backgroundColor = '#ffefd5'; 
        btn.style.borderColor = '#f39c12';
        
    } else {
        // RECUPERA I DATI E I CAMPI ATTUALI
        const inputNome = document.getElementById(`nome-${id}`);
        const inputEmail = document.getElementById(`email-${id}`);
        const inputTel = document.getElementById(`tel-${id}`);
        
        // --- 🚨 NUOVI CONTROLLI DI VALIDAZIONE 🚨 ---
        const emailRegex = /(\w+)@(\w+\.\w+)+/;
        
        // Controllo Email
        if (!emailRegex.test(inputEmail.value)) {
            alert("❌ Errore: Inserisci un'email valida che contenga '@' e un dominio (es. '.it' o '.com').");
            inputEmail.focus();
            return; // Ferma il salvataggio e non prosegue
        }
        
        // Controllo Telefono (verifichiamo che se inserito, abbia almeno 9-10 cifre)
        const numeriTel = inputTel.value.replace(/\D/g, ''); // Prende solo i numeri
        if (numeriTel.length > 0 && numeriTel.length < 9) {
            alert("❌ Errore: Il numero di telefono è troppo corto. Inserisci un recapito valido.");
            inputTel.focus();
            return; // Ferma il salvataggio
        }
        // --------------------------------------------

        const datiAggiornati = {
            id: id,
            referente: inputNome.value,
            email: inputEmail.value,
            telefono: inputTel.value
        };

        try {
            // Chiamata alla nuova API creata in app.js
            const response = await fetch('/api/admin-update-client', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datiAggiornati)
            });
            
            const result = await response.json();

            if (result.success) {
                // Se il db si aggiorna, ripristina la grafica
                inputs.forEach(input => {
                    input.setAttribute('readonly', 'true');
                    input.classList.remove('attivo');
                    input.style.borderColor = 'transparent'; // Resetta i colori verde/rosso
                });
                
                // Ripristina il pulsante a matita
                btn.innerHTML = '✏️';
                btn.title = "Modifica Cliente";
                btn.style.backgroundColor = 'transparent';
                btn.style.borderColor = 'transparent';
                
                alert('✅ Modifiche salvate con successo!');
            } else {
                alert('❌ Errore durante il salvataggio: ' + result.message);
            }
        } catch (error) {
            console.error(error);
            alert('❌ Errore di connessione al server.');
        }
    }
};