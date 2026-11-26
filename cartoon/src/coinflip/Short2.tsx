// Coinflip Mind, Short 2: "Who did you tell your dream to?" (1080×1920, ~42 s). Same look as Short 1 and Ep2.
// Built to hold attention: the first frame asks the question, the answer ("the one you'd never suspect") is held back
// until ~23 s, and the last line asks the opening question again so it loops. Timed from short2-caps/short2-words.
// Content stays between y≈260 and y≈1400 (captions at 1450, Shorts UI below).
import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { useFonts } from "../inkbeat/core/frame";
import CAPS_JSON from "./short2-caps.json";
import WORDS_JSON from "./short2-words.json";
import { Check, Cross, Stamp, StarIcon, Stranger, Txt } from "./Ep1";
import { bob, Bubble, Guy, Heart, In } from "./Ep2";
import { Big, Brain, clamp, ease, GOLD, GREEN, INK, inOut, on, PAPER, RED, win } from "./Ep1Test";

export const SH2_FPS = 30;
const END = 41.8;
export const SH2_FRAMES = Math.ceil(END * SH2_FPS);
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

/** the four people you told: silhouettes with question marks (hook and loop ending) */
const Suspects: React.FC<{ t: number; glow?: number; spot?: number }> = ({ t, glow = 0, spot = -1 }) => (
  <g>
    {[0, 1, 2, 3].map((k) => {
      const x = 290 + (k % 2) * 500;
      const y = 760 + Math.floor(k / 2) * 480;
      return (
        <g key={k} transform={`translate(0 ${bob(t, k, 5)})`}>
          {spot === k ? <circle cx={x} cy={y - 60} r={210} fill={GOLD} opacity={0.35} /> : null}
          <Stranger x={x} y={y} s={0.8} />
          {glow > 0 ? <circle cx={x} cy={y - 160} r={78} fill="none" stroke={RED} strokeWidth={10} opacity={glow * (0.6 + 0.4 * Math.sin(t * 8 + k))} /> : null}
        </g>
      );
    })}
  </g>
);

const S_Hook: SC = ({ t }) => (
  <g>
    <g transform={`translate(540 290) scale(${1 + 0.08 * Math.max(0, 1 - t / 0.3)}) translate(-540 -290)`}>
      <Big x={540} y={330} text="WHO DID" color={INK} size={130} />
      <Big x={540} y={470} text="YOU TELL?" color={RED} size={130} />
    </g>
    <Suspects t={t} glow={on(t, TW("reason", 1), 0.4)} />
  </g>
);

const S_NotHaters: SC = ({ t }) => (
  <g>
    <Txt x={540} y={360} size={80}>
      NOT THE HATERS.
    </Txt>
    <g transform="translate(540 900)">
      <ellipse cx={0} cy={150} rx={150} ry={22} fill={INK} opacity={0.12} />
      <path d="M -30 40 L -36 150 M 30 40 L 36 150" stroke={INK} strokeWidth={10} strokeLinecap="round" />
      <rect x={-62} y={-120} width={124} height={170} rx={52} fill="#5a3d6b" stroke={INK} strokeWidth={7} />
      <circle cy={-200} r={82} fill="#b48ad1" stroke={INK} strokeWidth={7} />
      <path d="M -50 -240 L -12 -222 M 50 -240 L 12 -222" stroke={INK} strokeWidth={8} strokeLinecap="round" />
      <path d="M -30 -165 Q 0 -185 30 -165" fill="none" stroke={INK} strokeWidth={7} strokeLinecap="round" />
      <path d="M -70 -260 L -50 -300 L -30 -262 M 70 -260 L 50 -300 L 30 -262" fill="#b48ad1" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    </g>
    <In t={t} at={TW("haters", T("And no")) + 0.2} dy={0} d={0.2}>
      <Cross x={540} y={760} s={3.4} />
    </In>
  </g>
);

const S_Mom: SC = ({ t }) => (
  <g>
    <Guy x={540} y={1020} s={1.1} mood="worried" pose="chin" shirt="#ff8fab">
      <path d="M -82 -220 Q -95 -120 -60 -90 M 82 -220 Q 95 -120 60 -90" fill="none" stroke="#3b2a20" strokeWidth={22} strokeLinecap="round" />
    </Guy>
    <Txt x={540} y={330} size={56} color="#999">
      MOM
    </Txt>
    <In t={t} at={TW("careful", T("Sure, your mom")) - 0.3} dx={-30} dy={0}>
      <Bubble x={540} y={480} w={600} h={140}>
        <Txt x={540} y={502} size={64}>
          "Be careful."
        </Txt>
      </Bubble>
    </In>
  </g>
);

