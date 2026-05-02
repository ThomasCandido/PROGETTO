document.addEventListener('DOMContentLoaded', function() {

    // 1. RIFERIMENTI AGLI ELEMENTI HTML (DOM)
    // Recuperiamo tutti gli elementi della pagina con cui dobbiamo interagire

    const baseImage = document.getElementById('base-image'); // L'immagine PNG che fa da base (con le ombre)
    const colorLayer = document.getElementById('color-layer'); // Il div che prenderà il colore a tinta unita
    const colorPicker = document.getElementById('product-color'); // L'input per scegliere il colore
    const canvasWrapper = document.getElementById('canvas-wrapper'); // Il contenitore della lavagna Fabric.js
    
    // Bottoni per la navigazione e selezione del prodotto
    const btnHoodie = document.getElementById('select-hoodie');
    const btnShorts = document.getElementById('select-shorts');
    const btnFront = document.getElementById('btn-front');
    const btnBack = document.getElementById('btn-back');
    
    // Pannelli laterali che contengono i campi di input specifici
    const controlsHoodie = document.getElementById('controls-hoodie');
    const controlsShorts = document.getElementById('controls-shorts');


    // 2. CONFIGURAZIONE INIZIALE MASCHERE CSS (MASKING)
    // Contenitore del testo affinché tagli via visivamente tutto
    // ciò che esce dai bordi dell'immagine.

    canvasWrapper.style.webkitMaskSize = 'contain';
    canvasWrapper.style.webkitMaskPosition = 'center';
    canvasWrapper.style.webkitMaskRepeat = 'no-repeat';
    canvasWrapper.style.maskSize = 'contain';
    canvasWrapper.style.maskPosition = 'center';
    canvasWrapper.style.maskRepeat = 'no-repeat';

    // 3. VARIABILI DI STATO DEL CONFIGURATORE
    // Tengono traccia di cosa sta guardando e modificando l'utente in questo momento

    let activeProduct = 'hoodie'; // Prodotto attualmente visibile ('hoodie' o 'shorts')
    let activeView = 'front'; // Vista attualmente visibile ('front' o 'back')

    // Oggetto che memorizza i colori separatamente per non mischiarli tra i due capi
    const productColors = { hoodie: '#ffffff', shorts: '#ffffff' };

    // Percorsi delle immagini (assicurarsi che siano PNG trasparenti)
    const imageFiles = {
        hoodie: { front: 'allegati/Fronte-Felpa.png', back: 'allegati/Retro-Felpa.png' },
        shorts: { front: 'allegati/Fronte-Pantalone.png', back: 'allegati/Retro-Pantalone.png' }
    };

    // 4. INIZIALIZZAZIONE FABRIC.JS E GESTIONE MEMORIA

    const canvas = new fabric.Canvas('fabric-canvas'); // Inizializza la lavagna interattiva
    
    // Questo dizionario funziona come una "memoria RAM".
    // Salva il design (loghi, testi, posizioni) quando l'utente cambia vista,
    // così quando torna indietro ritrova tutto al suo posto.
    const canvasStates = {
        hoodie: { front: null, back: null },
        shorts: { front: null, back: null }
    };

    // 5. FUNZIONI PRINCIPALI DI AGGIORNAMENTO SCHERMO

    /**
     * Aggiorna l'immagine base, applica le maschere per ritagliare colore e testi
     * e ripristina il colore salvato per il prodotto corrente.
     */
    function updateVisuals() {
        const imgPath = imageFiles[activeProduct][activeView];
        
        // 1. Cambia l'immagine delle ombre
        baseImage.src = imgPath;
        
        // 2. Applica l'immagine PNG come "stampino" (maschera) per ritagliare il div del colore
        colorLayer.style.webkitMaskImage = `url('${imgPath}')`;
        colorLayer.style.maskImage = `url('${imgPath}')`;
        
        // 3. Applica lo stesso "stampino" per nascondere i testi che escono fuori dalla felpa
        canvasWrapper.style.webkitMaskImage = `url('${imgPath}')`;
        canvasWrapper.style.maskImage = `url('${imgPath}')`;
        
        // 4. Recupera e applica il colore specifico di questo prodotto
        const currentColor = productColors[activeProduct];
        colorLayer.style.backgroundColor = currentColor;
        colorPicker.value = currentColor; // Sincronizza anche la UI della tavolozza colori

        // Aggiorna infine i pannelli laterali
        updateUI();
    }

    /**
     * Mostra o nasconde i pannelli laterali (Fronte/Retro e Felpa/Pantaloncino)
     * in base a ciò che l'utente ha selezionato.
     */
    function updateUI() {
        // Mostra solo il contenitore principale del prodotto attivo
        controlsHoodie.style.display = (activeProduct === 'hoodie') ? 'block' : 'none';
        controlsShorts.style.display = (activeProduct === 'shorts') ? 'block' : 'none';

        const activePanel = (activeProduct === 'hoodie') ? controlsHoodie : controlsShorts;
        
        // Accende o spegne i gruppi di input in base alla vista (Fronte o Retro)
        activePanel.querySelectorAll('.for-front').forEach(el => {
            el.style.display = (activeView === 'front') ? 'block' : 'none';
        });
        activePanel.querySelectorAll('.for-back').forEach(el => {
            el.style.display = (activeView === 'back') ? 'block' : 'none';
        });
    }

    /**
     * Gestisce il passaggio tra i vari prodotti (Felpa -> Pantaloncino) 
     * o le varie viste (Fronte -> Retro), salvando il lavoro in corso.
     */
    function switchState(newProduct, newView) {
        // 1. Congela la tela attuale in un file JSON e lo salva nella "memoria"
        canvasStates[activeProduct][activeView] = canvas.toJSON(['customId']);
        
        // 2. Aggiorna le variabili globali con la nuova scelta dell'utente
        activeProduct = newProduct;
        activeView = newView;

        // 3. Aggiorna l'interfaccia visiva (Immagini e Colori)
        updateVisuals();
        
        // 4. Pulisce la lavagna e, se avevamo salvato qualcosa in precedenza per 
        // questa specifica vista, la ricarica dal file JSON in memoria
        canvas.clear();
        if (canvasStates[activeProduct][activeView]) {
            canvas.loadFromJSON(canvasStates[activeProduct][activeView], () => canvas.renderAll());
        }

        // 5. Azzera i campi input di testo testuali per evitare confusione (la tela ha già i suoi testi)
        document.querySelectorAll('input[type="text"]').forEach(input => input.value = '');
    }

    // 6. ASSEGNAZIONE EVENTI (CLICK E CAMBIO COLORE)

    // Quando l'utente sceglie un nuovo colore dalla tavolozza
    colorPicker.addEventListener('input', () => {
        const selectedColor = colorPicker.value;
        colorLayer.style.backgroundColor = selectedColor; // Applica il colore a schermo
        productColors[activeProduct] = selectedColor; // Lo salva nella memoria del prodotto corrente
    });

    // Click sui bottoni di selezione prodotto e vista
    btnHoodie.addEventListener('click', () => {
        btnHoodie.classList.add('active'); btnShorts.classList.remove('active');
        btnFront.classList.add('active'); btnBack.classList.remove('active');
        switchState('hoodie', 'front');
    });

    btnShorts.addEventListener('click', () => {
        btnShorts.classList.add('active'); btnHoodie.classList.remove('active');
        btnFront.classList.add('active'); btnBack.classList.remove('active');
        switchState('shorts', 'front');
    });

    btnFront.addEventListener('click', () => {
        btnFront.classList.add('active'); btnBack.classList.remove('active');
        switchState(activeProduct, 'front');
    });

    btnBack.addEventListener('click', () => {
        btnBack.classList.add('active'); btnFront.classList.remove('active');
        switchState(activeProduct, 'back');
    });

    // 7. GESTIONE LOGICA TESTI E IMMAGINI CON FABRIC.JS

    /**
     * Abilita il caricamento di loghi e immagini personali sulla lavagna
     */
    function setupImageUpload(inputId) {
        document.getElementById(inputId).addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function(event) {
                // Converte l'immagine e la inserisce nella Canvas di Fabric
                fabric.Image.fromURL(event.target.result, function(img) {
                    img.scaleToWidth(150); // Scala di default
                    img.set({
                        left: canvas.width / 2, top: canvas.height / 2, // Centra nello schermo
                        originX: 'center', originY: 'center',
                        cornerColor: 'cadetblue', transparentCorners: false
                    });
                    canvas.add(img);
                    canvas.setActiveObject(img); // La seleziona automaticamente per spostarla
                });
            };
            reader.readAsDataURL(file); // Legge il file caricato
        });
    }

    /**
     * Genera e gestisce i testi dinamici. Contiene la logica per font, orientamento e reset.
     */
    function setupDynamicText(inputId, fontId, orientId, customId, defaultTop, defaultLeft, defaultAngle) {
        const inputEl = document.getElementById(inputId);
        const fontEl = document.getElementById(fontId);
        const orientEl = document.getElementById(orientId);

        function updateText() {
            const rawText = inputEl.value;
            let existingText = canvas.getObjects().find(obj => obj.customId === customId);

            if (rawText.trim() === '') {
                if (existingText) canvas.remove(existingText);
                return;
            }

            const currentFont = fontEl.value;
            const mode = orientEl.value;
            
            let formattedText = rawText;
            let finalAngle = defaultAngle;

            if (mode === 'vertical') {
                formattedText = rawText.split('').join('\n');
                finalAngle = 0; 
            } else if (mode === 'horizontal') {
                finalAngle = 0;
            }

            if (existingText) {
                existingText.set({ 
                    text: formattedText,
                    fontFamily: currentFont,
                    angle: finalAngle,
                    textAlign: 'center'
                });
                
                if (rawText.length === 1) {
                    existingText.set({ left: defaultLeft, top: defaultTop });
                    existingText.setCoords(); 
                }
            } else {
                const newText = new fabric.Text(formattedText, {
                    left: defaultLeft, top: defaultTop, angle: finalAngle,
                    fontFamily: currentFont, fill: '#000000', fontSize: 22, fontWeight: 'bold',
                    originX: 'center', originY: 'center', textAlign: 'center',
                    customId: customId, 
                    cornerColor: 'cadetblue', transparentCorners: false
                });
                canvas.add(newText);
            }
            canvas.renderAll(); 
        }

        inputEl.addEventListener('input', updateText);
        fontEl.addEventListener('change', updateText);
        orientEl.addEventListener('change', updateText);
    }

    // 8. CONFIGURAZIONE E COLLEGAMENTO INPUT-CANVAS
    
    // Collega gli input di upload file
    setupImageUpload('upload-hoodie-front');

    // Collega i campi di testo passando: ID_input, ID_font, ID_orient, ID_interno_fabric, Y_iniziale, X_iniziale, Rotazione_iniziale
    setupDynamicText('text-hoodie-front-l', 'font-hoodie-front-l', 'orient-hoodie-front-l', 'hoodie-L', 240, 410, 50);  
    setupDynamicText('text-hoodie-front-r', 'font-hoodie-front-r', 'orient-hoodie-front-r', 'hoodie-R', 240, 90, -55);  
    
    setupDynamicText('text-shorts-front-l', 'font-shorts-front-l', 'orient-shorts-front-l', 'shorts-L', 300, 340, 0);   
    setupDynamicText('text-shorts-front-r', 'font-shorts-front-r', 'orient-shorts-front-r', 'shorts-R', 300, 160, 0);

    // 9. EVENTI EXTRA E SINCRONIZZAZIONE TASTIERA
    // Permette di eliminare un oggetto cliccato con "Canc" o "Backspace"
    // e svuota contemporaneamente la relativa casella input in HTML per non creare disallineamenti

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Delete' || e.key === 'Backspace') {
            const activeObj = canvas.getActiveObject();
            
            // Assicuriamoci che l'utente non stia solo premendo backspace mentre scrive nell'input HTML
            if (activeObj && e.target.tagName !== 'INPUT') {
                
                // Mappa per sapere quale input HTML corrisponde all'oggetto che stiamo per eliminare
                const inputMap = {
                    'hoodie-L': 'text-hoodie-front-l',
                    'hoodie-R': 'text-hoodie-front-r',
                    'shorts-L': 'text-shorts-front-l',
                    'shorts-R': 'text-shorts-front-r'
                };
                
                // Se l'oggetto aveva un ID che tracciamo, svuotiamo la relativa casella
                if (inputMap[activeObj.customId]) {
                    document.getElementById(inputMap[activeObj.customId]).value = '';
                }
                
                // Rimuove l'oggetto grafico
                canvas.remove(activeObj);
            }
        }
    });

    // 10. AVVIO INIZIALE
    // Esegue il primo rendering dell'applicazione all'apertura della pagina
    updateVisuals();
});