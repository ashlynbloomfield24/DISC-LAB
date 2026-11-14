// Clickable sagittal disc illustration for "tap the structure" questions.
// Same visual language as the Simulation drawing.

import type { Region } from '../data/quizQuestions';

interface Props {
  chosen: Region | null;
  answer: Region;
  revealed: boolean;
  onPick: (r: Region) => void;
}

const W = 520;
const cx = W / 2;

export default function AnatomyTap({ chosen, answer, revealed, onPick }: Props) {
  const style = (r: Region) => {
    if (!revealed) return chosen === r ? 'tap-region hover' : 'tap-region';
    if (r === answer) return 'tap-region correct';
    if (r === chosen) return 'tap-region wrong';
    return 'tap-region dim';
  };
  const props = (r: Region, label: string) => ({
    className: style(r),
    onClick: () => !revealed && onPick(r),
    role: 'button',
    tabIndex: revealed ? -1 : 0,
    'aria-label': label,
    onKeyDown: (e: React.KeyboardEvent) => {
      if (!revealed && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        onPick(r);
      }
    },
  });
  const discW = 300;
  const vbW = 320;
  return (
    <svg viewBox={`0 0 ${W} 360`} className="tap-svg" aria-label="Disc illustration: tap a structure">
      <defs>
        <linearGradient id="tap-bone" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#f6efe0" />
          <stop offset="1" stopColor="#e6d8bd" />
        </linearGradient>
        <radialGradient id="tap-np" cx="0.4" cy="0.35" r="0.75">
          <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="0.4" stopColor="#3d8bef" stopOpacity="0.9" />
          <stop offset="1" stopColor="#3d8bef" />
        </radialGradient>
      </defs>
      {/* upper and lower vertebral bodies */}
      <rect x={cx - vbW / 2} y={20} width={vbW} height={120} rx={16} fill="url(#tap-bone)" stroke="#cdb994" strokeWidth={2} {...props('vertebra', 'Upper vertebral body')} />
      <rect x={cx - vbW / 2} y={226} width={vbW} height={120} rx={16} fill="url(#tap-bone)" stroke="#cdb994" strokeWidth={2} {...props('vertebra', 'Lower vertebral body')} />
      {/* cartilaginous endplates */}
      <rect x={cx - discW / 2} y={140} width={discW} height={10} fill="#dfe9f1" stroke="#a9bccb" {...props('endplate', 'Upper cartilaginous endplate')} />
      <rect x={cx - discW / 2} y={216} width={discW} height={10} fill="#dfe9f1" stroke="#a9bccb" {...props('endplate', 'Lower cartilaginous endplate')} />
      {/* annulus */}
      <path
        d={`M ${cx - discW / 2} 150 Q ${cx - discW / 2 - 18} 183 ${cx - discW / 2} 216 L ${cx + discW / 2} 216 Q ${cx + discW / 2 + 18} 183 ${cx + discW / 2} 150 Z`}
        fill="#cfe0f2"
        stroke="#8aaed3"
        strokeWidth={1.5}
        {...props('annulus', 'Annulus fibrosus')}
      />
      <g pointerEvents="none" stroke="#7fa6d0" fill="none" opacity={0.7}>
        {[0, 1, 2, 3, 4].map((k) => (
          <g key={k}>
            <path d={`M ${cx - discW / 2 + 10 + k * 13} 150 Q ${cx - discW / 2 + 2 + k * 13} 183 ${cx - discW / 2 + 10 + k * 13} 216`} />
            <path d={`M ${cx + discW / 2 - 10 - k * 13} 150 Q ${cx + discW / 2 - 2 - k * 13} 183 ${cx + discW / 2 - 10 - k * 13} 216`} />
          </g>
        ))}
      </g>
      {/* nucleus */}
      <ellipse cx={cx} cy={183} rx={78} ry={22} fill="url(#tap-np)" stroke="#2a6fc4" {...props('nucleus', 'Nucleus pulposus')} />
      <text x={cx - vbW / 2} y={356} className="viz-dir-label" fontSize="12">◀ Anterior</text>
      <text x={cx + vbW / 2} y={356} textAnchor="end" className="viz-dir-label" fontSize="12">Posterior ▶</text>
    </svg>
  );
}
