// Geo episode 1: "I Deleted Every Country Until Only 1 Was Left". One stage world (host left, contestants right), a
// camera that cuts between wide / host / a contestant, rule cards, country chips, speech bubbles and deletions, all
// timed off the voice's word timestamps (ep1-words.json) and the bubble pauses spliced into it (ep1-marks.json).
import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { useFonts } from "../inkbeat/core/frame";
import { clamp, ease, inOut } from "../coinflip/Ep1Test";
import AMP from "./ep1-amp.json";
import MARKS from "./ep1-marks.json";
import WORDS_JSON from "./ep1-words.json";
import WORLD from "./world.json";
import { Beret, ChefHat, Clipboard, CorkHat, Cowboy, Face, FLAGS, Halo, Headband, Host, INK, Mood, PartyHat, Toque, TopHat, Ushanka } from "./GeoCast";

export const GEO1_FPS = 30;
const TOT = MARKS.tot;
export const GEO1_FRAMES = Math.ceil(TOT * GEO1_FPS);
const WORDS = WORDS_JSON as [string, number, number][];
const n = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
/** start time of the first word containing `w` at or after `after` */
const TW = (w: string, after: number) => {
  const x = WORDS.find((y) => y[1] >= after - 0.05 && n(y[0]).includes(n(w)));
  if (!x) throw new Error(`no word "${w}" after ${after}`);
  return x[1];
};
const M: Record<string, [number, number]> = Object.fromEntries((MARKS.marks as unknown as [string, number, number][]).map(([l, t, d]) => [l, [t, d]]));
const mEnd = (k: string) => M[k][0] + M[k][1];

const RED = "#e8423a";
const GREEN = "#2fb36b";
const GOLD = "#f5c518";
const PAPER = "#eef4ff";
const GREY = "#6b7280";

// ------------------------------------------------------------------ cues
const C = (() => {
  const c: Record<string, number> = {};
  c.rules = TW("rules", 1);
  c.brk = TW("break", 2);
  c.winner = TW("winner", 3);
  c.hi = TW("Hi", 6);
  c.rent = TW("rent", 10);
  c.collect = TW("collecting", 13);
  c.works = TW("works", 15);
  c.gone0 = TW("gone", 17);
  c.appeals = TW("appeals", 20);
  c.allowed = TW("allowed", 21);
  c.meet = TW("meet", 24);
  c.USA = TW("America", c.meet);
  c.CANADA = TW("Canada", c.USA);
  c.RUSSIA = TW("Russia", c.CANADA);
  c.BRAZIL = TW("Brazil", c.RUSSIA);
  c.UK = TW("United", c.BRAZIL);
  c.FRANCE = TW("France", c.UK);
  c.JAPAN = TW("Japan", c.FRANCE);
  c.AUSTRALIA = TW("Australia", c.JAPAN);
  c.ITALY = TW("Italy", c.AUSTRALIA + 2);
  c.GERMANY = TW("Germany", c.ITALY);
  c.VATICAN = TW("Vatican", c.GERMANY);
  c.find = TW("Find", c.VATICAN);
  c.r1 = TW("Rule", c.find);
  c.waist = TW("imaginary", c.r1);
  c.sens = TW("sensitive", c.waist);
  c.n13 = TW("13", c.sens);
  c.braOut = TW("over", M.b_brazil[0]);
  c.tattoo = TW("Ecuador", c.braOut);
  c.r2 = TW("Rule", c.tattoo);
  c.seven = TW("seven", c.r2);
  c.gone2 = TW("gone", c.seven);
  c.persian = TW("fun", c.gone2);
  c.burger = TW("burger", c.persian);
  c.checked = TW("Nobody", M.b_usa[0]);
  c.r3 = TW("Rule", c.checked);
  c.n44 = TW("44", c.r3);
  c.bol = TW("thing", c.n44);
  c.club = TW("boat", c.bol);
  c.first = TW("first", c.club);
  c.vat = TW("Vatican", c.first);
  c.vatOut = M.b_vat[0] + 2.3;
  c.r4 = TW("Rule", c.vatOut);
  c.gone4 = TW("gone", TW("beautiful", c.r4));
  c.ghost1 = TW("Brazil", c.gone4);
  c.twice = TW("twice", c.ghost1);
  c.ghost1Out = mEnd("b_bra_ghost") - 0.15;
  c.everyone = TW("Everyone", c.ghost1Out - 0.5);
  c.safe = TW("safe", c.everyone);
  c.write = TW("write", c.safe);
  c.r5 = TW("Rule", M.b_ger[0]);
  c.n14k = TW("14", c.r5);
  c.japOut = mEnd("b_jap") - 0.1;
  c.ausGone = TW("gone", c.japOut);
  c.redflag = TW("flag", TW("red", M.b_aus[0]));
  c.ausOut = c.redflag + 0.45;
  c.island = TW("United", c.redflag);
  c.pack = TW("pack", c.island);
  c.except = TW("except", c.pack);
  c.ni = TW("Northern", c.except);
  c.km = TW("500", c.ni);
  c.survives = TW("survives", c.km);
  c.r6 = TW("Rule", M.b_uk1[0]);
  c.ukGone = TW("gone", TW("Charles", mEnd("b_uk2")));
  c.can = TW("Canada", c.ukGone);
  c.also = TW("also", c.can);
  c.k15 = TW("15", c.also);
  c.sub = TW("subscription", c.k15);
  c.canOut = mEnd("b_can") - 0.1;
  c.oldest = TW("Japan", c.canOut - 0.3);
  c.stillIn = TW("worked", M.b_usa2[0]);
  c.r7 = TW("Rule", c.stillIn);
  c.gone7 = TW("gone", TW("Mexico", c.r7));
  c.n340 = TW("340", c.gone7);
  c.overruled = TW("overruled", M.b_obj[0]);
  c.usaOut = c.overruled + 0.15;
  c.liveOnMe = TW("live", c.overruled);
  c.rus = TW("Russia", c.liveOnMe);
  c.n144 = TW("144", c.rus);
  c.zones = TW("11", c.n144);
  c.rusOut = mEnd("b_rus") - 0.1;
  c.fin = TW("Three", c.rusOut - 0.3);
  c.finRule = TW("Whoever", c.fin);
  c.itaUp = TW("up", c.finRule);
  c.six = TW("Six", c.itaUp);
  c.itaOut = TW("deleted", TW("lose", c.six));
  c.ger = TW("Germany", c.itaOut + 0.3);
  c.nine = TW("nine", c.ger);
  c.fra = TW("France", mEnd("b_ger2") - 0.3);
  c.eight = TW("eight", c.fra);
  c.gerWins = TW("Germany", c.eight);
  c.wait = TW("wait", c.gerWins);
  c.guiana = TW("Guiana", c.wait);
  c.suriname = TW("Suriname", c.guiana);
  c.brazil2 = TW("Brazil", c.suriname);
  c.longest = TW("longest", c.brazil2);
  c.martin = TW("Martin", M.b_bra2[0]);
  c.nl = TW("Netherlands", c.martin);
  c.n11 = TW("11", c.nl);
  c.frWins = TW("wins", c.n11);
  c.told = TW("told", c.frWins);
  c.gerRight = TW("Germany", c.told);
  c.home = TW("France", c.gerRight);
  c.honest = TW("honest", c.home);
  c.comments = TW("comments", c.honest);
  c.next = TW("next", c.comments);
  c.voting = TW("voting", c.next);
  return c;
})();

