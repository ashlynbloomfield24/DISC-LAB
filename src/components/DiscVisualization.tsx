// Anatomical SVG of a lumbar motion segment (sagittal or coronal cut) with an axial inset.
// ALL geometry is computed from the model output sample, so the drawing never disagrees
// with the numbers. The visual scale (5× / true) magnifies the drawing only.

import { useId } from 'react';
import { regionStresses } from '../models/mechanics';
import type { DiscParams, LoadInputs, SimSample } from '../models/types';

export interface DiscVisualizationProps {
  params: DiscParams;
  sample: SimSample;
  inputs: LoadInputs;
  visualScale: number;
  showStress: boolean;
  showDamage: boolean;
  /** Title shown above the drawing (e.g. "Healthy" in comparison mode). */
  label?: string;
  compact?: boolean;
  accent?: string;
}

const S = 6.2; // px per mm
const VB_H = 26; // mm, vertebral body height drawn
const EP = 1.1; // mm, cartilage endplate thickness drawn

const mix = (a: string, b: string, t: number) => {
  const pa = a.match(/\w\w/g)!.map((h) => parseInt(h, 16));
  const pb = b.match(/\w\w/g)!.map((h) => parseInt(h, 16));
  return `#${pa.map((v, i) => Math.round(v + (pb[i] - v) * Math.max(0, Math.min(1, t))).toString(16).padStart(2, '0')).join('')}`;
};

/** Single-hue blue stress scale, 0 → 2 MPa. */
export function stressColor(v: number) {
  const t = Math.max(0, Math.min(1, v / 2));
  return t < 0.5 ? mix('#eef5ff', '#4a90d9', t / 0.5) : mix('#4a90d9', '#08306b', (t - 0.5) / 0.5);
}

type Pt = { x: number; y: number };
const rot = (x: number, th: number): Pt => ({ x: x * Math.cos(th), y: x * Math.sin(th) });

