// Brand City — round 2 looks: more realistic and professional (stills). Detailed isometric SVG: sidewalks, crosswalks,
// lane markings, cars, street lamps, construction hoardings on each lot, a glass city-hall tower, cast shadows, and a
// clean broadcast-style HUD. Three themes over the same plan: "model" (architectural scale model), "golden" (realistic
// golden hour), "dusk" (premium night). Flat SVG keeps daily episodes fast to render.
import React from "react";
import { AbsoluteFill } from "remotion";
import { useFonts } from "../inkbeat/core/frame";

export type CityProId = "model" | "golden" | "dusk";

export type Theme = {
  bg: string;
  slab: [string, string, string];
  road: string;
  mark: string;
  walk: string;
  curb: string;
  lot: string;
  fence: string;
  board: string;
  boardFg: string;
  boardAccent: string;
  tower: [string, string, string];
  win: string;
  winLit: string;
  lit: number; // share of lit windows
  grass: string;
  tree: [string, string];
  trunk: string;
  cars: string[];
  crane: string;
  shadow: string;
  shadowOp: number;
  sun: [number, number]; // shadow offset per unit height, in grid units
  lamp: string;
  lampGlow: number;
  edge: string;
  hud: { ink: string; sub: string; panel: string; panelInk: string; accent: string; cta: string; ctaInk: string };
  extra?: React.ReactNode;
};

export const THEMES: Record<CityProId, Theme> = {
  model: {
    bg: "linear-gradient(#eef1f4, #dfe4ea 55%, #cfd6de)",
    slab: ["#f7f7f5", "#e2e2de", "#d2d2cd"],
    road: "#c9ccd2",
    mark: "#ffffff",
    walk: "#ecebe7",
    curb: "#d9d8d3",
    lot: "#e6e1d6",
    fence: "#bfc3c9",
    board: "#ffffff",
    boardFg: "#20242c",
    boardAccent: "#ff5a36",
    tower: ["#f9fafb", "#e3e7ec", "#d3d9e0"],
    win: "#b9c7d6",
    winLit: "#b9c7d6",
    lit: 0,
    grass: "#d6e3cf",
    tree: ["#c4d8bc", "#a9c4a0"],
    trunk: "#b9b1a5",
    cars: ["#ffffff", "#ff5a36", "#ffffff", "#20242c"],
    crane: "#ff5a36",
    shadow: "#7d8796",
    shadowOp: 0.22,
    sun: [0.55, -0.15],
    lamp: "#9aa1ab",
    lampGlow: 0,
    edge: "rgba(40,48,60,0.35)",
    hud: { ink: "#1b2029", sub: "#5b6575", panel: "rgba(255,255,255,0.8)", panelInk: "#1b2029", accent: "#ff5a36", cta: "#1b2029", ctaInk: "#ffffff" },
  },
  golden: {
    bg: "linear-gradient(#5f8fc9, #a9c3dd 40%, #f6c99a 75%, #f3a978)",
    slab: ["#6aa556", "#5b4636", "#4a382b"],
    road: "#4a4d55",
    mark: "#f2f2ea",
    walk: "#cfc8bb",
    curb: "#b7ae9f",
    lot: "#b9905f",
    fence: "#d6d2c8",
    board: "#14181f",
    boardFg: "#ffffff",
    boardAccent: "#ffb23e",
    tower: ["#dfe8f0", "#8fb2cf", "#6b8eaa"],
    win: "#5c7f9c",
    winLit: "#ffd88a",
    lit: 0.12,
    grass: "#6db35a",
    tree: ["#4f9a45", "#3a7d36"],
    trunk: "#5a3e2a",
    cars: ["#d33b2c", "#f2f2ea", "#2c5aa0", "#f0b429"],
    crane: "#f0b429",
    shadow: "#2a2440",
    shadowOp: 0.32,
    sun: [0.95, -0.25],
    lamp: "#2a2c33",
    lampGlow: 0,
    edge: "rgba(20,16,30,0.45)",
    hud: { ink: "#ffffff", sub: "rgba(255,255,255,0.85)", panel: "rgba(20,24,31,0.55)", panelInk: "#ffffff", accent: "#ffb23e", cta: "#ffffff", ctaInk: "#14181f" },
  },
  dusk: {
    bg: "linear-gradient(#0b1530, #1a2a55 45%, #3b3a6e 75%, #6a4a7a)",
    slab: ["#2b3a52", "#1a2436", "#141c2b"],
    road: "#232a38",
    mark: "#c9d2e0",
    walk: "#3a4558",
    curb: "#4a566b",
    lot: "#33302f",
    fence: "#59647a",
    board: "#0d1220",
    boardFg: "#ffffff",
    boardAccent: "#36d6ff",
    tower: ["#3a4c6e", "#24345a", "#1b2848"],
    win: "#22305a",
    winLit: "#ffd27a",
    lit: 0.55,
    grass: "#2f5a45",
    tree: ["#2d5c44", "#224634"],
    trunk: "#2a221c",
    cars: ["#d33b2c", "#c9d2e0", "#36d6ff", "#f0b429"],
    crane: "#f0b429",
    shadow: "#05070f",
    shadowOp: 0.35,
    sun: [-0.45, -0.35],
    lamp: "#1a1f2b",
    lampGlow: 1,
    edge: "rgba(0,0,0,0.5)",
    hud: { ink: "#ffffff", sub: "rgba(220,228,245,0.8)", panel: "rgba(10,16,32,0.6)", panelInk: "#ffffff", accent: "#36d6ff", cta: "#ffffff", ctaInk: "#0d1220" },
  },
};

