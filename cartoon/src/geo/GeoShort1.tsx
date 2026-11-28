// Geo Short 1 (vertical): "You choose which country gets deleted" - day 1 of a comment-driven deletion series.
import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { useFonts } from "../inkbeat/core/frame";
import { clamp, ease } from "../coinflip/Ep1Test";
import WORDS_JSON from "./short1-words.json";
import WORLD from "./world.json";
import { FLAGS, Host, INK } from "./GeoCast";

export const GS1_FPS = 30;
export const GS1_FRAMES = Math.ceil(19.75 * GS1_FPS);
const WORDS = WORDS_JSON as [string, number, number][];
const n = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const TW = (w: string, after = 0) => {
  const x = WORDS.find((y) => y[1] >= after - 0.05 && n(y[0]) === n(w));
  if (!x) throw new Error(`no word ${w}`);
  return x[1];
};
const RED = "#e8423a";
const GOLD = "#f5c518";
const DEAD = "#3b4263";
const COLORS = ["#f6c344", "#7cc56b", "#ff9b71", "#b590e0", "#4fc1a6", "#f7a1c4", "#e8d36a", "#8fd0ff"];
const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const WC = (WORLD.c as { n: string; lo: string; b: number[] }[]).map((c, i) => ({ ...c, col: COLORS[Math.floor(rnd(i + 3) * COLORS.length)], r: rnd(i) }));

const T = {
  delete: TW("delete"),
  comment: TW("comment"),
  tomorrow: TW("tomorrow"),
  deleted: TW("deleted,"),
  gone: TW("gone"),
  then: TW("then"),
  left: TW("left."),
  so: TW("so"),
  your: TW("your"),
  next: TW("next."),
  day: TW("day", 17),
  end: 19.75,
};
const LAST = WC.findIndex((c) => c.n === "Brazil"); // the "last one standing" in the montage (shown as ?)
const VICTIM = WC.findIndex((c) => c.n === "France"); // the example victim

const fillOf = (i: number, t: number) => {
  const c = WC[i];
  if (t >= T.day - 0.2) return c.col; // day 1 resets the map (loops to the start)
  const appear = clamp((t - (c.r * 1.5 - 0.4)) / 0.2);
  let col = appear < 1 ? (appear > 0 ? c.col : DEAD) : c.col;
  if (i === VICTIM && t >= T.deleted) col = t < T.deleted + 0.15 ? "#fff" : DEAD;
  if (t >= T.then && i !== LAST && i !== VICTIM) {
    const dz = T.then + 0.2 + c.r * (T.left - T.then - 0.4);
    if (t >= dz) col = t < dz + 0.12 ? "#fff" : DEAD;
  }
  if (i === LAST && t >= T.left) col = GOLD;
  return col;
};

const MapLayer: React.FC<{ t: number }> = ({ t }) => {
  let cx = 1000 + Math.sin(t * 0.25) * 60;
  let cy = 470;
  let z = 1.45;
  if (t >= T.gone - 0.3 && t < T.then) {
    const u = ease((t - T.gone + 0.3) / 0.5);
    cx += (975 - cx) * u;
    cy += (330 - cy) * u;
    z += (3.2 - z) * u;
  }
  if (t >= T.left && t < T.so) {
    const u = ease((t - T.left) / 0.5);
    cx += (640 - cx) * u;
    cy += (690 - cy) * u;
    z += (2.2 - z) * u;
  }
  const shake = t > T.delete && t < T.delete + 0.3 ? Math.sin(t * 90) * 10 : 0;
  return (
    <g transform={`translate(${540 + shake} 1000) scale(${z}) translate(${-cx} ${-cy})`}>
      <rect x={-400} y={-400} width={2800} height={1900} fill="#2a6fb0" />
      {WC.map((c, i) => (
        <path key={i} d={c.lo} fill={fillOf(i, t)} stroke={INK} strokeWidth={1.6 / z} strokeLinejoin="round" />
      ))}
    </g>
  );
};

