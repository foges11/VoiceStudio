// Coinflip Mind, Video 2: "Why $9.99 Works on Your Brain" (16:9, 1920×1080, ~7:37).
// Same doodle look as Ep1, upgraded: things slide into place instead of only popping, characters gesture and stand on
// soft shadows, a recurring "brain filing cabinet" ties the studies together, and each chapter is named on screen.
// Every beat is timed from the voice-over (ep2-caps.json = script lines aligned to the VO, ep2-words.json = word times).
import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, staticFile, useCurrentFrame } from "remotion";
import { useFonts } from "../inkbeat/core/frame";
import CAPS_JSON from "./ep2-caps.json";
import WORDS_JSON from "./ep2-words.json";
import EV_JSON from "./ev.json";
import { Arrow, Card, Check, Coin, Cross, Stamp, StarIcon, Strike, Txt } from "./Ep1";
import { Big, Brain, clamp, ease, GOLD, GREEN, INK, inOut, on, PAPER, Person, RED, SKIN, W, win } from "./Ep1Test";

export const EP2_FPS = 30;
const CAPS = CAPS_JSON as unknown as [number, number, string][];
const WORDS = WORDS_JSON as unknown as [string, number, number][];
const END = 473.4;
export const EP2_FRAMES = Math.ceil(END * EP2_FPS);

const BLUE = "#6c8cff";
const GREY = "#9aa3b5";
const SOFT = "#ffe08a";
const NIGHT = "#2b2f4a";

const T = (p: string) => {
  const c = CAPS.find((x) => x[2].startsWith(p));
  if (!c) throw new Error(`no caption starts with "${p}"`);
  return c[0];
};
const TW = (w: string, after: number) => {
  const x = WORDS.find((y) => y[1] >= after - 0.05 && y[0].toLowerCase().includes(w.toLowerCase()));
  if (!x) throw new Error(`no word "${w}" after ${after}`);
  return x[1];
};

type SC = React.FC<{ t: number }>;
type XY = [number, number];

// ------------------------------------------------------------------ motion helpers
/** slides in from (dx,dy) and fades in at `at`; optional fade out at `out` */
const In: React.FC<{ t: number; at: number; dx?: number; dy?: number; d?: number; out?: number; children: React.ReactNode }> = ({ t, at, dx = 0, dy = 40, d = 0.45, out, children }) => {
  const e = ease((t - at) / d);
  const o = e * (out === undefined ? 1 : clamp((out - t) / 0.3));
  if (o <= 0) return null;
  return (
    <g opacity={o} transform={`translate(${dx * (1 - e)} ${dy * (1 - e)})`}>
      {children}
    </g>
  );
};
/** gentle idle bob so nothing sits frozen */
const bob = (t: number, k = 0, a = 6) => a * Math.sin(t * 1.7 + k);

/** a joke cut-in: covers the scene with paper for [a, b) */
const Cut: React.FC<{ t: number; a: number; b: number; children: React.ReactNode }> = ({ t, a, b, children }) => {
  const o = clamp((t - a) / 0.2) * clamp((b - t) / 0.2);
  if (o <= 0) return null;
  return (
    <g opacity={o}>
      <rect x={-200} y={-200} width={2320} height={1480} fill={PAPER} />
      {children}
    </g>
  );
};

// ------------------------------------------------------------------ drawing pieces
const POSES: Record<string, [XY, XY]> = {
  rest: [
    [-95, 10],
    [95, 10],
  ],
  phone: [
    [-90, 20],
    [110, -40],
  ],
  wave: [
    [-95, 10],
    [125, -160],
  ],
  point: [
    [-95, 10],
    [165, -95],
  ],
  shrug: [
    [-125, -105],
    [125, -105],
  ],
  chin: [
    [-95, 10],
    [35, -125],
  ],
  cross: [
    [45, -45],
    [-45, -60],
  ],
  up: [
    [-130, -170],
    [130, -170],
  ],
  bags: [
    [-110, 40],
    [110, 40],
  ],
};
/** the "you" character on a soft ground shadow */
export const Guy: React.FC<{ x: number; y: number; s?: number; mood?: "happy" | "neutral" | "strain" | "worried" | "shocked"; pose?: keyof typeof POSES; old?: boolean; shirt?: string; children?: React.ReactNode }> = ({
  x,
  y,
  s = 1,
  mood = "neutral",
  pose = "rest",
  old,
  shirt,
  children,
}) => (
  <g>
    <ellipse cx={x} cy={y + 152 * s} rx={110 * s} ry={18 * s} fill={INK} opacity={0.12} />
    <Person x={x} y={y} s={s} mood={mood} hands={POSES[pose]} old={old} shirt={shirt}>
      {children}
    </Person>
  </g>
);
const PhoneInHand: React.FC = () => (
  <g>
    <rect x={92} y={-130} width={70} height={120} rx={14} fill={INK} transform="rotate(10 127 -70)" />
    <rect x={100} y={-120} width={54} height={92} rx={8} fill="#7ad7ff" transform="rotate(10 127 -70)" />
  </g>
);

/** a price tag; `first` 0..1 makes the first digit grow and the rest fade (the left-digit effect, drawn) */
export const Tag: React.FC<{ x: number; y: number; text: string; s?: number; rot?: number; first?: number; fill?: string; color?: string }> = ({ x, y, text, s = 1, rot = 0, first = 0, fill = "#fff", color = INK }) => {
  const w = 120 + text.length * 62;
  const i = text.search(/[0-9]/);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <path d={`M ${-w / 2 - 50} 0 L ${-w / 2} -70 L ${w / 2} -70 L ${w / 2} 70 L ${-w / 2} 70 Z`} fill={fill} stroke={INK} strokeWidth={W} strokeLinejoin="round" />
      <circle cx={-w / 2 - 12} cy={0} r={13} fill={PAPER} stroke={INK} strokeWidth={5} />
      <text x={25} y={34} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={100} fill={color}>
        <tspan>{text.slice(0, i)}</tspan>
        <tspan fill={first > 0 ? RED : color} fontSize={100 * (1 + 0.35 * first)}>
          {text[i]}
        </tspan>
        <tspan opacity={1 - 0.75 * first}>{text.slice(i + 1)}</tspan>
      </text>
    </g>
  );
};

/** the brain's filing cabinet: two labelled drawers, the left one can open */
const Cabinet: React.FC<{ x: number; y: number; a: string; b: string; openA?: number; openB?: number; s?: number }> = ({ x, y, a, b, openA = 0, openB = 0, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={250} rx={240} ry={22} fill={INK} opacity={0.12} />
    <rect x={-220} y={-240} width={440} height={490} rx={22} fill="#ffc6cf" stroke={INK} strokeWidth={W} />
    {[
      [a, openA, -120],
      [b, openB, 110],
    ].map(([l, o, yy], k) => (
      <g key={k} transform={`translate(${-40 * (o as number)} ${yy as number})`}>
        <rect x={-180} y={-90} width={360} height={180} rx={16} fill="#fff" stroke={INK} strokeWidth={W} />
        <rect x={-50} y={-62} width={100} height={22} rx={11} fill={GREY} />
        <Txt x={0} y={52} size={70}>
          {l as string}
        </Txt>
      </g>
    ))}
  </g>
);

const Dress: React.FC<{ x: number; y: number; s?: number; fill?: string }> = ({ x, y, s = 1, fill = "#ff8fab" }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -40 -160 L 40 -160 L 50 -110 L 35 -60 L 120 150 L -120 150 L -35 -60 L -50 -110 Z" fill={fill} stroke={INK} strokeWidth={W} strokeLinejoin="round" />
    <path d="M -40 -160 Q 0 -130 40 -160" fill="none" stroke={INK} strokeWidth={5} />
    <path d="M -35 -60 L 35 -60" stroke={INK} strokeWidth={5} />
  </g>
);

const Catalog: React.FC<{ x: number; y: number; s?: number; rot?: number; price?: string }> = ({ x, y, s = 1, rot = 0, price }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-130} y={-170} width={260} height={340} rx={10} fill="#fff" stroke={INK} strokeWidth={W} />
    <rect x={-130} y={-170} width={260} height={60} rx={10} fill={BLUE} stroke={INK} strokeWidth={W} />
    <Txt x={0} y={-128} size={30} color="#fff">
      CATALOG
    </Txt>
    <Dress x={0} y={20} s={0.55} />
    {price ? (
      <Txt x={0} y={150} size={44} color={RED}>
        {price}
      </Txt>
    ) : null}
  </g>
);

const House: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={100} rx={130} ry={14} fill={INK} opacity={0.12} />
    <rect x={-100} y={-40} width={200} height={140} fill="#fff4d6" stroke={INK} strokeWidth={W} />
    <path d="M -125 -30 L 0 -130 L 125 -30 Z" fill={RED} stroke={INK} strokeWidth={W} strokeLinejoin="round" />
    <rect x={-25} y={30} width={50} height={70} fill={BLUE} stroke={INK} strokeWidth={5} />
  </g>
);

const Store: React.FC<{ x: number; y: number; s?: number; name: string; dim?: number }> = ({ x, y, s = 1, name, dim = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={1 - 0.4 * dim}>
    <ellipse cx={0} cy={220} rx={360} ry={24} fill={INK} opacity={0.12} />
    <rect x={-320} y={-160} width={640} height={380} fill="#fff" stroke={INK} strokeWidth={W} />
    <rect x={-340} y={-230} width={680} height={90} rx={12} fill={INK} />
    <Txt x={0} y={-168} size={56} color="#fff">
      {name}
    </Txt>
    {[-240, -160, -80, 0, 80, 160, 240].map((k, i) => (
      <path key={k} d={`M ${k - 40} -140 L ${k + 40} -140 L ${k + 40} -95 Q ${k} -70 ${k - 40} -95 Z`} fill={i % 2 ? "#fff" : RED} stroke={INK} strokeWidth={4} />
    ))}
    <rect x={-80} y={60} width={160} height={160} fill={BLUE} stroke={INK} strokeWidth={5} />
    <rect x={-270} y={-40} width={150} height={120} fill="#dff1ff" stroke={INK} strokeWidth={5} />
    <rect x={120} y={-40} width={150} height={120} fill="#dff1ff" stroke={INK} strokeWidth={5} />
  </g>
);

const Car: React.FC<{ x: number; y: number; s?: number; fill?: string; odo?: string }> = ({ x, y, s = 1, fill = BLUE, odo }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={95} rx={260} ry={18} fill={INK} opacity={0.12} />
    <path d="M -240 60 L -240 0 Q -230 -30 -170 -40 L -110 -110 Q -90 -125 -60 -125 L 90 -125 Q 120 -125 140 -100 L 190 -40 Q 240 -30 245 10 L 245 60 Z" fill={fill} stroke={INK} strokeWidth={W} strokeLinejoin="round" />
    <path d="M -95 -95 L -60 -105 L -15 -105 L -15 -45 L -140 -45 Z" fill="#dff1ff" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <path d="M 10 -105 L 85 -105 Q 105 -105 120 -85 L 150 -45 L 10 -45 Z" fill="#dff1ff" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <circle cx={-140} cy={60} r={42} fill={INK} />
    <circle cx={-140} cy={60} r={16} fill={GREY} />
    <circle cx={140} cy={60} r={42} fill={INK} />
    <circle cx={140} cy={60} r={16} fill={GREY} />
    {odo ? (
      <g transform="translate(0 -210)">
        <rect x={-170} y={-70} width={340} height={130} rx={14} fill={INK} />
        <Txt x={0} y={8} size={64} color={SOFT}>
          {odo}
        </Txt>
        <Txt x={0} y={46} size={24} weight={700} color="#fff">
          MILES
        </Txt>
      </g>
    ) : null}
  </g>
);

const Cake: React.FC<{ x: number; y: number; n: string; s?: number }> = ({ x, y, n, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={100} rx={170} ry={16} fill={INK} opacity={0.12} />
    <rect x={-150} y={-10} width={300} height={110} rx={16} fill="#ffd1dc" stroke={INK} strokeWidth={W} />
    <path d="M -150 20 Q -110 50 -75 20 Q -37 50 0 20 Q 37 50 75 20 Q 110 50 150 20" fill="none" stroke="#fff" strokeWidth={10} />
    <Txt x={0} y={-30} size={110} color={RED}>
      {n}
    </Txt>
  </g>
);

const Hospital: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={200} rx={280} ry={20} fill={INK} opacity={0.12} />
    <rect x={-250} y={-150} width={500} height={350} fill="#fff" stroke={INK} strokeWidth={W} />
    <rect x={-60} y={-260} width={120} height={120} rx={14} fill="#fff" stroke={INK} strokeWidth={W} />
    <path d="M -15 -240 L 15 -240 L 15 -215 L 40 -215 L 40 -185 L 15 -185 L 15 -160 L -15 -160 L -15 -185 L -40 -185 L -40 -215 L -15 -215 Z" fill={RED} />
    {[-170, -70, 70, 170].map((k) => (
      <rect key={k} x={k - 35} y={-100} width={70} height={70} fill="#dff1ff" stroke={INK} strokeWidth={4} />
    ))}
    <rect x={-50} y={80} width={100} height={120} fill={BLUE} stroke={INK} strokeWidth={5} />
  </g>
);

const Heart: React.FC<{ x: number; y: number; s?: number; fill?: string }> = ({ x, y, s = 1, fill = RED }) => (
  <path transform={`translate(${x} ${y}) scale(${s})`} d="M 0 -30 C -40 -90 -120 -50 -90 20 L 0 100 L 90 20 C 120 -50 40 -90 0 -30 Z" fill={fill} stroke={INK} strokeWidth={W} strokeLinejoin="round" />
);

const CameraIcon: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-150} y={-80} width={300} height={190} rx={26} fill={INK} />
    <rect x={-70} y={-115} width={110} height={50} rx={10} fill={INK} />
    <circle cx={0} cy={15} r={68} fill="#7ad7ff" stroke="#fff" strokeWidth={10} />
    <circle cx={0} cy={15} r={28} fill={INK} />
    <circle cx={105} cy={-45} r={12} fill={SOFT} />
  </g>
);

