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