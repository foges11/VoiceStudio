import React from "react";
import { Composition } from "remotion";
import { Demo, DEMO_MOODS } from "./demo/Demo";
import { DemoCast } from "./demo/DemoCast";
import { DemoMove, MOVE_FRAMES } from "./demo/DemoMove";
import { SUB } from "./inkbeat/core/frame";
import { CityLook } from "./city/CityLooks";
import { CityPro } from "./city/CityPro";
import { CityReal } from "./city/CityReal";
import { BrandCityEp0, EP0_FPS, EP0_FRAMES } from "./city/BrandCityEp0";
import { Ep0Thumb, Ep0ThumbWide } from "./city/Ep0Thumb";
import { MOB1_FPS, MOB1_FRAMES, MobRuleDay1 } from "./mob/MobRuleDay1";
import { MobRuleAvatar } from "./mob/MobRuleAvatar";
import { MobRuleAvatar2 } from "./mob/MobRuleAvatar2";
import { CoinflipAvatar } from "./coinflip/CoinflipAvatar";
import { Ep1Thumb } from "./coinflip/Ep1Thumb";
import { Ep2, EP2_FPS, EP2_FRAMES } from "./coinflip/Ep2";
import { IC_FRAMES, InstaCard } from "./coinflip/InstaCard";
import { SH1_FPS, SH1_FRAMES, Short1 } from "./coinflip/Short1";
import { Ep1, EP1_FPS, EP1_FRAMES } from "./coinflip/Ep1";
import { EP1T_FPS, EP1T_FRAMES, Ep1Test } from "./coinflip/Ep1Test";
import { MobvilleLook } from "./mob/MobvilleLook";
import { MOB1V2_FPS, MOB1V2_FRAMES, MobRuleDay1v2 } from "./mob/MobRuleDay1v2";
import { DURATION, LOOK_TIMES, PackageLook, PackageSheet, PackageShort } from "./package/Package";

