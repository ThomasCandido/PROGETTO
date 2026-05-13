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
    setTimeout(() => toast.classList.remove("show"), 3500);
}

// =========================================================
// 1. EVENTI IN REAL-TIME E CONTROLLO ERRORI DAL SERVER
// =========================================================
document.addEventListener('DOMContentLoaded', function() {
    
    // --- CONTROLLO ERRORI DAL SERVER NODE.JS ---
    const parametriUrl = new URLSearchParams(window.location.search);
    if (parametriUrl.get('errore') === 'registrazione_fallita') {
        mostraToast("❌ Errore durante la registrazione. L'email potrebbe essere già in uso.", "error");
        // Puliamo l'URL per estetica
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    /* --- MOSTRA/NASCONDI PASSWORD --- */
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

    // 2. I controlli (SOSTITUITI GLI ALERT CON I TOAST)
    if (societa === "" || email === "" || password === "") {
        mostraToast("⚠️ Nome Società, Email e Password sono obbligatori!", "warning");
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