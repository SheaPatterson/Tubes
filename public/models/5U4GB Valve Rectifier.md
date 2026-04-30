# 5U4GB Valve Rectifier

[https://www.duncanamps.com/spice/valves/5u4gb.inc](https://www.duncanamps.com/spice/valves/5u4gb.inc)

> Site: **Duncanamps**

> Saved [`Wed, 29 Apr`](day://2026.04.29) at 21:15

---

```other
*-----------------------------------------------------------------------
* Filename:		5u4gb.inc 17/5/97
* Simulator:		PSpice
* Device type:		Valve rectifier
* Device model:		5U4GB
*
* Author:		Duncan Munro
* Date:			25/4/97
* Copyright:		(C)1997-2000 Duncan Amplification
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

.SUBCKT 5U4GB A K
GP A K VALUE={7.55E-4*(PWR(V(A,K),1.5)+PWRS(V(A,K),1.5))/2}
.ENDS 5U4GB


```