---
title: Esercizi sui circuiti
feed: show
tags:
  - elettrodinamica
  - circuiti
circuit: true 
---
Una raccolta di quesiti, quiz e problemi sui circuiti elettrici.

La maggior parte dei quiz (da 1 a 24) è tratta da *Students’ understanding of direct current resistive electrical circuits* di P. V. Engelhardt e R. J. Beier, altri sono tratti da *College Physics: Explore and Apply* di E. Etkina, G. Planisic e A. Van Heuvelen (da 25 a 33).

Alcuni quesiti (da 1 a 12) sono tratti da *College Physics*, gli altri sono stati formulati dalla classe 5M del Liceo Musicale di Cuneo (a.s. 2025/2026) oppure dal sottoscritto.

Cosa significano E, F, ecc.? Consulta la [[scala di difficoltà degli esercizi]].

## Quesiti

1. **[EE]** Qual è il ruolo di una batteria in un circuito elettrico? Descrivi un'analogia meccanica.
2. **[F-]** Perché gli uccelli possono appollaiarsi su un cavo da 100000 V senza morire?
3.  **[F-]** Perché riparando apparecchiature ad alta tensione si dovrebbe tenere una mano in tasca e lavorare con l'altra?
4. **[EE/F]** Rispondi ai seguenti quesiti relativi alle misurazioni elettriche.
	- Usando un voltmetro, come puoi determinare la corrente in un resistore?
	- Usando un amperometro, come puoi determinare la differenza di potenziale ai capi di un resistore?
	- Usando un voltmetro e un amperometro, come puoi determinare la resistenza di un resistore?
5. **[EE/F]** Rispondi ai seguenti quesiti relativi al significato dei valori elettrici.
	- Cosa significa se la corrente attraverso un resistore è di 3 A?
	- Cosa significa se la differenza di potenziale ai capi del resistore è di 3 V?
	- Cosa significa se la resistenza del resistore è di 3 Ω?
6. **[F+]** I resistori si scaldano quando sono attraversati da corrente. Perché questo fenomeno non dipende dalla direzione della corrente?
7. **[F+]** Un tempo si usavano fili di alluminio invece del rame. Quale filo deve avere il raggio maggiore se hanno la stessa lunghezza e devono avere la stessa resistenza elettrica?
8. **[F-]** Perché colleghiamo i dispositivi domestici in parallelo e non in serie?
9. **[EE/F]** Rispondi ai seguenti quesiti relativi a voltmetro e amperometro.
	- Come si collega un amperometro in un circuito per misurare la corrente?
	- Come si collega un voltmetro in un circuito per misurare la differenza di potenziale tra due punti del circuito?
	- Quali implicazioni hanno questi collegamenti per le resistenze di questi strumenti di misura?
10. **[F+]** La maggior parte delle luci per l'albero di Natale con lampadine a incandescenza sono collegate in parallelo.
	- Descrivi un vantaggio delle luci collegate in parallelo.
	- Supponiamo di collegare queste luci in serie. Saranno più luminose o più fioche rispetto a quelle collegate in parallelo? Spiega. Quale modifica renderebbe le luci ugualmente luminose a quelle collegate in parallelo? Spiega.
11. **[D]** Usa le leggi di conservazione dell'energia e della carica per spiegare le leggi di Kirchhoff.
12. **[AD]** Quando si chiude l'interruttore nel circuito, il condensatore si carica. Quando si apre nuovamente l'interruttore, il condensatore si scarica.
	- Spiega qualitativamente cosa succede alla corrente in ciascuno dei due processi.
	- Quale processo richiede più tempo, la carica o la scarica? Spiega il motivo.
```circuit
{
  "segments": [
    { "start": [0, 0], "end": [0.5, 0] },
    { "end": [0.5, -0.75] },
    { "end": [3.5, -0.75], "components": [{ "type": "capacitor" }] },
    { "end": [3.5, 0] },
    { "end": [4, 0] },
    { "end": [4, 3] },
    { "end": [0, 3], "components": [{ "type": "voltage_source" }, { "type": "resistor", "label": "20 kΩ" }] },
    { "end": [0, 0], "components": [{ "type": "switch" }] },
    { "start": [0.5, 0], "end": [0.5, 0.75] },
    { "end": [3.5, 0.75], "components": [{ "type": "resistor", "label": "20 kΩ" }] },
    { "end": [3.5, 0] }
  ]
}
```
13. **[F+]** Qual è la differenza tra due batterie collegate in serie e due batterie collegate in parallelo?
14. **[EE]** Come funziona una pila? Quale reazione chimica è alla base del suo funzionamento? Di quali materiali è fatta?
15. **[EE]** Qual è la funzione di un cavo elettrico? Di che materiale può essere fatto?
16. **[F-]** Perché un cavo si scalda quando attraversato da corrente? Perché emette luce?
17. **[F]** Come puoi accendere una lampadina usando solamente una pila e un cavo?
18. **[F+]** Quali sono i requisiti fondamentali affinché un circuito sia attraversato da corrente elettrica?
19. **[PD+]** Quali sono le differenze tra le lampade a incandescenza e le lampade al neon?
20. **[E]** Qual è la relazione tra il verso della corrente elettrica e il verso di percorrenza degli elettroni?
21. **[F+]** Da cosa dipende la resistenza di un resistore? Volendo collegare una centrale elettrica a una fabbrica, come deve essere fatto il cavo? Volendo costruire una serpentina elettrica riscaldante, come deve essere fatta la resistenza?

## Quiz

Dove non diversamente specificato, si suppongano identiche le componenti elettriche che sono rappresentate nello stesso modo nei circuiti.

