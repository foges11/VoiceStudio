// Coinflip Mind, Video 1: a 30 s silent style test of the opening (16:9, 1920×1080). Simple doodle look: off-white
// paper, ink outlines, one "you" character, big words, three accent colors. The narration is shown as captions
// (placeholders until the voice-over exists); timings assume ~150 wpm.
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { useFonts } from "../inkbeat/core/frame";

export const EP1T_FPS = 30;
export const EP1T_FRAMES = 30 * EP1T_FPS;

export const PAPER = "#fbf6ec";
export const INK = "#1b1f2e";
export const GOLD = "#f5b82e";
export const RED = "#e85d4a";
export const GREEN = "#3ecf9a";
export const SKIN = "#ffd9b8";
export const W = 7; // ink width

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const ease = (u: number) => 1 - Math.pow(1 - clamp(u), 3);
export const inOut = (u: number) => {
  const x = clamp(u);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};
/** 0→1 over [a, a+d] */
export const on = (t: number, a: number, d = 0.35) => ease((t - a) / d);
/** visible inside [a, b] with short fades */
export const win = (t: number, a: number, b: number) => clamp((t - a) / 0.25) * clamp((b - t) / 0.25);
/** a small, calm pop-in (no bounce) */
export const pop = (t: number, a: number) => ({ opacity: on(t, a, 0.25), transform: `scale(${0.92 + 0.08 * on(t, a, 0.3)})` });

const LINES: [number, number, string][] = [
  [0.0, 4.6, "You spend $40 in seconds, but never save it. Why does your brain stop you?"],
  [4.8, 9.4, "Think about it. Food delivery, $40. Tap, tap, done. You didn't even feel it."],
  [9.6, 14.4, "But moving that same $40 into savings? Suddenly it feels like you're losing something."],
  [14.6, 19.2, "Most people say that's just discipline. Some people have it, some don't."],
  [19.4, 21.6, "But that's not what's going on."],
  [21.8, 24.6, "The real reason is weirder."],
  [24.8, 30.0, "Your brain thinks future you is a stranger."],
];

// ------------------------------------------------------------------ drawing pieces (SVG, user units = px)
export type Mood = "happy" | "neutral" | "strain" | "worried";
export const Face: React.FC<{ mood: Mood; blink?: number }> = ({ mood, blink = 1 }) => (
  <g>
    <ellipse cx={-26} cy={-8} rx={9} ry={9 * blink} fill={INK} />
    <ellipse cx={26} cy={-8} rx={9} ry={9 * blink} fill={INK} />
    {mood === "happy" ? <path d="M -30 28 Q 0 52 30 28" fill="none" stroke={INK} strokeWidth={W} strokeLinecap="round" /> : null}
    {mood === "neutral" ? <path d="M -22 34 L 22 34" stroke={INK} strokeWidth={W} strokeLinecap="round" /> : null}
    {mood === "worried" ? <path d="M -24 40 Q 0 26 24 40" fill="none" stroke={INK} strokeWidth={W} strokeLinecap="round" /> : null}
    {mood === "strain" ? <path d="M -30 36 Q -20 26 -10 36 Q 0 46 10 36 Q 20 26 30 36" fill="none" stroke={INK} strokeWidth={W} strokeLinecap="round" /> : null}
    {mood === "strain" || mood === "worried" ? (
      <>
        <path d="M -40 -34 L -14 -26" stroke={INK} strokeWidth={W - 1} strokeLinecap="round" />
        <path d="M 40 -34 L 14 -26" stroke={INK} strokeWidth={W - 1} strokeLinecap="round" />
      </>
    ) : null}
  </g>
);

