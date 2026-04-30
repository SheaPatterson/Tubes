# Programable Unijunction Transistor

[https://www.duncanamps.com/spice/miscsemi/2n6702.sub](https://www.duncanamps.com/spice/miscsemi/2n6702.sub)

> Site: **Duncanamps**

> Saved [`Wed, 29 Apr`](day://2026.04.29) at 21:24

---

```other
*Default Programable Unijunction Transistor pkg: TO-92
.SUBCKT XPUT 1 2 3
Q1 2 4 3 NMOD
Q2 4 2 1 PMOD
.MODEL NMOD NPN()
.MODEL PMOD PNP()
.ENDS XPUT

*Programable Unijunction Transistor pkg: TO-226AA
.SUBCKT X2N6702 1 2 3
Q1 2 4 3 NMOD
Q2 4 2 1 PMOD
.MODEL NMOD NPN(IS=5E-15 VAF=100 IKF=0.005 ISE=1.85E-12 NE=1.45 
+ RB=10 RE=0.5 RC=0.5 CJE=3.5E-11 VJE=0.75 CJC=1.1E-11 VJC=0.75 TR=4.76E-8 
+ VJS=0.75 )
.MODEL PMOD PNP(IS=2E-15 VAF=100 IKF=0.005 ISE=1.9E-12 RB=10 RE=0.5 
+ RC=0.5 CJE=3.5E-11 VJE=0.75 TF=1.6E-8 CJC=1.1E-11 VJC=0.75 TR=5.1E-8 
+ VJS=0.75 )
.ENDS X2N6702
```