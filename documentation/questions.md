# Questions

The 87 questions, exactly as the forms ask them. Text marked *edited* differs from the
workbook cell and is pending a workbook update. `scripts/check.py` proves the rest.

## Adopter (24)

### Danger

- **D1** (scale)  
  How much danger-related risk in this task could XR safely simulate instead of the user encountering it for real? (0 = no danger element present, 10 = high danger XR would substantially de-risk)

- **D2** (scale)  
  How critical is managing distraction, or mental/emotional stress, to this task? (0 = not a factor, 10 = extremely critical)

### Immersion

- **I1** (scale, edited)  
  How relevant is auditory fidelity (how good and clear the sound is) to performing this task correctly? (0 = not relevant, 10 = essential)

- **I2** (scale, edited)  
  How relevant is visual fidelity (how good and clear the picture is) to performing this task correctly -- including having a wide field of view of the scene, and how much this task needs or benefits from 3D (not 2D) visualization? (0 = not relevant, 10 = essential)

- **I3** (scale)  
  How relevant is haptic/tactile fidelity to performing this task correctly (vibration, sense of touch)? (0 = not relevant, 10 = essential)

### Verification

- **V1** (scale)  
  How central is tracking the user's physical actions to this task (e.g. a sequence that must be followed and verified)? (0 = not tracked/not needed, 10 = tracking is the core of the task)

- **V2** (scale)  
  How central is tracking the user's acquired/learned knowledge to this task? (0 = not assessed/not needed, 10 = assessment is the core of the task)

### Expertise

- **E1** (scale, edited)  
  How much would this task benefit from co-situated (standing next to the worker) expert guidance, weighted by how rare or costly that expertise is? (0 = no benefit / expertise cheap and available, 10 = high benefit / expertise rare and costly)

### Collaboration

- **C1** (yesNo)  
  Does this task involve communication or collaboration with other people? Is knowledge sharing between people or departments essential for this task?
  Options: Yes · No

- **C2** (yesNo)  
  Does this task involve or benefit from video logging or video communication?
  Options: Yes · No

- **C3** (yesNo)  
  Do decisions have to be made while performing this task, and would visualization or coordination support help make them?
  Options: Yes · No

### Site conditions

- **S1** (yesNo)  
  Is this task done in an environment affected by dust or other particulates?
  Options: Yes · No

- **S2** (yesNo)  
  Is this task affected by weather conditions?
  Options: Yes · No

- **S3** (yesNo)  
  Is the environment where this task is done affected by lighting conditions (dark/dim, or bright/strong light needed)?
  Options: Yes · No

- **S4** (yesNo)  
  Do users have to wear clothing or equipment (helmets, gloves, protective glasses) that could affect device use?
  Options: Yes · No

- **S5** (yesNo)  
  Is this task done in a noisy environment?
  Options: Yes · No

### Your concerns

- **H7** (scale)  
  If this task's purpose is training/skill-building rather than ongoing assistance: how concerned are you (or, if surveying multiple adopters, on AVERAGE) that you might become faster with this technology's support but WORSE than baseline once it's removed, from not internalizing the underlying skill? (0 = not concerned, 10 = highly concerned)

- **H8** (choice, edited)  
  Do you have any privacy concerns about this device, for example cameras, audio or video recording, or tracking of your activity or performance?
  Options: Yes · No · Maybe

- **H9** (choice)  
  Do you fear the technology could be used to justify replacing your role?
  Options: Yes · No · Maybe

- **H10** (choice)  
  If devices will be shared across shifts/workers rather than individually assigned: do you see shared-device use as a health/hygiene concern?
  Options: Yes · No · Maybe

### About you

- **FR4a** (scale)  
  How open are you (or, if surveying multiple adopters, on AVERAGE) to using new technologies in general? (0 = not open, 10 = very open)

- **FR4b** (scale)  
  How experienced are you (or, if surveying multiple adopters, on AVERAGE) with new technologies in general, or with AR/XR specifically? (0 = no experience, 10 = highly experienced)

