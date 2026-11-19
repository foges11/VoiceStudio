// Brand City — Episode 0 (≈20.8 s, the creator's own voice-over). Every shot is cut on a phrase of the recorded VO
// (word timings in ep0-words.json, from a forced transcript). Calm camera: slow pushes, one orbit, one low angle,
// a dolly, a crane back out; easing on every move, nothing bouncy. The demo tower and house are "planning previews"
// (translucent), so the video never implies a brand has joined; they fade away before the end, and the last frame
// matches the first so the Short loops.
import React, { useMemo } from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useFonts } from "../inkbeat/core/frame";
import { BLOCK, City, HALF, Lights, PITCH, ROAD, WALK } from "./CityReal";
import WORDS from "./ep0-words.json";

export const EP0_FPS = 30;
export const EP0_FRAMES = Math.round(20.8 * EP0_FPS);

type V3 = [number, number, number];
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = (u: number) => {
  const x = clamp(u);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};
const easeOut = (u: number) => 1 - Math.pow(1 - clamp(u), 3);
const ramp = (t: number, a: number, b: number) => ease((t - a) / (b - a));
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const mixV = (a: V3, b: V3, u: number): V3 => [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)];
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

// ------------------------------------------------------------------ places in the city (see CityReal's layout)
const blockCenter = (bx: number, bz: number): V3 => [-HALF + ROAD / 2 + bx * PITCH + BLOCK / 2, 0, -HALF + ROAD / 2 + bz * PITCH + BLOCK / 2];
const INNER = BLOCK - 2 * WALK;
const LOT01: V3 = add(blockCenter(4, 3), [-INNER / 4, 0, INNER / 4]); // the lot right next to City Hall
const SUBURB: [number, number] = [5, 5];
const SB = blockCenter(...SUBURB);
const PLOT = INNER / 4;
const HOUSE: V3 = add(SB, [-INNER / 2 + PLOT * 2.5, 0, -INNER / 2 + PLOT * 3.5]);

// ------------------------------------------------------------------ the voice: phrases for captions
type W = [number, number, string];
const words: W[] = (WORDS as W[]).map(([a, b, w]) => {
  if (w === "day") return [a, b, "Day"];
  if (w === "first") return [a, b, "first,"];
  if (w === "emoji") return [a, b, "emoji,"];
  if (w === "one.") return [a, b, "1."];
  if (w === "Brand") return [19.6, b, w]; // the real onset after the pause
  return [a, b, w];
});
const GROUPS = [4, 4, 3, 6, 5, 4, 3, 4, 5, 3, 3, 4, 2, 4, 4, 6, 5, 3, 4];
const PHRASES: W[][] = (() => {
  const out: W[][] = [];
  let i = 0;
  for (const n of GROUPS) {
    out.push(words.slice(i, i + n));
    i += n;
  }
  if (i < words.length) out.push(words.slice(i));
  return out;
})();

// ------------------------------------------------------------------ camera
type Cam = { pos: V3; look: V3; fov: number };
const WIDE: Cam = { pos: [31, 37, 35], look: [-1, 0, 1], fov: 38 };
const camAt = (t: number): Cam => {
  // S1 0–3.3: the establishing wide, a slow push
  if (t < 3.3) {
    const u = ramp(t, 0, 3.3);
    return { pos: mixV(WIDE.pos, [25, 29, 28], u), look: mixV(WIDE.look, [2, 0, 1.2], u), fov: 38 };
  }
  // S2 3.3–6.1: continuous glide down to LOT 01
  if (t < 6.1) {
    const u = ramp(t, 3.3, 6.0);
    return { pos: mixV([25, 29, 28], add(LOT01, [8, 6.5, 9]), u), look: mixV([2, 0, 1.2], add(LOT01, [0, 0.4, 0]), u), fov: lerp(38, 34, u) };
  }
  // S3 6.1–9.75: cut; a slow orbit around the lot while the preview tower rises
  if (t < 9.75) {
    const u = (t - 6.1) / 3.65;
    const a = lerp(0.35, 0.95, ease(u));
    const r = 12;
    return { pos: add(LOT01, [Math.cos(a) * r, 8.2, Math.sin(a) * r]), look: add(LOT01, [0, 1.4, 0]), fov: 36 };
  }
  // S4 9.75–12.6: cut; low angle, tilting up as the tower grows
  if (t < 12.6) {
    const u = ramp(t, 9.75, 12.6);
    return { pos: add(LOT01, [lerp(8.3, 17, u), lerp(1.3, 2.0, u), 3.075]), look: add(LOT01, [0, lerp(2.2, 6.0, u), 0]), fov: 50 };
  }
  // S5 12.6–16.05: cut; the suburbs, a slow dolly toward the citizen's plot
  if (t < 16.05) {
    const u = ramp(t, 12.6, 16.05);
    return { pos: mixV(add(HOUSE, [4.2, 2.4, 5.0]), add(HOUSE, [2.9, 1.6, 3.5]), u), look: add(HOUSE, [0, 0.8, 0]), fov: 40 };
  }
  // S6–S7 16.05–20.8: crane up and back out to the opening wide (= frame 0, so the Short loops)
  const u = ramp(t, 16.05, 19.9);
  const from: Cam = { pos: add(HOUSE, [2.9, 1.6, 3.5]), look: add(HOUSE, [0, 0.8, 0]), fov: 40 };
  // lift first, then travel: an arc reads better than a straight line
  const lift: V3 = [from.pos[0] + 4, from.pos[1] + 14, from.pos[2] + 4];
  const p = u < 0.5 ? mixV(from.pos, lift, ease(u * 2)) : mixV(lift, WIDE.pos, ease(u * 2 - 1));
  return { pos: p, look: mixV(from.look, WIDE.look, u), fov: lerp(from.fov, WIDE.fov, u) };
};

