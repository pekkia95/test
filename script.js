// Gestisce la logica di installazione della PWA
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
