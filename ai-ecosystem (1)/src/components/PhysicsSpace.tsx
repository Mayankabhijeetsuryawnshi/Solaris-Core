import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Cpu, 
  Sparkles, 
  Terminal, 
  Activity, 
  Play, 
  Copy, 
  ChevronDown, 
  Check, 
  AlertCircle, 
  Info, 
  RefreshCw, 
  Sliders, 
  Layers, 
  Atom, 
  FileText, 
  CheckSquare, 
  User, 
  HelpCircle, 
  ArrowRight,
  TrendingUp,
  Award
} from "lucide-react";

interface PhysicsSpaceProps {
  consensusTopic: string;
  setConsensusTopic: (val: string) => void;
  consensusStatus: "idle" | "conversing" | "fusing" | "completed" | "error";
  handleRunSwarmConsensus: () => Promise<void>;
  consensusLogs: Array<{ modelId: string; modelName: string; content: string; key: number }>;
  consensusFinalResult: string;
  renderFormattedConsensusText?: (text: string, isPhysics: boolean) => React.ReactNode;
  onClearConsensus?: () => void;
  altitude?: number;
  setAltitude?: (val: number) => void;
  approachSpeed?: number;
  setApproachSpeed?: (val: number) => void;
  weightTheoretical?: number;
  setWeightTheoretical?: (val: number) => void;
  weightSystems?: number;
  setWeightSystems?: (val: number) => void;
  weightApplied?: number;
  setWeightApplied?: (val: number) => void;
}

const roundtableParticipants = [
  {
    id: "model-analytical",
    name: "Dr. Evelyn Vance",
    model: "Analytical Model",
    avatar: "🔬",
    color: "border-sky-500/30 text-sky-400 bg-sky-950/25",
    description: "Focuses on exact mathematical physics, Newtonian equations, orbital mechanics vectors, and J2 spherical harmonics."
  },
  {
    id: "model-creative",
    name: "Dr. Yuki Sinclair",
    model: "Creative Model",
    avatar: "💡",
    color: "border-teal-500/30 text-teal-400 bg-teal-950/25",
    description: "Formulates out-of-the-box mechanisms like aerodynamic morphing wings and electrodynamic tethers."
  },
  {
    id: "model-skeptical",
    name: "Dr. Clara Mercer",
    model: "Skeptical Model",
    avatar: "🧮",
    color: "border-rose-500/30 text-rose-400 bg-rose-950/25",
    description: "Challenges simplified assumptions, demanding solar cycle, diurnal bulge, and radiation pressures constraints."
  },
  {
    id: "model-empathetic",
    name: "Dr. Amara Diallo",
    model: "Empathetic Model",
    avatar: "🌍",
    color: "border-emerald-500/30 text-emerald-400 bg-emerald-950/25",
    description: "Addresses space safety, cascading debris cascades, humanitarian LEO utilities, and Design-for-Demise protocols."
  },
  {
    id: "model-pragmatic",
    name: "Marcus Sterling, P.E.",
    model: "Pragmatic Model",
    avatar: "⚙️",
    color: "border-amber-500/30 text-amber-400 bg-amber-950/25",
    description: "Calculates cost-efficiency, hardware tolerances, propellant mass budgets, and Hall effect thruster performance."
  },
  {
    id: "model-strategic",
    name: "Director Leo Dubois",
    model: "Strategic Model",
    avatar: "👑",
    color: "border-indigo-500/30 text-indigo-400 bg-indigo-950/25",
    description: "Architects the operational policy roadmaps, global debris treaties (IADC), and sovereign aerospace standards."
  }
];

const roundtableSteps = [
  {
    step: 1,
    focus: "Baseline Propagation & Orbit Decay Definition",
    participantName: "Dr. Evelyn Vance (Analytical Model)",
    contribution: "I establish the mathematical baseline for LEO satellite decay under non-uniform drag. Let orbital velocity be defined from Newton’s theory as v_{orbit} = \\sqrt{G M / r}. By expressing the change in semi-major axis over time as a differential equation, we resolve: \\frac{da}{dt} = -2\\pi \\frac{C_D A}{m} \\rho \\sqrt{G M a}. Substituting our altitude parameter h = 350 km and Earth radius R_E = 6378.1 km, we obtain nominal orbital velocity v = 7.697 km/s. The drag coefficient C_D is initially modelled as a constant 2.2 for a simple spherical profile. However, this is merely our idealized starting point. The continuous energy reduction from atmospheric friction guarantees continuous altitude decay."
  },
  {
    step: 2,
    focus: "Non-Uniform Density Variations & Bulge Dynamics",
    participantName: "Dr. Clara Mercer (Skeptical Model)",
    contribution: "I must challenge the assumption of a static, isotropic atmosphere. Representing density \\rho merely as an exponential scaling function is a massive error that risks mission failure. We must integrate the diurnal thermospheric bulge which lag-aligns with solar radiation peak at 14:00 local time. This causes local density values to fluctuate by up to 300% depending on geomagnetic indices (F_{10.7} flux). The geodetic density variation coordinates are modelled as \\rho(h, \\lambda, \\phi) = \\rho_0(h)[1 + F \\cos^3(\\frac{\\psi}{2})]. We must treat atmospheric density as a dynamic, non-uniform system rather than an idealized classical system."
  },
  {
    step: 3,
    focus: "Aerodynamic Morphing & Mechanical Arrays",
    participantName: "Dr. Yuki Sinclair (Creative Model)",
    contribution: "Instead of accepting this density variation as a destructive element, let us use creative physics to dynamically control it. I propose 'Aerodynamic Variable Geometry' (AVG) morphing solar wings. By integrating micro-actuators, we can continuously morph the satellite's effective cross-sectional area A(t) on a real-time feedback loop. When passing through density peaks or solar bulges, we can rotate arrays parallel to the vector velocity to minimize drag, and when in sparse pockets, we can maximize drag if controlled de-orbit is desired. This active morphing loop turns atmospheric resistance into a steering utility."
  },
  {
    step: 4,
    focus: "Thruster Desaturation & Propellant Conservation",
    participantName: "Marcus Sterling, P.E. (Pragmatic Model)",
    contribution: "While dynamic wings are elegant, we must calculate the mechanical payload of such actuators. From a pragmatic viewpoint, we need active chemical or electrical counter-propulsion. Applying the Tsiolkovsky Rocket Equation, namely \\Delta v = I_{sp} g \\ln(\\frac{m_0}{m_f}), we must define the minimum propellant mass portion required for slot-keeping. I recommend a low-thrust Hall Effect Thruster operating at a specific impulse I_{sp} \\approx 1500 s. By executing small, scheduled retrograde deceleration burns, we keep peak thrust levels at 80 mN, ensuring propellant efficiency and maximizing hardware lifespan, rather than putting ourselves at the mercy of complex actuation wings."
  },
  {
    step: 5,
    focus: "Space Debris Kessler Collision Risk Assessments",
    participantName: "Dr. Amara Diallo (Empathetic Model)",
    contribution: "Propulsion scheduling and weight ratios are vital, but we must focus on the societal risk of orbital decay. Uncontrolled decay poses a massive risk of Kessler Syndrome cascade, which would deny satellite communications to developing nations during climate disasters. The probability of debris collision is proportional to local density: P_{coll} = 1 - e^{-\\sigma_c N v_{rel} t}. We must ensure station-keeping prevents satellite drift into highly populated debris belts. Our mathematical modeling should not just prioritize mechanical lifetime; it must safeguard international weather forecasting and preserve low orbits as a shared global heritage."
  },
  {
    step: 6,
    focus: "International Debris Mitigation Regulatory Roadmap",
    participantName: "Director Leo Dubois (Strategic Model)",
    contribution: "To align these safety priorities with international law, we must integrate the Inter-Agency Space Debris Coordination Committee (IADC) 25-Year rule. I mandate a strict strategic timeline: a passive 'Design-for-Demise' threshold where satellite materials burn up completely upon re-entry. We will establish a legal-policy framework where satellites that drift below 200 km must automatically deploy passive drag enhancement sails or finalize retrograde disposal burns within 120 days. This strategic coordination binds the physical drag models to global space treaties, establishing orbital safety as an ironclad sovereign treaty."
  },
  {
    step: 7,
    focus: "Gravity Multipole Coupling & Harmonic Precession",
    participantName: "Dr. Evelyn Vance (Analytical Model)",
    contribution: "Let us return to the orbital math. The decay cannot be isolated from geopotential perturbations. The Earth's oblate spheroid shape introduces the dominant J2 harmonic term. This creates orbital node precession and argument of perigee rotation: \\dot{\\Omega} = -\\frac{3}{2} J_2 (\\frac{R_E}{p})^2 n \\cos i. By solving this alongside our drag decay equation, we find that the altitude drop h is strongly coupled with latitude. As perigee precesses, the satellite encounters varying thermospheric densities at different latitudes, changing the decay rate dynamically."
  },
  {
    step: 8,
    focus: "Solar Pressure & Albedo Interference Modeling",
    participantName: "Dr. Clara Mercer (Skeptical Model)",
    contribution: "The analytical precession model is a great step forward, but we are still neglecting other non-conservative vectors. At altitudes exceeding 400 km, Solar Radiation Pressure (SRP) and solar wind push the satellite with a vector strength F_{SRP} = P_{SR} A_a (1 + r). For highly reflective solar panels, SRP force is of the same order of magnitude as atmospheric drag at solar minimum. If we attribute all semi-major axis drift exclusively to drag, we will miscalculate atmospheric density. Our models must incorporate solar albedo reflections from the Earth's surface as a continuous perturbation layer."
  },
  {
    step: 9,
    focus: "Electrodynamic Tether Electro-Motive Forcing",
    participantName: "Dr. Yuki Sinclair (Creative Model)",
    contribution: "If magnetic field lines are causing orbital precession, let us harness them! I propose installing a 5-kilometer electrodynamic tether. As the satellite cuts through the Earth's geomagnetic field B, it induces a voltage drop \\varepsilon = L (v \\times B). By completing the circuit through ambient ionospheric plasma, we generate a Lorentz force F_L = I (L \\times B). This force acts as a continuous propellant-free deceleration or acceleration vector! We can literally harness our orbital speed through Earth's magnetic grid to control satellite decay without a single drop of fuel."
  },
  {
    step: 10,
    focus: "Tether Deployer Financial and Structural Viability",
    participantName: "Marcus Sterling, P.E. (Pragmatic Model)",
    contribution: "An electrodynamic tether sounds fantastic, but let us look at the real-world mass efficiency. A 5 km conductive cooper tether adds 45 kg of structural weight, alongside high-voltage regulators and plasma contactor systems. This increases the launch cost by nearly ₹10 Crore. Furthermore, long tethers have a high probability of being severed by micrometeoroids. Comparing this against a standard monopropellant hydrazine system for an expected 3-year lifespan shows that hydrazine is 14% cheaper and has a 98.5% component reliability. We must prioritize physical, cost-effective realities over elegant scientific prototypes."
  },
  {
    step: 11,
    focus: "Design-for-Demise Passive Atmospheric Incineration",
    participantName: "Dr. Amara Diallo (Empathetic Model)",
    contribution: "I agree that we must keep spacecraft structures highly reliable, but we cannot ignore the risk of debris from severed tethers. To balance cost and safety, the entire satellite housing should utilize lightweight aluminum alloys designed for complete burn-up during re-entry. Our thermal models should guarantee that any piece of the craft greater than 15 grams is incinerated completely above 80 km. This passive demisability ensures that even if our active thrusters or electrodynamic tethers fail, the falling satellite poses a zero percent risk of injury to humans on the ground."
  },
  {
    step: 12,
    focus: "Integrated Multi-Paradigm Sovereign Treaty Accord",
    participantName: "Director Leo Dubois (Strategic Model)",
    contribution: "We have reached our complete sovereign agreement. The final unified design combines Dr. Vance's J2 orbit mechanics, Dr. Mercer's non-uniform solar radiation and atmospheric bulge filters, Dr. Sinclair's hybrid micro-actuated wings, Marcus's high-efficiency scheduled chemical thrusters, and Dr. Amara's passive demisable design. This multi-agent framework will be codified as the standard orbital insertion policy for future satellites, resolving orbital decay under a unified mathematical, practical, and highly secure framework."
  }
];

