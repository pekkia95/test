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
