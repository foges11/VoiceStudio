// Coinflip Mind — profile picture options (1080×1080, made for a circle crop). Flat vector, no 3D.
// 0 brain coin · 1 split coin (brain | $) · 2 coin mid-flip over a head · 3 "CM" monogram coin
import React from "react";
import { AbsoluteFill } from "remotion";
import { useFonts } from "../inkbeat/core/frame";

const GOLD = "#f5b82e";
const GOLD_D = "#c98a12";
const GOLD_L = "#ffe08a";
const INK = "#1b1f2e";

/** a stylised brain (two hemispheres with folds), centred at (0,0), about 2r wide */
const Brain: React.FC<{ r: number; fill: string; line: string; w?: number }> = ({ r, fill, line, w = 10 }) => (
  <g strokeLinecap="round" strokeLinejoin="round">
    <path d={`M 0 ${-r * 0.78} C ${-r * 0.55} ${-r * 0.95} ${-r * 1.05} ${-r * 0.6} ${-r * 0.98} ${-r * 0.12} C ${-r * 1.08} ${r * 0.35} ${-r * 0.72} ${r * 0.78} ${-r * 0.25} ${r * 0.72} C ${-r * 0.12} ${r * 0.72} ${-r * 0.04} ${r * 0.66} 0 ${r * 0.6} Z`} fill={fill} stroke={line} strokeWidth={w} />
    <path d={`M 0 ${-r * 0.78} C ${r * 0.55} ${-r * 0.95} ${r * 1.05} ${-r * 0.6} ${r * 0.98} ${-r * 0.12} C ${r * 1.08} ${r * 0.35} ${r * 0.72} ${r * 0.78} ${r * 0.25} ${r * 0.72} C ${r * 0.12} ${r * 0.72} ${r * 0.04} ${r * 0.66} 0 ${r * 0.6} Z`} fill={fill} stroke={line} strokeWidth={w} />
    <g fill="none" stroke={line} strokeWidth={w * 0.8}>
      <path d={`M ${-r * 0.7} ${-r * 0.4} C ${-r * 0.45} ${-r * 0.55} ${-r * 0.3} ${-r * 0.25} ${-r * 0.5} ${-r * 0.1}`} />
      <path d={`M ${-r * 0.82} ${r * 0.15} C ${-r * 0.55} ${r * 0.05} ${-r * 0.35} ${r * 0.3} ${-r * 0.55} ${r * 0.45}`} />
      <path d={`M ${-r * 0.3} ${-r * 0.65} C ${-r * 0.15} ${-r * 0.45} ${-r * 0.25} ${-r * 0.2} ${-r * 0.12} ${-r * 0.02}`} />
      <path d={`M ${r * 0.7} ${-r * 0.4} C ${r * 0.45} ${-r * 0.55} ${r * 0.3} ${-r * 0.25} ${r * 0.5} ${-r * 0.1}`} />
      <path d={`M ${r * 0.82} ${r * 0.15} C ${r * 0.55} ${r * 0.05} ${r * 0.35} ${r * 0.3} ${r * 0.55} ${r * 0.45}`} />
      <path d={`M ${r * 0.3} ${-r * 0.65} C ${r * 0.15} ${-r * 0.45} ${r * 0.25} ${-r * 0.2} ${r * 0.12} ${-r * 0.02}`} />
    </g>
  </g>
);

/** a gold coin face: rim, inner ring, shine */
const Coin: React.FC<{ r: number; children?: React.ReactNode }> = ({ r, children }) => (
  <g>
    <circle r={r} cy={r * 0.06} fill={GOLD_D} />
    <circle r={r} fill={GOLD} stroke={GOLD_D} strokeWidth={r * 0.04} />
    <circle r={r * 0.84} fill="none" stroke={GOLD_D} strokeWidth={r * 0.025} strokeDasharray={`${r * 0.05} ${r * 0.035}`} />
    {children}
    <path d={`M ${-r * 0.62} ${-r * 0.5} A ${r * 0.8} ${r * 0.8} 0 0 1 ${r * 0.1} ${-r * 0.79}`} fill="none" stroke={GOLD_L} strokeWidth={r * 0.06} strokeLinecap="round" opacity={0.85} />
  </g>
);

