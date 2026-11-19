// MOB RULE — Day 1 (≈14.4 s, the creator's own voice-over). The Brand City look (CityReal), now lived in: generic
// buildings, 100 tiny citizens on the streets around City Hall, and Mayor Bob. Every shot is cut on a phrase of the
// recorded VO (day1-words.json). Lessons from Brand City Ep 0: something moves in frame 0 (a huge shadow sweeping
// over the city, people stopping to look up), a character on screen, the rule in one line, 15 s, and the last frame
// matches the first so it loops.
import React, { useMemo } from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useFonts } from "../inkbeat/core/frame";
import { City, Lights, rng } from "../city/CityReal";
import WORDS from "./day1-words.json";

export const MOB1_FPS = 30;
export const MOB1_FRAMES = Math.round(14.4 * MOB1_FPS);

type V3 = [number, number, number];
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = (u: number) => {
  const x = clamp(u);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};
const ramp = (t: number, a: number, b: number) => ease((t - a) / (b - a));
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const mixV = (a: V3, b: V3, u: number): V3 => [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)];

// ------------------------------------------------------------------ places (City Hall is the block at the origin)
const WALK_Y = 0.16; // sidewalk top
const STREET_Z = 4.6; // the road just south of City Hall
const BOB: V3 = [0.95, 0.2, 1.75]; // on the plaza, beside the pool

// a calm, low city: every block is low-rise (houses and small buildings); no skyscrapers
const LOW: [number, number][] = [];
for (let bx = 0; bx <= 6; bx++) for (let bz = 0; bz <= 6; bz++) LOW.push([bx, bz]);

// ------------------------------------------------------------------ camera
type Cam = { pos: V3; look: V3; fov: number };
const OPEN: Cam = { pos: [17, 13, 21], look: [0.5, 0.4, 3.2], fov: 40 };
const camAt = (t: number): Cam => {
  // S1 0–2.3 "You decide what kills these 100 people": the wide, a slow push as the shadow sweeps over
  if (t < 2.3) {
    const u = ramp(t, 0, 2.3);
    return { pos: mixV(OPEN.pos, [14.5, 10.5, 18], u), look: mixV(OPEN.look, [0.8, 0.3, 3.6], u), fov: 40 };
  }
  // S2 2.3–4.5 "before Day 2. But what?": cut down onto the street, the citizens frozen, looking up
  if (t < 4.5) {
    const u = ramp(t, 2.3, 4.5);
    return { pos: mixV([7.5, 0.9, STREET_Z + 0.3], [6.2, 0.75, STREET_Z + 0.2], u), look: [-2, 0.45, STREET_Z - 0.6], fov: 44 };
  }
  // S3 4.5–7.1 the three "what ifs": a medium-wide over the same street, a slow drift
  if (t < 7.1) {
    const u = ramp(t, 4.5, 7.1);
    return { pos: mixV([10, 6.5, 13], [9, 6.2, 13.8], u), look: [0.5, 1.6, 3.4], fov: 46 };
  }
  // S4 7.1–9.4 "This is Mayor Bob. He's terrified of you.": a close-up, a tiny push
  if (t < 9.4) {
    const u = ramp(t, 7.1, 9.4);
    return { pos: mixV([BOB[0] + 1.5, 0.7, BOB[2] + 2.0], [BOB[0] + 1.25, 0.64, BOB[2] + 1.7], u), look: [BOB[0], BOB[1] + 0.2, BOB[2]], fov: 30 };
  }
  // S5–S6 9.4–14.4: crane up off Bob over City Hall, then back out to the opening wide (= frame 0, so it loops)
  const u = ramp(t, 9.4, 13.9);
  const from: Cam = { pos: [BOB[0] + 1.25, 0.64, BOB[2] + 1.7], look: [BOB[0], BOB[1] + 0.2, BOB[2]], fov: 30 };
  const mid: V3 = [6, 7, 9];
  const p = u < 0.4 ? mixV(from.pos, mid, ease(u / 0.4)) : mixV(mid, OPEN.pos, ease((u - 0.4) / 0.6));
  return { pos: p, look: mixV(from.look, OPEN.look, ease(u)), fov: lerp(30, OPEN.fov, ease(u)) };
};

