function validaLogin() 
{
    // Presa dei dati e pulizia
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    
    //controllo regez email
    const email_regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (email === "" || password === "") 
    {
        alert("⚠️ Errore: Tutti i campi sono obbligatori.");
        return false;
    }

    else if (!email_regex.test(email)) 
    {
        alert("⚠️ Errore: Inserisci un indirizzo email valido.");
        return false ;
    }

    else if (password.length < 8) 
    {
        alert("⚠️ Errore: La password deve avere almeno 8 caratteri.");
        return false;
    }

    return true;
}

document.addEventListener('DOMContentLoaded', function() {
    
    // Peschiamo gli elementi dalla pagina HTML
    const passwordInput = document.getElementById('password');
    const btnMostraPassword = document.getElementById('mostra-password');
    const iconaPassword = document.getElementById('icona-password');

    // Aggiungiamo il controllo al click sul bottone
    btnMostraPassword.addEventListener('click', function() {
        
        // Se in questo momento la password è nascosta...
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text'; // ...mostra il testo[cite: 7]
            iconaPassword.src = 'allegati/occhio-aperto.png'; // ...e cambia l'icona in occhio aperto[cite: 7]
            iconaPassword.alt = 'Nascondi password'; //[cite: 7]
        } else {
            // Se invece era già visibile, la nascondiamo di nuovo
            passwordInput.type = 'password'; //[cite: 7]
            iconaPassword.src = 'allegati/occhio-chiuso.png'; // ...e rimettiamo l'occhio chiuso[cite: 7]
            iconaPassword.alt = 'Mostra password'; //[cite: 7]
        }
        
    });
});