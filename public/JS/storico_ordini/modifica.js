async function ModificaCard(li, ordine) {
    const cont_old = li.innerHTML;
    const stati = ['Ordinato', 'In Lavorazione', 'Evaso', 'Archiviato'];
    const option_stato = stati.map(s => `<option value="${s}" ${ordine.stato === s ? 'selected' : ''}>${s}</option>`).join('');
    const dataIso = new Date(ordine.data_ordine).toISOString().split('T')[0];
    const nomeCliente = (ordine.clienti && ordine.clienti.societa) ? ordine.clienti.societa : 'Nome sconosciuto';

    let nuovoUrlImmagine = ordine.image_path; 

    li.classList.add('editing-mode');

    // Usiamo delle classi al posto degli ID per gli input, così non ci sbagliamo
    li.innerHTML = `
        <div class="info">
            <p class="id_ord"><b>cod:${ordine.id.toString().padStart(4, '0')}</b></p>
            <input type="date" class="edit-data input-ghost" value="${dataIso}">
        </div>
        <div class="stato">
            <select class="edit-stato select-ghost">${option_stato}</select>
        </div>
        <ul class="dettagli">
            <li><strong>Cliente:</strong> ${nomeCliente}</li> 
            <li><strong>Marca:</strong> <input type="text" class="edit-marca" value="${ordine.marchio}"></li> 
            <li><strong>Tipo:</strong> <input type="text" class="edit-tipo" value="${ordine.tipologia}"></li> 
            <li><strong>Taglia:</strong> <input type="text" class="edit-taglia" value="${ordine.taglia}" style="width:50px;"></li> 
            <li><strong>Qtà:</strong> <input type="number" class="edit-qta" value="${ordine.quantita}" style="width:50px;"></li> 
            <li><strong>Prezzo (€):</strong> <input type="number" class="edit-prezzo" value="${ordine.prezzo_cliente}" style="width:70px;"></li> 
            <li style="grid-column: span 2;">
                <strong>Note:</strong> <textarea class="edit-note">${ordine.note || ''}</textarea>
            </li>
            <li style="grid-column: span 2;">
                <button type="button" style="margin-top: 15px;" class="btn-apri-widget botton_elemem_lista">📷 Cambia Foto</button>
                <span class="status-foto" style="font-size:0.8rem; color:green; display:none;">✅ Caricata!</span>
            </li>
        </ul>
        <div class="azioni">
            <button class="botton_elemem_lista btn_salva" style="background:rgb(212, 237, 218)">✅ Salva</button>
            <button class="botton_elemem_lista btn_annulla" style="background:rgb(248, 215, 218)">❌ Annulla</button>
        </div>
    `;

    // --- 1. GESTIONE CLOUDINARY ---
    const btnWidget = li.querySelector('.btn-apri-widget');
    const statusFoto = li.querySelector('.status-foto');

    if (typeof cloudinary !== 'undefined') {
        const editWidget = cloudinary.createUploadWidget({
            cloudName: "dfjburbax", 
            uploadPreset: "joajwzcg",
            multiple: false
        }, (error, result) => {
            if (!error && result && result.event === "success") {
                nuovoUrlImmagine = result.info.secure_url; 
                statusFoto.style.display = "inline";
            }
        });
        btnWidget.onclick = () => editWidget.open();
    } else {
        btnWidget.innerText = "Cloudinary Error";
        btnWidget.disabled = true;
    }

    // --- 2. TASTO ANNULLA ---
    li.querySelector('.btn_annulla').onclick = () => {
        li.innerHTML = cont_old;
        li.classList.remove('editing-mode');
        // Ricollego il tasto modifica originale
        const btnMod = li.querySelector('button[title="Modifica"]');
        if(btnMod) btnMod.onclick = () => ModificaCard(li, ordine);
    };

    // --- 3. TASTO CONFERMA (Salva) ---
    li.querySelector('.btn_salva').onclick = async () => {
        console.log("Pulsante Salva cliccato!"); // Verifica in console

        const datiAggiornati = {
            id: ordine.id,
            data_ordine: li.querySelector('.edit-data').value,
            stato: li.querySelector('.edit-stato').value,
            marchio: li.querySelector('.edit-marca').value,
            tipologia: li.querySelector('.edit-tipo').value,
            taglia: li.querySelector('.edit-taglia').value,
            quantita: li.querySelector('.edit-qta').value,
            prezzo_cliente: li.querySelector('.edit-prezzo').value,
            note: li.querySelector('.edit-note').value,
            image_path: nuovoUrlImmagine 
        };

        console.log("Dati pronti per l'invio:", datiAggiornati);
        await salvaModifica(datiAggiornati);
    };
}


async function salvaModifica(dati) {
    try {
        console.log("Inviando dati al server...", dati);

        const response = await fetch('/api/update-order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dati) // Trasforma l'oggetto in testo JSON
        });

        const result = await response.json();

        if (result.success) {
            alert("Ottimo! Ordine aggiornato con successo. 🚀");
            
            // Rinfreschiamo la lista senza ricaricare tutta la pagina
            if (typeof caricaOrdiniDalDatabase === "function") {
                caricaOrdiniDalDatabase();
            } else {
                // Se per qualche motivo la funzione non è globale, ricarichiamo la pagina
                location.reload();
            }
        } else {
            alert("Ops! Il server dice: " + result.message);
        }
    } catch (err) {
        console.error("Errore durante il fetch:", err);
        alert("Errore di connessione: il server non risponde.");
    }
}