// ------------------------------------------------------------------ the plan
const N = 5;
const ROAD = (v: number) => v === 2;
type Cell = { x: number; y: number; kind: "road" | "lot" | "hall" | "park" | "crane" };
const CELLS: Cell[] = [];
let lotNo = 0;
const LOT_NO = new Map<string, number>();
for (let y = 0; y < N; y++)
  for (let x = 0; x < N; x++) {
    const kind: Cell["kind"] = ROAD(x) || ROAD(y) ? "road" : x === 0 && y === 0 ? "hall" : x === 4 && y === 4 ? "park" : x === 3 && y === 0 ? "crane" : "lot";
    CELLS.push({ x, y, kind });
    if (kind === "lot" || kind === "crane") LOT_NO.set(`${x},${y}`, ++lotNo);
  }

// ------------------------------------------------------------------ projection
const S = 124;
const CX = 540;
const CY = 1050;
const P = (x: number, y: number, z = 0): [number, number] => {
  const gx = x - N / 2;
  const gy = y - N / 2;
  return [CX + (gx - gy) * S * 0.866, CY + (gx + gy) * S * 0.5 - z * S];
};
const pts = (a: [number, number][]) => a.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
const hull = (p: [number, number][]) => {
  const a = [...p].sort((u, v) => u[0] - v[0] || u[1] - v[1]);
  const cr = (o: number[], u: number[], v: number[]) => (u[0] - o[0]) * (v[1] - o[1]) - (u[1] - o[1]) * (v[0] - o[0]);
  const lo: [number, number][] = [];
  for (const q of a) {
    while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop();
    lo.push(q);
  }
  const up: [number, number][] = [];
  for (const q of [...a].reverse()) {
    while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop();
    up.push(q);
  }
  return [...lo.slice(0, -1), ...up.slice(0, -1)];
};