const CamRig: React.FC<{ t: number }> = ({ t }) => {
  const { camera, scene } = useThree();
  const c = camera as THREE.PerspectiveCamera;
  const k = camAt(t);
  c.fov = k.fov;
  c.near = 0.05;
  c.far = 400;
  c.position.set(...k.pos);
  c.lookAt(...k.look);
  c.updateProjectionMatrix();
  if (!scene.fog) {
    scene.fog = new THREE.Fog("#cfe3f2", 55, 120);
    scene.background = new THREE.Color("#cfe3f2");
  }
  return null;
};

// ------------------------------------------------------------------ the shadow: a huge dark shape sliding over the city
// It passes once at the start and returns at the end, in the same place in frame 0 and the last frame (the loop).
const shadowX = (t: number) => {
  if (t < 4.6) return lerp(9, -20, ramp(t, -0.6, 4.6));
  if (t > 11.2) return lerp(30, 9 - 29 * (0.6 / 5.2), ramp(t, 11.2, 14.4));
  return 99;
};
const Shadow: React.FC<{ t: number }> = ({ t }) => {
  const m = useMemo(() => new THREE.MeshBasicMaterial({ color: "#0b1020", transparent: true, opacity: 0.62, depthWrite: false }), []);
  const g = useMemo(() => new THREE.CircleGeometry(1, 48), []);
  const x = shadowX(t);
  if (x > 60) return null;
  return <mesh geometry={g} material={m} position={[x, 0.35, 3]} rotation={[-Math.PI / 2, 0, 0.5]} scale={[12, 8, 1]} renderOrder={3} />;
};

// ------------------------------------------------------------------ citizens
type Person = { p: V3; c: string; dir: number; walk: number };
const PEOPLE: Person[] = (() => {
  const r = rng(7);
  const cols = ["#d94b3d", "#3d7bd9", "#f2b134", "#4caf6a", "#8a5cd1", "#f27a3d", "#2fb3b3", "#e85d9a", "#f4f4f4", "#3a3f48"];
  const out: Person[] = [];
  for (let i = 0; i < 100; i++) {
    let p: V3;
    const k = i % 4;
    if (k === 0) p = [-3.2 + r() * 6.4, WALK_Y, 3.25 + (r() - 0.5) * 0.18]; // City Hall's south sidewalk
    else if (k === 1) p = [-3.2 + r() * 6.4, WALK_Y, 5.95 + (r() - 0.5) * 0.18]; // across the street
    else if (k === 2) p = [-2.6 + r() * 2.8, 0.2, 2.3 + r() * 0.8]; // the plaza, west of Bob's sight line
    else p = [4.55 + (r() - 0.5) * 1.5, WALK_Y, -3 + r() * 9]; // the crossing street to the east
    if (Math.abs(p[0] - BOB[0]) < 0.45 && Math.abs(p[2] - BOB[2]) < 0.45) p = [p[0] - 0.9, p[1], p[2]];
    out.push({ p, c: cols[Math.floor(r() * cols.length)], dir: r() > 0.5 ? 1 : -1, walk: 0.06 + r() * 0.08 });
  }
  return out;
})();

const Citizens: React.FC<{ t: number }> = ({ t }) => {
  const m = useMemo(() => {
    const skin = new THREE.MeshStandardMaterial({ color: "#f1c7a3", roughness: 0.8 });
    const bodies = new Map<string, THREE.MeshStandardMaterial>();
    return { skin, body: (c: string) => bodies.get(c) ?? (bodies.set(c, new THREE.MeshStandardMaterial({ color: c, roughness: 0.7 })), bodies.get(c)!) };
  }, []);
  const g = useMemo(() => ({ body: new THREE.CapsuleGeometry(0.045, 0.1, 4, 10), head: new THREE.SphereGeometry(0.042, 14, 10) }), []);
  // they walk, the shadow arrives, they stop and look up (and stay that way: they're scared now)
  const stop = ramp(t, 0.5, 1.2);
  const look = ramp(t, 0.7, 1.5);
  const walkT = Math.min(t, 0.5 + 0.35 * (1 - stop));
  return (
    <>
      {PEOPLE.map((q, i) => {
        const x = q.p[0] + q.dir * q.walk * walkT;
        const bob = Math.abs(Math.sin((walkT + i) * 9)) * 0.01 * (1 - stop);
        return (
          <group key={i} position={[x, q.p[1] + bob, q.p[2]]}>
            <mesh geometry={g.body} material={m.body(q.c)} position={[0, 0.095, 0]} castShadow />
            <mesh geometry={g.head} material={m.skin} position={[0, 0.215 + 0.008 * look, -0.012 * look]} castShadow />
          </group>
        );
      })}
    </>
  );
};

