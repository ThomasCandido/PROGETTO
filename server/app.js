// SETTING GESTORI PRINCIPALI
const express = require('express');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const app = express();

// CONFIGURAZIONE INIZIALE
const PORT = 3000;
const HOST = '0.0.0.0'; // Accesso da tutti i dispositivi in rete locale
const ROOT = path.join(__dirname, '..', 'public'); // Punto di riferimento per i file frontend

// COLLEGAMENTO DATABASE
const supabase = createClient(
    'https://ecviettbvamsjguurxwp.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjdmlldHRidmFtc2pndXVyeHdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzODU3ODksImV4cCI6MjA4OTk2MTc4OX0.JGChyJfmIxJd-N406otnTtF1cJKn9_GC0RLtd8FU1Kw' // La tua chiave
);

// MIDDLEWARE (Configurazione comportamento) ---
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(express.static(ROOT)); // Fondamentale per far funzionare CSS e immagini!

app.use(session({
    secret: 'segreto-gestionale-2026',
    resave: false,
    saveUninitialized: true
}));


// ROTTA VERSO LA PRIMA PAGINA:ovvero login.html appena si digita http.//localhost:3000
app.get('/', (req, res) => {
    res.sendFile(path.join(ROOT, 'login.html'));
});


// Protezione generale Accesso solo chi è loggato
const requireLogin = (req, res, next) => {
    if (!req.session.utenteId) 
    {
        return res.status(401).json({ success: false, message: "Utente non autorizzato!" });
    }
    next();
};
// FULL ACCESS specifica per ADMIN
const requireAdmin = (req, res, next) => {
    if (!req.session.utenteId || !req.session.isAdmin) 
    {
        return res.redirect('/storico_ordini_home.html');
    }
    next();
};

// IMPLEMENTAZIONI FUNZIONALITA' SERVER X LOGIN

// se in login sei admin hai accesso alla lista clienti
app.get('/lista_clienti.html', requireAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'lista_clienti.html'));
});

// Admin registra nuovi Clienti e Cliente modifica se stesso (Entrambi possono entrare)
app.get('/aggiungi_cliente.html', requireLogin, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'aggiungi_cliente.html'));
});


// distribuzione di tutti i file css e javascript per chi ha ottenuto le pagine 
app.use(express.static(path.join(__dirname, '..', 'public'))); 


// Operazione di Login(ACCESSO alla piattaforma)
app.post('/login', async (req, res) => {

    // presa dei valori di email e passsword spediti
    const { email, password } = req.body;

    try 
    {
        // check controllo nel DB
        const { data: utente, error } = await supabase.from('utenti').select('*').eq('email', email).single();
        
        if (error || !utente) 
        {
            // return di allert utente non trovato e redirect in login
            return res.send("<script>alert('Utente non trovato'); window.location.href='/login.html';</script>");
        }
        
        // matching tra password trovata e passwird inserita
        const match = await bcrypt.compare(password, utente.password);
        if (match == true) 
        {
            // logica di separazione admin  e cliente
            req.session.utenteId = utente.id;
            req.session.isAdmin = utente.is_admin;

            // presa dei dati utente
            if (!utente.is_admin) 
            {
                const { data: cl } = await supabase.from('clienti').select('id').eq('id_utente', utente.id).single();
                req.session.clienteId = cl ? cl.id : null;
            }

            // Inviamo JS per aggiornare localStorage e reindirizzare
            //logica di di reindirizzamento
            res.send(`
                <script>
                    localStorage.setItem('isAdmin', '${utente.is_admin}');
                    window.location.href = '${utente.is_admin ? '/lista_clienti.html' : '/storico_ordini_home.html'}';
                </script>
            `);
        } else 
        { 
            res.send("<script>alert('Password errata'); window.location.href='/login.html';</script>"); 
        }
    } 
    catch (err) 
    {
        // altrimenti internal error server
        res.status(500).send("Errore server: " + err.message); 
    }
});


//Operazione di Registrazione
app.post('/register', async (req, res) => {

    const { email, password, nome, cognome, societa, telefono } = req.body;

    try {

        //Crittografia della password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Inserimento nella tabella 'utenti'
        const { data: newUser, error: userError } = await supabase
            .from('utenti')
            .insert([{ email, password: hashedPassword, is_admin: false }])
            .select();
        
        if (userError) throw userError;

        // Inserimento nella tabella 'clienti' collegata all'utente appena creato
        const { error: clienteError } = await supabase.from('clienti').insert([{ 
            id_utente: newUser[0].id, 
            nome: nome || null, 
            cognome: cognome || null, 
            societa, 
            email_contatto: email, 
            telefono: telefono || null
        }]);

        if (clienteError) throw clienteError;

        // 4. Successo: Risposta con Script (Stile Login)
        res.send(`
            <script>
                alert('✅ Registrazione completata con Successo! Ora puoi accedere.');
                window.location.href = '/login.html';
            </script>
        `);

    } catch (err) { 
        // 5. Errore: Rimandiamo l'utente indietro con il messaggio di errore
        console.error("Errore registrazione:", err.message);
        res.send(`
            <script>
                alert('❌ Errore durante la registrazione: ${err.message}');
                window.history.back();
            </script>
        `);
    }
});


