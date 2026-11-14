import { useMemo, useState } from 'react';
import CompareResults from '../components/CompareResults';
import DiscVisualization from '../components/DiscVisualization';
import ForceControls, { type TestMode } from '../components/ForceControls';
import InfoTip from '../components/InfoTip';
import PlaybackBar, { SPEEDS, useSimClock } from '../components/PlaybackBar';
import Readouts, { readoutItems } from '../components/Readouts';
import ResultsGraphs, { RelaxationGraphs } from '../components/ResultsGraphs';
import { CREEP_TEST, DEFAULT_INPUTS, PRESETS } from '../data/presets';
import { buildParams, describeParams } from '../models/discParameters';
import { buildSegments, sampleAt, simulate } from '../models/simulate';
import type { Condition, DiscParams, DiscSelection, LoadInputs, SimResult, SimSample } from '../models/types';
import { relaxationTest, type RelaxSample } from '../models/viscoelasticity';

export const HEALTHY_COLOR = '#0071e3';
export const DEGEN_COLOR = '#30b0c7';
const RELAX_END = 1800;

const CONDITIONS: { id: Condition; label: string; dot: string }[] = [
  { id: 'healthy', label: 'Healthy', dot: '#34c759' },
  { id: 'degenerated', label: 'Degenerated', dot: '#ff9f0a' },
  { id: 'herniated', label: 'Herniated', dot: '#ff453a' },
  { id: 'schmorl', label: "Schmorl's node", dot: '#af52de' },
];

function autoSpeed(total: number) {
  return SPEEDS.find((s) => total / s <= 90) ?? SPEEDS[SPEEDS.length - 1];
}

interface Run {
  params: DiscParams;
  result: SimResult;
  relax: RelaxSample[];
}

/** Sample shown at time t; in the relaxation preset the strain is held and stress decays. */
function currentSample(run: Run, t: number, isRelax: boolean, relaxStrain: number): SimSample {
  if (!isRelax) return sampleAt(run.result, t);
  const r = run.relax.reduce((b, s) => (Math.abs(s.t - t) < Math.abs(b.t - t) ? s : b), run.relax[0]);
  const p = run.params;
  const disp = relaxStrain * p.h0;
  return {
    ...run.result.samples[0],
    t,
    loaded: true,
    load: 0,
    disp,
    dispMin: disp,
    height: p.h0 - disp,
    strain: relaxStrain,
    strainMin: relaxStrain,
    bulge: p.nuAF * relaxStrain * p.r,
    pNP: r.sigmaNP,
    pNPMin: r.sigmaNP,
    angle: 0,
    shear: 0,
    edgeStrain: 0,
    damage: 0,
  };
}

/** Initial state from a deep link such as #/simulation?preset=lifting&condition=degenerated&damage=1 */
function parseLaunch(query: string) {
  const q = new URLSearchParams(query);
  const preset = q.get('preset');
  const cond = q.get('condition');
  const sev = Number(q.get('severity'));
  const found = PRESETS.find((p) => p.id === preset);
  return {
    sel: {
      condition: (cond === 'degenerated' || cond === 'herniated' || cond === 'schmorl' ? cond : 'healthy') as Condition,
      severity: q.has('severity') && Number.isFinite(sev) ? Math.min(1, Math.max(0, sev)) : 0.6,
      nucleusLoss: 0.3,
    },
    compare: q.get('compare') === '1',
    stress: q.get('stress') === '1',
    damage: q.get('damage') === '1',
    testMode: (preset === 'creep' ? 'creep' : preset === 'relaxation' ? 'relaxation' : 'loading') as TestMode,
    inputs: preset === 'creep' ? CREEP_TEST : (found?.inputs ?? DEFAULT_INPUTS),
    activePreset: found ? found.id : preset === 'creep' || preset === 'relaxation' ? null : 'standing',
  };
}

