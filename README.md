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

### Interruttori provvisori

Nella barra in alto c'e un gruppo `.tema` con i tre pulsanti Scuro, Medio e Chiaro: serve solo a scegliere,
la preferenza resta in `localStorage` come `smhubTema`. **Quando il fondo e deciso**: togliere il
`<div class="tema">` da `index.html`, togliere il blocco dell'interruttore da `js/site.js` e lasciare
nel CSS la sola palette scelta, spostandone i valori dentro `:root`.

Accanto c'e un secondo gruppo, `.carattere`, con quattro pulsanti per il **carattere dei titoli**:

| Pulsante | Carattere | Come si comporta |
|---|---|---|
| Ora | Archivo 600 | quello di partenza: grotesca stretta, peso alto, titoli fino a 138px |
| Serif | Newsreader 400 | grazie editoriali, la piu calda e discorsiva |
| Alta | Instrument Serif 400 | grazie sottili, lettere strette e alte, la piu scultorea |
| Sans | Inter Tight 500 | resta senza grazie ma molto meno gridata (cambia anche il testo corrente) |

Ogni variante non cambia solo la famiglia: porta con se **peso, crenatura, interlinea e scala** del
titolo, perche un lettering signorile si ottiene anche alleggerendo peso e corpo. Le leve sono quattro
variabili in `:root` (`--titolo-peso`, `--titolo-tracking`, `--titolo-interlinea`, `--titolo-scala`)
usate da `h1, h2, h3`; la scala moltiplica i `clamp()` esistenti, quindi i rapporti fra i corpi restano.
La preferenza resta in `localStorage` come `smhubCarattere`.

**Quando il carattere e deciso**: togliere il `<div class="carattere">` da `index.html`, togliere il
blocco dell'interruttore da `js/site.js`, portare i valori della variante scelta dentro `:root` ed
eliminare dal `<link>` dei Google Fonts le famiglie non usate (restano due: titoli e monospaziato).

## File

```
index.html        pagina unica (hero, servizi, copertura, scheda impianto, contatti)
css/style.css     sistema visivo completo
assets/logo-smhub.svg  marchio vettoriale (inserito in linea nel markup)
js/site.js        hero, menu mobile, mappa Leaflet, elenco delle schede
js/impianti-data.js    GENERATO: gli impianti (non modificare a mano)
build-impianti.py      genera i dati dall'xlsx di Diesse Media
AGGIORNA_IMPIANTI.bat  doppio-click per rigenerare tutto
assets/foto/impianti/  GENERATE: foto copiate dal sito Diesse Media
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

## Gli impianti: da dove arrivano i dati

SM HUB e Diesse Media sono **due soggetti autonomi**, ma i maxi impianti sono gli stessi. Per non
mantenere due elenchi che divergono, l'inventario vive in **un solo file**: `maxi-impianti.xlsx` nella
cartella del sito Diesse Media, qui accanto. Da quello si generano i dati di tutti e due i siti.

```
../sito-diessemedia/maxi-impianti.xlsx
        |
        |--> build-maxi-data.py   -> sito Diesse Media
        +--> build-impianti.py    -> SM HUB (js/impianti-data.js + assets/foto/impianti/)
```

**Per aggiornare gli impianti**: si corregge l'xlsx (nella cartella di Diesse Media), poi doppio-click
su `AGGIORNA_IMPIANTI.bat`. Lo script rigenera `js/impianti-data.js`, copia le foto che servono e
cancella quelle rimaste orfane. Da qui si alimentano da soli: i riquadri dell'hero, il riepilogo
(impianti, metri quadri, illuminati), l'elenco delle schede e i segnaposti sulla mappa.
**Non si scrive nessun dato a mano nel sito.**

### Chi va su quale sito

Oggi entrano tutti gli impianti. Quando qualcuno dovra restare **solo** su SM HUB (o solo su Diesse
Media), si aggiunge all'xlsx una colonna `sito`:

| Valore | Significato |
|---|---|
| *(vuoto)* | sta su tutti e due i siti — comportamento di oggi |
| `sm` | solo SM HUB |
| `dm` | solo Diesse Media (non compare qui) |
| `dm+sm` | tutti e due, scritto in chiaro |

Finche la colonna non esiste, non cambia niente. Lo script di Diesse Media ignora le colonne che non
conosce, quindi aggiungerla non rompe l'altro sito.

### Cosa NON viene portato su SM HUB

Le colonne `pdf` (presentazioni su Drive) e `link_web` (schede su diessemedia.it) sono a marchio
Diesse Media e restano fuori. Se serviranno presentazioni anche qui, vanno rifatte a marchio SM HUB.

### Come vengono riscritte le posizioni

Nell'xlsx le posizioni sono in maiuscolo e abbreviate (`VIA MARINA ANG.GIANTURCO DIR.CENTRO`). Lo
script le rende leggibili (`Via Marina angolo Gianturco direzione Centro`): e il primo pezzo del taglio
autonomo di SM HUB, visto che il dato e lo stesso ma il modo di presentarlo no. Le tabelle `SIGLE`,
`MINUSCOLE` e `ABBREVIAZIONI` in cima a `build-impianti.py` si correggono a mano se una parola esce male.

## Da completare

- Scelta del carattere dei titoli fra le quattro varianti in barra (poi togliere l'interruttore).
- Testi commerciali di SM HUB: oggi le schede portano i dati tecnici, manca il racconto (perche quella
  posizione vale, cosa ci si vede intorno).
- Verifica delle posizioni riscritte automaticamente: qualche abbreviazione puo essere uscita male.
- Recapiti reali: email, telefono, indirizzo, partita IVA (nel piede e nel pulsante contatti).
- Pagine interne (impianti, contatti) e pagine legali (privacy, cookie) quando si decide la struttura.
- Dominio e pubblicazione.

## Anteprima locale

Configurazione `sito-smhub` in `.claude/launch.json`, porta 8792.
