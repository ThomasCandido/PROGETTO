
if (localStorage.getItem('isAdmin') === 'true') {
    document.documentElement.classList.add('is-admin');
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/api/get-profile');
        const result = await response.json();

        if (result.success) 
        {
            const utente = result.data;

            if (utente.is_admin) {
                // Confermiamo lo stato di Admin
                localStorage.setItem('isAdmin', 'true');
                document.documentElement.classList.add('is-admin');
            } else {
                // Se il server dice che è un cliente, puliamo la memoria
                localStorage.setItem('isAdmin', 'false');
                document.documentElement.classList.remove('is-admin');
            }

            const inputCliente = document.getElementById('f_cliente');

            if (inputCliente && !utente.is_admin) {
                // Inseriamo il nome della società recuperato dal database
                inputCliente.value = utente.societa || ''; 
                
                // Impediamo la modifica (readOnly permette l'invio del form)
                inputCliente.readOnly = true; 
                
                // Miglioriamo l'aspetto visivo per indicare il blocco
                inputCliente.style.backgroundColor = "#e9ecef"; 
                inputCliente.style.cursor = "not-allowed";
                inputCliente.title = "Il nome azienda è bloccato dal tuo profilo.";
            }
        }
    } catch (err) {
        console.error("Errore critico durante la verifica della sessione:", err);
        // In caso di errore di rete, per sicurezza non mostriamo nulla da admin
        document.documentElement.classList.remove('is-admin');
    }
});