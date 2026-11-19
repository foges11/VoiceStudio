// Brand City — the realistic city-builder look (stills). A perspective 3D city lit like a mobile city-builder: wide
// avenues with sidewalks and lane markings, tree-lined streets, cars, zoned empty lots, one civic building, and a city
// that fills the frame and fades into haze. Plain standard materials (no ink outlines), soft sun shadows.
// "empty" = Day 0 (every lot open). "built" = a preview of a grown city with generic, unbranded placeholder towers.
import React, { useMemo } from "react";
import { AbsoluteFill } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useFonts } from "../inkbeat/core/frame";

export type CityRealId = "empty" | "built";

// ------------------------------------------------------------------ layout (metres)
export const BLOCK = 7; // block size, curb to curb
export const ROAD = 2.2; // road width including nothing else
export const WALK = 0.45; // sidewalk width inside each block
export const PITCH = BLOCK + ROAD;
export const NB = 7; // blocks per side
export const HALF = (NB * PITCH) / 2;
const HALL = [3, 3]; // the civic block

export const rng = (seed: number) => () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};

// ------------------------------------------------------------------ materials and textures
const std = (color: string, rough = 0.85, metal = 0) => new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal });
const canvas = (w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};
const asphaltTex = () =>
  canvas(256, 256, (g) => {
    g.fillStyle = "#52565e";
    g.fillRect(0, 0, 256, 256);
    const r = rng(7);
    for (let i = 0; i < 2600; i++) {
      const v = 70 + r() * 30;
      g.fillStyle = `rgba(${v},${v + 2},${v + 8},0.35)`;
      g.fillRect(r() * 256, r() * 256, 1.5, 1.5);
    }
  });
const grassTex = (base: string, seed: number) =>
  canvas(256, 256, (g) => {
    g.fillStyle = base;
    g.fillRect(0, 0, 256, 256);
    const r = rng(seed);
    for (let i = 0; i < 1800; i++) {
      g.fillStyle = r() > 0.5 ? "rgba(255,255,210,0.10)" : "rgba(20,60,10,0.10)";
      g.beginPath();
      g.arc(r() * 256, r() * 256, 1 + r() * 3, 0, 7);
      g.fill();
    }
  });
const windowTex = (wall: string, glass: string, seed: number) =>
  canvas(256, 512, (g) => {
    g.fillStyle = wall;
    g.fillRect(0, 0, 256, 512);
    const r = rng(seed);
    for (let y = 0; y < 16; y++)
      for (let x = 0; x < 6; x++) {
        const k = 0.85 + r() * 0.3;
        g.fillStyle = glass;
        g.globalAlpha = k;
        g.fillRect(12 + x * 40, 10 + y * 31, 30, 20);
      }
    g.globalAlpha = 1;
  });

// ------------------------------------------------------------------ scene pieces
const Cam: React.FC<{ pos: [number, number, number]; look: [number, number, number]; fov: number }> = ({ pos, look, fov }) => {
  const { camera, scene } = useThree();
  const c = camera as THREE.PerspectiveCamera;
  c.fov = fov;
  c.near = 0.5;
  c.far = 400;
  c.position.set(...pos);
  c.lookAt(...look);
  c.updateProjectionMatrix();
  scene.fog = new THREE.Fog("#cfe3f2", 70, 150);
  scene.background = new THREE.Color("#cfe3f2");
  return null;
};

type Car = { p: [number, number, number]; yaw: number; c: string };

