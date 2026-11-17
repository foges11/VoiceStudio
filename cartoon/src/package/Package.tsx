// "What If A Package Arrived With Tomorrow's Date On It?" — a 34 s vertical Short, picture only (the creator
// records the voice-over to vo/script.txt). Every shot is anchored to a script line in plan/package_plan.md; times
// below are the planned line starts at ~170 wpm. Everything is a pure function of the frame.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { CAST } from "../inkbeat/char/cast";
import { Character3D, headOf } from "../inkbeat/char/Character3D";
import { CLOTH } from "../inkbeat/char/family";
import { CastLight } from "../inkbeat/core/castLight";
import { subFrame, useFonts } from "../inkbeat/core/frame";
import { solveArm, holdInFront } from "../inkbeat/core/ik";
import { boxG, canvasTex, coneG, coreMat, cylG, h1, Label, M, sphG, torG } from "../inkbeat/core/kit";
import { moodOf } from "../inkbeat/core/moods";
import { poseAt, withShake } from "../inkbeat/core/rig";
import type { Beat, BeatPrm, Cam } from "../inkbeat/core/rig";
import { View } from "../inkbeat/core/View";
import type { V3 } from "../inkbeat/types";
import { Window } from "../demo/Street";

export const FPS = 30;
export const DURATION = 34 * FPS;

// ------------------------------------------------------------------ the plan (line starts, seconds)
export const LINES: [number, string][] = [
  [0.0, "The package was delivered tomorrow."],
  [2.0, "But it was already sitting on his doorstep today."],
  [4.6, "Inside was one photo of something that hasn't happened yet."],
  [7.8, "Him, on this porch, soaking wet, holding this exact box."],
  [11.4, "Tomorrow. 7:02 PM."],
  [13.2, "So he did the one thing that would break it."],
  [15.8, "He waded into a lake and threw the box as far as he could."],
  [19.6, "He got home at 7:01. The porch was empty."],
  [23.0, "Then his phone buzzed. One new delivery."],
  [26.0, "He opened the door, and there it was. Dripping wet."],
  [29.8, "And the handwriting on the label was his own."],
];

// ------------------------------------------------------------------ helpers
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = (u: number) => {
  const x = clamp(u);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};
const ramp = (t: number, a: number, b: number) => ease((t - a) / (b - a));
const mixV = (a: V3, b: V3, u: number): V3 => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u];
const cam = (pos: V3, look: V3, fov: number): Cam => ({ pos, look, fov, roll: 0 });
const shoot = (base: Cam, t0: number, t: number, beats: [number, string, BeatPrm?][]) => {
  const bs: Beat[] = beats.map(([bt, move]) => ({ t: bt, move, dur: 0.63 }));
  const p = poseAt(base, bs, t0, t, beats.map((b) => b[2]));
  return withShake(p, p.shake);
};

const P0 = 0.3; // porch floor height
const MILO = {
  ...CAST.adult,
  look: { ...CAST.adult.look, outfit: "sweater" as const, colors: { top: CLOTH.mustard, inner: CLOTH.cream, bottom: CLOTH.denim, shoes: CLOTH.chestnut, accent: CLOTH.horn } },
};
const WET_MILO = {
  ...MILO,
  look: { ...MILO.look, colors: { top: "#8a6a2a", inner: "#b8ae98", bottom: "#24304a", shoes: "#3a2418", accent: CLOTH.horn } },
};
const H = MILO.height;
const BOX: V3 = [0.42, 0.3, 0.34];
const MAT: V3 = [0, P0, 0.5];

// ------------------------------------------------------------------ the package
const photoTex = () =>
  canvasTex("photo-inner", 512, 640, (g, w, h) => {
    const sky = g.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, "#1c2550");
    sky.addColorStop(1, "#4a3a6a");
    g.fillStyle = sky;
    g.fillRect(0, 0, w, h);
    g.fillStyle = "#c9a07a"; // the facade
    g.fillRect(0, h * 0.12, w, h * 0.7);
    g.fillStyle = "#5a3a2a"; // the door
    g.fillRect(w * 0.36, h * 0.3, w * 0.28, h * 0.48);
    g.fillStyle = "#ffd890"; // porch light
    g.beginPath();
    g.arc(w * 0.72, h * 0.32, 14, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#7a5a4a"; // porch floor
    g.fillRect(0, h * 0.78, w, h * 0.22);
    // a soaked figure holding a box
    g.fillStyle = "#2a2a3a";
    g.beginPath();
    g.ellipse(w * 0.5, h * 0.38, 34, 40, 0, 0, Math.PI * 2);
    g.fill();
    g.fillRect(w * 0.41, h * 0.44, w * 0.18, h * 0.24);
    g.fillRect(w * 0.43, h * 0.66, w * 0.05, h * 0.14);
    g.fillRect(w * 0.52, h * 0.66, w * 0.05, h * 0.14);
    g.fillStyle = "#a07a4a";
    g.fillRect(w * 0.4, h * 0.5, w * 0.2, h * 0.12);
    g.fillStyle = "#ff8a2a"; // the timestamp
    g.font = "800 46px Poppins";
    g.textAlign = "right";
    g.fillText("7:02 PM", w - 22, h - 26);
  });

