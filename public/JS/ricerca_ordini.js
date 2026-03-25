document.addEventListener('DOMContentLoaded', () => {

    const input_R = document.getElementById('inputRicerca');
    const lista = document.querySelector('.lista_ordini');
    const form_R = document.querySelector('.ricerca'); 
    const ordini = lista.querySelectorAll(':scope > li');


    const filtraOrdini = () => {
        const value = input_R.value.toLowerCase();
        let trovati = 0;

        for (var i = 0; i < ordini.length; i++) {
            const text = ordini[i].innerText.toLowerCase();
            
            if (text.indexOf(value) > -1) {
                ordini[i].style.display = ""; 
                ordini[i].style.animation = "fadeIn 0.3s";
                trovati++;
            } else {
                ordini[i].style.display = "none";
            }
        }
        gestisciMessaggioVuoto(trovati);
    };

    const gestisciMessaggioVuoto = (num) => {
        let msg = document.getElementById('no-results-msg');
        if (num === 0) {
            if (!msg) {
                msg = document.createElement('p');
                msg.id = 'no-results-msg';
                msg.innerHTML = "❌ Nessun ordine trovato.";
                msg.style.textAlign = "center";
                lista.parentNode.insertBefore(msg, lista.nextSibling);
            }
        } else if (msg) {
            msg.remove();
        }
    };

    input_R.addEventListener('keyup', filtraOrdini);
    
    form_R.addEventListener('submit', () => {
        input_R.value = '';  
        filtraOrdini();  
        input_R.focus();
    });
});