const AppTile: React.FC<{ x: number; y: number; k: number; price?: string }> = ({ x, y, k, price }) => {
  const fills = [RED, GREEN, BLUE, "#b07cff"];
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-90} y={-90} width={180} height={180} rx={40} fill={fills[k]} stroke={INK} strokeWidth={W} />
      {k === 0 ? <path d="M -25 -40 L 45 0 L -25 40 Z" fill="#fff" /> : null}
      {k === 1 ? (
        <g fill="#fff">
          <circle cx={-25} cy={35} r={20} />
          <rect x={-10} y={-45} width={12} height={80} />
          <path d="M 0 -45 L 45 -35 L 45 -15 L 0 -25 Z" />
        </g>
      ) : null}
      {k === 2 ? <path d="M -45 25 Q -45 -10 -15 -10 Q -5 -40 25 -35 Q 50 -30 45 0 Q 60 5 55 25 Z" fill="#fff" /> : null}
      {k === 3 ? <rect x={-45} y={-25} width={90} height={55} rx={22} fill="#fff" /> : null}
      {price ? (
        <Txt x={0} y={150} size={40}>
          {price}
        </Txt>
      ) : null}
    </g>
  );
};

const Laptop: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-180} y={-130} width={360} height={230} rx={16} fill={INK} />
    <rect x={-160} y={-112} width={320} height={190} rx={8} fill="#7ad7ff" />
    <path d="M -230 100 L 230 100 L 200 140 L -200 140 Z" fill={GREY} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
  </g>
);

const PauseIcon: React.FC<{ x: number; y: number; s?: number; fill?: string }> = ({ x, y, s = 1, fill = GOLD }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle r={120} fill={fill} stroke={INK} strokeWidth={W + 2} />
    <rect x={-50} y={-55} width={32} height={110} rx={10} fill={INK} />
    <rect x={18} y={-55} width={32} height={110} rx={10} fill={INK} />
  </g>
);

const Bars: React.FC<{ x: number; y: number; vals: number[]; labels: string[]; p: number[]; colors?: string[]; max: number; h?: number; bw?: number; gap?: number; tops?: string[] }> = ({
  x,
  y,
  vals,
  labels,
  p,
  colors,
  max,
  h = 380,
  bw = 170,
  gap = 90,
  tops,
}) => {
  const w = vals.length * bw + (vals.length - 1) * gap;
  return (
    <g>
      <path d={`M ${x - w / 2 - 40} ${y} L ${x + w / 2 + 40} ${y}`} stroke={INK} strokeWidth={W} strokeLinecap="round" />
      {vals.map((v, i) => {
        const bx = x - w / 2 + i * (bw + gap);
        const bh = (h * v * p[i]) / max;
        return (
          <g key={i}>
            {bh > 1 ? <rect x={bx} y={y - bh} width={bw} height={bh} rx={14} fill={colors?.[i] ?? GREEN} stroke={INK} strokeWidth={5} /> : null}
            <Txt x={bx + bw / 2} y={y + 56} size={44}>
              {labels[i]}
            </Txt>
            {tops && p[i] > 0.6 ? (
              <Txt x={bx + bw / 2} y={y - bh - 22} size={40} color={INK}>
                {tops[i]}
              </Txt>
            ) : null}
          </g>
        );
      })}
    </g>
  );
};

const Bubble: React.FC<{ x: number; y: number; w: number; h?: number; tail?: "left" | "right" | "down"; children: React.ReactNode; fill?: string }> = ({ x, y, w, h = 120, tail = "left", children, fill = "#fff" }) => {
  const tx = tail === "left" ? x - w / 2 + 70 : tail === "right" ? x + w / 2 - 70 : x;
  const d = tail === "left" ? -50 : tail === "right" ? 50 : 0;
  return (
    <g>
      <path d={`M ${tx - 22} ${y + h / 2 - 4} L ${tx + d} ${y + h / 2 + 55} L ${tx + 28} ${y + h / 2 - 4} Z`} fill={fill} stroke={INK} strokeWidth={W} strokeLinejoin="round" />
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={h / 2.4} fill={fill} stroke={INK} strokeWidth={W} />
      <rect x={tx - 18} y={y + h / 2 - 12} width={46} height={14} fill={fill} />
      {children}
    </g>
  );
};

const NameCard: React.FC<{ x: number; y: number; name: string; sub?: string }> = ({ x, y, name, sub }) => (
  <g>
    <rect x={x - 200} y={y - 46} width={400} height={sub ? 120 : 86} rx={16} fill="#fff" stroke={INK} strokeWidth={5} />
    <Txt x={x} y={y + 12} size={40}>
      {name}
    </Txt>
    {sub ? (
      <Txt x={x} y={y + 56} size={26} weight={700} color={GREY}>
        {sub}
      </Txt>
    ) : null}
  </g>
);

/** a number that counts up from 0 to `to` over d seconds after `at` */
const count = (t: number, at: number, to: number, d = 1.0) => Math.round(to * ease((t - at) / d));
const money = (n: number) => "$" + n.toLocaleString("en-US");

// ------------------------------------------------------------------ scenes (t = absolute seconds)
const S_Nine: SC = ({ t }) => {
  const ten = T("It was ten dollars.");
  const flip = inOut((t - ten) / 0.5);
  return (
    <g>
      <Guy x={560} y={680} mood={t > ten ? "neutral" : "happy"} pose="phone">
        <PhoneInHand />
      </Guy>
      <In t={t} at={0.35} dx={-40} dy={0}>
        <Bubble x={1080} y={300} w={640} h={140}>
          <Txt x={1080} y={318} size={56}>
            "It's only nine bucks."
          </Txt>
        </Bubble>
      </In>
      <g transform={`translate(0 ${bob(t, 1, 5)})`}>
        <In t={t} at={T("You've said it.")} dx={60} dy={0}>
          <g transform={`translate(1350 640) scale(${1 - 0.2 * Math.sin(Math.PI * flip)} 1)`}>
            <Tag x={0} y={0} text={flip < 0.5 ? "$9.99" : "$10.00"} rot={-6} fill={flip < 0.5 ? "#fff" : "#fff4d6"} />
          </g>
        </In>
      </g>
      <Stamp x={1350} y={830} text="TEN DOLLARS" t={t} at={ten + 0.5} size={58} rot={-4} />
    </g>
  );
};

const S_YouKnew: SC = ({ t }) => {
  const kid = T("You've known since");
  const all = T("Everybody knows.");
  return (
    <g>
      <In t={t} at={T("And here's the weird part.")} out={T("You knew.") - 0.1}>
        <Big x={960} y={520} text="HERE'S THE WEIRD PART" size={100} color={RED} />
      </In>
      <In t={t} at={T("You knew.") - 0.1}>
        <Big x={960} y={220} text="YOU KNEW." color={GOLD} size={110} />
      </In>
      <In t={t} at={kid}>
        <Guy x={520} y={720} s={0.7} mood="happy" pose="wave" shirt={GREEN} />
        <Bubble x={830} y={430} w={420} h={120}>
          <Txt x={830} y={448} size={50}>
            $9.99 = $10
          </Txt>
        </Bubble>
      </In>
      {[0, 1, 2].map((i) => (
        <In key={i} t={t} at={all + i * 0.15}>
          <Guy x={1180 + i * 170} y={730} s={0.55} mood="happy" shirt={[RED, BLUE, "#b07cff"][i]} />
          <Check x={1180 + i * 170} y={470} s={0.6} />
        </In>
      ))}
    </g>
  );
};

const S_WorksOn: SC = ({ t }) => {
  const xs = [380, 767, 1153, 1540];
  const at = [T("It still works on you."), T("It works on me."), T("It works on people who price"), T("It even shows up in hospitals.")];
  const labels = ["YOU", "ME", "CAR DEALERS", "HOSPITALS"];
  const soon = T("We'll get to both.");
  return (
    <g>
      {xs.map((x, i) => (
        <In key={i} t={t} at={at[i]} dy={60}>
          <Card x={x} y={500} w={340} h={460} fill={i > 1 && t > soon ? "#fff4d6" : "#fff"} />
          {i === 0 ? <Guy x={x} y={560} s={0.6} mood="worried" /> : null}
          {i === 1 ? <Guy x={x} y={560} s={0.6} mood="worried" shirt="#ff9f6e" /> : null}
          {i === 2 ? <Car x={x} y={500} s={0.55} /> : null}
          {i === 3 ? <Hospital x={x} y={500} s={0.5} /> : null}
          <Txt x={x} y={690} size={40}>
            {labels[i]}
          </Txt>
          {i > 1 ? (
            <g opacity={on(t, soon)}>
              <rect x={x - 70} y={252} width={140} height={50} rx={25} fill={GOLD} stroke={INK} strokeWidth={4} />
              <Txt x={x} y={288} size={28}>
                SOON
              </Txt>
            </g>
          ) : null}
        </In>
      ))}
      <Cut t={t} a={T("Be honest.") - 0.1} b={T("It works on people who price") - 0.15}>
        <Txt x={960} y={200} size={64}>
          BE HONEST.
        </Txt>
        <g transform="translate(520 560)">
          <rect x={-110} y={-200} width={220} height={400} rx={36} fill={INK} />
          <rect x={-92} y={-178} width={184} height={356} rx={22} fill="#7ad7ff" />
          <Txt x={0} y={250} size={44}>
            1 PHONE
          </Txt>
        </g>
        {[0, 1, 2, 3, 4, 5].map((k) => (
          <In key={k} t={t} at={T("Be honest.") + 0.4 + k * 0.18} dy={-80}>
            <g transform={`translate(${1150 + k * 75} ${560 - k * 8}) rotate(${-14 + k * 6})`}>
              <rect x={-115} y={-205} width={230} height={410} rx={40} fill={[RED, GOLD, GREEN, BLUE, "#b07cff", "#ff9f6e"][k]} stroke={INK} strokeWidth={6} />
              <circle cx={-60} cy={-150} r={22} fill={INK} opacity={0.5} />
            </g>
          </In>
        ))}
        <In t={t} at={T("Be honest.") + 1.6} dy={0}>
          <Txt x={1340} y={800} size={44}>
            6 CASES AT $9.99
          </Txt>
        </In>
        <Stamp x={960} y={890} text="ONE PHONE." t={t} at={T("You have one phone.")} size={60} rot={-4} />
      </Cut>
    </g>
  );
};

const S_Losing: SC = ({ t }) => {
  const cost = T("And what is it actually costing you?");
  const cent = T("Because it's not one cent.");
  const close = T("It's not even close.");
  const roll = clamp((t - close) / 1.2);
  return (
    <g>
      <In t={t} at={T("So why does your brain")}>
        <Brain x={560} y={470} s={0.9} />
        <Txt x={560} y={760} size={44}>
          YOUR BRAIN
        </Txt>
        <Txt x={960} y={480} size={70} color={GREY}>
          VS
        </Txt>
        <g transform={`translate(0 ${bob(t, 2, 6)})`}>
          <Tag x={1370} y={470} text="$9.99" rot={-5} />
        </g>
      </In>
      <In t={t} at={cost} dy={-30} out={cent}>
        <rect x={680} y={130} width={560} height={110} rx={20} fill={INK} />
        <Txt x={960} y={205} size={56} color="#fff">
          COSTING YOU: ?
        </Txt>
      </In>
      <In t={t} at={cent} dy={-30}>
        <g>
          <rect x={720} y={110} width={480} height={120 + 520 * roll} rx={10} fill="#fff" stroke={INK} strokeWidth={5} />
          <Txt x={960} y={190} size={56}>
            NOT 1 CENT
          </Txt>
          {[0, 1, 2, 3, 4, 5].map((k) =>
            roll * 6 > k ? <rect key={k} x={760} y={250 + k * 80} width={400 - (k % 3) * 70} height={26} rx={13} fill={GREY} opacity={0.6} /> : null,
          )}
        </g>
        <Strike x1={760} x2={1160} y={172} p={on(t, cent + 0.6, 0.4)} />
      </In>
    </g>
  );
};

const S_Try: SC = ({ t }) => {
  const ready = T("Ready?");
  const dark = on(t, T("Just notice the first"), 0.6);
  return (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill={NIGHT} opacity={0.85 * dark} />
      <In t={t} at={T("Try something with me.")}>
        <Guy x={960} y={700} mood="happy" pose="wave" />
      </In>
      <In t={t} at={T("Don't think.")} dy={-30}>
        <Txt x={960} y={230} size={80} color={dark > 0.5 ? "#fff" : INK}>
          DON'T THINK.
        </Txt>
      </In>
      <In t={t} at={T("Just notice the first")} dy={-30}>
        <Txt x={960} y={330} size={56} color={SOFT}>
          JUST NOTICE THE FIRST THING YOUR BRAIN SAYS
        </Txt>
      </In>
      <In t={t} at={ready} dy={0} d={0.2}>
        <circle cx={960} cy={640} r={100} fill={GOLD} stroke={INK} strokeWidth={W} opacity={t < ready + 0.4 ? 1 : 0} />
      </In>
    </g>
  );
};

