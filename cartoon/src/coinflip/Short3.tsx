// Coinflip Mind, Short 3: the credit card minimum trap (1080×1920, ~41 s). Same look as the other Shorts.
// Hook visual from frame 0, a guess with a 1.5 s pause and countdown, the double shock (19 years, $8,100 interest),
// the hopeful twist ($60 more a month), and a loop back to the guess. Math: $5,000 at 22% APR, minimum = interest + 1%
// of the balance ($25 floor) -> 230 months, $8,100 interest; $200/month -> 34 months, $1,750 interest.
import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { useFonts } from "../inkbeat/core/frame";
import CAPS_JSON from "./short3-caps.json";
import WORDS_JSON from "./short3-capwords.json";
import { Check, Coin, Stamp, Txt } from "./Ep1";
import { Guy, In } from "./Ep2";
import { Big, clamp, ease, GOLD, GREEN, INK, inOut, on, PAPER, RED, win } from "./Ep1Test";

export const SH3_FPS = 30;
const END = 41.0;
export const SH3_FRAMES = Math.ceil(END * SH3_FPS);
const CAPS = CAPS_JSON as unknown as [number, number, string][];
const WORDS = WORDS_JSON as unknown as [string, number, number][];
const BLUE = "#6c8cff";

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

const CreditCard: React.FC<{ x: number; y: number; s?: number; rot?: number; bal?: string }> = ({ x, y, s = 1, rot = 0, bal }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <ellipse cx={0} cy={210} rx={300} ry={26} fill={INK} opacity={0.12} />
    <rect x={-300} y={-185} width={600} height={370} rx={36} fill={BLUE} stroke={INK} strokeWidth={8} />
    <rect x={-300} y={-110} width={600} height={60} fill={INK} opacity={0.85} />
    <rect x={-240} y={-20} width={90} height={66} rx={10} fill={GOLD} stroke={INK} strokeWidth={4} />
    <Txt x={-240} y={130} size={40} color="#fff" anchor="start">
      **** **** **** 4242
    </Txt>
    {bal ? (
      <g>
        <rect x={20} y={-30} width={250} height={90} rx={14} fill="#fff" stroke={INK} strokeWidth={5} />
        <Txt x={145} y={30} size={50} color={RED}>
          {bal}
        </Txt>
      </g>
    ) : null}
  </g>
);

const Options: React.FC<{ t: number; at: number; lock?: number }> = ({ t, at, lock = 0 }) => (
  <g>
    {["1 YR", "5 YRS", "10 YRS", "20 YRS"].map((o, k) => (
      <In key={k} t={t} at={at + k * 0.12} dy={40}>
        <rect x={140 + (k % 2) * 420} y={620 + Math.floor(k / 2) * 230} width={380} height={190} rx={30} fill="#fff" stroke={INK} strokeWidth={7} />
        <Txt x={330 + (k % 2) * 420} y={740 + Math.floor(k / 2) * 230} size={72}>
          {o}
        </Txt>
      </In>
    ))}
    {lock > 0 ? (
      <g opacity={lock} transform="translate(540 1230)">
        <rect x={-70} y={-40} width={140} height={110} rx={18} fill={GOLD} stroke={INK} strokeWidth={7} />
        <path d="M -42 -40 L -42 -80 Q -42 -125 0 -125 Q 42 -125 42 -80 L 42 -40" fill="none" stroke={INK} strokeWidth={14} />
      </g>
    ) : null}
  </g>
);

