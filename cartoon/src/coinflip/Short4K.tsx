// Coinflip Mind, Short 4 as a fast kinetic edit (1080×1920). The words ARE the visuals: a hard cut to a new
// full-screen colour card on every phrase, each word slams in as it is spoken, money figures count up and burst,
// a punch-in on every cut, a full-screen 3-2-1 in the guess pause. Same VO and word timings as Short4.
import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { useFonts } from "../inkbeat/core/frame";
import WORDS_JSON from "./short4-capwords.json";
import { Crown, Stack } from "./Short4";
import { clamp, ease, GOLD, GREEN, INK, RED } from "./Ep1Test";

export const SH4K_FPS = 30;
const END = 33.0;
export const SH4K_FRAMES = Math.ceil(END * SH4K_FPS);
const WORDS = WORDS_JSON as unknown as [string, number, number][];
const BLUE = "#4f6bff";
const PAPER = "#fbf6ec";

type Extra = "stacks" | "crown" | "stop" | "ageFriend" | "ageYou" | "curve" | "lost";
// [first word, last word, background, extra]
const CARDS: [number, number, string, Extra?][] = [
  [0, 2, INK, "stacks"],
  [3, 4, RED],
  [5, 8, INK],
  [9, 10, GREEN],
  [11, 14, INK],
  [15, 16, GOLD, "ageFriend"],
  [17, 18, RED, "stop"],
  [19, 21, INK],
  [22, 25, BLUE, "ageYou"],
  [26, 27, INK],
  [28, 31, GREEN, "ageYou"],
  [32, 33, GOLD],
  [34, 36, RED],
  [37, 38, GREEN, "crown"],
  [39, 40, INK],
  [41, 42, BLUE],
  [43, 46, INK],
  [47, 50, RED, "lost"],
  [51, 53, INK],
  [54, 55, GREEN, "curve"],
  [56, 59, INK],
  [60, 62, GOLD],
  [63, 65, GREEN],
  [66, 67, INK],
  [68, 72, INK, "stacks"],
];
const MONEY: Record<string, string> = { "24,000": "$24K", "84,000": "$84K", "400,000": "$400K", "60,000": "$60K", "200": "$200", "360": "$360K" };
const show = (w: string) => {
  const core = w.replace(/[,.]+$/, "").replace(/\.$/, "");
  const q = core.endsWith("?") ? "?" : "";
  const c = core.replace("?", "");
  return (MONEY[c] ?? c.toUpperCase()) + q;
};
const start = (k: number) => WORDS[CARDS[k][0]][1];
// the guess pause: after "more?" ends, before "Your friend"
const P0 = WORDS[36][2] + 0.1;
const P1 = WORDS[37][1];

const lightBg = (bg: string) => bg === GOLD;