const S_499: SC = ({ t }) => {
  const at = TW("$4", T("$4.99.") - 0.1);
  const said = T('If your brain said');
  const slam = ease((t - at) / 0.18);
  return (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill={NIGHT} opacity={0.85 * (1 - on(t, said, 0.6))} />
      <In t={t} at={T("$4.99.") - 0.3} dy={0} d={0.2} out={at}>
        <Txt x={960} y={500} size={110} color={SOFT}>
          READY?
        </Txt>
      </In>
      <g transform={`translate(960 470) scale(${1.6 - 0.25 * slam}) translate(-960 -470)`} opacity={slam}>
        <Tag x={960} y={470} text="$4.99" s={1.4} first={on(t, said, 0.8)} />
      </g>
      <In t={t} at={said + 0.4}>
        <Brain x={600} y={800} s={0.45} />
        <Bubble x={1050} y={780} w={560} h={130}>
          <Txt x={1050} y={800} size={56}>
            "four-something"
          </Txt>
        </Bubble>
      </In>
    </g>
  );
};

const S_Reading: SC = ({ t }) => {
  const lr = T("You read left to right.");
  const imp = T("And your brain is impatient.");
  const grab = T("It grabs the first digit");
  const late = T("The rest of the price shows up");
  const tooLate = T("Too late.");
  const made = T("The decision's already made.");
  const lift = inOut((t - TW("first", grab)) / 0.6);
  const rest = inOut((t - late) / 0.9);
  return (
    <g>
      <In t={t} at={T("Here's what's going on.")}>
        {/* the tag, split: the 4 lifts out, ".99" trails in late */}
        <g transform={`translate(0 ${-120 * lift})`}>
          <Txt x={780} y={540} size={220} color={t > grab ? RED : INK}>
            $4
          </Txt>
        </g>
        <g transform={`translate(${380 * (1 - rest) + (t < late ? 380 : 0)} 0)`} opacity={t < late ? (t < grab ? 1 : 0.15) : 1}>
          <Txt x={1080} y={540} size={220} color={GREY}>
            .99
          </Txt>
        </g>
      </In>
      <In t={t} at={lr}>
        <Arrow x1={560} y1={640} x2={1380} y2={640} p={clamp((t - lr) / 1.0)} />
        <Txt x={960} y={720} size={40} color={GREY}>
          LEFT TO RIGHT
        </Txt>
      </In>
      <In t={t} at={imp} out={grab}>
        <Txt x={960} y={230} size={64}>
          YOUR BRAIN IS IMPATIENT
        </Txt>
      </In>
      <In t={t} at={grab} out={tooLate}>
        <Txt x={960} y={230} size={64} color={RED}>
          GRABS THE FIRST DIGIT
        </Txt>
      </In>
      <Stamp x={1250} y={300} text="TOO LATE" t={t} at={tooLate} size={70} rot={-6} />
      <In t={t} at={made}>
        <rect x={560} y={770} width={800} height={110} rx={22} fill={INK} />
        <Txt x={960} y={845} size={56} color="#fff">
          DECIDED: "FOUR"
        </Txt>
      </In>
    </g>
  );
};

const S_Filed: SC = ({ t }) => {
  const f4 = T("So $4.99 gets filed");
  const f5 = T("$5.00 gets filed");
  const cent = T("One cent apart on the tag.");
  const dollar = T("A whole dollar apart");
  const m4 = inOut((t - TW("filed", f4)) / 0.9);
  const m5 = inOut((t - TW("filed", f5)) / 0.9);
  return (
    <g>
      <Cabinet x={1320} y={520} a="$4" b="$5" openA={m4 > 0 && m4 < 1 ? 1 : 0} openB={m5 > 0 && m5 < 1 ? 1 : 0} />
      <Txt x={1320} y={200} size={40}>
        YOUR BRAIN'S FILES
      </Txt>
      <In t={t} at={f4 - 0.3} dx={-60} dy={0}>
        <g transform={`translate(${520 * m4} ${-120 * m4 + 20})`} opacity={1 - 0.8 * clamp((m4 - 0.8) / 0.2)}>
          <Tag x={560} y={400} text="$4.99" />
        </g>
      </In>
      <In t={t} at={f5 - 0.3} dx={-60} dy={0}>
        <g transform={`translate(${520 * m5} ${110 * m5 - 20})`} opacity={1 - 0.8 * clamp((m5 - 0.8) / 0.2)}>
          <Tag x={560} y={640} text="$5.00" />
        </g>
      </In>
      <In t={t} at={cent}>
        <Tag x={480} y={380} text="$4.99" s={0.7} />
        <Tag x={480} y={560} text="$5.00" s={0.7} />
        <Txt x={480} y={710} size={44} color={GREEN}>
          1 CENT APART
        </Txt>
      </In>
      <In t={t} at={dollar}>
        <rect x={250} y={770} width={600} height={100} rx={22} fill={INK} />
        <Txt x={550} y={838} size={50} color={SOFT}>
          $1 APART IN YOUR HEAD
        </Txt>
      </In>
    </g>
  );
};

const S_LeftDigit: SC = ({ t }) => {
  const a = T("Researchers call this");
  const g = on(t, TW("left", a), 0.6);
  return (
    <g>
      <In t={t} at={a}>
        <Txt x={960} y={260} size={60} color={GREY}>
          THE
        </Txt>
        <text x={960} y={470} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={150} fill={INK}>
          <tspan fill={g > 0.5 ? RED : INK}>LEFT</tspan>-DIGIT
        </text>
        <Big x={960} y={640} text="EFFECT" size={150} color={GOLD} />
      </In>
    </g>
  );
};

const S_Study2005: SC = ({ t }) => {
  const a = T("In 2005");
  const five = T("tested it in five");
  return (
    <g>
      <In t={t} at={a}>
        <Txt x={960} y={190} size={60}>
          2005
        </Txt>
      </In>
      <In t={t} at={TW("Manoj", a)} dx={-60} dy={0}>
        <Guy x={640} y={640} s={0.8} mood="happy" shirt="#4a5a8a" />
        <NameCard x={640} y={330} name="MANOJ THOMAS" sub="MARKETING PROFESSOR" />
      </In>
      <In t={t} at={TW("Vick", a)} dx={60} dy={0}>
        <Guy x={1280} y={640} s={0.8} mood="happy" shirt="#7a5a8a" />
        <NameCard x={1280} y={330} name="VICKI MORWITZ" sub="MARKETING PROFESSOR" />
      </In>
      <In t={t} at={five}>
        <rect x={760} y={800} width={400} height={90} rx={45} fill={GOLD} stroke={INK} strokeWidth={5} />
        <Txt x={960} y={862} size={44}>
          5 EXPERIMENTS
        </Txt>
      </In>
    </g>
  );
};

const S_Cent: SC = ({ t }) => {
  const row1 = T("When one cent changed the first");
  const ex = T("like $3.00 down");
  const drop = T("people saw a real drop");
  const row2 = T("When one cent changed a digit further");
  const same = T("Same one cent.");
  const only = T("The only thing that mattered");
  return (
    <g>
      <In t={t} at={row1} dx={-60} dy={0}>
        <Card x={960} y={330} w={1360} h={250} />
        <Txt x={420} y={250} size={34} color={GREY} anchor="start">
          FIRST DIGIT CHANGES
        </Txt>
        <Tag x={560} y={350} text="$3.00" s={0.75} first={t > only ? 1 : 0} />
        <Arrow x1={760} y1={350} x2={880} y2={350} p={on(t, ex, 0.4)} />
        <In t={t} at={ex + 0.6} dy={0}>
          <Tag x={1080} y={350} text="$2.99" s={0.75} first={t > only ? 1 : 0} />
        </In>
        <In t={t} at={drop} dy={0}>
          <rect x={1300} y={290} width={60 + 120 * on(t, drop, 0.8)} height={60} rx={14} fill={GREEN} stroke={INK} strokeWidth={4} />
          <Txt x={1330} y={400} size={30} anchor="start">
            FEELS CHEAPER
          </Txt>
        </In>
      </In>
      <In t={t} at={row2} dx={-60} dy={0}>
        <Card x={960} y={680} w={1360} h={250} />
        <Txt x={420} y={600} size={34} color={GREY} anchor="start">
          A DIGIT ON THE RIGHT CHANGES (EXAMPLE)
        </Txt>
        <Tag x={560} y={700} text="$3.48" s={0.75} />
        <Arrow x1={760} y1={700} x2={880} y2={700} p={on(t, row2 + 0.5, 0.4)} />
        <Tag x={1080} y={700} text="$3.47" s={0.75} />
        <rect x={1300} y={640} width={34} height={60} rx={10} fill={GREY} stroke={INK} strokeWidth={4} opacity={on(t, row2 + 1.2)} />
        <Txt x={1330} y={750} size={30} anchor="start" style={{ opacity: on(t, row2 + 1.2) }}>
          BARELY NOTICED
        </Txt>
      </In>
      <In t={t} at={same} dy={0}>
        <rect x={830} y={480} width={260} height={70} rx={35} fill={GOLD} stroke={INK} strokeWidth={4} />
        <Txt x={960} y={528} size={34}>
          BOTH: 1 CENT
        </Txt>
      </In>
    </g>
  );
};

const S_NotDumb: SC = ({ t }) => {
  const a = T("Now you might be thinking");
  const know = T("I know $4.99");
  const right = T("And you're right.");
  const stop = T("If you stop and think");
  return (
    <g>
      <Guy x={620} y={700} mood={t > right ? "happy" : "strain"} pose="cross" />
      <In t={t} at={TW("dumb", a) - 0.3} dx={-40} dy={0}>
        <Bubble x={1200} y={300} w={600} h={140}>
          <Txt x={1200} y={318} size={56}>
            "I'm not dumb."
          </Txt>
        </Bubble>
      </In>
      <In t={t} at={know} dx={-40} dy={0}>
        <Bubble x={1220} y={540} w={640} h={130}>
          <Txt x={1220} y={558} size={50}>
            "$4.99 is five dollars."
          </Txt>
        </Bubble>
      </In>
      <In t={t} at={right} dy={0} d={0.25}>
        <Check x={1550} y={700} s={1.3} />
      </In>
      <In t={t} at={stop}>
        <Txt x={1220} y={820} size={46} color={GREEN}>
          ...IF YOU STOP AND THINK
        </Txt>
      </In>
    </g>
  );
};

const S_Honest: SC = ({ t }) => {
  const when = T("When do you actually stop");
  return (
    <g>
      <In t={t} at={T("But be honest.")}>
        <Big x={960} y={330} text="BE HONEST." size={120} />
      </In>
      <In t={t} at={when}>
        <Txt x={960} y={520} size={64} color={RED}>
          WHEN DO YOU ACTUALLY STOP?
        </Txt>
        <g transform={`translate(960 720) rotate(${(t - when) * 90})`}>
          <circle r={90} fill="#fff" stroke={INK} strokeWidth={W} />
          <path d="M 0 0 L 0 -60" stroke={INK} strokeWidth={8} strokeLinecap="round" />
        </g>
      </In>
    </g>
  );
};

const S_Busy: SC = ({ t }) => {
  const store = T("You're in a store");
  const night = T("You're scrolling at 1");
  const tired = T("You're tired");
  const math = T("Your brain isn't doing math");
  const short = T("It's taking shortcuts.");
  const rule = T("And the shortcut is");
  const dark = on(t, night, 0.6) * (1 - on(t, math, 0.6));
  const prices = ["$2.99", "$14.99", "$6.49", "$19.99", "$3.99", "$9.99", "$24.99", "$1.99", "$7.99", "$12.99", "$4.49", "$29.99"];
  return (
    <g>
      <In t={t} at={store} out={night}>
        {prices.map((p, i) => (
          <g key={i} transform={`translate(${290 + (i % 4) * 450} ${230 + Math.floor(i / 4) * 230 + bob(t, i, 4)})`} opacity={on(t, store + i * 0.07, 0.2)}>
            <Tag x={0} y={0} text={p} s={0.55} rot={((i * 37) % 11) - 5} />
          </g>
        ))}
      </In>
      <rect x={0} y={0} width={1920} height={1080} fill={NIGHT} opacity={0.9 * dark} />
      <In t={t} at={night} out={math}>
        <circle cx={1520} cy={220} r={70} fill={SOFT} />
        <circle cx={1550} cy={200} r={60} fill={NIGHT} />
        <Txt x={420} y={220} size={60} color="#fff">
          1:00 AM
        </Txt>
        <g transform="translate(960 560)">
          <rect x={-170} y={-300} width={340} height={600} rx={46} fill={INK} stroke="#fff" strokeWidth={4} />
          <rect x={-148} y={-272} width={296} height={544} rx={28} fill="#fff" />
          <rect x={-110} y={-220} width={220} height={190} rx={16} fill="#7ad7ff" />
          <path d="M -80 -90 Q -80 -60 -50 -60 L 50 -60 Q 80 -60 80 -90 Z" fill="#fff" stroke={INK} strokeWidth={4} />
          <Txt x={0} y={-130} size={26}>
            INFLATABLE HOT TUB
          </Txt>
          <Txt x={0} y={40} size={52}>
            $499.99
          </Txt>
          <rect x={-120} y={110} width={240} height={90} rx={45} fill={t > tired + 2.5 ? GREEN : RED} />
          <Txt x={0} y={168} size={34} color="#fff">
            {t > tired + 2.5 ? "ADDED" : "ADD TO CART"}
          </Txt>
          <circle cx={60} cy={175} r={34} fill={SKIN} stroke={INK} strokeWidth={5} opacity={on(t, tired + 1.5)} />
        </g>
        <In t={t} at={T("Which is when all the best")} dy={-20} out={tired}>
          <Txt x={1500} y={420} size={40} color={SOFT}>
            PEAK DECISION
          </Txt>
          <Txt x={1500} y={470} size={40} color={SOFT}>
            HOURS
          </Txt>
        </In>
        <In t={t} at={tired} dy={-20}>
          <Txt x={420} y={420} size={44} color={SOFT}>
            TIRED.
          </Txt>
          <Txt x={420} y={500} size={44} color={SOFT}>
            HUNGRY.
          </Txt>
        </In>
      </In>
      <In t={t} at={math}>
        <Brain x={560} y={500} s={0.8} />
        <g transform="translate(560 500)">
          <rect x={-70} y={-90} width={140} height={180} rx={16} fill="#fff" stroke={INK} strokeWidth={5} />
          <Txt x={0} y={-30} size={44}>
            + -
          </Txt>
          <Txt x={0} y={40} size={44}>
            x =
          </Txt>
        </g>
        <Cross x={560} y={500} s={1.8} />
      </In>
      <In t={t} at={short} dx={60} dy={0}>
        <g transform="translate(1320 520)">
          <rect x={-20} y={-40} width={40} height={360} fill={GREY} stroke={INK} strokeWidth={5} />
          <path d="M -240 -160 L 200 -160 L 270 -100 L 200 -40 L -240 -40 Z" fill={GREEN} stroke={INK} strokeWidth={W} strokeLinejoin="round" />
          <Txt x={-10} y={-82} size={56} color="#fff">
            SHORTCUT
          </Txt>
        </g>
      </In>
      <In t={t} at={rule}>
        <rect x={830} y={760} width={980} height={100} rx={22} fill={INK} />
        <Txt x={1320} y={828} size={44} color={SOFT}>
          READ THE FIRST NUMBER. MOVE ON.
        </Txt>
      </In>
    </g>
  );
};