1. **[E]** Le cariche si consumano in una lampadina, venendo convertite in luce?
	- **(a)** Sì, le cariche che si muovono nel filamento producono "attrito" che riscalda il filamento e produce luce.
	- **(b)** Sì, le cariche vengono emesse.
	- **(c)** No, la carica si conserva. Viene semplicemente convertita in un'altra forma come calore e luce.
	- **(d)** No, la carica si conserva. Le cariche che si muovono nel filamento producono "attrito" che riscalda il filamento e produce luce.
[sol: (d)]
2. **[E]** Come cambia la potenza fornita al resistore A quando viene aggiunto il resistore B, come mostrato rispettivamente nei circuiti 1 e 2?
	- **(a)** Aumenta
	- **(b)** Diminuisce
	- **(c)** Rimane la stessa
```circuit
{
  "circuits": [
    {
      "label": "Circuito 1",
      "circuit": {
        "segments": [
          { "start": [0, 0], "end": [2, 0] },
          { "end": [2, 2], "components": [{ "type": "resistor", "label": "A", "labelDistance": 0.8 }] },
          { "end": [0, 2] },
          { "end": [0, 0], "components": [{ "type": "voltage_source" }] }
        ],
        "padding": 0.5
      }
    },
    {
      "label": "Circuito 2",
      "circuit": {
        "segments": [
          { "start": [0, 0], "end": [2, 0] },
          { "end": [2, 3], "components": [
              { "type": "resistor", "label": "A", "position": 0.25, "labelDistance": 0.8 },
              { "type": "resistor", "label": "B", "position": 0.75, "labelDistance": 0.8 }
            ] 
          },
          { "end": [0, 3] },
          { "end": [0, 0], "components": [{ "type": "voltage_source" }] }
        ],
        "padding": 0.5
      }
    }
  ],
  "gap": 20
}
```
[sol: (b)]
3. **[EE]** Considera i circuiti mostrati di seguito. Quale circuito o quali circuiti hanno la maggiore energia fornita al secondo?
	- **(a)** Circuito 1
	- **(b)** Circuito 2
	- **(c)** Circuito 3
	- **(d)** Circuito 1 = Circuito 2
	- **(e)** Circuito 2 = Circuito 3
```circuit
{
    "circuits": [
        {
          "label": "Circuito 1",
          "paddingTop": 0.5,
          "paddingBottom": 0.5,
          "circuit": {
             "segments": [
                { "start": [0,0], "end": [0,3], "components": [{ "type": "voltage_source" }] },
                { "end": [2,3] },
                { "end": [2,0], "components": [{ "type": "light_bulb" }, { "type": "light_bulb" } ] },
                { "end": [0,0] }
             ]
          }
        },
        {
          "label": "Circuito 2",
          "paddingTop": 0.5,
          "paddingBottom": 0.5,
          "circuit": {
             "segments": [
                { "start": [0,0], "end": [0,3], "components": [{ "type": "voltage_source" }] },
                { "start": [1,0], "end": [1,3], "components": [{ "type": "voltage_source" }] },
                { "start": [0,3], "end": [2,3] },
                { "start": [2,3], "end": [2,0], "components": [{ "type": "light_bulb" }, { "type": "light_bulb"} ] },
                { "start": [2,0], "end": [0,0] }
             ]
          }
        },
        {
          "label": "Circuito 3",
          "paddingTop": 0.5,
          "paddingBottom": 0.5,
          "circuit": {
             "segments": [
                { "start": [0,0], "end": [0,3], "components": [{ "type": "voltage_source", "position": 0.3 }, { "type": "voltage_source", "position": 0.7 }] },
                { "end": [2,3] },
                { "end": [2,0], "components": [{ "type": "light_bulb" }, { "type": "light_bulb"} ] },
                { "end": [0,0] }
             ]
          }
        }
    ]
}
```
[sol: (c)]
4. **[EE]** Quale/i circuito/i tra quelli in alto rappresenta/no un circuito composto da due lampadine in parallelo con una batteria?
	- **(a)** A
	- **(b)** B
	- **(c)** C
	- **(d)** A e C
	- **(e)** A, C e D
```circuit
{
  "circuits": [
    {
      "label": "A",
      "circuit": {
        "segments": [
          { "start": [0, 0], "end": [0, 2], "components": [{ "type": "voltage_source" }] },
          { "end": [3, 2] },
          { "start": [1.5, 2], "end": [1.5, 0], "components": [{ "type": "light_bulb", "labelDistance": 0.8 }] },
          { "start": [3, 2], "end": [3, 0], "components": [{ "type": "light_bulb", "labelDistance": 0.8 }] },
          { "start": [3, 0], "end": [0, 0] }
        ],
        "padding": 0.5
      }
    },
    {
      "label": "B",
      "circuit": {
        "segments": [
          { "start": [0, 0], "end": [0, 2], "components": [{ "type": "voltage_source" }] },
          { "start": [3, 0], "end": [3, 2], "components": [{ "type": "light_bulb", "labelDistance": 0.8 }] },
          { "start": [0, 2], "end": [3, 2] },
          { "start": [0, 0], "end": [3, 0] }
        ],
        "padding": 0.5
      }
    },
    {
      "label": "C",
      "circuit": {
        "segments": [
          { "start": [0, 0], "end": [0, 2], "components": [{ "type": "light_bulb", "labelDistance": 0.8 }] },
          { "start": [1.5, 0], "end": [1.5, 2], "components": [{ "type": "voltage_source" }] },
          { "start": [3, 0], "end": [3, 2], "components": [{ "type": "light_bulb", "labelDistance": 0.8 }] },
          { "start": [0, 2], "end": [3, 2] },
          { "start": [0, 0], "end": [3, 0] }
        ],
        "padding": 0.5
      }
    },
    {
      "label": "D",
      "circuit": {
        "segments": [
          { "start": [0, 0], "end": [0, 2], "components": [{ "type": "voltage_source" }] },
          { "end": [3, 2] },
          { "start": [1.5, 2], "end": [1.5, 0] },
          { "start": [3, 2], "end": [3, 0], "components": [{ "type": "light_bulb" }] },
          { "start": [3, 0], "end": [1.5, 0] },
          { "end": [0, 0], "components": [{ "type": "light_bulb" }] }
        ],
        "padding": 0.5
      }
    }
  ],
  "cssWidth": "100%"
}
```
[sol: (d)]
5. **[E]** Confronta la resistenza del ramo 1 con quella del ramo 2. Un ramo è una sezione di un circuito. Quale ha la resistenza minore?
	- **(a)** Ramo 1
	- **(b)** Ramo 2
	- **(c)** Nessuno dei due, sono uguali
