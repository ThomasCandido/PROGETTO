document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/api/get-profile');
        const result = await response.json();

        if (result.success) {
            const utente = result.data;
            const isAdmin = utente.is_admin;

            // SINCRONIZZAZIONE RUOLO
            localStorage.setItem('isAdmin', isAdmin ? 'true' : 'false');
            if (isAdmin) {
                document.documentElement.classList.add('is-admin');
            } else {
                document.documentElement.classList.remove('is-admin');
            }

            // 2. POPOLAMENTO DATI (Inclusa Email)
            const inputEmail = document.getElementById('f_email');
            const inputCliente = document.getElementById('f_cliente');

            // Se siamo nella pagina profilo, riempiamo l'email (che ora arriva dal server)
            if (inputEmail) {
                inputEmail.value = utente.email || '';
            }

            // 3. LOGICA SPECIFICA PER CLIENTE
            if (!isAdmin) {
                // Nascondi tasto statistiche (se presente nella pagina)
                const btnStats = document.getElementById('openStats');
                if (btnStats) btnStats.style.display = 'none';

                // Nascondi campi costo azienda (usando la classe universale)
                document.querySelectorAll('.admin-only').forEach(el => el.remove());

                // Blocca nome società
                if (inputCliente) {
                    inputCliente.value = utente.societa || ''; 
                    inputCliente.readOnly = true; 
                    inputCliente.style.backgroundColor = "#e9ecef"; 
                    inputCliente.style.cursor = "not-allowed";
                }
            }
        }
    } catch (err) {
        console.error("Errore sessione:", err);
    }
});