export default function Simulation({ launchQuery = '' }: { launchQuery?: string }) {
  const [launch] = useState(() => parseLaunch(launchQuery));
  const [sel, setSel] = useState<DiscSelection>(launch.sel);
  const [compare, setCompare] = useState(launch.compare);
  const [inputs, setInputs] = useState<LoadInputs>(launch.inputs);
  const [activePreset, setActivePreset] = useState<string | null>(launch.activePreset);
  const [testMode, setTestMode] = useState<TestMode>(launch.testMode);
  const [relaxStrain, setRelaxStrain] = useState(0.05);
  const [visualScale, setVisualScale] = useState(2);
  const [showStress, setShowStress] = useState(launch.stress);
  const [showDamage, setShowDamage] = useState(launch.damage);
  const [paramsOpen, setParamsOpen] = useState(false);
  const isRelax = testMode === 'relaxation';

  // Single mode uses the selected condition. Compare mode always uses Healthy vs Degenerated
  // at the chosen severity, with the SAME inputs; only the parameters differ.
  const mainSel: DiscSelection = compare ? { ...sel, condition: 'healthy' } : sel;
  const degSel: DiscSelection = { ...sel, condition: 'degenerated' };
  const mainParams = useMemo(() => buildParams(mainSel), [mainSel.condition, mainSel.severity, mainSel.nucleusLoss]); // eslint-disable-line react-hooks/exhaustive-deps
  const degParams = useMemo(() => buildParams(degSel), [sel.severity]); // eslint-disable-line react-hooks/exhaustive-deps

  const mainRun: Run = useMemo(
    () => ({ params: mainParams, result: simulate(mainParams, inputs), relax: relaxationTest(mainParams, relaxStrain, RELAX_END) }),
    [mainParams, inputs, relaxStrain],
  );
  const degRun: Run = useMemo(
    () => ({ params: degParams, result: simulate(degParams, inputs), relax: relaxationTest(degParams, relaxStrain, RELAX_END) }),
    [degParams, inputs, relaxStrain],
  );

  const total = isRelax ? RELAX_END : mainRun.result.totalTime;
  const clock = useSimClock(total, autoSpeed(total));
  const cur = currentSample(mainRun, clock.t, isRelax, relaxStrain);
  const curD = currentSample(degRun, clock.t, isRelax, relaxStrain);

  const vizInputs = isRelax ? { ...inputs, loadType: 'compression' as const, direction: 'axial' as const } : inputs;
  const segments = isRelax ? [{ start: 0, end: RELAX_END, loaded: true }] : buildSegments(inputs);
  const herniatedNow = showDamage && mainRun.result.herniatedAt !== null && clock.t >= mainRun.result.herniatedAt;

  const applyPreset = (id: string) => {
    const p = PRESETS.find((x) => x.id === id);
    if (!p) return;
    setTestMode('loading');
    setActivePreset(id);
    setInputs(p.inputs);
    clock.reset();
    clock.setSpeed(autoSpeed(simulate(mainParams, p.inputs).totalTime));
  };
  const runTest = (mode: 'creep' | 'relaxation') => {
    setTestMode(mode);
    setActivePreset(null);
    clock.reset();
    if (mode === 'creep') {
      setInputs(CREEP_TEST);
      clock.setSpeed(3600);
    } else clock.setSpeed(60);
  };
  const changeInputs = (next: LoadInputs) => {
    setInputs(next);
    setActivePreset(null);
    if (testMode === 'creep') setTestMode('loading');
  };
  const resetAll = () => {
    setSel({ condition: 'healthy', severity: 0.6, nucleusLoss: 0.3 });
    setCompare(false);
    setVisualScale(2);
    setShowStress(false);
    setShowDamage(false);
    applyPreset('standing');
  };

  const status = isRelax
    ? 'Strain held constant'
    : cur.loaded
      ? inputs.frequencyMode === 'cyclic'
        ? `Cyclic loading ${inputs.frequencyHz} Hz (drawn at cycle peak)`
        : 'Loading'
      : 'Unloaded recovery';

  const severitySlider = (
    <div className="inline-slider">
      <label htmlFor="sev">
        {compare ? 'Degenerated disc severity' : 'Degeneration severity'} <InfoTip id="severity" align="right" />
      </label>
      <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Mild</span>
      <input
        id="sev"
        type="range"
        min={0}
        max={100}
        step={1}
        value={Math.round(sel.severity * 100)}
        className="inline-range"
        style={{ ['--fill' as string]: `${sel.severity * 100}%` }}
        onChange={(e) => setSel({ ...sel, severity: Number(e.target.value) / 100 })}
      />
      <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Severe</span>
      <span className="value">{Math.round(sel.severity * 100)}%</span>
    </div>
  );

  return (
    <main className="page">
      <div className="sim-header">
        <div>
          <h1>Simulation</h1>
          <p>
            {compare
              ? 'The same load on a healthy and a degenerated disc, side by side.'
              : 'Apply a load to a lumbar disc and watch how it deforms, creeps and recovers over time.'}
          </p>
        </div>
        <div className="condition-bar">
          <div className="condition-buttons">
            {compare ? (
              <div className="compare-legend" aria-label="Discs being compared">
                <span><i style={{ background: HEALTHY_COLOR }} /> Healthy</span>
                <span className="vs">vs</span>
                <span><i style={{ background: DEGEN_COLOR }} /> Degenerated</span>
              </div>
            ) : (
              <div className="condition-buttons" role="radiogroup" aria-label="Disc condition">
                {CONDITIONS.map((c) => (
                  <button
                    key={c.id}
                    role="radio"
                    aria-checked={sel.condition === c.id}
                    className={`cond-btn ${sel.condition === c.id ? 'active' : ''}`}
                    onClick={() => setSel({ ...sel, condition: c.id })}
                  >
                    <span className="cond-dot" style={{ background: c.dot }} /> {c.label}
                  </button>
                ))}
                <InfoTip id="condition" align="right" />
              </div>
            )}
            <label className="switch compare-switch">
              <input type="checkbox" checked={compare} onChange={(e) => setCompare(e.target.checked)} aria-label="Compare healthy and degenerated" />
              <span className="track" />
              <span style={{ fontWeight: 600 }}>Compare</span>
            </label>
            <InfoTip id="compare" align="right" />
          </div>
          {(compare || sel.condition === 'degenerated') && severitySlider}
          {!compare && (sel.condition === 'herniated' || sel.condition === 'schmorl') && (
            <div className="inline-slider">
              <label htmlFor="nl">Nucleus loss <InfoTip id="nucleusLoss" align="right" /></label>
              <input
                id="nl"
                type="range"
                min={0}
                max={100}
                step={1}
                value={Math.round(sel.nucleusLoss * 100)}
                className="inline-range"
                style={{ ['--fill' as string]: `${sel.nucleusLoss * 100}%` }}
                onChange={(e) => setSel({ ...sel, nucleusLoss: Number(e.target.value) / 100 })}
              />
              <span className="value">{Math.round(sel.nucleusLoss * 100)}%</span>
            </div>
          )}
        </div>
      </div>

      <div className="sim-grid">
        <div>
          <section className="card viz-card">
            <div className="viz-toolbar">
              <span className="viz-title">
                {compare
                  ? `Healthy vs ${Math.round(sel.severity * 100)}% degenerated · identical loading`
                  : `${CONDITIONS.find((c) => c.id === sel.condition)!.label} disc${sel.condition === 'degenerated' ? ` · ${Math.round(sel.severity * 100)}% severity` : ''}`}
                {visualScale > 1 && ' · deformation drawn 2×'}
              </span>
              <button className="collapse-btn" onClick={() => setParamsOpen((o) => !o)} aria-expanded={paramsOpen}>
                {paramsOpen ? 'Hide model parameters' : 'Model parameters'}
              </button>
            </div>
            {paramsOpen && <ParamsPanel runs={compare ? [mainParams, degParams] : [mainParams]} />}

            {compare ? (
              <div className="compare-viz">
                {[
                  { run: mainRun, s: cur, label: 'Healthy', color: HEALTHY_COLOR },
                  { run: degRun, s: curD, label: `Degenerated · ${Math.round(sel.severity * 100)}%`, color: DEGEN_COLOR },
                ].map((d) => (
                  <div key={d.label} className="compare-pane" style={{ borderColor: d.color }}>
                    <DiscVisualization
                      params={d.run.params}
                      sample={d.s}
                      inputs={vizInputs}
                      visualScale={visualScale}
                      showStress={showStress}
                      showDamage={showDamage && !isRelax}
                      label={d.label}
                      compact
                      accent={d.color}
                    />
                    {showDamage && !isRelax && <DamageMeter value={d.s.damage} />}
                  </div>
                ))}
              </div>
            ) : (
              <DiscVisualization
                params={mainParams}
                sample={cur}
                inputs={vizInputs}
                visualScale={visualScale}
                showStress={showStress}
                showDamage={showDamage && !isRelax}
                accent={HEALTHY_COLOR}
              />
            )}

            {showStress && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: 'var(--text-2)', marginTop: 6 }}>
                <span>Stress</span>
                <span style={{ flex: 'none', width: 160, height: 10, borderRadius: 999, background: 'linear-gradient(90deg,#eef5ff,#4a90d9,#08306b)' }} />
                <span>0 → 2 MPa · illustrative, region-averaged</span>
              </div>
            )}
            {showDamage && !isRelax && (
              <div style={{ marginTop: 12 }}>
                {!compare && <DamageMeter value={cur.damage} />}
                <div className="banner">
                  <span aria-hidden>⚠︎</span>
                  <span>
                    <b>Educational approximation, not a predictive failure model.</b> No reference provides herniation thresholds; the damage
                    rate constants are illustrative.
                    {!compare && herniatedNow && ' The nucleus has now displaced through the posterior annulus.'}
                  </span>
                </div>
              </div>
            )}
            {!isRelax &&
              [...new Set([...mainRun.result.warnings, ...(compare ? degRun.result.warnings : [])])].map((w) => (
                <div key={w} className="banner">
                  <span aria-hidden>ⓘ</span>
                  <span>{w}</span>
                </div>
              ))}
            {isRelax && (
              <div className="banner info">
                <span aria-hidden>ⓘ</span>
                <span>
                  Tissue-level test: a {(relaxStrain * 100).toFixed(1)}% strain is held while stress relaxes (Ellingson & Nuckley 2012).
                  The time constants (≈3 s and ≈1 min) belong to small tissue sites, not the whole disc.
                </span>
              </div>
            )}
          </section>
        </div>

        <ForceControls
          inputs={inputs}
          onChange={changeInputs}
          activePreset={activePreset}
          onPreset={applyPreset}
          testMode={testMode}
          onTest={runTest}
          relaxStrain={relaxStrain}
          onRelaxStrain={setRelaxStrain}
          visualScale={visualScale}
          onVisualScale={setVisualScale}
          showStress={showStress}
          onShowStress={setShowStress}
          showDamage={showDamage}
          onShowDamage={setShowDamage}
          onReset={resetAll}
        />
      </div>

      <PlaybackBar
        t={clock.t}
        total={total}
        playing={clock.playing}
        speed={clock.speed}
        onToggle={clock.toggle}
        onReset={clock.reset}
        onSeek={clock.seek}
        onSpeed={clock.setSpeed}
        phases={segments}
        status={status}
      />

      {compare ? (
        <CompareResults
          pH={mainParams}
          pD={degParams}
          h={cur}
          d={curD}
          resH={mainRun.result}
          resD={degRun.result}
          t={clock.t}
          showDamage={showDamage && !isRelax}
          relaxation={isRelax}
          colors={[HEALTHY_COLOR, DEGEN_COLOR]}
        />
      ) : (
        !isRelax && <Readouts items={readoutItems(mainParams, cur, inputs, showDamage)} />
      )}

      {isRelax ? (
        <RelaxationGraphs
          runs={[
            { label: compare ? 'Healthy' : 'Disc', color: HEALTHY_COLOR, samples: mainRun.relax },
            ...(compare ? [{ label: 'Degenerated', color: DEGEN_COLOR, samples: degRun.relax }] : []),
          ]}
          t={clock.t}
        />
      ) : (
        <ResultsGraphs
          runs={[
            { label: compare ? 'Healthy' : 'Disc', color: HEALTHY_COLOR, result: mainRun.result, current: cur },
            ...(compare ? [{ label: 'Degenerated', color: DEGEN_COLOR, result: degRun.result, current: curD }] : []),
          ]}
          t={clock.t}
          cyclic={inputs.frequencyMode === 'cyclic'}
        />
      )}

      <section className="card explain">
        <div>
          <h3>What you are seeing</h3>
          <p>
            Under load the disc first compresses instantly (elastic), then keeps losing height for hours as fluid flows out (creep).
            When the load is removed it re-swells, but several times more slowly.
          </p>
        </div>
        <div>
          <h3>Why degeneration matters</h3>
          <p>
            A degenerated nucleus holds less water and pressure, so the annulus carries more of the load. Degenerated discs creep
            more, recover less, and their annulus is more vulnerable to damage.
          </p>
        </div>
        <div>
          <h3>How it is calculated</h3>
          <p>
            Every number and shape comes from the same equations: O'Connell et al. (2011) creep and recovery, Ellingson & Nuckley
            (2012) relaxation, and nucleus/annulus load sharing. It is a simplified educational model, not a clinical prediction.{' '}
            <a href="#/model" style={{ color: 'var(--accent)' }}>Read the model documentation →</a>
          </p>
        </div>
      </section>
    </main>
  );
}