const CamRig: React.FC<{ t: number }> = ({ t }) => {
  const { camera, scene } = useThree();
  const c = camera as THREE.PerspectiveCamera;
  const k = camAt(t);
  c.fov = k.fov;
  c.near = 0.3;
  c.far = 400;
  c.position.set(...k.pos);
  c.lookAt(...k.look);
  c.updateProjectionMatrix();
  if (!scene.fog) {
    scene.fog = new THREE.Fog("#cfe3f2", 70, 150);
    scene.background = new THREE.Color("#cfe3f2");
  }
  return null;
};

// ------------------------------------------------------------------ preview objects
const textTex = (lines: { text: string; size: number; color: string; weight?: number }[], w: number, h: number, bg?: string, radius = 0) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  if (bg) {
    g.fillStyle = bg;
    g.beginPath();
    g.roundRect(0, 0, w, h, radius);
    g.fill();
  }
  const total = lines.reduce((s, l) => s + l.size * 1.2, 0);
  let y = (h - total) / 2;
  for (const l of lines) {
    g.font = `${l.weight ?? 700} ${l.size}px Poppins`;
    g.fillStyle = l.color;
    g.textAlign = "center";
    g.textBaseline = "top";
    g.fillText(l.text, w / 2, y + l.size * 0.1);
    y += l.size * 1.2;
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};

const Sprite: React.FC<{ tex: THREE.Texture; p: V3; w: number; h: number; op: number }> = ({ tex, p, w, h, op }) => {
  const mat = useMemo(() => new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }), [tex]);
  mat.opacity = op;
  return op > 0.001 ? <sprite material={mat} position={p} scale={[w, h, 1]} renderOrder={20} /> : null;
};

/** a translucent "planning preview" box with white edges */
const Ghost: React.FC<{ p: V3; size: V3; op: number; sign?: THREE.Texture }> = ({ p, size, op, sign }) => {
  const m = useMemo(
    () => ({
      body: new THREE.MeshStandardMaterial({ color: "#a8d8ff", emissive: "#5fb0ff", emissiveIntensity: 0.25, transparent: true, depthWrite: false, roughness: 0.3 }),
      edge: new THREE.LineBasicMaterial({ color: "#ffffff", transparent: true }),
      geo: new THREE.BoxGeometry(1, 1, 1),
      edges: new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1)),
      sign: sign ? new THREE.MeshBasicMaterial({ map: sign, transparent: true, depthWrite: false }) : null,
      plane: new THREE.PlaneGeometry(1, 1),
    }),
    [sign],
  );
  if (op <= 0.001 || size[1] <= 0.01) return null;
  m.body.opacity = 0.5 * op;
  m.edge.opacity = 0.95 * op;
  if (m.sign) m.sign.opacity = op;
  const c: V3 = [p[0], p[1] + size[1] / 2, p[2]];
  const sw = Math.min(size[0] * 0.86, 2.2);
  const sh = sw * 0.42;
  const sy = Math.max(sh / 2 + 0.2, size[1] - sh / 2 - 0.3);
  return (
    <group>
      <mesh geometry={m.geo} material={m.body} position={c} scale={size} renderOrder={5} />
      <lineSegments geometry={m.edges} material={m.edge} position={c} scale={size} renderOrder={6} />
      {m.sign ? (
        <>
          <mesh geometry={m.plane} material={m.sign} position={[p[0], p[1] + sy, p[2] + size[2] / 2 + 0.02]} scale={[sw, sh, 1]} renderOrder={7} />
          <mesh geometry={m.plane} material={m.sign} position={[p[0] + size[0] / 2 + 0.02, p[1] + sy, p[2]]} rotation={[0, Math.PI / 2, 0]} scale={[sw, sh, 1]} renderOrder={7} />
        </>
      ) : null}
    </group>
  );
};

