require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const path = require('path');

const app = express();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// --- 1. MIDDLEWARE ---
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); 

app.use(session({
    secret: 'segreto-officina-2026',
    resave: false,
    saveUninitialized: true
}));

// Middleware di protezione (solo utenti loggati)
const requireLogin = (req, res, next) => {
    if (!req.session.utenteId) {
        return res.status(401).json({ success: false, message: "Non autorizzato" });
    }
    next();
};

// --- 2. ROTTE AUTENTICAZIONE (Login, Register, Logout) ---

app.post('/register', async (req, res) => {
    // RIMOSSO id_societa dal corpo della richiesta
    const { email, password, nome, cognome, societa, telefono } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const { data: newUser, error: userError } = await supabase
            .from('utenti').insert([{ email, password: hashedPassword, is_admin: false }]).select();
        
        if (userError) throw userError;

        // RIMOSSO id_societa dall'inserimento nella tabella clienti
        await supabase.from('clienti').insert([{ 
            id_utente: newUser[0].id, 
            nome, 
            cognome, 
            societa, 
            email_contatto: email, 
            telefono
        }]);

        res.send("<script>alert('Registrazione completata!'); window.location.href='/login.html';</script>");
    } catch (err) { res.status(500).send("Errore: " + err.message); }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const { data: utente, error } = await supabase.from('utenti').select('*').eq('email', email).single();
        if (error || !utente) return res.send("<script>alert('Utente non trovato'); window.location.href='/login.html';</script>");
        
        const match = await bcrypt.compare(password, utente.password);
        if (match) {
            req.session.utenteId = utente.id;
            req.session.isAdmin = utente.is_admin;
            res.redirect(utente.is_admin ? '/lista_clienti.html' : '/storico_ordini_home.html');
        } else { 
            res.send("<script>alert('Password errata'); window.location.href='/login.html';</script>"); 
        }
    } catch (err) { res.status(500).send("Errore: " + err.message); }
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).send("Errore durante il logout");
        res.redirect('/login.html');
    });
});

// --- 3. API PROFILO (Get e Update) ---

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
            data: { ...cliente, email: utente.email }
        });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.post('/api/update-profile', requireLogin, async (req, res) => {
    // RIMOSSO id_societa dal corpo della richiesta
    const { email, password, nome, cognome, societa, telefono } = req.body;
    const utenteId = req.session.utenteId;

    try {
        // Update Tabella Utenti
        const updateUtente = { email };
        if (password && password.trim() !== "") {
            updateUtente.password = await bcrypt.hash(password, 10);
        }
        const { error: errUtente } = await supabase.from('utenti').update(updateUtente).eq('id', utenteId);
        if (errUtente) throw errUtente;

        // Update Tabella Clienti (RIMOSSO id_societa dalla query di update)
        const { error: errCliente } = await supabase.from('clienti')
            .update({ nome, cognome, societa, email_contatto: email, telefono })
            .eq('id_utente', utenteId);

        if (errCliente) throw errCliente;

        res.json({ success: true, message: "Profilo aggiornato con successo!" });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// --- 4. RECUPERO PASSWORD (Solo verifica email) ---
app.post('/recupero-diretto', async (req, res) => {
    const { email } = req.body;
    try {
        const { data: utente, error } = await supabase.from('utenti').select('email').eq('email', email).single();
        if (error || !utente) return res.json({ success: false, message: "Email non registrata." });
        res.json({ success: true });
    } catch (err) { res.json({ success: false, message: "Errore database." }); }
});

// --- 5. ACCENSIONE SERVER (Sempre alla fine!) ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server attivo su http://localhost:${PORT}`));