// ------------------------------------------------------------------ cast
const ORDER = ["USA", "CANADA", "RUSSIA", "BRAZIL", "UK", "FRANCE", "JAPAN", "AUSTRALIA", "ITALY", "GERMANY", "VATICAN"];
const NAME: Record<string, string> = { USA: "USA", CANADA: "CANADA", RUSSIA: "RUSSIA", BRAZIL: "BRAZIL", UK: "UK", FRANCE: "FRANCE", JAPAN: "JAPAN", AUSTRALIA: "AUSTRALIA", ITALY: "ITALY", GERMANY: "GERMANY", VATICAN: "VATICAN" };
const PROP: Record<string, React.ReactNode> = { USA: Cowboy, CANADA: Toque, RUSSIA: Ushanka, BRAZIL: PartyHat, UK: TopHat, FRANCE: Beret, JAPAN: Headband, AUSTRALIA: CorkHat, ITALY: ChefHat, GERMANY: Clipboard, VATICAN: Halo };
const BASE: Record<string, Mood> = { USA: "cool", CANADA: "smug", RUSSIA: "angry", BRAZIL: "happy", UK: "smug", FRANCE: "smug", JAPAN: "shocked", AUSTRALIA: "happy", ITALY: "happy", GERMANY: "cool", VATICAN: "scared" };
const TAG: Record<string, string> = {
  USA: "BIG HAT. BIGGER EGO.",
  CANADA: "SORRY FOR BEING HERE",
  RUSSIA: "BIGGEST COUNTRY ON EARTH",
  BRAZIL: "HERE FOR THE PARTY",
  UK: "BROUGHT A TEACUP",
  FRANCE: "ALREADY WON (APPARENTLY)",
  JAPAN: "READ THE RULES FIRST",
  AUSTRALIA: "EVERYTHING HERE BITES",
  ITALY: "TALKS WITH HANDS",
  GERMANY: "WANTS IT IN WRITING",
  VATICAN: "SMALLEST COUNTRY ON EARTH",
};
/** deletion moments */
const OUT: Record<string, number> = { BRAZIL: C.braOut, VATICAN: C.vatOut, JAPAN: C.japOut, AUSTRALIA: C.ausOut, UK: C.ukGone, CANADA: C.canOut, USA: C.usaOut, RUSSIA: C.rusOut, ITALY: C.itaOut };
const ZAP = 0.7;
const alive = (t: number) => ORDER.filter((k) => !(OUT[k] !== undefined && t >= OUT[k] + ZAP));
// [who, from, to, mood]
const MOODS: [string, number, number, Mood][] = [
  ["BRAZIL", M.b_brazil[0] - 1.5, C.braOut + 1, "crying"],
  ["USA", C.burger, C.checked + 3, "angry"],
  ["VATICAN", C.vat, C.vatOut + 1, "crying"],
  ["ITALY", M.b_vat[0] + 1.2, C.vatOut + 1, "smug"],
  ["GERMANY", C.write - 0.3, C.write + 3, "happy"],
  ["JAPAN", C.r5 + 1, C.japOut + 1, "scared"],
  ["AUSTRALIA", C.ausGone - 0.3, C.ausOut + 1, "angry"],
  ["UK", C.pack - 0.6, C.except, "scared"],
  ["UK", C.survives, mEnd("b_uk1") + 1, "happy"],
  ["UK", M.b_uk2[0], C.ukGone + 1, "angry"],
  ["CANADA", C.also, C.canOut + 1, "crying"],
  ["USA", M.b_usa2[0], C.stillIn + 2, "smug"],
  ["USA", C.n340 - 0.5, C.usaOut + 1, "angry"],
  ["RUSSIA", C.rus, C.rusOut + 1, "shocked"],
  ["ITALY", C.six, C.itaOut + 1, "crying"],
  ["GERMANY", C.nine, C.wait, "happy"],
  ["FRANCE", C.fra, C.wait, "scared"],
  ["GERMANY", C.wait, C.frWins, "shocked"],
  ["FRANCE", C.wait, TOT, "smug"],
  ["GERMANY", C.frWins, TOT, "crying"],
];
const moodOf = (k: string, t: number): Mood => {
  let m = BASE[k];
  for (const [w, a, b, x] of MOODS) if (w === k && t >= a && t < b) m = x;
  if (OUT[k] !== undefined && t >= OUT[k] - 0.05) m = "shocked";
  return m;
};

type Slot = { x: number; y: number; s: number };
const slots = (list: string[]): Record<string, Slot> => {
  const r: Record<string, Slot> = {};
  const row = (ks: string[], floor: number, s: number, x0: number, x1: number) =>
    ks.forEach((k, i) => (r[k] = { x: x0 + ((i + 0.5) * (x1 - x0)) / ks.length, y: floor - 196 * s, s }));
  if (list.length <= 5) row(list, 985, Math.min(1.2, 1300 / list.length / 270), 560, 1860);
  else {
    const f = list.filter((_, i) => i % 2 === 0);
    const b = list.filter((_, i) => i % 2 === 1);
    const s = Math.min(0.95, 1300 / f.length / 250);
    row(b, 725, s * 0.85, 560 + 1300 / f.length / 2, 1860 - 1300 / f.length / 2);
    row(f, 990, s, 560, 1860);
  }
  return r;
};
const CHANGES = Object.values(OUT).map((x) => x + ZAP).sort((a, b) => a - b);
const slotAt = (k: string, t: number): Slot => {
  const now = slots(alive(t));
  const tc = [...CHANGES].reverse().find((x) => x <= t);
  const prev = tc === undefined ? now : slots(alive(tc - 0.01));
  const u = tc === undefined ? 1 : inOut((t - tc) / 0.8);
  const a = prev[k] ?? now[k];
  const b = now[k] ?? prev[k];
  if (!a) return slots(alive(OUT[k] - 0.01))[k];
  return { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u, s: a.s + (b.s - a.s) * u };
};
const HOST = { x: 250, y: 990 - 236, s: 1 };

// ------------------------------------------------------------------ camera
type Target = string; // "wide" | "host" | "stage" | country key
const SHOTS: [number, Target][] = [
  [0, "map:world"],
  [C.hi - 0.2, "host"],
  [C.works, "wide"],
  [C.appeals, "host"],
  [C.meet, "stage"],
  ...ORDER.map((k): [number, Target] => [C[k] - 0.15, k]),
  [C.find, "wide"],
  [C.r1, "wide"],
  [C.waist - 0.3, "host"],
  [C.n13 - 0.2, "map:world"],
  [M.b_brazil[0] - 0.4, "BRAZIL"],
  [C.braOut + 1, "host"],
  [C.r2, "wide"],
  [C.r2 + 2.7, "map:casia"],
  [C.burger - 0.3, "USA"],
  [C.checked + 2.2, "wide"],
  [C.r3, "wide"],
  [C.n44 - 0.2, "map:world"],
  [C.bol - 0.1, "map:samerica"],
  [C.first - 0.2, "stage"],
  [C.vat - 0.3, "VATICAN"],
  [M.b_vat[0] + 1.25, "ITALY"],
  [C.vatOut - 0.25, "VATICAN"],
  [C.r4, "wide"],
  [C.r4 + 2.7, "map:world"],
  [C.ghost1 - 0.3, "stage"],
  [C.write - 0.3, "GERMANY"],
  [C.r5, "wide"],
  [C.r5 + 2.7, "map:world"],
  [C.n14k - 0.2, "map:japan"],
  [M.b_jap[0] - 0.4, "JAPAN"],
  [C.ausGone - 0.4, "AUSTRALIA"],
  [C.island - 0.3, "UK"],
  [C.ni - 0.2, "map:isles"],
  [M.b_uk1[0] - 0.4, "UK"],
  [mEnd("b_uk1") + 0.2, "wide"],
  [C.r6 + 2.7, "map:world"],
  [M.b_uk2[0] - 0.3, "UK"],
  [C.can - 0.2, "CANADA"],
  [C.oldest, "host"],
  [M.b_usa2[0] - 0.3, "USA"],
  [C.r7, "wide"],
  [C.r7 + 2.7, "map:world"],
  [C.n340 - 0.3, "USA"],
  [C.liveOnMe - 0.1, "host"],
  [C.rus - 0.2, "RUSSIA"],
  [C.fin, "map:world"],
  [C.itaUp - 0.2, "map:europe"],
  [M.b_ita[0] - 0.4, "ITALY"],
  [C.itaOut + 0.9, "stage"],
  [C.ger - 0.2, "map:europe"],
  [M.b_ger2[0] - 0.4, "GERMANY"],
  [C.fra - 0.2, "map:europe"],
  [C.gerWins - 0.1, "GERMANY"],
  [C.wait - 0.1, "FRANCE"],
  [C.guiana - 0.2, "map:guiana"],
  [M.b_bra2[0] - 0.4, "stage"],
  [C.martin - 0.2, "map:stmartin"],
  [C.frWins - 0.2, "FRANCE"],
  [C.told - 0.2, "host"],
  [C.gerRight - 0.1, "GERMANY"],
  [C.home - 0.1, "FRANCE"],
  [C.honest - 0.2, "wide"],
  [C.next - 0.2, "wide"],
];
type Cam = { cx: number; cy: number; z: number };
const isMap = (tg: Target) => tg.startsWith("map:");
const BOXES = WORLD.boxes as Record<string, number[]>;
const camOf = (tg: Target, t: number): Cam => {
  if (tg === "wide" || tg === "map:world") return { cx: 960, cy: 540, z: 1 };
  if (isMap(tg)) {
    const [a, b, c, d] = BOXES[tg.slice(4)];
    return { cx: (a + c) / 2, cy: (b + d) / 2, z: Math.min(1920 / (c - a), 1080 / (d - b)) * 0.8 };
  }
  if (tg === "host") return { cx: HOST.x + 40, cy: HOST.y + 10, z: 1.75 };
  if (tg === "stage") {
    const l = alive(t);
    return l.length <= 5 ? { cx: 1210, cy: 760, z: 1.3 } : { cx: 1210, cy: 700, z: 1.32 };
  }
  const p = slotAt(tg, t);
  return { cx: p.x, cy: p.y + 30 * p.s, z: clamp(205 / (100 * p.s), 1.3, 2.5) };
};
const shotCam = (i: number, t: number): Cam => {
  const [t0, tg] = SHOTS[i];
  const c = camOf(tg, t);
  c.z *= 1 + 0.035 * clamp((t - t0) / 6);
  return c;
};
/** the stage camera, the map camera and how much of the map is showing (crossfade between the two worlds) */
const cameras = (t: number): { stage: Cam; map: Cam; mapOp: number } => {
  let i = 0;
  while (i + 1 < SHOTS.length && SHOTS[i + 1][0] <= t) i++;
  const u = inOut((t - SHOTS[i][0]) / 0.6);
  const pick = (m: boolean): Cam => {
    let j = i;
    while (j >= 0 && isMap(SHOTS[j][1]) !== m) j--;
    if (j < 0) return { cx: 960, cy: 540, z: 1 };
    const cur = shotCam(j, t);
    if (j !== i || i === 0 || isMap(SHOTS[i - 1][1]) !== m) return cur;
    const prev = shotCam(i - 1, t);
    const lz = Math.exp(Math.log(prev.z) + (Math.log(cur.z) - Math.log(prev.z)) * u);
    // move in the zoomed-out space so big zooms don't swing
    const w = (lz - prev.z) / (cur.z - prev.z || 1);
    const k = Math.abs(cur.z - prev.z) < 1e-6 ? u : clamp(w);
    return { cx: prev.cx + (cur.cx - prev.cx) * k, cy: prev.cy + (cur.cy - prev.cy) * k, z: lz };
  };
  const curMap = isMap(SHOTS[i][1]);
  const prevMap = i > 0 && isMap(SHOTS[i - 1][1]);
  const mapOp = curMap ? (prevMap || i === 0 ? 1 : u) : prevMap ? 1 - u : 0;
  return { stage: pick(false), map: pick(true), mapOp };
};
const project = (cam: Cam, x: number, y: number): [number, number] => [960 + (x - cam.cx) * cam.z, 540 + (y - cam.cy) * cam.z];

