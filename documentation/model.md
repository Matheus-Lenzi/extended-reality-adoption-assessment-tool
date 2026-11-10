# The model

A staged diagnostic pipeline that helps an industrial organisation decide whether and how to
adopt extended reality for one task, before anything is bought or built.

## Three roles

Every assessment is answered by three roles, each from their own point of view. Several people can
answer as the same role, and their answers are averaged.

| Role | Who they are |
| --- | --- |
| **Adopter** | The people who do the task today, or would do it with XR |
| **Developer** | Whoever builds or supplies the XR hardware and software |
| **Integrator** | Whoever installs it in operations, connects it and trains people |

## Four layers

The layers are the edges between those roles, not steps in a queue. They run in parallel and none
gates another. No layer produces a verdict on its own and the layers are never merged into one score.

| Layer | Relationship | Output |
| --- | --- | --- |
| **1 · Task and technology** | Adopter ↔ Developer | A fit score out of 10, plus flags |
| **2 · Organisation** | Integrator | Flags only |
| **3 · Human acceptance** | Integrator ↔ Adopter | Flags, including one direction of the gap between what management expects and what the workforce reports |
| **4 · Ecosystem** | Across organisations | Flags about the position to take with partners |

## The configuration gate

Before anything else, two questions decide how many organisations hold the three roles: who supplies
the technology, and who installs it. They change which questions are asked at all.

| Configuration | Organisations | Effect |
| --- | --- | --- |
| **A** | One, doing everything in house | Layer 4 is skipped except the market question |
| **B1 / B2** | Two | Everything is asked |
| **C** | Three | Everything is asked |

## The fit score

Layer 1 compares what the task needs against what the equipment delivers, across eight dimensions:
danger, distraction, auditory, visual, haptic, actions, knowledge and expertise. Each dimension
scores `required × delivered ÷ 10` from the averaged answers, and the fit score is the average of the
eight. If any of the 16 inputs is missing the score is not shown at all, rather than computed from a
part of the answers.

The score has **no threshold**. The research has not defined one, so the tool reports the number and
does not turn it into a verdict.

## What the report says

The report groups the raised flags by layer, in plain language, and names the role that should act on
each one. It states counts as `2 of 4`, never as a percentage, and never shows a named answer. Free text is
printed as written, and with a single respondent a count of `1 of 1` is that one person.
An optional summary, written by a language model from the raised flags and the free text, is stored
once and shown to every later reader in English and German.
