# 6V6GT Power beam tetrode

[https://www.duncanamps.com/spice/valves/dm6v6.inc](https://www.duncanamps.com/spice/valves/dm6v6.inc)

> Site: **Duncanamps**

> Saved [`Wed, 29 Apr`](day://2026.04.29) at 21:20

---

```other
*-----------------------------------------------------------------------
* Filename:		dm6v6.inc V2 12/10/97
* Simulator:		PSpice
* Device type:		Power beam tetrode
* Device model:		6V6GT
*
* Author:		Duncan Munro
* Date:			4/5/97
* Copyright:		(C)1997-2000 Duncan Amplification
*
*
* V2 [12/10/97]: Screen current limited to prevent screen current
*		 draw at Vs = 0.
* 
* The following parameters are not modelled:
*
* (1) Heater
* (2) Grid current is an approximation
*
* Please note that this model is provided "as is" and
* no warranty is provided in respect of its suitability
* for any application.
*
* This model is provided for educational and non-profit use.
*
* Email queries to postmaster@duncanamps.com
*
* Pins A Anode
* S Screen
* G Grid
* K Cathode
*
*-----------------------------------------------------------------------

.SUBCKT 6V6 A S G K
*
* Calculate contribution to cathode current
*
Eat	at	0	VALUE={0.636*ATAN(V(A,K)/10)}
Eme	me	0	VALUE={PWR(LIMIT{V(A,K),0,2000},1.5)/1300}
Egs	gs	0	VALUE={LIMIT{V(A,K)/600+V(S,K)/14+V(G,K)*0.65,0,1E6}}
Egs2	gs2	0	VALUE={PWRS(V(gs),1.5)*1.45E-3}
Ecath 	cc 	0 	VALUE={LIMIT{V(gs2)*V(at),0,V(me)}}
*
* Calculate anode current
*
Ga 	A 	K 	VALUE={V(cc)}
*
* Calculate screen current
*
Escrn	sc	0	VALUE={0.7*V(gs2)*(1.1-V(at))}
Gs 	S 	K	VALUE={V(sc)*LIMIT{V(S,K),0,10}/10}
*
* Grid current
*
Gg	G	K	VALUE={PWR(LIMIT{V(G,K)+1,0,1E6},1.5)*(1.25-V(at))*650E-6}
*
* Capacitances
*
Cg1	G	K	7.5p
Cak	A	K	9p
Cg1a	G	A	0.7p

.ENDS 

```