// DemoHero: a low hero framing with foreground props. Demo: one still. Demo-<mood>: the same frame in each act light. DemoWide: the whole set.
// DemoCast: the three example characters in a row (a landscape family sheet).
// DemoMove: a 3 s beat-rig move (sharp). DemoMoveSub: the same at SUB × fps for motion blur (average with ffmpeg tmix).
export const Root: React.FC = () => (
  <>
    <Composition id="Demo" component={Demo} durationInFrames={30} fps={30} width={1080} height={1920} defaultProps={{ mood: "day", wide: false }} />
    <Composition id="DemoHero" component={Demo} durationInFrames={30} fps={30} width={1080} height={1920} defaultProps={{ mood: "dusk", wide: false, hero: true }} />
    <Composition id="DemoWide" component={Demo} durationInFrames={30} fps={30} width={1080} height={1920} defaultProps={{ mood: "day", wide: true }} />
    {DEMO_MOODS.map((m) => (
      <Composition key={m} id={`Demo-${m}`} component={Demo} durationInFrames={30} fps={30} width={1080} height={1920} defaultProps={{ mood: m, wide: false }} />
    ))}
    <Composition id="DemoCast" component={DemoCast} durationInFrames={30} fps={30} width={1920} height={1080} defaultProps={{ mood: "day" }} />
    <Composition id="DemoMove" component={DemoMove} durationInFrames={MOVE_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ sub: false }} />
    <Composition id="DemoMoveSub" component={DemoMove} durationInFrames={MOVE_FRAMES * SUB} fps={30 * SUB} width={1080} height={1920} defaultProps={{ sub: true }} />
    <Composition id="Package" component={PackageShort} durationInFrames={DURATION} fps={30} width={1080} height={1920} defaultProps={{ sub: false }} />
    <Composition id="PackageLook" component={PackageLook} durationInFrames={1} fps={30} width={1080} height={1920} defaultProps={{ at: 1 }} />
    <Composition id="PackageSheet" component={PackageSheet} durationInFrames={LOOK_TIMES.length} fps={30} width={1080} height={1920} />
    {[0, 1, 2].map((k) => (
      <Composition key={k} id={`MobvilleLook-${k}`} component={MobvilleLook} durationInFrames={1} fps={30} width={1080} height={1920} defaultProps={{ shot: k }} />
    ))}
    <Composition id="MobRuleDay1v2" component={MobRuleDay1v2} durationInFrames={MOB1V2_FRAMES} fps={MOB1V2_FPS} width={1080} height={1920} defaultProps={{ audio: true }} />
    <Composition id="CoinflipEp1" component={Ep1} durationInFrames={EP1_FRAMES} fps={EP1_FPS} width={1920} height={1080} defaultProps={{ audio: true }} />
    {[0, 1].map((v) => (
      <Composition key={v} id={`CoinflipEp1Thumb-${v}`} component={Ep1Thumb} durationInFrames={1} fps={30} width={1920} height={1080} defaultProps={{ v }} />
    ))}
    <Composition id="CoinflipShort1" component={Short1} durationInFrames={SH1_FRAMES} fps={SH1_FPS} width={1080} height={1920} defaultProps={{ audio: true, captions: true }} />
    {(
      [
        ["Your brain thinks future you is a stranger", 22.0, 24.34],
        ["Nobody saves money for a stranger", 165.0, 168.3],
        ["Waiting 10 years cost him $140,000", 225.0, 230.8],
      ] as const
    ).map(([title, from, to], v) => (
      <Composition key={v} id={`CoinflipInsta-${v}`} component={InstaCard} durationInFrames={IC_FRAMES} fps={30} width={1080} height={1350} defaultProps={{ title, from, to, length: "6:40", date: "November 23, 2026" }} />
    ))}
    <Composition id="CoinflipEp2" component={Ep2} durationInFrames={EP2_FRAMES} fps={EP2_FPS} width={1920} height={1080} defaultProps={{ audio: true }} />
    <Composition id="CoinflipEp1Test" component={Ep1Test} durationInFrames={EP1T_FRAMES} fps={EP1T_FPS} width={1920} height={1080} />
    {[0, 1, 2, 3].map((v) => (
      <Composition key={v} id={`CoinflipAvatar-${v}`} component={CoinflipAvatar} durationInFrames={1} fps={30} width={1080} height={1080} defaultProps={{ v }} />
    ))}
    <Composition id="MobRuleAvatar2" component={MobRuleAvatar2} durationInFrames={1} fps={30} width={1080} height={1080} />
    <Composition id="MobRuleAvatar" component={MobRuleAvatar} durationInFrames={1} fps={30} width={1080} height={1080} />
    <Composition id="MobRuleDay1" component={MobRuleDay1} durationInFrames={MOB1_FRAMES} fps={MOB1_FPS} width={1080} height={1920} defaultProps={{ audio: true }} />
    <Composition id="Ep0ThumbWide" component={Ep0ThumbWide} durationInFrames={1} fps={30} width={1920} height={1080} />
    <Composition id="Ep0Thumb" component={Ep0Thumb} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition id="BrandCityEp0" component={BrandCityEp0} durationInFrames={EP0_FRAMES} fps={EP0_FPS} width={1080} height={1920} defaultProps={{ audio: true }} />
    {(["empty", "built"] as const).map((l) => (
      <Composition key={l} id={`CityReal-${l}`} component={CityReal} durationInFrames={1} fps={30} width={1080} height={1920} defaultProps={{ look: l }} />
    ))}
    {(["model", "golden", "dusk"] as const).map((l) => (
      <Composition key={l} id={`CityPro-${l}`} component={CityPro} durationInFrames={1} fps={30} width={1080} height={1920} defaultProps={{ look: l }} />
    ))}
    {(["toy", "neon", "toon"] as const).map((l) => (
      <Composition key={l} id={`CityLook-${l}`} component={CityLook} durationInFrames={1} fps={30} width={1080} height={1920} defaultProps={{ look: l }} />
    ))}
  </>
);
