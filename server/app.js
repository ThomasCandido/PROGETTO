// SETTING GESTORI PRINCIPALI
const express = require('express');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const app = express();

// CONFIGURAZIONE INIZIALE
const PORT = 3000;
const HOST = '0.0.0.0'; 
const ROOT = path.join(__dirname, '..', 'public'); 

// COLLEGAMENTO DATABASE
const supabase = createClient(
    'https://ecviettbvamsjguurxwp.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjdmlldHRidmFtc2pndXVyeHdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzODU3ODksImV4cCI6MjA4OTk2MTc4OX0.JGChyJfmIxJd-N406otnTtF1cJKn9_GC0RLtd8FU1Kw'
);

// MIDDLEWARE (Configurazione comportamento) ---
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: 'segreto-gestionale-2026',
    resave: false,
    saveUninitialized: true
}));

// --- LE TUE FUNZIONI DI PROTEZIONE ---
const requireLogin = (req, res, next) => {
    if (!req.session.utenteId) {
        return res.status(401).json({ success: false, message: "Utente non autorizzato!" });
    }
    next();
};

const requireAdmin = (req, res, next) => {
    if (!req.session.utenteId || !req.session.isAdmin) {
        return res.redirect('/storico_ordini_home.html');
    }
    next();
};

// ============================================================
// 1. ROTTE HTML PROTETTE (Spostate qui per sicurezza)
// ============================================================

app.get('/lista_clienti.html', requireAdmin, (req, res) => {
    res.sendFile(path.join(ROOT, 'lista_clienti.html'));
});

app.get('/aggiungi_cliente.html', requireLogin, (req, res) => {
    res.sendFile(path.join(ROOT, 'aggiungi_cliente.html'));
});

app.get('/storico_ordini_home.html', requireLogin, (req, res) => {
    res.sendFile(path.join(ROOT, 'storico_ordini_home.html'));
});

// ============================================================
// 2. DISTRIBUZIONE FILE STATICI (CSS, JS, IMMAGINI)
// ============================================================
app.use(express.static(ROOT)); 

// ============================================================
// 3. IMPLEMENTAZIONI FUNZIONALITA' SERVER
// ============================================================

app.get('/', (req, res) => {
    res.sendFile(path.join(ROOT, 'login.html'));
});

// Operazione di Login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    console.log("--- TENTATIVO DI LOGIN ---");
    try {
        const { data: utente, error } = await supabase
            .from('utenti')
            .select('*')
            .eq('email', email)
            .single();
        
        if (error || !utente) {
            return res.send("<script>alert('Utente non trovato'); window.location.href='/login.html';</script>");
        }
        
        const match = await bcrypt.compare(password, utente.password);
        if (match) {
            req.session.utenteId = utente.id;
            req.session.isAdmin = (utente.is_admin === true || utente.is_admin === 'true');
            req.session.clienteId = utente.is_admin ? null : utente.id;

            res.send(`
                <script>
                    localStorage.clear();
                    localStorage.setItem('isAdmin', '${req.session.isAdmin}');
                    window.location.href = '${req.session.isAdmin ? '/lista_clienti.html' : '/storico_ordini_home.html'}';
                </script>
            `);
        } else { 
            res.send("<script>alert('Password errata'); window.location.href='/login.html';</script>"); 
        }
    } catch (err) {
        res.status(500).send("Errore server: " + err.message); 
    }
});

// Operazione di Registrazione
app.post('/register', async (req, res) => {
    const { email, password, nome, cognome, societa, telefono } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const { data: newUser, error: userError } = await supabase
            .from('utenti')
            .insert([{ email, password: hashedPassword, is_admin: false }])
            .select();
        
        if (userError) throw userError;

        const { error: clienteError } = await supabase.from('clienti').insert([{ 
            id: newUser[0].id, 
            nome: nome || null, 
            cognome: cognome || null, 
            societa, 
            email_contatto: email, 
            telefono: telefono || null
        }]);

        if (clienteError) throw clienteError;

        res.send(`
            <script>
                alert('✅ Registrazione completata! Ora puoi accedere.');
                window.location.href = '/login.html';
            </script>
        `);
    } catch (err) { 
        res.send(`<script>alert('❌ Errore: ${err.message}'); window.history.back();</script>`);
    }
});

// Operazione di Modifica Profilo (FIXED)
app.post('/api/update-profile', requireLogin, async (req, res) => {
    const { email, password, nome, cognome, societa, telefono } = req.body;
    const utenteId = req.session.utenteId;

    try {
        const updateUtente = { email };
        if (password && password.trim() !== "") {
            updateUtente.password = await bcrypt.hash(password, 10);
        }
        
        // Update utenti
        const { error: errUt } = await supabase.from('utenti').update(updateUtente).eq('id', utenteId);
        if (errUt) throw errUt;

        // Update clienti
        const { error: errCl } = await supabase.from('clienti')
            .update({ nome, cognome, societa, email_contatto: email, telefono })
            .eq('id', utenteId);
        if (errCl) throw errCl;

        res.json({ success: true, message: "Profilo aggiornato!", isAdmin: req.session.isAdmin });
    } catch (err) { 
        res.status(500).json({ success: false, message: "Errore: " + err.message }); 
    }
});

