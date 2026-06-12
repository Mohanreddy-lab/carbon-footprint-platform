const TREE_COLORS = [
  '#065f46', '#047857', '#059669', '#10b981', '#34d399', '#6ee7b7',
];

interface TreeProps {
  x: number;
  y: number;
  scale: number;
  color: string;
  delay: number;
}

function Tree({ x, y, scale, color, delay }: TreeProps) {
  const h = 24 * scale;
  const w = 18 * scale;
  const trunkH = 6 * scale;
  const trunkW = 3 * scale;

  return (
    <g
      transform={`translate(${x}, ${y})`}
      style={{
        transformOrigin: `0px ${h}px`,
        animation: `growTree 0.6s cubic-bezier(0.34,1.56,0.64,1) ${delay}s both`,
      }}
    >
      {/* Tree canopy */}
      <ellipse cx={0} cy={-h * 0.6} rx={w / 2} ry={h * 0.5} fill={color} />
      <ellipse cx={0} cy={-h * 0.75} rx={w * 0.4} ry={h * 0.35} fill={color} opacity={0.85} />
      {/* Trunk */}
      <rect
        x={-trunkW / 2}
        y={-trunkH}
        width={trunkW}
        height={trunkH}
        fill="#854d0e"
        rx={1}
      />
      {/* Highlight */}
      <ellipse cx={-w * 0.15} cy={-h * 0.7} rx={w * 0.12} ry={h * 0.15} fill="white" opacity={0.1} />
    </g>
  );
}

interface Props { savedKg: number; }

export default function ImpactForest({ savedKg }: Props) {
  const totalTrees = Math.floor(savedKg / 21);
  const displayTrees = Math.min(totalTrees, 48);

  if (totalTrees === 0) {
    return (
      <div className="text-center py-6">
        <div className="text-4xl mb-2">🌱</div>
        <p className="text-slate-400 text-sm">Commit to actions to grow your forest!</p>
        <p className="text-slate-600 text-xs mt-1">Every 21 kg CO2 saved plants one tree</p>
      </div>
    );
  }

  const cols = 8;
  const rows = Math.ceil(displayTrees / cols);
  const svgWidth = 280;
  const svgHeight = rows * 40 + 20;

  const trees = Array.from({ length: displayTrees }, (_, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const scale = 0.7 + Math.random() * 0.5;
    const color = TREE_COLORS[Math.floor(Math.random() * TREE_COLORS.length)];
    const offsetX = (Math.random() - 0.5) * 8;
    const offsetY = (Math.random() - 0.5) * 4;
    return {
      x: (col / (cols - 1)) * (svgWidth - 40) + 20 + offsetX,
      y: svgHeight - 10 - row * 38 + offsetY,
      scale,
      color,
      delay: i * 0.04,
    };
  });

  return (
    <div>
      <style>{`
        @keyframes growTree {
          0%   { transform: scaleY(0) translateY(10px); opacity: 0; }
          60%  { transform: scaleY(1.05) translateY(-2px); opacity: 1; }
          100% { transform: scaleY(1) translateY(0); opacity: 1; }
        }
      `}</style>

      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-semibold text-white">My Impact Forest</p>
          <p className="text-xs text-slate-500">
            {totalTrees.toLocaleString()} tree{totalTrees !== 1 ? 's' : ''} equivalent &bull;
            {(savedKg / 1000).toFixed(2)}t CO2 saved
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-emerald-400">{totalTrees.toLocaleString()}</p>
          <p className="text-[10px] text-slate-600">trees 🌲</p>
        </div>
      </div>

      <div
        className="relative rounded-xl overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, rgba(6,95,70,0.1) 0%, rgba(4,120,87,0.2) 100%)',
          border: '1px solid rgba(16,185,129,0.15)',
        }}
      >
        {/* Ground */}
        <div
          className="absolute bottom-0 left-0 right-0 h-3 rounded-b-xl"
          style={{ background: 'rgba(6,78,59,0.6)' }}
        />
        <svg
          width="100%"
          height={svgHeight}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          {trees.map((t, i) => (
            <Tree key={i} {...t} />
          ))}
        </svg>

        {totalTrees > 48 && (
          <div className="absolute bottom-2 right-2 text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
            +{totalTrees - 48} more
          </div>
        )}
      </div>
    </div>
  );
}
