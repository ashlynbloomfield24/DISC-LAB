import type { Direction, LoadInputs, LoadType } from '../models/types';

export interface Preset {
  id: string;
  label: string;
  icon: string;
  summary: string;
  basis: string;
  inputs: LoadInputs;
}

const H = 3600;
const MIN = 60;

export const PRESETS: Preset[] = [
  {
    id: 'standing',
    label: 'Standing',
    icon: '🧍',
    summary: '750 N compression for 4 h, then 8 h rest',
    basis: 'Gives a healthy nucleus pressure of ≈0.6 MPa, inside the 0.50–0.87 MPa measured in vivo while standing (Wilke 1999, via Newell 2017).',
    inputs: {
      loadType: 'compression', direction: 'axial', magnitude: 750, preload: 750,
      duration: 4 * H, frequencyMode: 'single', repeats: 1, frequencyHz: 0.5, recovery: 8 * H,
    },
  },
  {
    id: 'lifting',
    label: 'Lifting',
    icon: '🏋️',
    summary: '2000 N + 7.5 N·m flexion, cyclic 0.5 Hz for 30 min',
    basis: "2000 N is O'Connell's largest load; 7.5 N·m is a common test moment (Newell 2017, Table 2); 0.5 Hz is recommended by Newell 2020.",
    inputs: {
      loadType: 'bending', direction: 'flexion', magnitude: 7.5, preload: 2000,
      duration: 30 * MIN, frequencyMode: 'cyclic', repeats: 1, frequencyHz: 0.5, recovery: 2 * H,
    },
  },
  {
    id: 'bending',
    label: 'Bending forward',
    icon: '🙇',
    summary: '750 N + 7.5 N·m flexion for 30 min',
    basis: 'Flexion moment from typical motion-segment tests (Newell 2017).',
    inputs: {
      loadType: 'bending', direction: 'flexion', magnitude: 7.5, preload: 750,
      duration: 30 * MIN, frequencyMode: 'single', repeats: 1, frequencyHz: 0.5, recovery: 2 * H,
    },
  },
  {
    id: 'twisting',
    label: 'Twisting',
    icon: '🔄',
    summary: '750 N + 7.5 N·m axial rotation for 30 min',
    basis: 'Torsion combined with compression is linked to disc degeneration (Marras 1995, via Volz 2022).',
    inputs: {
      loadType: 'torsion', direction: 'left', magnitude: 7.5, preload: 750,
      duration: 30 * MIN, frequencyMode: 'single', repeats: 1, frequencyHz: 0.5, recovery: 2 * H,
    },
  },
];

/** Reproduces O'Connell et al. (2011): 1000 N for 4 h, 24 h recovery, repeat. */
export const CREEP_TEST: LoadInputs = {
  loadType: 'compression', direction: 'axial', magnitude: 1000, preload: 750,
  duration: 4 * H, frequencyMode: 'repeated', repeats: 2, frequencyHz: 0.5, recovery: 24 * H,
};

export const DEFAULT_INPUTS: LoadInputs = PRESETS[0].inputs;

export const DIRECTIONS: Record<LoadType, { value: Direction; label: string }[]> = {
  compression: [{ value: 'axial', label: 'Axial' }],
  tension: [{ value: 'axial', label: 'Axial' }],
  shear: [
    { value: 'anterior', label: 'Anterior' },
    { value: 'posterior', label: 'Posterior' },
    { value: 'lateral', label: 'Lateral' },
  ],
  bending: [
    { value: 'flexion', label: 'Flexion' },
    { value: 'extension', label: 'Extension' },
    { value: 'lateralBend', label: 'Lateral bend' },
  ],
  torsion: [
    { value: 'left', label: 'Left rotation' },
    { value: 'right', label: 'Right rotation' },
  ],
};

export const MAGNITUDE_RANGE: Record<LoadType, { min: number; max: number; step: number; unit: string; default: number }> = {
  compression: { min: 0, max: 2000, step: 25, unit: 'N', default: 750 },
  tension: { min: 0, max: 500, step: 10, unit: 'N', default: 200 },
  shear: { min: 0, max: 500, step: 10, unit: 'N', default: 200 },
  bending: { min: 0, max: 15, step: 0.5, unit: 'N·m', default: 7.5 },
  torsion: { min: 0, max: 15, step: 0.5, unit: 'N·m', default: 7.5 },
};