```circuit
{
  "circuits": [
    {
      "label": "Ramo 1",
      "circuit": {
        "segments": [
          { "start": [0, 1.5], "end": [5, 1.5], "components": [{ "type": "resistor" }, { "type": "resistor" } ] }
        ],
        "nodes": [
          { "pos": [0, 1.5] },
          { "pos": [5, 1.5] }
        ]
      }
    },
    {
      "label": "Ramo 2",
      "circuit": {
        "segments": [
          { "start": [-0.25, 0], "end": [0.25, 0] },
          { "end": [0.25, 1] },
          { "end": [2.25, 1], "components": [{ "type": "resistor" }] },
          { "end": [2.25, 0] },
          { "end": [2.75, 0] },
          { "start": [0.25, 0], "end": [0.25, -1] },
          { "end": [2.25, -1], "components": [{ "type": "resistor" }] },
          { "end": [2.25, 0] }
        ],
        "nodes": [
          { "pos": [-0.25, 0] },
          { "pos": [2.75, 0] }
        ]
      }
    }
  ],
  "cssWidth": "80%"
}
```
[sol: (b)]
6. **[EE/F]** Ordina la differenza di potenziale tra i punti 1 e 2, i punti 3 e 4, e i punti 4 e 5 nel circuito mostrato sotto, dalla più alta alla più bassa.
	- **(a)** 1 e 2; 3 e 4; 4 e 5
	- **(b)** 1 e 2; 4 e 5; 3 e 4
	- **(c)** 3 e 4; 4 e 5; 1 e 2
	- **(d)** 3 e 4 = 4 e 5; 1 e 2
	- **(e)** 1 e 2; 3 e 4 = 4 e 5
```circuit
{
  "segments": [
    { "start": [0, 0], "end": [4, 0], "components": [{ "type": "voltage_source" }] },
    { "end": [4, 3] },
    { "end": [2, 3], "components": [{ "type": "light_bulb" }] },
    { "end": [0, 3], "components": [{ "type": "light_bulb" }] },
    { "end": [0, 0] }
  ],
  "nodes": [
    { "pos": [0, 0], "label": "1" },
    { "pos": [4, 0], "label": "2" },
    { "pos": [4, 3], "label": "3", "labelSide": "bottom" },
    { "pos": [2, 3], "label": "4", "labelSide": "bottom" },
    { "pos": [0, 3], "label": "5", "labelSide": "bottom" }
  ]
}
```
[sol: (e)]
7. **[E]** Confronta la luminosità della lampadina nel circuito 1 con quella nel circuito 2. Quale lampadina è più luminosa?
	- **(a)** Lampadina nel circuito 1
	- **(b)** Lampadina nel circuito 2
	- **(c)** Nessuna delle due, sono uguali
```circuit
{
  "circuits": [
    {
      "label": "Circuito 1",
      "circuit": {
        "segments": [
          { "start": [0, 0], "end": [3, 0], "components": [{ "type": "light_bulb" }] },
          { "end": [3, 2] },
	      { "end": [0, 2], "components": [{ "type": "voltage_source" }, { "type": "voltage_source" }] },
	      { "end": [0, 0] }
        ]
      }  
    },
    {
      "label": "Circuito 2",
      "circuit": {
        "segments": [
          { "start": [0, 0], "end": [3, 0], "components": [{ "type": "light_bulb" }] },
	      { "end": [3, 2] },
	      { "end": [0, 2], "components": [{ "type": "voltage_source" } ] },
	      { "end": [0, 0] }
        ]
      }  
    }
  ]
}
```
[sol: (a), nel circuito 1 la tensione è doppia, quindi è doppia la corrente.]
8. **[F]** Confronta la corrente al punto 1 con la corrente al punto 2. Quale punto ha la corrente maggiore?
	- **(a)** Punto 1
	- **(b)** Punto 2
	- **(c)** Nessuno dei due, sono uguali
```circuit
{
  "segments": [
    { "start": [0, 0], "end": [3, 0], "components": [{ "type": "light_bulb" }] },
    { "end": [3, 2] },
    { "end": [0, 2], "components": [{ "type": "voltage_source" }] },
    { "end": [0, 0] }
  ],
  "nodes": [
    { "pos": [0, 0], "label": "1" },
    { "pos": [3, 0], "label": "2" }
  ]
}
```
[sol: (c), la lampadina non "consuma" corrente, ma potenziale.]
9. **[F+]** Confronta la luminosità delle lampadine A e B nel circuito 1 con la luminosità della lampadina C nel circuito 2. Quale lampadina o lampadine sono le più luminose?
	- **(a)** A
	- **(b)** B
	- **(c)** C
	- **(d)** A = B
	- **(e)** A = C
