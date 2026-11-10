// The 53 rules of the four Rule Bank sheets. Flag text is verbatim; scripts/check.py proves it.
// inputs need a conclusive averaged answer; counted need at least one respondent (ties allowed);
// tally names the item and option behind "N of M" in the flag text.
const rules = [
  {
    id: 'RB-A1', layer: 1, role: 'Developer', inputs: ['D1', 'T_D1', 'D2', 'T_D2', 'I1', 'T_I1', 'I2', 'T_I2', 'I3', 'T_I3', 'V1', 'T_V1', 'V2', 'T_V2', 'E1', 'T_E1'],
    test: (answerValue) => dimensions.some(([need, ready]) => answerValue(need) >= 7 && answerValue(ready) <= 3),
    text: '[Dimension] is needed but not currently deliverable -- the actual blocker, not general suitability'
  },
  {
    id: 'RB-B1', layer: 1, role: 'Developer', inputs: ['T_I1'],
    test: () => true,
    text: 'Audio readiness has no supporting benchmark evidence (TR8 unsourced) -- treat as expert judgement'
  },
  {
    id: 'RB-B2', layer: 1, role: 'Developer', inputs: ['T_I3'],
    test: () => true,
    text: 'Haptic readiness has no supporting benchmark evidence (TR9 unsourced) -- treat as expert judgement'
  },
  {
    id: 'RB-C1', layer: 1, role: 'Integrator', inputs: ['X1'],
    test: (answerValue) => answerValue('X1') === 'Yes',
    text: 'High-complexity task flagged, but TTF_TOTAL is still equal-weighted, not complexity-adjusted -- read the total score as provisional'
  },
  {
    id: 'RB-D1', layer: 1, role: 'Integrator', blocked: 'CS_RISK has no decision table yet, and modality is never asked',
    text: 'Cybersickness/fatigue risk for this task\'s duration -- consider break schedules or an alternative modality'
  },
  {
    id: 'RB-D2', layer: 1, role: 'Developer', inputs: ['TR1'],
    test: (answerValue) => answerValue('TR1') <= 3,
    text: 'Poor device ergonomics for extended use -- operator-rejection risk independent of the DIVE fit score'
  },
  {
    id: 'RB-E1', layer: 1, role: 'Adopter → Integrator', inputs: ['X3', 'C1'],
    test: (answerValue) => answerValue('X3') === 'No' && answerValue('C1') === 'Yes',
    text: 'Undocumented knowledge that people already depend on sharing -- highest-priority authoring/capture target'
  },
  {
    id: 'RB-E2', layer: 1, role: 'Adopter', inputs: ['X3', 'X4'],
    test: (answerValue) => answerValue('X3') === 'Yes' && answerValue('X4') === 'No',
    text: 'Documentation exists but isn\'t practically retrievable -- fix indexing/access before investing in XR content authoring'
  },
  {
    id: 'RB-E3', layer: 1, role: 'Integrator', inputs: ['X1', 'X5'],
    test: (answerValue) => answerValue('X1') === 'Yes' && answerValue('X5') >= 7,
    text: 'High task complexity + high authoring effort compound each other -- expect content creation to be the real bottleneck, budget accordingly'
  },
  {
    id: 'RB-E4', layer: 1, role: 'Integrator', inputs: ['X7', 'X4'],
    test: (answerValue) => answerValue('X7') >= 7 && answerValue('X4') === 'No',
    text: 'Frequent media breaks driven by retrieval friction, not missing knowledge -- an AR overlay pulling from the existing repository may resolve this without new content authoring'
  },
  {
    id: 'RB-F1', layer: 1, role: 'Developer', inputs: ['X8', 'T_I3'],
    test: (answerValue) => answerValue('X8') >= 7 && answerValue('T_I3') <= 3,
    text: 'Task needs authentic behavior, but haptic readiness is weak -- risk of training the wrong muscle memory (e.g. snap-fit, torque feel)'
  },
  {
    id: 'RB-F2', layer: 1, role: 'Integrator', inputs: ['X8', 'D1'],
    test: (answerValue) => answerValue('X8') >= 7 && answerValue('D1') >= 7,
    text: 'High-stakes + high-authenticity task -- fidelity must be right or don\'t deploy; a low-fidelity version could be worse than no XR training at all'
  },
  {
    id: 'RB-G1', layer: 1, role: 'Developer', inputs: ['X9', 'V2'],
    test: (answerValue) => answerValue('X9') === 'Yes' && answerValue('V2') >= 7,
    text: 'Training task with high knowledge-assessment need -- verify chosen software (TR5/TR6) supports scoring/certification, not just content delivery'
  },
  {
    id: 'RB-H1', layer: 1, role: 'Integrator', inputs: ['C1', 'X2'],
    test: (answerValue) => answerValue('C1') === 'Yes' && answerValue('X2') === 'Yes',
    text: 'Collaboration + remote-feasibility together suggest a remote-expert-guidance use case, not just solo AR assistance'
  },
  {
    id: 'RB-I1', layer: 1, role: 'Developer', inputs: ['S1', 'S2'],
    test: (answerValue) => answerValue('S1') === 'Yes' || answerValue('S2') === 'Yes',
    text: 'Dust/weather exposure -- ruggedized/sealed device required, narrows vendor options (cross-check TR7 vendor maturity)'
  },
  {
    id: 'RB-I2', layer: 1, role: 'Developer', inputs: ['S3'],
    test: (answerValue) => answerValue('S3') === 'Yes',
    text: 'Extreme lighting conditions -- display readability at this brightness/darkness is a hardware constraint (cross-check TR3)'
  },
  {
    id: 'RB-I3', layer: 1, role: 'Developer', inputs: ['S5', 'I1'],
    test: (answerValue) => answerValue('S5') === 'Yes' && answerValue('I1') >= 7,
    text: 'Noisy environment but task rated auditory fidelity as highly relevant -- audio-based interaction will be compromised; verify a visual/haptic alternative exists'
  },
  {
    id: 'RB-I4', layer: 1, role: 'Developer', inputs: ['S4', 'X6'],
    test: (answerValue) => answerValue('S4') === 'Yes' && answerValue('X6') === 'Yes',
    text: 'Protective equipment (gloves) + hands-free/bimanual requirement -- gesture interaction may be degraded; consider voice or hardware-button alternatives'
  },
  {
    id: 'RB2-01', layer: 2, role: 'Integrator', inputs: ['MP1', 'MP4'],
    test: (answerValue) => answerValue('MP1').firstOption === 'Cost savings' && answerValue('MP4') === 'No',
    text: 'Top-priority expected benefit (cost savings) is currently unmeasurable -- establish a baseline metric before piloting, or this benefit will be unverifiable after the fact.'
  },
  {
    id: 'RB2-02', layer: 2, role: 'Integrator', inputs: ['MP3'], counted: ['MP1'],
    test: (answerValue) => answerValue('MP1').hasRanking && answerValue('MP3') === 'No',
    text: 'Benefits are expected, but leadership isn\'t committed to championing this through the pilot-to-scale transition -- expected benefits are unlikely to be realized without sustained leadership engagement.'
  },
  {
    id: 'RB2-03', layer: 2, role: 'Integrator', inputs: ['MP2', 'SC1'],
    test: (answerValue) => answerValue('MP2').firstOption === 'Employer branding or talent attraction' && answerValue('SC1') <= 3,
    text: 'Branding was ranked the top strategic benefit, but internal social acceptance is low -- an unsupportive internal rollout undermines the external story you\'d want to tell.'
  },
  {
    id: 'RB2-04', layer: 2, role: 'Integrator', inputs: ['SC1', 'SC2'],
    test: (answerValue) => answerValue('SC1') <= 3 && answerValue('SC2') <= 3,
    text: 'Both social acceptance and organisational culture/infrastructure readiness are low -- a fundamental readiness gap, not a minor friction point. Address before piloting, not alongside it.'
  },
  {
    id: 'RB2-05', layer: 2, role: 'Integrator', inputs: ['SC1', 'MP3'],
    test: (answerValue) => answerValue('SC1') <= 3 && answerValue('MP3') === 'Yes',
    text: 'Social acceptance is currently low, but leadership is committed to championing this -- leadership engagement is the primary lever available; make change management a deliberate part of the rollout plan, not an afterthought.'
  },
  {
    id: 'RB2-06', layer: 2, role: 'Integrator', inputs: ['FR3'],
    test: (answerValue) => answerValue('FR3') === 'No',
    text: 'Safety/ergonomic compliance cannot currently be ensured per business/legal requirements -- this is a BLOCKING issue, not a risk factor. Resolve before piloting.'
  },
  {
    id: 'RB2-07', layer: 2, role: 'Integrator', inputs: ['IC1a'],
    test: (answerValue) => answerValue('IC1a') === 'No',
    text: 'No existing infrastructure identified for this technology to connect to -- likely a greenfield integration; budget for infrastructure setup, not just software licensing.'
  },
  {
    id: 'RB2-08', layer: 2, role: 'Integrator → Developer', inputs: ['IC1a', 'IC2a'],
    test: (answerValue) => answerValue('IC1a') === 'Yes' && answerValue('IC2a') !== 'Yes',
    text: 'Infrastructure exists but isn\'t documented for integration purposes -- budget discovery time before trusting any integration timeline.'
  },
  {
    id: 'RB2-09', layer: 2, role: 'Integrator → Developer', inputs: ['IC1b'],
    test: (answerValue) => answerValue('IC1b') === 'Not yet/partially tested',
    text: 'Interface feasibility unconfirmed -- verify with your technical/IT team before committing to a timeline or budget.'
  },
  {
    id: 'RB2-10', layer: 2, role: 'Integrator', inputs: ['IC2b'],
    test: (answerValue) => answerValue('IC2b') === 'Not yet/partially tested',
    text: 'Capacity unconfirmed -- clarify with both the Integrator\'s technical team and the Adopter\'s IT/operations team which side (or both) still needs testing.'
  },
  {
    id: 'RB3-01', layer: 3, role: 'Integrator', inputs: ['H1', 'H3'],
    test: (answerValue) => answerValue('H1') <= 3 && answerValue('H3') === 'No',
    text: 'Low trialability combined with no organisational support plan risks resistance -- neither a trial nor support exists for employees adjusting to this technology.'
  },
  {
    id: 'RB3-02', layer: 3, role: 'Integrator', inputs: ['H3', 'H3b'],
    test: (answerValue) => answerValue('H3') === 'No' && answerValue('H3b') === 'No',
    text: 'Organisational support is currently absent, and there\'s no plan for what kind of support would even be needed -- scope this before rollout, not during it.'
  },
  {
    id: 'RB3-03', layer: 3, role: 'Integrator', inputs: ['H4', 'H4b'], undecided: '"H4 low" has no threshold in the workbook',
    test: (answerValue) => (answerValue('H4b') === 'No' ? undefined : false),
    text: 'Employees currently have low technology familiarity, and there\'s no training plan to address it -- expect a friciton at the beggining without deliberate plan for onboarding investment.'
  },
  {
    id: 'RB3-04', layer: 3, role: 'Integrator', inputs: ['H5'],
    test: (answerValue) => answerValue('H5') === "I don't know",
    text: 'Competitor-adoption context hasn\'t been researched -- an easy gap to close (a quick market scan) before finalizing the resistance picture would give an idea of what has been done and what are the challenges other org faced and how it was solved'
  },
  {
    id: 'RB3-05', layer: 3, role: 'Integrator', inputs: ['H6'],
    test: (answerValue) => answerValue('H6') <= 3,
    text: 'Limited external support availability -- internal capability (H3/H4) becomes the primary safety net; if those are also weak, this compounds RB3-01/RB3-03.'
  },
  {
    id: 'RB3-06', layer: 3, role: 'Integrator', inputs: [], counted: ['H9'], tally: ['H9', 'Yes'],
    test: (answerValue, optionCount) => optionCount('H9', 'Yes') > 0,
    text: 'Job-security fear was reported by N of M adopters surveyed. Unlike other resistance factors, this specific fear does NOT resolve through trial periods or familiarity alone -- it needs direct communication/reassurance from leadership, not just hands-on exposure. Even a minority reporting this is worth direct follow-up, since it doesn\'t self-resolve with more exposure.'
  },
  {
    id: 'RB3-07', layer: 3, role: 'Integrator', inputs: ['TR11'], counted: ['H8'], tally: ['H8', 'Yes'],
    test: (answerValue, optionCount) => optionCount('H8', 'Yes') > 0 && answerValue('TR11') === 'Yes',
    text: 'Privacy concern was reported by N of M adopters surveyed, and it\'s grounded in an actual device capability, not just perception -- this needs a real policy answer (what\'s tracked, who sees it, why), not just reassurance.'
  },
  {
    id: 'RB3-08', layer: 3, role: 'Integrator', inputs: ['TR11'], counted: ['H8'], tally: ['H8', 'Yes'],
    test: (answerValue, optionCount) => optionCount('H8', 'Yes') > 0 && answerValue('TR11') === 'No',
    text: 'Privacy concern was reported by N of M adopters surveyed, but the device doesn\'t actually have the monitoring capability being feared -- may be resolvable through clearer communication about what the device does and doesn\'t do.'
  },
  {
    id: 'RB3-09', layer: 3, role: 'Integrator', inputs: [], counted: ['H10'], tally: ['H10', 'Yes'],
    test: (answerValue, optionCount) => optionCount('H10', 'Yes') > 0,
    text: 'Shared-device hygiene concern was reported by N of M adopters surveyed -- establish and communicate a sanitization protocol. Reactions to shared-device use are heterogeneous in the source study, so this is worth addressing explicitly even if most respondents aren\'t concerned.'
  },
  {
    id: 'RB3-10', layer: 3, role: 'Integrator', inputs: [], counted: ['FR4d'], tally: ['FR4d', 'Mandatory'],
    test: (answerValue, optionCount) => optionCount('FR4d', 'Mandatory') > 0,
    text: 'N of M surveyed adopters perceive use as mandatory, not voluntary -- voluntariness affects acceptance; if this can be framed with more employee input/choice, that may reduce resistance.'
  },
  {
    id: 'RB3-11', layer: 3, role: 'Integrator', blocked: '"FR4a low" and "FR4b low" have no threshold in the workbook',
    text: 'Low prior technology experience combined with low openness to new technology -- this population may need more hands-on, low-pressure introduction than either trait alone would suggest; pair with H4b\'s training plan.'
  },
  {
    id: 'RB3-12', layer: 3, role: 'Integrator', blocked: 'The trigger uses H3 >= 7, but H3 is a Yes/No question',
    text: 'PERCEPTION GAP: management\'s resistance prediction is low, but N of M surveyed adopters report real privacy or job-security concerns -- the rollout plan may be under-prepared for concerns leadership doesn\'t realize exist.'
  },
  {
    id: 'RB3-13', layer: 3, role: 'Integrator', inputs: ['H1', 'H3'], counted: ['H9', 'H8'],
    test: (answerValue, optionCount) => (answerValue('H1') <= 3 || answerValue('H3') === 'No') && optionCount('H8', 'Yes') === 0 && optionCount('H9', 'Yes') === 0,
    text: 'Management predicts meaningful resistance risk, but zero surveyed adopters report privacy or job-security concerns -- worth checking whether the adopters answering are representative of the broader workforce, or whether management\'s risk estimate is overly cautious.'
  },
  {
    id: 'RB4-01', layer: 4, role: 'Integrator', inputs: ['ECO1a', 'ECO1c'], external: true,
    test: (answerValue) => answerValue('ECO1a') === 0 && answerValue('ECO1c') === 'No',
    text: 'No live production deployments and no reference customer available -- this vendor\'s technology hasn\'t been proven outside controlled conditions; treat as higher-risk regardless of demo quality.'
  },
  {
    id: 'RB4-02', layer: 4, role: 'Integrator', inputs: ['ECO1c'], external: true,
    test: (answerValue) => answerValue('ECO1c') === 'Yes',
    text: 'Reference customer was provided -- independently verify this claim (e.g. actually contact the reference) rather than accept it at face value, per Cui et al.\'s finding that self-reported track record alone doesn\'t predict success.'
  },
  {
    id: 'RB4-03', layer: 4, role: 'Integrator', inputs: ['ECO2'], external: true,
    test: (answerValue) => answerValue('ECO2') === 'No',
    text: 'IT and security teams aren\'t engaged as co-designers -- device management and network policy could block adoption entirely; escalate their involvement before proceeding.'
  },
  {
    id: 'RB4-04', layer: 4, role: 'Integrator', inputs: ['ECO4'], external: true,
    test: (answerValue) => answerValue('ECO4') === 'Yes',
    text: 'This task\'s success depends on a second organisation also being ready -- cross-check that dependency\'s own readiness before committing to a timeline; it\'s outside this deployment\'s direct control.'
  },
  {
    id: 'RB4-05', layer: 4, role: 'Integrator', inputs: ['ECO3'],
    test: (answerValue) => answerValue('ECO3') === "I don't know",
    text: 'Market movement hasn\'t been researched -- same gap as Layer 3\'s H5 (mimetic pressure); a quick competitive scan would strengthen both this and Layer 3\'s resistance picture.'
  },
  {
    id: 'RB4-06', layer: 4, role: 'Integrator', inputs: ['ECO5a', 'ECO5b', 'ECO5c'], external: true,
    test: (answerValue) => answerValue('ECO5a') === 'No' && answerValue('ECO5b') === 'No' && answerValue('ECO5c') === 'No',
    text: 'None of the three concrete leadership-capability facts hold -- Orchestrator/Dominator strategies are unrealistic regardless of what ECO7 says about peer acceptance; plan for a Follower role (Complementor/Protector) instead.'
  },
  {
    id: 'RB4-07', layer: 4, role: 'Integrator', inputs: ['ECO5a', 'ECO5b', 'ECO5c', 'ECO7a'], external: true,
    test: (answerValue) => (answerValue('ECO5a') === 'Yes' || answerValue('ECO5b') === 'Yes' || answerValue('ECO5c') === 'Yes') && answerValue('ECO7a') === 'Not yet discussed',
    text: 'Some leadership capability exists, but peer acceptance hasn\'t even been discussed with the customer yet -- capability alone doesn\'t grant the leader role; have that conversation before assuming an Orchestrator strategy is available.'
  },
  {
    id: 'RB4-08', layer: 4, role: 'Integrator', inputs: ['ECO7c'], external: true,
    test: (answerValue) => answerValue('ECO7c') === 'A different organisation',
    text: 'The customer already relies on a different vendor/integrator for this kind of decision -- even with strong capability (ECO5a-c) and authority claims (ECO7b), a Follower strategy is the realistic starting point. This is the strongest single signal in the whole layer, because it comes from the Adopter\'s own history, not our self-assessment.'
  },
  {
    id: 'RB4-09', layer: 4, role: 'Integrator', inputs: ['ECO7c', 'ECO7b'], external: true,
    test: (answerValue) => answerValue('ECO7c') === 'Us' && answerValue('ECO7b') === 'No',
    text: 'The customer already treats us as the incumbent, but we don\'t have contractual authority over technical standards formalized -- good position to formalize into an explicit agreement (ECO7a), since the relationship groundwork already exists.'
  },
  {
    id: 'RB4-10', layer: 4, role: 'Integrator', inputs: ['ECO7a', 'ECO7b'], external: true,
    test: (answerValue) => answerValue('ECO7a') === 'Yes' && answerValue('ECO7b') === 'No',
    text: 'The customer has agreed we\'d coordinate, but we don\'t have the contractual authority to back it up -- informal agreement without contractual power is fragile; get it written into the agreement/SOW.'
  },
  {
    id: 'RB4-11', layer: 4, role: 'Integrator', external: true, blocked: 'No rule yet decides Leader vs Follower from ECO7a/b/c',
    text: 'Positioned as leader, but unwilling to share infrastructure gains and seeing no clear integration value -- this points toward Dominator, not Orchestrator. A more adversarial stance may itself erode the peer acceptance ECO7 currently reports.'
  },
  {
    id: 'RB4-12', layer: 4, role: 'Integrator', external: true, blocked: 'No rule yet decides Leader vs Follower from ECO7a/b/c',
    text: 'In a follower position but unwilling to collaborate/share data with the leader -- this is Protector strategy. Flag that this limits value capture (see ECO9), and may not be sustainable if the leader has other follower options available.'
  }
];
