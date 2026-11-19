// Brand City Episode 0 — YouTube Shorts thumbnail (1080×1920). The same view of the city twice: a labeled preview of
// the full city ("SOON") over the city as it is ("NOW"). Text says what the title doesn't (title.py: 100/100 pairing).
import React from "react";
import { AbsoluteFill } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useFonts } from "../inkbeat/core/frame";
import { City, Lights } from "./CityReal";

const Cam: React.FC = () => {
  const { camera, scene } = useThree();
  const c = camera as THREE.PerspectiveCamera;
  c.fov = 34;
  c.near = 0.3;
  c.far = 400;
  c.position.set(25, 19, 27);
  c.lookAt(0, 2.2, 0);
  c.updateProjectionMatrix();
  scene.fog = new THREE.Fog("#cfe3f2", 50, 115);
  scene.background = new THREE.Color("#cfe3f2");
  return null;
};

const Half: React.FC<{ built: boolean; top: number }> = ({ built, top }) => (
  <ThreeCanvas width={1080} height={960} shadows gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.08 }} style={{ position: "absolute", left: 0, top }}>
    <Cam />
    <Lights />
    <City built={built} />
  </ThreeCanvas>
);

const Tag: React.FC<{ text: string; top: number; bg: string; fg: string }> = ({ text, top, bg, fg }) => (
  <div style={{ position: "absolute", top, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
    <div style={{ padding: "14px 48px", borderRadius: 999, background: bg, color: fg, fontWeight: 800, fontSize: 92, letterSpacing: 6, boxShadow: "0 14px 40px rgba(0,0,0,0.35)" }}>{text}</div>
  </div>
);

export const Ep0Thumb: React.FC = () => {
  const ready = useFonts();
  if (!ready) return <AbsoluteFill style={{ background: "#cfe3f2" }} />;
  return (
    <AbsoluteFill style={{ background: "#cfe3f2", fontFamily: "Poppins" }}>
      <Half built top={0} />
      <Half built={false} top={960} />
      <AbsoluteFill style={{ background: "linear-gradient(rgba(10,16,28,0.45), rgba(10,16,28,0) 18%, rgba(10,16,28,0) 82%, rgba(10,16,28,0.35))" }} />
      {/* the seam */}
      <div style={{ position: "absolute", top: 952, left: 0, right: 0, height: 16, background: "#ffffff", boxShadow: "0 0 30px rgba(0,0,0,0.35)" }} />
      <div style={{ position: "absolute", top: 90, left: 0, right: 0, textAlign: "center", color: "#ffffff", fontWeight: 800, fontSize: 104, letterSpacing: 3, textShadow: "0 6px 26px rgba(0,0,0,0.45)" }}>
        BRAND<span style={{ color: "#ffb23e" }}>CITY</span>
      </div>
      <Tag text="SOON" top={760} bg="rgba(255,255,255,0.95)" fg="#14181f" />
      <Tag text="NOW" top={1020} bg="#ffb23e" fg="#14181f" />
      <div style={{ position: "absolute", top: 1290, left: 80, right: 80, textAlign: "center", color: "#ffffff", fontWeight: 800, fontSize: 86, lineHeight: 1.05, textShadow: "0 6px 26px rgba(0,0,0,0.55)" }}>
        EMPTY...
        <br />
        <span style={{ color: "#ffb23e" }}>FOR NOW</span>
      </div>
    </AbsoluteFill>
  );
};