```circuit
{
  "circuits": [
    {
      "label": "Circuito 1",
      "circuit": {
        "segments": [
          { "start": [0, 0], "end": [2, 0], "components": [{ "type": "light_bulb", "label": "A" }] },
	      { "end": [2, 2] },
	      { "end": [0, 2] },
	      { "end": [0, 0], "components": [{ "type": "voltage_source" }] },
	      { "start": [2, 0], "end": [4, 0], "components": [{ "type": "light_bulb", "label": "B" }] },
	      { "end": [4, 2] },
	      { "end": [2, 2] }
        ]
      }  
    },
    {
      "label": "Circuito 2",
      "circuit": {
        "segments": [
          { "start": [0, 0], "end": [3, 0], "components": [{ "type": "light_bulb", "label": "C" }] },
	      { "end": [3, 2] },
	      { "end": [0, 2], "components": [{ "type": "voltage_source" }] },
	      { "end": [0, 0] }
        ]
      }  
    }
  ]
}
```
[sol: (e), si noti il cortocircuito nel circuito 1,]
10. **[EE]** Perché le luci in casa si accendono quasi istantaneamente?
	- **(a)** Le cariche sono già nel filo. Quando il circuito viene completato, c'è un rapido riposizionamento delle cariche superficiali nel circuito.
	- **(b)** Le cariche immagazzinano energia. Quando il circuito viene completato, l'energia viene rilasciata.
	- **(c)** Le cariche nel filo viaggiano molto velocemente.
	- **(d)** I circuiti in una casa sono cablati in parallelo. Quindi, una corrente sta già scorrendo.
[sol: (a)]
11. **[PD]** Considera la potenza erogata a ciascuno dei resistori mostrati nei circuiti sottostanti. Quale circuito o circuiti ricevono la minor potenza?
	- **(a)** Circuito 1
	- **(b)** Circuito 2
	- **(c)** Circuito 3
	- **(d)** Circuito 1 = Circuito 2
	- **(e)** Circuito 1 = Circuito 3
```circuit
{
    "circuits": [
        {
          "label": "Circuito 1",
          "paddingTop": 0.5,
          "paddingBottom": 0.5,
          "circuit": {
             "segments": [
                { "start": [0,0], "end": [0,3], "components": [{ "type": "voltage_source" }] },
                { "end": [2,3] },
                { "end": [2,0], "components": [{ "type": "resistor" } ] },
                { "end": [0,0] }
             ]
          }
        },
        {
          "label": "Circuito 2",
          "paddingTop": 0.5,
          "paddingBottom": 0.5,
          "circuit": {
             "segments": [
                { "start": [0,0], "end": [0,3], "components": [{ "type": "voltage_source" }] },
                { "start": [1,0], "end": [1,3], "components": [{ "type": "voltage_source" }] },
                { "start": [0,3], "end": [2,3] },
                { "start": [2,3], "end": [2,0], "components": [{ "type": "resistor" } ] },
                { "start": [2,0], "end": [0,0] }
             ]
          }
        },
        {
          "label": "Circuito 3",
          "paddingTop": 0.5,
          "paddingBottom": 0.5,
          "circuit": {
             "segments": [
                { "start": [0,0], "end": [0,3], "components": [{ "type": "voltage_source", "position": 0.3 }, { "type": "voltage_source", "position": 0.7 }] },
                { "end": [2,3] },
                { "end": [2,0], "components": [{ "type": "resistor" } ] },
                { "end": [0,0] }
             ]
          }
        }
    ]
}
```
[sol: (d)]
12. **[F+]** Come cambia la resistenza tra i terminali quando l'interruttore viene chiuso?
	- **(a)** Aumenta
	- **(b)** Diminuisce
	- **(c)** Rimane la stessa
```circuit
{
  "segments": [
    { "start": [0, 0], "end": [1, 0] },
    { "end": [1, 1] },
    { "end": [4, 1], "components": [{ "type": "resistor" }] },
    { "end": [4, 0] },
    { "end": [5, 0] },
    { "start": [1, 0], "end": [1, -1] },
    { "end": [4, -1], "components": [{ "type": "resistor", "position": 0.3 }, { "type": "switch", "position": 0.7 }] },
    { "end": [4, 0] }
  ],
  "nodes": [
    { "pos": [0, 0] },
    { "pos": [5, 0] }
  ]
}
```
[sol: (b)]
13. **[F+]** Cosa succede alla differenza di potenziale tra i punti 1 e 2 se la lampadina A viene rimossa?
	- **(a)** Aumenta
	- **(b)** Diminuisce
	- **(c)** Rimane la stessa
```circuit
{
  "segments": [
    { "start": [0, -0.5], "end": [3, -0.5], "components": [{ "type": "light_bulb", "label": "A" } ] },
    { "end": [3, 1] },
    { "end": [0, 1], "components": [{ "type": "light_bulb", "label": "B" }] },
    { "end": [0, -0.5] },
    { "start": [3, 1], "end": [3, 2] },
    { "end": [0, 2], "components": [{ "type": "voltage_source" }] },
    { "end": [0, 1] }
  ],
  "nodes": [
    { "pos": [0.5, 1], "label": "1" },
    { "pos": [2.5, 1], "label": "2" }
  ]
}
```
[sol: (c)]
14. **[PD+]** Confronta la luminosità della lampadina A nel circuito 1 con la lampadina A nel circuito 2. Quale lampadina è più fioca?
	- **(a)** Lampadina A nel circuito 1
	- **(b)** Lampadina A nel circuito 2
	- **(c)** Nessuna delle due, sono uguali
