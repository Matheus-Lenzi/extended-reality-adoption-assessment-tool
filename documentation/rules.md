# Rules

The 53 rules of the four Rule Banks. Flag text is verbatim from the workbook.
The plain headline is what the report shows instead, written for a reader outside the research, with
`N of M` and `[Dimension]` filled in from the flag at the time. Six rules never fire today: RB-D1,
RB3-03, RB3-11, RB3-12, RB4-11 and RB4-12 are blocked or undecided, because the research that would
define them is not finished.

## Layer 1 · Task and technology (18)

### RB-A1
- Acts: Developer
- Reads: D1, T_D1, D2, T_D2, I1, T_I1, I2, T_I2, I3, T_I3, V1, T_V1, V2, T_V2, E1, T_E1
- Flag text: [Dimension] is needed but not currently deliverable -- the actual blocker, not general suitability
- Shown as: A needed capability is needed for this task, but the equipment cannot deliver it yet

### RB-B1
- Acts: Developer
- Reads: T_I1
- Flag text: Audio readiness has no supporting benchmark evidence (TR8 unsourced) -- treat as expert judgement
- Shown as: The audio rating is expert judgement. No published test backs it up

### RB-B2
- Acts: Developer
- Reads: T_I3
- Flag text: Haptic readiness has no supporting benchmark evidence (TR9 unsourced) -- treat as expert judgement
- Shown as: The touch-feedback rating is expert judgement. No published test backs it up

### RB-C1
- Acts: Integrator
- Reads: X1
- Flag text: High-complexity task flagged, but TTF_TOTAL is still equal-weighted, not complexity-adjusted -- read the total score as provisional
- Shown as: The fit score does not yet weigh complex tasks differently. Treat it as provisional

### RB-D1
- Acts: Integrator
- Flag text: Cybersickness/fatigue risk for this task's duration -- consider break schedules or an alternative modality
- Shown as: Motion sickness and fatigue risk for long sessions

### RB-D2
- Acts: Developer
- Reads: TR1
- Flag text: Poor device ergonomics for extended use -- operator-rejection risk independent of the DIVE fit score
- Shown as: Poor comfort for long wear. People may refuse the device

### RB-E1
- Acts: Adopter → Integrator
- Reads: X3, C1
- Flag text: Undocumented knowledge that people already depend on sharing -- highest-priority authoring/capture target
- Shown as: People rely on knowledge that is written down nowhere. Capture it first

### RB-E2
- Acts: Adopter
- Reads: X3, X4
- Flag text: Documentation exists but isn't practically retrievable -- fix indexing/access before investing in XR content authoring
- Shown as: The documents exist but are hard to find. Fix that before building content

### RB-E3
- Acts: Integrator
- Reads: X1, X5
- Flag text: High task complexity + high authoring effort compound each other -- expect content creation to be the real bottleneck, budget accordingly
- Shown as: Complex task plus heavy content work. Expect content to be the bottleneck

### RB-E4
- Acts: Integrator
- Reads: X7, X4
- Flag text: Frequent media breaks driven by retrieval friction, not missing knowledge -- an AR overlay pulling from the existing repository may resolve this without new content authoring
- Shown as: People break off to look things up. An overlay on existing files may be enough

### RB-F1
- Acts: Developer
- Reads: X8, T_I3
- Flag text: Task needs authentic behavior, but haptic readiness is weak -- risk of training the wrong muscle memory (e.g. snap-fit, torque feel)
- Shown as: The task needs realistic behaviour, but touch feedback is weak

### RB-F2
- Acts: Integrator
- Reads: X8, D1
- Flag text: High-stakes + high-authenticity task -- fidelity must be right or don't deploy; a low-fidelity version could be worse than no XR training at all
- Shown as: High stakes and high realism. A low-fidelity version could do more harm than none

### RB-G1
- Acts: Developer
- Reads: X9, V2
- Flag text: Training task with high knowledge-assessment need -- verify chosen software (TR5/TR6) supports scoring/certification, not just content delivery
- Shown as: This is training that has to be assessed. Check the software can score and certify