const S_Uncle: SC = ({ t }) => {
  const a = T("Your uncle said");
  const lost = TW("lost", a);
  return (
    <g>
      <Guy x={420} y={1020} s={1.05} mood="neutral" pose="point" old />
      <Txt x={420} y={330} size={56} color="#999">
        UNCLE
      </Txt>
      <In t={t} at={TW("buddy", a) - 0.3} dx={-30} dy={0}>
        <Bubble x={560} y={480} w={760} h={140}>
          <Txt x={560} y={502} size={52}>
            {t > lost ? '"Lost everything."' : '"My buddy tried that."'}
          </Txt>
        </Bubble>
      </In>
      <In t={t} at={TW("buddy", a) + 0.2} dx={60} dy={0}>
        <g opacity={0.55}>
          <Stranger x={860} y={1060} s={0.55} />
        </g>
        <Txt x={860} y={1250} size={30} color="#999">
          THE BUDDY (UNVERIFIED)
        </Txt>
      </In>
    </g>
  );
};

const S_Lol: SC = ({ t }) => {
  const a = T("Your coworker");
  return (
    <g>
      <Guy x={540} y={1020} s={1.1} mood="neutral" pose="phone" shirt={GREEN}>
        <rect x={92} y={-130} width={70} height={120} rx={14} fill={INK} transform="rotate(10 127 -70)" />
      </Guy>
      <Txt x={540} y={330} size={56} color="#999">
        COWORKER
      </Txt>
      <In t={t} at={TW("lol", a) - 0.2} dy={0} d={0.2}>
        <Bubble x={540} y={500} w={360} h={150}>
          <Txt x={540} y={526} size={80}>
            "lol"
          </Txt>
        </Bubble>
      </In>
      <Stamp x={540} y={1330} text="OUT LOUD." t={t} at={TW("loud", a)} size={64} rot={-5} />
    </g>
  );
};

const S_Weigh: SC = ({ t }) => {
  const a = T("Those hurt.");
  const tip = inOut((t - TW("over", a)) / 0.8) * 16;
  return (
    <g>
      <In t={t} at={a + 0.6}>
        <Brain x={540} y={430} s={0.6} />
      </In>
      <g transform={`rotate(${tip} 540 900)`}>
        <rect x={140} y={885} width={800} height={30} rx={15} fill={INK} />
        <In t={t} at={TW("careful", a) - 0.2} dy={-60}>
          <rect x={150} y={760} width={290} height={120} rx={20} fill={RED} stroke={INK} strokeWidth={6} />
          <Txt x={295} y={838} size={40} color="#fff">
            "BE CAREFUL"
          </Txt>
        </In>
        {[0, 1, 2, 3, 4].map((k) => (
          <In key={k} t={t} at={TW("five", a) + k * 0.1} dy={-60}>
            <Heart x={690 + (k % 3) * 80} y={820 - Math.floor(k / 3) * 70} s={0.32} fill={GREEN} />
          </In>
        ))}
      </g>
      <path d="M 540 900 L 480 1060 L 600 1060 Z" fill="#9aa3b5" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <In t={t} at={TW("compliments", a)} dy={0}>
        <Txt x={540} y={1220} size={52}>
          1 BAD BEATS 5 GOOD
        </Txt>
      </In>
    </g>
  );
};

const S_Suspect: SC = ({ t }) => {
  const a = T("But the person who really");
  const spot = Math.floor(clamp((t - a) / 2.8) * 6) % 4;
  return (
    <g>
      <rect x={-100} y={-100} width={1280} height={2200} fill="#2b2f4a" opacity={0.85} />
      <Suspects t={t} spot={spot} />
      <Txt x={540} y={340} size={60} color="#fff">
        THE ONE YOU'D
      </Txt>
      <Txt x={540} y={430} size={70} color={GOLD}>
        NEVER SUSPECT
      </Txt>
    </g>
  );
};

