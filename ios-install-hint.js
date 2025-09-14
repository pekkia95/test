(function(){
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  if (!isStandalone && isSafari) {
    const bar = document.createElement('div');
    bar.style.cssText = 'position:fixed;left:0;right:0;bottom:0;margin:0;padding:.75rem 1rem;background:#111;color:#fff;font:600 14px system-ui;border-top:1px solid rgba(255,255,255,.15);z-index:60;display:flex;gap:.5rem;align-items:center;justify-content:center';
    bar.innerHTML = 'Per installare: tocca <span style="font-weight:700">Condividi</span> → <span style="font-weight:700">Aggiungi a Home</span>';
    document.body.appendChild(bar);
    setTimeout(()=> bar.remove(), 7000);
  }
})();