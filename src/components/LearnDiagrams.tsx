// Diagrams for the Learn page. Where possible they reuse the simulation model so that
// what students read matches what they see in the Simulation.

import { useMemo } from 'react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { DiagramId } from '../data/learnContent';
import { buildParams } from '../models/discParameters';
import { loadSharing } from '../models/mechanics';
import { simulate } from '../models/simulate';
import type { DiscParams, LoadInputs, SimSample } from '../models/types';
import DiscVisualization from './DiscVisualization';

const BLUE = '#0071e3';
const TEAL = '#30b0c7';
const GRAY = '#86868b';

const REST: LoadInputs = {
  loadType: 'compression', direction: 'axial', magnitude: 0, preload: 0,
  duration: 60, frequencyMode: 'single', repeats: 1, frequencyHz: 0.5, recovery: 0,
};

function restSample(p: DiscParams): SimSample {
  return { ...simulate(p, REST, 10).samples[0], loaded: false };
}

const healthy = () => buildParams({ condition: 'healthy', severity: 0, nucleusLoss: 0 });
const severe = () => buildParams({ condition: 'degenerated', severity: 1, nucleusLoss: 0 });

export default function LearnDiagram({ id }: { id: DiagramId }) {
  switch (id) {
    case 'overview':
    case 'anatomy':
      return <AnatomyDiagram />;
    case 'lamellae':
      return <LamellaeDiagram />;
    case 'nucleus':
      return <PostureBars />;
    case 'composition':
      return <CompositionBars />;
    case 'hydration':
      return <HydrationDiagram />;
    case 'loadSharing':
      return <LoadShareBars />;
    case 'creep':
      return <CreepDiagram />;
    case 'loadModes':
      return <LoadModes />;
    case 'degeneration':
      return <DegenerationPair />;
    case 'herniation':
      return <HerniationStages />;
    case 'mechanobiology':
      return <MechanoLoop />;
  }
}

function AnatomyDiagram() {
  const p = useMemo(healthy, []);
  return <DiscVisualization params={p} sample={restSample(p)} inputs={REST} visualScale={1} showStress={false} showDamage={false} />;
}

function DegenerationPair() {
  const h = useMemo(healthy, []);
  const d = useMemo(severe, []);
  return (
    <div className="learn-pair">
      <DiscVisualization params={h} sample={restSample(h)} inputs={REST} visualScale={1} showStress={false} showDamage={false} label="Healthy" compact accent={BLUE} />
      <DiscVisualization params={d} sample={restSample(d)} inputs={REST} visualScale={1} showStress={false} showDamage={false} label="Severely degenerated" compact accent={TEAL} />
    </div>
  );
}

function HerniationStages() {
  const d = useMemo(() => buildParams({ condition: 'degenerated', severity: 0.6, nucleusLoss: 0 }), []);
  const hz = useMemo(() => buildParams({ condition: 'herniated', severity: 0.7, nucleusLoss: 0.6 }), []);
  const h = useMemo(healthy, []);
  const sn = useMemo(() => buildParams({ condition: 'schmorl', severity: 0, nucleusLoss: 0.6 }), []);
  const stages = [
    { label: '1 · Intact', p: h, s: restSample(h), dmg: false },
    { label: '2 · Fissure', p: d, s: { ...restSample(d), damage: 0.7 }, dmg: true },
    { label: '3 · Herniated', p: hz, s: restSample(hz), dmg: false },
    { label: "Schmorl's node", p: sn, s: restSample(sn), dmg: false },
  ];
  return (
    <div className="learn-quad">
      {stages.map((st) => (
        <DiscVisualization key={st.label} params={st.p} sample={st.s} inputs={REST} visualScale={1} showStress={false} showDamage={st.dmg} label={st.label} compact accent={BLUE} />
      ))}
    </div>
  );
}

