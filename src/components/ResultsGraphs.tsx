import { useMemo, useState } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { INFO } from '../data/glossary';
import type { SimResult, SimSample } from '../models/types';
import type { RelaxSample } from '../models/viscoelasticity';
import InfoTip from './InfoTip';

export function timeUnit(total: number): { unit: string; div: number } {
  if (total > 3 * 3600) return { unit: 'h', div: 3600 };
  if (total > 180) return { unit: 'min', div: 60 };
  return { unit: 's', div: 1 };
}

/** Keep ≤ n points but always keep load/unload transitions. */
function downsample(s: SimSample[], n = 420) {
  if (s.length <= n) return s;
  const step = s.length / n;
  const out: SimSample[] = [];
  for (let i = 0; i < s.length; i++) {
    const keep = Math.floor(i / step) !== Math.floor((i - 1) / step) || (i > 0 && s[i].loaded !== s[i - 1].loaded) || i === s.length - 1;
    if (keep) out.push(s[i]);
  }
  return out;
}

interface Series {
  key: string;
  name: string;
  color: string;
  dashed?: boolean;
}

interface GraphDef {
  id: string;
  title: string;
  unit: string;
  info: keyof typeof INFO;
  illustrative?: boolean;
  value: (s: SimSample) => number;
  min?: (s: SimSample) => number;
  digits: number;
}

const GRAPHS: GraphDef[] = [
  { id: 'height', title: 'Disc height', unit: 'mm', info: 'height', value: (s) => s.height, min: (s) => s.height + (s.disp - s.dispMin), digits: 2 },
  { id: 'strain', title: 'Axial strain', unit: '%', info: 'strain', value: (s) => s.strain * 100, min: (s) => s.strainMin * 100, digits: 1 },
  { id: 'pressure', title: 'Nucleus pressure', unit: 'MPa', info: 'pressure', value: (s) => s.pNP, min: (s) => s.pNPMin, digits: 2 },
  { id: 'hydration', title: 'Hydration index', unit: '%', info: 'hydration', illustrative: true, value: (s) => s.hydration * 100, digits: 1 },
];

export interface GraphRun {
  label: string;
  color: string;
  result: SimResult;
  current: SimSample;
}