const Card: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  const [a, b, bg, extra] = CARDS[k];
  const t0 = start(k);
  const u = t - t0;
  const ink = lightBg(bg) ? INK : "#fff";
  const punch = 1.12 - 0.12 * ease(u / 0.15) + 0.04 * clamp(u / 2);
  const rot = (k % 2 ? 1.5 : -1.5) * (1 - ease(u / 0.3)) + (k % 2 ? 0.4 : -0.4);
  // lay words out in lines (rough width estimate)
  const ws = WORDS.slice(a, b + 1).map((w, i) => ({ i: a + i, txt: show(w[0]), at: w[1] }));
  const size = ws.length <= 1 ? 250 : ws.length === 2 ? 200 : ws.length === 3 ? 170 : 150;
  const lines: (typeof ws)[] = [[]];
  let wsum = 0;
  ws.forEach((w) => {
    const ww = (w.txt.length + 1.2) * size * 0.68;
    if (wsum + ww > 960 && lines[lines.length - 1].length) {
      lines.push([]);
      wsum = 0;
    }
    lines[lines.length - 1].push(w);
    wsum += ww;
  });
  const lh = size * 1.05;
  const y0 = 820 - ((lines.length - 1) * lh) / 2;
  return (
    <g>
      <rect x={0} y={0} width={1080} height={1920} fill={bg} />
      {/* moving stripes for texture */}
      <g opacity={0.07}>
        {Array.from({ length: 14 }, (_, s) => (
          <rect key={s} x={-600 + s * 180 + ((t * 120) % 180)} y={-200} width={70} height={2400} fill={lightBg(bg) ? INK : "#fff"} transform="rotate(20 540 960)" />
        ))}
      </g>
      <g transform={`translate(540 860) scale(${punch}) rotate(${rot}) translate(-540 -860)`}>
        {lines.map((ln, li) => {
          const widths = ln.map((w) => (w.txt.length + 1.0) * size * 0.68);
          const total = widths.reduce((s, x) => s + x, 0);
          let x = 540 - total / 2;
          return ln.map((w, wi) => {
            const cx = x + widths[wi] / 2;
            x += widths[wi];
            const v = t - w.at;
            if (v < -0.02) return null;
            // the very first word starts already landed, so the feed preview (frame 0) is clean
            const s = w.i === 0 ? 1 + 0.05 * Math.sin(t * 10) : 1.7 - 0.7 * ease(v / 0.12);
            const shake = w.i !== 0 && v < 0.18 ? Math.sin(v * 90) * 8 * (1 - v / 0.18) : 0;
            const money = w.txt.startsWith("$");
            const live = t < (WORDS[w.i + 1]?.[1] ?? 99);
            const col = money ? (bg === GREEN ? GOLD : bg === GOLD ? INK : GOLD) : live && !lightBg(bg) ? "#fff" : ink;
            const y = y0 + li * lh;
            return (
              <g key={w.i} transform={`translate(${cx + shake} ${y}) scale(${s * (money ? 1.15 : 1)})`}>
                <text textAnchor="middle" y={size * 0.35} fontFamily="Poppins" fontWeight={800} fontSize={size} letterSpacing={-3} fill={col} stroke={INK} strokeWidth={money || lightBg(bg) ? 0 : 0} paintOrder="stroke fill">
                  {money && v < 0.6 && (w.i === 40 || w.i === 42) ? w.txt.replace(/\d+/, (n) => String(Math.round(Number(n) * ease(v / 0.5)))) : w.txt}
                </text>
                {money && w.i !== 0
                  ? Array.from({ length: 14 }, (_, p) => {
                      const ang = (p / 14) * Math.PI * 2;
                      const r = 60 + 360 * ease(v / 0.5);
                      return v < 0.6 ? <rect key={p} x={r * Math.cos(ang) - 10} y={r * Math.sin(ang) - 10} width={20} height={20} rx={4} fill={[GOLD, "#fff", GREEN][p % 3]} opacity={1 - v / 0.6} transform={`rotate(${p * 40 + v * 400} ${r * Math.cos(ang)} ${r * Math.sin(ang)})`} /> : null;
                    })
                  : null}
              </g>
            );
          });
        })}
      </g>
      <Extras t={t} u={u} extra={extra} />
    </g>
  );
};

const Extras: React.FC<{ t: number; u: number; extra?: Extra }> = ({ t, u, extra }) => {
  if (!extra) return null;
  if (extra === "stacks") {
    const wob = 6 * Math.sin(u * 8) + (u > 1.0 ? Math.min(20, (u - 1.0) * 30) : 0);
    return (
      <g transform="translate(0 360)">
        <Stack x={330} y={1150} h={5} s={0.85} />
        <Crown x={330} y={990} s={0.9} />
        <g transform={`rotate(${wob} 760 1150)`}>
          <Stack x={760} y={1150} h={16} s={0.85} />
        </g>
      </g>
    );
  }
  if (extra === "crown") {
    const d = ease(u / 0.3);
    return <Crown x={540} y={560 - 200 * (1 - d)} s={2.2} />;
  }
  if (extra === "stop") {
    const s = 1.6 - 0.6 * ease(u / 0.15);
    return (
      <g transform={`translate(540 1300) scale(${s})`}>
        <path d="M -95 -39 L -39 -95 L 39 -95 L 95 -39 L 95 39 L 39 95 L -39 95 L -95 39 Z" fill="#fff" stroke={INK} strokeWidth={8} />
        <path d="M -82 -34 L -34 -82 L 34 -82 L 82 -34 L 82 34 L 34 82 L -34 82 L -82 34 Z" fill={RED} />
        <text textAnchor="middle" y={20} fontFamily="Poppins" fontWeight={800} fontSize={56} fill="#fff">
          STOP
        </text>
      </g>
    );
  }
  if (extra === "ageFriend" || extra === "ageYou") {
    const from = extra === "ageFriend" ? 20 : 30;
    const to = extra === "ageFriend" ? 30 : 65;
    const n = Math.round(from + (to - from) * clamp(u / 1.6));
    return (
      <g transform="translate(540 1330)">
        <rect x={-220} y={-80} width={440} height={140} rx={70} fill={INK} stroke="#fff" strokeWidth={6} />
        <text textAnchor="middle" y={22} fontFamily="Poppins" fontWeight={800} fontSize={80} fill={GOLD}>
          AGE {n}
        </text>
      </g>
    );
  }
  if (extra === "curve") {
    const draw = clamp(u / 0.9);
    const pts: string[] = [];
    for (let k = 0; k <= 40 && k / 40 <= draw; k++) pts.push(`${190 + k * 17.5},${1450 - 330 * (Math.pow(1.07, (k / 40) * 45) - 1) / (Math.pow(1.07, 45) - 1)}`);
    return pts.length > 1 ? <path d={`M ${pts.join(" L ")}`} fill="none" stroke="#fff" strokeWidth={20} strokeLinecap="round" strokeLinejoin="round" /> : null;
  }
  if (extra === "lost") {
    const v = t - WORDS[49][1];
    if (v < 0) return null;
    const s = 1.8 - 0.8 * ease(v / 0.12);
    return (
      <g transform={`translate(540 1330) rotate(-8) scale(${s})`}>
        <rect x={-260} y={-80} width={520} height={150} rx={20} fill="none" stroke="#fff" strokeWidth={12} />
        <text textAnchor="middle" y={30} fontFamily="Poppins" fontWeight={800} fontSize={96} fill="#fff">
          STILL LOST
        </text>
      </g>
    );
  }
  return null;
};

