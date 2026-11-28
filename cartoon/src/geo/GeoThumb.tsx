// Geo episode 1 thumbnail: a deleted world map, the grinning host, crying losers, and a crowned mystery winner.
import React from "react";
import { AbsoluteFill } from "remotion";
import { useFonts } from "../inkbeat/core/frame";
import WORLD from "./world.json";
import { Cowboy, Face, FLAGS, Host, INK, Mood, PartyHat, TopHat } from "./GeoCast";

const GOLD = "#f5c518";
const RED = "#e8423a";
const C = WORLD.c as { n: string; d: string; b: number[] }[];
const ALIVE = new Set(["France"]);

const Head: React.FC<{ x: number; y: number; s: number; flag: string; mood: Mood; prop?: React.ReactNode; rot?: number }> = ({ x, y, s, flag, mood, prop, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <clipPath id={`th${flag}`}>
      <circle r={100} />
    </clipPath>
    <g clipPath={`url(#th${flag})`}>{FLAGS[flag]}</g>
    <circle r={100} fill="none" stroke={INK} strokeWidth={8} />
    <Face mood={mood} />
    {prop}
  </g>
);

export const GeoThumb: React.FC = () => {
  const ready = useFonts();
  if (!ready) return <AbsoluteFill style={{ background: "#2a6fb0" }} />;
  return (
    <AbsoluteFill style={{ background: "#2a6fb0" }}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080">
        <g transform="translate(960 540) scale(1.25) translate(-1000 -470)">
          {C.map((c, i) => (
            <path key={i} d={c.d} fill={ALIVE.has(c.n) ? "#3b4263" : i % 7 === 0 ? RED : "#3b4263"} stroke={INK} strokeWidth={1.2} />
          ))}
        </g>
        <rect width={1920} height={1080} fill="url(#vig)" />
        <defs>
          <radialGradient id="vig" cx="0.62" cy="0.55" r="0.75">
            <stop offset="0" stopColor="#000" stopOpacity={0} />
            <stop offset="1" stopColor="#000" stopOpacity={0.55} />
          </radialGradient>
          <radialGradient id="spot" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#fff3b0" stopOpacity={0.95} />
            <stop offset="1" stopColor="#fff3b0" stopOpacity={0} />
          </radialGradient>
        </defs>

        {/* mystery winner in a spotlight */}
        <circle cx={1340} cy={560} r={400} fill="url(#spot)" />
        <g transform="translate(1340 600)">
          <circle r={190} fill="#11162e" stroke={INK} strokeWidth={10} />
          <text y={78} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={240} fill="#fff">
            ?
          </text>
          <path d="M -120 -150 L -135 -280 L -60 -205 L 0 -310 L 60 -205 L 135 -280 L 120 -150 Z" fill={GOLD} stroke={INK} strokeWidth={10} strokeLinejoin="round" />
        </g>

        {/* the losers */}
        <Head x={1760} y={900} s={1.05} flag="BRAZIL" mood="crying" prop={PartyHat} rot={14} />
        <Head x={930} y={930} s={0.95} flag="USA" mood="crying" prop={Cowboy} rot={-12} />
        <Head x={1780} y={330} s={0.7} flag="UK" mood="shocked" prop={TopHat} rot={10} />
        {[
          [1760, 900],
          [930, 930],
        ].map(([x, y], i) => (
          <g key={i} transform={`translate(${x + 80} ${y - 95})`}>
            <circle r={52} fill={RED} stroke={INK} strokeWidth={8} />
            <path d="M -22 -22 L 22 22 M 22 -22 L -22 22" stroke="#fff" strokeWidth={14} strokeLinecap="round" />
          </g>
        ))}

        {/* the host */}
        <g transform="translate(330 680) scale(1.55)">
          <Host x={0} y={0} label={false} />
        </g>

        {/* text */}
        <g transform="translate(60 70) rotate(-3)">
          <rect x={0} y={0} width={1150} height={190} rx={30} fill={GOLD} stroke={INK} strokeWidth={12} />
          <text x={575} y={142} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={126} fill={INK}>
            WHO SURVIVES?
          </text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};