// ------------------------------------------------------------------ characters
const Char: React.FC<{ k: string; t: number; p: Slot; ghost?: boolean }> = ({ k, t, p, ghost }) => {
  const ph = ORDER.indexOf(k) * 1.7;
  const bob = Math.sin(t * 2.2 + ph) * 4;
  const out = OUT[k];
  let sc = 1;
  let rot = 0;
  let flash = 0;
  if (!ghost && out !== undefined && t >= out) {
    const u = (t - out) / ZAP;
    sc = u < 0.25 ? 1 + 0.25 * (u / 0.25) : 1.25 * Math.max(0, 1 - (u - 0.25) / 0.75);
    rot = 120 * ease(u);
    flash = clamp(1 - u * 1.6);
  }
  const hop = BUBBLES.some((b) => b.who === k && t >= b.at && t < b.at + 0.3) ? -16 * Math.sin(((t - BUBBLES.find((b) => b.who === k && t >= b.at)!.at) / 0.3) * Math.PI) : 0;
  const id = `h-${k}`;
  return (
    <g transform={`translate(${p.x} ${p.y + bob + hop}) scale(${p.s})`} opacity={ghost ? 0.62 : 1}>
      {!ghost ? <ellipse cx={0} cy={200 - bob / p.s - hop / p.s} rx={95 * sc} ry={16} fill={INK} opacity={0.15} /> : null}
      <g transform={`rotate(${rot}) scale(${sc})`}>
        {ghost ? (
          <path d="M -70 60 Q -60 170 -30 150 Q -10 190 10 150 Q 30 190 50 150 Q 80 170 70 60 Z" fill="#fff" stroke={INK} strokeWidth={6} opacity={0.8} />
        ) : (
          <g>
            <path d="M -28 110 L -34 196 M 28 110 L 34 196" stroke={INK} strokeWidth={10} strokeLinecap="round" />
            <path d="M -80 40 Q -118 70 -110 112 M 80 40 Q 118 70 110 112" fill="none" stroke={INK} strokeWidth={10} strokeLinecap="round" />
          </g>
        )}
        <defs>
          <clipPath id={id}>
            <circle r={100} />
          </clipPath>
        </defs>
        <g clipPath={`url(#${id})`}>{FLAGS[k]}</g>
        <circle r={100} fill="none" stroke={INK} strokeWidth={7} />
        <Face mood={ghost ? (t > C.brazil2 ? "happy" : "crying") : moodOf(k, t)} />
        {ghost ? Halo : PROP[k]}
        {flash > 0 ? <circle r={110} fill="#fff" opacity={flash} /> : null}
      </g>
      {!ghost && sc > 0.6 ? (
        <g transform="translate(0 236)">
          <rect x={-NAME[k].length * 13 - 18} y={-26} width={NAME[k].length * 26 + 36} height={46} rx={23} fill={INK} />
          <text y={9} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={30} fill="#fff">
            {NAME[k]}
          </text>
        </g>
      ) : null}
    </g>
  );
};
const ghostPos = (t: number): Slot => (t < C.r5 ? { x: 1300, y: 330, s: 0.55 } : { x: 1560, y: 330 + Math.sin(t * 1.5) * 10, s: 0.62 });
const ghostOn = (t: number) => (t >= C.ghost1 && t < C.ghost1Out + 0.6) || (t >= C.brazil2 && t < C.told);
const ghostOpacity = (t: number) => (t < C.r5 ? clamp((t - C.ghost1) / 0.3) * clamp((C.ghost1Out + 0.6 - t) / 0.6) : clamp((t - C.brazil2) / 0.3) * clamp((C.told - t) / 0.4));

// zap particles in world space
const Particles: React.FC<{ t: number }> = ({ t }) => (
  <g>
    {Object.entries(OUT).map(([k, t0]) => {
      const u = (t - t0 - 0.15) / 0.8;
      if (u < 0 || u > 1) return null;
      const p = slots(alive(t0 - 0.01))[k];
      return (
        <g key={k} opacity={1 - u}>
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i / 12) * Math.PI * 2 + i;
            const r = 60 + 260 * ease(u) * p.s;
            const col = ["#ff4fa3", GOLD, "#3f7fe0", RED][i % 4];
            return <rect key={i} x={p.x + Math.cos(a) * r - 9} y={p.y + Math.sin(a) * r - 9} width={18} height={18} fill={col} stroke={INK} strokeWidth={3} transform={`rotate(${u * 300 + i * 30} ${p.x + Math.cos(a) * r} ${p.y + Math.sin(a) * r})`} />;
          })}
        </g>
      );
    })}
  </g>
);

// ------------------------------------------------------------------ stage set
const Stage: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <rect x={-800} y={-600} width={3520} height={2300} fill="#1f2a55" />
    {[-1, 0, 1, 2, 3].map((i) => (
      <path key={i} d={`M ${300 + i * 420 + Math.sin(t * 0.4 + i) * 60} -200 L ${150 + i * 420} 1000 L ${520 + i * 420} 1000 Z`} fill="#ffffff" opacity={0.05} />
    ))}
    {Array.from({ length: 26 }, (_, i) => (
      <circle key={i} cx={-200 + i * 95} cy={70} r={9} fill={Math.floor(t * 3 + i) % 3 === 0 ? GOLD : "#3a4680"} />
    ))}
    <rect x={520} y={725} width={1400} height={420} rx={12} fill="#2d3a72" stroke={INK} strokeWidth={6} />
    <rect x={-800} y={985} width={3520} height={700} fill="#3a2a5e" />
    <rect x={-800} y={985} width={3520} height={14} fill={GOLD} />
    <ellipse cx={250} cy={995} rx={230} ry={34} fill="#ffffff" opacity={0.08} />
  </g>
);

// ------------------------------------------------------------------ hook: 195 tiny countries
const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const Hook: React.FC<{ t: number }> = ({ t }) => {
  if (t > C.hi) return null;
  const txt = t < C.rules ? "195 COUNTRIES" : t < C.brk ? "8 RULES" : t < C.winner ? "BREAK ONE = DELETED" : "WHO SURVIVES?";
  const at = t < C.rules ? 0.9 : t < C.brk ? C.rules : t < C.winner ? C.brk : C.winner;
  const k = 0.8 + 0.2 * ease((t - at) / 0.2);
  const red = txt.includes("DELETED");
  return (
    <g transform={`translate(960 950) scale(${k})`} opacity={clamp((t - 0.9) / 0.15) * clamp((C.hi - t) / 0.2)}>
      <rect x={-txt.length * 30 - 50} y={-80} width={txt.length * 60 + 100} height={130} rx={26} fill={red ? RED : GOLD} stroke={INK} strokeWidth={8} />
      <text y={22} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={92} fill={red ? "#fff" : INK}>
        {txt}
      </text>
    </g>
  );
};

