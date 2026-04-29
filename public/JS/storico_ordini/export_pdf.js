document.addEventListener('click', function (e) {
    const btn = e.target.closest('.btn_pdf');
    if (btn) {
        const card = btn.closest('li');
        if (card) generaPDF(card);
    }
});

function generaPDF(card) {
    // 1. ESTRAZIONE DATI "INFALLIBILE" (Unisce la tua vecchia idea alla mia)
    // Cerca la parola chiave, ma se non la trova, usa il numero della riga come facevi tu all'inizio!
    const getVal = (keyword, index) => {
        const righe = Array.from(card.querySelectorAll('.dettagli li'));
        
        // Cerca per parola (es: "client")
        let riga = righe.find(li => li.innerText.toLowerCase().includes(keyword.toLowerCase()));
        
        // Se non la trova, prende la riga in quella posizione esatta (Backup sicuro)
        if (!riga) riga = card.querySelector(`.dettagli li:nth-child(${index})`);
        if (!riga) return "---";

        // Se la card è in modifica, prende il valore dall'input
        const input = riga.querySelector('input, select, textarea');
        if (input) return input.value;

        // Altrimenti taglia dopo i due punti
        return riga.innerText.split(':')[1]?.trim() || "---";
    };

    // Estrazione Sicura ID, Data e Stato
    const codGrezzo = card.querySelector('.id_ord b')?.innerText || "N/A";
    // Rimuove tutte le lettere/simboli (lasciando "00039090") e poi lo converte in numero per togliere gli zeri ("39090")
    const cod = codGrezzo !== "N/A" ? parseInt(codGrezzo.replace(/\D/g, ''), 10) : "N/A";
    
    let data = card.querySelector('.edit-data')?.value;
    if (!data) data = card.querySelector('.data_ord b')?.innerText || "N/A";

    let stato = card.querySelector('.edit-stato')?.value;
    if (!stato) stato = card.querySelector('.stato p:nth-child(2) b')?.innerText || card.querySelector('.stato b')?.innerText || "N/A";

    // Recupero Dati (Parola chiave + Indice riga come salvagente)
    const cliente   = getVal('client', 1);
    const marca     = getVal('marc', 2);
    const tipologia = getVal('tipo', 3); // Se si chiama Articolo, prende comunque la 3° riga!
    const colore    = getVal('color', 4);
    const taglia    = getVal('tagli', 5);
    const qtaStr    = getVal('qt', 6);
    const prezzoUn  = getVal('prezz', 7);
    const note      = getVal('not', 9);

    // Calcolo
    const qtaNum = parseInt(qtaStr) || 0;
    const prezzoNum = parseFloat(prezzoUn.replace('€', '').replace(',', '.').trim()) || 0;
    const totale = (qtaNum * prezzoNum).toFixed(2);

    //colore stato
    let coloreStato = "cadetblue"; // Colore di default
    const statoLower = stato.toLowerCase();

    if (statoLower.includes("ordinato")) 
    {
        coloreStato = "#dc3545"; // Rosso
    } 
    else if (statoLower.includes("lavorazione")) 
    {
        coloreStato = "#ffc107"; // Giallo (testo nero dopo)
    } 
    else if (statoLower.includes("evaso")) 
    {
        coloreStato = "#28a745"; // Verde
    } 
    else if (statoLower.includes("archiviato")) 
    {
        coloreStato = "#6c757d"; // Grigio
    }

    // Per il giallo, è meglio il testo scuro, per gli altri bianco
    const coloreTestoStato = statoLower.includes("lavorazione") ? "#000" : "white";

    // 2. CREAZIONE DEL CONTENITORE (Senza attaccarlo alla pagina web = zero lag!)
    const container = document.createElement('div');
    container.className = 'pdf-document';

    // Inserisco gli stili direttamente qui per assicurarmi che si formatti subito
    container.innerHTML = `
        <div style="padding: 30px; font-family: sans-serif; color: #333; background: white;">
            
            <div style="display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 3px solid cadetblue; padding-bottom: 15px; margin-bottom: 30px;">
                <div>
                    <h1 style="margin: 0; color: cadetblue; font-size: 26px; text-transform: uppercase;">Report Ordine</h1>
                    <p style="margin: 5px 0 0 0; color: #777;">Codice: <strong>${cod}</strong> | Data: ${data}</p>
                </div>
                <div style="background-color: ${coloreStato}; color: ${coloreTestoStato}; padding: 6px 14px; border-radius: 50px; font-weight: bold;">
                    ${stato}
                </div>
            </div>

            <p style="font-size: 11px; color: cadetblue; font-weight: bold; text-transform: uppercase; margin-bottom: 5px;">Committente</p>
            <h2 style="font-size: 20px; font-weight: bold; margin: 0 0 25px 0;">${cliente}</h2>

            <table style="width: 100%; border-collapse: collapse; margin-top: 10px; text-align: center;">
                <thead>
                    <tr style="background-color: #f4f8f9;">
                        <th style="border: 1px solid #dee2e6; padding: 10px; text-align: left; width: 25%;">Articolo</th>
                        <th style="border: 1px solid #dee2e6; padding: 10px;">Marca</th>
                        <th style="border: 1px solid #dee2e6; padding: 10px;">Colore</th>
                        <th style="border: 1px solid #dee2e6; padding: 10px;">Taglia</th>
                        <th style="border: 1px solid #dee2e6; padding: 10px;">Qtà</th>
                        <th style="border: 1px solid #dee2e6; padding: 10px;">Prezzo Un.</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="border: 1px solid #dee2e6; padding: 12px; text-align: left;"><strong>${tipologia}</strong></td>
                        <td style="border: 1px solid #dee2e6; padding: 12px;">${marca}</td>
                        <td style="border: 1px solid #dee2e6; padding: 12px;">${colore}</td>
                        <td style="border: 1px solid #dee2e6; padding: 12px;">${taglia}</td>
                        <td style="border: 1px solid #dee2e6; padding: 12px;">${qtaStr}</td>
                        <td style="border: 1px solid #dee2e6; padding: 12px;">€${prezzoNum.toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>

            <div style="margin-top: 25px; padding: 15px; background-color: #fdfdfd; border: 1px dashed #ccc; font-style: italic; font-size: 13px;">
                <strong>Note e Personalizzazioni:</strong><br>
                ${note || "Nessuna nota aggiuntiva."}
            </div>

            <div style="margin-top: 40px; display: flex; justify-content: flex-end;">
                <div style="background-color: #f1f8f9; border: 2px solid cadetblue; padding: 15px 30px; border-radius: 8px; text-align: right;">
                    <p style="font-size: 11px; color: #777; margin: 0;">Prezzo Totale</p>
                    <p style="font-size: 24px; font-weight: bold; color: cadetblue; margin: 0;">€ ${totale}</p>
                </div>
            </div>
        </div>
    `;

    // 3. CONFIGURAZIONE CHE RISOLVE IL TAGLIO A META' E IL BIANCO
    const opt = {
        margin: 10,
        filename: `Bolla_${cod}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
            scale: 2, 
            useCORS: true,
            scrollY: 0, // <--- IL VERO FIX: AZZERA LO SCORRIMENTO NELLA FOTO
            scrollX: 0
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // 4. GENERAZIONE DIRETTA (Senza aggiungere o rimuovere roba dal DOM)
    html2pdf().from(container).set(opt).save();
}