const Card: React.FC<{ x: number; y: number; w: number; h: number; a: number; children: React.ReactNode }> = ({ x, y, w, h, a, children }) => (
  <g transform={`translate(${x} ${y + 60 * (1 - a)})`} opacity={a}>
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={34} fill="#fff" stroke={INK} strokeWidth={8} />
    {children}
  </g>
);
const Flag: React.FC<{ k: string; x: number; y: number; r: number }> = ({ k, x, y, r }) => (
  <g transform={`translate(${x} ${y}) scale(${r / 100})`}>
    <clipPath id={`sf${k}${x}${y}`}>
      <circle r={100} />
    </clipPath>
    <g clipPath={`url(#sf${k}${x}${y})`}>{FLAGS[k]}</g>
    <circle r={100} fill="none" stroke={INK} strokeWidth={10} />
  </g>
);

// "comment a country": a comment being typed, cycling countries
const CommentCard: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.comment - 0.2 || t > T.tomorrow) return null;
  const a = ease((t - T.comment + 0.2) / 0.25) * clamp((T.tomorrow - t) / 0.2);
  const opts: [string, string][] = [
    ["CANADA", "Canada"],
    ["BRAZIL", "Brazil"],
    ["JAPAN", "Japan"],
  ];
  const [k, nm] = opts[Math.min(2, Math.floor((t - T.comment) / 0.4))] ?? opts[0];
  return (
    <Card x={540} y={1000} w={900} h={260} a={a}>
      <circle cx={-350} cy={-40} r={44} fill="#8fd0ff" stroke={INK} strokeWidth={6} />
      <text x={-290} y={-52} fontFamily="Poppins" fontWeight={800} fontSize={40} fill="#6b7280">
        @you
      </text>
      <text x={-290} y={-6} fontFamily="Poppins" fontWeight={800} fontSize={34} fill="#6b7280">
        just now
      </text>
      <Flag k={k} x={-330} y={70} r={48} />
      <text x={-260} y={88} fontFamily="Poppins" fontWeight={800} fontSize={64} fill={INK}>
        {nm}
      </text>
      <rect x={-250 + nm.length * 42} y={44} width={6} height={56} fill={INK} opacity={Math.floor(t * 4) % 2} />
    </Card>
  );
};

// "the one with the most comments gets deleted": example leaderboard
const Board: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.tomorrow - 0.1 || t > T.gone) return null;
  const a = ease((t - T.tomorrow + 0.1) / 0.25) * clamp((T.gone - t) / 0.2);
  const rows: [string, number][] = [
    ["FRANCE", 1],
    ["USA", 0.78],
    ["BRAZIL", 0.6],
  ];
  const grow = ease((t - T.tomorrow - 0.3) / 1.2);
  const stamp = ease((t - T.deleted) / 0.15);
  return (
    <Card x={540} y={1000} w={940} h={520} a={a}>
      <text y={-180} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={56} fill={INK}>
        MOST COMMENTS
      </text>
      <text y={-136} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={28} fill="#6b7280">
        (EXAMPLE)
      </text>
      {rows.map(([k, v], i) => (
        <g key={k} transform={`translate(-400 ${-60 + i * 120})`}>
          <Flag k={k} x={40} y={0} r={42} />
          <rect x={100} y={-26} width={640 * v * grow} height={52} rx={26} fill={i === 0 ? RED : "#8fd0ff"} stroke={INK} strokeWidth={5} />
        </g>
      ))}
      {stamp > 0 ? (
        <g transform={`translate(120 -60) rotate(-10) scale(${1.4 - 0.4 * stamp})`} opacity={stamp}>
          <rect x={-230} y={-60} width={460} height={120} rx={16} fill="rgba(255,255,255,0.92)" stroke={RED} strokeWidth={12} />
          <text y={30} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={84} fill={RED}>
            DELETED
          </text>
        </g>
      ) : null}
    </Card>
  );
};