// ------------------------------------------------------------------ Mayor Bob: a slightly bigger citizen with a top hat and a sash
const MayorBob: React.FC<{ t: number; yaw?: number }> = ({ t, yaw = 0.55 }) => {
  const m = useMemo(
    () => ({
      suit: new THREE.MeshStandardMaterial({ color: "#2b3446", roughness: 0.6 }),
      skin: new THREE.MeshStandardMaterial({ color: "#f1c7a3", roughness: 0.75 }),
      sash: new THREE.MeshStandardMaterial({ color: "#d9333f", roughness: 0.6 }),
      hat: new THREE.MeshStandardMaterial({ color: "#14171f", roughness: 0.4 }),
      gold: new THREE.MeshStandardMaterial({ color: "#f2b134", roughness: 0.35, metalness: 0.4 }),
      eye: new THREE.MeshBasicMaterial({ color: "#111111" }),
      white: new THREE.MeshBasicMaterial({ color: "#ffffff" }),
      sweat: new THREE.MeshStandardMaterial({ color: "#9fd6ff", roughness: 0.1, transparent: true, opacity: 0.9 }),
    }),
    [],
  );
  const g = useMemo(
    () => ({
      body: new THREE.CapsuleGeometry(0.07, 0.14, 6, 16),
      head: new THREE.SphereGeometry(0.068, 24, 16),
      arm: new THREE.CapsuleGeometry(0.018, 0.08, 4, 8),
      hatBrim: new THREE.CylinderGeometry(0.075, 0.075, 0.008, 24),
      hatTop: new THREE.CylinderGeometry(0.05, 0.05, 0.08, 24),
      eyeW: new THREE.SphereGeometry(0.018, 12, 10),
      eyeP: new THREE.SphereGeometry(0.009, 10, 8),
      box: new THREE.BoxGeometry(1, 1, 1),
      drop: new THREE.SphereGeometry(0.011, 10, 8),
    }),
    [],
  );
  // a nervous wave (not a cartoon flail): starts on "Mayor Bob", slows on "terrified"
  const wave = t > 7.4 ? Math.sin((t - 7.4) * 9) * 0.35 * (1 - ramp(t, 8.6, 9.3) * 0.6) : 0;
  const armUp = ramp(t, 7.3, 7.6);
  const sweatY = 0.26 - ((t * 0.12) % 0.06); // a drop sliding down, on a loop
  const shake = t > 8.3 && t < 9.4 ? Math.sin(t * 60) * 0.002 : 0;
  return (
    <group position={[BOB[0] + shake, BOB[1], BOB[2]]} rotation={[0, yaw, 0]}>
      <mesh geometry={g.body} material={m.suit} position={[0, 0.14, 0]} castShadow />
      <mesh geometry={g.box} material={m.sash} position={[0, 0.15, 0.066]} rotation={[0, 0, 0.75]} scale={[0.03, 0.2, 0.012]} />
      <mesh geometry={g.box} material={m.gold} position={[0.032, 0.115, 0.074]} scale={[0.022, 0.022, 0.01]} />
      <mesh geometry={g.head} material={m.skin} position={[0, 0.315, 0]} castShadow />
      <mesh geometry={g.hatBrim} material={m.hat} position={[0, 0.375, 0]} castShadow />
      <mesh geometry={g.hatTop} material={m.hat} position={[0, 0.42, 0]} castShadow />
      {/* worried eyes: whites with pupils looking up */}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 0.025, 0.325, 0.058]}>
          <mesh geometry={g.eyeW} material={m.white} />
          <mesh geometry={g.eyeP} material={m.eye} position={[0, 0.006, 0.013]} />
        </group>
      ))}
      <mesh geometry={g.box} material={m.eye} position={[0, 0.288, 0.064]} rotation={[0, 0, Math.PI]} scale={[0.026, 0.006, 0.004]} />
      {/* sweat */}
      <mesh geometry={g.drop} material={m.sweat} position={[0.055, sweatY + 0.06, 0.035]} scale={[1, 1.4, 1]} />
      {/* arms: left at the side, right waving */}
      <mesh geometry={g.arm} material={m.suit} position={[-0.085, 0.14, 0]} rotation={[0, 0, 0.15]} castShadow />
      <group position={[0.08, 0.2, 0]} rotation={[0, 0, lerp(-0.15, -2.5, armUp) + wave]}>
        <mesh geometry={g.arm} material={m.suit} position={[0, -0.06, 0]} castShadow />
        <mesh geometry={g.head} material={m.skin} position={[0, -0.115, 0]} scale={0.3} />
      </group>
    </group>
  );
};

