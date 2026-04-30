# 12BH7A Triode

[https://tdsl.duncanamps.com/dcigna/tubes/spice/12bh7a.inc](https://tdsl.duncanamps.com/dcigna/tubes/spice/12bh7a.inc)

> Site: **Tdsl Duncanamps**

> Saved [`Wed, 29 Apr`](day://2026.04.29) at 21:18

---

```other
* 12BH7A Triode PSpice Model 9/96, Rev. 1.0 (fp)
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
* This model is valid for the following tubes:
* 12BH7A;
* at the following conditions:
* Plate voltage : 0..600V
* Grid voltage : 0..-35V
* Cathode current: 0..50mA
*
*
* Connections: Plate
* | Grid
* | | Cathode
* | | |
.SUBCKT 12BH7A P G K
E1 2 0 VALUE={V(P,K)+16.64*V(G,K)}
R1 2 0 1.0K
Gp P K VALUE={22.34E-6*(PWR(V(2),1.5)+PWRS(V(2),1.5))/2}
Cgk G K 3.2P
Cgp G P 2.6P
Cpk P K 0.5P
.ENDS 12BH7A
```