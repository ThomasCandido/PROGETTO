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
    setTimeout(() => { toast.classList.remove("show"); }, 3500);
}

document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const isEditMode = params.get('edit') === 'true';
    
    const form = document.getElementById('formCliente'); // Assicurati che il form abbia id="formCliente"
    const title = document.querySelector('h1');
    const submitBtn = document.querySelector('button[type="submit"]');

    const passwordInput = document.getElementById('password');
    const emailInput = document.getElementById('email');
    const telefonoInput = document.getElementById('telefono');

    // ==========================================
    // 1. MODALITÀ MODIFICA (Popolamento campi)
    // ==========================================
    if (isEditMode) {
        title.innerText = "Modifica le tue Credenziali";
        submitBtn.innerText = "Conferma Modifiche";

        // Rendiamo la password facoltativa
        passwordInput.required = false;
        passwordInput.placeholder = "Lascia vuoto per non cambiare";

        try {
            const res = await fetch('/api/get-profile');
            const result = await res.json();

            if (result.success) {
                const d = result.data;
                document.getElementById('societa').value = d.societa || '';
                emailInput.value = d.email || '';
                if(telefonoInput) telefonoInput.value = d.telefono || '';
                document.getElementById('nome').value = d.nome || '';
                document.getElementById('cognome').value = d.cognome || '';
            } else {
                console.error("Errore caricamento dati:", result.message);
            }
        } catch (err) {
            console.error("Errore fetch:", err);
        }
    }

    // ==========================================
    // 2. GESTIONE INVIO E VALIDAZIONE FINALE
    // ==========================================
    form.addEventListener('submit', async (e) => {
        e.preventDefault(); // Blocca l'invio nativo del form

        // --- RECUPERO VALORI ---
        const societa = document.getElementById('societa').value.trim();
        const email = emailInput.value.trim();
        const nome = document.getElementById('nome').value.trim();       
        const cognome = document.getElementById('cognome').value.trim();
        const password = passwordInput.value.trim();
        const telefonoValue = telefonoInput ? telefonoInput.value : "";
        const numeriTel = telefonoValue.replace(/\D/g, '');

        const regexEmailStritta = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        // --- VALIDAZIONE CON TOAST ---
        // Controllo campi obbligatori (la password è obbligatoria solo in inserimento)
        if (societa === "" || email === "" || nome === "" || cognome === "" || (!isEditMode && password === "")) {
            mostraToast("⚠️ Compila tutti i campi obbligatori (*)", "warning");
            return;
        }

        // Controllo formato Email
        if (!regexEmailStritta.test(email)) {
            mostraToast("⚠️ Inserisci un formato email valido.", "warning");
            emailInput.focus();
            return;
        }

        // Controllo lunghezza Telefono (se inserito qualcosa)
        if (numeriTel.length > 0 && numeriTel.length < 9) {
            mostraToast("⚠️ Il numero di telefono è troppo corto.", "warning");
            if(telefonoInput) telefonoInput.focus();
            return;
        }

        // Controllo lunghezza Password (se è stata digitata)
        if (password !== "" && password.length < 8) {
            mostraToast("⚠️ La password deve essere di almeno 8 caratteri.", "warning");
            passwordInput.focus();
            return;
        }

        // --- INVIO DATI AL SERVER ---
        const isAdmin = localStorage.getItem('isAdmin') === 'true';

        const formData = {
            societa: societa,
            email: email,
            telefono: telefonoValue,
            nome: document.getElementById('nome').value,
            cognome: document.getElementById('cognome').value,
            password: password 
        };

        // Scelta della rotta API corretta
        let url = '';
        if (isEditMode) {
            url = '/api/update-profile';
        } else if (isAdmin) {
            url = '/api/admin-add-client'; 
        } else {
            url = '/register'; 
        }

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            // Se è la vecchia registrazione pubblica che restituisce l'HTML
            if (!isEditMode && !isAdmin) {
                const html = await response.text();
                document.open();
                document.write(html);
                document.close();
                return;
            }

            // Se è una delle nostre nuove API JSON
            const resJson = await response.json();
            
            if (resJson.success) {
               mostraToast(isEditMode ? "✅ Profilo aggiornato con successo!" : "✅ Cliente aggiunto con successo!", "success");

                // REDIRECT ritardato per far leggere il Toast
                setTimeout(() => {
                    if (isAdmin) {
                        window.location.href = 'lista_clienti.html';
                    } else {
                        window.location.href = 'storico_ordini_home.html';
                    }
                }, 1500);

            } else {
                mostraToast("❌ Errore: " + resJson.message, "error");
            }
        } catch (err) {
            mostraToast("⚠️ Errore di connessione al server.", "error");
        }
    });
});