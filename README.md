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
- Tipografia: IBM Plex Mono (payoff, titoli, etichette, dati) e Archivo (testo corrente).

### Interruttore provvisorio

Nella barra in alto c'e un gruppo `.tema` con i tre pulsanti Scuro, Medio e Chiaro: serve solo a scegliere,
la preferenza resta in `localStorage` come `smhubTema`. **Quando il fondo e deciso**: togliere il
`<div class="tema">` da `index.html`, togliere il blocco dell'interruttore da `js/site.js` e lasciare
nel CSS la sola palette scelta, spostandone i valori dentro `:root`.

### Caratteri (deciso il 2026-09-17)

Due soli font, caricati da Google Fonts:

- **IBM Plex Mono**, peso 500, **maiuscolo e spaziato**: payoff dell'hero, tutti i titoli (`h1`, `h2`, `h3`),
  etichette, pulsanti e dati. I titoli usano lo stesso font del payoff, con corpi contenuti: `h2` da 19 a
  32 px, titoli dei servizi da 14 a 18 px. Il peso visivo lo da la spaziatura (`.14em`), non la grandezza.
- **Archivo** per il testo corrente e per gli **indirizzi delle schede** (`.imp h3`), che sono dati da
  leggere: 47 indirizzi in maiuscolo monospaziato sarebbero stati un muro.

L'interruttore provvisorio ORA / SERIF / ALTA / SANS e stato tolto insieme ai tre font di prova
(Newsreader, Instrument Serif, Inter Tight) che la pagina scaricava inutilmente.

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

## L'intro del marchio

Alla prima apertura della sessione il logo compare grande al centro su fondo pieno, **si compone pezzo
per pezzo** (S, M, la sbarra blu che scatta in diagonale, poi "hub") e **vola al suo posto nella barra**
mentre il fondo si dissolve e scopre l'hero; durante il volo si inclina appena e torna dritto prima di
posarsi. Dura circa 3,2 secondi e si salta con un clic, un tasto o uno scroll. Codice in `js/intro.js`.

**Tempi e inclinazione si regolano in cima a `js/intro.js`**: `PEZZO` (comparsa di ogni pezzo),
`PAUSA_FINO_A` (quanto resta fermo al centro), `VOLO` (durata del volo), `INCLINA` (gradi a meta volo,
0 per toglierla) e `ASSESTA` (il piccolo ritorno oltre lo zero). Il timer di sicurezza si ricalcola da solo.

- **Quando parte**: solo la prima volta nella sessione (`sessionStorage`, chiave `smhubIntro`), mai se il
  sistema chiede meno movimento, mai in una scheda aperta in secondo piano. Per rivederla: aggiungere
  **`?intro`** all'indirizzo (oppure aprire una nuova scheda).
- **Come atterra**: la posizione d'arrivo si misura sul logo vero della barra, quindi vale per qualunque
  schermo (58px su desktop, 46px su telefono). Verificato: scarto 0 pixel.
- **Perche il clone nasce grande e rimpicciolisce**: un SVG ingrandito con `transform` sgrana, uno
  rimpicciolito resta nitido.