// ------------------------------------------------------------------ the world map
type WCountry = { n: string; g: string; d: string; lo: string; b: number[] };
const WC = WORLD.c as WCountry[];
const PINS = WORLD.pins as Record<string, number[]>;
const ATLAS: Record<string, string> = { USA: "United States of America", CANADA: "Canada", RUSSIA: "Russia", BRAZIL: "Brazil", UK: "United Kingdom", FRANCE: "France", JAPAN: "Japan", AUSTRALIA: "Australia", ITALY: "Italy", GERMANY: "Germany", VATICAN: "Vatican" };
const CAST_OF: Record<string, string> = Object.fromEntries(Object.entries(ATLAS).map(([k, v]) => [v, k]));
const NAMES = new Set(WC.map((c) => c.g));
const chk = (l: string[]) => {
  l.forEach((x) => {
    if (!NAMES.has(x)) throw new Error(`map has no "${x}"`);
  });
  return l;
};
// [highlight from, delete at, countries]  (cast members are deleted at their own OUT moment instead)
const GROUPS: [number, number, string[]][] = [
  [C.n13, C.braOut, chk(["Ecuador", "Colombia", "Brazil", "São Tomé and Principe", "Gabon", "Congo", "Dem. Rep. Congo", "Uganda", "Kenya", "Somalia", "Maldives", "Indonesia", "Kiribati"])],
  [C.r2 + 2.7, C.gone2, chk(["Afghanistan", "Pakistan", "Kazakhstan", "Uzbekistan", "Turkmenistan", "Kyrgyzstan", "Tajikistan"])],
  [
    C.n44,
    C.first - 0.3,
    chk(["Afghanistan", "Andorra", "Armenia", "Austria", "Azerbaijan", "Belarus", "Bhutan", "Bolivia", "Botswana", "Burkina Faso", "Burundi", "Central African Rep.", "Chad", "Czechia", "eSwatini", "Ethiopia", "Hungary", "Kazakhstan", "Kyrgyzstan", "Laos", "Lesotho", "Liechtenstein", "Luxembourg", "Malawi", "Mali", "Moldova", "Mongolia", "Nepal", "Niger", "Macedonia", "Paraguay", "Rwanda", "San Marino", "Serbia", "Slovakia", "S. Sudan", "Switzerland", "Tajikistan", "Turkmenistan", "Uganda", "Uzbekistan", "Vatican", "Zambia", "Zimbabwe"]),
  ],
  [C.r4 + 2.7, C.gone4, chk(["Sweden", "Greece", "Argentina", "Finland", "Ukraine", "Brazil", "Israel", "Estonia", "Saudi Arabia", "Uruguay", "Bosnia and Herz.", "Côte d'Ivoire", "Botswana", "Niger", "Rwanda"])],
  [
    C.r5 + 2.7,
    C.ausOut,
    chk(["Japan", "Australia", "New Zealand", "Iceland", "Madagascar", "Sri Lanka", "Philippines", "Cuba", "Jamaica", "Bahamas", "Fiji", "Malta", "Cabo Verde", "Comoros", "Mauritius", "Seychelles", "Trinidad and Tobago", "Barbados", "Vanuatu", "Solomon Is.", "Samoa", "Tonga", "Singapore", "Bahrain", "Palau", "Micronesia", "Marshall Is.", "Nauru", "Saint Lucia", "Grenada", "Dominica", "St. Kitts and Nevis", "St. Vin. and Gren.", "Antigua and Barb."]),
  ],
  [C.r6 + 2.7, C.ukGone, chk(["United Kingdom", "Canada", "Spain", "Netherlands", "Belgium", "Denmark", "Norway", "Morocco", "Jordan", "Thailand", "Cambodia", "Malaysia", "Belize", "Papua New Guinea", "Bhutan", "eSwatini", "Lesotho", "Japan", "Sweden", "Saudi Arabia"])],
  [C.r7 + 2.7, C.gone7, chk(["India", "China", "Nigeria", "Mexico", "Bangladesh", "Egypt", "Ethiopia", "Vietnam", "United States of America", "Russia", "Pakistan", "Indonesia", "Brazil", "Japan", "Philippines", "Dem. Rep. Congo"])],
];
const HI: Record<string, number> = {};
const DEL: Record<string, number> = {};
GROUPS.forEach(([h, d, l]) =>
  l.forEach((g) => {
    if (DEL[g] !== undefined) return; // already deleted in an earlier round
    HI[g] = h;
    DEL[g] = CAST_OF[g] ? OUT[CAST_OF[g]] : d;
  }),
);
const FINAL3 = ["France", "Germany", "Italy"];
// "three left": everything else still standing is wiped in a sweep
WC.forEach((c) => {
  if (DEL[c.g] === undefined && !FINAL3.includes(c.g) && c.g !== "Taiwan" && c.g !== "Kosovo" && c.g !== "W. Sahara") DEL[c.g] = C.fin + 0.3 + ((c.b[0] + c.b[2]) / 2 / 1920) * 1.1;
});
DEL.Taiwan = DEL.Kosovo = DEL["W. Sahara"] = C.fin + 0.9;
DEL.Italy = C.itaOut;
const NB_ATLAS: Record<string, string> = { San: "San Marino", Czechia: "Czechia" };
const COLORS = ["#f6c344", "#7cc56b", "#ff9b71", "#b590e0", "#4fc1a6", "#f7a1c4", "#e8d36a", "#8fd0ff"];
const colorOf = (g: string) => COLORS[[...g].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) % 9973, 7) % COLORS.length];
const DEAD = "#3b4263";
const mix = (a: string, b: string, u: number) => {
  const p = (h: string, i: number) => parseInt(h.slice(1 + i * 2, 3 + i * 2), 16);
  return `rgb(${[0, 1, 2].map((i) => Math.round(p(a, i) + (p(b, i) - p(a, i)) * u)).join(",")})`;
};
/** the neighbor currently lit during the final count, per country being counted */
const litAt = (g: string, t: number) => {
  for (let i = 0; i < NB.length; i++) {
    const at = NB_AT[i];
    const end = i === 2 ? C.frWins + 1 : at[at.length - 1] + 1.5;
    if (t < NB[i][1] || t > end) continue;
    const idx = NB[i][2].findIndex((w, j) => (NB_ATLAS[w] ?? w) === g && t >= at[j]);
    if (idx >= 0) return clamp((t - at[idx]) / 0.2);
  }
  return 0;
};
const fillOf = (c: WCountry, t: number) => {
  const g = c.g;
  if (t < C.hi + 0.7) {
    const r = rnd(g.length * 13 + c.b[0]);
    const appear = clamp((t - (r * 1.9 - 0.3)) / 0.25);
    const dz = C.brk + 0.2 + rnd(c.b[1] + 7) * 1.8;
    const gone = r > 0.35 && t > dz;
    if (gone) return t < dz + 0.15 ? "#ffffff" : DEAD;
    return mix(DEAD, colorOf(g), appear);
  }
  const lit = litAt(g, t);
  if (lit > 0) return mix(DEAD, "#ffffff", lit);
  if (t >= C.fin && FINAL3.includes(g) && !(DEL[g] !== undefined && t >= DEL[g])) return mix(colorOf(g), GOLD, clamp((t - C.fin) / 0.4));
  const d = DEL[g];
  if (d !== undefined && t >= d) return t < d + 0.18 ? "#ffffff" : DEAD;
  const h = HI[g];
  if (h !== undefined && t >= h) return mix(colorOf(g), RED, 0.75 + 0.25 * Math.sin((t - h) * 9));
  return colorOf(g);
};
const MapView: React.FC<{ t: number; cam: Cam }> = ({ t, cam }) => {
  const eq = t > C.n13 - 0.3 && t < C.r2 ? ease((t - C.n13 + 0.3) / 0.4) : 0;
  const inv = 1 / cam.z;
  const pinsOn = t > C.hi + 0.7;
  return (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="#2a6fb0" />
      <g transform={`translate(960 540) scale(${cam.z}) translate(${-cam.cx} ${-cam.cy})`}>
        {WC.map((c, i) => (
          <path key={i} d={cam.z < 2.5 ? c.lo : c.d} fill={fillOf(c, t)} stroke={INK} strokeWidth={1.4 * inv} strokeLinejoin="round" />
        ))}
        {eq > 0 ? <path d={`M ${WORLD.x0} ${WORLD.eq} L ${WORLD.x1 * eq + WORLD.x0 * (1 - eq)} ${WORLD.eq}`} stroke={RED} strokeWidth={5 * inv} strokeDasharray={`${18 * inv} ${10 * inv}`} /> : null}
        {pinsOn
          ? ORDER.map((k) => {
              const o = OUT[k];
              if (o !== undefined && t > o + ZAP) return null;
              const [x, y] = PINS[k];
              const u = o !== undefined && t >= o ? (t - o) / ZAP : 0;
              const sc = (k === "VATICAN" ? 0.16 : 0.24) * inv * Math.min(2.2, Math.max(1, cam.z / 3)) * (u > 0 ? Math.max(0, 1.2 - u * 1.2) : 1);
              const dx = k === "VATICAN" ? 14 * inv : 0;
              return (
                <g key={k} transform={`translate(${x + dx} ${y}) scale(${sc})`}>
                  <clipPath id={`mp${k}`}>
                    <circle r={100} />
                  </clipPath>
                  <g clipPath={`url(#mp${k})`}>{FLAGS[k]}</g>
                  <circle r={100} fill="none" stroke={INK} strokeWidth={12} />
                  <Face mood={moodOf(k, t)} />
                  {u > 0 ? <circle r={110} fill="#fff" opacity={clamp(1 - u * 1.6)} /> : null}
                </g>
              );
            })
          : null}
        {t > C.martin - 0.3 && t < C.frWins ? (
          <circle cx={PINS.STMARTIN[0]} cy={PINS.STMARTIN[1]} r={26 * inv * (1 + 0.15 * Math.sin(t * 8))} fill="none" stroke={GOLD} strokeWidth={6 * inv} />
        ) : null}
        {t > C.ni - 0.3 && t < C.survives + 1 ? (
          <circle cx={PINS.IRELAND[0] + 6} cy={PINS.IRELAND[1] - 3} r={9 * (1 + 0.15 * Math.sin(t * 8))} fill="none" stroke={GOLD} strokeWidth={6 * inv} />
        ) : null}
      </g>
    </g>
  );
};