// ------------------------------------------------------------------ the three "what ifs" (translucent previews, ~0.8 s each, on their words)
const Previews: React.FC<{ t: number }> = ({ t }) => {
  const m = useMemo(
    () => ({
      meteor: new THREE.MeshBasicMaterial({ color: "#ffb04a", transparent: true, depthWrite: false, toneMapped: false }),
      trail: new THREE.MeshBasicMaterial({ color: "#ff7a2a", transparent: true, depthWrite: false, toneMapped: false }),
      paw: new THREE.MeshStandardMaterial({ color: "#e8d5c0", roughness: 0.9, transparent: true, depthWrite: false }),
      pad: new THREE.MeshStandardMaterial({ color: "#f2a7b4", roughness: 0.9, transparent: true, depthWrite: false }),
      water: new THREE.MeshStandardMaterial({ color: "#3d9be0", roughness: 0.15, metalness: 0.1, transparent: true, depthWrite: false }),
    }),
    [],
  );
  const g = useMemo(() => ({ sph: new THREE.SphereGeometry(1, 24, 16), cone: new THREE.ConeGeometry(1, 1, 20, 1, true), box: new THREE.BoxGeometry(1, 1, 1) }), []);
  const win = (a: number, b: number) => ramp(t, a, a + 0.15) * (1 - ramp(t, b - 0.15, b));
  const mo = win(4.58, 5.3);
  const po = win(5.34, 6.3);
  const wo = win(6.34, 7.15);
  const mp: V3 = [lerp(-5, -0.5, ramp(t, 4.58, 5.3)), lerp(7.5, 2.6, ramp(t, 4.58, 5.3)), lerp(-1, 3.2, ramp(t, 4.58, 5.3))];
  m.meteor.opacity = 0.75 * mo;
  m.trail.opacity = 0.35 * mo;
  m.paw.opacity = 0.7 * po;
  m.pad.opacity = 0.75 * po;
  m.water.opacity = 0.55 * wo;
  const pawY = lerp(4.5, 1.25, ramp(t, 5.34, 5.75));
  const water = lerp(0.02, 0.55, ramp(t, 6.34, 7.0));
  return (
    <>
      {mo > 0 ? (
        <group>
          <mesh geometry={g.sph} material={m.meteor} position={mp} scale={1.1} renderOrder={8} />
          <mesh geometry={g.cone} material={m.trail} position={[mp[0] - 1.6, mp[1] + 2, mp[2] - 1.6]} rotation={[0.6, 0, -0.6]} scale={[0.6, 4, 0.6]} renderOrder={7} />
        </group>
      ) : null}
      {po > 0 ? (
        <group position={[0.8, pawY, STREET_Z - 0.4]} scale={1.3}>
          <mesh geometry={g.sph} material={m.paw} scale={[1.5, 0.9, 1.3]} renderOrder={8} />
          {[-0.9, -0.3, 0.3, 0.9].map((dx, i) => (
            <mesh key={i} geometry={g.sph} material={m.paw} position={[dx, -0.55, 0.95 - Math.abs(dx) * 0.25]} scale={0.45} renderOrder={8} />
          ))}
          <mesh geometry={g.sph} material={m.pad} position={[0, -0.75, 0.1]} scale={[0.7, 0.2, 0.6]} renderOrder={9} />
        </group>
      ) : null}
      {wo > 0 ? <mesh geometry={g.box} material={m.water} position={[0, water / 2, STREET_Z]} scale={[16, water, 2.4]} renderOrder={8} /> : null}
    </>
  );
};

// ------------------------------------------------------------------ overlays
type W = [number, number, string];
const words = WORDS as W[];
const GROUPS = [4, 3, 3, 2, 2, 3, 2, 4, 4, 3, 1, 4, 3, 3];
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

