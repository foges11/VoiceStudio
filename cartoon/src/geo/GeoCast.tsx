// Geography channel cast sheet: the host (a globe with a microphone) + 10 country characters. Each country is a round
// flag "head" with a face, little arms and legs, one personality prop and one mood. Flags are simplified but recognisable.
import React from "react";
import { AbsoluteFill } from "remotion";
import { useFonts } from "../inkbeat/core/frame";

export const INK = "#1b1f2e";
const W = 7;

/** each flag drawn into a 200×200 box centred at 0,0 (clipped to a circle by the head) */
export const FLAGS: Record<string, React.ReactNode> = {
  USA: (
    <g>
      {Array.from({ length: 13 }, (_, i) => (
        <rect key={i} x={-100} y={-100 + i * 15.4} width={200} height={15.4} fill={i % 2 ? "#fff" : "#b22234"} />
      ))}
      <rect x={-100} y={-100} width={92} height={92} fill="#3c3b6e" />
      {Array.from({ length: 16 }, (_, i) => (
        <circle key={i} cx={-88 + (i % 4) * 22} cy={-88 + Math.floor(i / 4) * 22} r={4} fill="#fff" />
      ))}
    </g>
  ),
  CANADA: (
    <g>
      <rect x={-100} y={-100} width={200} height={200} fill="#fff" />
      <rect x={-100} y={-100} width={50} height={200} fill="#d52b1e" />
      <rect x={50} y={-100} width={50} height={200} fill="#d52b1e" />
      <path d="M 0 -48 L 10 -26 L 26 -32 L 20 -8 L 36 -12 L 30 6 L 42 14 L 14 26 L 18 40 L 2 34 L 2 52 L -2 52 L -2 34 L -18 40 L -14 26 L -42 14 L -30 6 L -36 -12 L -20 -8 L -26 -32 L -10 -26 Z" fill="#d52b1e" />
    </g>
  ),
  RUSSIA: (
    <g>
      <rect x={-100} y={-100} width={200} height={67} fill="#fff" />
      <rect x={-100} y={-33} width={200} height={67} fill="#0039a6" />
      <rect x={-100} y={34} width={200} height={66} fill="#d52b1e" />
    </g>
  ),
  BRAZIL: (
    <g>
      <rect x={-100} y={-100} width={200} height={200} fill="#009c3b" />
      <path d="M -85 0 L 0 -62 L 85 0 L 0 62 Z" fill="#ffdf00" />
      <circle r={36} fill="#002776" />
      <path d="M -36 -6 Q 0 -22 36 6" fill="none" stroke="#fff" strokeWidth={6} />
    </g>
  ),
  UK: (
    <g>
      <rect x={-100} y={-100} width={200} height={200} fill="#012169" />
      <path d="M -100 -100 L 100 100 M 100 -100 L -100 100" stroke="#fff" strokeWidth={34} />
      <path d="M -100 -100 L 100 100 M 100 -100 L -100 100" stroke="#c8102e" strokeWidth={12} />
      <path d="M 0 -100 L 0 100 M -100 0 L 100 0" stroke="#fff" strokeWidth={50} />
      <path d="M 0 -100 L 0 100 M -100 0 L 100 0" stroke="#c8102e" strokeWidth={30} />
    </g>
  ),
  FRANCE: (
    <g>
      <rect x={-100} y={-100} width={67} height={200} fill="#0055a4" />
      <rect x={-33} y={-100} width={67} height={200} fill="#fff" />
      <rect x={34} y={-100} width={66} height={200} fill="#ef4135" />
    </g>
  ),
  JAPAN: (
    <g>
      <rect x={-100} y={-100} width={200} height={200} fill="#fff" />
      <circle r={42} fill="#bc002d" />
    </g>
  ),
  AUSTRALIA: (
    <g>
      <rect x={-100} y={-100} width={200} height={200} fill="#012169" />
      <g transform="translate(-50 -50) scale(0.5)">
        <path d="M -100 -100 L 100 100 M 100 -100 L -100 100" stroke="#fff" strokeWidth={34} />
        <path d="M 0 -100 L 0 100 M -100 0 L 100 0" stroke="#fff" strokeWidth={50} />
        <path d="M 0 -100 L 0 100 M -100 0 L 100 0" stroke="#c8102e" strokeWidth={30} />
      </g>
      {[
        [-50, 50, 14],
        [50, -50, 8],
        [70, 10, 8],
        [40, 40, 8],
        [60, 70, 8],
      ].map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill="#fff" />
      ))}
    </g>
  ),
  ITALY: (
    <g>
      <rect x={-100} y={-100} width={67} height={200} fill="#009246" />
      <rect x={-33} y={-100} width={67} height={200} fill="#fff" />
      <rect x={34} y={-100} width={66} height={200} fill="#ce2b37" />
    </g>
  ),
  GERMANY: (
    <g>
      <rect x={-100} y={-100} width={200} height={67} fill="#000" />
      <rect x={-100} y={-33} width={200} height={67} fill="#dd0000" />
      <rect x={-100} y={34} width={200} height={66} fill="#ffce00" />
    </g>
  ),
  VATICAN: (
    <g>
      <rect x={-100} y={-100} width={100} height={200} fill="#ffe000" />
      <rect x={0} y={-100} width={100} height={200} fill="#fff" />
      <circle cx={50} cy={0} r={14} fill="none" stroke="#c9a227" strokeWidth={5} />
    </g>
  ),
};