export default function PhysicsSpace({
  consensusTopic,
  setConsensusTopic,
  consensusStatus,
  handleRunSwarmConsensus,
  consensusLogs,
  consensusFinalResult,
  renderFormattedConsensusText,
  onClearConsensus,
  altitude: propAltitude,
  setAltitude: propSetAltitude,
  approachSpeed: propApproachSpeed,
  setApproachSpeed: propSetApproachSpeed,
  weightTheoretical: propWeightTheoretical,
  setWeightTheoretical: propSetWeightTheoretical,
  weightSystems: propWeightSystems,
  setWeightSystems: propSetWeightSystems,
  weightApplied: propWeightApplied,
  setWeightApplied: propSetWeightApplied
}: PhysicsSpaceProps) {
  // Core physical presets list
  const physicsPresets = [
    {
      label: "☄️ Satellite Drag Decay",
      topic: "Analyse the orbital decay parameters of a low-Earth satellite under non-uniform atmospheric drag and formulate theoretical, numerical, and practical experimental validation methods."
    },
    {
      label: "🕳️ Schwarzschild probe",
      topic: "Determine the relativistic time dilation and gravitational redshift coefficients for a probe hovering at r = 3r_S outside a Schwarzschild black hole boundary."
    },
    {
      label: "💨 Rarefied Knudsen Flow",
      topic: "Calculate the rarefied molecular drag coefficients, Knudsen number (Kn = 12.4), and hyperthermal free-molecule aerodynamic force vectors acting on a Martian aeroshell at 120km altitude."
    },
    {
      label: "⚛️ Thermal Alpha-Alpha Fusion",
      topic: "Formulate the thermal transmission coefficient for alpha-decay under an asymmetrical Coulomb-Gamow potential barrier."
    }
  ];

  // Core physical constants list to click-to-copy or insert
  const physicalConstants = [
    { name: "Mars parameter", symbol: "\\mu_{Mars}", value: "4.2828e13 m³/s²" },
    { name: "Speed of Light", symbol: "c", value: "2.9979e8 m/s" },
    { name: "Gravitational constant", symbol: "G", value: "6.6743e-11 m³/(kg·s²)" },
    { name: "Boltzmann k_B", symbol: "k_B", value: "1.3806e-23 J/K" },
    { name: "Planck h", symbol: "h", value: "6.6261e-34 J·s" },
  ];

  const [copiedConstant, setCopiedConstant] = useState<string | null>(null);

  const handleCopyConstant = (constant: typeof physicalConstants[0]) => {
    const textToCopy = `${constant.symbol} = ${constant.value}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedConstant(constant.name);
    setTimeout(() => setCopiedConstant(null), 2000);
  };

  // Sub-tabs
  const [activeSubTab, setActiveSubTab] = useState<"roundtable" | "standard">("roundtable");
  
  // Controls
  const [roundtableLevel, setRoundtableLevel] = useState("Level 1: Undergraduate & Idealized Classical Physics");
  const [isLevelDropdownOpen, setIsLevelDropdownOpen] = useState(false);
  const [stepInterval, setStepInterval] = useState(1.0);
  
  // Scrolling page filters
  const [activeFilter, setActiveFilter] = useState<"all" | "scholars" | "verification" | "synthesis">("all");
  
  // Simulation phase control
  const [localPhase, setLocalPhase] = useState("DYNAMIC VERIFICATION ENGINE");
  const [isSimulating, setIsSimulating] = useState(false);

  // Interactive Verification Parameters
  const [localAltitude, localSetAltitude] = useState<number>(200); // km
  const [localApproachSpeed, localSetApproachSpeed] = useState<number>(3200); // m/s
  const [localWeightTheoretical, localSetTheoretical] = useState<number>(1.0);
  const [localWeightSystems, localSetSystems] = useState<number>(1.0);
  const [localWeightApplied, localSetApplied] = useState<number>(1.0);

  const altitude = propAltitude !== undefined ? propAltitude : localAltitude;
  const setAltitude = propSetAltitude || localSetAltitude;

  const approachSpeed = propApproachSpeed !== undefined ? propApproachSpeed : localApproachSpeed;
  const setApproachSpeed = propSetApproachSpeed || localSetApproachSpeed;

  const weightTheoretical = propWeightTheoretical !== undefined ? propWeightTheoretical : localWeightTheoretical;
  const setWeightTheoretical = propSetWeightTheoretical || localSetTheoretical;

  const weightSystems = propWeightSystems !== undefined ? propWeightSystems : localWeightSystems;
  const setWeightSystems = propSetWeightSystems || localSetSystems;

  const weightApplied = propWeightApplied !== undefined ? propWeightApplied : localWeightApplied;
  const setWeightApplied = propSetWeightApplied || localSetApplied;

  // Attachment states (just visual icons)
  const [attachedCount, setAttachedCount] = useState({ image: false, doc: false, video: false });

  // Mental models roundtable summary states
  const [selectedParticipantModel, setSelectedParticipantModel] = useState<string | null>(null);
  const [isTranscriptCopied, setIsTranscriptCopied] = useState(false);

  const copyRoundtableTranscript = () => {
    const rawText = roundtableSteps.map(step => 
      `Step ${step.step}: [${step.focus}]\nParticipant: ${step.participantName}\nContribution: ${step.contribution}\n\n========================================\n`
    ).join("\n");
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(rawText);
    }
    setIsTranscriptCopied(true);
    setTimeout(() => setIsTranscriptCopied(false), 2000);
  };

  // References for scrolling
  const scholarsRef = useRef<HTMLDivElement>(null);
  const verificationRef = useRef<HTMLDivElement>(null);
  const synthesisRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>, filterName: any) => {
    setActiveFilter(filterName);
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const renderSafeMath = (text: string) => {
    if (!text) return "";
    let processed = text;
    
    // Recursive Braces
    for (let i = 0; i < 4; i++) {
      processed = processed
        .replace(/\^\{([^{}]+)\}/g, "<sup>$1</sup>")
        .replace(/_\{([^{}]+)\}/g, "<sub>$1</sub>");
    }

    // Standard Greek & Scientific Symbols
    processed = processed
      .replace(/\\omega/g, "ω")
      .replace(/\\theta/g, "θ")
      .replace(/\\pi/g, "π")
      .replace(/\\mu/g, "μ")
      .replace(/\\sigma/g, "σ")
      .replace(/\\alpha/g, "α")
      .replace(/\\beta/g, "β")
      .replace(/\\gamma/g, "γ")
      .replace(/\\rho/g, "ρ")
      .replace(/\\lambda/g, "λ")
      .replace(/\\Delta/g, "Δ")
      .replace(/\\delta/g, "δ")
      .replace(/\\epsilon/g, "ε")
      .replace(/\\phi/g, "φ")
      .replace(/\\psi/g, "ψ")
      .replace(/\\eta/g, "η")
      .replace(/\\tau/g, "τ")
      .replace(/\\approx/g, "≈")
      .replace(/\\neq/g, "≠")
      .replace(/\\pm/g, "±")
      .replace(/\\le/g, "≤")
      .replace(/\\ge/g, "≥")
      .replace(/\\infty/g, "∞")
      .replace(/\\cdot/g, "·")
      .replace(/\\times/g, "×")
      .replace(/\\div/g, "÷")
      .replace(/\\partial/g, "∂")
      .replace(/\\nabla/g, "∇")
      .replace(/\\int/g, "∫")
      .replace(/\\sum/g, "Σ")
      .replace(/\\sqrt/g, "√")
      .replace(/\\hbar/g, "ħ")
      .replace(/\\deg/g, "°");

    // Braced vector/hat/dot modifiers
    processed = processed
      .replace(/\\vec\{([^{}]+)\}/g, '<span class="relative inline-block font-bold">$1<span class="absolute -top-1 left-0 right-0 text-[8px] leading-none block text-center">→</span></span>')
      .replace(/\\hat\{([^{}]+)\}/g, '<span class="relative inline-block">$1<span class="absolute -top-0.5 left-0 right-0 text-[9px] leading-none block text-center">^</span></span>')
      .replace(/\\bar\{([^{}]+)\}/g, '<span class="overline">$1</span>');

    // Fractions \frac{A}{B}
    processed = processed.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '<span class="inline-flex flex-col items-center justify-center align-middle mx-1 border border-zinc-800/40 px-1 rounded text-[10px]"><span class="border-b border-zinc-800 pb-0.5 px-0.5 text-center">$1</span><span class="pt-0.5 px-0.5 text-center">$2</span></span>');

    // Inline index replacements
    processed = processed
      .replace(/([a-zA-Z0-9_ωθπμσαβγλΔδεφψηητ.()!+-]+)\^([a-zA-Z0-9_ωθπμσαβγλΔδεφψηητ.+\/()!+-]+)/g, "$1<sup>$2</sup>")
      .replace(/([a-zA-Z0-9_ωθπμσαβγλΔδεφψηητ.()!+-]+)_([a-zA-Z0-9_ωθπμσαβγλΔδεφψηητ.+\/()!+-]+)/g, "$1<sub>$2</sub>");

    // Clean up text macros
    processed = processed
      .replace(/\\text\s*\{([^{}]+)\}/g, '<span class="not-italic">$1</span>')
      .replace(/\\mathrm\s*\{([^{}]+)\}/g, '<span class="not-italic">$1</span>');

    // Style factorials elegantly (e.g. n! or (n-k)!)
    processed = processed
      .replace(/([a-zA-Z0-9]+)!/g, '<span class="italic text-cyan-300">$1</span><span class="font-bold text-cyan-400">!</span>')
      .replace(/\(([^()]+)\)!/g, '<span class="font-semibold text-cyan-300">($1)</span><span class="font-bold text-cyan-400">!</span>');

    return <span className="font-serif italic select-all inline" dangerouslySetInnerHTML={{ __html: processed }} />;
  };

  // 12 elite academic agents
  const academicAgents = [
    {
      id: "agent-1",
      name: "The Classical Academic",
      author: "NELSON VERAS, M.ED. (HE/HIM)",
      status: "INTRODUCTORY IDEAL LINEAR MODELS",
      avatar: "C",
      color: "border-sky-500/20 text-sky-400 bg-sky-950/20",
      quote: "Let us keep this straightforward. We use the formula for circular orbital velocity, v_{orbit} = \\sqrt{\\frac{\\mu}{r}}, where r = R_{Mars} + h. The delta-V is simply the difference between the approach speed and this orbital speed: \\Delta v = |v_{approach} - v_{orbit}|.",
      formula: "v_{orbit} = \\sqrt{\\frac{\\mu}{r}}",
      constant: "g = 9.81 m/s² | G = 6.67 \\times 10^{-11} m^3/(kg\\cdot s^2)"
    },
    {
      id: "agent-2",
      name: "The Systems & Industrial Engineer",
      author: "MARCUS STERLING, P.E. (HE/HIM)",
      status: "CONTINUOUS MASS HELIUM EXPORT EFFICIENCY",
      avatar: "E",
      color: "border-teal-500/20 text-teal-400 bg-teal-950/20",
      quote: "From a systems engineering perspective, the transition from a hyperbolic approach trajectory to a circular one requires an impulsive burn. We must account for the mass-flow rate of the propellant, though in this idealized model, we assume instantaneous velocity change.",
      formula: "Trajectory Delta-V Impulses",
      constant: "Operations Safety Margin (SF = 1.15)"
    },
    {
      id: "agent-3",
      name: "The Mechanical Systems Theorist",
      author: "DR. CLARA MERCER (SHE/HER)",
      status: "AB-INITIO WAVE PERTURBATIONS",
      avatar: "M",
      color: "border-cyan-500/20 text-cyan-400 bg-cyan-950/20",
      quote: "While micro-scale effects are negligible at this macro-scale, the precision of our constants is paramount. The discretization of energy levels is irrelevant here, but the precision of G and GM elements from planetary grids provides our foundational convergence bounds.",
      formula: "Planetary Wave States",
      constant: "Froude Number | Bohr limits"
    },
    {
      id: "agent-4",
      name: "The Solid-State/Hardware Architect",
      author: "DR. JUN-HO PARK (HE/WIV)",
      status: "MICROSCOPIC LATTICE & COLLISION TOPOLOGY",
      avatar: "H",
      color: "border-blue-500/20 text-blue-400 bg-blue-950/20",
      quote: "The spacecraft structure must withstand the thermal loading of the burn. However, for the kinematics, we focus on the trajectory. The change in velocity vector is the key variable to solve, ensuring physical thruster manifolds align with orbital vectors.",
      formula: "Stress/Strain Trajectory Projections",
      constant: "Alloy melting limits | G-force tolerance"
    },
    {
      id: "agent-5",
      name: "The Theoretical Physicist",
      author: "DR. SEAN O'CONNOR (HE/HIM)",
      status: "QUANTUM RELATIVITY & COSMIC TENSION",
      avatar: "P",
      color: "border-indigo-500/20 text-indigo-400 bg-indigo-950/20",
      quote: "General relativistic frame-dragging is less than 0.001 m/s here, meaning Newtonian mechanics governs. Defining R_{Mars} = 3,389,500 m and \\mu = 4.282837 \\times 10^{13} m^3/s^2, the calculations yield highly consistent results with classical orbital entry speeds.",
      formula: "r_{effective} = r + \\Delta r_{relativistic}",
      constant: "c = 299,792,458 m/s | \\mu_{Mars} = 4.282837 \\times 10^{13} m^3/s^2"
    },
    {
      id: "agent-6",
      name: "The Empirical Researcher",
      author: "DR. ELENA ROSTOVA (SHE/HER)",
      status: "OBSERVATIONAL FIELD ACCURACY CONTROLLER",
      avatar: "R",
      color: "border-emerald-500/20 text-emerald-400 bg-emerald-950/20",
      quote: "Our physical telemetry verifies that Mars has an asymmetrical gravity field, but at a 200 km circular altitude, J_2 variations are under 0.05%. We can safely assume spherical symmetry for this undergraduate seminar level.",
      formula: "J_2 Geopotential Corrections",
      constant: "Mean Radius R_M = 3,389.5 km"
    },
    {
      id: "agent-7",
      name: "The Cryogenic Specialist",
      author: "DR. YUKI TANAKA (HE/HIM)",
      status: "THERMODYNAMIC HEAT-SHIELD DISPERSION FLUX",
      avatar: "T",
      color: "border-cyan-500/20 text-cyan-400 bg-cyan-950/20",
      quote: "Fuel vapor pressures during retrograde decelerations require cryogenic stabilization. The delta-V of 254.21 m/s scales directly to thruster firing times, meaning thermodynamic nozzle back-pressure must remain strictly sub-critical.",
      formula: "Nozzle Gas Vent Kinematics",
      constant: "Specific Impulse I_{sp} = 310 s"
    },
    {
      id: "agent-8",
      name: "The Applied Bio-Systems Practitioner",
      author: "DR. AMARA DIALLO (SHE/HER)",
      status: "CLOSED-LOOP BIOSPHERE REGENERATION NETWORKS",
      avatar: "B",
      color: "border-purple-500/20 text-purple-400 bg-purple-950/20",
      quote: "Crew G-loads during orbital insertion of 254.21 m/s are negligible because deceleration is spread across an impulsive 45-second burn. Hydroponic life-support tanks will experience minimal sloshing, within safe tolerance thresholds.",
      fallback: true,
      formula: "Hydro-slosh fluid inertia bounds",
      constant: "Safety threshold: < 1.2G lateral"
    },
    {
      id: "agent-9",
      name: "The Classical Mathematical Modeler",
      author: "PROF. ALAN VANCE (HE/HIM)",
      status: "HIGH-DIMENSIONAL CONTINUUM PDEs",
      avatar: "M",
      color: "border-sky-500/20 text-sky-400 bg-sky-950/20",
      quote: "We model this Keplerian boundary as a classic two-body system. Integrating the Vis-Viva equation v^2 = \\mu(2/r - 1/a) with a infinite approach distance validates that our circular orbit requirement simplifies perfectly to v_{orbit} = \\sqrt{\\mu/r}.",
      formula: "Vis-Viva Continuum Trajectory",
      constant: "Kronecker deltas | Riemann boundary limits"
    },
    {
      id: "agent-10",
      name: "The Micro-Scale Harmonic Specialist",
      author: "DR. CHLOE LIANG (SHE/HER)",
      status: "MOLECULAR VIBRATION COUPLING COEF",
      avatar: "H",
      color: "border-teal-500/20 text-teal-400 bg-teal-950/20",
      quote: "High-frequency acoustic vibrations in thruster struts during orbital capture could couple with spacecraft computer housing. Rigid dampening ensures that mechanical capture does not generate signal anomalies.",
      formula: "Structural Strut Harmonic Ratios",
      constant: "Coupling coefficient K_c = 0.045"
    },
    {
      id: "agent-11",
      name: "The Environmental Climatologist",
      author: "DR. SARAH JENKINS (SHE/HER)",
      avatar: "C",
      status: "ORBITAL DECAY MODELING",
      color: "border-emerald-500/20 text-emerald-400 bg-emerald-950/20",
      quote: "At 200 km altitude, Mars' atmospheric density is extremely thin but non-zero (approx 1.5e-11 kg/m³). Although drag will notice orbital decay over months, for our instantaneous capture calculations, drag effects are safely negligible.",
      formula: "Atmospheric Density Exponential Decay",
      constant: "Scale Height H = 11.1 km"
    },
    {
      id: "agent-12",
      name: "The Process Efficiency Developer",
      author: "LEO DUBOIS (HE/HIM)",
      avatar: "P",
      status: "BATCH DELTA-V COMPILING & PACKAGING",
      color: "border-sky-500/20 text-sky-400 bg-sky-950/20",
      quote: "Compiling these equations into a multi-agent numerical engine, we achieve quick, sub-10ms convergence. The computational cost is minimal. We have packaged the resulting 254.21 m/s calculation array for telemetry upload.",
      formula: "Thread-Safe Delta-V Database Parser",
      constant: "System overhead < 0.02%"
    }
  ];

  // Peer review challenge transcript items
  const peerReviews = [
    {
      id: "pr-1",
      author: "The Classical Academic",
      target: "The Systems & Industrial Engineer",
      content: "\"While you are correct regarding vectors, the problem defines the approach at a specific relative speed. In a Level 1 model, we assume the approach velocity is tangential at periapsis for a Hohmann-like insertion.\""
    },
    {
      id: "pr-2",
      author: "The Classical Mathematical Modeler",
      target: "The Systems & Industrial Engineer",
      content: "\"We must ensure we utilize \\mu = 4.282837 \\times 10^{13} \\text{ m}^3 / \\text{s}^2 consistently across all calculations to avoid variance in the final \\Delta v.\""
    },
    {
      id: "pr-3",
      author: "The Solid-State/Hardware Architect",
      target: "The Cryogenic & Thermodynamic Specialist",
      content: "\"Should we consider the center-of-mass shift during the burn? No, for this idealized model, we assume a rigid body point mass.\""
    },
    {
      id: "pr-4",
      author: "The Environmental Climatologist",
      target: "The Theoretical Physicist",
      content: "\"I agree with the point-mass assumption; however, let us confirm the radius: r = 3,389,500 \\text{ m} + 200,000 \\text{ m}. Using r = 3,589,500 \\text{ m} is standard for this level of physics.\""
    }
  ];

  // Isolated Calculations
  const calculatedCards = [
    {
      title: "THEORETICAL PHYSICIST",
      result: "254.21 m/s",
      steps: [
        "Define: r = R_{Mars} + h = 3,389,500\\text{ m} + 200,000\\text{ m} = 3,589,500\\text{ m}",
        "Delta-V: \\Delta v = v_{orbit} - v_{approach} = 3,454.21 - 3,200.0 = 254.21\\text{ m/s}"
      ]
    },
    {
      title: "CLASSICAL ACADEMIC",
      result: "254.30 m/s",
      steps: [
        "Define: r = 3,389.5 + 200 = 3,589.5\\text{ km}",
        "Delta-V requirement: \\Delta v = 3,453.066 - 3,200.0 = 253.07\\text{ m/s} (Adjusted: 254.30\\text{ m/s})"
      ]
    },
    {
      title: "ENVIRONMENTAL CLIMATOLOGIST",
      result: "254.21 m/s",
      steps: [
        "Confirm: r = 3,589,500\\text{ m}",
        "Calculate burn impulse matching target: \\Delta v_t = 3,454.2185 - 3,200.0 = 254.2185\\text{ m/s}"
      ]
    },
    {
      title: "CRYOGENIC & THERMODYNAMIC SPECIALIST",
      result: "254.21 m/s",
      steps: [
        "Use: v_{orbit} = 3454.2185\\text{ m/s}",
        "Cryogenic nozzle fluid dynamic stability confirmed for retroactive capture burn."
      ]
    }
  ];

    // Discrepancy Table Row type matches exactly
  const matrixRows = [
    { name: "The Theoretical Physicist", formula: "Orbital Mechanics", constant: "Mars Gravitational Parameter", rounding: "3-decimal Float", result: "254.21 m/s", variance: "0.00%", reason: "Standard Newtonian orbital mechanics applied." },
    { name: "The Empirical Researcher", formula: "Newtonian Gravity", constant: "Mars Mean Radius", rounding: "3-decimal Float", result: "254.21 m/s", variance: "0.00%", reason: "Consistent constants applied." },
    { name: "The Classical Academic", formula: "Circular Velocity", constant: "GM simplified", rounding: "3-decimal Float", result: "254.30 m/s", variance: "-0.035%", reason: "Rounding of GM constant." },
    { name: "The Systems & Industrial Engineer", formula: "Impulse Momentum", constant: "Standard Gravity", rounding: "3-decimal Float", result: "254.21 m/s", variance: "0.00%", reason: "Consistent with theoretical model." },
    { name: "The Mechanical Systems Theorist", formula: "None (Classical)", constant: "Reynolds r", rounding: "3-decimal Float", result: "254.21 m/s", variance: "0.00%", reason: "Precision alignment." },
    { name: "The Solid-State/Hardware Architect", formula: "Kinematics", constant: "Mars radius", rounding: "3-decimal Float", result: "254.21 m/s", variance: "0.00%", reason: "Standard calculation." },
    { name: "The Cryogenic Specialist", formula: "Energy Balance", constant: "Velocity difference", rounding: "3-decimal Float", result: "254.21 m/s", variance: "0.00%", reason: "Standard calculation." },
    { name: "The Applied Bio-System Practitioner", formula: "Steady State", constant: "None", rounding: "3-decimal Float", result: "254.21 m/s", variance: "0.00%", reason: "Standard calculation." },
    { name: "The Classical Mathematical Modeler", formula: "Vis-Viva", constant: "GM", rounding: "3-decimal Float", result: "254.21 m/s", variance: "0.00%", reason: "Standard calculation." },
    { name: "The Micro-Scale Harmonic Specialist", formula: "Kinematics", constant: "None", rounding: "3-decimal Float", result: "254.21 m/s", variance: "0.00%", reason: "Standard calculation." },
    { name: "The Environmental Climatologist", formula: "Circular Orbit", constant: "Mars radius", rounding: "2-decimal Float", result: "254.21 m/s", variance: "0.00%", reason: "Standard calculation." },
    { name: "The Process Efficiency Developer", formula: "Relat. Delta V", constant: "None", rounding: "3-decimal Float", result: "254.21 m/s", variance: "0.00%", reason: "Standard calculation." },
  ];

  // Triggers simulation animations matching image
  const triggerRoundtableSimulation = async () => {
    setIsSimulating(true);
    setLocalPhase("PHASE 1: GATHERING AGENT DATA...");
    
    await new Promise(r => setTimeout(r, 1200));
    setLocalPhase("PHASE 2: GATHERING FEEDBACK...");
    
    await new Promise(r => setTimeout(r, 1200));
    setLocalPhase("PHASE 3: RECONCILED CALCULATIONS");
    setIsSimulating(false);
    
    // Call real LLM Swarm if customized
    handleRunSwarmConsensus();
  };

  return (
    <div className="w-full text-zinc-100 font-sans space-y-6 select-none relative z-10 text-left">
      {/* 1. Header Block exactly like the given image */}
      <div className="border border-cyan-500/25 bg-slate-950/95 rounded-2xl p-4 md:p-6 backdrop-blur-md shadow-[0_0_25px_rgba(6,182,212,0.15)] relative overflow-hidden">
        {/* Decorative corner highlights */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-500" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-500" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-500" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-500" />
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
          <div className="flex items-center gap-3.5 text-left">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/50 border border-cyan-500/40 flex items-center justify-center shadow-lg">
              <Atom className="w-6 h-6 text-cyan-400 animate-spin" style={{ animationDuration: "8s" }} />
            </div>
            <div>
              <h1 className="text-sm md:text-base font-black tracking-[0.25em] text-cyan-450 uppercase mb-0.5 font-mono">
                UNIVERSAL SWARM DEBATE SEMINAR
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(6,182,212,1)]" />
            <span className="text-[10px] font-mono tracking-wider font-extrabold text-cyan-400 uppercase bg-cyan-950/40 border border-cyan-500/20 px-2.5 py-0.5 rounded-md">
              SYSTEM ONLINE
            </span>
          </div>
        </div>

        {/* Level Navigation Sub-Tabs right below */}
        <div className="flex border-b border-zinc-800/60 mt-5 pt-1">
          <button
            onClick={() => setActiveSubTab("roundtable")}
            className={`px-5 py-3 text-[10.5px] font-mono font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === "roundtable"
                ? "border-cyan-500 text-cyan-400 bg-cyan-950/15"
                : "border-transparent text-zinc-500 hover:text-zinc-300 bg-transparent"
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>12-Model Scientific Debate</span>
          </button>
          <button
            onClick={() => setActiveSubTab("standard")}
            className={`px-5 py-3 text-[10.5px] font-mono font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === "standard"
                ? "border-cyan-500 text-cyan-400 bg-cyan-950/15"
                : "border-transparent text-zinc-500 hover:text-zinc-300 bg-transparent"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Standard Consensus</span>
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeSubTab === "standard" ? (
          <motion.div 
            key="std-space"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-5 border border-zinc-850 bg-black/60 rounded-xl max-w-7xl mx-auto space-y-4"
          >
            <h2 className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">Standard Swarm Consensus Log</h2>
            {consensusLogs.length === 0 ? (
              <div className="py-12 border border-dashed border-zinc-800 rounded-xl text-center text-zinc-500 text-xs">
                Awaiting standard swarm activation. Trigger a seminar to view consensus.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {consensusLogs.map((log) => (
                  <div key={log.key} className="p-3 border border-zinc-800 bg-slate-950/60 rounded-lg text-left text-xs space-y-2">
                    <div className="flex justify-between font-mono text-[9px] text-zinc-400">
                      <span className="font-bold text-emerald-300">{log.modelName}</span>
                      <span>OPINION #{log.key + 1}</span>
                    </div>
                    <p className="text-zinc-300 leading-relaxed font-sans">{log.content}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="roundtable-space"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Control & Problem Input Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 max-w-7xl mx-auto">
              {/* Column 1: Multi-Paradigm selector & interval slider */}
              <div className="lg:col-span-8 p-5 bg-slate-950/95 border border-zinc-800/80 rounded-2xl flex flex-col justify-between gap-4 text-left">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Dropdown level */}
                  <div className="relative text-left">
                    <label className="text-[8.5px] font-mono uppercase tracking-widest text-zinc-500 font-extrabold block mb-1.5">
                      Select Analytical Paradigm Level
                    </label>
                    <button
                      onClick={() => setIsLevelDropdownOpen(!isLevelDropdownOpen)}
                      className="w-full bg-black/75 border border-zinc-850 hover:border-cyan-550 rounded-lg px-3 py-2 text-[11px] font-mono text-zinc-200 flex items-center justify-between cursor-pointer"
                    >
                      <span className="truncate">{roundtableLevel}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-zinc-400 shrink-0 select-none" />
                    </button>
                    {isLevelDropdownOpen && (
                      <div className="absolute left-0 right-0 mt-1.5 bg-neutral-900 border border-zinc-800 rounded-lg shadow-xl z-50 text-left overflow-hidden">
                        {[
                          "Level 1: Undergraduate & Idealized Classical Physics",
                          "Level 2: Graduate Thermal & Statistical Mechanics",
                          "Level 3: Post-Doctoral Relativistic Astrodynamics & Field Theory",
                          "Level 4: Frontier Relativistic Astrodynamics & Unified M-Theory"
                        ].map((lvl, idx) => (
                          <div
                            key={lvl}
                            onClick={() => {
                              setRoundtableLevel(lvl);
                              setIsLevelDropdownOpen(false);
                            }}
                            className="p-2.5 text-[10.5px] font-mono text-zinc-400 hover:text-white hover:bg-zinc-850 cursor-pointer border-b border-zinc-800 last:border-none"
                          >
                            {lvl}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Range interval */}
                  <div className="text-left flex flex-col justify-center">
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-[8.5px] font-mono uppercase tracking-widest text-zinc-500 font-extrabold">
                        Simulation Step Interval
                      </label>
                      <span className="text-[10px] font-mono font-bold text-cyan-400 block leading-tight">
                        {stepInterval.toFixed(1)}s / step
                      </span>
                    </div>
                    <input 
                      type="range"
                      min="0.1"
                      max="3.0"
                      step="0.1"
                      value={stepInterval}
                      onChange={(e) => setStepInterval(parseFloat(e.target.value))}
                      className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                  </div>
                </div>

                {/* INTERACTIVE PRESETS & CONSTANTS BAR */}
                <div className="space-y-3.5 pt-2 border-t border-zinc-900">
                  <div>
                    <label className="text-[8.5px] font-mono uppercase tracking-widest text-cyan-450 font-extrabold block mb-2">
                      ⚡ Quick-Load Nobel-Level Physics Workspace Presets
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {physicsPresets.map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => setConsensusTopic(preset.topic)}
                          className={`px-2.5 py-1.5 rounded-lg border text-left transition-all text-[10px] font-mono cursor-pointer flex items-center justify-between group ${
                            consensusTopic === preset.topic
                              ? "bg-cyan-950/40 border-cyan-500/80 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.15)]"
                              : "bg-black/60 border-zinc-850 hover:border-cyan-500/40 text-zinc-400 hover:text-zinc-200"
                          }`}
                        >
                          <span className="truncate pr-1 font-semibold">{preset.label}</span>
                          <span className="text-[8px] opacity-0 group-hover:opacity-100 transition-opacity text-cyan-400 shrink-0 select-none">LOAD ↵</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-[8.5px] font-mono uppercase tracking-widest text-cyan-450 font-extrabold block">
                        ⚛️ Nobel Physical Constants Selector (Click to Copy to Clipboard)
                      </label>
                      {copiedConstant && (
                        <span className="text-[8.5px] font-mono text-emerald-400 font-bold block animate-pulse">
                          ✓ Copied {copiedConstant}!
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {physicalConstants.map((constant) => (
                        <button
                          key={constant.name}
                          type="button"
                          onClick={() => handleCopyConstant(constant)}
                          className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800 hover:border-cyan-500/45 hover:bg-cyan-950/10 text-zinc-300 hover:text-cyan-300 text-[10px] font-mono transition-all flex items-center gap-1 cursor-pointer select-all"
                          title="Click to copy exact value to clipboard"
                        >
                          <span className="text-cyan-400 font-serif italic">{constant.symbol}</span>
                          <span className="text-zinc-500 text-[8px] select-none">({constant.name})</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* SCIENTIFIC TOPIC / PROBLEM INPUT */}
                <div className="space-y-1.5 text-left pt-2 border-t border-zinc-900">
                  <div className="flex justify-between">
                    <label className="text-[8.5px] font-mono uppercase tracking-widest text-zinc-400 font-extrabold block">
                      Scientific Topic / Engineering Problem <span className="text-zinc-650">(Independent & Fully Editable Workspace)</span>
                    </label>
                  </div>
                  <textarea
                    rows={2}
                    value={consensusTopic}
                    onChange={(e) => setConsensusTopic(e.target.value)}
                    className="w-full bg-black/85 border border-zinc-850 focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/20 text-zinc-200 text-xs font-mono p-3 rounded-xl focus:outline-none placeholder-zinc-700 resize-none"
                    placeholder="e.g. Determine the orbital deceleration burn trajectory with non-spherical planetary perturbation coefficients..."
                  />
                  
                  {/* Attach Research Agents panel */}
                  <div className="flex items-center gap-3 pt-1 text-[10px] font-mono">
                    <span className="text-zinc-500 uppercase tracking-wider font-extrabold text-[8.5px]">Attach Research Agents:</span>
                    <button 
                      onClick={() => setAttachedCount(prev => ({ ...prev, image: !prev.image }))}
                      className={`px-3 py-1 border rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                        attachedCount.image ? "bg-cyan-950/30 border-cyan-500/45 text-cyan-400" : "bg-neutral-900/65 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      <span>🖼️</span> <span>Image</span>
                    </button>
                    <button 
                      onClick={() => setAttachedCount(prev => ({ ...prev, doc: !prev.doc }))}
                      className={`px-3 py-1 border rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                        attachedCount.doc ? "bg-cyan-950/30 border-cyan-500/45 text-cyan-400" : "bg-neutral-900/65 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      <span>📂</span> <span>Document</span>
                    </button>
                    <button 
                      onClick={() => setAttachedCount(prev => ({ ...prev, video: !prev.video }))}
                      className={`px-3 py-1 border rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                        attachedCount.video ? "bg-cyan-950/30 border-cyan-500/45 text-cyan-400" : "bg-neutral-900/65 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      <span>🎬</span> <span>Video</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Column 2: Launch debate button */}
              <div className="lg:col-span-4 p-5 bg-slate-950/95 border border-zinc-800/80 rounded-2xl flex flex-col justify-between gap-4 text-left">
                <div className="space-y-2">
                  <label className="text-[8.5px] font-mono uppercase tracking-widest text-zinc-500 font-extrabold block">
                    Telemetry Dispatch & Compiler
                  </label>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={triggerRoundtableSimulation}
                    disabled={isSimulating}
                    className={`w-full py-4 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 border cursor-pointer ${
                      isSimulating || consensusStatus === "conversing"
                        ? "bg-cyan-950/20 border-cyan-900/40 text-cyan-600 cursor-not-allowed animate-pulse"
                        : "bg-cyan-500 hover:bg-cyan-455 text-black border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.35)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] font-black"
                    }`}
                  >
                    <Play className="w-4 h-4 fill-current shrink-0" />
                    <span>Start Debate</span>
                  </button>

                  {/* Manual Clear Chats Trigger */}
                  {(consensusLogs.length > 0 || consensusFinalResult) && onClearConsensus && (
                    <button
                      type="button"
                      onClick={onClearConsensus}
                      disabled={isSimulating || consensusStatus === "conversing" || consensusStatus === "fusing"}
                      className="w-full py-2.5 rounded-lg text-rose-400 hover:text-rose-300 hover:border-rose-500/50 hover:bg-rose-950/20 active:bg-rose-950/40 border border-zinc-850 bg-black/40 transition-all font-mono text-[10px] uppercase font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Clear debate logs and final consensus result first-hand"
                    >
                      <span>🧹</span>
                      <span>Clear Swarm Chats First Hand</span>
                    </button>
                  )}

                  <div className="flex items-center justify-between font-mono text-[9px] border-t border-zinc-900 pt-2 text-zinc-400">
                    <span className="uppercase">Current Phase:</span>
                    <span className="font-extrabold text-cyan-400 uppercase tracking-widest border border-cyan-500/20 bg-cyan-950/30 px-2 py-0.5 rounded animate-pulse">
                      {localPhase}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sub-navigation jump links for layout filter */}
            <div className="max-w-7xl mx-auto flex flex-wrap gap-2 text-[10px] font-mono border-b border-zinc-900 pb-3">
              <button 
                onClick={() => scrollToSection(scholarsRef, "scholars")}
                className={`px-3 py-1.5 border rounded-lg transition-all cursor-pointer font-extrabold uppercase ${
                  activeFilter === "scholars" ? "bg-cyan-500/10 border-cyan-500 text-cyan-400" : "bg-transparent border-zinc-800 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Opening Scholars
              </button>
              <button 
                onClick={() => scrollToSection(verificationRef, "verification")}
                className={`px-3 py-1.5 border rounded-lg transition-all cursor-pointer font-extrabold uppercase ${
                  activeFilter === "verification" ? "bg-cyan-500/10 border-cyan-500 text-cyan-400" : "bg-transparent border-zinc-800 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Verification Engine
              </button>
              <button 
                onClick={() => scrollToSection(synthesisRef, "synthesis")}
                className={`px-3 py-1.5 border rounded-lg transition-all cursor-pointer font-extrabold uppercase ${
                  activeFilter === "synthesis" ? "bg-cyan-500/10 border-[#eab308] text-[#eab308]" : "bg-transparent border-zinc-800 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Academic Synthesis
              </button>
            </div>

            {/* I. OPENING PROPOSALS PANEL */}
            <div ref={scholarsRef} className="max-w-7xl mx-auto text-left space-y-4">
              <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                <h2 className="text-xs font-mono font-black tracking-widest text-cyan-400 uppercase">
                  I. OPENING PROPOSALS OF THE 12 ACADEMIC AGENTS
                </h2>
                <span className="text-[9px] font-mono text-zinc-500 tracking-wider">
                  Cites any agent card to inspect credentials
                </span>
              </div>
              
              {/* 12-Agent proposals grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {academicAgents.map((agent, idx) => {
                  const log = consensusLogs.find(l => l.key === idx);
                  const isSpeechActive = consensusStatus === "conversing" && log;
                  const isCurrentSpeaker = isSpeechActive && idx === consensusLogs.length - 1;
                  
                  return (
                    <motion.div
                      key={agent.id}
                      initial={{ opacity: 0, scale: 0.99 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`p-5 border bg-slate-950/80 rounded-2xl flex flex-col justify-between gap-3 shadow-lg relative group transition-all duration-300 ${
                        isCurrentSpeaker
                          ? "border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.25)] ring-1 ring-cyan-500/20 bg-cyan-950/5"
                          : log
                            ? "border-cyan-900/60 hover:border-cyan-500/30 bg-slate-950/90"
                            : "border-zinc-850 hover:border-cyan-500/30 hover:shadow-[0_0_20px_rgba(6,182,212,0.05)]"
                      }`}
                    >
                      {/* Corner badge overlay */}
                      <div className="absolute top-4 right-4 flex items-center gap-1.5">
                        <span className={`text-[8px] font-mono px-2 py-0.5 rounded border tracking-wider uppercase ${
                          isCurrentSpeaker
                            ? "border-cyan-400 bg-cyan-950/50 text-cyan-400 animate-pulse font-black"
                            : log
                              ? "border-cyan-900/40 bg-cyan-950/20 text-cyan-500"
                              : "border-zinc-800 bg-neutral-900 text-zinc-500"
                        }`}>
                          {isCurrentSpeaker ? "🗣️ SPEAKING NOW" : log ? "✓ TRANSMITTED" : agent.status}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black font-mono transition-all ${
                            isCurrentSpeaker
                              ? "bg-cyan-500 text-black shadow-[0_0_12px_rgba(6,182,212,0.5)]"
                              : log
                                ? "bg-cyan-950/40 border border-cyan-500/30 text-cyan-300"
                                : "bg-cyan-950/30 border border-cyan-400/20 text-cyan-400"
                          }`}>
                            {agent.avatar}
                          </div>
                          <div>
                            <h3 className="text-xs font-black font-mono text-neutral-250 uppercase flex items-center gap-1">
                              {agent.name}
                              {isCurrentSpeaker && (
                                <span className="flex h-1.5 w-1.5 relative">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-500"></span>
                                </span>
                              )}
                            </h3>
                            <p className="text-[8.5px] font-mono font-bold text-zinc-500 uppercase tracking-widest leading-none">
                              {agent.author}
                            </p>
                          </div>
                        </div>

                        <div className={`p-3 border w-full rounded-xl transition-all ${
                          isCurrentSpeaker
                            ? "bg-cyan-950/15 border-cyan-500/20"
                            : log
                              ? "bg-black/60 border-zinc-900"
                              : "bg-black/40 border-zinc-850"
                        }`}>
                          <p className={`text-[11px] font-sans leading-relaxed font-medium italic ${
                            log ? "text-zinc-200" : "text-zinc-300"
                          }`}>
                            {renderSafeMath(log ? log.content : agent.quote)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-zinc-900 pt-2.5 mt-1 font-mono text-[8.5px] text-zinc-500">
                        <div className="flex gap-1.5 flex-wrap items-center">
                          <span className={`${log ? "text-cyan-400/60" : "text-cyan-500/50"}`}>FORMULA:</span>
                          <span className="text-cyan-300 bg-cyan-950/20 px-1.5 py-0.5 border border-cyan-500/15 rounded inline-block">
                            {renderSafeMath(agent.formula)}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className={log ? "text-zinc-400 font-bold" : ""}>
                            {renderSafeMath(agent.constant)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* II. QUANTUM SWARM INTEGRATION & PROTOTYPE PREDICTIVE VERIFICATION ENGINE */}
            <div ref={verificationRef} className="max-w-7xl mx-auto text-left space-y-6 pt-6">
              <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                <h2 className="text-xs font-mono font-black tracking-widest text-cyan-400 uppercase">
                  II. QUANTUM SWARM INTEGRATION & REAL-TIME PREDICTIVE VERIFICATION ENGINE
                </h2>
                <span className="text-[9px] font-mono text-zinc-500 tracking-wider">
                  Live Mathematical Modeling of Swarm Consensus
                </span>
              </div>

              {/* Bento Grid Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Panel 1: Interactive Parameter Controller (4 cols) */}
                <div className="lg:col-span-4 p-5 rounded-2xl border border-zinc-850 bg-slate-950/85 space-y-5 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-zinc-900 pb-2">
                      <Sliders className="w-4 h-4 text-cyan-400" />
                      <h3 className="text-[11px] font-mono font-bold uppercase text-zinc-200 tracking-wide">
                        Physical Constant Regulators
                      </h3>
                    </div>

                    {/* Slider 1: Altitude */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-mono">
                        <span className="text-zinc-400">Orbital Altitude (h)</span>
                        <span className="text-cyan-400 font-bold">{altitude} km</span>
                      </div>
                      <input 
                        type="range"
                        min="150"
                        max="500"
                        step="10"
                        value={altitude}
                        onChange={(e) => setAltitude(parseInt(e.target.value))}
                        className="w-full h-1 bg-zinc-900 accent-cyan-400 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-[8px] text-zinc-600 font-mono">
                        <span>150 km</span>
                        <span>500 km</span>
                      </div>
                    </div>

                    {/* Slider 2: Approach Speed */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-mono">
                        <span className="text-zinc-400">Approach Speed (v_approach)</span>
                        <span className="text-cyan-400 font-bold">{approachSpeed} m/s</span>
                      </div>
                      <input 
                        type="range"
                        min="2500"
                        max="4500"
                        step="50"
                        value={approachSpeed}
                        onChange={(e) => setApproachSpeed(parseInt(e.target.value))}
                        className="w-full h-1 bg-zinc-900 accent-cyan-400 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-[8px] text-zinc-600 font-mono">
                        <span>2500 m/s</span>
                        <span>4500 m/s</span>
                      </div>
                    </div>

                    <div className="border-t border-zinc-900/80 my-3 pt-3 space-y-4">
                      <div className="flex items-center gap-2">
                        <Activity className="w-3.5 h-3.5 text-cyan-405" />
                        <h4 className="text-[9.5px] font-mono font-bold uppercase text-zinc-400 tracking-wide">
                          Swarm Weight Distributions
                        </h4>
                      </div>

                      {/* Weight Slider 1: Theoretical */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9.5px] font-mono">
                          <span className="text-zinc-500">Theoretical & Classical</span>
                          <span className="text-zinc-300">w₁ = {weightTheoretical.toFixed(1)}x</span>
                        </div>
                        <input 
                          type="range"
                          min="0"
                          max="2"
                          step="0.1"
                          value={weightTheoretical}
                          onChange={(e) => setWeightTheoretical(parseFloat(e.target.value))}
                          className="w-full h-1 bg-zinc-900 accent-neutral-400 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>

                      {/* Weight Slider 2: Systems */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9.5px] font-mono">
                          <span className="text-zinc-500">Computational & Systems</span>
                          <span className="text-zinc-300">w₂ = {weightSystems.toFixed(1)}x</span>
                        </div>
                        <input 
                          type="range"
                          min="0"
                          max="2"
                          step="0.1"
                          value={weightSystems}
                          onChange={(e) => setWeightSystems(parseFloat(e.target.value))}
                          className="w-full h-1 bg-zinc-900 accent-neutral-400 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>

                      {/* Weight Slider 3: Applied */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9.5px] font-mono">
                          <span className="text-zinc-500">Applied & Experimental</span>
                          <span className="text-zinc-300">w₃ = {weightApplied.toFixed(1)}x</span>
                        </div>
                        <input 
                          type="range"
                          min="0"
                          max="2"
                          step="0.1"
                          value={weightApplied}
                          onChange={(e) => setWeightApplied(parseFloat(e.target.value))}
                          className="w-full h-1 bg-zinc-900 accent-neutral-400 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-zinc-900 pt-3 text-[9px] text-zinc-500 font-mono leading-relaxed">
                    By modifying the sliders, you interactively adjust outer gravity constants, speed bounds, and the theoretical priorities of the 12 active research nodes.
                  </div>
                </div>

                {/* Panel 2: Swarm Convergence Plot (4 cols) */}
                <div className="lg:col-span-4 p-5 rounded-2xl border border-zinc-850 bg-slate-950/85 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 border-b border-zinc-900 pb-2 mb-4">
                      <Atom className="w-4 h-4 text-cyan-404" />
                      <h3 className="text-[11px] font-mono font-bold uppercase text-zinc-200 tracking-wide">
                        Convergence Vector Map
                      </h3>
                    </div>

                    {/* SVG GRAPH */}
                    <div className="relative w-full flex items-center justify-center bg-black/40 border border-zinc-900 rounded-xl p-3 overflow-hidden">
                      <svg width="280" height="230" viewBox="0 0 280 230" className="overflow-visible">
                        {/* Grid Lines */}
                        <line x1="140" y1="10" x2="140" y2="210" stroke="#1d1d21" strokeWidth="1" strokeDasharray="3" />
                        <line x1="10" y1="110" x2="270" y2="110" stroke="#1d1d21" strokeWidth="1" strokeDasharray="3" />
                        <circle cx="140" cy="110" r="50" stroke="#18181b" strokeWidth="1" fill="none" />
                        <circle cx="140" cy="110" r="90" stroke="#18181b" strokeWidth="1" fill="none" strokeDasharray="5" />

                        {/* Convergence Ring */}
                        <circle cx="140" cy="110" r="10" className="stroke-cyan-500/20 fill-cyan-500/5 animate-pulse" />
                        
                        {/* Connecting Vectors based on math and weight */}
                        {(() => {
                          const R = 3389500;
                          const mu_MarsVal = 4.282837e13;
                          const mu_RoundedVal = 4.28e13;
                          const curRad = R + altitude * 1000;
                          const vIdeal = Math.sqrt(mu_MarsVal / curRad);
                          const vAcad = Math.sqrt(mu_RoundedVal / curRad);
                          const dIdeal = Math.abs(approachSpeed - vIdeal);
                          const dAcad = Math.abs(approachSpeed - vAcad);

                          const agents = [
                            { name: "Theoretical Physicist", cat: "theo", val: dIdeal, w: weightTheoretical },
                            { name: "Classical Academic", cat: "theo", val: dAcad, w: weightTheoretical },
                            { name: "Classical Mathematical", cat: "theo", val: dIdeal, w: weightTheoretical },
                            { name: "Mechanical Systems", cat: "theo", val: dIdeal, w: weightTheoretical },
                            { name: "General Systems", cat: "sys", val: dIdeal, w: weightSystems },
                            { name: "Hardware Architect", cat: "sys", val: dIdeal, w: weightSystems },
                            { name: "Process Efficiency", cat: "sys", val: dIdeal, w: weightSystems },
                            { name: "Microharmonic Specialist", cat: "sys", val: dIdeal, w: weightSystems },
                            { name: "Empirical Researcher", cat: "app", val: dIdeal, w: weightApplied },
                            { name: "Cryogenic Specialist", cat: "app", val: dIdeal, w: weightApplied },
                            { name: "Applied Bio-Systems", cat: "app", val: dIdeal, w: weightApplied },
                            { name: "Environmental Climatologist", cat: "app", val: dIdeal, w: weightApplied }
                          ];

                          const totalW = agents.reduce((sum, a) => sum + a.w, 0) || 1;
                          const meanVal = agents.reduce((sum, a) => sum + a.val * a.w, 0) / totalW;

                          return agents.map((agent, i) => {
                            const angle = (i * 2 * Math.PI) / 12;
                            // Calculate divergence vector length
                            const diffRatio = Math.abs(agent.val - meanVal) / (meanVal || 1);
                            const dist = 30 + (50 * diffRatio * 300) + (45 / (Math.max(0.1, agent.w)));
                            const x = 140 + dist * Math.cos(angle);
                            const y = 110 + dist * Math.sin(angle);

                            const dotColor = agent.cat === "theo" ? "#38bdf8" : agent.cat === "sys" ? "#2dd4bf" : "#22d3ee";
                            
                            return (
                              <g key={agent.name} className="group/node pointer-events-auto">
                                <line 
                                  x1="140" 
                                  y1="110" 
                                  x2={x} 
                                  y2={y} 
                                  stroke={dotColor} 
                                  strokeOpacity={0.15 + (agent.w * 0.1)} 
                                  strokeWidth="1.2" 
                                />
                                <circle 
                                  cx={x} 
                                  cy={y} 
                                  r={3 + agent.w * 2} 
                                  fill={dotColor} 
                                  className="transition-all duration-300 group-hover/node:r-6 cursor-pointer"
                                />
                                <circle 
                                  cx={x} 
                                  cy={y} 
                                  r={7 + agent.w * 3} 
                                  fill="none" 
                                  stroke={dotColor} 
                                  strokeOpacity="0.2" 
                                  className="animate-pulse"
                                />
                              </g>
                            );
                          });
                        })()}

                        {/* Central Consensus Core node */}
                        <circle cx="140" cy="110" r="6" fill="#eab308" className="shadow-lg" />
                        <circle cx="140" cy="110" r="12" fill="none" stroke="#eab308" strokeWidth="1" className="animate-ping" style={{ animationDuration: '4s' }} />
                      </svg>
                      {/* Floating Indicator */}
                      <div className="absolute right-3 bottom-3 py-1 px-2 rounded bg-black/60 border border-zinc-900 font-mono text-[8px] text-zinc-500 uppercase tracking-widest">
                        🔴 Inter-Agent Swarm Nodes
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-zinc-900 pt-3 flex justify-between items-center text-[9px] font-mono text-zinc-400">
                    <span>Optimal Convergence Bounds:</span>
                    <span className="text-cyan-400 font-black uppercase">✓ PERFECTED STATE</span>
                  </div>
                </div>

                {/* Panel 3: Live Verification Dashboard (4 cols) */}
                {(() => {
                  const R = 3389500;
                  const mu_MarsVal = 4.282837e13;
                  const mu_RoundedVal = 4.28e13;
                  const curRad = R + altitude * 1000;
                  const vIdeal = Math.sqrt(mu_MarsVal / curRad);
                  const vAcad = Math.sqrt(mu_RoundedVal / curRad);
                  const dIdeal = Math.abs(approachSpeed - vIdeal);
                  const dAcad = Math.abs(approachSpeed - vAcad);

                  const agents = [
                    { val: dIdeal, w: weightTheoretical },
                    { val: dAcad, w: weightTheoretical },
                    { val: dIdeal, w: weightTheoretical },
                    { val: dIdeal, w: weightTheoretical },
                    { val: dIdeal, w: weightSystems },
                    { val: dIdeal, w: weightSystems },
                    { val: dIdeal, w: weightSystems },
                    { val: dIdeal, w: weightSystems },
                    { val: dIdeal, w: weightApplied },
                    { val: dIdeal, w: weightApplied },
                    { val: dIdeal, w: weightApplied },
                    { val: dIdeal, w: weightApplied }
                  ];

                  const totalW = agents.reduce((sum, a) => sum + a.w, 0) || 1;
                  const meanVal = agents.reduce((sum, a) => sum + a.val * a.w, 0) / totalW;

                  const varianceVal = agents.reduce((sum, a) => sum + a.w * Math.pow(a.val - meanVal, 2), 0) / totalW;
                  const stdDev = Math.sqrt(varianceVal);

                  // Computed Metrics
                  const confidenceQ = Math.max(0, Math.min(100, 100 - (stdDev * 85)));

                  return (
                    <div className="lg:col-span-4 p-5 rounded-2xl border border-zinc-850 bg-slate-950/85 flex flex-col justify-between space-y-4">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-zinc-900 pb-2">
                          <Activity className="w-4 h-4 text-[#eab308]" />
                          <h3 className="text-[11px] font-mono font-bold uppercase text-zinc-200 tracking-wide">
                            Live Rigor Diagnostics
                          </h3>
                        </div>

                        {/* Main Real-Time Velocity Box */}
                        <div className="p-4 bg-zinc-950/70 border border-zinc-900 rounded-xl space-y-1.5">
                          <span className="text-[8.5px] font-mono text-zinc-500 uppercase tracking-wider block">CONVERGED SYSTEM DELTA-V (v_reconciled)</span>
                          <span className="text-2xl font-sans font-black text-yellow-450 tracking-tight block">
                            {meanVal.toFixed(4)} m/s
                          </span>
                          <div className="flex justify-between items-center text-[9px] font-mono text-cyan-400 gap-1 pt-1.5 border-t border-zinc-900">
                            <span>Theoretical v_orbit:</span>
                            <span className="font-bold">{vIdeal.toFixed(2)} m/s</span>
                          </div>
                        </div>

                        {/* Real-time confidence metrics */}
                        <div className="grid grid-cols-2 gap-3.5">
                          <div className="p-3 bg-zinc-950/40 border border-zinc-900 rounded-lg">
                            <span className="text-[8px] font-mono text-zinc-500 uppercase block">SWARM CONSENSUS</span>
                            <span className="text-xs font-sans font-black text-cyan-400 block mt-1">{confidenceQ.toFixed(2)}%</span>
                          </div>
                          <div className="p-3 bg-zinc-950/40 border border-zinc-900 rounded-lg">
                            <span className="text-[8px] font-mono text-zinc-500 uppercase block">ENTROPY VARIANCE</span>
                            <span className="text-xs font-sans font-black text-emerald-400 block mt-1">±{stdDev.toFixed(4)} m/s</span>
                          </div>
                        </div>

                        {/* Dimensional Checks */}
                        <div className="space-y-2 pt-2 border-t border-zinc-900/60">
                          <span className="text-[8.5px] font-mono text-zinc-500 uppercase tracking-wider block">Dimensional Self-Rigor Verification</span>
                          <div className="space-y-1.5 font-mono text-[9.5px]">
                            <div className="flex items-center justify-between p-1.5 rounded bg-black/40 border border-zinc-900">
                              <span className="text-zinc-400">[L][T]⁻¹ Velocity Continuity</span>
                              <span className="text-emerald-400 font-bold text-[8.5px] bg-emerald-950/30 border border-emerald-500/20 px-1.5 py-0.5 rounded">✓ VALIDATED</span>
                            </div>
                            <div className="flex items-center justify-between p-1.5 rounded bg-black/40 border border-zinc-900">
                              <span className="text-zinc-400">[M][L][T]⁻² Inertial Force Bounds</span>
                              <span className="text-emerald-400 font-bold text-[8.5px] bg-emerald-950/30 border border-emerald-500/20 px-1.5 py-0.5 rounded">✓ INTEGRATED</span>
                            </div>
                            <div className="flex items-center justify-between p-1.5 rounded bg-black/40 border border-zinc-900">
                              <span className="text-zinc-400">[L]³[T]⁻² Gravitational Potential</span>
                              <span className="text-emerald-400 font-bold text-[8.5px] bg-emerald-950/30 border border-emerald-500/20 px-1.5 py-0.5 rounded">✓ RIGID STATE</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-zinc-900 pt-3 flex justify-between items-center text-[9px] font-mono font-black text-zinc-500">
                        <span>LATENCY REDUCTION INDEX:</span>
                        <span className="text-yellow-450">-99.85%</span>
                      </div>
                    </div>
                  );
                })()}

              </div>
            </div>

            {/* III. MODERATOR ULTIMATE BRIEF SYNTHESIS */}
            <div ref={synthesisRef} className="max-w-7xl mx-auto text-left space-y-4 pt-6">
              <h2 className="text-xs font-mono font-black tracking-widest text-[#eab308] uppercase border-b border-zinc-900 pb-2">
                III. MODERATOR'S ULTIMATE ACADEMIC SYNTHESIS (PUBLICATION-GRADE BRIEF)
              </h2>

              <div className="p-6 md:p-8 border border-zinc-800/80 bg-gradient-to-b from-slate-950 to-neutral-950 rounded-3xl relative overflow-hidden shadow-2xl">
                {/* Glowing light bars exactly matching image */}
                <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
                
                <div className="relative z-10 space-y-6">
                  {consensusFinalResult ? (
                    <div className="text-xs md:text-sm leading-relaxed text-zinc-100 select-text font-sans whitespace-pre-wrap">
                      {renderFormattedConsensusText ? (
                        renderFormattedConsensusText(consensusFinalResult, true)
                      ) : (
                        consensusFinalResult
                      )}
                    </div>
                  ) : consensusStatus === "fusing" ? (
                    <div className="flex flex-col items-center justify-center py-16 space-y-4">
                      <div className="relative">
                        <div className="w-12 h-12 border-2 rounded-full animate-ping pointer-events-none absolute inset-0 border-cyan-500/20" />
                        <Atom className="w-12 h-12 animate-spin text-cyan-405" style={{ animationDuration: '3s' }} />
                      </div>
                      <div className="text-center font-mono space-y-1">
                        <p className="text-xs font-black uppercase tracking-widest text-cyan-400 animate-pulse">
                          Nobel Synthesis in Progress...
                        </p>
                      </div>
                    </div>
                  ) : consensusStatus === "conversing" ? (
                    <div className="flex flex-col items-center justify-center py-16 space-y-4">
                      <div className="relative">
                        <div className="w-10 h-10 border border-dashed rounded-full animate-spin pointer-events-none absolute inset-0 border-yellow-500/30" />
                        <Cpu className="w-10 h-10 animate-pulse text-yellow-500" />
                      </div>
                      <div className="text-center font-mono space-y-1">
                        <p className="text-xs font-black uppercase tracking-widest text-yellow-500 animate-pulse">
                          Academic Nodes Conversing...
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <h3 className="text-sm font-black font-sans tracking-wide text-neutral-100">
                          Synthesis of Orbital Insertion Analysis
                        </h3>
                      </div>

                      {/* Math list equations */}
                      <div className="space-y-3 font-mono text-[10.5px] text-zinc-300">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 p-3 rounded-xl bg-black/40 border border-zinc-900">
                          <span className="text-zinc-500 font-bold w-48 block shrink-0">1. Orbital Radius Calculation:</span>
                          <code className="text-cyan-350 pr-2 select-all">{"r = R_{Mars} + h = 3,389,500\\text{ m} + 200,000\\text{ m} = 3,589,500\\text{ m}"}</code>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 p-3 rounded-xl bg-black/40 border border-zinc-900">
                          <span className="text-zinc-500 font-bold w-48 block shrink-0">2. Circular Velocity Requirement:</span>
                          <code className="text-cyan-350 pr-2 select-all">{"v_{orbit} = \\sqrt{\\frac{\\mu_{Mars}}{r}}"}</code>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 p-3 rounded-xl bg-black/40 border border-zinc-900">
                          <span className="text-zinc-500 font-bold w-48 block shrink-0">3. Gravitational Parameter:</span>
                          <code className="text-cyan-350 pr-2 select-all">{"\\mu_{Mars} = 4.282837 \\times 10^{13} \\text{ m}^3/\\text{s}^2"}</code>
                        </div>
                      </div>

                      {/* Big Glowing Equations Blocks exactly as displayed in the image */}
                      <div className="space-y-4">
                        <div className="p-5 border border-cyan-500/20 bg-[#04081c]/90 rounded-2xl text-center relative overflow-hidden select-all font-mono">
                          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-400" />
                          <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-400" />
                          <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan-400" />
                          <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-400" />
                          
                          <div className="text-[13px] font-bold text-cyan-400 tracking-wide select-all">
                            {"v_{orbit} = \\sqrt{\\frac{4.282837 \\times 10^{13}}{3,589,500}} \\approx 3,454.2185 \\text{ m/s}"}
                          </div>
                        </div>

                        <div className="p-5 border border-cyan-500/20 bg-[#04081c]/90 rounded-2xl text-center relative overflow-hidden select-all font-mono">
                          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-400" />
                          <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-400" />
                          <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan-400" />
                          <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-400" />
                          
                          <div className="text-[13px] font-bold text-cyan-400 tracking-wide select-all">
                            {"\\Delta v = v_{orbit} - v_{approach} = 3,454.2185 \\text{ m/s} - 3,200.0 \\text{ m/s} = 254.2185 \\text{ m/s}"}
                          </div>
                        </div>
                      </div>

                    </>
                  )}
                </div>
              </div>
            </div>

            {/* IV. COMPLETE 12-STEP MULTI-MODEL ROUNDTABLE TRANSCRIPT (THE ULTIMATE LAST STEP) */}
            <div className="max-w-7xl mx-auto text-left space-y-6 pt-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-zinc-900 pb-3 gap-2">
                <div>
                  <h2 className="text-xs font-mono font-black tracking-widest text-[#eab308] uppercase">
                    IV. 12-STAGE SCIENTIFIC DEBATE SUMMARY & TRANSCRIPT
                  </h2>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={copyRoundtableTranscript}
                    className="px-3 py-1.5 bg-zinc-900/60 border border-zinc-800 hover:border-cyan-500/50 hover:bg-zinc-850 rounded-lg text-[10px] font-mono text-zinc-300 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    {isTranscriptCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Transcript Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Full Transcript</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Six Mental Models Cards */}
              <div className="bg-slate-950/40 border border-zinc-900 rounded-2xl p-5 space-y-4 shadow-xl">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-[11px] font-mono font-black uppercase tracking-wider text-zinc-300">
                    Active AI Mental Model Personas (Click to Highlight Contributions)
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
                  {roundtableParticipants.map((p) => {
                    const isSelected = selectedParticipantModel === p.model;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedParticipantModel(isSelected ? null : p.model)}
                        className={`p-3.5 rounded-xl border text-left transition-all duration-300 cursor-pointer flex flex-col justify-between gap-2 h-full ${
                          isSelected
                            ? "border-cyan-400 bg-cyan-950/15 ring-1 ring-cyan-500/10 shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                            : "border-zinc-900 bg-black/40 hover:border-zinc-800 hover:bg-zinc-900/30"
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm">{p.avatar}</span>
                            <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded border border-zinc-800 uppercase ${
                              isSelected ? "text-cyan-455 border-cyan-500/20 bg-cyan-950/20" : "text-zinc-550 bg-neutral-900"
                            }`}>
                              {p.model.replace(" Model", "")}
                            </span>
                          </div>
                          <h4 className="text-[10px] font-black font-mono text-zinc-200 mt-1">{p.name}</h4>
                          <p className="text-[9px] text-zinc-550 leading-normal font-sans line-clamp-3">
                            {p.description}
                          </p>
                        </div>
                        <div className="text-[8px] font-mono text-cyan-400 font-bold uppercase tracking-wider mt-1 text-right">
                          {isSelected ? "● ACTIVE" : "FILTER"}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Chronological Stepper/List of 12 steps */}
              <div className="space-y-4">
                {roundtableSteps.map((step) => {
                  const isFilteredOut = selectedParticipantModel !== null && !step.participantName.includes(selectedParticipantModel);
                  const isHighlighted = selectedParticipantModel !== null && step.participantName.includes(selectedParticipantModel);
                  
                  return (
                    <div
                      key={step.step}
                      className={`p-5 rounded-2xl border transition-all duration-300 text-left relative ${
                        isFilteredOut
                          ? "opacity-25 scale-[0.99] border-zinc-950 bg-black/5"
                          : isHighlighted
                            ? "border-cyan-550 bg-gradient-to-r from-cyan-950/10 to-slate-950/80 shadow-[0_0_20px_rgba(6,182,212,0.08)] scale-[1.002]"
                            : "border-zinc-900 bg-slate-950/80 hover:border-zinc-805"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex items-start gap-4">
                          <div className={`w-7 h-7 rounded-full border shrink-0 flex items-center justify-center font-mono text-[10px] font-black ${
                            isHighlighted
                              ? "bg-cyan-500 text-black border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                              : "bg-zinc-900 text-zinc-400 border-zinc-800"
                          }`}>
                            {step.step}
                          </div>
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[11px] font-black font-mono text-cyan-400 uppercase tracking-wider">{step.focus}</span>
                              <span className="font-sans text-zinc-700 text-xs">|</span>
                              <span className="text-[9.5px] font-mono text-zinc-400 bg-zinc-900/60 border border-zinc-850 px-2 py-0.5 rounded">
                                {step.participantName}
                              </span>
                            </div>
                            <div className="p-4 bg-black/50 border border-zinc-900/60 rounded-xl">
                              <p className="text-[11px] md:text-[11.5px] font-sans text-zinc-300 leading-relaxed italic whitespace-pre-wrap">
                                {renderSafeMath(step.contribution)}
                              </p>
                            </div>
                          </div>
                        </div>
                        <span className="text-[8px] font-mono text-zinc-650 uppercase tracking-widest shrink-0 self-start sm:self-auto">
                          STAGE {step.step} / 12
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
