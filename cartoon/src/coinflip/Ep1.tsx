// Coinflip Mind, Video 1: "How To Trick Your Brain Into Saving Money" (16:9, 1920×1080, ~6:40).
// Same look as the approved 30 s test (Ep1Test). Every scene and beat is timed from the voice-over: captions come from
// ep1-caps.json (script lines aligned to the VO), sub-beats from ep1-words.json (whisper word times). Re-record the VO →
// re-run the alignment → everything re-times itself.
import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, staticFile, useCurrentFrame } from "remotion";
import { useFonts } from "../inkbeat/core/frame";
import CAPS_JSON from "./ep1-caps.json";
import WORDS_JSON from "./ep1-words.json";
import { Big, Bill, Brain, clamp, ease, GOLD, GREEN, INK, inOut, Jar, on, PAPER, Person, pop, RED, SKIN, W, win } from "./Ep1Test";

export const EP1_FPS = 30;
const CAPS = CAPS_JSON as unknown as [number, number, string][];
const WORDS = WORDS_JSON as unknown as [string, number, number][];
const END = 399.2;
export const EP1_FRAMES = Math.ceil(END * EP1_FPS);

const BLUE = "#6c8cff";
const GREY = "#9aa3b5";
const SOFT = "#ffe08a";

/** start time of the caption line that begins with p */
const T = (p: string) => {
  const c = CAPS.find((x) => x[2].startsWith(p));
  if (!c) throw new Error(`no caption starts with "${p}"`);
  return c[0];
};
/** start time of the first spoken word containing w at or after time `after` */
const TW = (w: string, after: number) => {
  const x = WORDS.find((y) => y[1] >= after - 0.05 && y[0].toLowerCase().includes(w.toLowerCase()));
  if (!x) throw new Error(`no word "${w}" after ${after}`);
  return x[1];
};

// ------------------------------------------------------------------ small drawing helpers
const Txt: React.FC<{ x: number; y: number; children: React.ReactNode; size?: number; color?: string; weight?: number; anchor?: "start" | "middle" | "end"; style?: React.CSSProperties }> = ({
  x,
  y,
  children,
  size = 44,
  color = INK,
  weight = 800,
  anchor = "middle",
  style,
}) => (
  <text x={x} y={y} textAnchor={anchor} fontFamily="Poppins" fontWeight={weight} fontSize={size} fill={color} style={style}>
    {children}
  </text>
);

const Card: React.FC<{ x: number; y: number; w: number; h: number; fill?: string; stroke?: string; r?: number }> = ({ x, y, w, h, fill = "#fff", stroke = INK, r = 24 }) => (
  <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={r} fill={fill} stroke={stroke} strokeWidth={W} />
);

const Phone: React.FC<{ x: number; y: number; s?: number; children?: React.ReactNode }> = ({ x, y, s = 1, children }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-160} y={-290} width={320} height={580} rx={46} fill={INK} />
    <rect x={-138} y={-262} width={276} height={524} rx={28} fill="#fff" />
    {children}
  </g>
);

/** an arrow drawn from (x1,y1) to (x2,y2), revealed by p (0..1) */
const Arrow: React.FC<{ x1: number; y1: number; x2: number; y2: number; p?: number; color?: string; w?: number }> = ({ x1, y1, x2, y2, p = 1, color = INK, w = W + 3 }) => {
  if (p <= 0) return null;
  const x = x1 + (x2 - x1) * p;
  const y = y1 + (y2 - y1) * p;
  const a = Math.atan2(y2 - y1, x2 - x1);
  const h = 26;
  return (
    <g stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" fill="none">
      <path d={`M ${x1} ${y1} L ${x} ${y}`} />
      {p > 0.95 ? <path d={`M ${x - h * Math.cos(a - 0.5)} ${y - h * Math.sin(a - 0.5)} L ${x} ${y} L ${x - h * Math.cos(a + 0.5)} ${y - h * Math.sin(a + 0.5)}`} /> : null}
    </g>
  );
};

/** a red strike-through drawn left to right */
const Strike: React.FC<{ x1: number; x2: number; y: number; p: number }> = ({ x1, x2, y, p }) =>
  p > 0 ? <path d={`M ${x1} ${y} L ${x1 + (x2 - x1) * p} ${y}`} stroke={RED} strokeWidth={16} strokeLinecap="round" /> : null;

/** a tilted stamp */
const Stamp: React.FC<{ x: number; y: number; text: string; color?: string; size?: number; rot?: number; t: number; at: number }> = ({ x, y, text, color = RED, size = 80, rot = -8, t, at }) => {
  const w = text.length * size * 0.66 + 70;
  return (
    <g style={pop(t, at)} transform={`rotate(${rot} ${x} ${y})`}>
      <rect x={x - w / 2} y={y - size * 0.85} width={w} height={size * 1.25} rx={18} fill={PAPER} stroke={color} strokeWidth={12} />
      <Big x={x} y={y + size * 0.15} text={text} color={color} size={size} />
    </g>
  );
};

const Check: React.FC<{ x: number; y: number; s?: number; color?: string }> = ({ x, y, s = 1, color = GREEN }) => (
  <path d={`M ${x - 40 * s} ${y} L ${x - 10 * s} ${y + 30 * s} L ${x + 45 * s} ${y - 35 * s}`} fill="none" stroke={color} strokeWidth={16 * s} strokeLinecap="round" strokeLinejoin="round" />
);
const Cross: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <path d={`M ${x - 35 * s} ${y - 35 * s} L ${x + 35 * s} ${y + 35 * s} M ${x + 35 * s} ${y - 35 * s} L ${x - 35 * s} ${y + 35 * s}`} stroke={RED} strokeWidth={16 * s} strokeLinecap="round" />
);

const Bubble: React.FC<{ x: number; y: number; w: number; h?: number; tail?: "left" | "right"; children: React.ReactNode }> = ({ x, y, w, h = 120, tail = "left", children }) => {
  const tx = tail === "left" ? x - w / 2 + 60 : x + w / 2 - 60;
  const d = tail === "left" ? -50 : 50;
  return (
    <g>
      <path d={`M ${tx - 20} ${y + h / 2 - 4} L ${tx + d} ${y + h / 2 + 50} L ${tx + 30} ${y + h / 2 - 4} Z`} fill="#fff" stroke={INK} strokeWidth={W} strokeLinejoin="round" />
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={h / 2.4} fill="#fff" stroke={INK} strokeWidth={W} />
      <rect x={tx - 16} y={y + h / 2 - 12} width={42} height={14} fill="#fff" />
      {children}
    </g>
  );
};

/** two "self" circles: today (gold) and future (blue), centres gap px apart */
const Pair: React.FC<{ x: number; y: number; gap: number; r?: number; labels?: boolean; op2?: number }> = ({ x, y, gap, r = 80, labels = false, op2 = 1 }) => (
  <g>
    <circle cx={x - gap / 2} cy={y} r={r} fill={GOLD} fillOpacity={0.55} stroke={INK} strokeWidth={W - 1} />
    <circle cx={x + gap / 2} cy={y} r={r} fill={BLUE} fillOpacity={0.45} stroke={INK} strokeWidth={W - 1} style={{ opacity: op2 }} />
    {labels ? (
      <>
        <Txt x={x - gap / 2} y={y + 12} size={Math.round(r * 0.36)}>
          TODAY
        </Txt>
        <Txt x={x + gap / 2} y={y + 12} size={Math.round(r * 0.3)} style={{ opacity: op2 }}>
          IN 10 YRS
        </Txt>
      </>
    ) : null}
  </g>
);

/** a silhouette "stranger" (grey, faceless) */
const Stranger: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -30 40 L -36 150 M 30 40 L 36 150" stroke={GREY} strokeWidth={W + 3} strokeLinecap="round" />
    <rect x={-62} y={-120} width={124} height={170} rx={52} fill="#c7ccd8" stroke={GREY} strokeWidth={W} />
    <circle cy={-200} r={82} fill="#d9dde6" stroke={GREY} strokeWidth={W} />
    <Txt x={0} y={-170} size={90} color={GREY}>
      ?
    </Txt>
  </g>
);

const Shades: React.FC = () => (
  <g>
    <rect x={-66} y={-226} width={56} height={34} rx={10} fill={INK} />
    <rect x={10} y={-226} width={56} height={34} rx={10} fill={INK} />
    <path d="M -10 -212 L 10 -212" stroke={INK} strokeWidth={6} />
  </g>
);

const StarIcon: React.FC<{ x: number; y: number; r?: number; fill?: string }> = ({ x, y, r = 40, fill = GOLD }) => {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = (i * Math.PI) / 5 - Math.PI / 2;
    const rr = i % 2 ? r * 0.45 : r;
    return `${x + rr * Math.cos(a)},${y + rr * Math.sin(a)}`;
  }).join(" ");
  return <polygon points={pts} fill={fill} stroke={INK} strokeWidth={5} strokeLinejoin="round" />;
};

const Coin: React.FC<{ x: number; y: number; r?: number; label?: string }> = ({ x, y, r = 46, label = "$" }) => (
  <g>
    <circle cx={x} cy={y + 5} r={r} fill="#c98a12" />
    <circle cx={x} cy={y} r={r} fill={GOLD} stroke={INK} strokeWidth={5} />
    <Txt x={x} y={y + r * 0.36} size={r * (label.length > 2 ? 0.55 : 1)}>
      {label}
    </Txt>
  </g>
);

/** a vertical meter (PAIN etc.) */
const Meter: React.FC<{ x: number; y: number; p: number; label: string; color?: string }> = ({ x, y, p, label, color = RED }) => (
  <g transform={`translate(${x} ${y})`}>
    <Txt x={0} y={-235} size={48}>
      {label}
    </Txt>
    <rect x={-60} y={-210} width={120} height={420} rx={30} fill="#fff" stroke={INK} strokeWidth={W} />
    {p > 0.01 ? <rect x={-48} y={198 - 396 * p} width={96} height={396 * p} rx={22} fill={color} /> : null}
    <text y={-300} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={64} fill={p > 0.01 ? color : GREEN} stroke={INK} strokeWidth={4} paintOrder="stroke fill">
      {Math.round(p * 100)}%
    </text>
  </g>
);

const PhotoFrame: React.FC<{ x: number; y: number; old?: boolean; rot?: number }> = ({ x, y, old = false, rot = 0 }) => (
  <g transform={`rotate(${rot} ${x} ${y})`}>
    <rect x={x - 170} y={y - 210} width={340} height={420} rx={14} fill="#fff" stroke={INK} strokeWidth={W} />
    <clipPath id={`ph${x}${y}${old ? 1 : 0}`}>
      <rect x={x - 140} y={y - 180} width={280} height={300} />
    </clipPath>
    <rect x={x - 140} y={y - 180} width={280} height={300} fill={old ? "#e6e2f2" : "#dff1ff"} />
    <g clipPath={`url(#ph${x}${y}${old ? 1 : 0})`}>
      <Person x={x} y={y + 240} mood="happy" old={old} s={0.95} />
    </g>
    <rect x={x - 170} y={y - 210} width={340} height={420} rx={14} fill="none" stroke={INK} strokeWidth={W} />
  </g>
);

