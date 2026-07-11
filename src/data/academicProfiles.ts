/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AcademicProfile {
  name: string;
  focus: string;
  guideline: string;
  formula: string;
}

export const academicProfiles: AcademicProfile[] = [
  {
    name: "The Classical Academic (Nelson Veras, M.Ed.)",
    focus: "Introductory Ideal Linear Models",
    guideline: "Explain the ideal Circular Orbital Velocity v = \\sqrt{\\mu / r} Newtonian kinematic baseline. Advocate for clean, simplified textbook approaches.",
    formula: "v_{orbit} = \\sqrt{\\frac{\\mu}{r}}"
  },
  {
    name: "The Systems & Industrial Engineer (Marcus Sterling, P.E.)",
    focus: "Continuous Mass & Thrust Efficiency",
    guideline: "Address trajectory delta-V impulses, mass-flow rate propellant budgets, thrust scheduling tolerances, and engineering safety margins.",
    formula: "Trajectory Delta-V Impulse Budgets"
  },
  {
    name: "The Mechanical Systems Theorist (Dr. Clara Mercer)",
    focus: "Precision Physical Constants",
    guideline: "Argue that the ab-initio precision of planetary gravitational elements (GM and G) sets the mathematical boundaries for precision.",
    formula: "Planetary Wave States"
  },
  {
    name: "The Solid-State/Hardware Architect (Dr. Jun-Ho Park)",
    focus: "Thermal stress & G-force tolerance",
    guideline: "Focus on thermal loading of nozzle components during the impulsive burn and structural stress tolerances of hardware mounts.",
    formula: "Stress/Strain Trajectory Projections"
  },
  {
    name: "The Theoretical Physicist (Dr. Sean O'Connor)",
    focus: "Relativistic Flow & Metric Invariance",
    guideline: "Explain Newtonian gravitation bounds on Mars with relativistic frame-dragging limits (showing they are negligible but mathematically satisfying).",
    formula: "r_{effective} = r + \\Delta r_{relativistic}"
  },
  {
    name: "The Empirical Researcher (Dr. Elena Rostova)",
    focus: "Observational Geopotential Corrections",
    guideline: "Analyze planetary surface oblation, J2 harmonics gravity perturbations, and empirical orbital telemetry drift.",
    formula: "J_2 Geopotential Corrections"
  },
  {
    name: "The Cryogenic Specialist (Dr. Yuki Tanaka)",
    focus: "Thermodynamic heat-shield dispersion",
    guideline: "Focus on liquid fuel cryogenic vapor pressures, nozzle throttling mechanics, and specific impulse (Isp = 310s) gas flows.",
    formula: "Nozzle Gas Vent Kinematics"
  },
  {
    name: "The Applied Bio-Systems Practitioner (Dr. Amara Diallo)",
    focus: "Closed-loop biosphere & Hydro-slosh safety",
    guideline: "Detail the deceleration effects on life-support systems, G-force impact on crew, and fluid sloshing in nutrient reservoirs.",
    formula: "Hydro-slosh fluid inertia bounds"
  },
  {
    name: "The Classical Mathematical Modeler (Prof. Alan Vance)",
    focus: "PDE Keplerian Continuum Trajectories",
    guideline: "Analyse boundary Keplerian continuum orbits using the Vis-Viva equation (v^2 = \\mu(2/r - 1/a)) to establish orbital insertion formulas.",
    formula: "Vis-Viva Continuum Trajectory"
  },
  {
    name: "The Micro-Scale Harmonic Specialist (Dr. Chloe Liang)",
    focus: "Structural strut vibration resonance",
    guideline: "Address high-frequency thruster acoustic vibration decoupling, and how to preserve signal stability with structural dampening.",
    formula: "Structural Strut Harmonic Ratios"
  },
  {
    name: "The Environmental Climatologist (Dr. Sarah Jenkins)",
    focus: "Atmospheric Density Exponential Decay",
    guideline: "Evaluate atmospheric drag effects at 200 km, scale heights, and thermospheric density variations causing non-uniform decays.",
    formula: "Atmospheric Density Exponential Decay"
  },
  {
    name: "The Process Efficiency Developer (Leo Dubois)",
    focus: "Batch Delta-V Compiling",
    guideline: "Discuss packing these solutions into single-threaded, sub-10ms numerical math kernels for low latency operational upload.",
    formula: "Thread-Safe Delta-V Matrix Parser"
  }
];