/** the photo: a white instant-photo card, the picture on its front (+z) */
const PhotoCard: React.FC<{ p: V3; r?: V3; s?: number }> = ({ p, r = [0, 0, 0], s = 1 }) => {
  const m = React.useMemo(() => new THREE.MeshBasicMaterial({ map: photoTex(), toneMapped: false }), []);
  return (
    <group position={p} rotation={r} scale={s}>
      <M g={boxG(0.11, 0.135, 0.003)} c="#f6f2ea" />
      <mesh position={[0, 0.011, 0.0021]} material={m} userData={{ outline: false }}>
        <planeGeometry args={[0.094, 0.098]} />
      </mesh>
    </group>
  );
};

const Package: React.FC<{ p: V3; yaw?: number; wet?: number; open?: number; t?: number; drips?: boolean }> = ({ p, yaw = 0, wet = 0, open = 0, t = 0, drips }) => {
  const [w, h, d] = BOX;
  const c = new THREE.Color("#c99a5e").lerp(new THREE.Color("#6e4a2a"), wet);
  const col = `#${c.getHexString()}`;
  const flap = open * 1.9;
  return (
    <group position={p} rotation={[0, yaw, 0]}>
      <M g={boxG(w, h, d)} c={col} tex="paper" p={[0, h / 2, 0]} />
      {/* tape strip and the two top flaps */}
      {open < 0.02 ? <M g={boxG(0.07, 0.004, d + 0.004)} c="#d8c9a0" p={[0, h + 0.002, 0]} /> : null}
      <group position={[-w / 2, h, 0]} rotation={[0, 0, flap]}>
        <M g={boxG(w / 2, 0.006, d)} c={col} tex="paper" p={[w / 4, 0.003, 0]} />
      </group>
      <group position={[w / 2, h, 0]} rotation={[0, 0, -flap]}>
        <M g={boxG(w / 2, 0.006, d)} c={col} tex="paper" p={[-w / 4, 0.003, 0]} />
      </group>
      {/* the shipping label on the front (+z): the key fact, unlit and high contrast */}
      <Label text="DELIVERED:" p={[0, h * 0.7, d / 2 + 0.002]} w={0.3} h={0.055} fg="#3a2a2a" bg="#f4f0e6" font={0.7} />
      <Label text="TOMORROW" p={[0, h * 0.45, d / 2 + 0.002]} w={0.36} h={0.085} fg="#c0281e" bg="#f4f0e6" font={0.78} stamp />
      {/* the handwritten sender on the left side (-x) */}
      <Label text="FROM: MILO" p={[-w / 2 - 0.002, h * 0.5, 0]} r={[0, -Math.PI / 2, -0.06]} w={0.3} h={0.09} fg="#1f2f6a" bg="none" font={0.62} />
      {drips
        ? Array.from({ length: 9 }, (_, i) => {
            const ph = (t * 1.4 + h1(i + 3) ) % 1;
            const x = (h1(i * 7) - 0.5) * w * 0.9;
            const z = (h1(i * 13) - 0.5) * d * 0.9 + (i % 2 ? d / 2 : -d / 2) * 0.95;
            return <M key={i} g={sphG(0.012, 8)} c="#9cc8f0" p={[x, h * (0.6 - ph * 0.6), z]} s={[1, 1.6, 1]} cast={false} />;
          })
        : null}
    </group>
  );
};

// ------------------------------------------------------------------ the porch and the house
const Wall: React.FC = () => (
  <group>
    {/* the facade in three pieces around the doorway (x -0.55..0.55, up to 2.25), never overlapping */}
    <M g={boxG(4.45, 4.4, 0.3)} c="#e9c79c" tex="plaster" p={[-2.775, P0 + 2.2, -0.15]} />
    <M g={boxG(4.45, 4.4, 0.3)} c="#e9c79c" tex="plaster" p={[2.775, P0 + 2.2, -0.15]} />
    <M g={boxG(1.1, 2.15, 0.3)} c="#e9c79c" tex="plaster" p={[0, P0 + 2.25 + 1.075, -0.15]} />
    {/* door frame */}
    <M g={boxG(0.08, 2.3, 0.36)} c="#f2ead8" tex="wood" p={[-0.6, P0 + 1.15, -0.12]} />
    <M g={boxG(0.08, 2.3, 0.36)} c="#f2ead8" tex="wood" p={[0.6, P0 + 1.15, -0.12]} />
    <M g={boxG(1.28, 0.1, 0.36)} c="#f2ead8" tex="wood" p={[0, P0 + 2.3, -0.12]} />
    {/* roof edge */}
    <M g={boxG(10, 0.25, 2.8)} c="#7a3a3a" tex="roofTiles" p={[0, P0 + 4.5, 1.0]} r={[-0.18, 0, 0]} />
    <Window p={[2.1, P0 + 1.5, 0.011]} w={1.0} h={1.2} lit />
    <Window p={[-2.1, P0 + 1.5, 0.011]} w={1.0} h={1.2} />
  </group>
);

const Door: React.FC<{ open: number }> = ({ open }) => (
  <group position={[-0.53, P0, -0.06]} rotation={[0, open * 1.45, 0]}>
    <M g={boxG(1.04, 2.22, 0.06)} c="#2f5a6a" tex="planks" p={[0.52, 1.11, 0]} />
    <M g={boxG(0.7, 0.6, 0.02)} c="#26495a" p={[0.52, 1.6, 0.035]} />
    <M g={boxG(0.7, 0.6, 0.02)} c="#26495a" p={[0.52, 0.65, 0.035]} />
    <M g={sphG(0.04, 12)} c={CLOTH.brass} tex="metal" p={[0.92, 1.05, 0.06]} />
  </group>
);