const fmt = (n: number) => "$" + Math.round(n).toLocaleString("en-US");

// ------------------------------------------------------------------ scenes (t = absolute seconds)
type SC = React.FC<{ t: number }>;

const Intro: SC = ({ t }) => {
  const fly = inOut((t - 1.4) / 1.2);
  return (
    <g>
      <Person x={620} y={640} mood={t < 3.0 ? "happy" : "neutral"} hands={[[-90, 20], [110, -40]]}>
        <rect x={92} y={-130} width={70} height={120} rx={14} fill={INK} transform="rotate(10 127 -70)" />
        <rect x={100} y={-120} width={54} height={92} rx={8} fill="#7ad7ff" transform="rotate(10 127 -70)" />
      </Person>
      {t > 1.4 && t < 2.6 ? <Bill x={760 + fly * 1100} y={500 - fly * 240} s={1.1} r={-15 + fly * 40} /> : null}
      <Jar x={1300} y={640} />
      <g style={pop(t, T("Why does"))}>
        <Big x={1300} y={330} text="WHY?" color={GOLD} size={150} />
      </g>
    </g>
  );
};

const Order: SC = ({ t }) => {
  const a = T("Tap, tap");
  const tap = (x: number) => clamp(1 - Math.abs(t - x) / 0.18);
  const done = t > a + 0.55;
  return (
    <g>
      <g transform="translate(760 500)">
        <rect x={-230} y={-370} width={460} height={760} rx={60} fill={INK} />
        <rect x={-200} y={-335} width={400} height={690} rx={36} fill="#fff" />
        <Txt x={0} y={-250} size={36} weight={700}>
          Food delivery
        </Txt>
        <circle cy={-100} r={105} fill={GOLD} stroke={INK} strokeWidth={W} />
        <path d="M -76 -100 L 76 -100" stroke={INK} strokeWidth={W} />
        <path d="M -66 -138 Q 0 -200 66 -138 Z" fill="#c98a12" stroke={INK} strokeWidth={W} />
        <Txt x={0} y={90} size={84}>
          $40.00
        </Txt>
        <rect x={-150} y={160} width={300} height={100} rx={50} fill={done ? GREEN : RED} stroke={INK} strokeWidth={W} />
        <Txt x={0} y={228} size={44} color="#fff">
          {done ? "ORDERED" : "ORDER"}
        </Txt>
        <circle cx={60} cy={210} r={30 + 22 * Math.max(tap(a + 0.05), tap(a + 0.35))} fill="rgba(27,31,46,0.15)" style={{ opacity: Math.max(tap(a + 0.05), tap(a + 0.35)) }} />
      </g>
      <g style={{ opacity: on(t, T("You didn't")) }}>
        <Meter x={1340} y={540} p={0} label="PAIN" />
      </g>
    </g>
  );
};

const Pain: SC = ({ t }) => {
  const pain = inOut((t - T("Suddenly")) / 1.6);
  const shake = Math.sin(t * 40) * 4 * pain;
  return (
    <g>
      <Person x={600} y={660} mood={pain > 0.3 ? "strain" : "neutral"} hands={[[110, -150], [150, -120]]} />
      <Bill x={760 + shake} y={480} s={1.1} r={-6} />
      <Jar x={1080} y={680} />
      <Meter x={1500} y={540} p={pain} label="PAIN" />
    </g>
  );
};

const Discipline: SC = ({ t }) => (
  <g>
    <g style={pop(t, T("Most people") + 0.1)}>
      <Big x={960} y={300} text="DISCIPLINE?" size={130} />
    </g>
    <g style={{ opacity: on(t, T("Some people")) }}>
      <Person x={620} y={760} s={0.85} mood="happy" shirt={GREEN} />
      <Check x={620} y={450} s={1.2} />
    </g>
    <g style={{ opacity: on(t, T("Some people") + 0.9) }}>
      <Person x={1300} y={760} s={0.85} mood="worried" shirt="#ff9f6e" />
      <Cross x={1300} y={450} s={1.1} />
    </g>
  </g>
);

const Nope: SC = ({ t }) => (
  <g>
    <Big x={960} y={470} text="DISCIPLINE?" size={130} />
    <Strike x1={560} x2={1360} y={430} p={on(t, T("But that's not") + 0.3, 0.4)} />
    <Stamp x={960} y={700} text="NOPE" t={t} at={T("But that's not") + 0.9} size={110} rot={-6} />
  </g>
);

const Weirder: SC = ({ t }) => (
  <g>
    <g style={{ transform: `scale(${0.96 + 0.04 * on(t, T("The real reason"), 1.5)})`, transformOrigin: "960px 540px" }}>
      <Brain x={960} y={540} s={1.4} />
    </g>
    <g style={pop(t, TW("weirder", T("The real reason")))}>
      <Big x={960} y={270} text="WEIRDER." color={GOLD} size={120} />
    </g>
  </g>
);

const StrangerScene: SC = ({ t }) => {
  const a = T("Your brain thinks");
  return (
    <g>
      <Person x={560} y={700} mood="neutral" />
      <Big x={560} y={395} text="YOU" size={64} />
      <g style={{ opacity: on(t, TW("future", a)) }}>
        <Person x={1360} y={700} mood="neutral" old />
        <path d="M 1450 640 L 1470 850" stroke={INK} strokeWidth={W + 2} strokeLinecap="round" />
        <Big x={1360} y={395} text="FUTURE YOU" size={64} />
      </g>
      <Stamp x={1360} y={640} text="STRANGER" t={t} at={TW("stranger", a)} size={82} rot={-10} />
    </g>
  );
};

const Roadmap: SC = ({ t }) => {
  const xs = [380, 767, 1153, 1540];
  const at = [TW("brain", T("In this video")), T("A five-second"), T("The trick"), T("And one rule")];
  const titles = ["BRAIN SCAN", "5-SEC TEST", "THE TRICK", "ONE RULE"];
  return (
    <g>
      <Txt x={960} y={200} size={64} style={{ opacity: on(t, T("In this video")) }}>
        IN THIS VIDEO
      </Txt>
      {xs.map((x, i) => (
        <g key={i} style={pop(t, at[i])}>
          <Card x={x} y={520} w={330} h={420} />
          <circle cx={x - 120} cy={350} r={30} fill={GOLD} stroke={INK} strokeWidth={5} />
          <Txt x={x - 120} y={362} size={32}>
            {i + 1}
          </Txt>
          {i === 0 ? <Brain x={x} y={490} s={0.55} /> : null}
          {i === 1 ? <Pair x={x} y={490} gap={110} r={70} /> : null}
          {i === 2 ? (
            <g>
              <Jar x={x} y={540} label="" />
              <Txt x={x} y={545} size={64} color={GREEN}>
                4×
              </Txt>
            </g>
          ) : null}
          {i === 3 ? (
            <g>
              <Coin x={x} y={490} r={80} label="1" />
            </g>
          ) : null}
          <Txt x={x} y={690} size={40}>
            {titles[i]}
          </Txt>
        </g>
      ))}
    </g>
  );
};

const MeetSam: SC = ({ t }) => {
  const a = T("Meet Sam.");
  return (
    <g>
      <g style={{ opacity: on(t, a) }}>
        <Person x={760} y={680} mood="happy" />
        <rect x={680} y={560} width={160} height={70} rx={12} fill="#fff" stroke={INK} strokeWidth={5} />
        <Txt x={760} y={608} size={38}>
          SAM
        </Txt>
      </g>
      <g style={pop(t, TW("25", a))}>
        <Txt x={760} y={300} size={56} color={BLUE}>
          AGE 25, HAS A JOB
        </Txt>
      </g>
      <Txt x={760} y={170} size={30} weight={600} color={GREY} style={{ opacity: on(t, a + 0.6) }}>
        (Sam is an example)
      </Txt>
      <g style={pop(t, T("this month, I'll save"))}>
        <Bubble x={1300} y={420} w={520} h={140}>
          <Txt x={1300} y={438} size={46}>
            This month, I'll save.
          </Txt>
        </Bubble>
      </g>
    </g>
  );
};

const Month: SC = ({ t }) => {
  const items = [T("A dinner."), T("A pair of shoes."), T("A sale that ends")];
  const left = 1 - 0.3 * items.filter((x) => t > x).length - (t > T("By the 30th") ? 0.1 : 0);
  return (
    <g>
      <Person x={460} y={690} s={0.9} mood={t > T("By the 30th") ? "worried" : "neutral"} />
      {/* the month's money bar */}
      <Txt x={1190} y={210} size={44}>
        THIS MONTH'S MONEY
      </Txt>
      <rect x={830} y={240} width={720} height={80} rx={40} fill="#fff" stroke={INK} strokeWidth={W} />
      {left > 0.01 ? <rect x={842} y={252} width={696 * clamp(left)} height={56} rx={28} fill={GREEN} /> : null}
      {/* a dinner */}
      <g style={pop(t, items[0])}>
        <circle cx={950} cy={500} r={95} fill="#fff" stroke={INK} strokeWidth={W} />
        <circle cx={950} cy={500} r={55} fill="#ffb38a" stroke={INK} strokeWidth={5} />
        <Txt x={950} y={650} size={36}>
          DINNER
        </Txt>
      </g>
      {/* shoes */}
      <g style={pop(t, items[1])}>
        <path d="M 1110 540 L 1110 440 L 1170 440 Q 1180 500 1270 510 Q 1320 520 1320 560 L 1110 560 Z" fill={RED} stroke={INK} strokeWidth={W} strokeLinejoin="round" />
        <Txt x={1215} y={650} size={36}>
          SHOES
        </Txt>
      </g>
      {/* a sale tag */}
      <g style={pop(t, items[2])} transform="rotate(-8 1450 500)">
        <path d="M 1370 430 L 1530 430 L 1530 570 L 1370 570 L 1330 500 Z" fill={GOLD} stroke={INK} strokeWidth={W} strokeLinejoin="round" />
        <Txt x={1450} y={490} size={40}>
          SALE
        </Txt>
        <Txt x={1445} y={538} size={20} weight={700}>
          ENDS TONIGHT
        </Txt>
      </g>
      <Stamp x={1190} y={780} text="SAVED: $0" t={t} at={TW("nothing", T("By the 30th"))} size={70} rot={-4} />
    </g>
  );
};

const Normal: SC = ({ t }) => (
  <g>
    <Person x={960} y={680} mood="neutral" />
    <Stamp x={960} y={300} text="NORMAL" color={GREEN} t={t} at={T("Sam is normal")} size={100} rot={-6} />
  </g>
);