const Ring: React.FC<{ bg: string }> = ({ bg }) => <AbsoluteFill style={{ borderRadius: "50%", boxShadow: `inset 0 0 0 34px ${bg}` }} />;

const V0: React.FC = () => (
  <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 42%, #2f3a66, #141a33 70%)" }}>
    <svg width={1080} height={1080} viewBox="-540 -540 1080 1080">
      <Coin r={330}>
        <g transform="translate(0,10)">
          <Brain r={205} fill={GOLD_L} line={GOLD_D} w={14} />
        </g>
      </Coin>
    </svg>
  </AbsoluteFill>
);

const V1: React.FC = () => (
  <AbsoluteFill style={{ background: "#3ecf9a" }}>
    <svg width={1080} height={1080} viewBox="-540 -540 1080 1080">
      <defs>
        <clipPath id="left">
          <rect x={-400} y={-400} width={400} height={800} />
        </clipPath>
        <clipPath id="right">
          <rect x={0} y={-400} width={400} height={800} />
        </clipPath>
      </defs>
      <g clipPath="url(#left)">
        <Coin r={330}>
          <g transform="translate(-150,10)">
            <Brain r={115} fill={GOLD_L} line={GOLD_D} w={11} />
          </g>
        </Coin>
      </g>
      <g clipPath="url(#right)">
        <Coin r={330}>
          <text x={150} y={85} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={250} fill={GOLD_L} stroke={GOLD_D} strokeWidth={12} paintOrder="stroke fill">
            $
          </text>
        </Coin>
      </g>
      <line x1={0} y1={-345} x2={0} y2={345} stroke={INK} strokeWidth={14} strokeLinecap="round" />
    </svg>
  </AbsoluteFill>
);

const V2: React.FC = () => (
  <AbsoluteFill style={{ background: "linear-gradient(#ff8a5b, #ff5f6d)" }}>
    <svg width={1080} height={1080} viewBox="-540 -540 1080 1080">
      {/* a simple head in profile-free front view */}
      <g transform="translate(0,170)">
        <rect x={-210} y={120} width={420} height={260} rx={130} fill={INK} />
        <circle r={190} fill="#ffd9b8" stroke={INK} strokeWidth={14} />
        <circle cx={-62} cy={-10} r={20} fill={INK} />
        <circle cx={62} cy={-10} r={20} fill={INK} />
        <path d="M -55 70 Q 0 105 55 70" fill="none" stroke={INK} strokeWidth={14} strokeLinecap="round" />
      </g>
      {/* the coin mid-flip above the head, with motion marks */}
      <g transform="translate(0,-250) rotate(-14)">
        <ellipse rx={170} ry={58} cy={14} fill={GOLD_D} />
        <ellipse rx={170} ry={58} fill={GOLD} stroke={GOLD_D} strokeWidth={10} />
        <ellipse rx={120} ry={36} fill="none" stroke={GOLD_D} strokeWidth={7} />
      </g>
      {[-1, 1].map((s) => (
        <path key={s} d={`M ${s * 230} -300 Q ${s * 260} -250 ${s * 230} -200`} fill="none" stroke="#fff3e6" strokeWidth={16} strokeLinecap="round" />
      ))}
    </svg>
  </AbsoluteFill>
);

const V3: React.FC = () => (
  <AbsoluteFill style={{ background: INK }}>
    <svg width={1080} height={1080} viewBox="-540 -540 1080 1080">
      <Coin r={330}>
        <text x={0} y={70} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={230} letterSpacing={-6} fill={INK}>
          CM
        </text>
        <text x={0} y={160} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={46} letterSpacing={14} fill={GOLD_D}>
          COINFLIP
        </text>
      </Coin>
    </svg>
  </AbsoluteFill>
);

export const CoinflipAvatar: React.FC<{ v: number }> = ({ v }) => {
  const ready = useFonts();
  if (!ready) return <AbsoluteFill style={{ background: INK }} />;
  const bg = ["#141a33", "#3ecf9a", "#ff5f6d", INK][v];
  return (
    <AbsoluteFill>
      {v === 0 ? <V0 /> : v === 1 ? <V1 /> : v === 2 ? <V2 /> : <V3 />}
      <Ring bg={bg} />
    </AbsoluteFill>
  );
};
