# Brand City: notes for Day 1

## How Episode 0 did (Instagram, about 10 hours in)

- Views 1,532, viewers 1,223, average watch 8 s of 20.8 s, 5 follows.
- Your typical reel: about 2,500 views at 10 h and 7,000 at 24 h. Episode 0 went flat at about 1,500.
- Skip rate 43.5%, marked "higher" than your usual. 85% of views came from the Reels tab.
- Retention: about 67% left at 2 s, about 50% at 4 s, a drop at 7–9 s (the rules), about 10% at the end.
- Shares 0%, saves 0%, likes 2.0%, comments 2.2% (27 comments), reposts 0.2%.
- YouTube: about 1,000 views at the same point.

## What it means

- The idea works: people who stayed commented. The packaging didn't.
- The opening (skyline, countdown) looks like a mobile game ad, so people swipe in the first second.
- The rules section (7–12 s) is a cliff: explaining loses people.
- Nothing in it was worth sending to a friend, so there were 0 shares and Instagram stopped pushing it.

## What Day 1 should do

1. Open on something happening, with a face: a building slamming down, or a mayor character reacting ("Someone actually moved in."). Motion and something odd in the first second.
2. Cut the rules to one line at the end ("Comment to get a building. Likes make it taller.") and point new viewers to Day 0.
3. Put real commenters' usernames on houses and buildings, so people send it to friends to show them their name.
4. Make it 12–15 s, with the best moment before 8 s.
5. Make it warmer and more character-driven, so it looks less like a game ad.

## Inputs needed before building Day 1

- Screenshots of the Episode 0 comments (Instagram and YouTube): brands, the 🏠 comments, the "citizen" comments, and the likes on each.
- Your new voice-over, recorded with about half a second of silence before the first word. The first word of Episode 0's recording was clipped at the start.

## Already set up

- The look: the realistic city (`src/city/CityReal.tsx`) and the Episode 0 code (`src/city/BrandCityEp0.tsx`), which has the camera rig, captions, counters and preview objects.
- The Episode 0 script and its scores: `vo/brandcity-ep0.md`.
- Thumbnails: `src/city/Ep0Thumb.tsx` (vertical and 16:9).
- Brand DM (`/ig-human` 92/100 PASS):

  > hey! random question lol
  >
  > i just started a series called Brand City. it's a city with 192 empty lots, and every brand that comments on the
  > video gets its own building with their logo on it. more likes on your comment means a taller building
  >
  > Day 0 just dropped. 0 brands so far. i'd honestly love [brand] to be one of the first ones in, all you'd have to
  > do is leave a comment before Day 1 tomorrow
  >
  > https://www.instagram.com/reel/Df520R_tkao/
- Pinned YouTube comment (85/100): "You get 1 vote before Day 1. Which brand should own lot #1, and which should never
  get in?"
- Brand search: you need small brands (under about 5,000 followers). Finding them needs Claude in Chrome, vidIQ credits, or
  your screenshots.