function LamellaeDiagram() {
  const cx = 200;
  const cy = 160;
  const rings = [140, 122, 104, 86, 68];
  return (
    <svg viewBox="0 0 640 320" className="learn-svg" role="img" aria-label="Annulus lamellae with alternating fibre angles">
      {rings.map((r, i) => (
        <circle key={r} cx={cx} cy={cy} r={r} fill={i % 2 ? '#dbe8f6' : '#cfe0f2'} stroke="#8aaed3" />
      ))}
      <circle cx={cx} cy={cy} r={52} fill="#3d8bef" opacity={0.85} />
      <text x={cx} y={cy + 5} textAnchor="middle" fill="#fff" fontSize="14" fontWeight="600">Nucleus</text>
      {/* unrolled lamellae showing alternating fibres */}
      {[0, 1, 2].map((k) => (
        <g key={k} transform={`translate(390 ${60 + k * 72})`}>
          <rect width="220" height="56" rx="8" fill={k % 2 ? '#dbe8f6' : '#cfe0f2'} stroke="#8aaed3" />
          {Array.from({ length: 9 }, (_, i) => (
            <line key={i} x1={10 + i * 24} y1={50} x2={10 + i * 24 + (k % 2 ? -28 : 28)} y2={6} stroke="#2a6fc4" strokeWidth={2} opacity={0.7} />
          ))}
          <text x={228} y={34} fontSize="13" fill="#1d1d1f">{k % 2 ? '−30°' : '+30°'}</text>
        </g>
      ))}
      <text x={390} y={40} fontSize="13" fill={GRAY}>Three neighbouring lamellae, unrolled</text>
      <path d="M 345 160 L 380 160" stroke={GRAY} markerEnd="url(#lm-arrow)" />
      <defs>
        <marker id="lm-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10z" fill={GRAY} /></marker>
      </defs>
    </svg>
  );
}

function Bars({ rows, max, unit, title }: { rows: { label: string; lo: number; hi: number; color: string }[]; max: number; unit: string; title: string }) {
  const W = 640;
  const left = 150;
  const bw = W - left - 60;
  return (
    <svg viewBox={`0 0 ${W} ${rows.length * 56 + 50}`} className="learn-svg" role="img" aria-label={title}>
      {rows.map((r, i) => {
        const y = 20 + i * 56;
        return (
          <g key={r.label}>
            <text x={left - 12} y={y + 22} textAnchor="end" fontSize="14" fill="#1d1d1f">{r.label}</text>
            <rect x={left} y={y + 6} width={bw} height={24} rx={12} fill="#f0f0f3" />
            <rect x={left + (r.lo / max) * bw} y={y + 6} width={Math.max(6, ((r.hi - r.lo) / max) * bw)} height={24} rx={12} fill={r.color} />
            <text x={left + (r.hi / max) * bw + 8} y={y + 23} fontSize="13" fill={GRAY}>{r.lo === r.hi ? r.hi : `${r.lo}–${r.hi}`} {unit}</text>
          </g>
        );
      })}
      <text x={left} y={rows.length * 56 + 42} fontSize="12" fill={GRAY}>{title}</text>
    </svg>
  );
}

function PostureBars() {
  return (
    <Bars
      title="Bars show measured ranges (kPa). Wilke 1999 and others, via Newell et al. 2017."
      unit="kPa"
      max={2500}
      rows={[
        { label: 'Lying', lo: 91, hi: 539, color: '#9cc3f0' },
        { label: 'Standing', lo: 500, hi: 870, color: '#4a90d9' },
        { label: 'Sitting', lo: 460, hi: 1330, color: '#2a6fc4' },
        { label: 'Lifting 20 kg', lo: 2300, hi: 2300, color: '#08306b' },
      ]}
    />
  );
}

function CompositionBars() {
  const segs = [
    { name: 'Nucleus', parts: [{ k: 'Proteoglycan', v: 50, c: BLUE }, { k: 'Collagen', v: 12.5, c: '#ff9f0a' }, { k: 'Other', v: 37.5, c: '#d2d2d7' }] },
    { name: 'Annulus', parts: [{ k: 'Proteoglycan', v: 20, c: BLUE }, { k: 'Collagen', v: 60, c: '#ff9f0a' }, { k: 'Elastin', v: 2, c: TEAL }, { k: 'Other', v: 18, c: '#d2d2d7' }] },
  ];
  const left = 110;
  const bw = 470;
  return (
    <svg viewBox="0 0 640 210" className="learn-svg" role="img" aria-label="Dry-weight composition of nucleus and annulus">
      {segs.map((s, i) => {
        let x = left;
        return (
          <g key={s.name} transform={`translate(0 ${20 + i * 70})`}>
            <text x={left - 12} y={26} textAnchor="end" fontSize="14" fontWeight="600">{s.name}</text>
            {s.parts.map((pt) => {
              const w = (pt.v / 100) * bw;
              const el = (
                <g key={pt.k}>
                  <rect x={x} y={8} width={w} height={28} fill={pt.c} />
                  {w > 50 && <text x={x + w / 2} y={27} textAnchor="middle" fontSize="12" fill={pt.c === '#d2d2d7' ? '#1d1d1f' : '#fff'}>{pt.k} {pt.v}%</text>}
                </g>
              );
              x += w;
              return el;
            })}
          </g>
        );
      })}
      <text x={left} y={190} fontSize="12" fill={GRAY}>Nucleus: PG 35–65%, collagen II 5–20%. Annulus: PG ≈20%, collagen 50–70%, elastin ≈2%. Midpoints shown.</text>
    </svg>
  );
}

