// Mob Rule — profile picture v2 (1080×1080, for a circle crop): a big, happy, waving Mayor Bob on a bright sunburst,
// in Mobville's warm palette. Bob is rendered over a transparent canvas; the background is CSS.
import React from "react";
import { AbsoluteFill } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useFonts } from "../inkbeat/core/frame";
import { MayorBob } from "./MobRuleDay1";

const BOB: [number, number, number] = [0.95, 0.2, 1.75];
const YAW = 0.55;

const Cam: React.FC = () => {
  const { camera, scene, gl } = useThree();
  const c = camera as THREE.PerspectiveCamera;
  const d = 0.82;
  c.fov = 35;
  c.near = 0.02;
  c.far = 50;
  c.position.set(BOB[0] + Math.sin(YAW - 0.25) * d, BOB[1] + 0.3, BOB[2] + Math.cos(YAW - 0.25) * d);
  c.lookAt(BOB[0], BOB[1] + 0.27, BOB[2]);
  c.updateProjectionMatrix();
  scene.background = null;
  scene.fog = null;
  gl.setClearColor(0x000000, 0);
  return null;
};

const Light: React.FC = () => (
  <>
    <hemisphereLight args={["#fff1dc", "#b06a3a", 1.4]} />
    <directionalLight color="#fff0d8" intensity={2.6} position={[4, 5, 6]} />
    <directionalLight color="#ffb36b" intensity={1.2} position={[-5, 2, -2]} />
  </>
);

export const MobRuleAvatar2: React.FC = () => {
  const ready = useFonts();
  if (!ready) return <AbsoluteFill style={{ background: "#ff7a45" }} />;
  const rays = Array.from({ length: 16 }, (_, i) => `${i % 2 ? "#ffb347" : "#ffc76a"} ${(i * 360) / 16}deg ${((i + 1) * 360) / 16}deg`).join(", ");
  return (
    <AbsoluteFill style={{ background: "#ff8a3d" }}>
      {/* sunburst + glow */}
      <AbsoluteFill style={{ background: `conic-gradient(from 0deg at 50% 45%, ${rays})` }} />
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 45%, rgba(255,246,214,0.95) 0%, rgba(255,222,150,0.55) 26%, rgba(255,140,60,0) 60%), radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 55%, rgba(200,50,40,0.55) 100%)" }} />
      <ThreeCanvas width={1080} height={1080} gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }} style={{ position: "absolute", inset: 0 }}>
        <Cam />
        <Light />
        <MayorBob t={7.95} happy={1} />
      </ThreeCanvas>
      {/* a bold cream ring inside the circle crop */}
      <AbsoluteFill style={{ borderRadius: "50%", boxShadow: "inset 0 0 0 30px #fff3dd, inset 0 0 0 40px #d9443a" }} />
    </AbsoluteFill>
  );
};