const InsideHead: SC = ({ t }) => {
  const a = T("And to understand");
  const z = inOut((t - TW("inside", a)) / 1.4);
  return (
    <g style={{ transform: `scale(${1 + 1.6 * z})`, transformOrigin: "960px 480px" }}>
      <Person x={960} y={680} mood="neutral" />
      <g style={{ opacity: z }}>
        <circle cx={960} cy={480} r={82} fill="#fff" stroke={INK} strokeWidth={W} />
        <Brain x={960} y={482} s={0.34} />
      </g>
    </g>
  );
};

const Scanner: SC = ({ t }) => {
  const a = T("In 2009");
  return (
    <g>
      <g style={pop(t, a + 0.2)}>
        <Txt x={960} y={190} size={60}>
          STANFORD, 2009
        </Txt>
      </g>
      <g style={{ opacity: on(t, a + 0.8) }}>
        <rect x={520} y={600} width={880} height={70} rx={20} fill="#dfe4ee" stroke={INK} strokeWidth={W} />
        <circle cx={1180} cy={500} r={230} fill="#eef1f7" stroke={INK} strokeWidth={W} />
        <circle cx={1180} cy={500} r={130} fill={PAPER} stroke={INK} strokeWidth={W} />
        {/* person lying down, head inside the ring */}
        <rect x={620} y={540} width={420} height={70} rx={35} fill={BLUE} stroke={INK} strokeWidth={W} />
        <circle cx={1110} cy={545} r={55} fill={SKIN} stroke={INK} strokeWidth={W} />
        <rect x={500} y={670} width={40} height={140} fill={INK} />
        <rect x={1380} y={670} width={40} height={140} fill={INK} />
      </g>
      <g style={pop(t, T("Then they asked"))}>
        <Bubble x={720} y={370} w={520} h={110} tail="right">
          <Txt x={720} y={386} size={40}>
            Think about 4 people
          </Txt>
        </Bubble>
      </g>
    </g>
  );
};

const FourPeople: SC = ({ t }) => {
  const at = [T("Themselves today."), T("Themselves in ten"), T("A celebrity today."), T("And that same celebrity")];
  const xs = [380, 767, 1153, 1540];
  const labels = [
    ["YOU", "TODAY"],
    ["YOU", "IN 10 YEARS"],
    ["CELEBRITY", "TODAY"],
    ["CELEBRITY", "IN 10 YEARS"],
  ];
  return (
    <g>
      {xs.map((x, i) => (
        <g key={i} style={pop(t, at[i])}>
          <Card x={x} y={500} w={340} h={560} fill={i > 1 ? "#f3ecff" : "#fff"} />
          <Person x={x} y={560} s={0.7} mood="happy" old={i % 2 === 1} shirt={i > 1 ? "#b07cff" : BLUE}>
            {i > 1 && i % 2 === 0 ? <Shades /> : null}
          </Person>
          {i > 1 ? <StarIcon x={x + 110} y={290} r={34} /> : null}
          <Txt x={x} y={700} size={i > 1 ? 34 : 40}>
            {labels[i][0]}
          </Txt>
          <Txt x={x} y={745} size={30} weight={700} color={GREY}>
            {labels[i][1]}
          </Txt>
        </g>
      ))}
    </g>
  );
};

/** a brain with an activity spot (glow 0..1) */
const LitBrain: React.FC<{ x: number; y: number; s: number; glow: number; label: string; sub?: string }> = ({ x, y, s, glow, label, sub }) => (
  <g>
    <Brain x={x} y={y} s={s} />
    <circle cx={x} cy={y - 40 * s} r={60 * s} fill={GOLD} style={{ opacity: glow }} />
    <circle cx={x} cy={y - 40 * s} r={100 * s} fill={GOLD} style={{ opacity: glow * 0.3 }} />
    <Txt x={x} y={y + 230 * s} size={44}>
      {label}
    </Txt>
    {sub ? (
      <Txt x={x} y={y + 230 * s + 46} size={32} weight={700} color={GREY}>
        {sub}
      </Txt>
    ) : null}
  </g>
);

const Lights: SC = ({ t }) => (
  <g>
    <g style={{ opacity: on(t, T("When people thought")) }}>
      <LitBrain x={620} y={460} s={0.95} glow={on(t, TW("lit", T("one part")), 0.5)} label="YOU" sub="TODAY" />
    </g>
    <g style={{ opacity: on(t, T("When they thought about the celebrity")) }}>
      <LitBrain x={1300} y={460} s={0.95} glow={0.25 * on(t, TW("quieter", T("When they thought about the celebrity")), 0.5)} label="CELEBRITY" sub="TODAY" />
    </g>
  </g>
);

const FutureBrain: SC = ({ t }) => {
  const a = T("And when they thought about themselves ten");
  const b = T("Their brain looked");
  return (
    <g>
      <LitBrain x={620} y={460} s={0.95} glow={0.25} label="CELEBRITY" sub="TODAY" />
      <g style={{ opacity: on(t, a + 0.4) }}>
        <LitBrain x={1300} y={460} s={0.95} glow={0.25 * on(t, b + 0.6, 0.6)} label="YOU" sub="IN 10 YEARS" />
      </g>
      <g style={pop(t, TW("celebrity", b))}>
        <g fill="none" stroke={GOLD} strokeWidth={22} strokeLinecap="round">
          <path d="M 890 420 Q 925 390 960 420 T 1030 420" />
          <path d="M 890 480 Q 925 450 960 480 T 1030 480" />
        </g>
      </g>
    </g>
  );
};

const SomeoneElse: SC = ({ t }) => (
  <g>
    <Person x={560} y={700} mood="neutral" />
    <Big x={560} y={395} text="YOU" size={64} />
    <g style={{ opacity: on(t, T("To your brain") + 0.4) }}>
      <Stranger x={1360} y={700} />
      <Big x={1360} y={395} text="FUTURE YOU" size={64} />
    </g>
    <Stamp x={960} y={230} text="SOMEONE ELSE" t={t} at={TW("someone", T("To your brain"))} size={80} rot={-4} />
  </g>
);

const Patience: SC = ({ t }) => {
  const off = T("Offered");
  const grab = TW("money", T("they were more likely"));
  return (
    <g>
      <g style={{ opacity: on(t, T("Here's the part") + 0.1) * (1 - on(t, T("The people whose") - 0.1, 0.3)) }}>
        <Coin x={960} y={500} r={150} />
        <Txt x={960} y={230} size={64}>
          WHY IT MATTERS FOR YOUR MONEY
        </Txt>
      </g>
      <g style={pop(t, TW("least", T("The people whose")))}>
        <Txt x={960} y={200} size={64}>
          STRANGER-LIKE = LEAST PATIENT
        </Txt>
      </g>
      <g style={{ opacity: on(t, T("The people whose") + 0.3) * (1 - on(t, TW("smaller", off) - 0.3, 0.3)) }}>
        <Stranger x={960} y={680} s={0.9} />
      </g>
      <g style={pop(t, TW("smaller", off))}>
        <Card x={620} y={540} w={420} h={400} />
        <Coin x={620} y={520} r={70} />
        <Txt x={620} y={680} size={50}>
          SMALLER, NOW
        </Txt>
      </g>
      <g style={pop(t, TW("bigger", off))}>
        <Card x={1300} y={540} w={420} h={400} />
        <Coin x={1230} y={540} r={60} />
        <Coin x={1370} y={540} r={60} />
        <Coin x={1300} y={460} r={60} />
        <Txt x={1300} y={680} size={50}>
          BIGGER, LATER
        </Txt>
      </g>
      <g style={{ opacity: on(t, grab, 0.3) }}>
        <rect x={400} y={330} width={440} height={420} rx={30} fill="none" stroke={GREEN} strokeWidth={14} />
        <Check x={830} y={340} s={1.1} />
      </g>
    </g>
  );
};

const Choice: SC = ({ t }) => {
  const b = T("Sam's brain is making");
  const pick = T("And it picks right now.");
  return (
    <g>
      <Stamp x={960} y={200} text="NOT LAZY" color={GREEN} t={t} at={TW("lazy", T("So when Sam skips"))} size={70} rot={-4} />
      <Person x={600} y={700} s={0.9} mood="happy" />
      <g style={{ opacity: on(t, TW("me", b + 1)) }}>
        <Txt x={600} y={410} size={48}>
          ME, RIGHT NOW
        </Txt>
      </g>
      <g style={{ opacity: on(t, T("or a stranger")) }}>
        <Stranger x={1320} y={700} s={0.9} />
        <Txt x={1320} y={410} size={48}>
          A STRANGER
        </Txt>
      </g>
      <g style={{ opacity: on(t, pick + 0.6, 0.3) }}>
        <rect x={420} y={340} width={360} height={520} rx={30} fill="none" stroke={GREEN} strokeWidth={14} />
      </g>
      <g style={pop(t, T("Every time."))}>
        <Big x={960} y={600} text="EVERY TIME" size={70} color={GOLD} />
      </g>
    </g>
  );
};

const HowFar: SC = ({ t }) => {
  const a = T("So how far away");
  return (
    <g>
      <Person x={480} y={700} s={0.8} mood="neutral" />
      <Person x={1440} y={700} s={0.8} mood="neutral" old />
      <path d="M 600 560 L 1320 560" stroke={INK} strokeWidth={W} strokeDasharray="22 18" strokeLinecap="round" />
      <Big x={960} y={520} text="?" size={140} color={GOLD} />
      <Txt x={960} y={230} size={56} style={{ opacity: on(t, a) }}>
        HOW FAR AWAY IS FUTURE YOU?
      </Txt>
      <g style={pop(t, T("It takes five"))}>
        <circle cx={960} cy={720} r={80} fill="#fff" stroke={INK} strokeWidth={W} />
        <rect x={940} y={622} width={40} height={22} rx={6} fill={INK} />
        <Txt x={960} y={736} size={46}>
          5s
        </Txt>
      </g>
    </g>
  );
};

const Circles: SC = ({ t }) => {
  const now = T("Now pick");
  const opts = [TW("far", T("Are the circles")), TW("touching", T("Are the circles")), T("Overlapping"), T("Or almost")];
  const gaps = [360, 200, 110, 30];
  const names = ["FAR APART", "BARELY TOUCHING", "A LITTLE", "ALMOST ONE"];
  const row = on(t, now, 0.6);
  const pause = T("Seriously.") + 0.5;
  const left = Math.ceil(3 - (t - pause));
  return (
    <g>
      <g style={{ opacity: 1 - row }}>
        <Txt x={960} y={220} size={56}>
          PICTURE TWO CIRCLES
        </Txt>
        <g style={{ opacity: on(t, T("One is you today")) }}>
          <Pair x={960} y={520} gap={440} r={170} labels op2={on(t, T("The other is you"))} />
        </g>
      </g>
      <g style={{ opacity: row }}>
        <Txt x={960} y={180} size={52}>
          WHICH ONE FEELS RIGHT?
        </Txt>
        {gaps.map((g, i) => {
          const x = 380 + i * 387;
          const hi = t > opts[i] && t < (opts[i + 1] ?? T("Pause and pick"));
          return (
            <g key={i} style={{ opacity: on(t, opts[i], 0.3) }}>
              <Card x={x} y={480} w={350} h={380} fill={hi ? "#fff4d6" : "#fff"} />
              <Pair x={x} y={450} gap={g * 0.5} r={62} />
              <Txt x={x - 125} y={340} size={36} anchor="start">
                {"ABCD"[i]}
              </Txt>
              <Txt x={x} y={620} size={30}>
                {names[i]}
              </Txt>
            </g>
          );
        })}
        <g style={{ opacity: on(t, T("Pause and pick")) }}>
          <rect x={890} y={705} width={40} height={110} rx={10} fill={INK} />
          <rect x={990} y={705} width={40} height={110} rx={10} fill={INK} />
        </g>
        {t > pause && left >= 1 && left <= 3 ? (
          <g>
            <circle cx={1180} cy={760} r={60} fill={GOLD} stroke={INK} strokeWidth={W} />
            <Txt x={1180} y={784} size={70}>
              {left}
            </Txt>
          </g>
        ) : null}
      </g>
    </g>
  );
};

