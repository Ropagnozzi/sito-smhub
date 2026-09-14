# -*- coding: utf-8 -*-
"""
Genera lockup-payoff.html: il payoff impaginato sotto e accanto al marchio vero,
nei caratteri e nei colori del sito, per decidere guardando invece che leggendo.

Il logo viene inserito in linea (non come <img>) perche la parola "hub" e in
currentColor: solo cosi eredita il colore del testo.

USO:  python fai-lockup.py
      poi apri  http://localhost:8792/lockup-payoff.html

Il file generato non entra nel sito pubblicato: e escluso da .gitignore.
"""
import io, os, re

QUI = os.path.dirname(os.path.abspath(__file__))
LOGO = os.path.join(QUI, 'assets', 'logo-smhub.svg')
FUORI = os.path.join(QUI, 'lockup-payoff.html')

PAYOFF = 'Dove i brand incontrano la città'


def marchio(classe='m'):
    """Il logo in linea, con gli id del clipPath resi unici per ogni copia."""
    svg = io.open(LOGO, encoding='utf-8').read()
    svg = re.sub(r'<\?xml.*?\?>', '', svg, flags=re.S).strip()
    unico = 'clip_' + classe
    svg = svg.replace('clip_1', unico)
    svg = svg.replace('<svg ', '<svg class="marchio" aria-hidden="true" focusable="false" ', 1)
    svg = re.sub(r'\swidth="[\d.]+"\s+height="[\d.]+"', '', svg, count=1)
    return svg


def main():
    m = marchio
    blocchi = [
        ('A — firma verticale, monospaziato',
         'Il payoff sotto il marchio, in mono maiuscolo con la spaziatura delle etichette '
         'del sito. E la versione piu sobria: sembra una targa, non uno slogan.',
         '<div class="lk lk-vert">%s<p class="mono">%s</p></div>' % (m('a'), PAYOFF)),

        ('B — firma verticale, carattere dei titoli',
         'Stesso impianto ma col carattere dei titoli: piu caldo, piu da marchio '
         'e meno da etichetta tecnica.',
         '<div class="lk lk-vert">%s<p class="serif">%s</p></div>' % (m('b'), PAYOFF)),

        ('C — orizzontale con filetto',
         'Marchio e payoff affiancati, divisi da una linea verticale. E il lockup da '
         'carta intestata, firma email, piede di presentazione.',
         '<div class="lk lk-oriz">%s<span class="filo"></span><p class="mono due-righe">'
         'Dove i brand<br>incontrano la città</p></div>' % m('c')),

        ('D — payoff grande, marchio piccolo',
         'Qui il payoff fa da titolo e il marchio firma in basso: e l uso da copertina, '
         'apertura di presentazione o pagina pubblicitaria.',
         '<div class="lk lk-titolo"><p class="grande">Dove i brand<br>incontrano '
         '<em>la città</em></p><div class="firma">%s</div></div>' % m('d')),

        ('E — con il punto esclamativo',
         'La stessa frase come l hai scritta. Il punto esclamativo alza la voce: '
         'guadagna energia, perde un po della sicurezza che da il punto fermo.',
         '<div class="lk lk-vert">%s<p class="serif">%s!</p></div>' % (m('e'), PAYOFF)),

        ('F — maiuscolo, blocco compatto',
         'Tutto in maiuscolo su tre righe strette, allineato a sinistra come una '
         'squadratura tecnica. La versione piu dura.',
         '<div class="lk lk-blocco">%s<p class="mono tre-righe">DOVE I BRAND<br>'
         'INCONTRANO<br>LA CITTÀ</p></div>' % m('f')),
    ]

    carte = '\n'.join(
        '<section><h2>%s</h2><p class="nota">%s</p><div class="palco">%s</div></section>'
        % (titolo, nota, corpo) for titolo, nota, corpo in blocchi)

    html = '''<!DOCTYPE html>
<html lang="it"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>SM HUB — il payoff impaginato</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&family=Instrument+Serif&display=swap" rel="stylesheet">
<style>
 :root{--fondo:#2f3742;--fondo2:#363f4b;--filo:#55616f;--tenue:#b7c1cc;--testo:#f5f8fb;
   --muto:#bfc9d4;--accento:#009ee4;
   --mono:"IBM Plex Mono",monospace;--serif:"Instrument Serif",Georgia,serif;
   --sans:"Archivo",system-ui,sans-serif}
 *{box-sizing:border-box}
 body{margin:0;background:var(--fondo);color:var(--testo);font-family:var(--sans);
   background-image:linear-gradient(112deg,rgba(230,242,255,.085) 0%,rgba(0,0,0,0) 46%,rgba(0,0,0,.26) 100%)}
 header{padding:36px 40px 26px;border-bottom:1px solid var(--filo)}
 h1{margin:0;font-size:26px;letter-spacing:-.02em;font-weight:600}
 header p{margin:10px 0 0;color:var(--muto);max-width:76ch}
 section{border-bottom:1px solid var(--filo);padding:30px 40px 44px}
 h2{margin:0;font-family:var(--mono);font-size:11px;letter-spacing:.2em;text-transform:uppercase;
   color:var(--accento);font-weight:500}
 .nota{margin:10px 0 0;color:var(--muto);font-size:14px;max-width:74ch}
 .palco{margin-top:30px;background:var(--fondo2);border:1px solid var(--filo);
   padding:clamp(30px,5vw,64px);display:flex;justify-content:center}
 .marchio{width:64px;height:64px;color:var(--testo);display:block}
 .lk p{margin:0}
 .mono{font-family:var(--mono);font-size:12px;letter-spacing:.22em;text-transform:uppercase;color:var(--tenue)}
 .serif{font-family:var(--serif);font-size:27px;letter-spacing:.005em;color:var(--testo)}

 .lk-vert{display:flex;flex-direction:column;align-items:center;gap:20px;text-align:center}
 .lk-vert .marchio{width:82px;height:82px}

 .lk-oriz{display:flex;align-items:center;gap:22px}
 .lk-oriz .filo{width:1px;align-self:stretch;background:var(--filo)}
 .due-righe{line-height:1.9;letter-spacing:.2em}

 .lk-titolo{text-align:center}
 .grande{font-family:var(--serif);font-size:clamp(34px,5.4vw,62px);line-height:1.06;letter-spacing:0}
 .grande em{font-style:normal;color:var(--accento)}
 .firma{margin-top:34px;display:flex;justify-content:center}
 .lk-titolo .marchio{width:52px;height:52px}

 .lk-blocco{display:flex;align-items:flex-start;gap:26px}
 .lk-blocco .marchio{width:72px;height:72px}
 .tre-righe{line-height:2;letter-spacing:.2em;color:var(--testo);font-size:13px;
   border-left:1px solid var(--filo);padding-left:26px}
</style></head><body>
<header>
 <h1>«''' + PAYOFF + '''» impaginato</h1>
 <p>Sei modi di mettere la frase accanto al marchio, con i caratteri e i colori del sito.
 Il marchio e quello vero: la parola «hub» eredita il colore del testo, quindi il lockup
 funziona anche su fondo chiaro.</p>
</header>
''' + carte + '''
</body></html>
'''
    io.open(FUORI, 'w', encoding='utf-8', newline='\n').write(html)
    print('Fatto: lockup-payoff.html')
    print('Aprilo su  http://localhost:8792/lockup-payoff.html')


if __name__ == '__main__':
    main()
