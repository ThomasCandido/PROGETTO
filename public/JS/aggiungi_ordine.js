// ==========================================
// 1. CONFIGURAZIONI INIZIALI
// ==========================================
const listino_base = {
    "T-shirt": 5.00,
    "Felpa": 10.00,
    "Pantalone": 7.00,
    "Scarpa": 20.00
};

let ordiniInAttesa = [];
const isAdmin = localStorage.getItem('isAdmin') === 'true'; // Recuperiamo il ruolo dal login

const cloudName = "dfjburbax"; 
const uploadPreset = "joajwzcg"; 

// ==========================================
// 2. AVVIO PAGINA (DOMContentLoaded)
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
    const inputCliente = document.getElementById('f_cliente');
    const idHidden = document.getElementById('id_cliente_nascosto');
    const datalist = document.getElementById('lista_clienti_datalist');

    // Imposta la data di oggi in automatico
    document.getElementById('f_data').valueAsDate = new Date();

    // --- LOGICA RUOLI: ADMIN vs CLIENTE ---
    if (isAdmin) {
        // Se sei ADMIN: Carica la lista di tutti i societa per il datalist
        try {
            const res = await fetch('/api/get-all-clients');
            const result = await res.json();
            if (result.success) {
                result.data.forEach(c => {
                    const opt = document.createElement('option');
                    opt.value = c.societa;
                    opt.dataset.id = c.id; 
                    datalist.appendChild(opt);
                });
            }
        } catch (e) { console.error("Errore caricamento clienti:", e); }

        // Gestione selezione cliente da datalist
        inputCliente.addEventListener('change', () => {
            const opzione = Array.from(datalist.options).find(o => o.value === inputCliente.value);
            if (opzione) {
                idHidden.value = opzione.dataset.id;
                inputCliente.style.borderColor = "#2ecc71";
            } else {
                idHidden.value = "";
                inputCliente.style.borderColor = "#e74c3c";
            }
        });
    } else {
        // Se sei CLIENTE: Prendi i tuoi dati dal profilo e blocca il campo
        try {
            const res = await fetch('/api/get-profile');
            const result = await res.json();
            if (result.success) {
                inputCliente.value = result.data.societa;
                inputCliente.readOnly = true; // Non può cambiare il nome società
                idHidden.value = result.data.id;
                inputCliente.style.backgroundColor = "#eee";
            }
        } catch (e) { console.error("Errore profilo:", e); }

        // Nascondi visivamente tutto ciò che è per Admin (Costi azienda, ecc.)
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
    }

    // --- INIZIALIZZAZIONE CLOUDINARY ---
    const myWidget = cloudinary.createUploadWidget({
        cloudName: cloudName, 
        uploadPreset: uploadPreset,
        sources: ['local', 'camera'],
        multiple: false
    }, (error, result) => { 
        if (!error && result && result.event === "success") { 
            document.getElementById('f_image_url').value = result.info.secure_url;
            aggiornaPrezziAutomatici(); // Ricalcola col 35%
            alert("✅ Foto caricata!");
        }
    });

    document.getElementById("upload_widget_opener").addEventListener("click", () => myWidget.open());
    document.getElementById('f_tipologia').addEventListener('change', aggiornaPrezziAutomatici);
});