- **FR4c** (choice, edited)  
  What is your age group? (used only as a group total to understand the adopter population, never to identify or target individuals)
  Options: 18-29 · 30-49 · 50+

- **FR4d** (choice)  
  Do you feel that using this technology is voluntary for you, or mandatory?
  Options: Voluntary · Mandatory · Unsure

## Developer (22)

### Evidence pool

- **TR1** (scale)  
  How well does an available device meet ergonomic requirements for frequent, extended use? (0 = unusable for this duration, 10 = fully comfortable for a full shift)

- **TR2** (scale)  
  How well does the device's field of view approximate natural human FOV (~114°) for this task's spatial demands? (0 = severely limits perception, 10 = fully matches natural FOV)

- **TR3** (scale)  
  How well does display resolution and frame rate meet the representation-quality bar this task needs? (0 = far below what's needed, 10 = fully meets or exceeds it)

- **TR4** (scale)  
  How well does battery life cover the required continuous-use duration (e.g. a full shift)? (0 = far short, 10 = fully covers it with margin)

- **TR5** (scale, edited)  
  How compatible is the XR software with existing simulation or engineering software already in use by the Adopting Organisation? (0 = incompatible, 10 = fully integrated)

- **TR6** (scale)  
  How well does available software fit this specific operation type (e.g. robot/machine simulation vs. human-task simulation)? (0 = poor fit, 10 = purpose-built fit)

- **TR7** (scale)  
  How mature are the vendor and its technology for a real deployment, not just a demo? (0 = unproven/early-stage, 10 = proven at scale)

- **TR8** (scale)  
  How well does the device's spatial/positional audio meet this task's auditory-immersion needs? (0 = no meaningful audio, 10 = fully convincing spatial audio)

- **TR9** (scale)  
  How well does the device (or paired peripherals) deliver the tactile/force feedback this task's haptic-immersion needs require? (0 = none, 10 = fully convincing)

- **TR10** (scale)  
  How accurate is the device's 6-DoF pose tracking and depth perception for this task's action/knowledge-verification needs? (0 = unusably imprecise, 10 = industrial-grade accuracy)

- **TR11** (yesNo)  
  Does this device have monitoring capabilities (e.g. cameras, audio/video recording, activity or performance tracking)? If so, describe what is tracked and whether workers are notified.
  Options: Yes · No

### Technology readiness per task dimension

- **T_D1** (scale)  
  How ready is current technology to deliver danger-simulation fidelity for this task?

- **T_D2** (scale)  
  How ready is current technology to deliver distraction/stress-simulation fidelity for this task?

- **T_I1** (scale)  
  How ready is current technology to deliver auditory immersion for this task?

- **T_I2** (scale)  
  How ready is current technology to deliver visual immersion for this task?

- **T_I3** (scale)  
  How ready is current technology to deliver haptic immersion for this task?

- **T_V1** (scale, edited)  
  How ready is current technology to track this task's required actions? (for example identifying wrong or correct moves, or tracking user performance)

- **T_V2** (scale, edited)  
  How ready is current technology to track this task's required knowledge? (for example testing the user's knowledge after task completion)

- **T_E1** (scale, edited)  
  How ready is current technology to deliver co-situated (standing next to the worker) expert guidance?

### Vendor track record

- **ECO1a** (number, skipped in configuration A)  
  How many live production deployments (not pilots or demos) does this technology currently have?

- **ECO1b** (text, skipped in configuration A)  
  How long has this technology been commercially available?

- **ECO1c** (yesNo, skipped in configuration A)  
  Can you provide at least one reference customer currently using this at the scale being considered?
  Options: Yes · No

## Integrator (41)

### Task context

- **X1** (yesNo)  
  Does the task require high cognitive and/or problem-solving complexity?
  Options: Yes · No

- **X2** (yesNo)  
  Can the task be performed remotely, without physical presence -- or does it require presence near a specific device/machine or in a specific place?
  Options: Yes · No

