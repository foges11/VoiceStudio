// Mobville — Mob Rule's own look (not Brand City's): a warm, golden-hour small town (pastel houses, pitched roofs,
// gardens), a wooden "Welcome to Mobville" sign, friendly waving citizens, and a cosy HUD (a town badge + cream
// caption pills) instead of Brand City's wordmark and stats panel. Shared by the episodes and the look stills.
import React, { useMemo } from "react";
import { AbsoluteFill } from "remotion";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { HALF } from "../city/CityReal";

export type V3 = [number, number, number];
export const SKY = "#f6d8bd";

/** warm late-afternoon light: low sun, long soft shadows, peachy sky fill */
export const TownLights: React.FC = () => {
  const sun = useMemo(() => {
    const l = new THREE.DirectionalLight("#ffc98f", 2.9);
    l.position.set(-38, 26, 30);
    l.castShadow = true;
    l.shadow.mapSize.set(4096, 4096);
    const c = l.shadow.camera as THREE.OrthographicCamera;
    c.left = -45;
    c.right = 45;
    c.top = 45;
    c.bottom = -45;
    c.near = 1;
    c.far = 170;
    l.shadow.bias = -0.0004;
    l.shadow.normalBias = 0.03;
    return l;
  }, []);
  return (
    <>
      <hemisphereLight args={["#ffe6cc", "#8d8a5c", 1.15]} />
      <primitive object={sun} />
      <primitive object={sun.target} />
    </>
  );
};

export type Cam = { pos: V3; look: V3; fov: number };
export const TownCam: React.FC<{ cam: Cam }> = ({ cam }) => {
  const { camera, scene } = useThree();
  const c = camera as THREE.PerspectiveCamera;
  c.fov = cam.fov;
  c.near = 0.05;
  c.far = 400;
  c.position.set(...cam.pos);
  c.lookAt(...cam.look);
  c.updateProjectionMatrix();
  if (!scene.fog) {
    scene.fog = new THREE.Fog(SKY, 50, 115);
    scene.background = new THREE.Color(SKY);
  }
  return null;
};

const signTex = () => {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 512;
  const g = c.getContext("2d")!;
  // painted wood
  g.fillStyle = "#8a5a36";
  g.fillRect(0, 0, 1024, 512);
  for (let i = 0; i < 9; i++) {
    g.fillStyle = i % 2 ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.05)";
    g.fillRect(0, i * 57, 1024, 30);
  }
  g.fillStyle = "#f6ead2";
  g.beginPath();
  g.roundRect(28, 28, 968, 456, 40);
  g.fill();
  g.textAlign = "center";
  g.fillStyle = "#7a4a2c";
  g.font = "700 64px Poppins";
  g.fillText("WELCOME TO", 512, 140);
  g.fillStyle = "#d9443a";
  g.font = "800 150px Poppins";
  g.fillText("MOBVILLE", 512, 290);
  g.fillStyle = "#7a4a2c";
  g.font = "700 74px Poppins";
  g.fillText("POP. 100", 512, 410);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};

/** the town sign at the edge of town, facing the road in */
export const SIGN_AT: V3 = [9, 0, HALF + 3.2];
export const WelcomeSign: React.FC = () => {
  const m = useMemo(
    () => ({ board: new THREE.MeshStandardMaterial({ map: signTex(), roughness: 0.8 }), wood: new THREE.MeshStandardMaterial({ color: "#6b4329", roughness: 0.9 }), flower: ["#ff7a8a", "#ffd166", "#ffffff"].map((c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.8 })) }),
    [],
  );
  const g = useMemo(() => ({ box: new THREE.BoxGeometry(1, 1, 1), sph: new THREE.SphereGeometry(0.5, 12, 10) }), []);
  return (
    <group position={SIGN_AT} rotation={[0, 0.35, 0]}>
      <mesh geometry={g.box} material={m.wood} position={[-1.05, 0.75, 0]} scale={[0.12, 1.5, 0.12]} castShadow />
      <mesh geometry={g.box} material={m.wood} position={[1.05, 0.75, 0]} scale={[0.12, 1.5, 0.12]} castShadow />
      <mesh geometry={g.box} material={[m.wood, m.wood, m.wood, m.wood, m.board, m.wood]} position={[0, 1.35, 0.02]} scale={[2.6, 1.3, 0.1]} castShadow />
      {Array.from({ length: 12 }, (_, i) => (
        <mesh key={i} geometry={g.sph} material={m.flower[i % 3]} position={[-1.3 + (i % 6) * 0.52, 0.12, 0.35 + Math.floor(i / 6) * 0.25]} scale={[0.22, 0.16, 0.22]} castShadow />
      ))}
    </group>
  );
};

