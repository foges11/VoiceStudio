// MOB RULE — Day 1, version 2 (≈18.2 s, the creator's voice-over). Mob Rule's own look (Mobville: warm golden-hour
// small town, welcome sign, waving citizens, a smiling Mayor Bob, a town badge and cream caption pills), and it says
// what the show is in the first 6 s: the town, the mayor, the rule. Shots cut on phrases of the VO (day1v2-words.json).
// The last frame matches the first (the welcome sign), so it loops.
import React, { useMemo } from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import * as THREE from "three";
import { useFonts } from "../inkbeat/core/frame";
import { City } from "../city/CityReal";
import { Citizens, LOW, MayorBob } from "./MobRuleDay1";
import { Cam, PillCaptions, SIGN_AT, TownCam, TownHud, TownLights, V3, WelcomeSign, Word } from "./Mobville";
import WORDS from "./day1v2-words.json";

export const MOB1V2_FPS = 30;
export const MOB1V2_FRAMES = Math.round(18.2 * MOB1V2_FPS);

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = (u: number) => {
  const x = clamp(u);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};
const ramp = (t: number, a: number, b: number) => ease((t - a) / (b - a));
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const mixV = (a: V3, b: V3, u: number): V3 => [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)];
const mixCam = (a: Cam, b: Cam, u: number): Cam => ({ pos: mixV(a.pos, b.pos, u), look: mixV(a.look, b.look, u), fov: lerp(a.fov, b.fov, u) });

const BOB: V3 = [0.95, 0.2, 1.75];

// ------------------------------------------------------------------ camera (shots on phrases)
const SIGN: Cam = { pos: [SIGN_AT[0] + 3.6, 2.2, SIGN_AT[2] + 8.5], look: [SIGN_AT[0] - 3.5, 0.9, SIGN_AT[2] - 9], fov: 48 };
const SIGN_IN: Cam = { pos: [SIGN_AT[0] + 3.0, 2.0, SIGN_AT[2] + 7.4], look: [SIGN_AT[0] - 3.5, 0.95, SIGN_AT[2] - 9], fov: 48 };
const SQUARE: Cam = { pos: [9, 5.6, 12.8], look: [0.4, 0.3, 2.6], fov: 40 };
const SQUARE2: Cam = { pos: [8, 5.0, 11.8], look: [0.4, 0.3, 2.6], fov: 40 };
const BOB1: Cam = { pos: [BOB[0] + 1.5, 0.7, BOB[2] + 2.0], look: [BOB[0], BOB[1] + 0.22, BOB[2]], fov: 30 };
const BOB2: Cam = { pos: [BOB[0] + 1.25, 0.64, BOB[2] + 1.7], look: [BOB[0], BOB[1] + 0.22, BOB[2]], fov: 30 };
const PREV1: Cam = { pos: [10, 6.5, 13], look: [0.5, 1.4, 3.4], fov: 46 };
const PREV2: Cam = { pos: [9, 6.2, 13.8], look: [0.5, 1.4, 3.4], fov: 46 };
const GULP: Cam = { pos: [BOB[0] + 0.95, 0.55, BOB[2] + 1.25], look: [BOB[0], BOB[1] + 0.25, BOB[2]], fov: 30 };