// Recupero Profilo per il form
app.get('/api/get-profile', async (req, res) => {
    const userId = req.session.utenteId; 
    if (!userId) return res.status(401).json({ success: false, message: "Non autenticato" });

    const { data, error } = await supabase
        .from('clienti')
        .select('*, utenti(is_admin, email)')
        .eq('id', userId)
        .single();

    if (error || !data) return res.status(404).json({ success: false, message: "Profilo non trovato" });

    const profiloCompleto = {
        ...data,
        email: data.utenti ? data.utenti.email : '',
        is_admin: data.utenti ? data.utenti.is_admin : false
    };
    res.json({ success: true, data: profiloCompleto });
});

// Visualizzazione Ordini
app.get('/api/get-orders', requireLogin, async (req, res) => {
    try {
        let query = supabase.from('ordini').select('*, clienti(societa)'); 
        if (!req.session.isAdmin) query = query.eq('id_cliente', req.session.clienteId);

        const { data, error } = await query.order('data_ordine', { ascending: false });
        if (error) throw error;
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Eliminazione Ordini
app.delete('/api/delete-orders', requireLogin, async (req, res) => {
    const { ids } = req.body; 
    try {
        let query = supabase.from('ordini').delete().in('id', ids);
        if (!req.session.isAdmin) query = query.eq('id_cliente', req.session.clienteId);
        const { error } = await query;
        if (error) throw error;
        res.json({ success: true, message: "Ordini eliminati!" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Salvataggio Ordini (Configuratore)
app.post('/api/save-orders', async (req, res) => {
    try {
        const ordini = req.body;
        if (!ordini || ordini.length === 0) return res.status(400).json({ success: false, message: "Lista vuota" });
        const { error } = await supabase.from('ordini').insert(ordini);
        if (error) throw error;
        res.json({ success: true, message: "Ordini salvati!" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Modifica Singolo Ordine
app.post('/api/update-order', requireLogin, async (req, res) => {
    const { id, ...datiRicevuti } = req.body;
    const utenteId = req.session.utenteId;
    const isAdmin = req.session.isAdmin;

    try {
        // 1. Recuperiamo lo stato attuale dell'ordine dal DB
        const { data: ordineAttuale, error: errFetch } = await supabase
            .from('ordini')
            .select('stato, id_cliente')
            .eq('id', id)
            .single();

        if (errFetch || !ordineAttuale) throw new Error("Ordine non trovato.");

        // 2. LOGICA DI CONTROLLO
        if (!isAdmin) {
            // Un cliente può modificare SOLO i suoi ordini
            if (ordineAttuale.id_cliente !== req.session.clienteId) {
                return res.status(403).json({ success: false, message: "Non hai i permessi per questo ordine." });
            }

            // Un cliente può modificare solo se lo stato è "Ordinato"
            if (ordineAttuale.stato !== 'Ordinato') {
                return res.status(403).json({ success: false, message: "L'ordine è in lavorazione e non può più essere modificato." });
            }

            // PULIZIA DATI: Rimuoviamo i campi che il cliente NON deve toccare
            delete datiRicevuti.prezzo_cliente;
            delete datiRicevuti.prezzo_azienda;
            delete datiRicevuti.stato;
            delete datiRicevuti.id_cliente; 
            delete datiRicevuti.data_ordine;
        }

        // 3. ESEGUIAMO L'AGGIORNAMENTO (con i dati filtrati)
        const { error: errUpdate } = await supabase
            .from('ordini')
            .update(datiRicevuti)
            .eq('id', id);

        if (errUpdate) throw errUpdate;

        res.json({ success: true, message: "Ordine aggiornato correttamente!" });

    } catch (err) {
        console.error("Errore Update Ordine:", err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});

// API per Admin: Recupero lista società
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

// Recupero Password
app.post('/recupero-diretto', async (req, res) => {
    const { email } = req.body;
    try {
        const { data: utente, error } = await supabase.from('utenti').select('email').eq('email', email).single();
        if (error || !utente) return res.json({ success: false, message: "Email non registrata." });
        res.json({ success: true });
    } catch (err) { res.json({ success: false, message: "Errore database." }); }
});

// Logout
app.get('/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/login.html'));
});

// AVVIO SERVER
app.listen(PORT, HOST, () => {
    console.log(`🚀 Server attivo su http://localhost:${PORT}`);
});