const CityImpl: React.FC<{ built: boolean; suburbs?: [number, number][]; lowRise?: [number, number][] }> = ({ built, suburbs = [], lowRise = [] }) => {
  const m = useMemo(() => {
    const asphalt = new THREE.MeshStandardMaterial({ map: asphaltTex(), roughness: 0.95 });
    (asphalt.map as THREE.Texture).wrapS = (asphalt.map as THREE.Texture).wrapT = THREE.RepeatWrapping;
    (asphalt.map as THREE.Texture).repeat.set(24, 24);
    const lotTex = grassTex("#8ccf5c", 3);
    lotTex.wrapS = lotTex.wrapT = THREE.RepeatWrapping;
    return {
      asphalt,
      walk: std("#d8d4ca", 0.9),
      curb: std("#eeebe4", 0.8),
      lot: new THREE.MeshStandardMaterial({ map: lotTex, roughness: 1 }),
      zone: std("#ffffff", 0.6),
      line: std("#f4f4ee", 0.6),
      yellow: std("#f2c230", 0.6),
      trunk: std("#6b4a33", 0.9),
      leafA: std("#4f9d3a", 0.9),
      leafB: std("#3f8a30", 0.9),
      glass: std("#2b3644", 0.3, 0.2),
      pole: std("#5d636d", 0.5, 0.4),
      hallWall: std("#f3eee3", 0.8),
      hallTrim: std("#e2d8c4", 0.8),
      dome: std("#5b8fbf", 0.5, 0.2),
      plaza: std("#e8e2d4", 0.9),
      water: std("#4aa3d8", 0.25, 0.1),
      field: std("#86c25c", 1),
    };
  }, []);
  const geo = useMemo(
    () => ({
      box: new THREE.BoxGeometry(1, 1, 1),
      cyl: new THREE.CylinderGeometry(0.5, 0.5, 1, 12),
      sph: new THREE.SphereGeometry(0.5, 14, 10),
      dome: new THREE.SphereGeometry(0.5, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2),
    }),
    [],
  );
  const towers = useMemo(() => {
    const palette: [string, string][] = [
      ["#e9edf2", "#3d5a7a"],
      ["#c9d6e2", "#22354d"],
      ["#f0e6d6", "#5a6f86"],
      ["#b8473a", "#2a3240"],
      ["#9fc0d8", "#1f3248"],
      ["#e8e1cf", "#40566e"],
    ];
    return palette.map(([w, g], i) => {
      const t = windowTex(w, g, 11 + i);
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      return new THREE.MeshStandardMaterial({ map: t, roughness: 0.6, metalness: 0.05 });
    });
  }, []);

  const r = rng(42);
  const parts: React.ReactNode[] = [];
  const box = (k: string, mat: THREE.Material, p: [number, number, number], s: [number, number, number], yaw = 0) =>
    parts.push(<mesh key={k} geometry={geo.box} material={mat} position={p} scale={s} rotation={[0, yaw, 0]} castShadow receiveShadow />);

  // ground and road surface
  parts.push(
    <mesh key="road" geometry={geo.box} material={m.asphalt} position={[0, -0.05, 0]} scale={[NB * PITCH + 1, 0.1, NB * PITCH + 1]} receiveShadow />,
    <mesh key="fields" geometry={geo.box} material={m.field} position={[0, -0.08, 0]} scale={[400, 0.1, 400]} receiveShadow />,
  );
  const cars: Car[] = [];
  const carCols = ["#d33b2c", "#f2f2ea", "#2c5aa0", "#f0b429", "#3a3f48", "#e8e8e8", "#7a1f2b"];
  for (let bx = 0; bx < NB; bx++)
    for (let bz = 0; bz < NB; bz++) {
      const cx = -HALF + ROAD / 2 + bx * PITCH + BLOCK / 2;
      const cz = -HALF + ROAD / 2 + bz * PITCH + BLOCK / 2;
      const k = `${bx}-${bz}`;
      // sidewalk slab with a curb lip
      box(`w${k}`, m.walk, [cx, 0.08, cz], [BLOCK, 0.16, BLOCK]);
      box(`c${k}`, m.curb, [cx, 0.06, cz], [BLOCK + 0.12, 0.12, BLOCK + 0.12]);
      const inner = BLOCK - 2 * WALK;
      if (bx === HALL[0] && bz === HALL[1]) {
        // civic block: plaza, pool, and the city hall
        box(`pl${k}`, m.plaza, [cx, 0.18, cz], [inner, 0.04, inner]);
        box(`pool${k}`, m.water, [cx, 0.2, cz + 2.0], [3.2, 0.03, 1.2]);
        box(`h1${k}`, m.hallWall, [cx, 0.9, cz - 0.6], [4.6, 1.4, 2.6]);
        box(`h2${k}`, m.hallTrim, [cx, 1.65, cz - 0.6], [4.8, 0.12, 2.8]);
        for (let i = 0; i < 7; i++) parts.push(<mesh key={`col${i}`} geometry={geo.cyl} material={m.hallWall} position={[cx - 1.8 + i * 0.6, 0.9, cz + 0.85]} scale={[0.18, 1.4, 0.18]} castShadow />);
        box(`h3${k}`, m.hallTrim, [cx, 1.75, cz + 0.85], [4.6, 0.14, 0.4]);
        parts.push(<mesh key="drum" geometry={geo.cyl} material={m.hallWall} position={[cx, 2.15, cz - 0.6]} scale={[1.6, 0.7, 1.6]} castShadow />);
        parts.push(<mesh key="dome" geometry={geo.dome} material={m.dome} position={[cx, 2.5, cz - 0.6]} scale={[1.7, 1.5, 1.7]} castShadow />);
        box(`steps${k}`, m.plaza, [cx, 0.28, cz + 1.25], [3.2, 0.2, 0.5]);
      } else if (suburbs.some(([sx, sz]) => sx === bx && sz === bz)) {
        // a suburb block: 4×4 small house plots (lawns with a white plot line)
        const ps = inner / 4;
        for (let i = 0; i < 4; i++)
          for (let j = 0; j < 4; j++) {
            const px = cx - inner / 2 + ps * (i + 0.5);
            const pz = cz - inner / 2 + ps * (j + 0.5);
            const kk = `${k}-s${i}${j}`;
            box(`sp${kk}`, m.lot, [px, 0.17, pz], [ps - 0.12, 0.03, ps - 0.12]);
            const e = (ps - 0.12) / 2 - 0.03;
            box(`sz1${kk}`, m.zone, [px, 0.19, pz + e], [ps - 0.18, 0.02, 0.04]);
            box(`sz2${kk}`, m.zone, [px + e, 0.19, pz], [0.04, 0.02, ps - 0.18]);
          }
      } else {
        // four lots per block: zoned grass with a white zoning border, or (built) a placeholder tower on some
        for (let i = 0; i < 2; i++)
          for (let j = 0; j < 2; j++) {
            const lx = cx - inner / 4 + (i * inner) / 2;
            const lz = cz - inner / 4 + (j * inner) / 2;
            const ls = inner / 2 - 0.25;
            const kk = `${k}-${i}${j}`;
            box(`lot${kk}`, m.lot, [lx, 0.17, lz], [ls, 0.03, ls]);
            const roll = r();
            if (built && roll < 0.55) {
              const tm = towers[Math.floor(r() * towers.length)];
              const hh = 2 + Math.pow(r(), 2) * 9;
              const h = lowRise.some(([lx2, lz2]) => lx2 === bx && lz2 === bz) ? 0.6 + hh * 0.12 : hh;
              const fw = ls * (0.6 + r() * 0.3);
              box(`t${kk}`, tm, [lx, 0.18 + h / 2, lz], [fw, h, fw]);
              box(`tr${kk}`, m.curb, [lx, 0.18 + h + 0.08, lz], [fw * 0.8, 0.16, fw * 0.8]);
            } else {
              // zoning outline
              const e = ls / 2 - 0.05;
              box(`z1${kk}`, m.zone, [lx, 0.19, lz - e], [ls - 0.1, 0.02, 0.06]);
              box(`z2${kk}`, m.zone, [lx, 0.19, lz + e], [ls - 0.1, 0.02, 0.06]);
              box(`z3${kk}`, m.zone, [lx - e, 0.19, lz], [0.06, 0.02, ls - 0.1]);
              box(`z4${kk}`, m.zone, [lx + e, 0.19, lz], [0.06, 0.02, ls - 0.1]);
              if (roll > 0.8) {
                // a little "for lease" board
                box(`sp${kk}`, m.pole, [lx + e - 0.3, 0.45, lz + e - 0.3], [0.04, 0.5, 0.04]);
                box(`sb${kk}`, m.zone, [lx + e - 0.3, 0.75, lz + e - 0.3], [0.6, 0.32, 0.04], Math.PI / 4);
              }
            }
          }
        // trees along the sidewalk
        for (let s = 0; s < 4; s++) {
          const o = -BLOCK / 2 + 0.9 + s * ((BLOCK - 1.8) / 3);
          for (const [tx, tz] of [
            [cx + o, cz + BLOCK / 2 - 0.22],
            [cx + BLOCK / 2 - 0.22, cz + o],
            [cx + o, cz - BLOCK / 2 + 0.22],
            [cx - BLOCK / 2 + 0.22, cz + o],
          ] as [number, number][]) {
            if (r() < 0.35) continue;
            const k2 = `tree${tx.toFixed(2)}${tz.toFixed(2)}`;
            const sc = 0.8 + r() * 0.4;
            parts.push(<mesh key={`${k2}a`} geometry={geo.cyl} material={m.trunk} position={[tx, 0.45, tz]} scale={[0.1, 0.6, 0.1]} castShadow />);
            parts.push(<mesh key={`${k2}b`} geometry={geo.sph} material={r() > 0.5 ? m.leafA : m.leafB} position={[tx, 1.0 * sc + 0.2, tz]} scale={[0.95 * sc, 0.85 * sc, 0.95 * sc]} castShadow />);
          }
        }
      }
      // markings and cars on the road to the right (+x) and front (+z) of the block
      const rx = cx + BLOCK / 2 + ROAD / 2;
      const rz = cz + BLOCK / 2 + ROAD / 2;
      for (let d = -BLOCK / 2 + 0.4; d < BLOCK / 2; d += 1.2) {
        box(`mx${k}${d}`, m.line, [rx, 0.005, cz + d], [0.06, 0.01, 0.6]);
        box(`mz${k}${d}`, m.line, [cx + d, 0.005, rz], [0.6, 0.01, 0.06]);
      }
      // crosswalk at the corner
      for (let s = 0; s < 6; s++) {
        box(`cw1${k}${s}`, m.line, [rx - ROAD / 2 + 0.25 + s * 0.34, 0.006, cz + BLOCK / 2 - 0.25], [0.18, 0.01, 0.45]);
        box(`cw2${k}${s}`, m.line, [cx + BLOCK / 2 - 0.25, 0.006, rz - ROAD / 2 + 0.25 + s * 0.34], [0.45, 0.01, 0.18]);
      }
      if (r() < 0.55) cars.push({ p: [rx + (r() > 0.5 ? 0.5 : -0.5), 0.2, cz + (r() - 0.5) * BLOCK * 0.8], yaw: 0, c: carCols[Math.floor(r() * carCols.length)] });
      if (r() < 0.55) cars.push({ p: [cx + (r() - 0.5) * BLOCK * 0.8, 0.2, rz + (r() > 0.5 ? 0.5 : -0.5)], yaw: Math.PI / 2, c: carCols[Math.floor(r() * carCols.length)] });
      // a street lamp at the corner
      box(`lp${k}`, m.pole, [cx + BLOCK / 2 - 0.15, 0.75, cz + BLOCK / 2 - 0.15], [0.06, 1.3, 0.06]);
    }
  cars.forEach((c, i) => {
    const mat = std(c.c, 0.35, 0.3);
    const g = (
      <group key={`car${i}`} position={c.p} rotation={[0, c.yaw, 0]}>
        <mesh geometry={geo.box} material={mat} scale={[0.42, 0.2, 0.9]} castShadow />
        <mesh geometry={geo.box} material={m.glass} position={[0, 0.17, -0.05]} scale={[0.36, 0.16, 0.5]} castShadow />
      </group>
    );
    parts.push(g);
  });
  return <>{parts}</>;
};
export const City = React.memo(CityImpl);