- **X3** (yesNo, edited)  
  Does documented procedural knowledge already exist, in a format that can be directly used for this task? (such as Digital Manuals, PDFs, CAD models)
  Options: Yes · No

- **X4** (yesNo, edited)  
  If knowledge exists in a different format requiring processing/reformatting, can it actually be retrieved easily (search/repository quality) (knowledge exists only on paper and/or is not documented)?
  Options: Yes · No

- **X5** (scale)  
  How much effort is required to gather instructions, images, and animations to create XR-suitable content for this task, given its complexity? (content can include: text, 3D models, pictures, videos, workflow/process knowledge)

- **X6** (yesNo)  
  Does this task require both hands to be free, or contain sub-tasks that can only be done with two hands simultaneously?
  Options: Yes · No

- **X7** (scale)  
  How often does this task require switching between different information sources or locations to keep going (e.g. looking away to check a paper manual then back, or reading a value and manually writing it into a separate system)? (0 = never, 10 = constantly, at nearly every step)

- **X8** (scale)  
  How much does this task's XR representation need to behave like the real process -- not just look realistic, but follow the same sequence, timing, and consequences a real action or mistake would have? (0 = accurate behavior doesn't matter, 10 = it must behave exactly as the real process would)

- **X9** (yesNo)  
  Does this task involve training or education purposes?
  Options: Yes · No

### Current reliance