const S_Memory: SC = ({ t }) => {
  const a = T("Here's the sneaky part.");
  const short = T("You remember the shortcut.");
  const quote = T('"It was like nine bucks."');
  const blur = on(t, T("you don't remember the price"), 0.8);
  return (
    <g>
      <In t={t} at={a}>
        <Guy x={560} y={700} mood="neutral" pose="chin" />
      </In>
      <In t={t} at={T("Later, when you try")}>
        <ellipse cx={1250} cy={420} rx={420} ry={260} fill="#fff" stroke={INK} strokeWidth={W} />
        <circle cx={850} cy={720} r={26} fill="#fff" stroke={INK} strokeWidth={5} />
        <circle cx={800} cy={790} r={16} fill="#fff" stroke={INK} strokeWidth={5} />
        <g opacity={1 - 0.85 * blur}>
          <rect x={1050} y={250} width={400} height={330} rx={10} fill="#f6f6f6" stroke={INK} strokeWidth={4} />
          <Txt x={1250} y={320} size={34}>
            RECEIPT
          </Txt>
          <Txt x={1250} y={440} size={80}>
            $9.99
          </Txt>
        </g>
      </In>
      <In t={t} at={short} dy={0}>
        <Txt x={1250} y={410} size={52} color={RED}>
          {t > quote ? '"like nine bucks"' : "THE SHORTCUT"}
        </Txt>
      </In>
    </g>
  );
};

const S_BusyStamp: SC = ({ t }) => {
  const a = T("Stores don't need you to be bad");
  const busy = T("They just need you to be busy.");
  return (
    <g>
      <In t={t} at={a}>
        <Store x={960} y={540} s={0.9} name="THE STORE" />
      </In>
      <In t={t} at={a + 0.3} dy={-30}>
        <rect x={460} y={110} width={1000} height={110} rx={22} fill="#fff" stroke={INK} strokeWidth={5} />
        <Txt x={960} y={186} size={52}>
          BAD AT MATH? NOT NEEDED.
        </Txt>
      </In>
      <Stamp x={960} y={870} text="JUST BUSY" t={t} at={TW("busy", busy)} size={80} rot={-5} />
    </g>
  );
};

const S_Catalog: SC = ({ t }) => {
  const a = T("So how much can one little 9");
  const who = T("Two researchers, Eric");
  const cat = T("found out with a women's");
  return (
    <g>
      <In t={t} at={a} out={who}>
        <Big x={960} y={560} text="9" size={420} color={GOLD} />
        <Txt x={960} y={720} size={50}>
          HOW MUCH CAN ONE LITTLE 9 DO?
        </Txt>
      </In>
      <In t={t} at={who} dx={-60} dy={0}>
        <NameCard x={480} y={240} name="ERIC ANDERSON" sub="RESEARCHER" />
      </In>
      <In t={t} at={TW("Duncan", who)} dx={60} dy={0}>
        <NameCard x={1440} y={240} name="DUNCAN SIMESTER" sub="RESEARCHER" />
      </In>
      <In t={t} at={cat}>
        <Catalog x={960} y={600} s={1.1} rot={-3} />
        <Txt x={960} y={890} size={40}>
          A WOMEN'S CLOTHING CATALOG
        </Txt>
      </In>
    </g>
  );
};

const S_Mail: SC = ({ t }) => {
  const a = T("They printed different versions");
  const same = T("Same dress.");
  const fly = (k: number) => inOut((t - a - 1.2 - k * 0.3) / 1.1);
  return (
    <g>
      <In t={t} at={a} out={same}>
        {[0, 1, 2].map((k) => (
          <g key={k}>
            <House x={480 + k * 480} y={700} s={0.9} />
            <g transform={`translate(${(960 - (480 + k * 480)) * (1 - fly(k))} ${-380 * (1 - fly(k))})`}>
              <Catalog x={480 + k * 480} y={560} s={0.4} rot={-8 + k * 8} />
            </g>
          </g>
        ))}
        <Txt x={960} y={200} size={50}>
          RANDOM CUSTOMERS
        </Txt>
      </In>
      <In t={t} at={same}>
        {[0, 1, 2].map((k) => (
          <g key={k}>
            <Dress x={480 + k * 480} y={520} s={1.1} />
          </g>
        ))}
        <Txt x={960} y={200} size={56}>
          {t > T("Only the price changed.") ? "ONLY THE PRICE CHANGED" : t > T("Same photo.") ? "SAME DRESS. SAME PHOTO." : "SAME DRESS."}
        </Txt>
      </In>
    </g>
  );
};

const S_Prices: SC = ({ t }) => {
  const at = [T("Some people saw it for $34"), T("Some saw $39."), T("Some saw $44.")];
  const q = T("Quick, which one");
  const logic = T("Normal logic says");
  const nope = T("Nope.");
  const pause = TW("most", q) + 0.3;
  const n = 3 - Math.floor((t - pause) / 0.7);
  return (
    <g>
      {["$34", "$39", "$44"].map((p, k) => (
        <g key={k}>
          <Dress x={480 + k * 480} y={520} s={1.1} />
          <In t={t} at={at[k]} dy={-50}>
            <Tag x={480 + k * 480 + 30} y={800} text={p} s={0.75} rot={-4 + k * 4} fill={t > logic && k === 0 ? (t > nope ? "#ffd6d0" : "#fff4d6") : "#fff"} />
          </In>
        </g>
      ))}
      <In t={t} at={q} dy={-30}>
        <Txt x={960} y={200} size={64} color={RED}>
          WHICH ONE SOLD THE MOST?
        </Txt>
      </In>
      {t > pause && n >= 1 && n <= 3 && t < logic ? (
        <g>
          <circle cx={1740} cy={220} r={60} fill={GOLD} stroke={INK} strokeWidth={6} />
          <Txt x={1740} y={244} size={66}>
            {n}
          </Txt>
        </g>
      ) : null}
      <In t={t} at={logic} dy={0}>
        <Txt x={480} y={300} size={40} color={GREY}>
          "THE CHEAPEST"
        </Txt>
      </In>
      <In t={t} at={nope} dy={0} d={0.2}>
        <Cross x={480} y={520} s={2.2} />
      </In>
    </g>
  );
};

const S_Sales: SC = ({ t }) => {
  const a = T("At $39, the dress");
  const b = T("And at $44?");
  const c = T("About the same as $34.");
  const raised = T("They raised the price by five");
  return (
    <g>
      <Txt x={960} y={170} size={52} style={{ opacity: on(t, a) }}>
        HOW MANY SOLD
      </Txt>
      <Bars
        x={960}
        y={760}
        vals={[1, 1.33, 1]}
        max={1.4}
        h={430}
        labels={["$34", "$39", "$44"]}
        p={[on(t, a, 0.6), on(t, a + 0.6, 1.0), on(t, c, 0.8)]}
        colors={[GREY, GREEN, GREY]}
        tops={["", "ABOUT 1/3 MORE", "SAME AS $34"]}
      />
      <In t={t} at={b - 0.3} dy={0}>
        <Txt x={1430} y={250} size={40} color={GREY} style={{ opacity: 1 - on(t, c) }}>
          ...AND $44?
        </Txt>
      </In>
      <In t={t} at={raised} dy={-20}>
        <rect x={1350} y={300} width={480} height={150} rx={20} fill={INK} />
        <Txt x={1590} y={365} size={40} color="#fff">
          PRICE +$5
        </Txt>
        <Txt x={1590} y={420} size={40} color={SOFT}>
          SOLD MORE
        </Txt>
      </In>
    </g>
  );
};

const S_Deal: SC = ({ t }) => {
  const a = T("Because a 9 at the end");
  const deal = T('It says "deal."');
  const signs = T("You've seen 99 on a million");
  const good = T('So now your brain reads it');
  const nobody = T("Even when nobody checked.");
  const fall = (k: number) => clamp((t - signs - k * 0.12) / 0.6);
  return (
    <g>
      <In t={t} at={T("Why?") - 0.1} out={signs}>
        <Tag x={960} y={420} text="$39" s={1.5} first={0} />
        <In t={t} at={a + 0.6} dy={0}>
          <Txt x={760} y={700} size={70} color={GREY}>
            "CHEAP"
          </Txt>
        </In>
        <Stamp x={1250} y={720} text="DEAL" color={GREEN} t={t} at={deal} size={110} rot={-8} />
      </In>
      <In t={t} at={signs} dy={0}>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((k) => {
          const x = 300 + (k % 5) * 330 + (k > 4 ? 160 : 0);
          const y = -150 + (k > 4 ? 680 : 420) * ease(fall(k));
          return (
            <g key={k} transform={`translate(${x} ${y}) rotate(${((k * 23) % 13) - 6})`}>
              <rect x={-130} y={-70} width={260} height={140} rx={14} fill={k % 2 ? SOFT : "#ffd6d0"} stroke={INK} strokeWidth={5} />
              <Txt x={0} y={-12} size={36} color={RED}>
                SALE
              </Txt>
              <Txt x={0} y={44} size={44}>
                {["$9.99", "$19.99", "$4.99", "$29.99", "$99", "$1.99", "$49.99", "$14.99", "$5.99"][k]}
              </Txt>
            </g>
          );
        })}
      </In>
      <In t={t} at={good} dy={30}>
        <rect x={660} y={760} width={600} height={100} rx={22} fill={INK} />
        <Txt x={960} y={828} size={48} color={SOFT}>
          BRAIN: "GOOD PRICE"
        </Txt>
      </In>
      <In t={t} at={nobody} dy={0}>
        <g transform="translate(1600 820)">
          <circle r={60} fill="#fff" stroke={INK} strokeWidth={W} />
          <path d="M 42 42 L 95 95" stroke={INK} strokeWidth={16} strokeLinecap="round" />
        </g>
        <Cross x={1600} y={820} s={1} />
      </In>
    </g>
  );
};

const S_Feeling: SC = ({ t }) => {
  const a = T("And people really like");
  const hard = T("One company learned");
  return (
    <g>
      <In t={t} at={a}>
        <Guy x={560} y={700} mood="happy" pose="bags" />
        <g transform={`translate(560 360) scale(${1 + 0.06 * Math.sin(t * 6)})`}>
          <Heart x={0} y={0} s={0.8} />
        </g>
        <Txt x={560} y={240} size={44} color={RED}>
          "A DEAL!"
        </Txt>
      </In>
      <In t={t} at={hard} dx={80} dy={0}>
        <Store x={1340} y={560} s={0.75} name="ONE COMPANY" />
      </In>
    </g>
  );
};

const S_JCP: SC = ({ t }) => {
  const a = T("In 2012, JCPenney");
  const sales = T("No more constant sales.");
  const coupons = T("No more coupons.");
  const every = T("Just simple, everyday");
  const fair = T('They called it "fair');
  const great = T("Sounds great, right?");
  return (
    <g>
      <In t={t} at={a}>
        <Store x={600} y={560} s={0.85} name="JCPENNEY" />
        <Txt x={600} y={150} size={50}>
          2012
        </Txt>
      </In>
      <In t={t} at={sales} dx={60} dy={0}>
        <rect x={1160} y={220} width={300} height={120} rx={14} fill={SOFT} stroke={INK} strokeWidth={5} />
        <Txt x={1310} y={300} size={60} color={RED}>
          SALE
        </Txt>
        <Cross x={1310} y={280} s={1.2} />
      </In>
      <In t={t} at={coupons} dx={60} dy={0}>
        <rect x={1500} y={220} width={280} height={120} rx={14} fill="#fff" stroke={INK} strokeWidth={5} strokeDasharray="16 10" />
        <Txt x={1640} y={300} size={44}>
          COUPON
        </Txt>
        <Cross x={1640} y={280} s={1.2} />
      </In>
      <In t={t} at={every} dx={60} dy={0}>
        <Tag x={1450} y={520} text="$20" s={0.8} />
      </In>
      <In t={t} at={fair} dy={30}>
        <rect x={1180} y={700} width={600} height={110} rx={22} fill={GREEN} stroke={INK} strokeWidth={5} />
        <Txt x={1480} y={775} size={52} color="#fff">
          "FAIR AND SQUARE"
        </Txt>
      </In>
      <In t={t} at={great} dy={0} d={0.3}>
        <Txt x={1480} y={900} size={40} color={GREY}>
          SOUNDS GREAT, RIGHT?
        </Txt>
      </In>
    </g>
  );
};

