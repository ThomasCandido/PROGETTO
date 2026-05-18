// --- FUNZIONE GLOBALE PER I TOAST ---
// --- FUNZIONE GLOBALE PER I TOAST ---
function mostraToast(messaggio, tipo = 'error') {
    let toast = document.getElementById("toast-container");

    if (!toast) {
        toast = document.createElement("div");
        toast.id = "toast-container";
        document.body.appendChild(toast);
    }
    toast.innerText = messaggio;
    
    toast.className = ""; 
    
    toast.classList.add("show", `toast-${tipo}`);
    
    setTimeout(() => { 
        toast.classList.remove("show"); 
    }, 3500);
}
// fase di invio dati al server
document.addEventListener('DOMContentLoaded', function() {
    
    // --- controllo errori provenienti dal server NODE.JS ---
    const parametriUrl = new URLSearchParams(window.location.search);
    if (parametriUrl.get('errore') === 'registrazione_fallita') {
        mostraToast("❌ Errore durante la registrazione. L'email potrebbe essere già in uso.", "error");
        // Puliamo l'URL per estetica
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    /* --- logica mostra nascondi password--- */
    const passwordInput = document.getElementById('password');
    const btnMostraPassword = document.getElementById('mostra-password');
    const iconaPassword = document.getElementById('icona-password');

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

    /* --- controlli regex --- */
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

    /* --- formattazione automatica telefono --- */
    const telefonoInput = document.getElementById('telefono');

    if (telefonoInput) {
        telefonoInput.addEventListener('input', function(e) {
            let numeri = e.target.value.replace(/\D/g, '');
            let formattato = '';
            
            if (numeri.length > 0) {
                formattato +=  numeri.substring(0, 3); 
            }
            if (numeri.length > 3) {
                formattato += '-' + numeri.substring(3, 6); 
            }
            if (numeri.length > 6) {
                formattato += '-' + numeri.substring(6, 10); 
            }
            
            e.target.value = formattato;
        });
    }
});

//check validazione campi di registrazione
function validaRegistrazione() {

    // 1. Prendiamo i valori
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const societa = document.getElementById('societa').value.trim();
    
    // Regex per il controllo 
    const email_regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Controllo campi obbligatori (la password è obbligatoria solo in inserimento)
    if (societa === "" || email === "" || nome === "" || cognome === "" || (!isEditMode && password === "")) {
        mostraToast("⚠️ Compila tutti i campi obbligatori (*)", "warning");
        return;
    }
    
    // Controllo lunghezza Telefono (se inserito qualcosa)
    if (numeriTel.length > 0 && numeriTel.length < 9) {
        mostraToast("⚠️ Il numero di telefono è troppo corto.", "warning");
        if(telefonoInput) telefonoInput.focus();
        return false;
    }

    if (!email_regex.test(email)) {
        mostraToast("⚠️ Inserisci un formato email valido.", "warning");
        return false;
    }

    if (password.length < 8) {
        mostraToast("⚠️ La password deve essere di almeno 8 caratteri.", "warning");
        return false;
    }

    // Se tutto è OK, restituiamo true e il form parte verso il server
    return true;
}