- **Perche ogni pezzo sta in un `<g>`**: i path hanno gia un attributo `transform` (la matrice del PDF
  d'origine) e un transform CSS messo su di loro lo cancellerebbe.
- **Perche le classi si chiamano `apre-*`**: `.intro` esiste gia sui paragrafi (`max-width:56ch`) e su
  `<html>` stringerebbe tutta la pagina.

**Tre sicurezze, perche un'intro non deve mai bloccare il sito:**
1. la decisione la prende uno script di una riga nel `<head>`, prima che la pagina si disegni;
2. finche `intro.js` non parte la pagina e coperta da un velo CSS che **si toglie da solo dopo 2,5 s**:
   se lo script non arriva, il sito compare comunque;
3. da quando parte, un timer chiude tutto poco dopo la fine prevista. La chiusura usa la promessa `animation.finished` e
   non l'evento `onfinish`, che viaggia coi fotogrammi e puo arrivare in ritardo.

`intro.js` e caricato in fondo al body **prima di Leaflet e senza `defer`**, cosi parte appena la pagina e
costruita invece di aspettare il file piu lento.

## L'hero

Fotografia a tutta pagina con le immagini degli impianti in dissolvenza, e il payoff dentro una
**fascia orizzontale che attraversa la foto a meta altezza**: sopra e sotto l'immagine resta scoperta,
ed e li che si vede l'impianto. Scelta fra quattro impaginazioni provate a schermo con
`fai-prova-hero.py` (monumentale, fascia, manifesto, sospesa).

Due accorgimenti tengono in piedi il testo senza spegnere la fotografia:

- il velo sulla foto e **leggero** (opacita 0.34 in alto, 0.18 a meta, 0.62 in basso): prima era quasi
  una tenda, e la foto non si vedeva;
- la leggibilita viene da **due ombre sulle lettere** — una stretta che stacca il segno anche sul cielo
  chiaro, una larga che fa da alone — invece che da altro scurimento dell'immagine.

Le tre foto dell'hero **non sono scritte nel markup**: le prende `js/site.js` dai tre impianti piu
grandi con foto. Cosi restano allineate all'inventario e non puntano a un file che lo script potrebbe
cancellare. Se i dati non ci sono, restano i riquadri segnaposto.

La fascia va da un bordo all'altro dello schermo, quindi `.hero` non ha padding orizzontale: il margine
laterale ce l'hanno i singoli blocchi.

**Inquadratura su desktop.** La foto parte **sotto la barra** (la barra e quasi opaca e prima copriva
proprio la parte alta, dove stanno i cartelloni) e il ritaglio e ancorato in alto
(`object-position: 50% 15%`): sui monitor piu larghi del 16:9, come un 1920x1080, la foto perde una
striscia sopra e sotto, e cosi il taglio cade quasi tutto sulla strada.

**La fascia su desktop sta al 66% dell'altezza**, non al centro, per lasciare scoperta la parte alta
della foto: a 1905x912 il cartellone piu alto (Lete, NA40) arriva al 65%. Sugli schermi bassi risale
quanto basta perche pulsanti e quota restino nello schermo (a 1366x640 finisce al 53%). Regola in `css/style.css`, blocco `@media (min-aspect-ratio:4/5)`.

**Su schermo verticale** (telefoni, tablet in piedi) l'impaginazione cambia: una foto 16:9 a tutto
schermo verrebbe tagliata ai lati fino a una striscia centrale, e l'impianto, spesso di lato, uscirebbe
dall'inquadratura. Li la foto sta **intera in alto** (16:9, senza tagli e senza velo) e fascia, riga e
pulsanti scendono sotto, sul fondo acciaio. Regola: `@media (max-aspect-ratio:4/5) and (max-width:1100px)`:
non `orientation:portrait`, perche una finestra del browser affiancata a meta monitor (960x1000) e
verticale per un soffio e prendeva l'impaginazione dei tablet.

**Sui telefoni con le foto verticali** (fino a 600 px, in verticale) l'hero torna a tutto schermo con foto
scattate apposta: classe `.hero-verticale`, messa da `js/site.js` solo se `SMHUB_HERO_MOBILE` non e vuoto.
Fascia, riga e pulsanti scendono in fondo, cosi la meta alta resta libera per i cartelloni; sui telefoni
corti (sotto 720 px di altezza) la riga sparisce e il blocco si compatta. Verificato: la fascia comincia al
67% della foto su 812 px e al 59% su 667 px, sotto tutti i cartelloni delle foto attuali.

- **Dove si mettono**: gli originali in `assets/foto/mobile/` (fuori dal repo, pesano oltre un mega),
  1080 x 2340 px, ordine alfabetico. Istruzioni di inquadratura nel `LEGGIMI.txt` della cartella.
- **Cosa si pubblica**: `AGGIORNA_IMPIANTI.bat` ne fa copie compresse in `assets/foto/hero-mobile/`
  (`hero-01.jpg`...; 5,9 MB diventati 1,4 MB) e le scrive in `js/impianti-data.js`.
- **Tablet e computer** non le usano. Ruotando il telefono la sequenza si ricostruisce.
- **Fascia su telefono**: sfondo nel blu del marchio che sfuma ai lati (al centro #0080ba, perche sul blu
  chiaro il bianco si legge male) con due filetti chiari sfumati; fra fascia, frase e pulsanti c'e piu
  aria (34 e 28 px). Sui telefoni medio-bassi (721-780 px) gli spazi si stringono un poco, sotto i 720 px
  la frase sparisce. Misurato: la fascia parte fra il 58% e il 67% della foto su 375x667, 360x740,
  393x780, 375x800, 375x812 e 390x844, sempre sotto il fondo del cartellone piu basso (Lete, 58%).

## Mappa: zoom, popup e galleria

La mappa e navigabile senza rubare lo scorrimento della pagina:

- **computer**: pulsanti + e -, trascinamento, doppio clic; la rotella ingrandisce **solo con Ctrl**
  (Cmd su Mac), altrimenti scorre la pagina e compare un avviso. Il controllo sta in un ascolto `wheel` in
  fase di cattura, che accende o spegne lo zoom a rotella di Leaflet prima che Leaflet riceva l'evento.
- **schermi touch** (`hover: none` e `pointer: coarse`): un dito scorre la pagina, **due dita** spostano e
  ingrandiscono; con un dito compare "Usa due dita per muovere la mappa". Funziona perche col trascinamento
  spento Leaflet imposta `touch-action: pan-x pan-y` e il pizzico sposta anche la mappa.
- sotto + e - c'e **"Torna a tutti gli impianti"**. Zoom tra 10 e 18.

Per provarlo nel browser integrato (che non disegna fotogrammi) serve una copia della pagina con
`requestAnimationFrame` simulato da un timer, caricata PRIMA di Leaflet: Leaflet si salva la funzione
all'avvio.

Le foto delle **schede** aprono la stessa galleria della mappa; con due foto compare l'etichetta "2 foto".

Ogni **scheda** ha un **filetto blu** (`--accento`, #009ee4, il blu della sbarra del logo) e un filetto
uguale fra foto e testo; le schede sono distanziate. Niente linee di griglia condivise: con il filtro
attivo le caselle vuote dell'ultima riga sarebbero diventate blocchi blu pieni.

Cliccando un segnaposto si apre un popup con le **miniature delle foto** dell'impianto (una a tutta
larghezza, due affiancate; "Foto in arrivo" se non ce ne sono), poi codice, posizione e dati. Ogni
miniatura e un pulsante che apre la **galleria a tutto schermo**:

- si sfoglia con le frecce a schermo, con le frecce della tastiera e scorrendo col dito;
- si chiude con la x, con Esc o cliccando sul fondo (non sulla foto);
- mentre e aperta la pagina sotto non scorre, il fuoco resta dentro e alla chiusura torna sulla miniatura.

Codice in `js/site.js` (`contenutoPopup`, `apriGalleria`), stile in `css/style.css` (`.pop-impianto`,
`.galleria`). Due trappole: i testi del popup hanno il prefisso `.pop-impianto` perche Leaflet da ai `<p>`
dei popup un margine piu specifico di una classe sola; e le miniature non hanno `loading="lazy"`, perche il
popup nasce solo quando lo si apre.

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

### Tipologia e superficie

La colonna `type` separa gli impianti che vivono su un edificio da quelli con **telaio proprio**
(stand alone): e la distinzione che il sito racconta, e alimenta sia il riepilogo sia il filtro sopra
l'elenco. Lo script accetta le varianti (`stand alone`, `standalone`, `autoportante`, `telaio`) e le
riporta tutte a una dicitura sola, quindi non conta come viene digitata.

La colonna `sqm` invece e spesso vuota (21 impianti su 47). Quando manca, la superficie viene
**ricavata da base x altezza** e marcata come stimata: sulla scheda compare con la tilde (`~ 136 m²`).
La regola e stata verificata sui 26 impianti che il dato ce l'hanno e coincide in 25 casi
(l'unico scarto e NA84: 6x12 farebbe 72 mq, l'xlsx dice 70). **Il dato scritto nell'xlsx vince sempre
sul calcolo**: basta riempire la cella e la tilde sparisce da sola.

I formati vengono normalizzati: `9X4.5` e `9x4,5` diventano entrambi `9 x 4,5`, e le misure scritte in
centimetri (`1200x300`) valgono come metri nel calcolo della superficie.

### Cosa NON viene portato su SM HUB

Le colonne `pdf` (presentazioni su Drive) e `link_web` (schede su diessemedia.it) sono a marchio
Diesse Media e restano fuori. Se serviranno presentazioni anche qui, vanno rifatte a marchio SM HUB.

### Come vengono riscritte le posizioni

Nell'xlsx le posizioni sono in maiuscolo e abbreviate (`VIA MARINA ANG.GIANTURCO DIR.CENTRO`). Lo
script le rende leggibili (`Via Marina angolo Gianturco direzione Centro`): e il primo pezzo del taglio
autonomo di SM HUB, visto che il dato e lo stesso ma il modo di presentarlo no. Le tabelle `SIGLE`,
`MINUSCOLE` e `ABBREVIAZIONI` in cima a `build-impianti.py` si correggono a mano se una parola esce male.

## Da completare

- Testi commerciali di SM HUB: oggi le schede portano i dati tecnici, manca il racconto (perche quella
  posizione vale, cosa ci si vede intorno).
- Verifica delle posizioni riscritte automaticamente: qualche abbreviazione puo essere uscita male.
- Recapiti reali: email, telefono, indirizzo, partita IVA (nel piede e nel pulsante contatti).
- Pagine interne (impianti, contatti) e pagine legali (privacy, cookie) quando si decide la struttura.
- Dominio e pubblicazione.

## Pagine legali

`privacy.html` e `cookie.html`, stessa struttura del sito Diesse Media, generate riusando barra e piede
di `index.html` (la barra senza l'interruttore provvisorio, e senza lo script dell'intro: il velo
coprirebbe la pagina). Sono collegate dal piede di tutte le pagine.

Contenuto aderente a quello che il sito fa davvero: nessun cookie proprio, nessuna statistica, nessun
modulo; due sole voci di archiviazione tecnica (`smhubIntro` in sessionStorage, `smhubTema` in
localStorage) e tre risorse di terze parti che ricevono l'IP (Google Fonts, cdnjs/Cloudflare,
OpenStreetMap). **Restano da riempire i segnaposto**: ragione sociale, sede, P.IVA, email.

