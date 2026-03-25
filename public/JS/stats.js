document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('statsModal');
    const btn = document.getElementById('openStats');
    const closeBtn = document.querySelector('.close-modal');
    let myChart = null; // Variabile per distruggere/ricreare il grafico

    btn.onclick = () => {
        modal.style.display = "block";
        generaSitogramma();
    }

    closeBtn.onclick = () => modal.style.display = "none";
    window.onclick = (e) => { if(e.target == modal) modal.style.display = "none"; }

    function generaSitogramma() {
        const ordini = document.querySelectorAll('.lista_ordini > li');
        const conteggio = {};

        // 1. Leggiamo i dati dalle card presenti
        ordini.forEach(ordine => {
            const tipo = ordine.querySelector('.dettagli li:nth-child(3)').innerText.split(': ')[1];
            const colore = ordine.querySelector('.dettagli li:nth-child(4)').innerText.split(': ')[1];
            const chiave = `${tipo} (${colore})`;
            
            conteggio[chiave] = (conteggio[chiave] || 0) + 1;
        });

        // 2. Trasformiamo in array e prendiamo i primi 5
        const datiOrdinati = Object.entries(conteggio)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        const labels = datiOrdinati.map(d => d[0]);
        const valori = datiOrdinati.map(d => d[1]);
        const totale = valori.reduce((a, b) => a + b, 0);
        const percentuali = valori.map(v => ((v / totale) * 100).toFixed(1));

        // 3. Creiamo il grafico con Chart.js
        const ctx = document.getElementById('statsChart').getContext('2d');
        
        if (myChart) myChart.destroy(); // Pulisce il grafico vecchio

        myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: '% di Vendite',
                    data: percentuali,
                    backgroundColor: 'rgba(95, 158, 160, 0.7)',
                    borderColor: 'cadetblue',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: { y: { beginAtZero: true, max: 100 } }
            }
        });
    }
});