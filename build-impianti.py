# -*- coding: utf-8 -*-
"""
Convertitore: maxi-impianti.xlsx (Diesse Media)  ->  js/impianti-data.js (SM HUB)

SM HUB e Diesse Media sono due soggetti autonomi ma gli impianti maxi sono
gli stessi: l'elenco vive in UN SOLO file, l'xlsx di Diesse Media, e da li
si generano i dati di tutti e due i siti. Cosi un impianto si corregge una
volta sola, e quando un impianto passera solo a SM HUB bastera cambiare una
cella invece di rifare il lavoro a mano.

USO: doppio-click su AGGIORNA_IMPIANTI.bat  (oppure:  python build-impianti.py)

COME SI DECIDE CHI VA SU QUALE SITO
  Nell'xlsx si puo aggiungere una colonna facoltativa "sito":
     vuota      -> l'impianto sta su tutti e due i siti (comportamento di oggi)
     sm         -> solo SM HUB       (da togliere da Diesse Media)
     dm         -> solo Diesse Media (non compare qui)
     dm+sm      -> tutti e due, scritto in chiaro
  Finche la colonna non esiste, qui entrano tutti gli impianti.

COSA NON VIENE PORTATO SU SM HUB (marchiato Diesse Media)
  - la colonna "pdf": le presentazioni su Drive sono a marchio Diesse Media
  - la colonna "link_web": rimanda alle schede su diessemedia.it
  Se serviranno presentazioni anche qui, vanno rifatte a marchio SM HUB.

Le foto vengono copiate dal sito Diesse Media dentro assets/foto/impianti/,
e quelle non piu referenziate vengono cancellate: la cartella resta pulita.
"""
import json, os, re, shutil, sys

try:
    import openpyxl
except ImportError:
    print('ERRORE: manca openpyxl. Installa con:  pip install openpyxl')
    sys.exit(1)

QUI      = os.path.dirname(os.path.abspath(__file__))
FONTE    = os.path.join(QUI, '..', 'sito-diessemedia', 'maxi-impianti.xlsx')
FOTO_DA  = os.path.join(QUI, '..', 'sito-diessemedia', 'assets', 'foto', 'maxi')
FOTO_A   = os.path.join(QUI, 'assets', 'foto', 'impianti')
USCITA   = os.path.join(QUI, 'js', 'impianti-data.js')

# Nell'xlsx le posizioni sono scritte TUTTE IN MAIUSCOLO e piene di abbreviazioni
# attaccate ("VIA MARINA ANG.GIANTURCO DIR.CENTRO"). Qui diventano leggibili: e il
# primo pezzo del "taglio autonomo" di SM HUB, visto che il dato e lo stesso ma il
# modo di presentarlo no. Le tre tabelle qui sotto si correggono a mano se serve.

# Restano in maiuscolo: sigle e senso di marcia.
SIGLE = set(['SX', 'DX', 'EAV', 'NA', 'SS', 'SP', 'MM', 'FS', 'AV', 'JF', 'GB',
             'II', 'III', 'IV', 'VI', 'VII', 'VIII', 'IX', 'XI', 'XII'])

# Restano in minuscolo quando non sono la prima parola (ma "De" di un cognome no:
# "Via Pietro Jacopo De Gennaro" va con la maiuscola, "Reggia di Portici" no).
MINUSCOLE = set(['di', 'del', 'della', 'dello', 'dei', 'degli', 'delle', 'da', 'dal',
                 'dalla', 'e', 'ed', 'il', 'lo', 'la', 'i', 'gli', 'le', 'al', 'ai',
                 'alla', 'alle', 'allo', 'in', 'su', 'sul', 'sulla', 'con', 'per', 'a',
                 # le parole sciolte da ABBREVIAZIONI: nel mezzo di una posizione
                 # descrivono, non sono nomi propri, quindi vanno in minuscolo
                 'angolo', 'incrocio', 'direzione', 'altezza', 'fronte', 'metri',
                 'rotatoria', 'banchina', 'binario', 'stazione', 'ingresso', 'treni'])

# Abbreviazioni sciolte per esteso: rendono la scheda leggibile a chi compra,
# non a chi tiene l'archivio. Se una espansione e sbagliata, si corregge qui.
ABBREVIAZIONI = [
    (r'\bp\.?zza\b',   'piazza '),
    (r'\bp\.?le\b',    'piazzale '),
    (r'\bc\.?so\b',    'corso '),
    (r'\bv\.?le\b',    'viale '),
    (r'\bang\b\.?',    'angolo '),
    (r'\bincr\b\.?',   'incrocio '),
    (r'\binc\b\.?',    'incrocio '),
    (r'\bdirez\b\.?',  'direzione '),
    (r'\bdir\b\.?',    'direzione '),
    (r'\balt\b\.?',    'altezza '),
    (r'\bfr\b\.?',     'fronte '),
    (r'\bmt\b\.?',     'metri '),
]


