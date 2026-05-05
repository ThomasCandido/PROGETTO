document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const isEditMode = params.get('edit') === 'true';
    
    const form = document.getElementById('formCliente');
    const title = document.querySelector('h1');
    const submitBtn = document.querySelector('button[type="submit"]');

    if (isEditMode) {
        // --- MODALITÀ MODIFICA ---
        title.innerText = "Modifica le tue Credenziali";
        submitBtn.innerText = "Conferma Modifiche";

        // Rendiamo la password facoltativa
        const passField = document.getElementById('password');
        passField.required = false;
        passField.placeholder = "Lascia vuoto per non cambiare";

        // Carichiamo i dati dal database
        try {
            const res = await fetch('/api/get-profile');
            const result = await res.json();

            if (result.success) {
                const d = result.data;
                document.getElementById('societa').value = d.societa || '';
                document.getElementById('email').value = d.email || '';
                document.getElementById('telefono').value = d.telefono || '';
                document.getElementById('nome').value = d.nome || '';
                document.getElementById('cognome').value = d.cognome || '';
            } else {
                console.error("Errore caricamento dati:", result.message);
            }
        } catch (err) {
            console.error("Errore fetch:", err);
        }
    }

    // --- GESTIONE INVIO (Aggiunta e Modifica) ---
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Recuperiamo il ruolo dal localStorage (settato al login)
        const isAdmin = localStorage.getItem('isAdmin') === 'true';

        const formData = {
            societa: document.getElementById('societa').value,
            email: document.getElementById('email').value,
            telefono: document.getElementById('telefono').value,
            nome: document.getElementById('nome').value,
            cognome: document.getElementById('cognome').value,
            password: document.getElementById('password').value // Sarà stringa vuota se non toccata
        };

        // SCELTA DELLA ROTTA CORRETTA (Qui c'era l'errore del tuo collega!)
        let url = '';
        if (isEditMode) {
            url = '/api/update-profile';
        } else if (isAdmin) {
            url = '/api/admin-add-client'; // Usa la nostra API se chi inserisce è l'Admin!
        } else {
            url = '/register'; // Usa quella vecchia se si iscrive un utente normale
        }

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            // Se è la vecchia registrazione pubblica (che restituisce quel blocco HTML)
            if (!isEditMode && !isAdmin) {
                const html = await response.text();
                document.open();
                document.write(html);
                document.close();
                return;
            }

            // Se è la nostra API Admin o l'Update Profilo (che restituiscono un bel JSON pulito)
            const resJson = await response.json();
            
            if (resJson.success) {
                alert(isEditMode ? "✅ Profilo aggiornato con successo!" : "✅ Cliente aggiunto con successo!");

                // REDIRECT INTELLIGENTE
                if (isAdmin) {
                    window.location.href = 'lista_clienti.html';
                } else {
                    window.location.href = 'storico_ordini_home.html';
                }
            } else {
                alert("❌ Errore: " + resJson.message);
            }
        } catch (err) {
            alert("Errore di connessione al server.");
        }
    });
});