# 12AU7A Triode

[https://tdsl.duncanamps.com/dcigna/tubes/spice/12au7a.inc](https://tdsl.duncanamps.com/dcigna/tubes/spice/12au7a.inc)

> Site: **Tdsl Duncanamps**

> Saved [`Wed, 29 Apr`](day://2026.04.29) at 21:18

---

```other
* 12AU7A Triode PSpice Model 8/96, Rev. 1.0 (fp)
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
* 12AU7A/ECC82, 6680, 6C4/EC90, 12DW7/7247 (Unit #2);
* at the following conditions:
* Plate voltage : 0..400V
* Grid voltage : 0..-18V
* Cathode current: 0..30mA
*
*
* Connections: Plate
* | Grid
* | | Cathode
* | | |
.SUBCKT 12AU7A P G K
E1 2 0 VALUE={V(P,K)+18.28*V(G,K)}
R1 2 0 1.0K
Gp P K VALUE={10.88E-6*(PWR(V(2),1.5)+PWRS(V(2),1.5))/2}
Cgk G K 1.6P
Cgp G P 1.5P
Cpk P K 0.5P
.ENDS 12AU7A
```