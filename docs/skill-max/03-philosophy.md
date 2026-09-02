# Stacked Register

*The design philosophy for Stage 3. Written first, then expressed in code — `canvas-design`'s
discipline, applied to the artifact rather than to a separate canvas. The skill's own output contract
is a standalone `.pdf`/`.png` art object; producing one would have been ceremony, because the thing
that needs composing is six scenes inside a 400KB explainer. The philosophy pass is kept because it
is the part that stops the result reading as templated.*

---

## The movement

**Stacked Register.** Evidence accumulates upward in bands, not outward in containers.

A scientific plate does not put its three findings in three boxes side by side. It stacks registers —
a specimen row, a measurement row, a note — and lets the horizontal rule between them do the work a
border would do badly. The eye descends through registers in order, which is also the order of the
argument. Nothing is boxed, because a box says *these things are separate*; a register says *this
follows from that*.

## Space and form

The frame is near-square, so the composition must be near-square. Content that spreads to an aspect
of 2.5 has chosen to be a row when it could have been two registers, and the price is paid twice:
once in the empty band above, once in the empty band below. Two registers of 400 units beat one row
of 850. **The vertical is not a leftover; it is half the available argument.**

Form comes from the object being described, never from a container holding a description of it. A
tier of service is not a rectangle of a certain height — it is a depth of engagement, and depth is
drawn as strata, as an instrument's graduations, as a stack that literally sits on the one below. A
rounded rectangle is what you draw when you have not yet decided what the thing is.

## Rule and register

The horizontal rule is the primary structural mark: `LINE #DCD5C6` at 1–1.3 units, `DIM #8A8474`
inside an illustration. It separates without enclosing, which is the entire distinction between a
plate and a dashboard. Where a border would trap content, a rule releases it — the register above and
the register below share the paper, and the paper is the ground everything sits on.

Alignment is left, on a common axis, so that three registers read as one column of evidence rather
than three centred islands. Centred text between two ragged edges is the weakest setting available
and it is what a box invites. **An axis is a decision; centring is the absence of one.**

## Colour as register, not as label

Tint marks a register's depth, never its identity. `#EFEAE0`, `#DCEBF5`, `#E7F2F1` already exist in
this file as scene tints and they are enough: applied as a low band behind a register rather than as
a filled card around it, the same three values stop reading as three categories and start reading as
one gradient of commitment. Ink and mute carry all the type. Alarm is spent once per scene at most.

## Scale and rhythm

Type does the hierarchy, not size of container: title at 13/700, body at 10.5/400, eyebrow at 6.2–6.8
mono with .14–.18em tracking. One title per scene, one figure allowed to be large. A register is 60
to 130 units tall and its neighbours are the same, so the rhythm is regular and the exception —
the register that is twice as tall — means something.

The punchline belongs *in* the last register or on the rule beneath it, not floating 200 units below
in open paper. A line of text with nothing near it has been abandoned, not emphasised.

## What master-level execution means here

It means every coordinate is derived, not chosen. It means a label's position comes from
`getComputedTextLength()` and is re-derived after the type scale changes, because this file has
already had fifteen bugs of exactly that shape. It means the mobile branch is composed, not scaled
down. It means the ascent that is claimed is the ascent that is drawn, and if a dashed line and a
staircase both assert the same rise, one of them is decoration and it goes.

**Painstaking, here, is arithmetic.** Not more marks — fewer marks, each one placed where a
measurement says it belongs. The scene should look as though someone spent a long time removing
things.
