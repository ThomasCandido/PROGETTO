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

        // VEDI QUI: Blocchiamo la data per il Cliente
        const inputData = document.getElementById('f_data');
        if (inputData) {
            inputData.readOnly = true;
            inputData.style.pointerEvents = 'none'; // Impedisce di cliccare sull'icona del calendario
            inputData.style.backgroundColor = "#eee"; // Lo colora di grigio per far capire che è bloccato
        }

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

    //VEDI QUI
    document.getElementById("upload_widget_opener").addEventListener("click", () => myWidget.open());
    document.getElementById('f_tipologia').addEventListener('change', aggiornaPrezziAutomatici);
    document.getElementById('f_tipologia').addEventListener('change', aggiornaTaglieDinamiche);
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
            
            if (isAdmin) {
                // Se è Admin, il campo è editabile e bianco
                campoPrezzoCl.readOnly = false;
                campoPrezzoCl.style.backgroundColor = "#fff"; 
            } else {
                // Se è Cliente, il campo è bloccato e verde chiaro
                campoPrezzoCl.readOnly = true;
                campoPrezzoCl.style.backgroundColor = "#d4edda"; 
            }
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

//VEDI QUI
// ==========================================
// 7. GESTIONE TAGLIE DINAMICHE
// ==========================================
function aggiornaTaglieDinamiche() 
{
    const tipologiaSelezionata = document.getElementById('f_tipologia').value;
    const tendinaTaglie = document.getElementById('f_taglia');
    
    // 1. Svuotiamo sempre la tendina e inseriamo le opzioni base (Scegli e UNISEX)
    tendinaTaglie.innerHTML = `
        <option value="" selected disabled>Scegli Taglia</option>
        <option value="UNISEX">UNISEX</option>
    `;

    // 2. Se è Felpa o T-shirt, aggiungiamo le lettere
    if (tipologiaSelezionata === 'T-shirt' || tipologiaSelezionata === 'Felpa') {
        const taglieLettere = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
        taglieLettere.forEach(taglia => {
            tendinaTaglie.innerHTML += `<option value="${taglia}">${taglia}</option>`;
        });
    } 
    // 3. Se è Pantalone o Scarpa, aggiungiamo i numeri (da 35 a 52)
    else if (tipologiaSelezionata === 'Pantalone' || tipologiaSelezionata === 'Scarpa') {
        for (let i = 35; i <= 52; i++) {
            tendinaTaglie.innerHTML += `<option value="${i}">${i}</option>`;
        }
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
            
           <td style="text-align:center;">
                ${o.image_path 
                    ? `<img src="${o.image_path}" alt="Anteprima" onclick="mostraAnteprima('${o.image_path}')" title="Clicca per ingrandire" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px; border: 1px solid #ccc; cursor: zoom-in; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.5)'" onmouseout="this.style.transform='scale(1)'">` 
                    : '-'}
            </td>
            
            <td>
                <button type="button" class="btn_modifica" onclick="caricaDatiPerModifica(${index})" title="Modifica" style="background: #3498db; border: none; cursor: pointer; padding: 5px 8px; border-radius: 4px; margin-right: 5px;">✏️</button>
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

window.caricaDatiPerModifica = function(index) {
    const o = ordiniInAttesa[index];

    // 1. Popoliamo i campi base
    document.getElementById('f_marchio').value = o.marchio;
    document.getElementById('f_quantita').value = o.quantita;
    document.getElementById('f_note').value = o.note;
    document.getElementById('f_image_url').value = o.image_path || "";
    document.getElementById('f_colore').value = o.colore;
    
    // 2. Gestiamo le tendine dinamiche
    document.getElementById('f_tipologia').value = o.tipologia;
    aggiornaTaglieDinamiche(); // Rigeneriamo le opzioni (XS/S/M o 35/36...)
    document.getElementById('f_taglia').value = o.taglia;

    // 3. Ricalcoliamo i prezzi (importante se è cambiata la tipologia o la foto)
    aggiornaPrezziAutomatici();

    // 4. Rimuoviamo la riga dalla tabella
    // Idea: quando "carichi" per modificare, la riga sparisce dalla tabella 
    // e "torna" nel form. Quando cliccherai di nuovo su Aggiungi, tornerà in tabella corretta.
    ordiniInAttesa.splice(index, 1);
    aggiornaTabellaUI();

    // 5. Opzionale: Scroll verso l'alto per far capire che i dati sono lì
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    alert("✏️ Dati riportati nel modulo. Modificali e clicca 'Aggiungi' per aggiornare l'ordine.");
};

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

//VEDI QUI
function processaPagamento() {
    const titolare = document.getElementById('card_name').value.trim();
    const numeroCarta = document.getElementById('card_number').value.replace(/\s/g, ''); 
    const scadenza = document.getElementById('card_expiry').value.trim();
    const cvv = document.getElementById('card_cvv').value.trim();

    // 1. Controllo base: ha lasciato qualcosa vuoto?
    if (!titolare || !numeroCarta || !scadenza || !cvv) 
    {
        return alert("⚠️ Attenzione: Devi compilare tutti i campi per procedere al pagamento.");
    }

    // 2. Controllo Numero Carta: esattamente 16 cifre numeriche
    const regexCarta = /^[0-9]{16}$/;
    if (!regexCarta.test(numeroCarta)) 
    {
        return alert("⚠️ Errore Carta: Il numero della carta deve contenere esattamente 16 numeri (senza spazi o lettere).");
    }

    // 3. Controllo Scadenza: formato MM/AA
    const regexScadenza = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (!regexScadenza.test(scadenza)) 
    {
        return alert("⚠️ Errore Scadenza: Inserisci la data nel formato MM/AA (es. 11/26 per Novembre 2026).");
    }

    // 4. Controllo CVV: esattamente 3 cifre numeriche
    const regexCVV = /^[0-9]{3}$/;
    if (!regexCVV.test(cvv)) 
    {
        return alert("⚠️ Errore CVV: Il codice di sicurezza deve essere di 3 numeri.");
    }

    // --- SE ARRIVA FINO A QUI, TUTTI I CONTROLLI SONO SUPERATI ---
    alert("💳 Pagamento Autorizzato con successo!");
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

// funzionalità x configuratore vedi dopo con gabriele VEDI QUI
// Apri il popup
document.getElementById('btn_apri_configuratore').addEventListener('click', () => {
    // Carica il file html del configuratore nell'iframe
    document.getElementById('iframeConfiguratore').src = "Configuratore_felpe_pantaloni.html";
    document.getElementById('modalConfiguratore').style.display = 'flex';
});

// Chiudi il popup
window.chiudiConfiguratore = function() {
    document.getElementById('modalConfiguratore').style.display = 'none';
    document.getElementById('iframeConfiguratore').src = ""; // Lo svuota per resettarlo
};

// Questa funzione viene chiamata DAL configuratore quando ha finito di caricare la foto!
// Questa funzione viene chiamata DAL configuratore quando ha finito di caricare la foto!
window.salvaImmagineConfiguratore = function(cloudinaryUrl, tipologia, colore, taglia, quantita) {
    // 1. Salva l'URL dell'immagine
    document.getElementById('f_image_url').value = cloudinaryUrl;

    // 2. Autocompila la Tipologia e SBLOCCA le taglie
    if (tipologia) {
        document.getElementById('f_tipologia').value = tipologia;
        aggiornaTaglieDinamiche(); 
    }

    // 3. Autocompila il Colore 
    if (colore) {
        document.getElementById('f_colore').value = colore;
    }

    // 4. Autocompila Quantità e Taglia
    if (quantita) {
        document.getElementById('f_quantita').value = quantita;
    }
    if (taglia) {
        document.getElementById('f_taglia').value = taglia; 
    }

    // 5. Ricalcola i prezzi col +35% e chiude
    aggiornaPrezziAutomatici(); 
    chiudiConfiguratore();
    
    alert("✅ Grafica generata! Tipologia, Colore, Taglia e Quantità sono stati inseriti automaticamente.");
};



// ==========================================
// 8. POP-UP ANTEPRIMA IMMAGINE (LIGHTBOX)
// ==========================================
window.mostraAnteprima = function(url_immagine) {
    // 1. Crea uno sfondo scuro trasparente che copre tutto lo schermo
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)'; // Nero all'80%
    overlay.style.zIndex = '10000'; // Lo mette sopra a TUTTO il resto
    overlay.style.display = 'flex';
    overlay.style.flexDirection = 'column';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.cursor = 'zoom-out'; // Cursore con la lente col "-"

    // 2. Crea l'immagine in grande
    const img = document.createElement('img');
    img.src = url_immagine;
    img.style.maxWidth = '90%';
    img.style.maxHeight = '85vh'; // Occupa al massimo l'85% dell'altezza dello schermo
    img.style.borderRadius = '8px';
    img.style.boxShadow = '0 10px 25px rgba(0,0,0,0.6)';
    img.style.border = '3px solid white';

    

    // 4. Magia: se l'utente clicca sullo sfondo, il pop-up si autodistrugge!
    overlay.onclick = function() {
        document.body.removeChild(overlay);
    };

    // 5. Monta i pezzi e incollali sulla pagina
    overlay.appendChild(img);
    document.body.appendChild(overlay);
};