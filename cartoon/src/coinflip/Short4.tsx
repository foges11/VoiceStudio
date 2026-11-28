// Coinflip Mind, Short 4: "$24,000 beat $84,000" (1080×1920, ~33 s). Rebuilt from Short 3's analytics (50% swiped
// away): a paradox in the first 1.8 s with motion from frame 0, every beat under ~3 s, a 1.2 s guess pause, the
// assumption on screen instead of spoken, and a last line that repeats the first so the loop is seamless.
// Math: $200/month at an assumed 7%/yr, monthly compounding. Friend 20-30 then left to grow to 65 -> $398,308 ($24,000
// in). You 30-65 -> $360,211 ($84,000 in).
import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { useFonts } from "../inkbeat/core/frame";
import CAPS_JSON from "./short4-caps.json";
import WORDS_JSON from "./short4-capwords.json";
import { Coin, Stamp, Txt } from "./Ep1";
import { bob, Guy, In } from "./Ep2";
import { Big, clamp, ease, GOLD, GREEN, INK, on, PAPER, RED, win } from "./Ep1Test";

export const SH4_FPS = 30;
const END = 33.0;
export const SH4_FRAMES = Math.ceil(END * SH4_FPS);
const CAPS = CAPS_JSON as unknown as [number, number, string][];
const WORDS = WORDS_JSON as unknown as [string, number, number][];
const BLUE = "#6c8cff";

const T = (p: string) => {
  const c = CAPS.find((x) => x[2].startsWith(p));
  if (!c) throw new Error(`no caption starts with "${p}"`);
  return c[0];
};
type SC = React.FC<{ t: number }>;