const Countdown: React.FC<{ t: number }> = ({ t }) => {
  const step = Math.min(2, Math.floor(((t - P0) / (P1 - P0)) * 3));
  const u = t - (P0 + (step * (P1 - P0)) / 3);
  const s = 1.6 - 0.6 * ease(u / 0.12);
  return (
    <g>
      <rect x={0} y={0} width={1080} height={1920} fill={[INK, RED, INK][step]} />
      <text x={540} y={1000} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={520} fill={step === 1 ? "#fff" : GOLD} transform={`translate(540 860) scale(${s}) translate(-540 -860)`}>
        {3 - step}
      </text>
      <text x={540} y={1350} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={70} fill="#fff">
        GUESS!
      </text>
    </g>
  );
};

type Sfx = "pop" | "tick" | "swoosh" | "cash";
const SFX: [number, Sfx, number][] = [
  ...CARDS.map((c, k): [number, Sfx, number] => [start(k) - 0.04, "swoosh", 0.07]),
  ...WORDS.filter((w) => MONEY[w[0].replace(/[,.?]+$/, "")]).map((w): [number, Sfx, number] => [w[1], "pop", 0.16]),
  [P0, "tick", 0.24],
  [P0 + (P1 - P0) / 3, "tick", 0.24],
  [P0 + (2 * (P1 - P0)) / 3, "tick", 0.24],
  [WORDS[40][1], "cash", 0.2],
];

export const Short4K: React.FC<{ audio?: boolean }> = ({ audio = true }) => {
  const ready = useFonts();
  const t = useCurrentFrame() / SH4K_FPS;
  if (!ready) return <AbsoluteFill style={{ background: INK }} />;
  const inPause = t >= P0 && t < P1;
  let k = 0;
  for (let i = 0; i < CARDS.length; i++) if (t >= start(i) - 0.02) k = i;
  return (
    <AbsoluteFill style={{ background: INK }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        {inPause ? <Countdown t={t} /> : <Card t={t} k={k} />}
        {/* the assumption, small and always honest during the numbers */}
        {t > WORDS[32][1] && t < WORDS[47][1] ? (
          <text x={540} y={1560} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={30} fill={PAPER} opacity={0.75}>
            assumes 7% a year, not a promise
          </text>
        ) : null}
      </svg>
      {audio ? <Audio src={staticFile("coinflip/short4-vo.wav")} volume={0.85} /> : null}
      {audio
        ? SFX.map(([at, s, v], i) => (
            <Sequence key={i} from={Math.max(0, Math.round(at * SH4K_FPS))} durationInFrames={30}>
              <Audio src={staticFile(`coinflip/sfx/${s}.wav`)} volume={v} />
            </Sequence>
          ))
        : null}
    </AbsoluteFill>
  );
};
