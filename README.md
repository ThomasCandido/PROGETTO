# Pop Print Style
**Piattaforma Web per l'Order Management e la Personalizzazione Dinamica di Abbigliamento**

Pop Print Style è un'applicazione web Full-Stack (Single Page Application) progettata per ottimizzare l'acquisizione e la gestione degli ordini nel settore dell'abbigliamento personalizzato. Il sistema integra un configuratore grafico interattivo lato client con un cruscotto amministrativo protetto e un backend basato su API RESTful.

Questo progetto costituisce il nucleo applicativo della tesi di Laurea in Ingegneria Informatica e Automatica presso Sapienza Università di Roma, intitolata: *"Progettazione di una piattaforma web per l'order management e la personalizzazione dinamica di abbigliamento: Data Model, API RESTful e UI integrata"*.

## 👥 Team e Architettura del Lavoro

Il software è stato ingegnerizzato separando nettamente i livelli di competenza:

*   **Thomas Candido** (Backend, Database, Sicurezza & Logica di Business)
    *   Progettazione del Data Model relazionale (PostgreSQL/Supabase).
    *   Sviluppo dell'architettura server Node.js/Express e degli endpoint RESTful.
    *   Implementazione degli algoritmi di pricing dinamico (es. ricalcoli per stampe grafiche).
    *   Sviluppo del Cruscotto Amministratore e del sistema Role-Based Access Control (RBAC) con hashing delle password (bcryptjs).
*   **Gabriele Iannone** (Frontend, UI & Configuratore Grafico)
    *   Progettazione dell'interfaccia utente (HTML5, CSS, Bootstrap).
    *   Sviluppo del configuratore visivo interattivo tramite Fabric.js (rendering off-screen e manipolazione Canvas).
    *   Gestione della User Experience e responsività.

## ✨ Funzionalità Principali

*   **Order Management System (OMS):** Gestione completa del ciclo di vita dell'ordine con salvataggio e aggiornamento asincrono tramite Fetch API.
*   **Pricing Dinamico:** Ricalcolo in tempo reale dei preventivi basato su variabili multiple (taglia, tipologia di capo, aggiunta di grafiche con ricarico percentuale).
*   **Sicurezza e RBAC:** Autenticazione e controllo degli accessi basato sui ruoli. L'interfaccia si adatta dinamicamente nascondendo i prezzi di fabbrica ai clienti standard e abilitando le funzionalità CRUD per gli amministratori.
*   **Configuratore Visivo:** Area di lavoro interattiva drag-and-drop per applicare grafiche personalizzate sui capi.
*   **Gestione Asset:** Upload e archiviazione asincrona delle anteprime generate dal configuratore tramite integrazione con Cloudinary.
*   **Reportistica e Documenti:** Generazione di grafici statistici (Chart.js) e possibilità di esportare riepiloghi e ricevute in formato PDF (html2pdf.js).

## 🛠 Stack Tecnologico

| Livello | Tecnologie Utilizzate |
| :--- | :--- |
| **Backend & API** | Node.js, Express.js, API RESTful |
| **Database & Auth** | PostgreSQL, Supabase, bcryptjs |
| **Frontend & UI** | JavaScript (ES6+), HTML5, CSS, Bootstrap |
| **Grafica & Rendering** | Fabric.js, Canvas API |
| **Media & Storage** | Cloudinary |
| **Utility** | Chart.js (Data Vis), html2pdf.js (Export) |

## 🚀 Installazione e Avvio Locale

1. **Clona la repository:**
   ```bash
   git clone [https://github.com/tuo-username/pop-print-style.git](https://github.com/tuo-username/pop-print-style.git)
   cd pop-print-style
