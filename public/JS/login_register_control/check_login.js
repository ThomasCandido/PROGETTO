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

    // SET TIMEOUT COMPARSA BANNER
    setTimeout(function(){ toast.classList.remove("show"); }, 3500);
}

// VALIDAZIONE LOGIN
async function validaLogin(event) {
    // 1. BLOCCHIAMO IL CARICAMENTO NATIVO DELLA PAGINA (Cruciale per la cronologia!)
    event.preventDefault(); 

    // check dei campi compilati e costruzione della regex
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const email_regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Controlli validità base
    if (email === "" || password === "") 
    {
        mostraToast("⚠️ Errore: Tutti i campi sono obbligatori.", "error");
        return;
    } else if (!email_regex.test(email)) {
        mostraToast("⚠️ Errore: Inserisci un indirizzo email valido.", "error");
        return;
    } else if (password.length < 8) {
        mostraToast("⚠️ Errore: La password deve avere almeno 8 caratteri.", "error");
        return;
    }

    // 2. CHIEDIAMO AL SERVER SE I DATI SONO CORRETTI (esiste l'utente ?)
    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const result = await response.json();

       if (result.success) 
       {
            mostraToast("✅ Accesso eseguito!", "success");
            // 1. Salvataggio del ruolo nel localStorage 
            localStorage.setItem('isAdmin', result.isAdmin);

            // 2. Usa l'URL deciso dal server (redirectUrl) sulla bas del ruolo amministratore o cliente
            setTimeout(() => { window.location.replace(result.redirectUrl);}, 1000);
        }
        else 
        {
            // LOGIN FALLITO! Generazione dei toast appropriati
            if (result.errore === 'utente_non_trovato') 
            {
                mostraToast("⚠️ Errore: Utente non trovato. Controlla l'email!", "error");
            } 
            else if (result.errore === 'password_errata') 
            {
                mostraToast("⚠️ Errore: Password errata. Riprova.", "error");
            } 
            else 
            {
                mostraToast("⚠️ Errore di sistema. Riprova più tardi.", "error");
            }
        }
    } catch (error) {
        console.error("Errore di rete:", error);
        mostraToast("⚠️ Impossibile contattare il server.", "error");
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // GESTIONE OCCHIO (MOSTRA/NASCONDI PASSWORD)
    const passwordInput = document.getElementById('password');
    const btnMostraPassword = document.getElementById('mostra-password');
    const iconaPassword = document.getElementById('icona-password');

    // logica dell'occhio chiuso aperto al click del bottone la password
    // switcha da tipo password a tipo text
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

    const parametriUrl = new URLSearchParams(window.location.search);
    const registrazione = parametriUrl.get('registrazione');

    if (registrazione === 'success') {
        
        mostraToast("✅ Registrazione completata! Ora puoi accedere.", "success");
        // Pulisce la barra degli indirizzi
        window.history.replaceState({}, document.title, window.location.pathname);
    }
});