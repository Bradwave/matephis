---
title: Appunti su serie di Fourier
feed: hide
---
Tutti i disegni bidimensionali realizzabili a mano libera e composti da una sola linea chiusa e continua — ovvero quei disegni modellizzabili tramite una funzione del tipo $f : t \in \mathbb{R} \longmapsto (x, y) \in \mathbb{R}^2$ — si possono rappresentare con una concatenazione infinita di punti rotanti, ovvero una serie di Fourier.

L'obiettivo di questo laboratorio è esplorare il significato della **serie di Fourier**:

\\[f(t) = \sum_{n = 0}^{+\infty} \underbrace{(R_n \cos (v_n t + \varphi_n), R_n \sin(v_n t + \varphi_n))}_{\text{punto rotante} \; (x_n(t), \, y_n(t))}\\]

dove:
- $v_n$ è la velocità angolare del punto rotante $(x_n(t), y_n(t))$, che assume solo valori discreti $0, +1, -1, +2, -2, \, \dotsc$;
- $R_n$ è il raggio di rotazione;
- $\varphi_n$ è la fase (ovvero l'angolo di partenza).

Questa tripletta di valori può essere riassunta in un unico oggetto matematico, un numero complesso, detto coefficiente di Fourier $\hat{f}_n = r_n \cdot e^{i\phi_n}$.

Usando i numeri complessi (che, con le dovute precauzioni, si possono far corrispondere ai punti del piano), la serie di Fourier diventa $f(t) = \sum_{n = -\infty}^{+\infty} \hat{f}_n \cdot e^{i n t}$, dove $e^{int}$ corrisponde a un punto rotante con frequenza di rotazione $n$.

Perché la serie converge a qualsiasi figura chiusa disegnabile a mano libera? Perché i cerchi rotanti formano una base (infinita e ortonormale) per lo spazio definito da tutte le possibili figure. Così come i vettori bidimensionali possono essere costruiti a partire da due vettori ortonormali di base $v = (1, 0)$ e $u = (0, 1)$, ad esempio $(5, 3) = 5v + 3u$, anche le figure disegnate possono essere costruite a partire da cerchi rotanti.