// day counter during the montage
const Days: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.then || t >= T.so - 0.1) return null;
  const u = clamp((t - T.then) / (T.left - T.then));
  const d = Math.min(195, 2 + Math.floor(Math.pow(u, 1.6) * 193));
  const left = t >= T.left ? 1 : Math.max(2, 195 - d);
  return (
    <g>
      <g transform="translate(540 330)">
        <rect x={-260} y={-70} width={520} height={130} rx={30} fill={INK} />
        <text y={34} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={96} fill={GOLD}>
          {`DAY ${d}`}
        </text>
      </g>
      <text x={540} y={470} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={56} fill="#fff" stroke={INK} strokeWidth={10} paintOrder="stroke">
        {`${left} LEFT`}
      </text>
    </g>
  );
};

// host: "choose wisely... it's next"
const HostScene: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.so - 0.2 || t >= T.day - 0.2) return null;
  const a = ease((t - T.so + 0.2) / 0.3);
  const talk = Math.abs(Math.sin(t * 14)) * (t < T.next + 0.3 ? 1 : 0);
  const next = ease((t - T.next) / 0.15);
  return (
    <g opacity={a}>
      <rect width={1080} height={1920} fill="rgba(27,31,46,0.55)" />
      <g transform={`translate(540 ${1150 + 80 * (1 - a)}) scale(1.9)`}>
        <Host x={0} y={0} label={false} talk={talk} />
      </g>
      {t >= T.your - 0.1 ? (
        <g transform="translate(540 520)">
          <text textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={110} fill="#fff" stroke={INK} strokeWidth={14} paintOrder="stroke">
            YOUR COUNTRY?
          </text>
        </g>
      ) : null}
      {next > 0 ? (
        <g transform={`translate(540 700) rotate(-6) scale(${1.4 - 0.4 * next})`} opacity={next}>
          <rect x={-230} y={-80} width={460} height={150} rx={20} fill={RED} stroke={INK} strokeWidth={10} />
          <text y={36} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={110} fill="#fff">
            NEXT.
          </text>
        </g>
      ) : null}
    </g>
  );
};

// the one left standing: a mystery crown
const Crown: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.left || t >= T.so) return null;
  const a = ease((t - T.left) / 0.3) * clamp((T.so - t) / 0.2);
  return (
    <g transform={`translate(540 ${1000 - 40 * a})`} opacity={a}>
      <circle r={110} fill="#11162e" stroke={INK} strokeWidth={8} />
      <text y={48} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={150} fill="#fff">
        ?
      </text>
      <path d="M -80 -96 L -90 -180 L -40 -132 L 0 -200 L 40 -132 L 90 -180 L 80 -96 Z" fill={GOLD} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    </g>
  );
};

// big word captions
const CAPS: [string, string, boolean?][] = [
  ["Every", "EVERY COUNTRY"],
  ["this", "ON THIS MAP"],
  ["you", "YOU DELETE ONE", true],
  ["comment", "COMMENT A COUNTRY", true],
  ["Tomorrow,", "TOMORROW"],
  ["most", "MOST COMMENTS"],
  ["deleted,", "= DELETED", true],
  ["gone", "OFF THE MAP"],
  ["Then", "AGAIN"],
  ["Every", "EVERY DAY"],
  ["until", "UNTIL 1 IS LEFT"],
  ["choose", "CHOOSE WISELY"],
];
const CAP_T = (() => {
  let a = 0;
  return CAPS.map(([w]) => (a = TW(w, a + 0.01)));
})();
const Caption: React.FC<{ t: number }> = ({ t }) => {
  if (t >= T.so - 0.1) return null;
  let i = -1;
  CAP_T.forEach((x, j) => {
    if (t >= x - 0.05) i = j;
  });
  if (i < 0) return null;
  const [, txt, hot] = CAPS[i];
  const k = 0.85 + 0.15 * ease((t - CAP_T[i] + 0.05) / 0.12);
  return (
    <g transform={`translate(540 1580) scale(${k})`}>
      <text textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={txt.length > 14 ? 84 : 112} fill={hot ? GOLD : "#fff"} stroke={INK} strokeWidth={16} paintOrder="stroke">
        {txt}
      </text>
    </g>
  );
};