const S_JCPFall: SC = ({ t }) => {
  const hated = T("Customers hated it.");
  const fell = T("That year, sales");
  const lost = T("The company lost almost");
  const ceo = T("And the CEO admitted");
  const drop = inOut((t - TW("fell", fell)) / 1.0);
  return (
    <g>
      <In t={t} at={hated}>
        {[0, 1, 2].map((k) => (
          <Guy key={k} x={300 + k * 190} y={720} s={0.6} mood="worried" shirt={[RED, BLUE, GREEN][k]} />
        ))}
        <Txt x={490} y={330} size={52} color={RED} style={{ opacity: 1 - on(t, T("People literally missed")) }}>
          CUSTOMERS HATED IT
        </Txt>
      </In>
      {["BRING", "BACK THE", "FAKE SALES!"].map((w, k) => (
        <In key={k} t={t} at={T("People literally missed") + 0.15 * k} dy={50} out={TW("year", T("That year, sales"))}>
          <g transform={`translate(${300 + k * 190} ${400 + bob(t * 3, k, 10)}) rotate(${-6 + k * 6})`}>
            <rect x={-4} y={20} width={8} height={150} fill={INK} />
            <rect x={-95} y={-55} width={190} height={90} rx={10} fill="#fff" stroke={INK} strokeWidth={5} />
            <Txt x={0} y={4} size={w.length > 8 ? 26 : 32} color={RED}>
              {w}
            </Txt>
          </g>
        </In>
      ))}
      <In t={t} at={TW("dumping", T("That's like dumping"))} dy={0} out={T("That year, sales")}>
        <g transform="translate(1250 520)">
          <path d="M 0 -30 C -40 -90 -120 -50 -90 20 L 0 100 Z" fill={RED} stroke={INK} strokeWidth={W} strokeLinejoin="round" transform="translate(-12 0) rotate(-8)" />
          <path d="M 0 -30 C 40 -90 120 -50 90 20 L 0 100 Z" fill={RED} stroke={INK} strokeWidth={W} strokeLinejoin="round" transform="translate(12 0) rotate(8)" />
          <path d="M 0 -30 L -14 10 L 10 40 L -6 80" fill="none" stroke={INK} strokeWidth={6} />
        </g>
        <Txt x={1250} y={720} size={40}>
          "IT'S NOT YOU, IT'S YOUR PRICES"
        </Txt>
      </In>
      <In t={t} at={fell}>
        <Bars x={1220} y={640} vals={[1, 0.75]} max={1.1} h={360} bw={180} gap={80} labels={["2011", "2012"]} p={[1, 1 - 0.0 * drop]} colors={[GREY, t > fell + 0.3 ? RED : GREY]} />
        <Txt x={1520} y={340} size={56} color={RED} style={{ opacity: on(t, TW("25", fell)) }}>
          ABOUT -25%
        </Txt>
        <Txt x={1220} y={770} size={28} weight={700} color={GREY}>
          SALES AT ESTABLISHED STORES
        </Txt>
      </In>
      <In t={t} at={lost} dy={-30}>
        <rect x={900} y={110} width={860} height={110} rx={22} fill={INK} />
        <Txt x={1330} y={185} size={48} color={SOFT}>
          LOST ALMOST $1 BILLION
        </Txt>
      </In>
      <Stamp x={1450} y={880} text="A MISTAKE" t={t} at={TW("mistake", ceo)} size={66} rot={-5} />
    </g>
  );
};

const S_WantDeal: SC = ({ t }) => {
  const a = T("Shoppers didn't just want");
  const want = T("They wanted the feeling");
  const think = T("So think about the last thing");
  const check = T("Did you check the price?");
  const feel = T("Or did the feeling check");
  return (
    <g>
      <In t={t} at={a} out={think}>
        <Tag x={620} y={500} text="$20" s={1.1} />
        <Txt x={620} y={720} size={44} color={GREY}>
          LOW PRICE
        </Txt>
        <In t={t} at={want} dy={0}>
          <Heart x={1300} y={480} s={1.3} />
          <Txt x={1300} y={720} size={44} color={RED}>
            FEELING OF A DEAL
          </Txt>
          <Txt x={960} y={520} size={80}>
            {"<"}
          </Txt>
        </In>
      </In>
      <In t={t} at={think}>
        <Guy x={600} y={700} mood="happy" pose="bags" />
        <Bubble x={1160} y={300} w={520} h={120}>
          <Txt x={1160} y={318} size={50}>
            "Such a deal!"
          </Txt>
        </Bubble>
      </In>
      <In t={t} at={check} dx={60} dy={0}>
        <g transform="translate(1400 640)">
          <circle r={90} fill="#fff" stroke={INK} strokeWidth={W} />
          <path d="M 64 64 L 140 140" stroke={INK} strokeWidth={22} strokeLinecap="round" />
          <Txt x={0} y={20} size={60}>
            ?
          </Txt>
        </g>
      </In>
      <In t={t} at={feel} dy={0}>
        <Heart x={1210} y={600} s={0.6} />
      </In>
    </g>
  );
};

const S_Round: SC = ({ t }) => {
  const a = T("But wait.");
  const rest = T("why does a nice restaurant");
  const brands = T("Why do fancy brands");
  const diff = T("Because round numbers");
  return (
    <g>
      <In t={t} at={a} out={rest}>
        <Big x={960} y={560} text="BUT WAIT." size={150} color={RED} />
      </In>
      <In t={t} at={rest} dx={-60} dy={0}>
        <g transform="translate(600 520)">
          <rect x={-230} y={-300} width={460} height={600} rx={20} fill="#fffdf6" stroke={INK} strokeWidth={W} />
          <Txt x={0} y={-210} size={44}>
            MENU
          </Txt>
          <rect x={-180} y={-160} width={360} height={6} fill={GREY} />
          <Txt x={-180} y={-60} size={40} anchor="start">
            Pasta
          </Txt>
          <Txt x={180} y={-60} size={48} anchor="end" color={GREEN}>
            $28
          </Txt>
          <Txt x={180} y={40} size={40} anchor="end" color={GREY}>
            $27.99
          </Txt>
          <Strike x1={20} x2={190} y={28} p={on(t, TW("27", rest), 0.4)} />
        </g>
      </In>
      <In t={t} at={brands} dx={60} dy={0}>
        <g transform="translate(1340 560)">
          <path d="M -170 -60 L 170 -60 L 200 240 L -200 240 Z" fill="#2b2f4a" stroke={INK} strokeWidth={W} strokeLinejoin="round" />
          <path d="M -90 -60 Q -90 -190 0 -190 Q 90 -190 90 -60" fill="none" stroke={INK} strokeWidth={14} />
          <Tag x={150} y={20} text="$300" s={0.6} rot={10} />
        </g>
      </In>
      <In t={t} at={diff} dy={-30}>
        <rect x={460} y={110} width={1000} height={110} rx={22} fill={INK} />
        <Txt x={960} y={186} size={50} color={SOFT}>
          ROUND NUMBERS SELL A FEELING
        </Txt>
      </In>
    </g>
  );
};

const S_Camera: SC = ({ t }) => {
  const a = T("In 2015, researchers");
  const vac = T("When people were buying a camera");
  const v100 = T("it did better at a round");
  const proj = T("When the same camera");
  const v98 = T("it did better at $98");
  return (
    <g>
      <In t={t} at={a} out={vac}>
        <Txt x={960} y={200} size={56}>
          2015
        </Txt>
        <NameCard x={600} y={480} name="MONICA WADHWA" sub="RESEARCHER" />
        <NameCard x={1320} y={480} name="KUANGJIE ZHANG" sub="RESEARCHER" />
      </In>
      <In t={t} at={vac} dx={-60} dy={0}>
        <Card x={560} y={500} w={640} h={640} fill="#fff8e6" />
        <circle cx={760} cy={290} r={50} fill={GOLD} />
        <path d="M 260 760 Q 560 650 860 760 Z" fill="#7ad7ff" opacity={0.6} />
        <CameraIcon x={560} y={470} s={0.9} />
        <Txt x={560} y={260} size={40}>
          FAMILY VACATION
        </Txt>
        <In t={t} at={v100} dy={0}>
          <Tag x={560} y={710} text="$100" s={0.7} fill="#fff4d6" />
          <Check x={800} y={660} s={0.8} />
        </In>
      </In>
      <In t={t} at={proj} dx={60} dy={0}>
        <Card x={1360} y={500} w={640} h={640} fill="#eef4ff" />
        <rect x={1120} y={690} width={180} height={40} rx={6} fill={BLUE} stroke={INK} strokeWidth={4} />
        <rect x={1140} y={650} width={160} height={40} rx={6} fill={RED} stroke={INK} strokeWidth={4} />
        <CameraIcon x={1360} y={470} s={0.9} />
        <Txt x={1360} y={260} size={40}>
          CLASS PROJECT
        </Txt>
        <In t={t} at={v98} dy={0}>
          <Tag x={1360} y={710} text="$98.76" s={0.6} fill="#eef4ff" />
          <Check x={1620} y={660} s={0.8} />
        </In>
      </In>
    </g>
  );
};

const S_HeartHead: SC = ({ t }) => {
  const heart = T("Round numbers feel right");
  const head = T("Exact numbers feel right");
  const deal = T('So a 9 says "smart deal."');
  const treat = T('A round number says');
  const either = T("Either way, the price");
  return (
    <g>
      <In t={t} at={heart} dx={-60} dy={0}>
        <Heart x={560} y={420} s={1.4} />
        <Tag x={560} y={720} text={t > deal ? "$100" : "$100"} s={0.7} />
        <In t={t} at={treat} dy={0}>
          <Txt x={560} y={870} size={46} color={RED}>
            "TREAT YOURSELF"
          </Txt>
        </In>
      </In>
      <In t={t} at={head} dx={60} dy={0}>
        <Brain x={1360} y={420} s={0.9} />
        <Tag x={1360} y={720} text={t > deal ? "$99.99" : "$98.76"} s={0.6} />
        <In t={t} at={deal} dy={0}>
          <Txt x={1360} y={870} size={46} color={GREEN}>
            "SMART DEAL"
          </Txt>
        </In>
      </In>
      <In t={t} at={either} dy={-30}>
        <rect x={510} y={110} width={900} height={100} rx={22} fill={INK} />
        <Txt x={960} y={180} size={44} color={SOFT}>
          THE PRICE MATCHES THE FEELING
        </Txt>
      </In>
    </g>
  );
};

const S_Pros: SC = ({ t }) => {
  const a = T("Okay, but maybe that's just");
  const pro = T("Professionals don't fall");
  const fav = T("This is my favorite study.");
  return (
    <g>
      <In t={t} at={a} out={fav}>
        {[0, 1, 2].map((k) => (
          <Guy key={k} x={360 + k * 170} y={720} s={0.55} mood="happy" pose="bags" shirt={[RED, BLUE, GREEN][k]} />
        ))}
        <Txt x={530} y={360} size={44} color={GREY}>
          REGULAR SHOPPERS
        </Txt>
      </In>
      <In t={t} at={pro} dx={60} dy={0}>
        <Guy x={1350} y={700} mood="neutral" pose="cross" shirt="#3b3f5c">
          <path d="M 0 -120 L -14 -90 L 0 -20 L 14 -90 Z" fill={RED} stroke={INK} strokeWidth={4} />
        </Guy>
        <Txt x={1350} y={360} size={50}>
          PROFESSIONALS?
        </Txt>
      </In>
      <In t={t} at={fav}>
        <StarIcon x={960} y={540} r={170} fill={SOFT} />
        <Txt x={960} y={790} size={56}>
          MY FAVORITE STUDY
        </Txt>
      </In>
    </g>
  );
};

const S_Auction: SC = ({ t }) => {
  const a = T("Economists looked at more");
  const dealers = T("The buyers there are car dealers.");
  const job = T("People whose whole job");
  const ridic = T("And they found something");
  const n = count(t, TW("22", a), 22000000, 1.4);
  return (
    <g>
      <In t={t} at={a}>
        <Txt x={960} y={250} size={110} color={GOLD}>
          {n.toLocaleString("en-US")}
        </Txt>
        <Txt x={960} y={330} size={44}>
          USED CARS SOLD AT AUCTION
        </Txt>
        {[0, 1, 2, 3, 4].map((k) => (
          <g key={k} opacity={on(t, a + 0.4 + k * 0.12)}>
            <Car x={330 + k * 315} y={560} s={0.5} fill={[BLUE, RED, GREEN, GOLD, "#b07cff"][k]} />
          </g>
        ))}
      </In>
      <In t={t} at={dealers}>
        {[0, 1, 2].map((k) => (
          <Guy key={k} x={660 + k * 300} y={800} s={0.45} mood="neutral" pose={k === 1 ? "point" : "cross"} shirt="#3b3f5c" />
        ))}
      </In>
      <In t={t} at={job} dy={0}>
        <rect x={1360} y={760} width={420} height={90} rx={45} fill={GOLD} stroke={INK} strokeWidth={5} />
        <Txt x={1570} y={820} size={34}>
          THEIR WHOLE JOB
        </Txt>
      </In>
      <In t={t} at={T("Professionals.") - 0.1} dy={-30} out={ridic}>
        <rect x={680} y={560} width={560} height={80} rx={40} fill={INK} />
        <Txt x={960} y={615} size={40} color={SOFT}>
          PROFESSIONALS.
        </Txt>
      </In>
      {[0, 1, 2].map((k) => (
        <In key={k} t={t} at={T("With clipboards.") + k * 0.12} dy={40} out={ridic + 0.3}>
          <g transform={`translate(${660 + k * 300 + 40} 790) rotate(${-8 + k * 8})`}>
            <rect x={-38} y={-50} width={76} height={100} rx={8} fill="#c98a12" stroke={INK} strokeWidth={4} />
            <rect x={-28} y={-38} width={56} height={80} fill="#fff" />
            <rect x={-16} y={-58} width={32} height={16} rx={4} fill={GREY} stroke={INK} strokeWidth={3} />
            <path d="M -18 -15 L 18 -15 M -18 0 L 18 0 M -18 15 L 10 15" stroke={GREY} strokeWidth={4} />
          </g>
        </In>
      ))}
      <Stamp x={480} y={850} text="RIDICULOUS" t={t} at={ridic + 0.6} size={50} rot={-6} />
    </g>
  );
};