// ==========================================
// 3. CALCOLO PREZZI AUTOMATICO
// ==========================================
function aggiornaPrezziAutomatici() {
    const tipologia = document.getElementById('f_tipologia').value;
    const imageUrl = document.getElementById('f_image_url').value;
    
    // Recuperiamo i riferimenti ai campi
    const campoPrezzoCl = document.getElementById('f_prezzo_cl');
    const campoPrezzoAz = document.getElementById('f_prezzo_az'); // Potrebbe essere null per il cliente

    // Se la tipologia esiste nel nostro listino
    if (listino_base[tipologia]) {
        const costo_base = listino_base[tipologia];
        const ricarico = imageUrl ? 1.35 : 1.20; // +35% con foto, +20% senza
        const prezzo_finale_cliente = costo_base * ricarico;

        // 1. AGGIORNIAMO IL PREZZO CLIENTE (Sempre presente)
        if (campoPrezzoCl) {
            campoPrezzoCl.value = prezzo_finale_cliente.toFixed(2);
            campoPrezzoCl.readOnly = true; // Impediamo truffe sul prezzo
            campoPrezzoCl.style.backgroundColor = "#d4edda"; // Sfondo verde chiaro (OK)
        }

        // 2. AGGIORNIAMO IL PREZZO AZIENDA (Solo se il campo esiste, cioè se è Admin)
        if (campoPrezzoAz) {
            if (campoPrezzoAz) 
            {
                campoPrezzoAz.value = costo_base.toFixed(2);
                // MODIFICA QUI:
                if (isAdmin) 
                {
                    campoPrezzoAz.readOnly = false; // L'admin può sovrascrivere il prezzo!
                    campoPrezzoAz.style.backgroundColor = "#fff"; // Sfondo bianco per indicare che è editabile
                } 
                else 
                {
                    campoPrezzoAz.readOnly = true;
                    campoPrezzoAz.style.backgroundColor = "#eee";
                }
            }
        }
        
        console.log("💰 Prezzi calcolati con successo!");
    } else {
        // Se non c'è tipologia selezionata, svuotiamo i campi
        if (campoPrezzoCl) campoPrezzoCl.value = "";
        if (campoPrezzoAz) campoPrezzoAz.value = "";
    }
}
// ==========================================
// 4. GESTIONE TABELLA RIEPILOGO (FRONTEND)
// ==========================================
function aggiungiRigaTabella() {
    const idCliente = document.getElementById('id_cliente_nascosto').value;
    const marchio = document.getElementById('f_marchio').value;
    const qta = document.getElementById('f_quantita').value;
    const imageUrl = document.getElementById('f_image_url').value;

    if (!idCliente) return alert("⚠️ Seleziona un cliente valido!");
    if (!marchio || !qta || qta <= 0) return alert("⚠️ Compila Marchio e Quantità!");

    const riga = {
        id_temp: Date.now(),
        id_cliente: parseInt(idCliente),
        societa: document.getElementById('f_cliente').value,
        data_ordine: document.getElementById('f_data').value,
        stato: "Ordinato",
        marchio: marchio,
        tipologia: document.getElementById('f_tipologia').value,
        colore: document.getElementById('f_colore').value,
        taglia: document.getElementById('f_taglia').value,
        quantita: parseInt(qta),
        prezzo_cliente: parseFloat(document.getElementById('f_prezzo_cl').value) || 0,
        
        // SICUREZZA: Se non è admin, salva NULL nel database per il costo azienda
        prezzo_azienda: isAdmin ? (parseFloat(document.getElementById('f_prezzo_az').value) || 0) : null,
        
        note: document.getElementById('f_note').value || "-",
        image_path: imageUrl
    };

    ordiniInAttesa.push(riga);
    aggiornaTabellaUI();
    
    // Reset campi per prossimo articolo
    document.getElementById('f_marchio').value = "";
    document.getElementById('f_quantita').value = "";
    document.getElementById('f_note').value = "";
    document.getElementById('f_image_url').value = ""; // Svuota l'allegato
    
    // Select (Tipologia e Taglia) - Tornano alla prima opzione "disabilitata"
    document.getElementById('f_tipologia').selectedIndex = 0;
    document.getElementById('f_taglia').selectedIndex = 0;
    
    // Colore (Torna al nero di default)
    document.getElementById('f_colore').value = "#000000";

    // Prezzi
    const campoCl = document.getElementById('f_prezzo_cl');
    const campoAz = document.getElementById('f_prezzo_az');

    campoCl.value = "";
    campoCl.style.backgroundColor = ""; // Toglie il colore verde
    campoCl.readOnly = false; // Lo sblocca se era bloccato

    if (campoAz) {
        campoAz.value = "";
        campoAz.style.backgroundColor = "";
        campoAz.readOnly = false;
    }

    console.log("Form ripulito per il prossimo articolo!");
}

