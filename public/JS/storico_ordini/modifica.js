async function ModificaCard(li, ordine) {
    const cont_old = li.innerHTML;
    const stati = ['Ordinato', 'In Lavorazione', 'Evaso', 'Archiviato'];
    const option_stato = stati.map(s => `<option value="${s}" ${ordine.stato === s ? 'selected' : ''}>${s}</option>`).join('');
    const dataIso = new Date(ordine.data_ordine).toISOString().split('T')[0];
    const nomeCliente = (ordine.clienti && ordine.clienti.societa) ? ordine.clienti.societa : 'Privato';

    li.classList.add('editing-mode');

    // Manteniamo le stesse classi CSS della card originale!
    li.innerHTML = `
        <div class="selezione">
            <input type="checkbox" disabled> </div>
        
        <div class="info">
            <p class="id_ord"><b>cod:${ordine.id.toString().padStart(4, '0')}</b></p>
            <input type="date" id="edit-data-${ordine.id}" value="${dataIso}" class="input-ghost">
        </div>
        
        <div class="stato">
            <select id="edit-stato-${ordine.id}" class="select-ghost">
                ${option_stato}
            </select>
        </div>
        
        <ul class="dettagli">
            <li><strong>Cliente:</strong> ${nomeCliente}</li> 
            <li><strong>Marca:</strong> <input type="text" id="edit-marca-${ordine.id}" value="${ordine.marchio}" class="input-ghost"></li> 
            <li><strong>Tipo:</strong> <input type="text" id="edit-tipo-${ordine.id}" value="${ordine.tipologia}" class="input-ghost"></li> 
            <li><strong>Colore:</strong> <input type="color" id="edit-colore-${ordine.id}" value="${ordine.colore}" style="width:20px; height:20px; border:none; vertical-align:middle;"></li> 
            <li><strong>Taglia:</strong> <input type="text" id="edit-taglia-${ordine.id}" value="${ordine.taglia}" class="input-ghost" style="width:40px;"></li> 
            <li><strong>Qtà:</strong> <input type="number" id="edit-qta-${ordine.id}" value="${ordine.quantita}" class="input-ghost" style="width:50px;"></li> 
            <li><strong>Prezzo (€):</strong> <input type="number" step="0.01" id="edit-prezzo-c-${ordine.id}" value="${ordine.prezzo_cliente}" class="input-ghost" style="width:70px;"></li> 
            <li style="grid-column: span 2;">
                <strong>Note:</strong> <textarea id="edit-note-${ordine.id}" class="input-ghost">${ordine.note || ''}</textarea>
            </li>
            <li style="grid-column: span 2;">
                <strong>Nuovo Allegato:</strong> <input type="file" id="edit-file-${ordine.id}" accept="image/*" style="font-size: 0.8rem;">
            </li>
        </ul>
        
        <div class="azioni">
            <button class="btn-salva-agg" title="Salva">✅</button>
            <button class="btn-annulla-agg" title="Annulla">❌</button>
        </div>
    `;

    // --- Eventi ---
    li.querySelector('.btn-annulla-agg').onclick = () => {
        li.innerHTML = cont_old;
        li.classList.remove('editing-mode');
        caricaOrdiniDalDatabase(); 
    };

    li.querySelector('.btn-salva-agg').onclick = async () => {
        const formData = new FormData();
        formData.append('id', ordine.id);
        formData.append('data_ordine', document.getElementById(`edit-data-${ordine.id}`).value);
        formData.append('stato', document.getElementById(`edit-stato-${ordine.id}`).value);
        formData.append('marchio', document.getElementById(`edit-marca-${ordine.id}`).value);
        formData.append('tipologia', document.getElementById(`edit-tipo-${ordine.id}`).value);
        formData.append('taglia', document.getElementById(`edit-taglia-${ordine.id}`).value);
        formData.append('quantita', document.getElementById(`edit-qta-${ordine.id}`).value);
        formData.append('colore', document.getElementById(`edit-colore-${ordine.id}`).value);
        formData.append('prezzo_cliente', document.getElementById(`edit-prezzo-c-${ordine.id}`).value);
        formData.append('note', document.getElementById(`edit-note-${ordine.id}`).value);

        const fileInput = document.getElementById(`edit-file-${ordine.id}`);
        if (fileInput.files[0]) formData.append('immagine', fileInput.files[0]);

        await salvaModifica(formData);
    };
}
async function salvaModifica(formData) {
    try {
        const response = await fetch('/api/update-order', {
            method: 'POST', 
            // NOTA: Con FormData NON devi impostare l'header Content-Type.
            // Il browser lo fa da solo includendo il "boundary" necessario per i file.
            body: formData 
        });

        const result = await response.json();

        if (result.success) {
            alert("Ordine aggiornato con successo! ✅");
            // Invece di reload, richiamiamo la funzione globale per rinfrescare la lista
            if (typeof caricaOrdiniDalDatabase === "function") {
                caricaOrdiniDalDatabase();
            } else {
                location.reload();
            }
        } else {
            alert("Errore dal server: " + result.message);
        }
    } catch (err) {
        console.error("Errore nell'invio:", err);
        alert("Errore tecnico durante il salvataggio.");
    }
}