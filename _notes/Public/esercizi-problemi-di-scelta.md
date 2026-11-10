---
title: Esercizi sui problemi di scelta
feed: show
plot: true
tags:
  - esercizi
  - funzioni
---
Esercizi, quesiti e problemi di scelta: confrontare due o più alternative (tariffe, offerte, strategie) descrivendole con funzioni, rappresentandole graficamente e individuando, al variare di una grandezza, l'alternativa più conveniente. Si incontrano funzioni lineari, definite a tratti, "a gradini", quadratiche e fratte, sia nel caso continuo sia nel caso discreto.

Gli esercizi sulla teoria delle funzioni si trovano negli [[esercizi sulle funzioni]].

Cosa significano E, F, ecc.? Consulta la [[scala di difficoltà degli esercizi]].

> [!DETAILS] Come si affronta un problema di scelta
>
> 1. Individua la **variabile** da cui dipende la scelta (ore, chilometri, quantità prodotta, …) e la grandezza da rendere minima (un costo) o massima (un ricavo, un guadagno, un'area).
> 2. Esprimi ciascuna alternativa con una **funzione** della variabile, scrivendo con cura il **dominio**: la variabile può assumere solo valori interi (caso *discreto*) o tutti i valori di un intervallo (caso *continuo*)? Ci sono vincoli?
> 3. Rappresenta le funzioni **nello stesso piano cartesiano**.
> 4. Determina i punti di intersezione (*soglie*, o punti di indifferenza) e confronta le funzioni in ciascun intervallo.
> 5. Rispondi alla domanda **nel contesto**, controllando che il risultato abbia senso (unità di misura, valori interi, vincoli).

## Esercizi

1. **[E]** **Dove parcheggio a Torino?** Devi lasciare l'auto a Torino per qualche giorno. Puoi scegliere tra due opzioni: il parcheggio Aurora costa 10 € all'ingresso e 2 € ogni ora; il parcheggio Bellavista non prevede costi all'ingresso, ma costa 3 € ogni ora.
	1. Rappresenta il costo dei parcheggi con delle funzioni del tempo di sosta e tracciane i grafici nello stesso piano cartesiano.
	2. Quando conviene il parcheggio Aurora? Quando conviene il parcheggio Bellavista?
	3. Se hai a disposizione un budget di 100 €, quale parcheggio ti permette di lasciare l'auto più a lungo?
	4. In realtà i parcheggi fanno pagare ogni ora *iniziata*: come cambiano i grafici? Le risposte precedenti cambiano?
	[sol: 1. $A(t) = 10 + 2t$, $B(t) = 3t$, con $t \geq 0$ in ore; 2. Bellavista per soste inferiori a $10$ ore, Aurora per soste superiori, indifferente per $10$ ore; 3. Aurora: $45$ ore contro circa $33$ ore; 4. i grafici diventano "a gradini"; la soglia resta $10$ ore, ma con Bellavista le ore complete pagabili con 100 € sono $33$.]
2. **[E]** **Bici in città.** Il grafico rappresenta il costo mensile di tre abbonamenti per il noleggio di biciclette elettriche, in funzione del numero $x$ di ore di utilizzo nel mese.
	```matephis
	{
	  "aspectRatio": "4:3",
	  "xlim": [-1, 26],
	  "ylim": [-3, 52],
	  "legend": true,
	  "axisArrows": true,
	  "axisLabels": ["h", "€"],
	  "data": [
	    { "fn": "3x", "domain": [0, 25], "color": "red1", "label": "Base" },
	    { "fn": "12 + x", "domain": [0, 25], "color": "black1", "label": "Smart" },
	    { "fn": "30", "domain": [0, 25], "color": "summer2", "label": "Illimitato" }
	  ]
	}
	```
	1. Descrivi a parole ciascun abbonamento e scrivi le espressioni analitiche delle tre funzioni.
	2. Qual è l'abbonamento più conveniente, al variare del numero di ore di utilizzo?
	3. Se usi la bici per 10 ore al mese, quanto risparmi scegliendo l'abbonamento migliore invece del peggiore?
	[sol: 1. Base: $3x$; Smart: $12 + x$; Illimitato: $30$. 2. Base per $x < 6$, Smart per $6 < x < 18$, Illimitato per $x > 18$; per $x = 6$ e $x = 18$ due abbonamenti si equivalgono. 3. $8$ € ($22$ € contro $30$ €).]
3. **[EE]** **In palestra.** Una palestra propone tre formule: ingresso singolo a 7 €; abbonamento mensile a 40 € più 2 € per ogni ingresso; abbonamento mensile illimitato a 60 €.
	1. Esprimi il costo mensile di ciascuna formula in funzione del numero $n$ di ingressi nel mese. Qual è il dominio delle funzioni?
	2. Rappresenta le funzioni con un grafico: perché questa volta il grafico è formato da punti isolati?
	3. Qual è la formula più conveniente al variare di $n$?
	[sol: 1. $S(n) = 7n$, $M(n) = 40 + 2n$, $I(n) = 60$, con $n$ naturale (al più $31$). 2. $n$ assume solo valori interi. 3. Ingresso singolo per $n \leq 7$; per $n = 8$ ingresso singolo e abbonamento si equivalgono ($56$ €); abbonamento con quota per $n = 9$; per $n = 10$ abbonamento e illimitato si equivalgono ($60$ €); illimitato per $n \geq 11$.]
4. **[EE]** **Noleggio auto.** Per noleggiare un'auto per un giorno puoi scegliere tra due agenzie. L'agenzia X chiede 40 € più 0,20 € per ogni chilometro percorso; l'agenzia Y chiede 60 €, con 500 km inclusi, più 0,30 € per ogni chilometro oltre i primi 500.
	1. Esprimi il costo del noleggio in funzione dei chilometri percorsi $d$. Quale delle due funzioni è definita a tratti?
	2. Rappresenta le funzioni nello stesso piano cartesiano, per $0 \leq d \leq 1500$.
	3. Quale agenzia conviene, al variare di $d$?
	[sol: 1. $X(d) = 40 + 0{,}2d$; $Y(d) = 60$ per $d \leq 500$, $Y(d) = 60 + 0{,}3(d - 500)$ per $d > 500$. 3. X per $d < 100$ e per $d > 1300$, Y per $100 < d < 1300$; indifferente per $d = 100$ e $d = 1300$.]
5. **[EE/F]** **Spedizioni.** Il grafico rappresenta il costo di spedizione di un pacco con due corrieri, P (in rosso) e Q (in nero), in funzione del peso $w$ del pacco, in kg. Ogni gradino comprende il suo estremo destro (pallino pieno) e non quello sinistro (pallino vuoto): ad esempio, un pacco di esattamente 2 kg costa 5 € con il corriere P.
	```matephis
	{
	  "aspectRatio": "2:1",
	  "xlim": [
	    -0.4,
	    10.4
	  ],
	  "ylim": [-1, 31],
	  "axisLabels": [
	    "w",
	    "€"
	  ],
	  "legend": true,
	  "data": [
	    {
	      "fn": "5",
	      "domain": [
	        0,
	        2
	      ],
	      "color": "red1",
	      "label": "P"
	    },
	    {
	      "fn": "6.5",
	      "domain": [
	        2,
	        3
	      ],
	      "color": "red1"
	    },
	    {
	      "fn": "8.0",
	      "domain": [
	        3,
	        4
	      ],
	      "color": "red1"
	    },
	    {
	      "fn": "9.5",
	      "domain": [
	        4,
	        5
	      ],
	      "color": "red1"
	    },
	    {
	      "fn": "11.0",
	      "domain": [
	        5,
	        6
	      ],
	      "color": "red1"
	    },
	    {
	      "fn": "12.5",
	      "domain": [
	        6,
	        7
	      ],
	      "color": "red1"
	    },
	    {
	      "fn": "14.0",
	      "domain": [
	        7,
	        8
	      ],
	      "color": "red1"
	    },
	    {
	      "fn": "15.5",
	      "domain": [
	        8,
	        9
	      ],
	      "color": "red1"
	    },
	    {
	      "fn": "17.0",
	      "domain": [
	        9,
	        10
	      ],
	      "color": "red1"
	    },
	    {
	      "points": [
	        [
	          2,
	          5
	        ],
	        [
	          3,
	          6.5
	        ],
	        [
	          4,
	          8.0
	        ],
	        [
	          5,
	          9.5
	        ],
	        [
	          6,
	          11.0
	        ],
	        [
	          7,
	          12.5
	        ],
	        [
	          8,
	          14.0
	        ],
	        [
	          9,
	          15.5
	        ],
	        [
	          10,
	          17.0
	        ]
	      ],
	      "radius": 3.5,
	      "fillColor": "red1"
	    },
	    {
	      "points": [
	        [
	          0,
	          5
	        ],
	        [
	          2,
	          6.5
	        ],
	        [
	          3,
	          8.0
	        ],
	        [
	          4,
	          9.5
	        ],
	        [
	          5,
	          11.0
	        ],
	        [
	          6,
	          12.5
	        ],
	        [
	          7,
	          14.0
	        ],
	        [
	          8,
	          15.5
	        ],
	        [
	          9,
	          17.0
	        ]
	      ],
	      "radius": 3.5,
	      "fillColor": "#fff",
	      "strokeColor": "red1",
	      "strokeWidth": 2
	    },
	    {
	      "fn": "9",
	      "domain": [
	        0,
	        5
	      ],
	      "color": "black1",
	      "label": "Q"
	    },
	    {
	      "fn": "11",
	      "domain": [
	        5,
	        6
	      ],
	      "color": "black1"
	    },
	    {
	      "fn": "13",
	      "domain": [
	        6,
	        7
	      ],
	      "color": "black1"
	    },
	    {
	      "fn": "15",
	      "domain": [
	        7,
	        8
	      ],
	      "color": "black1"
	    },
	    {
	      "fn": "17",
	      "domain": [
	        8,
	        9
	      ],
	      "color": "black1"
	    },
	    {
	      "fn": "19",
	      "domain": [
	        9,
	        10
	      ],
	      "color": "black1"
	    },
	    {
	      "points": [
	        [
	          5,
	          9
	        ],
	        [
	          6,
	          11
	        ],
	        [
	          7,
	          13
	        ],
	        [
	          8,
	          15
	        ],
	        [
	          9,
	          17
	        ],
	        [
	          10,
	          19
	        ]
	      ],
	      "radius": 3.5,
	      "fillColor": "black1"
	    },
	    {
	      "points": [
	        [
	          0,
	          9
	        ],
	        [
	          5,
	          11
	        ],
	        [
	          6,
	          13
	        ],
	        [
	          7,
	          15
	        ],
	        [
	          8,
	          17
	        ],
	        [
	          9,
	          19
	        ]
	      ],
	      "radius": 3.5,
	      "fillColor": "#fff",
	      "strokeColor": "black1",
	      "strokeWidth": 2
	    }
	  ]
	}
	```
	1. Descrivi a parole le tariffe dei due corrieri e scrivi le espressioni analitiche delle funzioni (puoi usare la funzione "parte intera superiore", $\lceil x \rceil$, che associa a ogni numero il più piccolo intero maggiore o uguale a esso).
	2. Quale corriere conviene, al variare del peso del pacco?
	3. Devi spedire due pacchi da 3 kg ciascuno. Conviene spedirli separatamente o insieme, in un unico pacco da 6 kg?
	[sol: 1. P: 5 € fino a 2 kg, più 1,50 € per ogni kg o frazione di kg oltre i 2 kg; Q: 9 € fino a 5 kg, più 2 € per ogni kg o frazione oltre i 5 kg. 2. P per $w \leq 4$ e per $w > 6$, Q per $4 < w \leq 5$; per $5 < w \leq 6$ i costi coincidono ($11$ €). 3. Separatamente con P costano $6{,}50 + 6{,}50 = 13$ €; insieme costano $11$ € (con P o con Q): conviene un unico pacco.]
6. **[EE/F]** **Bolletta della luce.** Un fornitore di energia elettrica propone tre tariffe mensili: A, con una quota fissa di 10 € e 0,25 € per kWh; B, senza quota fissa, con 0,30 € per kWh; C, a forfait, con 45 € fino a 250 kWh consumati e 0,35 € per ogni kWh oltre i 250. Il consumo mensile $x$ di una famiglia è compreso tra 0 e 400 kWh.
	1. Esprimi il costo mensile di ciascuna tariffa in funzione di $x$ e rappresenta le tre funzioni nello stesso piano cartesiano.
	2. Quale tariffa conviene, al variare del consumo?
	3. Esiste un consumo, tra 0 e 400 kWh, per cui la tariffa A è la più conveniente?
	[sol: 1. $A(x) = 10 + 0{,}25x$; $B(x) = 0{,}3x$; $C(x) = 45$ per $x \leq 250$, $C(x) = 45 + 0{,}35(x - 250)$ per $x > 250$. 2. B per $x < 150$, C per $x > 150$, B e C si equivalgono per $x = 150$. 3. No: A è più conveniente di B solo per $x > 200$ e più conveniente di C solo per $x < 140$.]
7. **[EE/F]** **Biglietti a teatro.** Un teatro con 500 posti vende 300 biglietti a 20 € l'uno. Da un'indagine risulta che per ogni euro di sconto sul prezzo del biglietto si venderebbero 20 biglietti in più.
	1. Esprimi il ricavo in funzione dello sconto $s$ (in euro) e determinane il dominio, tenendo conto del numero di posti.
	2. Quale sconto rende massimo il ricavo? Qual è il ricavo massimo?
	3. Se lo sconto può essere solo un numero intero di euro, quale sconto conviene scegliere?
	4. Durante una ristrutturazione, i posti disponibili scendono a 320. Come cambia la risposta?
	[sol: 1. $R(s) = (20 - s)(300 + 20s)$, con $0 \leq s \leq 10$; 2. $s = 2{,}50$ €, $R = 6125$ €; 3. $s = 2$ € oppure $s = 3$ €, entrambi con ricavo $6120$ €; 4. il dominio diventa $0 \leq s \leq 1$ e la funzione vi è crescente: conviene lo sconto massimo, $s = 1$ €, con ricavo $6080$ €.]
8. **[EE]** **Il recinto.** Con 100 m di rete si vuole recintare un'area rettangolare addossata a un muro rettilineo, che quindi non va recintato.
	1. Esprimi l'area recintata in funzione della lunghezza $x$ dei lati perpendicolari al muro e determina il dominio della funzione.
	2. Per quale valore di $x$ l'area è massima?
	3. Il muro è lungo solo 40 m, quindi il lato parallelo al muro non può superare i 40 m. Come cambia la risposta?
	[sol: 1. $A(x) = x(100 - 2x)$, con $0 < x < 50$; 2. $x = 25 \text{ m}$, area $1250 \text{ m}^2$; 3. deve essere $x \geq 30$, e in questo intervallo la funzione è decrescente: $x = 30 \text{ m}$, area $1200 \text{ m}^2$.]
9. **[F]** **Produrre o non produrre?** Un laboratorio artigianale produce $q$ vasi di ceramica al mese, con un costo totale (in euro) $C(q) = 500 + 4q + 0{,}01q^2$, e vende ogni vaso a 10 €.
	1. Esprimi il guadagno $G(q)$ in funzione di $q$. Quanti vasi bisogna produrre e vendere per non andare in perdita?
	2. Quanti vasi conviene produrre per avere il guadagno massimo? Quanto vale?
	3. Il *costo medio* di un vaso è $c(q) = \dfrac{C(q)}{q}$. Scrivi l'espressione di $c(q)$, tracciane un grafico indicativo ragionando sui singoli addendi e stima, con una tabella o un software, per quale valore di $q$ il costo medio è minimo. Coincide con il valore che rende massimo il guadagno?
	[sol: 1. $G(q) = -0{,}01q^2 + 6q - 500$; non si va in perdita per $100 \leq q \leq 500$. 2. $q = 300$, $G = 400$ €. 3. $c(q) = \frac{500}{q} + 4 + 0{,}01q$: il primo addendo decresce, il terzo cresce; il minimo, circa $8{,}47$ €, si ha per $q \approx 224$. Non coincide: produrre al costo medio minimo non significa guadagnare il più possibile.]

## Quesiti

1. **[EE]** Due offerte hanno costi $A(x) = a + bx$ e $B(x) = c + dx$, con $a > c$ e $x \geq 0$. Sotto quali condizioni su $b$ e $d$ esiste una soglia oltre la quale conviene l'offerta A? Determina la soglia e interpreta il risultato nel grafico.
	[sol: deve essere $b < d$ (l'offerta con la quota fissa maggiore deve avere il costo unitario minore); la soglia è $x = \frac{a - c}{d - b}$, ascissa del punto di intersezione delle due rette.]
2. **[EE]** Perché, in un problema di scelta, è importante determinare con cura il dominio delle funzioni? Fai un esempio in cui il valore che rende massima (o minima) la funzione non appartiene al dominio, e spiega come si trova in quel caso la scelta migliore.
	[sol: il dominio è fissato dal contesto e dai vincoli; se il vertice di una parabola non appartiene al dominio, la scelta migliore si trova in un estremo del dominio, come nel caso del teatro con 320 posti o del recinto con il muro di 40 m.]
3. **[F]** Nel caso continuo il ricavo massimo del teatro si ottiene con uno sconto di 2,50 €. È sempre vero che, nel caso discreto, la scelta migliore è il numero intero più vicino al valore ottimo del caso continuo? Rispondi prima nel caso in cui la funzione sia quadratica, poi in generale.
	[sol: per una funzione quadratica sì, perché il grafico è simmetrico rispetto all'asse della parabola e il valore dipende solo dalla distanza dal vertice (se l'ottimo è a metà tra due interi, entrambi vanno bene). In generale no: per una funzione non simmetrica, come il costo medio $c(q)$ dell'esercizio sui vasi, l'intero più vicino all'ottimo può non essere il migliore.]
4. **[PD]** Un'alternativa A si dice *dominata* da un'alternativa B se, per ogni valore della variabile, A non è mai più conveniente di B. Considera l'esercizio sulla bolletta della luce.
	1. La tariffa A è dominata dalla tariffa B? È dominata dalla tariffa C?
	2. Eppure la tariffa A non è mai la più conveniente. È una contraddizione?
	3. Come cambierebbe la risposta se il consumo potesse superare i 400 kWh?
	[sol: 1. no e no: A è più conveniente di B per $x > 200$ e più conveniente di C per $x < 140$. 2. No: A non è dominata da nessuna singola alternativa, ma per ogni consumo c'è almeno un'alternativa migliore. 3. Per $x > 525$ la tariffa A diventa più conveniente di C (e di B), quindi diventerebbe la scelta migliore.]
5. **[PD]** Un'azienda deve scegliere tra due macchinari, ciascuno con un costo di acquisto e un costo orario di funzionamento. Disegna i grafici dei costi totali in funzione del tempo di utilizzo in tre situazioni diverse: la scelta dipende dal tempo di utilizzo; conviene sempre il primo; conviene sempre il secondo. Che cosa devono avere di diverso, nelle tre situazioni, i costi di acquisto e i costi orari? E se l'azienda sa già che userà il macchinario per non più di 2000 ore?
	[sol: la scelta dipende dal tempo di utilizzo se un macchinario costa di più all'acquisto ma ha un costo orario minore: le rette si incontrano in un punto di ascissa positiva. Conviene sempre un macchinario se costa meno (o uguale) sia all'acquisto sia all'ora: la sua retta sta sempre sotto l'altra. Se il tempo è limitato, conta solo la posizione della soglia: se è oltre le 2000 ore, conviene sempre il macchinario meno costoso all'acquisto.]

## Esplorazioni

In queste attività i grafici hanno uno o più **slider**. Prima di muoverli, segui sempre tre passi: **prevedi** (scrivi o disegna che cosa ti aspetti, senza toccare lo slider), **verifica** (muovi lo slider e confronta con la tua previsione), **giustifica** (spiega il risultato, anche con l'algebra).

1. **[F] La soglia mobile.** Riprendiamo l'esercizio *Bici in città*: l'abbonamento Smart costa $F + x$ euro al mese, dove $x$ è il numero di ore di utilizzo e la quota fissa $F$ è comandata da uno slider. Gli abbonamenti Base e Illimitato costano rispettivamente $3x$ e $30$ euro.
	```matephis
	{
	  "aspectRatio": "4:3",
	  "xlim": [-1, 26],
	  "ylim": [-3, 62],
	  "legend": true,
	  "sliderBorder": true,
	  "axisLabels": ["h", "€"],
	  "params": {
	    "F": {"label": "quota fissa", "min": 0, "max": 40, "step": 1, "val": 12}
	  },
	  "data": [
	    {"fn": "3x", "domain": [0, 25], "color": "red1", "label": "Base"},
	    {"fn": "F + x", "domain": [0, 25], "color": "black1", "label": "Smart"},
	    {"fn": "30", "domain": [0, 25], "color": "summer2", "label": "Illimitato"}
	  ]
	}
	```
	1. **Prevedi** come si spostano le soglie di convenienza dell'abbonamento Smart se la quota fissa aumenta. Per quale valore di $F$ pensi che l'abbonamento Smart smetta di essere conveniente?
	2. **Verifica** con lo slider.
	3. **Giustifica.** Determina algebricamente, in funzione di $F$, l'intervallo di ore in cui Smart è l'abbonamento più conveniente. Per quali valori di $F$ l'intervallo è vuoto?
	4. Che cosa accade per $F = 0$? E per $F = 30$?
	[sol: Smart è il più conveniente per $\frac F 2 < x < 30 - F$; l'intervallo è vuoto per $F \geq 20$ (per $F = 20$ i tre abbonamenti si equivalgono per $x = 10$). Per $F = 0$ Smart è il più conveniente per ogni $x > 0$ tra quelli considerati; per $F = 30$ non è mai più conveniente di Illimitato: è dominato.]
2. **[EE/F] Il teatro si ristruttura.** Riprendiamo l'esercizio *Biglietti a teatro*: il ricavo è $R(s) = (20 - s)(300 + 20s)$, dove $s$ è lo sconto in euro. Il numero di posti $P$ è comandato da uno slider e limita lo sconto (non si possono vendere più biglietti dei posti disponibili); il punto azzurro si muove sul grafico con lo slider dello sconto. Attenzione: l'asse verticale non parte da zero.
	```matephis
	{
	  "aspectRatio": "4:3",
	  "xlim": [-0.4, 10.4],
	  "ylim": [4900, 6300],
	  "sliderBorder": true,
	  "axisLabels": ["s", "€"],
	  "params": {
	    "P": {"label": "posti", "min": 300, "max": 500, "step": 10, "val": 500},
	    "s": {"label": "sconto", "min": 0, "max": "(P - 300)/20", "step": 0.25, "val": 0}
	  },
	  "data": [
	    {"fn": "(20 - x)*(300 + 20x)", "domain": [0, 10], "color": "black4", "dash": "5,5", "width": 1.5},
	    {"fn": "(20 - x)*(300 + 20x)", "domain": [0, "(P - 300)/20"], "color": "red1", "width": 3.5},
	    {"points": [["s", "(20 - s)*(300 + 20*s)"]], "radius": 5, "fillColor": "summer2"}
	  ]
	}
	```
	1. **Prevedi** quale sconto rende massimo il ricavo con $500$, $400$, $340$ e $320$ posti.
	2. **Verifica** con gli slider.
	3. **Giustifica.** Esprimi lo sconto massimo in funzione di $P$. Per quali valori di $P$ lo sconto migliore è quello del vertice della parabola? E per gli altri valori?
	4. Esprimi il ricavo massimo in funzione del numero di posti $P$ e tracciane un grafico per $300 \leq P \leq 500$. Che cosa ha di particolare?
	[sol: lo sconto massimo è $\frac{P - 300}{20}$. Se $P \geq 350$ lo sconto migliore è $2{,}50$ €, con ricavo $6125$ €; se $P < 350$ conviene lo sconto massimo, che riempie il teatro, con ricavo $\left(20 - \frac{P - 300}{20}\right) P$ (ad esempio $6120$ € con $340$ posti e $6080$ € con $320$ posti). Il ricavo massimo, in funzione di $P$, è quindi definito a tratti: un arco di parabola crescente fino a $P = 350$, poi costante.]

## Quiz

1. **[E]** Il grafico rappresenta il costo di due abbonamenti, A (in rosso) e B (in nero), in funzione del numero $x$ di ore di utilizzo. Quale affermazione è corretta?
	```matephis
	{
	  "aspectRatio": "4:3",
	  "xlim": [-1, 41],
	  "ylim": [-3, 75],
	  "legend": true,
	  "data": [
	    { "fn": "20 + x/2", "domain": [0, 40], "color": "red1", "label": "A" },
	    { "fn": "1.5x", "domain": [0, 40], "color": "black1", "label": "B" }
	  ]
	}
	```
	- **(a)** B conviene per $x > 20$.
	- **(b)** A conviene per $x < 20$.
	- **(c)** B conviene per $x < 20$.
	- **(d)** A e B si equivalgono per $x = 30$.
	[sol: (c)]
2. **[EE/F]** Tre abbonamenti costano $3x$, $12 + x$ e $30$ euro al mese, dove $x$ è il numero di ore di utilizzo. Quale dei seguenti grafici rappresenta la spesa di chi sceglie sempre l'abbonamento più conveniente?
	```matephis
	{
	  "layout": "grid",
	  "columns": 4,
	  "mobileColumns": 2,
	  "labels": "a",
	  "shared": { "xlim": [-1, 26], "ylim": [-3, 52], "aspectRatio": 1 },
	  "plots": [
	    { "data": [ { "fn": "min(3x, 30)", "domain": [0, 25], "color": "red1" } ] },
	    { "data": [ { "fn": "min(3x, 12 + x, 30)", "domain": [0, 25], "color": "red1" } ] },
	    { "data": [ { "fn": "max(3x, 12 + x, 30)", "domain": [0, 25], "color": "red1" } ] },
	    { "data": [ { "fn": "min(3x, 12 + x)", "domain": [0, 25], "color": "red1" } ] }
	  ]
	}
	```
	[sol: (b)]
3. **[EE/F]** Un parcheggio costa 2 € per ogni ora o frazione di ora. Quanto si paga per una sosta di 2 ore e 15 minuti?
	- **(a)** 4 €
	- **(b)** 4,50 €
	- **(c)** 5 €
	- **(d)** 6 €
	[sol: (d)]
4. **[F]** Il ricavo di una vendita è $R(n) = n(41 - n)$ euro, dove $n$ è un numero naturale. Per quali valori di $n$ il ricavo è massimo?
	- **(a)** solo per $n = 20$
	- **(b)** solo per $n = 21$
	- **(c)** per $n = 20$ e per $n = 21$
	- **(d)** per $n = 20{,}5$
	[sol: (c): il vertice della parabola ha ascissa $20{,}5$ e $R(20) = R(21) = 420$.]
5. **[F]** La funzione $A(x) = x(60 - x)$ rappresenta l'area di un rettangolo. A causa di un vincolo, deve essere $0 \leq x \leq 20$. Qual è l'area massima?
	- **(a)** $900$
	- **(b)** $800$
	- **(c)** $400$
	- **(d)** $1200$
	[sol: (b): il vertice ($x = 30$) è fuori dal dominio e nel dominio la funzione è crescente, quindi il massimo si ha per $x = 20$.]
6. **[PD]** Tre offerte A, B e C dipendono da una variabile $x$. Si sa che A è più conveniente di B per $x < 10$ e che A è più conveniente di C per $x > 15$. Allora...
	- **(a)** A è la più conveniente per $10 < x < 15$.
	- **(b)** A non è mai la più conveniente.
	- **(c)** A è la più conveniente per $x < 10$.
	- **(d)** con queste informazioni non si può stabilire se A sia mai la più conveniente.
	[sol: (d): per $x < 10$ potrebbe convenire C, per $x > 15$ potrebbe convenire B; servono altre informazioni.]

## Problemi

**Ricarica elettrica [EE/F]** Chiara ha acquistato un'auto elettrica che consuma in media 0,16 kWh per chilometro. Può ricaricarla solo alle colonnine pubbliche, a 0,60 € per kWh, oppure installare in garage una *wallbox*, che costa 1200 € (installazione compresa) e permette di ricaricare a casa a 0,30 € per kWh.
1. Esprimi la spesa totale nei due casi in funzione dei chilometri percorsi $d$ e rappresenta le due funzioni.
2. Dopo quanti chilometri la wallbox "si ripaga"? Se Chiara percorre 12 000 km all'anno, dopo quanto tempo?
3. Con una tariffa notturna, il costo dell'energia a casa scende a 0,20 € per kWh. Come cambia la risposta?
[sol: 1. $P(d) = 0{,}096d$, $W(d) = 1200 + 0{,}048d$; 2. dopo $25\,000 \text{ km}$, cioè dopo poco più di due anni; 3. $W(d) = 1200 + 0{,}032d$, si ripaga dopo $18\,750 \text{ km}$, cioè dopo poco più di un anno e mezzo (circa un anno e sette mesi).]

**La fermata dell'autobus [PD]** Lungo una strada rettilinea ci sono tre case, ai chilometri 1, 3 e 8. Il comune vuole collocare una fermata dell'autobus al chilometro $x$, in modo da rendere minima la somma delle distanze tra la fermata e le case.
1. Esprimi la somma delle distanze $S(x)$ con i valori assoluti, poi riscrivi $S$ come funzione definita a tratti e rappresentala.
2. Dove conviene collocare la fermata?
3. Viene costruita una quarta casa, al chilometro 10. Dove conviene collocare la fermata ora? La soluzione è unica?
4. Il comune cambia criterio: vuole rendere minima la distanza dalla casa *più lontana*. Dove conviene collocare la fermata, con quattro case?
5. Formula una regola generale per il caso in cui le case siano $n$, nei due criteri.
[sol: 1. $S(x) = \lvert x - 1 \rvert + \lvert x - 3 \rvert + \lvert x - 8 \rvert$; 2. al chilometro $3$, con $S = 7$; 3. in un qualsiasi punto tra il chilometro $3$ e il chilometro $8$, dove $S$ vale costantemente $14$; 4. a metà strada tra le case estreme, al chilometro $5{,}5$; 5. con il primo criterio la fermata va posta nella casa "centrale" (la mediana), o in un punto qualsiasi tra le due case centrali se $n$ è pari; con il secondo, nel punto medio tra le due case estreme.]

**Telefono nuovo [F]** Marco vuole cambiare piano tariffario. Il piano Lite costa 6 € al mese e include 10 GB di traffico dati, poi 1 € per ogni GB (o frazione di GB) in più; il piano Plus costa 12 € al mese con 50 GB inclusi, poi 0,50 € per ogni GB (o frazione) in più; il piano Unlimited costa 20 € al mese, senza limiti di traffico.
1. Esprimi il costo mensile dei tre piani in funzione dei GB consumati e rappresenta le funzioni.
2. Qual è il piano più conveniente, al variare del consumo mensile?
3. Marco ha consumato, negli ultimi sei mesi, 6, 7, 5, 8, 40 e 18 GB. Quale piano gli sarebbe convenuto? Che cosa cambia se si ragiona sul consumo medio invece che mese per mese?
[sol: 2. Lite fino a 15 GB; tra 15 e 16 GB Lite e Plus si equivalgono; Plus oltre 16 GB e fino a 65 GB; tra 65 e 66 GB Plus e Unlimited si equivalgono; Unlimited oltre 66 GB. 3. Con Lite Marco avrebbe speso $6 + 6 + 6 + 6 + 36 + 14 = 74$ €, con Plus $72$ €, con Unlimited $120$ €: conviene di poco Plus. Il consumo medio, 14 GB, suggerirebbe Lite: ragionare sulla media può portare a una scelta sbagliata, perché i costi non dipendono linearmente dal consumo.]

**Pizze per la festa [EE/F]** Per una festa di classe servono $n$ pizze. La pizzeria A vende ogni pizza a 7 € e chiede 5 € per la consegna; la pizzeria B vende ogni pizza a 8 € e consegna gratis da 4 pizze in su (altrimenti la consegna costa 4 €); la pizzeria C vende solo confezioni da 4 pizze a 26 € l'una, con consegna gratuita.
1. Esprimi il costo nei tre casi in funzione di $n$ e rappresenta le funzioni con un grafico per $1 \leq n \leq 16$. Che cosa ha di particolare il grafico della pizzeria C?
2. Completa una tabella che indichi, per ogni valore di $n$ da $1$ a $16$, la pizzeria più conveniente. Riconosci una regolarità?
3. La pizzeria B è mai l'unica scelta più conveniente? È dominata da A o da C (cioè non è mai più conveniente di A, o non è mai più conveniente di C)?
4. Servono 9 pizze. Conviene ordinarne di più dalla pizzeria C? E se si potesse ordinare da due pizzerie diverse?
[sol: 1. $A(n) = 7n + 5$; $B(n) = 8n + 4$ per $n \leq 3$ e $B(n) = 8n$ per $n \geq 4$; $C(n) = 26 \cdot \lceil n/4 \rceil$, un grafico "a gradini" formato da punti. 2. C conviene quando la divisione di $n$ per $4$ dà resto $0$ oppure $3$ (per $n = 3$ a pari merito con A), altrimenti A (a pari merito con B per $n = 1$ e $n = 5$). 3. No, non è mai l'unica; ma non è dominata né da A (per $n = 4$ costa meno di A) né da C (per $n = 1$ costa meno di C). 4. Con C, $12$ pizze costano $78$ € contro i $68$ € di A; combinando $8$ pizze di C ($52$ €) e $1$ di A ($12$ €) si spendono $64$ €.]

**Il magazzino in città [PD]** In una città con le strade disposte a griglia, ci si muove solo in direzione est-ovest o nord-sud: la distanza tra i punti $(x_1; y_1)$ e $(x_2; y_2)$ è quindi $\lvert x_1 - x_2 \rvert + \lvert y_1 - y_2 \rvert$ (distanza *Manhattan*, in km). Una catena ha cinque negozi, nei punti $(1; 1)$, $(2; 5)$, $(6; 2)$, $(7; 6)$ e $(9; 3)$, e vuole costruire un magazzino nel punto $(x; y)$ che renda minima la somma delle distanze dai negozi.
1. Scrivi la somma delle distanze $S(x; y)$. Perché si può cercare separatamente la migliore $x$ e la migliore $y$?
2. Determina la posizione migliore per il magazzino e la somma delle distanze corrispondente.
3. Viene aperto un sesto negozio, nel punto $(4; 8)$. Dove conviene ora collocare il magazzino? La soluzione è unica?
4. Ripeti il punto 2 usando la distanza "in linea d'aria" (euclidea), con l'aiuto di un software: il punto migliore è lo stesso?
[hint: rivedi il problema della fermata dell'autobus.]
[sol: 1. $S = (\lvert x - 1 \rvert + \lvert x - 2 \rvert + \lvert x - 6 \rvert + \lvert x - 7 \rvert + \lvert x - 9 \rvert) + (\lvert y - 1 \rvert + \lvert y - 5 \rvert + \lvert y - 2 \rvert + \lvert y - 6 \rvert + \lvert y - 3 \rvert)$: il primo addendo dipende solo da $x$, il secondo solo da $y$. 2. Le mediane: $(6; 3)$, con $S = 21 \text{ km}$. 3. Un punto qualsiasi con $4 \leq x \leq 6$ e $3 \leq y \leq 5$: la soluzione non è unica. 4. In generale no.]

**Luce che costa [F]** Una lampadina LED costa 8 €, assorbe una potenza di 10 W e dura 15 000 ore; una lampadina alogena con la stessa luminosità costa 1,50 €, assorbe 42 W e dura 2000 ore. L'energia elettrica costa 0,30 € per kWh.
1. Esprimi la spesa totale (acquisto delle lampadine e consumo) in funzione del numero $t$ di ore di accensione, per $0 \leq t \leq 15\,000$, nei due casi. Perché la funzione relativa all'alogena è "a gradini" con una pendenza?
2. Dopo quante ore di accensione la lampadina LED diventa più conveniente? Se la luce è accesa 3 ore al giorno, dopo quanti giorni?
3. Quanto si risparmia in tutto, con la LED, nell'arco della sua durata?
[sol: 1. $L(t) = 8 + 0{,}003\,t$; $H(t) = 1{,}50 \cdot \lceil t / 2000 \rceil + 0{,}0126\,t$: ogni 2000 ore si compra una nuova lampadina (gradino), mentre il consumo cresce in modo proporzionale al tempo. 2. dopo circa $677$ ore, cioè dopo circa $226$ giorni. 3. $H(15\,000) - L(15\,000) = 201 - 53 = 148$ €.]
