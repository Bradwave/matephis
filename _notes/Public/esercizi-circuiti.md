---
title: Esercizi sui circuiti
feed: show
tags:
  - elettrodinamica
  - circuiti
circuit: true 
---

## Quiz

1. **[E]** Le cariche si consumano in una lampadina, venendo convertite in luce?
	- **(a)** Sì, le cariche che si muovono nel filamento producono "attrito" che riscalda il filamento e produce luce.
	- **(b)** Sì, le cariche vengono emesse.
	- **(c)** No, la carica si conserva. Viene semplicemente convertita in un'altra forma come calore e luce.
	- **(d)** No, la carica si conserva. Le cariche che si muovono nel filamento producono "attrito" che riscalda il filamento e produce luce.
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
3. **[E]** Considera i circuiti mostrati di seguito. Quale circuito o quali circuiti hanno la maggiore energia fornita al secondo?
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
4. **[E]** Quale/i circuito/i tra quelli in alto rappresenta/no un circuito composto da due lampadine in parallelo con una batteria?
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
          { "start": [1.5, 0], "end": [1.5, 2], "components": [{ "type": "light_bulb", "labelDistance": 0.8 }] },
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
          { "end": [4, 2] },
          { "start": [1.3, 2], "end": [1.3, 0], "components": [{ "type": "light_bulb", "labelDistance": 0.8 }] },
          { "start": [2.6, 2], "end": [2.6, 0], "components": [{ "type": "light_bulb", "labelDistance": 0.8 }] },
          { "start": [4, 2], "end": [4, 0], "components": [{ "type": "light_bulb", "labelDistance": 0.8 }] },
          { "start": [4, 0], "end": [0, 0] }
        ],
        "padding": 0.5
      }
    }
  ],
  "cssWidth": "100%"
}
```
5. Confronta la resistenza del ramo 1 con quella del ramo 2. Un ramo è una sezione di un circuito. Quale ha la resistenza minore?
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
6. Ordina la differenza di potenziale tra i punti 1 e 2, i punti 3 e 4, e i punti 4 e 5 nel circuito mostrato sotto, dalla più alta alla più bassa. (a) 1 e 2; 3 e 4; 4 e 5
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
7. Confronta la luminosità della lampadina nel circuito 1 con quella nel circuito 2. Quale lampadina è più luminosa?
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
8. Confronta la corrente al punto 1 con la corrente al punto 2. Quale punto ha la corrente maggiore?
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
9. Confronta la luminosità delle lampadine A e B nel circuito 1 con la luminosità della lampadina C nel circuito 2. Quale lampadina o lampadine sono le più luminose?
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
10. Perché le luci in casa si accendono quasi istantaneamente?
	- **(a)** Le cariche sono già nel filo. Quando il circuito viene completato, c'è un rapido riposizionamento delle cariche superficiali nel circuito.
	- **(b)** Le cariche immagazzinano energia. Quando il circuito viene completato, l'energia viene rilasciata.
	- **(c)** Le cariche nel filo viaggiano molto velocemente.
	- **(d)** I circuiti in una casa sono cablati in parallelo. Quindi, una corrente sta già scorrendo.
11. Considera la potenza erogata a ciascuno dei resistori mostrati nei circuiti sottostanti. Quale circuito o circuiti ricevono la minor potenza?
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
12. Come cambia la resistenza tra i terminali quando l'interruttore viene chiuso?
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
13. Cosa succede alla differenza di potenziale tra i punti 1 e 2 se la lampadina A viene rimossa?
	- **(a)** Aumenta
	- **(b)** Diminuisce
	- **(c)** Rimane la stessa
```circuit
{
  "segments": [
    { "start": [0, 0], "end": [3, 0], "components": [{ "type": "light_bulb" } ] },
    { "end": [3, 1] },
    { "end": [0, 1], "components": [{ "type": "light_bulb" }] },
    { "end": [0, 0] },
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
14. Confronta la luminosità della lampadina A nel circuito 1 con la lampadina A nel circuito 2. Quale lampadina è più fioca?
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
          { "start": [2, 0], "end": [2, 2], "components": [{ "type": "light_bulb", "label": "A" }] },
          { "start": [4, 0], "end": [4, 2], "components": [{ "type": "light_bulb", "label": "B" }] }
        ]
      }
    }
  ]
}
```
15. Ordina le correnti ai punti 1, 2, 3, 4, 5 e 6 dalla più alta alla più bassa.
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
16. Cosa succede alla luminosità delle lampadine A e B quando viene collegato un filo tra i punti 1 e 2?
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
17. Il campo elettrico è nullo o diverso da zero all'interno del filamento di tungsteno della lampadina?
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
18. Confronta l'energia erogata al secondo alla lampadina nel circuito 1 con l'energia erogata al secondo alle lampadine nel circuito 2. Quale lampadina o lampadine hanno la minor energia erogata al secondo?
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
19. Immediatamente dopo l'apertura dell'interruttore, cosa succede alla resistenza della lampadina?
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
20. Se raddoppi la corrente attraverso una batteria, la differenza di potenziale ai capi della batteria raddoppia?
	- **(a)** Sì, perché la legge di Ohm dice V = IR.
	- **(b)** Sì, perché aumentando la resistenza, si aumenta la differenza di potenziale.
	- **(c)** No, perché raddoppiando la corrente, si riduce la differenza di potenziale della metà.
	- **(d)** No, perché la differenza di potenziale è una proprietà della batteria.
	- **(e)** No, perché la differenza di potenziale è una proprietà di tutto ciò che è nel circuito.
21. Confronta la luminosità della lampadina A nel circuito 1 con la lampadina A nel circuito 2. Quale lampadina è più luminosa?
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
22. Se aumenti la resistenza C, cosa succede alla luminosità delle lampadine A e B?
	- **(a)** A rimane uguale, B si affievolisce
	- **(b)** A si affievolisce, B rimane uguale
	- **(c)** A e B aumentano
	- **(d)** A e B diminuiscono
	- **(e)** A e B rimangono uguali
```circuit
{
  "segments": [
    { "start": [0, 0], "end": [5, 0], "components": [{ "type": "light_bulb", "label": "A" }, { "type": "resistor", "label": "B" }, { "type": "light_bulb", "label": "C" }] },
    { "end": [5, 1] },
    { "end": [0, 1], "components": [{ "type": "voltage_source" }] },
    { "end": [0, 0] }
  ]
}
```
22. Qual è la differenza di potenziale tra i punti A e B?
	- **(a)** 0 V
	- **(b)** 3 V
	- **(c)** 6 V
	- **(d)** 12 V
```circuit
{
  "segments": [
    { "start": [0, 0], "end": [5, 0], "components": [{ "type": "light_bulb" }, { "type": "switch" }, { "type": "light_bulb" }] },
    { "end": [5, 1] },
    { "end": [0, 1], "components": [{ "type": "voltage_source" }] },
    { "end": [0, 0] }
  ],
  "nodes": [
    { "pos": [1.8, 0], "label": "A" },
    { "pos": [5, 1], "label": "B", "labelSide": "right" }
  ]
}
```
22. Cosa succede alla luminosità delle lampadine A e B quando l'interruttore viene chiuso?
	- **(a)** A rimane uguale, B si affievolisce
	- **(b)** A più luminosa, B si affievolisce
	- **(c)** A e B aumentano
	- **(d)** A e B diminuiscono
	- **(e)** A e B rimangono uguali
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