/** the "you" character: round head, simple body, arms to given hand points (relative to the hips) */
export const Person: React.FC<{ x: number; y: number; s?: number; mood: Mood; hands?: [[number, number], [number, number]]; old?: boolean; shirt?: string; children?: React.ReactNode }> = ({
  x,
  y,
  s = 1,
  mood,
  hands = [
    [-95, 10],
    [95, 10],
  ],
  old = false,
  shirt = "#6c8cff",
  children,
}) => {
  // idle life: a slow breath (head bob) and a blink every ~4 s, phase-shifted per character so they never sync
  const { fps } = useVideoConfig();
  const t = useCurrentFrame() / fps;
  const seed = (x * 0.013 + y * 0.007) % 4;
  const breath = Math.sin((2 * Math.PI * (t + seed)) / 3.4);
  const ph = (t + seed * 1.7) % 4.2;
  const blink = ph < 0.14 ? Math.abs(ph - 0.07) / 0.07 : 1;
  return (
  <g transform={`translate(${x} ${y}) scale(${s})`} strokeLinejoin="round">
    {/* legs */}
    <path d="M -30 40 L -36 150 M 30 40 L 36 150" stroke={INK} strokeWidth={W + 3} strokeLinecap="round" />
    {/* body */}
    <rect x={-62} y={-120} width={124} height={170} rx={52} fill={old ? "#9aa3b5" : shirt} stroke={INK} strokeWidth={W} />
    {/* arms */}
    <path d={`M -50 -70 Q -80 -30 ${hands[0][0]} ${hands[0][1]}`} fill="none" stroke={INK} strokeWidth={W + 3} strokeLinecap="round" />
    <path d={`M 50 -70 Q 80 -30 ${hands[1][0]} ${hands[1][1]}`} fill="none" stroke={INK} strokeWidth={W + 3} strokeLinecap="round" />
    <circle cx={hands[0][0]} cy={hands[0][1]} r={14} fill={SKIN} stroke={INK} strokeWidth={W - 2} />
    <circle cx={hands[1][0]} cy={hands[1][1]} r={14} fill={SKIN} stroke={INK} strokeWidth={W - 2} />
    {/* head */}
    <g transform={`translate(0 ${-200 + 3 * breath})`}>
      <circle r={82} fill={SKIN} stroke={INK} strokeWidth={W} />
      {old ? (
        <>
          <path d="M -80 -10 Q -84 -76 -20 -84 M 80 -10 Q 84 -76 20 -84" fill="none" stroke="#c9ccd4" strokeWidth={18} strokeLinecap="round" />
          <circle cx={-26} cy={-8} r={22} fill="none" stroke={INK} strokeWidth={5} />
          <circle cx={26} cy={-8} r={22} fill="none" stroke={INK} strokeWidth={5} />
          <path d="M -4 -8 L 4 -8" stroke={INK} strokeWidth={5} />
        </>
      ) : (
        <path d="M -78 -22 Q -60 -96 0 -86 Q 60 -96 78 -22 Q 40 -60 0 -56 Q -40 -60 -78 -22 Z" fill="#3b2a20" stroke={INK} strokeWidth={W - 2} />
      )}
      <Face mood={mood} blink={Math.max(0.1, blink)} />
    </g>
    {children}
  </g>
  );
};

export const Bill: React.FC<{ x: number; y: number; s?: number; r?: number }> = ({ x, y, s = 1, r = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <rect x={-80} y={-42} width={160} height={84} rx={10} fill="#9fe0b8" stroke={INK} strokeWidth={W - 1} />
    <circle r={26} fill="none" stroke={INK} strokeWidth={4} />
    <text y={12} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={34} fill={INK}>
      $40
    </text>
  </g>
);

export const Jar: React.FC<{ x: number; y: number; label?: string }> = ({ x, y, label = "SAVINGS" }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-110} y={-150} width={220} height={260} rx={40} fill="#e9f4ff" stroke={INK} strokeWidth={W} />
    <rect x={-80} y={-178} width={160} height={36} rx={10} fill={GOLD} stroke={INK} strokeWidth={W} />
    <rect x={-90} y={-40} width={180} height={52} rx={10} fill="#fff" stroke={INK} strokeWidth={4} />
    <text y={-4} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={30} fill={INK} letterSpacing={2}>
      {label}
    </text>
  </g>
);

export const Brain: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} strokeLinecap="round" strokeLinejoin="round">
    <path d="M 0 -150 C -110 -180 -205 -110 -190 -20 C -205 70 -140 150 -50 140 C -25 140 -8 130 0 115 Z" fill="#ffc6cf" stroke={INK} strokeWidth={W} />
    <path d="M 0 -150 C 110 -180 205 -110 190 -20 C 205 70 140 150 50 140 C 25 140 8 130 0 115 Z" fill="#ffc6cf" stroke={INK} strokeWidth={W} />
    <g fill="none" stroke={INK} strokeWidth={W - 2}>
      <path d="M -135 -75 C -90 -105 -60 -50 -95 -20" />
      <path d="M -160 30 C -110 10 -70 60 -105 90" />
      <path d="M -60 -125 C -30 -85 -50 -40 -25 -5" />
      <path d="M 135 -75 C 90 -105 60 -50 95 -20" />
      <path d="M 160 30 C 110 10 70 60 105 90" />
      <path d="M 60 -125 C 30 -85 50 -40 25 -5" />
    </g>
  </g>
);

