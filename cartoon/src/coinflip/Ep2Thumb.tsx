// Coinflip Mind thumbnail system (from video 2 on): paper background, a short line that opens a question (last part in
// red), the "you" character big with one clear emotion, one object circled but NOT explained, the coin logo top-right.
// v0 "NOBODY NOTICES THIS." · v1 "IT WORKS ON YOU." Both circle a plain $9.99 tag: the click explains why.
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { useFonts } from "../inkbeat/core/frame";
import { Guy } from "./Ep2";
import { GOLD, INK, PAPER, RED } from "./Ep1Test";

const PlainTag: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <ellipse cx={20} cy={210} rx={420} ry={26} fill={INK} opacity={0.15} />
    <path d="M -470 0 L -380 -170 L 470 -170 L 470 170 L -380 170 Z" fill="#fff" stroke={INK} strokeWidth={14} strokeLinejoin="round" />
    <circle cx={-360} cy={0} r={28} fill={PAPER} stroke={INK} strokeWidth={10} />
    <text x={60} y={95} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={250} fill={INK}>
      $9.99
    </text>
  </g>
);

export const Ep2Thumb: React.FC<{ v: number }> = ({ v }) => {
  const ready = useFonts();
  if (!ready) return <AbsoluteFill style={{ background: PAPER }} />;
  const [a, b] = v === 0 ? ["NOBODY", "NOTICES THIS."] : ["IT WORKS", "ON YOU."];
  return (
    <AbsoluteFill style={{ background: PAPER }}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080">
        <circle cx={1500} cy={780} r={430} fill={GOLD} opacity={0.3} />
        <text x={90} y={250} fontFamily="Poppins" fontWeight={800} fontSize={180} letterSpacing={-4} fill={INK}>
          {a}
        </text>
        <text x={90} y={430} fontFamily="Poppins" fontWeight={800} fontSize={v === 0 ? 150 : 180} letterSpacing={-4} fill={RED} stroke={INK} strokeWidth={8} paintOrder="stroke fill">
          {b}
        </text>
        <PlainTag x={600} y={770} s={0.85} rot={-6} />
        {/* hand-drawn red circle + arrow: points at it, explains nothing */}
        <path d="M 160 760 C 150 560 600 520 960 600 C 1180 650 1150 900 900 950 C 600 1010 180 980 170 800" fill="none" stroke={RED} strokeWidth={16} strokeLinecap="round" />
        <path d="M 1140 520 L 1020 620 M 1020 620 L 1030 560 M 1020 620 L 1080 615" fill="none" stroke={RED} strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" />
        <Guy x={1500} y={900} s={2.3} mood="shocked" pose="chin" />
        <text x={1730} y={430} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={190} fill={RED} stroke={INK} strokeWidth={8} paintOrder="stroke fill" transform="rotate(12 1730 430)">
          ?
        </text>
      </svg>
      <Img src={staticFile("coinflip/pfp.png")} style={{ position: "absolute", right: 40, top: 36, width: 150, height: 150, borderRadius: "50%", border: `6px solid ${INK}` }} />
    </AbsoluteFill>
  );
};
