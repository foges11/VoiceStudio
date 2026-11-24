// Coinflip Mind Instagram post: a "YouTube video card" (black page, the video playing in a rounded 16:9 frame with its
// length, a big bold statement under it, the publish date). 1080×1350 (4:5 feed). The frame plays a few seconds of
// the real episode (Ep1 rendered live, no audio) and then holds its last frame, so the post is a short silent Reel;
// music gets added in Instagram.
import React from "react";
import { AbsoluteFill, Freeze, Sequence, useCurrentFrame } from "remotion";
import { useFonts } from "../inkbeat/core/frame";
import { Ep1, EP1_FPS } from "./Ep1";

export const IC_FRAMES = 8 * EP1_FPS;
const CARD_W = 984;
const CARD_H = (CARD_W * 9) / 16;

export type InstaCardProps = { title: string; from: number; to: number; length: string; date: string };

export const InstaCard: React.FC<InstaCardProps> = ({ title, from, to, length, date }) => {
  const ready = useFonts();
  const f = useCurrentFrame();
  if (!ready) return <AbsoluteFill style={{ background: "#000" }} />;
  const play = Math.round((to - from) * EP1_FPS);
  const ep = (
    <Sequence from={-Math.round(from * EP1_FPS)} layout="none">
      <Ep1 audio={false} />
    </Sequence>
  );
  return (
    <AbsoluteFill style={{ background: "#000", fontFamily: "Poppins", justifyContent: "center", padding: "0 48px" }}>
      <div style={{ position: "relative", width: CARD_W, height: CARD_H, borderRadius: 30, overflow: "hidden" }}>
        <div style={{ position: "absolute", width: 1920, height: 1080, transform: `scale(${CARD_W / 1920})`, transformOrigin: "0 0" }}>
          {f < play ? ep : <Freeze frame={play - 1}>{ep}</Freeze>}
        </div>
        <div style={{ position: "absolute", right: 22, bottom: 20, background: "rgba(0,0,0,0.72)", color: "#fff", fontWeight: 700, fontSize: 30, padding: "4px 14px", borderRadius: 12 }}>{length}</div>
      </div>
      <div style={{ color: "#fff", fontWeight: 800, fontSize: 70, lineHeight: 1.14, letterSpacing: -1, marginTop: 52 }}>{title}</div>
      <div style={{ color: "#8e8e93", fontWeight: 700, fontSize: 32, marginTop: 26 }}>{date} • Published</div>
    </AbsoluteFill>
  );
};