/** a flat quad on the ground plane at height z */
const Quad: React.FC<{ x: number; y: number; w: number; d: number; z?: number; fill: string; stroke?: string; sw?: number; op?: number }> = ({ x, y, w, d, z = 0, fill, stroke, sw = 1.5, op }) => (
  <polygon points={pts([P(x, y, z), P(x + w, y, z), P(x + w, y + d, z), P(x, y + d, z)])} fill={fill} stroke={stroke} strokeWidth={sw} opacity={op} />
);
/** a box: top, left (+y face) and right (+x face) */
const Box: React.FC<{ x: number; y: number; w: number; d: number; h: number; z?: number; c: [string, string, string]; edge?: string }> = ({ x, y, w, d, h, z = 0, c, edge }) => (
  <g stroke={edge} strokeWidth={edge ? 1.2 : 0} strokeLinejoin="round">
    <polygon points={pts([P(x, y + d, z + h), P(x + w, y + d, z + h), P(x + w, y + d, z), P(x, y + d, z)])} fill={c[1]} />
    <polygon points={pts([P(x + w, y, z + h), P(x + w, y + d, z + h), P(x + w, y + d, z), P(x + w, y, z)])} fill={c[2]} />
    <polygon points={pts([P(x, y, z + h), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x, y + d, z + h)])} fill={c[0]} />
  </g>
);
/** the cast shadow of a box on the ground */
const Shadow: React.FC<{ x: number; y: number; w: number; d: number; h: number; t: Theme }> = ({ x, y, w, d, h, t }) => {
  const [sx, sy] = t.sun;
  const base: [number, number][] = [
    [x, y],
    [x + w, y],
    [x + w, y + d],
    [x, y + d],
  ];
  const all = [...base, ...base.map(([a, b]) => [a + sx * h, b + sy * h] as [number, number])].map(([a, b]) => P(a, b, 0.001));
  return <polygon points={pts(hull(all))} fill={t.shadow} opacity={t.shadowOp} />;
};
/** text painted on the +y face (runs along x) or the +x face (runs along -y), in px of the face */
const faceMatrix = (face: "L" | "R", x: number, y: number, z: number) => {
  const [ox, oy] = P(x, y, z);
  return face === "L" ? `matrix(0.866 0.5 0 1 ${ox} ${oy})` : `matrix(0.866 -0.5 0 1 ${ox} ${oy})`;
};

// ------------------------------------------------------------------ props
const Lot: React.FC<{ c: Cell; t: Theme }> = ({ c, t }) => {
  const { x, y } = c;
  const n = LOT_NO.get(`${x},${y}`) ?? 0;
  const i = 0.14; // inset from the sidewalk
  const H = 0.36; // hoarding height
  const L = 1 - 2 * i;
  const len = L * S; // px along a face
  const hpx = H * S;
  return (
    <g>
      <Quad x={x + i} y={y + i} w={L} d={L} z={0.02} fill={t.lot} />
      {/* back fence (thin) */}
      <polygon points={pts([P(x + i, y + i, 0.02), P(x + i + L, y + i, 0.02), P(x + i + L, y + i, 0.2), P(x + i, y + i, 0.2)])} fill={t.fence} opacity={0.7} />
      <polygon points={pts([P(x + i, y + i, 0.02), P(x + i, y + i + L, 0.02), P(x + i, y + i + L, 0.2), P(x + i, y + i, 0.2)])} fill={t.fence} opacity={0.55} />
      {/* front hoardings: left face carries the lot number, right face says AVAILABLE */}
      <Box x={x + i} y={y + i + L - 0.02} w={L} d={0.02} h={H} z={0.02} c={[t.board, t.board, t.board]} edge={t.edge} />
      <Box x={x + i + L - 0.02} y={y + i} w={0.02} d={L} h={H} z={0.02} c={[t.board, t.board, t.board]} edge={t.edge} />
      <g transform={faceMatrix("L", x + i, y + i + L, 0.02 + H)}>
        <rect x={0} y={hpx - 9} width={len} height={9} fill={t.boardAccent} />
        <text x={len / 2} y={hpx * 0.62} fill={t.boardFg} fontFamily="Poppins" fontWeight={700} fontSize={16} letterSpacing={1.5} textAnchor="middle">
          LOT {String(n).padStart(2, "0")}
        </text>
      </g>
      <g transform={faceMatrix("R", x + i + L, y + i + L, 0.02 + H)}>
        <rect x={0} y={hpx - 9} width={len} height={9} fill={t.boardAccent} />
        <text x={len / 2} y={hpx * 0.56} fill={t.boardAccent} fontFamily="Poppins" fontWeight={700} fontSize={11.5} letterSpacing={1} textAnchor="middle">
          AVAILABLE
        </text>
      </g>
    </g>
  );
};