const Study153: SC = ({ t }) => {
  const a = T("Researchers used a test");
  const b = T("The people who chose");
  const dots = on(t, TW("153", a), 1.2);
  const split = on(t, b, 0.6);
  return (
    <g>
      <g style={{ opacity: 1 - split }}>
        <Txt x={960} y={220} size={64}>
          153 AMERICANS
        </Txt>
        {Array.from({ length: 153 }, (_, i) => {
          const c = i % 17;
          const r = Math.floor(i / 17);
          return i / 153 < dots ? <circle key={i} cx={560 + c * 50} cy={340 + r * 50} r={17} fill={i % 3 ? BLUE : GOLD} stroke={INK} strokeWidth={3} /> : null;
        })}
      </g>
      <g style={{ opacity: split }}>
        <Pair x={560} y={300} gap={90} r={100} />
        <Txt x={560} y={460} size={40}>
          MORE OVERLAP
        </Txt>
        <g style={{ opacity: on(t, T("had built up")) }}>
          <Jar x={560} y={690} label="MORE" />
        </g>
        <Pair x={1360} y={300} gap={280} r={100} />
        <Txt x={1360} y={460} size={40}>
          FAR APART
        </Txt>
        <g style={{ opacity: on(t, T("had built up")) }}>
          <Jar x={1360} y={690} label="LESS" />
        </g>
      </g>
    </g>
  );
};

const Distance: SC = ({ t }) => {
  const shrink = inOut((t - TW("shrunk", T("And distance can"))) / 1.2);
  const gap = 640 - 420 * shrink;
  return (
    <g>
      <Pair x={960} y={430} gap={gap} r={150} labels />
      <g style={{ opacity: on(t, T("It's distance.")) * (1 - shrink) }}>
        <Arrow x1={960 - gap / 2 + 160} y1={650} x2={960 + gap / 2 - 160} y2={650} />
        <Arrow x1={960 + gap / 2 - 160} y1={650} x2={960 - gap / 2 + 160} y2={650} />
        <Txt x={960} y={730} size={56}>
          DISTANCE
        </Txt>
      </g>
      <g style={{ opacity: on(t, T("It's not a character")) * (1 - on(t, T("It's distance."))) }}>
        <Txt x={960} y={760} size={60}>
          CHARACTER FLAW
        </Txt>
        <Strike x1={700} x2={1220} y={740} p={on(t, T("It's not a character") + 0.5, 0.4)} />
      </g>
    </g>
  );
};

const Versus: SC = ({ t }) => (
  <g>
    <Person x={560} y={700} mood="strain" hands={[[-60, -120], [60, -120]]} />
    <Txt x={560} y={400} size={50}>
      RIGHT-NOW YOU
    </Txt>
    <g style={{ opacity: on(t, TW("other", T("you need to see"))) }}>
      <Person x={1360} y={700} mood="neutral" old />
      <Txt x={1360} y={400} size={50}>
        FUTURE YOU
      </Txt>
    </g>
    <g style={pop(t, TW("fight", T("you need to see")))}>
      <Big x={960} y={600} text="VS" size={150} color={RED} />
    </g>
  </g>
);

const Easy: SC = ({ t }) => {
  const b = T("Because the reward");
  return (
    <g>
      <Txt x={960} y={200} size={60} style={{ opacity: 1 - on(t, b) }}>
        WHY DOES SPENDING FEEL SO EASY?
      </Txt>
      <g style={{ opacity: on(t, b) }}>
        <Phone x={620} y={520} s={0.95}>
          <rect x={-110} y={60} width={220} height={90} rx={45} fill={t > T("Tap the button") + 0.4 ? GREEN : RED} stroke={INK} strokeWidth={W} />
          <Txt x={0} y={120} size={36} color="#fff">
            {t > T("Tap the button") + 0.4 ? "ON ITS WAY" : "ORDER"}
          </Txt>
          <circle cy={-80} r={90} fill={GOLD} stroke={INK} strokeWidth={W} />
        </Phone>
        <Stamp x={620} y={160} text="INSTANT" color={GREEN} t={t} at={TW("instant", b)} size={60} rot={-5} />
      </g>
      <g style={{ opacity: on(t, T("and your brain gets")) }}>
        <LitBrain x={1300} y={470} s={0.9} glow={on(t, TW("anticipation", T("and your brain gets")), 0.4)} label="A HIT RIGHT NOW" />
      </g>
    </g>
  );
};

const Opposite: SC = ({ t }) => {
  const a = T("You give something");
  const fly = inOut((t - TW("reward", a)) / 1.4);
  return (
    <g>
      <Txt x={960} y={200} size={60} style={{ opacity: on(t, T("Saving is the opposite")) }}>
        SAVING IS THE OPPOSITE
      </Txt>
      <Person x={420} y={720} s={0.8} mood={t > a + 0.5 ? "strain" : "neutral"} />
      <Txt x={420} y={420} size={40}>
        TODAY
      </Txt>
      <path d="M 560 760 L 1360 760" stroke={INK} strokeWidth={W} strokeDasharray="20 16" />
      <g style={{ opacity: on(t, a) }}>
        <Coin x={560} y={520} r={50} label="-$" />
      </g>
      <Stranger x={1500} y={720} s={0.8} />
      <g style={{ opacity: on(t, TW("20", T("In twenty"))) }}>
        <Txt x={1500} y={420} size={40}>
          IN 20 YEARS
        </Txt>
      </g>
      {t > TW("reward", a) ? <StarIcon x={560 + 900 * fly} y={600 - 160 * Math.sin(Math.PI * fly)} r={46} /> : null}
    </g>
  );
};

const Unfair: SC = ({ t }) => {
  const tip = inOut((t - T("That's not a fair")) / 1.0) * 14;
  return (
    <g>
      <g transform={`rotate(${-tip} 960 520)`}>
        <rect x={460} y={505} width={1000} height={30} rx={15} fill={INK} />
        <path d="M 560 520 L 560 600 M 1360 520 L 1360 600" stroke={INK} strokeWidth={W} />
        <rect x={430} y={600} width={260} height={50} rx={14} fill={RED} stroke={INK} strokeWidth={W} />
        <rect x={1230} y={600} width={260} height={50} rx={14} fill={GREEN} stroke={INK} strokeWidth={W} />
        <Txt x={560} y={720} size={50}>
          NOW
        </Txt>
        <Txt x={1360} y={720} size={50}>
          LATER
        </Txt>
      </g>
      <path d="M 960 520 L 900 820 L 1020 820 Z" fill={GREY} stroke={INK} strokeWidth={W} strokeLinejoin="round" />
      <Stamp x={960} y={250} text="NOT A FAIR FIGHT" t={t} at={T("That's not a fair") + 0.2} size={70} rot={-3} />
      <g style={pop(t, T("Right-now you wins almost"))}>
        <Txt x={560} y={420} size={42} color={RED}>
          RIGHT-NOW YOU WINS
        </Txt>
      </g>
    </g>
  );
};

const Designed: SC = ({ t }) => {
  const badges: [string, number, string][] = [
    ["1-TAP BUY", T("One tap to buy"), GOLD],
    ["CARD SAVED", T("Your card already"), BLUE],
    ["ARRIVES TOMORROW", T('"Arrives'), GREEN],
    ["PAY LATER: 4 EASY PAYMENTS", T('"Pay later in four'), "#ff9f6e"],
  ];
  return (
    <g>
      <Txt x={960} y={180} size={56} style={{ opacity: on(t, T("And look at how")) }}>
        BUILT TO MAKE SPENDING EASY
      </Txt>
      <Phone x={560} y={540} s={0.95}>
        <circle cy={-110} r={80} fill={GOLD} stroke={INK} strokeWidth={W} />
        <Txt x={0} y={30} size={50}>
          $40
        </Txt>
        <rect x={-110} y={80} width={220} height={80} rx={40} fill={RED} stroke={INK} strokeWidth={W} />
        <Txt x={0} y={134} size={34} color="#fff">
          BUY
        </Txt>
      </Phone>
      {badges.map(([s, a, c], i) => (
        <g key={i} style={pop(t, a)}>
          <rect x={860} y={290 + i * 115} width={680} height={90} rx={45} fill={c} stroke={INK} strokeWidth={W} />
          <Txt x={1200} y={350 + i * 115} size={s.length > 18 ? 34 : 42}>
            {s}
          </Txt>
        </g>
      ))}
      <g style={pop(t, TW("stop", T("Every one of those")))}>
        <Txt x={1200} y={800} size={46} color={RED}>
          NO MOMENT TO STOP AND THINK
        </Txt>
      </g>
    </g>
  );
};

const PayLater: SC = ({ t }) => {
  const a = T("it hands the cost");
  const fly = inOut((t - a) / 1.6);
  return (
    <g>
      <Stamp x={960} y={210} text="PAY LATER" color={GOLD} t={t} at={T('And "pay later"') + 0.2} size={70} rot={-3} />
      <Person x={480} y={720} s={0.85} mood="happy" />
      <Stranger x={1440} y={720} s={0.85} />
      <g transform={`translate(${560 + 720 * fly} ${560 - 140 * Math.sin(Math.PI * fly)})`}>
        <rect x={-90} y={-55} width={180} height={110} rx={10} fill="#fff" stroke={INK} strokeWidth={W - 1} />
        <Txt x={0} y={-8} size={34}>
          BILL
        </Txt>
        <Txt x={0} y={34} size={30} color={RED}>
          $$$
        </Txt>
      </g>
    </g>
  );
};

