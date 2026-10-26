# Game database schema (`js/games.js`)

`js/games.js` assigns a plain array to `window.GP_GAMES`. It is a normal JavaScript
file (not JSON) so the site also works when opened directly from disk (`file://`),
and so you can add comments. No build step — edit, save, refresh.

Every value below that is marked **(vocab)** must come from the fixed list in the
"Vocabularies" section. `tools/validate-games.js` (run with `node`) checks this.

## One game

```js
{
  id: 'pass-the-parcel',          // unique, lowercase, kebab-case, never change once published (bookmarks key on it)
  name: 'Pass the Parcel',
  tagline: 'Music stops, you are stuck with the parcel.',   // one sentence, max ~70 chars
  category: 'physical',           // (vocab) category
  players: { min: 5, max: 30 },   // inclusive. Use max: 99 for "no real upper limit"
  ages: ['kids', 'teens', 'adults', 'elders'],  // (vocab) every band this game is GOOD for. Omit a band if the game would bore or exclude them.
  energy: 'medium',               // (vocab) chill | medium | high
  contact: 'none',                // (vocab) none | light | close   (physical contact between players)
  props: ['music', 'paper'],      // (vocab) things you MUST have. [] if truly nothing needed.
  phone: 'host',                  // (vocab) none | host | pass | all   (minimum phone requirement, see below)
  space: ['indoor', 'outdoor'],   // (vocab) where it can be played
  minutes: 15,                    // typical round/session length
  teams: false,                   // true if it is played in teams
  tool: 'random-stop',            // optional: id of an in-app tool that helps run it (see Tools)
  tags: ['indian', 'classic'],    // optional, free-form but keep to the list in Vocabularies
  setup: 'Wrap a small gift in 6–8 layers of newspaper. Everyone sits in a circle.',
  rules: [
    'Play music. Pass the parcel around the circle.',
    'When the music stops, whoever holds it removes ONE layer.',
    'Whoever removes the last layer keeps the gift.'
  ],
  variations: [
    'Write a dare on each layer; the person who unwraps it must do it before play continues.'
  ],
  tips: 'Keep stops short and unpredictable, or the group gets bored by round three.'
}
```

### Field rules

* `players.min` is the honest minimum for the game to be fun, not the theoretical minimum.
* `ages`: `kids` = under 10, `teens` = 10–17, `adults` = 18–59, `elders` = 60+.
  A game is listed for a band only if that band can actually take part and enjoy it.
  (Elders can play Antakshari; they will not enjoy Human Knot.)
* `contact`: `none` = nobody touches anybody; `light` = hand-holding, tapping, passing
  objects hand-to-hand; `close` = hugging, piggyback, tangled limbs, lap-sitting.
* `props`: list only hard requirements. If the game can be played with OR without
  something, leave it out and mention it in `variations`.
* `phone`:
  * `none` – no phone involved at all.
  * `host` – one phone makes it better (timer, referee beep, narrator script, prompts). Still playable without.
  * `pass` – one phone is REQUIRED and is passed around (role reveals, Heads-Up style).
  * `all` – everyone needs their own phone (seeded role games).
* `minutes`: integer, how long one session typically lasts. Used for the "quick game" sort.
* `setup`: 1–3 sentences. `rules`: 3–8 short imperative steps, each one sentence, no numbering.
  `variations`: 0–4. `tips`: optional, one sentence of real host advice (not filler).
* Write for someone reading aloud from a phone to a group: short, concrete, no jargon.

## Vocabularies

```
category : physical | word | social | music | drawing | trivia | relay | icebreaker | kids | brain
energy   : chill | medium | high
contact  : none | light | close
phone    : none | host | pass | all
space    : indoor | outdoor
ages     : kids | teens | adults | elders
props    : paper | balloons | ball | cups | chairs | music | blindfold | spoons | rope | coins | cards | bottle | bucket | bowl | cloth | torch
tags     : indian | classic | bollywood | festival | icebreaker | quiet | loud | no-prep | long | quick | competitive | cooperative
tool     : timer | scoreboard | teams | buzzer | picker | random-stop | mafia | imposter | headsup | prompts:<deckId>
```

`prompts:<deckId>` decks live in `js/decks.js`: `charades`, `bollywood`, `pictionary`,
`taboo`, `truth`, `dare`, `wouldyourather`, `neverhave`, `twenty`, `antakshari-letters`,
`story-starters`, `debate`.

## How recommendation works (`js/engine.js`)

**Hard filters** (game is removed):

1. `people` not within `players.min..max`.
2. Every selected age band must be in `game.ages`.
3. `game.phone` rank > available phone rank (`none < host < pass < all`).
4. `game.contact` rank > allowed contact rank.
5. Any `game.props` entry not in the host's available props.
6. Selected space not in `game.space`.

**Soft score** (higher first; ties broken by a seeded shuffle so "Surprise me" varies):

* energy: exact match +3, adjacent +1, opposite −2 (skipped if "any").
* played tonight: −6 (so it sinks but can still be found).
* bookmarked: +1.
* `phone` exactly equal to what is available: +1 (uses what the group actually has).
* group size in the middle 60% of the game's range: +1 (games are best away from their limits).
