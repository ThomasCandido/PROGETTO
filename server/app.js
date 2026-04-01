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
    // Aggiunto '..' perché il file è un livello sopra la cartella server
    res.sendFile(path.join(__dirname, '..', 'public', 'lista_clienti.html'));
});

// Admin registra nuovi, Cliente modifica se stesso (Entrambi possono entrare)
app.get('/aggiungi_cliente.html', requireLogin, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'aggiungi_cliente.html'));
});

// Carica tutto il resto (CSS, JS, Immagini)
// Dobbiamo dire a Express che la cartella public è fuori dalla cartella server
app.use(express.static(path.join(__dirname, '..', 'public'))); 


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

        if (!req.session.isAdmin) {
            query = query.eq('id_cliente', req.session.utenteId);
        }

        const { data, error } = await query.order('data_ordine', { ascending: false });

        if (error) throw error;

        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: "Errore caricamento: " + err.message });
    }
});



// API per eliminare uno o più ordini
app.delete('/api/delete-orders', requireLogin, async (req, res) => {
    const { ids } = req.body; // Riceviamo un array di ID (es: [2, 5, 8])

    try {
        let query = supabase.from('ordini').delete().in('id', ids);

        // SICUREZZA: Se l'utente non è admin, può eliminare solo i PROPRI ordini
        if (!req.session.isAdmin) {
            query = query.eq('id_cliente', req.session.utenteId);
        }

        const { error } = await query;

        if (error) throw error;

        res.json({ success: true, message: "Ordini eliminati con successo!" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Errore eliminazione: " + err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Officina attiva su http://localhost:${PORT}`));