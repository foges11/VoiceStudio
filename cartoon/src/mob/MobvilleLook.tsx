// Mobville look stills: 0 = the welcome sign at the edge of town, 1 = the town square, 2 = Mayor Bob saying hello.
import React from "react";
import { AbsoluteFill } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import * as THREE from "three";
import { useFonts } from "../inkbeat/core/frame";
import { City } from "../city/CityReal";
import { Citizens, LOW, MayorBob } from "./MobRuleDay1";
import { Cam, PillCaptions, SIGN_AT, TownCam, TownHud, TownLights, WelcomeSign, Word } from "./Mobville";

const BOB: [number, number, number] = [0.95, 0.2, 1.75];
const SHOTS: { cam: Cam; cap: string }[] = [
  { cam: { pos: [SIGN_AT[0] + 3.6, 2.2, SIGN_AT[2] + 8.5], look: [SIGN_AT[0] - 3.5, 0.9, SIGN_AT[2] - 9], fov: 48 }, cap: "100 people can't stop you." },
  { cam: { pos: [9, 5.2, 12.5], look: [0.4, 0.3, 2.6], fov: 40 }, cap: "Welcome to Mobville." },
  { cam: { pos: [BOB[0] + 1.5, 0.7, BOB[2] + 2.0], look: [BOB[0], BOB[1] + 0.22, BOB[2]], fov: 30 }, cap: "This is Mayor Bob." },
];

export const MobvilleLook: React.FC<{ shot: number }> = ({ shot }) => {
  const ready = useFonts();
  if (!ready) return <AbsoluteFill style={{ background: "#f6d8bd" }} />;
  const s = SHOTS[shot];
  const words: Word[] = s.cap.split(" ").map((w, i) => [i * 0.2, i * 0.2 + 0.2, w]);
  return (
    <AbsoluteFill style={{ background: "#f6d8bd" }}>
      <ThreeCanvas width={1080} height={1920} shadows gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.0 }} style={{ position: "absolute", inset: 0 }}>
        <TownCam cam={s.cam} />
        <TownLights />
        <City built town lowRise={LOW} />
        <WelcomeSign />
        <Citizens t={3} wave={1} />
        <MayorBob t={7.75} happy={1} />
      </ThreeCanvas>
      <TownHud day="DAY 1" pop={100} />
      <PillCaptions t={0.3} phrases={[words]} />
    </AbsoluteFill>
  );
};