export type Mood = "smug" | "happy" | "scared" | "crying" | "angry" | "cool" | "shocked";
export const Face: React.FC<{ mood: Mood }> = ({ mood }) => {
  const white = (cx: number) => <ellipse cx={cx} cy={-10} rx={22} ry={mood === "smug" ? 14 : 26} fill="#fff" stroke={INK} strokeWidth={5} />;
  const pupil = (cx: number, dy = 0) => <circle cx={cx} cy={-8 + dy} r={mood === "shocked" ? 7 : 10} fill={INK} />;
  return (
    <g>
      {mood === "cool" ? (
        <g>
          <rect x={-62} y={-30} width={54} height={34} rx={10} fill={INK} />
          <rect x={8} y={-30} width={54} height={34} rx={10} fill={INK} />
          <path d="M -8 -18 L 8 -18" stroke={INK} strokeWidth={6} />
        </g>
      ) : (
        <g>
          {white(-34)}
          {white(34)}
          {pupil(-30, mood === "scared" ? 6 : 0)}
          {pupil(38, mood === "scared" ? 6 : 0)}
          {mood === "smug" ? <path d="M -60 -26 L -10 -22 M 10 -22 L 60 -26" stroke={INK} strokeWidth={7} strokeLinecap="round" /> : null}
          {mood === "angry" ? <path d="M -60 -44 L -12 -28 M 12 -28 L 60 -44" stroke={INK} strokeWidth={8} strokeLinecap="round" /> : null}
          {mood === "scared" || mood === "crying" ? <path d="M -58 -44 L -14 -50 M 14 -50 L 58 -44" stroke={INK} strokeWidth={7} strokeLinecap="round" /> : null}
        </g>
      )}
      {mood === "crying" ? (
        <g fill="#7ad7ff" stroke={INK} strokeWidth={3}>
          <path d="M -52 14 Q -60 40 -52 60 Q -44 40 -52 14 Z" />
          <path d="M 52 14 Q 44 40 52 60 Q 60 40 52 14 Z" />
        </g>
      ) : null}
      {mood === "smug" || mood === "cool" ? <path d="M -26 34 Q 4 52 34 28" fill="none" stroke={INK} strokeWidth={7} strokeLinecap="round" /> : null}
      {mood === "happy" ? <path d="M -36 28 Q 0 70 36 28 Z" fill={INK} /> : null}
      {mood === "scared" ? <path d="M -30 44 Q -15 34 0 44 Q 15 54 30 44" fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" /> : null}
      {mood === "crying" ? <path d="M -28 50 Q 0 30 28 50" fill="none" stroke={INK} strokeWidth={7} strokeLinecap="round" /> : null}
      {mood === "angry" ? <path d="M -30 46 L 30 46" stroke={INK} strokeWidth={8} strokeLinecap="round" /> : null}
      {mood === "shocked" ? <ellipse cx={0} cy={42} rx={18} ry={22} fill={INK} /> : null}
      {mood === "scared" ? <path d="M 76 -60 Q 90 -40 80 -26" fill="#7ad7ff" stroke={INK} strokeWidth={3} /> : null}
    </g>
  );
};

/** a country character: flag head, little body; prop drawn on top */
const Country: React.FC<{ x: number; y: number; s?: number; flag: string; mood: Mood; prop?: React.ReactNode; name: string; tag: string }> = ({ x, y, s = 1, flag, mood, prop, name, tag }) => {
  const id = `c-${flag}-${x}`;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={200} rx={95} ry={16} fill={INK} opacity={0.15} />
      <path d="M -28 110 L -34 196 M 28 110 L 34 196" stroke={INK} strokeWidth={10} strokeLinecap="round" />
      <path d="M -80 40 Q -118 70 -110 112 M 80 40 Q 118 70 110 112" fill="none" stroke={INK} strokeWidth={10} strokeLinecap="round" />
      <defs>
        <clipPath id={id}>
          <circle r={100} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>{FLAGS[flag]}</g>
      <circle r={100} fill="none" stroke={INK} strokeWidth={W} />
      <Face mood={mood} />
      {prop}
      <text y={262} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={40} fill={INK}>
        {name}
      </text>
      <text y={300} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={24} fill="#6b7280">
        {tag}
      </text>
    </g>
  );
};

