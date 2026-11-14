// Short explanations for the ⓘ icons: what it is, why it matters, how it affects disc mechanics.

export interface InfoEntry {
  title: string;
  what: string;
  why: string;
  how: string;
  source?: string;
}

export const INFO: Record<string, InfoEntry> = {
  compare: {
    title: 'Comparison mode',
    what: 'Applies exactly the same loading to a healthy disc and a degenerated disc at the chosen severity.',
    why: 'It isolates the effect of degeneration: the inputs are identical, so every difference comes from the disc itself.',
    how: 'Both discs use the same equations; only their parameters (height, nucleus size and stiffness, creep constants) differ.',
    source: "Ellingson & Nuckley 2012; O'Connell et al. 2011; Newell et al. 2017",
  },
  condition: {
    title: 'Disc condition',
    what: "Healthy, degenerated, herniated (nucleus pushed out the back) or Schmorl's node (nucleus pushed vertically into the vertebra) parameter sets for the same equations.",
    why: 'Degeneration changes disc height, nucleus stiffness, water content and time-dependent behaviour.',
    how: 'Only the parameters change between conditions; the loads and equations stay identical.',
    source: "Ellingson & Nuckley 2012; O'Connell et al. 2011; Newell et al. 2017",
  },
  severity: {
    title: 'Degeneration severity',
    what: 'An educational 0–100% scale: 0% ≈ Pfirrmann grade 1, 50% ≈ grades 2–3, 100% ≈ grades 4–5.',
    why: 'Degeneration is a continuum; the reported data come in healthy / moderate / severe groups.',
    how: 'Parameters are interpolated between the reported groups. This is not a clinical grade.',
    source: 'Grouping from Ellingson & Nuckley 2012',
  },
  nucleusLoss: {
    title: 'Nucleus loss',
    what: "The fraction of nucleus pulposus displaced out of the disc: posteriorly for a herniation, vertically through the endplate for a Schmorl's node.",
    why: 'Losing nucleus material lowers intradiscal pressure and compressive stiffness.',
    how: 'Stiffness is scaled linearly toward 44% of control, the value measured after full nucleus removal.',
    source: 'Joshi et al. 2006',
  },
  loadType: {
    title: 'Force type',
    what: 'Compression squeezes, tension pulls apart, shear slides, torsion twists and bending tilts the vertebrae.',
    why: 'Each mode loads the nucleus and annulus differently.',
    how: 'Compression and tension act along the spine axis; the others are added on top of a body-weight preload.',
    source: 'Newell et al. 2017',
  },
  direction: {
    title: 'Force direction',
    what: 'Flexion = bending forward, extension = bending backward; anterior = toward the front.',
    why: 'Bending compresses one side of the disc and stretches the opposite annulus.',
    how: 'Flexion stretches the posterior annulus, where herniations usually occur.',
    source: 'Newell et al. 2017 (Adams & Hutton)',
  },
  magnitude: {
    title: 'Force magnitude',
    what: 'Size of the applied load in newtons (N) or newton-metres (N·m) for moments.',
    why: 'Larger loads produce larger deformation and nucleus pressure.',
    how: 'The model is linear in load. Compression is limited to 2000 N, the largest load in the source creep data.',
    source: "O'Connell et al. 2011",
  },
  preload: {
    title: 'Body-weight preload',
    what: 'Axial compression applied together with bending, twisting or shear.',
    why: 'In the body, the disc is always compressed by body weight and muscle forces.',
    how: '750 N gives a healthy nucleus pressure of ≈0.6 MPa, similar to standing in vivo.',
    source: 'Wilke et al. 1999 via Newell et al. 2017',
  },
  duration: {
    title: 'Loading duration',
    what: 'How long the load is held (per block).',
    why: 'The disc is viscoelastic: it keeps compressing (creeping) for hours under a constant load.',
    how: "Creep has a fast (≈6–12 min) and slow (≈3 h) component; equilibrium takes ≈14 h.",
    source: "O'Connell et al. 2011",
  },
  frequency: {
    title: 'Loading frequency',
    what: 'Single = one hold; repeated = load/rest blocks; cyclic = a triangle wave of loading.',
    why: 'Cyclic loading drives fluid out on average while the elastic part oscillates each cycle.',
    how: 'Loading rate itself barely changes stiffness (~2% for a 100× faster rate).',
    source: 'Newell et al. 2020',
  },
  recovery: {
    title: 'Recovery time',
    what: 'Unloaded rest after loading.',
    why: 'The disc re-swells by osmosis, but recovery is several times slower than loading.',
    how: 'Recovery time constants are 5× (fast) and 2.5× (slow) longer than in creep; degenerated discs recover less.',
    source: "O'Connell et al. 2011",
  },
  visualScale: {
    title: 'Visual scale',
    what: 'Deformations are drawn 2× larger than true size.',
    why: 'Small changes such as bulge, bending angle and the first elastic compression are easier to see when magnified.',
    how: 'Only the drawing is magnified. All numbers are always true scale.',
  },
  stress: {
    title: 'Stress map (illustrative)',
    what: 'Relative stress in nucleus and annulus regions.',
    why: 'Degeneration shifts load from the nucleus to the annulus.',
    how: 'Region values come from the load-sharing model; the papers do not report full stress fields.',
    source: 'Newell 2017; Lotz 1998 via Volz 2022',
  },
  damage: {
    title: 'Damage progression (illustrative)',
    what: 'A damage index that grows with each loading cycle; at 100% the nucleus herniates.',
    why: 'Herniation is linked to repeated flexion + compression (fatigue).',
    how: 'Educational approximation: no reference provides failure thresholds.',
    source: 'Adams & Hutton via Newell 2017; AF yield strain from Nerurkar 2010',
  },
  height: {
    title: 'Disc height',
    what: 'Distance between the vertebral endplates.',
    why: 'Height loss changes how loads pass through the spine and is a sign of degeneration.',
    how: "Height = resting height − (elastic + fast + slow creep displacement).",
    source: "O'Connell et al. 2011; Ellingson & Nuckley 2012",
  },
  strain: {
    title: 'Axial strain',
    what: 'Height change divided by resting height.',
    why: 'Strain normalizes for disc size, so different discs can be compared.',
    how: 'O\'Connell measured ≈30% strain after 4 h at 1000 N.',
    source: "O'Connell et al. 2011",
  },
  pressure: {
    title: 'Nucleus pressure',
    what: 'Hydrostatic pressure in the nucleus pulposus.',
    why: 'In a healthy disc the pressurized nucleus spreads load and tensions the annulus fibres.',
    how: 'Calibrated so standing gives 0.5–0.87 MPa; it falls as the nucleus degenerates.',
    source: 'Wilke 1999 via Newell 2017',
  },
  hydration: {
    title: 'Hydration index (illustrative)',
    what: 'Estimated water fraction of the disc.',
    why: 'Creep is largely fluid flowing out of the disc.',
    how: 'Water lost = viscous creep displacement × disc area. An index, not a measurement.',
    source: "O'Connell et al. 2011; Newell 2017",
  },
  afStress: {
    title: 'Annulus axial stress',
    what: 'Average compressive stress carried by the annulus.',
    why: 'When the nucleus degenerates, the annulus must carry more of the load.',
    how: 'Two-column load sharing using nucleus and annulus aggregate moduli.',
    source: 'Johannessen & Elliott 2005; Iatridis 1998 (via Ellingson 2012)',
  },
  relaxation: {
    title: 'Stress relaxation',
    what: 'Hold a fixed strain and watch the stress decay to equilibrium.',
    why: 'It shows the viscoelastic, fluid-driven behaviour of disc tissue.',
    how: 'G(t) = 1 + g·Σexp(−t/τᵢ), fitted to human tissue at three degeneration grades.',
    source: 'Ellingson & Nuckley 2012',
  },
};
