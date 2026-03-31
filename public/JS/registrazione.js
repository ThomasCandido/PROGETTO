async function gestisciRegistrazione(event) {
    event.preventDefault(); 

    const campi = ['societa', 'email', 'password', 'telefono', 'nome', 'cognome'];
    const data = {};

    for (let i = 0; i < campi.length; i++) {
        const id = campi[i];
        const elemento = document.getElementById(id);
        const valore = elemento.value.trim();
        
        if (valore === "") {
            data[id] = null;
        } else {
            data[id] = valore;
        }
    }

    try {
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
}