const S_Hook: SC = ({ t }) => {
  const words: [string, string, number, number][] = [
    ["STOP", "stop", 330, 0],
    ["PAYING", "paying", 330, 1],
    ["THE", "the", 460, 0],
    ["MINIMUM", "minimum", 460, 1],
  ];
  const minAt = TW("minimum", 0);
  const swing = 10 * Math.exp(-t * 1.2) * Math.cos(t * 6) - 6;
  const punch = 1.12 - 0.12 * ease(t / 0.6);
  return (
    <g transform={`translate(540 860) scale(${punch}) translate(-540 -860)`}>
      {/* title: every word bounces as it is spoken */}
      {words.map(([w, key, y, k], n) => {
        const at = n === 0 ? 0 : TW(key, 0);
        const b = 1 + 0.25 * Math.max(0, 1 - Math.abs(t - at - 0.08) / 0.18);
        const x = n === 0 ? 300 : n === 1 ? 700 : n === 2 ? 250 : 650;
        return (
          <g key={n} transform={`translate(${x} ${y - 30}) scale(${b}) translate(${-x} ${-(y - 30)})`}>
            <Big x={x} y={y} text={w} color={k ? RED : INK} size={110} />
          </g>
        );
      })}
      <g transform={`translate(540 860) rotate(${swing}) translate(-540 -860)`}>
        <CreditCard x={540} y={860} s={1.2} bal="$5,000" />
      </g>
      {/* money leaking out of the card, the whole time */}
      {Array.from({ length: 10 }, (_, k) => {
        const u = (t * 0.8 + k / 10) % 1;
        const side = k % 2 ? 1 : -1;
        const x = 540 + side * (60 + 420 * u) + 25 * Math.sin(t * 3 + k);
        const y = 1080 + 120 * u + 160 * u * u;
        return (
          <g key={k} opacity={u < 0.75 ? 1 : (1 - u) / 0.25} transform={`translate(${x} ${y}) rotate(${side * u * 260 + k * 23}) scale(1.3)`}>
            <rect x={-55} y={-28} width={110} height={56} rx={6} fill="#9fe0b8" stroke={INK} strokeWidth={4} />
            <circle r={16} fill="none" stroke={INK} strokeWidth={3} />
            <Txt x={0} y={12} size={30}>
              $
            </Txt>
          </g>
        );
      })}
      <Stamp x={540} y={1060} text="MINIMUM" t={t} at={minAt} size={80} rot={-10} />
      <In t={t} at={TW("really", 0) - 0.2} dy={0} d={0.25}>
        <Txt x={540} y={1270} size={56}>
          WHAT IT REALLY COSTS
        </Txt>
      </In>
    </g>
  );
};

const S_Owe: SC = ({ t }) => {
  const a = T("You owe five");
  const months = Math.max(0, Math.floor((t - TW("minimum", a)) / 0.3));
  return (
    <g>
      <Guy x={330} y={1080} s={0.95} mood="neutral" pose="phone" />
      <CreditCard x={760} y={560} s={0.55} rot={6} bal="$5,000" />
      <In t={t} at={TW("minimum", a) - 0.2}>
        <g transform="translate(760 1010)">
          <rect x={-170} y={-150} width={340} height={300} rx={20} fill="#fff" stroke={INK} strokeWidth={7} />
          <rect x={-170} y={-150} width={340} height={80} rx={20} fill={RED} stroke={INK} strokeWidth={7} />
          <Txt x={0} y={-96} size={40} color="#fff">
            MONTH {Math.min(months + 1, 12)}
          </Txt>
          <Txt x={0} y={20} size={36}>
            PAID: MINIMUM
          </Txt>
          <Check x={0} y={90} s={0.8} />
        </g>
      </In>
    </g>
  );
};

const S_Guess: SC = ({ t }) => {
  const a = T("Guess how many");
  const lock = T("Lock it in.");
  const p0 = TW("in", lock + 0.2) + 0.3;
  const n = 3 - Math.floor((t - p0) / 0.5);
  return (
    <g>
      <Txt x={540} y={330} size={84}>
        HOW MANY YEARS
      </Txt>
      <Txt x={540} y={430} size={84} color={RED}>
        UNTIL YOU'RE FREE?
      </Txt>
      <Options t={t} at={a + 0.4} lock={on(t, lock, 0.3)} />
      {t > p0 && n >= 1 && n <= 3 ? (
        <g>
          <circle cx={880} cy={1230} r={80} fill={RED} stroke={INK} strokeWidth={7} />
          <Txt x={880} y={1262} size={90} color="#fff">
            {n}
          </Txt>
        </g>
      ) : null}
    </g>
  );
};

const S_Reveal: SC = ({ t }) => {
  const a = T("Nineteen years.");
  const slam = ease((t - a) / 0.18);
  const age = on(t, a + 0.5, 0.4);
  return (
    <g>
      <g transform={`translate(540 520) scale(${1.6 - 0.6 * slam}) translate(-540 -520)`} opacity={slam}>
        <Big x={540} y={560} text="19 YEARS" color={RED} size={200} />
      </g>
      <g opacity={1 - age}>
        <Guy x={540} y={1120} s={1.0} mood="shocked" pose="up" />
      </g>
      <g opacity={age}>
        <Guy x={540} y={1120} s={1.0} mood="worried" pose="rest" old />
      </g>
    </g>
  );
};

