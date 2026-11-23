// Coinflip Mind, Short 1: "Which picture are you?" (the two-circle test). 1080×1920, ~45 s.
// Same look and timing method as Ep1: scenes and beats come from short1-caps.json / short1-words.json (VO aligned).
// Content stays between y≈280 and y≈1400 so the Shorts UI (bottom bar, right-side buttons) never covers it.
import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { useFonts } from "../inkbeat/core/frame";
import CAPS_JSON from "./short1-caps.json";
import WORDS_JSON from "./short1-words.json";
import { Arrow, Card, Coin, Cross, LitBrain, Pair, Stamp, StarIcon, Strike, Stranger, Txt } from "./Ep1";
import { Big, clamp, GOLD, GREEN, INK, inOut, Jar, on, PAPER, Person, pop, RED, win } from "./Ep1Test";

export const SH1_FPS = 30;
const END = 45.5;
export const SH1_FRAMES = Math.ceil(END * SH1_FPS);
const CAPS = CAPS_JSON as unknown as [number, number, string][];
const WORDS = WORDS_JSON as unknown as [string, number, number][];

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

/** the four answer cards in a 2×2 grid; `hi` = index to highlight (-1 none) */
const GAPS = [250, 150, 80, 22];
const NAMES = ["FAR APART", "BARELY TOUCHING", "A LITTLE", "ALMOST ONE"];
const Grid: React.FC<{ t: number; at: number[]; hi?: number; y?: number }> = ({ t, at, hi = -1, y = 760 }) => (
  <g>
    {GAPS.map((g, i) => {
      const x = i % 2 ? 790 : 290;
      const yy = y + Math.floor(i / 2) * 440;
      return (
        <g key={i} style={pop(t, at[i])}>
          <Card x={x} y={yy} w={440} h={400} fill={hi === i ? "#fff4d6" : "#fff"} />
          {hi === i ? <rect x={x - 232} y={yy - 212} width={464} height={424} rx={30} fill="none" stroke={GOLD} strokeWidth={10} /> : null}
          <Pair x={x} y={yy - 20} gap={g} r={76} />
          <Txt x={x - 175} y={yy - 140} size={56} anchor="start">
            {"ABCD"[i]}
          </Txt>
          <Txt x={x} y={yy + 150} size={36}>
            {NAMES[i]}
          </Txt>
        </g>
      );
    })}
  </g>
);

const Hook: SC = ({ t }) => {
  const w = TW("Which", 0);
  return (
    <g>
      <g style={pop(t, 0)}>
        <Big x={540} y={330} text="STOP." color={RED} size={150} />
      </g>
      <g style={{ opacity: on(t, w) }}>
        <Txt x={540} y={470} size={62}>
          WHICH ONE ARE YOU?
        </Txt>
      </g>
      <Grid t={t} at={[w, w + 0.12, w + 0.24, w + 0.36]} />
    </g>
  );
};

const Answer: SC = ({ t }) => (
  <g>
    <Grid t={t} at={[0, 0, 0, 0]} />
    <Stamp x={540} y={380} text="WHY YOU CAN'T SAVE" t={t} at={T("Your answer") + 0.6} size={64} rot={-4} />
  </g>
);

const TwoCircles: SC = ({ t }) => {
  const other = T("The other is you");
  return (
    <g>
      <g style={{ opacity: on(t, T("One circle")) }}>
        <circle cx={540} cy={620} r={270} fill={GOLD} fillOpacity={0.45} stroke={INK} strokeWidth={7} />
        <Person x={540} y={740} s={0.8} mood="happy" />
        <Txt x={540} y={300} size={64}>
          YOU TODAY
        </Txt>
      </g>
      <g style={{ opacity: on(t, other) }}>
        <circle cx={540} cy={1170} r={270} fill="#6c8cff" fillOpacity={0.35} stroke={INK} strokeWidth={7} />
        <Person x={540} y={1290} s={0.8} mood="happy" old />
        <Txt x={540} y={1500} size={60}>
          YOU IN 10 YEARS
        </Txt>
      </g>
    </g>
  );
};

