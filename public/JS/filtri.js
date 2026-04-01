document.addEventListener('DOMContentLoaded', () => {
    const filterBtn = document.getElementById('filterBtn');
    const filterMenu = document.getElementById('filterMenu');
    const applyBtn = document.getElementById('applyFilters');
    const listaOrdini = document.querySelector('.lista_ordini');


    // Chiude il menu se clicchi fuori
    document.addEventListener('click', () => filterMenu.classList.remove('show'));
    filterMenu.addEventListener('click', (e) => e.stopPropagation());

    // 2. LOGICA DI FILTRO E ORDINAMENTO
    applyBtn.addEventListener('click', () => {
        // Recuperiamo i criteri di ordinamento (Radio)
        const sortType = document.querySelector('input[name="sort"]:checked').value;
        
        // Recuperiamo gli stati selezionati (Checkbox)
        const activeStatuses = Array.from(document.querySelectorAll('.status-filter:checked'))
                                    .map(cb => cb.value.toLowerCase());

        // Trasformiamo i <li> in un Array per poterli ordinare
        let ordini = Array.from(listaOrdini.querySelectorAll(':scope > li'));

        // --- FASE 1: FILTRO PER STATO ---
        ordini.forEach(ordine => {
            const statoTesto = ordine.querySelector('.stato b').innerText.toLowerCase();
            // Se lo stato dell'ordine è tra quelli scelti, lo mostriamo, altrimenti lo nascondiamo
            if (activeStatuses.includes(statoTesto)) {
                ordine.style.display = "flex"; // O lo stile che usi nel CSS
            } else {
                ordine.style.display = "none";
            }
        });

        // --- FASE 2: ORDINAMENTO ---
        ordini.sort((a, b) => {
            if (sortType === 'date-new') {
                return parseData(b) - parseData(a); // Dal più recente
            } 
            else if (sortType === 'price-asc') {
                return parsePrezzo(a) - parsePrezzo(b); // Economico prima
            } 
            else if (sortType === 'price-desc') {
                return parsePrezzo(b) - parsePrezzo(a); // Caro prima
            }
        });

        // Riappendiamo gli elementi ordinati nella lista HTML
        ordini.forEach(ordine => listaOrdini.appendChild(ordine));
        
        // Chiudiamo il menu dopo l'applicazione
        filterMenu.classList.remove('show');
    });

    // --- FUNZIONI DI SUPPORTO ---

    // Estrae la data e la trasforma in un numero confrontabile
    function parseData(el) {
        const dataStr = el.querySelector('.data_ord b').innerText; // Es: "05/03/2026"
        const [giorno, mese, anno] = dataStr.split('/');
        return new Date(anno, mese - 1, giorno).getTime();
    }

    // Estrae il prezzo (Cliente 1pz) e lo trasforma in numero
    function parsePrezzo(el) {
        const dettagli = Array.from(el.querySelectorAll('.dettagli li'));
        // Cerchiamo la riga che contiene il prezzo cliente
        const rigaPrezzo = dettagli.find(li => li.innerText.includes('Prezzo Cliente'));
        if (rigaPrezzo) {
            // Estrae solo il numero dopo il simbolo €
            const prezzoStr = rigaPrezzo.innerText.split('€')[1].trim();
            return parseFloat(prezzoStr);
        }
        return 0;
    }
});