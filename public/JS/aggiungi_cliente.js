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

    // --- GESTIONE INVIO (Unica per Aggiungi e Modifica) ---
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = {
            societa: document.getElementById('societa').value,
            email: document.getElementById('email').value,
            telefono: document.getElementById('telefono').value,
            nome: document.getElementById('nome').value,
            cognome: document.getElementById('cognome').value,
            password: document.getElementById('password').value
        };

        // Decidiamo l'endpoint in base alla modalità
        const url = isEditMode ? '/api/update-profile' : '/register';

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            // Se è registrazione normale (/register) il server manda un alert HTML
            if (!isEditMode) {
                const html = await response.text();
                document.open();
                document.write(html);
                document.close();
                return;
            }

            // Se è modifica profilo, gestiamo la risposta JSON
            const resJson = await response.json();
            if (resJson.success) {
                alert("Profilo aggiornato con successo!");
                window.location.href = 'storico_ordini_home.html';
            } else {
                alert("Errore: " + resJson.message);
            }
        } catch (err) {
            alert("Errore di connessione al server.");
        }
    });
});