const Options: SC = ({ t }) => {
  const a = T("A: far apart");
  const at = [TW("far", a), TW("barely", a), TW("overlapping", a), TW("almost", T("D: almost"))];
  const hi = [...at].reverse().findIndex((x) => t >= x);
  return (
    <g>
      <Txt x={540} y={420} size={62}>
        WHICH ONE FEELS RIGHT?
      </Txt>
      <Grid t={t} at={at} hi={hi < 0 ? -1 : 3 - hi} />
    </g>
  );
};

const PickNow: SC = ({ t }) => {
  const a = T("Pick one.");
  const pulse = 1 + 0.04 * Math.sin((t - a) * 12);
  return (
    <g>
      <Grid t={t} at={[0, 0, 0, 0]} />
      <g style={{ ...pop(t, a), transformOrigin: "540px 400px" }} transform={`translate(540 400) scale(${pulse}) translate(-540 -400)`}>
        <Big x={540} y={430} text="PICK ONE. NOW." color={GOLD} size={100} />
      </g>
    </g>
  );
};

const Study: SC = ({ t }) => {
  const a = T("Researchers gave");
  const dots = on(t, TW("153", a), 1.0);
  return (
    <g>
      <g style={pop(t, TW("153", a))}>
        <Big x={540} y={400} text="153" color={GOLD} size={180} />
        <Txt x={540} y={480} size={52}>
          AMERICANS TOOK IT
        </Txt>
      </g>
      {Array.from({ length: 153 }, (_, i) => {
        const c = i % 9;
        const r = Math.floor(i / 9);
        return i / 153 < dots ? <circle key={i} cx={260 + c * 70} cy={600 + r * 46} r={17} fill={i % 3 ? "#6c8cff" : GOLD} stroke={INK} strokeWidth={3} /> : null;
      })}
    </g>
  );
};

const Saved: SC = ({ t }) => {
  const m = T("had saved more");
  return (
    <g>
      <Txt x={540} y={330} size={56} style={{ opacity: on(t, T("The ones whose")) }}>
        MORE OVERLAP = MORE SAVED
      </Txt>
      <g style={{ opacity: on(t, T("The ones whose")) }}>
        <Pair x={330} y={620} gap={70} r={120} />
        <Txt x={330} y={820} size={40}>
          OVERLAP
        </Txt>
        <Pair x={790} y={620} gap={250} r={100} />
        <Txt x={790} y={820} size={40}>
          FAR APART
        </Txt>
      </g>
      <g style={pop(t, TW("saved", m))}>
        <Jar x={330} y={1120} label="MORE" />
        <Coin x={330} y={1010} r={50} />
        <Coin x={300} y={1080} r={50} />
        <Coin x={370} y={1060} r={50} />
      </g>
      <g style={pop(t, TW("saved", m) + 0.2)}>
        <Jar x={790} y={1120} label="LESS" />
      </g>
    </g>
  );
};

const StrangerS: SC = ({ t }) => {
  const a = T("Why? Because");
  return (
    <g>
      <Person x={540} y={700} s={0.9} mood="neutral" />
      <Txt x={540} y={360} size={60}>
        YOU
      </Txt>
      <g style={{ opacity: on(t, TW("future", a)) }}>
        <Stranger x={540} y={1250} s={0.9} />
        <Txt x={540} y={1480} size={56}>
          FUTURE YOU
        </Txt>
      </g>
      <Stamp x={540} y={1050} text="STRANGER" t={t} at={TW("stranger", a)} size={90} rot={-8} />
    </g>
  );
};

const Scan: SC = ({ t }) => {
  const a = T("A Stanford");
  const b = T("Picturing you");
  return (
    <g>
      <g style={pop(t, a)}>
        <Txt x={540} y={330} size={60}>
          STANFORD BRAIN SCAN
        </Txt>
      </g>
      <g style={{ opacity: on(t, b) }}>
        <LitBrain x={540} y={640} s={0.9} glow={0.25} label="YOU IN 10 YEARS" />
      </g>
      <g style={pop(t, TW("like", b))}>
        <g fill="none" stroke={GOLD} strokeWidth={20} strokeLinecap="round">
          <path d="M 470 940 Q 505 912 540 940 T 610 940" />
          <path d="M 470 990 Q 505 962 540 990 T 610 990" />
        </g>
      </g>
      <g style={{ opacity: on(t, TW("celebrity", b)) }}>
        <LitBrain x={540} y={1240} s={0.9} glow={0.25} label="A CELEBRITY" />
        <StarIcon x={760} y={1110} r={50} />
      </g>
    </g>
  );
};