const S_Reveal: SC = ({ t }) => {
  const a = T("The one who said");
  const s = ease((t - a) / 0.35);
  return (
    <g>
      {Array.from({ length: 28 }, (_, k) => {
        const u = t - a;
        const x = 540 + ((k * 97) % 900) - 450 + 30 * Math.sin(u * 3 + k);
        const y = 250 + u * (200 + (k % 5) * 50) - 100 + ((k * 53) % 120);
        return u > 0 && y < 1350 ? <rect key={k} x={x} y={y} width={20} height={11} rx={2} fill={[RED, GOLD, GREEN, BLUE][k % 4]} transform={`rotate(${u * 300 + k * 40} ${x + 10} ${y + 5})`} /> : null;
      })}
      <g transform={`translate(540 1020) scale(${0.85 + 0.15 * s}) translate(-540 -1020)`}>
        <Guy x={540} y={1020} s={1.1} mood="happy" pose="up" shirt="#ff9f6e" />
      </g>
      <Txt x={540} y={330} size={56} color="#999">
        YOUR BEST FRIEND
      </Txt>
      <In t={t} at={TW("huge", a) - 0.8} dy={0} d={0.25}>
        <Bubble x={540} y={490} w={820} h={150}>
          <Txt x={540} y={514} size={56}>
            "You're gonna be huge!"
          </Txt>
        </Bubble>
      </In>
      <Stamp x={540} y={1330} text="SUSPECT #1" t={t} at={TW("huge", a) + 0.3} size={70} rot={-6} />
    </g>
  );
};

const S_Study: SC = ({ t }) => {
  const a = T("In a 2009 study");
  const less = TW("less", a);
  const g1 = ease((t - a - 1.2) / 0.8);
  const g2 = ease((t - less) / 0.8);
  return (
    <g>
      <Txt x={540} y={330} size={70}>
        2009 STUDY
      </Txt>
      <Txt x={540} y={400} size={34} color="#999">
        GOLLWITZER ET AL., PSYCHOLOGICAL SCIENCE
      </Txt>
      <path d="M 180 1200 L 900 1200" stroke={INK} strokeWidth={8} strokeLinecap="round" />
      <rect x={250} y={1200 - 520 * g1} width={220} height={520 * g1} rx={16} fill={GREEN} stroke={INK} strokeWidth={6} />
      <Txt x={360} y={1270} size={36}>
        GOAL IGNORED
      </Txt>
      <In t={t} at={TW("noticed", a)} dy={0}>
        <rect x={610} y={1200 - 300 * g2} width={220} height={Math.max(1, 300 * g2)} rx={16} fill={RED} stroke={INK} strokeWidth={6} />
        <Txt x={720} y={1270} size={36}>
          GOAL NOTICED
        </Txt>
      </In>
      <In t={t} at={less} dy={0}>
        <Txt x={720} y={840} size={56} color={RED}>
          DID LESS
        </Txt>
      </In>
    </g>
  );
};

