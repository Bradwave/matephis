---
title: Matephis Circuit System
feed: hide
tags:
  - test
  - circuiti
circuit: true
---

Questa pagina serve come test e documentazione per il sistema di circuiti generati via codice (JSON). Tutti i circuiti sono renderizzati da `matephis-circuit.js`.

## 1. Circuito Serie Semplice

Un circuito basilare con una batteria, un interruttore, una resistenza e un LED in serie.

```circuit
{
  "segments": [
    { "start": [0,0], "end": [0,2], "components": [{ "type": "voltage_source", "label": "12V" }] },
    { "start": [0,2], "end": [2,2], "components": [{ "type": "switch", "state": "closed", "label": "SW1" }] },
    { "start": [2,2], "end": [2,0], "components": [{ "type": "resistor", "label": "R1 = 10Ω" }] },
    { "start": [2,0], "end": [0,0], "components": [{ "type": "light_bulb", "label": "L1" }] }
  ]
}
```

## 2. Circuito con Parallelo

Un circuito che ramifica in parallelo per dimostrare il layout composizionale.

```circuit
{
  "segments": [
    { "start": [0,0], "end": [0,3], "components": [{ "type": "voltage_source", "label": "9V" }] },
    { "start": [0,3], "end": [2,3] },
    { "start": [2,3], "end": [2,0], "components": [{ "type": "resistor", "label": "R_top" }] },
    { "start": [2,3], "end": [4,3] },
    { "start": [4,3], "end": [4,0], "components": [{ "type": "capacitor", "label": "C_mid" }] },
    { "start": [4,3], "end": [6,3] },
    { "start": [6,3], "end": [6,0], "components": [{ "type": "diode", "label": "D_bot" }] },
    { "start": [0,0], "end": [6,0] }
  ],
  "nodes": [ { "pos": [2,3] }, { "pos": [4,3] }, { "pos": [2,0] }, { "pos": [4,0] } ]
}
```

## 3. Circuito con Simulazione Interattiva (MNA)

Un circuito più complesso per testare la corretta renderizzazione di bivi e interruttori. Provate a cambiare lo `state` degli interruttori nel codice!

```circuit
{
  "segments": [
    { "start": [0,0], "end": [0,3], "components": [{ "type": "voltage_source", "label": "24V" }] },
    { "start": [0,3], "end": [2,3], "components": [{ "type": "switch", "state": "closed", "label": "SW_Main" }] },
    { "start": [2,3], "end": [2,0], "components": [{ "type": "resistor", "label": "R1 = 5Ω", "position": 0.3 }, { "type": "light_bulb", "label": "L1", "position": 0.7 }] },
    { "start": [2,3], "end": [4,3] },
    { "start": [4,3], "end": [4,0], "components": [{ "type": "switch", "state": "open", "label": "SW2", "position": 0.3 }, { "type": "resistor", "label": "R2 = 10Ω", "position": 0.7 }] },
    { "start": [0,0], "end": [4,0] }
  ],
  "nodes": [ { "pos": [2,3] }, { "pos": [2,0] } ]
}
```

## 4. Test Diodo e Circuito RC

Un test per dimostrare i simboli di diodi e capacitori in serie con un interruttore.

```circuit
{
  "segments": [
    { "start": [0,0], "end": [0,3], "components": [{ "type": "voltage_source", "label": "5V" }] },
    { "start": [0,3], "end": [3,3], "components": [{ "type": "switch", "state": "closed", "label": "SW3" }] },
    { "start": [3,3], "end": [3,0], "components": [{ "type": "resistor", "label": "R3 = 100Ω", "position": 0.3 }, { "type": "capacitor", "label": "C1", "position": 0.7 }] },
    { "start": [3,0], "end": [0,0], "components": [{ "type": "diode", "label": "D1" }] }
  ]
}
```

## 5. Circuito con Parametri e Layout Configurabile

Cambiando l'attributo strutturale per renderizzare con bordi o centramento specifici, con un layout più complesso.

```circuit
{
  "cssWidth": "70%",
  "segments": [
    { "start": [0,0], "end": [0,2], "components": [{ "type": "voltage_source", "label": "12V" }] },
    { "start": [0,2], "end": [2,2], "components": [{ "type": "switch", "state": "closed", "label": "SW4" }] },
    { "start": [2,2], "end": [2,0], "components": [{ "type": "resistor", "label": "R" }] },
    { "start": [2,0], "end": [0,0], "components": [{ "type": "light_bulb", "label": "L1" }] }
  ]
}
```

## 6. Circuito a Corrente Alternata (AC)