const Hallway: React.FC<{ lamp?: number }> = ({ lamp = 1 }) => (
  <group>
    <M g={boxG(3.2, 0.1, 4.2)} c="#a86e44" tex="planks" p={[0, P0 - 0.05, -2.4]} cast={false} />
    <M g={boxG(3.4, 0.1, 4.4)} c="#efe2c8" p={[0, P0 + 2.65, -2.4]} />
    <M g={boxG(3.2, 2.7, 0.1)} c="#8aa48a" tex="plaster" p={[0, P0 + 1.35, -4.55]} />
    <M g={boxG(0.1, 2.7, 4.2)} c="#8aa48a" tex="plaster" p={[-1.65, P0 + 1.35, -2.4]} />
    <M g={boxG(0.1, 2.7, 4.2)} c="#8aa48a" tex="plaster" p={[1.65, P0 + 1.35, -2.4]} />
    <M g={boxG(1.2, 0.02, 2.2)} c="#a8384a" tex="fabric" p={[0, P0 + 0.01, -1.9]} />
    {/* a side table, a lamp, coat hooks, two frames, a shoe rack */}
    <M g={boxG(0.5, 0.75, 0.35)} c="#6a4430" tex="wood" p={[1.35, P0 + 0.375, -2.6]} />
    <M g={cylG(0.03, 0.06, 0.4, 12)} c="#3a3440" tex="metal" p={[1.35, P0 + 0.95, -2.6]} />
    <M g={cylG(0.12, 0.2, 0.22, 16, true)} c="#f0d8a8" tex="fabric" p={[1.35, P0 + 1.25, -2.6]} />
    <mesh geometry={sphG(0.07, 12)} material={coreMat("#ffd890", 1.0)} position={[1.35, P0 + 1.2, -2.6]} />
    <pointLight position={[1.3, P0 + 1.4, -2.4]} color="#ffb860" intensity={5 * lamp} distance={5} decay={2} />
    {[-0.3, 0, 0.3].map((z, i) => (
      <M key={z} g={cylG(0.02, 0.02, 0.12, 8)} c="#3a3440" p={[-1.58, P0 + 1.75, -1.4 + z]} r={[0, 0, Math.PI / 2]} />
    ))}
    <M g={boxG(0.08, 0.7, 0.4)} c="#a83a3a" tex="fabric" p={[-1.54, P0 + 1.4, -1.1]} />
    <M g={boxG(0.04, 0.5, 0.4)} c="#c8a050" tex="wood" p={[-1.6, P0 + 1.7, -2.6]} />
    <M g={boxG(0.04, 0.4, 0.55)} c="#3a6a8a" tex="wood" p={[1.6, P0 + 1.75, -1.4]} />
    <M g={boxG(0.4, 0.18, 0.7)} c="#5a3a2a" tex="wood" p={[-1.35, P0 + 0.09, -2.4]} />
  </group>
);

