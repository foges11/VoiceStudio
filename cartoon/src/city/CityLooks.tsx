// Brand City — three candidate looks for the series (stills). Day 0: an empty city, every lot for rent.
// "toy" and "neon" are flat isometric SVG (fast to render, easy to add logos to); "toon" is the inkbeat 3D look.
import React from "react";
import { AbsoluteFill } from "remotion";
import { useFonts } from "../inkbeat/core/frame";
import { boxG, coneG, cylG, Label, M, sphG } from "../inkbeat/core/kit";
import { View } from "../inkbeat/core/View";
import type { V3 } from "../inkbeat/types";

export type CityLookId = "toy" | "neon" | "toon";

// ------------------------------------------------------------------ the plan of the city (shared by every look)
// a 5×5 grid of cells; roads on row/col 2; everything else is an empty lot, except city hall at (0,0)
const N = 5;
type Cell = { x: number; y: number; kind: "road" | "lot" | "hall" | "park" };
const CELLS: Cell[] = [];
for (let x = 0; x < N; x++)
  for (let y = 0; y < N; y++) {
    const road = x === 2 || y === 2;
    CELLS.push({ x, y, kind: road ? "road" : x === 0 && y === 0 ? "hall" : x === 4 && y === 4 ? "park" : "lot" });
  }
const CRANE_AT = { x: 3, y: 0 };

// ------------------------------------------------------------------ isometric SVG helpers
const ISO = { s: 122, cx: 540, cy: 1040 };
const P = (x: number, y: number, z = 0): [number, number] => {
  const gx = x - N / 2;
  const gy = y - N / 2;
  return [ISO.cx + (gx - gy) * ISO.s * 0.866, ISO.cy + (gx + gy) * ISO.s * 0.5 - z * ISO.s];
};
const pts = (a: [number, number][]) => a.map((p) => p.join(",")).join(" ");
/** an iso box from (x,y) with size (w,d) and height h, base at z; faces: top, left (+y), right (+x) */
const Block: React.FC<{ x: number; y: number; w: number; d: number; h: number; z?: number; top: string; left: string; right: string; stroke?: string; sw?: number; glow?: string }> = ({ x, y, w, d, h, z = 0, top, left, right, stroke = "#2a2030", sw = 3, glow }) => {
  const t = [P(x, y, z + h), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x, y + d, z + h)];
  const l = [P(x, y + d, z + h), P(x + w, y + d, z + h), P(x + w, y + d, z), P(x, y + d, z)];
  const r = [P(x + w, y, z + h), P(x + w, y + d, z + h), P(x + w, y + d, z), P(x + w, y, z)];
  const st = { stroke, strokeWidth: sw, strokeLinejoin: "round" as const, filter: glow };
  return (
    <g>
      <polygon points={pts(l)} fill={left} {...st} />
      <polygon points={pts(r)} fill={right} {...st} />
      <polygon points={pts(t)} fill={top} {...st} />
    </g>
  );
};
/** an upright sign facing the camera, standing on (x,y) */
const Sign: React.FC<{ x: number; y: number; text: string; bg: string; fg: string; post: string; z?: number; glow?: string; w?: number }> = ({ x, y, text, bg, fg, post, z = 0, glow, w = 118 }) => {
  const [sx, sy] = P(x, y, z);
  return (
    <g filter={glow}>
      <rect x={sx - 4} y={sy - 70} width={8} height={70} fill={post} />
      <rect x={sx - w / 2} y={sy - 112} width={w} height={46} rx={9} fill={bg} stroke="#1c1420" strokeWidth={3.5} />
      <text x={sx} y={sy - 81} fill={fg} fontFamily="Poppins" fontWeight={800} fontSize={20} textAnchor="middle">
        {text}
      </text>
    </g>
  );
};
const Tree: React.FC<{ x: number; y: number; c: string; trunk: string }> = ({ x, y, c, trunk }) => {
  const [sx, sy] = P(x, y);
  return (
    <g>
      <rect x={sx - 6} y={sy - 40} width={12} height={40} fill={trunk} />
      <circle cx={sx} cy={sy - 62} r={34} fill={c} stroke="#1c3020" strokeWidth={4} />
    </g>
  );
};
const Crane: React.FC<{ col: string; dark: string; glow?: string }> = ({ col, dark, glow }) => {
  const [bx, by] = P(CRANE_AT.x + 0.5, CRANE_AT.y + 0.5);
  const top = by - 400;
  return (
    <g filter={glow} stroke={dark} strokeWidth={4}>
      <rect x={bx - 16} y={top} width={32} height={by - top} fill={col} />
      {Array.from({ length: 9 }, (_, i) => (
        <line key={i} x1={bx - 16} y1={top + i * 42} x2={bx + 16} y2={top + i * 42 + 42} />
      ))}
      <rect x={bx - 260} y={top - 10} width={360} height={26} fill={col} />
      <rect x={bx + 60} y={top + 16} width={46} height={40} fill={dark} />
      <line x1={bx - 220} y1={top + 16} x2={bx - 220} y2={top + 200} />
      <rect x={bx - 240} y={top + 200} width={40} height={30} fill={dark} />
    </g>
  );
};

