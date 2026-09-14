/* SMHUB - comportamenti di pagina: sequenza fotografica, menu, mappa di copertura.
   Direzione blueprint: il movimento e ridotto al minimo, niente contenuti nascosti
   in attesa di un observer (regola: nessun elemento parte da opacity 0). */
(function () {
  'use strict';

  var pocoMoto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- sequenza fotografica dell'hero -------------------------------
     Non e un file video: sono le foto degli impianti in dissolvenza.
     Aggiungere un impianto significa aggiungere una foto. */
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

    // IMPIANTI: elenco da popolare con i dati reali (codice, lat, lon)
    var IMPIANTI = [];
    var nota = document.querySelector('.mappa-nota');
    if (IMPIANTI.length) {
      var gruppo = L.featureGroup();
      IMPIANTI.forEach(function (imp) {
        L.circleMarker([imp.lat, imp.lon], {
          radius: 6, color: '#009ee4', weight: 2, fillColor: '#009ee4', fillOpacity: 0.6
        }).bindPopup(imp.codice).addTo(gruppo);
      });
      gruppo.addTo(mappa);
      mappa.fitBounds(gruppo.getBounds().pad(0.15));
      if (nota) nota.textContent = IMPIANTI.length + ' impianti sulla mappa';
    }
  }
})();
