let myChart = null; 

document.addEventListener('DOMContentLoaded', () => {
    setupModalEventi();
});


function setupModalEventi() 
{
    const grafic_stat = document.getElementById('stats');
    const btnOpen = document.getElementById('openStats');
    const btnClose = document.querySelector('.close-modal');

    // gestione click bottone aprtura e chiusura statistiche
    btnOpen.addEventListener('click', () => 
    {
        grafic_stat.style.display = "block";
        aggiornaStatistiche(); // Chiama la logica
    });

    btnClose.addEventListener('click', () => 
    {
        grafic_stat.style.display = "none";
    });
}

// VIEW delle statistiche
function aggiornaStatistiche() 
{
    // calcolo dei dati
    const dati = calcolaDatiOrdini();
    // generazione del disegno
    disegnaIstogramma(dati.labels, dati.percentuali); 
}


function calcolaDatiOrdini() 
{
    const ordini = document.querySelectorAll('.lista_ordini > li');
    // counter diz x stilare la classifica
    const conteggio = {};

    for (let i = 0; i < ordini.length; i++) 
    {
        const ordine = ordini[i];
        const dettaglioTipo = ordine.querySelector('.dettagli li:nth-child(3)').textContent;
        const dettaglioColore = ordine.querySelector('.dettagli li:nth-child(4)').textContent;
        // debugging caso campi null
        const tipo = dettaglioTipo.split(': ')[1] || "Sconosciuto";
        const colore = dettaglioColore.split(': ')[1] || "Sconosciuto";
    
        // counter in diz per contare statistiche comuni
        const chiave = `${tipo} (${colore})`;
        conteggio[chiave] = (conteggio[chiave] || 0) + 1;
    }

    // passaggio da diz a list x sorting
    let listaConteggio = Object.entries(conteggio);

    listaConteggio.sort(function(a, b) {
        let quantitaA = a[1];
        let quantitaB = b[1];
        return quantitaB - quantitaA; 
    });

    // taglio della classifica si tengono i primi 5 top vincitori
    const dati_ord = listaConteggio.slice(0, 5);

    // separazione di Tipo(Colore) e quantità di freq in 2 sub_list
    const labels = dati_ord.map(d => d[0]);
    const valori = dati_ord.map(d => d[1]);
    const totale = ordini.length;
    
    // da lista valori ci creiamo una lista di percentuali
    const percentuali = valori.map(v => parseFloat(((v / totale) * 100).toFixed(1)));

    // Restituisce un oggetto con i dati pronti all'uso
    return { labels, percentuali }; 
}

//PARTE GRAFICA DELLA FUNZIONE
function disegnaIstogramma(etichette, dati) {
    const graf_c = document.getElementById('graficoCanvas').getContext('2d');
    
    if (myChart) myChart.destroy(); // Pulisce il grafico vecchio

    // utilizzo della libreria Chart
    myChart = new Chart(graf_c, {
        type: 'bar',
        data: {
            labels: etichette,
            datasets: [{
                label: '% di Vendite',
                data: dati,
                backgroundColor: 'rgba(95, 158, 160, 0.7)',
                borderColor: 'cadetblue',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true, max: 100 } },
            plugins: { legend: { onClick: null }}
        }
    });
}