// props (drawn in head space, head radius 100)
export const Cowboy = (
  <g>
    <ellipse cx={0} cy={-90} rx={130} ry={22} fill="#8b5a2b" stroke={INK} strokeWidth={6} />
    <path d="M -62 -92 Q -60 -170 0 -160 Q 60 -170 62 -92 Z" fill="#a0692e" stroke={INK} strokeWidth={6} />
  </g>
);
export const Toque = (
  <g>
    <path d="M -84 -60 Q -80 -150 0 -150 Q 80 -150 84 -60 Z" fill="#d52b1e" stroke={INK} strokeWidth={6} />
    <rect x={-90} y={-72} width={180} height={30} rx={12} fill="#fff" stroke={INK} strokeWidth={6} />
    <circle cx={0} cy={-158} r={22} fill="#fff" stroke={INK} strokeWidth={6} />
  </g>
);
export const Ushanka = (
  <g>
    <path d="M -92 -40 Q -96 -140 0 -142 Q 96 -140 92 -40 Z" fill="#6b4a2f" stroke={INK} strokeWidth={6} />
    <rect x={-100} y={-70} width={200} height={34} rx={14} fill="#8a6a4a" stroke={INK} strokeWidth={6} />
  </g>
);
export const PartyHat = (
  <g>
    <path d="M -36 -88 L 0 -190 L 36 -88 Z" fill="#ff4fa3" stroke={INK} strokeWidth={6} />
    <circle cx={0} cy={-194} r={14} fill="#ffdf00" stroke={INK} strokeWidth={5} />
  </g>
);
export const TopHat = (
  <g>
    <rect x={-80} y={-108} width={160} height={20} rx={8} fill={INK} />
    <rect x={-52} y={-200} width={104} height={96} rx={8} fill={INK} />
    <rect x={-52} y={-130} width={104} height={14} fill="#c8102e" />
  </g>
);
export const Beret = <ellipse cx={-10} cy={-96} rx={78} ry={30} fill={INK} transform="rotate(-10 -10 -96)" />;
export const Headband = (
  <g>
    <rect x={-100} y={-62} width={200} height={26} fill="#fff" stroke={INK} strokeWidth={5} />
    <circle cx={0} cy={-49} r={9} fill="#bc002d" />
  </g>
);
export const CorkHat = (
  <g>
    <ellipse cx={0} cy={-86} rx={120} ry={20} fill="#c9a26b" stroke={INK} strokeWidth={6} />
    <path d="M -60 -88 Q -56 -150 0 -146 Q 56 -150 60 -88 Z" fill="#d8b47a" stroke={INK} strokeWidth={6} />
    {[-90, -60, 60, 90].map((x) => (
      <g key={x}>
        <path d={`M ${x} -82 L ${x} -50`} stroke={INK} strokeWidth={3} />
        <rect x={x - 6} y={-50} width={12} height={18} rx={3} fill="#8b5a2b" stroke={INK} strokeWidth={3} />
      </g>
    ))}
  </g>
);
export const Clipboard = (
  <g transform="translate(110 70) rotate(12)">
    <rect x={-34} y={-44} width={68} height={88} rx={8} fill="#c98a12" stroke={INK} strokeWidth={4} />
    <rect x={-24} y={-32} width={48} height={66} fill="#fff" />
  </g>
);
export const ChefHat = (
  <g>
    <rect x={-56} y={-118} width={112} height={34} rx={6} fill="#fff" stroke={INK} strokeWidth={6} />
    <path d="M -60 -112 Q -100 -150 -60 -180 Q -40 -220 0 -196 Q 40 -220 60 -180 Q 100 -150 60 -112 Z" fill="#fff" stroke={INK} strokeWidth={6} />
  </g>
);
export const Halo = <ellipse cx={0} cy={-128} rx={56} ry={14} fill="none" stroke="#f5c518" strokeWidth={9} />;