const Porch: React.FC<{ light?: number; t: number; clock?: boolean }> = ({ light = 0, t, clock }) => (
  <group>
    {/* lawn, path, porch deck, steps */}
    <M g={boxG(60, 0.2, 60)} c="#6f9a52" tex="grass" p={[0, -0.1, 0]} cast={false} />
    <M g={boxG(1.4, 0.04, 8)} c="#b8ab98" tex="stone" p={[0, 0.02, 6.2]} cast={false} />
    <M g={boxG(5.6, P0, 2.4)} c="#9a6a4a" tex="planks" p={[0, P0 / 2, 1.2]} />
    <M g={boxG(1.6, 0.15, 0.4)} c="#b08060" tex="planks" p={[0, 0.075, 2.6]} />
    {/* railing: posts only touch the rails */}
    {[-2.7, -1.6, 1.6, 2.7].map((x) => (
      <M key={x} g={boxG(0.1, 0.9, 0.1)} c="#f2ead8" tex="wood" p={[x, P0 + 0.45, 2.3]} />
    ))}
    <M g={boxG(1.2, 0.08, 0.12)} c="#f2ead8" tex="wood" p={[-2.15, P0 + 0.94, 2.3]} />
    <M g={boxG(1.2, 0.08, 0.12)} c="#f2ead8" tex="wood" p={[2.15, P0 + 0.94, 2.3]} />
    {/* roof posts */}
    <M g={boxG(0.16, 4.1, 0.16)} c="#f2ead8" tex="wood" p={[-2.7, P0 + 2.05, 2.3]} />
    <M g={boxG(0.16, 4.1, 0.16)} c="#f2ead8" tex="wood" p={[2.7, P0 + 2.05, 2.3]} />
    {/* doormat */}
    <M g={boxG(1.1, 0.02, 0.62)} c="#8a5a34" tex="fabric" p={[0, P0 + 0.01, 0.5]} />
    {/* planters with plants, a bench, a watering can, a boot pair */}
    {[-1.3, 1.3].map((x, i) => (
      <group key={x} position={[x, P0, 0.35]}>
        <M g={cylG(0.2, 0.15, 0.36, 16)} c="#b0583a" tex="brick" p={[0, 0.18, 0]} />
        <M g={sphG(0.24 + i * 0.03, 14)} c={i ? "#4a8a4a" : "#5aa04a"} p={[0, 0.5, 0]} />
        <M g={sphG(0.16, 12)} c="#3f7a40" p={[0.12, 0.62, 0.05]} />
      </group>
    ))}
    <M g={boxG(1.1, 0.08, 0.4)} c="#6a8a5a" tex="wood" p={[-2.05, P0 + 0.45, 0.4]} />
    {[-2.5, -1.6].map((x) => (
      <M key={x} g={boxG(0.08, 0.45, 0.36)} c="#4a5a3a" tex="wood" p={[x, P0 + 0.225, 0.4]} />
    ))}
    <M g={cylG(0.09, 0.1, 0.2, 12)} c="#4a7a9a" tex="metal" p={[2.25, P0 + 0.1, 0.5]} />
    <M g={boxG(0.12, 0.16, 0.24)} c="#3a2a24" p={[1.85, P0 + 0.08, 0.95]} />
    <M g={boxG(0.12, 0.16, 0.24)} c="#3a2a24" p={[2.0, P0 + 0.08, 0.98]} />
    {/* the porch light (the key practical at night) */}
    <M g={boxG(0.16, 0.26, 0.12)} c="#2a2a30" tex="metal" p={[0.95, P0 + 1.95, 0.06]} />
    <mesh geometry={sphG(0.06, 12)} material={coreMat("#ffd890", 0.5 + 0.6 * light)} position={[0.95, P0 + 1.93, 0.13]} />
    <pointLight position={[0.95, P0 + 1.9, 0.5]} color="#ffb860" intensity={7 * light} distance={6} decay={2} />
    {/* house number and the mailbox with the owner's name (pays off "FROM: MILO") */}
    <Label text="24" p={[-0.95, P0 + 1.95, 0.005]} w={0.24} h={0.2} fg="#f2ead8" bg="#2f5a6a" font={0.7} />
    <group position={[2.2, P0, 1.5]}>
      <M g={boxG(0.08, 1.0, 0.08)} c="#3a3440" tex="metal" p={[0, 0.5, 0]} />
      <M g={boxG(0.28, 0.24, 0.42)} c="#c83a3a" tex="metal" p={[0, 1.1, 0]} />
      <Label text="MILO" p={[-0.142, 1.1, 0]} r={[0, -Math.PI / 2, 0]} w={0.36} h={0.12} fg="#f4ead6" bg="none" font={0.7} />
    </group>
    {/* the wall clock beside the door (night): the time is the fact */}
    {clock ? <Label text="7:01 PM" p={[-1.0, P0 + 1.55, 0.006]} w={0.5} h={0.18} fg="#ff8a3a" bg="#15171e" font={0.66} /> : null}
    {/* neighbors, a tree, hedges and a fence for depth */}
    <M g={boxG(6, 5, 5)} c="#9ab8c8" tex="plaster" p={[-9.5, 2.5, -1.5]} />
    <M g={boxG(6, 4.4, 5)} c="#c8a0b0" tex="plaster" p={[9.5, 2.2, -1.5]} />
    <M g={cylG(0.18, 0.24, 2.6, 10)} c="#6a4a3a" tex="wood" p={[-4.6, 1.3, 4.5]} />
    <M g={sphG(1.5, 16)} c="#4f8a46" p={[-4.6, 3.3, 4.5]} />
    <M g={sphG(1.1, 14)} c="#5a9a50" p={[-4.0, 2.9, 5.2]} />
    {[-3.8, -3.2, 3.2, 3.8, 4.4].map((x, i) => (
      <M key={x} g={sphG(0.42 + (i % 2) * 0.08, 12)} c={i % 2 ? "#4a8a4a" : "#5a9a4c"} p={[x, 0.35, 0.6 + (i % 3) * 0.3]} />
    ))}
    {Array.from({ length: 14 }, (_, i) => (
      <M key={i} g={boxG(0.1, 0.8, 0.06)} c="#f2ead8" tex="wood" p={[-7 + i * 0.5, 0.4, 9]} />
    ))}
    {void t}
  </group>
);

// ------------------------------------------------------------------ the lake
const Lake: React.FC<{ t: number; splashT: number; splashAt: V3 }> = ({ t, splashT, splashAt }) => {
  const s = t - splashT;
  return (
    <group>
      <M g={boxG(400, 0.1, 400)} c="#2f86c8" p={[0, -0.05, -150]} cast={false} />
      <M g={boxG(40, 0.4, 14)} c="#c8b48a" tex="sand" p={[0, -0.12, 12]} cast={false} />
      {/* far shore: hills and pines */}
      <M g={sphG(30, 24)} c="#4a6a5a" p={[-20, -22, -70]} />
      <M g={sphG(36, 24)} c="#3f5f55" p={[30, -28, -80]} />
      {Array.from({ length: 22 }, (_, i) => {
        const x = -40 + i * 3.8 + (h1(i) - 0.5) * 2;
        const z = -45 - h1(i + 9) * 6;
        const hh = 4 + h1(i + 4) * 3;
        return <M key={i} g={coneG(1.3, hh, 10)} c={i % 2 ? "#2f5a44" : "#3a6a4a"} p={[x, hh / 2, z]} />;
      })}
      {/* reeds and rocks at the near shore */}
      {Array.from({ length: 16 }, (_, i) => (
        <M key={i} g={cylG(0.02, 0.03, 1.1 + h1(i) * 0.6, 6)} c="#5a7a3a" p={[-4 + i * 0.5 + h1(i + 2) * 0.3, 0.45, 4.2 + h1(i + 7) * 0.8]} r={[0, 0, (h1(i + 5) - 0.5) * 0.3 + Math.sin(t * 1.2 + i) * 0.04]} />
      ))}
      {[[-3.2, 4.8], [2.8, 5.2], [3.6, 4.6]].map(([x, z], i) => (
        <M key={i} g={sphG(0.4 + i * 0.1, 10)} c="#7a7480" tex="rock" p={[x, 0.05, z]} s={[1.3, 0.6, 1]} />
      ))}
      <M g={torG(0.42 + 0.03 * Math.sin(t * 2.2), 0.03)} c="#d6ecfa" p={[0, 0.02, 0]} r={[Math.PI / 2, 0, 0]} op={0.8} cast={false} />
      {/* the splash: rings and heavy drops, then nothing */}
      {s > 0 && s < 1.6
        ? [0, 0.25, 0.5].map((k) => {
            const u = clamp((s - k) / 1.1);
            return u > 0 && u < 1 ? <M key={k} g={torG(0.25 + u * 1.4, 0.03)} c="#cfe6f8" p={[splashAt[0], 0.02, splashAt[2]]} r={[Math.PI / 2, 0, 0]} op={1 - u} cast={false} /> : null;
          })
        : null}
      {s > 0 && s < 0.9
        ? Array.from({ length: 10 }, (_, i) => {
            const a = (i / 10) * Math.PI * 2;
            const v = 1.6 + h1(i) * 1.2;
            const y = v * s - 4.9 * s * s;
            return y > 0 ? <M key={i} g={sphG(0.07, 8)} c="#dceefa" p={[splashAt[0] + Math.cos(a) * s * 0.9, y, splashAt[2] + Math.sin(a) * s * 0.9]} cast={false} /> : null;
          })
        : null}
    </group>
  );
};

