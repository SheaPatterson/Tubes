# Celestion Vintage 10

[https://www.duncanamps.com/spice/loudspeakers/vint10.inc](https://www.duncanamps.com/spice/loudspeakers/vint10.inc)

> Site: **Duncanamps**

> Saved [`Wed, 29 Apr`](day://2026.04.29) at 20:57

---

```other
*-----------------------------------------------------------------------
* Filename:		VINT10.inc V3 3/7/97
* Simulator:		PSpice
* Device type:		Loudspeaker
* Device model:		Celestion Vintage 10
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

.SUBCKT VINT10 A B
R_RL A $N_0002 7.5 
R_RD1 $N_0002 $N_0003 12.5 
L_LD1 $N_0003 $N_0002 20mH 
C_CD1 $N_0002 $N_0003 195u 
R_RD2 $N_0003 $N_0004 0.5 
C_CD2 $N_0003 $N_0004 50u 
L_LD2 $N_0004 $N_0003 100uH 
L_LD3 B $N_0004 120uH 
R_RD3	 B $N_0004 20
.ENDS 
```