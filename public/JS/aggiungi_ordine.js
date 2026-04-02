let ordiniInAttesa = [];

// --- CONFIGURAZIONE CLOUDINARY ---
const cloudName = "dfjburbax"; 
const uploadPreset = "joajwzcg"; 

document.addEventListener('DOMContentLoaded', async () => {
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    const inputCliente = document.getElementById('f_cliente');
    const idHidden = document.getElementById('id_cliente_nascosto');
    const datalist = document.getElementById('lista_clienti_datalist');

    // Imposta la data odierna nel modulo
    document.getElementById('f_data').valueAsDate = new Date();

    // 1. GESTIONE RUOLI (Admin vs Cliente)
    if (isAdmin) {
        // Se sei ADMIN: Carica tutti i clienti per la datalist
        try {
            const res = await fetch('/api/get-all-clients');
            const result = await res.json();
            if (result.success) {
                result.data.forEach(c => {
                    const opt = document.createElement('option');
                    opt.value = c.societa;
                    opt.dataset.id = c.id; // ID primario della tabella 'clienti'
                    datalist.appendChild(opt);
                });
            }
        } catch (e) { console.error("Errore caricamento clienti:", e); }

        // Trova l'ID quando l'admin scrive/seleziona il nome
        inputCliente.addEventListener('input', () => {
            const opzione = Array.from(datalist.options).find(o => o.value === inputCliente.value);
            idHidden.value = opzione ? opzione.dataset.id : "";
        });
    } else {
        // Se sei CLIENTE: Carica il tuo profilo e blocca il campo
        try {
            const res = await fetch('/api/get-profile');
            const result = await res.json();
            if (result.success) {
                inputCliente.value = result.data.societa;
                inputCliente.readOnly = true;
                idHidden.value = result.data.id; // ID primario della tabella 'clienti'
            }
        } catch (e) { console.error("Errore caricamento profilo:", e); }
    }

    // 2. INIZIALIZZAZIONE WIDGET CLOUDINARY
    const myWidget = cloudinary.createUploadWidget({
        cloudName: cloudName, 
        uploadPreset: uploadPreset,
        sources: ['local', 'camera', 'url'],
        multiple: false,
        clientAllowedFormats: ["png", "jpg", "jpeg"]
    }, (error, result) => { 
        if (!error && result && result.event === "success") { 
            // Salviamo l'URL restituito da Cloudinary nel campo nascosto
            document.getElementById('f_image_url').value = result.info.secure_url;
            alert("✅ Foto caricata con successo!");
        }
    });

    document.getElementById("upload_widget_opener").addEventListener("click", () => {
        myWidget.open();
    }, false);
});

