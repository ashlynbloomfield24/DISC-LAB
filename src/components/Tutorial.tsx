// "How to use DISC LAB" popup. Opens automatically on a visitor's first visit, closes with the X,
// "Skip", Escape or a click outside, and can be reopened from the Simulation page.

import { useEffect, useRef, useState } from 'react';

const SEEN_KEY = 'disclab.tutorialSeen';

export function tutorialSeen(): boolean {
  try {
    return localStorage.getItem(SEEN_KEY) === '1';
  } catch {
    return false;
  }
}
function markSeen() {
  try {
    localStorage.setItem(SEEN_KEY, '1');
  } catch {
    /* storage blocked: the tutorial simply shows again next visit */
  }
}

interface Step {
  title: string;
  lead: string;
  points: string[];
}

const STEPS: Step[] = [
  {
    title: 'Welcome to DISC LAB',
    lead: 'Load a lumbar intervertebral disc and watch how it deforms, creeps and recovers over time.',
    points: [
      'Simulation is where you experiment. Learn and Quiz teach and test the science behind it.',
      'Every number comes from published research. Tap any ⓘ icon to learn what a control means.',
      'This short tour shows how to run your first experiment.',
    ],
  },
  {
    title: '1 · Choose a disc',
    lead: 'The buttons at the top right pick which disc you are loading.',
    points: [
      'Healthy, Degenerated, Herniated or Schmorl’s node.',
      'Degenerated shows a severity slider from mild to severe.',
      'Herniated and Schmorl’s node show a nucleus-loss slider.',
    ],
  },
  {
    title: '2 · Apply a load',
    lead: 'Use the panel on the right (below the disc on tablets and phones).',
    points: [
      'Quick presets: Standing, Lifting, Bending forward or Twisting.',
      'Advanced loading: pick a force type, direction and size, how long it lasts, single / repeated / cyclic, and the rest time after.',
      'Run creep test and Run relaxation test repeat two published experiments.',
    ],
  },
  {
    title: '3 · Press Play',
    lead: 'The bar under the disc runs the experiment in simulated time.',
    points: [
      'Play / Pause, Reset, and drag the scrubber to jump to any moment.',
      'Speed it up (up to 3600×) so hours of loading play in seconds.',
      'Blue sections of the bar are loading; gray sections are rest.',
    ],
  },
  {
    title: '4 · Read the results',
    lead: 'The drawing, the numbers and the graphs all come from the same calculation.',
    points: [
      'The dashed outline is the unloaded disc. Deformation is drawn 2× (switch to True scale in Display).',
      'Readout cards show height, strain, nucleus pressure, annulus stress and more.',
      'The four graphs follow the black “now” line. Click a graph to enlarge it.',
    ],
  },
  {
    title: '5 · Compare and explore',
    lead: 'Go further once you have run a load.',
    points: [
      'Turn on Compare to load a healthy and a degenerated disc side by side, with an explanation of why they differ.',
      'Display options: Show stress map, and Damage progression (an educational approximation of herniation).',
      'Model parameters (above the disc) lists every value used and where it comes from.',
    ],
  },
];

/** Any part of the app can reopen the tutorial without prop drilling. */
export const TUTORIAL_EVENT = 'disclab:tutorial';
export function openTutorial() {
  window.dispatchEvent(new Event(TUTORIAL_EVENT));
}

export default function Tutorial({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [i, setI] = useState(0);
  const closeRef = useRef<HTMLButtonElement>(null);
  const last = i === STEPS.length - 1;

  const close = () => {
    markSeen();
    onClose();
  };

  useEffect(() => {
    if (!open) return;
    setI(0);
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') setI((v) => Math.min(STEPS.length - 1, v + 1));
      if (e.key === 'ArrowLeft') setI((v) => Math.max(0, v - 1));
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;
  const s = STEPS[i];
  return (
    <div className="tour-backdrop" onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <div className="tour" role="dialog" aria-modal="true" aria-labelledby="tour-title">
        <button ref={closeRef} className="tour-close" onClick={close} aria-label="Close tutorial">
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
            <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        <div className="tour-kicker">How to use the simulation</div>
        <h2 id="tour-title">{s.title}</h2>
        <p className="tour-lead">{s.lead}</p>
        <ul className="tour-points">
          {s.points.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
        <div className="tour-foot">
          <div className="tour-dots" aria-label={`Step ${i + 1} of ${STEPS.length}`}>
            {STEPS.map((st, k) => (
              <button key={st.title} className={k === i ? 'on' : ''} onClick={() => setI(k)} aria-label={`Go to step ${k + 1}`} />
            ))}
          </div>
          <div className="tour-actions">
            {i > 0 ? (
              <button className="btn btn-ghost" onClick={() => setI(i - 1)}>
                Back
              </button>
            ) : (
              <button className="btn btn-ghost" onClick={close}>
                Skip
              </button>
            )}
            <button className="btn btn-primary" onClick={() => (last ? close() : setI(i + 1))}>
              {last ? 'Start exploring' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
