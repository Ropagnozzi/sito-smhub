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
  var vetrina = elenco()
    .filter(function (i) { return i.photos && i.photos.length; })
    .sort(function (a, b) { return (b.sqm || 0) - (a.sqm || 0); });
  [].slice.call(document.querySelectorAll('#sequenza .slide')).forEach(function (slide, i) {
    var imp = vetrina[i];
    if (!imp) return;
    slide.innerHTML = '<img src="assets/foto/impianti/' + imp.photos[0] + '"' +
      (i === 0 ? '' : ' loading="lazy"') + ' decoding="async" alt="">';
  });

  var slides = [].slice.call(document.querySelectorAll('#sequenza .slide'));
  if (slides.length > 1 && !pocoMoto) {
    var indice = 0;
    setInterval(function () {
      if (document.hidden) return;
      slides[indice].classList.remove('on');
      indice = (indice + 1) % slides.length;
      slides[indice].classList.add('on');
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

  /* ---------- interruttore di confronto fra i caratteri dei titoli ----------
     Come quello dei fondi: serve solo a scegliere. Quando il carattere e deciso,
     si toglie il gruppo .carattere dal markup e si portano i valori della variante
     scelta dentro :root nel CSS. "archivo" = nessun attributo, il punto di partenza. */
  var bottoniCarattere = [].slice.call(document.querySelectorAll('.carattere button'));
  if (bottoniCarattere.length) {
    var salvatoC = null;
    try { salvatoC = localStorage.getItem('smhubCarattere'); } catch (e) {}
    var validiC = ['archivo', 'serif', 'alta', 'sans'];
    applicaCarattere(validiC.indexOf(salvatoC) > -1 ? salvatoC : 'archivo');
    bottoniCarattere.forEach(function (b) {
      b.addEventListener('click', function () {
        var c = b.getAttribute('data-carattere');
        applicaCarattere(c);
        try { localStorage.setItem('smhubCarattere', c); } catch (e) {}
      });
    });
  }
  function applicaCarattere(car) {
    if (car === 'archivo') document.documentElement.removeAttribute('data-carattere');
    else document.documentElement.setAttribute('data-carattere', car);
    bottoniCarattere.forEach(function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-carattere') === car ? 'true' : 'false');
    });
  }

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

  /* ---------- mappa di copertura -------------------------------------------
     Mappa reale, senza segnaposti finti: i marker compaiono quando arriva
     l'elenco impianti con le coordinate. */
  var contenitore = document.getElementById('mappa');
  if (contenitore && typeof L !== 'undefined') {
    var mappa = L.map(contenitore, {
      center: [40.8518, 14.2681],
      zoom: 12,
      zoomControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      touchZoom: false,
      keyboard: false
    });
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
        }).bindPopup(
          '<strong>' + testo(imp.code) + '</strong><br>' + testo(imp.pos) +
          '<br>' + testo(imp.dim) + (imp.sqm ? ' &middot; ' + imp.sqm + ' m&sup2;' : '')
        ).addTo(gruppo);
      });
      gruppo.addTo(mappa);
      mappa.fitBounds(gruppo.getBounds().pad(0.15));
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
      var foto = imp.photos && imp.photos.length
        ? '<img loading="lazy" decoding="async" src="assets/foto/impianti/' + imp.photos[0] +
          '" alt="Impianto ' + testo(imp.code) + ' in ' + testo(imp.pos) + ', Napoli">'
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
