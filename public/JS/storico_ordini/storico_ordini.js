document.addEventListener('DOMContentLoaded', async () => {
    // prendo tag ul della lista
    const listaUl = document.querySelector('.lista_ordini');

    // funzione per caricare ordini da db
    async function caricaOrdiniDalDatabase() 
    {
        try {
            const response = await fetch('/api/get-orders');
            const result = await response.json();

            if (result.success && result.data.length > 0) {
                listaUl.innerHTML = ''; // Svuota il caricamento

                const isAdmin = localStorage.getItem('isAdmin') === 'true';

                for (let i = 0; i < result.data.length; i++) 
                {
                    const ordine = result.data[i]; // Estraiamo l'elemento corrente
                    const li = document.createElement('li');
    
                    // GESTIONE NOME CLIENTE
                    const nomeCliente = (ordine.clienti && ordine.clienti.societa) 
                        ? ordine.clienti.societa 
                        : 'Nome Società sconosciuto';

                    // Definizione Colore Stato
                    let coloreStato = "#e74c3c"; // Rosso
                    if(ordine.stato === 'In Lavorazione') coloreStato = "#f1c40f";
                    if(ordine.stato === 'Evaso') coloreStato = "#2ecc71";
                    if(ordine.stato === 'Archiviato') coloreStato = "#bdc3c7";

                    // mapping colore rgb -> termine inglese
                    // ntc.name restituisce un array: [codice_hex_vicino, nome_colore, match_esatto(bool)]
                    const map = ntc.name(ordine.colore);
                    const name_color = map[1]; // Nome in inglese (es: "Rajah")

                    // Costruzione HTML Card
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
                            <li><strong>Cliente:</strong> ${nomeCliente}</li> 
                            <li><strong>Marca:</strong> ${ordine.marchio}</li> 
                            <li><strong>Tipologia:</strong> ${ordine.tipologia}</li> 
                            <li><strong>Colore:</strong><span style="display:inline-block; width:12px; height:12px; background:${ordine.colore}; border-radius:50%; border:1px solid #ccc;"></span> ${name_color}</li>
                            <li><strong>Taglia:</strong> ${ordine.taglia}</li> 
                            <li><strong>Quantità:</strong> ${ordine.quantita}</li> 
                            <li><strong>Prezzo Cliente:</strong> €${parseFloat(ordine.prezzo_cliente).toFixed(2)}</li> 
                            <li class="admin-only" style="display: ${isAdmin ? 'block' : 'none'}; color: #d35400;">
                                <strong>Costo Azienda:</strong> €${parseFloat(ordine.prezzo_azienda).toFixed(2)}
                            </li>
                            <li style="grid-column: span 2;"><strong>Note:</strong> ${ordine.note || 'Nessuna nota'}</li> 
                        </ul>
        
                        <div class="azioni">
                            <button class="botton_elemem_lista" title="Allegato" 
                                style="display: ${ordine.image_path ? 'inline-block' : 'none'}"
                                onclick="window.open('${ordine.image_path}', '_blank')">📎</button>
                            <button class="botton_elemem_lista" title="Modifica">📝</button>
                            <button class="botton_elemem_lista btn_pdf" title="Esporta PDF">📄</button>
                        </div>
                    `;
                    // attivazione del bottone di modifica
                    const btn_mod = li.querySelector('button[title="Modifica"]');
                    btn_mod.onclick = () => ModificaCard(li, ordine);
                    listaUl.appendChild(li);
                }
            } 
            else 
            {
                listaUl.innerHTML = '<p style="text-align:center; padding:20px;">Nessun ordine trovato!</p>';
            }
        } catch (err) {
            console.error("Errore:", err);
            listaUl.innerHTML = '<p>Errore tecnico nel caricamento.</p>';
        }
    }

    caricaOrdiniDalDatabase();
});