/** water running off a soaked character */
const Drips: React.FC<{ at: V3; t: number; n?: number }> = ({ at, t, n = 10 }) => (
  <group>
    {Array.from({ length: n }, (_, i) => {
      const ph = (t * 1.2 + h1(i + 1)) % 1;
      const x = at[0] + (h1(i * 3) - 0.5) * 0.45;
      const z = at[2] + (h1(i * 5) - 0.5) * 0.25;
      return <M key={i} g={sphG(0.014, 8)} c="#9cc8f0" p={[x, at[1] + 1.05 - ph * 1.05, z]} s={[1, 1.7, 1]} cast={false} />;
    })}
  </group>
);

/** both hands on a box held in front of the chest */
const holdBox = (position: V3, yaw: number, fwd = 0.27, up = 0.5) => {
  const f: V3 = [Math.sin(yaw), 0, Math.cos(yaw)];
  const r: V3 = [Math.cos(yaw), 0, -Math.sin(yaw)];
  const c: V3 = [position[0] + f[0] * fwd * H, position[1] + up * H, position[2] + f[2] * fwd * H];
  const side = (s: number): V3 => [c[0] + r[0] * s * (BOX[0] / 2 + 0.01), c[1] + 0.02, c[2] + r[2] * s * (BOX[0] / 2 + 0.01)];
  const R = solveArm({ position, yaw, side: "R", target: side(1), height: H, build: MILO.build });
  const L = solveArm({ position, yaw, side: "L", target: side(-1), height: H, build: MILO.build });
  return { pose: { armR: R.arm, armRFwd: R.fwd, armL: L.arm, armLFwd: L.fwd }, box: [c[0], c[1] - BOX[1] / 2, c[2]] as V3 };
};

// ------------------------------------------------------------------ the shots
type Shot = { mood: string; cam: Cam; focus: V3; blur: number; body: React.ReactNode; head?: V3; overlay?: React.ReactNode; flash?: number; filter?: string; sky?: boolean };

