// Funzione di validazione Login check campi dati compilati correttamente
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

    // Evento click del bottone
    btnMostraPassword.addEventListener('click', function() {
        
        // Se in questo momento la password è nascosta...
        if (passwordInput.type === 'password') 
        {
            passwordInput.type = 'text'; // ...mostra il testo
            iconaPassword.src = 'allegati/occhio-aperto.png'; // ...e cambia l'icona in occhio aperto
            iconaPassword.alt = 'Nascondi password';
        } 
        else 
        {
            // Se invece era già visibile, la nascondiamo di nuovo
            passwordInput.type = 'password';
            iconaPassword.src = 'allegati/occhio-chiuso.png'; // ...e rimettiamo l'occhio chiuso
            iconaPassword.alt = 'Mostra password';
        }
        
    });
});