export default function ResultsGraphs({ runs, t, cyclic }: { runs: GraphRun[]; t: number; cyclic: boolean }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const total = runs[0].result.totalTime;
  const { unit, div } = timeUnit(total);

  const data = useMemo(() => {
    const base = downsample(runs[0].result.samples);
    return base.map((b) => {
      const row: Record<string, number> = { t: b.t / div };
      runs.forEach((r, ri) => {
        const s = ri === 0 ? b : nearest(r.result.samples, b.t);
        GRAPHS.forEach((g) => {
          row[`${g.id}_${ri}`] = g.value(s);
          if (g.min) row[`${g.id}_${ri}_min`] = g.min(s);
        });
      });
      return row;
    });
  }, [runs, div]);

  return (
    <div className="graphs">
      {GRAPHS.map((g) => {
        const series: Series[] = runs.flatMap((r, ri) => {
          const main: Series = { key: `${g.id}_${ri}`, name: runs.length > 1 ? r.label : g.title, color: r.color };
          return cyclic && g.min ? [main, { key: `${g.id}_${ri}_min`, name: `${r.label} (cycle low)`, color: r.color, dashed: true }] : [main];
        });
        const isExp = expanded === g.id;
        return (
          <div key={g.id} className={`card graph-card ${isExp ? 'expanded' : ''}`} onClick={() => setExpanded(isExp ? null : g.id)}>
            <div className="graph-head">
              <div>
                <div className="graph-title">
                  {g.title} <InfoTip id={g.info} />
                  {g.illustrative && <span className="tag">Illustrative</span>}
                </div>
                <div style={{ display: 'flex', gap: 16, alignItems: 'baseline', flexWrap: 'wrap' }}>
                  {runs.map((r) => (
                    <div key={r.label} className="graph-value" style={{ color: runs.length > 1 ? r.color : undefined }}>
                      {g.value(r.current).toFixed(g.digits)}
                      <small>{g.unit}</small>
                    </div>
                  ))}
                </div>
              </div>
              <div className="graph-delta">{isExp ? 'Click to shrink' : 'Click to expand'}</div>
            </div>
            <ResponsiveContainer width="100%" height={isExp ? 320 : 180}>
              <LineChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: -8 }}>
                <CartesianGrid stroke="#ececf0" vertical={false} />
                <XAxis
                  dataKey="t"
                  type="number"
                  domain={[0, total / div]}
                  tickFormatter={(v: number) => (v >= 10 ? v.toFixed(0) : v.toFixed(1))}
                  tick={{ fontSize: 11, fill: '#86868b' }}
                  stroke="#d2d2d7"
                  label={{ value: `Time (${unit})`, position: 'insideBottomRight', offset: -2, fontSize: 11, fill: '#86868b' }}
                  height={34}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#86868b' }}
                  stroke="#d2d2d7"
                  width={52}
                  domain={['auto', 'auto']}
                  tickFormatter={(v: number) => v.toFixed(g.digits > 1 ? 1 : 0)}
                />
                <Tooltip
                  formatter={(v: number, name: string) => [`${v.toFixed(g.digits)} ${g.unit}`, name]}
                  labelFormatter={(v: number) => `t = ${Number(v).toFixed(2)} ${unit}`}
                  contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 6px 24px rgba(0,0,0,0.12)', fontSize: 12 }}
                />
                {runs.length > 1 && <Legend iconType="plainline" wrapperStyle={{ fontSize: 12 }} />}
                {series.map((sr) => (
                  <Line
                    key={sr.key}
                    dataKey={sr.key}
                    name={sr.name}
                    stroke={sr.color}
                    strokeWidth={sr.dashed ? 1.2 : 2.4}
                    strokeDasharray={sr.dashed ? '4 3' : undefined}
                    strokeOpacity={sr.dashed ? 0.6 : 1}
                    dot={false}
                    isAnimationActive={false}
                    legendType={sr.dashed ? 'none' : 'plainline'}
                  />
                ))}
                <ReferenceLine x={t / div} stroke="#1d1d1f" strokeWidth={1.2} strokeOpacity={0.55} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
      })}
    </div>
  );
}

function nearest(s: SimSample[], t: number) {
  let lo = 0;
  let hi = s.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (s[mid].t <= t) lo = mid;
    else hi = mid;
  }
  return t - s[lo].t < s[hi].t - t ? s[lo] : s[hi];
}