function HydrationDiagram() {
  return (
    <svg viewBox="0 0 640 260" className="learn-svg" role="img" aria-label="Fluid flow out under load and in by osmosis">
      <defs>
        <marker id="hy-a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10z" fill={BLUE} /></marker>
        <marker id="hy-b" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10z" fill={TEAL} /></marker>
      </defs>
      {[{ x: 160, title: 'Daytime loading', out: true }, { x: 480, title: 'Rest / sleep', out: false }].map((g) => (
        <g key={g.title}>
          <text x={g.x} y={28} textAnchor="middle" fontSize="15" fontWeight="600">{g.title}</text>
          <rect x={g.x - 110} y={g.out ? 110 : 96} width={220} height={g.out ? 52 : 80} rx={22} fill="#cfe0f2" stroke="#8aaed3" />
          <ellipse cx={g.x} cy={g.out ? 136 : 136} rx={60} ry={g.out ? 16 : 26} fill="#3d8bef" opacity={0.85} />
          {[-1, 1].map((sd) => (
            <line key={sd} x1={g.out ? g.x + sd * 120 : g.x + sd * 175} y1={136} x2={g.out ? g.x + sd * 175 : g.x + sd * 122} y2={136} stroke={g.out ? BLUE : TEAL} strokeWidth={3} markerEnd={`url(#${g.out ? 'hy-a' : 'hy-b'})`} />
          ))}
          {g.out && [-60, 0, 60].map((dx) => <line key={dx} x1={g.x + dx} y1={58} x2={g.x + dx} y2={100} stroke={BLUE} strokeWidth={3} markerEnd="url(#hy-a)" />)}
          <text x={g.x} y={212} textAnchor="middle" fontSize="13" fill="#1d1d1f">{g.out ? 'Load pushes water out → height falls' : 'Proteoglycans draw water in → height recovers'}</text>
          <text x={g.x} y={232} textAnchor="middle" fontSize="12" fill={GRAY}>{g.out ? 'fast: minutes to hours' : '3–4× slower than loading'}</text>
        </g>
      ))}
    </svg>
  );
}

function LoadShareBars() {
  const h = loadSharing(healthy(), 1000);
  const d = loadSharing(severe(), 1000);
  const rows = [
    { label: 'Healthy', np: h.npShare, p: h.pNP },
    { label: 'Severely degenerated', np: d.npShare, p: d.pNP },
  ];
  return (
    <svg viewBox="0 0 640 190" className="learn-svg" role="img" aria-label="Nucleus and annulus share of axial load">
      {rows.map((r, i) => {
        const y = 24 + i * 70;
        const w = 420;
        return (
          <g key={r.label}>
            <text x={180} y={y + 22} textAnchor="end" fontSize="14" fontWeight="600">{r.label}</text>
            <rect x={190} y={y + 4} width={w * r.np} height={28} fill={BLUE} rx={4} />
            <rect x={190 + w * r.np} y={y + 4} width={w * (1 - r.np)} height={28} fill="#c9b99a" rx={4} />
            <text x={196} y={y + 23} fontSize="12" fill="#fff">{r.np > 0.12 ? `NP ${(r.np * 100).toFixed(0)}%` : ''}</text>
            <text x={190 + w - 6} y={y + 23} textAnchor="end" fontSize="12" fill="#1d1d1f">AF {((1 - r.np) * 100).toFixed(0)}%</text>
            <text x={190} y={y + 50} fontSize="12" fill={GRAY}>Nucleus pressure at 1000 N: {r.p.toFixed(2)} MPa</text>
          </g>
        );
      })}
      <text x={190} y={180} fontSize="11.5" fill={GRAY}>DISC LAB two-column model (aggregate moduli via Ellingson & Nuckley 2012).</text>
    </svg>
  );
}