const Captions: React.FC<{ t: number }> = ({ t }) => {
  const i = PHRASES.findIndex((p, k) => t >= p[0][0] - 0.05 && t < (PHRASES[k + 1]?.[0][0] ?? 99) - 0.05);
  const k0 = i < 0 && t < PHRASES[0][0][0] ? 0 : i; // frame 0 already shows the first phrase
  if (k0 < 0) return null;
  const p = PHRASES[k0];
  const end = p[p.length - 1][1];
  if (t > end + 0.6) return null;
  const op = Math.min(k0 === 0 ? 1 : ramp(t, p[0][0] - 0.05, p[0][0] + 0.07), 1 - ramp(t, end + 0.4, end + 0.6));
  return (
    <div style={{ position: "absolute", top: 1235, left: 90, right: 170, textAlign: "center", opacity: op, fontFamily: "Poppins" }}>
      <span style={{ fontWeight: 800, fontSize: 62, lineHeight: 1.15, color: "#ffffff", textShadow: "0 3px 0 rgba(0,0,0,0.35), 0 6px 22px rgba(0,0,0,0.55)" }}>
        {p.map(([a, , w], k) => (
          <span key={k} style={{ color: t >= a - 0.03 && (k === p.length - 1 || t < p[k + 1][0] - 0.03) ? "#ff5a4a" : "#ffffff" }}>
            {w}
            {k < p.length - 1 ? " " : ""}
          </span>
        ))}
      </span>
    </div>
  );
};

const Hud: React.FC<{ t: number }> = ({ t }) => {
  const law = ramp(t, 9.45, 9.7) * (1 - ramp(t, 11.0, 11.3));
  return (
    <AbsoluteFill style={{ fontFamily: "Poppins" }}>
      <AbsoluteFill style={{ background: "linear-gradient(rgba(12,14,24,0.55), rgba(12,14,24,0) 24%, rgba(12,14,24,0) 58%, rgba(12,14,24,0.45) 82%, rgba(12,14,24,0.2))" }} />
      <div style={{ position: "absolute", top: 110, left: 80, right: 80, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, color: "rgba(255,255,255,0.85)", fontWeight: 600, fontSize: 26, letterSpacing: 7 }}>
          <div style={{ width: 50, height: 2, background: "#ff5a4a" }} />
          DAY 1
          <div style={{ width: 50, height: 2, background: "#ff5a4a" }} />
        </div>
        <div style={{ marginTop: 8, color: "#ffffff", fontWeight: 800, fontSize: 104, letterSpacing: 4, lineHeight: 1, textShadow: "0 6px 24px rgba(0,0,0,0.4)" }}>
          MOB<span style={{ color: "#ff5a4a" }}>RULE</span>
        </div>
        <div style={{ marginTop: 20, padding: "12px 30px", background: "rgba(14,16,28,0.62)", borderRadius: 16, textAlign: "center" }}>
          <div style={{ color: "#ffffff", fontWeight: 700, fontSize: 44, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>100</div>
          <div style={{ color: "rgba(255,255,255,0.75)", fontWeight: 600, fontSize: 17, letterSpacing: 3, marginTop: 5 }}>POPULATION</div>
        </div>
      </div>
      {law > 0 ? (
        <div style={{ position: "absolute", top: 400, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: law }}>
          <div style={{ padding: "26px 52px", borderRadius: 26, background: "rgba(14,16,28,0.82)", border: "3px solid #ff5a4a", textAlign: "center" }}>
            <div style={{ color: "rgba(255,255,255,0.8)", fontWeight: 700, fontSize: 36, letterSpacing: 6 }}>TOP COMMENT</div>
            <div style={{ color: "#ff5a4a", fontWeight: 800, fontSize: 96, lineHeight: 1.05, letterSpacing: 4 }}>= LAW</div>
          </div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

export { MayorBob, LOW };
export const MobRuleDay1: React.FC<{ audio?: boolean }> = ({ audio = true }) => {
  const ready = useFonts();
  const t = useCurrentFrame() / MOB1_FPS;
  if (!ready) return <AbsoluteFill style={{ background: "#cfe3f2" }} />;
  return (
    <AbsoluteFill style={{ background: "#cfe3f2" }}>
      <ThreeCanvas width={1080} height={1920} shadows gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }} style={{ position: "absolute", inset: 0 }}>
        <CamRig t={t} />
        <Lights />
        <City built lowRise={LOW} />
        <Shadow t={t} />
        <Citizens t={t} />
        <MayorBob t={t} />
        <Previews t={t} />
      </ThreeCanvas>
      <AbsoluteFill style={{ background: "#060914", opacity: 0.18 * Math.max(1 - ramp(t, 1.6, 2.6), ramp(t, 12.4, 14.0)) }} />
      <Hud t={t} />
      <Captions t={t} />
      {audio ? <Audio src={staticFile("mobrule/day1-vo.wav")} /> : null}
    </AbsoluteFill>
  );
};