// ------------------------------------------------------------------ HUD: a town badge (top left) and the day tag (top right)
export const TownHud: React.FC<{ day: string; pop: number }> = ({ day, pop }) => (
  <AbsoluteFill style={{ fontFamily: "Poppins" }}>
    <AbsoluteFill style={{ background: "linear-gradient(rgba(60,30,10,0.28), rgba(60,30,10,0) 18%, rgba(60,30,10,0) 62%, rgba(60,30,10,0.32))" }} />
    <div style={{ position: "absolute", top: 120, left: 70, padding: "16px 28px 14px", background: "#f6ead2", borderRadius: 26, border: "5px solid #8a5a36", boxShadow: "0 10px 28px rgba(60,30,10,0.35)" }}>
      <div style={{ color: "#d9443a", fontWeight: 800, fontSize: 52, lineHeight: 1, letterSpacing: 1 }}>MOBVILLE</div>
      <div style={{ color: "#7a4a2c", fontWeight: 700, fontSize: 30, marginTop: 6, fontVariantNumeric: "tabular-nums" }}>POP. {pop}</div>
    </div>
    <div style={{ position: "absolute", top: 132, right: 170, padding: "12px 26px", background: "#d9443a", borderRadius: 999, color: "#fff7ea", fontWeight: 800, fontSize: 36, letterSpacing: 2, boxShadow: "0 10px 28px rgba(60,30,10,0.3)" }}>
      MOB RULE · {day}
    </div>
  </AbsoluteFill>
);

/** captions: a cream pill, dark text, the spoken word in red; a short fade, no motion */
export type Word = [number, number, string];
export const PillCaptions: React.FC<{ t: number; phrases: Word[][] }> = ({ t, phrases }) => {
  const i = phrases.findIndex((p, k) => t >= p[0][0] - 0.05 && t < (phrases[k + 1]?.[0][0] ?? 99) - 0.05);
  const k0 = i < 0 && t < phrases[0][0][0] ? 0 : i;
  if (k0 < 0) return null;
  const p = phrases[k0];
  const end = p[p.length - 1][1];
  if (t > end + 0.6) return null;
  const op = Math.min(k0 === 0 ? 1 : clamp01((t - (p[0][0] - 0.05)) / 0.12), 1 - clamp01((t - (end + 0.4)) / 0.2));
  return (
    <div style={{ position: "absolute", top: 1250, left: 90, right: 170, display: "flex", justifyContent: "center", opacity: op, fontFamily: "Poppins" }}>
      <div style={{ padding: "16px 30px", borderRadius: 30, background: "rgba(246,234,210,0.96)", boxShadow: "0 10px 26px rgba(60,30,10,0.3)", textAlign: "center" }}>
        <span style={{ fontWeight: 800, fontSize: 54, lineHeight: 1.15, color: "#3b2414" }}>
          {p.map(([a, , w], k) => (
            <span key={k} style={{ color: t >= a - 0.03 && (k === p.length - 1 || t < p[k + 1][0] - 0.03) ? "#d9443a" : "#3b2414" }}>
              {w}
              {k < p.length - 1 ? " " : ""}
            </span>
          ))}
        </span>
      </div>
    </div>
  );
};
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
