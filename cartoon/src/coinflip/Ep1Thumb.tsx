// Coinflip Mind, video 1 thumbnails (1920×1080, export at 1280×720). Same doodle look as the video.
// v0: "FUTURE YOU" + STRANGER stamp (the idea). v1: "$262,000" (the money stake). Use both in YouTube's thumbnail test.
import React from "react";
import { AbsoluteFill } from "remotion";
import { useFonts } from "../inkbeat/core/frame";
import { Stamp } from "./Ep1";
import { Big, GOLD, GREEN, INK, PAPER, Person } from "./Ep1Test";

export const Ep1Thumb: React.FC<{ v: number }> = ({ v }) => {
  const ready = useFonts();
  if (!ready) return <AbsoluteFill style={{ background: PAPER }} />;
  return (
    <AbsoluteFill style={{ background: PAPER }}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080">
        {/* soft sun behind each character so they pop off the paper */}
        <circle cx={470} cy={760} r={380} fill={GOLD} opacity={0.35} />
        <circle cx={1450} cy={760} r={380} fill="#6c8cff" opacity={0.25} />
        <Person x={470} y={1010} s={1.75} mood="worried" hands={[[-95, 10], [110, -60]]} />
        <Person x={1450} y={1010} s={1.75} mood="happy" old hands={[[-120, -150], [95, 10]]} />
        {v === 0 ? (
          <>
            <Big x={960} y={250} text="FUTURE YOU" color={GOLD} size={230} style={{ strokeWidth: 10 } as React.CSSProperties} />
            <Stamp x={1450} y={880} text="STRANGER?" t={10} at={0} size={110} rot={-10} />
          </>
        ) : (
          <>
            <Big x={960} y={250} text="$262,000" color={GREEN} size={250} style={{ strokeWidth: 10 } as React.CSSProperties} />
            <Stamp x={960} y={430} text="WHO GETS IT?" color={INK} t={10} at={0} size={80} rot={-4} />
          </>
        )}
      </svg>
    </AbsoluteFill>
  );
};