// ------------------------------------------------------------------ rule cards
const RULES: [number, string, string][] = [
  [C.r1, "RULE 1", "ON THE EQUATOR? DELETED."],
  [C.r2, "RULE 2", "NAME ENDS IN -STAN? DELETED."],
  [C.r3, "RULE 3", "NO COASTLINE? DELETED."],
  [C.r4, "RULE 4", "NO RED ON YOUR FLAG? DELETED."],
  [C.r5, "RULE 5", "NO LAND BORDER? DELETED."],
  [C.r6, "RULE 6", "HAS A KING, QUEEN OR EMPEROR? DELETED."],
  [C.r7, "RULE 7", "OVER 100 MILLION PEOPLE? DELETED."],
  [C.finRule - 0.4, "FINAL", "MOST NEIGHBORS WINS."],
];
const RuleCard: React.FC<{ t: number }> = ({ t }) => {
  const i = [...RULES].reverse().findIndex((r) => t >= r[0]);
  if (i < 0 || t >= C.told) return null;
  const [t0, head, line] = RULES[RULES.length - 1 - i];
  const u = inOut((t - t0 - 2.6) / 0.5); // big -> docked
  const slam = ease((t - t0) / 0.22);
  const big = { x: 960, y: 470, k: 1 };
  const dock = { x: 40 + (Math.max(head.length * 70, line.length * 44) + 120) * 0.25, y: 100, k: 0.5 };
  const x = big.x + (dock.x - big.x) * u;
  const y = big.y + (dock.y - big.y) * u;
  const k = (big.k + (dock.k - big.k) * u) * (1.25 - 0.25 * slam);
  const w = Math.max(head.length * 70, line.length * 44) + 120;
  return (
    <g>
      {u < 1 ? <rect x={0} y={0} width={1920} height={1080} fill={INK} opacity={0.45 * (1 - u) * slam} /> : null}
      <g transform={`translate(${x} ${y}) scale(${k})`} opacity={slam}>
        <rect x={-w / 2} y={-150} width={w} height={270} rx={34} fill="#fff" stroke={INK} strokeWidth={10} />
        <rect x={-150} y={-200} width={300} height={100} rx={22} fill={RED} stroke={INK} strokeWidth={8} />
        <text y={-128} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={62} fill="#fff">
          {head}
        </text>
        <text y={50} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={74} fill={INK}>
          {line}
        </text>
      </g>
    </g>
  );
};

// ------------------------------------------------------------------ chips (countries named in passing)
type Chip = { label: string; at: number; flag?: React.ReactNode };
const mini = (cols: string[], vert = false) => (
  <g>
    {cols.map((c, i) => (vert ? <rect key={i} x={-30 + (60 / cols.length) * i} y={-30} width={60 / cols.length + 0.5} height={60} fill={c} /> : <rect key={i} x={-30} y={-30 + (60 / cols.length) * i} width={60} height={60 / cols.length + 0.5} fill={c} />))}
  </g>
);
const cross = (bg: string, fg: string) => (
  <g>
    <rect x={-30} y={-30} width={60} height={60} fill={bg} />
    <rect x={-30} y={-6} width={60} height={12} fill={fg} />
    <rect x={-14} y={-30} width={12} height={60} fill={fg} />
  </g>
);
const NOFLAG: Record<string, React.ReactNode> = {
  SWEDEN: cross("#006aa7", "#fecc00"),
  GREECE: (
    <g>
      {mini(["#0d5eaf", "#fff", "#0d5eaf", "#fff", "#0d5eaf", "#fff", "#0d5eaf", "#fff", "#0d5eaf"])}
      <rect x={-30} y={-30} width={33} height={33} fill="#0d5eaf" />
      <rect x={-30} y={-19} width={33} height={7} fill="#fff" />
      <rect x={-17} y={-30} width={7} height={33} fill="#fff" />
    </g>
  ),
  ARGENTINA: (
    <g>
      {mini(["#74acdf", "#fff", "#74acdf"])}
      <circle r={7} fill="#f6b40e" />
    </g>
  ),
  FINLAND: cross("#fff", "#002f6c"),
  UKRAINE: mini(["#0057b7", "#ffd700"]),
};
const list = (names: string[], after: number, flags = false): Chip[] => {
  let a = after;
  return names.map((nm) => {
    a = TW(nm.split(" ")[0], a);
    return { label: nm.toUpperCase(), at: a, flag: flags ? NOFLAG[nm.toUpperCase()] : undefined };
  });
};
// [from, to, strike time, chips]
const CHIPS: [number, number, number, Chip[]][] = [
  [C.n13, C.r2, C.braOut, list(["Ecuador", "Colombia", "Kenya", "Indonesia", "Somalia"], C.n13)],
  [C.r2 + 2.6, C.r3, C.gone2, list(["Afghanistan", "Pakistan", "Kazakhstan", "Uzbekistan", "Turkmenistan", "Kyrgyzstan", "Tajikistan"], C.r2 + 2)],
  [C.n44, C.r4, C.vatOut, list(["Switzerland", "Austria", "Hungary", "Mongolia", "Bolivia"], C.n44)],
  [C.r4 + 2.6, C.r5, C.gone4, list(["Sweden", "Greece", "Argentina", "Finland", "Ukraine"], C.r4 + 2, true)],
  [C.r7 + 2.6, C.fin, C.gone7, list(["India", "China", "Indonesia", "Nigeria", "Mexico"], C.r7 + 2)],
];
const Chips: React.FC<{ t: number }> = ({ t }) => {
  const g = CHIPS.find(([a, b]) => t >= a - 1.5 && t < b);
  if (!g) return null;
  const [, b, strike, chips] = g;
  const o = clamp((b - t) / 0.3);
  let x = 40;
  let y = 185;
  return (
    <g opacity={o}>
      {chips.map((c, i) => {
        const w = c.label.length * 24 + (c.flag ? 120 : 64);
        if (x + w > 1880) {
          x = 40;
          y += 84;
        }
        const cx = x;
        x += w + 14;
        const a = ease((t - c.at) / 0.22);
        if (a <= 0) return null;
        const s = ease((t - strike - i * 0.06) / 0.2);
        return (
          <g key={i} transform={`translate(${cx} ${y}) scale(${0.85 + 0.15 * a})`} opacity={a}>
            <rect width={w} height={68} rx={34} fill={s > 0 ? "#ffd9d6" : "#fff"} stroke={INK} strokeWidth={5} />
            {c.flag ? (
              <g transform="translate(40 34) scale(0.85)">
                <clipPath id={`cf${i}`}>
                  <circle r={26} />
                </clipPath>
                <g clipPath={`url(#cf${i})`}>{c.flag}</g>
                <circle r={26} fill="none" stroke={INK} strokeWidth={4} />
              </g>
            ) : (
              <circle cx={34} cy={34} r={12} fill={RED} stroke={INK} strokeWidth={4} />
            )}
            <text x={c.flag ? 82 : 58} y={46} fontFamily="Poppins" fontWeight={800} fontSize={34} fill={INK}>
              {c.label}
            </text>
            {s > 0 ? <rect x={14} y={30} width={(w - 28) * s} height={9} rx={4} fill={RED} /> : null}
          </g>
        );
      })}
    </g>
  );
};

