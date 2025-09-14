GitHub Pages tips:
- Metti questi file nella root di 'gh-pages' o della branch impostata per Pages.
- Per siti di progetto (https://<user>.github.io/<repo>/) i percorsi sono RELATIVI (già impostati).
- '404.html' clona 'index.html' per evitare il 404 in SPA/PWA quando si apre dalla home.
- start_url = 'index.html?source=pwa' e scope = './' così la PWA si avvia in qualunque sottocartella.