// ------------------------------------------------------------------ the shared on-screen HUD (kept in the top 80%, left of IG's buttons)
const Hud: React.FC<{ title: string; accent: string; ink: string; pill: string; pillFg: string }> = ({ title, accent, ink, pill, pillFg }) => (
  <AbsoluteFill style={{ fontFamily: "Poppins" }}>
    <div style={{ position: "absolute", top: 120, left: 0, right: 0, textAlign: "center" }}>
      <div style={{ display: "inline-block", padding: "10px 30px", borderRadius: 40, background: pill, color: pillFg, fontWeight: 800, fontSize: 40, letterSpacing: 2 }}>DAY 0</div>
      <div style={{ marginTop: 18, fontWeight: 800, fontSize: 132, lineHeight: 1, color: accent, WebkitTextStroke: `12px ${ink}`, paintOrder: "stroke fill", textShadow: "0 10px 24px rgba(0,0,0,0.35)" }}>{title}</div>
      <div style={{ marginTop: 14, fontWeight: 700, fontSize: 44, color: "#ffffff", WebkitTextStroke: `8px ${ink}`, paintOrder: "stroke fill" }}>0 brands · 16 empty lots</div>
    </div>
    <div style={{ position: "absolute", top: 1430, left: 70, right: 150, textAlign: "center" }}>
      <div style={{ display: "inline-block", padding: "18px 34px", borderRadius: 28, background: "rgba(255,255,255,0.94)", color: "#1c1420", fontWeight: 800, fontSize: 50, boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}>
        @ your favorite brand 👇
      </div>
    </div>
  </AbsoluteFill>
);

// ------------------------------------------------------------------ look 1: toy town (bright, flat, floating island)
const Toy: React.FC = () => {
  const order = [...CELLS].sort((a, b) => a.x + a.y - (b.x + b.y));
  return (
    <AbsoluteFill style={{ background: "linear-gradient(#6ec8ff, #c8ecff 60%, #f2fbff)" }}>
      <svg width={1080} height={1920}>
        {[[180, 560, 1], [860, 470, 0.8], [640, 1500, 1.1], [150, 1350, 0.7]].map(([x, y, k], i) => (
          <g key={i} fill="#ffffff" opacity={0.9}>
            <ellipse cx={x} cy={y} rx={90 * k} ry={34 * k} />
            <ellipse cx={x + 50 * k} cy={y - 22 * k} rx={60 * k} ry={34 * k} />
            <ellipse cx={x - 46 * k} cy={y - 14 * k} rx={50 * k} ry={28 * k} />
          </g>
        ))}
        {/* the island: grass top, dirt sides */}
        <Block x={-0.25} y={-0.25} w={N + 0.5} d={N + 0.5} h={0.55} z={-0.55} top="#7fd36a" left="#9a6a44" right="#7a5034" sw={5} />
        {order.map((c) =>
          c.kind === "road" ? (
            <Block key={`${c.x}${c.y}`} x={c.x + 0.02} y={c.y + 0.02} w={0.96} d={0.96} h={0.02} top="#5d6070" left="#4a4d5a" right="#3e404c" sw={2} />
          ) : c.kind === "lot" ? (
            <Block key={`${c.x}${c.y}`} x={c.x + 0.08} y={c.y + 0.08} w={0.84} d={0.84} h={0.05} top="#d9b07a" left="#b88c58" right="#a07848" sw={3} />
          ) : null,
        )}
        {/* road dashes */}
        {[0.5, 1.5, 3.5, 4.5].map((v) => (
          <g key={v}>
            <polygon points={pts([P(2.47, v - 0.15, 0.03), P(2.53, v - 0.15, 0.03), P(2.53, v + 0.15, 0.03), P(2.47, v + 0.15, 0.03)])} fill="#ffe14d" />
            <polygon points={pts([P(v - 0.15, 2.47, 0.03), P(v + 0.15, 2.47, 0.03), P(v + 0.15, 2.53, 0.03), P(v - 0.15, 2.53, 0.03)])} fill="#ffe14d" />
          </g>
        ))}
        {/* city hall: the only building (yours) */}
        <Block x={0.12} y={0.12} w={0.76} d={0.76} h={0.9} top="#f4f0e6" left="#dcd2c0" right="#c8bca8" />
        <Block x={0.22} y={0.22} w={0.56} d={0.56} h={0.25} z={0.9} top="#ff7a59" left="#e05a3c" right="#c84a30" />
        <Sign x={0.5} y={0.95} text="CITY HALL" bg="#ffe14d" fg="#1c1420" post="#5a4030" z={0.05} w={170} />
        {/* park */}
        <Block x={4.08} y={4.08} w={0.84} d={0.84} h={0.05} top="#5fbf54" left="#4a9a40" right="#3e8636" />
        <Tree x={4.35} y={4.4} c="#3faa4a" trunk="#6a4430" />
        <Tree x={4.7} y={4.7} c="#56c45a" trunk="#6a4430" />
        <Crane col="#ffc93c" dark="#5a4030" />
        {order
          .filter((c) => c.kind === "lot")
          .map((c, i) => (
            <Sign key={i} x={c.x + 0.5} y={c.y + 0.6} text="FOR RENT" bg="#ffffff" fg="#e0283c" post="#7a5a40" z={0.05} />
          ))}
      </svg>
      <Hud title="BRAND CITY" accent="#ffe14d" ink="#1c1420" pill="#1c1420" pillFg="#ffe14d" />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ look 2: neon night (dark, glowing outlines, billboards)
const Neon: React.FC = () => {
  const order = [...CELLS].sort((a, b) => a.x + a.y - (b.x + b.y));
  const glow = "url(#glow)";
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 45%, #2a1d5c, #0d0a24 70%)" }}>
      <svg width={1080} height={1920}>
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {Array.from({ length: 70 }, (_, i) => (
          <circle key={i} cx={(i * 397) % 1080} cy={(i * 211) % 1900} r={i % 5 === 0 ? 3 : 1.6} fill="#ffffff" opacity={0.5 + (i % 3) * 0.2} />
        ))}
        <Block x={-0.25} y={-0.25} w={N + 0.5} d={N + 0.5} h={0.4} z={-0.4} top="#151033" left="#0f0b26" right="#0b081c" stroke="#7a5cff" sw={4} glow={glow} />
        {order.map((c) =>
          c.kind === "road" ? (
            <Block key={`${c.x}${c.y}`} x={c.x + 0.03} y={c.y + 0.03} w={0.94} d={0.94} h={0.01} top="#1d1740" left="#1d1740" right="#1d1740" stroke="#2fe0ff" sw={2} glow={glow} />
          ) : c.kind === "lot" ? (
            <Block key={`${c.x}${c.y}`} x={c.x + 0.1} y={c.y + 0.1} w={0.8} d={0.8} h={0.03} top="#241a4a" left="#1a1338" right="#150f2e" stroke="#ff3fb4" sw={3} glow={glow} />
          ) : null,
        )}
        <Block x={0.12} y={0.12} w={0.76} d={0.76} h={1.1} top="#3a2a7a" left="#2a1f5a" right="#211848" stroke="#ffe14d" sw={4} glow={glow} />
        <Block x={4.15} y={4.15} w={0.7} d={0.7} h={0.04} top="#123a2a" left="#0e2e22" right="#0b241a" stroke="#3dff9a" sw={3} glow={glow} />
        <Sign x={0.5} y={0.95} text="CITY HALL" bg="#ffe14d" fg="#1c1420" post="#ffe14d" z={0.05} w={170} glow={glow} />
        <Crane col="#2a1f5a" dark="#2fe0ff" glow={glow} />
        {order
          .filter((c) => c.kind === "lot")
          .map((c, i) => (
            <Sign key={i} x={c.x + 0.5} y={c.y + 0.6} text="YOUR LOGO" bg="#160f33" fg="#ff3fb4" post="#ff3fb4" z={0.03} glow={glow} />
          ))}
      </svg>
      <Hud title="BRAND CITY" accent="#2fe0ff" ink="#0d0a24" pill="#ff3fb4" pillFg="#ffffff" />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ look 3: 3D toon (the package video's look)
const T = 1.4; // metres per cell
const cellPos = (x: number, y: number, up = 0): V3 => [(x - (N - 1) / 2) * T, up, (y - (N - 1) / 2) * T];
const Toon3D: React.FC = () => (
  <AbsoluteFill style={{ background: "#7cc6f0" }}>
    <View mood="day" cam={{ pos: [13.5, 12.5, 13.5], look: [0, 0.6, 0], fov: 36, roll: 0 }} t={0} focus={[0, 0, 0]} blur={0}>
      <M g={boxG(N * T + 0.6, 0.4, N * T + 0.6)} c="#7fcf6a" tex="grass" p={[0, -0.2, 0]} />
      {CELLS.map((c) => {
        const k = `${c.x}${c.y}`;
        if (c.kind === "road") return <M key={k} g={boxG(T, 0.02, T)} c="#5d6070" tex="stone" p={cellPos(c.x, c.y, 0.01)} cast={false} />;
        if (c.kind === "lot")
          return (
            <group key={k}>
              <M g={boxG(T * 0.84, 0.05, T * 0.84)} c="#d6ad78" tex="sand" p={cellPos(c.x, c.y, 0.025)} cast={false} />
              <M g={cylG(0.025, 0.025, 0.6, 8)} c="#7a5a40" tex="wood" p={cellPos(c.x, c.y + 0.18, 0.3)} />
              <Label text="FOR RENT" p={[cellPos(c.x, c.y)[0], 0.7, cellPos(c.x, c.y)[2] + 0.27]} r={[0, Math.PI / 4, 0]} w={0.8} h={0.24} fg="#e0283c" bg="#ffffff" font={0.62} />
            </group>
          );
        if (c.kind === "hall")
          return (
            <group key={k}>
              <M g={boxG(T * 0.8, 1.1, T * 0.8)} c="#f4f0e6" tex="plaster" p={cellPos(c.x, c.y, 0.55)} />
              <M g={coneG(T * 0.62, 0.55, 4)} c="#e05a3c" tex="roofTiles" p={cellPos(c.x, c.y, 1.37)} r={[0, Math.PI / 4, 0]} />
              <Label text="CITY HALL" p={[cellPos(c.x, c.y)[0] + 0.45, 0.78, cellPos(c.x, c.y)[2] + 0.45]} r={[0, Math.PI / 4, 0]} w={0.9} h={0.2} fg="#1c1420" bg="#ffe14d" font={0.62} />
            </group>
          );
        return (
          <group key={k}>
            <M g={boxG(T * 0.84, 0.06, T * 0.84)} c="#5fbf54" tex="grass" p={cellPos(c.x, c.y, 0.03)} cast={false} />
            {[
              [-0.25, -0.2],
              [0.25, 0.22],
            ].map(([dx, dz], i) => (
              <group key={i}>
                <M g={cylG(0.05, 0.06, 0.4, 8)} c="#6a4430" tex="wood" p={[cellPos(c.x, c.y)[0] + dx, 0.2, cellPos(c.x, c.y)[2] + dz]} />
                <M g={sphG(0.3, 14)} c="#3faa4a" p={[cellPos(c.x, c.y)[0] + dx, 0.62, cellPos(c.x, c.y)[2] + dz]} />
              </group>
            ))}
          </group>
        );
      })}
      {/* the crane */}
      <group position={cellPos(CRANE_AT.x, CRANE_AT.y)}>
        <M g={boxG(0.16, 3.2, 0.16)} c="#ffc93c" tex="metal" p={[0, 1.6, 0]} />
        <M g={boxG(2.4, 0.12, 0.14)} c="#ffc93c" tex="metal" p={[-0.6, 3.2, 0]} />
        <M g={boxG(0.3, 0.26, 0.3)} c="#5a4030" p={[0.45, 3.0, 0]} />
        <M g={cylG(0.01, 0.01, 1.0, 6)} c="#2a2030" p={[-1.5, 2.65, 0]} />
        <M g={boxG(0.2, 0.15, 0.2)} c="#5a4030" p={[-1.5, 2.1, 0]} />
      </group>
    </View>
    <Hud title="BRAND CITY" accent="#ffe14d" ink="#1c1420" pill="#1c1420" pillFg="#ffe14d" />
  </AbsoluteFill>
);

export const CityLook: React.FC<{ look: CityLookId }> = ({ look }) => {
  const ready = useFonts();
  if (!ready) return <AbsoluteFill style={{ background: "#1a1220" }} />;
  return look === "toy" ? <Toy /> : look === "neon" ? <Neon /> : <Toon3D />;
};
