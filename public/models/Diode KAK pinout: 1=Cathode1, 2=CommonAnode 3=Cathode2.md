# Diode KAK pinout: 1=Cathode1, 2=CommonAnode 3=Cathode2

[https://www.duncanamps.com/spice/diodes/diodekak.sub](https://www.duncanamps.com/spice/diodes/diodekak.sub)

> Site: **Duncanamps**

> Saved [`Wed, 29 Apr`](day://2026.04.29) at 21:27

---

```other
*======================================================
*Diode KAK pinout: 1=Cathode1, 2=CommonAnode 3=Cathode2
*======================================================

*BAW56 MCE 2-27-96
* 70V 200mA 6ns Si Dual Switching Diode pkg:SOT-23 2,1,3
.SUBCKT XBAW56 1 2 3
D1 2 1 BAW56
D2 2 3 BAW56
.MODEL BAW56 D (IS=24.2N RS=42M N=2.18 BV=70 IBV=66U
+ CJO=1.65P VJ=.75 M=.333 TT=8.64N)
.ENDS XBAW56

*BAW156 MCE 2-27-96
* 70V 200mA 6ns Si Dual Switching Diode pkg:SOT-23 2,1,3
.SUBCKT XBAW156 1 2 3
D1 2 1 BAW156
D2 2 3 BAW156
.MODEL BAW156 D (IS=473P RS=42M N=1.75 BV=70 IBV=1.3U
+ CJO=2.65P VJ=.75 M=.333 TT=4.32U)
* 70 Volt .2 Amp 3 us Si Diode 02-27-1996
.ENDS XBAW156

*MMBD2835 MCE 2-27-96
* 35V 100mA 4ns Si Dual Switching Diode pkg:SOT-23 2,1,3
.SUBCKT XMMBD2835 1 2 3
D1 2 1 MMBD2835
D2 2 3 MMBD2835
.MODEL MMBD2835 D (IS=24.4N RS=42M N=2.18 BV=35 IBV=34U
+ CJO=1.65P VJ=.75 M=.333 TT=5.76N)
.ENDS XMMBD2835

*MMBD2836 MCE 2-27-96
* 75V 100mA 4ns Si Dual Switching Diode pkg:SOT-23 2,1,3
.SUBCKT XMMBD2836 1 2 3
D1 2 1 MMBD2836
D2 2 3 MMBD2836
.MODEL MMBD2836 D (IS=24.4N RS=42M N=2.18 BV=75 IBV=71U
+ CJO=1.65P VJ=.75 M=.333 TT=5.76N)
.ENDS XMMBD2836

*MSD6150 MCE 2-27-96
* 70V 200mA 100ns Si Dual Diode pkg:TO-92 2,1,3
.SUBCKT XMSD6150 1 2 3
D1 2 1 MSD6150
D2 2 3 MSD6150
.MODEL MSD6150 D (IS=473P RS=42M N=1.75 BV=70 IBV=1.3U
+ CJO=6.63P VJ=.75 M=.333 TT=144N)
.ENDS XMSD6150
```