def titolo(testo):
    """MAIUSCOLO URLATO E ABBREVIATO -> leggibile."""
    if not testo:
        return ''
    t = re.sub(r'\s+', ' ', str(testo).strip()).lower()

    # Prima le abbreviazioni (ognuna si porta dietro uno spazio, cosi "ang.de
    # gennaro" diventa "angolo de gennaro" e non "angolode gennaro")...
    for cerca, sostituisci in ABBREVIAZIONI:
        t = re.sub(cerca, sostituisci, t)

    # ...poi i punti rimasti attaccati: "alt.incrocio" -> "alt. incrocio".
    # Lo spazio entra se la parte prima del punto e una parola (>=2 lettere) o se
    # quella dopo lo e: cosi "g.b.marino" diventa "g.b. marino" e non "g. b. marino".
    t = re.sub(r'(?<=[a-zà-ú]{2})\.(?=[a-zà-ú])', '. ', t)
    t = re.sub(r'\.(?=[a-zà-ú]{3,})', '. ', t)
    t = re.sub(r'(\d)-(?=[a-zà-ú])', r'\1 - ', t)      # "centro- reggia"
    t = re.sub(r'([a-zà-ú])-\s', r'\1 - ', t)
    t = re.sub(r'\s+', ' ', t).strip()

    fuori = []
    for posizione, parola in enumerate(t.split(' ')):
        nudo = parola.strip('.,;:()').upper()
        if nudo in SIGLE:
            fuori.append(parola.upper())
        elif any(c.isdigit() for c in parola):
            fuori.append(parola.upper())                # 7X10, NA63, numeri civici
        elif posizione > 0 and parola.strip('.,;:()') in MINUSCOLE:
            fuori.append(parola)
        else:
            pezzi = parola.split('.')
            parola = '.'.join(p[:1].upper() + p[1:] for p in pezzi)
            parola = re.sub(r'/([a-za-ú])', lambda m: '/' + m.group(1).upper(), parola)
            fuori.append(parola)
    return ' '.join(fuori)


def vero(v):
    return v is not None and str(v).strip().lower() in ('si', 'si', 's', 'yes', 'y', 'true', '1', 'x')


def numero(v):
    if v is None or str(v).strip() == '':
        return None
    try:
        return float(str(v).replace(',', '.'))
    except ValueError:
        return None


def nomefoto(v):
    return os.path.splitext(str(v).strip())[0].strip().lower() + '.jpg'


def formato(dim):
    """'7X10 illuminato' -> '7 x 10'. L'illuminazione ha gia una colonna sua."""
    d = re.sub(r'\s*(illuminat|luminos)[oa]\s*', '', str(dim or ''), flags=re.I).strip()
    m = re.match(r'^(\d+)\s*[xX×]\s*(\d+)$', d)
    return '%s x %s' % (m.group(1), m.group(2)) if m else d


