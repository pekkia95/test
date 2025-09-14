document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('video');
    const mainButton = document.getElementById('main-button');
    const pipButton = document.getElementById('pip-button');
    const installButton = document.getElementById('install-button');
    const messageDisplay = document.getElementById('message-display');
    const splashScreen = document.getElementById('splash');
    const appContainer = document.getElementById('app-container');
    const videoUrl = "https://rst2.saiuzwebnetwork.it:8081/extratvlive/index.m3u8";
    let hls;
    let deferredPrompt;
    const installPromptContainer = document.getElementById('install-prompt-container');
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js').then(registration => {
                console.log('Service Worker registrato con successo:', registration.scope);
            }).catch(error => {
                console.log('Registrazione del Service Worker fallita:', error);
            });
        });
    }
    function isiOS() {
        const userAgent = window.navigator.userAgent.toLowerCase();
        return /iphone|ipad|ipod/.test(userAgent);
    }
    if (isiOS()) {
        if (installPromptContainer && !window.matchMedia('(display-mode: standalone)').matches) {
            installPromptContainer.innerHTML = `
                <p>Per installare l'app, tocca l'icona "Condividi" poi "Aggiungi a schermata Home"**.</p>
            `;
            installPromptContainer.style.display = 'block';
        }
        installButton.style.display = 'none';
    } else {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            if (!window.matchMedia('(display-mode: standalone)').matches) {
                installButton.style.display = 'block';
            }
        });
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
    function showApp() {
        splashScreen.classList.add('hidden');
        appContainer.classList.add('visible');
    }
    setTimeout(showApp, 2000);
    function showMessage(msg, duration = 3000) {
        messageDisplay.textContent = msg;
        setTimeout(() => {
            messageDisplay.textContent = '';
        }, duration);
    }
    function updateMainButton() {
        if (video.muted) {
            mainButton.textContent = 'Attiva Audio';
        } else {
            mainButton.textContent = 'Disattiva Audio';
        }
    }
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
    function toggleMute() {
        video.muted = !video.muted;
        updateMainButton();
    }
    if (Hls.isSupported()) {
        loadVideo();
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
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
    if (!window.matchMedia('(display-mode: standalone)').matches) {
        pipButton.style.display = 'block';
    } else {
        pipButton.style.display = 'none';
    }
    mainButton.addEventListener('click', toggleMute);
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
    let lastClickTime = 0;
    video.addEventListener('click', (e) => {
        const clickTime = new Date().getTime();
        if (clickTime - lastClickTime < 300) {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else if (video.webkitEnterFullscreen) {
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
    video.addEventListener('volumechange', updateMainButton);
    video.addEventListener('play', updateMainButton);
    video.addEventListener('pause', updateMainButton);
    updateMainButton();
});
