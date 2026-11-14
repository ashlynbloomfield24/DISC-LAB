// Learn / Review content. Every statement is drawn from the DISC LAB reference library
// (src/data/references.ts). Findings that a paper cites from another study are written
// as "(Original Author, via Paper)". Highlight a glossary term with {{key}} or {{key|display text}}.

export type DiagramId =
  | 'overview'
  | 'anatomy'
  | 'lamellae'
  | 'nucleus'
  | 'composition'
  | 'hydration'
  | 'loadSharing'
  | 'creep'
  | 'loadModes'
  | 'degeneration'
  | 'herniation'
  | 'mechanobiology';

export interface SimLaunch {
  preset?: 'standing' | 'lifting' | 'bending' | 'twisting' | 'creep' | 'relaxation';
  condition?: 'healthy' | 'degenerated' | 'herniated';
  severity?: number;
  compare?: boolean;
  stress?: boolean;
  damage?: boolean;
}

export interface LearnTopic {
  id: string;
  title: string;
  blurb: string;
  lead: string;
  body: string[];
  structureFunction: string;
  diagram: DiagramId;
  caption: string;
  deeper: { title: string; body: string[] }[];
  takeaways: string[];
  sim: { text: string; cta: string; launch: SimLaunch };
  sources: string[]; // reference keys
}

export const TERMS: Record<string, { term: string; def: string }> = {
  ivd: { term: 'Intervertebral disc (IVD)', def: 'The fibrocartilage pad between two vertebral bodies that allows the spine to bend and twist and distributes compressive load.' },
  motionSegment: { term: 'Motion segment', def: 'Two adjacent vertebrae plus the disc between them (and, if intact, their ligaments and facet joints). The standard unit for spine testing.' },
  np: { term: 'Nucleus pulposus (NP)', def: 'The gel-like, water-rich centre of the disc. It pressurizes under compression.' },
  af: { term: 'Annulus fibrosus (AF)', def: 'The ring of 15–25 concentric collagen layers (lamellae) that surrounds and contains the nucleus.' },
  cep: { term: 'Cartilaginous endplate (CEP)', def: 'A thin (~0.6 mm) layer of hyaline cartilage that bonds the disc to the vertebral bone and lets nutrients diffuse in.' },
  lamella: { term: 'Lamella', def: 'One layer of the annulus. Its collagen fibres run at an angle that alternates in neighbouring layers.' },
  hoop: { term: 'Hoop (circumferential) stress', def: 'Tension running around the annulus ring, created when the pressurized nucleus pushes outward.' },
  anisotropy: { term: 'Anisotropy', def: 'Having different properties in different directions. The annulus is far stiffer along its fibres than across them.' },
  ecm: { term: 'Extracellular matrix (ECM)', def: 'The material that cells build around themselves, mainly collagen, proteoglycans and water in the disc.' },
  proteoglycan: { term: 'Proteoglycan (PG)', def: 'A large molecule with negatively charged sugar chains (GAGs) that attracts and holds water. Aggrecan is the main disc PG.' },
  gag: { term: 'Glycosaminoglycan (GAG)', def: 'The negatively charged sugar chains on proteoglycans; they give the tissue its fixed charge density.' },
  fcd: { term: 'Fixed charge density', def: 'The concentration of negative charges fixed to the matrix (from GAGs). It draws in water and creates osmotic swelling pressure.' },
  osmotic: { term: 'Osmotic (swelling) pressure', def: 'Pressure that develops as water is drawn into a tissue with high fixed charge density.' },
  collagen1: { term: 'Type I collagen', def: 'Coarse, strong collagen (as in tendon) that resists tension; dominant in the outer annulus.' },
  collagen2: { term: 'Type II collagen', def: 'A fine collagen network (as in cartilage) that binds proteoglycans and resists compression; dominant in the nucleus.' },
  stiffness: { term: 'Stiffness', def: 'Force needed per unit of deformation (N/mm). A stiffer disc deforms less for the same load.' },
  modulus: { term: 'Modulus', def: 'Stiffness of a material independent of its size: stress divided by strain (MPa).' },
  stress: { term: 'Stress', def: 'Force per unit area (MPa = N/mm²).' },
  strain: { term: 'Strain', def: 'Deformation divided by original length; for the disc, height change ÷ resting height.' },
  viscoelastic: { term: 'Viscoelastic', def: 'Behaving partly like an elastic solid and partly like a viscous fluid, so the response depends on time and loading rate.' },
  creep: { term: 'Creep', def: 'Continued deformation over time under a constant load.' },
  relaxation: { term: 'Stress relaxation', def: 'Decrease of stress over time while the deformation is held constant.' },
  hysteresis: { term: 'Hysteresis', def: 'Loading and unloading follow different paths, so energy is dissipated each cycle.' },
  poroelastic: { term: 'Poroelastic / biphasic', def: 'Modelled as a porous solid saturated with fluid; time-dependence comes from fluid flowing through the pores.' },
  timeConstant: { term: 'Time constant (τ)', def: 'The time for an exponential process to complete about 63% of its change.' },
  flexion: { term: 'Flexion', def: 'Bending forward. It compresses the front of the disc and stretches the back of the annulus.' },
  extension: { term: 'Extension', def: 'Bending backward. It compresses the back of the disc.' },
  torsion: { term: 'Torsion (axial rotation)', def: 'Twisting about the long axis of the spine.' },
  degeneration: { term: 'Disc degeneration', def: 'An aberrant, cell-mediated response to progressive structural failure, in which structural and compositional changes cause mechanical dysfunction.' },
  pfirrmann: { term: 'Pfirrmann grade', def: 'An MRI-based scale from 1 (healthy) to 5 (severely degenerated) used to grade disc degeneration.' },
  herniation: { term: 'Herniation', def: 'Displacement of nucleus material out through a disrupted annulus (or endplate).' },
  schmorl: { term: "Schmorl's node", def: 'Nucleus material pushed vertically through a damaged endplate into the vertebral body.' },
  fatigue: { term: 'Fatigue failure', def: 'Failure caused by many repeated loads, each below the single-load failure level.' },
  mechanobiology: { term: 'Mechanobiology', def: 'How cells sense mechanical loading and respond by changing what they make or break down.' },
  anabolism: { term: 'Anabolism / catabolism', def: 'Building up (synthesis) versus breaking down (degradation) of the matrix.' },
  homeostasis: { term: 'Homeostasis', def: 'A balanced, steady state, here between matrix synthesis and degradation.' },
  igf1: { term: 'IGF-1', def: 'Insulin-like growth factor 1, a growth factor that stimulates cell proliferation and proteoglycan synthesis.' },
  aggregate: { term: 'Aggregate modulus', def: 'The equilibrium compressive modulus measured in confined compression, when fluid has finished flowing.' },
  intradiscal: { term: 'Intradiscal pressure', def: 'Fluid pressure inside the nucleus, measured in living people with a needle sensor.' },
};

