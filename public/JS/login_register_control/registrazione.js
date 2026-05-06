// =========================================================
// 1. EVENTI IN REAL-TIME (Mentre l'utente compila il form)
// =========================================================
document.addEventListener('DOMContentLoaded', function() {
    
    /* --- MOSTRA/NASCONDI PASSWORD --- */
    const passwordInput = document.getElementById('password');
    const btnMostraPassword = document.getElementById('mostra-password');
    const iconaPassword = document.getElementById('icona-password');

    // Controllo di sicurezza: esegue il codice solo se gli elementi esistono nella pagina
    if (btnMostraPassword && passwordInput) {
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
    }

    /* --- CONTROLLO EMAIL IN REAL TIME --- */
    const emailInput = document.getElementById('email');
    const emailErrore = document.getElementById('email-errore');
    const emailRegex = /(\w+)@(\w+\.\w+)+/;

    if (emailInput) {
        emailInput.addEventListener('input', function() {
            if (emailInput.value === '') {
                if(emailErrore) emailErrore.style.display = 'none';
                emailInput.style.borderColor = '#bdc3c7'; 
            } else if (emailRegex.test(emailInput.value)) {
                if(emailErrore) emailErrore.style.display = 'none';
                emailInput.style.borderColor = '#27ae60'; 
            } else {
                if(emailErrore) emailErrore.style.display = 'block';      
                emailInput.style.borderColor = '#e74c3c'; 
            }
        });
    }

    /* --- FORMATTAZIONE AUTOMATICA TELEFONO --- */
    const telefonoInput = document.getElementById('telefono');

    if (telefonoInput) {
        telefonoInput.addEventListener('input', function(e) {
            // Rimuoviamo tutto ciò che NON è un numero
            let numeri = e.target.value.replace(/\D/g, '');
            let formattato = '';
            
            // Costruiamo il numero con i trattini
            if (numeri.length > 0) {
                formattato +=  numeri.substring(0, 3); 
            }
            if (numeri.length > 3) {
                formattato += '-' + numeri.substring(3, 6); 
            }
            if (numeri.length > 6) {
                formattato += '-' + numeri.substring(6, 10); 
            }
            
            // Aggiorniamo l'input con il valore formattato
            e.target.value = formattato;
        });
    }
});

// =========================================================
// 2. CONTROLLO FINALE (Al click sul bottone Submit)
// =========================================================
function validaRegistrazione() {
    // 1. Prendiamo i valori
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const societa = document.getElementById('societa').value.trim();
    
    // RegEx più rigorosa per il controllo finale
    const email_regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // 2. I controlli (Il "Cane da Guardia")
    if (societa === "" || email === "" || password === "") {
        alert("⚠️ Nome Società, Email e Password sono obbligatori!");
        return false; 
    }

    if (!email_regex.test(email)) {
        alert("⚠️ Inserisci un formato email valido.");
        return false;
    }

    if (password.length < 8) {
        alert("⚠️ La password deve essere di almeno 8 caratteri.");
        return false;
    }

    // Se tutto è OK, restituiamo true e il form parte da solo verso il server
    return true;
}