- **ECO7c** (choice, skipped in configuration A)  
  Who does the customer currently rely on for this kind of technical decision -- us, a different vendor/integrator, or no one in particular yet? (e.g. if they already use our machines and we already provide their training, that's us)
  Options: Us · A different organisation · No one established yet

### Expected benefits

- **MP1** (rank)  
  Rank the economic benefits you expect from this deployment, in order of importance (1 = most important; leave blank if not expected):
  Options: Cost savings · Time savings · Quality improvement or error reduction

- **MP2** (rank)  
  Rank the strategic benefits you expect from this deployment, in order of importance (1 = most important; leave blank if not expected):
  Options: Competitive/strategic advantage · Employer branding or talent attraction

### Social and organisational culture

- **SC1** (scale)  
  How supportive is the social environment for the deployment of new technology such as XR -- is acceptance likely among the adopters? (0 = resistant, 10 = highly supportive)

- **SC2** (scale)  
  How supportive is organisational culture and infrastructure for the deployment and support of new technology such as XR? (0 = unsupportive, 10 = highly supportive)

### Leadership and measurement

- **MP3** (yesNo)  
  Will leadership actively support and sustain this initiative of adopting the technology through the pilot-to-scale transition -- not just approve the budget, but stay engaged?
  Options: Yes · No

- **MP4** (yesNo)  
  Does the organisation have a working model or KPI infrastructure to actually measure whether the pilot will succeed after deployment?
  Options: Yes · No

### Compliance

- **FR3** (yesNo)  
  Can work safety and ergonomic conditions for the technology adopters be ensured according to business and legal requirements for this deployment?
  Options: Yes · No

### Existing infrastructure

- **IC1a** (yesNo)  
  Does your organisation have a specific network/infrastructure/platform and system integration (ERP, MES, etc.) that this technology would need to connect to?
  Options: Yes · No

- **IC2a** (yesNo)  
  Do you already have documented interfaces/APIs/rules and methods that describe or facilitate the integration of this technology (XR) to your organisation's systems/software/platforms?
  Options: Yes · No

### Integration feasibility

- **IC1b** (choice)  
  Are the specific interfaces/APIs/methods needed to connect this technology to your organisation's software/system/platform technically confirmed as feasible -- not just assumed?
  Options: Yes · No · Not yet/partially tested

- **IC2b** (choice)  
  Has network/infrastructure capacity at both the Integrator and Adopter side been technically verified as sufficient for this technology's requirements?
  Options: Yes · No · Not yet/partially tested

### Expected resistance

- **H1** (scale)  
  Can your organisation use the technology on a trial basis and properly try it out before purchasing or committing to it? (0 = not at all, 10 = fully able to trial it)

- **H3** (yesNo)  
  Can and would the organisation and management provide guidance, help, and resources to employees (Adopters) to implement the new way of working this technology will introduce?
  Options: Yes · No

- **H3b** (yesNo)  
  Does the organisation have a plan for what kind of help or assistance might specifically be needed from the adopters' side?
  Options: Yes · No

- **H4** (scale, edited)  
  In your opinion, on average, how knowledgeable are the employees (Adopters) who will use this technology about its functionality, or how and when to use it? (0 = know nothing about it, 10 = fully knowledgeable)

- **H4b** (yesNo)  
  Is there a rollout or training plan to familiarize employees (adopters) with how to use the technology?
  Options: Yes · No

- **H5** (choice)  
  Have competitors already benefited from adopting it, and are they viewed favourably by their industry, suppliers, and customers?
  Options: Yes · No · I don't know

- **H6** (scale, edited)  
  How available is a specific person or group, outside or inside the adopting organisation, for hardware/software assistance and equipment-selection guidance? (0 = not available, 10 = fully available)

### Partners and market

- **ECO2** (yesNo, skipped in configuration A)  
  Are our own IT and security teams involved early in scoping the hardware + software rollout -- not just approving it at the end? (device management and network policy can block adoption entirely)
  Options: Yes · No

- **ECO3** (choice)  
  Is the surrounding market already moving on this kind of machine/process (competitors already piloting XR training on similar equipment), independent of what we decide?
  Options: Yes · No · I don't know

- **ECO4** (yesNo, skipped in configuration A)  
  Does this deployment secretly depend on another organisation -- the software provider, the machine's or process own control-system vendor, or the customer's IT/Platform -- also being ready?
  Options: Yes · No

### Ecosystem strategy

- **ECO5a** (yesNo, skipped in configuration A)  
  Do we have a dedicated technical team able to define how the hardware, software, and machine data need to connect (the data/interface standards other parties would have to follow)?
  Options: Yes · No

- **ECO5b** (yesNo, skipped in configuration A)  
  Have we already coordinated a deployment where hardware from one company, software from another, and a machine from a third had to work together?
  Options: Yes · No

- **ECO5c** (yesNo, skipped in configuration A)  
  Do we already run the platform or infrastructure that the hardware and software both have to plug into -- i.e. is our machine + our system already the hub everything else connects to?
  Options: Yes · No

- **ECO6** (yesNo, skipped in configuration A)  
  Do we have an existing relationship with the software provider and the customer that goes beyond a first-time introduction -- e.g. prior joint projects, signed agreements, established points of contact?
  Options: Yes · No

- **ECO7a** (choice, skipped in configuration A)  
  Has the customer (or the software provider) explicitly agreed that we're the ones who define how the hardware, software, and machine data fit together for this deployment? (e.g. they've signed off on us defining the data format/API others must use)
  Options: Yes · No · Not yet discussed

- **ECO7b** (yesNo, skipped in configuration A)  
  Do we have the contractual authority to require the software provider to build to our data format/API, rather than us having to adapt to theirs?
  Options: Yes · No

- **ECO8** (yesNo, skipped in configuration A)  
  AS LEADER: are we willing to let the software provider (and future partners) build extra value on top of our machine/hardware/data?
  Options: Yes · No

- **ECO8** (yesNo, skipped in configuration A)  
  AS FOLLOWER: are we willing to openly share our data/documentation with whoever leads, to make the overall training/process better?
  Options: Yes · No

- **ECO9** (yesNo, skipped in configuration A)  
  AS LEADER: do we gain more by opening our systems to the software provider than we'd gain by keeping them closed?
  Options: Yes · No

- **ECO9** (yesNo, skipped in configuration A)  
  AS FOLLOWER: do we gain more from plugging into the leader's system than we risk by sharing our data, and can that risk be mitigated?
  Options: Yes · No