const Tower: React.FC<{ t: Theme }> = ({ t }) => {
  const x = 0.16;
  const y = 0.16;
  const w = 0.68;
  const h = 2.3;
  const rows = 14;
  const cols = 5;
  const win = (face: "L" | "R") =>
    Array.from({ length: rows * cols }, (_, k) => {
      const r = Math.floor(k / cols);
      const c = k % cols;
      const lit = ((k * 37 + (face === "L" ? 11 : 5)) % 100) / 100 < t.lit;
      const fw = w / cols;
      const u0 = c * fw + fw * 0.18;
      const u1 = (c + 1) * fw - fw * 0.18;
      const z0 = 0.18 + r * ((h - 0.32) / rows) + 0.03;
      const z1 = z0 + (h - 0.32) / rows - 0.06;
      const q: [number, number][] =
        face === "L"
          ? [P(x + u0, y + w, z0), P(x + u1, y + w, z0), P(x + u1, y + w, z1), P(x + u0, y + w, z1)]
          : [P(x + w, y + w - u0, z0), P(x + w, y + w - u1, z0), P(x + w, y + w - u1, z1), P(x + w, y + w - u0, z1)];
      return <polygon key={`${face}${k}`} points={pts(q)} fill={lit ? t.winLit : t.win} opacity={face === "R" ? 0.85 : 1} />;
    });
  return (
    <g>
      <Box x={x - 0.04} y={y - 0.04} w={w + 0.08} d={w + 0.08} h={0.14} c={[t.walk, t.curb, t.curb]} edge={t.edge} />
      <Box x={x} y={y} w={w} d={w} h={h} z={0.14} c={t.tower} edge={t.edge} />
      {win("L")}
      {win("R")}
      <Box x={x + 0.08} y={y + 0.08} w={w - 0.16} d={w - 0.16} h={0.12} z={0.14 + h} c={[t.tower[1], t.tower[2], t.tower[2]]} edge={t.edge} />
    </g>
  );
};

const Tree: React.FC<{ x: number; y: number; t: Theme; k?: number }> = ({ x, y, t, k = 1 }) => {
  const [sx, sy] = P(x, y);
  return (
    <g>
      <ellipse cx={sx + 22 * k} cy={sy + 4} rx={30 * k} ry={12 * k} fill={t.shadow} opacity={t.shadowOp} />
      <rect x={sx - 3 * k} y={sy - 30 * k} width={6 * k} height={30 * k} fill={t.trunk} />
      <circle cx={sx} cy={sy - 46 * k} r={24 * k} fill={t.tree[1]} />
      <circle cx={sx - 6 * k} cy={sy - 52 * k} r={18 * k} fill={t.tree[0]} />
    </g>
  );
};

const Car: React.FC<{ x: number; y: number; along: "x" | "y"; c: string; t: Theme }> = ({ x, y, along, c, t }) => {
  const [w, d] = along === "x" ? [0.3, 0.15] : [0.15, 0.3];
  return (
    <g>
      <Shadow x={x} y={y} w={w} d={d} h={0.1} t={t} />
      <Box x={x} y={y} w={w} d={d} h={0.07} c={[c, c, c]} edge={t.edge} />
      <Box x={x + (along === "x" ? 0.07 : 0.02)} y={y + (along === "x" ? 0.02 : 0.07)} w={along === "x" ? 0.15 : 0.11} d={along === "x" ? 0.11 : 0.15} h={0.05} z={0.07} c={["#2a3140", "#3a4456", "#323b4c"]} />
    </g>
  );
};

const Lamp: React.FC<{ x: number; y: number; t: Theme }> = ({ x, y, t }) => {
  const [bx, by] = P(x, y);
  const [, hy] = P(x, y, 0.55);
  return (
    <g>
      {t.lampGlow ? <circle cx={bx} cy={hy} r={46} fill="url(#lampGlow)" /> : null}
      {t.lampGlow ? <ellipse cx={bx} cy={by} rx={52} ry={26} fill="#ffd27a" opacity={0.18} /> : null}
      <rect x={bx - 2} y={hy} width={4} height={by - hy} fill={t.lamp} />
      <rect x={bx - 9} y={hy - 4} width={18} height={6} rx={2} fill={t.lampGlow ? "#fff1c4" : t.lamp} />
    </g>
  );
};