const camAt = (t: number): Cam => {
  if (t < 1.65) return mixCam(SIGN, SIGN_IN, ramp(t, 0, 1.65)); // "100 people can't stop you."
  if (t < 4.3) {
    // "You run this town now. What happens first?": cut to a high view over the town, slowly settling toward the square
    const u = ramp(t, 1.65, 4.3);
    return mixCam({ pos: [16, 13, 22], look: [1, 0, 3], fov: 42 }, SQUARE, u);
  }
  if (t < 6.0) return mixCam(SQUARE, SQUARE2, ramp(t, 4.3, 6.0)); // "Welcome to Mobville."
  if (t < 9.8) return mixCam(BOB1, BOB2, ramp(t, 6.0, 9.8)); // "This is Mayor Bob, and he has to obey…"
  if (t < 12.7) return mixCam(PREV1, PREV2, ramp(t, 9.8, 12.7)); // "A pool party? 50 pandas? A meteor?"
  if (t < 13.95) return mixCam(GULP, { ...GULP, pos: add(GULP.pos, [-0.12, 0, -0.15]) }, ramp(t, 12.7, 13.95)); // "Even the meteor."
  // "Comment your first law.": stay on Bob, easing back a little while the comment box types
  if (t < 15.55) return mixCam({ ...GULP, pos: add(GULP.pos, [-0.12, 0, -0.15]) }, BOB1, ramp(t, 13.95, 15.55));
  // "Tomorrow, it happens to these 100 people.": cut to the sign, a slow pull back to the opening frame (it loops)
  return mixCam(SIGN_IN, SIGN, ramp(t, 15.55, 17.9));
};
function add(a: V3, b: V3): V3 {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

// ------------------------------------------------------------------ the three "what ifs"
const Previews: React.FC<{ t: number }> = ({ t }) => {
  const m = useMemo(
    () => ({
      balloons: ["#ff5a6e", "#ffd166", "#5ac8fa", "#8ce99a", "#c38dff"].map((c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.35, transparent: true })),
      string: new THREE.MeshBasicMaterial({ color: "#ffffff", transparent: true }),
      white: new THREE.MeshStandardMaterial({ color: "#f7f5f0", roughness: 0.85, transparent: true }),
      black: new THREE.MeshStandardMaterial({ color: "#1d1d22", roughness: 0.85, transparent: true }),
      meteor: new THREE.MeshBasicMaterial({ color: "#ffb04a", transparent: true, depthWrite: false, toneMapped: false }),
      trail: new THREE.MeshBasicMaterial({ color: "#ff7a2a", transparent: true, depthWrite: false, toneMapped: false }),
    }),
    [],
  );
  const g = useMemo(() => ({ sph: new THREE.SphereGeometry(1, 20, 14), cyl: new THREE.CylinderGeometry(1, 1, 1, 6), cone: new THREE.ConeGeometry(1, 1, 20, 1, true) }), []);
  const fade = (a: number, b: number) => ramp(t, a, a + 0.2) * (1 - ramp(t, b - 0.2, b));
  const party = fade(9.9, 12.75);
  const pandas = fade(10.9, 12.75);
  const met = ramp(t, 11.95, 12.15) * (1 - ramp(t, 13.6, 13.9));
  m.balloons.forEach((b) => (b.opacity = party));
  m.string.opacity = party * 0.8;
  m.white.opacity = pandas;
  m.black.opacity = pandas;
  m.meteor.opacity = 0.9 * met;
  m.trail.opacity = 0.4 * met;
  const rise = (t - 9.9) * 0.35;
  const walk = (t - 10.9) * 0.45;
  const mp: V3 = [lerp(-3.2, -0.6, ramp(t, 11.95, 13.9)), lerp(4.6, 3.0, ramp(t, 11.95, 13.9)), lerp(0.2, 2.2, ramp(t, 11.95, 13.9))];
  return (
    <>
      {party > 0
        ? Array.from({ length: 14 }, (_, i) => {
            const x = -1.4 + (i % 7) * 0.47;
            const z = 2.0 + (i < 7 ? -0.75 : 0.75);
            const y = 0.75 + Math.max(0, rise) * (0.6 + (i % 3) * 0.25) + Math.sin(t * 2 + i) * 0.05;
            return (
              <group key={i}>
                <mesh geometry={g.sph} material={m.balloons[i % 5]} position={[x, y, z]} scale={[0.14, 0.17, 0.14]} castShadow />
                <mesh geometry={g.cyl} material={m.string} position={[x, y - 0.32, z]} scale={[0.004, 0.45, 0.004]} />
              </group>
            );
          })
        : null}
      {pandas > 0
        ? Array.from({ length: 7 }, (_, i) => {
            const x = -3.4 + i * 0.62 + walk;
            const z = 3.15 + (i % 2 ? 0.25 : -0.15);
            const hop = Math.abs(Math.sin((t + i * 0.3) * 6)) * 0.03;
            return (
              <group key={i} position={[x, 0.2 + hop, z]} rotation={[0, Math.PI / 2, 0]} scale={2.1}>
                <mesh geometry={g.sph} material={m.white} position={[0, 0.16, 0]} scale={[0.15, 0.14, 0.2]} castShadow />
                <mesh geometry={g.sph} material={m.black} position={[0, 0.14, 0.02]} scale={[0.155, 0.08, 0.1]} />
                <mesh geometry={g.sph} material={m.white} position={[0, 0.3, 0.17]} scale={0.1} castShadow />
                <mesh geometry={g.sph} material={m.black} position={[0.07, 0.38, 0.15]} scale={0.035} />
                <mesh geometry={g.sph} material={m.black} position={[-0.07, 0.38, 0.15]} scale={0.035} />
                <mesh geometry={g.sph} material={m.black} position={[0.035, 0.31, 0.25]} scale={[0.025, 0.03, 0.01]} />
                <mesh geometry={g.sph} material={m.black} position={[-0.035, 0.31, 0.25]} scale={[0.025, 0.03, 0.01]} />
              </group>
            );
          })
        : null}
      {met > 0 ? (
        <group>
          <mesh geometry={g.sph} material={m.meteor} position={mp} scale={1.15} renderOrder={8} />
          <mesh geometry={g.cone} material={m.trail} position={[mp[0] - 1.4, mp[1] + 1.8, mp[2] - 1.4]} rotation={[0.6, 0, -0.6]} scale={[0.5, 3.6, 0.5]} renderOrder={7} />
        </group>
      ) : null}
    </>
  );
};