// Operazione di Logout
app.get('/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/login.html'));
});


// Operazione di Modifica Profilo

app.get('/api/get-profile', requireLogin, async (req, res) => {
    try {
        const { data: utente, error: utenteError } = await supabase
            .from('utenti').select('email').eq('id', req.session.utenteId).single();

        if (utenteError) throw utenteError;

        const { data: cliente, error: clienteError } = await supabase
            .from('clienti').select('*').eq('id_utente', req.session.utenteId).single();

        if (clienteError && clienteError.code !== 'PGRST116') throw clienteError;

        res.json({
            success: true,
            data: { 
                ...(cliente || {}), 
                email: utente.email, 
                is_admin: req.session.isAdmin 
            }
        });
    } catch (err) { 
        res.status(500).json({ success: false, message: err.message }); 
    }
});

app.post('/api/update-profile', requireLogin, async (req, res) => {
    const { email, password, nome, cognome, societa, telefono } = req.body;
    const utenteId = req.session.utenteId;

    try {
        const updateUtente = { email };
        if (password && password.trim() !== "") {
            updateUtente.password = await bcrypt.hash(password, 10);
        }
        await supabase.from('utenti').update(updateUtente).eq('id', utenteId);

        await supabase.from('clienti')
            .update({ nome, cognome, societa, email_contatto: email, telefono })
            .eq('id_utente', utenteId);

        res.json({ success: true, message: "Profilo aggiornato!" });
    } catch (err) { 
        res.status(500).json({ success: false, message: err.message }); 
    }
});

// RECUPERO PASSWORD E ACCENSIONE ---
app.post('/recupero-diretto', async (req, res) => {
    const { email } = req.body;
    try {
        const { data: utente, error } = await supabase.from('utenti').select('email').eq('email', email).single();
        if (error || !utente) return res.json({ success: false, message: "Email non registrata." });
        res.json({ success: true });
    } catch (err) { res.json({ success: false, message: "Errore database." }); }
});


//  VISUALIZZAZIONE DEGLI ORDINI DAL DATABASE
app.get('/api/get-orders', requireLogin, async (req, res) => {
    try {
        let query = supabase
            .from('ordini')
            .select('*, clienti(societa)'); 
            // nota: operazione di join x avere campo società

        if (!req.session.isAdmin) 
        {
            query = query.eq('id_cliente', req.session.clienteId);
        }

        // ordinamento dati secondo il più recente
        const { data, error } = await query.order('data_ordine', { ascending: false });
        if (error) throw error;

        // DEBUG:
        console.log("Dati inviati al frontend:", JSON.stringify(data[0], null, 2));

        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// API per eliminare uno o più ordini
app.delete('/api/delete-orders', requireLogin, async (req, res) => {
    const { ids } = req.body; 

    try {
        let query = supabase.from('ordini').delete().in('id', ids);

        if (!req.session.isAdmin) 
        {
            // --- MODIFICA: Filtro per clienteId (tabella clienti) ---
            query = query.eq('id_cliente', req.session.clienteId);
        }

        const { error } = await query;

        if (error) throw error;

        res.json({ success: true, message: "Ordini eliminati con successo!" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Errore eliminazione: " + err.message });
    }
});

//AGGIUNGI ORDINE
// API per Admin: scaricare la lista di tutte le società X INS.ORDINE
app.get('/api/get-all-clients', requireAdmin, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('clienti')
            .select('id, societa')
            .order('societa', { ascending: true });

        if (error) throw error;
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// API per salvare l'array di ordini nel database
app.post('/api/save-orders', requireLogin, async (req, res) => {
    try {
        const { error } = await supabase
            .from('ordini')
            .insert(req.body); // req.body è l'array di oggetti inviato dal JS

        if (error) throw error;
        res.json({ success: true, message: "Ordini inseriti con successo!" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Errore salvataggio: " + err.message });
    }
});

// operazione di modifica ordine
app.post('/api/update-order', requireLogin, async (req, res) => {
    const { id, ...datiDaAggiornare } = req.body;

    try {
        const { error } = await supabase
            .from('ordini')
            .update(datiDaAggiornare)
            .eq('id', id);

        if (error) throw error;

        res.json({ success: true, message: "Ordine aggiornato con successo!" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

//########## OPERAZIONI X CLIENTE####################à





app.listen(PORT, HOST, () => {
    console.log(`🚀 Server attivo su http://localhost:${PORT}`);
});