```circuit
{
  "circuits": [
    {
      "label": "Circuito 1",
      "circuit": {
        "segments": [
          { "start": [0, 0], "end": [3, 0], "components": [{ "type": "light_bulb", "label": "A" }] },
	      { "end": [3, 2] },
	      { "end": [0, 2], "components": [{ "type": "voltage_source" }] },
	      { "end": [0, 0] }
        ]
      }  
    },
    {
      "label": "Circuito 2",
      "circuit": {
        "segments": [
          { "start": [0, 0], "end": [4, 0] },
          { "start": [0, 2], "end": [4, 2] },
          { "start": [0, 0], "end": [0, 2], "components": [{ "type": "voltage_source" }] },
          { "start": [1, 0], "end": [1, 2], "components": [{ "type": "voltage_source" }] },
          { "start": [2.5, 0], "end": [2.5, 2], "components": [{ "type": "light_bulb", "label": "A" }] },
          { "start": [4, 0], "end": [4, 2], "components": [{ "type": "light_bulb", "label": "B" }] }
        ]
      }
    }
  ]
}
```
[sol: (c)]
15. **[PD-]** Ordina le correnti ai punti 1, 2, 3, 4, 5 e 6 dalla più alta alla più bassa.
	- **(a)** 5, 1, 3, 2, 4, 6
	- **(b)** 5, 3, 1, 4, 2, 6
	- **(c)** 5 = 6; 3 = 4; 1 = 2
	- **(d)** 5 = 6; 1 = 2 = 3 = 4
	- **(e)** 1 = 2 = 3 = 4 = 5 = 6
```circuit
{
  "segments": [
    { "start": [0, 0], "end": [3, 0], "components": [{ "type": "light_bulb" } ] },
    { "end": [3, 2] },
    { "end": [0, 2], "components": [{ "type": "light_bulb" }] },
    { "end": [0, 0] },
    { "start": [3, 2], "end": [3, 4] },
    { "end": [0, 4], "components": [{ "type": "voltage_source" }] },
    { "end": [0, 2] }
  ],
  "nodes": [
    { "pos": [0.5, 0], "label": "1" },
    { "pos": [2.5, 0], "label": "2" },
    { "pos": [0.5, 2], "label": "3" },
    { "pos": [2.5, 2], "label": "4" },
    { "pos": [0.5, 4], "label": "5" },
    { "pos": [2.5, 4], "label": "6" }
  ]
}
```
[sol: (d)]
16. [AD] Cosa succede alla luminosità delle lampadine A e B quando viene collegato un filo tra i punti 1 e 2?
	- **(a)** Aumenta
	- **(b)** Diminuisce
	- **(c)** Rimane la stessa
	- **(d)** A diventa più luminosa di B
	- **(e)** Nessuna delle due lampadine si accenderà
```circuit
{
  "segments": [
    { "start": [0, 0], "end": [3, 0], "components": [{ "type": "light_bulb", "label": "A" } ] },
    { "end": [3, 2] },
    { "end": [0, 2], "components": [{ "type": "light_bulb", "label": "B" }] },
    { "end": [0, 0] },
    { "start": [3, 2], "end": [3, 4] },
    { "end": [0, 4], "components": [{ "type": "voltage_source" }] },
    { "end": [0, 2] }
  ],
  "nodes": [
    { "pos": [0.5, 0], "label": "1" },
    { "pos": [0.5, 2], "label": "2" }
  ]
}
```
[sol: (c)]
17. **[TD]** Il campo elettrico è nullo o diverso da zero all'interno del filamento di tungsteno della lampadina?
	- **(a)** Nullo perché il filamento è un conduttore.
	- **(b)** Nullo perché scorre una corrente.
	- **(c)** Diverso da zero perché il circuito è completo e scorre una corrente.
	- **(d)** Diverso da zero perché ci sono cariche sulla superficie del filamento.
```circuit
{
  "segments": [
    { "start": [0, 0], "end": [3, 0], "components": [{ "type": "light_bulb" }] },
    { "end": [3, 2] },
    { "end": [0, 2], "components": [{ "type": "voltage_source" }] },
    { "end": [0, 0] }
  ]
}
```
[sol: d]
18. **[F+]** Confronta l'energia erogata al secondo alla lampadina nel circuito 1 con l'energia erogata al secondo alle lampadine nel circuito 2. Quale lampadina o lampadine hanno la minor energia erogata al secondo?
	- **(a)** A
	- **(b)** B
	- **(c)** C
	- **(d)** B = C
	- **(e)** A = B = C
```circuit
{
  "circuits": [
    {
      "label": "Circuito 1",
      "circuit": {
        "segments": [
          { "start": [0, 0], "end": [3, 0], "components": [{ "type": "light_bulb", "label": "A" }] },
	      { "end": [3, 2] },
	      { "end": [0, 2], "components": [{ "type": "voltage_source" }] },
	      { "end": [0, 0] }
        ]
      }  
    },
    {
      "label": "Circuito 2",
      "circuit": {
        "segments": [
          { "start": [0, 0], "end": [3, 0], "components": [{ "type": "light_bulb", "label": "B", "position": 0.3 }, { "type": "light_bulb", "label": "C", "position": 0.7 }] },
	      { "end": [3, 2] },
	      { "end": [0, 2], "components": [{ "type": "voltage_source" }] },
	      { "end": [0, 0] }
        ]
      }  
    }
  ]
}
```
[sol: (d)]
19. **[EE]** Immediatamente dopo l'apertura dell'interruttore, cosa succede alla resistenza della lampadina?
	- **(a)** La resistenza aumenta.
	- **(b)** La resistenza diminuisce.
	- **(c)** La resistenza rimane la stessa.
	- **(d)** La resistenza va a zero.