## 6. Layout Complesso

Un altro esempio di renderizzazione complessa che chiuda un array di serie senza batteria.

```circuit
{
  "segments": [
    { "start": [0,0], "end": [0,2], "components": [{ "type": "ac_source", "label": "AC 220V" }] },
    { "start": [0,2], "end": [2,2], "components": [{ "type": "resistor", "label": "R1 = 100Ω" }] },
    { "start": [2,2], "end": [2,0], "components": [{ "type": "light_bulb", "label": "Lamp" }] },
    { "start": [2,0], "end": [0,0] }
  ]
}
```

## 7. Visualizzazione del Potenziale

## 7. Struttura Nidificata 

Un esempio per testare stringhe incassate profondamente con serie dentro parallelo dentro serie.

```circuit
{
  "segments": [
    { "start": [0,0], "end": [0,4], "components": [{ "type": "voltage_source", "label": "24V" }] },
    { "start": [0,4], "end": [2,4], "components": [{ "type": "switch", "state": "closed", "label": "SW1" }] },
    { "start": [2,4], "end": [2,0], "components": [{ "type": "resistor", "label": "R1 = 5Ω", "position": 0.3 }, { "type": "light_bulb", "label": "L1", "position": 0.7 }] },
    { "start": [2,4], "end": [4,4] },
    { "start": [4,4], "end": [4,0], "components": [{ "type": "switch", "state": "open", "label": "SW2", "position": 0.3 }, { "type": "resistor", "label": "R2 = 10Ω", "position": 0.7 }] },
    { "start": [0,0], "end": [4,0], "components": [{ "type": "resistor", "label": "R3 = 8Ω" }] }
  ],
  "nodes": [ { "pos": [2,4] }, { "pos": [2,0] } ]
}
```

## 8. Flessibilità del Layout (Placement)

Questo esempio dimostra come usare l'attributo `placement` per posizionare componenti sui vari lati (superiore, inferiore, sinistro, destro) della maglia principale per costruire forme esatte senza ricorrere ad array ramificati. 

I lati vengono riempiti in senso orario per formare un anello completo partendo dall'angolo inferiore-sinistro.

```circuit
{
  "segments": [
    { "start": [0,0], "end": [0,4], "components": [{ "type": "voltage_source", "label": "Batteria" }] },
    { "start": [0,4], "end": [4,4], "components": [{ "type": "resistor", "label": "R_top = 10Ω", "position": 0.3 }, { "type": "light_bulb", "label": "L_top", "position": 0.7 }] },
    { "start": [4,4], "end": [4,0], "components": [{ "type": "capacitor", "label": "C_right" }] },
    { "start": [4,0], "end": [0,0], "components": [{ "type": "switch", "state": "open", "label": "SW_bot", "position": 0.3 }, { "type": "diode", "label": "D_bot", "position": 0.7 }] }
  ]
}
```

## 9. Layout Multi-circuito

Uso del campo `circuits` per rendere più circuiti affiancati con etichette.

```circuit
{
  "circuits": [
    {
      "label": "Circuito 1",
      "circuit": {
        "segments": [
          { "start": [0,0], "end": [0,2], "components": [{ "type": "voltage_source" }] },
          { "start": [0,2], "end": [2,2], "components": [{ "type": "resistor", "label": "A" }] },
          { "start": [2,2], "end": [2,0] },
          { "start": [2,0], "end": [0,0] }
        ]
      }
    },
    {
      "label": "Circuito 2",
      "circuit": {
        "segments": [
          { "start": [0,0], "end": [0,2], "components": [{ "type": "voltage_source" }] },
          { "start": [0,2], "end": [2,2], "components": [{ "type": "resistor", "label": "A" }] },
          { "start": [2,2], "end": [4,2], "components": [{ "type": "resistor", "label": "B" }] },
          { "start": [4,2], "end": [4,0] },
          { "start": [4,0], "end": [0,0] }
        ]
      }
    },
    {
      "label": "Circuito 3",
      "circuit": {
        "segments": [
          { "start": [0,0], "end": [0,2], "components": [{ "type": "voltage_source" }] },
          { "start": [2,0], "end": [2,2], "components": [{ "type": "light_bulb", "label": "A" }] },
          { "start": [4,0], "end": [4,2], "components": [{ "type": "light_bulb", "label": "B" }] },
          { "start": [0,2], "end": [4,2] },
          { "start": [0,0], "end": [4,0] }
        ],
        "nodes": [ { "pos": [2,2] }, { "pos": [2,0] } ]
      }
    }
  ]
}
```