const S_Interest: SC = ({ t }) => {
  const a = T("At twenty-two percent");
  const minAt = TW("$140", a);
  const most = TW("most", a);
  const fill = ease((t - minAt - 0.4) / 0.8);
  return (
    <g>
      <In t={t} at={a}>
        <rect x={290} y={260} width={500} height={130} rx={65} fill={RED} stroke={INK} strokeWidth={7} />
        <Txt x={540} y={350} size={72} color="#fff">
          22% APR
        </Txt>
      </In>
      <In t={t} at={minAt - 0.3}>
        <Txt x={540} y={560} size={56}>
          YOUR MINIMUM: ~$142
        </Txt>
        <rect x={140} y={620} width={800} height={150} rx={20} fill="#fff" stroke={INK} strokeWidth={7} />
        <rect x={152} y={632} width={776 * 0.65 * fill} height={126} rx={14} fill={RED} />
        <rect x={152 + 776 * 0.65 * fill} y={632} width={776 * 0.35 * fill} height={126} rx={14} fill={GREEN} />
        <In t={t} at={most} dy={0}>
          <Txt x={400} y={850} size={44} color={RED}>
            $92 INTEREST
          </Txt>
          <Txt x={820} y={850} size={44} color={GREEN}>
            $50 DEBT
          </Txt>
        </In>
      </In>
      <Stamp x={540} y={1100} text="MOSTLY INTEREST" t={t} at={most + 0.4} size={70} rot={-5} />
    </g>
  );
};

const S_Total: SC = ({ t }) => {
  const a = T("By the time");
  const i8 = TW("$8,000", a);
  const g1 = ease((t - a - 0.4) / 0.6);
  const g2 = ease((t - i8) / 1.0);
  return (
    <g>
      <Txt x={540} y={330} size={70}>
        WHAT YOU PAY IN TOTAL
      </Txt>
      <path d="M 160 1150 L 920 1150" stroke={INK} strokeWidth={8} strokeLinecap="round" />
      <rect x={220} y={1150 - 400 * g1} width={260} height={400 * g1} rx={16} fill={GREEN} stroke={INK} strokeWidth={6} />
      <Txt x={350} y={1220} size={40}>
        THE $5,000
      </Txt>
      <In t={t} at={i8 - 0.2} dy={0}>
        <rect x={600} y={1150 - 650 * g2} width={260} height={Math.max(1, 650 * g2)} rx={16} fill={RED} stroke={INK} strokeWidth={6} />
        <Txt x={730} y={1220} size={40}>
          INTEREST
        </Txt>
        <Txt x={730} y={1150 - 650 * g2 - 30} size={60} color={RED}>
          ${Math.round(8100 * g2).toLocaleString("en-US")}
        </Txt>
      </In>
    </g>
  );
};

const S_Watch: SC = ({ t }) => {
  const a = T("Now watch this.");
  const p = inOut((t - TW("$200", a)) / 0.8);
  return (
    <g>
      <Txt x={540} y={330} size={80} color={GREEN}>
        NOW WATCH THIS
      </Txt>
      <rect x={140} y={700} width={800} height={60} rx={30} fill="#fff" stroke={INK} strokeWidth={7} />
      <rect x={152} y={712} width={300 + 300 * p} height={36} rx={18} fill={GREEN} />
      <circle cx={452 + 300 * p} cy={730} r={50} fill={GOLD} stroke={INK} strokeWidth={7} />
      <Txt x={452 + 300 * p} y={640} size={64}>
        ${Math.round(142 + 58 * p)}
      </Txt>
      <In t={t} at={TW("$60", a) - 0.2} dy={0}>
        <rect x={340} y={880} width={400} height={130} rx={65} fill={GREEN} stroke={INK} strokeWidth={7} />
        <Txt x={540} y={968} size={72} color="#fff">
          +$60
        </Txt>
      </In>
    </g>
  );
};

