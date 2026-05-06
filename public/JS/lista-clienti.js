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
        // SALVA LE MODIFICHE NEL DATABASE
        const datiAggiornati = {
            id: id,
            referente: document.getElementById(`nome-${id}`).value,
            email: document.getElementById(`email-${id}`).value,
            telefono: document.getElementById(`tel-${id}`).value
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
                // Se il db si aggiorna, blocca di nuovo i campi
                inputs.forEach(input => {
                    input.setAttribute('readonly', 'true');
                    input.classList.remove('attivo');
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