const Nobody: SC = ({ t }) => {
  const a = T("And nobody");
  return (
    <g>
      <Stranger x={540} y={820} s={1.0} />
      <g style={pop(t, TW("money", a))}>
        <Jar x={540} y={1240} />
        <Cross x={540} y={1200} s={2} />
      </g>
      <Txt x={540} y={380} size={56} style={{ opacity: on(t, a) }}>
        NOBODY SAVES FOR A STRANGER
      </Txt>
    </g>
  );
};

const PickedA: SC = ({ t }) => {
  const a = T("So if you picked A");
  return (
    <g>
      <g style={pop(t, TW("A", a + 0.4))}>
        <Card x={540} y={680} w={600} h={460} fill="#fff4d6" />
        <Pair x={540} y={650} gap={360} r={110} />
        <Txt x={300} y={520} size={80} anchor="start">
          A
        </Txt>
      </g>
      <g style={{ opacity: on(t, TW("willpower", a)) }}>
        <Txt x={540} y={1120} size={80}>
          WILLPOWER
        </Txt>
        <Strike x1={280} x2={800} y={1094} p={on(t, TW("willpower", a) + 0.3, 0.4)} />
        <Txt x={540} y={1240} size={52} color={RED}>
          NOT THE PROBLEM
        </Txt>
      </g>
    </g>
  );
};

const Distance: SC = ({ t }) => {
  const a = T("It's distance.");
  const shrink = inOut((t - TW("shrunk", a)) / 1.0);
  const gap = 560 - 380 * shrink;
  return (
    <g>
      <Pair x={540} y={760} gap={gap} r={190} />
      <g style={{ opacity: on(t, a) * (1 - shrink) }}>
        <Arrow x1={540 - gap / 2 + 30} y1={1020} x2={540 + gap / 2 - 30} y2={1020} />
        <Arrow x1={540 + gap / 2 - 30} y1={1020} x2={540 - gap / 2 + 30} y2={1020} />
        <Txt x={540} y={1120} size={70}>
          DISTANCE
        </Txt>
      </g>
      <g style={pop(t, TW("shrunk", a) + 0.6)}>
        <Txt x={540} y={1130} size={64} color={GREEN}>
          CAN BE SHRUNK
        </Txt>
      </g>
    </g>
  );
};

const Teaser: SC = ({ t }) => {
  const a = T("The full video");
  return (
    <g>
      <Txt x={540} y={360} size={60} style={{ opacity: on(t, a) }}>
        THE FULL VIDEO:
      </Txt>
      <g style={pop(t, TW("trick", a))}>
        <Txt x={540} y={450} size={52}>
          THE TRICK THAT ALMOST
        </Txt>
        <Big x={540} y={690} text="4×" color={GREEN} size={200} />
        <Txt x={540} y={790} size={52}>
          PEOPLE'S SAVINGS
        </Txt>
      </g>
      <g style={pop(t, TW("savings", a))}>
        <Jar x={540} y={1180} />
        {[0, 1, 2, 3].map((k) => (
          <Coin key={k} x={470 + (k % 2) * 140} y={1150 - Math.floor(k / 2) * 80} r={46} />
        ))}
      </g>
    </g>
  );
};

const Outro: SC = ({ t }) => {
  const a = T("So which picture");
  return (
    <g>
      <Txt x={540} y={420} size={62}>
        WHICH ONE ARE YOU?
      </Txt>
      <Grid t={t} at={[a, a + 0.1, a + 0.2, a + 0.3]} />
      <g style={pop(t, TW("Comment", a))}>
        <Stamp x={540} y={300} text="COMMENT A, B, C OR D" color={GREEN} t={t} at={TW("Comment", a)} size={56} rot={-3} />
      </g>
    </g>
  );
};