```circuit
{
  "segments": [
    { "start": [0, 0], "end": [3, 0], "components": [{ "type": "light_bulb", "position": 0.3 }, { "type": "switch", "position": 0.7 }] },
    { "end": [3, 2] },
    { "end": [0, 2], "components": [{ "type": "voltage_source" }] },
    { "end": [0, 0] }
  ]
}
```
[sol: (c)]
20. **[EE]** Se raddoppi la corrente attraverso una batteria, la differenza di potenziale ai capi della batteria raddoppia?
	- **(a)** Sì, perché la legge di Ohm dice V = IR.
	- **(b)** Sì, perché aumentando la resistenza, si aumenta la differenza di potenziale.
	- **(c)** No, perché raddoppiando la corrente, si riduce la differenza di potenziale della metà.
	- **(d)** No, perché la differenza di potenziale è una proprietà della batteria.
	- **(e)** No, perché la differenza di potenziale è una proprietà di tutto ciò che è nel circuito.
[sol: (d)]
21. **[EE]** Confronta la luminosità della lampadina A nel circuito 1 con la lampadina A nel circuito 2. Quale lampadina è più luminosa?
	- **(a)** Lampadina A nel circuito 1
	- **(b)** Lampadina A nel circuito 2
	- **(c)** Nessuna delle due, sono uguali
```circuit
{
  "circuits": [
    {
      "label": "Circuito 1",
      "circuit": {
        "segments": [
          { "start": [0, 0], "end": [3, 0], "components": [{ "type": "light_bulb", "label": "A" }] },
	      { "end": [3, 2] },
	      { "end": [0, 2], "components": [{ "type": "voltage_source" }] },
	      { "end": [0, 0] }
        ]
      }  
    },
    {
      "label": "Circuito 2",
      "circuit": {
        "segments": [
          { "start": [0, 0], "end": [3, 0], "components": [{ "type": "light_bulb", "label": "B", "position": 0.3 }, { "type": "light_bulb", "label": "C", "position": 0.7 }] },
	      { "end": [3, 2] },
	      { "end": [0, 2], "components": [{ "type": "voltage_source" }] },
	      { "end": [0, 0] }
        ]
      }  
    }
  ]
}
```
[sol: (a)]
22. **[F-]** Se aumenti la resistenza C, cosa succede alla luminosità delle lampadine A e B?
	- **(a)** A rimane uguale, B si affievolisce
	- **(b)** A si affievolisce, B rimane uguale
	- **(c)** A e B aumentano
	- **(d)** A e B diminuiscono
	- **(e)** A e B rimangono uguali
```circuit
{
  "segments": [
    { "start": [0, 0], "end": [5, 0], "components": [{ "type": "light_bulb", "label": "A" }, { "type": "resistor", "label": "C" }, { "type": "light_bulb", "label": "B" }] },
    { "end": [5, 1] },
    { "end": [0, 1], "components": [{ "type": "voltage_source" }] },
    { "end": [0, 0] }
  ]
}
```
[sol: (d)]
23. **[PD]** Qual è la differenza di potenziale tra i punti A e B?
	- **(a)** 0 V
	- **(b)** 3 V
	- **(c)** 6 V
	- **(d)** 12 V
```circuit
{
  "segments": [
    { "start": [0, 0], "end": [5, 0], "components": [{ "type": "light_bulb", "position": 0.2 }, { "type": "switch", "position": 0.5 }, { "type": "light_bulb", "position": 0.8 }] },
    { "end": [5, 1] },
    { "end": [0, 1], "components": [{ "type": "voltage_source", "label": "12 V", "labelSide": "bottom" }] },
    { "end": [0, 0] }
  ],
  "nodes": [
    { "pos": [1.75, 0], "label": "A" },
    { "pos": [5, 1], "label": "B", "labelSide": "right" }
  ]
}
```
[sol: d]
24. **[D+]** Cosa succede alla luminosità delle lampadine A e B quando l'interruttore viene chiuso?
	- **(a)** A rimane uguale, B si affievolisce
	- **(b)** A più luminosa, B si affievolisce
	- **(c)** A e B aumentano
	- **(d)** A e B diminuiscono
	- **(e)** A e B rimangono uguali
[sol: (b)]
```circuit
{
  "segments": [
    { "start": [0, 0], "end": [2, 0], "components": [{ "type": "light_bulb", "label": "A" }] },
    { "end": [2, -1] },
    { "end": [5, -1], "components": [{ "type": "switch", "position": 0.3 }, { "type": "light_bulb", "label": "C", "position": 0.7 }] },
    { "end": [5, 0] },
    { "end": [6, 0] },
    { "end": [6, 4] },
    { "end": [0, 4], "components": [{ "type": "voltage_source" }] },
    { "end": [0, 0] },
    { "start": [2, 0], "end": [2, 1] },
    { "end": [5, 1], "components": [{ "type": "light_bulb", "label": "B", "labelSide": "bottom" }] },
    { "end": [5, 0] }
  ]
}
```
25. **[PD]** Qual è la resistenza totale del seguente circuito?
	- **(a)** 2.0 Ω
	- **(b)** 7.0 Ω
	- **(c)**  9.0 Ω
	- **(d)** 1.6 Ω
