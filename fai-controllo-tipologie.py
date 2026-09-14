# -*- coding: utf-8 -*-
"""
Genera controllo-tipologie.html: un foglio di revisione con la foto di ogni
impianto accanto alla tipologia che ha oggi nell'xlsx.

Serve per una cosa sola: guardare le foto e decidere quali impianti hanno un
telaio proprio (stand alone) e quali stanno su un edificio. Le correzioni poi
si fanno nell'xlsx di Diesse Media, non qui.

USO:  python fai-controllo-tipologie.py
      poi apri  http://localhost:8792/controllo-tipologie.html
      (oppure apri il file con un doppio-click)

Il file non entra nel sito pubblicato: e escluso da .gitignore.
"""
import io, json, os, re

QUI = os.path.dirname(os.path.abspath(__file__))
DATI = os.path.join(QUI, 'js', 'impianti-data.js')
FUORI = os.path.join(QUI, 'controllo-tipologie.html')


def main():
    if not os.path.exists(DATI):
        print('ERRORE: manca js/impianti-data.js. Lancia prima AGGIORNA_IMPIANTI.bat')
        return
    testo = io.open(DATI, encoding='utf-8').read()
    impianti = json.loads(re.search(r'\[.*\]', testo, re.S).group(0))

    schede = []
    for i in impianti:
        foto = ('<img loading="lazy" src="assets/foto/impianti/%s" alt="">' % i['photos'][0]
                if i.get('photos') else '<div class="senzafoto">nessuna foto</div>')
        schede.append(
            '<article>%s<div class="d">'
            '<p class="c">%s</p><p class="t">%s</p><p class="p">%s</p>'
            '<p class="f">%s%s</p></div></article>'
            % (foto, i['code'], i.get('type') or '—', i.get('pos') or '',
               i.get('dim') or '', ' · %s m²' % i['sqm'] if i.get('sqm') else ''))

    conta = {}
    for i in impianti:
        conta[i.get('type') or '—'] = conta.get(i.get('type') or '—', 0) + 1
    riassunto = ' · '.join('%s: %d' % (t, n) for t, n in sorted(conta.items(), key=lambda x: -x[1]))

    html = '''<!DOCTYPE html>
<html lang="it"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>SM HUB — controllo delle tipologie</title>
<style>
 body{margin:0;background:#2f3742;color:#f5f8fb;font:15px/1.5 system-ui,sans-serif}
 header{padding:28px 32px;border-bottom:1px solid #55616f;position:sticky;top:0;background:#2f3742;z-index:2}
 h1{margin:0 0 8px;font-size:24px;letter-spacing:-.02em}
 header p{margin:0;color:#bfc9d4;max-width:80ch}
 .conta{margin-top:10px;font-family:ui-monospace,monospace;font-size:12px;color:#009ee4;
   letter-spacing:.08em;text-transform:uppercase}
 main{display:grid;gap:1px;background:#55616f;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));
   border-top:1px solid #55616f}
 article{background:#2f3742}
 img,.senzafoto{width:100%;aspect-ratio:16/9;object-fit:cover;display:block;background:#363f4b}
 .senzafoto{display:flex;align-items:center;justify-content:center;color:#8d99a8;font-size:13px}
 .d{padding:14px 16px 18px}
 .c{margin:0;font-family:ui-monospace,monospace;font-size:12px;letter-spacing:.14em;color:#009ee4}
 .t{margin:6px 0 0;font-size:19px;font-weight:600}
 .p{margin:6px 0 0;color:#bfc9d4;font-size:14px}
 .f{margin:8px 0 0;font-family:ui-monospace,monospace;font-size:12px;color:#8d99a8}
</style></head><body>
<header>
 <h1>Quali di questi hanno un telaio proprio?</h1>
 <p>Sotto ogni foto c'è la tipologia che l'impianto ha <strong>oggi</strong> nell'Excel. Serve
 correggere quelli che in realtà sono <strong>stand alone</strong>, cioè autoportanti e non
 appoggiati a un edificio. Le correzioni vanno fatte nella colonna <code>type</code> di
 <code>maxi-impianti.xlsx</code>, poi basta ri-lanciare AGGIORNA_IMPIANTI.bat.</p>
 <p class="conta">''' + riassunto + '''</p>
</header>
<main>
''' + '\n'.join(schede) + '''
</main></body></html>
'''
    io.open(FUORI, 'w', encoding='utf-8', newline='\n').write(html)
    print('Fatto: controllo-tipologie.html (%d impianti).' % len(impianti))
    print('Aprilo su  http://localhost:8792/controllo-tipologie.html')


if __name__ == '__main__':
    main()