### RB-H1
- Acts: Integrator
- Reads: C1, X2
- Flag text: Collaboration + remote-feasibility together suggest a remote-expert-guidance use case, not just solo AR assistance
- Shown as: Teamwork plus remote working. This points to guidance from a remote expert, not one person working alone

### RB-I1
- Acts: Developer
- Reads: S1, S2
- Flag text: Dust/weather exposure -- ruggedized/sealed device required, narrows vendor options (cross-check TR7 vendor maturity)
- Shown as: Dust or weather on site. You need a sealed, rugged device, which narrows the choice

### RB-I2
- Acts: Developer
- Reads: S3
- Flag text: Extreme lighting conditions -- display readability at this brightness/darkness is a hardware constraint (cross-check TR3)
- Shown as: Very bright or very dark site. Screen readability is a hardware limit

### RB-I3
- Acts: Developer
- Reads: S5, I1
- Flag text: Noisy environment but task rated auditory fidelity as highly relevant -- audio-based interaction will be compromised; verify a visual/haptic alternative exists
- Shown as: Noisy place and audio matters. Make sure a visual or touch alternative exists

### RB-I4
- Acts: Developer
- Reads: S4, X6
- Flag text: Protective equipment (gloves) + hands-free/bimanual requirement -- gesture interaction may be degraded; consider voice or hardware-button alternatives
- Shown as: Gloves plus hands-free work. Gestures may be degraded. Consider voice or buttons

## Layer 2 · Organisation (10)

### RB2-01
- Acts: Integrator
- Reads: MP1, MP4
- Flag text: Top-priority expected benefit (cost savings) is currently unmeasurable -- establish a baseline metric before piloting, or this benefit will be unverifiable after the fact.
- Shown as: Cost saving is the top expected benefit, but nothing measures it yet

### RB2-02
- Acts: Integrator
- Reads: MP3
- Flag text: Benefits are expected, but leadership isn't committed to championing this through the pilot-to-scale transition -- expected benefits are unlikely to be realized without sustained leadership engagement.
- Shown as: Benefits are expected, but leadership is not committed to seeing it through

### RB2-03
- Acts: Integrator
- Reads: MP2, SC1
- Flag text: Branding was ranked the top strategic benefit, but internal social acceptance is low -- an unsupportive internal rollout undermines the external story you'd want to tell.
- Shown as: Employer branding is the top strategic benefit, but internal acceptance is low

### RB2-04
- Acts: Integrator
- Reads: SC1, SC2
- Flag text: Both social acceptance and organisational culture/infrastructure readiness are low -- a fundamental readiness gap, not a minor friction point. Address before piloting, not alongside it.
- Shown as: Both staff support and company readiness are low. Fix this before piloting

### RB2-05
- Acts: Integrator
- Reads: SC1, MP3
- Flag text: Social acceptance is currently low, but leadership is committed to championing this -- leadership engagement is the primary lever available; make change management a deliberate part of the rollout plan, not an afterthought.
- Shown as: Staff support is low, but leadership is committed. That is your main lever

### RB2-06
- Acts: Integrator
- Reads: FR3
- Flag text: Safety/ergonomic compliance cannot currently be ensured per business/legal requirements -- this is a BLOCKING issue, not a risk factor. Resolve before piloting.
- Shown as: Safety and ergonomic rules cannot be ensured. This blocks the pilot

### RB2-07
- Acts: Integrator
- Reads: IC1a
- Flag text: No existing infrastructure identified for this technology to connect to -- likely a greenfield integration; budget for infrastructure setup, not just software licensing.
- Shown as: There is no existing system to connect to. Budget for building it, not just licences

### RB2-08
- Acts: Integrator → Developer
- Reads: IC1a, IC2a
- Flag text: Infrastructure exists but isn't documented for integration purposes -- budget discovery time before trusting any integration timeline.
- Shown as: The systems are not documented for integration. Allow time to work them out

### RB2-09
- Acts: Integrator → Developer
- Reads: IC1b
- Flag text: Interface feasibility unconfirmed -- verify with your technical/IT team before committing to a timeline or budget.
- Shown as: Interface feasibility is not confirmed. Check with IT before you commit

### RB2-10
- Acts: Integrator
- Reads: IC2b
- Flag text: Capacity unconfirmed -- clarify with both the Integrator's technical team and the Adopter's IT/operations team which side (or both) still needs testing.
- Shown as: Network capacity is unconfirmed. Agree which side still has to test it