const shotAt = (t: number): Shot => {
  // S01 0.0–2.0: the box on the mat, the date readable; low push in (the key object in the first second)
  if (t < 2.0) {
    const c = shoot(cam([0.5, P0 + 0.42, 1.95], [0, P0 + 0.17, 0.62], 38), 0, t, [[0.15, "PUSH", { frac: 0.3, dur: 1.3 }], [1.5, "CRANE_UP", { up: 0.08, dur: 0.5 }]]);
    return { mood: "day", cam: c, focus: [0, P0 + 0.17, 0.67], blur: 2.4, body: <><Porch t={t} /><Wall /><Door open={0} /><Package p={MAT} /></> };
  }
  // S02 2.0–4.6: the door opens, he steps out and sees it
  if (t < 4.6) {
    const u = t - 2.0;
    const open = ramp(u, 0.1, 0.7);
    const pos = mixV([0, P0, -0.5], [0, P0, 0.0], ramp(u, 0.5, 1.3));
    const surprised = u > 1.25;
    const head = headOf(pos, H, MILO.build);
    const c = shoot(cam([1.15, P0 + 0.45, 2.7], [0, P0 + 1.25, 0.1], 46), 2.0, t, [[2.4, "CRANE_UP", { up: 0.18 }], [3.2, "PUSH", { frac: 0.18 }], [4.0, "PUNCH", { frac: 0.06 }]]);
    return {
      mood: "day", cam: c, focus: head, blur: 1.6, head,
      body: (
        <>
          <Porch t={t} /><Wall /><Hallway /><Door open={open} /><Package p={MAT} />
          <Character3D {...MILO} position={pos} yaw={0} t={t} faceCamera={c.pos} faceCameraAmount={0.2}
            face={{ eyes: surprised ? "wide" : "open", mouth: surprised ? "o" : "flat", brows: surprised ? "raised" : "neutral", look: -0.1 }}
            pose={{ armL: [8, 12], armR: surprised ? [24, 70] : [8, 14], armRFwd: 40, headNod: surprised ? 14 : 4, walk: u < 1.3 ? u * 6 : undefined }} />
        </>
      ),
    };
  }
  // S03 4.6–7.8: he opens it and pulls out a photo; at 6.2 over the shoulder onto the photo
  if (t < 7.8) {
    const pos: V3 = [0, P0, 0.0];
    const hold = holdInFront({ position: pos, yaw: 0, height: H, up: 0.55, forward: 0.26, out: 0.06, build: MILO.build });
    const head = headOf(pos, H, MILO.build);
    const ots = false;
    const photoAt: V3 = [hold.hand[0] - 0.01, hold.hand[1] + 0.09, hold.hand[2] + 0.04];
    const c = shoot(cam([0.9, P0 + 1.25, 2.1], [0, P0 + 1.3, 0.1], 42), 4.6, t, [[4.8, "PUSH", { frac: 0.15 }], [5.6, "ORBIT_L", { deg: 10 }], [6.3, "MACRO", { dur: 1.3, to: cam([photoAt[0] + 0.06, photoAt[1] + 0.03, photoAt[2] + 0.42], photoAt, 36) }]]);
    const pulled = ramp(t, 4.7, 5.3);
    return {
      mood: "day", cam: c, focus: t > 6.6 ? photoAt : head, blur: 1.6, head,
      body: (
        <>
          <Porch t={t} /><Wall /><Hallway /><Door open={1} />
          <Package p={[0.32, P0, 0.55]} yaw={-0.4} open={1} />
          <Character3D {...MILO} position={pos} yaw={0} t={t} faceCamera={ots ? undefined : c.pos} faceCameraAmount={0.15}
            face={{ eyes: t > 5.4 ? "wide" : "open", mouth: t > 5.4 ? "open" : "flat", brows: "worried", look: 0 }}
            pose={{ armL: [10, 14], ...hold.pose, headNod: 18 }} />
          <PhotoCard p={mixV([0.3, P0 + 0.25, 0.55], photoAt, pulled)} r={[-0.12, 0.1, 0]} s={1.4} />
        </>
      ),
    };
  }
  // S04 7.8–13.2: inside the photo — tomorrow night, him soaked on this porch holding this box
  if (t < 13.2) {
    const pos: V3 = [0, P0, 0.25];
    const hb = holdBox(pos, 0);
    const head = headOf(pos, H, MILO.build);
    const c = shoot(cam([0.35, P0 + 1.3, 3.4], [0, P0 + 1.2, 0.2], 44), 7.8, t, [[8.6, "PUSH", { frac: 0.12, dur: 1.0 }], [10.0, "ORBIT_R", { deg: 6, dur: 1.2 }], [11.4, "PUSH", { frac: 0.22, dur: 0.8 }]]);
    const stamp = clamp((t - 11.3) / 0.25);
    return {
      mood: "night", cam: c, focus: head, blur: 1.2, head, filter: "saturate(0.82) sepia(0.12) contrast(1.04)",
      overlay: <PhotoFrame stamp={stamp} />,
      body: (
        <>
          <Porch t={t} light={1} /><Wall /><Hallway lamp={0.6} /><Door open={0.85} />
          <Character3D {...WET_MILO} position={pos} yaw={0} t={t} faceCamera={c.pos} faceCameraAmount={0.1}
            face={{ eyes: "wide", mouth: "flat", brows: "worried", sweat: true, look: 0 }} pose={{ ...hb.pose, headNod: 2 }} />
          <Package p={hb.box} wet={0.8} t={t} drips />
          <Drips at={pos} t={t} />
        </>
      ),
    };
  }
  // S05 13.2–15.8: he decides to break it — close, low, golden
  if (t < 15.8) {
    const pos: V3 = [0, P0, 1.2];
    const hb = holdBox(pos, 0.25);
    const head = headOf(pos, H, MILO.build);
    const c = shoot(cam([-0.8, P0 + 1.1, 3.2], [0, P0 + 1.3, 1.2], 42), 13.2, t, [[13.6, "PUSH", { frac: 0.16 }], [14.9, "PUNCH", { frac: 0.1 }]]);
    return {
      mood: "golden", cam: c, focus: head, blur: 1.8, head,
      body: (
        <>
          <Porch t={t} /><Wall /><Hallway /><Door open={0} />
          <Character3D {...MILO} position={pos} yaw={0.25} t={t} faceCamera={c.pos} faceCameraAmount={0.3}
            face={{ eyes: t > 14.4 ? "angry" : "squint", mouth: "flat", brows: "angry", look: 0.15 }} pose={{ ...hb.pose, headNod: -2 }} />
          <Package p={hb.box} yaw={0.25 + Math.PI} />
        </>
      ),
    };
  }
  // S06 15.8–19.6: waist-deep in a lake at dusk, he hurls the box away
  if (t < 19.6) {
    const pos: V3 = [0, -0.62, 0];
    const release = 18.0;
    const land = 18.95;
    const splashAt: V3 = [-1.6, 0, -9];
    const windup = ramp(t, 17.1, 17.8) * (1 - ramp(t, release, release + 0.25));
    const overhead = 1 - ramp(t, release - 0.05, release + 0.3);
    const yaw = Math.PI + 0.15;
    const hb = holdBox(pos, yaw, 0.2, 0.5 + 0.55 * windup);
    const armsUp = { armR: [150 - 40 * (1 - overhead), 20] as [number, number], armRFwd: 70 + 40 * (1 - overhead), armL: [150 - 40 * (1 - overhead), 20] as [number, number], armLFwd: 70 + 40 * (1 - overhead) };
    const pose = t < 17.1 ? hb.pose : t < release ? hb.pose : armsUp;
    const head = headOf(pos, H, MILO.build);
    let boxP: V3 = hb.box;
    if (t >= release) {
      const u = clamp((t - release) / (land - release));
      boxP = [mixV(hb.box, splashAt, u)[0], hb.box[1] + (splashAt[1] - hb.box[1]) * u + 3.2 * Math.sin(Math.PI * u), mixV(hb.box, splashAt, u)[2]];
    }
    const c = shoot(cam([1.9, 0.95, 3.4], [-0.3, 0.85, -1.5], 50), 15.8, t, [[16.1, "PUSH", { frac: 0.1 }], [17.2, "CRANE_UP", { up: 0.35 }], [18.0, "PULL", { frac: -0.12, dur: 0.8 }], [18.95, "SHAKE"]]);
    return {
      mood: "dusk", cam: c, focus: head, blur: 0.8, head,
      body: (
        <>
          <Lake t={t} splashT={land} splashAt={splashAt} />
          <Character3D {...WET_MILO} position={pos} yaw={yaw} t={t}
            face={{ eyes: "angry", mouth: t > 17.7 && t < 18.5 ? "yell" : "flat", brows: "angry" }} pose={{ ...pose, bob: Math.sin(t * 2.2) * 4 }} />
          {t < land ? <Package p={boxP} yaw={t >= release ? (t - release) * 6 : yaw} wet={0.3} /> : null}
        </>
      ),
    };
  }
  // S07 19.6–23.0: home at 7:01 — the clock, then the empty mat
  if (t < 23.0) {
    const u = t - 19.6;
    const pos = mixV([0.2, 0, 5.5], [0.1, P0, 1.3], ramp(u, 0.0, 2.0));
    const climbing = u < 2.0;
    const head = headOf(pos, H, MILO.build);
    const c = u < 1.1
      ? shoot(cam([-0.55, P0 + 1.5, 1.25], [-1.0, P0 + 1.55, 0.0], 40), 19.6, t, [[19.7, "PULL", { frac: -0.3, dur: 1.0 }]])
      : shoot(cam([1.8, P0 + 1.35, 4.2], [0, P0 + 0.85, 0.9], 50), 20.7, t, [[21.2, "PUSH", { frac: 0.16 }], [22.2, "TILT_DOWN", { deg: 6 }]]);
    return {
      mood: "night", cam: c, focus: u < 1.1 ? [-1.0, P0 + 1.55, 0.0] : [0, P0, 0.6], blur: 1.2, head,
      body: (
        <>
          <Porch t={t} light={1} clock /><Wall /><Hallway lamp={0} /><Door open={0} />
          <Character3D {...WET_MILO} position={pos} yaw={Math.PI} t={t} faceCamera={c.pos} faceCameraAmount={0.25}
            face={{ eyes: u > 2.2 ? "half" : "open", mouth: u > 2.2 ? "smirk" : "flat", brows: "neutral" }}
            pose={{ armL: [8, 12], armR: [8, 12], walk: climbing ? u * 6.5 : undefined }} />
          <Drips at={pos} t={t} n={6} />
        </>
      ),
    };
  }
  // S08 23.0–26.0: inside, the phone buzzes — ONE NEW DELIVERY
  if (t < 26.0) {
    const pos: V3 = [0, P0, -1.4];
    const hold = holdInFront({ position: pos, yaw: 0, height: H, up: 0.56, forward: 0.24, out: 0.05, build: MILO.build });
    const head = headOf(pos, H, MILO.build);
    const buzz = t > 23.2 && t < 24.4 ? Math.sin(t * 90) * 0.004 : 0;
    const phoneAt: V3 = [hold.hand[0] + buzz, hold.hand[1] + 0.12, hold.hand[2] + 0.08];
    const ots = t < 24.8;
    const c = ots
      ? shoot(cam([phoneAt[0] + 0.12, phoneAt[1] + 0.06, phoneAt[2] + 0.46], phoneAt, 38), 23.0, t, [[23.2, "SHAKE"], [23.6, "PUSH", { frac: 0.15 }]])
      : shoot(cam([0.7, P0 + 1.45, -0.25], [0, P0 + 1.4, -1.4], 52), 24.8, t, [[25.0, "PUSH", { frac: 0.12 }]]);
    return {
      mood: "lamp", cam: c, focus: ots ? phoneAt : head, blur: ots ? 2.4 : 1.6, head, sky: false,
      body: (
        <>
          <Wall /><Hallway lamp={1} /><Door open={0} />
          <Character3D {...WET_MILO} position={pos} yaw={0} t={t} faceCamera={ots ? undefined : c.pos} faceCameraAmount={0.2}
            face={{ eyes: t > 24.0 ? "wide" : "open", mouth: t > 24.0 ? "o" : "flat", brows: "worried" }} pose={{ armL: [10, 14], ...hold.pose, headNod: ots ? 20 : 8 }} />
          <Phone p={phoneAt} />
        </>
      ),
    };
  }
  // S09 26.0–29.8: the door opens on the box, back on the mat, dripping wet; a flash — the photo is taken
  if (t < 29.8) {
    const u = t - 26.0;
    const open = ramp(u, 0.2, 0.9);
    const pos: V3 = [0, P0, -0.45];
    const head = headOf(pos, H, WET_MILO.build);
    const c = shoot(cam([0.55, P0 + 0.32, 2.6], [0, P0 + 1.0, 0.0], 50), 26.0, t, [[26.9, "PUSH", { frac: 0.14 }], [28.3, "MACRO", { frac: 0.28, dur: 0.9, to: cam([0.35, P0 + 0.45, 1.4], [0, P0 + 0.18, 0.5], 42) }]]);
    return {
      mood: "night", cam: c, focus: t > 28.3 ? [0, P0 + 0.18, 0.5] : head, blur: 1.6, head,
      flash: t > 29.35 ? Math.max(0, 1 - (t - 29.35) / 0.45) : 0,
      body: (
        <>
          <Porch t={t} light={1} clock /><Wall /><Hallway lamp={1} /><Door open={open} />
          <Package p={MAT} wet={0.85} t={t} drips />
          <M g={cylG(0.42, 0.42, 0.004, 24)} c="#3a5a7a" p={[0.05, P0 + 0.022, 0.55]} s={[1.2, 1, 0.9]} cast={false} />
          <Character3D {...WET_MILO} position={pos} yaw={0} t={t} faceCamera={c.pos} faceCameraAmount={0.1}
            face={{ eyes: u > 1.4 ? "wide" : "open", mouth: u > 1.4 ? "o" : "flat", brows: "worried", look: 0 }}
            pose={{ armL: [10, 14], armR: [12, 30], armRFwd: 30, headNod: 22 }} />
        </>
      ),
    };
  }
  // S10 29.8–34.0: the sender, in his own handwriting; his name on the mailbox behind it
  const focus: V3 = [-0.22, P0 + 0.15, 0.5];
  const c = shoot(cam([-1.13, P0 + 0.42, 0.12], [-0.21, P0 + 0.42, 0.5], 46), 29.8, t, [[30.1, "PUSH", { frac: 0.05, dur: 1.2 }], [31.9, "PUNCH", { frac: 0.03 }]]);
  return {
    mood: "night", cam: c, focus, blur: 2.6,
    body: (
      <>
        <Porch t={t} light={1} clock /><Wall /><Hallway lamp={1} /><Door open={1} />
        <Package p={MAT} wet={0.85} t={t} drips />
      </>
    ),
  };
};

