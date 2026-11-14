// Quiz question bank. Every answer is supported by the DISC LAB reference library or by
// the DISC LAB model itself (category "model"). `source` names where the answer comes from.

export type Category =
  | 'anatomy'
  | 'ecm'
  | 'properties'
  | 'viscoelasticity'
  | 'loading'
  | 'degeneration'
  | 'herniation'
  | 'model';

export const CATEGORIES: { id: Category; label: string }[] = [
  { id: 'anatomy', label: 'Anatomy & structure' },
  { id: 'ecm', label: 'Extracellular matrix' },
  { id: 'properties', label: 'Mechanical properties' },
  { id: 'viscoelasticity', label: 'Viscoelasticity' },
  { id: 'loading', label: 'Mechanical loading' },
  { id: 'degeneration', label: 'Disc degeneration' },
  { id: 'herniation', label: 'Disc herniation' },
  { id: 'model', label: 'Model interpretation' },
];

export type Region = 'vertebra' | 'endplate' | 'annulus' | 'nucleus';

interface Base {
  id: string;
  category: Category;
  prompt: string;
  explanation: string;
  source: string;
  /** Optional deep link into the Simulation for questions about simulation results. */
  simLink?: string;
}
export interface MCQuestion extends Base {
  type: 'mc';
  options: [string, string, string, string];
  answer: 0 | 1 | 2 | 3;
  /** Why each wrong option is wrong (same order as options; the correct one can be empty). */
  why?: [string, string, string, string];
  scenario?: boolean;
}
export interface TFQuestion extends Base {
  type: 'tf';
  answer: boolean;
}
export interface TapQuestion extends Base {
  type: 'tap';
  answer: Region;
}
export type Question = MCQuestion | TFQuestion | TapQuestion;

export const REGION_NAMES: Record<Region, string> = {
  vertebra: 'Vertebral body',
  endplate: 'Cartilaginous endplate',
  annulus: 'Annulus fibrosus',
  nucleus: 'Nucleus pulposus',
};