/** a pitched roof in the same preview style */
const Roof: React.FC<{ p: V3; w: number; h: number; op: number }> = ({ p, w, h, op }) => {
  const m = useMemo(
    () => ({
      body: new THREE.MeshStandardMaterial({ color: "#a8d8ff", emissive: "#5fb0ff", emissiveIntensity: 0.25, transparent: true, depthWrite: false, roughness: 0.3 }),
      edge: new THREE.LineBasicMaterial({ color: "#ffffff", transparent: true }),
      geo: new THREE.ConeGeometry(0.7071, 1, 4, 1),
      edges: new THREE.EdgesGeometry(new THREE.ConeGeometry(0.7071, 1, 4, 1)),
    }),
    [],
  );
  if (op <= 0.001 || h <= 0.01) return null;
  m.body.opacity = 0.55 * op;
  m.edge.opacity = 0.95 * op;
  const c: V3 = [p[0], p[1] + h / 2, p[2]];
  return (
    <group position={c} rotation={[0, Math.PI / 4, 0]} scale={[w, h, w]}>
      <mesh geometry={m.geo} material={m.body} renderOrder={5} />
      <lineSegments geometry={m.edges} material={m.edge} renderOrder={6} />
    </group>
  );
};

/** a glowing outline around LOT 01 */
const LotGlow: React.FC<{ op: number; t: number }> = ({ op, t }) => {
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: "#ffd25a", transparent: true, depthWrite: false, toneMapped: false }), []);
  const geo = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  if (op <= 0.001) return null;
  mat.opacity = op * (0.75 + 0.25 * Math.sin(t * 4)); // a slow breathe, not a blink
  const s = INNER / 2 - 0.2;
  const e = s / 2;
  const y = 0.22;
  return (
    <group position={LOT01}>
      {(
        [
          [0, -e, s, 0.12],
          [0, e, s, 0.12],
          [-e, 0, 0.12, s],
          [e, 0, 0.12, s],
        ] as [number, number, number, number][]
      ).map(([x, z, w, d], i) => (
        <mesh key={i} geometry={geo} material={mat} position={[x, y, z]} scale={[w, 0.04, d]} renderOrder={4} />
      ))}
    </group>
  );
};

const Scene: React.FC<{ t: number }> = ({ t }) => {
  const tex = useMemo(
    () => ({
      lot: textTex([{ text: "LOT 01", size: 96, color: "#1b2029", weight: 800 }], 420, 160, "#ffd25a", 36),
      sign: textTex(
        [
          { text: "YOUR BRAND", size: 110, color: "#1b2029", weight: 800 },
          { text: "HERE", size: 110, color: "#ff8a1f", weight: 800 },
        ],
        640,
        300,
        "#ffffff",
        30,
      ),
      tag: textTex([{ text: "@yourfavbrand", size: 64, color: "#1b2029", weight: 700 }], 520, 120, "#ffffff", 60),
      you: textTex([{ text: "@you", size: 84, color: "#1b2029", weight: 800 }], 300, 130, "#ffffff", 60),
    }),
    [],
  );
  // timings (seconds), all from the VO
  const lotOp = ramp(t, 3.5, 4.1) * (1 - ramp(t, 7.9, 8.3));
  // the preview tower: rises on "they get a building", then grows on "more likes", "comment gets", "taller it grows"
  const h0 = 3.4 * easeOut((t - 8.1) / 0.9);
  const grow = 2.4 * ramp(t, 10.0, 10.6) + 2.4 * ramp(t, 10.9, 11.5) + 2.8 * ramp(t, 11.7, 12.4);
  const towerH = t < 8.1 ? 0 : h0 + grow;
  const fade = 1 - ramp(t, 16.4, 17.3);
  const houseH = 0.9 * easeOut((t - 14.5) / 0.6);
  const ls = INNER / 2 - 0.6;
  return (
    <>
      <LotGlow op={lotOp} t={t} />
      <Sprite tex={tex.lot} p={add(LOT01, [0, 1.3, 0])} w={1.9} h={0.72} op={lotOp} />
      <Ghost p={add(LOT01, [0, 0.19, 0])} size={[ls, towerH, ls]} op={fade} sign={tex.sign} />
      <Ghost p={add(HOUSE, [0, 0.19, 0])} size={[PLOT * 0.6, houseH * 0.62, PLOT * 0.6]} op={fade} />
      <Roof p={add(HOUSE, [0, 0.19 + houseH * 0.62, 0])} w={PLOT * 0.72} h={houseH * 0.5} op={fade} />
      <Sprite tex={tex.you} p={add(HOUSE, [-0.1, 1.3, 0.5])} w={0.6} h={0.26} op={ramp(t, 14.7, 15.1) * fade} />
    </>
  );
};

