// Shared types for the DISC LAB computational model.
// See DISC-LAB_Computational_Model.md for the approved specification.

export type Condition = 'healthy' | 'degenerated' | 'herniated' | 'schmorl';

export type LoadType = 'compression' | 'tension' | 'shear' | 'torsion' | 'bending';

export type Direction =
  | 'axial'
  | 'anterior'
  | 'posterior'
  | 'lateral'
  | 'flexion'
  | 'extension'
  | 'lateralBend'
  | 'left'
  | 'right';

export type FrequencyMode = 'single' | 'repeated' | 'cyclic';

export interface LoadInputs {
  loadType: LoadType;
  direction: Direction;
  /** N for compression/tension/shear, N·m for torsion/bending */
  magnitude: number;
  /** Axial compressive preload (body weight) added to non-compression loads, N */
  preload: number;
  /** Loading duration per block, s */
  duration: number;
  frequencyMode: FrequencyMode;
  /** Number of load blocks for 'repeated' */
  repeats: number;
  /** Cyclic frequency, Hz */
  frequencyHz: number;
  /** Unloaded recovery time after each block, s */
  recovery: number;
}

export interface DiscSelection {
  condition: Condition;
  /** Degeneration severity 0 (healthy) … 1 (severe) */
  severity: number;
  /** Nucleus-loss fraction 0 … 1 (herniated: posterior; Schmorl's node: vertical into the vertebra) */
  nucleusLoss: number;
}

export interface Prony {
  g: number;
  tauS: number; // s
  tauL: number; // s
}

export interface DiscParams {
  condition: Condition;
  severity: number;
  nucleusLoss: number;
  h0: number; // resting height, mm
  A: number; // axial area, mm²
  r: number; // equivalent radius, mm
  phi: number; // NP area fraction
  // O'Connell 2011 creep model, amplitudes at 1000 N on an 8.86 mm disc
  aE: number;
  a1: number;
  a2: number;
  tau1: number; // s
  tau2: number; // s
  tau1R: number; // s
  tau2R: number; // s
  rho: number; // unrecoverable fraction
  kappa: number; // herniation stiffness factor
  // Tissue properties
  H_NP: number; // MPa
  H_AF: number; // MPa
  nuAF: number;
  nuNP: number;
  EeqNP: number; // MPa
  prony: { NP: Prony; antAF: Prony; latAF: Prony };
  Gapp: number; // MPa
  Eb: number; // MPa
  W_NP: number;
  W_AF: number;
  epsY: number;
}

/** One sample of the simulation output. */
export interface SimSample {
  t: number; // s
  load: number; // axial load, N (instantaneous peak for cyclic)
  loadMin: number; // cycle trough (equals load unless cyclic)
  moment: number; // N·m (bending/torsion) or N (shear) secondary load
  disp: number; // axial displacement, mm
  dispMin: number;
  height: number; // mm
  strain: number; // axial strain, fraction
  strainMin: number;
  pNP: number; // MPa
  pNPMin: number;
  sigmaAF: number; // MPa
  npShare: number; // fraction of axial load on NP
  angle: number; // rad (bending/torsion), 0 otherwise
  shear: number; // mm shear translation
  edgeStrain: number; // bending edge strain, fraction
  shearStrain: number; // torsion/shear strain, fraction
  bulge: number; // radial AF bulge, mm
  hydration: number; // fraction
  damage: number; // 0..1
  postStrain: number; // posterior AF strain proxy
  loaded: boolean;
}

export interface SimResult {
  samples: SimSample[];
  params: DiscParams;
  inputs: LoadInputs;
  totalTime: number;
  herniatedAt: number | null; // s, when damage reached 1
  warnings: string[];
}