const Phone: React.FC<{ p: V3 }> = ({ p }) => (
  <group position={p} rotation={[-0.12, 0.26, 0]} scale={1.6}>
    <M g={boxG(0.075, 0.15, 0.012)} c="#2b2d35" tex="metal" />
    <Label text="1 NEW DELIVERY" p={[0, 0.012, 0.0065]} w={0.066} h={0.03} fg="#ffffff" bg="#c0281e" font={0.5} />
    <mesh position={[0, -0.03, 0.0064]} material={coreMat("#1f3b5c", 0.9)}>
      <planeGeometry args={[0.066, 0.05]} />
    </mesh>
  </group>
);

/** the instant-photo border while we are inside the picture; the date is written on it */
const PhotoFrame: React.FC<{ stamp: number }> = ({ stamp }) => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <div style={{ position: "absolute", inset: 0, borderStyle: "solid", borderColor: "#f6f2ea", borderWidth: "70px 60px 330px 60px", boxShadow: "inset 0 0 40px rgba(0,0,0,0.35)" }} />
    <div style={{ position: "absolute", left: 60, right: 60, bottom: 30, height: 290, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "Poppins", fontWeight: 800, transform: "rotate(-2deg)" }}>
      <div style={{ fontSize: 92, color: "#1f2f6a", lineHeight: 1.05 }}>TOMORROW</div>
      <div style={{ fontSize: 84, color: "#e0641a", lineHeight: 1.05, transform: `scale(${1 + 0.18 * stamp})` }}>7:02 PM</div>
    </div>
  </AbsoluteFill>
);