export const QUESTIONS: Question[] = [
  // ---------------- Anatomy & structure ----------------
  { id: 'a-tap-np', category: 'anatomy', type: 'tap', answer: 'nucleus', prompt: 'Tap the nucleus pulposus.', explanation: 'The nucleus pulposus is the gel-like centre of the disc. It pressurizes under compression and tensions the surrounding annulus.', source: 'Newell et al. 2017' },
  { id: 'a-tap-af', category: 'anatomy', type: 'tap', answer: 'annulus', prompt: 'Tap the annulus fibrosus.', explanation: 'The annulus fibrosus is the ring of 15–25 collagen lamellae surrounding the nucleus.', source: 'Newell et al. 2017' },
  { id: 'a-tap-cep', category: 'anatomy', type: 'tap', answer: 'endplate', prompt: 'Tap a cartilaginous endplate.', explanation: 'The cartilaginous endplates are ~0.6 mm layers of hyaline cartilage that bond the disc to the vertebral bone and let nutrients diffuse in.', source: 'Newell et al. 2017' },
  { id: 'a-tap-vb', category: 'anatomy', type: 'tap', answer: 'vertebra', prompt: 'Tap a vertebral body.', explanation: 'A motion segment is two vertebral bodies plus the disc between them.', source: 'Newell et al. 2017' },
  {
    id: 'a-np-area', category: 'anatomy', type: 'mc', prompt: 'About how much of the disc’s transverse cross-sectional area is nucleus pulposus?',
    options: ['5–10%', '25–50%', '70–80%', '90–100%'], answer: 1,
    why: ['Too small: the nucleus is a major part of the disc.', '', 'Too large: the annulus surrounds the nucleus and takes up the rest.', 'The annulus always forms an outer ring, so the nucleus can’t be the whole cross-section.'],
    explanation: 'The nucleus accounts for 40–50% of adult disc volume and 25–50% of its transverse cross-sectional area.', source: 'Newell et al. 2017',
  },
  {
    id: 'a-lamellae', category: 'anatomy', type: 'mc', prompt: 'How many concentric lamellae make up the annulus fibrosus?',
    options: ['3–5', '15–25', '50–60', 'More than 100'], answer: 1,
    explanation: 'The annulus is made up of 15–25 lamellae, each 0.05–0.5 mm thick.', source: 'Newell et al. 2017',
  },
  { id: 'a-avascular', category: 'anatomy', type: 'tf', answer: true, prompt: 'True or false: lumbar intervertebral discs are the largest avascular organs in the human body.', explanation: 'True. Because they have no blood supply, disc cells depend on diffusion, mainly through the endplates.', source: 'Newell et al. 2017' },
  {
    id: 'a-cep-thick', category: 'anatomy', type: 'mc', prompt: 'Roughly how thick is the cartilaginous endplate?',
    options: ['0.06 mm', '0.6 mm', '6 mm', '16 mm'], answer: 1,
    why: ['Ten times too thin.', '', '6 mm would be most of the disc height (~10 mm).', 'Thicker than the whole disc.'],
    explanation: 'The cartilaginous endplates are about 0.6 mm thick and thinner toward the centre.', source: 'Newell et al. 2017',
  },
  {
    id: 'a-fibre-angle', category: 'anatomy', type: 'mc', prompt: 'How are collagen fibres arranged in neighbouring annulus lamellae?',
    options: ['All vertical, parallel to the spine', 'All horizontal, around the ring', 'At about ±30°, alternating direction between layers', 'Randomly, with no preferred direction'], answer: 2,
    why: ['Vertical fibres could not resist hoop tension.', 'Purely horizontal fibres would not resist twisting or bending well.', '', 'The annulus is highly organized; the nucleus is the disorganized tissue.'],
    explanation: 'Fibres alternate at about ±25–45° (≈30°) in neighbouring lamellae, like a radial tyre, so the annulus resists tension in many directions.', source: 'Newell et al. 2017; Nerurkar et al. 2010',
  },

  // ---------------- Extracellular matrix ----------------
  {
    id: 'e-aggrecan', category: 'ecm', type: 'mc', prompt: 'What is the principal proteoglycan of the nucleus pulposus?',
    options: ['Type I collagen', 'Aggrecan', 'Elastin', 'Hydroxyapatite'], answer: 1,
    why: ['Collagen is a fibrous protein, not a proteoglycan.', '', 'Elastin is an elastic protein found mostly between annulus lamellae.', 'Hydroxyapatite is the mineral in bone.'],
    explanation: 'The nucleus is a hydrated matrix of mainly type II collagen and proteoglycans, principally aggrecan.', source: 'Ellingson & Nuckley 2012',
  },
  {
    id: 'e-collagen1', category: 'ecm', type: 'mc', prompt: 'Which collagen type gives the outer annulus its tensile strength, as in tendon?',
    options: ['Type I', 'Type II', 'Type IV', 'Type X'], answer: 0,
    why: ['', 'Type II forms the fine compression-resisting mesh of the nucleus and inner annulus.', 'Type IV is a basement-membrane collagen, not discussed for disc strength.', 'Not described as a load-bearing disc collagen in the references.'],
    explanation: 'Type I collagen provides strength in tension, as in tendon; type II collagen binds proteoglycans and water to resist compression, as in hyaline cartilage.', source: 'Newell et al. 2017',
  },
  { id: 'e-water-age', category: 'ecm', type: 'tf', answer: false, prompt: 'True or false: nucleus water content increases with age.', explanation: 'False. Nucleus water content falls from about 90% to about 70% between ages 1 and 80, reflecting a similar fall in proteoglycans.', source: 'Newell et al. 2017' },
  {
    id: 'e-why-water', category: 'ecm', type: 'mc', prompt: 'Why do proteoglycans draw water into the nucleus?',
    options: ['They are positively charged and repel water', 'Their negatively charged GAG chains create a fixed charge density and osmotic pressure', 'They pump water using ATP', 'They form a waterproof seal that traps fluid'], answer: 1,
    why: ['They are negatively charged, and charge attracts water rather than repelling it.', '', 'Swelling is passive and osmotic, not an active pump.', 'The matrix is porous; fluid flows in and out under load.'],
    explanation: 'Negatively charged, hydrophilic proteoglycans (their sulfated GAGs) create a fixed charge density, so water diffuses in and generates osmotic swelling pressure.', source: 'Ellingson & Nuckley 2012; Nerurkar et al. 2010',
  },
  {
    id: 'e-af-collagen', category: 'ecm', type: 'mc', prompt: 'Roughly what fraction of the annulus’s dry weight is collagen?',
    options: ['About 2%', 'About 20%', '50–70%', 'About 95%'], answer: 2,
    why: ['2% is the elastin content.', '≈20% is the proteoglycan content.', '', 'Proteoglycans and elastin make up a meaningful share too.'],
    explanation: 'Annulus dry weight is about 20% proteoglycan, 50–70% collagen and 2% elastin.', source: 'Newell et al. 2017',
  },
  { id: 'e-gradient', category: 'ecm', type: 'tf', answer: false, prompt: 'True or false: moving from the outer to the inner annulus, type I collagen content increases.', explanation: 'False. From outer to inner annulus, proteoglycan, water and type II collagen increase while type I collagen decreases.', source: 'Newell et al. 2017' },

  // ---------------- Mechanical properties ----------------
  {
    id: 'p-stiffness', category: 'properties', type: 'mc', prompt: 'What is the approximate axial compressive stiffness of a healthy human lumbar motion segment?',
    options: ['15–17 N/mm', '1.5–1.7 kN/mm', '150–170 kN/mm', '1.5–1.7 MN/mm'], answer: 1,
    why: ['A thousand times too soft: body weight would flatten the disc.', '', 'A hundred times too stiff.', 'Close to the stiffness of a steel block.'],
    explanation: "Nerurkar et al. list 1.73 kN/mm; O'Connell et al. measured 1498 N/mm.", source: "Nerurkar et al. 2010; O'Connell et al. 2011",
  },
  {
    id: 'p-anisotropy', category: 'properties', type: 'mc', prompt: 'In tension, in which direction is the annulus stiffest?',
    options: ['Along the collagen fibres', 'Circumferentially (around the ring)', 'Radially (inward–outward)', 'Across the fibres'], answer: 0,
    why: ['', 'About 16 MPa, much less than along the fibres.', 'About 0.3 MPa: the weakest direction.', 'About 0.2 MPa.'],
    explanation: 'Average tensile moduli: ≈183 MPa along the fibres, ≈16 MPa circumferential, ≈0.3 MPa radial and ≈0.2 MPa cross-fibre. The annulus is strongly anisotropic.', source: 'Newell et al. 2017',
  },
  {
    id: 'p-standing', category: 'properties', type: 'mc', prompt: 'What intradiscal pressure has been measured in a healthy lumbar nucleus while standing?',
    options: ['0.005–0.009 MPa', '0.5–0.87 MPa', '5–8.7 MPa', '50–87 MPa'], answer: 1,
    explanation: 'In vivo measurements give 500–870 kPa (0.5–0.87 MPa) standing, 91–539 kPa lying, 460–1330 kPa sitting.', source: 'Wilke 1999 and others, via Newell et al. 2017',
  },
  { id: 'p-residual', category: 'properties', type: 'tf', answer: true, prompt: 'True or false: the nucleus is pressurized even when no external load is applied.', explanation: 'True. Its swelling is restrained by the annulus and endplates. Ellingson & Nuckley measured an average residual stress of 0.305 MPa in healthy nuclei.', source: 'Ellingson & Nuckley 2012; Nerurkar et al. 2010' },
  {
    id: 'p-order', category: 'properties', type: 'mc', prompt: 'Which ranking of spinal joint resistance (stiffest first) is reported?',
    options: ['Flexion > lateral bending > extension > axial rotation', 'Axial rotation > extension > lateral bending > flexion', 'Lateral bending > flexion > axial rotation > extension', 'All directions are equally stiff'], answer: 1,
    explanation: 'Resistance is greatest in axial rotation, followed by extension, lateral bending and finally flexion.', source: 'Newell et al. 2017',
  },
  {
    id: 'p-test-method', category: 'properties', type: 'mc', scenario: true,
    prompt: 'Scenario: one lab reports a nucleus modulus of ≈5 kPa, another ≈1 MPa. What best explains a 200-fold difference?',
    options: ['One lab made an arithmetic error', 'Unconfined vs confined compression: confinement lets the fluid pressurize and carry load', 'Nucleus stiffness changes with the time of day', 'The two labs used different units by mistake'], answer: 1,
    why: ['Both values are reported in the literature; the difference is systematic.', '', 'Hydration varies diurnally, but not by 200×.', 'The values are reported correctly in their own units.'],
    explanation: 'The nucleus measures ≈5.4 kPa in unconfined but ≈1.0 MPa in confined compression. Confinement, as in the real disc, lets fluid pressurization carry load, so confined compression is the key benchmark.', source: 'Newell et al. 2017; Nerurkar et al. 2010',
  },

  // ---------------- Viscoelasticity ----------------
  {
    id: 'v-creep', category: 'viscoelasticity', type: 'mc', prompt: 'What is creep?',
    options: ['Stress decreasing while deformation is held constant', 'Deformation increasing over time under a constant load', 'Instant elastic compression when a load is applied', 'Permanent fracture after a single overload'], answer: 1,
    why: ['That is stress relaxation.', '', 'That is the elastic response, which comes before creep.', 'That is failure, not creep.'],
    explanation: "Creep is continued deformation under constant load. O'Connell et al. saw discs keep compressing for hours at 1000 N.", source: "O'Connell et al. 2011",
  },
  {
    id: 'v-relax', category: 'viscoelasticity', type: 'mc', prompt: 'In a stress-relaxation test, what is held constant and what changes?',
    options: ['Load is constant; deformation increases', 'Deformation is constant; stress decreases', 'Both are constant', 'Deformation is constant; stress increases'], answer: 1,
    explanation: 'Stress relaxation holds the strain constant and the stress decays toward equilibrium. Ellingson & Nuckley held a 5% step for 1800 s.', source: 'Ellingson & Nuckley 2012',
  },
  { id: 'v-recovery', category: 'viscoelasticity', type: 'tf', answer: false, prompt: 'True or false: after unloading, a disc recovers its height faster than it lost it.', explanation: "False. Recovery was 3–4× slower than creep loading; its time constants were 5× (fast) and 2.5× (slow) longer. Recovery is driven only by osmotic pressure.", source: "O'Connell et al. 2011" },
  {
    id: 'v-maxwell', category: 'viscoelasticity', type: 'mc', prompt: 'Why is a single Maxwell model (spring and dashpot in series) a poor model of disc creep?',
    options: ['It cannot show any instantaneous response', 'It creeps forever and relaxes to zero stress, but discs reach a finite equilibrium', 'It is too stiff', 'It only works for metals'], answer: 1,
    why: ['A Maxwell model does respond instantly through its spring.', '', 'Stiffness can be set by choosing the spring constant.', 'It is used for many materials; the problem is its behaviour, not the material class.'],
    explanation: "Discs reach a finite equilibrium displacement and stress. O'Connell et al. used a spring in series with two Kelvin–Voigt elements instead.", source: "O'Connell et al. 2011; Ellingson & Nuckley 2012",
  },
  {
    id: 'v-30pct', category: 'viscoelasticity', type: 'mc', prompt: "In O'Connell et al. (2011), about how much axial compression did human discs reach after 4 hours at 1000 N?",
    options: ['About 3%', 'About 30%', 'About 60%', 'About 90%'], answer: 1,
    explanation: 'Displacement at the end of the first 4 h creep test was 2.85 mm, approximately 30% axial compression.', source: "O'Connell et al. 2011",
  },
  {
    id: 'v-rate', category: 'viscoelasticity', type: 'mc', prompt: 'Increasing the loading rate 100-fold changed bovine disc compressive stiffness by about how much?',
    options: ['About 2%', 'About 50%', 'About 100% (doubled)', 'About 1000%'], answer: 0,
    explanation: 'A 100-fold increase in loading rate produced a small (≈2%) but significant increase, small compared with differences between specimens and labs.', source: 'Newell et al. 2020',
  },
  {
    id: 'v-slow', category: 'viscoelasticity', type: 'mc', prompt: "O'Connell et al. attributed the slow (hours) creep response mainly to fluid flow in which tissue?",
    options: ['Nucleus pulposus', 'Annulus fibrosus', 'Vertebral bone marrow', 'Spinal cord'], answer: 1,
    why: ['The nucleus and endplate were linked to the fast (minutes) response.', '', 'Not part of their interpretation.', 'Not part of the disc.'],
    explanation: 'They inferred that the nucleus and endplate drive the fast response and the annulus drives the slow response, which made up ≈50% of creep displacement.', source: "O'Connell et al. 2011",
  },

  // ---------------- Mechanical loading ----------------
  {
    id: 'l-flexion', category: 'loading', type: 'mc', prompt: 'Bending forward (flexion) stretches which part of the annulus?',
    options: ['Anterior annulus', 'Posterior annulus', 'Neither: flexion only compresses', 'Only the nucleus'], answer: 1,
    explanation: 'Flexion closes the front of the disc and opens the back, stretching the posterior annulus, where herniations typically break through.', source: 'Newell et al. 2017',
  },
  { id: 'l-torsion', category: 'loading', type: 'tf', answer: true, prompt: 'True or false: torsion combined with compression has been linked to disc degeneration.', explanation: 'True. Weighted lift-and-twist motions are linked to low back pain, and fibres are damaged when elongated past their resting length.', source: 'Marras 1995 and others, via Volz et al. 2022' },
  {
    id: 'l-peak', category: 'loading', type: 'mc', prompt: 'The highest nucleus pressure recorded in vivo (≈2.3 MPa) occurred during which activity?',
    options: ['Lying supine', 'Sitting relaxed', 'Standing flexed forward holding 20 kg', 'Walking'], answer: 2,
    explanation: 'The highest pressure, 2300 kPa, was in a standing subject flexing forward while holding a 20 kg mass.', source: 'Wilke 1999, via Newell et al. 2017',
  },
  {
    id: 'l-vibration', category: 'loading', type: 'mc', scenario: true,
    prompt: 'Scenario: a truck driver is exposed to whole-body vibration all day. What does the evidence suggest?',
    options: ['Vibration protects the disc by pumping in nutrients', 'Drivers show high rates of back pain and herniation; models show larger effects in degenerated discs', 'Vibration has no measurable effect on discs', 'Only vibrations above 1000 Hz matter'], answer: 1,
    explanation: 'Epidemiology links driving to back pain and herniation, likely from vibration near the spine’s resonant frequency. FE models at 1–11 Hz showed lower fluid pressure and higher annulus stress, more so in degenerated discs.', source: 'Via Volz et al. 2022',
  },
  {
    id: 'l-arch', category: 'loading', type: 'mc', prompt: 'When does the neural arch (posterior elements) carry more of the compressive load?',
    options: ['In flexion', 'In extension, or when discs are narrowed', 'Never: the disc carries everything', 'Only when lying down'], answer: 1,
    explanation: 'More than 50% of compressive load can pass through the neural arch; it carries more in extension and when discs are narrowed by sustained loading or degeneration.', source: 'Via Newell et al. 2017',
  },

  // ---------------- Degeneration ----------------
  {
    id: 'd-imbalance', category: 'degeneration', type: 'mc', prompt: 'At the cellular level, disc degeneration is described as an imbalance in which…',
    options: ['anabolism exceeds catabolism', 'catabolism exceeds anabolism', 'cells stop sensing load', 'blood vessels grow into the nucleus'], answer: 1,
    explanation: 'Degeneration is a perturbation of the balance between synthesis and degradation of the matrix: cell catabolic activity exceeds anabolism.', source: 'Volz et al. 2022',
  },
  {
    id: 'd-shift', category: 'degeneration', type: 'mc', prompt: 'As the nucleus loses proteoglycans and water, compressive load bearing shifts toward…',
    options: ['the nucleus', 'the annulus fibrosus', 'the spinal cord', 'nothing changes'], answer: 1,
    explanation: 'Nucleus pressure falls, the nucleus acts more like a solid, and more compressive load is transferred to the annulus.', source: 'Via Newell et al. 2017',
  },
  { id: 'd-recover', category: 'degeneration', type: 'tf', answer: false, prompt: 'True or false: more degenerated discs recover a larger fraction of their height after creep loading.', explanation: "False. Percent recovery (44–98%) was negatively correlated with degenerative grade (r = −0.72).", source: "O'Connell et al. 2011" },
  {
    id: 'd-modulus', category: 'degeneration', type: 'mc', prompt: 'How did the nucleus equilibrium modulus change from healthy to severely degenerated discs?',
    options: ['It doubled', 'It stayed the same', 'It fell by about half (0.435 → 0.229 MPa)', 'It dropped to zero'], answer: 2,
    explanation: 'The posterior (nucleus) equilibrium modulus decreased significantly from 0.435 to 0.229 MPa.', source: 'Ellingson & Nuckley 2012',
  },
  {
    id: 'd-glucose', category: 'degeneration', type: 'mc', prompt: 'Below what glucose concentration do all disc cells become non-viable?',
    options: ['5 mM', '2 mM', '0.5 mM', '0.2 mM'], answer: 3,
    why: ['Well above the reported thresholds.', 'Above the reported thresholds.', 'Below 0.5 mM cell density starts to fall, but cells are not yet all non-viable.', ''],
    explanation: 'Cell density falls linearly below 0.5 mM glucose, and at 0.2 mM or below all disc cells become non-viable.', source: 'Horner & Urban 2001; Bibby 2002, 2004, via Volz et al. 2022',
  },
  {
    id: 'd-pfirrmann', category: 'degeneration', type: 'mc', prompt: 'The Pfirrmann grading scale for disc degeneration is based on…',
    options: ['blood tests', 'MRI appearance', 'pain questionnaires', 'disc stiffness tests'], answer: 1,
    explanation: 'Both Ellingson & Nuckley and O’Connell et al. graded discs from T2-weighted MRI with the Pfirrmann scale (signal intensity, height, structure).', source: "Ellingson & Nuckley 2012; O'Connell et al. 2011",
  },
  { id: 'd-af-stiffer', category: 'degeneration', type: 'tf', answer: true, prompt: 'True or false: a degenerating annulus has been reported to become stiffer in compression.', explanation: 'True, but in tension the degenerated annulus becomes softer and weaker. The direction depends on the loading mode.', source: 'Iatridis 1998 via Ellingson & Nuckley 2012; Shan 2015 via Newell et al. 2017' },

  // ---------------- Herniation ----------------
  {
    id: 'h-modes', category: 'herniation', type: 'mc', prompt: 'Which loading is most associated with herniation through the annulus?',
    options: ['Pure, slow axial compression', 'Flexion combined with compression (overload in multiple modes)', 'Lying still', 'Pure tension'], answer: 1,
    why: ['Pure compressive overload damages the endplate first.', '', 'Lying produces the lowest disc pressures.', 'Not identified as a herniation mechanism.'],
    explanation: 'Herniation through the annulus requires flexion or overload in multiple modes simultaneously; it is more likely at high loading rates.', source: 'Adams & Hutton, via Newell et al. 2017',
  },
  {
    id: 'h-endplate', category: 'herniation', type: 'mc', prompt: 'Pure compressive overload of a motion segment damages which structure first?',
    options: ['Posterior annulus', 'Bony endplate', 'Spinal ligaments', 'Facet joint cartilage'], answer: 1,
    explanation: "Compressive overload always damages the bony endplate first; vertical herniation of the nucleus can create Schmorl's nodes.", source: 'Via Newell et al. 2017',
  },
  { id: 'h-fatigue', category: 'herniation', type: 'tf', answer: true, prompt: 'True or false: repeated loading can cause disc prolapse even when each load is below the single-load failure level.', explanation: 'True. Bending plus compression can cause prolapse in a single cycle or by fatigue failure over many cycles.', source: 'Adams & Hutton 1985, via Newell et al. 2017' },
  {
    id: 'h-schmorl', category: 'herniation', type: 'mc', prompt: "How does a Schmorl's node differ from a typical posterior disc herniation?",
    options: [
      'The nucleus is pushed vertically through the endplate into the vertebral body',
      'The annulus is pushed forward into the abdomen',
      'The vertebral body grows into the disc',
      'It is a herniation of the facet joint, not the disc',
    ],
    answer: 0,
    why: ['', 'Not described in the references.', 'That would be bone growth (e.g. osteophytes), not herniation.', "Schmorl's nodes involve the disc nucleus and endplate."],
    explanation: "Compressive overload damages the bony endplate first; vertical herniation of the nucleus through it into the vertebral body creates a Schmorl's node. The resulting nucleus decompression may lead to internal collapse of the annulus.",
    source: 'Adams & Dolan 2012 and others, via Newell et al. 2017', simLink: '#/simulation?preset=standing&condition=schmorl',
  },
  {
    id: 'h-joshi', category: 'herniation', type: 'mc', prompt: 'After the nucleus was removed from cadaveric discs, compressive stiffness at 15% strain fell to about…',
    options: ['95% of control', '75% of control', '44% of control', '5% of control'], answer: 2,
    explanation: 'Denucleated stiffness was 44% of the (bone-drilled) control at 15% strain; a hydrogel nucleus implant restored it to 88%.', source: 'Joshi et al. 2006',
  },
  {
    id: 'h-rotation', category: 'herniation', type: 'mc', prompt: 'Axial rotation is reported to increase the vulnerability of which part of the disc?',
    options: ['Anterior annulus', 'Posterior portions of the disc', 'Nucleus only', 'Vertebral body'], answer: 1,
    explanation: 'Axial rotation probably enhances the vulnerability of the posterior portions of the disc and reduces the load required for failure.', source: 'Via Newell et al. 2017',
  },

  // ---------------- Model interpretation ----------------
  {
    id: 'm-pressure', category: 'model', type: 'mc', scenario: true,
    prompt: 'In DISC LAB comparison mode, both discs get exactly the same load, yet the degenerated disc shows lower nucleus pressure. Why?',
    options: ['The simulation applies less force to it', 'Its smaller, softer nucleus carries a smaller share of the load, so the annulus carries more', 'The nucleus pressure gauge is turned off', 'Degenerated discs have no nucleus at all'], answer: 1,
    why: ['Comparison mode applies identical inputs to both discs.', '', 'Both discs are calculated with the same equations.', 'The degenerated nucleus is smaller and softer, not absent.'],
    explanation: 'In the two-column model, load splits by stiffness × area. A lower nucleus aggregate modulus and smaller nucleus area shift load to the annulus, matching Newell et al. (2017).', source: 'DISC LAB model; Newell et al. 2017', simLink: '#/simulation?preset=standing&compare=1&severity=0.6',
  },
  { id: 'm-damage', category: 'model', type: 'tf', answer: false, prompt: 'True or false: the DISC LAB damage index predicts when a real disc will herniate.', explanation: 'False. No reference provides cycles-to-failure thresholds, so the damage index is an explicitly illustrative, educational approximation.', source: 'DISC LAB model documentation' },
  {
    id: 'm-creep-model', category: 'model', type: 'mc', prompt: 'Which model does DISC LAB use for whole-disc creep and recovery?',
    options: ['A single Maxwell element', 'An elastic spring in series with two Kelvin–Voigt elements', 'A purely elastic spring', 'A full 3D finite element model'], answer: 1,
    explanation: "DISC LAB uses O'Connell et al.'s (2011) 5-parameter model: elastic + fast + slow responses, with slower recovery time constants.", source: "O'Connell et al. 2011",
  },
  {
    id: 'm-standing', category: 'model', type: 'mc', scenario: true,
    prompt: 'Open the Standing preset on a healthy disc and scrub to the end of the 4-hour load. About what axial strain does DISC LAB show?',
    options: ['About 2%', 'About 19%', 'About 45%', 'About 80%'], answer: 1,
    explanation: "DISC LAB gives ≈19% strain (height ≈7.8 mm from 9.67 mm) after 4 h at 750 N, consistent with O'Connell's ≈30% at the higher load of 1000 N.", source: "DISC LAB model; O'Connell et al. 2011", simLink: '#/simulation?preset=standing&condition=healthy',
  },
  {
    id: 'm-af-stress', category: 'model', type: 'mc', scenario: true,
    prompt: 'In comparison mode (Standing, 60% severity), which disc shows the higher annulus stress?',
    options: ['The healthy disc', 'The degenerated disc', 'They are identical', 'Neither disc has annulus stress'], answer: 1,
    explanation: 'The degenerated annulus carries more of the axial load, so its average stress is higher (≈0.46 vs 0.33 MPa after 3 h).', source: 'DISC LAB model', simLink: '#/simulation?preset=standing&compare=1&severity=0.6',
  },
  {
    id: 'm-scale', category: 'model', type: 'mc', prompt: 'DISC LAB draws deformation “2× magnified”. What does that change?',
    options: ['The numbers in the readouts and graphs', 'Only the drawing; all numbers stay at true scale', 'The load applied to the disc', 'The degeneration severity'], answer: 1,
    explanation: 'The visual scale multiplies the drawn deformation only. All readouts and graphs are always true scale.', source: 'DISC LAB model',
  },
  { id: 'm-bending', category: 'model', type: 'tf', answer: false, prompt: 'True or false: in DISC LAB, the degenerated disc has a lower bending stiffness than the healthy disc.', explanation: 'False. DISC LAB is a disc-only model. Real motion segments lose bending stiffness mainly because ligaments go slack, and ligaments are not modelled. Instead, the shorter degenerated disc shows larger edge strain for the same angle.', source: 'DISC LAB model; Newell et al. 2017' },
];