export default function DiscVisualization({
  params: p,
  sample: s,
  inputs,
  visualScale: V,
  showStress,
  showDamage,
  label,
  compact,
  accent = '#0071e3',
}: DiscVisualizationProps) {
  const uid = useId().replace(/:/g, '');
  const lateral = inputs.direction === 'lateralBend' || inputs.direction === 'lateral';
  const leftName = lateral ? 'Left' : 'Anterior';
  const rightName = lateral ? 'Right' : 'Posterior';

  // ---------- Sagittal / coronal geometry ----------
  const W = 720;
  const H = 565;
  const cx = compact ? 300 : 290;
  const yB = 350; // top surface of the fixed lower vertebra
  const w = 2 * p.r * S; // disc width px
  const wVB = w + 3 * S;
  const h0px = p.h0 * S;
  const hc = Math.max(0.15 * h0px, (p.h0 - s.disp * V) * S);

  const bend = inputs.loadType === 'bending';
  // SVG positive rotation lifts the left side; flexion closes the anterior (left) side.
  const sign = inputs.direction === 'extension' ? 1 : -1;
  const th = bend ? sign * s.angle * V : 0;
  const shearDir = inputs.direction === 'anterior' ? -1 : 1;
  const dx = inputs.loadType === 'shear' ? shearDir * s.shear * V * S : 0;
  const P: Pt = { x: cx + dx, y: yB - hc };
  const TL = { x: P.x + rot(-w / 2, th).x, y: P.y + rot(-w / 2, th).y };
  const TR = { x: P.x + rot(w / 2, th).x, y: P.y + rot(w / 2, th).y };
  const BL = { x: cx - w / 2, y: yB };
  const BR = { x: cx + w / 2, y: yB };

  // local true strains at the two edges → Poisson bulge
  const compLeft = bend ? (inputs.direction === 'extension' ? -1 : 1) : 0;
  const epsL = s.strain + compLeft * s.edgeStrain;
  const epsR = s.strain - compLeft * s.edgeStrain;
  const bulgePx = (eps: number) => p.nuAF * Math.max(0, eps) * p.r * V * S;
  const bL = bulgePx(epsL);
  const bR = bulgePx(epsR);

  // herniation / damage
  const damage = showDamage ? s.damage : 0;
  // The Schmorl's node condition is drawn on a herniated disc (posterior extrusion) plus the vertical node.
  const herniated = p.condition === 'herniated' || p.condition === 'schmorl' || damage >= 1;
  const schmorl = p.condition === 'schmorl';
  const extrude = herniated ? Math.max(p.nucleusLoss, damage >= 1 ? 0.5 : 0) : 0;
  const fissure = Math.max(showDamage ? damage : 0, p.condition !== 'healthy' ? (p.severity - 0.35) * 0.9 : 0);

  const discPath = [
    `M ${BL.x} ${BL.y}`,
    `Q ${Math.min(BL.x, TL.x) - 2 * bL} ${(BL.y + TL.y) / 2} ${TL.x} ${TL.y}`,
    `L ${TR.x} ${TR.y}`,
    `Q ${Math.max(BR.x, TR.x) + 2 * bR} ${(BR.y + TR.y) / 2} ${BR.x} ${BR.y}`,
    'Z',
  ].join(' ');

  // nucleus
  const wNP = w * Math.sqrt(Math.max(p.phi, 0.02));
  const npC = { x: (cx + P.x) / 2, y: (yB + P.y) / 2 };
  const npRx = wNP / 2 + p.nuNP * Math.max(0, s.strain) * (wNP / 2) * V * 0.6;
  const npRy = Math.max(3, hc * 0.36);

  // lamellae
  const lam = (side: -1 | 1) => {
    const lines: string[] = [];
    const n = compact ? 5 : 7;
    const bulge = side < 0 ? bL : bR;
    for (let k = 1; k <= n; k++) {
      const u = k / (n + 1);
      const xLocal = side * (w / 2 - u * (w / 2 - wNP / 2 - 4));
      const bot = { x: cx + xLocal, y: yB };
      const tr = rot(xLocal, th);
      const top = { x: P.x + tr.x, y: P.y + tr.y };
      const ctrl = { x: (bot.x + top.x) / 2 + side * 2 * bulge * (1 - u) * 0.9, y: (bot.y + top.y) / 2 };
      lines.push(`M ${bot.x} ${bot.y} Q ${ctrl.x} ${ctrl.y} ${top.x} ${top.y}`);
    }
    return lines;
  };

  // colors by degeneration
  const deg = p.severity;
  const npFill = mix('3d8bef', '9fadbb', deg);
  const afFill = mix('cfe0f2', 'd9d3c1', deg);
  const lamStroke = mix('7fa6d0', 'a59d86', deg);

  const st = regionStresses(p, s.pNP, s.sigmaAF, inputs.loadType, inputs.direction, s.moment);
  const thDeg = (th * 180) / Math.PI;

  // force arrows
  const arrows: JSX.Element[] = [];
  const loaded = s.loaded;
  const axial = s.load;
  const topY = P.y - VB_H * S - 14;
  if (loaded && Math.abs(axial) > 1) {
    const down = axial > 0;
    [-0.3, 0, 0.3].forEach((f, i) => {
      const x = P.x + f * wVB;
      const y1 = down ? topY - 34 : topY;
      const y2 = down ? topY : topY - 34;
      arrows.push(<line key={`a${i}`} x1={x} y1={y1} x2={x} y2={y2} stroke={accent} strokeWidth={3} markerEnd={`url(#arrow-${uid})`} />);
    });
    arrows.push(
      <text key="al" x={P.x - 0.3 * wVB - 12} y={topY - 12} textAnchor="end" className="viz-force-label" fill={accent}>
        {down ? 'Compression' : 'Tension'} {Math.abs(axial).toFixed(0)} N
      </text>,
    );
  }
  if (loaded && inputs.loadType === 'shear' && s.moment > 0) {
    const y = P.y - VB_H * S * 0.5;
    const x0 = shearDir < 0 ? P.x + wVB / 2 + 60 : P.x - wVB / 2 - 60;
    const x1 = shearDir < 0 ? P.x + wVB / 2 + 12 : P.x - wVB / 2 - 12;
    arrows.push(<line key="sh" x1={x0} y1={y} x2={x1} y2={y} stroke={accent} strokeWidth={3} markerEnd={`url(#arrow-${uid})`} />);
    arrows.push(<text key="shl" x={Math.min(x0, x1)} y={y - 10} className="viz-force-label" fill={accent}>Shear {s.moment.toFixed(0)} N</text>);
  }
  if (loaded && bend && s.moment > 0) {
    // Curved moment arrow above the upper vertebra; it ends pointing down on the side that closes.
    const r0 = wVB * 0.38;
    const yA = topY - 44; // above the compression arrows
    const closesLeft = sign < 0; // flexion (and lateral bend) close the left side
    const from = { x: P.x + (closesLeft ? r0 : -r0), y: yA };
    const to = { x: P.x + (closesLeft ? -r0 : r0), y: yA };
    arrows.push(
      <path
        key="bm"
        d={`M ${from.x} ${from.y} A ${r0} 26 0 0 ${closesLeft ? 0 : 1} ${to.x} ${to.y}`}
        fill="none"
        stroke={accent}
        strokeWidth={3}
        markerEnd={`url(#arrow-${uid})`}
      />,
    );
    arrows.push(
      <text key="bml" x={P.x} y={topY - 78} textAnchor="middle" className="viz-force-label" fill={accent}>
        {inputs.direction === 'flexion' ? 'Flexion' : inputs.direction === 'extension' ? 'Extension' : 'Lateral bend'} {s.moment.toFixed(1)} N·m
      </text>,
    );
  }

  // ---------- Axial inset ----------
  const IX = compact ? 600 : 615;
  const IR = compact ? 62 : 72;
  // Leave a fixed band above the ring for the title and the "Anterior" label.
  const IY = compact ? 128 : 134;
  const insetScale = IR / p.r;
  // Bulge is drawn in the inset too, capped so the ring can never reach the "Anterior" label.
  const INSET_BULGE_MAX = 9;
  const bulgeInset = Math.min(INSET_BULGE_MAX, s.bulge * V * insetScale);
  const npR = IR * Math.sqrt(Math.max(p.phi, 0.02));
  const twist = inputs.loadType === 'torsion' ? (inputs.direction === 'right' ? 1 : -1) * s.angle * V : 0;
  const rings = 5;

  return (
    <svg className="viz-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Disc illustration${label ? `: ${label}` : ''}`}>
      <defs>
        <marker id={`arrow-${uid}`} viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={accent} />
        </marker>
        <linearGradient id={`bone-${uid}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#f6efe0" />
          <stop offset="1" stopColor="#e6d8bd" />
        </linearGradient>
        <radialGradient id={`np-${uid}`} cx="0.4" cy="0.35" r="0.75">
          <stop offset="0" stopColor="#ffffff" stopOpacity={0.55 * (1 - deg)} />
          <stop offset="0.35" stopColor={npFill} stopOpacity="0.9" />
          <stop offset="1" stopColor={npFill} stopOpacity="1" />
        </radialGradient>
        <linearGradient id={`stress-${uid}`} gradientUnits="userSpaceOnUse" x1={BL.x - 10} x2={BR.x + 10} y1="0" y2="0">
          <stop offset="0" stopColor={stressColor(st.outerAntAF)} />
          <stop offset="0.2" stopColor={stressColor(st.innerAntAF)} />
          <stop offset="0.5" stopColor={stressColor((st.innerAntAF + st.innerPostAF) / 2)} />
          <stop offset="0.8" stopColor={stressColor(st.innerPostAF)} />
          <stop offset="1" stopColor={stressColor(st.outerPostAF)} />
        </linearGradient>
        <pattern id={`trab-${uid}`} width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
          <line x1="0" y1="0" x2="0" y2="14" stroke="#d8c7a5" strokeWidth="1" opacity="0.45" />
        </pattern>
        <filter id={`shadow-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.10" />
        </filter>
      </defs>

      {label && (
        <text x={20} y={26} className="viz-cond-label" fill={accent}>
          {label}
        </text>
      )}
      <text x={20} y={label ? 50 : 24} className="viz-view-label">{lateral ? 'Coronal view (front)' : 'Sagittal view (side)'}</text>

      {/* undeformed reference outline */}
      <rect x={cx - w / 2} y={yB - h0px} width={w} height={h0px} fill="none" stroke="#9aa3ad" strokeDasharray="5 5" strokeWidth={1.2} rx={4} />

      {/* lower vertebra (fixed) */}
      <g filter={`url(#shadow-${uid})`}>
        <rect x={cx - wVB / 2} y={yB + EP * S} width={wVB} height={VB_H * S} rx={16} fill={`url(#bone-${uid})`} stroke="#cdb994" strokeWidth={2} />
        <rect x={cx - wVB / 2} y={yB + EP * S} width={wVB} height={VB_H * S} rx={16} fill={`url(#trab-${uid})`} />
        <rect x={cx - w / 2} y={yB} width={w} height={EP * S} fill="#dfe9f1" stroke="#c4d3df" strokeWidth={0.8} />
      </g>

      {/* disc */}
      <path d={discPath} fill={showStress ? `url(#stress-${uid})` : afFill} stroke={mix('8aaed3', 'a89f86', deg)} strokeWidth={1.6} style={{ transition: 'fill 0.3s' }} />
      {!showStress && (
        <g fill="none" stroke={lamStroke} strokeWidth={1.1} opacity={0.75}>
          {[...lam(-1), ...lam(1)].map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
      )}
      {/* fissure */}
      {fissure > 0.02 && (
        <path
          d={`M ${npC.x + npRx * 0.9} ${npC.y} l ${(BR.x - npC.x - npRx) * Math.min(1, fissure) * 0.35} -3 l ${(BR.x - npC.x - npRx) * Math.min(1, fissure) * 0.35} 4 l ${(BR.x - npC.x - npRx) * Math.min(1, fissure) * 0.3} -2`}
          fill="none"
          stroke="#8a4b3a"
          strokeWidth={1.6}
          opacity={0.8}
        />
      )}
      {/* herniated nucleus extrusion (posterior) */}
      {extrude > 0 && (
        <g>
          <path
            d={`M ${npC.x + npRx * 0.7} ${npC.y - npRy * 0.35} Q ${BR.x + 2 * bR + 30 * extrude} ${npC.y - npRy * 0.7} ${BR.x + 2 * bR + 26 * extrude + 10} ${npC.y} Q ${BR.x + 2 * bR + 30 * extrude} ${npC.y + npRy * 0.7} ${npC.x + npRx * 0.7} ${npC.y + npRy * 0.35} Z`}
            fill={showStress ? stressColor(st.np) : npFill}
            opacity={0.92}
          />
        </g>
      )}
      {/* Schmorl's node: the nucleus flows vertically through the endplate into the vertebra below,
          drawn the same way as the posterior herniation (one shape starting inside the nucleus).
          Lower vertebra because Newell et al. (2017) report endplate failure is more common in the
          weaker cranial bony endplate, i.e. the upper surface of a vertebral body. */}
      {schmorl &&
        (() => {
          const x0 = npC.x;
          const top = yB + EP * S; // bone surface below the cartilage endplate
          const depth = (5 + 10 * p.nucleusLoss) * S;
          const bottom = top + depth;
          const lobe = Math.max(9, wNP * (0.16 + 0.2 * p.nucleusLoss));
          const neck = lobe * 0.45;
          const nTop = Math.min(npRx * 0.55, lobe * 1.2);
          const d = [
            `M ${x0 - nTop} ${npC.y}`,
            `C ${x0 - nTop * 0.6} ${yB} ${x0 - neck} ${yB} ${x0 - neck} ${top + depth * 0.15}`,
            `C ${x0 - neck - lobe * 0.8} ${top + depth * 0.35} ${x0 - lobe} ${bottom} ${x0} ${bottom}`,
            `C ${x0 + lobe} ${bottom} ${x0 + neck + lobe * 0.8} ${top + depth * 0.35} ${x0 + neck} ${top + depth * 0.15}`,
            `C ${x0 + neck} ${yB} ${x0 + nTop * 0.6} ${yB} ${x0 + nTop} ${npC.y}`,
            'Z',
          ].join(' ');
          return (
            <g>
              <path d={d} fill={showStress ? stressColor(st.np) : npFill} opacity={0.92} />
              {!compact && (
                <Leader x1={x0 + lobe * 0.7} y1={top + depth * 0.65} x2={cx + wVB / 2 + 34} y2={top + 115} text="Schmorl's node" />
              )}
            </g>
          );
        })()}
      <ellipse
        cx={npC.x}
        cy={npC.y}
        rx={npRx}
        ry={npRy}
        transform={`rotate(${thDeg / 2} ${npC.x} ${npC.y})`}
        fill={showStress ? stressColor(st.np) : `url(#np-${uid})`}
        stroke={showStress ? 'none' : mix('2a6fc4', '8c97a3', deg)}
        strokeOpacity={1 - deg * 0.7}
        strokeWidth={1.2}
      />

      {/* upper vertebra (moves) */}
      <g transform={`translate(${P.x} ${P.y}) rotate(${thDeg})`} filter={`url(#shadow-${uid})`}>
        <rect x={-w / 2} y={-EP * S} width={w} height={EP * S} fill="#dfe9f1" stroke="#c4d3df" strokeWidth={0.8} />
        <rect x={-wVB / 2} y={-EP * S - VB_H * S} width={wVB} height={VB_H * S} rx={16} fill={`url(#bone-${uid})`} stroke="#cdb994" strokeWidth={2} />
        <rect x={-wVB / 2} y={-EP * S - VB_H * S} width={wVB} height={VB_H * S} rx={16} fill={`url(#trab-${uid})`} />
      </g>
      <line x1={cx - wVB / 2 - 6} x2={cx + wVB / 2 + 6} y1={yB - h0px - EP * S} y2={yB - h0px - EP * S} stroke="#9aa3ad" strokeDasharray="5 5" strokeWidth={1} />

      {arrows}

      {/* anatomical labels */}
      {!compact && (
        <g className="viz-labels">
          <Leader x1={cx + wVB / 2 - 20} y1={yB + 70} x2={cx + wVB / 2 + 34} y2={yB + 70} text="Vertebral body" />
          <Leader x1={BR.x - 12} y1={yB + EP * S * 0.5} x2={cx + wVB / 2 + 34} y2={yB + 34} text="Cartilage endplate" />
          <Leader x1={BR.x - 18} y1={(yB + TR.y) / 2 + 4} x2={cx + wVB / 2 + 34} y2={(yB + TR.y) / 2 + 4} text="Annulus fibrosus" />
          <Leader x1={npC.x + npRx * 0.3} y1={npC.y - npRy * 0.5} x2={cx + wVB / 2 + 34} y2={P.y - 22} text="Nucleus pulposus" />
        </g>
      )}
      <text x={cx - wVB / 2} y={yB + EP * S + VB_H * S + 26} className="viz-dir-label">◀ {leftName}</text>
      <text x={cx + wVB / 2} y={yB + EP * S + VB_H * S + 26} textAnchor="end" className="viz-dir-label">{rightName} ▶</text>

      {/* ---------- axial inset ---------- */}
      <g>
        <rect x={IX - IR - 22} y={IY - IR - 60} width={2 * IR + 44} height={2 * IR + 102} rx={16} fill="#fafafc" stroke="#e8e8ed" />
        <text x={IX} y={IY - IR - 40} textAnchor="middle" className="viz-view-label">Top view (axial)</text>
        <text x={IX} y={IY - IR - INSET_BULGE_MAX - 8} textAnchor="middle" className="viz-mini">Anterior</text>
        <circle cx={IX} cy={IY} r={IR + bulgeInset} fill={showStress ? stressColor(st.outerAntAF) : afFill} stroke={mix('8aaed3', 'a89f86', deg)} strokeWidth={1.4} />
        {Array.from({ length: rings }, (_, k) => {
          const rr = npR + ((IR + bulgeInset - npR) * (k + 1)) / (rings + 1);
          return (
            <circle key={k} cx={IX} cy={IY} r={rr} fill="none" stroke={showStress ? 'rgba(255,255,255,0.5)' : lamStroke} strokeWidth={0.9} opacity={0.7} />
          );
        })}
        {/* fibre hatches rotate with torsion (outer more than inner: shear strain ∝ radius) */}
        {Array.from({ length: 16 }, (_, i) => {
          const a = (i / 16) * 2 * Math.PI;
          return [0.55, 0.85].map((f, j) => {
            const rr = npR + (IR - npR) * f;
            const tw = twist * (rr / IR) * 6;
            const ang = a + tw;
            const x = IX + rr * Math.cos(ang);
            const y = IY + rr * Math.sin(ang);
            const lean = (j === 0 ? 1 : -1) * 0.52 + tw * 4;
            const dxh = 6 * Math.cos(ang + Math.PI / 2 + lean);
            const dyh = 6 * Math.sin(ang + Math.PI / 2 + lean);
            return <line key={`${i}-${j}`} x1={x - dxh} y1={y - dyh} x2={x + dxh} y2={y + dyh} stroke={lamStroke} strokeWidth={1.1} opacity={showStress ? 0.3 : 0.8} />;
          });
        })}
        {herniated && (
          <ellipse
            cx={IX + (npR + (IR - npR) * 0.9) * Math.cos(Math.PI / 3.2)}
            cy={IY + (npR + (IR - npR) * 0.9) * Math.sin(Math.PI / 3.2)}
            rx={8 + 14 * extrude}
            ry={6 + 9 * extrude}
            transform={`rotate(55 ${IX + (npR + (IR - npR) * 0.9) * Math.cos(Math.PI / 3.2)} ${IY + (npR + (IR - npR) * 0.9) * Math.sin(Math.PI / 3.2)})`}
            fill={npFill}
            opacity={0.95}
          />
        )}
        <circle cx={IX} cy={IY} r={npR} fill={showStress ? stressColor(st.np) : `url(#np-${uid})`} stroke={mix('2a6fc4', '8c97a3', deg)} strokeOpacity={1 - deg * 0.7} />
        {schmorl && (
          <g>
            <circle cx={IX} cy={IY} r={npR * (0.35 + 0.35 * p.nucleusLoss)} fill="none" stroke="#7a5c9e" strokeWidth={1.8} strokeDasharray="3 3" />
            <text x={IX} y={IY + 4} textAnchor="middle" className="viz-mini" fill="#5b3f80">node below</text>
          </g>
        )}
        {/* rotation marker on the upper vertebra */}
        {inputs.loadType === 'torsion' && (
          <g>
            <line x1={IX} y1={IY} x2={IX + (IR + 10) * Math.sin(twist * 6)} y2={IY - (IR + 10) * Math.cos(twist * 6)} stroke={accent} strokeWidth={2.5} strokeLinecap="round" />
            <line x1={IX} y1={IY} x2={IX} y2={IY - IR - 4} stroke="#9aa3ad" strokeDasharray="3 3" strokeWidth={1.2} />
            <text x={IX} y={IY + IR + 26} textAnchor="middle" className="viz-mini" fill={accent}>
              Twist {((s.angle * 180) / Math.PI).toFixed(2)}° {V > 1 ? `(drawn ${V * 6}×)` : '(drawn 6×)'}
            </text>
          </g>
        )}
        {inputs.loadType !== 'torsion' && (
          <text x={IX} y={IY + IR + 26} textAnchor="middle" className="viz-mini">Posterior</text>
        )}
      </g>
    </svg>
  );
}

function Leader({ x1, y1, x2, y2, text }: { x1: number; y1: number; x2: number; y2: number; text: string }) {
  return (
    <g>
      <circle cx={x1} cy={y1} r={2.5} fill="#6e6e73" />
      <polyline points={`${x1},${y1} ${x2 - 8},${y2} ${x2},${y2}`} fill="none" stroke="#a1a1a6" strokeWidth={1} />
      <text x={x2 + 4} y={y2 + 4} className="viz-anat-label">{text}</text>
    </g>
  );
}