## Andare online su www.smhub.it (come diessemedia.it)

Dominio e DNS sono su Aruba; la posta e indipendente dal sito (MX su mx.smhub.it, webmail su host
propri), quindi non va toccata. Passi, nell'ordine:

1. riempire i segnaposto dei recapiti in `index.html`, `privacy.html`, `cookie.html`;
2. togliere `CNAME` da `.gitignore`, creare il file `CNAME` con dentro `www.smhub.it`, commit e push
   (come `sito-diessemedia/CNAME`, che contiene `www.diessemedia.it`);
3. su GitHub, Settings -> Pages -> Custom domain: `www.smhub.it`;
4. nel pannello Aruba, nei record DNS del dominio:
   - `www` -> CNAME `ropagnozzi.github.io`
   - dominio nudo `@` -> quattro record A: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`,
     `185.199.111.153`
   - **non toccare MX, webmail, ftp e il TXT di SPF**;
5. attendere la propagazione, poi in Settings -> Pages spuntare **Enforce HTTPS**.

Il punto 5 e quello che era sfuggito con piani.diessemedia.it: finche non si spunta, il certificato
resta quello di `*.github.io` e il browser segnala il sito come non sicuro.

## Anteprima locale

Configurazione `sito-smhub` in `.claude/launch.json`, porta 8792.
