# -*- coding: utf-8 -*-
"""
Genera prova-hero.html: quattro impaginazioni del payoff al centro della home,
ognuna a pagina intera e con le foto degli impianti che scorrono sul fondo.

Si scorre la pagina e si vede ogni variante come sarebbe davvero, con le
immagini che cambiano sotto. Serve a scegliere guardando.

Il problema da risolvere e che il testo al centro deve reggere anche quando
sotto passa una foto chiara, SENZA spegnere la foto con un velo pesante.
Qui la leggibilita viene da un'ombra morbida attaccata alle lettere e da un
alone scuro solo dietro il testo, non da una tenda stesa su tutta l'immagine.

USO:  python fai-prova-hero.py
      poi apri  http://localhost:8792/prova-hero.html

Il file generato non entra nel sito pubblicato: e escluso da .gitignore.
"""
import io, json, os, re

QUI = os.path.dirname(os.path.abspath(__file__))
LOGO = os.path.join(QUI, 'assets', 'logo-smhub.svg')
DATI = os.path.join(QUI, 'js', 'impianti-data.js')
FUORI = os.path.join(QUI, 'prova-hero.html')

PAYOFF_1 = 'Dove i brand'
PAYOFF_2 = 'incontrano la città'
SOTTO = 'Maxi affissioni e grandi formati a Napoli'


def marchio(sigla):
    svg = io.open(LOGO, encoding='utf-8').read()
    svg = re.sub(r'<\?xml.*?\?>', '', svg, flags=re.S).strip()
    svg = svg.replace('clip_1', 'clip_' + sigla)
    svg = svg.replace('<svg ', '<svg class="marchio" aria-hidden="true" focusable="false" ', 1)
    return re.sub(r'\swidth="[\d.]+"\s+height="[\d.]+"', '', svg, count=1)


def foto():
    testo = io.open(DATI, encoding='utf-8').read()
    impianti = json.loads(re.search(r'\[.*\]', testo, re.S).group(0))
    conFoto = [i for i in impianti if i.get('photos')]
    conFoto.sort(key=lambda i: -(i.get('sqm') or 0))
    return [i['photos'][0] for i in conFoto]


def sequenza(nomi, sigla):
    slide = ''.join(
        '<div class="slide%s"><img src="assets/foto/impianti/%s" alt=""></div>'
        % (' on' if n == 0 else '', f) for n, f in enumerate(nomi))
    return '<div class="media" data-seq="%s">%s</div>' % (sigla, slide)


