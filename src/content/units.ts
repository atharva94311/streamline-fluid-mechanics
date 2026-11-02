import type { UnitDef } from '@/lib/types'

/** Titles shown for topics whose module has not been published yet ("in preparation"). */
export const PLANNED_TITLES: Record<string, string> = {
  kinematics: 'Fluid Element Kinematics',
  continuity: 'Conservation of Mass — Differential Continuity Equation',
  'stream-function': 'The Stream Function',
  'equations-of-motion': 'Equations of Motion: Cauchy & Euler',
  'potential-laplace': "Velocity Potential & Laplace's Equation",
  'bernoulli-euler': 'From Euler to Bernoulli: Inviscid Flow',
  'flow-nets': 'Flow Nets: Streamlines & Equipotentials',
  'elementary-flows': 'Uniform Flow, Source & Sink',
  'vortex-circulation': 'Vortex, Circulation & Free vs Forced Vortex',
  superposition: 'Superposition & the Half-Body',
  'dimensional-basics': 'Dimensions, Homogeneity & Nondimensional Equations',
  'buckingham-pi': 'Buckingham Pi Theorem & Method of Repeating Variables',
  'dimensionless-groups': 'Significant Dimensionless Groups',
  similitude: 'Flow Similarity & Model Studies',
  'internal-flow': 'Internal Flow Basics: Laminar vs Turbulent & Wall Shear',
  'turbulence-nature': 'The Nature of Turbulence & Time Averaging',
  'reynolds-stresses': 'Reynolds-Averaged Equations & Reynolds Stresses',
  'mixing-length': 'Mixing-Length Theory & Eddy Viscosity',
  'velocity-profiles': 'Universal Velocity Profile & the Laminar Sublayer',
  'friction-factor': 'Friction Factor: Smooth & Rough Pipes, Blasius & Power Law',
  'turbulence-modeling': 'Reynolds-Stress Correlation & the k–ε Model',
  'heat-transfer-analogies': 'Momentum–Heat Transfer Analogies',
  'turbulent-jets': 'Turbulent Jets',
}

/** Learning path. Topic ids must match files in src/content/topics/<id>.tsx. */
export const UNITS: UnitDef[] = [
  {
    id: 'A',
    title: 'Differential Analysis of Fluid Flow',
    short: 'Differential analysis',
    blurb: 'How an infinitesimal fluid element moves and deforms, and the differential equations of mass and momentum that govern it.',
    topics: ['kinematics', 'continuity', 'stream-function', 'equations-of-motion', 'potential-laplace', 'bernoulli-euler'],
  },
  {
    id: 'B',
    title: 'Plane Potential Flows',
    short: 'Potential flow',
    blurb: 'Building blocks of inviscid, irrotational flow — uniform flow, sources, sinks, vortices — and superposing them into real shapes.',
    topics: ['flow-nets', 'elementary-flows', 'vortex-circulation', 'superposition'],
  },
  {
    id: 'C',
    title: 'Dimensional Analysis & Similitude',
    short: 'Dimensional analysis',
    blurb: 'Reduce many variables to a few dimensionless groups with the Buckingham Pi theorem, and scale model tests to prototypes.',
    topics: ['dimensional-basics', 'buckingham-pi', 'dimensionless-groups', 'similitude'],
  },
  {
    id: 'D',
    title: 'Internal & Turbulent Flow',
    short: 'Turbulent flow',
    blurb: 'Time-averaging, Reynolds stresses, mixing length, the universal velocity profile, friction factors, k–ε modelling, analogies and jets.',
    topics: [
      'internal-flow',
      'turbulence-nature',
      'reynolds-stresses',
      'mixing-length',
      'velocity-profiles',
      'friction-factor',
      'turbulence-modeling',
      'heat-transfer-analogies',
      'turbulent-jets',
    ],
  },
]