// ------------------------------------------------------------------ speech bubbles (screen space, follow their speaker)
type Bubble = { who: string; at: number; to: number; text: string };
const bub = (who: string, k: string, text: string, delay = 0, extra = 0.7): Bubble => ({ who, at: M[k][0] + delay, to: mEnd(k) + extra, text });
const BUBBLES: Bubble[] = [
  bub("BRAZIL", "b_brazil", "WAIT, I JUST GOT HERE!"),
  bub("USA", "b_usa", "HEY!"),
  bub("VATICAN", "b_vat", "I'LL PRAY FOR ALL OF YOU.", 0, -1.3),
  bub("ITALY", "b_vat", "BYE, ROOMMATE.", 1.3, 0.3),
  bub("GHOST", "b_bra_ghost", "I WASN'T EVEN HERE!"),
  bub("GERMANY", "b_ger", "RED. NOTED."),
  bub("JAPAN", "b_jap", "THANK YOU FOR HAVING ME."),
  bub("AUSTRALIA", "b_aus", "I'M NOT AN ISLAND, I'M A CONTINENT!", 0, 1.2),
  bub("UK", "b_uk1", "JOLLY GOOD."),
  bub("UK", "b_uk2", "OH, COME ON."),
  bub("CANADA", "b_can", "SORRY."),
  bub("USA", "b_usa2", "I FOUGHT A WHOLE WAR SO I WOULDN'T HAVE A KING."),
  bub("USA", "b_obj", "OBJECTION!"),
  bub("RUSSIA", "b_rus", "..."),
  bub("ITALY", "b_ita", "THE VATICAN STILL COUNTS! IT LIVES AT MY PLACE!"),
  bub("GERMANY", "b_ger2", "EFFICIENT."),
  bub("GHOST", "b_bra2", "I'M BACK!"),
  bub("FRANCE", "b_fra", "OBVIOUSLY."),
];
const wrap = (s: string, max = 18) => {
  const out: string[] = [];
  let cur = "";
  for (const w of s.split(" ")) {
    if (cur && (cur + " " + w).length > max) {
      out.push(cur);
      cur = w;
    } else cur = (cur + " " + w).trim();
  }
  if (cur) out.push(cur);
  return out;
};
const Bubbles: React.FC<{ t: number; cam: Cam }> = ({ t, cam }) => (
  <g>
    {BUBBLES.filter((b) => t >= b.at && t < b.to).map((b, i) => {
      const p = b.who === "GHOST" ? ghostPos(t) : slotAt(b.who, t);
      const [hx, hy] = project(cam, p.x, p.y - 100 * p.s);
      const lines = wrap(b.text);
      const w = Math.max(...lines.map((l) => l.length)) * 31 + 70;
      const h = lines.length * 58 + 40;
      const right = hx < 1300;
      const bx = clamp(right ? hx + 60 : hx - 60 - w, 20, 1900 - w);
      const by = clamp(hy - h - 50, 20, 1060 - h);
      const a = ease((t - b.at) / 0.18) * clamp((b.to - t) / 0.2);
      const tx = right ? bx + 50 : bx + w - 50;
      return (
        <g key={i} opacity={a} transform={`translate(${tx} ${by + h}) scale(${0.8 + 0.2 * a}) translate(${-tx} ${-(by + h)})`}>
          <path d={`M ${tx - 22} ${by + h - 4} L ${clamp(hx, tx - 80, tx + 80)} ${Math.min(hy - 10, by + h + 60)} L ${tx + 22} ${by + h - 4} Z`} fill="#fff" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
          <rect x={bx} y={by} width={w} height={h} rx={30} fill="#fff" stroke={INK} strokeWidth={6} />
          <rect x={tx - 20} y={by + h - 10} width={40} height={12} fill="#fff" />
          {lines.map((l, j) => (
            <text key={j} x={bx + w / 2} y={by + 66 + j * 58} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={46} fill={INK}>
              {l}
            </text>
          ))}
        </g>
      );
    })}
  </g>
);

// ------------------------------------------------------------------ DELETED stamps (screen space)
const Stamps: React.FC<{ t: number; cam: Cam }> = ({ t, cam }) => (
  <g>
    {[...Object.entries(OUT), ["GHOST", C.ghost1Out] as [string, number]].map(([k, t0]) => {
      const u = t - t0 - 0.1;
      if (u < 0 || u > 1.5) return null;
      const p = k === "GHOST" ? ghostPos(t0) : slots(alive(t0 - 0.01))[k];
      const [sx, sy] = project(cam, p.x, p.y);
      const s = 1.5 - 0.5 * ease(u / 0.18);
      return (
        <g key={k} transform={`translate(${clamp(sx, 300, 1620)} ${clamp(sy, 120, 960)}) rotate(-12) scale(${s})`} opacity={ease(u / 0.12) * clamp((1.5 - u) / 0.3)}>
          <rect x={-230} y={-62} width={460} height={124} rx={18} fill="rgba(255,255,255,0.9)" stroke={RED} strokeWidth={12} />
          <text y={30} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={86} fill={RED}>
            {k === "GHOST" ? "AGAIN" : "DELETED"}
          </text>
        </g>
      );
    })}
  </g>
);

// ------------------------------------------------------------------ info cards
type Info = { a: number; b: number; big: string; small?: string; art?: React.ReactNode };
const Boat = (
  <g transform="translate(0 30)">
    <ellipse rx={260} ry={60} fill="#5ec4ff" stroke={INK} strokeWidth={6} />
    <path d="M -110 -10 L 110 -10 L 80 30 L -80 30 Z" fill="#fff" stroke={INK} strokeWidth={6} />
    <path d="M 0 -10 L 0 -130" stroke={INK} strokeWidth={8} />
    <path d="M 6 -126 L 86 -40 L 6 -40 Z" fill="#d52b1e" stroke={INK} strokeWidth={5} />
    <path d="M -6 -110 L -70 -40 L -6 -40 Z" fill="#ffd700" stroke={INK} strokeWidth={5} />
  </g>
);
const Burger = (
  <g transform="translate(0 10)">
    <path d="M -110 -10 Q -110 -90 0 -90 Q 110 -90 110 -10 Z" fill="#e0a24a" stroke={INK} strokeWidth={6} />
    <rect x={-120} y={-12} width={240} height={22} rx={10} fill="#3fae4a" stroke={INK} strokeWidth={5} />
    <rect x={-115} y={8} width={230} height={30} rx={14} fill="#6b3b1f" stroke={INK} strokeWidth={5} />
    <path d="M -110 36 L 110 36 Q 110 76 0 76 Q -110 76 -110 36 Z" fill="#e0a24a" stroke={INK} strokeWidth={6} />
  </g>
);
const Crown = (
  <path d="M -80 30 L -90 -50 L -45 -10 L 0 -70 L 45 -10 L 90 -50 L 80 30 Z" fill={GOLD} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
);
const INFO: Info[] = [
  { a: C.collect, b: C.works, big: "RENT: DUE", small: "PAY UP, PLANET" },
  { a: C.n13, b: C.n13 + 2.2, big: "13 COUNTRIES", small: "SIT ON THE EQUATOR" },
  { a: C.tattoo, b: C.r2 - 0.3, big: "ECUADOR", small: "= SPANISH FOR 'EQUATOR'" },
  { a: C.persian, b: C.burger - 0.2, big: "-STAN = 'PLACE OF'", small: "FROM PERSIAN" },
  { a: C.burger, b: M.b_usa[0] - 0.1, big: "BURGERSTAN", art: Burger },
  { a: C.n44, b: C.n44 + 1.9, big: "44 COUNTRIES", small: "WITH NO COAST AT ALL" },
  { a: C.bol, b: C.first - 0.2, big: "BOLIVIA'S NAVY", small: "HAS NO OCEAN", art: Boat },
  { a: C.n14k, b: M.b_jap[0], big: "14,000+ ISLANDS", small: "ZERO LAND BORDERS" },
  { a: C.km - 0.1, b: C.survives + 0.6, big: "~500 KM LAND BORDER", small: "NORTHERN IRELAND (UK) + IRELAND" },
  { a: C.k15, b: C.sub + 1.4, big: "KING OF 15 COUNTRIES", small: "THE ROYAL SUBSCRIPTION", art: Crown },
  { a: C.oldest, b: M.b_usa2[0] - 0.1, big: "JAPAN", small: "OLDEST MONARCHY IN THE WORLD", art: Crown },
  { a: C.n340, b: M.b_obj[0], big: "~340 MILLION", small: "PEOPLE IN THE USA" },
  { a: C.n144, b: C.zones, big: "~144 MILLION", small: "PEOPLE IN RUSSIA" },
  { a: C.zones, b: M.b_rus[0], big: "11 TIME ZONES", small: "STILL RAN OUT OF TIME" },
  { a: C.guiana, b: C.brazil2 - 0.1, big: "FRENCH GUIANA", small: "FRANCE, IN SOUTH AMERICA" },
  { a: C.longest, b: M.b_bra2[0], big: "FRANCE'S LONGEST BORDER", small: "IS WITH BRAZIL" },
  { a: C.martin, b: C.n11 - 0.1, big: "SAINT MARTIN", small: "FRANCE + NETHERLANDS, ONE ISLAND" },
];
const InfoCards: React.FC<{ t: number }> = ({ t }) => {
  const c = INFO.find((x) => t >= x.a && t < x.b);
  if (!c) return null;
  const a = ease((t - c.a) / 0.25) * clamp((c.b - t) / 0.2);
  const w = Math.max(c.big.length * 52, (c.small ?? "").length * 24) + 100;
  const art = !!c.art;
  const h = art ? 520 : 210;
  return (
    <g transform={`translate(1380 ${art ? 420 : 300}) scale(${0.85 + 0.15 * a})`} opacity={a}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={30} fill="#fff" stroke={INK} strokeWidth={8} />
      {art ? <g transform="translate(0 -60)">{c.art}</g> : null}
      <text y={art ? 170 : -2} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={84} fill={INK}>
        {c.big}
      </text>
      {c.small ? (
        <text y={art ? 225 : 62} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={38} fill={GREY}>
          {c.small}
        </text>
      ) : null}
    </g>
  );
};

