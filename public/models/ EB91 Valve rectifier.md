# 6AL5 / EB91 Valve rectifier

[https://www.duncanamps.com/spice/valves/6al5.inc](https://www.duncanamps.com/spice/valves/6al5.inc)

> Site: **Duncanamps**

> Saved [`Wed, 29 Apr`](day://2026.04.29) at 21:16

---

```other
*-----------------------------------------------------------------------
* Filename:		6al5.inc 19/10/01
* Simulator:		PSpice
* Device type:		Valve rectifier
* Device model:		6AL5 / EB91
*
* Author:		Duncan Munro
* Date:			19/10/01
* Copyright:		(C)2001 Duncan Amplification
* 
* The following parameters are not modelled:
*
* (1) Heater
* (2) Reverse voltage breakdown
* (3) Saturation
* (4) Interelectrode capacitance
*
* Please note that this model is provided "as is" and
* no warranty is provided in respect of its suitability
* for any application.
*
* This model is provided for educational and non-profit use.
*
* Email queries to postmaster@duncanamps.com
*
*-----------------------------------------------------------------------

.SUBCKT 6AL5 A K
GP A K VALUE={18E-4*(PWR(V(A,K)+0.2,1.5)+PWRS(V(A,K)+0.2,1.5))/2}
.ENDS 6AL5


```