export const PackageShort: React.FC<{ sub?: boolean }> = ({ sub = false }) => {
  const ready = useFonts();
  const g = useCurrentFrame();
  if (!ready) return <AbsoluteFill style={{ background: "#1a1220" }} />;
  const { fp } = sub ? subFrame(g) : { fp: g };
  const t = fp / FPS;
  const s = shotAt(t);
  const m = moodOf(s.mood);
  return (
    <AbsoluteFill style={{ background: "#1a1220" }}>
      <View mood={m} cam={s.cam} t={t} focus={s.focus} blur={s.blur} sky={s.sky ?? true} style={s.filter ? { filter: s.filter } : undefined}>
        {s.body}
        <CastLight at={s.head ?? s.focus} cam={s.cam.pos} mood={m} k={s.head ? 1 : 0} />
      </View>
      {s.overlay}
      {s.flash ? <AbsoluteFill style={{ background: "#ffffff", opacity: s.flash }} /> : null}
    </AbsoluteFill>
  );
};

/** one still per shot for look-dev: the frame at the middle of each line */
export const PackageLook: React.FC<{ at: number }> = ({ at }) => {
  const ready = useFonts();
  if (!ready) return <AbsoluteFill style={{ background: "#1a1220" }} />;
  const s = shotAt(at);
  const m = moodOf(s.mood);
  return (
    <AbsoluteFill style={{ background: "#1a1220" }}>
      <View mood={m} cam={s.cam} t={at} focus={s.focus} blur={s.blur} sky={s.sky ?? true} style={s.filter ? { filter: s.filter } : undefined}>
        {s.body}
        <CastLight at={s.head ?? s.focus} cam={s.cam.pos} mood={m} k={s.head ? 1 : 0} />
      </View>
      {s.overlay}
      {s.flash ? <AbsoluteFill style={{ background: "#ffffff", opacity: s.flash }} /> : null}
    </AbsoluteFill>
  );
};

export const LOOK_TIMES = [23.3, 23.9, 33.9];
/** look-dev sheet: frame i is the still at LOOK_TIMES[i] */
export const PackageSheet: React.FC = () => {
  const f = useCurrentFrame();
  return <PackageLook at={LOOK_TIMES[Math.min(f, LOOK_TIMES.length - 1)]} />;
};
