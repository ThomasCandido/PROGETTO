document.addEventListener('click', function (e) {
    const btn = e.target.closest('.btn_pdf');
    if (btn) {
        const card = btn.closest('li');
        if (card) generaPDF(card);
    }
});

function generaPDF(card) {
    // Estrazione dati pulita
    const cod = card.querySelector('.id_ord b')?.innerText || "N/A";
    const data = card.querySelector('.data_ord b')?.innerText || "N/A";
    const stato = card.querySelector('.stato p:nth-child(2) b')?.innerText || "N/A";

    const getVal = (i) => card.querySelector(`.dettagli li:nth-child(${i})`)?.innerText.split(': ')[1] || "---";

    const cliente   = getVal(1);
    const marca     = getVal(2);
    const tipologia = getVal(3);
    const colore    = getVal(4);
    const taglia    = getVal(5);
    const qtaStr    = getVal(6);
    const prezzoUn  = getVal(7);
    const note      = getVal(9);

    // Calcolo matematico
    const qtaNum = parseInt(qtaStr) || 0;
    const prezzoNum = parseFloat(prezzoUn.replace('€', '').replace(',', '.').trim()) || 0;
    const totale = (qtaNum * prezzoNum).toFixed(2);

    // Creazione struttura HTML
    const container = document.createElement('div');
    container.className = 'pdf-document';

    container.innerHTML = `
        <div class="pdf-header">
            <div>
                <h1>Report Ordine</h1>
                <p>Codice: <strong>${cod}</strong> | Data Emissione: ${data}</p>
            </div>
            <div class="status-badge">${stato}</div>
        </div>

        <span class="pdf-section-label">Committente</span>
        <div class="pdf-client-name">${cliente}</div>

        <span class="pdf-section-label">Specifiche Tecniche Fornitura</span>
        <table class="pdf-table">
            <thead>
                <tr>
                    <th style="width: 25%">Articolo</th>
                    <th>Marca</th>
                    <th>Colore</th>
                    <th>Taglia</th>
                    <th>Qtà</th>
                    <th>Prezzo Un.</th>
                    <th>Subtotale</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td class="text-left"><strong>${tipologia}</strong></td>
                    <td>${marca}</td>
                    <td>${colore}</td>
                    <td>${taglia}</td>
                    <td>${qtaStr}</td>
                    <td>${prezzoUn}</td>
                    <td><strong>€${totale}</strong></td>
                </tr>
            </tbody>
        </table>

        <span class="pdf-section-label">Note e Personalizzazioni</span>
        <div class="pdf-notes-box">${note || "Nessuna nota aggiuntiva rilevata."}</div>

        <div class="pdf-total-container">
            <div class="pdf-total-card">
                <p class="total-label">TOTALE DOCUMENTO</p>
                <p class="total-amount">€ ${totale}</p>
            </div>
        </div>
    `;

    // Configurazione e Download
    const opt = {
        margin: 10,
        filename: `Bolla_${cod}.pdf`,
        html2canvas: { scale: 2, willReadFrequently: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().from(container).set(opt).save();
}