const PhoneTalks: SC = ({ t }) => (
  <g>
    <Person x={420} y={720} s={0.85} mood="happy" />
    <Txt x={420} y={410} size={40}>
      RIGHT-NOW SAM
    </Txt>
    <Phone x={900} y={520} s={0.75}>
      <Txt x={0} y={-60} size={56}>
        BUY
      </Txt>
      <Txt x={0} y={20} size={56}>
        NOW
      </Txt>
    </Phone>
    {[0, 1, 2].map((i) => (
      <path key={i} d={`M ${760 - i * 34} ${450 - i * 26} Q ${720 - i * 40} ${520} ${760 - i * 34} ${590 + i * 26}`} fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" style={{ opacity: 0.6 + 0.4 * Math.sin(t * 5 - i) }} />
    ))}
    <g style={{ opacity: on(t, T("Nothing on it")) }}>
      <g style={{ opacity: 0.55 }}>
        <Person x={1460} y={720} s={0.85} mood="neutral" old />
      </g>
      <Txt x={1460} y={410} size={40} color={GREY}>
        FUTURE SAM
      </Txt>
      <Cross x={1180} y={520} s={0.9} />
    </g>
  </g>
);

const Losing: SC = ({ t }) => (
  <g>
    <Person x={1300} y={700} mood="worried" old />
    <g style={pop(t, T("So what is future Sam"))}>
      <Txt x={760} y={420} size={68}>
        WHAT IS
      </Txt>
      <Txt x={760} y={510} size={68}>
        FUTURE SAM
      </Txt>
      <Txt x={760} y={600} size={68} color={RED}>
        LOSING?
      </Txt>
    </g>
  </g>
);

const Year: SC = ({ t }) => {
  const a = T("One $40 delivery");
  return (
    <g>
      <g style={pop(t, a)}>
        <Bill x={640} y={360} s={1.4} />
        <Txt x={1100} y={385} size={80}>
          × 52 WEEKS
        </Txt>
      </g>
      <g style={pop(t, TW("2", a + 1.2))}>
        <Big x={960} y={620} text="= $2,080 A YEAR" size={110} color={RED} />
      </g>
      <g style={{ opacity: on(t, T("Easy to spend")) }}>
        <Txt x={960} y={760} size={44} color={GREY}>
          each one feels small
        </Txt>
      </g>
    </g>
  );
};

// growth chart: $100 a month at an assumed 7%/yr, compounded monthly (see the script's sources)
const fv = (months: number) => {
  const r = 0.07 / 12;
  return months <= 0 ? 0 : (100 * (Math.pow(1 + r, months) - 1)) / r;
};
const CX0 = 380;
const CX1 = 1540;
const CY0 = 790;
const CY1 = 260;
const ax = (age: number) => CX0 + ((age - 25) / 40) * (CX1 - CX0);
const ay = (v: number) => CY0 - (v / 280000) * (CY0 - CY1);
const curve = (start: number, upto: number) => {
  const pts: string[] = [];
  for (let age = start; age <= upto + 1e-6; age += 0.5) pts.push(`${ax(age)},${ay(fv((age - start) * 12))}`);
  return pts.length > 1 ? `M ${pts.join(" L ")}` : "";
};