## Layer 3 · Human acceptance (13)

### RB3-01
- Acts: Integrator
- Reads: H1, H3
- Flag text: Low trialability combined with no organisational support plan risks resistance -- neither a trial nor support exists for employees adjusting to this technology.
- Shown as: No trial and no support plan. That combination invites resistance

### RB3-02
- Acts: Integrator
- Reads: H3, H3b
- Flag text: Organisational support is currently absent, and there's no plan for what kind of support would even be needed -- scope this before rollout, not during it.
- Shown as: No support in place, and no plan for what support would be needed

### RB3-03
- Acts: Integrator
- Reads: H4, H4b
- Flag text: Employees currently have low technology familiarity, and there's no training plan to address it -- expect a friciton at the beggining without deliberate plan for onboarding investment.
- Shown as: Staff are unfamiliar with the technology, and there is no training plan

### RB3-04
- Acts: Integrator
- Reads: H5
- Flag text: Competitor-adoption context hasn't been researched -- an easy gap to close (a quick market scan) before finalizing the resistance picture would give an idea of what has been done and what are the challenges other org faced and how it was solved
- Shown as: Competitor adoption is not known. A quick scan would close this

### RB3-05
- Acts: Integrator
- Reads: H6
- Flag text: Limited external support availability -- internal capability (H3/H4) becomes the primary safety net; if those are also weak, this compounds RB3-01/RB3-03.
- Shown as: Little help available inside or outside. Internal skills carry the risk

### RB3-06
- Acts: Integrator
- Reads: 
- Flag text: Job-security fear was reported by N of M adopters surveyed. Unlike other resistance factors, this specific fear does NOT resolve through trial periods or familiarity alone -- it needs direct communication/reassurance from leadership, not just hands-on exposure. Even a minority reporting this is worth direct follow-up, since it doesn't self-resolve with more exposure.
- Shown as: some of the adopters fear for their jobs. Exposure alone will not fix this

### RB3-07
- Acts: Integrator
- Reads: TR11
- Flag text: Privacy concern was reported by N of M adopters surveyed, and it's grounded in an actual device capability, not just perception -- this needs a real policy answer (what's tracked, who sees it, why), not just reassurance.
- Shown as: some of the have privacy worries, and the device really can track. You need a policy

### RB3-08
- Acts: Integrator
- Reads: TR11
- Flag text: Privacy concern was reported by N of M adopters surveyed, but the device doesn't actually have the monitoring capability being feared -- may be resolvable through clearer communication about what the device does and doesn't do.
- Shown as: some of the have privacy worries, but the device cannot track. Explain what it does

### RB3-09
- Acts: Integrator
- Reads: 
- Flag text: Shared-device hygiene concern was reported by N of M adopters surveyed -- establish and communicate a sanitization protocol. Reactions to shared-device use are heterogeneous in the source study, so this is worth addressing explicitly even if most respondents aren't concerned.
- Shown as: some of the adopters worry about sharing devices. Agree a cleaning routine

### RB3-10
- Acts: Integrator
- Reads: 
- Flag text: N of M surveyed adopters perceive use as mandatory, not voluntary -- voluntariness affects acceptance; if this can be framed with more employee input/choice, that may reduce resistance.
- Shown as: some of the see using this as mandatory, not their choice. That affects acceptance

### RB3-11
- Acts: Integrator
- Flag text: Low prior technology experience combined with low openness to new technology -- this population may need more hands-on, low-pressure introduction than either trait alone would suggest; pair with H4b's training plan.
- Shown as: Low openness together with low experience would need a gentler introduction

### RB3-12
- Acts: Integrator
- Flag text: PERCEPTION GAP: management's resistance prediction is low, but N of M surveyed adopters report real privacy or job-security concerns -- the rollout plan may be under-prepared for concerns leadership doesn't realize exist.
- Shown as: Management may expect less resistance than the adopters actually report

### RB3-13
- Acts: Integrator
- Reads: H1, H3
- Flag text: Management predicts meaningful resistance risk, but zero surveyed adopters report privacy or job-security concerns -- worth checking whether the adopters answering are representative of the broader workforce, or whether management's risk estimate is overly cautious.
- Shown as: Management expects resistance, but no worker reported privacy or job fears

