# 5AR4 Rectifier diode

[https://tdsl.duncanamps.com/dcigna/tubes/spice/5ar4.inc](https://tdsl.duncanamps.com/dcigna/tubes/spice/5ar4.inc)

> Site: **Tdsl Duncanamps**

> Saved [`Wed, 29 Apr`](day://2026.04.29) at 21:15

---

```other
* 5AR4 Rectifier diode PSpice Model 8/96, Rev. 1.0 (fp)
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
* 5AR4/GZ34;
* at the following conditions:
* Plate current : 0..1.2A
*
*
* Connections: Plate
* | Cathode
* | |
.SUBCKT 5AR4 P K
GP P K VALUE={3.96E-3*(PWR(V(P,K),1.5)+PWRS(V(P,K),1.5))/2}
.ENDS 5AR4
```