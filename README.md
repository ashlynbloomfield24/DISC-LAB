# DISC LAB

**An interactive, literature-based educational simulation of intervertebral disc (IVD) mechanobiology.**

🔗 **Live site:** https://ashlynbloomfield24.github.io/DISC-LAB/

DISC LAB lets students apply mechanical loads to a lumbar intervertebral disc and watch how it deforms, creeps, recovers and fails. They can compare healthy, degenerated, herniated and Schmorl's-node discs, and see why the responses differ, using a simplified computational model built from published research.

> ⚠️ **Educational model only.** DISC LAB is a simplified, literature-informed teaching tool. Its outputs have been verified against the values reported in its source papers, but the model has **not** been experimentally validated and must not be used for diagnosis, treatment or clinical prediction.

---

## Project objectives

1. Show how different mechanical loads (compression, tension, shear, torsion, bending; single, repeated or cyclic) affect disc height, strain, nucleus pressure and hydration over time.
2. Show how degeneration changes the disc's mechanical response, side by side under identical loading.
3. Base every number and equation on published research, and say clearly where simplifications were made.
4. Teach IVD anatomy, extracellular matrix, viscoelasticity, degeneration, herniation and mechanobiology, and test that understanding.

## Features

| Page | What it does |
|---|---|
| **Simulation** | Four disc conditions (Healthy, Degenerated with a severity slider, Herniated, Schmorl's node) · loading presets (Standing, Lifting, Bending forward, Twisting) · O'Connell creep test and Ellingson relaxation test · full manual control of force type, direction, magnitude, duration, frequency and recovery · animated sagittal + axial anatomical drawing driven by the model · stress map and illustrative damage/herniation progression · four time graphs and live readouts · **comparison mode** (healthy vs degenerated) with an auto-generated explanation |
| **Learn** | 12 lessons with diagrams, tap-to-define terms, "Go deeper" sections, key takeaways and "Try it in the Simulation" links |
| **Quiz** | 50+ sourced questions in 8 categories (multiple choice, true/false, tap-the-structure, scenario and simulation questions) with explanations, category scores and retakes · 39 glossary flashcards with known / needs-review tracking |
| **References** | The 8 source papers, what each contributes, DOIs, and the studies they cite |
| **Model Documentation** | Equations, variables, parameters and sources (computed from the code), assumptions, limitations, graph explanations and verification checks |

## The computational model (summary)

DISC LAB is a **lumped-parameter** model (it doesn't use finite elements) that runs instantly in the browser. Every condition uses the same equations; only the parameters change.

| Part | Equation / method | Source |
|---|---|---|
| Whole-disc creep & recovery | elastic spring + two Kelvin–Voigt elements: `d(t) = L/S_E + L/S₁(1−e^(−t/τ₁)) + L/S₂(1−e^(−t/τ₂))`, with slower recovery constants | O'Connell et al. 2011 |
| Tissue stress relaxation | three-term Prony series `G(t) = 1 + g Σ e^(−t/τᵢ)` | Ellingson & Nuckley 2012 |
| Nucleus/annulus load sharing | two parallel columns weighted by aggregate modulus × area → nucleus pressure and annulus stress | Newell 2017; moduli via Ellingson 2012 |
| Bending, torsion, shear | linear stiffness from reported moduli and disc geometry | Nerurkar et al. 2010 |
| Nucleus loss (herniation, Schmorl's node) | stiffness scaled toward 44% of control at full nucleus loss | Joshi et al. 2006 |
| Hydration, stress map, damage index | **illustrative** indices (clearly labelled in the app) | — |

Full details: the in-app **Model Documentation** page, plus [`docs/computational-model.md`](docs/computational-model.md) and the literature review [`docs/reference-review.md`](docs/reference-review.md).

### Key assumptions and limitations

- Response is linear in load. Healthy and severe creep parameters are extrapolated from the quartiles of O'Connell's grade 1.8–3.4 sample.
- Disc-only model: no facet joints, ligaments, muscles, endplate failure or cell biology.
- Data are ex vivo, at room temperature. Relaxation time constants are tissue-level.
- Above ~35% strain the model extrapolates beyond measured data, and the app warns when this happens.
- **No reference provides herniation thresholds.** The damage index is an educational approximation, not a prediction.
- The Schmorl's-node condition is shown on a degenerated, herniated disc (a presentation choice).

## References

1. Volz M, Elmasry S, Jackson AR, Travascio F. Computational modeling intervertebral disc pathophysiology: a review. *Front Physiol.* 2022;12:750668. https://doi.org/10.3389/fphys.2021.750668
2. Ellingson AM, Nuckley DJ. Intervertebral disc viscoelastic parameters and residual mechanics spatially quantified using a hybrid confined/in situ indentation method. *J Biomech.* 2012;45:491–496. https://doi.org/10.1016/j.jbiomech.2011.11.050
3. O'Connell GD, Jacobs NT, Sen S, Vresilovic EJ, Elliott DM. Axial creep loading and unloaded recovery of the human intervertebral disc and the effect of degeneration. *J Mech Behav Biomed Mater.* 2011;4(7):933–942. https://doi.org/10.1016/j.jmbbm.2011.02.002
4. Newell N, Little JP, Christou A, Adams MA, Adam CJ, Masouros SD. Biomechanics of the human intervertebral disc: a review of testing techniques and results. *J Mech Behav Biomed Mater.* 2017;69:420–434. https://doi.org/10.1016/j.jmbbm.2017.01.037
5. Nerurkar NL, Elliott DM, Mauck RL. Mechanical design criteria for intervertebral disc tissue engineering. *J Biomech.* 2010;43(6):1017–1030. https://doi.org/10.1016/j.jbiomech.2009.12.001
6. Newell N, Rivera Tapia D, Rahman T, Lim S, O'Connell GD, Holsgrove TP. Influence of testing environment and loading rate on intervertebral disc compressive mechanics. *JOR Spine.* 2020;3:e1110. https://doi.org/10.1002/jsp2.1110
7. Joshi A, Fussell G, Thomas J, et al. Functional compressive mechanics of a PVA/PVP nucleus pulposus replacement. *Biomaterials.* 2006;27:176–184. https://doi.org/10.1016/j.biomaterials.2005.06.003
8. Delaine-Smith RM, Burney S, Balkwill FR, Knight MM. Experimental validation of a flat punch indentation methodology calibrated against unconfined compression tests for determination of soft tissue biomechanics. *J Mech Behav Biomed Mater.* 2016;60:401–415. https://doi.org/10.1016/j.jmbbm.2016.02.019

Studies cited *through* these papers are listed on the in-app References page. The PDFs themselves are not included in this repository.

## Run it locally

Requires [Node.js](https://nodejs.org/) 18 or newer.

```bash
git clone https://github.com/ashlynbloomfield24/DISC-LAB.git
cd DISC-LAB
npm install
npm run dev        # open the printed http://localhost:5173 address
```

| Command | What it does |
|---|---|
| `npm run dev` | Start the development server with live reload |
| `npm test` | Run the 396 automated tests (model verification + full input sweep + content checks) |
| `npm run build` | Type-check and build the production site into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run deploy` | Build and publish to GitHub Pages (`gh-pages` branch) |

## Updating the live website

1. Make your changes and check them with `npm run dev` and `npm test`.
2. Commit and push the source: `git add -A && git commit -m "Describe the change" && git push`
3. Publish: `npm run deploy`. The site updates at the live URL within a minute or two.

## Project structure

```
DISC-LAB/
├── docs/                  literature review and model specification
├── public/                static assets (favicon)
├── src/
│   ├── components/        DiscVisualization, ForceControls, ResultsGraphs, Navigation, …
│   ├── pages/             Simulation, Learn, Quiz, References, ModelDocs
│   ├── models/            discParameters, viscoelasticity, mechanics, damageModel,
│   │   │                  hydration, compare, simulate
│   │   └── __tests__/     verification and sweep tests (Vitest)
│   ├── data/              presets, glossary, learnContent, quizQuestions, references
│   └── styles/            global, learn and quiz CSS
├── index.html
├── package.json
└── vite.config.ts
```

**Built with:** React 18 · TypeScript · Vite · Recharts · hand-built SVG · custom CSS · Vitest.

## Acknowledgements

Developed for a college biomedical engineering mechanobiology assignment, with AI assistance (Claude Code) for implementation. All scientific content is drawn from the references above.
