# *Diode AKA pinout: 1=Anode1, 2=CommonCathode, 3=Anode2

[https://www.duncanamps.com/spice/diodes/diodeaka.sub](https://www.duncanamps.com/spice/diodes/diodeaka.sub)

> Site: **Duncanamps**

> Saved [`Wed, 29 Apr`](day://2026.04.29) at 21:26

---

```other
*=====================================================
*Diode AKA pinout: 1=Anode1, 2=CommonCathode, 3=Anode2
*=====================================================

*BAV70 MCE 2-27-96
* 70V 200mA 6ns Si Dual Switching Diode pkg:SOT-23 2,1,3
.SUBCKT XBAV70 1 2 3
D1 1 2 BAV70
D2 3 2 BAV70
.MODEL BAV70 D (IS=24.2N RS=42M N=2.18 BV=70 IBV=66U
+ CJO=1.11P VJ=.75 M=.333 TT=8.64N)
.ENDS XBAV70

*BAV74 MCE 2-27-96
* 50V 200mA 4ns Si Dual Switching Diode pkg:SOT-23 2,1,3
.SUBCKT XBAV74 1 2 3
D1 1 2 BAV74
D2 3 2 BAV74
.MODEL BAV74 D (IS=24.2N RS=42M N=2.18 BV=50 IBV=47U
+ CJO=1.11P VJ=.75 M=.333 TT=5.76N)
.ENDS XBAV74

*BAV170 MCE 2-27-96
* 70V 200mA 3us Si Dual Switching Diode pkg:SOT-23 2,1,3
.SUBCKT XBAV170 1 2 3
D1 1 2 BAV170
D2 3 2 BAV170
.MODEL BAV170 D (IS=473P RS=42M N=1.75 BV=70 IBV=1.3U
+ CJO=2.65P VJ=.75 M=.333 TT=4.32U)
.ENDS XBAV170

*MMBD6100 MCE 2-27-96
* 70V 200mA 4ns Si Dual Switching Diode pkg:SOT-23 2,1,3
.SUBCKT XMMBD6100 1 2 3
D1 1 2 MMBD6100
D2 3 2 MMBD6100
.MODEL MMBD6100 D (IS=24.2N RS=42M N=2.18 BV=70 IBV=66U
+ CJO=1.11P VJ=.75 M=.333 TT=5.76N)
.ENDS XMMBD6100

*MSD6100 MCE 2-27-96
*100V 200mA 4ns Si Dual Switching Diode pkg:SOT-23 2,1,3
.SUBCKT XMSD6100 1 2 3
D1 1 2 MSD6100
D2 3 2 MSD6100
.MODEL MSD6100 D (IS=473P RS=42M N=1.75 BV=100 IBV=5U
+ CJO=1.98P VJ=.75 M=.333 TT=5.76N)
.ENDS XMSD6100
```