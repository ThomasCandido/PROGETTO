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

    // Dizionario per accumulare le quantità totali per ogni capo
    const conteggio = {};

    // Variabile per calcolare il totale complessivo di TUTTI i pezzi venduti
    let totalePezziVenduti = 0;

    for (let i = 0; i < ordini.length; i++) 
    {
        const ordine = ordini[i];
        
        // 1. estrazione tipo e colore
        const dettaglioTipo = ordine.querySelector('.dettagli li:nth-child(3)').textContent;
        const dettaglioColore = ordine.querySelector('.dettagli li:nth-child(4)').textContent;
        
        // 2. estrazione quantità 
        const dettaglioQta = ordine.querySelector('.dettagli li:nth-child(6)').textContent;
        const qtaEffettiva = parseInt(dettaglioQta.split(': ')[1]) || 0;
        
        // Pulizia testi
        const tipo = dettaglioTipo.split(': ')[1] || "Sconosciuto";
        const colore = dettaglioColore.split(': ')[1] || "Sconosciuto";
    
        const chiave = `${tipo} (${colore})`;
        
        // sum del dizionario
        conteggio[chiave] = (conteggio[chiave] || 0) + qtaEffettiva;
        
        // Accumuliamo nel totale generale per il calcolo delle percentuali corretto
        totalePezziVenduti += qtaEffettiva;
    }

    // 3. conversione da dizionario a lista per essere processato nel sorting
    let listaConteggio = Object.entries(conteggio);

    listaConteggio.sort(function(a, b) {
        let quantitaA = a[1];
        let quantitaB = b[1];
        return quantitaB - quantitaA; 
    });

    // taglio ai 5 capi più venditi
    const dati_ord = listaConteggio.slice(0, 5);

    const labels = dati_ord.map(d => d[0]);
    const valori = dati_ord.map(d => d[1]);
    
    // 4. Calcolo delle percentuali basandosi sul totale dei PEZZI
    const divisore = totalePezziVenduti || 1;
    const percentuali = valori.map(v => parseFloat(((v / divisore) * 100).toFixed(1)));

    return { labels, percentuali }; 
}

//PARTE GRAFICA DELLA FUNZIONE
/*  AVENDO A DISPOSIZIONE I DATI CALCOLATI NELLA FUNZIONI PRECEDENTI VENGONO PASSATI I PARAMETRI FORMALI
    NEL COSTRUTTORE DI CHART CON LE DOVUTE CONFIG DEGLI ISTOGRAMMI*/
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