function aggiornaTabellaUI() {
    const tbody = document.getElementById('corpo_tabella_ordini');
    const thAzienda = document.getElementById('th_prezzo_az'); 
    
    // Mostra o nasconde l'intestazione Prezzo Az. in base al ruolo
    if (thAzienda) thAzienda.style.display = isAdmin ? '' : 'none';

    tbody.innerHTML = "";

    ordiniInAttesa.forEach((o, index) => {
        const tr = document.createElement('tr');
        
        // ATTENZIONE: L'ordine qui sotto deve essere IDENTICO al tuo <thead> nell'HTML
        tr.innerHTML = `
            <td>${o.data_ordine}</td>
            <td>${o.societa}</td>
            <td>${o.stato}</td>
            <td>${o.marchio}</td>
            <td>${o.tipologia}</td>
            <td style="text-align:center;">
                <span style="display:inline-block; width:20px; height:20px; background-color:${o.colore}; border:1px solid #ccc; border-radius:50%;"></span>
            </td>
            <td>${o.taglia}</td>
            <td>${o.quantita}</td>
            <td>€${parseFloat(o.prezzo_cliente).toFixed(2)}</td>
            
            ${isAdmin ? `<td>€${parseFloat(o.prezzo_azienda || 0).toFixed(2)}</td>` : ''}
            
            <td>${o.note}</td>
            <td style="text-align:center;">${o.image_path ? '🖼️' : '-'}</td>
            <td>
                <button type="button" class="btn_rimuovi" onclick="rimuoviRiga(${index})" title="Rimuovi">❌</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    aggiornaTotaleCalcolato();
}
function rimuoviRiga(i) {
    ordiniInAttesa.splice(i, 1);
    aggiornaTabellaUI();
}


function svuotaTabella() {
    // Chiediamo conferma per sicurezza
    const conferma = confirm("⚠️ Vuoi davvero svuotare tutto il riepilogo?");
    
    if (conferma) {
        // Svuotiamo l'array
        ordiniInAttesa.length = 0; 
        
        // Diciamo alla tabella di ridisegnarsi (essendo l'array vuoto, sparirà tutto)
        aggiornaTabellaUI();
        
        console.log("🧹 Tabella ripulita correttamente.");
    }

    aggiornaTotaleCalcolato();
}

// ==========================================
// 5. SALVATAGGIO FINALE E PAGAMENTO
// ==========================================
function apriModalPagamento() {
    aggiornaTotaleCalcolato();
    if (ordiniInAttesa.length === 0) return alert("⚠️ Tabella vuota!");
    document.getElementById('modalPagamento').style.display = 'flex';
}

function chiudiPagamento() {
    document.getElementById('modalPagamento').style.display = 'none';
}

function processaPagamento() {
    // Validazione base carta (già fatta nel tuo precedente)
    alert("💳 Pagamento Autorizzato!");
    chiudiPagamento();
    salvaTuttoNelDatabase();
}



function aggiornaTotaleCalcolato() {
    // Calcoliamo la somma di (Quantità * Prezzo Cliente) per ogni riga
    const totale = ordiniInAttesa.reduce((acc, o) => {
        return acc + (o.quantita * o.prezzo_cliente);
    }, 0);

    // Aggiorniamo la visualizzazione sotto la tabella
    const displaySotto = document.getElementById('totale_ordine_display');
    if (displaySotto) displaySotto.innerText = `€${totale.toFixed(2)}`;

    // Aggiorniamo la visualizzazione nel modal (per dopo)
    const displayModal = document.getElementById('totale_modal_pay');
    if (displayModal) displayModal.innerText = `€${totale.toFixed(2)}`;

    return totale;
}

async function salvaTuttoNelDatabase() {
    // Prepariamo i dati eliminando le informazioni che non servono al DB (tipo 'societa' testuale)
    const datiPuliti = ordiniInAttesa.map(o => ({
        id_cliente: o.id_cliente,
        data_ordine: o.data_ordine,
        stato: o.stato,
        marchio: o.marchio,
        tipologia: o.tipologia,
        colore: o.colore,
        taglia: o.taglia,
        quantita: o.quantita,
        prezzo_cliente: o.prezzo_cliente,
        prezzo_azienda: o.prezzo_azienda, // Sarà NULL se l'utente è cliente
        note: o.note,
        image_path: o.image_path
    }));

    try {
        const res = await fetch('/api/save-orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datiPuliti)
        });

        const result = await res.json();
        if (result.success) {
            alert("🚀 Ordini inviati con successo!");
            ordiniInAttesa = [];
            window.location.href = "storico_ordini_home.html";
        }
    } catch (err) {
        alert("Errore salvataggio database.");
    }
}