const S_Premature: SC = ({ t }) => {
  const a = T("Being noticed");
  const crown = ease((t - TW("premature", a)) / 0.4);
  return (
    <g>
      <Guy x={540} y={1020} s={1.1} mood="happy" pose="up">
        <g transform={`translate(0 ${-300 - 200 * (1 - crown)})`} opacity={crown}>
          <path d="M -70 0 L -70 -60 L -35 -25 L 0 -75 L 35 -25 L 70 -60 L 70 0 Z" fill={GOLD} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        </g>
      </Guy>
      <Txt x={540} y={330} size={52}>
        "I'M BASICALLY
      </Txt>
      <Txt x={540} y={410} size={52}>
        ALREADY THERE."
      </Txt>
      <In t={t} at={TW("person", a)} dy={0}>
        <Txt x={540} y={1300} size={44} color={RED}>
          (THEY WEREN'T)
        </Txt>
      </In>
    </g>
  );
};

const S_Reward: SC = ({ t }) => {
  const a = T("You got the reward.");
  const w = a;
  return (
    <g>
      <In t={t} at={a} dx={-60} dy={0}>
        <StarIcon x={330} y={760} r={150} />
        <Txt x={330} y={1000} size={50}>
          REWARD
        </Txt>
        <Check x={330} y={1110} s={1.3} />
      </In>
      <In t={t} at={TW("work", w) - 0.4} dx={60} dy={0}>
        <g transform="translate(750 760)">
          <rect x={-120} y={-80} width={240} height={160} rx={20} fill="#9aa3b5" stroke={INK} strokeWidth={7} />
          <rect x={-40} y={-120} width={80} height={50} rx={10} fill="none" stroke={INK} strokeWidth={7} />
        </g>
        <Txt x={750} y={1000} size={50}>
          WORK
        </Txt>
        <Cross x={750} y={1110} s={1.2} />
      </In>
    </g>
  );
};

const S_Quiet: SC = ({ t }) => {
  const a = T("So build it quiet.");
  const share = TW("share", a);
  return (
    <g>
      <Guy x={420} y={1040} s={1.0} mood="happy" pose="rest">
        <path d="M -8 -160 L -8 -120" stroke={INK} strokeWidth={10} strokeLinecap="round" />
      </Guy>
      {[0, 1, 2, 3, 4].map((k) => (
        <In key={k} t={t} at={a + 0.3 + k * 0.25} dy={-80}>
          <rect x={700} y={1110 - k * 95} width={200} height={90} rx={10} fill={[RED, GOLD, GREEN, BLUE, RED][k]} stroke={INK} strokeWidth={6} />
        </In>
      ))}
      <Txt x={540} y={330} size={70}>
        BUILD IT QUIET
      </Txt>
      <In t={t} at={share} dy={0}>
        <rect x={140} y={400} width={800} height={100} rx={50} fill={INK} />
        <Txt x={540} y={468} size={48} color={GOLD}>
          RESULTS, NOT PLANS
        </Txt>
      </In>
    </g>
  );
};

const S_Again: SC = ({ t }) => (
  <g>
    <Big x={540} y={330} text="WHO DID" color={INK} size={130} />
    <Big x={540} y={470} text="YOU TELL?" color={RED} size={130} />
    <Suspects t={t} glow={on(t, T("Now think again.") + 1.0, 0.4)} />
  </g>
);

const SCENES: [string, SC][] = [
  ["Stop.", S_Hook],
  ["And no", S_NotHaters],
  ["Sure, your mom", S_Mom],
  ["Your uncle said", S_Uncle],
  ["Your coworker", S_Lol],
  ["Those hurt.", S_Weigh],
  ["But the person who really", S_Suspect],
  ["The one who said", S_Reveal],
  ["In a 2009 study", S_Study],
  ["Being noticed", S_Premature],
  ["You got the reward.", S_Reward],
  ["So build it quiet.", S_Quiet],
  ["Now think again.", S_Again],
];
const RANGES = SCENES.map(([p], i) => [i === 0 ? 0 : T(p) - 0.15, i + 1 < SCENES.length ? T(SCENES[i + 1][0]) - 0.15 : END + 1] as const);

type Sfx = "pop" | "tick" | "swoosh" | "cash" | "tap";
const VOL: Record<Sfx, number> = { pop: 0.17, tick: 0.22, swoosh: 0.15, cash: 0.2, tap: 0.25 };
const SFX: [number, Sfx][] = [
  [0, "pop"],
  [TW("haters", T("And no")) + 0.2, "pop"],
  [TW("loud", T("Your coworker")), "pop"],
  [TW("over", T("Those hurt.")), "swoosh"],
  [T("The one who said"), "cash"],
  [TW("huge", T("The one who said")) + 0.3, "pop"],
  [TW("less", T("In a 2009 study")), "pop"],
  [TW("premature", T("Being noticed")), "swoosh"],
  [TW("work", T("You got the reward.")) - 0.4, "pop"],
  [TW("share", T("So build it quiet.")), "pop"],
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
  if (k < 1) return null; // chunk 0 ("STOP.") sits on the title frame
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

export const Short2: React.FC<{ audio?: boolean; captions?: boolean }> = ({ audio = true, captions = true }) => {
  const ready = useFonts();
  const t = useCurrentFrame() / SH2_FPS;
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
      {audio ? <Audio src={staticFile("coinflip/short2-vo.wav")} volume={0.85} /> : null}
      {audio
        ? SFX.map(([at, k], i) => (
            <Sequence key={i} from={Math.max(0, Math.round(at * SH2_FPS))} durationInFrames={30}>
              <Audio src={staticFile(`coinflip/sfx/${k}.wav`)} volume={VOL[k]} />
            </Sequence>
          ))
        : null}
    </AbsoluteFill>
  );
};
