document.addEventListener('DOMContentLoaded', function() {

    /* MOSTRA / NASCONDI PASSWORD */
    const passwordInput = document.getElementById('password');
    const btnMostraPassword = document.getElementById('mostra-password');
    const iconaPassword = document.getElementById('icona-password');

    btnMostraPassword.addEventListener('click', function() {

        // Mostra password
        if (passwordInput.type === 'password') {

            passwordInput.type = 'text';
            iconaPassword.src = 'allegati/occhio-aperto.png';
            iconaPassword.alt = 'Nascondi password';

        } else {

            // Nasconde password
            passwordInput.type = 'password';
            iconaPassword.src = 'allegati/occhio-chiuso.png';
            iconaPassword.alt = 'Mostra password';
        }
    });

    /* VALIDAZIONE EMAIL IN TEMPO REALE */

    const emailInput = document.getElementById('email');
    const emailErrore = document.getElementById('email-errore');

    // Regex controllo email
    const emailRegex = /(\w+)@(\w+\.\w+)+/;

    emailInput.addEventListener('input', function() {

        // Campo vuoto
        if (emailInput.value === '') {

            emailErrore.style.display = 'none';
            emailInput.style.borderColor = '#bdc3c7';

        }

        // Email valida
        else if (emailRegex.test(emailInput.value)) {

            emailErrore.style.display = 'none';
            emailInput.style.borderColor = '#27ae60';

        }

        // Email non valida
        else {

            emailErrore.style.display = 'block';
            emailInput.style.borderColor = '#e74c3c';
        }
    });

    /* FORMATTAZIONE AUTOMATICA TELEFONO */
    const telefonoInput = document.getElementById('telefono');

    telefonoInput.addEventListener('input', function(e) {

        // Rimuove caratteri non numerici
        let numeri = e.target.value.replace(/\D/g, '');

        let formattato = '';
        // Prime 3 cifre
        if (numeri.length > 0) {
            formattato += numeri.substring(0, 3);
        }
        // Secondo blocco
        if (numeri.length > 3) {
            formattato += '-' + numeri.substring(3, 6);
        }
        // Ultimo blocco
        if (numeri.length > 6) {
            formattato += '-' + numeri.substring(6, 10);
        }
        // Aggiorna input
        e.target.value = formattato;
    });

});