require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const path = require('path');

const app = express();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); // Serve i tuoi HTML/CSS dalla cartella /public

// Configurazione Sessioni (Sostituisce $_SESSION di PHP)
app.use(session({
    secret: 'segreto-officina-2026',
    resave: false,
    saveUninitialized: true
}));

// --- ROTTA REGISTRAZIONE ---
app.post('/register', async (req, res) => {
    const { email, password, nome, cognome, societa, telefono } = req.body;

    try {
        // 1. Criptiamo la password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 2. Inseriamo l'utente
        const { data: newUser, error: userError } = await supabase
            .from('utenti')
            .insert([{ email, password: hashedPassword, is_admin: false }])
            .select();

        if (userError) throw userError;

        // 3. Inseriamo il profilo cliente collegato
        const { error: clientError } = await supabase
            .from('clienti')
            .insert([{ 
                id_utente: newUser[0].id, 
                nome, 
                cognome, 
                societa, 
                email_contatto: email, 
                telefono 
            }]);

        if (clientError) throw clientError;

        res.send("<script>alert('Registrazione completata!'); window.location.href='/login.html';</script>");
    } catch (err) {
        res.status(500).send("Errore registrazione: " + err.message);
    }
});

// --- ROTTA LOGIN ---
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Cerchiamo l'utente
        const { data: utente, error } = await supabase
            .from('utenti')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !utente) {
            return res.send("<script>alert('Utente non trovato'); window.location.href='/login.html';</script>");
        }

        // Verifichiamo la password
        const match = await bcrypt.compare(password, utente.password);
        
        if (match) {
            // Salviamo i dati in sessione
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server attivo su http://localhost:${PORT}`));