/** a stack of bills; h = number of layers */
const Stack: React.FC<{ x: number; y: number; h: number; s?: number; tilt?: number }> = ({ x, y, h, s = 1, tilt = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${s})`}>
    <ellipse cx={0} cy={18} rx={150} ry={20} fill={INK} opacity={0.12} />
    {Array.from({ length: h }, (_, k) => (
      <g key={k} transform={`translate(${((k * 37) % 13) - 6} ${-k * 26})`}>
        <rect x={-130} y={-24} width={260} height={46} rx={6} fill="#9fe0b8" stroke={INK} strokeWidth={4} />
        <circle r={14} fill="none" stroke={INK} strokeWidth={3} />
      </g>
    ))}
  </g>
);

const Crown: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <path transform={`translate(${x} ${y}) scale(${s})`} d="M -70 0 L -70 -60 L -35 -25 L 0 -75 L 35 -25 L 70 -60 L 70 0 Z" fill={GOLD} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
);

/** the hook picture: a small crowned $24K stack beats a huge wobbling $84K stack (also the loop ending) */
const Versus: React.FC<{ t: number; t0: number; you?: number }> = ({ t, t0, you = 0 }) => {
  const u = t - t0;
  const wob = 5 * Math.sin(u * 7) + (u > 1.2 ? Math.min(18, (u - 1.2) * 30) : 0);
  return (
    <g>
      <Stack x={300} y={1150} h={6} />
      <g transform={`translate(0 ${bob(t, 1, 6)})`}>
        <Crown x={300} y={950} s={1.1} />
      </g>
      <Big x={300} y={1300} text="$24K" color={GREEN} size={110} />
      <g transform={`rotate(${wob} 780 1150)`}>
        <Stack x={780} y={1150} h={22} />
      </g>
      <Big x={780} y={1300} text="$84K" color={RED} size={110} />
      {you > 0 ? (
        <g opacity={you}>
          <rect x={690} y={1330} width={180} height={70} rx={35} fill={INK} />
          <Txt x={780} y={1380} size={44} color={GOLD}>
            YOU
          </Txt>
          <rect x={210} y={1330} width={180} height={70} rx={35} fill="#fff" stroke={INK} strokeWidth={5} />
          <Txt x={300} y={1380} size={36}>
            FRIEND
          </Txt>
        </g>
      ) : null}
    </g>
  );
};

const S_Hook: SC = ({ t }) => {
  const punch = 1.1 - 0.1 * ease(t / 0.5);
  return (
    <g transform={`translate(540 860) scale(${punch}) translate(-540 -860)`}>
      <Big x={540} y={340} text="$24K BEAT" color={INK} size={130} />
      <Big x={540} y={490} text="$84K" color={RED} size={150} />
      <Versus t={t} t0={0} you={on(t, T("And you're") - 0.1, 0.25)} />
      <In t={t} at={T("And you're") + 0.6} dy={0} d={0.2}>
        <Txt x={540} y={640} size={60} color={RED}>
          ...AND YOU LOST.
        </Txt>
      </In>
    </g>
  );
};

const Age: React.FC<{ x: number; y: number; n: number }> = ({ x, y, n }) => (
  <g>
    <rect x={x - 110} y={y - 70} width={220} height={110} rx={24} fill={INK} />
    <Txt x={x} y={y + 10} size={64} color={GOLD}>
      AGE {Math.round(n)}
    </Txt>
  </g>
);

const Jar: React.FC<{ x: number; y: number; fill: number; label: string; color?: string }> = ({ x, y, fill, label, color = GREEN }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-120} y={-200} width={240} height={300} rx={40} fill="#e9f4ff" stroke={INK} strokeWidth={7} />
    {fill > 0.01 ? <rect x={-108} y={88 - 280 * clamp(fill)} width={216} height={280 * clamp(fill)} rx={30} fill={color} opacity={0.85} /> : null}
    <rect x={-90} y={-228} width={180} height={40} rx={10} fill={GOLD} stroke={INK} strokeWidth={6} />
    <Txt x={0} y={170} size={44}>
      {label}
    </Txt>
  </g>
);

const S_Friend: SC = ({ t }) => {
  const a = T("Your friend invests");
  const stop = T("Then stops at thirty");
  const age = 20 + 10 * clamp((t - a - 0.8) / (stop - a));
  const drops = t < stop + 0.3;
  return (
    <g>
      <Txt x={540} y={330} size={64}>
        YOUR FRIEND
      </Txt>
      <Txt x={540} y={410} size={48} color={GREEN}>
        $200 A MONTH
      </Txt>
      <Guy x={300} y={1100} s={0.9} mood="happy" pose="point" shirt={GREEN} />
      <Jar x={760} y={1080} fill={clamp((t - a) / (stop + 1 - a)) * 0.35} label="FRIEND" />
      {drops
        ? [0, 1, 2].map((k) => {
            const u = (t * 1.6 + k / 3) % 1;
            return <Coin key={k} x={760} y={650 + 300 * u} r={34} />;
          })
        : null}
      <Age x={760} y={560} n={age} />
      <In t={t} at={stop + 0.2} dy={0} d={0.2}>
        <g transform="translate(300 600)">
          <path d="M -75 -31 L -31 -75 L 31 -75 L 75 -31 L 75 31 L 31 75 L -31 75 L -75 31 Z" fill={RED} stroke={INK} strokeWidth={6} />
          <Txt x={0} y={16} size={40} color="#fff">
            STOP
          </Txt>
        </g>
      </In>
      <In t={t} at={T("Then stops at thirty") + 1.4} dy={0}>
        <Txt x={760} y={1330} size={40} color={GREEN}>
          NEVER ADDS AGAIN
        </Txt>
      </In>
    </g>
  );
};

const S_You: SC = ({ t }) => {
  const a = T("You start at thirty");
  const never = T("And you never stop.");
  const age = 30 + 35 * clamp((t - never) / 1.3);
  return (
    <g>
      <Txt x={540} y={330} size={64}>
        YOU
      </Txt>
      <Txt x={540} y={410} size={48} color={BLUE}>
        SAME $200 A MONTH
      </Txt>
      <Guy x={300} y={1100} s={0.9} mood="happy" pose="point" />
      <Jar x={760} y={1080} fill={0.05 + 0.5 * clamp((t - a) / 3.5)} label="YOU" color={BLUE} />
      {[0, 1, 2].map((k) => {
        const u = (t * (t > never ? 3 : 1.6) + k / 3) % 1;
        return <Coin key={k} x={760} y={650 + 300 * u} r={34} />;
      })}
      <Age x={760} y={560} n={age} />
    </g>
  );
};

const S_Guess: SC = ({ t }) => {
  const a = T("At sixty-five");
  const p0 = T("Your friend. Almost") - 1.25;
  const n = 3 - Math.floor((t - p0) / 0.4);
  return (
    <g>
      <Txt x={540} y={330} size={84}>
        AT 65,
      </Txt>
      <Txt x={540} y={430} size={84} color={RED}>
        WHO HAS MORE?
      </Txt>
      <Jar x={300} y={1000} fill={0.6} label="FRIEND" />
      <Jar x={780} y={1000} fill={0.6} label="YOU" color={BLUE} />
      <Big x={300} y={900} text="?" color={INK} size={160} />
      <Big x={780} y={900} text="?" color={INK} size={160} />
      {t > p0 && n >= 1 && n <= 3 ? (
        <g>
          <circle cx={540} cy={1345} r={70} fill={RED} stroke={INK} strokeWidth={7} />
          <Txt x={540} y={1374} size={80} color="#fff">
            {n}
          </Txt>
        </g>
      ) : null}
      <In t={t} at={a + 0.4} dy={0}>
        <Txt x={540} y={1215} size={30} color="#999">
          (assumes 7% a year, not a promise)
        </Txt>
      </In>
    </g>
  );
};

const S_Reveal: SC = ({ t }) => {
  const a = T("Your friend. Almost");
  const b = T("You? Three");
  const f = Math.round(398 * ease((t - a - 0.3) / 1.0));
  const y = Math.round(360 * ease((t - b) / 0.6));
  return (
    <g>
      <Jar x={300} y={1000} fill={0.95 * ease((t - a) / 0.8)} label="FRIEND" />
      <Txt x={300} y={650} size={72} color={GREEN}>
        ${f}K
      </Txt>
      <In t={t} at={a + 0.9} dy={-40}>
        <Crown x={300} y={560} s={1.0} />
      </In>
      <In t={t} at={b - 0.2} dy={0}>
        <Jar x={780} y={1000} fill={0.86 * ease((t - b) / 0.6)} label="YOU" color={BLUE} />
        <Txt x={780} y={650} size={72} color={BLUE}>
          ${y}K
        </Txt>
      </In>
      <Txt x={540} y={340} size={70}>
        AT 65
      </Txt>
      <Txt x={540} y={1215} size={30} color="#999">
        (assumes 7% a year, not a promise)
      </Txt>
    </g>
  );
};

const S_Lost: SC = ({ t }) => {
  const a = T("You put in sixty");
  const g = ease((t - a - 0.2) / 0.7);
  return (
    <g>
      <Txt x={540} y={330} size={70}>
        MONEY PUT IN
      </Txt>
      <path d="M 160 1150 L 920 1150" stroke={INK} strokeWidth={8} strokeLinecap="round" />
      <rect x={220} y={1150 - 150 * g} width={260} height={Math.max(1, 150 * g)} rx={16} fill={GREEN} stroke={INK} strokeWidth={6} />
      <Txt x={350} y={1220} size={40}>
        FRIEND $24K
      </Txt>
      <rect x={600} y={1150 - 520 * g} width={260} height={Math.max(1, 520 * g)} rx={16} fill={BLUE} stroke={INK} strokeWidth={6} />
      <Txt x={730} y={1220} size={40}>
        YOU $84K
      </Txt>
      <Stamp x={540} y={560} text="STILL LOST" t={t} at={a + 2.0} size={80} rot={-6} />
    </g>
  );
};

const S_Time: SC = ({ t }) => {
  const a = T("Money needs time");
  const ten = T("Your friend gave it ten");
  const draw = clamp((t - a) / 1.4);
  const pts: string[] = [];
  for (let k = 0; k <= 60; k++) {
    if (k / 60 > draw) break;
    const x = 160 + k * 12.7;
    const y = 1150 - 520 * (Math.pow(1.07, (k / 60) * 45) - 1) / (Math.pow(1.07, 45) - 1);
    pts.push(`${x},${y}`);
  }
  return (
    <g>
      <Txt x={540} y={330} size={70}>
        TIME DOES THE WORK
      </Txt>
      <path d="M 160 600 L 160 1150 L 940 1150" fill="none" stroke={INK} strokeWidth={8} strokeLinecap="round" />
      {pts.length > 1 ? <path d={`M ${pts.join(" L ")}`} fill="none" stroke={GREEN} strokeWidth={14} strokeLinecap="round" /> : null}
      <In t={t} at={ten} dy={0}>
        <rect x={290} y={430} width={500} height={130} rx={65} fill={GOLD} stroke={INK} strokeWidth={7} />
        <Txt x={540} y={518} size={70}>
          +10 YEARS
        </Txt>
      </In>
    </g>
  );
};

const S_Start: SC = ({ t }) => {
  const a = T("So start now.");
  return (
    <g>
      <Big x={540} y={420} text="START NOW." color={GREEN} size={130} />
      <In t={t} at={a + 0.9} dy={0}>
        <Txt x={540} y={540} size={64}>
          EVEN SMALL.
        </Txt>
      </In>
      <Guy x={540} y={1120} s={1.0} mood="happy" pose="up" />
      <g transform={`translate(0 ${-40 * Math.abs(Math.sin(t * 4))})`}>
        <Coin x={540} y={760} r={70} />
      </g>
    </g>
  );
};

const S_Loop: SC = ({ t }) => (
  <g>
    <Big x={540} y={340} text="$24K BEAT" color={INK} size={130} />
    <Big x={540} y={490} text="$84K" color={RED} size={150} />
    <Versus t={t} t0={T("That's how")} you={1} />
  </g>
);

const SCENES: [string, SC][] = [
  ["Twenty-four thousand beat", S_Hook],
  ["Your friend invests", S_Friend],
  ["You start at thirty", S_You],
  ["At sixty-five", S_Guess],
  ["Your friend. Almost", S_Reveal],
  ["You put in sixty", S_Lost],
  ["Money needs time", S_Time],
  ["So start now.", S_Start],
  ["That's how", S_Loop],
];
const RANGES = SCENES.map(([p], i) => [i === 0 ? 0 : T(p) - 0.12, i + 1 < SCENES.length ? T(SCENES[i + 1][0]) - 0.12 : END + 1] as const);

type Sfx = "pop" | "tick" | "swoosh" | "cash" | "tap";
const VOL: Record<Sfx, number> = { pop: 0.17, tick: 0.22, swoosh: 0.15, cash: 0.2, tap: 0.25 };
const P0 = T("Your friend. Almost") - 1.25;
const SFX: [number, Sfx][] = [
  [0, "pop"],
  [T("And you're") + 0.6, "pop"],
  [T("Then stops at thirty") + 0.2, "pop"],
  [P0, "tick"],
  [P0 + 0.4, "tick"],
  [P0 + 0.8, "tick"],
  [T("Your friend. Almost") + 0.9, "cash"],
  [T("You put in sixty") + 2.0, "pop"],
  [T("Your friend gave it ten"), "pop"],
  [T("That's how"), "swoosh"],
];

// word-chunk captions: up to 3 words, break after punctuation, spoken word in gold (same as Short 1)
const CHUNKS: [number, number][] = [];
{
  let s0 = 0;
  WORDS.forEach((w, i) => {
    if (i - s0 + 1 >= 3 || /[.,?!]$/.test(w[0]) || i === WORDS.length - 1) {
      CHUNKS.push([s0, i]);
      s0 = i + 1;
    }
  });
}
const Captions: React.FC<{ t: number }> = ({ t }) => {
  const k = CHUNKS.findIndex(([a, b], i) => {
    const next = CHUNKS[i + 1] ? WORDS[CHUNKS[i + 1][0]][1] : Infinity;
    return t >= WORDS[a][1] - 0.05 && t < (next - WORDS[b][2] < 1.2 ? next - 0.05 : WORDS[b][2] + 0.6);
  });
  if (k < 1) return null; // chunk 0 sits on the title frame
  const [a, b] = CHUNKS[k];
  return (
    <div style={{ position: "absolute", top: 1450, left: 40, right: 40, textAlign: "center" }}>
      <span style={{ display: "inline-block", padding: "10px 30px", background: "rgba(27,31,46,0.92)", borderRadius: 22, fontWeight: 800, fontSize: 72, lineHeight: 1.2, color: "#fff" }}>
        {WORDS.slice(a, b + 1).map((w, i) => (
          <span key={i} style={{ color: t >= w[1] - 0.03 && t < (WORDS[a + i + 1]?.[1] ?? w[2] + 0.5) ? GOLD : "#fff" }}>
            {(i ? " " : "") + w[0].toUpperCase()}
          </span>
        ))}
      </span>
    </div>
  );
};

export const Short4: React.FC<{ audio?: boolean; captions?: boolean }> = ({ audio = true, captions = true }) => {
  const ready = useFonts();
  const t = useCurrentFrame() / SH4_FPS;
  if (!ready) return <AbsoluteFill style={{ background: PAPER }} />;
  return (
    <AbsoluteFill style={{ background: PAPER, fontFamily: "Poppins" }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        {SCENES.map(([, S], i) => {
          const [a, b] = RANGES[i];
          const op = i === 0 ? clamp((b - t) / 0.15) : win(t, a, b);
          const k = 1 + 0.03 * clamp((t - a) / Math.max(1, b - a));
          return op > 0 ? (
            <g key={i} opacity={op} transform={`translate(540 860) scale(${k}) translate(-540 -860)`}>
              <S t={t} />
            </g>
          ) : null;
        })}
      </svg>
      {captions ? <Captions t={t} /> : null}
      {audio ? <Audio src={staticFile("coinflip/short4-vo.wav")} volume={0.85} /> : null}
      {audio
        ? SFX.map(([at, k], i) => (
            <Sequence key={i} from={Math.max(0, Math.round(at * SH4_FPS))} durationInFrames={30}>
              <Audio src={staticFile(`coinflip/sfx/${k}.wav`)} volume={VOL[k]} />
            </Sequence>
          ))
        : null}
    </AbsoluteFill>
  );
};
