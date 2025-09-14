document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('video');
    const mainButton = document.getElementById('main-button');
    const pipButton = document.getElementById('pip-button');
    const installButton = document.getElementById('install-button');
    const messageDisplay = document.getElementById('message-display');
    const splashScreen = document.getElementById('splash');
    const appContainer = document.getElementById('app-container');

    // URL del flusso video
    const videoUrl = "https://rst2.saiuzwebnetwork.it:8081/extratvlive/index.m3u8";
    let hls;
    let deferredPrompt;

    // Variabile per il contenitore delle istruzioni di installazione iOS
    const installPromptContainer = document.getElementById('install-prompt-container');

    // Registra il service worker per il supporto PWA
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js').then(registration => {
                console.log('Service Worker registrato con successo:', registration.scope);
            }).catch(error => {
                console.log('Registrazione del Service Worker fallita:', error);
            });
        });
    }

    // Aggiungi un controllo per la piattaforma iOS
    function isiOS() {
        const userAgent = window.navigator.userAgent.toLowerCase();
        return /iphone|ipad|ipod/.test(userAgent);
    }

    // Gestisce la logica di installazione della PWA in base al dispositivo
    if (isiOS()) {
        // Se è un dispositivo iOS, mostra il messaggio con le istruzioni
        if (installPromptContainer && !window.matchMedia('(display-mode: standalone)').matches) {
            installPromptContainer.innerHTML = `
                <p>Per installare l'app, tocca l'icona di **Condividi** nella barra del browser e seleziona **"Aggiungi a schermata Home"**.</p>
            `;
            installPromptContainer.style.display = 'block';
        }
        installButton.style.display = 'none'; // Nasconde il pulsante Android/Desktop su iOS
    } else {
        // Logica esistente per l'evento beforeinstallprompt per Android e Desktop
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            // Mostra il pulsante di installazione solo se non siamo in modalità standalone
            if (!window.matchMedia('(display-mode: standalone)').matches) {
                installButton.style.display = 'block';
            }
        });

        // Gestisce il click sul pulsante di installazione
        installButton.addEventListener('click', () => {
            if (deferredPrompt) {
                installButton.style.display = 'none';
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        console.log('L\'utente ha accettato di installare la PWA');
                    } else {
                        console.log('L\'utente ha rifiutato l\'installazione della PWA');
                    }
                    deferredPrompt = null;
                });
            }
        });
    }

    // Funzione per mostrare il contenuto dell'app dopo lo splash screen
    function showApp() {
        splashScreen.classList.add('hidden');
        appContainer.classList.add('visible');
    }

    setTimeout(showApp, 2000);

    // Funzione per mostrare un messaggio temporaneo
    function showMessage(msg, duration = 3000) {
        messageDisplay.textContent = msg;
        setTimeout(() => {
            messageDisplay.textContent = '';
        }, duration);
    }

    // Funzione per aggiornare il testo del pulsante principale
    function updateMainButton() {
        if (video.muted) {
            mainButton.textContent = 'Attiva Audio';
        } else {
            mainButton.textContent = 'Disattiva Audio';
        }
    }

    // Funzione per caricare il video con hls.js
    function loadVideo() {
        if (hls) {
            hls.destroy();
        }
        hls = new Hls();
        hls.loadSource(videoUrl);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
            video.play().then(() => {
                updateMainButton();
            }).catch(error => {
                console.error("Play failed:", error);
                showMessage("Riproduzione automatica fallita. Premi il pulsante per avviare.");
                mainButton.textContent = 'Avvia Riproduzione';
                mainButton.removeEventListener('click', toggleMute);
                mainButton.addEventListener('click', manualPlay, {
                    once: true
                });
            });
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
            console.error('HLS.js error:', data);
            if (data.fatal) {
                showMessage(`Errore di streaming: ${data.details}. Riavvio in corso...`);
                setTimeout(() => loadVideo(), 1000);
            }
        });
    }

    // Funzione per avviare la riproduzione manualmente
    function manualPlay() {
        video.play().then(() => {
            video.muted = false;
            updateMainButton();
            mainButton.removeEventListener('click', manualPlay);
            mainButton.addEventListener('click', toggleMute);
        }).catch(error => {
            console.error("Manual play failed:", error);
            showMessage("Riproduzione fallita. Il browser ha bloccato l'azione.");
        });
    }

    // Funzione per attivare/disattivare l'audio
    function toggleMute() {
        video.muted = !video.muted;
        updateMainButton();
    }

    // Avvia il caricamento del video
    if (Hls.isSupported()) {
        loadVideo();
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Fallback per il supporto nativo in Safari
        video.src = videoUrl;
        video.play().catch(error => {
            console.error("Autoplay failed on native player:", error);
            showMessage("Riproduzione automatica fallita. Premi il pulsante per avviare.");
            mainButton.textContent = 'Avvia Riproduzione';
            mainButton.removeEventListener('click', toggleMute);
            mainButton.addEventListener('click', manualPlay, {
                once: true
            });
        });
    } else {
        showMessage('Il tuo browser non supporta lo streaming HLS.');
    }

    // Controlla la modalità di visualizzazione e mostra i pulsanti appropriati
    if (!window.matchMedia('(display-mode: standalone)').matches) {
        // Non in modalità standalone (web browser)
        pipButton.style.display = 'block';
    } else {
        // Modalità standalone (PWA installata)
        pipButton.style.display = 'none';
    }

    // Event listener per il pulsante principale
    mainButton.addEventListener('click', toggleMute);

    // Event listener per il pulsante PiP
    pipButton.addEventListener('click', () => {
        if (document.pictureInPictureEnabled) {
            if (document.pictureInPictureElement) {
                document.exitPictureInPicture().catch(error => {
                    console.error("Exit PiP failed:", error);
                });
            } else {
                if (video.paused) {
                    video.play().catch(error => {
                        console.error("Play failed before PiP request:", error);
                        showMessage("Impossibile riprodurre il video. Riprova.");
                        return;
                    });
                }
                video.requestPictureInPicture().catch(error => {
                    console.error("PiP failed:", error);
                    showMessage("Impossibile entrare in modalità Schermo-in-Schermo. Riprova più tardi.");
                });
            }
        } else {
            showMessage("Il PiP non è supportato dal tuo dispositivo.");
        }
    });

    // Aggiungi un event listener per il doppio tocco
    let lastClickTime = 0;
    video.addEventListener('click', (e) => {
        const clickTime = new Date().getTime();
        if (clickTime - lastClickTime < 300) {
            // È un doppio tocco
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else if (video.webkitEnterFullscreen) { // Fallback for iOS Safari
                 // If the video is already in fullscreen on iOS, exit it
                 if (document.webkitFullscreenElement) {
                    document.webkitExitFullscreen();
                } else {
                    video.webkitEnterFullscreen();
                }
            } else if (video.requestFullscreen) {
                video.requestFullscreen();
            }
        }
        lastClickTime = clickTime;
    });

    // Sincronizza lo stato del pulsante se l'utente usa i controlli nativi del player
    video.addEventListener('volumechange', updateMainButton);
    video.addEventListener('play', updateMainButton);
    video.addEventListener('pause', updateMainButton);

    // Stato iniziale
    updateMainButton();
});