/** the host: a globe with a bow tie and a microphone */
export const Host: React.FC<{ x: number; y: number; s?: number; talk?: number; label?: boolean; eq?: number }> = ({ x, y, s = 1, talk = 0, label = true, eq = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={240} rx={130} ry={20} fill={INK} opacity={0.15} />
    <path d="M -34 130 L -42 236 M 34 130 L 42 236" stroke={INK} strokeWidth={12} strokeLinecap="round" />
    <path d="M -110 30 Q -170 -10 -150 -80" fill="none" stroke={INK} strokeWidth={12} strokeLinecap="round" />
    <path d="M 110 30 Q 160 60 170 0" fill="none" stroke={INK} strokeWidth={12} strokeLinecap="round" />
    {/* microphone */}
    <g transform="translate(170 -10) rotate(-20)">
      <rect x={-9} y={0} width={18} height={70} rx={8} fill="#555" stroke={INK} strokeWidth={4} />
      <circle cy={-10} r={24} fill="#888" stroke={INK} strokeWidth={5} />
    </g>
    <circle r={140} fill="#3f7fe0" stroke={INK} strokeWidth={W + 1} />
    <g fill="#42b46b" stroke={INK} strokeWidth={5} strokeLinejoin="round">
      <path d="M -120 -40 Q -110 -100 -60 -120 Q -40 -100 -70 -80 Q -96 -64 -110 -30 Z" />
      <path d="M 70 -112 Q 120 -90 128 -30 Q 108 -40 90 -70 Q 70 -90 70 -112 Z" />
      <path d="M -100 70 Q -60 80 -50 110 Q -70 128 -96 100 Z" />
      <path d="M 90 70 Q 120 60 118 90 Q 100 116 80 100 Z" />
    </g>
    <ellipse cx={-42} cy={-6} rx={30} ry={36} fill="#fff" stroke={INK} strokeWidth={5} />
    <ellipse cx={42} cy={-6} rx={30} ry={36} fill="#fff" stroke={INK} strokeWidth={5} />
    <circle cx={-34} cy={-2} r={13} fill={INK} />
    <circle cx={50} cy={-2} r={13} fill={INK} />
    <path d="M -76 -52 L -16 -46 M 16 -46 L 76 -52" stroke={INK} strokeWidth={8} strokeLinecap="round" />
    {talk > 0.12 ? (
      <path d={`M -40 52 Q 0 ${70 + 40 * talk} 44 48 Q 2 ${58 - 4 * talk} -40 52 Z`} fill="#7a1f2b" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    ) : (
      <path d="M -40 56 Q 0 92 44 50" fill="#fff" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    )}
    {eq > 0 ? <path d="M -140 18 Q 0 52 140 18" fill="none" stroke="#e8423a" strokeWidth={9} strokeDasharray="22 14" strokeLinecap="round" opacity={eq} /> : null}
    {/* bow tie */}
    <path d="M 0 136 L -50 110 L -50 162 Z M 0 136 L 50 110 L 50 162 Z" fill="#e85d4a" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <circle cy={136} r={12} fill="#e85d4a" stroke={INK} strokeWidth={5} />
    {label ? (
      <g>
        <text y={320} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={48} fill={INK}>
          THE HOST
        </text>
        <text y={360} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={26} fill="#6b7280">
          announces the rules, roasts the losers
        </text>
      </g>
    ) : null}
  </g>
);

export const GeoCast: React.FC = () => {
  const ready = useFonts();
  if (!ready) return <AbsoluteFill style={{ background: "#eef4ff" }} />;
  const s = 0.74;
  const row1 = 400;
  const row2 = 820;
  return (
    <AbsoluteFill style={{ background: "linear-gradient(#dfeaff, #f6f9ff)" }}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080">
        <text x={60} y={90} fontFamily="Poppins" fontWeight={800} fontSize={56} fill={INK}>
          THE CAST
        </text>
        <text x={60} y={130} fontFamily="Poppins" fontWeight={700} fontSize={26} fill="#6b7280">
          same personalities in every video
        </text>
        <Host x={270} y={560} s={1.05} />
        <Country x={640} y={row1} s={s} flag="USA" mood="cool" prop={Cowboy} name="USA" tag="loud, overconfident" />
        <Country x={910} y={row1} s={s} flag="CANADA" mood="smug" prop={Toque} name="CANADA" tag="polite, secretly smug" />
        <Country x={1180} y={row1} s={s} flag="RUSSIA" mood="angry" prop={Ushanka} name="RUSSIA" tag="dramatic" />
        <Country x={1450} y={row1} s={s} flag="BRAZIL" mood="happy" prop={PartyHat} name="BRAZIL" tag="always partying" />
        <Country x={1720} y={row1} s={s} flag="UK" mood="smug" prop={TopHat} name="UK" tag="fancy, sarcastic" />
        <Country x={640} y={row2} s={s} flag="FRANCE" mood="smug" prop={Beret} name="FRANCE" tag="unimpressed" />
        <Country x={910} y={row2} s={s} flag="JAPAN" mood="shocked" prop={Headband} name="JAPAN" tag="intense, focused" />
        <Country x={1180} y={row2} s={s} flag="AUSTRALIA" mood="happy" prop={CorkHat} name="AUSTRALIA" tag="chill, fearless" />
        <Country x={1450} y={row2} s={s} flag="GERMANY" mood="cool" prop={Clipboard} name="GERMANY" tag="organized rule-checker" />
        <Country x={1720} y={row2} s={s} flag="VATICAN" mood="scared" prop={Halo} name="VATICAN" tag="tiny, terrified" />
      </svg>
    </AbsoluteFill>
  );
};
