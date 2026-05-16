// config toast
function mostraToast(messaggio, tipo = 'error') {
    let toast = document.getElementById("toast-container");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "toast-container";
        document.body.appendChild(toast);
    }
    toast.innerText = messaggio;
    toast.className = ""; 
    toast.classList.add("show", `toast-${tipo}`);
    setTimeout(() => { toast.classList.remove("show"); }, 3500);
}



document.addEventListener('DOMContentLoaded', function() {

    // 1. RIFERIMENTI AGLI ELEMENTI HTML (DOM)
    const baseImage = document.getElementById('base-image');
    const colorLayer = document.getElementById('color-layer');
    const colorPicker = document.getElementById('product-color');
    const canvasWrapper = document.getElementById('canvas-wrapper');
    
    const btnHoodie = document.getElementById('select-hoodie');
    const btnShorts = document.getElementById('select-shorts');
    const btnTshirt = document.getElementById('select-tshirt');
    const btnFront = document.getElementById('btn-front');
    const btnBack = document.getElementById('btn-back');
    
    const controlsHoodie = document.getElementById('controls-hoodie');
    const controlsShorts = document.getElementById('controls-shorts');
    const controlsTshirt = document.getElementById('controls-tshirt');

    const tagliaSelect = document.getElementById('conf-taglia');
    const quantitaInput = document.getElementById('conf-quantita');

    // 2. CONFIGURAZIONE INIZIALE MASCHERE CSS
    canvasWrapper.style.webkitMaskSize = 'contain';
    canvasWrapper.style.webkitMaskPosition = 'center';
    canvasWrapper.style.webkitMaskRepeat = 'no-repeat';
    canvasWrapper.style.maskSize = 'contain';
    canvasWrapper.style.maskPosition = 'center';
    canvasWrapper.style.maskRepeat = 'no-repeat';

    // 3. VARIABILI DI STATO E RISORSE
    let activeProduct = 'hoodie'; 
    let activeView = 'front'; 

    const productColors = { hoodie: '#ffffff', shorts: '#ffffff', tshirt: '#ffffff' };

    const imageFiles = {
        hoodie: { front: 'allegati/Fronte-Felpa.png', back: 'allegati/Retro-Felpa.png' },
        shorts: { front: 'allegati/Fronte-Pantalone.png', back: 'allegati/Retro-Pantalone.png' },
        tshirt: { front: 'allegati/Fronte-Maglia.png', back: 'allegati/Retro-Maglia.png' }
    };

    // 4. INIZIALIZZAZIONE FABRIC.JS E MEMORIA CANVAS
    const canvas = new fabric.Canvas('fabric-canvas'); 
    
    const canvasStates = {
        hoodie: { front: null, back: null },
        shorts: { front: null, back: null },
        tshirt: { front: null, back: null }
    };

    // 5. FUNZIONI DI AGGIORNAMENTO VISIVO

    function updateVisuals() {
        const imgPath = imageFiles[activeProduct][activeView];
        
        baseImage.src = imgPath;
        colorLayer.style.webkitMaskImage = `url('${imgPath}')`;
        colorLayer.style.maskImage = `url('${imgPath}')`;
        canvasWrapper.style.webkitMaskImage = `url('${imgPath}')`;
        canvasWrapper.style.maskImage = `url('${imgPath}')`;
        
        const currentColor = productColors[activeProduct];
        colorLayer.style.backgroundColor = currentColor;
        colorPicker.value = currentColor;

        updateUI();
    }

    function updateUI() {
        // Mostra il pannello controlli del prodotto attivo
        controlsHoodie.style.display = (activeProduct === 'hoodie') ? 'block' : 'none';
        controlsShorts.style.display = (activeProduct === 'shorts') ? 'block' : 'none';
        controlsTshirt.style.display = (activeProduct === 'tshirt') ? 'block' : 'none';

        const activePanel = (activeProduct === 'hoodie') ? controlsHoodie : 
                          (activeProduct === 'shorts') ? controlsShorts : controlsTshirt;
        
        // Mostra/nasconde i campi input in base a Fronte o Retro
        activePanel.querySelectorAll('.for-front').forEach(el => {
            el.style.display = (activeView === 'front') ? 'block' : 'none';
        });
        activePanel.querySelectorAll('.for-back').forEach(el => {
            el.style.display = (activeView === 'back') ? 'block' : 'none';
        });
    }

    function aggiornaTaglieConfiguratore() {
        if(!tagliaSelect) return; // Sicurezza
        tagliaSelect.innerHTML = '<option value="" selected disabled>Scegli Taglia...</option><option value="UNISEX">UNISEX</option>';
        
        if (activeProduct === 'hoodie' || activeProduct === 'tshirt') { 
            ['XS', 'S', 'M', 'L', 'XL', 'XXL'].forEach(t => tagliaSelect.innerHTML += `<option value="${t}">${t}</option>`);
        } else { 
            for (let i = 35; i <= 52; i++) {
                tagliaSelect.innerHTML += `<option value="${i}">${i}</option>`;
            }
        }
    }

    // --- FUNZIONE CORE: GESTIONE CAMBIO STATO E BOTTONI ---
    function switchState(newProduct, newView) {
        // Salva il design corrente prima di cambiare
        canvasStates[activeProduct][activeView] = canvas.toJSON(['customId']);
        
        activeProduct = newProduct;
        activeView = newView;

        // Gestione classi CSS 'active' per i bottoni Prodotto
        document.querySelectorAll('.product-selectors button').forEach(btn => btn.classList.remove('active'));
        if (activeProduct === 'hoodie') document.getElementById('select-hoodie').classList.add('active');
        if (activeProduct === 'shorts') document.getElementById('select-shorts').classList.add('active');
        if (activeProduct === 'tshirt') document.getElementById('select-tshirt').classList.add('active');

        // Gestione classi CSS 'active' per i bottoni Vista
        btnFront.classList.toggle('active', activeView === 'front');
        btnBack.classList.toggle('active', activeView === 'back');

        updateVisuals();
        aggiornaTaglieConfiguratore();
        
        // Ripristina il design salvato se esiste
        canvas.clear();
        if (canvasStates[activeProduct][activeView]) {
            canvas.loadFromJSON(canvasStates[activeProduct][activeView], () => canvas.renderAll());
        }

        document.querySelectorAll('input[type="text"]').forEach(input => input.value = '');
    }

    // 6. ASSEGNAZIONE EVENTI

    colorPicker.addEventListener('input', () => {
        const selectedColor = colorPicker.value;
        colorLayer.style.backgroundColor = selectedColor;
        productColors[activeProduct] = selectedColor;
    });

    btnHoodie.addEventListener('click', () => switchState('hoodie', 'front'));
    btnShorts.addEventListener('click', () => switchState('shorts', 'front'));
    btnTshirt.addEventListener('click', () => switchState('tshirt', 'front'));

    btnFront.addEventListener('click', () => switchState(activeProduct, 'front'));
    btnBack.addEventListener('click', () => switchState(activeProduct, 'back'));

    // 7. LOGICA FABRIC.JS (CARICAMENTO E TESTI)

    function setupImageUpload(inputId) {
        document.getElementById(inputId).addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function(event) {
                fabric.Image.fromURL(event.target.result, function(img) {
                    img.scaleToWidth(150);
                    img.set({
                        left: canvas.width / 2, top: canvas.height / 2,
                        originX: 'center', originY: 'center',
                        cornerColor: 'cadetblue', transparentCorners: false
                    });
                    canvas.add(img);
                    canvas.setActiveObject(img);
                });
            };
            reader.readAsDataURL(file);
        });
    }

    function setupDynamicText(inputId, fontId, orientId,colorId, customId, defaultTop, defaultLeft, defaultAngle) {
        const inputEl = document.getElementById(inputId);
        const fontEl = document.getElementById(fontId);
        const orientEl = document.getElementById(orientId);
        const colorEl = document.getElementById(colorId);

        function updateText() {
            const rawText = inputEl.value;
            let existingText = canvas.getObjects().find(obj => obj.customId === customId);

            if (rawText.trim() === '') {
                if (existingText) canvas.remove(existingText);
                return;
            }

            const currentFont = fontEl.value;
            const mode = orientEl.value;
            const currentColor = colorEl.value;

            let formattedText = rawText;
            let finalAngle = defaultAngle;

            if (mode === 'vertical') {
                formattedText = rawText.split('').join('\n');
                finalAngle = 0; 
            } else if (mode === 'horizontal') {
                finalAngle = 0;
            }

            if (existingText) {
                existingText.set({ text: formattedText, fontFamily: currentFont,fill: currentColor, angle: finalAngle });
            } else {
                const newText = new fabric.Text(formattedText, {
                    left: defaultLeft, top: defaultTop, angle: finalAngle,
                    fontFamily: currentFont, fill: currentColor, fontSize: 22, fontWeight: 'bold',
                    originX: 'center', originY: 'center', textAlign: 'center',
                    customId: customId, cornerColor: 'cadetblue', transparentCorners: false
                });
                canvas.add(newText);
            }
            canvas.renderAll(); 
        }

        inputEl.addEventListener('input', updateText);
        fontEl.addEventListener('change', updateText);
        orientEl.addEventListener('change', updateText);
        colorEl.addEventListener('input', updateText);
    }

    // Configurazione campi specifici
    setupImageUpload('upload-hoodie-front');
    setupImageUpload('upload-tshirt-front');

    setupDynamicText('text-hoodie-front-l', 'font-hoodie-front-l', 'orient-hoodie-front-l','color-hoodie-front-l', 'hoodie-L', 240, 410, 50);  
    setupDynamicText('text-hoodie-front-r', 'font-hoodie-front-r', 'orient-hoodie-front-r','color-hoodie-front-r','hoodie-R', 240, 90, -55); 
    setupDynamicText('text-hoodie-front-center', 'font-hoodie-front-center', 'orient-hoodie-front-center','color-hoodie-front-center', 'hoodie-C', 220, 250, 0); 
    setupDynamicText('text-shorts-front-l', 'font-shorts-front-l', 'orient-shorts-front-l','color-shorts-front-l','shorts-L', 300, 340, 0);   
    setupDynamicText('text-shorts-front-r', 'font-shorts-front-r', 'orient-shorts-front-r','color-shorts-front-r','shorts-R', 300, 160, 0);
    setupDynamicText('text-tshirt-front-center', 'font-tshirt-front-center', 'orient-tshirt-front-center','color-tshirt-front-center','tshirt-C', 220, 250, 0);

    // 9. RIMOZIONE OGGETTI
    document.addEventListener('keydown', function(e) {
        if ((e.key === 'Delete' || e.key === 'Backspace') && e.target.tagName !== 'INPUT') {
            const activeObj = canvas.getActiveObject();
            if (activeObj) {
                const inputMap = {
                    'hoodie-L': 'text-hoodie-front-l', 'hoodie-R': 'text-hoodie-front-r', 'hoodie-C': 'text-hoodie-front-center',
                    'shorts-L': 'text-shorts-front-l', 'shorts-R': 'text-shorts-front-r',
                    'tshirt-C': 'text-tshirt-front-center'
                };
                if (inputMap[activeObj.customId]) document.getElementById(inputMap[activeObj.customId]).value = '';
                canvas.remove(activeObj);
            }
        }
    });

    // 10. SALVATAGGIO E UPLOAD
    document.getElementById('btn-conferma-salva').addEventListener('click', async () => {
        const tagliaScelta = tagliaSelect ? tagliaSelect.value : null;
        const quantitaScelta = quantitaInput ? quantitaInput.value : 1;
        if (!tagliaScelta) return mostraToast("⚠️ Seleziona una taglia!", "warning");
        
        const btn = document.getElementById('btn-conferma-salva');
        btn.innerText = "⏳ Elaborazione...";
        btn.disabled = true;

        try {
            canvas.discardActiveObject().renderAll();
            const imgPath = imageFiles[activeProduct][activeView];
            const currentColor = productColors[activeProduct];

            fabric.Image.fromURL(imgPath, async function(baseImg) {
                baseImg.scaleToWidth(canvas.width).set({ left: 0, top: 0, selectable: false });
                baseImg.filters.push(new fabric.Image.filters.BlendColor({ color: currentColor, mode: 'multiply' }));
                baseImg.applyFilters();

                const exportCanvas = new fabric.Canvas(null, { width: canvas.width, height: canvas.height, backgroundColor: '#fff' });
                exportCanvas.add(baseImg); 
                canvas.getObjects().forEach(obj => exportCanvas.add(fabric.util.object.clone(obj)));
                exportCanvas.renderAll();

                const base64Image = exportCanvas.toDataURL({ format: 'png', quality: 1 });
                
                const formData = new FormData();
                formData.append('file', base64Image);
                formData.append('upload_preset', 'joajwzcg');

                const res = await fetch('https://api.cloudinary.com/v1_1/dfjburbax/image/upload', { method: 'POST', body: formData });
                const data = await res.json();
                
                 if(data.secure_url && window.parent && window.parent.salvaImmagineConfiguratore) 
                {
                    
                    let tipologiaScelta = (activeProduct === 'hoodie') ? 'Felpa' : 
                        (activeProduct === 'shorts') ? 'Pantalone' : 'T-shirt';
                    
                    window.parent.salvaImmagineConfiguratore(data.secure_url, tipologiaScelta, currentColor, tagliaScelta, quantitaScelta);
                } 
                else 
                {
                    mostraToast("❌ Errore: impossibile comunicare con il carrello principale.", "error");
                }
                
                btn.innerText = "✅ CONFERMA E ALLEGA ALL'ORDINE";
                btn.disabled = false;
            });
        } catch (error) {
            mostraToast("❌ Errore durante il salvataggio.", "error");
            btn.disabled = false;
        }
    });

    // AVVIO
    updateVisuals();
    aggiornaTaglieConfiguratore();
});