// --- FUNZIONI TABELLA RIEPILOGO ---
function aggiungiRigaTabella() {
    const idCliente = document.getElementById('id_cliente_nascosto').value;
    const marchio = document.getElementById('f_marchio').value;
    const qta = document.getElementById('f_quantita').value;
    const imageUrl = document.getElementById('f_image_url').value; // URL da Cloudinary

    // --- 1. VALIDAZIONI ---
    if (!idCliente) return alert("⚠️ Seleziona un cliente valido dalla lista!");
    if (!marchio || !qta || qta <= 0) return alert("⚠️ Compila Marchio e Quantità correttamente!");

    // Controllo salva-errore: se l'utente non ha caricato la foto o non ha aspettato l'alert
    if (!imageUrl) {
        const procedi = confirm("⚠️ Non hai allegato nessuna foto (o il caricamento non è finito). Vuoi aggiungere l'articolo senza immagine?");
        if (!procedi) return; // Si ferma e permette all'utente di caricare la foto
    }

    // --- 2. CREAZIONE OGGETTO RIGA ---
    const riga = {
        id_temp: Date.now(), 
        id_cliente: parseInt(idCliente),
        societa: document.getElementById('f_cliente').value,
        data_ordine: document.getElementById('f_data').value,
        stato: document.getElementById('f_stato').value || "Ordinato",
        marchio: marchio,
        tipologia: document.getElementById('f_tipologia').value,
        colore: document.getElementById('f_colore').value,
        taglia: document.getElementById('f_taglia').value,
        quantita: parseInt(qta),
        prezzo_cliente: parseFloat(document.getElementById('f_prezzo_cl').value) || 0,
        prezzo_azienda: parseFloat(document.getElementById('f_prezzo_az').value) || 0,
        note: document.getElementById('f_note').value || "-",
        image_path: imageUrl // Qui salviamo il link Cloudinary
    };

    // --- 3. AGGIORNAMENTO LISTA E UI ---
    ordiniInAttesa.push(riga);
    aggiornaTabellaUI();
    
    // --- 4. RESET CAMPI (Pulizia) ---
    // Cancelliamo solo i dati dell'articolo, manteniamo Cliente e Data per velocizzare
    document.getElementById('f_marchio').value = "";
    document.getElementById('f_tipologia').value = "";
    document.getElementById('f_quantita').value = "";
    document.getElementById('f_note').value = "";
    document.getElementById('f_image_url').value = ""; // FONDAMENTALE: reset per la prossima foto
}
function aggiornaTabellaUI() {
    const tbody = document.getElementById('corpo_tabella_ordini');
    tbody.innerHTML = "";

    ordiniInAttesa.forEach((o, index) => {
        const tr = document.createElement('tr');
        // Ho separato Marchio e Tipologia per avere esattamente 13 celle
        tr.innerHTML = `
            <td>${o.data_ordine}</td>
            <td>${o.societa}</td>
            <td>${o.stato}</td>
            <td>${o.marchio}</td>
            <td>${o.tipologia}</td>
            <td style="background-color:${o.colore}; width:30px; border: 1px solid #ccc;"></td>
            <td>${o.taglia}</td>
            <td>${o.quantita}</td>
            <td>€${o.prezzo_cliente.toFixed(2)}</td>
            <td>€${o.prezzo_azienda.toFixed(2)}</td>
            <td>${o.note || '-'}</td>
            <td>${o.image_path ? `<img src="${o.image_path}" width="40" style="border-radius:4px; cursor:pointer;" onclick="window.open('${o.image_path}', '_blank')">` : '-'}</td>
            <td><button type="button" class="btn_rimuovi" onclick="rimuoviRiga(${index})">❌</button></td>
        `;
        tbody.appendChild(tr);
    });
}

function rimuoviRiga(i) {
    ordiniInAttesa.splice(i, 1);
    aggiornaTabellaUI();
}

function svuotaTabella() {
    if(confirm("Vuoi svuotare tutto il riepilogo?")) {
        ordiniInAttesa = [];
        aggiornaTabellaUI();
    }
}

// --- SALVATAGGIO FINALE ---

async function salvaTuttoNelDatabase() {
    if (ordiniInAttesa.length === 0) return alert("⚠️ La tabella è vuota!");

    // Prepariamo i dati: togliamo 'id_temp' e 'societa' che non esistono nel DB ordini
    const datiPerDatabase = ordiniInAttesa.map(o => {
        return {
            id_cliente: o.id_cliente,
            data_ordine: o.data_ordine,
            stato: o.stato,
            marchio: o.marchio,
            tipologia: o.tipologia,
            colore: o.colore,
            taglia: o.taglia,
            quantita: o.quantita,
            prezzo_cliente: o.prezzo_cliente,
            prezzo_azienda: o.prezzo_azienda,
            note: o.note,
            image_path: o.image_path
        };
    });

    try {
        const response = await fetch('/api/save-orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datiPerDatabase)
        });

        const result = await response.json();
        if (result.success) {
            alert("🚀 " + result.message);
            ordiniInAttesa = [];
            window.location.href = "storico_ordini_home.html";
        } else {
            alert("Errore nel salvataggio: " + result.message);
        }
    } catch (err) {
        console.error(err);
        alert("Errore di connessione al server.");
    }
}