const Crane: React.FC<{ t: Theme }> = ({ t }) => {
  const [bx, by] = P(3.5, 0.5, 0.02);
  const top = by - 430;
  return (
    <g>
      <g stroke={t.crane} strokeWidth={3}>
        <line x1={bx - 12} y1={by} x2={bx - 12} y2={top} />
        <line x1={bx + 12} y1={by} x2={bx + 12} y2={top} />
        {Array.from({ length: 16 }, (_, i) => (
          <line key={i} x1={bx - 12} y1={by - i * 27} x2={bx + 12} y2={by - (i + 1) * 27} strokeWidth={2} />
        ))}
        <line x1={bx - 250} y1={top} x2={bx + 90} y2={top} strokeWidth={5} />
        <line x1={bx - 250} y1={top + 14} x2={bx + 90} y2={top + 14} strokeWidth={2} />
        {Array.from({ length: 13 }, (_, i) => (
          <line key={i} x1={bx - 250 + i * 26} y1={top} x2={bx - 237 + i * 26} y2={top + 14} strokeWidth={1.5} />
        ))}
        <line x1={bx} y1={top - 50} x2={bx - 240} y2={top} strokeWidth={1.5} />
        <line x1={bx} y1={top - 50} x2={bx + 80} y2={top} strokeWidth={1.5} />
        <line x1={bx - 190} y1={top + 14} x2={bx - 190} y2={top + 170} strokeWidth={1.2} />
      </g>
      <rect x={bx + 50} y={top + 4} width={38} height={30} fill={t.edge} />
      <rect x={bx - 205} y={top + 170} width={30} height={22} fill={t.crane} />
      <rect x={bx - 20} y={top + 14} width={26} height={22} fill={t.crane} />
    </g>
  );
};

