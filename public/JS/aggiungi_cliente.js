/*
* GESTIONALE TIPOGRAFIA - aggiungi_cliente.js
* Svolge la doppia funzione di:
* 1. Inserimento di un nuovo cliente (da parte di un Admin) o registrazione pubblica.
* 2. Modifica del profilo dell'utente attualmente loggato.
*/


// 1. SISTEMA DI NOTIFICA TOAST (GLOBALE)

/*
* Mostra un messaggio di notifica temporaneo sullo schermo.
* messaggio - Il testo da visualizzare.
* tipo - Il tipo di notifica ('success', 'warning', 'error').
*/
function mostraToast(messaggio, tipo = 'error') {
    // Cerca il container dei toast, se non esiste lo crea dinamicamente
    let toast = document.getElementById("toast-container");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "toast-container";
        document.body.appendChild(toast);
    }
    
    // Configura il testo e resetta le classi precedenti
    toast.innerText = messaggio;
    toast.className = ""; 
    
    // Attiva il toast applicando le classi di stile CSS
    toast.classList.add("show", `toast-${tipo}`);
    
    // Nasconde automaticamente il toast dopo 3.5 secondi
    setTimeout(() => { 
        toast.classList.remove("show"); 
    }, 3500);
}

// 2. INIZIALIZZAZIONE DELLA PAGINA

document.addEventListener('DOMContentLoaded', async () => {
    // Analisi dei parametri URL per determinare la modalità (es. ?edit=true)
    const params = new URLSearchParams(window.location.search);
    const isEditMode = params.get('edit') === 'true';
    
    // Riferimenti agli elementi principali del DOM
    const form = document.getElementById('formCliente'); 
    const title = document.querySelector('h1');
    const submitBtn = document.querySelector('button[type="submit"]');

    // Riferimenti specifici ai campi di input per la validazione
    const passwordInput = document.getElementById('password');
    const emailInput = document.getElementById('email');
    const telefonoInput = document.getElementById('telefono');

    // Gestione Modalità Modifica Profilo

    if (isEditMode) {
        // Aggiorna l'interfaccia grafica per riflettere la modifica
        title.innerText = "Modifica le tue Credenziali";
        submitBtn.innerText = "Conferma Modifiche";

        // Rende la password facoltativa durante la modifica
        passwordInput.required = false;
        passwordInput.placeholder = "Lascia vuoto per non cambiare";

        // Recupera i dati attuali del profilo dal server
        try {
            const res = await fetch('/api/get-profile');
            const result = await res.json();

            if (result.success) {
                // Popola i campi del form con i dati ricevuti dal database
                const d = result.data;
                document.getElementById('societa').value = d.societa || '';
                emailInput.value = d.email || '';
                if (telefonoInput) telefonoInput.value = d.telefono || '';
                document.getElementById('nome').value = d.nome || '';
                document.getElementById('cognome').value = d.cognome || '';
            } else {
                console.error("Errore caricamento dati profilo:", result.message);
                mostraToast("❌ Impossibile caricare i dati del profilo.", "error");
            }
        } catch (err) {
            console.error("Errore di connessione durante il recupero profilo:", err);
        }
    }

    // 3. GESTIONE INVIO E VALIDAZIONE DEL FORM

    form.addEventListener('submit', async (e) => {
        e.preventDefault(); // Impedisce il rinfresco nativo della pagina

        // --- RECUPERO E PULIZIA DEI VALORI ---
        const societa = document.getElementById('societa').value.trim();
        const email = emailInput.value.trim();
        const nome = document.getElementById('nome').value.trim();       
        const cognome = document.getElementById('cognome').value.trim();
        const password = passwordInput.value.trim();
        const telefonoValue = telefonoInput ? telefonoInput.value : "";
        
        // Estrae solo i caratteri numerici per validare la lunghezza del telefono
        const numeriTel = telefonoValue.replace(/\D/g, '');

        // Espressione regolare per la verifica rigorosa dell'indirizzo email
        const regexEmailScritta = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        // --- CONTROLLI DI VALIDAZIONE (CON TOAST) ---
        
        // 1. Verifica campi obbligatori (la password è obbligatoria solo se NON siamo in modalità modifica)
        if (societa === "" || email === "" || nome === "" || cognome === "" || (!isEditMode && password === "")) {
            mostraToast("⚠️ Compila tutti i campi obbligatori (*)", "warning");
            return;
        }

        // 2. Verifica formattazione sintattica dell'Email
        if (!regexEmailScritta.test(email)) {
            mostraToast("⚠️ Inserisci un formato email valido.", "warning");
            emailInput.focus();
            return;
        }

        // 3. Verifica lunghezza del numero di telefono (se inserito)
        if (numeriTel.length > 0 && numeriTel.length < 9) {
            mostraToast("⚠️ Il numero di telefono è troppo corto.", "warning");
            if (telefonoInput) telefonoInput.focus();
            return;
        }

        // 4. Verifica sicurezza della password (se digitata)
        if (password !== "" && password.length < 8) {
            mostraToast("⚠️ La password deve essere di almeno 8 caratteri.", "warning");
            passwordInput.focus();
            return;
        }

        // --- PACCHETTO DATI DA INVIARE ---
        const formData = {
            societa: societa,
            email: email,
            telefono: telefonoValue,
            nome: nome,
            cognome: cognome,
            password: password 
        };

        // --- SELEZIONE ROUTE IN BASE AL RUOLO E ALLA MODALITÀ ---
        const isAdmin = localStorage.getItem('isAdmin') === 'true';
        let url = '';

        if (isEditMode) {
            url = '/api/update-profile';       // Utente comune/Admin che aggiorna se stesso
        } else if (isAdmin) {
            url = '/api/admin-add-client';     // Admin che crea un account cliente
        } else {
            url = '/register';                 // Registrazione pubblica iniziale
        }

        // --- INVIO RICHIESTA AL SERVER (FETCH) ---
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            // GESTIONE CASO 1: Vecchia registrazione pubblica (risposta in formato HTML/Redirect nativo)
            if (!isEditMode && !isAdmin) {
                const html = await response.text();
                document.open();
                document.write(html);
                document.close();
                return;
            }

            // GESTIONE CASO 2: Nuove rotte API REST (risposta in formato JSON)
            const resJson = await response.json();
            
            if (resJson.success) {
                // Sceglie il messaggio di successo corretto
                const msgSuccesso = isEditMode ? "✅ Profilo aggiornato con successo!" : "✅ Cliente aggiunto con successo!";
                mostraToast(msgSuccesso, "success");

                // Reindirizzamento ritardato di 1.5 secondi per permettere la lettura del Toast
                setTimeout(() => {
                    if (isAdmin) {
                        window.location.href = 'lista_clienti.html';
                    } else {
                        window.location.href = 'storico_ordini_home.html';
                    }
                }, 1500);

            } else {
                // Errore logico restituito dalle risposte del server
                mostraToast("❌ Errore: " + resJson.message, "error");
            }
        } catch (err) {
            // Errore di rete o server offline
            console.error("Errore Fetch:", err);
            mostraToast("⚠️ Errore di connessione al server.", "error");
        }
    });
});