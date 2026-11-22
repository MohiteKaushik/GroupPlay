# Play Store listing: copy and paste

Everything here goes into **Play Console → Grow users → Store presence → Main store listing**, unless a line says otherwise. Images are in this folder.

## App name (max 30 characters)

```
PlayAnywhere: Party Games
```

## Short description (max 80 characters)

```
Group games for any gathering. One phone hosts, everyone plays. Works offline.
```

## Full description (max 4000 characters)

```
Everyone is together, everyone is bored, and nobody can remember a single game. PlayAnywhere fixes that in under a minute.

Tell it how many people there are, who is playing, and what you have within reach. It picks games your group can play right now, with rules short enough to read aloud and a small animation that shows how each game works.

ONE PHONE IS ENOUGH
Most of the 60+ games need no phone at all once the host has read the rules: circle games, word games, races, music games, guessing games and quiet games for elders. The phone is the rulebook, the timer and the referee, not the game.

WORKS WITH NO INTERNET
Everything is inside the app. On a trip, in a village, on a train or during a power cut, it opens instantly and works the same.

MADE FOR MIXED GROUPS
Kids, teenagers, adults and grandparents in one room? Choose who is present and how energetic the group feels, and games that would leave someone out are filtered away. Classic Indian favourites are included alongside games from everywhere else.

WATCH, DON'T READ
Short animated explainers show the one thing people usually get wrong about each game, with optional voice narration.

HOST TOOLS
- Big loud timer
- Random-stop music referee for chair and statue games (no speaker needed)
- Scoreboard and fair team divider
- Buzzer and sound board
- Random picker: who goes first, who is "it"
- Prompt decks: acting words, movie titles, drawing prompts, questions and dares

PLAY TOGETHER ON EVERYONE'S PHONE
When people do have phones, host a room and share the code or QR. Friends join from the app or straight from the website with nothing to install.
- Imposter: everyone gets the secret word except one person
- Mafia: secret roles on each phone and a silent night, no narrator needed
- Quick Vote: questions the whole room answers at once
- Buzzer: fastest finger first, fairly timed
Online rooms use only a few kilobytes, so they work on a weak signal.

PRIVATE BY DESIGN
No account. No ads. No tracking. Bookmarks and scores stay on your phone. Online rooms use only the nickname you type.

Save the games you like, mark what you have played tonight so suggestions stay fresh, and tap Surprise Me when the group cannot decide.
```

## Release notes for the first release (max 500 characters)

```
First release. 60+ group games with animated how-to-play, host tools (timer, scores, teams, buzzer), and Play Together rooms that friends can join from the app or the website.
```

## Graphics

| Play Console field | File |
|---|---|
| App icon (512 × 512) | `icon-512.png` |
| Feature graphic (1024 × 500) | `feature-graphic-1024x500.png` |
| Phone screenshots (2–8) | everything in `screenshots/`, in number order |

Tablet screenshots are optional; skip them.

## Categorisation and contact

| Field | Value |
|---|---|
| App or game | Game |
| Category | Casual |
| Tags | Party, Board, Trivia (pick what the list offers that is closest) |
| Email | os.pjnprojects@gmail.com |
| Website | https://whatweplay.netlify.app |
| Privacy policy | https://whatweplay.netlify.app/privacy.html |

(If you rename the Netlify site, use the new address in all three places.)

## App content declarations (Play Console → Policy and programs → App content)

**Privacy policy:** the URL above.

**App access:** "All functionality is available without special access." There is no login.

**Ads:** "No, my app does not contain ads."

**Target audience and content:** select **13–15, 16–17 and 18 and over**. Do not select any group under 13: that would put the app under the Families policy, which it is not built for. If asked whether the listing could appeal to children, answer honestly that it has cartoon-style illustrations but is designed for teenagers and adults organising group games.

**Content rating questionnaire** (category: Game). Answer every question as it is asked on the day; these are the facts to answer from:

- No violence is shown. One game (Mafia) has text such as "was killed in the night" as part of a party game. If there is a question about mild or fantasy violence references in text, answer yes to that and no to anything about depictions, blood or realism.
- No sexual content, nudity, profanity, drugs, alcohol, tobacco, gambling or horror.
- Users can interact: players in the same online room see each other's nicknames and votes. There is no free-text chat, no images, no voice. Answer yes to "users can interact or exchange information" and no to chat, user-generated media and location sharing.
- No purchases, no real-money features, no unrestricted web access.

**Data safety.** Answer:

- Does your app collect or share any of the required user data types? **Yes**
- Is all of the user data collected by your app encrypted in transit? **Yes**
- Do you provide a way for users to request that their data is deleted? **Yes** (the privacy policy explains how; data deletion URL: the privacy policy URL)
- Does the app allow account creation? **No**

Data types to declare, each as **Collected: yes, Shared: no, Processed ephemerally: no, Optional (the user can choose), Purpose: App functionality**:

| Category | Type | What it actually is |
|---|---|---|
| Personal info | Name | The nickname typed when hosting or joining an online room |
| Device or other IDs | Device or other IDs | A random player ID created by the app so a dropped player returns to the same seat |
| App activity | App interactions | Votes, picks and buzzes inside an online room |

Nothing is "shared" in Play's sense: the database provider (Google Firebase) processes the data on your behalf, which Play does not count as sharing. Everything else in the form is **not collected**: no location, contacts, photos, files, messages, audio, health, financial data, browsing history or advertising ID.

**Advertising ID:** "No, my app does not use an advertising ID."

**Government apps, financial features, health apps, news apps:** No to all.

## Message to send your testers

```
Hi! I'm launching an Android app called PlayAnywhere (group party games) and Google needs 12 people to keep it installed for 14 days before it can go public. It takes two minutes:

1. Send me the Gmail address you use on your Android phone's Play Store.
2. When I reply, open the link I send ON YOUR PHONE and tap "Become a tester".
3. Install the app from the Play Store link on that page.
4. Keep it installed for 14 days and open it a few times. Please don't leave the test or uninstall; that resets your days.

Try a few games and tell me anything that looks broken or confusing. Thank you!
```