// ------------------------------------------------------------------ overlays: the top-comment card and the comment box
const Overlays: React.FC<{ t: number }> = ({ t }) => {
  const card = ramp(t, 7.95, 8.2) * (1 - ramp(t, 9.55, 9.8));
  const box = ramp(t, 13.95, 14.15) * (1 - ramp(t, 15.5, 15.7));
  const typed = "Write the first law";
  const n = Math.round(typed.length * clamp((t - 14.1) / 0.9));
  const caret = Math.floor(t * 2.5) % 2 === 0;
  return (
    <AbsoluteFill style={{ fontFamily: "Poppins" }}>
      {card > 0 ? (
        <div style={{ position: "absolute", top: 300, left: 60, width: 430, opacity: card, padding: "22px 26px", background: "#fffaf0", borderRadius: 26, boxShadow: "0 14px 34px rgba(60,30,10,0.35)", border: "4px solid #d9443a" }}>
          <div style={{ color: "#d9443a", fontWeight: 800, fontSize: 26, letterSpacing: 3 }}>TOP COMMENT</div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 12 }}>
            <div style={{ width: 54, height: 54, borderRadius: 27, background: "linear-gradient(135deg,#ffb23e,#ff6a3d)" }} />
            <div style={{ color: "#3b2414", fontWeight: 700, fontSize: 36, lineHeight: 1.15 }}>your idea here</div>
          </div>
          <div style={{ color: "#7a4a2c", fontWeight: 700, fontSize: 28, marginTop: 10 }}>♥ most liked = law</div>
        </div>
      ) : null}
      {box > 0 ? (
        <div style={{ position: "absolute", top: 1080, left: 90, right: 170, opacity: box, display: "flex", alignItems: "center", gap: 18, padding: "18px 20px 18px 26px", background: "#fffaf0", borderRadius: 999, boxShadow: "0 14px 34px rgba(60,30,10,0.35)" }}>
          <div style={{ width: 52, height: 52, borderRadius: 26, background: "linear-gradient(135deg,#ffb23e,#ff6a3d)", flex: "none" }} />
          <div style={{ flex: 1, color: n > 0 ? "#3b2414" : "#9a8a7a", fontWeight: 600, fontSize: 36 }}>
            {typed.slice(0, n)}
            <span style={{ opacity: caret ? 1 : 0, color: "#d9443a" }}>|</span>
          </div>
          <div style={{ padding: "10px 24px", borderRadius: 999, background: "#d9443a", color: "#fff7ea", fontWeight: 800, fontSize: 30 }}>Post</div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ captions
const words = WORDS as Word[];
const GROUPS = [5, 5, 3, 3, 4, 5, 3, 3, 3, 2, 2, 3, 4, 1, 3, 3];
const PHRASES: Word[][] = (() => {
  const out: Word[][] = [];
  let i = 0;
  for (const n of GROUPS) {
    out.push(words.slice(i, i + n));
    i += n;
  }
  if (i < words.length) out.push(words.slice(i));
  return out;
})();

export const MobRuleDay1v2: React.FC<{ audio?: boolean }> = ({ audio = true }) => {
  const ready = useFonts();
  const t = useCurrentFrame() / MOB1V2_FPS;
  if (!ready) return <AbsoluteFill style={{ background: "#f6d8bd" }} />;
  // Bob: friendly wave from "Mayor Bob", the smile drops on "the top comment", a gulp on "Even the meteor"
  const bobT = t < 12.7 ? t + 1.1 : 8.5 + (t - 12.7) * 0.5;
  const happy = t < 8.25 ? 1 : 0;
  return (
    <AbsoluteFill style={{ background: "#f6d8bd" }}>
      <ThreeCanvas width={1080} height={1920} shadows gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.0 }} style={{ position: "absolute", inset: 0 }}>
        <TownCam cam={camAt(t)} />
        <TownLights />
        <City built town lowRise={LOW} />
        <WelcomeSign />
        <Citizens t={t} wave={1} />
        <MayorBob t={bobT} happy={happy} />
        <Previews t={t} />
      </ThreeCanvas>
      <TownHud day="DAY 1" pop={100} />
      <Overlays t={t} />
      <PillCaptions t={t} phrases={PHRASES} />
      {audio ? <Audio src={staticFile("mobrule/day1-v2-vo.wav")} /> : null}
    </AbsoluteFill>
  );
};
