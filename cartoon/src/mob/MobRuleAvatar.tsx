// Mob Rule — profile picture (1080×1080, made for a circle crop): Mayor Bob, nervous, in the calm low-rise city.
import React from "react";
import { AbsoluteFill } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useFonts } from "../inkbeat/core/frame";
import { City, Lights } from "../city/CityReal";
import { LOW, MayorBob } from "./MobRuleDay1";

const BOB: [number, number, number] = [0.95, 0.2, 1.75];
const YAW = 0.55 + Math.PI; // facing City Hall, so the city is behind him
const Cam: React.FC = () => {
  const { camera, scene } = useThree();
  const c = camera as THREE.PerspectiveCamera;
  // Bob faces yaw 0.55: stand in front of him, a touch below eye level
  const yaw = YAW;
  const d = 0.72;
  c.fov = 36;
  c.near = 0.02;
  c.far = 300;
  c.position.set(BOB[0] + Math.sin(yaw) * d, BOB[1] + 0.3, BOB[2] + Math.cos(yaw) * d);
  c.lookAt(BOB[0], BOB[1] + 0.29, BOB[2]);
  c.updateProjectionMatrix();
  scene.fog = new THREE.Fog("#cfe3f2", 30, 90);
  scene.background = new THREE.Color("#cfe3f2");
  return null;
};

export const MobRuleAvatar: React.FC = () => {
  const ready = useFonts();
  if (!ready) return <AbsoluteFill style={{ background: "#cfe3f2" }} />;
  return (
    <AbsoluteFill style={{ background: "#cfe3f2" }}>
      <ThreeCanvas width={1080} height={1080} shadows gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.08 }} style={{ position: "absolute", inset: 0 }}>
        <Cam />
        <Lights />
        <City built lowRise={LOW} />
        <MayorBob t={7.75} yaw={YAW} />
      </ThreeCanvas>
      {/* a soft red ring that survives the circle crop */}
      <AbsoluteFill style={{ borderRadius: "50%", boxShadow: "inset 0 0 0 26px #ff5a4a" }} />
    </AbsoluteFill>
  );
};