/** Graphs for the tissue-level stress-relaxation preset (Ellingson & Nuckley 2012). */
export function RelaxationGraphs({ runs, t }: { runs: { label: string; color: string; samples: RelaxSample[] }[]; t: number }) {
  const base = runs[0].samples;
  const data = base
    .map((s, i) => {
      const row: Record<string, number> = { logt: s.t };
      runs.forEach((r, ri) => {
        const x = r.samples[i];
        row[`sig_${ri}`] = x.sigmaNP;
        row[`gNP_${ri}`] = x.gNP;
        row[`gAnt_${ri}`] = x.gAntAF;
        row[`gLat_${ri}`] = x.gLatAF;
      });
      return row;
    })
    .filter((r) => r.logt > 0);
  const idx = base.reduce((b, s, i) => (Math.abs(s.t - t) < Math.abs(base[b].t - t) ? i : b), 0);
  const multi = runs.length > 1;
  const axis = { tick: { fontSize: 11, fill: '#86868b' }, stroke: '#d2d2d7' };
  const xAxis = (
    <XAxis dataKey="logt" type="number" scale="log" domain={[0.1, 1800]} ticks={[0.1, 1, 10, 100, 1000]} {...axis} height={34}
      label={{ value: 'Time (s, log)', position: 'insideBottomRight', offset: -2, fontSize: 11, fill: '#86868b' }} />
  );
  const tip = { borderRadius: 12, border: 'none', fontSize: 12 };
  return (
    <div className="graphs">
      <div className="card graph-card" style={{ cursor: 'default' }}>
        <div className="graph-head">
          <div>
            <div className="graph-title">Nucleus stress, held strain <InfoTip id="relaxation" /></div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {runs.map((r) => (
                <div key={r.label} className="graph-value" style={{ color: multi ? r.color : undefined }}>
                  {(r.samples[idx].sigmaNP * 1000).toFixed(1)}<small>kPa</small>
                </div>
              ))}
            </div>
          </div>
          <div className="graph-delta">
            Equilibrium {runs.map((r) => (r.samples[r.samples.length - 1].sigmaNP * 1000).toFixed(1)).join(' / ')} kPa
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: -8 }}>
            <CartesianGrid stroke="#ececf0" vertical={false} />
            {xAxis}
            <YAxis {...axis} width={52} tickFormatter={(v: number) => (v * 1000).toFixed(0)} domain={['auto', 'auto']} />
            <Tooltip formatter={(v: number, n: string) => [`${(v * 1000).toFixed(1)} kPa`, n]} labelFormatter={(v: number) => `t = ${Number(v).toFixed(1)} s`} contentStyle={tip} />
            {multi && <Legend iconType="plainline" wrapperStyle={{ fontSize: 12 }} />}
            {runs.map((r, ri) => (
              <Line key={ri} dataKey={`sig_${ri}`} name={r.label} stroke={r.color} strokeWidth={2.4} dot={false} isAnimationActive={false} />
            ))}
            {t > 0.1 && <ReferenceLine x={Math.max(0.1, t)} stroke="#1d1d1f" strokeOpacity={0.55} />}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="card graph-card" style={{ cursor: 'default' }}>
        <div className="graph-head">
          <div>
            <div className="graph-title">Normalized relaxation G(t){multi ? ', nucleus' : ' by region'}</div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {runs.map((r) => (
                <div key={r.label} className="graph-value" style={{ color: multi ? r.color : undefined }}>
                  {r.samples[idx].gNP.toFixed(3)}<small>NP</small>
                </div>
              ))}
            </div>
          </div>
          <div className="graph-delta">G = force ÷ equilibrium force</div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: -8 }}>
            <CartesianGrid stroke="#ececf0" vertical={false} />
            {xAxis}
            <YAxis {...axis} width={52} domain={[1, 'auto']} tickFormatter={(v: number) => v.toFixed(2)} />
            <Tooltip formatter={(v: number, n: string) => [v.toFixed(3), n]} labelFormatter={(v: number) => `t = ${Number(v).toFixed(1)} s`} contentStyle={tip} />
            <Legend iconType="plainline" wrapperStyle={{ fontSize: 12 }} />
            {multi
              ? runs.map((r, ri) => (
                  <Line key={ri} dataKey={`gNP_${ri}`} name={`${r.label} nucleus`} stroke={r.color} strokeWidth={2.4} dot={false} isAnimationActive={false} />
                ))
              : [
                  <Line key="n" dataKey="gNP_0" name="Nucleus (posterior)" stroke={runs[0].color} strokeWidth={2.4} dot={false} isAnimationActive={false} />,
                  <Line key="a" dataKey="gAnt_0" name="Anterior annulus" stroke="#30b0c7" strokeWidth={2} dot={false} isAnimationActive={false} />,
                  <Line key="l" dataKey="gLat_0" name="Lateral annulus" stroke="#8e8e93" strokeWidth={2} strokeDasharray="5 3" dot={false} isAnimationActive={false} />,
                ]}
            {t > 0.1 && <ReferenceLine x={Math.max(0.1, t)} stroke="#1d1d1f" strokeOpacity={0.55} />}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
