document.addEventListener("DOMContentLoaded", () => {
    
    // --- GESTIONE CAMBIO VISTA (DUE BOTTONI) ---
    const btnFronte = document.getElementById("btn-fronte");
    const btnRetro = document.getElementById("btn-retro");
    const vistaFronte = document.getElementById("vista-fronte");
    const vistaRetro = document.getElementById("vista-retro");
    
    let stiamoGuardandoFronte = true; 

    // Funzione per mostrare il fronte
    function mostraFronte() {
        stiamoGuardandoFronte = true;
        btnFronte.classList.add("active");
        btnRetro.classList.remove("active");
        
        vistaFronte.classList.add("active-view");
        vistaFronte.classList.remove("hidden-view");
        vistaRetro.classList.add("hidden-view");
        vistaRetro.classList.remove("active-view");
    }

    // Funzione per mostrare il retro
    function mostraRetro() {
        stiamoGuardandoFronte = false;
        btnRetro.classList.add("active");
        btnFronte.classList.remove("active");
        
        vistaRetro.classList.add("active-view");
        vistaRetro.classList.remove("hidden-view");
        vistaFronte.classList.add("hidden-view");
        vistaFronte.classList.remove("active-view");
    }

    // Assegniamo il click ai bottoni
    btnFronte.addEventListener("click", mostraFronte);
    btnRetro.addEventListener("click", mostraRetro);


    // --- GESTIONE TESTO ---
    const btnAggiungiTesto = document.getElementById("btn-aggiungi-testo");
    
    btnAggiungiTesto.addEventListener("click", () => {
        const testo = document.getElementById("testo-input").value;
        const posizioneId = document.getElementById("pos-testo").value;
        const fontScelto = document.getElementById("font-testo").value;
        const areaStampa = document.getElementById(posizioneId);
        
        if (testo.trim() !== "") {
            // Inietta il testo con il font selezionato
            areaStampa.innerHTML = `<p style="font-family: ${fontScelto};">${testo}</p>`;
            
            // Auto-Gira Felpa se l'utente sbaglia visuale
            if (posizioneId === 'area-retro-centro' && stiamoGuardandoFronte) {
                mostraRetro();
            } else if (posizioneId !== 'area-retro-centro' && !stiamoGuardandoFronte) {
                mostraFronte();
            }
        }
    });


    // --- GESTIONE IMMAGINE ---
    const imgInput = document.getElementById("img-input");
    
    imgInput.addEventListener("change", function(event) {
        const file = event.target.files[0];
        const posizioneId = document.getElementById("pos-img").value;
        const areaStampa = document.getElementById(posizioneId);

        if (file) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                areaStampa.innerHTML = `<img src="${e.target.result}" alt="Stampa personalizzata">`;
                
                // Auto-Gira Felpa
                if (posizioneId === 'area-retro-centro' && stiamoGuardandoFronte) {
                    mostraRetro();
                } else if (posizioneId === 'area-centro' && !stiamoGuardandoFronte) {
                    mostraFronte();
                }
            }
            reader.readAsDataURL(file);
        }
    });


    // --- RESET ---
    const btnReset = document.getElementById("btn-reset");
    
    btnReset.addEventListener("click", () => {
        document.getElementById("area-centro").innerHTML = "";
        document.getElementById("area-manica-sx").innerHTML = "";
        document.getElementById("area-manica-dx").innerHTML = "";
        document.getElementById("area-retro-centro").innerHTML = "";
        
        document.getElementById("testo-input").value = "";
        document.getElementById("img-input").value = "";
        
        mostraFronte(); // Riporta la felpa sul davanti quando svuoti
    });

});