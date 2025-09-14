// Controlla se il dispositivo è iOS per gestire il pulsante di installazione
function isiOS() {
    const userAgent = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(userAgent);
}

// Se è un dispositivo iOS, mostra il messaggio con le istruzioni
if (isiOS()) {
    const installPromptContainer = document.getElementById('install-prompt-container');
    if (installPromptContainer && !window.matchMedia('(display-mode: standalone)').matches) {
        installPromptContainer.innerHTML = `
            <p>Per installare l'app, tocca l'icona di **Condividi** nella barra del browser e seleziona **"Aggiungi a schermata Home"**.</p>
        `;
        installPromptContainer.style.display = 'block';
    }
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
                    console.log('L\'utente ha rifiutato l'installazione della PWA');
                }
                deferredPrompt = null;
            });
        }
    });
}
