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

**Su schermo verticale** (telefoni, tablet in piedi) l'impaginazione cambia: una foto 16:9 a tutto
schermo verrebbe tagliata ai lati fino a una striscia centrale, e l'impianto, spesso di lato, uscirebbe
dall'inquadratura. Li la foto sta **intera in alto** (16:9, senza tagli e senza velo) e fascia, riga e
pulsanti scendono sotto, sul fondo acciaio. Regola: `@media (orientation:portrait) and (max-width:1100px)`.

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

- Scelta del carattere dei titoli fra le quattro varianti in barra (poi togliere l'interruttore).
- Testi commerciali di SM HUB: oggi le schede portano i dati tecnici, manca il racconto (perche quella
  posizione vale, cosa ci si vede intorno).
- Verifica delle posizioni riscritte automaticamente: qualche abbreviazione puo essere uscita male.
- Recapiti reali: email, telefono, indirizzo, partita IVA (nel piede e nel pulsante contatti).
- Pagine interne (impianti, contatti) e pagine legali (privacy, cookie) quando si decide la struttura.
- Dominio e pubblicazione.

## Anteprima locale

Configurazione `sito-smhub` in `.claude/launch.json`, porta 8792.