const SCENES: [string, SC][] = [
  ["Stop.", Hook],
  ["Your answer", Answer],
  ["One circle", TwoCircles],
  ["A: far apart", Options],
  ["Pick one.", PickNow],
  ["Researchers gave", Study],
  ["The ones whose", Saved],
  ["Why? Because", StrangerS],
  ["A Stanford", Scan],
  ["And nobody", Nobody],
  ["So if you picked A", PickedA],
  ["It's distance.", Distance],
  ["The full video", Teaser],
  ["So which picture", Outro],
];
const RANGES = SCENES.map(([p], i) => [i === 0 ? 0 : T(p) - 0.2, i + 1 < SCENES.length ? T(SCENES[i + 1][0]) - 0.2 : END + 1] as const);

type Sfx = "pop" | "tick" | "swoosh" | "cash" | "tap";
const VOL: Record<Sfx, number> = { pop: 0.18, tick: 0.22, swoosh: 0.16, cash: 0.2, tap: 0.25 };
const sfx = (): [number, Sfx][] => {
  const o = T("A: far apart");
  return [
    [0, "pop"],
    [TW("Which", 0), "pop"],
    [T("Your answer") + 0.6, "pop"],
    [T("One circle"), "pop"],
    [T("The other is you"), "pop"],
    [TW("far", o), "tick"],
    [TW("barely", o), "tick"],
    [TW("overlapping", o), "tick"],
    [TW("almost", T("D: almost")), "tick"],
    [T("Pick one."), "pop"],
    [TW("153", T("Researchers gave")), "pop"],
    [TW("saved", T("had saved more")), "cash"],
    [TW("stranger", T("Why? Because")), "pop"],
    [TW("money", T("And nobody")), "pop"],
    [TW("willpower", T("So if you picked A")) + 0.3, "swoosh"],
    [TW("shrunk", T("It's distance.")), "swoosh"],
    [TW("trick", T("The full video")), "cash"],
    [TW("Comment", T("So which picture")), "pop"],
  ];
};
const SFX = sfx();

export const Short1: React.FC<{ audio?: boolean; captions?: boolean }> = ({ audio = true, captions = true }) => {
  const ready = useFonts();
  const t = useCurrentFrame() / SH1_FPS;
  if (!ready) return <AbsoluteFill style={{ background: PAPER }} />;
  // a caption holds until the next one when the gap is short, so it never blinks off for a frame
  const line = CAPS.find(([a, b], i) => {
    const next = CAPS[i + 1]?.[0] ?? Infinity;
    return t >= a - 0.1 && t < (next - b < 0.8 ? next - 0.1 : b + 0.15);
  });
  return (
    <AbsoluteFill style={{ background: PAPER, fontFamily: "Poppins" }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        {SCENES.map(([, S], i) => {
          const [a, b] = RANGES[i];
          const op = i === 0 ? clamp((b - t) / 0.2) : win(t, a, b);
          const k = 1 + 0.03 * clamp((t - a) / Math.max(1, b - a));
          return op > 0 ? (
            <g key={i} style={{ opacity: op }} transform={`translate(540 860) scale(${k}) translate(-540 -860)`}>
              <S t={t} />
            </g>
          ) : null;
        })}
      </svg>
      {captions && line ? (
        <div style={{ position: "absolute", top: 1560, left: 70, right: 70, textAlign: "center" }}>
          <span style={{ display: "inline-block", padding: "14px 26px", background: "rgba(27,31,46,0.9)", color: "#fff", borderRadius: 18, fontWeight: 700, fontSize: 46, lineHeight: 1.25 }}>{line[2]}</span>
        </div>
      ) : null}
      {audio ? <Audio src={staticFile("coinflip/short1-vo.wav")} /> : null}
      {audio
        ? SFX.map(([at, k], i) => (
            <Sequence key={i} from={Math.max(0, Math.round(at * SH1_FPS))} durationInFrames={30}>
              <Audio src={staticFile(`coinflip/sfx/${k}.wav`)} volume={VOL[k]} />
            </Sequence>
          ))
        : null}
    </AbsoluteFill>
  );
};
