// "Injection mould changeover" from the prototype, rebuilt for the 17 Sep model: 5 Adopters answer
// the task and individual items; the task answers are identical, so averaging must reproduce the prototype.
// Task context and current reliance moved to the Integrator on 19 Oct, so they sit in taskContext below.
const task = {
  D1: 8, D2: 5, I1: 3, I2: 9, I3: 7, V1: 8, V2: 6, E1: 7,
  C1: 'Yes', C2: 'Yes', C3: 'No', S1: 'No', S2: 'No', S3: 'No', S4: 'Yes', S5: 'Yes'
};

const taskContext = {
  X1: 'Yes', X2: 'No', X3: 'No', X4: 'No', X5: 8, X6: 'Yes', X7: 5, X8: 8, X9: 'Yes',
  ECO7c: 'A different organisation'
};

const individual = [
  [6, 'Yes', 'No', 'Maybe', 7, 4, '18-29', 'Mandatory'],
  [3, 'No', 'No', 'No', 8, 6, '30-49', 'Voluntary'],
  [7, 'Yes', 'Yes', 'Maybe', 4, 2, '50+', 'Mandatory'],
  [2, 'Maybe', 'No', 'No', 6, 5, '30-49', 'Mandatory'],
  [5, 'No', 'Maybe', 'No', 9, 7, '18-29', 'Unsure']
];

const adopters = individual.map(([H7, H8, H9, H10, FR4a, FR4b, FR4c, FR4d]) => ({ ...task, H7, H8, H9, H10, FR4a, FR4b, FR4c, FR4d }));

const developer = {
  TR1: 7, TR2: 5, TR3: 5, TR4: 8, TR5: 4, TR6: 7, TR7: 8, TR8: 4, TR9: 2, TR10: 8, TR11: 'Yes',
  T_D1: 6, T_D2: 5, T_I1: 4, T_I2: 7, T_I3: 2, T_V1: 7, T_V2: 6, T_E1: 7,
  ECO1a: 40, ECO1b: '5 years', ECO1c: 'Yes'
};

const integrator = {
  ...taskContext,
  MP1: { 'Cost savings': 1, 'Time savings': 2, 'Quality improvement or error reduction': 3 },
  MP2: { 'Competitive/strategic advantage': 1, 'Employer branding or talent attraction': '' },
  SC1: 6, SC2: 4, MP3: 'Yes', MP4: 'No', FR3: 'Yes',
  IC1a: 'Yes', IC2a: 'No', IC1b: 'Not yet/partially tested', IC2b: 'Yes',
  H1: 3, H3: 'Yes', H3b: 'No', H4: 4, H4b: 'Yes', H5: "I don't know", H6: 6,
  ECO2: 'Yes', ECO3: 'Yes', ECO4: 'Yes', ECO5a: 'Yes', ECO5b: 'No', ECO5c: 'Yes', ECO6: 'Yes',
  ECO7a: 'Not yet discussed', ECO7b: 'No', ECO8L: 'Yes', ECO8F: 'Yes', ECO9L: 'No', ECO9F: 'Yes'
};

const mould = {
  deployment: { technology: 'External supplier', rollout: 'Our company' },
  submissions: { adopter: adopters, developer: [developer], integrator: [integrator] }
};

module.exports = { mould, task, taskContext, developer, integrator };