export const TOPICS: LearnTopic[] = [
  {
    id: 'introduction',
    title: 'Introduction to the intervertebral disc',
    blurb: 'What discs do and why they matter for back pain.',
    lead: 'Intervertebral discs are pads of fibrocartilage between the vertebrae. They let the spine bend and twist, and they spread compressive load onto the vertebral bodies.',
    body: [
      'Each {{ivd|intervertebral disc (IVD)}} sits between two vertebral bodies; together they form a {{motionSegment|motion segment}}. Lumbar discs are the largest avascular organs in the human body, so their cells depend on diffusion for nutrients.',
      'Low back pain costs over $100 billion a year in the United States, and symptomatic {{degeneration|degeneration}} of the disc has been identified as a significant contributor (Volz et al. 2022).',
      'Because degeneration involves biology, chemistry and mechanics all at once, computational models are used to vary one factor at a time, something experiments alone struggle to do (Volz et al. 2022).',
    ],
    structureFunction: 'A pressurized gel core (nucleus) inside a fibre-reinforced ring (annulus), sandwiched by cartilage endplates, turns vertical load into fluid pressure and ring tension. That is why a disc can be soft enough to bend yet strong enough to carry body weight.',
    diagram: 'overview',
    caption: 'A lumbar motion segment: two vertebral bodies and the intervertebral disc between them.',
    deeper: [
      {
        title: 'Why model the disc?',
        body: [
          'Volz et al. (2022) review finite element models of disc degeneration grouped into four themes: nutrition, biochemical imbalance, aging, and mechanical factors. Models can isolate one factor while holding others fixed, but they are only as good as their input data.',
        ],
      },
    ],
    takeaways: [
      'The disc lets the spine move and distributes compressive load.',
      'Lumbar discs are avascular, so nutrients must diffuse in.',
      'Disc degeneration is a major contributor to low back pain.',
    ],
    sim: { text: 'See a healthy disc carry a standing load for 4 hours, then recover.', cta: 'Open the Standing preset', launch: { preset: 'standing', condition: 'healthy' } },
    sources: ['newell17', 'volz'],
  },
  {
    id: 'anatomy',
    title: 'IVD anatomy',
    blurb: 'Nucleus, annulus and endplates, and how big they are.',
    lead: 'The disc has three parts: a soft central nucleus pulposus, a fibrous ring called the annulus fibrosus, and thin cartilaginous endplates above and below.',
    body: [
      'The {{np|nucleus pulposus}} makes up about 40–50% of the adult disc volume and 25–50% of its transverse cross-section (Newell et al. 2017).',
      'The {{af|annulus fibrosus}} surrounds the nucleus in 15–25 concentric layers. Its outer fibres anchor deep into the bony endplate, while inner fibres merge into the cartilage endplate (Newell et al. 2017).',
      'Each {{cep|cartilaginous endplate}} is about 0.6 mm thick. Lumbar endplates measure about 30–36 mm front to back and 43–54 mm side to side (Newell et al. 2017). A healthy lumbar disc is roughly 10 mm tall (Ellingson & Nuckley 2012).',
    ],
    structureFunction: 'The three tissues are mechanically integrated: fibres branch between nucleus and inner annulus, and nucleus collagen inserts into the endplate. The disc works as one pressurized unit rather than three separate parts.',
    diagram: 'anatomy',
    caption: 'Side (sagittal) and top (axial) views. Anterior = front, posterior = back.',
    deeper: [
      {
        title: 'Endplates under load',
        body: [
          'Under compression, nucleus pressure can push the endplates into the vertebral body by up to 1 mm. This bulging gives the nucleus more room, lowers its pressure, and shifts some load to the annulus (Brinckmann 1983; Holmes 1993; Adams 2015, via Newell et al. 2017).',
        ],
      },
    ],
    takeaways: [
      'Three components: nucleus pulposus, annulus fibrosus, cartilaginous endplates.',
      'The nucleus is 25–50% of the cross-section; a healthy lumbar disc is ≈10 mm tall.',
      'Fibres link the three tissues into one mechanical unit.',
    ],
    sim: { text: 'Turn on the stress map to see the nucleus and annulus regions light up under load.', cta: 'Explore the anatomy under load', launch: { preset: 'standing', condition: 'healthy', stress: true } },
    sources: ['newell17', 'ellingson'],
  },
  {
    id: 'annulus',
    title: 'Annulus fibrosus',
    blurb: 'Layered collagen rings that hold the pressure in.',
    lead: 'The annulus fibrosus is a ring of collagen layers. Its fibres alternate direction from layer to layer, like a radial tyre, so it resists the nucleus pushing outward.',
    body: [
      'Each {{lamella|lamella}} is 0.05–0.5 mm thick, thicker toward the inside. About 48% of the layers are incomplete around the circumference, and this fraction increases with age (Marchand & Ahmed 1990, via Newell et al. 2017).',
      'Fibres of {{collagen1|type I collagen}} run at about ±25–45° to the horizontal, alternating in neighbouring layers (Newell et al. 2017); Nerurkar et al. (2010) describe the angle as about 30°.',
      'Pressure in the nucleus creates {{hoop|hoop stress}} in the annulus. The annulus is strongly {{anisotropy|anisotropic}}: in tension it averages about 183 MPa along its fibres, 16 MPa around the ring, and only 0.3 MPa in the radial direction (Newell et al. 2017).',
    ],
    structureFunction: 'Alternating fibre angles let the annulus resist tension in many directions, including the twisting of torsion. The outer and anterior annulus is stiffer than the inner and posterior annulus (Newell et al. 2017).',
    diagram: 'lamellae',
    caption: 'Concentric lamellae with fibres alternating in direction between layers.',
    deeper: [
      {
        title: 'Composition gradient',
        body: [
          'The healthy annulus is 65–70% water. From outer to inner annulus, proteoglycan, water and type II collagen increase while type I collagen decreases. Elastin between lamellae helps recoil after large deformation (Newell et al. 2017).',
        ],
      },
      {
        title: 'Failure values',
        body: [
          'In circumferential tension, average annulus failure stress is about 2.7 MPa at a strain of about 0.3 (Newell et al. 2017). Nerurkar et al. (2010) give a yield strain of 20–30%.',
        ],
      },
    ],
    takeaways: [
      '15–25 lamellae with fibres alternating at roughly ±30°.',
      'Nucleus pressure creates hoop tension in the annulus.',
      'The annulus is far stiffer along its fibres than across them.',
    ],
    sim: { text: 'Apply a twist and watch the annulus fibres shear in the top view.', cta: 'Open the Twisting preset', launch: { preset: 'twisting', condition: 'healthy' } },
    sources: ['newell17', 'nerurkar'],
  },
  {
    id: 'nucleus',
    title: 'Nucleus pulposus',
    blurb: 'The pressurized gel at the centre of the disc.',
    lead: 'The nucleus pulposus is a soft, water-rich gel. When the disc is compressed, the nucleus pressurizes like a fluid and pushes outward on the annulus.',
    body: [
      'The {{np|nucleus pulposus}} has so much water that it shows a hydrostatic pressure that rises with compressive load, and that pressure tensions the surrounding annulus (Newell et al. 2017).',
      'Measured {{intradiscal|intradiscal pressure}} in healthy lumbar discs ranges from 91–539 kPa lying down, 500–870 kPa standing and 460–1330 kPa sitting. The highest recorded value, 2300 kPa, was in a standing subject flexed forward holding 20 kg (Wilke 1999 and others, via Newell et al. 2017).',
      'Because the annulus and endplates restrain its swelling, the nucleus is pressurized even with no external load; Ellingson & Nuckley (2012) measured an average residual stress of 0.305 MPa in healthy nuclei.',
    ],
    structureFunction: 'The nucleus behaves partly like a solid and partly like a fluid (Nerurkar et al. 2010). Its pressure spreads load evenly onto the endplates and pre-tensions the annulus fibres.',
    diagram: 'nucleus',
    caption: 'Measured nucleus pressure in different postures (healthy lumbar discs).',
    deeper: [
      {
        title: 'Nucleus cells',
        body: [
          'Mature nucleus cells are rounded and express chondrogenic markers such as Sox-9, type II collagen and aggrecan, yet they are adapted to low oxygen, low glucose, low pH and high osmolarity (Nerurkar et al. 2010).',
        ],
      },
      {
        title: 'Test method matters',
        body: [
          'Reported nucleus stiffness spans orders of magnitude depending on the test: about 5.4 kPa in unconfined compression but about 1.0 MPa in confined compression (Newell et al. 2017). Confined compression best represents the nucleus in the disc (Nerurkar et al. 2010).',
        ],
      },
    ],
    takeaways: [
      'The nucleus pressurizes under load and tensions the annulus.',
      'Standing pressure is about 0.5–0.87 MPa; lifting can exceed 2 MPa.',
      'The nucleus is pressurized even at rest.',
    ],
    sim: { text: 'Watch nucleus pressure in the graphs during standing, then during lifting.', cta: 'Open the Lifting preset', launch: { preset: 'lifting', condition: 'healthy' } },
    sources: ['newell17', 'nerurkar', 'ellingson'],
  },
  {
    id: 'ecm',
    title: 'Extracellular matrix composition',
    blurb: 'Collagen, proteoglycans and water in each region.',
    lead: 'Disc cells build an extracellular matrix of collagen, proteoglycans and water. The recipe differs between nucleus, annulus and endplate, and that difference explains their different jobs.',
    body: [
      'In the nucleus, {{proteoglycan|proteoglycans}} make up 35–65% of the dry weight and fine {{collagen2|type II collagen}} fibrils 5–20%; the rest is non-collagenous proteins and elastin (Newell et al. 2017).',
      'In the annulus, dry weight is about 20% proteoglycan, 50–70% collagen and 2% elastin (Newell et al. 2017).',
      'The endplate is about 60% water, with type II collagen and proteoglycans as the main dry-weight components (Newell et al. 2017).',
    ],
    structureFunction: 'Type I collagen gives tensile strength, as in tendon. Type II collagen forms a fine mesh that binds proteoglycans and water, letting tissue withstand compression, as in hyaline cartilage (Newell et al. 2017). The nucleus is built for compression, the outer annulus for tension.',
    diagram: 'composition',
    caption: 'Approximate dry-weight composition reported by Newell et al. (2017). Bars show the middle of each reported range.',
    deeper: [
      {
        title: 'Changes with age',
        body: [
          'With age, proteoglycan synthesis falls, newly made proteoglycans are smaller and less aggregated, and nucleus collagen shifts from type II toward the more fibrous type I, blurring the boundary between nucleus and annulus (via Volz et al. 2022).',
        ],
      },
    ],
    takeaways: [
      'Nucleus: proteoglycan-rich with a fine type II collagen network.',
      'Annulus: collagen-rich (mostly type I outside).',
      'Composition sets function: compression versus tension.',
    ],
    sim: { text: 'Compare how a proteoglycan-rich healthy nucleus and a depleted degenerated nucleus share load.', cta: 'Compare healthy vs degenerated', launch: { preset: 'standing', compare: true, severity: 0.6 } },
    sources: ['newell17', 'volz'],
  },
  {
    id: 'proteoglycans',
    title: 'Proteoglycans and water content',
    blurb: 'How charged molecules keep the disc hydrated.',
    lead: 'Proteoglycans carry negative charges that pull water into the disc. This osmotic swelling is what keeps the nucleus pressurized and the disc tall.',
    body: [
      'Proteoglycans are negatively charged and hydrophilic, so water diffuses into the nucleus and creates an internal {{osmotic|osmotic pressure}} (Ellingson & Nuckley 2012). The {{fcd|fixed charge density}} comes from sulfated {{gag|glycosaminoglycans}} (Nerurkar et al. 2010).',
      'Nucleus water content falls from about 90% to about 70% between ages 1 and 80, reflecting a similar fall in proteoglycans (Newell et al. 2017).',
      'Disc height and hydration vary by about 20% over the day: water is squeezed out under daytime loading and drawn back in at night (Botsford 1994, via Newell et al. 2017).',
    ],
    structureFunction: "Loading drives fluid out quickly; recovery relies only on osmotic pressure and is therefore slower. O'Connell et al. (2011) found unloaded recovery to be 3–4 times slower than creep loading.",
    diagram: 'hydration',
    caption: 'Water in, water out: applied load pushes fluid out; osmotic pressure from proteoglycans draws it back in.',
    deeper: [
      {
        title: 'Swelling pressures',
        body: [
          'Swelling pressure has been measured at about 0.138 MPa in the nucleus and 110–130 kPa in the annulus (Nerurkar et al. 2010). Computational models link water loss to the depletion of fixed charge density (Baldoni & Gu 2019, via Volz et al. 2022).',
        ],
      },
    ],
    takeaways: [
      'Proteoglycans hold water through their fixed negative charge.',
      'Nucleus water falls from ≈90% to ≈70% with age.',
      'Recovery after loading is osmotic and slower than loading.',
    ],
    sim: { text: "Run O'Connell's creep test: 4 h loading, 24 h recovery. Watch the hydration index.", cta: 'Run the creep test', launch: { preset: 'creep', condition: 'healthy' } },
    sources: ['ellingson', 'nerurkar', 'newell17', 'oconnell'],
  },
  {
    id: 'biomechanics',
    title: 'Disc biomechanics',
    blurb: 'Stiffness, load sharing and motion.',
    lead: 'Under compression, the nucleus pressurizes, the annulus bulges outward and its fibres tension. Together they give the disc a nonlinear stiffness that increases as it is loaded.',
    body: [
      'Compression narrows the disc and bulges the nucleus outward, putting axial and radial compressive stress on the annulus (Nerurkar et al. 2010).',
      'A human motion segment has an axial compressive {{stiffness|stiffness}} of about 1.73 kN/mm and a compressive {{modulus|modulus}} of about 3–10 MPa (Nerurkar et al. 2010); O\'Connell et al. (2011) measured 1498 N/mm.',
      'Spinal joints resist axial rotation most, followed by extension, lateral bending, and finally flexion (Newell et al. 2017).',
    ],
    structureFunction: "Load is shared: the nucleus carries pressure, the annulus carries the rest and the hoop tension. The disc's response is nonlinear and shows hysteresis between loading and unloading (Newell et al. 2017).",
    diagram: 'loadSharing',
    caption: 'Share of axial load carried by the nucleus and annulus in the DISC LAB model (healthy vs severely degenerated).',
    deeper: [
      {
        title: 'The neural arch',
        body: [
          'Although discs carry most compressive load, more than 50% can pass through the neural arch, especially in extension or when discs are narrowed (Pollintine 2004, via Newell et al. 2017). DISC LAB models the disc alone.',
        ],
      },
    ],
    takeaways: [
      'Nucleus pressure + annulus tension share the load.',
      'Healthy segment stiffness ≈1.5–1.7 kN/mm.',
      'Stiffness order: axial rotation > extension > lateral bending > flexion.',
    ],
    sim: { text: 'Bend the disc forward and watch the front compress while the back stretches.', cta: 'Open Bending forward', launch: { preset: 'bending', condition: 'healthy' } },
    sources: ['nerurkar', 'newell17', 'oconnell'],
  },
  {
    id: 'viscoelasticity',
    title: 'Viscoelasticity',
    blurb: 'Why the disc keeps compressing over hours.',
    lead: 'The disc is viscoelastic: its response depends on time. Under a constant load it keeps compressing (creep); held at a constant deformation, its stress falls (stress relaxation).',
    body: [
      "Under a constant 1000 N load, human lumbar discs compressed by about 30% over 4 hours. {{creep|Creep}} had an instant elastic part, a fast part ({{timeConstant|time constant}} ≈ 8 min) and a slow part (≈ 3 h), and would take about 14 h to reach equilibrium (O'Connell et al. 2011).",
      'In {{relaxation|stress relaxation}} tests on disc tissue, stress decayed with time constants of about 3 seconds and about 1 minute (Ellingson & Nuckley 2012).',
      'Loading and unloading follow different paths ({{hysteresis|hysteresis}}), showing energy dissipation (Newell et al. 2017).',
    ],
    structureFunction: "Much of the time-dependence comes from fluid flowing through the porous matrix, which is {{poroelastic|poroelastic}} behaviour (Costi 2008, via Nerurkar et al. 2010). O'Connell et al. attribute the fast response to the nucleus and endplate and the slow response to the annulus.",
    diagram: 'creep',
    caption: "Creep and recovery computed with the O'Connell et al. (2011) model used in DISC LAB.",
    deeper: [
      {
        title: 'Spring-and-dashpot models',
        body: [
          'A Maxwell model (spring + dashpot in series) creeps forever and relaxes to zero stress. A Kelvin–Voigt model (in parallel) cannot show stress relaxation. Real discs reach a finite equilibrium, so O\'Connell et al. used an elastic spring in series with two Kelvin–Voigt elements, and Ellingson & Nuckley used a three-term (Prony) relaxation function.',
        ],
      },
      {
        title: 'Does loading speed matter?',
        body: [
          'A 100-fold increase in loading rate raised compressive stiffness by only about 2%, small compared with differences between specimens (Newell et al. 2020).',
        ],
      },
    ],
    takeaways: [
      'Creep: constant load → deformation keeps increasing.',
      'Stress relaxation: constant deformation → stress decreases.',
      'Recovery is several times slower than loading.',
    ],
    sim: { text: 'Run the relaxation test, then the creep test, and compare the time scales.', cta: 'Run the relaxation test', launch: { preset: 'relaxation', condition: 'healthy' } },
    sources: ['oconnell', 'ellingson', 'newell17', 'nerurkar', 'newell20'],
  },
  {
    id: 'loading',
    title: 'Mechanical loading',
    blurb: 'Compression, bending, twisting and vibration.',
    lead: 'In daily life the disc is compressed, bent, twisted and sheared, often several at once. Each mode loads the nucleus and annulus differently.',
    body: [
      'Excessive static compression causes abnormally high stresses and strains that lead to altered biologic activity, cell death and diminished mechanical performance (Setton & Chen 2006, via Volz et al. 2022).',
      'Torsion combined with compression is linked to degeneration; weighted lift-and-twist motions are associated with low back pain, and fibres are damaged when stretched past their resting length (Marras 1995 and others, via Volz et al. 2022).',
      'Drivers of trucks, buses and tractors have high rates of back pain and herniation, likely from whole-body vibration near the spine\'s resonant frequency. Models in the 1–11 Hz range show larger effects in degenerated discs (via Volz et al. 2022).',
    ],
    structureFunction: '{{flexion|Flexion}} compresses the front of the disc and stretches the back of the annulus. {{torsion|Torsion}} shears the annulus layers. Compression pressurizes the nucleus.',
    diagram: 'loadModes',
    caption: 'The five loading modes available in the DISC LAB simulation.',
    deeper: [
      {
        title: 'Typical test loads',
        body: [
          'Motion-segment bending and torsion tests commonly apply moments of about 7.5–10 N·m (Newell et al. 2017). Newell et al. (2020) recommend 0.5 Hz for cyclic compression tests because it is close to physiological rates.',
        ],
      },
    ],
    takeaways: [
      'The disc is usually loaded in several modes at once.',
      'Lift-and-twist and vibration are associated with disc problems.',
      'Flexion stretches the posterior annulus.',
    ],
    sim: { text: 'Lifting combines 2000 N compression with flexion in cycles. Try it with damage progression on.', cta: 'Open the Lifting preset', launch: { preset: 'lifting', condition: 'healthy', damage: true } },
    sources: ['volz', 'newell17', 'newell20'],
  },
  {
    id: 'degeneration',
    title: 'Disc degeneration',
    blurb: 'Losing water, pressure and height.',
    lead: 'In disc degeneration the balance between building and breaking down the matrix is lost. The nucleus loses proteoglycans and water, its pressure falls, and the annulus has to carry more of the load.',
    body: [
      '{{degeneration|Degeneration}} occurs when cell {{anabolism|catabolism}} exceeds anabolism (Volz et al. 2022). It can involve endplate calcification, cracks and fissures, annulus delamination and tears, and collapse of the disc space.',
      'Proteoglycan and water concentration fall in the nucleus, so nucleus pressure falls; the nucleus sagittal diameter shrinks by about 50% and it acts more like a solid, transferring load to the annulus (via Newell et al. 2017).',
      'Degeneration is graded on MRI with the {{pfirrmann|Pfirrmann grade}}. Anterior annulus height fell from 9.67 mm in healthy to 5.53 mm in severely degenerated discs (Ellingson & Nuckley 2012).',
    ],
    structureFunction: "Mechanically, the nucleus equilibrium modulus dropped from 0.435 to 0.229 MPa, degenerated tissue relaxed faster and further (Ellingson & Nuckley 2012), and degenerated discs crept more and recovered less (O'Connell et al. 2011).",
    diagram: 'degeneration',
    caption: 'The same disc model with healthy and severely degenerated parameters.',
    deeper: [
      {
        title: 'Causes',
        body: [
          'Degeneration depends on age, genetics and cell-mediated degradation, accelerated by traumatic or gradual mechanical factors (Volz et al. 2022). Poor nutrition matters too: disc cell density falls when glucose drops below 0.5 mM, and cells become non-viable at 0.2 mM or below (Horner & Urban 2001; Bibby 2002, 2004, via Volz et al. 2022).',
        ],
      },
      {
        title: 'Conflicting evidence on the annulus',
        body: [
          'A degenerating annulus becomes stiffer in compression and shear (Iatridis 1998, via Ellingson & Nuckley 2012 and Newell et al. 2017) but softer and weaker in tension (Shan 2015, via Newell et al. 2017).',
        ],
      },
    ],
    takeaways: [
      'Catabolism outpaces anabolism; proteoglycans and water are lost.',
      'Nucleus pressure falls and the annulus carries more load.',
      'Degenerated discs are shorter, creep more and recover less.',
    ],
    sim: { text: 'Put a healthy and a degenerated disc side by side under the same load.', cta: 'Open comparison mode', launch: { preset: 'standing', compare: true, severity: 0.7 } },
    sources: ['volz', 'newell17', 'ellingson', 'oconnell'],
  },
  {
    id: 'herniation',
    title: 'Disc herniation',
    blurb: 'When the nucleus escapes through the annulus.',
    lead: 'A herniation happens when nucleus material is pushed out through a disrupted annulus. It usually needs a combination of bending and compression, often repeated many times.',
    body: [
      'For {{herniation|herniation}} through the annulus, the disc needs to be flexed or overloaded in multiple modes at once, and herniation is more likely at high loading rates. Bending plus compression can cause radial fissures and prolapse either in one loading cycle or by {{fatigue|fatigue}} (Adams & Hutton, via Newell et al. 2017).',
      'Axial rotation makes the posterior annulus more vulnerable and reduces the load needed to cause failure (via Newell et al. 2017).',
      "Compressive overload damages the bony endplate first, and vertical herniation of the nucleus can create {{schmorl|Schmorl's nodes}} (via Newell et al. 2017).",
    ],
    structureFunction: 'In a degenerated disc the annulus carries compressive stress instead of nucleus-driven tension; over repeated loading this may start cracks that give the nucleus a path toward the periphery (Joshi et al. 2006).',
    diagram: 'herniation',
    caption: "Illustrative: intact → fissure → posterior herniation, and a Schmorl's node (vertical herniation into the vertebra).",
    deeper: [
      {
        title: "Schmorl's nodes: herniation that goes vertical",
        body: [
          "Not every herniation escapes through the annulus. Under compressive overload the bony endplate is damaged first, and nucleus material can push vertically through it into the vertebral body, forming a {{schmorl|Schmorl's node}} (Adams & Dolan 2012; Brinckmann 1988; Hamanishi 1994, via Newell et al. 2017).",
          'The resulting decompression of the nucleus may lead to internal collapse of the annulus (Adams & Dolan 2012; Gunzburg 1992, via Newell et al. 2017). Endplate failure is more common in the weaker cranial bony endplate, which is 14% thinner and supported by less dense trabecular bone (Zhao 2009, via Newell et al. 2017).',
          "Try the Schmorl's node condition in the Simulation: compare its nucleus pressure with a healthy disc under the Standing preset.",
        ],
      },
      {
        title: 'Losing the nucleus',
        body: [
          'When the nucleus was removed from cadaveric discs, compressive stiffness at 15% strain fell to 44% of the (bone-drilled) control; a hydrogel implant restored it to 88% (Joshi et al. 2006).',
        ],
      },
      {
        title: 'What DISC LAB can and cannot predict',
        body: [
          "None of the references gives a validated cycles-to-failure threshold. DISC LAB's damage index is therefore an educational approximation that shows which loads accelerate damage, not when a real disc would herniate.",
        ],
      },
    ],
    takeaways: [
      'Herniation needs combined loading, especially flexion + compression.',
      'Fatigue from repeated loading can cause prolapse.',
      'Losing nucleus material reduces disc stiffness.',
    ],
    sim: { text: 'Turn on damage progression and run Lifting on a degenerated disc.', cta: 'Try herniation progression', launch: { preset: 'lifting', condition: 'degenerated', severity: 0.6, damage: true } },
    sources: ['newell17', 'joshi'],
  },
  {
    id: 'mechanobiology',
    title: 'Mechanobiological responses to loading',
    blurb: 'How disc cells respond to the loads they feel.',
    lead: 'Disc cells sense their mechanical and chemical environment and adjust how much matrix they build or break down. Changes in the matrix then change what the cells feel, creating a feedback loop.',
    body: [
      'Disc cells maintain the matrix; any change to the signals guiding their biosynthesis alters matrix properties, which in turn alters signalling in a cycle (Volz et al. 2022). {{mechanobiology|Mechanobiology}} studies this loop.',
      'Loading changes nutrient transport: standing and weight-bearing changed tissue water content and lowered glucose throughout the disc in an FE model (Jackson 2011b, via Volz et al. 2022), and sustained compression altered oxygen and lactate distributions (Malandrino 2011, via Volz et al. 2022).',
      'Static and dynamic overloading induced early degenerative processes in goat discs (Paul 2013, via Volz et al. 2022), and excessive static compression can cause cell death (via Volz et al. 2022).',
    ],
    structureFunction: 'The disc is avascular, so its cells rely on diffusion through the endplate. Loading, water content and nutrient supply are therefore linked: mechanics shapes the chemical environment that keeps cells alive and productive.',
    diagram: 'mechanobiology',
    caption: 'Feedback loop between loading, cells and matrix (after Volz et al. 2022, Fig. 1).',
    deeper: [
      {
        title: 'Growth factors and smoking',
        body: [
          'Models of {{igf1|IGF-1}} show that adding it boosts proteoglycan synthesis at first, but the extra cell activity is unsustainable unless nutrient supply also increases. Models of heavy smoking predict lasting loss of nucleus cells (via Volz et al. 2022).',
        ],
      },
      {
        title: 'Limits of the evidence',
        body: [
          "The references describe cell responses qualitatively or through nutrient thresholds; they don't give a quantitative rule linking load magnitude to cell output. DISC LAB therefore shows the mechanical side of the loop and explains the biology here.",
        ],
      },
    ],
    takeaways: [
      'Cells, matrix and loading form a feedback loop.',
      'Loading changes water content and nutrient transport.',
      'Overloading can trigger degenerative changes.',
    ],
    sim: { text: 'Watch the hydration index fall during 4 h of standing and recover overnight.', cta: 'Open Standing', launch: { preset: 'standing', condition: 'healthy' } },
    sources: ['volz', 'nerurkar'],
  },
];