// ------------------------------------------------------------------ overlays
const fmt = (n: number) => n.toLocaleString("en-US");
const Hud: React.FC<{ t: number }> = ({ t }) => {
  const cd = Math.max(0, 24 * 3600 - Math.floor(t));
  const hh = String(Math.floor(cd / 3600)).padStart(2, "0");
  const mm = String(Math.floor((cd % 3600) / 60)).padStart(2, "0");
  const ss = String(cd % 60).padStart(2, "0");
  const cdOp = ramp(t, 0.3, 0.7);
  // likes chip during the growth beat
  const likes = Math.round(lerp(0, 120, ramp(t, 9.9, 10.6)) + lerp(0, 1100, ramp(t, 10.8, 11.5)) + lerp(0, 2700, ramp(t, 11.6, 12.4)));
  const likeOp = ramp(t, 9.8, 10.1) * (1 - ramp(t, 12.45, 12.6));
  const houseOp = ramp(t, 13.35, 13.6) * (1 - ramp(t, 15.9, 16.1));
  const tagOp = (k: number) => ramp(t, 6.25 + k * 0.2, 6.55 + k * 0.2) * (1 - ramp(t, 7.95, 8.25));
  return (
    <AbsoluteFill style={{ fontFamily: "Poppins" }}>
      <AbsoluteFill style={{ background: "linear-gradient(rgba(12,20,34,0.5), rgba(12,20,34,0) 24%, rgba(12,20,34,0) 58%, rgba(12,20,34,0.45) 82%, rgba(12,20,34,0.2))" }} />
      <div style={{ position: "absolute", top: 110, left: 80, right: 80, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, color: "rgba(255,255,255,0.85)", fontWeight: 600, fontSize: 26, letterSpacing: 7 }}>
          <div style={{ width: 50, height: 2, background: "#ffb23e" }} />
          EPISODE 0
          <div style={{ width: 50, height: 2, background: "#ffb23e" }} />
        </div>
        <div style={{ marginTop: 8, color: "#ffffff", fontWeight: 800, fontSize: 100, letterSpacing: 3, lineHeight: 1, textShadow: "0 6px 24px rgba(0,0,0,0.35)" }}>
          BRAND<span style={{ color: "#ffb23e" }}>CITY</span>
        </div>
        <div style={{ marginTop: 20, display: "flex", background: "rgba(14,20,32,0.6)", borderRadius: 16, overflow: "hidden" }}>
          {[
            ["0", "BRANDS"],
            ["192", "LOTS OPEN"],
          ].map(([v, k], i) => (
            <div key={k} style={{ padding: "12px 30px", textAlign: "center", borderLeft: i ? "1px solid rgba(255,255,255,0.25)" : undefined }}>
              <div style={{ color: "#ffffff", fontWeight: 700, fontSize: 40, lineHeight: 1 }}>{v}</div>
              <div style={{ color: "rgba(255,255,255,0.75)", fontWeight: 600, fontSize: 16, letterSpacing: 3, marginTop: 5 }}>{k}</div>
            </div>
          ))}
          <div style={{ padding: "12px 30px", textAlign: "center", borderLeft: "1px solid rgba(255,255,255,0.25)", opacity: cdOp }}>
            <div style={{ color: "#ffb23e", fontWeight: 700, fontSize: 40, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
              {hh}:{mm}:{ss}
            </div>
            <div style={{ color: "rgba(255,255,255,0.75)", fontWeight: 600, fontSize: 16, letterSpacing: 3, marginTop: 5 }}>UNTIL DAY 1</div>
          </div>
        </div>
      </div>
      {(
        [
          [120, 560, "@yourfavbrand"],
          [520, 680, "@thatsnackbrand"],
          [210, 820, "@yourfavbrand"],
        ] as [number, number, string][]
      ).map(([x, y, txt], k) =>
        tagOp(k) > 0 ? (
          <div key={k} style={{ position: "absolute", left: x, top: y, opacity: tagOp(k), display: "flex", alignItems: "center", gap: 14, padding: "12px 24px 12px 14px", borderRadius: 999, background: "rgba(255,255,255,0.95)", boxShadow: "0 10px 30px rgba(0,0,0,0.22)" }}>
            <div style={{ width: 44, height: 44, borderRadius: 22, background: ["#7a9cff", "#ff8a6a", "#5fc48a"][k] }} />
            <span style={{ color: "#14181f", fontWeight: 700, fontSize: 34 }}>{txt}</span>
          </div>
        ) : null,
      )}
      {likeOp > 0 ? (
        <div style={{ position: "absolute", top: 820, right: 170, opacity: likeOp, display: "flex", alignItems: "center", gap: 14, padding: "14px 26px", borderRadius: 999, background: "rgba(255,255,255,0.95)", boxShadow: "0 10px 30px rgba(0,0,0,0.25)" }}>
          <span style={{ color: "#ff3b5c", fontSize: 40, lineHeight: 1 }}>♥</span>
          <span style={{ color: "#14181f", fontWeight: 700, fontSize: 40, fontVariantNumeric: "tabular-nums" }}>{fmt(likes)}</span>
        </div>
      ) : null}
      {houseOp > 0 ? (
        <div style={{ position: "absolute", top: 820, left: 90, opacity: houseOp, display: "flex", alignItems: "center", gap: 18, padding: "16px 28px", borderRadius: 26, background: "rgba(255,255,255,0.95)", boxShadow: "0 10px 30px rgba(0,0,0,0.25)" }}>
          <div style={{ width: 52, height: 52, borderRadius: 26, background: "linear-gradient(135deg,#ffb23e,#ff6a3d)" }} />
          <div>
            <div style={{ color: "#5b6575", fontWeight: 600, fontSize: 22 }}>you</div>
            <div style={{ fontSize: 40, lineHeight: 1.1 }}>🏠</div>
          </div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

/** captions: one phrase at a time, the spoken word in the accent color; a short fade, no motion */
const Captions: React.FC<{ t: number }> = ({ t }) => {
  const i = PHRASES.findIndex((p, k) => t >= p[0][0] - 0.05 && t < (PHRASES[k + 1]?.[0][0] ?? 99) - 0.05);
  if (i < 0) return null;
  const p = PHRASES[i];
  const end = p[p.length - 1][1];
  if (t > end + 0.6) return null;
  const op = Math.min(ramp(t, p[0][0] - 0.05, p[0][0] + 0.07), 1 - ramp(t, end + 0.4, end + 0.6));
  return (
    <div style={{ position: "absolute", top: 1235, left: 90, right: 170, textAlign: "center", opacity: op, fontFamily: "Poppins" }}>
      <span style={{ fontWeight: 800, fontSize: 62, lineHeight: 1.15, color: "#ffffff", textShadow: "0 3px 0 rgba(0,0,0,0.35), 0 6px 22px rgba(0,0,0,0.55)" }}>
        {p.map(([a, , w], k) => (
          <span key={k} style={{ color: t >= a - 0.03 && (k === p.length - 1 || t < p[k + 1][0] - 0.03) ? "#ffb23e" : "#ffffff" }}>
            {w}
            {k < p.length - 1 ? " " : ""}
          </span>
        ))}
      </span>
    </div>
  );
};

export const BrandCityEp0: React.FC<{ audio?: boolean }> = ({ audio = true }) => {
  const ready = useFonts();
  const f = useCurrentFrame();
  const t = f / EP0_FPS;
  if (!ready) return <AbsoluteFill style={{ background: "#cfe3f2" }} />;
  return (
    <AbsoluteFill style={{ background: "#cfe3f2" }}>
      <ThreeCanvas width={1080} height={1920} shadows gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }} style={{ position: "absolute", inset: 0 }}>
        <CamRig t={t} />
        <Lights />
        <City built={false} suburbs={[SUBURB]} />
        <Scene t={t} />
      </ThreeCanvas>
      <Hud t={t} />
      <Captions t={t} />
      {audio ? <Audio src={staticFile("brandcity/ep0-vo.wav")} /> : null}
    </AbsoluteFill>
  );
};
