document.addEventListener('DOMContentLoaded', () => {
    caricaClienti();
});

let tuttiIClienti = []; // Array per la barra di ricerca

// ==========================================
// 1. RECUPERO DATI DAL BACKEND
// ==========================================
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

// ==========================================
// 2. DISEGNO DELLE CARD (Stesso tuo stile)
// ==========================================
// ==========================================
// 2. DISEGNO DELLE CARD (Abbinato al tuo CSS)
// ==========================================
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
        // Assegniamo la classe principale del tuo CSS
        card.className = 'card-cliente';

        // Struttura HTML che rispetta al 100% le regole del tuo lista_clienti.css
        card.innerHTML = `
            <div class="intestazione">
                <p class="nome-societa">${cliente.societa || 'Privato'}</p>
                <input type="checkbox" class="seleziona-cliente" value="${cliente.id}" onchange="gestisciBottoneElimina()">
            </div>
                
            <ul class="dettagli">
                <li><strong>Referente:</strong> ${nomeCompleto || '-'}</li>
                <li><strong>Email:</strong> <a href="mailto:${email}">${email || '-'}</a></li>
                <li><strong>Telefono:</strong> <a href="tel:${cliente.telefono}">${cliente.telefono || '-'}</a></li>
            </ul>
            
            <div class="azioni">
                <button class="botton_elemem_lista" onclick="modificaCliente(${cliente.id})">Modifica</button>
                <button class="botton_elemem_lista btn-elimina" style="background-color: #e74c3c; color: white;" onclick="eliminaClienteDalDb(${cliente.id})">Elimina</button>
            </div>
        `;

        contenitore.appendChild(card);
    });
}

// ==========================================
// 3. BARRA DI RICERCA
// ==========================================
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

// ==========================================
// 4. ELIMINAZIONE SINGOLA (Dal DB)
// ==========================================
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

window.modificaCliente = function(id) {
    alert("Funzionalità di modifica per l'ID " + id + " da implementare in futuro!");
};

// ==========================================
// 5. GESTIONE PULSANTE ELIMINAZIONE MULTIPLA
// ==========================================
window.gestisciBottoneElimina = function() {
    const checkboxes = document.querySelectorAll('.seleziona-cliente:checked');
    const btnElimina = document.getElementById('btn-elimina-selezionati');
    
    if (checkboxes.length > 0) {
        btnElimina.style.display = 'inline-block';
        btnElimina.innerHTML = `🗑️ Elimina ${checkboxes.length} Clienti Selezionati`;
    } else {
        btnElimina.style.display = 'none';
    }
};

// Logica per cliccare il pulsante di eliminazione multipla
document.addEventListener('DOMContentLoaded', () => {
    const btnElimina = document.getElementById('btn-elimina-selezionati');
    if (btnElimina) {
        btnElimina.addEventListener('click', async () => {
            const checkboxes = document.querySelectorAll('.seleziona-cliente:checked');
            if (confirm(`Vuoi davvero eliminare ${checkboxes.length} clienti dal database?`)) {
                
                // Cicliamo e inviamo una richiesta di eliminazione per ogni ID selezionato
                for (let cb of checkboxes) {
                    await fetch('/api/delete-client', {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: cb.value })
                    });
                }
                
                alert('✅ Clienti selezionati eliminati!');
                caricaClienti();
                btnElimina.style.display = 'none';
            }
        });
    }
});