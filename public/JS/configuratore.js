// --- configuratore.js ---

// Aspetta che tutta l'interfaccia HTML sia caricata prima di eseguire lo script
document.addEventListener('DOMContentLoaded', function() {

    // Riferimenti agli elementi DOM principali
    const visualizer = document.getElementById('visualizer');
    const baseImage = document.getElementById('base-image'); 
    const overlayContainer = document.getElementById('overlay-container');
    const btnHoodie = document.getElementById('select-hoodie');
    const btnShorts = document.getElementById('select-shorts');
    const btnFront = document.getElementById('btn-front');
    const btnBack = document.getElementById('btn-back');
    const controlsHoodie = document.getElementById('controls-hoodie');
    const controlsShorts = document.getElementById('controls-shorts');

    // Stato iniziale
    let activeProduct = 'hoodie'; // o 'shorts'
    let activeView = 'front'; // o 'back'

    // Oggetto per memorizzare i dati di personalizzazione
    const data = {
        hoodie: { front: { image: null, textL: '', textR: '' }, back: { image: null } },
        shorts: { front: { textL: '', textR: '' }, back: {} }
    };

    // Mappa esatta dei nomi dei tuoi file immagine
    const imageFiles = {
        hoodie: {
            front: 'allegati/Fronte-Felpa.png',
            back: 'allegati/Retro-Felpa.png'
        },
        shorts: {
            front: 'allegati/Fronte-Pantalone.png',
            back: 'allegati/Retro-Pantalone.png'
        }
    };

// Funzione principale per aggiornare l'anteprima (AGGIORNATA)
function updatePreview() {
        const bgUrl = imageFiles[activeProduct][activeView];
        const bgColor = data[activeProduct].color || '#ffffff';

        // 1. Cambia semplicemente il 'src' dell'immagine HTML e il colore di sfondo
        baseImage.src = bgUrl;
        visualizer.style.backgroundColor = bgColor;

        // 2. Svuota SOLO il contenitore delle scritte, lasciando intatto il vestito
        overlayContainer.innerHTML = '';

        // 3. Aggiungi i nuovi elementi sovrapposti al contenitore
        const currentData = data[activeProduct][activeView];

        if (activeProduct === 'hoodie' && activeView === 'front') {
            if (currentData.image) addOverlayImage(currentData.image, 'hoodie-front-image');
            if (currentData.textL) addOverlayText(currentData.textL, 'hoodie-front-text-l');
            if (currentData.textR) addOverlayText(currentData.textR, 'hoodie-front-text-r');
        } 
        else if (activeProduct === 'hoodie' && activeView === 'back') {
            if (currentData.image) addOverlayImage(currentData.image, 'hoodie-back-image');
        }
        else if (activeProduct === 'shorts' && activeView === 'front') {
            if (currentData.textL) addOverlayText(currentData.textL, 'shorts-front-text-l');
            if (currentData.textR) addOverlayText(currentData.textR, 'shorts-front-text-r');
        }

        updatePanelControls();
    }

    // Le funzioni di aggiunta ora agganciano gli elementi a overlayContainer!
    function addOverlayImage(src, id) {
        const img = document.createElement('img');
        img.src = src;
        img.id = id;
        img.className = 'overlay user-image';
        overlayContainer.appendChild(img);
    }

    function addOverlayText(text, id) {
        const div = document.createElement('div');
        div.innerText = text;
        div.id = id;
        div.className = 'overlay user-text';
        overlayContainer.appendChild(div);
    }

    // Funzione per mostrare/nascondere i controlli corretti nel pannello laterale
    function updatePanelControls() {
        // Nascondi tutti i controlli del retro
        document.querySelectorAll('.for-back').forEach(el => el.style.display = 'none');
        // Nascondi tutti i controlli del fronte
        document.querySelectorAll('.for-front').forEach(el => el.style.display = 'none');

        // Mostra i controlli corretti in base alla vista attiva
        if (activeView === 'front') {
            document.querySelectorAll('.for-front').forEach(el => el.style.display = 'block');
        } else {
            document.querySelectorAll('.for-back').forEach(el => el.style.display = 'block');
        }
    }

    // --- Gestione Eventi ---

    // Cambia Prodotto (Felpa/Pantaloncino)
    btnHoodie.addEventListener('click', () => {
        activeProduct = 'hoodie';
        btnHoodie.classList.add('active');
        btnShorts.classList.remove('active');
        controlsHoodie.classList.add('active');
        controlsShorts.classList.remove('active');
        updatePreview();
    });

    btnShorts.addEventListener('click', () => {
        activeProduct = 'shorts';
        btnShorts.classList.add('active');
        btnHoodie.classList.remove('active');
        controlsShorts.classList.add('active');
        controlsHoodie.classList.remove('active');
        updatePreview();
    });

    // Cambia Vista (Fronte/Retro)
    btnFront.addEventListener('click', () => {
        activeView = 'front';
        btnFront.classList.add('active');
        btnBack.classList.remove('active');
        updatePreview();
    });

    btnBack.addEventListener('click', () => {
        activeView = 'back';
        btnBack.classList.add('active');
        btnFront.classList.remove('active');
        updatePreview();
    });

    // Funzione generica per caricare l'immagine
    function handleImageUpload(inputId, targetKey) {
        const input = document.getElementById(inputId);
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    data[activeProduct][activeView][targetKey] = event.target.result;
                    updatePreview();
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Funzione generica per gestire il testo
    function handleTextChange(inputId, targetKey) {
        const input = document.getElementById(inputId);
        input.addEventListener('input', (e) => {
            data[activeProduct][activeView][targetKey] = e.target.value;
            updatePreview();
        });
    }

    // Collega gli input ai dati
    handleImageUpload('upload-hoodie-front', 'image');
    handleImageUpload('upload-hoodie-back', 'image');
    handleTextChange('text-hoodie-front-l', 'textL');
    handleTextChange('text-hoodie-front-r', 'textR');
    handleTextChange('text-shorts-front-l', 'textL');
    handleTextChange('text-shorts-front-r', 'textR');

    // Inizializzazione
    updatePreview();

}); // <-- Fine del blocco DOMContentLoaded