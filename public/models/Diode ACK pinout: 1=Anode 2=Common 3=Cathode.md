# Diode ACK pinout: 1=Anode 2=Common 3=Cathode

[https://www.duncanamps.com/spice/diodes/diodeack.sub](https://www.duncanamps.com/spice/diodes/diodeack.sub)

> Site: **Duncanamps**

> Saved [`Wed, 29 Apr`](day://2026.04.29) at 21:26

---

```other
*====================================================
*Diode ACK pinout: 1=Anode 2=Common 3=Cathode
*====================================================

*BAV99 MCE 2-27-96
* 70V 215mA 6ns Si Dual Switching Diode pkg:SOT-23 3,1,2
.SUBCKT XBAV99 1 2 3
D1 1 2 BAV99
D2 2 3 BAV99
.MODEL BAV99 D (IS=58.5N RS=42M N=2.34 BV=70 IBV=160U
+ CJO=762F VJ=.75 M=.333 TT=8.64N)
.ENDS XBAV99

*BAV199 MCE 2-27-96
* 70V 215mA 3us Si Dual Switching Diode pkg:SOT-23 3,1,2
.SUBCKT XBAV199 1 2 3
D1 1 2 BAV199
D2 2 3 BAV199
.MODEL BAV199 D (IS=510P RS=42M N=1.75 BV=70 IBV=1.4U
+ CJO=2.65P VJ=.75 M=.333 TT=4.32U)
.ENDS XBAV199

*MMBD7000 MCE 2-27-96
* 70V 215mA 3us Si Dual Switching Diode pkg:SOT-23 3,1,2
.SUBCKT XMMBD7000 1 2 3
D1 1 2 MMBD7000
D2 2 3 MMBD7000
.MODEL MMBD7000 D (IS=24.2N RS=42M N=2.18 BV=100 IBV=94U
+ CJO=760F VJ=.75 M=.333 TT=5.76N)
* 100 Volt .2 Amp 4M us Si Diode 02-27-1996
.ENDS XMMBD7000
```