const Chart: SC = ({ t }) => {
  const a = T("Now picture $100");
  const by65 = T("By 65");
  const g1 = inOut((t - (by65 - 0.4)) / 2.4);
  const s35 = T("Start at 35");
  const g2 = inOut((t - (s35 + 0.3)) / 2.0);
  const gap = T("Waiting ten years");
  return (
    <g>
      <g style={{ opacity: on(t, a) }}>
        <path d={`M ${CX0} ${CY1 - 20} L ${CX0} ${CY0} L ${CX1 + 30} ${CY0}`} fill="none" stroke={INK} strokeWidth={W} strokeLinecap="round" />
        {[25, 35, 45, 55, 65].map((age) => (
          <Txt key={age} x={ax(age)} y={CY0 + 50} size={32} weight={700}>
            {age}
          </Txt>
        ))}
        <Txt x={CX1 + 60} y={CY0 + 50} size={28} weight={700} color={GREY}>
          AGE
        </Txt>
        <Txt x={CX0 + 20} y={160} size={46} anchor="start">
          $100 A MONTH INTO SAVINGS
        </Txt>
      </g>
      <g style={{ opacity: on(t, T("Say it grows")) }}>
        <Txt x={CX0 + 20} y={210} size={30} weight={700} color={GREY} anchor="start">
          assuming 7% a year (not a promise)
        </Txt>
      </g>
      {/* money put in (straight line) */}
      <g style={{ opacity: on(t, TW("put", by65)) }}>
        <path d={`M ${ax(25)} ${ay(0)} L ${ax(65)} ${ay(48000)}`} stroke={GREY} strokeWidth={6} strokeDasharray="14 10" />
        <Txt x={ax(65) - 10} y={ay(48000) + 44} size={32} anchor="end" color={GREY}>
          $48,000 PUT IN
        </Txt>
      </g>
      {/* start at 25 */}
      {g1 > 0 ? <path d={curve(25, 25 + 40 * g1)} fill="none" stroke={GREEN} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" /> : null}
      <g style={pop(t, TW("262", by65))}>
        <circle cx={ax(65)} cy={ay(fv(480))} r={14} fill={GREEN} stroke={INK} strokeWidth={4} />
        <Txt x={ax(65) - 30} y={ay(fv(480)) + 12} size={50} anchor="end" color={GREEN}>
          {fmt(262000)}
        </Txt>
        <Txt x={ax(65) - 30} y={ay(fv(480)) + 52} size={28} anchor="end" weight={700}>
          START AT 25
        </Txt>
      </g>
      {/* start at 35 */}
      {g2 > 0 ? <path d={curve(35, 35 + 30 * g2)} fill="none" stroke={RED} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" /> : null}
      <g style={pop(t, TW("122", s35))}>
        <circle cx={ax(65)} cy={ay(fv(360))} r={14} fill={RED} stroke={INK} strokeWidth={4} />
        <Txt x={ax(65) - 30} y={ay(fv(360)) + 12} size={50} anchor="end" color={RED}>
          {fmt(122000)}
        </Txt>
        <Txt x={ax(65) - 30} y={ay(fv(360)) + 52} size={28} anchor="end" weight={700}>
          START AT 35
        </Txt>
      </g>
      {/* the gap */}
      <g style={{ opacity: on(t, gap + 0.4) }}>
        <path d={`M ${ax(65) + 40} ${ay(fv(480))} L ${ax(65) + 70} ${ay(fv(480))} L ${ax(65) + 70} ${ay(fv(360))} L ${ax(65) + 40} ${ay(fv(360))}`} fill="none" stroke={INK} strokeWidth={6} />
      </g>
      <g style={pop(t, TW("140", gap))}>
        <rect x={ax(45) - 230} y={300} width={460} height={110} rx={20} fill={PAPER} stroke={RED} strokeWidth={10} />
        <Txt x={ax(45)} y={375} size={60} color={RED}>
          -$140,000
        </Txt>
      </g>
    </g>
  );
};

const NeverSees: SC = ({ t }) => {
  const nc = T("So it never counts");
  return (
    <g>
      <Person x={520} y={700} mood="happy" />
      <Txt x={520} y={400} size={44}>
        RIGHT-NOW SAM
      </Txt>
      <g style={{ opacity: 0.35 + 0.65 * (1 - on(t, T("Right-now Sam never"), 0.8)) }}>
        <Big x={1300} y={560} text="$140,000" size={110} color={GREEN} />
      </g>
      <Txt x={1300} y={680} size={36} color={GREY} style={{ opacity: on(t, T("That's the stranger's")) }}>
        future Sam's money
      </Txt>
      <Strike x1={1030} x2={1570} y={525} p={on(t, nc + 0.3, 0.4)} />
      <Stamp x={1300} y={300} text="DOESN'T COUNT" t={t} at={nc + 0.5} size={60} rot={-5} />
    </g>
  );
};

const SeeIt: SC = ({ t }) => {
  const a = T("Which raises");
  return (
    <g>
      <Brain x={960} y={520} s={1.1} />
      <g style={pop(t, TW("see", a + 1))}>
        <ellipse cx={960} cy={470} rx={120} ry={70} fill="#fff" stroke={INK} strokeWidth={W} />
        <circle cx={960} cy={470} r={38} fill={INK} />
        <circle cx={974} cy={456} r={10} fill="#fff" />
      </g>
      <g style={pop(t, a + 0.3)}>
        <Txt x={960} y={200} size={60}>
          CAN YOU MAKE YOUR BRAIN SEE IT?
        </Txt>
      </g>
      <g style={{ opacity: on(t, T("Researchers tried something")) }}>
        {[
          [560, 360],
          [1360, 380],
          [600, 720],
          [1340, 700],
        ].map(([x, y], i) => (
          <StarIcon key={i} x={x} y={y} r={30 + 8 * Math.sin(t * 3 + i)} fill={SOFT} />
        ))}
      </g>
    </g>
  );
};

const Aged: SC = ({ t }) => {
  const a = T("In 2011");
  const b = T("They took photos");
  return (
    <g>
      <g style={pop(t, a + 0.2)}>
        <Txt x={960} y={170} size={60}>
          2011: AGED PHOTOS
        </Txt>
      </g>
      <g style={{ opacity: on(t, TW("photos", b)) }}>
        <PhotoFrame x={560} y={520} rot={-3} />
        <Txt x={560} y={810} size={38}>
          YOU TODAY
        </Txt>
      </g>
      <Arrow x1={790} y1={520} x2={1120} y2={520} p={on(t, TW("aged", b), 0.8)} />
      <g style={{ opacity: on(t, TW("aged", b) + 0.8) }}>
        <PhotoFrame x={1360} y={520} old rot={3} />
        <Txt x={1360} y={810} size={38}>
          DECADES OLDER
        </Txt>
      </g>
    </g>
  );
};

const Slider: React.FC<{ y: number; p: number; label: string }> = ({ y, p, label }) => (
  <g>
    <Txt x={960} y={y - 50} size={36}>
      {label}
    </Txt>
    <rect x={500} y={y - 28} width={920} height={56} rx={28} fill="#fff" stroke={INK} strokeWidth={W} />
    <rect x={512} y={y - 16} width={896 * p} height={32} rx={16} fill={GREEN} />
    <circle cx={512 + 896 * p} cy={y} r={34} fill={GOLD} stroke={INK} strokeWidth={W} />
  </g>
);

const SplitMoney: SC = ({ t }) => {
  const b = T("The people who had just");
  const move = inOut((t - TW("more", b + 2)) / 1.0);
  return (
    <g>
      <Txt x={960} y={200} size={52} style={{ opacity: on(t, T("Then they asked everyone")) }}>
        HOW MUCH GOES TO RETIREMENT?
      </Txt>
      <g style={{ opacity: on(t, T("Then they asked everyone") + 1) }}>
        <Txt x={500} y={300} size={30} anchor="start" color={RED}>
          SPEND NOW
        </Txt>
        <Txt x={1420} y={300} size={30} anchor="end" color={GREEN}>
          SAVE FOR LATER
        </Txt>
        <Slider y={440} p={0.35} label="BEFORE SEEING THEIR OLDER SELF" />
      </g>
      <g style={{ opacity: on(t, b) }}>
        <Slider y={620} p={0.35 + 0.2 * move} label="AFTER SEEING THEIR OLDER SELF" />
      </g>
      <g style={pop(t, TW("more", b + 2) + 0.6)}>
        <Txt x={960} y={760} size={50} color={GREEN}>
          SET ASIDE MORE
        </Txt>
      </g>
    </g>
  );
};

const Caveat: SC = ({ t }) => {
  const a = T("It was a lab");
  const note = (x: number, rot: number, text: string, at: number, c: string) => (
    <g style={pop(t, at)} transform={`rotate(${rot} ${x} 470)`}>
      <rect x={x - 230} y={330} width={460} height={280} fill={c} stroke={INK} strokeWidth={W} />
      <Txt x={x} y={490} size={46}>
        {text}
      </Txt>
    </g>
  );
  return (
    <g>
      {note(620, -4, "LAB EXPERIMENT", TW("lab", a), SOFT)}
      {note(1300, 3, "PRETEND MONEY", TW("hypothetical", a), "#cfe6ff")}
      <Stamp x={960} y={760} text="NOT MAGIC" t={t} at={TW("magic", T("so don't treat"))} size={70} rot={-4} />
    </g>
  );
};

const AFace: SC = ({ t }) => {
  const a = T("But the idea is powerful");
  const love = T("your brain starts to care");
  return (
    <g>
      <Person x={560} y={700} mood="happy" />
      <g style={{ opacity: on(t, TW("face", a)) }}>
        <Person x={1360} y={700} mood="happy" old />
        <Txt x={1360} y={400} size={48}>
          FUTURE YOU
        </Txt>
      </g>
      <g style={pop(t, love + 0.5)}>
        <path d="M 960 560 C 900 500 820 540 860 610 L 960 700 L 1060 610 C 1100 540 1020 500 960 560 Z" fill={RED} stroke={INK} strokeWidth={W} strokeLinejoin="round" />
      </g>
      <Txt x={960} y={230} size={56} style={{ opacity: on(t, TW("face", a)) }}>
        GIVE FUTURE YOU A FACE
      </Txt>
    </g>
  );
};

const NoPhoto: SC = ({ t }) => (
  <g>
    <PhotoFrame x={960} y={500} old />
    <g style={{ opacity: on(t, TW("photo", T("But the biggest")) + 0.2, 0.2) }}>
      <Cross x={960} y={500} s={3} />
    </g>
    <Txt x={960} y={800} size={50} style={{ opacity: on(t, T("But the biggest")) }}>
      THE BIGGEST RESULT
    </Txt>
  </g>
);

const Economists: SC = ({ t }) => {
  const a = T("Two economists");
  return (
    <g>
      <g style={pop(t, TW("Thaler", a))}>
        <Person x={620} y={700} s={0.9} mood="happy" shirt="#4a5a8a" />
        <rect x={430} y={330} width={380} height={80} rx={14} fill="#fff" stroke={INK} strokeWidth={5} />
        <Txt x={620} y={384} size={40}>
          RICHARD THALER
        </Txt>
      </g>
      <g style={pop(t, TW("Shlomo", a))}>
        <Person x={1300} y={700} s={0.9} mood="happy" shirt="#7a5a3a" />
        <rect x={1090} y={330} width={420} height={80} rx={14} fill="#fff" stroke={INK} strokeWidth={5} />
        <Txt x={1300} y={384} size={40}>
          SHLOMO BENARTZI
        </Txt>
      </g>
      <Txt x={960} y={200} size={52} style={{ opacity: on(t, a) }}>
        TWO ECONOMISTS
      </Txt>
    </g>
  );
};

const Paycheck: React.FC<{ x: number; y: number; s?: number; cut?: number }> = ({ x, y, s = 1, cut = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-260} y={-120} width={520} height={240} rx={16} fill="#e8f7ee" stroke={INK} strokeWidth={W} />
    <Txt x={-230} y={-60} size={34} anchor="start">
      PAYCHECK
    </Txt>
    <rect x={-230} y={-20} width={300} height={14} rx={7} fill={GREY} />
    <rect x={-230} y={20} width={220} height={14} rx={7} fill={GREY} />
    <Txt x={220} y={70} size={64} anchor="end">
      $$$
    </Txt>
    {cut > 0 ? <rect x={260 - 160 * cut} y={-120} width={160 * cut} height={240} fill={PAPER} /> : null}
  </g>
);

const LossToday: SC = ({ t }) => {
  const b = T("Taking money out");
  const cut = inOut((t - b) / 0.8);
  return (
    <g>
      <Txt x={960} y={200} size={56} style={{ opacity: on(t, T("They noticed")) }}>
        PEOPLE HATE A LOSS TODAY
      </Txt>
      <Paycheck x={760} y={500} cut={cut} />
      <Meter x={1440} y={560} p={0.85 * inOut((t - b - 0.3) / 1.0)} label="PAIN" />
    </g>
  );
};

const SMT: SC = ({ t }) => {
  const a = T("So they designed");
  const n = T("Instead of asking");
  const l = T("they asked them to agree");
  const s = T("a slice of every");
  return (
    <g>
      <g style={pop(t, a + 0.2)}>
        <rect x={500} y={130} width={920} height={130} rx={30} fill={GOLD} stroke={INK} strokeWidth={W} />
        <Txt x={960} y={218} size={72}>
          SAVE MORE TOMORROW
        </Txt>
      </g>
      <g style={pop(t, n + 0.3)}>
        <Txt x={600} y={420} size={56}>
          SAVE MORE NOW
        </Txt>
        <Cross x={600} y={510} s={0.9} />
      </g>
      <g style={pop(t, l + 0.4)}>
        <Txt x={1320} y={420} size={56}>
          SAVE MORE LATER
        </Txt>
        <Check x={1320} y={510} s={1} />
      </g>
      <g style={pop(t, s)}>
        <Arrow x1={760} y1={790} x2={1060} y2={790} />
        <Txt x={640} y={805} size={40}>
          RAISE
        </Txt>
        <circle cx={1190} cy={780} r={70} fill="#fff" stroke={INK} strokeWidth={W} />
        <path d="M 1190 780 L 1190 710 A 70 70 0 0 1 1256 757 Z" fill={GOLD} stroke={INK} strokeWidth={5} />
        <Txt x={1400} y={795} size={36}>
          A SLICE
        </Txt>
      </g>
    </g>
  );
};

const NoCost: SC = ({ t }) => {
  const a = T("Saying yes");
  const g = T("Savings only grew");
  // pay over 6 periods; raises at periods 2 and 4; the savings slice only grows when a raise lands
  const pay = [3, 3, 3.6, 3.6, 4.2, 4.2];
  const save = [0, 0, 0.3, 0.3, 0.6, 0.6];
  const shown = clamp((t - g) / 1.8) * 6;
  return (
    <g>
      <Txt x={960} y={180} size={52} style={{ opacity: on(t, a) }}>
        SAYING YES COST NOTHING TODAY
      </Txt>
      <path d="M 420 800 L 1520 800" stroke={INK} strokeWidth={W} strokeLinecap="round" />
      {pay.map((p, i) => {
        const vis = i < 2 ? on(t, a + 0.3 * i) : clamp(shown - i + 1);
        const x = 470 + i * 175;
        const h = p * 100;
        const s = save[i] * 100;
        return (
          <g key={i} style={{ opacity: vis }}>
            <rect x={x} y={800 - h} width={120} height={h} rx={10} fill={GREEN} stroke={INK} strokeWidth={5} />
            {s > 0 ? <rect x={x} y={800 - h} width={120} height={s} rx={10} fill={GOLD} stroke={INK} strokeWidth={5} /> : null}
            {i === 2 || i === 4 ? (
              <Txt x={x + 60} y={800 - h - 20} size={30}>
                RAISE
              </Txt>
            ) : null}
          </g>
        );
      })}
      <g style={pop(t, T("Their paycheck never"))}>
        <Txt x={960} y={250} size={38} color={GREEN}>
          PAYCHECK NEVER SHRANK
        </Txt>
      </g>
      <g style={{ opacity: on(t, g + 1.2) }}>
        <rect x={430} y={330} width={34} height={34} rx={6} fill={GOLD} stroke={INK} strokeWidth={4} />
        <Txt x={480} y={360} size={34} anchor="start">
          = savings
        </Txt>
      </g>
    </g>
  );
};

const Joined: SC = ({ t }) => {
  const a = T("78%");
  const n = Math.round(78 * ease((t - a) / 1.0));
  return (
    <g>
      <Txt x={960} y={230} size={48} style={{ opacity: on(t, T("At the first company")) }}>
        AT THE FIRST COMPANY THAT TRIED IT
      </Txt>
      <g style={{ opacity: on(t, a - 0.1) }}>
        <Big x={960} y={600} text={`${Math.max(0, n)}%`} size={260} color={GREEN} />
        <Txt x={960} y={720} size={52}>
          OF THOSE OFFERED JOINED
        </Txt>
      </g>
    </g>
  );
};

const Rate: SC = ({ t }) => {
  const a = T("Their average savings");
  const b1 = ease((t - TW("3", a)) / 0.6);
  const b2 = ease((t - TW("13", a)) / 1.4);
  const H = 440 / 13.6;
  return (
    <g>
      <Txt x={960} y={180} size={52} style={{ opacity: on(t, a) }}>
        AVERAGE SAVINGS RATE
      </Txt>
      <path d="M 520 800 L 1400 800" stroke={INK} strokeWidth={W} strokeLinecap="round" />
      <g style={{ opacity: on(t, TW("3", a)) }}>
        <rect x={600} y={800 - 3.5 * H * b1} width={220} height={3.5 * H * b1} rx={12} fill={GREY} stroke={INK} strokeWidth={5} />
        <Txt x={710} y={800 - 3.5 * H - 30} size={60}>
          3.5%
        </Txt>
        <Txt x={710} y={860} size={34}>
          BEFORE
        </Txt>
      </g>
      <g style={{ opacity: on(t, TW("13", a)) }}>
        <rect x={1100} y={800 - 13.6 * H * b2} width={220} height={13.6 * H * b2} rx={12} fill={GREEN} stroke={INK} strokeWidth={5} />
        <Txt x={1210} y={800 - 13.6 * H * b2 - 30} size={60} color={GREEN}>
          13.6%
        </Txt>
        <Txt x={1210} y={860} size={34}>
          40 MONTHS LATER
        </Txt>
      </g>
      <Arrow x1={850} y1={560} x2={1060} y2={430} p={on(t, TW("13", a), 0.6)} color={GREEN} />
    </g>
  );
};

const SameBrains: SC = ({ t }) => {
  const w = T("They just stopped");
  return (
    <g>
      <g style={{ opacity: on(t, T("Same people.")) }}>
        <Person x={560} y={700} s={0.85} mood="neutral" />
        <Person x={1360} y={700} s={0.85} mood="happy" />
        <Txt x={960} y={600} size={60}>
          =
        </Txt>
      </g>
      <g style={pop(t, T("Same brains."))}>
        <Brain x={960} y={330} s={0.6} />
      </g>
      <g style={{ opacity: on(t, w) }}>
        <Txt x={960} y={800} size={64}>
          WILLPOWER
        </Txt>
        <Strike x1={740} x2={1180} y={780} p={on(t, TW("willpower", w) + 0.3, 0.4)} />
      </g>
    </g>
  );
};

const NotEnough: SC = ({ t }) => (
  <g>
    <Person x={620} y={700} mood="worried" />
    <g style={pop(t, TW("earn", T("Maybe you're thinking")) - 0.6)}>
      <Bubble x={1220} y={400} w={600} h={140}>
        <Txt x={1220} y={418} size={44}>
          I don't earn enough.
        </Txt>
      </Bubble>
    </g>
    <g style={pop(t, T("Fair."))}>
      <Txt x={1220} y={640} size={60} color={GREEN}>
        FAIR.
      </Txt>
    </g>
  </g>
);

const Small25: SC = ({ t }) => {
  const a = T("$25 a paycheck");
  const b = T("If you're paid");
  const c = T("that's $650");
  return (
    <g>
      <Txt x={960} y={190} size={60} style={{ opacity: on(t, T("So start smaller")) }}>
        START SMALLER THAN FEELS USEFUL
      </Txt>
      <g style={pop(t, a)}>
        <Coin x={560} y={480} r={120} label="$25" />
        <Txt x={560} y={680} size={40}>
          A PAYCHECK
        </Txt>
      </g>
      <g style={pop(t, TW("two", b))}>
        <Txt x={960} y={500} size={80}>
          × 26
        </Txt>
        <Txt x={960} y={560} size={30} weight={700} color={GREY}>
          paid every 2 weeks
        </Txt>
      </g>
      <g style={pop(t, TW("650", c))}>
        <Jar x={1380} y={560} label="$650" />
        <Txt x={1380} y={760} size={40}>
          A YEAR
        </Txt>
      </g>
    </g>
  );
};

const Habit: SC = ({ t }) => {
  const a = T("The amount matters");
  const g = T("Save More Tomorrow worked");
  const grow = (k: number) => clamp((t - g - 1.2 - k * 0.7) / 0.5);
  return (
    <g>
      <g style={pop(t, a + 0.3)}>
        <Big x={960} y={230} text="HABIT  >  AMOUNT" size={100} color={GOLD} />
      </g>
      <g style={{ opacity: on(t, g) }}>
        <path d="M 420 800 L 1500 800" stroke={INK} strokeWidth={W} strokeLinecap="round" />
        {[0, 1, 2, 3, 4].map((k) => {
          const h = 60 + k * 70;
          return <rect key={k} x={480 + k * 200} y={800 - h * grow(k)} width={140} height={h * grow(k)} rx={10} fill={GREEN} stroke={INK} strokeWidth={5} style={{ opacity: grow(k) > 0 ? 1 : 0 }} />;
        })}
      </g>
      <g style={pop(t, TW("bigger", T("Once the habit")))}>
        <Txt x={1300} y={420} size={46} color={GREEN}>
          THEN MAKE IT BIGGER
        </Txt>
      </g>
    </g>
  );
};

const Autopilot: SC = ({ t }) => {
  const a = T("Call it the Autopilot");
  return (
    <g>
      <Txt x={960} y={260} size={52} style={{ opacity: on(t, T("So here's the fix")) }}>
        THE FIX
      </Txt>
      <g style={pop(t, TW("Autopilot", a))}>
        <rect x={420} y={340} width={1080} height={200} rx={40} fill={GOLD} stroke={INK} strokeWidth={W} />
        <Txt x={960} y={475} size={100}>
          THE AUTOPILOT RULE
        </Txt>
      </g>
      <g style={pop(t, T("never make saving"))}>
        <Txt x={960} y={660} size={50}>
          Never make saving a decision
        </Txt>
        <Txt x={960} y={730} size={50}>
          you have to make again.
        </Txt>
      </g>
    </g>
  );
};

const Vote: SC = ({ t }) => {
  const a = T("Every time saving is a choice");
  const win2 = T("And right-now you wins.");
  const away = T("So take the choice away");
  return (
    <g>
      <g style={{ opacity: 1 - on(t, away + 0.5) * 0.6 }}>
        <rect x={760} y={500} width={400} height={300} rx={20} fill="#fff" stroke={INK} strokeWidth={W} />
        <rect x={880} y={490} width={160} height={24} rx={8} fill={INK} />
        <Txt x={960} y={680} size={54}>
          VOTE
        </Txt>
      </g>
      <g style={{ opacity: on(t, TW("vote", a)) }}>
        <Person x={460} y={720} s={0.8} mood="happy" />
        <Txt x={460} y={440} size={40}>
          RIGHT-NOW YOU
        </Txt>
      </g>
      <g style={{ opacity: on(t, TW("vote", a)) }}>
        <Person x={1460} y={720} s={0.8} mood="worried" old />
        <Txt x={1460} y={440} size={40}>
          FUTURE YOU
        </Txt>
      </g>
      <Stamp x={460} y={300} text="WINS" t={t} at={TW("wins", win2)} size={60} rot={-6} color={RED} />
      <g style={{ opacity: on(t, away + 0.4, 0.3) }}>
        <Cross x={960} y={640} s={2.2} />
        <Txt x={960} y={250} size={56}>
          TAKE THE CHOICE AWAY
        </Txt>
      </g>
    </g>
  );
};

const StepHead: React.FC<{ n: number; title: string; t: number; at: number }> = ({ n, title, t, at }) => (
  <g style={{ opacity: on(t, at) }}>
    <circle cx={330} cy={200} r={60} fill={GOLD} stroke={INK} strokeWidth={W} />
    <Txt x={330} y={226} size={72}>
      {n}
    </Txt>
    <Txt x={420} y={222} size={58} anchor="start">
      {title}
    </Txt>
  </g>
);

const Step1: SC = ({ t }) => {
  const a = T("One:");
  const flow = clamp((t - TW("transfer", a + 0.5)) / 1.4);
  return (
    <g>
      <StepHead n={1} title="AUTOMATIC TRANSFER ON PAYDAY" t={t} at={a} />
      <g style={{ opacity: on(t, TW("paycheck", a + 0.5)) }}>
        <Paycheck x={600} y={520} s={0.8} />
        <Txt x={600} y={700} size={36}>
          PAYDAY
        </Txt>
      </g>
      <Arrow x1={840} y1={520} x2={1120} y2={520} p={on(t, TW("transfer", a + 0.5), 0.6)} />
      <Txt x={980} y={490} size={30} style={{ opacity: on(t, TW("transfer", a + 0.5)) }}>
        AUTO
      </Txt>
      {flow > 0 && flow < 1 ? <Coin x={860 + 260 * flow} y={600} r={34} /> : null}
      <g style={{ opacity: on(t, TW("savings", a + 0.5)) }}>
        <Jar x={1320} y={560} />
      </g>
      <g style={pop(t, T("Even $25"))}>
        <Txt x={960} y={820} size={44} color={GREEN}>
          EVEN $25 A PAYCHECK COUNTS
        </Txt>
      </g>
    </g>
  );
};

const Step2: SC = ({ t }) => {
  const a = T("Two: pre-commit");
  const s = T("send part of it");
  const fly = inOut((t - s) / 1.2);
  return (
    <g>
      <StepHead n={2} title="PRE-COMMIT YOUR RAISES" t={t} at={a} />
      <g style={{ opacity: on(t, T("Next time you get one")) }}>
        <rect x={500} y={560} width={160} height={240} rx={12} fill={GREEN} stroke={INK} strokeWidth={5} />
        <rect x={720} y={460} width={160} height={340} rx={12} fill={GREEN} stroke={INK} strokeWidth={5} />
        <Arrow x1={600} y1={500} x2={760} y2={400} color={GREEN} />
        <Txt x={800} y={380} size={36}>
          RAISE
        </Txt>
      </g>
      {t > s ? <rect x={720 + 540 * fly} y={460 + 120 * fly} width={160} height={100} rx={12} fill={GOLD} stroke={INK} strokeWidth={5} /> : null}
      <g style={{ opacity: on(t, s) }}>
        <Jar x={1340} y={620} />
      </g>
      <g style={pop(t, T("before you get used"))}>
        <Txt x={960} y={860} size={40} color={GREY}>
          before you get used to it
        </Txt>
      </g>
    </g>
  );
};

const Step3: SC = ({ t }) => {
  const a = T("Three: give future");
  const r = T("Rename your savings");
  const typed = "Future Me";
  const k = Math.floor(clamp((t - TW("Future", r + 0.5)) / 0.8) * typed.length);
  const renamed = t > TW("Future", r + 0.5);
  return (
    <g>
      <StepHead n={3} title="GIVE FUTURE YOU A FACE" t={t} at={a} />
      <g style={{ opacity: on(t, r) }}>
        <Phone x={760} y={560} s={0.95}>
          <Txt x={0} y={-200} size={30} weight={700} color={GREY}>
            MY ACCOUNTS
          </Txt>
          <rect x={-120} y={-160} width={240} height={90} rx={14} fill="#f1f3f8" stroke={INK} strokeWidth={4} />
          <Txt x={-100} y={-104} size={30} anchor="start">
            Checking
          </Txt>
          <rect x={-120} y={-50} width={240} height={90} rx={14} fill={renamed ? "#fff4d6" : "#f1f3f8"} stroke={INK} strokeWidth={4} />
          <Txt x={-100} y={6} size={30} anchor="start">
            {renamed ? typed.slice(0, Math.max(1, k)) : "Savings"}
          </Txt>
        </Phone>
      </g>
      <g style={pop(t, T("It sounds silly") + 0.8)}>
        <Person x={1360} y={720} s={0.85} mood="happy" old />
        <Txt x={1360} y={420} size={42}>
          A PERSON, NOT A STRANGER
        </Txt>
      </g>
    </g>
  );
};

const Step4: SC = ({ t }) => {
  const a = T("Four: make spending");
  const d = T("Delete your saved card");
  const del = on(t, TW("Delete", d) + 0.3, 0.5);
  const ex = T("That one extra step");
  return (
    <g>
      <StepHead n={4} title="MAKE SPENDING ONE STEP SLOWER" t={t} at={a} />
      <Phone x={760} y={560} s={0.95}>
        <Txt x={0} y={-190} size={32} weight={700}>
          CHECKOUT
        </Txt>
        <g style={{ opacity: 1 - del }}>
          <rect x={-120} y={-150} width={240} height={110} rx={14} fill={BLUE} stroke={INK} strokeWidth={4} />
          <Txt x={0} y={-82} size={30} color="#fff">
            SAVED CARD
          </Txt>
        </g>
        <Txt x={0} y={-80} size={28} color={RED} style={{ opacity: del * (1 - on(t, ex)) }}>
          CARD REMOVED
        </Txt>
        <g style={{ opacity: on(t, ex) }}>
          <rect x={-120} y={-150} width={240} height={60} rx={10} fill="#fff" stroke={INK} strokeWidth={4} />
          <Txt x={-100} y={-110} size={24} weight={600} anchor="start" color={GREY}>
            Card number
          </Txt>
          <rect x={-120} y={-75} width={240} height={60} rx={10} fill="#fff" stroke={INK} strokeWidth={4} />
          <Txt x={-100} y={-35} size={24} weight={600} anchor="start" color={GREY}>
            Expiry, CVC
          </Txt>
        </g>
      </Phone>
      <g style={{ opacity: on(t, TW("future", ex)) }}>
        <Person x={1360} y={720} s={0.85} mood="happy" old />
        <Bubble x={1360} y={300} w={300} h={110}>
          <Txt x={1360} y={320} size={50}>
            Hm...
          </Txt>
        </Bubble>
      </g>
    </g>
  );
};

const NotBroken: SC = ({ t }) => {
  const a = T("Your brain isn't broken");
  const b = T("take care of the person");
  return (
    <g>
      <Brain x={720} y={480} s={1.0} />
      <g style={pop(t, a + 0.5)}>
        <Check x={720} y={760} s={1.3} />
      </g>
      <Txt x={720} y={190} size={56} style={{ opacity: on(t, a) }}>
        NOT BROKEN
      </Txt>
      <g style={{ opacity: on(t, TW("person", b)) }}>
        <circle cx={1360} cy={560} r={260} fill={SOFT} fillOpacity={0.5} />
        <Person x={1360} y={720} s={0.8} mood="happy" />
        <Txt x={1360} y={240} size={40}>
          THE PERSON IT CAN SEE
        </Txt>
      </g>
    </g>
  );
};

const LetItSee: SC = ({ t }) => {
  const a = T("So let it see");
  const m = inOut((t - a) / 1.6);
  return (
    <g>
      <circle cx={960 - 330 + 120 * m} cy={560} r={300} fill={GOLD} fillOpacity={0.3} stroke={INK} strokeWidth={5} />
      <circle cx={960 + 330 - 120 * m} cy={560} r={300} fill={BLUE} fillOpacity={0.25} stroke={INK} strokeWidth={5} />
      <Person x={960 - 330 + 120 * m} y={720} s={0.8} mood="happy" />
      <Person x={960 + 330 - 120 * m} y={720} s={0.8} mood="happy" old />
    </g>
  );
};

const Finale: SC = ({ t }) => {
  const a = T("Because the person");
  const you = T("It's you.");
  const later = T("Just a little later");
  return (
    <g>
      <circle cx={750} cy={560} r={300} fill={GOLD} fillOpacity={0.3} stroke={INK} strokeWidth={5} />
      <circle cx={1170} cy={560} r={300} fill={BLUE} fillOpacity={0.25} stroke={INK} strokeWidth={5} />
      <Person x={750} y={720} s={0.8} mood="happy" />
      <Person x={1170} y={720} s={0.8} mood="happy" old hands={[[-95, 10], [120, -150]]} />
      <g style={{ opacity: on(t, TW("stranger", a)) * (1 - on(t, you)) }}>
        <Txt x={1170} y={210} size={52}>
          NOT A STRANGER
        </Txt>
      </g>
      <g style={pop(t, you)}>
        <Big x={1170} y={175} text="YOU" size={90} color={GOLD} />
      </g>
      <g style={pop(t, later)}>
        <Txt x={1170} y={235} size={42}>
          JUST A LITTLE LATER
        </Txt>
      </g>
    </g>
  );
};

const SCENES: [string, SC][] = [
  ["You spend", Intro],
  ["Think about it.", Order],
  ["But moving", Pain],
  ["Most people", Discipline],
  ["But that's not", Nope],
  ["The real reason", Weirder],
  ["Your brain thinks", StrangerScene],
  ["In this video", Roadmap],
  ["Meet Sam.", MeetSam],
  ["And every month", Month],
  ["Sam isn't bad", Normal],
  ["And to understand", InsideHead],
  ["In 2009", Scanner],
  ["Themselves today.", FourPeople],
  ["When people thought", Lights],
  ["And when they thought about themselves ten", FutureBrain],
  ["To your brain", SomeoneElse],
  ["Here's the part", Patience],
  ["So when Sam skips", Choice],
  ["So how far away", HowFar],
  ["Picture two circles", Circles],
  ["Researchers used a test", Study153],
  ["So if your circles", Distance],
  ["But first,", Versus],
  ["Why does spending", Easy],
  ["Saving is the opposite", Opposite],
  ["That's not a fair", Unfair],
  ["And look at how", Designed],
  ['And "pay later"', PayLater],
  ["Sam's phone is built", PhoneTalks],
  ["So what is future Sam", Losing],
  ["One $40 delivery", Year],
  ["Now picture $100", Chart],
  ["That's the stranger's", NeverSees],
  ["Which raises", SeeIt],
  ["In 2011", Aged],
  ["Then they asked everyone", SplitMoney],
  ["It was a lab", Caveat],
  ["But the idea is powerful", AFace],
  ["But the biggest", NoPhoto],
  ["Two economists", Economists],
  ["They noticed", LossToday],
  ["So they designed", SMT],
  ["Saying yes", NoCost],
  ["At the first company", Joined],
  ["Their average savings", Rate],
  ["Same people.", SameBrains],
  ["Maybe you're thinking", NotEnough],
  ["So start smaller", Small25],
  ["The amount matters", Habit],
  ["So here's the fix", Autopilot],
  ["Every time saving is a choice", Vote],
  ["One:", Step1],
  ["Two: pre-commit", Step2],
  ["Three: give future", Step3],
  ["Four: make spending", Step4],
  ["Your brain isn't broken", NotBroken],
  ["So let it see", LetItSee],
  ["Because the person", Finale],
];
// scene i runs from just before its line to just before the next scene's line
const RANGES = SCENES.map(([p], i) => [i === 0 ? 0 : T(p) - 0.25, i + 1 < SCENES.length ? T(SCENES[i + 1][0]) - 0.25 : END] as const);

/** the end card after the last line: the channel's profile picture */
const EndCard: React.FC<{ t: number }> = ({ t }) => {
  const o = on(t, T("Just a little later") + 1.6, 0.5);
  if (o <= 0) return null;
  return (
    <AbsoluteFill style={{ background: PAPER, opacity: o, alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 40 }}>
      <Img src={staticFile("coinflip/pfp.png")} style={{ width: 420, height: 420, borderRadius: "50%", border: `8px solid ${INK}`, transform: `scale(${0.94 + 0.06 * o})` }} />
      <div style={{ fontFamily: "Poppins", fontWeight: 800, fontSize: 80, color: INK }}>COINFLIP MIND</div>
    </AbsoluteFill>
  );
};

// sound effects on the visual beats they belong to (same anchors as the scenes); quiet, under the voice
type Sfx = "pop" | "tick" | "swoosh" | "cash" | "tap";
const SFX_VOL: Record<Sfx, number> = { pop: 0.18, tick: 0.22, swoosh: 0.16, cash: 0.2, tap: 0.25 };
const sfxEvents = (): [number, Sfx][] => {
  const pause = T("Seriously.") + 0.5;
  const ev: [number, Sfx][] = [
    [1.4, "swoosh"],
    [T("Why does"), "pop"],
    [T("Tap, tap") + 0.05, "tap"],
    [T("Tap, tap") + 0.35, "tap"],
    [TW("stranger", T("Your brain thinks")), "pop"],
    [T("But that's not") + 0.9, "pop"],
    [TW("brain", T("In this video")), "pop"],
    [T("A five-second"), "pop"],
    [T("The trick"), "pop"],
    [T("And one rule"), "pop"],
    [T("this month, I'll save"), "pop"],
    [TW("nothing", T("By the 30th")), "pop"],
    [T("Sam is normal"), "pop"],
    [T("Themselves today."), "pop"],
    [T("Themselves in ten"), "pop"],
    [T("A celebrity today."), "pop"],
    [T("And that same celebrity"), "pop"],
    [TW("someone", T("To your brain")), "pop"],
    [TW("lazy", T("So when Sam skips")), "pop"],
    [T("It takes five"), "pop"],
    [pause, "tick"],
    [pause + 1, "tick"],
    [pause + 2, "tick"],
    [TW("shrunk", T("And distance can")), "swoosh"],
    [TW("fight", T("you need to see")), "pop"],
    [TW("instant", T("Because the reward")), "pop"],
    [TW("reward", T("You give something")), "swoosh"],
    [T("That's not a fair") + 0.2, "pop"],
    [T("One tap to buy"), "pop"],
    [T("Your card already"), "pop"],
    [T('"Arrives'), "pop"],
    [T('"Pay later in four'), "pop"],
    [T("it hands the cost"), "swoosh"],
    [TW("2", T("One $40 delivery") + 1.2), "pop"],
    [TW("262", T("By 65")), "cash"],
    [TW("140", T("Waiting ten years")), "pop"],
    [T("So it never counts") + 0.5, "pop"],
    [T("so don't treat") + 0.4, "pop"],
    [T("So they designed") + 0.2, "pop"],
    [T("78%"), "cash"],
    [TW("13", T("Their average savings")), "cash"],
    [TW("650", T("that's $650")), "cash"],
    [TW("Autopilot", T("Call it the Autopilot")), "pop"],
    [TW("wins", T("And right-now you wins.")), "pop"],
    [TW("transfer", T("One:") + 0.5), "swoosh"],
    [T("send part of it"), "swoosh"],
    [T("It's you."), "pop"],
  ];
  return ev.sort((a, b) => a[0] - b[0]);
};
const SFX = sfxEvents();

export const Ep1: React.FC<{ audio?: boolean }> = ({ audio = true }) => {
  const ready = useFonts();
  const t = useCurrentFrame() / EP1_FPS;
  if (!ready) return <AbsoluteFill style={{ background: PAPER }} />;
  return (
    <AbsoluteFill style={{ background: PAPER, fontFamily: "Poppins" }}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080">
        <g transform="translate(960 540) scale(1.26) translate(-960 -480)">
          {SCENES.map(([, S], i) => {
            const [a, b] = RANGES[i];
            const op = i === 0 ? clamp((b - t) / 0.25) : win(t, a, b);
            // slow push-in across each scene (about 3%) so no shot sits frozen
            const k = 1 + 0.03 * clamp((t - a) / Math.max(1, b - a));
            return op > 0 ? (
              <g key={i} style={{ opacity: op }} transform={`translate(960 480) scale(${k}) translate(-960 -480)`}>
                <S t={t} />
              </g>
            ) : null;
          })}
        </g>
      </svg>
      <EndCard t={t} />
      {audio ? <Audio src={staticFile("coinflip/coinflip-ep1-vo.wav")} /> : null}
      {audio
        ? SFX.map(([at, k], i) => (
            <Sequence key={i} from={Math.round(at * EP1_FPS)} durationInFrames={30}>
              <Audio src={staticFile(`coinflip/sfx/${k}.wav`)} volume={SFX_VOL[k]} />
            </Sequence>
          ))
        : null}
    </AbsoluteFill>
  );
};