const S_Odometer: SC = ({ t }) => {
  const a = T("Every time the odometer");
  const take = T("Take a car at 79,999");
  const same = T("and the same kind of car");
  const basic = T("Basically the same car.");
  const apart = T("They can sell a couple");
  const mile = T("One extra mile.");
  const two = T("About two hundred");
  // a stepped price line: every 10k miles, a drop
  const draw = clamp((t - a) / 2.2);
  const pts: string[] = [];
  for (let m = 0; m <= 100; m += 1) {
    const x = 340 + (m / 100) * 1240;
    const y = 300 + m * 3.2 + Math.floor(m / 10) * 22;
    if (m / 100 <= draw) pts.push(`${x},${y}`);
  }
  return (
    <g>
      <In t={t} at={a} out={take}>
        <path d="M 320 260 L 320 760 L 1620 760" fill="none" stroke={INK} strokeWidth={W} strokeLinecap="round" />
        {pts.length > 1 ? <path d={`M ${pts.join(" L ")}`} fill="none" stroke={RED} strokeWidth={10} strokeLinejoin="round" /> : null}
        <Txt x={340} y={230} size={36} anchor="start">
          PRICE
        </Txt>
        <Txt x={1600} y={820} size={36} anchor="end">
          MILES
        </Txt>
        {[2, 4, 6, 8].map((k) => (
          <Txt key={k} x={340 + k * 124} y={810} size={28} weight={700} color={GREY}>
            {k * 10}K
          </Txt>
        ))}
        <Txt x={960} y={190} size={44} color={RED}>
          A DROP AT EVERY 10,000 MILES
        </Txt>
      </In>
      <In t={t} at={take} dx={-60} dy={0}>
        <Car x={560} y={640} s={0.95} fill={BLUE} odo="79,999" />
      </In>
      <In t={t} at={same} dx={60} dy={0}>
        <Car x={1360} y={640} s={0.95} fill={BLUE} odo="80,000" />
      </In>
      <In t={t} at={basic} dy={-20}>
        <Txt x={960} y={180} size={50}>
          {t > mile ? "ONE EXTRA MILE" : "BASICALLY THE SAME CAR"}
        </Txt>
      </In>
      <In t={t} at={apart} dy={0}>
        <Tag x={560} y={900} text="$$$" s={0.5} />
        <Tag x={1360} y={900} text="-$200" s={0.5} fill="#ffd6d0" />
      </In>
      <Stamp x={960} y={480} text="ABOUT $200" t={t} at={two} size={70} rot={-6} />
    </g>
  );
};

const S_Reads: SC = ({ t }) => {
  const a = T('Because 79,999 reads');
  const b = T('80,000 reads as');
  const m1 = inOut((t - a - 2.3) / 0.9);
  const m2 = inOut((t - b - 0.3) / 0.9);
  return (
    <g>
      <Cabinet x={1320} y={520} a="70s" b="80s" openA={m1 > 0 && m1 < 1 ? 1 : 0} openB={m2 > 0 && m2 < 1 ? 1 : 0} />
      <Txt x={1320} y={200} size={40}>
        YOUR BRAIN'S FILES
      </Txt>
      <g transform={`translate(${560 * m1} ${-100 * m1})`} opacity={1 - clamp((m1 - 0.8) / 0.2)}>
        <Txt x={620} y={420} size={110}>
          79,999
        </Txt>
      </g>
      <g opacity={on(t, b - 0.3)} transform={`translate(${560 * m2} ${110 * m2})`}>
        <g opacity={1 - clamp((m2 - 0.8) / 0.2)}>
          <Txt x={620} y={680} size={110}>
            80,000
          </Txt>
        </g>
      </g>
    </g>
  );
};

const S_NotYou: SC = ({ t }) => {
  const a = T("If car dealers can't turn");
  const prob = TW("problem", T("with real money"));
  const human = T("This is just how human");
  return (
    <g>
      <In t={t} at={a}>
        <Guy x={600} y={700} mood={t > prob ? "happy" : "neutral"} pose={t > prob ? "shrug" : "rest"} />
      </In>
      <Stamp x={1250} y={380} text="NOT YOUR FAULT" color={GREEN} t={t} at={prob} size={70} rot={-5} />
      <In t={t} at={human}>
        <Brain x={1250} y={680} s={0.6} />
        <Txt x={1250} y={880} size={40}>
          HOW HUMAN BRAINS READ NUMBERS
        </Txt>
      </In>
    </g>
  );
};

const S_AnyNumber: SC = ({ t }) => {
  const a = T("And it's not only prices.");
  const any = T("It's any number.");
  const nums = ["79", "80,000", "99%", "1,999", "49", "7:59"];
  return (
    <g>
      <In t={t} at={a}>
        <Tag x={960} y={520} text="$9.99" s={1.0} />
      </In>
      {nums.map((n, k) => {
        const ang = (k / nums.length) * Math.PI * 2;
        const r = 400 * ease((t - any - k * 0.08) / 0.6);
        return r > 1 ? (
          <Txt key={k} x={960 + r * Math.cos(ang) * 1.6} y={520 + r * Math.sin(ang) * 0.85 + 20} size={64} color={[RED, GREEN, BLUE, GOLD][k % 4]}>
            {n}
          </Txt>
        ) : null;
      })}
    </g>
  );
};

const S_Hospital: SC = ({ t }) => {
  const a = T("In 2020,");
  const pts = T("researchers looked at about 70,000");
  const cmp = T("They compared people");
  const two = T("Two weeks apart in age.");
  return (
    <g>
      <In t={t} at={a} out={cmp}>
        <Hospital x={960} y={560} s={1.1} />
        <Txt x={960} y={160} size={56}>
          2020
        </Txt>
        <In t={t} at={pts} dy={0}>
          <rect x={1340} y={200} width={440} height={110} rx={22} fill={INK} />
          <Txt x={1560} y={250} size={40} color={SOFT}>
            ~70,000
          </Txt>
          <Txt x={1560} y={292} size={26} weight={700} color="#fff">
            HEART ATTACK PATIENTS
          </Txt>
        </In>
      </In>
      <In t={t} at={cmp} dx={-60} dy={0}>
        <Cake x={560} y={520} n="79" s={1.3} />
        <Txt x={560} y={760} size={44}>
          JUST BEFORE 80
        </Txt>
      </In>
      <In t={t} at={cmp + 1.6} dx={60} dy={0}>
        <Cake x={1360} y={520} n="80" s={1.3} />
        <Txt x={1360} y={760} size={44}>
          JUST AFTER 80
        </Txt>
      </In>
      <In t={t} at={two} dy={0}>
        <rect x={760} y={820} width={400} height={80} rx={40} fill={GOLD} stroke={INK} strokeWidth={5} />
        <Txt x={960} y={874} size={36}>
          2 WEEKS APART
        </Txt>
      </In>
    </g>
  );
};

