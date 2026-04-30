# KT88 Beam Power Tube

[https://tdsl.duncanamps.com/dcigna/tubes/spice/kt88.inc](https://tdsl.duncanamps.com/dcigna/tubes/spice/kt88.inc)

> Site: **Tdsl Duncanamps**

> Saved [`Wed, 29 Apr`](day://2026.04.29) at 21:20

---

```other
* KT88 Beam Power Tube PSpice Model 8/96, Rev. 1.0 (fp)
*
* -------------------------------------------------------------------
* This model is provided "as is", with no warranty of any kind,
* either expressed or implied, about the suitability or fitness
* of this model for any particular purpose. Use of this model
* shall be entirely at the user's own risk.
*
* For a discussion about vacuum tube modeling please refer to:
* W. Marshall Leach, jr: "SPICE Models for Vacuum-Tube Amplifiers";
* J. Audio Eng. Soc., Vol 43, No 3, March 1995.
* -------------------------------------------------------------------
*
* This model is valid for the following tubes (within max. ratings):
* KT88 6550.
* --------------+-----------------------
* Plate Dissip. : 35W 35W
* Screen Input : 6W 6W
* Plate Voltage : 800V 600V
* Screen Voltage: 600V 400V
*
* at the following conditions:
* Plate voltage : 0..800V
* Screen voltage : 0..600V
* Grid voltage : 0..-60V
* Cathode current: 0..500mA
*
*
* Connections: Plate
* | Screen Grid
* | | Control Grid
* | | | Cathode
* | | | |
.SUBCKT KT88 P S G K
Esp 2 0 VALUE={V(P,K)+24.49*V(S,K)+189.9*V(G,K)}
E1 3 2 VALUE={8.301E-7*(PWR(V(2),1.5)+PWRS(V(2),1.5))/2}
E2 3 4 VALUE={8.301 E-7*PWR(24.49*V(S,K),1.5)*V(P,K)/40}
E3 5 4 VALUE={(1-V(4,2)/ABS(V(4,2)+0.001))/2}
R1 5 0 1.0K
Gk S K VALUE={V(3,2)}
Gp P S VALUE={0.95*(V(3,4)*(1-V(5,4))+V(3,2)*V(5,4))}
Cgk G K 8.0P
Cgs G S 8.0P
Cgp G P 1.2P
Cpk P K 12P
.ENDS KT88
```