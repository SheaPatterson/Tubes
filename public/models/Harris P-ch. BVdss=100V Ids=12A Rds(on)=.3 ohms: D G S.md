# Harris P-ch. BVdss=100V Ids=12A Rds(on)=.3 ohms: D G S

[https://www.duncanamps.com/spice/mosfets/pemossu3.sub](https://www.duncanamps.com/spice/mosfets/pemossu3.sub)

> Site: **Duncanamps**

> Saved [`Wed, 29 Apr`](day://2026.04.29) at 21:29

---

```other
* Harris P-ch. BVdss=100V Ids=12A Rds(on)=.3 ohms: D G S
*Harris 100V 12A
.SUBCKT XIRF9530 10 20 30
M1 4 1 5 5 DMOS L=1U W=1U
RG 20 1 21.4
RD 10 4 .117
RDS 4 5 2.54MEG
CGD 7 4 787P
RCG 7 4 10MEG
MCG 7 9 1 1 SW
ECG 9 1 1 4 1
DGD 6 1 DCGD
MDG 6 8 4 4 SW
EDG 8 4 4 1 1
DDS 4 5 DSUB
LS 5 30 7.5N
.MODEL DMOS PMOS (LEVEL=3 VMAX=6.6MEG THETA=220M VTO=-3.2
+ KP=3.2 RS=8.25M IS=504F CGSO=400U)
.MODEL SW PMOS (LEVEL=3 VTO=0 KP=20)
.MODEL DCGD D (CJO=787P M=.5 VJ=.41)
.MODEL DSUB D (IS=504F RS=.513 BV=100 IBV=.001
+ VJ=.8 M=.4 CJO=802P TT=432N)
.ENDS XIRF9530

*ZETEX ZVP2106 Mosfet Spice Subcircuit Nodes D G S Last revision 3/86
*ZETEX 60V 280mA pkg:TO-92
.SUBCKT XZVP2106 3 4 5
M1 3 2 5 5 MP2106 L=1 W=1
RG 4 2 160
RL 3 5 1.2E8
D1 3 5 DP2106
.MODEL MP2106 PMOS VTO=-3.193 RS=2.041 RD=0.697 IS=1E-15 KP=0.277
+CGSO=47E-12 CGDO=10E-12 CBD=105E-12 PB=1 LAMBDA=1.2E-2
.MODEL DP2106 D IS=2E-13 RS=0.309
.ENDS XZVP2106

*ZETEX ZVP2106G Mosfet Spice Subcircuit Nodes D G S Last revision 3/86
*ZETEX 60V 450mA pkg:SOT-223
.SUBCKT XZVP2106G 3 4 5
M1 3 2 5 5 MP2106 L=1 W=1
RG 4 2 160
RL 3 5 1.2E8
D1 3 5 DP2106
.MODEL MP2106 PMOS VTO=-3.193 RS=2.041 RD=0.697 IS=1E-15 KP=0.277
+CGSO=47E-12 CGDO=10E-12 CBD=105E-12 PB=1 LAMBDA=1.2E-2
.MODEL DP2106 D IS=2E-13 RS=0.309
.ENDS XZVP2106G

*ZETEX ZVP3306 Mosfet Spice Subcircuit Nodes D G S Last revision 12/85
*ZETEX 60V 160mA pkg:TO-92
.SUBCKT XZVP3306 3 4 5
M1 3 2 5 5 P3306M L=1 W=1
RG 4 2 252
RL 3 5 1.2E8
D1 3 5 P3306D
.MODEL P3306M PMOS VTO=-2.875 RS=5.227 RD=7.524 IS=1E-15 KP=.145
+CGSO=28E-12 CGDO=3E-12 CBD=35E-12 PB=1 LAMBDA=6.67E-3
.MODEL P3306D D IS=5E-12 RS=.768
.ENDS XZVP3306

* Copyright notice for all models labeled "ZETEX":
*
* (C) 1992 ZETEX PLC
*
* The copyright in these models and the designs embodied belong
* to Zetex PLC ("Zetex"). They are supplied free of charge by
* Zetex for the purpose of research and design and may be used or
* copied intact (including this notice) for that purpose only.
* All other rights are reserved. The models are believed accurate
* but no condition or warranty as to their merchantability or
* fitness for purpose is given and no liability in respect of any
* use is accepted by Zetex PLC, its distributors or agents.
*
*
* Zetex PLC, Fields New Road, Chadderton, Oldham OL9 8NP U.K.
```