```circuit
{
  "segments": [
    { "start": [0, 0], "end": [3, 0], "components": [{ "type": "voltage_source", "label": "12.0 V" }] },
    { "end": [3, 3], "components": [{ "type": "resistor", "label": "4,0 Ω", "labelSide": "right" }] },
    { "end": [0, 3], "components": [{ "type": "resistor", "label": "3.0 Ω", "labelSide": "bottom" }] },
    { "end": [0, 0], "components": [{ "type": "resistor", "label": "2.0 Ω", "labelSide": "left" }] },
    { "start": [0, 0], "end": [3, 3] }
  ],
  "paddingLeft": 2,
  "paddingRight": 2
}
```
[sol: (a)]
26. **[AD]** Come cambiano le correnti elettriche quando l'interruttore viene chiuso? (Possono esserci più risposte corrette).
	- **(a)** La corrente attraverso la batteria rimane la stessa, ma ora si divide tra la A e la B.
	- **(b)** La corrente nella lampadina A è ancora maggiore di quella nella B.
	- **(c)** La corrente nella lampadina A non cambia ed è uguale a quella nella B.
	- **(d)** La corrente attraverso la batteria raddoppia.
	- **(e)** La corrente nella lampadina A dimezza.
```circuit
{
  "segments": [
    { "start": [0, 0], "end": [0, 3], "components": [{ "type": "voltage_source" }] },
    { "end": [3, 3] },
    { "start": [1.5, 3], "end": [1.5, 0], "components": [{ "type": "light_bulb", "label": "A", "labelSide": "right" }] },
    { "start": [3, 3], "end": [3, 0], "components": [{ "type": "light_bulb", "label": "B", "labelSide": "right" }, { "type": "switch" }] },
    { "start": [3, 0], "end": [0, 0] }
        ]
}
```
[sol: (a) e (d)]
27. **[F+]** Con riferimento all'esercizio precedente, confronta la differenza di potenziale tra le lampadine A e B dopo la chiusura dell'interruttore. Quale affermazione è corretta?
	- **(a)** La differenza di potenziale è maggiore ai capi della lampadina A.
	- **(b)** La differenza di potenziale è maggiore ai capi della lampadina B.
	- **(c)** La differenza di potenziale è la stessa ai capi delle lampadine A e B.
	- **(d)** La differenza di potenziale ai capi della batteria raddoppia.
	- **(e)** Nessuna delle precedenti.
[sol: (c)]
28. **[F]** Quale affermazione è corretta?
	- **(a)** La corrente attraverso la batteria è il doppio rispetto a quando era presente una sola lampadina.
	- **(b)** La corrente attraverso la batteria è la metà rispetto a quando era presente una sola lampadina.
	- **(c)** La corrente è maggiore nella lampadina A che nella B.
	- **(d)** La corrente è maggiore nella lampadina B che nella A.
	- **(e)** Le correnti nelle lampadine A e B sono identiche.
	- **(f)** Le opzioni (b) ed (e) sono corrette.
	- **(g)** Le opzioni (a) e (c) sono corrette. 
```circuit
{
  "segments": [
    { "start": [0, 0], "end": [3, 0], "components": [{ "type": "light_bulb", "label": "A", "position": 0.3 }, { "type": "light_bulb", "label": "B", "position": 0.7 }] },
    { "end": [3, 2] },
    { "end": [0, 2], "components": [{ "type": "voltage_source" }] },
    { "end": [0, 0] }
  ]
}
```
[sol: (f)]
29. **[F+]** Con riferimento all'esercizio precedente, quale affermazione sulla differenza di potenziale ai capi della batteria e delle lampadine identiche A e B è corretta? (Possono esserci più risposte corrette).
	- **(a)** La differenza di potenziale è maggiore ai capi della lampadina A rispetto alla B.
	- **(b)** La differenza di potenziale è maggiore ai capi della lampadina B rispetto alla A.
	- **(c)** La differenza di potenziale è la stessa ai capi delle lampadine A e B.
	- **(d)** La differenza di potenziale ai capi della batteria è il doppio di quella con una sola lampadina.
[sol: (c)]
30. **[PD]** Ordina i circuiti in base alle letture degli amperometri, elencando per prima la lettura più alta.
	- **(a)** A > B > C
	- **(b)** A > C > B
	- **(c)** B > A > C
	- **(d)** B > C > A
	- **(e)** C > A > B
