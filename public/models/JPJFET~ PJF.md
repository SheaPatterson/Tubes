# JPJFET~ PJF

[https://www.duncanamps.com/spice/jfet/pjfet.mod](https://www.duncanamps.com/spice/jfet/pjfet.mod)

> Site: **Duncanamps**

> Saved [`Wed, 29 Apr`](day://2026.04.29) at 21:13

---

```other
*===========================
*PJFET Pinout: 1=D, 2=G, 3=S
*===========================

*PJFET
*Default P-Ch J-FET parameters pkg:TO-92 2,1,3
.MODEL JPJFET~ PJF()

*2N5460
*Motorola Dep-Mode 20V 20mA 35.3ohm pkg:TO-92 2,1,3
.MODEL J2N5460 PJF(VTO=-3.2 BETA=0.0017 LAMBDA=0.00563 RD=49.4 RS=44.5 
+ CGS=9E-12 CGD=4E-12 IS=1.95E-15 KF=1.104E-17 )
```