const S_Result: SC = ({ t }) => {
  const a = T("You're done in under");
  const g = ease((t - a - 0.3) / 1.0);
  const keep = TW("$6,000", a);
  return (
    <g>
      <Txt x={540} y={330} size={64}>
        TIME TO PAY IT OFF
      </Txt>
      <Txt x={140} y={500} size={40} anchor="start">
        MINIMUM
      </Txt>
      <rect x={140} y={530} width={800 * g} height={90} rx={20} fill={RED} stroke={INK} strokeWidth={6} />
      <Txt x={140 + 800 * g - 20} y={592} size={44} color="#fff" anchor="end">
        {g > 0.5 ? "19 YRS" : ""}
      </Txt>
      <Txt x={140} y={720} size={40} anchor="start">
        $200 A MONTH
      </Txt>
      <rect x={140} y={750} width={Math.max(1, 125 * g)} height={90} rx={20} fill={GREEN} stroke={INK} strokeWidth={6} />
      <Txt x={300} y={812} size={44} color={GREEN} anchor="start">
        {g > 0.5 ? "UNDER 3 YRS" : ""}
      </Txt>
      <In t={t} at={keep - 0.2} dy={40}>
        {[0, 1, 2].map((k) => (
          <Coin key={k} x={420 + k * 120} y={1060 - (k % 2) * 30} r={60} />
        ))}
        <Txt x={540} y={1220} size={64} color={GREEN}>
          KEEP ~$6,000
        </Txt>
      </In>
    </g>
  );
};

const S_Same: SC = ({ t }) => {
  const a = T("Same debt.");
  return (
    <g>
      <In t={t} at={a} dx={-60} dy={0}>
        <CreditCard x={330} y={620} s={0.5} rot={-6} bal="$5,000" />
      </In>
      <In t={t} at={TW("card", a) - 0.2} dx={60} dy={0}>
        <CreditCard x={750} y={620} s={0.5} rot={6} bal="$5,000" />
      </In>
      <Txt x={540} y={360} size={70}>
        SAME DEBT. SAME CARD.
      </Txt>
      <In t={t} at={TW("60", a) - 0.2} dy={0}>
        <Big x={540} y={1100} text="$60" color={GOLD} size={260} />
      </In>
    </g>
  );
};

const S_Outro: SC = ({ t }) => {
  const a = T("So, what was your guess");
  return (
    <g>
      <Txt x={540} y={330} size={84}>
        WHAT WAS
      </Txt>
      <Txt x={540} y={430} size={84} color={RED}>
        YOUR GUESS?
      </Txt>
      <Options t={t} at={a - 0.2} />
    </g>
  );
};

const SCENES: [string, SC][] = [
  ["Stop paying", S_Hook],
  ["You owe five", S_Owe],
  ["Guess how many", S_Guess],
  ["Nineteen years.", S_Reveal],
  ["At twenty-two percent", S_Interest],
  ["By the time", S_Total],
  ["Now watch this.", S_Watch],
  ["You're done in under", S_Result],
  ["Same debt.", S_Same],
  ["So, what was your guess", S_Outro],
];
const RANGES = SCENES.map(([p], i) => [i === 0 ? 0 : T(p) - 0.15, i + 1 < SCENES.length ? T(SCENES[i + 1][0]) - 0.15 : END + 1] as const);

type Sfx = "pop" | "tick" | "swoosh" | "cash" | "tap";
const VOL: Record<Sfx, number> = { pop: 0.17, tick: 0.22, swoosh: 0.15, cash: 0.2, tap: 0.25 };
const P0 = TW("in", T("Lock it in.") + 0.2) + 0.3;
const SFX: [number, Sfx][] = [
  [0, "pop"],
  [T("Lock it in."), "pop"],
  [P0, "tick"],
  [P0 + 0.5, "tick"],
  [P0 + 1.0, "tick"],
  [T("Nineteen years."), "pop"],
  [TW("most", T("At twenty-two percent")) + 0.4, "pop"],
  [TW("$8,000", T("By the time")), "cash"],
  [TW("$60", T("Now watch this.")) - 0.2, "pop"],
  [TW("$6,000", T("You're done in under")) - 0.2, "cash"],
  [TW("60", T("Same debt.")) - 0.2, "pop"],
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

export const Short3: React.FC<{ audio?: boolean; captions?: boolean }> = ({ audio = true, captions = true }) => {
  const ready = useFonts();
  const t = useCurrentFrame() / SH3_FPS;
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
      {audio ? <Audio src={staticFile("coinflip/short3-vo.wav")} volume={0.85} /> : null}
      {audio
        ? SFX.map(([at, k], i) => (
            <Sequence key={i} from={Math.max(0, Math.round(at * SH3_FPS))} durationInFrames={30}>
              <Audio src={staticFile(`coinflip/sfx/${k}.wav`)} volume={VOL[k]} />
            </Sequence>
          ))
        : null}
    </AbsoluteFill>
  );
};
