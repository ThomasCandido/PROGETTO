require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const path = require('path');

const app = express();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// --- 1. MIDDLEWARE DI BASE ---
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: 'segreto-officina-2026',
    resave: false,
    saveUninitialized: true
}));

// --- 2. MIDDLEWARE DI PROTEZIONE (I "Buttafuori") ---

// Protezione generale (solo chi è loggato)
const requireLogin = (req, res, next) => {
    if (!req.session.utenteId) {
        return res.status(401).json({ success: false, message: "Non autorizzato" });
    }
    next();
};

// Protezione specifica per ADMIN (blocca i clienti)
const requireAdmin = (req, res, next) => {
    if (!req.session.utenteId || !req.session.isAdmin) {
        return res.redirect('/storico_ordini_home.html');
    }
    next();
};

// --- 3. PROTEZIONE ROTTE HTML ---

// Solo l'Admin può vedere la lista di tutti i clienti
app.get('/lista_clienti.html', requireAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'lista_clienti.html'));
});

// Admin registra nuovi, Cliente modifica se stesso (Entrambi possono entrare)
app.get('/aggiungi_cliente.html', requireLogin, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'aggiungi_cliente.html'));
});

// Carica tutto il resto (CSS, JS, Immagini)
app.use(express.static('public')); 


// --- 4. ROTTE AUTENTICAZIONE ---

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const { data: utente, error } = await supabase.from('utenti').select('*').eq('email', email).single();
        
        if (error || !utente) {
            return res.send("<script>alert('Utente non trovato'); window.location.href='/login.html';</script>");
        }
        
        const match = await bcrypt.compare(password, utente.password);
        if (match) {
            req.session.utenteId = utente.id;
            req.session.isAdmin = utente.is_admin;

            if (utente.is_admin) {
                res.redirect('/lista_clienti.html');
            } else {
                res.redirect('/storico_ordini_home.html');
            }
        } else { 
            res.send("<script>alert('Password errata'); window.location.href='/login.html';</script>"); 
        }
    } catch (err) { 
        res.status(500).send("Errore server: " + err.message); 
    }
});

app.post('/register', async (req, res) => {
    const { email, password, nome, cognome, societa, telefono } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const { data: newUser, error: userError } = await supabase
            .from('utenti').insert([{ email, password: hashedPassword, is_admin: false }]).select();
        
        if (userError) throw userError;

        await supabase.from('clienti').insert([{ 
            id_utente: newUser[0].id, 
            nome, cognome, societa, email_contatto: email, telefono
        }]);

        res.json({ success: true, message: "Registrazione completata!" });
    } catch (err) { 
        res.status(500).json({ success: false, message: err.message }); 
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/login.html'));
});


// --- 5. API PROFILO (Dati unificati Utenti + Clienti) ---

app.get('/api/get-profile', requireLogin, async (req, res) => {
    try {
        // 1. Recuperiamo l'email dalla tabella utenti (quella sicura del login)
        const { data: utente, error: utenteError } = await supabase
            .from('utenti').select('email').eq('id', req.session.utenteId).single();

        if (utenteError) throw utenteError;

        // 2. Recuperiamo il resto dei dati dalla tabella clienti
        const { data: cliente, error: clienteError } = await supabase
            .from('clienti').select('*').eq('id_utente', req.session.utenteId).single();

        // Se è un admin puro potrebbe non essere in 'clienti', gestiamo l'errore senza bloccare
        if (clienteError && clienteError.code !== 'PGRST116') throw clienteError;

        res.json({
            success: true,
            data: { 
                ...(cliente || {}), 
                email: utente.email, // Email presa da tabella UTENTI
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
        // Update Tabella Utenti (Email e Password)
        const updateUtente = { email };
        if (password && password.trim() !== "") {
            updateUtente.password = await bcrypt.hash(password, 10);
        }
        await supabase.from('utenti').update(updateUtente).eq('id', utenteId);

        // Update Tabella Clienti (Dati anagrafici)
        await supabase.from('clienti')
            .update({ nome, cognome, societa, email_contatto: email, telefono })
            .eq('id_utente', utenteId);

        res.json({ success: true, message: "Profilo aggiornato!" });
    } catch (err) { 
        res.status(500).json({ success: false, message: err.message }); 
    }
});

// --- 6. RECUPERO PASSWORD E ACCENSIONE ---
app.post('/recupero-diretto', async (req, res) => {
    const { email } = req.body;
    try {
        const { data: utente, error } = await supabase.from('utenti').select('email').eq('email', email).single();
        if (error || !utente) return res.json({ success: false, message: "Email non registrata." });
        res.json({ success: true });
    } catch (err) { res.json({ success: false, message: "Errore database." }); }
});


// API per recuperare gli ordini dal database
app.get('/api/get-orders', requireLogin, async (req, res) => {
    try {
        let query = supabase.from('ordini').select('*');

        // Se l'utente NON è admin, vede solo i suoi ordini
        if (!req.session.isAdmin) {
            query = query.eq('id_cliente', req.session.utenteId);
        }

        // Ordiniamo per data_ordine decrescente (i più nuovi in alto)
        const { data, error } = await query.order('data_ordine', { ascending: false });

        if (error) throw error;

        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: "Errore caricamento: " + err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Officina attiva su http://localhost:${PORT}`));