/** a big hand-lettered word */
export const Big: React.FC<{ x: number; y: number; text: string; color?: string; size?: number; style?: React.CSSProperties }> = ({ x, y, text, color = INK, size = 120, style }) => (
  <text x={x} y={y} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={size} fill={color} stroke={INK} strokeWidth={color === INK ? 0 : 5} paintOrder="stroke fill" style={style}>
    {text}
  </text>
);

// ------------------------------------------------------------------ scenes
const S1: React.FC<{ t: number }> = ({ t }) => {
  // the $40 leaves the phone toward the screen edge; the jar stays empty; "WHY?" on the question
  const fly = inOut((t - 1.0) / 1.2);
  return (
    <g>
      <Person x={620} y={640} mood={t < 2.6 ? "happy" : "neutral"} hands={[[-90, 20], [110, -40]]}>
        <rect x={92} y={-130} width={70} height={120} rx={14} fill={INK} transform="rotate(10 127 -70)" />
        <rect x={100} y={-120} width={54} height={92} rx={8} fill="#7ad7ff" transform="rotate(10 127 -70)" />
      </Person>
      {t > 1.0 && t < 2.4 ? <Bill x={760 + fly * 1100} y={500 - fly * 240} s={1.1} r={-15 + fly * 40} /> : null}
      <g style={{ opacity: on(t, 0.2) }}>
        <Jar x={1300} y={640} />
      </g>
      <g style={pop(t, 2.9)}>
        <Big x={1300} y={330} text="WHY?" color={GOLD} size={150} />
      </g>
    </g>
  );
};

const S2: React.FC<{ t: number }> = ({ t }) => {
  const tap = (a: number) => clamp(1 - Math.abs(t - a) / 0.18);
  const done = t > 7.3;
  return (
    <g>
      <g transform="translate(760 540)">
        <rect x={-230} y={-400} width={460} height={800} rx={60} fill={INK} />
        <rect x={-200} y={-360} width={400} height={720} rx={36} fill="#fff" />
        <text y={-270} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={36} fill={INK}>
          Food delivery
        </text>
        <circle cy={-110} r={110} fill={GOLD} stroke={INK} strokeWidth={W} />
        <path d="M -80 -110 L 80 -110" stroke={INK} strokeWidth={W} />
        <path d="M -70 -150 Q 0 -215 70 -150 Z" fill="#c98a12" stroke={INK} strokeWidth={W} />
        <text y={90} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={84} fill={INK}>
          $40.00
        </text>
        <rect x={-150} y={170} width={300} height={100} rx={50} fill={done ? GREEN : RED} stroke={INK} strokeWidth={W} />
        <text y={238} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={44} fill="#fff">
          {done ? "ORDERED ✓" : "ORDER"}
        </text>
        {/* the finger tap */}
        <circle cx={60} cy={230} r={30 + 22 * Math.max(tap(6.5), tap(7.0))} fill="rgba(27,31,46,0.15)" style={{ opacity: Math.max(tap(6.5), tap(7.0)) }} />
      </g>
      {/* the "pain" meter stays empty */}
      <g transform="translate(1340 540)" style={{ opacity: on(t, 7.6) }}>
        <text y={-235} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={48} fill={INK}>
          PAIN
        </text>
        <rect x={-60} y={-210} width={120} height={420} rx={30} fill="#fff" stroke={INK} strokeWidth={W} />
        <text y={-310} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={64} fill={GREEN} stroke={INK} strokeWidth={4} paintOrder="stroke fill">
          0%
        </text>
      </g>
    </g>
  );
};

const S3: React.FC<{ t: number }> = ({ t }) => {
  const pain = inOut((t - 11.6) / 2.2);
  const shake = t > 11.6 ? Math.sin(t * 40) * 4 * pain : 0;
  return (
    <g>
      <Person x={600} y={660} mood={pain > 0.3 ? "strain" : "neutral"} hands={[[110, -150], [150, -120]]} />
      <Bill x={760 + shake} y={480} s={1.1} r={-6} />
      <Jar x={1080} y={680} />
      <g transform="translate(1500 540)">
        <text y={-235} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={48} fill={INK}>
          PAIN
        </text>
        <rect x={-60} y={-210} width={120} height={420} rx={30} fill="#fff" stroke={INK} strokeWidth={W} />
        <rect x={-48} y={198 - 396 * pain} width={96} height={396 * pain} rx={22} fill={RED} />
        <text y={-310} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={64} fill={RED} stroke={INK} strokeWidth={4} paintOrder="stroke fill">
          {Math.round(pain * 100)}%
        </text>
      </g>
    </g>
  );
};

