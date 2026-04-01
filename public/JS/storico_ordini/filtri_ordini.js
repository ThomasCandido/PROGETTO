document.addEventListener('DOMContentLoaded', () => {
    // 1. Cattura dei bottoni e lista ordini
    const filterBtn = document.getElementById('filterBtn');
    const filterMenu = document.getElementById('filterMenu');
    const applyBtn = document.getElementById('applyFilters');
    const listaOrdini = document.querySelector('.lista_ordini');

    // 2. Gestione Apertura/Chiusura Menu
    filterBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Impedisce la chiusura immediata cliccando sul tasto
        filterMenu.classList.toggle('show');
    });

    // Chiude il menu se clicchi fuori
    document.addEventListener('click', () => {
        filterMenu.classList.remove('show');
    });

    // Impedisce la chiusura se clicchi dentro il menu stesso
    filterMenu.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // 3. Logica di FILTRO e ORDINAMENTO
    applyBtn.addEventListener('click', () => {
        
        // Recupero del tipo di ordinamento (Radio)
        const sortType = document.querySelector('input[name="sort"]:checked').value;
        
        // Recupero stati selezionati (Checkbox)
        const statiSelezionati = Array.from(document.querySelectorAll('.status-filter:checked')).map(cb => cb.value.toLowerCase());

        // Trasformiamo i <li> in un array per manipolarli
        let ordini = Array.from(listaOrdini.querySelectorAll(':scope > li'));

        // FILTRO PER STATO
        for (let i = 0; i < ordini.length; i++) 
        {
            const ordine = ordini[i]; 
            const statoTesto = ordine.querySelector('.stato b').innerText.toLowerCase();

            if (statiSelezionati.includes(statoTesto)) {
                ordine.style.display = "flex"; 
            } 
            else 
            {
                ordine.style.display = "none";
            }
        }

        // ORDINAMENTO
        ordini.sort((a, b) => {
            if (sortType === 'date-new') {
                return parseData(b) - parseData(a);
            } 
            else if (sortType === 'price-asc') {
                return parsePrezzo(a) - parsePrezzo(b); 
            } 
            else if (sortType === 'price-desc') {
                return parsePrezzo(b) - parsePrezzo(a);
            }
            return 0;
        });

        // Riappendiamo gli elementi ordinati nella lista HTML
        ordini.forEach(ordine => listaOrdini.appendChild(ordine));
        
        // Chiudiamo il menu dopo l'applicazione
        filterMenu.classList.remove('show');
    });

    // FUNZIONI DI SUPPORTO PARSER

    function parseData(element) 
    {
        const dataStr = element.querySelector('.data_ord b').innerText; 
        const [giorno, mese, anno] = dataStr.split('/');
        return new Date(anno, mese - 1, giorno).getTime();
    }

    function parsePrezzo(element) 
    {
        const dettagli = Array.from(element.querySelectorAll('.dettagli li'));
        const rigaPrezzo = dettagli.find(li => li.innerText.includes('Prezzo Cliente'));
        if (rigaPrezzo) 
        {
            const prezzoStr = rigaPrezzo.innerText.split('€')[1].trim();
            return parseFloat(prezzoStr);
        }
        return 0;
    }
});