## Layer 4 · Ecosystem (12)

### RB4-01
- Acts: Integrator
- Reads: ECO1a, ECO1c
- Flag text: No live production deployments and no reference customer available -- this vendor's technology hasn't been proven outside controlled conditions; treat as higher-risk regardless of demo quality.
- Shown as: No live installations and no reference customer. Treat this supplier as higher risk

### RB4-02
- Acts: Integrator
- Reads: ECO1c
- Flag text: Reference customer was provided -- independently verify this claim (e.g. actually contact the reference) rather than accept it at face value, per Cui et al.'s finding that self-reported track record alone doesn't predict success.
- Shown as: A reference customer was offered. Contact them rather than take it on trust

### RB4-03
- Acts: Integrator
- Reads: ECO2
- Flag text: IT and security teams aren't engaged as co-designers -- device management and network policy could block adoption entirely; escalate their involvement before proceeding.
- Shown as: IT and security are not helping design this. They could block it outright

### RB4-04
- Acts: Integrator
- Reads: ECO4
- Flag text: This task's success depends on a second organisation also being ready -- cross-check that dependency's own readiness before committing to a timeline; it's outside this deployment's direct control.
- Shown as: Success depends on another organisation being ready too. Check that before timing

### RB4-05
- Acts: Integrator
- Reads: ECO3
- Flag text: Market movement hasn't been researched -- same gap as Layer 3's H5 (mimetic pressure); a quick competitive scan would strengthen both this and Layer 3's resistance picture.
- Shown as: Market movement is not known. A quick scan would close this

### RB4-06
- Acts: Integrator
- Reads: ECO5a, ECO5b, ECO5c
- Flag text: None of the three concrete leadership-capability facts hold -- Orchestrator/Dominator strategies are unrealistic regardless of what ECO7 says about peer acceptance; plan for a Follower role (Complementor/Protector) instead.
- Shown as: None of the three signs of leading capability hold. Plan on a follower role

### RB4-07
- Acts: Integrator
- Reads: ECO5a, ECO5b, ECO5c, ECO7a
- Flag text: Some leadership capability exists, but peer acceptance hasn't even been discussed with the customer yet -- capability alone doesn't grant the leader role; have that conversation before assuming an Orchestrator strategy is available.
- Shown as: Some leading capability, but the customer has not discussed it yet

### RB4-08
- Acts: Integrator
- Reads: ECO7c
- Flag text: The customer already relies on a different vendor/integrator for this kind of decision -- even with strong capability (ECO5a-c) and authority claims (ECO7b), a Follower strategy is the realistic starting point. This is the strongest single signal in the whole layer, because it comes from the Adopter's own history, not our self-assessment.
- Shown as: The customer already turns to another supplier for this. Start as a follower

### RB4-09
- Acts: Integrator
- Reads: ECO7c, ECO7b
- Flag text: The customer already treats us as the incumbent, but we don't have contractual authority over technical standards formalized -- good position to formalize into an explicit agreement (ECO7a), since the relationship groundwork already exists.
- Shown as: The customer treats us as incumbent, but no contractual authority is agreed yet

### RB4-10
- Acts: Integrator
- Reads: ECO7a, ECO7b
- Flag text: The customer has agreed we'd coordinate, but we don't have the contractual authority to back it up -- informal agreement without contractual power is fragile; get it written into the agreement/SOW.
- Shown as: The customer agreed we would coordinate, but the contract does not back it up

### RB4-11
- Acts: Integrator
- Flag text: Positioned as leader, but unwilling to share infrastructure gains and seeing no clear integration value -- this points toward Dominator, not Orchestrator. A more adversarial stance may itself erode the peer acceptance ECO7 currently reports.
- Shown as: Leading, but unwilling to share gains. Points toward a dominator position

### RB4-12
- Acts: Integrator
- Flag text: In a follower position but unwilling to collaborate/share data with the leader -- this is Protector strategy. Flag that this limits value capture (see ECO9), and may not be sustainable if the leader has other follower options available.
- Shown as: Following, but unwilling to share data. Points toward a protector position