// cast intro lower third
const LowerThird: React.FC<{ t: number }> = ({ t }) => {
  if (t < C.USA - 0.2 || t > C.find) return null;
  const i = [...ORDER].reverse().findIndex((k) => t >= C[k] - 0.15);
  if (i < 0) return null;
  const k = ORDER[ORDER.length - 1 - i];
  const a = ease((t - C[k] + 0.1) / 0.3);
  return (
    <g transform={`translate(${60 - 80 * (1 - a)} 860)`} opacity={a}>
      <rect x={0} y={0} width={Math.max(NAME[k].length * 64, TAG[k].length * 26) + 80} height={170} rx={24} fill="#fff" stroke={INK} strokeWidth={7} />
      <rect x={0} y={0} width={18} height={170} rx={9} fill={RED} />
      <text x={44} y={86} fontFamily="Poppins" fontWeight={800} fontSize={84} fill={INK}>
        {NAME[k]}
      </text>
      <text x={44} y={140} fontFamily="Poppins" fontWeight={800} fontSize={40} fill={GREY}>
        {TAG[k]}
      </text>
    </g>
  );
};

// green checks for "all safe"
const SAFE_NAMES = ["America", "Canada", "Russia", "UK", "France", "Japan", "Australia", "Italy", "Germany"];
const SAFE_KEYS = ["USA", "CANADA", "RUSSIA", "UK", "FRANCE", "JAPAN", "AUSTRALIA", "ITALY", "GERMANY"];
const SAFE_AT = (() => {
  let a = C.everyone;
  return SAFE_NAMES.map((nm) => (a = TW(nm, a)));
})();
const Checks: React.FC<{ t: number }> = ({ t }) => {
  if (t < C.everyone || t > C.r5) return null;
  const o = clamp((C.r5 - t) / 0.3);
  return (
    <g opacity={o}>
      {SAFE_KEYS.map((k, i) => {
        const a = ease((t - SAFE_AT[i]) / 0.2);
        if (a <= 0) return null;
        const p = slotAt(k, t);
        return (
          <g key={k} transform={`translate(${p.x + 80 * p.s} ${p.y - 90 * p.s}) scale(${p.s * a})`}>
            <circle r={42} fill={GREEN} stroke={INK} strokeWidth={6} />
            <path d="M -20 0 L -6 16 L 22 -16" fill="none" stroke="#fff" strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
          </g>
        );
      })}
    </g>
  );
};

// crowns in round 6 (world space)
const Crowns: React.FC<{ t: number }> = ({ t }) => (
  <g>
    {(
      [
        ["UK", M.b_uk2[0] - 0.6, C.ukGone],
        ["CANADA", C.also, C.canOut],
        ["FRANCE", C.frWins, TOT + 1],
      ] as [string, number, number][]
    ).map(([k, a, b]) => {
      if (t < a || t >= b) return null;
      const p = slotAt(k, t);
      const u = ease((t - a) / 0.35);
      return (
        <g key={k} transform={`translate(${p.x} ${p.y - 150 * p.s - 80 * (1 - u) + Math.sin(t * 2.2 + ORDER.indexOf(k) * 1.7) * 4}) scale(${p.s * 0.9})`} opacity={u}>
          {Crown}
        </g>
      );
    })}
  </g>
);

// neighbor counters in the final (world space, above heads)
const NB: [string, number, string[]][] = [
  ["ITALY", C.itaUp, ["France", "Switzerland", "Austria", "Slovenia", "San", "Vatican"]],
  ["GERMANY", C.ger + 0.3, ["Denmark", "Poland", "Czechia", "Austria", "Switzerland", "France", "Luxembourg", "Belgium", "Netherlands"]],
  ["FRANCE", C.fra + 0.3, ["Belgium", "Luxembourg", "Germany", "Switzerland", "Italy", "Monaco", "Andorra", "Spain", "Suriname", "Brazil", "Netherlands"]],
];
const NB_AT = NB.map(([, a, ws]) => {
  let x = a;
  return ws.map((w) => (x = TW(w, x)));
});
const Counters: React.FC<{ t: number }> = ({ t }) => {
  if (t < C.itaUp || t > C.told) return null;
  return (
    <g>
      {NB.map(([k], i) => {
        if ((OUT[k] !== undefined && t > OUT[k]) || t > C.frWins + 1.1) return null;
        const c = NB_AT[i].filter((x) => t >= x).length;
        if (c === 0) return null;
        const last = NB_AT[i][c - 1];
        const p = slotAt(k, t);
        const kick = 1 + 0.25 * clamp(1 - (t - last) / 0.2);
        const win = k === "FRANCE" && t >= C.frWins;
        return (
          <g key={k} transform={`translate(${p.x} ${p.y - 265 * p.s}) scale(${p.s * kick})`}>
            <circle r={58} fill={win ? GOLD : "#fff"} stroke={INK} strokeWidth={7} />
            <text y={26} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={72} fill={INK}>
              {c}
            </text>
          </g>
        );
      })}
    </g>
  );
};
// on the map, the running count sits in the corner
const MapCount: React.FC<{ t: number; op: number }> = ({ t, op }) => {
  if (op <= 0 || t < C.itaUp || t > C.frWins + 1.1) return null;
  let i = NB.length - 1;
  while (i > 0 && t < NB[i][1]) i--;
  const c = NB_AT[i].filter((x) => t >= x).length;
  const last = NB_AT[i][Math.max(0, c - 1)];
  const kick = c ? 1 + 0.15 * clamp(1 - (t - last) / 0.2) : 1;
  const label = NB[i][0];
  return (
    <g opacity={op} transform={`translate(1640 900) scale(${kick})`}>
      <rect x={-230} y={-90} width={460} height={180} rx={30} fill="#fff" stroke={INK} strokeWidth={8} />
      <text y={-28} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={40} fill={GREY}>
        {label} NEIGHBORS
      </text>
      <text y={62} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={100} fill={INK}>
        {c}
      </text>
    </g>
  );
};
// the neighbor being named, as a chip at the top
const NeighborChip: React.FC<{ t: number }> = ({ t }) => {
  if (t < C.itaUp || t > C.frWins + 0.4) return null;
  for (let i = NB.length - 1; i >= 0; i--) {
    const at = NB_AT[i];
    const c = at.filter((x) => t >= x).length;
    if (c === 0 || t > at[at.length - 1] + 1.2) continue;
    const nm = NB[i][2][c - 1];
    const label = (nm === "San" ? "SAN MARINO" : nm === "Netherlands" && i === 2 ? "NETHERLANDS (SAINT MARTIN)" : nm === "Suriname" ? "SURINAME (VIA FRENCH GUIANA)" : nm === "Brazil" && i === 2 ? "BRAZIL (VIA FRENCH GUIANA)" : nm.toUpperCase()) + ` +1`;
    const a = ease((t - at[c - 1]) / 0.15);
    return (
      <g transform={`translate(960 170) scale(${0.9 + 0.1 * a})`}>
        <rect x={-label.length * 17 - 40} y={-46} width={label.length * 34 + 80} height={86} rx={43} fill="#fff" stroke={INK} strokeWidth={6} />
        <text y={16} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={50} fill={INK}>
          {label}
        </text>
      </g>
    );
  }
  return null;
};

// confetti when France wins
const Confetti: React.FC<{ t: number }> = ({ t }) => {
  const u = t - C.frWins - 0.1;
  if (u < 0 || u > 4) return null;
  return (
    <g opacity={clamp((4 - u) / 0.6)}>
      {Array.from({ length: 70 }, (_, i) => {
        const x = rnd(i) * 1920;
        const y = -40 + (u * (260 + rnd(i + 50) * 260)) % 1200;
        return <rect key={i} x={x + Math.sin(u * 3 + i) * 30} y={y} width={16} height={26} fill={["#0055a4", "#fff", "#ef4135", GOLD][i % 4]} stroke={INK} strokeWidth={2} transform={`rotate(${u * 200 + i * 40} ${x} ${y})`} />;
      })}
    </g>
  );
};

