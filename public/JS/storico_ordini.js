document.addEventListener('DOMContentLoaded', async () => {
    const listaUl = document.querySelector('.lista_ordini');

    async function caricaOrdiniDalDatabase() {
        try {
            const response = await fetch('/api/get-orders');
            const result = await response.json();

            if (result.success && result.data.length > 0) {
                listaUl.innerHTML = ''; // Rimuoviamo gli ordini "finti" dell'HTML

                result.data.forEach(ordine => {
                    const li = document.createElement('li');
                    
                    // Gestione colore semaforo in base allo stato del tuo schema
                    let colorStato = "#e74c3c"; // Rosso (Default/Ordinato)
                    if(ordine.stato === 'In Lavorazione') colorStato = "#f1c40f"; // Giallo
                    if(ordine.stato === 'Evaso') colorStato = "#2ecc71"; // Verde
                    if(ordine.stato === 'Archiviato') colorStato = "#bdc3c7"; // Grigio

                    li.innerHTML = `
                        <div class="selezione">
                            <input type="checkbox" name="ordine_sel" value="${ordine.id}">
                        </div>
                        <div class="info">
                            <p class="id_ord"><b>cod:${ordine.id.toString().padStart(4, '0')}</b></p>
                            <p class="data_ord"><b>${new Date(ordine.data_ordine).toLocaleDateString('it-IT')}</b></p>
                        </div>
                        <div class="stato">
                            <p class="semaforo_stato" style="background-color: ${colorStato};"></p>
                            <p><b>${ordine.stato}</b></p>
                        </div>
                        <ul class="dettagli">
                            <li><strong>Marca:</strong> ${ordine.marchio}</li>
                            <li><strong>Tipologia:</strong> ${ordine.tipologia}</li>
                            <li><strong>Quantità:</strong> ${ordine.quantita}</li>
                            <li><strong>Prezzo:</strong> €${ordine.prezzo_cliente}</li>
                            <li><strong>Note:</strong> ${ordine.note || 'Nessuna'}</li>
                        </ul>
                        <div class="azioni">
                            ${ordine.image_path ? `<button class="botton_elemem_lista" onclick="window.open('${ordine.image_path}')">📎</button>` : ''}
                            <button class="botton_elemem_lista">📝</button>
                        </div>
                    `;
                    listaUl.appendChild(li);
                });
            } else {
                listaUl.innerHTML = '<p style="text-align:center; padding:20px;">Nessun ordine trovato.</p>';
            }
        } catch (err) {
            console.error("Errore:", err);
            listaUl.innerHTML = '<p>Errore nel caricamento degli ordini.</p>';
        }
    }

    caricaOrdiniDalDatabase();
});