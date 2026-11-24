// Coinflip Mind thumbnail system (from video 2 on): paper background, a short sentence aimed at the viewer (one word in
// red), the "you" character big with one clear emotion, one piece of "proof" in the middle, the coin logo top-right.
// v0 "YOU FELL FOR IT." · v1 "IT'S $10." Both use the left-digit tag: a huge red $9, a small faded .99.
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { useFonts } from "../inkbeat/core/frame";
import { Guy } from "./Ep2";
import { GOLD, INK, PAPER, RED } from "./Ep1Test";

const LeftDigitTag: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <ellipse cx={20} cy={210} rx={420} ry={26} fill={INK} opacity={0.15} />
    <path d="M -470 0 L -380 -170 L 470 -170 L 470 170 L -380 170 Z" fill="#fff" stroke={INK} strokeWidth={14} strokeLinejoin="round" />
    <circle cx={-360} cy={0} r={28} fill={PAPER} stroke={INK} strokeWidth={10} />
    <text x={-250} y={115} fontFamily="Poppins" fontWeight={800} fontSize={300} fill={RED} stroke={INK} strokeWidth={10} paintOrder="stroke fill">
      $9
    </text>
    <text x={180} y={115} fontFamily="Poppins" fontWeight={800} fontSize={170} fill="#c4c7cf">
      .99
    </text>
  </g>
);

export const Ep2Thumb: React.FC<{ v: number }> = ({ v }) => {
  const ready = useFonts();
  if (!ready) return <AbsoluteFill style={{ background: PAPER }} />;
  const [a, b] = v === 0 ? ["YOU FELL", "FOR IT."] : ["IT'S", "$10."];
  return (
    <AbsoluteFill style={{ background: PAPER }}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080">
        {/* soft spotlight behind the character */}
        <circle cx={1500} cy={780} r={430} fill={GOLD} opacity={0.3} />
        <text x={90} y={250} fontFamily="Poppins" fontWeight={800} fontSize={190} letterSpacing={-4} fill={INK}>
          {a}
        </text>
        <text x={90} y={440} fontFamily="Poppins" fontWeight={800} fontSize={190} letterSpacing={-4} fill={RED} stroke={INK} strokeWidth={8} paintOrder="stroke fill">
          {b}
        </text>
        <LeftDigitTag x={640} y={760} s={0.9} rot={-6} />
        {/* the "you" character, big, caught out */}
        <Guy x={1500} y={900} s={2.3} mood="shocked" pose="up" />
      </svg>
      <Img src={staticFile("coinflip/pfp.png")} style={{ position: "absolute", right: 40, top: 36, width: 150, height: 150, borderRadius: "50%", border: `6px solid ${INK}` }} />
    </AbsoluteFill>
  );
};