const S_Bypass: SC = ({ t }) => {
  const b = T("Just before 80, about 7");
  const af = T("Just after 80, about 5");
  const ages = T("At 79 and 81");
  const flip = T("Only at the moment");
  const rule = T("The researchers say they");
  return (
    <g>
      <In t={t} at={b - 0.2} out={ages}>
        <Txt x={960} y={180} size={50}>
          GOT BYPASS SURGERY
        </Txt>
        <Bars x={960} y={760} vals={[7, 5.3]} max={8} h={450} bw={220} gap={160} labels={["BEFORE 80", "AFTER 80"]} p={[on(t, b, 0.8), on(t, af, 0.8)]} colors={[GREEN, RED]} tops={["ABOUT 7%", "ABOUT 5%"]} />
      </In>
      <In t={t} at={ages}>
        <Txt x={960} y={180} size={44}>
          NO JUMP AT 79 OR 81. ONLY AT 80.
        </Txt>
        {[77, 78, 79, 80, 81, 82, 83].map((age, k) => {
          const x = 420 + k * 180;
          const lit = age === 80 && t > flip;
          return (
            <g key={age}>
              <rect x={x - 70} y={420} width={140} height={140} rx={20} fill={lit ? RED : "#fff"} stroke={INK} strokeWidth={5} />
              <Txt x={x} y={515} size={64} color={lit ? "#fff" : INK}>
                {age}
              </Txt>
            </g>
          );
        })}
        <In t={t} at={flip} dy={0}>
          <Txt x={960} y={680} size={56} color={RED}>
            7 FLIPS TO 8
          </Txt>
        </In>
      </In>
      <In t={t} at={rule} dy={0}>
        <Txt x={960} y={860} size={30} weight={700} color={GREY}>
          (THE RESEARCHERS CAN'T FULLY RULE OUT OTHER REASONS)
        </Txt>
      </In>
    </g>
  );
};

const S_Reads2: SC = ({ t }) => {
  const a = T('79 reads as "seventies."');
  const b = T('80 reads as "eighty."');
  const m1 = inOut((t - a - 0.3) / 0.8);
  const m2 = inOut((t - b - 0.2) / 0.8);
  return (
    <g>
      <In t={t} at={T("But the best explanation")}>
        <Cabinet x={1320} y={520} a="70s" b="80s" openA={m1 > 0 && m1 < 1 ? 1 : 0} openB={m2 > 0 && m2 < 1 ? 1 : 0} />
        <Txt x={1320} y={200} size={40}>
          SAME FILES
        </Txt>
      </In>
      <g opacity={on(t, a - 0.2) * (1 - clamp((m1 - 0.8) / 0.2))} transform={`translate(${560 * m1} ${-100 * m1})`}>
        <Cake x={600} y={420} n="79" s={0.9} />
      </g>
      <g opacity={on(t, b - 0.3) * (1 - clamp((m2 - 0.8) / 0.2))} transform={`translate(${560 * m2} ${110 * m2})`}>
        <Cake x={600} y={700} n="80" s={0.9} />
      </g>
    </g>
  );
};

const S_Cart: SC = ({ t }) => {
  const a = T("If the first digit can shape");
  const cart = T("it can definitely shape what's");
  return (
    <g>
      <In t={t} at={a}>
        <Heart x={560} y={480} s={1.2} />
        <Txt x={560} y={730} size={40}>
          HEART SURGERY
        </Txt>
      </In>
      <In t={t} at={cart} dx={60} dy={0}>
        <g transform="translate(1320 560)">
          <path d="M -260 -160 L -200 -160 L -150 100 L 200 100 L 240 -90 L -180 -90" fill="none" stroke={INK} strokeWidth={W + 2} strokeLinejoin="round" strokeLinecap="round" />
          <circle cx={-110} cy={160} r={30} fill={INK} />
          <circle cx={170} cy={160} r={30} fill={INK} />
          {["$9.99", "$4.99", "$19.99"].map((p, k) => (
            <g key={k} transform={`translate(${-80 + k * 110} ${-130 + bob(t, k, 5)}) rotate(${-8 + k * 8})`}>
              <Tag x={0} y={0} text={p} s={0.35} />
            </g>
          ))}
        </g>
        <Txt x={1320} y={850} size={44} color={RED}>
          YOUR CART
        </Txt>
      </In>
    </g>
  );
};

const S_Subs: SC = ({ t }) => {
  const a = T("So where is it hitting you?");
  const subs = T("Start with subscriptions.");
  const four = T("Say you've got four");
  const head = T('In your head, each one');
  const real = T("The real total is about");
  const year = T("That's $720 a year.");
  const tot = count(t, real + 0.3, 60, 0.9);
  const yr = count(t, year + 0.2, 720, 1.0);
  return (
    <g>
      <In t={t} at={a} out={subs}>
        <Big x={960} y={540} text="WHERE IS IT HITTING YOU?" size={90} />
      </In>
      {[0, 1, 2, 3].map((k) => (
        <In key={k} t={t} at={(k === 0 ? subs : four) + k * 0.15} dy={60}>
          <AppTile x={420 + k * 360} y={420} k={k} price={t > four ? (t > head && t < real ? "\"$14\"" : "$14.99") : undefined} />
        </In>
      ))}
      <In t={t} at={real} dy={30}>
        <rect x={560} y={680} width={800} height={130} rx={24} fill={INK} />
        <Txt x={960} y={765} size={60} color={SOFT}>
          {t > year ? `${money(yr)} A YEAR` : `ABOUT ${money(tot)} A MONTH`}
        </Txt>
      </In>
    </g>
  );
};

const S_Under: SC = ({ t }) => {
  const a = T('Then there\'s what I call');
  const tell = T("You tell yourself");
  const buy = T("And then you buy the one");
  const worked = T("Your rule worked perfectly.");
  const store = T("For the store.");
  return (
    <g>
      <In t={t} at={a} dy={-30}>
        <rect x={660} y={110} width={600} height={100} rx={22} fill={INK} />
        <Txt x={960} y={180} size={48} color={SOFT}>
          THE "UNDER" RULE
        </Txt>
      </In>
      <In t={t} at={tell}>
        <Guy x={560} y={700} mood="happy" pose="point" />
        <Bubble x={1000} y={360} w={460} h={120}>
          <Txt x={1000} y={378} size={50}>
            "Under $50."
          </Txt>
        </Bubble>
      </In>
      <In t={t} at={buy} dx={60} dy={0}>
        <Tag x={1400} y={620} text="$49.99" s={0.9} />
      </In>
      <In t={t} at={worked} dy={0}>
        <Check x={1400} y={420} s={1.1} />
      </In>
      {t > store
        ? Array.from({ length: 36 }, (_, k) => {
            const u = t - store;
            const x = 1400 + ((k * 97) % 700) - 350 + 40 * Math.sin(u * 3 + k);
            const y = 300 + u * (220 + (k % 5) * 40) - 120 + ((k * 53) % 90);
            return y < 1000 ? <rect key={k} x={x} y={y} width={18} height={10} rx={2} fill={[RED, GOLD, GREEN, BLUE][k % 4]} transform={`rotate(${u * 300 + k * 40} ${x + 9} ${y + 5})`} /> : null;
          })
        : null}
      <Stamp x={1400} y={860} text="FOR THE STORE" t={t} at={store} size={60} rot={-5} />
    </g>
  );
};

const S_Bigger: SC = ({ t }) => {
  const a = T("And it gets bigger");
  const lap = T("A laptop at $999");
  const k1 = T("It's a thousand dollars.");
  const car = T("A car at $29,995");
  const k2 = T("It's thirty.");
  return (
    <g>
      <In t={t} at={a} dy={-30}>
        <Txt x={960} y={170} size={52}>
          BIGGER PRICE, BIGGER HIDE
        </Txt>
      </In>
      <In t={t} at={lap} dx={-60} dy={0}>
        <Laptop x={560} y={440} s={1.1} />
        <Tag x={560} y={720} text={t > k1 ? "$1,000" : "$999"} s={0.75} fill={t > k1 ? "#fff4d6" : "#fff"} />
        <In t={t} at={TW("feels", lap)} dy={0} out={k1}>
          <Txt x={560} y={880} size={36} color={GREY}>
            "NINE HUNDRED SOMETHING"
          </Txt>
        </In>
      </In>
      <In t={t} at={car} dx={60} dy={0}>
        <Car x={1360} y={460} s={1.0} fill={RED} />
        <Tag x={1360} y={720} text={t > k2 ? "$30,000" : "$29,995"} s={0.6} fill={t > k2 ? "#fff4d6" : "#fff"} />
        <In t={t} at={TW("feels", car)} dy={0} out={k2}>
          <Txt x={1360} y={880} size={36} color={GREY}>
            "TWENTY-SOMETHING THOUSAND"
          </Txt>
        </In>
      </In>
    </g>
  );
};

const S_Pause: SC = ({ t }) => {
  const pen = T("Not the pennies.");
  const pause = T("It costs you the pause.");
  const sec = T("That one second");
  const want = T('Do I even want this');
  const saved = T("That pause is where");
  const skip = T("And the 9 is designed");
  const kick = inOut((t - skip - 0.6) / 0.6);
  return (
    <g>
      <In t={t} at={T("But here's what it really") - 0.1} out={pen}>
        <Big x={960} y={520} text="WHAT IT REALLY COSTS YOU" size={90} />
      </In>
      <In t={t} at={pen} out={pause}>
        <Coin x={960} y={520} r={120} label="1c" />
        <Cross x={960} y={520} s={2.4} />
      </In>
      <In t={t} at={pause} out={sec}>
        <g transform={`translate(960 520) scale(${1 + 0.05 * Math.sin(t * 4)}) translate(-960 -520)`}>
          <PauseIcon x={960} y={520} s={1.6} />
        </g>
        <Txt x={960} y={850} size={64}>
          THE PAUSE
        </Txt>
      </In>
      <In t={t} at={sec} out={saved}>
        <Guy x={600} y={700} mood="neutral" pose="chin" />
        <Bubble x={1200} y={330} w={720} h={130}>
          <Txt x={1200} y={350} size={46}>
            "Wait. That's ten dollars."
          </Txt>
        </Bubble>
        <In t={t} at={want} dy={0}>
          <Bubble x={1200} y={600} w={720} h={130}>
            <Txt x={1200} y={620} size={46}>
              "Do I even want this?"
            </Txt>
          </Bubble>
        </In>
      </In>
      <In t={t} at={saved}>
        <PauseIcon x={760} y={520} s={1.1} fill={GREEN} />
        <Coin x={1160} y={520} r={90} />
        <Txt x={960} y={790} size={46}>
          WHERE YOUR MONEY GETS SAVED
        </Txt>
        <In t={t} at={skip} dy={0}>
          <g transform={`translate(${-300 * kick} 0)`}>
            <Big x={1500} y={600} text="9" size={260} color={RED} />
          </g>
          <g opacity={on(t, skip + 1.0)}>
            <path d="M 640 440 L 720 520 L 640 600 Z M 730 440 L 810 520 L 730 600 Z" fill={RED} stroke={INK} strokeWidth={5} />
          </g>
        </In>
      </In>
    </g>
  );
};

const S_Habit: SC = ({ t }) => {
  const a = T("So how do you beat");
  const harder = T("You don't try harder.");
  const habit = T("You give your brain");
  const rule = T("Call it the Round-Up Rule.");
  return (
    <g>
      <In t={t} at={a} out={rule}>
        <Guy x={600} y={700} mood="strain" pose="up" />
        <In t={t} at={harder} dy={0}>
          <Txt x={600} y={330} size={50}>
            TRY HARDER?
          </Txt>
          <Strike x1={420} x2={780} y={312} p={on(t, harder + 0.5, 0.4)} />
        </In>
        <In t={t} at={habit} dx={60} dy={0}>
          <Brain x={1320} y={500} s={0.8} />
          <Txt x={1320} y={780} size={50} color={GREEN}>
            A NEW HABIT
          </Txt>
        </In>
      </In>
      <In t={t} at={rule} dy={60}>
        <rect x={360} y={380} width={1200} height={240} rx={50} fill={GOLD} stroke={INK} strokeWidth={W + 2} />
        <Txt x={960} y={535} size={110}>
          THE ROUND-UP RULE
        </Txt>
      </In>
    </g>
  );
};

const StepHead: React.FC<{ n: number; title: string; t: number; at: number }> = ({ n, title, t, at }) => (
  <In t={t} at={at} dx={-60} dy={0}>
    <circle cx={330} cy={190} r={62} fill={GOLD} stroke={INK} strokeWidth={W} />
    <Txt x={330} y={217} size={74}>
      {n}
    </Txt>
    <Txt x={420} y={213} size={60} anchor="start">
      {title}
    </Txt>
  </In>
);

const Cashier: React.FC<{ t: number }> = ({ t }) => {
  const a = T("And yes, the cashier");
  const them = T("Let them.");
  return (
    <Cut t={t} a={a - 0.1} b={T("Two: ask the round") - 0.2}>
      <Guy x={560} y={700} mood="happy" pose="point" />
      <Bubble x={980} y={330} w={500} h={130}>
        <Txt x={980} y={352} size={56} color={GREEN}>
          "TEN DOLLARS."
        </Txt>
      </Bubble>
      <Guy x={1400} y={640} s={0.9} mood="neutral" shirt={GREEN} />
      <rect x={1150} y={700} width={560} height={200} rx={14} fill="#c98a12" stroke={INK} strokeWidth={W} />
      <Txt x={1430} y={820} size={40} color="#fff">
        CHECKOUT
      </Txt>
      <In t={t} at={TW("weird", a) - 0.2} dy={0}>
        <Bubble x={1560} y={300} w={240} h={110} tail="left">
          <Txt x={1560} y={322} size={60}>
            ...
          </Txt>
        </Bubble>
      </In>
      <Stamp x={960} y={880} text="LET THEM." color={GREEN} t={t} at={them} size={64} rot={-4} />
    </Cut>
  );
};

const S_Step1: SC = ({ t }) => {
  const a = T("One: say the real number.");
  const not1 = T('Not "nine ninety-nine."');
  const say10 = T('Say "ten dollars."');
  const not2 = T('Not "forty-nine');
  const say50 = T('Say "fifty."');
  const silly = T("It feels silly,");
  const second = t > not2;
  return (
    <g>
      <StepHead n={1} title="SAY THE REAL NUMBER" t={t} at={a} />
      <In t={t} at={not1} dx={-40} dy={0}>
        <Guy x={520} y={720} mood="happy" pose="point" />
        <Tag x={1000} y={430} text={second ? "$49.99" : "$9.99"} s={0.8} />
        <Strike x1={860} x2={1240} y={420} p={on(t, (second ? not2 : not1) + 0.4, 0.4)} />
      </In>
      <In t={t} at={say10} dx={60} dy={0}>
        <Bubble x={1360} y={650} w={560} h={150}>
          <Txt x={1360} y={672} size={64} color={GREEN}>
            {t > say50 ? '"FIFTY."' : '"TEN DOLLARS."'}
          </Txt>
        </Bubble>
      </In>
      <In t={t} at={silly} dy={0}>
        <Txt x={1000} y={880} size={36} color={GREY}>
          YOUR BRAIN FILES THE REAL NUMBER
        </Txt>
      </In>
      <Cashier t={t} />
    </g>
  );
};

const S_Step2: SC = ({ t }) => {
  const a = T("Two: ask the round question.");
  const ten = T('"Would I pay a flat ten');
  const fifty = T('A flat fifty?"');
  const ch = T("If your answer changes");
  return (
    <g>
      <StepHead n={2} title="ASK THE ROUND QUESTION" t={t} at={a} />
      <In t={t} at={T("Before you buy, ask")} dy={40}>
        <Card x={960} y={500} w={1100} h={300} fill="#fff8e6" />
        <Txt x={960} y={470} size={64}>
          "Would I pay a flat {t > fifty ? "$50" : "$10"}?"
        </Txt>
        <In t={t} at={ten + 0.4} dy={0}>
          <rect x={720} y={530} width={200} height={80} rx={40} fill={GREEN} stroke={INK} strokeWidth={5} />
          <Txt x={820} y={584} size={40} color="#fff">
            YES
          </Txt>
          <rect x={1000} y={530} width={200} height={80} rx={40} fill={RED} stroke={INK} strokeWidth={5} />
          <Txt x={1100} y={584} size={40} color="#fff">
            NO
          </Txt>
        </In>
      </In>
      <In t={t} at={ch} dy={30}>
        <Big x={760} y={830} text="9" size={150} color={RED} />
        <Txt x={1100} y={815} size={44}>
          WAS DOING THE SELLING
        </Txt>
      </In>
    </g>
  );
};

const S_Step3: SC = ({ t }) => {
  const a = T("Three: times twelve.");
  const mo = T("For anything monthly");
  const yr = T("$14.99 a month is about");
  const worth = T("Is it worth $180?");
  const yes = T("Sometimes yes.");
  const dec = T("But now you're actually deciding.");
  const n = count(t, yr + 0.6, 180, 1.0);
  return (
    <g>
      <StepHead n={3} title="TIMES TWELVE" t={t} at={a} />
      <In t={t} at={mo} dx={-40} dy={0}>
        <AppTile x={500} y={500} k={0} price="$14.99/mo" />
      </In>
      <In t={t} at={mo + 1.0} dy={0}>
        <Txt x={840} y={530} size={90}>
          x 12
        </Txt>
      </In>
      <In t={t} at={yr} dx={60} dy={0}>
        <rect x={1050} y={400} width={620} height={200} rx={30} fill={INK} />
        <Txt x={1360} y={530} size={90} color={SOFT}>
          ~{money(n)}/YR
        </Txt>
      </In>
      <In t={t} at={worth} dy={0}>
        <Txt x={1360} y={700} size={52}>
          WORTH IT?
        </Txt>
      </In>
      <In t={t} at={yes} dy={0}>
        <Check x={1560} y={680} s={0.9} />
      </In>
      <In t={t} at={dec} dy={30}>
        <Guy x={960} y={780} s={0.5} mood="happy" pose="point" />
        <Txt x={1360} y={860} size={46} color={GREEN}>
          NOW YOU'RE DECIDING
        </Txt>
      </In>
    </g>
  );
};

const S_Outro: SC = ({ t }) => {
  const a = T("Stores aren't counting on you");
  const not = T("They're counting on you not");
  const next = T("So the next time you hear");
  const up = T("Round up.");
  const ten = T("It's ten.");
  const notice = T("And now you'll notice.");
  const roll = inOut((t - up - 0.1) / 0.6);
  return (
    <g>
      <In t={t} at={a} out={next}>
        <Store x={720} y={560} s={0.8} name="THE STORE" />
        <In t={t} at={not} dx={60} dy={0}>
          <PauseIcon x={1460} y={520} s={1.0} />
          <Txt x={1460} y={760} size={40}>
            YOU, NOT STOPPING
          </Txt>
        </In>
      </In>
      <In t={t} at={next}>
        <Guy x={560} y={700} mood={t > notice ? "happy" : "neutral"} pose="phone">
          <PhoneInHand />
        </Guy>
        <Bubble x={1080} y={300} w={640} h={140}>
          <Txt x={1080} y={318} size={56}>
            "It's only nine bucks."
          </Txt>
        </Bubble>
        <g transform={`translate(1350 ${640 - 30 * Math.sin(Math.PI * roll)})`}>
          <Tag x={0} y={0} text={roll < 0.5 ? "$9.99" : "$10"} rot={-6} fill={roll < 0.5 ? "#fff" : "#fff4d6"} />
        </g>
        <In t={t} at={up} dy={0}>
          <Arrow x1={1350} y1={880} x2={1350} y2={760} color={GREEN} />
        </In>
      </In>
      <Stamp x={1350} y={880} text="IT'S TEN." color={GREEN} t={t} at={ten} size={70} rot={-5} />
    </g>
  );
};

const SCENES: [string, SC][] = [
  ['"It\'s only nine bucks."', S_Nine],
  ["And here's the weird part.", S_YouKnew],
  ["It still works on you.", S_WorksOn],
  ["So why does your brain", S_Losing],
  ["Try something with me.", S_Try],
  ["$4.99.", S_499],
  ["Here's what's going on.", S_Reading],
  ["So $4.99 gets filed", S_Filed],
  ["Researchers call this", S_LeftDigit],
  ["In 2005", S_Study2005],
  ["When one cent changed the first", S_Cent],
  ["Now you might be thinking", S_NotDumb],
  ["But be honest.", S_Honest],
  ["You're in a store", S_Busy],
  ["Here's the sneaky part.", S_Memory],
  ["Stores don't need you to be bad", S_BusyStamp],
  ["So how much can one little 9", S_Catalog],
  ["They printed different versions", S_Mail],
  ["Some people saw it for $34", S_Prices],
  ["At $39, the dress", S_Sales],
  ["Why?", S_Deal],
  ["And people really like", S_Feeling],
  ["In 2012, JCPenney", S_JCP],
  ["Customers hated it.", S_JCPFall],
  ["Shoppers didn't just want", S_WantDeal],
  ["But wait.", S_Round],
  ["In 2015, researchers", S_Camera],
  ["Round numbers feel right", S_HeartHead],
  ["Okay, but maybe that's just", S_Pros],
  ["Economists looked at more", S_Auction],
  ["Every time the odometer", S_Odometer],
  ["Because 79,999 reads", S_Reads],
  ["If car dealers can't turn", S_NotYou],
  ["And it's not only prices.", S_AnyNumber],
  ["In 2020,", S_Hospital],
  ["Just before 80, about 7", S_Bypass],
  ["But the best explanation", S_Reads2],
  ["If the first digit can shape", S_Cart],
  ["So where is it hitting you?", S_Subs],
  ["Then there's what I call", S_Under],
  ["And it gets bigger", S_Bigger],
  ["But here's what it really", S_Pause],
  ["So how do you beat", S_Habit],
  ["One: say the real number.", S_Step1],
  ["Two: ask the round question.", S_Step2],
  ["Three: times twelve.", S_Step3],
  ["Stores aren't counting on you", S_Outro],
];
const RANGES = SCENES.map(([p], i) => [i === 0 ? 0 : T(p) - 0.25, i + 1 < SCENES.length ? T(SCENES[i + 1][0]) - 0.25 : END] as const);

// chapter labels: a small pill at the top for the first ~3 s of each chapter
const CHAPTERS: [string, string][] = [
  ["Try something with me.", "THE FIRST NUMBER WINS"],
  ["Now you might be thinking", "\"BUT I'M NOT DUMB\""],
  ["So how much can one little 9", "THE DRESS EXPERIMENT"],
  ["In 2012, JCPenney", "THE STORE THAT TOOK THE DEALS AWAY"],
  ["But wait.", "WHY SOME PRICES NEVER END IN 9"],
  ["Okay, but maybe that's just", "EVEN CAR DEALERS FALL FOR IT"],
  ["And it's not only prices.", "IT'S NOT JUST MONEY"],
  ["So where is it hitting you?", "WHERE IT'S COSTING YOU"],
  ["So how do you beat", "THE FIX"],
];
const ChapterPill: React.FC<{ t: number }> = ({ t }) => {
  const c = [...CHAPTERS].reverse().find(([p]) => t >= T(p));
  if (!c) return null;
  const a = T(c[0]);
  const o = clamp((t - a) / 0.3) * clamp((a + 3.2 - t) / 0.4);
  if (o <= 0) return null;
  const w = c[1].length * 21 + 80;
  return (
    <g opacity={o} transform={`translate(0 ${-30 * (1 - ease((t - a) / 0.4))})`}>
      <rect x={960 - w / 2} y={26} width={w} height={64} rx={32} fill={INK} />
      <Txt x={960} y={70} size={34} color={SOFT}>
        {c[1]}
      </Txt>
    </g>
  );
};

// sound effects on visual beats (synthesized files from Ep1), quiet under the voice
type Sfx = "pop" | "tick" | "swoosh" | "cash" | "tap";
const VOL: Record<Sfx, number> = { pop: 0.17, tick: 0.22, swoosh: 0.15, cash: 0.2, tap: 0.25 };
const sfx = (): [number, Sfx][] => {
  const ev: [number, Sfx][] = [];
  CHAPTERS.forEach(([p]) => ev.push([T(p) - 0.15, "swoosh"]));
  const q = TW("most", T("Quick, which one")) + 0.3;
  ev.push(
    [T("You've said it."), "pop"],
    [T("It was ten dollars.") + 0.5, "pop"],
    [TW("$4", T("$4.99.") - 0.1), "pop"],
    [T("Too late."), "pop"],
    [T("Some people saw it for $34"), "pop"],
    [T("Some saw $39."), "pop"],
    [T("Some saw $44."), "pop"],
    [q, "tick"],
    [q + 0.7, "tick"],
    [q + 1.4, "tick"],
    [T("Nope."), "pop"],
    [T("At $39, the dress") + 0.6, "cash"],
    [T('It says "deal."'), "pop"],
    [TW("billion", T("The company lost almost")), "pop"],
    [TW("mistake", T("And the CEO admitted")), "pop"],
    [T("it did better at a round"), "cash"],
    [T("it did better at $98"), "cash"],
    [T("About two hundred"), "pop"],
    [TW("problem", T("with real money")), "pop"],
    [T("That's $720 a year.") + 0.2, "cash"],
    [T("For the store."), "pop"],
    [T("Call it the Round-Up Rule."), "pop"],
    [T("$14.99 a month is about") + 0.6, "cash"],
    [T("It's ten."), "pop"],
  );
  return ev.sort((a, b) => a[0] - b[0]);
};
const SFX = sfx();

// ------------------------------------------------------------------ evidence shots: real pages (screenshotted from the
// source sites, see the script's Sources) slide in, the camera pushes into the key line, a highlighter sweeps it, and a
// red callout names the number. Only pages that say exactly what the voice says.
type EvDef = { id: string; a: number; b: number; hl: number; source: string; call: string; zoom?: number };
const EV = EV_JSON as unknown as Record<string, { w: number; h: number; hl: [number, number, number, number][] }>;
const EVIDENCE: EvDef[] = [
  { id: "sd2005", a: T("In 2005") + 0.9, b: T("When one cent changed the first") - 0.2, hl: T("In 2005") + 2.4, source: "SCIENCEDAILY, 2005 (THOMAS & MORWITZ)", call: "$3.00 -> $2.99" },
  { id: "livesci", a: T("They raised the price by five") - 0.1, b: T("Because a 9 at the end") - 0.1, hl: T("They raised the price by five") + 0.5, source: "LIVE SCIENCE (ANDERSON & SIMESTER)", call: "+1/3 SALES" },
  { id: "jck", a: T("The company lost almost") - 0.1, b: T("And the CEO admitted") + 0.1, hl: T("The company lost almost") + 0.3, source: "JCK, FEB 2013", call: "-$1 BILLION", zoom: 1.08 },
  { id: "sd2015", a: T("In 2015, researchers") + 0.3, b: T("When people were buying a camera") - 0.15, hl: T("In 2015, researchers") + 1.6, source: "SCIENCEDAILY, 2015 (WADHWA & ZHANG)", call: "$100 VS $98.76" },
  { id: "nber", a: T("Economists looked at more") + 0.2, b: T("People whose whole job") - 0.1, hl: T("Economists looked at more") + 1.4, source: "NBER WORKING PAPER 17030", call: "22 MILLION CARS" },
  { id: "nber210", a: T("One extra mile.") - 0.1, b: T("Because 79,999 reads") + 1.8, hl: T("One extra mile.") + 0.6, source: "NBER (LACETERA, POPE & SYDNOR)", call: "+$210" },
  { id: "stat", a: T("researchers looked at about 70,000") - 0.1, b: T("They compared people") - 0.15, hl: T("researchers looked at about 70,000") + 0.6, source: "STAT NEWS, FEB 2020", call: "SAME TRICK?", zoom: 1.06 },
];
const Evidence: React.FC<{ t: number }> = ({ t }) => {
  const e = EVIDENCE.find((x) => t >= x.a && t < x.b);
  if (!e) return null;
  const d = EV[e.id];
  const o = clamp((t - e.a) / 0.3) * clamp((e.b - t) / 0.3);
  const k = Math.min(1150 / d.w, 700 / d.h); // display scale: about 60% of the frame, the scene stays visible
  const cw = d.w * k;
  const ch = d.h * k;
  const x0 = 1920 - cw - 150;
  const y0 = (1080 - ch) / 2 - 20;
  const u = d.hl.reduce((m, r) => [Math.min(m[0], r[0]), Math.min(m[1], r[1]), Math.max(m[2], r[0] + r[2]), Math.max(m[3], r[1] + r[3])], [1e9, 1e9, -1e9, -1e9]);
  const cx = x0 + ((u[0] + u[2]) / 2) * k;
  const cy = y0 + ((u[1] + u[3]) / 2) * k;
  const zMax = e.zoom ?? Math.min(1.25, Math.max(1.08, 1100 / ((u[2] - u[0]) * k)));
  const z = 1 + (zMax - 1) * inOut((t - e.a - 0.5) / 1.3);
  const slide = ease((t - e.a) / 0.45);
  const lines = d.hl.length;
  const per = Math.min(0.45, 1.6 / lines);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <AbsoluteFill style={{ background: "rgba(27,31,46,0.22)" }} />
      <div style={{ position: "absolute", inset: 0, transformOrigin: `${cx}px ${cy}px`, transform: `scale(${z}) translate(0px, ${(1 - slide) * 60}px)` }}>
        <div style={{ position: "absolute", left: x0, top: y0, width: cw, height: ch, borderRadius: 18, overflow: "hidden", boxShadow: "0 24px 60px rgba(0,0,0,0.35)", transform: "rotate(-0.6deg)", background: "#fff" }}>
          <Img src={staticFile(`coinflip/ev/${e.id}.png`)} style={{ width: cw, height: ch }} />
          {d.hl.map((r, i) => {
            const p = clamp((t - e.hl - i * per) / per);
            return p > 0 ? <div key={i} style={{ position: "absolute", left: r[0] * k, top: r[1] * k, width: r[2] * k * p, height: r[3] * k, background: "rgba(245,184,46,0.45)", borderRadius: 4, mixBlendMode: "multiply" }} /> : null;
          })}
        </div>
      </div>
      <div style={{ position: "absolute", left: 60, bottom: 40, background: INK, color: SOFT, fontFamily: "Poppins", fontWeight: 800, fontSize: 26, padding: "10px 22px", borderRadius: 30, letterSpacing: 1 }}>SOURCE: {e.source}</div>
      {t > e.hl + lines * per ? (
        <div
          style={{
            position: "absolute",
            right: 70,
            bottom: 50,
            fontFamily: "Poppins",
            fontWeight: 800,
            fontSize: 64,
            color: "#fff",
            background: RED,
            border: `6px solid ${INK}`,
            borderRadius: 24,
            padding: "8px 30px",
            transform: `rotate(-4deg) scale(${0.85 + 0.15 * ease((t - e.hl - lines * per) / 0.25)})`,
            boxShadow: "0 10px 0 rgba(0,0,0,0.25)",
          }}
        >
          {e.call}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

const EndCard: React.FC<{ t: number }> = ({ t }) => {
  const o = on(t, T("And now you'll notice.") + 1.6, 0.5);
  if (o <= 0) return null;
  return (
    <AbsoluteFill style={{ background: PAPER, opacity: o, alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 40 }}>
      <Img src={staticFile("coinflip/pfp.png")} style={{ width: 420, height: 420, borderRadius: "50%", border: `8px solid ${INK}`, transform: `scale(${0.94 + 0.06 * o})` }} />
      <div style={{ fontFamily: "Poppins", fontWeight: 800, fontSize: 80, color: INK }}>COINFLIP MIND</div>
    </AbsoluteFill>
  );
};

export const Ep2: React.FC<{ audio?: boolean }> = ({ audio = true }) => {
  const ready = useFonts();
  const t = useCurrentFrame() / EP2_FPS;
  if (!ready) return <AbsoluteFill style={{ background: PAPER }} />;
  return (
    <AbsoluteFill style={{ background: PAPER, fontFamily: "Poppins" }}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080">
        <g transform="translate(960 540) scale(1.15) translate(-960 -480)">
          {SCENES.map(([, S], i) => {
            const [a, b] = RANGES[i];
            const op = i === 0 ? clamp((b - t) / 0.25) : win(t, a, b);
            const k = 1 + 0.035 * clamp((t - a) / Math.max(1, b - a));
            return op > 0 ? (
              <g key={i} opacity={op} transform={`translate(960 480) scale(${k}) translate(-960 -480)`}>
                <S t={t} />
              </g>
            ) : null;
          })}
        </g>
        <ChapterPill t={t} />
      </svg>
      <Evidence t={t} />
      <EndCard t={t} />
      {audio ? <Audio src={staticFile("coinflip/coinflip-ep2-vo.wav")} volume={0.74} /> : null}
      {audio
        ? [...SFX, ...EVIDENCE.flatMap((e): [number, Sfx][] => [[e.a, "swoosh"], [e.hl + Math.min(0.45, 1.6 / EV[e.id].hl.length) * EV[e.id].hl.length, "pop"]])].map(([at, k], i) => (
            <Sequence key={i} from={Math.max(0, Math.round(at * EP2_FPS))} durationInFrames={30}>
              <Audio src={staticFile(`coinflip/sfx/${k}.wav`)} volume={VOL[k]} />
            </Sequence>
          ))
        : null}
    </AbsoluteFill>
  );
};
