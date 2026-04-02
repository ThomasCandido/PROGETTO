function validaRegistrazione() 
{
    // 1. Prendiamo i valori
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const societa = document.getElementById('societa').value.trim();
    const email_regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // 2. I controlli (Il "Cane da Guardia")
    if (societa === "" || email === "" || password === "") {
        alert("⚠️ Nome Società, Email e Password sono obbligatori!");
        return false; 
    }

    if (!email_regex.test(email)) {
        alert("⚠️ Inserisci un formato email valido.");
        return false;
    }

    if (password.length < 8) {
        alert("⚠️ La password deve essere di almeno 8 caratteri.");
        return false;
    }

    // Se tutto è OK, restituiamo true e il form parte da solo verso il server
    return true;
}