export const Lights: React.FC = () => {
  const sun = useMemo(() => {
    const l = new THREE.DirectionalLight("#fff4e0", 2.6);
    l.position.set(-30, 45, 22);
    l.castShadow = true;
    l.shadow.mapSize.set(4096, 4096);
    const c = l.shadow.camera as THREE.OrthographicCamera;
    c.left = -45;
    c.right = 45;
    c.top = 45;
    c.bottom = -45;
    c.near = 1;
    c.far = 160;
    l.shadow.bias = -0.0004;
    l.shadow.normalBias = 0.03;
    return l;
  }, []);
  return (
    <>
      <hemisphereLight args={["#dbeeff", "#8a9a6a", 1.1]} />
      <primitive object={sun} />
      <primitive object={sun.target} />
    </>
  );
};

// ------------------------------------------------------------------ HUD
const Hud: React.FC<{ built: boolean }> = ({ built }) => (
  <AbsoluteFill style={{ fontFamily: "Poppins" }}>
    <AbsoluteFill style={{ background: "linear-gradient(rgba(12,20,34,0.55), rgba(12,20,34,0) 26%, rgba(12,20,34,0) 70%, rgba(12,20,34,0.35))" }} />
    <div style={{ position: "absolute", top: 118, left: 80, right: 80, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, color: "rgba(255,255,255,0.85)", fontWeight: 600, fontSize: 30, letterSpacing: 8 }}>
        <div style={{ width: 60, height: 2, background: "#ffb23e" }} />
        {built ? "PREVIEW" : "EPISODE 0"}
        <div style={{ width: 60, height: 2, background: "#ffb23e" }} />
      </div>
      <div style={{ marginTop: 12, color: "#ffffff", fontWeight: 800, fontSize: 118, letterSpacing: 4, lineHeight: 1, textShadow: "0 6px 24px rgba(0,0,0,0.35)" }}>
        BRAND<span style={{ color: "#ffb23e" }}>CITY</span>
      </div>
      <div style={{ marginTop: 26, display: "flex", background: "rgba(14,20,32,0.6)", borderRadius: 18, overflow: "hidden", backdropFilter: "blur(8px)" }}>
        {(built
          ? [
              ["112", "BRANDS"],
              ["68", "LOTS OPEN"],
              ["1", "CITY HALL"],
            ]
          : [
              ["0", "BRANDS"],
              ["192", "LOTS OPEN"],
              ["1", "CITY HALL"],
            ]
        ).map(([v, k], i) => (
          <div key={k} style={{ padding: "16px 34px", textAlign: "center", borderLeft: i ? "1px solid rgba(255,255,255,0.25)" : undefined }}>
            <div style={{ color: "#ffffff", fontWeight: 700, fontSize: 46, lineHeight: 1 }}>{v}</div>
            <div style={{ color: "rgba(255,255,255,0.75)", fontWeight: 600, fontSize: 18, letterSpacing: 3, marginTop: 6 }}>{k}</div>
          </div>
        ))}
      </div>
    </div>
    <div style={{ position: "absolute", top: 1440, left: 80, right: 160, display: "flex", justifyContent: "center" }}>
      <div style={{ padding: "20px 38px", borderRadius: 999, background: "#ffffff", color: "#14181f", fontWeight: 700, fontSize: 40, boxShadow: "0 12px 30px rgba(0,0,0,0.3)" }}>
        Tag your favorite brand <span style={{ color: "#ff8a1f" }}>↓</span>
      </div>
    </div>
  </AbsoluteFill>
);

export const CityReal: React.FC<{ look: CityRealId }> = ({ look }) => {
  const ready = useFonts();
  if (!ready) return <AbsoluteFill style={{ background: "#cfe3f2" }} />;
  const built = look === "built";
  return (
    <AbsoluteFill style={{ background: "#cfe3f2" }}>
      <ThreeCanvas width={1080} height={1920} shadows gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }} style={{ position: "absolute", inset: 0 }}>
        <Cam pos={[26, 34, 30]} look={[-1, 0, 1]} fov={38} />
        <Lights />
        <City built={built} />
      </ThreeCanvas>
      <Hud built={built} />
    </AbsoluteFill>
  );
};
