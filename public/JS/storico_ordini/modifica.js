async function ModificaCard(li, ordine) {
    // 1. DETERMINIAMO I PERMESSI
    const isAdmin = localStorage.getItem('isAdmin') === 'true' || localStorage.getItem('isAdmin') === true;
    const isEditable = isAdmin ? true : (ordine.stato === 'Ordinato');

    const cont_old = li.innerHTML;
    const stati = ['Ordinato', 'In Lavorazione', 'Evaso', 'Archiviato'];
    const option_stato = stati.map(s => `
        <option value="${s}" ${ordine.stato === s ? 'selected' : ''}>${s}</option>
    `).join('');
    
    const dataIso = new Date(ordine.data_ordine).toISOString().split('T')[0];
    const nomeCliente = (ordine.clienti && ordine.clienti.societa) ? ordine.clienti.societa : 'Sconosciuto';

    // Inizializziamo l'URL dell'immagine con quello attuale (se esiste)
    let nuovoUrlImmagine = ordine.image_path || ''; 

    li.classList.add('editing-mode');

    // 2. GENERAZIONE HTML (Con blocchi di sicurezza per i campi)
    li.innerHTML = `
        <div class="info">
            <p class="id_ord"><b>cod:${ordine.id.toString().padStart(4, '0')}</b></p>
            <input type="date" class="edit-data input-ghost" value="${dataIso}" ${!isAdmin ? 'readonly' : ''}>
        </div>
        <div class="stato">
            <select class="edit-stato select-ghost" ${!isAdmin ? 'disabled' : ''}>${option_stato}</select>
        </div>
        <ul class="dettagli">
            <li><strong>Cliente:</strong> ${nomeCliente}</li> 
            <li><strong>Marca:</strong> <input type="text" class="edit-marca" value="${ordine.marchio}" ${!isEditable ? 'disabled' : ''}></li> 
            <li><strong>Tipo:</strong> <input type="text" class="edit-tipo" value="${ordine.tipologia}" ${!isEditable ? 'disabled' : ''}></li> 
            <li><strong>Colore:</strong> <input type="color" class="edit-colore input-color-custom" value="${ordine.colore || '#000000'}" ${!isEditable ? 'disabled' : ''}></li>
            <li><strong>Taglia:</strong> <input type="text" class="edit-taglia" value="${ordine.taglia}" style="width:50px;" ${!isEditable ? 'disabled' : ''}></li> 
            <li><strong>Qtà:</strong> <input type="number" class="edit-qta" value="${ordine.quantita}" style="width:50px;" ${!isEditable ? 'disabled' : ''}></li> 
            <li><strong>Prezzo (€):</strong> <input type="number" class="edit-prezzo" value="${ordine.prezzo_cliente}" style="width:70px;" ${!isAdmin ? 'readonly' : ''}></li> 
            
            ${isAdmin ? `<li><strong>Costo Az. (€):</strong> <input type="number" class="edit-prezzo-az" value="${ordine.prezzo_azienda || 0}" style="width:70px;"></li>` : ''}
            
            <li style="grid-column: span 2;">
                <strong>Note:</strong> <textarea class="edit-note" ${!isEditable ? 'disabled' : ''}>${ordine.note || ''}</textarea>
            </li>
            
            <li style="grid-column: span 2;">
                ${isEditable ? `<button type="button" class="btn-apri-widget botton_elemem_lista">📷 ${ordine.image_path ? 'Cambia Foto' : 'Aggiungi Foto'}</button>` : ''}
                <span class="status-foto" style="font-size:0.8rem; color:green; display:none;">✅ Caricata!</span>
            </li>
        </ul>
        <div class="azioni">
            ${isEditable ? 
                `<button class="botton_elemem_lista btn_salva" style="background:#d4edda">✅ Salva</button>` : 
                `<p style="color:red; font-size:0.8rem;">🔒 Modifica non consentita (Stato: ${ordine.stato})</p>`
            }
            <button class="botton_elemem_lista btn_annulla" style="background:#f8d7da">❌ Annulla</button>
        </div>
    `;

    // 3. LOGICA CLOUDINARY (Ottimizzata per velocità)
    const btnWidget = li.querySelector('.btn-apri-widget');
    if (btnWidget) {
        btnWidget.onclick = () => {
            if (typeof cloudinary !== 'undefined') {
                cloudinary.openUploadWidget({
                    cloudName: "dfjburbax", 
                    uploadPreset: "joajwzcg", 
                    multiple: false
                }, (error, result) => {
                    if (!error && result && result.event === "success") {
                        nuovoUrlImmagine = result.info.secure_url;
                        const status = li.querySelector('.status-foto');
                        if (status) status.style.display = 'inline';
                    }
                });
            } else {
                alert("Errore: Libreria Cloudinary non caricata nell'HTML.");
            }
        };
    }

    // 4. TASTO ANNULLA
    li.querySelector('.btn_annulla').onclick = () => {
        li.innerHTML = cont_old;
        li.classList.remove('editing-mode');
        const btnMod = li.querySelector('button[title="Modifica"]');
        if(btnMod) btnMod.onclick = () => ModificaCard(li, ordine);
    };

    // 5. TASTO SALVA
    const btnSalva = li.querySelector('.btn_salva');
    if (btnSalva) {
        btnSalva.onclick = async () => {
            const datiAggiornati = {
                id: ordine.id,
                data_ordine: li.querySelector('.edit-data').value,
                stato: li.querySelector('.edit-stato').value,
                marchio: li.querySelector('.edit-marca').value,
                tipologia: li.querySelector('.edit-tipo').value,
                colore: li.querySelector('.edit-colore').value,
                taglia: li.querySelector('.edit-taglia').value,
                quantita: li.querySelector('.edit-qta').value,
                prezzo_cliente: li.querySelector('.edit-prezzo').value,
                prezzo_azienda: isAdmin ? li.querySelector('.edit-prezzo-az').value : ordine.prezzo_azienda,
                note: li.querySelector('.edit-note').value,
                image_path: nuovoUrlImmagine 
            };
            await salvaModifica(datiAggiornati);
        };
    }
}

// 6. FUNZIONE INVIO AL SERVER
async function salvaModifica(dati) {
    try {
        const response = await fetch('/api/update-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dati)
        });
        const res = await response.json();
        if (res.success) {
            alert("✅ Ordine aggiornato!");
            location.reload(); 
        } else {
            alert("❌ Errore: " + res.message);
        }
    } catch (e) {
        alert("❌ Errore di connessione.");
    }
}