def main():
    tutte = foto()
    gruppi = [tutte[0:3], tutte[3:6], tutte[6:9], tutte[9:12]]

    varianti = [
        ('1', 'Monumentale',
         'Il payoff prende tutto il centro, grande quanto basta a leggersi da lontano. '
         'Velo leggero e uniforme: la foto si vede tutta, il testo sta in piedi grazie '
         'all ombra morbida.',
         '''<div class="centro v1">
              <h1>%s<br><em>%s</em></h1>
              <p class="sotto">%s</p>
            </div>''' % (PAYOFF_1, PAYOFF_2, SOTTO)),

        ('2', 'Fascia',
         'Una banda orizzontale attraversa la foto a meta altezza e porta il payoff in '
         'maiuscolo spaziato. Sopra e sotto l immagine resta pulita: e la variante che '
         'fa risaltare di piu la fotografia.',
         '''<div class="fascia v2">
              <p class="mono">%s %s</p>
            </div>
            <p class="sotto fuori">%s</p>''' % (PAYOFF_1, PAYOFF_2, SOTTO)),

        ('3', 'Manifesto',
         'Marchio e payoff impilati al centro come su un poster, dentro un alone scuro '
         'che sfuma nella foto. Il piu vicino a una pagina pubblicitaria.',
         '''<div class="centro v3">
              <div class="alone">
                %s
                <h1>%s<br>%s</h1>
                <p class="sotto">%s</p>
              </div>
            </div>''' % (marchio('v3'), PAYOFF_1, PAYOFF_2, SOTTO)),

        ('4', 'Sospesa',
         'Payoff piu contenuto, due filetti che attraversano lo schermo e lo tengono in '
         'sospensione. Velo quasi assente: comanda l immagine, il testo la accompagna.',
         '''<div class="centro v4">
              <span class="filo"></span>
              <h1>%s <em>%s</em></h1>
              <span class="filo"></span>
              <p class="sotto">%s</p>
            </div>''' % (PAYOFF_1, PAYOFF_2, SOTTO)),
    ]

    sezioni = []
    for (sigla, nome, nota, corpo), nomi in zip(varianti, gruppi):
        sezioni.append(
            '<section class="prova p%s">%s<div class="velo"></div>'
            '<p class="etichetta">%s — %s</p>%s<p class="nota">%s</p></section>'
            % (sigla, sequenza(nomi, sigla), sigla, nome.upper(), corpo, nota))

    html = '''<!DOCTYPE html>
<html lang="it"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>SM HUB — il payoff al centro della home</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&family=Instrument+Serif&display=swap" rel="stylesheet">
<style>
 :root{--fondo:#2f3742;--filo:#6b7887;--tenue:#b7c1cc;--testo:#f5f8fb;--accento:#009ee4;
   --mono:"IBM Plex Mono",monospace;--serif:"Instrument Serif",Georgia,serif;
   --sans:"Archivo",system-ui,sans-serif;
   --ombra:0 2px 30px rgba(0,0,0,.5), 0 1px 4px rgba(0,0,0,.4)}
 *{box-sizing:border-box}
 [hidden]{display:none!important}   /* .prova ha un display: senza questo l attributo non basta */
 body{margin:0;background:var(--fondo);color:var(--testo);font-family:var(--sans)}
 h1{margin:0;font-weight:400}
 p{margin:0}

 .prova{position:relative;min-height:100dvh;display:flex;flex-direction:column;
   align-items:center;justify-content:center;overflow:hidden;border-bottom:1px solid var(--filo)}
 .media{position:absolute;inset:0;z-index:0;background:#222}
 .slide{position:absolute;inset:0;opacity:0;transition:opacity 1.2s linear}
 .slide.on{opacity:1}
 .slide img{width:100%;height:100%;object-fit:cover;display:block}
 .velo{position:absolute;inset:0;z-index:1}
 /* solo i blocchi del contenuto entrano nel flusso sopra la foto: etichetta e
    nota restano ancorate agli angoli, altrimenti finiscono sopra il payoff */
 .prova > .centro,.prova > .fascia,.prova > .sotto{position:relative;z-index:2}

 .etichetta{position:absolute;top:26px;left:30px;z-index:3;font-family:var(--mono);
   font-size:11px;letter-spacing:.22em;color:#fff;text-shadow:var(--ombra)}
 .nota{position:absolute;bottom:26px;left:30px;right:30px;z-index:3;max-width:74ch;
   font-size:13px;color:#e7edf4;text-shadow:var(--ombra);line-height:1.5}
 .sotto{font-family:var(--mono);font-size:12px;letter-spacing:.2em;text-transform:uppercase;
   color:#e7edf4;text-shadow:var(--ombra)}
 .centro{text-align:center;padding:0 24px}

 /* 1 — MONUMENTALE: velo uniforme leggero, tipografia grande */
 .p1 .velo{background:linear-gradient(180deg,rgba(20,26,34,.42),rgba(20,26,34,.52))}
 .v1 h1{font-family:var(--serif);font-size:clamp(40px,7.6vw,118px);line-height:1.02;
   letter-spacing:0;text-shadow:var(--ombra)}
 .v1 h1 em{font-style:normal;color:#fff}
 .v1 .sotto{margin-top:30px}

 /* 2 — FASCIA: l immagine resta scoperta sopra e sotto */
 .p2 .velo{background:linear-gradient(180deg,rgba(20,26,34,.30),rgba(20,26,34,.18) 40%,rgba(20,26,34,.55))}
 .fascia{width:100%;background:rgba(18,24,32,.76);border-top:1px solid rgba(255,255,255,.16);
   border-bottom:1px solid rgba(255,255,255,.16);padding:clamp(26px,4.4vh,50px) 24px;text-align:center}
 .fascia .mono{font-family:var(--mono);font-size:clamp(13px,1.9vw,27px);letter-spacing:.24em;
   text-transform:uppercase;line-height:1.5}
 .fuori{margin-top:30px}

 /* 3 — MANIFESTO: alone scuro sfumato solo dietro al blocco */
 .p3 .velo{background:linear-gradient(180deg,rgba(20,26,34,.30),rgba(20,26,34,.45))}
 .alone{padding:clamp(40px,7vh,86px) clamp(30px,7vw,110px);
   background:radial-gradient(60% 60% at 50% 50%,rgba(14,19,26,.82),rgba(14,19,26,0) 72%)}
 .v3 .marchio{width:74px;height:74px;color:#fff;margin:0 auto 26px;display:block;
   filter:drop-shadow(0 2px 14px rgba(0,0,0,.6))}
 .v3 h1{font-family:var(--serif);font-size:clamp(34px,5.6vw,86px);line-height:1.05;
   text-shadow:var(--ombra)}
 .v3 .sotto{margin-top:24px}

 /* 4 — SOSPESA: velo quasi assente, filetti a tutta larghezza */
 .p4 .velo{background:linear-gradient(180deg,rgba(20,26,34,.22),rgba(20,26,34,.14) 45%,rgba(20,26,34,.46))}
 .v4{width:100%;display:flex;flex-direction:column;align-items:center;gap:26px}
 .v4 .filo{width:min(1100px,86vw);height:1px;background:rgba(255,255,255,.45)}
 .v4 h1{font-family:var(--serif);font-size:clamp(30px,4.6vw,70px);line-height:1.1;
   text-shadow:var(--ombra);padding:0 24px}
 .v4 h1 em{font-style:normal;color:#fff}
 .v4 .sotto{margin-top:4px}
</style></head><body>
''' + '\n'.join(sezioni) + '''
<script>
 document.querySelectorAll('.media').forEach(function (media) {
   var slide = [].slice.call(media.querySelectorAll('.slide'));
   if (slide.length < 2) return;
   var i = 0;
   setInterval(function () {
     if (document.hidden) return;
     slide[i].classList.remove('on');
     i = (i + 1) % slide.length;
     slide[i].classList.add('on');
   }, 4200);
 });
</script>
</body></html>
'''
    io.open(FUORI, 'w', encoding='utf-8', newline='\n').write(html)
    print('Fatto: prova-hero.html (4 varianti a pagina intera).')
    print('Aprilo su  http://localhost:8792/prova-hero.html')


if __name__ == '__main__':
    main()