const S4: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <g style={pop(t, 14.8)}>
      <Big x={960} y={300} text="DISCIPLINE?" size={130} />
    </g>
    <g style={{ opacity: on(t, 16.6) }}>
      <Person x={620} y={760} s={0.85} mood="happy" shirt="#3ecf9a" />
      <Big x={620} y={470} text="✓" color={GREEN} size={120} />
    </g>
    <g style={{ opacity: on(t, 17.6) }}>
      <Person x={1300} y={760} s={0.85} mood="worried" shirt="#ff9f6e" />
      <Big x={1300} y={470} text="✗" color={RED} size={120} />
    </g>
  </g>
);

const S5: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <Big x={960} y={470} text="DISCIPLINE?" size={130} />
    <path d={`M 560 430 L ${560 + 800 * on(t, 19.5, 0.4)} 430`} stroke={RED} strokeWidth={18} strokeLinecap="round" />
    <g style={pop(t, 20.0)} transform="rotate(-6 960 690)">
      <rect x={760} y={610} width={400} height={160} rx={22} fill="none" stroke={RED} strokeWidth={14} />
      <Big x={960} y={735} text="NOPE" color={RED} size={120} />
    </g>
  </g>
);

const S6: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <g style={{ opacity: on(t, 21.9, 0.3), transform: `scale(${0.96 + 0.04 * on(t, 21.9, 1.5)})`, transformOrigin: "960px 520px" }}>
      <Brain x={960} y={520} s={1.4} />
    </g>
    <g style={pop(t, 23.2)}>
      <Big x={960} y={260} text="WEIRDER." color={GOLD} size={120} />
    </g>
  </g>
);

const S7: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <Person x={560} y={700} mood="neutral" />
    <Big x={560} y={395} text="YOU" size={64} />
    <g style={{ opacity: on(t, 25.6) }}>
      <Person x={1360} y={700} mood="neutral" old />
      <path d="M 1450 640 L 1470 850" stroke={INK} strokeWidth={W + 2} strokeLinecap="round" />
      <Big x={1360} y={395} text="FUTURE YOU" size={64} />
    </g>
    <g style={pop(t, 26.6)}>
      <path d="M 700 470 Q 700 390 790 390 L 900 390 Q 990 390 990 470 Q 990 550 900 550 L 780 550 L 730 600 L 745 545 Q 700 535 700 470 Z" fill="#fff" stroke={INK} strokeWidth={W} />
      <Big x={845} y={510} text="?" size={110} />
    </g>
    <g style={pop(t, 27.6)} transform="rotate(-10 1360 640)">
      <rect x={1130} y={580} width={460} height={120} rx={18} fill="#fbf6ec" stroke={RED} strokeWidth={12} />
      <Big x={1360} y={670} text="STRANGER" color={RED} size={82} />
    </g>
  </g>
);

const SCENES: [number, number, React.FC<{ t: number }>][] = [
  [0, 4.7, S1],
  [4.7, 9.5, S2],
  [9.5, 14.5, S3],
  [14.5, 19.3, S4],
  [19.3, 21.7, S5],
  [21.7, 24.7, S6],
  [24.7, 30.2, S7],
];

export const Ep1Test: React.FC = () => {
  const ready = useFonts();
  const t = useCurrentFrame() / EP1T_FPS;
  if (!ready) return <AbsoluteFill style={{ background: PAPER }} />;
  const line = LINES.find(([a, b]) => t >= a - 0.1 && t < b + 0.1);
  return (
    <AbsoluteFill style={{ background: PAPER, fontFamily: "Poppins" }}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080">
        <g transform="translate(960 470) scale(1.22) translate(-960 -470)">
        {SCENES.map(([a, b, S], i) => {
          const op = i === 0 ? clamp((b - t) / 0.25) : win(t, a, b);
          return op > 0 ? (
            <g key={i} style={{ opacity: op }}>
              <S t={t} />
            </g>
          ) : null;
        })}
        </g>
        {/* channel mark */}
        <g transform="translate(90 80)">
          <circle r={34} fill={GOLD} stroke={INK} strokeWidth={5} />
          <text x={0} y={12} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={30} fill={INK}>
            C
          </text>
          <text x={52} y={11} fontFamily="Poppins" fontWeight={800} fontSize={30} fill={INK}>
            COINFLIP MIND
          </text>
        </g>
      </svg>
      {line ? (
        <div style={{ position: "absolute", bottom: 48, left: 160, right: 160, textAlign: "center" }}>
          <span style={{ display: "inline-block", padding: "14px 28px", background: "rgba(27,31,46,0.88)", color: "#fff", borderRadius: 16, fontWeight: 600, fontSize: 38, lineHeight: 1.3 }}>{line[2]}</span>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