def main():
    if not os.path.exists(FONTE):
        print('ERRORE: non trovo %s' % os.path.normpath(FONTE))
        print('Il sito Diesse Media deve stare nella cartella qui accanto (sito-diessemedia).')
        sys.exit(1)

    wb = openpyxl.load_workbook(FONTE, data_only=True)
    ws = wb['Impianti'] if 'Impianti' in wb.sheetnames else wb.active
    righe = list(ws.iter_rows(values_only=True))
    intest = [str(c).strip().lower() if c is not None else '' for c in righe[0]]
    idx = dict((n, intest.index(n)) for n in intest if n)

    mancanti = [c for c in ('code', 'city', 'pos', 'type', 'dim') if c not in idx]
    if mancanti:
        print('ERRORE: nell xlsx mancano le colonne: %s' % ', '.join(mancanti))
        sys.exit(1)

    def ordine_foto(n):
        coda = n[len('photo'):]
        return int(coda) if coda.isdigit() else 1

    col_foto = sorted([n for n in idx if re.match(r'^photo\d*$', n)], key=ordine_foto)

    def cella(r, nome):
        i = idx.get(nome)
        return None if i is None or i >= len(r) else r[i]

    impianti, esclusi = [], 0
    for r in righe[1:]:
        code = cella(r, 'code')
        if code is None or str(code).strip() == '':
            continue
        if str(code).strip().lower() in ('code', 'codice'):
            continue                                  # riga di etichette leggibili

        sito = str(cella(r, 'sito') or '').strip().lower()
        if sito and 'sm' not in sito:                 # "dm" = resta solo su Diesse Media
            esclusi += 1
            continue

        mq = numero(cella(r, 'sqm'))
        lat = numero(cella(r, 'lat'))
        lng = numero(cella(r, 'lng'))
        dim_grezza = str(cella(r, 'dim') or '')
        voce = {
            'code':  str(code).strip().upper(),
            'city':  titolo(cella(r, 'city')),
            'pos':   titolo(cella(r, 'pos')),
            'type':  titolo(cella(r, 'type')),
            'dim':   formato(dim_grezza),
            'sqm':   int(mq) if mq is not None else None,
            'light': (vero(cella(r, 'light'))
                      or 'illuminat' in dim_grezza.lower()
                      or 'luminos' in dim_grezza.lower()),
            'photos': [nomefoto(cella(r, n)) for n in col_foto
                       if cella(r, n) and str(cella(r, n)).strip()],
        }
        flusso = str(cella(r, 'flow') or '').strip()
        if flusso:
            voce['flow'] = flusso
        if lat is not None and lng is not None:
            voce['lat'], voce['lng'] = lat, lng
        impianti.append(voce)

    if not impianti:
        print('ERRORE: nessun impianto da pubblicare. Controlla la colonna "sito" nell xlsx.')
        sys.exit(1)

    # ---- foto: copia quelle che servono, cancella quelle rimaste orfane ----
    if not os.path.isdir(FOTO_A):
        os.makedirs(FOTO_A)
    servono, copiate, assenti = set(), 0, []
    for i in impianti:
        buone = []
        for f in i['photos']:
            sorgente = os.path.join(FOTO_DA, f)
            if not os.path.exists(sorgente):
                assenti.append('%s -> %s' % (i['code'], f))
                continue
            destinazione = os.path.join(FOTO_A, f)
            if (not os.path.exists(destinazione)
                    or os.path.getmtime(sorgente) > os.path.getmtime(destinazione)):
                shutil.copy2(sorgente, destinazione)
                copiate += 1
            servono.add(f)
            buone.append(f)
        i['photos'] = buone

    orfane = 0
    for f in os.listdir(FOTO_A):
        if f.lower().endswith('.jpg') and f not in servono:
            os.remove(os.path.join(FOTO_A, f))
            orfane += 1

    # ---- file dati ----
    corpo = json.dumps(impianti, ensure_ascii=False, indent=2)
    js = ('/* Generato da build-impianti.py a partire da maxi-impianti.xlsx del sito\n'
          '   Diesse Media: i due siti sono autonomi ma gli impianti sono gli stessi.\n'
          '   NON modificare a mano: le correzioni vanno fatte nell xlsx. */\n'
          'window.SMHUB_IMPIANTI = ' + corpo + ';\n')
    with open(USCITA, 'w', encoding='utf-8', newline='\n') as f:
        f.write(js)

    # ---- cache-buster in index.html ----
    try:
        pagina = os.path.join(QUI, 'index.html')
        if os.path.exists(pagina):
            grezzo = open(pagina, 'rb').read()
            m = re.search(rb'(impianti-data\.js\?v=)(\d+)', grezzo)
            if m:
                nuovo = m.group(1) + str(int(m.group(2)) + 1).encode()
                open(pagina, 'wb').write(grezzo[:m.start()] + nuovo + grezzo[m.end():])
                print('Cache-buster aggiornato a %s' % nuovo.decode())
    except Exception as e:
        print('Nota: cache-buster non aggiornato (%s)' % e)

    su_mappa = sum(1 for i in impianti if 'lat' in i)
    con_foto = sum(1 for i in impianti if i['photos'])
    mq = sum(i['sqm'] or 0 for i in impianti)
    print('OK: %d impianti su SM HUB (%d sulla mappa, %d con foto, %d mq totali).'
          % (len(impianti), su_mappa, con_foto, mq))
    print('Foto: %d copiate, %d orfane rimosse, %d in cartella.'
          % (copiate, orfane, len(servono)))
    if esclusi:
        print('%d impianti lasciati a Diesse Media (colonna "sito").' % esclusi)
    if assenti:
        print('ATTENZIONE: foto indicate nell xlsx ma non trovate:')
        for a in assenti[:10]:
            print('   ' + a)
    for i in impianti:
        if 'lat' in i and not (-90 <= i['lat'] <= 90 and -180 <= i['lng'] <= 180):
            print('   !! %s ha coordinate fuori scala' % i['code'])


if __name__ == '__main__':
    main()
