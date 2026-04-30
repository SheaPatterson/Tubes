# Generic Speaker

[Duncanamps](https://www.duncanamps.com/spice/loudspeakers/speaker.inc)

> Site: **Duncanamps**

> Saved [`Wed, 29 Apr`](day://2026.04.29) at 20:56

---

```other
* generic speaker simulation (8 ohm)
* as published in Stereophile Magazine.
*
* Donated by Jaime Arbona, converted to subcircuit form

.SUBCKT SPEAKER G $N_0002
R_R29 $N_0002 $N_0001 8 
R_R30 $N_0003 $N_0002 5 
R_R31 $N_0004 $N_0002 5.6 
C_C9 $N_0001 $N_0005 4.7uf 
C_C10 G $N_0003 3.3uf 
R_R32 $N_0006 $N_0005 0.5 
L_L16 $N_0004 $N_0007 0.5mH 
R_R33 $N_0009 $N_0008 100 
R_R34 $N_0008 G 39 
R_R35 $N_0008 $N_0010 0.6 
R_R36 $N_0008 $N_0011 0.9 
L_L17 $N_0011 $N_0009 1mH 
L_L18 G $N_0010 10mH 
R_R37 $N_0009 $N_0007 0.7 
L_L19 G $N_0006 0.3mH 
C_C11 G $N_0008 500uf 
.ENDS 
```