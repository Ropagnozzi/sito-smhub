/* SMHUB - comportamenti di pagina: sequenza fotografica, menu, mappa di copertura.
   Direzione blueprint: il movimento e ridotto al minimo, niente contenuti nascosti
   in attesa di un observer (regola: nessun elemento parte da opacity 0). */
(function () {
  'use strict';

  var pocoMoto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- sequenza fotografica dell'hero -------------------------------
     Non e un file video: sono le foto degli impianti in dissolvenza.
     Aggiungere un impianto significa aggiungere una foto. */
  /* I riquadri dell'hero si riempiono con le foto degli impianti piu grandi:
     cosi restano allineati all'inventario e non puntano a un file che un domani
     lo script potrebbe cancellare. Senza dati restano i segnaposto. */
  /* Sul telefono in verticale, se ci sono le foto scattate apposta
     (assets/foto/hero-mobile/), l'hero torna a tutto schermo con quelle:
     classe .hero-verticale. Altrimenti resta l'impaginazione del CSS.
     Ruotando il telefono la sequenza si ricostruisce. */
  var sequenza = document.getElementById('sequenza');
  var hero = sequenza && sequenza.closest('.hero');
  var segnaposto = sequenza ? sequenza.innerHTML : '';
  var orizzontali = elenco()
    .filter(function (i) { return i.photos && i.photos.length; })
    .sort(function (a, b) { return (b.sqm || 0) - (a.sqm || 0); })
    .slice(0, 3)
    .map(function (i) { return 'assets/foto/impianti/' + i.photos[0]; });
  var verticali = (Array.isArray(window.SMHUB_HERO_MOBILE) ? window.SMHUB_HERO_MOBILE : [])
    .map(function (f) { return 'assets/foto/hero-mobile/' + f; });
  // 600px e non 768: le foto verticali sono pensate per i telefoni; su un tablet
  // in piedi verrebbero rifilate di oltre un terzo, e li resta la foto intera.
  var telefono = window.matchMedia('(max-width: 600px) and (orientation: portrait)');

  function costruisciSequenza() {
    if (!sequenza) return;
    var usaVerticali = telefono.matches && verticali.length > 0;
    var foto = usaVerticali ? verticali : orizzontali;
    hero.classList.toggle('hero-verticale', usaVerticali);
    if (!foto.length) { sequenza.innerHTML = segnaposto; return; }
    sequenza.innerHTML = foto.map(function (src, i) {
      return '<div class="slide' + (i === 0 ? ' on' : '') + '"><img src="' + src + '"' +
        (i === 0 ? '' : ' loading="lazy"') + ' decoding="async" alt=""></div>';
    }).join('');
  }
  // Si ricostruisce solo quando la condizione cambia davvero. Tre ascolti invece
  // di uno: l'evento della media query non arriva ovunque (Safari prima della
  // 14 conosce solo addListener), il ridimensionamento e la rotazione si.
  var eraTelefono = null;
  function seCambia() {
    if (telefono.matches === eraTelefono) return;
    eraTelefono = telefono.matches;
    costruisciSequenza();
  }
  seCambia();
  if (telefono.addEventListener) telefono.addEventListener('change', seCambia);
  else if (telefono.addListener) telefono.addListener(seCambia);
  window.addEventListener('resize', seCambia);
  window.addEventListener('orientationchange', seCambia);

  if (!pocoMoto) {
    setInterval(function () {
      if (document.hidden || !sequenza) return;
      // le slide si rileggono a ogni giro: la sequenza puo essere stata ricostruita
      var slides = [].slice.call(sequenza.querySelectorAll('.slide'));
      if (slides.length < 2) return;
      var ora = slides.findIndex(function (s) { return s.classList.contains('on'); });
      if (ora < 0) ora = 0;
      slides[ora].classList.remove('on');
      slides[(ora + 1) % slides.length].classList.add('on');
    }, 5200);
  }

  /* ---------- interruttore di confronto fra i due fondi ---------------------
     Serve solo a scegliere: quando il fondo e deciso, si toglie il gruppo .tema
     dal markup e si lascia la palette scelta come predefinita nel CSS. */
  var bottoniTema = [].slice.call(document.querySelectorAll('.tema button'));
  if (bottoniTema.length) {
    var salvato = null;
    try { salvato = localStorage.getItem('smhubTema'); } catch (e) {}
    // valori vecchi rimasti in memoria (blu, acciaio) non esistono piu
    var validi = ['scuro', 'medio', 'chiaro'];
    applica(validi.indexOf(salvato) > -1 ? salvato : 'medio');
    bottoniTema.forEach(function (b) {
      b.addEventListener('click', function () {
        var t = b.getAttribute('data-tema');
        applica(t);
        try { localStorage.setItem('smhubTema', t); } catch (e) {}
      });
    });
  }
  function applica(tema) {
    document.documentElement.setAttribute('data-tema', tema);
    bottoniTema.forEach(function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-tema') === tema ? 'true' : 'false');
    });
  }

  // Il font dei titoli e deciso (IBM Plex Mono, come il payoff): via
  // l'eventuale preferenza rimasta dall'interruttore provvisorio.
  try { localStorage.removeItem('smhubCarattere'); } catch (e) {}

  /* ---------- menu mobile --------------------------------------------------- */
  var tasto = document.querySelector('.nav-toggle');
  var menu = document.getElementById('menu');
  if (tasto && menu) {
    tasto.addEventListener('click', function () {
      var aperto = menu.classList.toggle('aperto');
      tasto.setAttribute('aria-expanded', aperto ? 'true' : 'false');
    });
    menu.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        menu.classList.remove('aperto');
        tasto.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- in evidenza: la domination di Corso Vittorio Emanuele ---------
     Due impianti su ponteggio che non fanno parte del catalogo dei 47: i dati
     stanno qui perche arrivano dalla presentazione, non dall'xlsx. */
  var DOMINATION = {
    a: { code: 'A - Corso Vittorio Emanuele', pos: 'Corso Vittorio Emanuele, 10 x 13 m, illuminato',
         lat: 40.8336892, lng: 14.2209031, cartella: 'assets/foto/domination/',
         photos: ['dom-a-01.jpg', 'dom-a-02.jpg', 'dom-a-03.jpg'] },
    b: { code: 'B - Angolo Via Arangio Ruiz', pos: 'Corso Vittorio Emanuele angolo Via Arangio Ruiz, 9 x 13 m, illuminato',
         lat: 40.8331332, lng: 14.2206949, cartella: 'assets/foto/domination/',
         photos: ['dom-b-01.jpg', 'dom-b-02.jpg', 'dom-b-03.jpg'] }
  };
  document.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('.dom-apri') : null;
    if (!b) return;
    apriGalleria(DOMINATION[b.getAttribute('data-posizione')],
      Number(b.getAttribute('data-foto')) || 0, b);
  });

  /* ---------- mappa di copertura -------------------------------------------
     Mappa reale, senza segnaposti finti: i marker compaiono quando arriva
     l'elenco impianti con le coordinate. */
  var contenitore = document.getElementById('mappa');
  if (contenitore && typeof L !== 'undefined') {
    /* Navigabile, ma senza rubare lo scorrimento della pagina:
       - computer: pulsanti, trascinamento, doppio clic, e zoom con la rotella
         SOLO tenendo Ctrl (la rotella da sola continua a scorrere la pagina);
       - schermi touch: un dito scorre la pagina, due dita spostano e ingrandiscono.
         Con il trascinamento spento Leaflet mette touch-action: pan-x pan-y, cosi
         il browser tiene lo scorrimento e passa alla mappa il gesto a due dita. */
    var touch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    var mappa = L.map(contenitore, {
      center: [40.8518, 14.2681],
      zoom: 12,
      minZoom: 10,
      maxZoom: 18,
      zoomControl: false,
      dragging: !touch,
      scrollWheelZoom: false,
      doubleClickZoom: true,
      touchZoom: true,
      keyboard: true
    });
    L.control.zoom({ position: 'topright', zoomInTitle: 'Ingrandisci', zoomOutTitle: 'Riduci' }).addTo(mappa);

    // avviso breve sopra la mappa, per chi prova il gesto "sbagliato"
    var avviso = document.createElement('p');
    avviso.className = 'mappa-avviso';
    avviso.setAttribute('aria-live', 'polite');
    contenitore.appendChild(avviso);
    var avvisoTimer = null;
    function avvisa(testoAvviso) {
      avviso.textContent = testoAvviso;
      avviso.classList.add('visibile');
      clearTimeout(avvisoTimer);
      avvisoTimer = setTimeout(function () { avviso.classList.remove('visibile'); }, 1600);
    }

    // Rotella: l'ascolto in fase di cattura arriva prima di quello di Leaflet, e
    // accende o spegne lo zoom a rotella per quel singolo evento.
    contenitore.addEventListener('wheel', function (e) {
      if (e.ctrlKey || e.metaKey) {
        mappa.scrollWheelZoom.enable();
      } else {
        mappa.scrollWheelZoom.disable();
        avvisa(/Mac/.test(navigator.platform) ? 'Tieni premuto ⌘ e usa la rotella per ingrandire'
                                               : 'Tieni premuto Ctrl e usa la rotella per ingrandire');
      }
    }, { capture: true, passive: true });

    if (touch) {
      contenitore.addEventListener('touchmove', function (e) {
        if (e.touches.length === 1) avvisa('Usa due dita per muovere la mappa');
      }, { passive: true });
    }
    // tile OpenStreetMap senza chiave: la resa scura si ottiene invertendo il
    // pannello delle tile via CSS (le tile scure di CARTO ora richiedono una API key)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(mappa);

    // Gli impianti arrivano da js/impianti-data.js, generato da build-impianti.py
    // a partire dall'xlsx: qui non si scrive nessun dato a mano.
    var conCoordinate = elenco().filter(function (i) { return i.lat && i.lng; });
    var nota = document.querySelector('.mappa-nota');
    if (conCoordinate.length) {
      var gruppo = L.featureGroup();
      conCoordinate.forEach(function (imp) {
        L.circleMarker([imp.lat, imp.lng], {
          radius: 6, color: '#009ee4', weight: 2, fillColor: '#009ee4', fillOpacity: 0.6
        }).bindPopup(contenutoPopup(imp), {
          className: 'pop-impianto', minWidth: 250, maxWidth: 250
        }).addTo(gruppo);
      });
      gruppo.addTo(mappa);

      // Le miniature nel popup aprono la galleria. Il popup viene ricreato a ogni
      // apertura, quindi gli ascolti si agganciano qui e non una volta sola.
      var perCodice = {};
      conCoordinate.forEach(function (imp) { perCodice[imp.code] = imp; });
      mappa.on('popupopen', function (e) {
        var radicePopup = e.popup.getElement();
        if (!radicePopup) return;
        [].slice.call(radicePopup.querySelectorAll('.pop-miniatura')).forEach(function (b) {
          b.addEventListener('click', function () {
            apriGalleria(perCodice[b.getAttribute('data-codice')],
              Number(b.getAttribute('data-foto')), b);
          });
        });
      });
      // i due impianti in evidenza: cerchio piu grande e anello bianco
      Object.keys(DOMINATION).forEach(function (k) {
        var d = DOMINATION[k];
        L.circleMarker([d.lat, d.lng], {
          radius: 10, color: '#fff', weight: 2, fillColor: '#009ee4', fillOpacity: 0.95
        }).bindPopup('<div class="pop"><p class="pop-code">In evidenza</p>' +
          '<p class="pop-pos">' + testo(d.code) + '</p>' +
          '<p class="pop-dati">' + testo(d.pos) + '</p></div>',
          { className: 'pop-impianto', minWidth: 250, maxWidth: 250 }).addTo(gruppo);
      });

      var tuttiGliImpianti = gruppo.getBounds().pad(0.15);
      mappa.fitBounds(tuttiGliImpianti);

      // sotto + e -: torna alla vista d'insieme dopo aver ingrandito
      var Insieme = L.Control.extend({
        options: { position: 'topright' },
        onAdd: function () {
          var barra = L.DomUtil.create('div', 'leaflet-bar mappa-insieme');
          var tasto = L.DomUtil.create('a', '', barra);
          tasto.href = '#';
          tasto.setAttribute('role', 'button');
          tasto.title = 'Torna a tutti gli impianti';
          tasto.setAttribute('aria-label', 'Torna a tutti gli impianti');
          tasto.innerHTML = '&#x2922;';
          L.DomEvent.disableClickPropagation(barra);
          L.DomEvent.on(tasto, 'click', function (e) {
            L.DomEvent.preventDefault(e);
            mappa.closePopup();
            mappa.flyToBounds(tuttiGliImpianti, { duration: 0.6 });
          });
          return barra;
        }
      });
      new Insieme().addTo(mappa);
      if (nota) nota.textContent = conCoordinate.length + ' impianti sulla mappa';
    } else if (nota) {
      nota.textContent = 'Posizioni degli impianti in caricamento';
    }
  }

  /* ---------- elenco degli impianti ----------------------------------------
     Le schede nascono dai dati, non dal markup: aggiungere un impianto vuol
     dire aggiungere una riga nell'xlsx e ri-lanciare build-impianti.py. */
  var contenitoreElenco = document.getElementById('elenco-impianti');
  if (contenitoreElenco) {
    var impianti = elenco();
    var pezzi = impianti.map(function (imp) {
      // la foto e un pulsante che apre la galleria, come le miniature della mappa
      var quante = imp.photos ? imp.photos.length : 0;
      var foto = quante
        ? '<button type="button" class="imp-apri" data-codice="' + testo(imp.code) + '" ' +
            'aria-label="Apri ' + (quante > 1 ? 'le ' + quante + ' foto' : 'la foto') +
            ' dell\'impianto ' + testo(imp.code) + '">' +
            '<img loading="lazy" decoding="async" src="assets/foto/impianti/' + imp.photos[0] +
            '" alt="Impianto ' + testo(imp.code) + ' in ' + testo(imp.pos) + ', Napoli">' +
            (quante > 1 ? '<span class="imp-quante">' + quante + ' foto</span>' : '') +
          '</button>'
        : '<div class="slot"><span>Foto in arrivo</span></div>';
      var dati = [
        ['Formato', imp.dim],
        ['Superficie', imp.sqm
          ? (imp.sqm_stimato ? '~ ' : '') + imp.sqm + ' m&sup2;'
          : null],
        ['Illuminazione', imp.light ? 'sì' : 'no'],
        ['Tipologia', imp.type]
      ].filter(function (r) { return r[1]; }).map(function (r) {
        return '<div><dt>' + r[0] + '</dt><dd>' + r[1] + '</dd></div>';
      }).join('');
      return '<article class="imp" id="imp-' + testo(imp.code) + '"' +
               ' data-tipo="' + (imp.type === 'Stand alone' ? 'autoportante' : 'edificio') + '">' +
               '<div class="imp-foto">' + foto + '</div>' +
               '<div class="imp-corpo">' +
                 '<p class="imp-code">' + testo(imp.code) + '</p>' +
                 '<h3>' + testo(imp.pos) + '</h3>' +
                 '<dl class="imp-dati">' + dati + '</dl>' +
               '</div>' +
             '</article>';
    });
    contenitoreElenco.innerHTML = pezzi.join('');

    // un solo ascolto per tutte le schede
    contenitoreElenco.addEventListener('click', function (e) {
      var b = e.target.closest('.imp-apri');
      if (!b) return;
      var codice = b.getAttribute('data-codice');
      var imp = impianti.filter(function (i) { return i.code === codice; })[0];
      apriGalleria(imp, 0, b);
    });

    /* Filtro per tipologia: 47 schede sono tante, e la differenza fra un
       impianto su palazzo e uno autoportante e la prima cosa che un cliente
       vuole separare. Nessuna animazione: le schede appaiono e spariscono. */
    var gruppi = [
      ['tutti', 'Tutti', function () { return true; }],
      ['edificio', 'Su edificio', function (i) { return !autoportante(i); }],
      ['autoportante', 'Con telaio proprio', autoportante]
    ];
    var barra = document.getElementById('filtro-impianti');
    if (barra) {
      barra.innerHTML = gruppi.map(function (g) {
        var quanti = impianti.filter(g[2]).length;
        return '<button type="button" data-gruppo="' + g[0] + '"' +
               ' aria-pressed="' + (g[0] === 'tutti') + '">' + g[1] +
               ' <span>' + quanti + '</span></button>';
      }).join('');
      barra.addEventListener('click', function (e) {
        var tasto = e.target.closest('button');
        if (!tasto) return;
        var scelto = tasto.getAttribute('data-gruppo');
        [].slice.call(barra.querySelectorAll('button')).forEach(function (b) {
          b.setAttribute('aria-pressed', b === tasto ? 'true' : 'false');
        });
        [].slice.call(contenitoreElenco.children).forEach(function (scheda) {
          scheda.hidden = scelto !== 'tutti' && scheda.getAttribute('data-tipo') !== scelto;
        });
      });
    }

    var riepilogo = document.getElementById('conta-impianti');
    if (riepilogo) {
      var mq = impianti.reduce(function (t, i) { return t + (i.sqm || 0); }, 0);
      var illuminati = impianti.filter(function (i) { return i.light; }).length;
      var autoportanti = impianti.filter(autoportante).length;
      riepilogo.innerHTML =
        voce(impianti.length, 'impianti') +
        voce(migliaia(mq), 'metri quadri di superficie') +
        voce(autoportanti, 'con telaio proprio') +
        voce(illuminati, 'illuminati');
    }
  }

  /* ---------- popup della mappa ----------------------------------------------
     Miniature cliccabili sopra i dati: una a tutta larghezza, due affiancate.
     Sono <button>, cosi si raggiungono anche da tastiera. HTML semplice e non
     componenti: dentro un popup Leaflet e la strada che funziona sempre. */
  function contenutoPopup(imp) {
    var foto = imp.photos || [];
    var miniature = foto.length
      ? foto.map(function (f, i) {
          return '<button type="button" class="pop-miniatura" data-codice="' + testo(imp.code) +
            '" data-foto="' + i + '" aria-label="Apri la foto ' + (i + 1) + ' di ' + foto.length +
            ' dell\'impianto ' + testo(imp.code) + '">' +
            // niente loading=lazy: il popup nasce solo quando lo si apre
            '<img src="assets/foto/impianti/' + testo(f) + '" alt="" decoding="async">' +
            '</button>';
        }).join('')
      : '<p class="pop-senza">Foto in arrivo</p>';
    var dati = [imp.dim, imp.sqm ? (imp.sqm_stimato ? '~ ' : '') + imp.sqm + ' m&sup2;' : '',
      imp.type].filter(Boolean).join(' &middot; ');
    return '<div class="pop">' +
      '<div class="pop-foto conta-' + Math.min(foto.length, 2) + '">' + miniature + '</div>' +
      '<p class="pop-code">' + testo(imp.code) + '</p>' +
      '<p class="pop-pos">' + testo(imp.pos) + '</p>' +
      '<p class="pop-dati">' + dati + '</p>' +
      '</div>';
  }

  /* ---------- galleria a tutto schermo ---------------------------------------
     Una sola, creata alla prima apertura. Si sfoglia con le frecce (a schermo e
     da tastiera) e col dito; si chiude con la x, con Esc o cliccando fuori dalla
     foto. Mentre e aperta la pagina sotto non scorre e il fuoco resta dentro. */
  var galleria = null;
  var inGalleria = { imp: null, i: 0, daDove: null };

  function costruisciGalleria() {
    galleria = document.createElement('div');
    galleria.className = 'galleria';
    galleria.hidden = true;
    galleria.setAttribute('role', 'dialog');
    galleria.setAttribute('aria-modal', 'true');
    galleria.setAttribute('aria-label', 'Foto dell\'impianto');
    galleria.innerHTML =
      '<button type="button" class="galleria-chiudi" aria-label="Chiudi">&times;</button>' +
      '<button type="button" class="galleria-freccia prec" aria-label="Foto precedente">&lsaquo;</button>' +
      '<figure><img alt=""><figcaption>' +
        '<span class="g-code"></span><span class="g-pos"></span><span class="g-conta"></span>' +
      '</figcaption></figure>' +
      '<button type="button" class="galleria-freccia succ" aria-label="Foto successiva">&rsaquo;</button>';
    document.body.appendChild(galleria);

    galleria.querySelector('.galleria-chiudi').addEventListener('click', chiudiGalleria);
    galleria.querySelector('.prec').addEventListener('click', function () { sfoglia(-1); });
    galleria.querySelector('.succ').addEventListener('click', function () { sfoglia(1); });
    // clic sul fondo, non sulla foto: chiude
    galleria.addEventListener('click', function (e) { if (e.target === galleria) chiudiGalleria(); });

    galleria.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); chiudiGalleria(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); sfoglia(-1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); sfoglia(1); }
      else if (e.key === 'Tab') {
        // il fuoco gira fra i pulsanti visibili della galleria e non esce
        var tasti = [].slice.call(galleria.querySelectorAll('button')).filter(function (b) { return !b.hidden; });
        var ora = tasti.indexOf(document.activeElement);
        var dopo = e.shiftKey ? (ora <= 0 ? tasti.length - 1 : ora - 1) : (ora + 1) % tasti.length;
        e.preventDefault();
        tasti[dopo].focus();
      }
    });

    // Scorrimento col dito: solo in orizzontale (touch-action: pan-y nel CSS),
    // e pointercancel azzera, altrimenti un gesto interrotto sfoglierebbe dopo.
    var figura = galleria.querySelector('figure');
    var partenza = null;
    figura.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') partenza = e.clientX;
    });
    figura.addEventListener('pointerup', function (e) {
      if (partenza === null) return;
      var dx = e.clientX - partenza;
      partenza = null;
      if (Math.abs(dx) > 40) sfoglia(dx < 0 ? 1 : -1);
    });
    figura.addEventListener('pointercancel', function () { partenza = null; });
  }

  function apriGalleria(imp, i, daDove) {
    if (!imp || !imp.photos || !imp.photos.length) return;
    if (!galleria) costruisciGalleria();
    inGalleria = { imp: imp, i: i || 0, daDove: daDove || document.activeElement };
    var piuFoto = imp.photos.length > 1;
    galleria.querySelector('.prec').hidden = !piuFoto;
    galleria.querySelector('.succ').hidden = !piuFoto;
    mostraFoto();
    galleria.hidden = false;
    document.documentElement.classList.add('galleria-aperta');
    galleria.querySelector('.galleria-chiudi').focus();
  }

  function sfoglia(passo) {
    var imp = inGalleria.imp;
    if (!imp || imp.photos.length < 2) return;
    inGalleria.i = (inGalleria.i + passo + imp.photos.length) % imp.photos.length;
    mostraFoto();
  }

  function mostraFoto() {
    var imp = inGalleria.imp;
    var img = galleria.querySelector('img');
    // gli impianti a catalogo stanno in assets/foto/impianti/, quelli in evidenza
    // in una cartella loro: chi ce l'ha se la porta dietro
    img.src = (imp.cartella || 'assets/foto/impianti/') + imp.photos[inGalleria.i];
    img.alt = 'Impianto ' + imp.code + ' in ' + imp.pos + ', Napoli';
    galleria.querySelector('.g-code').textContent = imp.code;
    galleria.querySelector('.g-pos').textContent = imp.pos;
    galleria.querySelector('.g-conta').textContent =
      imp.photos.length > 1 ? (inGalleria.i + 1) + ' / ' + imp.photos.length : '';
  }

  function chiudiGalleria() {
    if (!galleria || galleria.hidden) return;
    galleria.hidden = true;
    document.documentElement.classList.remove('galleria-aperta');
    // il fuoco torna dove era: la miniatura nel popup, se c'e ancora
    var daDove = inGalleria.daDove;
    if (daDove && document.contains(daDove) && daDove.focus) daDove.focus();
  }

  function autoportante(imp) {
    return imp.type === 'Stand alone';
  }

  function migliaia(n) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  function voce(numero, etichetta) {
    return '<li><span class="conta-n">' + numero + '</span>' +
           '<span class="conta-e">' + etichetta + '</span></li>';
  }

  /* L'elenco puo non esserci (file dati non ancora generato): non e un errore,
     la pagina resta in piedi con la mappa vuota e nessuna scheda. */
  function elenco() {
    return Array.isArray(window.SMHUB_IMPIANTI) ? window.SMHUB_IMPIANTI : [];
  }

  function testo(v) {
    return String(v == null ? '' : v)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
})();