// small screen-space pills
const Pill: React.FC<{ t: number; a: number; b: number; text: string; y?: number; color?: string }> = ({ t, a, b, text, y = 960, color = GOLD }) => {
  if (t < a || t > b) return null;
  const o = ease((t - a) / 0.25) * clamp((b - t) / 0.25);
  return (
    <g transform={`translate(960 ${y}) scale(${0.85 + 0.15 * o})`} opacity={o}>
      <rect x={-text.length * 22 - 50} y={-58} width={text.length * 44 + 100} height={110} rx={55} fill={color} stroke={INK} strokeWidth={8} />
      <text y={20} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={64} fill={INK}>
        {text}
      </text>
    </g>
  );
};

// outro checklist: which round kills your country
const Outro: React.FC<{ t: number }> = ({ t }) => {
  if (t < C.honest - 0.1 || t > C.next - 0.2) return null;
  const o = ease((t - C.honest + 0.1) / 0.3) * clamp((C.next - 0.2 - t) / 0.25);
  return (
    <g opacity={o}>
      <rect x={0} y={0} width={1920} height={1080} fill={INK} opacity={0.55} />
      <g transform="translate(960 110)">
        <text textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={76} fill="#fff">
          WHICH RULE KILLS YOUR COUNTRY?
        </text>
      </g>
      {RULES.map(([, h, l], i) => {
        const a = ease((t - C.honest - i * 0.18) / 0.25);
        return (
          <g key={i} transform={`translate(${i < 4 ? 120 : 990} ${230 + (i % 4) * 190})`} opacity={a}>
            <rect width={820} height={160} rx={26} fill="#fff" stroke={INK} strokeWidth={6} />
            <rect x={20} y={20} width={210} height={120} rx={18} fill={RED} />
            <text x={125} y={100} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={46} fill="#fff">
              {h}
            </text>
            <text x={255} y={96} fontFamily="Poppins" fontWeight={800} fontSize={l.length > 26 ? 28 : 34} fill={INK}>
              {l.replace(" DELETED.", "")}
            </text>
          </g>
        );
      })}
      <Pill t={t} a={C.comments - 0.1} b={C.next} text="COMMENT YOUR ANSWER" y={1010} />
    </g>
  );
};

// ending: every country is back, staring at the host
const Revenge: React.FC<{ t: number }> = ({ t }) => {
  if (t < C.next) return null;
  return (
    <g>
      {ORDER.map((k, i) => {
        const a = ease((t - C.next - 0.3 - i * 0.12) / 0.3);
        const x = 620 + (i % 6) * 220 + (i >= 6 ? 110 : 0);
        const y = i >= 6 ? 860 : 600;
        return (
          <g key={k} transform={`translate(${x} ${y + 60 * (1 - a)}) scale(0.62)`} opacity={a}>
            <clipPath id={`rv${k}`}>
              <circle r={100} />
            </clipPath>
            <g clipPath={`url(#rv${k})`}>{FLAGS[k]}</g>
            <circle r={100} fill="none" stroke={INK} strokeWidth={7} />
            <Face mood="angry" />
          </g>
        );
      })}
    </g>
  );
};

// ------------------------------------------------------------------ sound
type Sfx = "pop" | "tick" | "swoosh" | "tap" | "zap" | "ding" | "thud";
const VOL: Record<Sfx, number> = { pop: 0.1, tick: 0.09, swoosh: 0.08, tap: 0.09, zap: 0.09, ding: 0.1, thud: 0.14 };
const SFX: [number, Sfx][] = (() => {
  const ev: [number, Sfx][] = [];
  for (let i = 0; i < 12; i++) ev.push([i * 0.15, "tap"]);
  ev.push([C.rules, "thud"], [C.brk + 0.25, "zap"], [C.brk + 0.9, "zap"], [C.brk + 1.5, "zap"], [C.winner + 0.3, "thud"]);
  RULES.forEach(([a]) => ev.push([a - 0.05, "swoosh"], [a + 0.15, "thud"]));
  Object.values(OUT).forEach((a) => ev.push([a, "zap"], [a + 0.1, "thud"]));
  ev.push([C.ghost1Out, "zap"]);
  const outs = Object.values(OUT);
  GROUPS.forEach(([, d]) => {
    if (!outs.some((o) => Math.abs(o - d) < 0.3)) ev.push([d, "zap"]);
  });
  ev.push([C.fin + 0.3, "swoosh"]);
  BUBBLES.forEach((b) => ev.push([b.at, "pop"]));
  CHIPS.forEach(([, , s, cs]) => {
    cs.forEach((c) => ev.push([c.at, "tap"]));
    ev.push([s, "tick"]);
  });
  INFO.forEach((x) => ev.push([x.a, "pop"]));
  SAFE_AT.forEach((a) => ev.push([a, "tick"]));
  NB_AT.flat().forEach((a) => ev.push([a, "tick"]));
  ORDER.forEach((k) => ev.push([C[k] - 0.15, "swoosh"]));
  ev.push([C.safe, "ding"], [C.survives, "ding"], [C.gerWins, "ding"], [C.wait - 0.05, "thud"], [C.frWins, "ding"], [C.frWins + 0.25, "ding"]);
  return ev.sort((a, b) => a[0] - b[0]);
})();

// ------------------------------------------------------------------ main
export const GeoEp1: React.FC<{ audio?: boolean }> = ({ audio = true }) => {
  const ready = useFonts();
  const f = useCurrentFrame();
  const t = f / GEO1_FPS;
  if (!ready) return <AbsoluteFill style={{ background: PAPER }} />;
  const { stage: cam, map: mcam, mapOp } = cameras(t);
  const talk = (AMP as number[])[f] ?? 0;
  const live = alive(t);
  const zapping = Object.keys(OUT).filter((k) => t >= OUT[k] && t < OUT[k] + ZAP);
  const cast = t >= C.next ? [] : ORDER.filter((k) => live.includes(k) || zapping.includes(k));
  const back = cast.filter((k) => (slotAt(k, t).y < 700));
  const front = cast.filter((k) => !back.includes(k));
  const eq = t > C.waist - 0.2 && t < C.n13 ? ease((t - C.waist + 0.2) / 0.5) : 0;
  return (
    <AbsoluteFill style={{ background: "#1f2a55", fontFamily: "Poppins" }}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080">
        <g transform={`translate(960 540) scale(${cam.z}) translate(${-cam.cx} ${-cam.cy})`}>
          <Stage t={t} />
          {back.map((k) => (
            <Char key={k} k={k} t={t} p={slotAt(k, t)} />
          ))}
          {front.map((k) => (
            <Char key={k} k={k} t={t} p={slotAt(k, t)} />
          ))}
          <Host x={HOST.x} y={HOST.y + Math.sin(t * 1.8) * 3} s={HOST.s} talk={t < C.next + 0.3 ? talk : 0} label={false} eq={eq} />
          {ghostOn(t) ? (
            <g opacity={ghostOpacity(t)}>
              <Char k="BRAZIL" t={t} p={ghostPos(t)} ghost />
            </g>
          ) : null}
          <Particles t={t} />
          <Checks t={t} />
          <Crowns t={t} />
          <Counters t={t} />
          <Revenge t={t} />
        </g>
        {mapOp > 0 ? (
          <g opacity={mapOp}>
            <MapView t={t} cam={mcam} />
          </g>
        ) : null}
        <Hook t={t} />
        <MapCount t={t} op={mapOp} />
        <Chips t={t} />
        <InfoCards t={t} />
        <LowerThird t={t} />
        <NeighborChip t={t} />
        <Pill t={t} a={C.find} b={C.r1 - 0.2} text="COMMENT YOUR COUNTRY" />
        <Pill t={t} a={C.appeals} b={C.allowed} text="NO APPEALS. NO CRYING." color="#fff" />
        <Pill t={t} a={C.except} b={C.ni} text="WAIT." color="#fff" y={200} />
        <Pill t={t} a={C.wait} b={C.guiana} text="WAIT. FRANCE ISN'T DONE." color="#fff" y={200} />
        <Pill t={t} a={C.redflag} b={C.island} text="RED FLAG" color={RED} y={200} />
        <Pill t={t} a={C.frWins + 1.2} b={C.told} text="FRANCE WINS" y={990} />
        <Pill t={t} a={C.next} b={TOT} text="NEXT EPISODE: REVENGE" y={180} />
        <Outro t={t} />
        <Bubbles t={t} cam={cam} />
        <Stamps t={t} cam={cam} />
        <Confetti t={t} />
        <RuleCard t={t} />
      </svg>
      {audio ? <Audio src={staticFile("geo/geo-ep1-vo.wav")} volume={1} /> : null}
      {audio
        ? SFX.map(([at, k], i) => (
            <Sequence key={i} from={Math.max(0, Math.round(at * GEO1_FPS))} durationInFrames={30}>
              <Audio src={staticFile(`geo/sfx/${k}.wav`)} volume={VOL[k]} />
            </Sequence>
          ))
        : null}
    </AbsoluteFill>
  );
};
