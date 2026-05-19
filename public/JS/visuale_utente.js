// --- 1. FUNZIONE GLOBALE PER I TOAST (Sostituisce gli alert) ---
function mostraToast(messaggio, tipo = 'error') 
{
    let toast = document.getElementById("toast-container");
    if (!toast) 
    {
        toast = document.createElement("div");
        toast.id = "toast-container";
        document.body.appendChild(toast);
    }
    toast.innerText = messaggio;
    toast.className = ""; // Reset classi
    toast.classList.add("show", `toast-${tipo}`);

    setTimeout(() => { 
        toast.classList.remove("show"); 
    }, 3000);
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/api/get-profile');
        const result = await response.json();
        const paginaAttuale = window.location.pathname;

        if (result.success) {
            // --- 2. LOGICA ANTI-INDIETRO (Loggato) ---
            // Se l'utente è loggato e prova a tornare al login o alla home iniziale
            if (paginaAttuale.includes('login.html')) {
                // Usiamo replace per sovrascrivere la cronologia: il login "non esiste più" per il tasto indietro
                const destinazione = result.data.is_admin ? 'lista_clienti.html' : 'storico_ordini_home.html';
                window.location.replace(destinazione);
                return; 
            }

            const utente = result.data;
            const isAdmin = utente.is_admin;

            // SINCRONIZZAZIONE RUOLO se utente is admin aggiungi classi x visualizzare altre pagine
            localStorage.setItem('isAdmin', isAdmin ? 'true' : 'false');
            if (isAdmin) {
                document.documentElement.classList.add('is-admin');
            } else {
                document.documentElement.classList.remove('is-admin');
            }

            // 3. POPOLAMENTO DATI
            const inputEmail = document.getElementById('f_email');
            const inputCliente = document.getElementById('f_cliente');

            if (inputEmail) {
                inputEmail.value = utente.email || '';
            }

            // 4. LOGICA SPECIFICA PER CLIENTE
            /* se non sei admin non hai accesso ne alle statsistiche ne puoi modificare
               i campi a piacimento
            */
            if (!isAdmin) {
                const btnStats = document.getElementById('openStats');
                if (btnStats) btnStats.style.display = 'none';

                document.querySelectorAll('.admin-only').forEach(el => el.remove());

                if (inputCliente) {
                    inputCliente.value = utente.societa || '';
                    inputCliente.readOnly = true;
                    inputCliente.style.backgroundColor = "#e9ecef";
                    inputCliente.style.cursor = "not-allowed";
                }
            }
        } else {
            /*5. PROTEZIONE ROTTE (Non Loggato) Se non sei loggato e non sei già sulle pagine 
            di accesso, vai al login*/
            if (!paginaAttuale.includes('login.html') && !paginaAttuale.includes('registrazione.html') && paginaAttuale !== '/') {
                window.location.replace('login.html');
            }
        }
    } catch (err) {
        console.error("Errore sessione:", err);
    }
});