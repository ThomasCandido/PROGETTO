// 1. CONFIGURAZIONE STATI
const list_stati = ["Ordinato", "In Lavorazione", "Evaso", "Archiviato"];

// 2. AGGIORNAMENTO GRAFICO (Senza ricaricare tutto)
function aggiornaCardGraficamente(id, nuovoStato) {
    const checkbox = document.querySelector(`input[name="ordine_sel"][value="${id}"]`);
    if (!checkbox) return;

    const card = checkbox.closest('li');
    if (!card) return;

    // Aggiorna testo
    const labelStato = card.querySelector('.stato b');
    if (labelStato) labelStato.innerText = nuovoStato;

    // Aggiorna semaforo
    const pallina = card.querySelector('.semaforo_stato');
    if (pallina) {
        let colore = "#e74c3c";
        if (nuovoStato === 'In Lavorazione') colore = "#f1c40f";
        if (nuovoStato === 'Evaso') colore = "#2ecc71";
        if (nuovoStato === 'Archiviato') colore = "#bdc3c7";
        pallina.style.backgroundColor = colore;
    }

    // Feedback visivo
    card.style.transition = "background-color 0.5s";
    card.style.backgroundColor = "#fff9c4"; 
    setTimeout(() => card.style.backgroundColor = "", 1000);
}

// 3. LOGICA DEL TIMER
async function eseguiCicloSimulazione(idOrdine, statoIniziale) {
    let indice = list_stati.indexOf(statoIniziale);
    if (indice === -1) indice = 0;

    const stepRimanenti = (list_stati.length - 1) - indice;
    if (stepRimanenti <= 0) return; 

    const msPerStep = (30 * 1000) / stepRimanenti;

    for (let i = indice + 1; i < list_stati.length; i++) {
        await new Promise(res => setTimeout(res, msPerStep));
        const prossimoStato = list_stati[i];

        try {
            const res = await fetch('/api/update-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: idOrdine, stato: prossimoStato })
            });

            if (res.ok) {
                console.log(`[Auto] Ordine ${idOrdine} -> ${prossimoStato}`);
                aggiornaCardGraficamente(idOrdine, prossimoStato);
            }
        } catch (err) { console.error("Errore simulazione:", err); break; }
    }
}

// 4. CARICAMENTO ORDINI (TUTTO L'HTML RIPRISTINATO)
async function caricaOrdiniDalDatabase() {
    const listaUl = document.querySelector('.lista_ordini');
    if (!listaUl) return;

    try {
        const response = await fetch('/api/get-orders');
        const result = await response.json();

        if (result.success && result.data.length > 0) {
            listaUl.innerHTML = ''; 
            const isAdmin = localStorage.getItem('isAdmin') === 'true';

            result.data.forEach(ordine => {
                const li = document.createElement('li');

                // Colore Stato
                let coloreStato = "#e74c3c";
                if(ordine.stato === 'In Lavorazione') coloreStato = "#f1c40f";
                if(ordine.stato === 'Evaso') coloreStato = "#2ecc71";
                if(ordine.stato === 'Archiviato') coloreStato = "#bdc3c7";

                // Nome Colore (ntc.js)
                const map = ntc.name(ordine.colore);
                const name_color = map[1];

                li.innerHTML = `
                    <div class="selezione">
                        <input type="checkbox" name="ordine_sel" value="${ordine.id}">
                    </div>
                    <div class="info">
                        <p class="id_ord"><b>cod:${ordine.id.toString().padStart(4, '0')}</b></p>
                        <p class="data_ord"><b>${new Date(ordine.data_ordine).toLocaleDateString('it-IT')}</b></p>
                    </div>
                    <div class="stato">
                        <p class="semaforo_stato" style="background-color: ${coloreStato};"></p>
                        <p><b>${ordine.stato || 'Ordinato'}</b></p>
                    </div>
                    <ul class="dettagli">
                        <li><strong>Cliente:</strong> ${ordine.clienti?.societa || 'Sconosciuto'}</li> 
                        <li><strong>Marca:</strong> ${ordine.marchio}</li> 
                        <li><strong>Tipologia:</strong> ${ordine.tipologia}</li> 
                        <li><strong>Colore:</strong><span style="display:inline-block; width:12px; height:12px; background:${ordine.colore}; border-radius:50%; border:1px solid #ccc; margin-left:5px;"></span> ${name_color}</li>
                        <li><strong>Taglia:</strong> ${ordine.taglia}</li> 
                        <li><strong>Quantità:</strong> ${ordine.quantita}</li> 
                        <li><strong>Prezzo Cl:</strong> €${parseFloat(ordine.prezzo_cliente).toFixed(2)}</li> 
                        <li class="admin-only" style="display: ${isAdmin ? 'block' : 'none'}; color: #d35400;">
                            <strong>Costo Az:</strong> €${parseFloat(ordine.prezzo_azienda).toFixed(2)}
                        </li>
                        <li><strong>Costo Totale:</strong> €${parseFloat(ordine.prezzo_cliente * ordine.quantita).toFixed(2)}</li> 
                        <li style="grid-column: span 2;"><strong>Note:</strong> ${ordine.note || 'Nessuna nota'}</li> 
                    </ul>
                    <div class="azioni">
                        <button class="botton_elemem_lista" title="Allegato" 
                            style="display: ${ordine.image_path ? 'inline-block' : 'none'}"
                            onclick="apriPopupAllegato('${ordine.image_path}')">📎
                        </button>
                        <button class="botton_elemem_lista" title="Modifica">📝</button>
                        <button class="botton_elemem_lista btn_pdf" title="Esporta PDF">📄</button>
                    </div>
                `;

                // Attivazione bottoni (Modifica e PDF)
                const btn_mod = li.querySelector('button[title="Modifica"]');
                if (btn_mod) btn_mod.onclick = () => ModificaCard(li, ordine);
                
                // Qui aggiungerai la tua funzione per il PDF
                const btn_pdf = li.querySelector('.btn_pdf');
                if (btn_pdf) btn_pdf.onclick = () => console.log("Stampa PDF ordine:", ordine.id);

                listaUl.appendChild(li);
            });

            // Avvio timer
            result.data.forEach(o => {
                if (o.stato !== "Archiviato") eseguiCicloSimulazione(o.id, o.stato || "Ordinato");
            });

        } else {
            listaUl.innerHTML = '<p style="text-align:center;">Nessun ordine trovato!</p>';
        }
    } catch (err) { console.error("Errore caricamento:", err); }
}


// Funzione per aprire il pop-up
function apriPopupAllegato(url) 
{
    const modal = document.getElementById('modalAllegato');
    const img = document.getElementById('img_pop-up');
    
    if (modal && img) {
        img.src = url; // Imposta l'URL dell'immagine Cloudinary
        modal.style.display = 'flex'; // Mostra il pop-up
        document.body.style.overflow = 'hidden'; // Blocca lo scroll della pagina sotto
    }
}

// Funzione per chiudere il pop-up
function chiudiPopup() {
    const modal = document.getElementById('modalAllegato');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Riattiva lo scroll
    }
}

// 5. AVVIO
document.addEventListener('DOMContentLoaded', caricaOrdiniDalDatabase);