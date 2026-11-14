// What each reference contributes to DISC LAB, for the References page.

export interface ReferenceDetail {
  key: string;
  kind: string;
  summary: string;
  usedFor: string[];
}

export const REFERENCE_DETAILS: ReferenceDetail[] = [
  {
    key: 'volz',
    kind: 'Review: computational modelling',
    summary: 'Reviews finite element models of disc degeneration grouped into nutrition, biochemical imbalance, aging and mechanical factors, and discusses model limitations.',
    usedFor: ['Project framing and the degeneration cascade', 'Mechanical loading lesson (torsion, vibration, static overload)', 'Mechanobiology feedback loop and nutrient thresholds', 'Model limitations'],
  },
  {
    key: 'ellingson',
    kind: 'Experimental: human cadaveric discs (n = 16)',
    summary: 'Stress-relaxation indentation of nucleus and annulus sites across healthy, moderate and severe degeneration, preserving the endplate.',
    usedFor: ['Prony relaxation function G(t) and its parameters by grade (Relaxation test)', 'Disc height by grade (resting height)', 'Nucleus equilibrium modulus 0.435 → 0.229 MPa', 'Residual nucleus stress; aggregate moduli it cites'],
  },
  {
    key: 'oconnell',
    kind: 'Experimental: human lumbar motion segments',
    summary: '4-hour 1000 N creep, 24-hour recovery and repeat creep, fitted with a spring + two Kelvin–Voigt model; correlations with degeneration.',
    usedFor: ['Whole-disc creep and recovery model (all loading presets)', 'Fast/slow time constants and amplitudes', 'Slower recovery and reduced recovery with degeneration', 'Disc area and stiffness cross-checks'],
  },
  {
    key: 'newell17',
    kind: 'Review: human disc testing',
    summary: 'Summarizes composition, anatomy, in vivo pressures, testing methods, injury mechanisms and tissue properties of the human disc.',
    usedFor: ['Anatomy, composition and water content', 'In vivo nucleus pressures (Standing calibration)', 'Annulus tensile properties and failure values', "Herniation and Schmorl's node mechanisms"],
  },
  {
    key: 'nerurkar',
    kind: 'Review: tissue-engineering design criteria',
    summary: 'Tabulates native benchmarks for annulus, nucleus and motion-segment mechanics.',
    usedFor: ['Motion-segment stiffness, modulus and torsional shear modulus', 'Annulus yield strain (damage index reference)', 'Swelling pressures and permeabilities'],
  },
  {
    key: 'newell20',
    kind: 'Experimental: bovine discs at three labs',
    summary: 'Effect of testing environment and loading rate on compressive stiffness; inter-laboratory variability.',
    usedFor: ['Justification for rate-independent stiffness (~2% per 100× rate)', 'Cyclic triangle-wave loading and 0.5 Hz recommendation'],
  },
  {
    key: 'joshi',
    kind: 'Experimental: nucleus replacement in cadaveric discs',
    summary: 'Compressive behaviour of a PVA/PVP hydrogel nucleus implant; intact, denucleated and implanted discs.',
    usedFor: ['Nucleus-loss stiffness factor (denucleated = 44% of control)', 'Herniated and Schmorl’s node conditions'],
  },
  {
    key: 'delaine',
    kind: 'Experimental: indentation methodology',
    summary: 'Validates flat-punch indentation analysis against unconfined compression; shows how indentation moduli depend on the model used.',
    usedFor: ['Caution on absolute indentation moduli (why ratios are trusted more than absolute values)'],
  },
];

/** Studies named in DISC LAB that were NOT read directly; they are reported via the papers above. */
export const SECONDARY: { cite: string; via: string; topic: string }[] = [
  { cite: 'Wilke et al. 1999', via: 'Newell et al. 2017', topic: 'In vivo nucleus pressures by posture' },
  { cite: 'Johannessen & Elliott 2005', via: 'Ellingson & Nuckley 2012', topic: 'Nucleus aggregate modulus, healthy vs degenerated' },
  { cite: 'Iatridis et al. 1998', via: 'Ellingson & Nuckley 2012', topic: 'Annulus aggregate modulus increases with degeneration' },
  { cite: 'Natarajan et al. 2006', via: 'Ellingson & Nuckley 2012', topic: "Poisson's ratios by grade" },
  { cite: 'Keller et al. 1988; Johannessen et al. 2006', via: "O'Connell et al. 2011", topic: 'Spring + Kelvin–Voigt rheological model form' },
  { cite: 'Adams & Hutton 1982, 1983, 1985', via: 'Newell et al. 2017', topic: 'Herniation with flexion + compression; fatigue' },
  { cite: 'Adams & Dolan 2012; Brinckmann 1988; Hamanishi 1994', via: 'Newell et al. 2017', topic: "Endplate failure and Schmorl's nodes" },
  { cite: 'Zhao et al. 2009', via: 'Newell et al. 2017', topic: 'Weaker cranial bony endplate' },
  { cite: 'Shan et al. 2015', via: 'Newell et al. 2017', topic: 'Degenerated annulus softer and weaker in tension' },
  { cite: 'Botsford et al. 1994', via: 'Newell et al. 2017', topic: '~20% diurnal variation in disc height and hydration' },
  { cite: 'Costi et al. 2008', via: 'Nerurkar et al. 2010', topic: 'Rate dependence dominated by fluid flow' },
  { cite: 'Horner & Urban 2001; Bibby et al. 2002, 2004', via: 'Volz et al. 2022', topic: 'Glucose thresholds for cell viability' },
  { cite: 'Marras et al. 1995', via: 'Volz et al. 2022', topic: 'Lift-and-twist and low back pain' },
  { cite: 'Setton & Chen 2006; Lotz et al. 1998', via: 'Volz et al. 2022', topic: 'Static compression, cell death, annulus stress shift' },
  { cite: 'Jackson et al. 2011b; Malandrino et al. 2011; Paul et al. 2013', via: 'Volz et al. 2022', topic: 'Loading, nutrient transport and early degeneration' },
  { cite: 'Pfirrmann et al. 2001', via: "Ellingson & Nuckley 2012; O'Connell et al. 2011", topic: 'MRI degeneration grading' },
];