// ------------------------------------------------------------------ the HUD (clean, broadcast style; top 80%, left of IG buttons)
export const Hud: React.FC<{ t: Theme }> = ({ t }) => {
  const h = t.hud;
  return (
    <AbsoluteFill style={{ fontFamily: "Poppins" }}>
      <div style={{ position: "absolute", top: 118, left: 80, right: 80, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, color: h.sub, fontWeight: 600, fontSize: 30, letterSpacing: 8 }}>
          <div style={{ width: 60, height: 2, background: h.accent }} />
          EPISODE 0
          <div style={{ width: 60, height: 2, background: h.accent }} />
        </div>
        <div style={{ marginTop: 12, color: h.ink, fontWeight: 800, fontSize: 118, letterSpacing: 4, lineHeight: 1 }}>
          BRAND<span style={{ color: h.accent }}>CITY</span>
        </div>
        <div style={{ marginTop: 26, display: "flex", gap: 0, background: h.panel, borderRadius: 18, overflow: "hidden", backdropFilter: "blur(8px)", boxShadow: "0 10px 30px rgba(0,0,0,0.15)" }}>
          {[
            ["0", "BRANDS"],
            ["16", "LOTS OPEN"],
            ["1", "CITY HALL"],
          ].map(([v, k], i) => (
            <div key={k} style={{ padding: "16px 34px", textAlign: "center", borderLeft: i ? `1px solid ${h.sub}` : undefined }}>
              <div style={{ color: h.panelInk, fontWeight: 700, fontSize: 46, lineHeight: 1 }}>{v}</div>
              <div style={{ color: h.sub, fontWeight: 600, fontSize: 18, letterSpacing: 3, marginTop: 6 }}>{k}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ position: "absolute", top: 1440, left: 80, right: 160, display: "flex", justifyContent: "center" }}>
        <div style={{ padding: "20px 38px", borderRadius: 999, background: h.cta, color: h.ctaInk, fontWeight: 700, fontSize: 40, letterSpacing: 0.5, boxShadow: "0 12px 30px rgba(0,0,0,0.25)" }}>
          Tag your favorite brand <span style={{ color: h.accent }}>↓</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ the scene
const Scene: React.FC<{ t: Theme }> = ({ t }) => {
  const byDepth = [...CELLS].sort((a, b) => a.x + a.y - (b.x + b.y));
  const pad = 0.3;
  return (
    <svg width={1080} height={1920}>
      <defs>
        <radialGradient id="lampGlow">
          <stop offset="0" stopColor="#ffe3a0" stopOpacity={0.9} />
          <stop offset="1" stopColor="#ffe3a0" stopOpacity={0} />
        </radialGradient>
        <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
      </defs>
      {/* ground shadow under the slab */}
      <polygon points={pts([P(-pad + 0.3, -pad + 0.2, -0.55), P(N + pad + 0.3, -pad + 0.2, -0.55), P(N + pad + 0.3, N + pad + 0.2, -0.55), P(-pad + 0.3, N + pad + 0.2, -0.55)])} fill="#000" opacity={0.25} filter="url(#soft)" />
      <Box x={-pad} y={-pad} w={N + 2 * pad} d={N + 2 * pad} h={0.4} z={-0.4} c={t.slab} edge={t.edge} />
      {/* sidewalks under every non-road cell, roads with markings */}
      {CELLS.map((c) =>
        c.kind === "road" ? (
          <Quad key={`r${c.x}${c.y}`} x={c.x} y={c.y} w={1} d={1} fill={t.road} />
        ) : (
          <Box key={`w${c.x}${c.y}`} x={c.x + 0.03} y={c.y + 0.03} w={0.94} d={0.94} h={0.03} c={[t.walk, t.curb, t.curb]} edge={t.edge} />
        ),
      )}
      {[0, 1, 3, 4].map((v) => (
        <g key={v}>
          {[0.2, 0.6].map((o) => (
            <g key={o}>
              <Quad x={2.485} y={v + o} w={0.03} d={0.2} z={0.002} fill={t.mark} />
              <Quad x={v + o} y={2.485} w={0.2} d={0.03} z={0.002} fill={t.mark} />
            </g>
          ))}
        </g>
      ))}
      {/* crosswalks around the central intersection */}
      {Array.from({ length: 6 }, (_, k) => (
        <g key={k}>
          <Quad x={2.08 + k * 0.145} y={1.86} w={0.07} d={0.12} z={0.003} fill={t.mark} />
          <Quad x={2.08 + k * 0.145} y={3.02} w={0.07} d={0.12} z={0.003} fill={t.mark} />
          <Quad x={1.86} y={2.08 + k * 0.145} w={0.12} d={0.07} z={0.003} fill={t.mark} />
          <Quad x={3.02} y={2.08 + k * 0.145} w={0.12} d={0.07} z={0.003} fill={t.mark} />
        </g>
      ))}
      {/* shadows first, then everything in depth order */}
      <Shadow x={0.16} y={0.16} w={0.68} d={0.68} h={2.45} t={t} />
      {byDepth.map((c) => {
        const k = `${c.x}${c.y}`;
        if (c.kind === "lot") return <Lot key={k} c={c} t={t} />;
        if (c.kind === "crane")
          return (
            <g key={k}>
              <Lot c={c} t={t} />
            </g>
          );
        if (c.kind === "hall") return <Tower key={k} t={t} />;
        if (c.kind === "park")
          return (
            <g key={k}>
              <Quad x={c.x + 0.1} y={c.y + 0.1} w={0.8} d={0.8} z={0.031} fill={t.grass} />
              <Tree x={c.x + 0.3} y={c.y + 0.35} t={t} />
              <Tree x={c.x + 0.68} y={c.y + 0.3} t={t} k={0.85} />
              <Tree x={c.x + 0.45} y={c.y + 0.75} t={t} k={1.1} />
            </g>
          );
        return null;
      })}
      <Car x={2.12} y={0.3} along="y" c={t.cars[0]} t={t} />
      <Car x={2.58} y={3.6} along="y" c={t.cars[1]} t={t} />
      <Car x={0.5} y={2.58} along="x" c={t.cars[2]} t={t} />
      <Car x={3.9} y={2.12} along="x" c={t.cars[3]} t={t} />
      {[
        [1.97, 1.97],
        [3.03, 1.97],
        [1.97, 3.03],
        [3.03, 3.03],
      ].map(([x, y]) => (
        <Lamp key={`${x}${y}`} x={x} y={y} t={t} />
      ))}
      <Crane t={t} />
    </svg>
  );
};

export const CityPro: React.FC<{ look: CityProId }> = ({ look }) => {
  const ready = useFonts();
  const t = THEMES[look];
  if (!ready) return <AbsoluteFill style={{ background: "#1a1220" }} />;
  return (
    <AbsoluteFill style={{ background: t.bg }}>
      {look === "dusk" ? (
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          {Array.from({ length: 80 }, (_, i) => (
            <circle key={i} cx={(i * 397) % 1080} cy={(i * 211) % 900} r={i % 6 === 0 ? 2.2 : 1.2} fill="#ffffff" opacity={0.35 + (i % 3) * 0.2} />
          ))}
        </svg>
      ) : null}
      {look === "golden" ? <AbsoluteFill style={{ background: "radial-gradient(circle at 15% 70%, rgba(255,220,160,0.55), rgba(255,220,160,0) 45%)" }} /> : null}
      <Scene t={t} />
      <Hud t={t} />
    </AbsoluteFill>
  );
};
