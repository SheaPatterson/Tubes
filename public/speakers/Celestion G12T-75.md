# Celestion G12T-75

[https://www.duncanamps.com/spice/loudspeakers/g12t75.inc](https://www.duncanamps.com/spice/loudspeakers/g12t75.inc)

> Site: **Duncanamps**

> Saved [`Wed, 29 Apr`](day://2026.04.29) at 20:58

---

```other
*-----------------------------------------------------------------------
* Filename:		G12T75.inc V3 3/7/97
* Simulator:		PSpice
* Device type:		Loudspeaker
* Device model:		Celestion G12T-75
*
* Author:		Duncan Munro
* Date:			29/6/97
* Copyright:		(C)1997 DDS
*
* The model reflects the change of impedance as presented to
* the amplifier with frequency.
*
* Please note that this model is provided "as is" and
* no warranty is provided in respect of its suitability
* for any application.
*
* This model is provided for educational and non-profit use.
*
* The model is not endorsed or supported by Celestion. All trademarks
* acknowledged.
*
* Email queries to duncan@muffy.demon.co.uk
*
* Pins A Terminal 1
* B Terimal 2
*
*-----------------------------------------------------------------------

.SUBCKT G12T75 A B
R_RL A $N_0002 7.5 
R_RD1 $N_0002 $N_0003 15 
L_LD1 $N_0003 $N_0002 20mH 
C_CD1 $N_0002 $N_0003 190u 
R_RD2 $N_0003 $N_0004 0.5 
C_CD2 $N_0003 $N_0004 50u 
L_LD2 $N_0004 $N_0003 100uH 
L_LD3 B $N_0004 100uH 
R_RD3	 B $N_0004 20
.ENDS 
```