```circuit
{
  "circuits": [
    {
      "circuit": {
        "segments": [
          { "start": [0, 0], "end": [0, 3], "components": [{ "type": "voltage_source" }] },
          { "start": [3, 0], "end": [3, 3], "components": [{ "type": "light_bulb", "label": "1", "labelSide": "right" }] },
          { "start": [0, 3], "end": [3, 3] },
          { "start": [0, 0], "end": [3, 0], "components": [{ "type": "ammeter", "label": "A" }] }
        ]
      }
    },
    {
      "circuit": {
        "segments": [
          { "start": [0, 0], "end": [0, 3], "components": [{ "type": "voltage_source" }] },
          { "end": [4, 3] },
          { "start": [2, 3], "end": [2, 0], "components": [{ "type": "light_bulb", "label": "2", "labelSide": "right" }] },
          { "start": [4, 3], "end": [4, 0], "components": [{ "type": "light_bulb", "label": "3", "labelSide": "right" }] },
          { "start": [4, 0], "end": [0, 0], "components": [{ "type": "ammeter", "label": "B", "position": 0.75 }] }
        ]
      }
    },
    {
      "circuit": {
        "segments": [
          { "start": [0, 0], "end": [0, 3], "components": [{ "type": "voltage_source" }] },
          { "start": [3, 0], "end": [3, 3], "components": [{ "type": "light_bulb", "label": "4", "labelSide": "right" }, { "type": "light_bulb", "label": "5", "labelSide": "right" }] },
          { "start": [0, 3], "end": [3, 3] },
          { "start": [0, 0], "end": [3, 0], "components": [{ "type": "ammeter", "label": "C" }] }
        ]
      }
    }
  ]
}
```
[sol: (c)]
31. **[F+]** Con riferimento all'esercizio precedente, ordina le differenze di potenziale ai capi di ciascuna delle cinque lampadine nei tre circuiti. Assumi che la differenza di potenziale ai capi degli amperometri sia zero.
	- **(a)** $\Delta V_1 > \Delta V_2 = \Delta V_3 > \Delta V_4 = \Delta V_5$
	- **(b)** $\Delta V_2 > \Delta V_3 > \Delta V_1 > \Delta V_4 > \Delta V_5$
	- **(c)** $\Delta V_2 = \Delta V_3 > \Delta V_1 > \Delta V_4 = \Delta V_5$
	- **(d)** $\Delta V_1 = \Delta V_2 = \Delta V_3 > \Delta V_4 = \Delta V_5$
	- **(e)** Nessuna di queste.
[sol: (d)]
32. **[AD+]** Ordina le cinque lampadine per luminosità.
- **(a)** A > E > B > C = D
- **(b)** A = E = B > C = D
- **(c)** A > E > B = C = D
- **(d)** A = B = C = D = E
- **(e)** Nessuna di queste è corretta.
```circuit
{
  "segments": [
    { "start": [0, 0], "end": [0, 4], "components": [{ "type": "voltage_source" }] },
    { "end": [4, 4] },
    { "start": [2, 4], "end": [2, 0], "components": [{ "type": "light_bulb", "label": "A", "labelSide": "left" }] },
    { "start": [4, 4], "end": [4, 0], "components": [{ "type": "light_bulb", "label": "B", "labelSide": "left", "position": 0.25 }, { "type": "light_bulb", "label": "E", "labelSide": "left", "position": 0.75 }] },
    { "start": [4, 0], "end": [0, 0] },
    { "start": [4, 0], "end": [6, 0], "components": [{ "type": "light_bulb", "label": "C" }] },
    { "end": [6, 2], "components": [{ "type": "light_bulb", "label": "D", "labelSide": "right" }] },
    { "end": [4, 2] }
  ]
}
```
[sol: (c)]
33. **[D+]** Con l'interruttore aperto, le lampadine 1, 2 e 3 sono ugualmente luminose e la lampadina 4 è spenta. Come cambia la luminosità delle lampadine 1, 2 e 3 quando l'interruttore viene chiuso?
	- **(a)** 1 e 2 rimangono uguali e 3 diventa più luminosa.
	- **(b)** 1, 2 e 3 rimangono uguali.
	- **(c)** 1 e 3 diventano più luminose e 2 diventa meno luminosa.
	- **(d)** 1, 2 e 3 diventano tutte più luminose.
	- **(e)** Nessuna di queste è corretta.
```circuit
{
  "segments": [
    { "start": [0, 0], "end": [0, 4], "components": [{ "type": "voltage_source" }] },
    { "end": [4, 4] },
    { "start": [4, 4], "end": [4, 0], "components": [{ "type": "light_bulb", "label": "2", "labelSide": "left", "position": 0.25 }, { "type": "light_bulb", "label": "3", "labelSide": "left", "position": 0.75 }] },
    { "start": [4, 0], "end": [0, 0], "components": [{ "type": "light_bulb", "label": "1" }] },
    { "start": [4, 0], "end": [6, 0] },
    { "end": [6, 2], "components": [{ "type": "light_bulb", "label": "4", "labelSide": "right" }] },
    { "end": [4, 2], "components": [{ "type": "switch" }] }
  ]
}
```
[sol: (e)]
34. **[D+]** Come cambia la luminosità delle lampadine 1, 3 e 4 quando l'interruttore viene chiuso?
	- **(a)** 1 diventa meno luminosa, 4 diventa più luminosa e 3 rimane uguale.
	- **(b)** 1 rimane uguale, 4 diventa più luminosa e 3 diventa meno luminosa.
	- **(c)** 1 rimane uguale, 4 diventa più luminosa e 3 rimane uguale.
	- **(d)** 1, 3 e 4 rimangono tutte uguali.
	- **(e)** Nessuna di queste è corretta.
```circuit
{
  "segments": [
    { "start": [0, 0], "end": [0, 4], "components": [{ "type": "voltage_source" }] },
    { "end": [4, 4] },
    { "start": [2, 4], "end": [2, 0], "components": [{ "type": "light_bulb", "label": "3", "labelSide": "left" }] },
    { "start": [4, 4], "end": [4, 0], "components": [{ "type": "light_bulb", "label": "1", "labelSide": "left", "position": 0.25 }, { "type": "light_bulb", "label": "4", "labelSide": "left", "position": 0.75 }] },
    { "start": [4, 0], "end": [0, 0] },
    { "start": [4, 0], "end": [6, 0] },
    { "end": [6, 2], "components": [{ "type": "light_bulb", "label": "3", "labelSide": "right" }] },
    { "end": [4, 2], "components": [{ "type": "switch" }] }
  ]
}
```
[sol: (e)]