const DeleteButton: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.delete - 0.4 || t > T.comment - 0.1) return null;
  const a = ease((t - T.delete + 0.4) / 0.2) * clamp((T.comment - 0.1 - t) / 0.15);
  const press = t > T.delete && t < T.delete + 0.2 ? 0.88 : 1;
  return (
    <g transform={`translate(540 1000) scale(${a * press})`}>
      <ellipse cx={0} cy={30} rx={250} ry={80} fill="#7a1f2b" stroke={INK} strokeWidth={8} />
      <ellipse cx={0} cy={press < 1 ? 20 : 0} rx={250} ry={80} fill={RED} stroke={INK} strokeWidth={8} />
      <text y={(press < 1 ? 20 : 0) + 22} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={72} fill="#fff">
        DELETE
      </text>
    </g>
  );
};

const DayBadge: React.FC<{ t: number }> = ({ t }) => {
  const end = t >= T.day - 0.2;
  if (!end && t >= T.then) return null;
  const k = end ? 1.6 - 0.6 * ease((t - T.day + 0.2) / 0.25) : 1;
  return (
    <g transform={`translate(540 ${end ? 820 : 300}) scale(${k})`}>
      <rect x={-200} y={-74} width={400} height={130} rx={30} fill={GOLD} stroke={INK} strokeWidth={8} />
      <text y={30} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={96} fill={INK}>
        DAY 1
      </text>
      {end ? (
        <text y={150} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={70} fill="#fff" stroke={INK} strokeWidth={12} paintOrder="stroke">
          STARTS NOW
        </text>
      ) : null}
    </g>
  );
};

const EndPrompt: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.day + 0.4) return null;
  const a = ease((t - T.day - 0.4) / 0.25);
  return (
    <g transform={`translate(540 1580) scale(${0.85 + 0.15 * a})`} opacity={a}>
      <text textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={84} fill={GOLD} stroke={INK} strokeWidth={16} paintOrder="stroke">
        COMMENT A COUNTRY
      </text>
    </g>
  );
};

type Sfx = "pop" | "zap" | "tick" | "thud" | "swoosh";
const VOL: Record<Sfx, number> = { pop: 0.1, zap: 0.1, tick: 0.06, thud: 0.16, swoosh: 0.08 };
const SFX: [number, Sfx][] = [
  [T.delete, "thud"],
  [T.delete + 0.05, "zap"],
  [T.comment, "pop"],
  [T.tomorrow, "swoosh"],
  [T.deleted, "thud"],
  [T.gone, "zap"],
  ...Array.from({ length: 14 }, (_, i): [number, Sfx] => [T.then + 0.2 + i * 0.33, "tick"]),
  [T.left, "thud"],
  [T.so, "swoosh"],
  [T.next, "thud"],
  [T.day - 0.2, "pop"],
];

export const GeoShort1: React.FC<{ audio?: boolean }> = ({ audio = true }) => {
  const ready = useFonts();
  const f = useCurrentFrame();
  const t = f / GS1_FPS;
  if (!ready) return <AbsoluteFill style={{ background: "#2a6fb0" }} />;
  return (
    <AbsoluteFill style={{ background: "#2a6fb0" }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <MapLayer t={t} />
        <rect width={1080} height={420} fill="url(#topfade)" />
        <defs>
          <linearGradient id="topfade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1b1f2e" stopOpacity={0.55} />
            <stop offset="1" stopColor="#1b1f2e" stopOpacity={0} />
          </linearGradient>
        </defs>
        <DayBadge t={t} />
        <Days t={t} />
        <DeleteButton t={t} />
        <CommentCard t={t} />
        <Board t={t} />
        <Crown t={t} />
        <HostScene t={t} />
        <Caption t={t} />
        <EndPrompt t={t} />
      </svg>
      {audio ? <Audio src={staticFile("geo/short1-vo.wav")} /> : null}
      {audio
        ? SFX.map(([at, k], i) => (
            <Sequence key={i} from={Math.max(0, Math.round(at * GS1_FPS))} durationInFrames={30}>
              <Audio src={staticFile(`geo/sfx/${k}.wav`)} volume={VOL[k]} />
            </Sequence>
          ))
        : null}
    </AbsoluteFill>
  );
};