function CreepDiagram() {
  const data = useMemo(() => {
    const inp: LoadInputs = { ...REST, magnitude: 1000, duration: 4 * 3600, recovery: 20 * 3600 };
    const a = simulate(healthy(), inp, 600).samples;
    const b = simulate(severe(), inp, 600).samples;
    return a.filter((_, i) => i % 3 === 0).map((s, i) => ({ t: s.t / 3600, h: s.strain * 100, d: b[i * 3]?.strain * 100 }));
  }, []);
  return (
    <div style={{ width: '100%', height: 260 }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 10, right: 16, bottom: 4, left: -6 }}>
          <CartesianGrid stroke="#ececf0" vertical={false} />
          <XAxis dataKey="t" type="number" domain={[0, 24]} ticks={[0, 4, 8, 12, 16, 20, 24]} tick={{ fontSize: 11, fill: GRAY }} label={{ value: 'Time (h): 4 h at 1000 N, then rest', position: 'insideBottomRight', offset: -2, fontSize: 11, fill: GRAY }} height={34} />
          <YAxis tick={{ fontSize: 11, fill: GRAY }} width={46} tickFormatter={(v: number) => `${v.toFixed(0)}%`} />
          <Tooltip formatter={(v: number, n: string) => [`${v.toFixed(1)}%`, n]} labelFormatter={(v: number) => `${Number(v).toFixed(1)} h`} contentStyle={{ borderRadius: 12, border: 'none', fontSize: 12 }} />
          <Legend iconType="plainline" wrapperStyle={{ fontSize: 12 }} />
          <Line dataKey="h" name="Healthy strain" stroke={BLUE} strokeWidth={2.4} dot={false} isAnimationActive={false} />
          <Line dataKey="d" name="Severely degenerated strain" stroke={TEAL} strokeWidth={2.4} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function LoadModes() {
  const modes = [
    { name: 'Compression', d: 'M40 20 v28 M30 38 l10 10 l10 -10', top: 0, rot: 0 },
    { name: 'Tension', d: 'M40 48 v-28 M30 30 l10 -10 l10 10', top: 0, rot: 0 },
    { name: 'Shear', d: 'M14 30 h50 M54 22 l10 8 l-10 8', top: 8, rot: 0 },
    { name: 'Bending', d: 'M18 34 q22 -26 44 0 M54 26 l8 8 l-10 4', top: 0, rot: -8 },
    { name: 'Torsion', d: 'M18 34 a22 10 0 1 0 44 0 M56 40 l6 -6 l4 8', top: 0, rot: 0 },
  ];
  return (
    <svg viewBox="0 0 640 170" className="learn-svg" role="img" aria-label="Five loading modes">
      {modes.map((m, i) => (
        <g key={m.name} transform={`translate(${20 + i * 124} 10)`}>
          <rect x={8} y={96} width={64} height={22} rx={8} fill="#e6d8bd" />
          <rect x={4} y={81} width={72} height={14} rx={7} fill="#cfe0f2" />
          <ellipse cx={40} cy={88} rx={18} ry={5} fill="#3d8bef" />
          <rect x={8 + m.top} y={58} width={64} height={22} rx={8} fill="#e6d8bd" transform={`rotate(${m.rot} 40 69)`} />
          <path d={m.d} fill="none" stroke={BLUE} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
          <text x={40} y={145} textAnchor="middle" fontSize="13" fontWeight="600">{m.name}</text>
        </g>
      ))}
    </svg>
  );
}

function MechanoLoop() {
  const nodes = [
    { x: 320, y: 40, t: 'Mechanical loading' },
    { x: 540, y: 150, t: 'Fluid flow, pressure & nutrient transport' },
    { x: 320, y: 260, t: 'Disc cells (anabolism / catabolism)' },
    { x: 100, y: 150, t: 'ECM composition & mechanical properties' },
  ];
  return (
    <svg viewBox="0 0 640 300" className="learn-svg" role="img" aria-label="Mechanobiology feedback loop">
      <defs>
        <marker id="mb-a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10z" fill={BLUE} /></marker>
      </defs>
      <ellipse cx={320} cy={150} rx={210} ry={105} fill="none" stroke="#c9dcf3" strokeWidth={2} strokeDasharray="6 6" />
      {[
        'M 400 52 Q 500 70 528 118',
        'M 520 186 Q 480 245 410 258',
        'M 230 258 Q 150 245 118 186',
        'M 110 116 Q 150 60 240 46',
      ].map((d) => (
        <path key={d} d={d} fill="none" stroke={BLUE} strokeWidth={2.5} markerEnd="url(#mb-a)" />
      ))}
      {nodes.map((n) => (
        <g key={n.t}>
          <rect x={n.x - 92} y={n.y - 22} width={184} height={44} rx={14} fill="#fff" stroke="#d2d2d7" />
          <foreignObject x={n.x - 88} y={n.y - 20} width={176} height={40}>
            <div className="mb-node">{n.t}</div>
          </foreignObject>
        </g>
      ))}
    </svg>
  );
}
