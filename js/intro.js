/* SM HUB - intro del marchio.
   Alla prima apertura della sessione il logo compare grande al centro, si
   compone pezzo per pezzo (S, M, sbarra blu, hub) e vola al suo posto nella
   barra mentre il fondo si dissolve. Meno di due secondi, e si salta con un
   clic, un tasto o uno scroll.

   Un'intro non deve mai poter bloccare il sito, quindi tre sicurezze:
   - se farla lo decide lo script in <head> (classe "apre-marchio" su html): solo se la
     sessione non l'ha ancora vista e il sistema non chiede meno movimento;
   - finche questo file non parte la pagina e coperta da un velo CSS che si
     toglie da solo dopo 2,5 secondi: se lo script non arriva, il sito compare;
   - da quando parte, un timer chiude comunque tutto entro 3 secondi.

   Per rivederla senza aprire una nuova scheda: aggiungere ?intro all'indirizzo.

   Caricato in fondo al body e NON defer: deve partire prima di Leaflet, che e
   il file piu lento, cosi l'intro comincia appena la pagina e costruita. */
(function () {
  'use strict';

  var radice = document.documentElement;
  if (!radice.classList.contains('apre-marchio')) return;

  var logo = document.querySelector('.nav-logo .marchio');

  // Da qui decide questo script: via il velo CSS con la sua scadenza, dentro il
  // velo vero. Tutto nello stesso task, quindi nessun fotogramma scoperto.
  radice.classList.remove('apre-marchio');
  radice.classList.add('apre-marchio-attiva');
  try { sessionStorage.setItem('smhubIntro', '1'); } catch (e) {}

  var SALTI = ['wheel', 'touchstart', 'keydown', 'pointerdown'];
  var velo = null, volo = null, finito = false;
  var sicurezza = setTimeout(chiudi, 3000);

  if (!logo || !logo.animate || document.hidden) { chiudi(); return; }

  velo = document.createElement('div');
  velo.className = 'apre-velo';
  velo.setAttribute('aria-hidden', 'true');

  // Il clone nasce GRANDE e rimpicciolisce: un SVG ingrandito con transform
  // viene disegnato alla misura di partenza e sgrana, uno rimpicciolito no.
  volo = logo.cloneNode(true);
  volo.classList.add('apre-volo');
  var maschera = volo.querySelector('clipPath');
  if (maschera) {
    maschera.id = 'clip_intro';
    var tagliato = volo.querySelector('[clip-path]');
    if (tagliato) tagliato.setAttribute('clip-path', 'url(#clip_intro)');
  }

  // Ogni pezzo del marchio finisce dentro un <g> tutto suo: i path hanno gia un
  // attributo transform (la matrice del PDF d'origine) e un transform CSS
  // messo direttamente su di loro lo cancellerebbe, spostandoli.
  // Ordine nel file: S, M, sbarra blu, poi le tre lettere di "hub".
  var pezzi = [].slice.call(volo.querySelectorAll('[clip-path] > path')).map(function (p) {
    var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    p.parentNode.insertBefore(g, p);
    g.appendChild(p);
    return g;
  });

  var arrivo = logo.getBoundingClientRect();
  var lato = Math.min(Math.min(window.innerWidth, window.innerHeight) * 0.62, 560);
  var cx = window.innerWidth / 2, cy = window.innerHeight / 2;

  volo.style.left = (cx - lato / 2) + 'px';
  volo.style.top = (cy - lato / 2) + 'px';
  volo.style.width = lato + 'px';
  volo.style.height = lato + 'px';

  var piccolo = 'translate(' +
    (arrivo.left + arrivo.width / 2 - cx) + 'px,' +
    (arrivo.top + arrivo.height / 2 - cy) + 'px) scale(' + (arrivo.width / lato) + ')';

  document.body.appendChild(velo);
  document.body.appendChild(volo);

  // ---- 1. il marchio si compone ----
  var morbido = 'cubic-bezier(.2,.7,.2,1)';
  var sale = [{ opacity: 0, transform: 'translateY(9px)' }, { opacity: 1, transform: 'none' }];
  var salePoco = [{ opacity: 0, transform: 'translateY(5px)' }, { opacity: 1, transform: 'none' }];
  var scatta = [{ transform: 'scale(0)' }, { transform: 'scale(1)' }];
  var tempi = [
    [0, sale, 0], [1, sale, 90],          // S e M
    [2, scatta, 270],                     // la sbarra blu cresce dal suo vertice basso
    [3, salePoco, 400], [4, salePoco, 450], [5, salePoco, 500]  // hub
  ];
  if (pezzi[2]) pezzi[2].style.transformOrigin = '0% 100%';
  tempi.forEach(function (t) {
    if (pezzi[t[0]]) {
      pezzi[t[0]].animate(t[1], { duration: 520, delay: t[2], easing: morbido, fill: 'both' });
    }
  });

  // ---- 2. vola al suo posto, il fondo si scopre ----
  var PARTENZA = 1150;
  var viaggio = volo.animate(
    [{ transform: 'none' }, { transform: piccolo }],
    { duration: 780, delay: PARTENZA, easing: 'cubic-bezier(.75,0,.2,1)', fill: 'forwards' });
  velo.animate(
    [{ opacity: 1 }, { opacity: 0 }],
    { duration: 620, delay: PARTENZA + 160, easing: 'linear', fill: 'forwards' });
  // .finished (una promessa) e non onfinish (un evento): l'evento viene
  // consegnato col fotogramma successivo, la promessa no. Rigettata se
  // l'animazione viene annullata: in quel caso chiude qualcun altro.
  quandoFinisce(viaggio);

  SALTI.forEach(function (t) { window.addEventListener(t, salta, { passive: true }); });

  function salta() {
    if (finito) return;
    SALTI.forEach(function (t) { window.removeEventListener(t, salta); });
    // il logo vero torna subito al suo posto, il resto sparisce in un attimo
    radice.classList.remove('apre-marchio-attiva');
    velo.animate([{ opacity: getComputedStyle(velo).opacity }, { opacity: 0 }],
      { duration: 180, fill: 'forwards' });
    quandoFinisce(volo.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, fill: 'forwards' }));
  }

  function quandoFinisce(animazione) {
    if (animazione.finished) animazione.finished.then(chiudi, function () {});
    else animazione.onfinish = chiudi;
  }

  function chiudi() {
    if (finito) return;
    finito = true;
    clearTimeout(sicurezza);
    SALTI.forEach(function (t) { window.removeEventListener(t, salta); });
    // clone via e logo vero visibile nello stesso task: nessun fotogramma vuoto
    if (velo) velo.remove();
    if (volo) volo.remove();
    radice.classList.remove('apre-marchio-attiva');
  }
})();