function DamageMeter({ value }: { value: number }) {
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
        <span style={{ fontWeight: 600 }}>Damage index</span>
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>{(value * 100).toFixed(0)}%</span>
      </div>
      <div className="meter">
        <div style={{ width: `${value * 100}%`, background: value >= 1 ? 'var(--danger)' : 'linear-gradient(90deg,#0071e3,#ff9f0a)' }} />
      </div>
    </div>
  );
}

function ParamsPanel({ runs }: { runs: DiscParams[] }) {
  const tables = runs.map(describeParams);
  return (
    <div className="card" style={{ padding: 14, marginBottom: 10, background: 'var(--bg)', boxShadow: 'none' }}>
      <table className="param-table">
        {runs.length > 1 && (
          <thead>
            <tr>
              <td />
              <td style={{ color: HEALTHY_COLOR }}>Healthy</td>
              <td style={{ color: DEGEN_COLOR, textAlign: 'right', paddingLeft: 8 }}>Degenerated</td>
            </tr>
          </thead>
        )}
        <tbody>
          {tables[0].map((r, i) => (
            <tr key={r.label}>
              <td>
                {r.label}
                <span className={`tagchip ${r.tag}`}>{r.tag}</span>
                <div className="src">{r.source}</div>
              </td>
              <td>{r.value}</td>
              {tables[1] && <td style={{ textAlign: 'right', fontWeight: 600, paddingLeft: 8 }}>{tables[1][i]?.value}</td>}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="control-hint" style={{ marginTop: 8 }}>
        R = reported by the paper · S = cited secondhand · P = simplification for this educational model. These are the simplified
        degeneration parameters of this model: one plausible degenerated disc, not every degenerated disc.
      </p>
    </div>
  );
}
