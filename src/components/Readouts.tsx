import type { INFO } from '../data/glossary';
import type { DiscParams, LoadInputs, SimSample } from '../models/types';
import InfoTip from './InfoTip';

interface Item {
  label: string;
  value: string;
  unit: string;
  sub?: string;
  info?: keyof typeof INFO;
  illustrative?: boolean;
}

export function readoutItems(p: DiscParams, s: SimSample, inp: LoadInputs, showDamage: boolean): Item[] {
  const dh = p.h0 - s.height;
  const items: Item[] = [
    { label: 'Disc height', value: s.height.toFixed(2), unit: 'mm', sub: `${dh >= 0 ? '−' : '+'}${Math.abs(dh).toFixed(2)} mm (${((Math.abs(dh) / p.h0) * 100).toFixed(1)}%)`, info: 'height' },
    { label: 'Axial strain', value: (s.strain * 100).toFixed(1), unit: '%', sub: `Resting height ${p.h0.toFixed(2)} mm`, info: 'strain' },
    { label: 'Nucleus pressure', value: s.pNP.toFixed(2), unit: 'MPa', sub: `NP carries ${(s.npShare * 100).toFixed(0)}% of axial load`, info: 'pressure' },
    { label: 'Annulus stress', value: s.sigmaAF.toFixed(2), unit: 'MPa', sub: 'Average axial compression', info: 'afStress' },
    { label: 'Radial bulge', value: s.bulge.toFixed(2), unit: 'mm', sub: 'Annulus, outward' },
  ];
  if (inp.loadType === 'bending' || inp.loadType === 'torsion')
    items.push({
      label: inp.loadType === 'torsion' ? 'Axial rotation' : 'Bending angle',
      value: ((s.angle * 180) / Math.PI).toFixed(2),
      unit: '°',
      sub: inp.loadType === 'torsion' ? `Outer shear strain ${(s.shearStrain * 100).toFixed(1)}%` : `Edge strain ${(s.edgeStrain * 100).toFixed(1)}%`,
    });
  if (inp.loadType === 'shear')
    items.push({ label: 'Shear translation', value: s.shear.toFixed(2), unit: 'mm', sub: `Shear strain ${(s.shearStrain * 100).toFixed(1)}%` });
  items.push({ label: 'Hydration index', value: (s.hydration * 100).toFixed(1), unit: '%', info: 'hydration', illustrative: true });
  if (showDamage) items.push({ label: 'Damage index', value: (s.damage * 100).toFixed(0), unit: '%', info: 'damage', illustrative: true, sub: `Posterior AF strain ${(s.postStrain * 100).toFixed(1)}%` });
  return items;
}

export default function Readouts({ items }: { items: Item[] }) {
  return (
    <div className="readouts">
      {items.map((it) => (
        <div key={it.label} className="readout">
          <div className="r-label">
            {it.label} {it.info && <InfoTip id={it.info} />} {it.illustrative && <span className="tag">Illustr.</span>}
          </div>
          <div className="r-value">
            {it.value}
            <span className="r-unit">{it.unit}</span>
          </div>
          {it.sub && <div className="r-sub">{it.sub}</div>}
        </div>
      ))}
    </div>
  );
}
