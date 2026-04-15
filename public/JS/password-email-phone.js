document.addEventListener('DOMContentLoaded', function() {
    
    /* =========================================
       MOSTRA/NASCONDI PASSWORD
       ========================================= */
    const passwordInput = document.getElementById('password');
    const btnMostraPassword = document.getElementById('mostra-password');
    const iconaPassword = document.getElementById('icona-password');

    btnMostraPassword.addEventListener('click', function() {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            iconaPassword.src = 'allegati/occhio-aperto.png';
            iconaPassword.alt = 'Nascondi password';
        } else {
            passwordInput.type = 'password';
            iconaPassword.src = 'allegati/occhio-chiuso.png';
            iconaPassword.alt = 'Mostra password';
        }
    });

    /* =========================================
       CONTROLLO EMAIL IN REAL TIME
       ========================================= */
    // 1. Peschiamo gli elementi
    const emailInput = document.getElementById('email');
    const emailErrore = document.getElementById('email-errore');

    // 2. Creiamo la RegEx (La formula per le email)
    const emailRegex = /(\w+)@(\w+\.\w+)+/;
    /* \w è uno shortcut per [a-zA-Z0-9_] */

    // 3. Aggiungiamo una sentinella che ascolta ogni volta che l'utente DIGITA ('input')
    emailInput.addEventListener('input', function() {
        
        // Se il campo è vuoto, resettiamo tutto allo stato normale
        if (emailInput.value === '') {
            emailErrore.style.display = 'none';
            emailInput.style.borderColor = '#bdc3c7'; // Il colore base del tuo CSS
        } 
        // Se l'email inserita RISPETTA la formula (è valida)
        else if (emailRegex.test(emailInput.value)) {
            emailErrore.style.display = 'none';
            emailInput.style.borderColor = '#27ae60'; // Diventa verde!
        } 
        // Se l'email NON RISPETTA la formula (è invalida)
        else {
            emailErrore.style.display = 'block';      // Mostra il testo rosso
            emailInput.style.borderColor = '#e74c3c'; // Il bordo diventa rosso
        }
    });
/* =========================================
       FORMATTAZIONE AUTOMATICA TELEFONO
       ========================================= */
    const telefonoInput = document.getElementById('telefono');

    telefonoInput.addEventListener('input', function(e) {
        // 1. Rimuoviamo tutto ciò che NON è un numero dalla stringa digitata
        // La RegExp \D significa "non-digit" (tutto ciò che non è 0-9)
        let numeri = e.target.value.replace(/\D/g, '');
        
        // 2. Creiamo una variabile vuota per costruire il numero formattato
        let formattato = '';
        
        // 3. Aggiungiamo i pezzi e i trattini in base a quanti numeri ha digitato l'utente
        if (numeri.length > 0) {
            formattato +=  numeri.substring(0, 3); // Aggiunge le prime 3 cifre
        }
        if (numeri.length > 3) {
            formattato += '-' + numeri.substring(3, 6); // Aggiunge un trattino e le successive 3 cifre
        }
        if (numeri.length > 6) {
            formattato += '-' + numeri.substring(6, 10); // Aggiunge un altro trattino e le ultime 4 cifre
        }
        
        // 4. Aggiorniamo il campo di testo con il valore formattato
        e.target.value = formattato;
    });

});