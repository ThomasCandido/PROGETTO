async function gestisciRegistrazione(event) {

    event.preventDefault();
    const campi = ['societa', 'email', 'password', 'telefono', 'nome', 'cognome'];
    const data = {};

    // controllo di validazione 
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const societa = document.getElementById('societa').value.trim();
    const email_regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (societa === "" || email === "" || password === "") 
    {
        alert("⚠️ Nome Società, Email e Password sono obbligatori!");
        return false; 
    }

    if (!email_regex.test(email)) 
    {
        alert("⚠️ Inserisci un formato email valido.");
        return false;
    }

    if (password.length < 8) 
    {
        alert("⚠️ La password deve essere di almeno 8 caratteri.");
        return false;
    }

    // RACCOLTA DATI
    for (let i = 0; i < campi.length; i++) 
    {
        const id = campi[i];
        const elemento = document.getElementById(id);
        const valore = elemento ? elemento.value.trim() : "";
        
        data[id] = (valore === "") ? null : valore;
    }

   // INVIO DATI 
    try 
    {
        const response = await fetch('/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const res = await response.json();

        if (res.success) {
            alert(res.message);
            window.location.href = '/login.html';
        } else {
            alert("Errore: " + res.message);
        }

    } catch (err) {
        console.error("Errore di connessione:", err);
        alert("Impossibile connettersi al server.");
    }

    return false;
}