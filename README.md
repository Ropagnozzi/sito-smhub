# Sito SMHUB

Sito vetrina per SMHUB (affissioni su poster di medie e grandi dimensioni a Napoli, su palazzi e
strutture stand alone). Statico: HTML, CSS e JavaScript, nessun passaggio di build.

## Direzione di design

**Blueprint industriale.** Squadrature agli angoli come su una tavola tecnica, quote in
monospaziato, tipografia grande e stretta, foto a piena larghezza senza effetti, lamiera illuminata
di traverso. Movimento ridotto al minimo: la sola animazione e la dissolvenza fra le
foto dell'hero.

Regola tenuta ferma: **nessun contenuto parte da `opacity: 0`**. Niente comparse legate a un
observer, quindi niente rischio di sezioni invisibili su schede in secondo piano o browser lenti.

- Fondo: **lamiera di acciaio** in tre gradazioni, commutabili con l'attributo `data-tema`
  sull'elemento `html`: `scuro` (#262c34, brunita), `medio` (#2f3742, predefinita), `chiaro`
  (#3b4552, lucidata). **Nessuna trama**: il fondo e pieno, il rilievo lo danno solo il gradiente
  di illuminazione e i fasci in movimento. Scartati il fondo nero, l'ipotesi blu da cianografia,
  il quadrettato e la spazzolatura verticale.
- Accento unico **blu del marchio** `#009ee4` (variante scura `#0080ba`, testo sopra l'accento
  `#04121f`): e il colore della sbarra diagonale dentro il logo SM Hub, quindi la palette nasce dal
  marchio e non da una scelta arbitraria. L'arancio `#f39000` resta **solo nel logo**.
- Logo: `assets/logo-smhub.svg`, vettoriale, ricavato da `SM_HUB_LOGO_BLACK.pdf`. I tratti della
  parola "hub" erano neri e sono stati portati a `currentColor`, cosi ereditano il colore del testo
  (bianchi sul fondo scuro, neri se un giorno servira una versione su fondo chiaro). "SM" arancio e
  sbarra blu restano i colori originali. Nel markup e inserito in linea, in barra e nel piede.
- Nessun quadrettato: al posto della griglia a vista c'e una **luce radente**, due fasci diagonali
  in fusione `screen` piu una lama speculare stretta e piu veloce, che scorrono con la pagina (`animation-timeline: scroll(root block)`), piu un
  rilievo fisso sul fondo che illumina la lamiera da sinistra.
  Trappola da ricordare: la scorciatoia `animation:` impone durata `0s` e con una timeline di scroll
  il fascio resta immobile. Serve `animation-duration: auto` scritto a parte.
  Dove le scroll-driven animation non ci sono (Safari, Firefox) i fasci scorrono da soli in loop;
  con `prefers-reduced-motion` restano fermi.
- Nessun raggio di curvatura: tutto spigolo vivo.
- Tipografia: Archivo (titoli) e IBM Plex Mono (dati e etichette).

### Interruttore provvisorio

Nella barra in alto c'e un gruppo `.tema` con i tre pulsanti Scuro, Medio e Chiaro: serve solo a scegliere,
la preferenza resta in `localStorage` come `smhubTema`. **Quando il fondo e deciso**: togliere il
`<div class="tema">` da `index.html`, togliere il blocco dell'interruttore da `js/site.js` e lasciare
nel CSS la sola palette scelta, spostandone i valori dentro `:root`.

## File

```
index.html        pagina unica (hero, servizi, copertura, scheda impianto, contatti)
css/style.css     sistema visivo completo
assets/logo-smhub.svg  marchio vettoriale (inserito in linea nel markup)
js/site.js        sequenza fotografica, menu mobile, mappa Leaflet
assets/foto/      foto degli impianti (da caricare)
```

## Come inserire le foto

Nell'hero ci sono tre riquadri con la misura richiesta al posto delle foto. Per sostituirli, in
`index.html` cambiare ogni blocco

```html
<div class="slide on"><div class="slot"><span>Foto impianto 01 ...</span></div></div>
```

con

```html
<div class="slide on"><img src="assets/foto/impianto-01.jpg" alt="Impianto SMHUB in ..."></div>
```

Le foto vanno in orizzontale, minimo 1920 x 1080. Aggiungere un impianto significa aggiungere un
blocco: la sequenza gira da sola su quante slide trova.

## Come accendere i segnaposti sulla mappa

In `js/site.js` la costante `IMPIANTI` e vuota. Popolandola i marker compaiono da soli, la mappa si
inquadra sui punti e la nota in basso a sinistra passa da "in caricamento" al numero di impianti.

```js
var IMPIANTI = [
  { codice: 'NA-014 Via Marina', lat: 40.8412, lon: 14.2712 }
];
```

Le tile sono OpenStreetMap senza chiave, rese scure invertendo il pannello via CSS. Le tile scure
di CARTO ora richiedono una API key, per questo non sono usate.

## Da completare

- Foto degli impianti (hero, scheda, sezione servizi).
- Elenco impianti con codice, indirizzo, formato, tipologia e coordinate.
- Recapiti reali: email, telefono, indirizzo, partita IVA (nel piede e nel pulsante contatti).
- Pagine interne (impianti, contatti) e pagine legali (privacy, cookie) quando si decide la struttura.
- Dominio e pubblicazione.

## Anteprima locale

Configurazione `sito-smhub` in `.claude/launch.json`, porta 8792.
