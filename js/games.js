/* GroupPlay game database.
 * See SCHEMA.md for every field and the allowed values.
 * Plain JS on purpose: works from file://, no build, comments allowed.
 * Run `node tools/validate-games.js` after editing.
 */
window.GP_GAMES = [
  {
    id: 'pass-the-parcel',
    name: 'Pass the Parcel',
    tagline: 'Music stops, you are stuck with the parcel.',
    category: 'physical',
    players: { min: 5, max: 30 },
    ages: ['kids', 'teens', 'adults', 'elders'],
    energy: 'medium',
    contact: 'light',
    props: ['music', 'paper'],
    phone: 'host',
    space: ['indoor', 'outdoor'],
    minutes: 15,
    teams: false,
    tool: 'random-stop',
    tags: ['classic', 'indian'],
    setup: 'Wrap a small gift (a chocolate works) in 6–8 layers of newspaper. Everyone sits in a circle. One person controls the music and faces away.',
    rules: [
      'Start the music and pass the parcel around the circle, hand to hand.',
      'When the music stops, whoever is holding it removes ONE layer only.',
      'Start the music again immediately and keep passing.',
      'Whoever removes the last layer keeps the gift.'
    ],
    variations: [
      'Write a dare on each layer; the person who unwraps it must do the dare before play continues.',
      'No speaker? Use the Random Stop tool: it beeps at random moments and that is the "music stopping".'
    ],
    tips: 'Keep the gaps between stops short and unpredictable or the group loses interest by round three.'
  },
  {
    id: 'musical-chairs',
    name: 'Musical Chairs',
    tagline: 'One chair fewer than people. Music stops, sit or you are out.',
    category: 'physical',
    players: { min: 5, max: 20 },
    ages: ['kids', 'teens', 'adults'],
    energy: 'high',
    contact: 'light',
    props: ['chairs', 'music'],
    phone: 'host',
    space: ['indoor', 'outdoor'],
    minutes: 15,
    teams: false,
    tool: 'random-stop',
    tags: ['classic', 'loud', 'competitive'],
    setup: 'Put chairs in a line back-to-back, one fewer than the number of players. One person runs the music and does not play.',
    rules: [
      'Everyone walks around the chairs while the music plays. No touching the chairs while walking.',
      'When the music stops, everyone sits. The person left standing is out.',
      'Remove one chair and play again.',
      'Last person sitting wins.'
    ],
    variations: [
      'Cushions or newspaper sheets on the floor instead of chairs; stand on one to be safe.',
      'Cooperative version: remove chairs but nobody is out; everyone must fit on the remaining chairs somehow.'
    ],
    tips: 'The music controller should face away from the chairs so stops are honest.'
  },
  {
    id: 'dumb-charades',
    name: 'Dumb Charades',
    tagline: 'Act out a movie name without a sound. Team guesses.',
    category: 'word',
    players: { min: 4, max: 20 },
    ages: ['teens', 'adults', 'elders'],
    energy: 'medium',
    contact: 'none',
    props: [],
    phone: 'host',
    space: ['indoor', 'outdoor'],
    minutes: 30,
    teams: true,
    tool: 'prompts:bollywood',
    tags: ['indian', 'bollywood', 'classic', 'no-prep'],
    setup: 'Split into two teams. Decide a time limit per turn (2 minutes is standard).',
    rules: [
      'Team A secretly gives a movie name to one player from Team B.',
      'That player acts it out for their own team with no words, no lip movement, no pointing at objects.',
      'Standard signs: hold up fingers for number of words, tap your forearm for syllables, pull your ear for "sounds like".',
      'If Team B guesses within the time, they score a point. Switch sides.',
      'First team to 10 points wins.'
    ],
    variations: [
      'Songs instead of movies: act out the song title.',
      'Mixed deck: let the phone pick the title so nobody argues it was too hard.'
    ],
    tips: 'Pick movies everyone has at least heard of. Obscure titles kill the energy.'
  },
  {
    id: 'antakshari',
    name: 'Antakshari',
    tagline: 'Sing a song starting with the last letter of the previous song.',
    category: 'music',
    players: { min: 4, max: 40 },
    ages: ['kids', 'teens', 'adults', 'elders'],
    energy: 'chill',
    contact: 'none',
    props: [],
    phone: 'none',
    space: ['indoor', 'outdoor'],
    minutes: 45,
    teams: true,
    tool: 'prompts:antakshari-letters',
    tags: ['indian', 'classic', 'no-prep', 'long'],
    setup: 'Split into two or more teams. Sit so each team can confer. No instruments needed.',
    rules: [
      'Team A sings at least two lines of any song.',
      'Team B must start a song with the letter the previous song ended on, within 30 seconds.',
      'A song cannot be repeated for the whole game.',
      'A team that cannot answer in time loses a point; the other team starts the next round with any letter.'
    ],
    variations: [
      'Theme rounds: only songs from one actor, one decade, or one language.',
      'Let the phone draw a random starting letter when a chain breaks.'
    ],
    tips: 'Put the most reluctant singer in the middle of a strong team; nobody has to sing alone.'
  },
  {
    id: 'mafia',
    name: 'Mafia',
    tagline: 'Villagers hunt the secret killers. Lie well.',
    category: 'social',
    players: { min: 6, max: 20 },
    ages: ['teens', 'adults'],
    energy: 'chill',
    contact: 'none',
    props: [],
    phone: 'pass',
    space: ['indoor', 'outdoor'],
    minutes: 30,
    teams: false,
    tool: 'mafia',
    tags: ['classic', 'quiet', 'long'],
    setup: 'One person is the Narrator and does not play. Open the Mafia tool: it assigns roles secretly by passing the phone around, then gives the narrator a script.',
    rules: [
      'Night: everyone closes their eyes. The narrator wakes the Mafia, who silently pick a victim. Then the Doctor picks someone to save, then the Detective points at one person to learn if they are Mafia.',
      'Day: the narrator announces who died. Everyone discusses and accuses.',
      'Vote: the person with the most votes is eliminated and reveals their role.',
      'Repeat night and day until all Mafia are out (village wins) or Mafia equal the villagers (Mafia wins).'
    ],
    variations: [
      'Add a Jester who wins if the village votes them out.',
      'Silent day: accusations by pointing only. Chaotic and fun with a loud group.'
    ],
    tips: 'A confident narrator with a steady voice is the whole game. The tool tells you exactly what to say.'
  },
  {
    id: 'imposter',
    name: 'Imposter',
    tagline: 'Everyone knows the secret word except one person. Find them.',
    category: 'social',
    players: { min: 4, max: 12 },
    ages: ['teens', 'adults', 'elders'],
    energy: 'chill',
    contact: 'none',
    props: [],
    phone: 'pass',
    space: ['indoor', 'outdoor'],
    minutes: 15,
    teams: false,
    tool: 'imposter',
    tags: ['quiet', 'no-prep', 'quick'],
    setup: 'Open the Imposter tool. Either pass one phone around for everyone to see their word, or everyone types the same room code on their own phone (no internet needed).',
    rules: [
      'Everyone except the Imposter sees the same secret word. The Imposter sees only the category.',
      'Go around the circle: each person says ONE word related to the secret word. Too obvious and the Imposter learns it; too vague and you look suspicious.',
      'After two rounds, everyone points at who they think the Imposter is.',
      'If the Imposter is caught, they get one guess at the word. Correct guess and they still win.'
    ],
    variations: [
      'Two imposters for groups of 9 or more.',
      'Describe with a gesture instead of a word.'
    ],
    tips: 'Ban repeating a word someone already said; it forces real clues.'
  },
  {
    id: 'balloon-keep-up',
    name: 'Balloon Keep-Up',
    tagline: 'Keep the balloon off the floor. Burst it and you are out.',
    category: 'physical',
    players: { min: 3, max: 15 },
    ages: ['kids', 'teens', 'adults'],
    energy: 'high',
    contact: 'light',
    props: ['balloons'],
    phone: 'host',
    space: ['indoor', 'outdoor'],
    minutes: 10,
    teams: false,
    tool: 'timer',
    tags: ['loud', 'quick'],
    setup: 'Blow up one balloon per group of 3–5 people. Clear the area of anything sharp.',
    rules: [
      'Tap the balloon into the air; it must never touch the floor.',
      'You cannot hit it twice in a row; it must go to someone else.',
      'If it touches the floor, the last person who touched it is out.',
      'Keep going until one person remains, or run a 2-minute timer and count total hits.'
    ],
    variations: [
      'Head only, or elbows only.',
      'Two balloons at once for groups over 8.'
    ],
    tips: 'Indoors, a ceiling fan is your enemy. Switch it off.'
  },
  {
    id: 'two-truths-one-lie',
    name: 'Two Truths and a Lie',
    tagline: 'Three statements about yourself. One is false. They guess which.',
    category: 'icebreaker',
    players: { min: 3, max: 15 },
    ages: ['teens', 'adults', 'elders'],
    energy: 'chill',
    contact: 'none',
    props: [],
    phone: 'none',
    space: ['indoor', 'outdoor'],
    minutes: 15,
    teams: false,
    tags: ['icebreaker', 'quiet', 'no-prep'],
    setup: 'Sit in a circle. Give everyone a minute to think of three statements about themselves.',
    rules: [
      'One person says three statements: two true, one false, in any order.',
      'Everyone else votes on which one is the lie.',
      'Reveal the lie. Each correct guesser gets a point; the speaker gets a point for every person fooled.',
      'Go around until everyone has had a turn.'
    ],
    variations: [
      'Relatives edition: the statements must be about someone else in the room, who confirms or denies.'
    ],
    tips: 'The best lies are boring and specific. Tell the group that up front.'
  },

  /* ---------- Small groups (2–3 people and up) ---------- */
  {
    id: 'twenty-questions',
    name: '20 Questions',
    tagline: 'One person thinks of a thing. You get twenty yes-or-no questions.',
    category: 'brain',
    players: { min: 2, max: 10 },
    ages: ['kids', 'teens', 'adults', 'elders'],
    energy: 'chill',
    contact: 'none',
    props: [],
    phone: 'host',
    space: ['indoor', 'outdoor'],
    minutes: 10,
    teams: false,
    tool: 'prompts:twenty',
    tags: ['classic', 'quiet', 'no-prep', 'quick'],
    setup: 'One person is the Thinker. They pick a thing (or let the phone pick one so they cannot cheat).',
    rules: [
      'The Thinker says only whether it is an animal, a thing, a place, or a person.',
      'The others ask yes-or-no questions, taking turns. Count every question out loud.',
      'A guess counts as a question. A wrong guess is not a loss, just one fewer question.',
      'If nobody guesses within 20 questions, the Thinker wins and goes again.'
    ],
    variations: [
      'Reverse: the group picks the thing and one person asks all 20 questions alone.'
    ],
    tips: 'Teach the group to narrow categories first ("Is it alive?") before guessing wildly.'
  },
  {
    id: 'word-chain',
    name: 'Word Chain',
    tagline: 'Say a word starting with the last letter of the previous one. Fast.',
    category: 'word',
    players: { min: 2, max: 15 },
    ages: ['kids', 'teens', 'adults', 'elders'],
    energy: 'chill',
    contact: 'none',
    props: [],
    phone: 'none',
    space: ['indoor', 'outdoor'],
    minutes: 10,
    teams: false,
    tags: ['classic', 'quiet', 'no-prep', 'quick'],
    setup: 'Sit or stand in a circle. Agree on a category (anything, animals, food, cities) and a language.',
    rules: [
      'The first person says any word in the category.',
      'The next person must say a word starting with the last letter of that word.',
      'No repeats, and you have five seconds. Everyone counts down together.',
      'Fail and you are out. Last person standing wins.'
    ],
    variations: [
      'Cities only: this is the classic school-bus version.',
      'Two-letter chain: start with the last TWO letters. Brutal.'
    ]
  },
  {
    id: 'categories',
    name: 'Stop the Bus',
    tagline: 'Name five things in a category before the time runs out.',
    category: 'word',
    players: { min: 2, max: 12 },
    ages: ['teens', 'adults', 'elders'],
    energy: 'chill',
    contact: 'none',
    props: [],
    phone: 'host',
    space: ['indoor', 'outdoor'],
    minutes: 15,
    teams: false,
    tool: 'timer',
    tags: ['quiet', 'no-prep', 'quick'],
    setup: 'Sit in a circle. The host sets a 10-second timer and thinks of a category list: fruits, cricketers, car brands, things in a kitchen, and so on.',
    rules: [
      'The host names a category and points at someone.',
      'That person must say five different things in the category before the timer beeps.',
      'Everyone else judges; a wrong or repeated item means the turn fails.',
      'A failed turn costs a point; the host moves to the next person with a new category.'
    ],
    variations: [
      'Letter version: five things in the category that start with the letter the host calls.'
    ],
    tips: 'Give elders slower categories (vegetables, relatives\' names) and teens faster ones (apps, Instagram stars).'
  },
  {
    id: 'would-you-rather',
    name: 'Would You Rather',
    tagline: 'Two bad options. Everyone must pick one and defend it.',
    category: 'icebreaker',
    players: { min: 2, max: 15 },
    ages: ['kids', 'teens', 'adults', 'elders'],
    energy: 'chill',
    contact: 'none',
    props: [],
    phone: 'host',
    space: ['indoor', 'outdoor'],
    minutes: 15,
    teams: false,
    tool: 'prompts:wouldyourather',
    tags: ['icebreaker', 'quiet', 'no-prep'],
    setup: 'Sit anywhere. The host reads the questions from the phone, or people make up their own.',
    rules: [
      'The host reads a "Would you rather A or B?" question.',
      'On the count of three, everyone points left for A or right for B. No abstaining.',
      'The minority side must each explain their choice in one sentence.',
      'Next question. Rotate who reads.'
    ],
    variations: [
      'Guess mode: before revealing, predict which option one specific person will choose.'
    ]
  },
  {
    id: 'one-word-story',
    name: 'One-Word Story',
    tagline: 'Build a story together, one word per person.',
    category: 'word',
    players: { min: 3, max: 15 },
    ages: ['kids', 'teens', 'adults', 'elders'],
    energy: 'chill',
    contact: 'none',
    props: [],
    phone: 'host',
    space: ['indoor', 'outdoor'],
    minutes: 10,
    teams: false,
    tool: 'prompts:story-starters',
    tags: ['quiet', 'no-prep', 'cooperative', 'quick'],
    setup: 'Sit in a circle. The host reads an opening line from the phone or invents one.',
    rules: [
      'Going around the circle, each person adds exactly one word to the story.',
      'The word must make grammatical sense with what came before.',
      'Anyone may say "full stop" instead of a word to end a sentence.',
      'After three full stops, the person whose turn it is must summarise the whole story from memory.'
    ],
    variations: [
      'One sentence each instead of one word, for a calmer group.',
      'The story must include one object in the room, chosen at the start.'
    ],
    tips: 'Keep a fast rhythm; hesitation kills it. Three seconds, then skip the person.'
  },
  {
    id: 'thumb-war',
    name: 'Thumb War Tournament',
    tagline: 'One, two, three, four, I declare a thumb war.',
    category: 'physical',
    players: { min: 2, max: 16 },
    ages: ['kids', 'teens', 'adults'],
    energy: 'medium',
    contact: 'light',
    props: [],
    phone: 'none',
    space: ['indoor', 'outdoor'],
    minutes: 10,
    teams: false,
    tags: ['classic', 'no-prep', 'quick', 'competitive'],
    setup: 'Pair everyone up. If the number is odd, one person referees the first round.',
    rules: [
      'Partners lock the fingers of their right hands with thumbs up.',
      'Say the chant together; on "war", start.',
      'Pin the other thumb flat for a count of three to win.',
      'Winners play winners until one champion remains.'
    ],
    variations: [
      'Left hand only for the final.',
      'Blindfolded final: both players close their eyes.'
    ]
  },
  {
    id: 'dots-and-boxes',
    name: 'Dots and Boxes',
    tagline: 'Draw lines, close boxes, steal the whole grid.',
    category: 'brain',
    players: { min: 2, max: 4 },
    ages: ['kids', 'teens', 'adults', 'elders'],
    energy: 'chill',
    contact: 'none',
    props: ['paper'],
    phone: 'none',
    space: ['indoor', 'outdoor'],
    minutes: 15,
    teams: false,
    tags: ['classic', 'quiet'],
    setup: 'Draw a grid of dots on paper, 6 by 6 for a quick game, 10 by 10 for a long one.',
    rules: [
      'Players take turns drawing one straight line between two neighbouring dots.',
      'If your line completes a box, write your initial inside it and take another turn.',
      'Keep going until every line is drawn.',
      'Most boxes wins.'
    ],
    variations: [
      'Whoever completes a box must also say a word in an agreed category or lose the box.'
    ],
    tips: 'The whole game is about not giving away the third side of a box. Say that once and watch the kids get sneaky.'
  },
  {
    id: 'rhyme-time',
    name: 'Rhyme Time',
    tagline: 'Keep the rhyme going. Run dry and you are out.',
    category: 'word',
    players: { min: 2, max: 12 },
    ages: ['kids', 'teens', 'adults', 'elders'],
    energy: 'chill',
    contact: 'none',
    props: [],
    phone: 'none',
    space: ['indoor', 'outdoor'],
    minutes: 10,
    teams: false,
    tags: ['quiet', 'no-prep', 'quick'],
    setup: 'Sit in a circle. Choose a language, or allow any language for a bigger pool of words.',
    rules: [
      'The first person says a short word, like "cat".',
      'Each next person must say a new word that rhymes with it within five seconds.',
      'No made-up words and no repeats; the group decides disputes by majority.',
      'The person who fails is out and starts the next word.'
    ],
    variations: [
      'Hindi-only round, then English-only round, then any language.'
    ]
  },
  {
    id: 'guess-how-many',
    name: 'Guess How Many',
    tagline: 'Estimate the uncountable. Closest guess wins.',
    category: 'brain',
    players: { min: 2, max: 20 },
    ages: ['kids', 'teens', 'adults', 'elders'],
    energy: 'chill',
    contact: 'none',
    props: [],
    phone: 'none',
    space: ['indoor', 'outdoor'],
    minutes: 10,
    teams: false,
    tags: ['quiet', 'no-prep', 'quick'],
    setup: 'The host grabs something countable from the house: a handful of rice, a bunch of keys, a packet of biscuits, the steps to the gate.',
    rules: [
      'The host shows the thing for ten seconds, then hides it.',
      'Everyone says their guess out loud, one at a time, no changing.',
      'Count it together.',
      'Closest guess wins the round and picks the next thing.'
    ],
    variations: [
      'Time version: guess how many seconds it takes someone to run to the gate and back.',
      'Weight version if there is a kitchen scale nearby.'
    ],
    tips: 'Counting rice grains together is weirdly bonding. Do it at least once.'
  },
  {
    id: 'hangman-twist',
    name: 'Hangman, Team Edition',
    tagline: 'Guess the phrase letter by letter before the drawing is complete.',
    category: 'word',
    players: { min: 2, max: 8 },
    ages: ['kids', 'teens', 'adults'],
    energy: 'chill',
    contact: 'none',
    props: ['paper'],
    phone: 'none',
    space: ['indoor', 'outdoor'],
    minutes: 10,
    teams: false,
    tags: ['classic', 'quiet', 'quick'],
    setup: 'One person thinks of a phrase (movie, place, dish) and draws one dash per letter on paper.',
    rules: [
      'The others guess one letter at a time, taking turns.',
      'A correct letter is written in every place it appears.',
      'A wrong letter adds one body part to the drawing; eight wrong guesses and the setter wins.',
      'Guessing the whole phrase early is allowed, but a wrong phrase costs two body parts.'
    ],
    variations: [
      'Twist: the setter must choose a phrase the group has talked about today.'
    ]
  },
  {
    id: 'rapid-fire',
    name: 'Rapid Fire',
    tagline: 'Thirty seconds, no thinking, answer everything.',
    category: 'icebreaker',
    players: { min: 3, max: 15 },
    ages: ['teens', 'adults', 'elders'],
    energy: 'chill',
    contact: 'none',
    props: [],
    phone: 'host',
    space: ['indoor', 'outdoor'],
    minutes: 15,
    teams: false,
    tool: 'picker',
    tags: ['icebreaker', 'no-prep', 'quick'],
    setup: 'Sit in a circle. The phone picks who sits in the hot seat; everyone else prepares one quick question each (favourite dish, biggest fear, chai or coffee).',
    rules: [
      'The person in the hot seat has 30 seconds to answer as many questions as possible.',
      'Questions come from anyone, one after another, no pauses.',
      'Answers must be instant; a pause of more than two seconds is a skip.',
      'Count the answers; the highest score at the end wins.'
    ],
    variations: [
      'Lie round: the hot seat must answer everything with a lie and the group catches any truth.'
    ],
    tips: 'Ban questions that need a story. One-word answers only, or it stalls.'
  },

  /* ---------- Big-group physical and relay games ---------- */
  {
    id: 'chair-race',
    name: 'Chair Race',
    tagline: 'Move across the yard using only two chairs. Never touch the ground.',
    category: 'relay',
    players: { min: 6, max: 30 },
    ages: ['teens', 'adults'],
    energy: 'high',
    contact: 'light',
    props: ['chairs'],
    phone: 'host',
    space: ['indoor', 'outdoor'],
    minutes: 20,
    teams: true,
    tool: 'buzzer',
    tags: ['indian', 'loud', 'competitive'],
    setup: 'Mark a start and finish line about 10 metres apart. Each team gets two sturdy plastic chairs.',
    rules: [
      'Each racer stands on one chair and places the second chair ahead.',
      'Step onto the second chair, then reach back and move the first chair forward.',
      'Touch the ground and you go back to the start.',
      'First team to get everyone across wins.'
    ],
    variations: [
      'Pairs version: two people share two chairs and must move together.'
    ],
    tips: 'Use plastic chairs on flat ground only. Wobbly wooden chairs on mud end in injuries.'
  },
  {
    id: 'lemon-and-spoon',
    name: 'Lemon and Spoon Race',
    tagline: 'Spoon in your mouth, lemon on the spoon, walk fast without dropping it.',
    category: 'relay',
    players: { min: 4, max: 30 },
    ages: ['kids', 'teens', 'adults'],
    energy: 'medium',
    contact: 'none',
    props: ['spoons'],
    phone: 'host',
    space: ['indoor', 'outdoor'],
    minutes: 15,
    teams: false,
    tool: 'buzzer',
    tags: ['indian', 'classic', 'competitive'],
    setup: 'One spoon per racer and a lemon (or potato, or small onion) for each. Mark a start and finish line.',
    rules: [
      'Hold the spoon handle in your mouth with the lemon balanced on it. No hands.',
      'On the buzzer, walk to the finish line.',
      'If the lemon drops, stop, pick it up, and restart from where it fell.',
      'First across with the lemon still on the spoon wins.'
    ],
    variations: [
      'Relay: hand the spoon to a teammate at the far end without using hands.',
      'Obstacle course: add a chair to walk around and a line to step over.'
    ],
    tips: 'Wash the spoons between heats or nobody will want the second round.'
  },
  {
    id: 'kabaddi-lite',
    name: 'Kabaddi Lite',
    tagline: 'Raid the other side on one breath, tag someone, get back alive.',
    category: 'physical',
    players: { min: 8, max: 20 },
    ages: ['teens', 'adults'],
    energy: 'high',
    contact: 'close',
    props: [],
    phone: 'none',
    space: ['outdoor'],
    minutes: 30,
    teams: true,
    tags: ['indian', 'classic', 'loud', 'competitive'],
    setup: 'Draw a centre line in the dirt and two back lines. Two equal teams stand on their own side.',
    rules: [
      'A raider crosses the line chanting "kabaddi" continuously without taking a breath.',
      'The raider tries to touch any defender and return to their side before the chant stops.',
      'Every defender touched is out; if defenders hold the raider until the chant stops, the raider is out.',
      'Teams alternate raids; the team with players left at the end wins.'
    ],
    variations: [
      'No-tackle rule for mixed groups: defenders may only dodge, never hold.'
    ],
    tips: 'Agree on the no-tackle rule before you start if anyone is unsure; it keeps the game friendly.'
  },
  {
    id: 'dog-and-the-bone',
    name: 'Dog and the Bone',
    tagline: 'Two lines, one cloth in the middle. Grab it and run home without being tagged.',
    category: 'physical',
    players: { min: 8, max: 30 },
    ages: ['kids', 'teens', 'adults'],
    energy: 'high',
    contact: 'light',
    props: ['cloth'],
    phone: 'host',
    space: ['indoor', 'outdoor'],
    minutes: 20,
    teams: true,
    tool: 'teams',
    tags: ['indian', 'classic', 'loud', 'competitive'],
    setup: 'Two teams stand in lines facing each other about 8 metres apart, a cloth (the "bone") on the ground halfway. Number the players in each team 1 to N.',
    rules: [
      'The host calls a number; that player from each team runs to the bone.',
      'Grab the bone and run back to your line to score a point.',
      'If the opponent tags you while you hold the bone, their team scores instead.',
      'Play to 10 points.'
    ],
    variations: [
      'Call two numbers at once for a chaotic round.'
    ],
    tips: 'Let the phone split the teams so the fast runners are not all on one side.'
  },
  {
    id: 'fire-in-the-mountain',
    name: 'Fire in the Mountain',
    tagline: 'Run, run, run until the number is called. Then group up fast.',
    category: 'physical',
    players: { min: 8, max: 40 },
    ages: ['kids', 'teens', 'adults'],
    energy: 'high',
    contact: 'light',
    props: [],
    phone: 'none',
    space: ['indoor', 'outdoor'],
    minutes: 15,
    teams: false,
    tags: ['indian', 'classic', 'loud', 'no-prep'],
    setup: 'One person is the caller and stands in the middle. Everyone else walks or jogs in a wide circle around them.',
    rules: [
      'The caller chants "Fire in the mountain, run, run, run" while everyone circles.',
      'The caller suddenly shouts a number, like "four".',
      'Everyone must grab others to form groups of exactly that number.',
      'Anyone left in a wrong-sized group is out. Play until two or three remain.'
    ],
    variations: [
      'Shout a body part with the number: "three, elbows" means groups of three touching elbows.'
    ]
  },
  {
    id: 'poison-ball',
    name: 'Poison Ball',
    tagline: 'Dodge the ball or you are out. Catch it and you are safe.',
    category: 'physical',
    players: { min: 8, max: 30 },
    ages: ['kids', 'teens', 'adults'],
    energy: 'high',
    contact: 'light',
    props: ['ball'],
    phone: 'none',
    space: ['outdoor'],
    minutes: 20,
    teams: true,
    tags: ['indian', 'classic', 'loud', 'competitive'],
    setup: 'Use a soft ball. Mark a rectangle; one team stands inside, the other team splits to stand on both outside ends.',
    rules: [
      'Outside players throw the ball at inside players below the waist.',
      'Hit by the ball and you are out; catch it cleanly and you stay.',
      'Inside players may only dodge; they cannot throw the ball back.',
      'When everyone inside is out, swap sides and time how long each team survives.'
    ],
    variations: [
      'Free-for-all: no teams, anyone can throw, last one in wins.'
    ],
    tips: 'A soft sponge or rubber ball only. A cricket ball turns this into a hospital visit.'
  },
  {
    id: 'kho-kho-lite',
    name: 'Kho-Kho Lite',
    tagline: 'Chase around the seated line, tag the runner, shout kho to swap.',
    category: 'physical',
    players: { min: 10, max: 24 },
    ages: ['teens', 'adults'],
    energy: 'high',
    contact: 'light',
    props: [],
    phone: 'none',
    space: ['outdoor'],
    minutes: 30,
    teams: true,
    tags: ['indian', 'classic', 'loud', 'competitive'],
    setup: 'Two teams. The chasing team sits in a line facing alternate directions; the other team sends three runners into the field.',
    rules: [
      'One chaser stands up and chases the runners around the line without crossing it.',
      'The chaser may tap a seated teammate and shout "kho"; that teammate becomes the chaser.',
      'A tagged runner is out; the next runner enters.',
      'Switch roles after all runners are out or five minutes pass, whichever is first.'
    ],
    variations: [
      'Smaller yard: only one runner at a time, three chasers.'
    ]
  },
  {
    id: 'tug-of-war',
    name: 'Tug of War',
    tagline: 'Pull the rope. Pull harder than them.',
    category: 'physical',
    players: { min: 6, max: 30 },
    ages: ['kids', 'teens', 'adults'],
    energy: 'high',
    contact: 'light',
    props: ['rope'],
    phone: 'host',
    space: ['outdoor'],
    minutes: 10,
    teams: true,
    tool: 'teams',
    tags: ['indian', 'classic', 'loud', 'competitive'],
    setup: 'Tie a cloth at the middle of a long rope and mark a centre line on the ground. Split into two equal teams.',
    rules: [
      'Teams hold the rope on their side of the centre line.',
      'On the signal, pull.',
      'The team that drags the cloth marker over the centre line to their side wins.',
      'Play best of three, switching ends between pulls.'
    ],
    variations: [
      'Kids against adults, with adults using one hand only.'
    ],
    tips: 'Never wrap the rope around a hand or wrist. Let the phone divide the teams so nobody argues about fairness.'
  },
  {
    id: 'chain-tag',
    name: 'Chain Tag',
    tagline: 'Every person tagged joins the chain. The chain hunts the rest.',
    category: 'physical',
    players: { min: 8, max: 30 },
    ages: ['kids', 'teens', 'adults'],
    energy: 'high',
    contact: 'light',
    props: [],
    phone: 'none',
    space: ['outdoor'],
    minutes: 15,
    teams: false,
    tags: ['classic', 'loud', 'no-prep'],
    setup: 'Mark the boundaries of the playing area. One person starts as the chaser.',
    rules: [
      'The chaser tags someone; they hold hands and become a chain of two.',
      'The chain tags more people, who join it at either end.',
      'Only the two people at the ends of the chain can tag.',
      'Last person free wins and starts the next game.'
    ],
    variations: [
      'When the chain reaches four, it splits into two chains of two.'
    ]
  },
  {
    id: 'simon-says',
    name: 'Simon Says',
    tagline: 'Do what Simon says. Do nothing when Simon does not say.',
    category: 'kids',
    players: { min: 4, max: 40 },
    ages: ['kids', 'teens', 'adults', 'elders'],
    energy: 'medium',
    contact: 'none',
    props: [],
    phone: 'none',
    space: ['indoor', 'outdoor'],
    minutes: 10,
    teams: false,
    tags: ['classic', 'no-prep', 'quick'],
    setup: 'One person is Simon and stands where everyone can see them. Everyone else spreads out.',
    rules: [
      'Simon gives commands like "Simon says touch your nose". Everyone obeys.',
      'If the command does not start with "Simon says", anyone who obeys is out.',
      'Simon speeds up and mixes in tricks.',
      'The last player in becomes the next Simon.'
    ],
    variations: [
      'Use a name from the family instead of Simon: "Dadi says".',
      'Seated version for elders: hand and face commands only.'
    ]
  },
  {
    id: 'musical-statues',
    name: 'Musical Statues',
    tagline: 'Dance when the music plays. Freeze when it stops. Wobble and you are out.',
    category: 'physical',
    players: { min: 5, max: 30 },
    ages: ['kids', 'teens', 'adults'],
    energy: 'medium',
    contact: 'none',
    props: ['music'],
    phone: 'host',
    space: ['indoor', 'outdoor'],
    minutes: 15,
    teams: false,
    tool: 'random-stop',
    tags: ['classic', 'loud'],
    setup: 'One person controls the music and judges. Everyone else spreads out with room to dance.',
    rules: [
      'Everyone dances while the music plays; standing still is not allowed.',
      'When the music stops, freeze instantly in whatever pose you are in.',
      'The judge walks around; anyone who moves, laughs, or falls is out.',
      'Last dancer standing wins.'
    ],
    variations: [
      'Call a pose at each stop: "freeze like a cricketer", "freeze like a cat".'
    ],
    tips: 'The judge should make faces at frozen players. That is where the laughs are.'
  },
  {
    id: 'treasure-hunt',
    name: 'Treasure Hunt',
    tagline: 'Follow the clues around the house. First team to the prize wins.',
    category: 'brain',
    players: { min: 4, max: 30 },
    ages: ['kids', 'teens', 'adults'],
    energy: 'medium',
    contact: 'none',
    props: ['paper'],
    phone: 'host',
    space: ['indoor', 'outdoor'],
    minutes: 30,
    teams: true,
    tool: 'timer',
    tags: ['classic', 'long', 'competitive'],
    setup: 'The host writes 6–8 clues on paper, each pointing to the hiding place of the next, and hides a prize at the end. This takes 10 minutes of prep.',
    rules: [
      'Split into teams of 3–4 and hand each team the first clue.',
      'Each clue leads to the next hiding spot; a found clue must be put back for the other teams.',
      'Teams must stay together; no splitting up.',
      'First team to reach the prize wins it.'
    ],
    variations: [
      'Photo hunt: instead of clues, give a list of things to photograph around the village in 20 minutes.'
    ],
    tips: 'Rhyming clues feel magical to kids and take two extra minutes to write.'
  },
  {
    id: 'blind-mans-buff',
    name: 'Blind Man\'s Buff',
    tagline: 'Blindfolded in the middle, catch someone and guess who it is.',
    category: 'physical',
    players: { min: 5, max: 20 },
    ages: ['kids', 'teens', 'adults'],
    energy: 'medium',
    contact: 'light',
    props: ['blindfold'],
    phone: 'none',
    space: ['indoor', 'outdoor'],
    minutes: 15,
    teams: false,
    tags: ['indian', 'classic'],
    setup: 'Clear the area of anything sharp or breakable. Blindfold one person and spin them around three times.',
    rules: [
      'Everyone else moves around quietly, staying inside the agreed area.',
      'The blindfolded player tries to catch someone.',
      'Once caught, the player must guess who it is by touching only their head and shoulders.',
      'A correct guess swaps the blindfold; a wrong guess and the hunt continues.'
    ],
    variations: [
      'Clap version: players must clap every ten seconds so the catcher has a sound to follow.'
    ],
    tips: 'Keep one sighted adult as the safety spotter, especially near steps or a well.'
  },
  {
    id: 'balloon-knees-relay',
    name: 'Balloon Knees Relay',
    tagline: 'Balloon between your knees. Waddle to the line and back.',
    category: 'relay',
    players: { min: 6, max: 30 },
    ages: ['kids', 'teens', 'adults'],
    energy: 'high',
    contact: 'none',
    props: ['balloons'],
    phone: 'host',
    space: ['indoor', 'outdoor'],
    minutes: 15,
    teams: true,
    tool: 'timer',
    tags: ['loud', 'competitive'],
    setup: 'Mark a start line and a turn line about 8 metres apart. One balloon per team, plus spares.',
    rules: [
      'The first racer holds a balloon between their knees and waddles to the turn line and back.',
      'Hand the balloon to the next teammate without using hands, knees to knees.',
      'If the balloon drops or bursts, go back to the start with a fresh one.',
      'First team to finish all racers wins.'
    ],
    variations: [
      'Between the elbows instead of the knees.'
    ]
  },
  {
    id: 'cup-stacking-relay',
    name: 'Cup Stack Relay',
    tagline: 'Build the pyramid, knock it down, run back, next!',
    category: 'relay',
    players: { min: 6, max: 30 },
    ages: ['kids', 'teens', 'adults'],
    energy: 'medium',
    contact: 'none',
    props: ['cups'],
    phone: 'host',
    space: ['indoor', 'outdoor'],
    minutes: 15,
    teams: true,
    tool: 'timer',
    tags: ['competitive', 'quick'],
    setup: 'Ten cups per team placed at the far end of the room, 6 metres from the start line.',
    rules: [
      'The first racer runs to the cups and stacks them into a pyramid of 4-3-2-1.',
      'Then they unstack them into a single column and run back to tag the next racer.',
      'A collapsed pyramid must be rebuilt before unstacking.',
      'First team to finish all racers wins.'
    ],
    variations: [
      'Solo time trial: each person races the clock alone, best time wins.'
    ]
  },
  {
    id: 'hopping-race',
    name: 'One-Leg Hopping Race',
    tagline: 'One leg only. Put the other down and you restart.',
    category: 'relay',
    players: { min: 4, max: 30 },
    ages: ['kids', 'teens', 'adults'],
    energy: 'high',
    contact: 'none',
    props: [],
    phone: 'host',
    space: ['outdoor'],
    minutes: 10,
    teams: false,
    tool: 'buzzer',
    tags: ['no-prep', 'quick', 'competitive'],
    setup: 'Mark a start and finish line on flat ground, about 15 metres apart.',
    rules: [
      'Everyone lines up on one leg behind the start line.',
      'On the buzzer, hop to the finish.',
      'If your other foot touches the ground, go back to the start.',
      'First to cross wins.'
    ],
    variations: [
      'Pairs: two people hop with their inside legs tied together with a dupatta.',
      'Backwards hopping for the final.'
    ]
  },
  {
    id: 'over-under-relay',
    name: 'Over and Under',
    tagline: 'Pass the ball over your head, then between your legs, down the line.',
    category: 'relay',
    players: { min: 8, max: 40 },
    ages: ['kids', 'teens', 'adults'],
    energy: 'medium',
    contact: 'light',
    props: ['ball'],
    phone: 'host',
    space: ['indoor', 'outdoor'],
    minutes: 10,
    teams: true,
    tool: 'teams',
    tags: ['classic', 'quick', 'competitive'],
    setup: 'Split into equal teams and stand in single-file lines. One ball per team at the front.',
    rules: [
      'The first player passes the ball over their head to the person behind.',
      'That person passes it between their legs to the next, and so on, alternating over and under.',
      'When the ball reaches the back, the last person runs to the front and starts again.',
      'The first team whose original front player is back at the front wins.'
    ],
    variations: [
      'Use a balloon or a water bottle instead of a ball.'
    ]
  },
  {
    id: 'seven-stones',
    name: 'Seven Stones (Pithu)',
    tagline: 'Knock the stack down, rebuild it before the ball gets you.',
    category: 'physical',
    players: { min: 6, max: 20 },
    ages: ['kids', 'teens', 'adults'],
    energy: 'high',
    contact: 'light',
    props: ['ball', 'cups'],
    phone: 'none',
    space: ['outdoor'],
    minutes: 20,
    teams: true,
    tags: ['indian', 'classic', 'loud', 'competitive'],
    setup: 'Stack seven flat stones (or seven cups) in the middle of the yard. Use a soft ball. Two teams: knockers and fielders.',
    rules: [
      'A knocker throws the ball from a line to knock the stack down; three tries per team.',
      'Once it falls, the knockers rush to rebuild the stack while the fielders grab the ball.',
      'Fielders throw the ball at knockers below the knee; a hit knocker is out.',
      'If the stack is rebuilt and the team shouts "Pithu", knockers win the round; otherwise fielders win. Swap.'
    ],
    variations: [
      'Fielders can only pass the ball by throwing, not running with it.'
    ]
  },

  /* ---------- Seated, chill, elder-friendly ---------- */
  {
    id: 'memory-chain',
    name: 'I Went to the Market',
    tagline: 'Repeat the whole shopping list, then add one more item.',
    category: 'word',
    players: { min: 4, max: 20 },
    ages: ['kids', 'teens', 'adults', 'elders'],
    energy: 'chill',
    contact: 'none',
    props: [],
    phone: 'none',
    space: ['indoor', 'outdoor'],
    minutes: 15,
    teams: false,
    tags: ['classic', 'quiet', 'no-prep'],
    setup: 'Sit in a circle. No writing allowed.',
    rules: [
      'The first person says "I went to the market and bought" and names one item.',
      'The next person repeats the whole list in order and adds one more item.',
      'Forget an item or change the order and you are out.',
      'Last person remembering wins.'
    ],
    variations: [
      'Each item must start with the next letter of the alphabet.',
      'Use actions instead of words: each person adds a gesture to the sequence.'
    ],
    tips: 'Let elders go early in the round; the list is short and they get the satisfaction of beating the teens later.'
  },
  {
    id: 'name-place-animal-thing',
    name: 'Name Place Animal Thing',
    tagline: 'One letter, four columns, write fast, shout stop.',
    category: 'word',
    players: { min: 2, max: 12 },
    ages: ['teens', 'adults', 'elders'],
    energy: 'chill',
    contact: 'none',
    props: ['paper'],
    phone: 'host',
    space: ['indoor', 'outdoor'],
    minutes: 20,
    teams: false,
    tool: 'prompts:antakshari-letters',
    tags: ['indian', 'classic', 'quiet'],
    setup: 'Everyone draws four columns on paper: Name, Place, Animal, Thing. One person draws a random letter from the phone or calls one.',
    rules: [
      'Everyone writes one word starting with that letter in each column.',
      'The first to finish shouts "stop" and everyone must put pens down.',
      'Read answers aloud: 10 points for a unique answer, 5 if someone else wrote the same, 0 for blank or wrong.',
      'Play ten letters; highest total wins.'
    ],
    variations: [
      'Add columns: Movie, Food, Cricketer.'
    ]
  },
  {
    id: 'who-am-i',
    name: 'Who Am I?',
    tagline: 'A name stuck on your forehead. Everyone knows it but you.',
    category: 'word',
    players: { min: 4, max: 15 },
    ages: ['teens', 'adults', 'elders'],
    energy: 'chill',
    contact: 'light',
    props: ['paper'],
    phone: 'none',
    space: ['indoor', 'outdoor'],
    minutes: 20,
    teams: false,
    tags: ['classic', 'quiet'],
    setup: 'Each person writes a famous name (actor, cricketer, cartoon, relative) on a slip and sticks it on the forehead of the person to their left with a bit of tape or by tucking it under a hairband.',
    rules: [
      'Take turns asking yes-or-no questions about your own name: "Am I alive?" "Am I in films?"',
      'A "yes" lets you ask again; a "no" passes the turn.',
      'Guess your name whenever you like; a wrong guess ends your turn.',
      'First to guess correctly wins; keep going until everyone has guessed.'
    ],
    variations: [
      'Family edition: only names of people in the room or relatives everyone knows.'
    ]
  },
  {
    id: 'hum-the-song',
    name: 'Hum the Song',
    tagline: 'No words allowed. Hum it until someone names it.',
    category: 'music',
    players: { min: 4, max: 30 },
    ages: ['kids', 'teens', 'adults', 'elders'],
    energy: 'chill',
    contact: 'none',
    props: [],
    phone: 'host',
    space: ['indoor', 'outdoor'],
    minutes: 20,
    teams: true,
    tool: 'scoreboard',
    tags: ['indian', 'quiet', 'no-prep'],
    setup: 'Split into two teams. Each team secretly picks songs for the other team\'s hummer.',
    rules: [
      'A hummer from Team A is given a song by Team B and hums only the tune, no words, no lip-syncing.',
      'Team A has 60 seconds to name the song.',
      'A correct answer scores a point for Team A; otherwise Team B gets the point.',
      'Alternate hummers; first team to 7 wins.'
    ],
    variations: [
      'Whistle instead of hum.',
      'Tap the rhythm on a table only, no tune. Much harder.'
    ]
  },
  {
    id: 'finish-the-proverb',
    name: 'Finish the Proverb',
    tagline: 'The host starts a saying. You finish it. Elders will dominate.',
    category: 'word',
    players: { min: 3, max: 20 },
    ages: ['teens', 'adults', 'elders'],
    energy: 'chill',
    contact: 'none',
    props: [],
    phone: 'none',
    space: ['indoor', 'outdoor'],
    minutes: 15,
    teams: true,
    tags: ['indian', 'quiet', 'no-prep'],
    setup: 'One person is the quizmaster. Everyone else forms two teams; put the elders on different teams.',
    rules: [
      'The quizmaster says the first half of a proverb or saying in any language the group knows.',
      'Teams take turns; the team up must finish it within ten seconds.',
      'A correct finish scores a point; a miss passes it to the other team for a bonus.',
      'First to 10 wins, then the losing team supplies the next quizmaster.'
    ],
    variations: [
      'Finish-the-dialogue: famous film lines instead of proverbs.',
      'Invent mode: give a made-up first half and vote for the funniest ending.'
    ],
    tips: 'This is the one game where grandparents beat everyone. Make sure they know that before you start.'
  },
  {
    id: 'bluff-cards',
    name: 'Bluff',
    tagline: 'Put cards face down and lie about them. Get caught and take the pile.',
    category: 'brain',
    players: { min: 3, max: 8 },
    ages: ['teens', 'adults', 'elders'],
    energy: 'chill',
    contact: 'none',
    props: ['cards'],
    phone: 'none',
    space: ['indoor', 'outdoor'],
    minutes: 20,
    teams: false,
    tags: ['classic', 'quiet'],
    setup: 'Deal the whole deck out as evenly as possible. Sit in a circle.',
    rules: [
      'The first player puts one or more cards face down and announces a rank: "two aces".',
      'The next player must play cards claiming the next rank up, and so on.',
      'Anyone can shout "bluff"; flip the cards to check.',
      'If it was a bluff, the liar takes the whole pile; if it was true, the challenger takes it. First to empty their hand wins.'
    ],
    variations: [
      'Any rank may be claimed, not just the next one up. Faster and wilder.'
    ]
  },
  {
    id: 'tambola',
    name: 'Tambola (Housie)',
    tagline: 'Numbers are called, you strike them off, shout when a line is done.',
    category: 'brain',
    players: { min: 5, max: 40 },
    ages: ['teens', 'adults', 'elders'],
    energy: 'chill',
    contact: 'none',
    props: ['paper'],
    phone: 'none',
    space: ['indoor', 'outdoor'],
    minutes: 30,
    teams: false,
    tags: ['indian', 'classic', 'quiet', 'long'],
    setup: 'Each player draws a 3-row, 9-column grid and writes 15 numbers between 1 and 90, five per row. The caller writes 1–90 on small chits, folds them into a bowl, and does not play.',
    rules: [
      'The caller picks a chit and announces the number; players strike it off if they have it.',
      'First to strike off any full row shouts "line" and wins that prize after the caller checks.',
      'Early Five: first to strike any five numbers.',
      'Full House: first to strike all fifteen numbers wins the big prize.'
    ],
    variations: [
      'Corner prize: the four corner numbers of your grid.',
      'Reverse house: the last person to strike any number loses.'
    ],
    tips: 'Verify every claim against the called numbers; one false "line" and the whole room stops trusting the game.'
  },
  {
    id: 'family-trivia',
    name: 'How Well Do You Know Them?',
    tagline: 'Questions about one person. Who in the room knows them best?',
    category: 'icebreaker',
    players: { min: 4, max: 15 },
    ages: ['teens', 'adults', 'elders'],
    energy: 'chill',
    contact: 'none',
    props: ['paper'],
    phone: 'host',
    space: ['indoor', 'outdoor'],
    minutes: 20,
    teams: false,
    tool: 'scoreboard',
    tags: ['icebreaker', 'quiet'],
    setup: 'Pick one person as the subject. Everyone else gets a slip of paper. The host prepares five questions about the subject: favourite dish, first school, biggest fear, dream place, childhood nickname.',
    rules: [
      'The host asks a question; everyone writes their guess and the subject writes the true answer.',
      'Reveal all answers; the subject confirms the truth.',
      'A correct guess scores one point on the scoreboard.',
      'After five questions, the top scorer becomes the next subject.'
    ],
    variations: [
      'Couples or siblings face off: each must answer for the other.'
    ],
    tips: 'Mix in one question only a childhood friend could answer; it brings out stories nobody has heard.'
  },
  {
    id: 'guess-the-spice',
    name: 'Guess the Spice',
    tagline: 'Blindfolded, one sniff, name it.',
    category: 'brain',
    players: { min: 4, max: 15 },
    ages: ['kids', 'teens', 'adults', 'elders'],
    energy: 'chill',
    contact: 'none',
    props: ['bowl', 'blindfold'],
    phone: 'none',
    space: ['indoor'],
    minutes: 15,
    teams: false,
    tags: ['indian', 'quiet'],
    setup: 'Raid the kitchen: 8–10 spices and ingredients in small bowls (cumin, cardamom, coffee, ginger, cloves, tamarind, hing, cinnamon, tea, ghee). Hide them from view.',
    rules: [
      'Blindfold one player and hold a bowl under their nose for five seconds.',
      'They get one guess; no touching or tasting.',
      'A correct guess scores a point; move to the next bowl.',
      'Everyone takes a turn with a different order of bowls; highest score wins.'
    ],
    variations: [
      'Taste version with safe things: sugar, salt, lemon, jaggery, pickle.',
      'Kids versus mothers: the mothers almost always win and the kids find that outrageous.'
    ]
  },
  {
    id: 'mystery-bag',
    name: 'Mystery Bag',
    tagline: 'Reach in, feel it, name it without looking.',
    category: 'brain',
    players: { min: 4, max: 15 },
    ages: ['kids', 'teens', 'adults', 'elders'],
    energy: 'chill',
    contact: 'none',
    props: ['cloth'],
    phone: 'none',
    space: ['indoor', 'outdoor'],
    minutes: 15,
    teams: false,
    tags: ['quiet', 'quick'],
    setup: 'The host puts 10 household objects into a cloth bag or under a towel: spoon, key, onion, comb, battery, coin, matchbox, safety pin, bangle, bottle cap.',
    rules: [
      'A player reaches in without looking and feels one object for ten seconds.',
      'They name it out loud, then pull it out to check.',
      'Correct: keep the object as a point. Wrong: back into the bag.',
      'Everyone takes turns until the bag is empty; most objects wins.'
    ],
    variations: [
      'Speed round: name as many objects as possible in 30 seconds.'
    ]
  },
  {
    id: 'wink-murder',
    name: 'Wink Murder',
    tagline: 'The murderer kills with a wink. Catch them before everyone dies.',
    category: 'social',
    players: { min: 6, max: 20 },
    ages: ['teens', 'adults', 'elders'],
    energy: 'chill',
    contact: 'none',
    props: [],
    phone: 'none',
    space: ['indoor', 'outdoor'],
    minutes: 15,
    teams: false,
    tags: ['classic', 'quiet', 'no-prep'],
    setup: 'Everyone sits in a circle. One person is the Detective and steps away. Everyone else closes their eyes; the host taps one person on the shoulder to be the Murderer.',
    rules: [
      'The Detective returns and stands in the middle. Everyone keeps chatting and looking around.',
      'The Murderer winks secretly at people. Anyone winked at waits a few seconds, then dramatically "dies".',
      'The Detective gets three accusations to catch the Murderer.',
      'If the Murderer kills everyone first, they win.'
    ],
    variations: [
      'Two murderers for groups over 12.',
      'Dramatic deaths are mandatory; the best death wins a bonus prize.'
    ]
  },
  {
    id: 'telephone-charades',
    name: 'Telephone Charades',
    tagline: 'Act it to one person, who acts it to the next. Watch it mutate.',
    category: 'relay',
    players: { min: 6, max: 16 },
    ages: ['teens', 'adults'],
    energy: 'medium',
    contact: 'none',
    props: [],
    phone: 'host',
    space: ['indoor', 'outdoor'],
    minutes: 20,
    teams: true,
    tool: 'prompts:charades',
    tags: ['loud', 'no-prep'],
    setup: 'Line up 5–6 players facing away from the host. The others watch. The phone gives the host a word or action.',
    rules: [
      'The host shows the word to the first player only.',
      'Player one taps player two, who turns around, and acts it out silently; nobody else may look.',
      'Player two then acts it to player three, and so on down the line.',
      'The last player says what they think it was; reveal the original and laugh.'
    ],
    variations: [
      'Team race: two lines go at once with the same word; faster correct answer wins.'
    ]
  },
  {
    id: 'charades',
    name: 'Charades',
    tagline: 'Act out the word. No talking. The clock is ticking.',
    category: 'word',
    players: { min: 4, max: 20 },
    ages: ['kids', 'teens', 'adults', 'elders'],
    energy: 'medium',
    contact: 'none',
    props: [],
    phone: 'host',
    space: ['indoor', 'outdoor'],
    minutes: 20,
    teams: true,
    tool: 'prompts:charades',
    tags: ['classic', 'no-prep'],
    setup: 'Split into two teams. The phone deals words so nobody has to invent them.',
    rules: [
      'One player reads a word from the phone and acts it out for their team.',
      'No speaking, no mouthing words, no pointing at real objects.',
      'The team has 60 seconds to guess; a correct guess scores a point.',
      'Alternate teams; first to 10 wins.'
    ],
    variations: [
      'All-play: both teams guess at once, first correct shout wins the point.',
      'Kids version: animals and actions only, no time limit.'
    ]
  },
  {
    id: 'pictionary',
    name: 'Pictionary',
    tagline: 'Draw it badly. Your team guesses anyway.',
    category: 'drawing',
    players: { min: 4, max: 16 },
    ages: ['kids', 'teens', 'adults', 'elders'],
    energy: 'chill',
    contact: 'none',
    props: ['paper'],
    phone: 'host',
    space: ['indoor', 'outdoor'],
    minutes: 25,
    teams: true,
    tool: 'prompts:pictionary',
    tags: ['classic', 'quiet'],
    setup: 'Two teams, one sheet of paper and a pen each. The phone deals the words.',
    rules: [
      'A drawer sees a word on the phone and has 60 seconds to draw it.',
      'No letters, numbers, or talking; gestures are not allowed either.',
      'If their team guesses in time, they score a point.',
      'Rotate drawers; first team to 8 points wins.'
    ],
    variations: [
      'Draw on someone\'s back with a finger and they guess by feel.',
      'Eyes-closed drawing for the final round.'
    ]
  },
  {
    id: 'taboo',
    name: 'Taboo',
    tagline: 'Describe the word without saying the five forbidden words.',
    category: 'word',
    players: { min: 4, max: 16 },
    ages: ['teens', 'adults', 'elders'],
    energy: 'medium',
    contact: 'none',
    props: [],
    phone: 'host',
    space: ['indoor', 'outdoor'],
    minutes: 20,
    teams: true,
    tool: 'prompts:taboo',
    tags: ['classic', 'no-prep', 'competitive'],
    setup: 'Two teams. The describer holds the phone; one person from the OTHER team sits beside them to watch the forbidden words and buzz.',
    rules: [
      'The describer explains the word to their team without saying it or any of the five forbidden words.',
      'No gestures, no "sounds like", no spelling.',
      'The watcher buzzes if a forbidden word slips out; that card is lost and the next one appears.',
      'Count correct cards in 60 seconds; alternate teams, highest total after three rounds wins.'
    ],
    variations: [
      'Hindi-only descriptions for an extra challenge.'
    ]
  },
  {
    id: 'truth-or-dare',
    name: 'Truth or Dare',
    tagline: 'Spin, point, choose. Answer honestly or do the deed.',
    category: 'icebreaker',
    players: { min: 3, max: 15 },
    ages: ['teens', 'adults'],
    energy: 'medium',
    contact: 'none',
    props: [],
    phone: 'host',
    space: ['indoor', 'outdoor'],
    minutes: 20,
    teams: false,
    tool: 'prompts:truth',
    tags: ['classic', 'icebreaker', 'no-prep'],
    setup: 'Sit in a circle. The phone picks who is up (or spin a bottle if you have one). The Truth deck and the Dare deck are both in the tool.',
    rules: [
      'The chosen player says "truth" or "dare".',
      'Truth: the host reads a question from the deck and they must answer honestly.',
      'Dare: the host reads a dare from the deck and they must do it within one minute.',
      'Refuse, and you do two dares. Then the chosen player picks the next person.'
    ],
    variations: [
      'Group dares: the whole circle must do the dare together.'
    ],
    tips: 'Stick to the decks; home-made dares drift into cruel territory fast.'
  },
  {
    id: 'never-have-i-ever',
    name: 'Never Have I Ever',
    tagline: 'Ten fingers up. Put one down if you have done it.',
    category: 'icebreaker',
    players: { min: 4, max: 20 },
    ages: ['teens', 'adults', 'elders'],
    energy: 'chill',
    contact: 'none',
    props: [],
    phone: 'host',
    space: ['indoor', 'outdoor'],
    minutes: 15,
    teams: false,
    tool: 'prompts:neverhave',
    tags: ['icebreaker', 'quiet', 'no-prep'],
    setup: 'Sit in a circle with ten fingers up. The host reads statements from the phone or players invent their own.',
    rules: [
      'Someone reads "Never have I ever..." followed by something they have never done.',
      'Everyone who HAS done it puts one finger down and, if asked, tells the story.',
      'Go around the circle, one statement each.',
      'First person with no fingers left loses, and clearly has the best stories.'
    ],
    variations: [
      'Family version: statements about childhood only.'
    ]
  },
  {
    id: 'debate-club',
    name: 'Silly Debates',
    tagline: 'Argue a ridiculous motion with full seriousness. Audience decides.',
    category: 'word',
    players: { min: 4, max: 20 },
    ages: ['teens', 'adults', 'elders'],
    energy: 'chill',
    contact: 'none',
    props: [],
    phone: 'host',
    space: ['indoor', 'outdoor'],
    minutes: 20,
    teams: false,
    tool: 'prompts:debate',
    tags: ['quiet', 'no-prep'],
    setup: 'Pick two debaters and a motion from the phone. Everyone else is the audience and jury.',
    rules: [
      'Debater one argues FOR the motion for one minute, with total seriousness.',
      'Debater two argues AGAINST for one minute.',
      'Each gets 30 seconds of rebuttal.',
      'The audience votes by applause; the louder side wins and the winner chooses the next debaters.'
    ],
    variations: [
      'Swap sides halfway through without warning.'
    ],
    tips: 'Pair the quietest person with the loudest motion; it is the easiest way to get them talking.'
  },
  {
    id: 'heads-up',
    name: 'Guess the Word on My Forehead',
    tagline: 'Phone on your forehead. Friends shout clues. Tilt to score.',
    category: 'word',
    players: { min: 3, max: 15 },
    ages: ['kids', 'teens', 'adults', 'elders'],
    energy: 'medium',
    contact: 'none',
    props: [],
    phone: 'pass',
    space: ['indoor', 'outdoor'],
    minutes: 15,
    teams: false,
    tool: 'headsup',
    tags: ['classic', 'loud', 'quick'],
    setup: 'Open the Heads Up tool, pick a deck, and hold the phone against your forehead with the screen facing the others.',
    rules: [
      'Everyone else sees the word and shouts clues without saying the word itself.',
      'When you guess right, tap the Correct button; if stuck, tap Pass.',
      'Each turn lasts 60 seconds; your score is the number correct.',
      'Pass the phone to the next player; highest score wins.'
    ],
    variations: [
      'Act-only clues: no speaking, only gestures.'
    ]
  },
  {
    id: 'where-are-we',
    name: 'Where Are We?',
    tagline: 'Everyone knows the location except the spy. Ask careful questions.',
    category: 'social',
    players: { min: 4, max: 10 },
    ages: ['teens', 'adults'],
    energy: 'chill',
    contact: 'none',
    props: [],
    phone: 'pass',
    space: ['indoor', 'outdoor'],
    minutes: 15,
    teams: false,
    tool: 'imposter',
    tags: ['quiet', 'no-prep'],
    setup: 'Open the Imposter tool and choose the Places deck. Everyone sees the same location except the spy, who is shown "Imposter" and only the deck name.',
    rules: [
      'Players take turns asking each other questions about the place without naming it: "What do you wear here?"',
      'Answers must be vague enough to hide the location from the spy but clear enough to prove you know it.',
      'After eight minutes, everyone votes on who the spy is.',
      'If the spy is caught, they can still win by naming the location.'
    ],
    variations: [
      'The spy may interrupt at any time to guess the location; a wrong guess loses instantly.'
    ],
    tips: 'Tell new players that the spy wins more often by listening than by talking.'
  },
  {
    id: 'broken-telephone',
    name: 'Broken Telephone',
    tagline: 'Whisper a sentence down the line and hear what comes out.',
    category: 'word',
    players: { min: 6, max: 30 },
    ages: ['kids', 'teens', 'adults', 'elders'],
    energy: 'chill',
    contact: 'none',
    props: [],
    phone: 'none',
    space: ['indoor', 'outdoor'],
    minutes: 10,
    teams: false,
    tags: ['classic', 'quiet', 'no-prep', 'quick'],
    setup: 'Sit in a line or circle. The first person thinks of a long, slightly odd sentence.',
    rules: [
      'Whisper the sentence once into the ear of the person next to you. No repeating.',
      'Each person passes on exactly what they heard.',
      'The last person says it out loud.',
      'The first person reveals the original; the person who changed it most goes first next round.'
    ],
    variations: [
      'Two chains race with the same sentence.',
      'Drawing version: draw what you heard, then the next person describes your drawing.'
    ]
  },
  {
    id: 'raja-mantri-chor-sipahi',
    name: 'Raja Mantri Chor Sipahi',
    tagline: 'Four chits, four roles. The minister must find the thief.',
    category: 'brain',
    players: { min: 4, max: 16 },
    ages: ['kids', 'teens', 'adults', 'elders'],
    energy: 'chill',
    contact: 'none',
    props: ['paper'],
    phone: 'none',
    space: ['indoor', 'outdoor'],
    minutes: 15,
    teams: false,
    tags: ['indian', 'classic', 'quiet'],
    setup: 'Play in groups of exactly four. Write Raja (1000), Mantri (800), Chor (0), Sipahi (500) on four folded chits per group.',
    rules: [
      'Toss the chits in the middle; everyone grabs one and reads it secretly.',
      'The Raja announces themselves and orders the Mantri to find the Chor.',
      'The Mantri looks at the remaining two players and names one as the Chor.',
      'Right guess: everyone keeps their points. Wrong guess: the Mantri and Chor swap points. Play ten rounds and total up.'
    ],
    variations: [
      'Add a fifth chit, Senapati (600), for groups of five.'
    ],
    tips: 'The whole game is watching faces when the chits open. Make everyone sit close.'
  },
  {
    id: 'human-knot',
    name: 'Human Knot',
    tagline: 'Grab random hands, then untangle without letting go.',
    category: 'physical',
    players: { min: 6, max: 12 },
    ages: ['teens', 'adults'],
    energy: 'medium',
    contact: 'close',
    props: [],
    phone: 'host',
    space: ['indoor', 'outdoor'],
    minutes: 15,
    teams: false,
    tool: 'timer',
    tags: ['cooperative', 'no-prep'],
    setup: 'Stand in a tight circle, shoulder to shoulder. Only play this with people comfortable being in close contact.',
    rules: [
      'Everyone reaches into the circle and grabs two different people\'s hands, not the people beside them.',
      'Without letting go, untangle into one big circle by stepping over and under arms.',
      'Letting go at any point means starting again.',
      'Time it; try to beat your own record.'
    ],
    variations: [
      'Silent version: no talking while untangling.'
    ]
  },

  /* ---------- Extra energy and mixers ---------- */
  {
    id: 'rps-evolution',
    name: 'Rock Paper Scissors Evolution',
    tagline: 'Win to evolve from egg to chicken to dinosaur. Lose and go back.',
    category: 'physical',
    players: { min: 6, max: 40 },
    ages: ['kids', 'teens', 'adults'],
    energy: 'medium',
    contact: 'none',
    props: [],
    phone: 'none',
    space: ['indoor', 'outdoor'],
    minutes: 10,
    teams: false,
    tags: ['loud', 'no-prep', 'quick'],
    setup: 'Everyone starts as an Egg: crouch down and waddle. Explain the levels: Egg, Chicken (flap elbows), Dinosaur (roar with claws), Human (walk normally).',
    rules: [
      'Find someone at the same level as you and play rock paper scissors.',
      'The winner evolves one level up; the loser goes one level down (Eggs stay Eggs).',
      'Humans who win are finished and stand aside to cheer.',
      'Play until only one Egg remains, the proud last Egg.'
    ],
    variations: [
      'Add a Superhero level after Human for a longer game.'
    ]
  },
  {
    id: 'balloon-stomp',
    name: 'Balloon Stomp',
    tagline: 'Balloon tied to your ankle. Stomp theirs, protect yours.',
    category: 'physical',
    players: { min: 5, max: 20 },
    ages: ['kids', 'teens', 'adults'],
    energy: 'high',
    contact: 'light',
    props: ['balloons'],
    phone: 'host',
    space: ['outdoor'],
    minutes: 10,
    teams: false,
    tool: 'timer',
    tags: ['loud', 'competitive'],
    setup: 'Tie one inflated balloon to each player\'s ankle with a 30 cm string. Mark a boundary on soft ground.',
    rules: [
      'On the signal, stomp on other players\' balloons while protecting your own.',
      'Hands may not be used to block or hold anyone.',
      'When your balloon bursts, you are out and step outside the boundary.',
      'Last balloon intact wins, or whoever survives when the two-minute timer ends.'
    ],
    variations: [
      'Teams: balloons of two colours, last team with a balloon wins.'
    ],
    tips: 'Barefoot or sandals only; shoes crush toes.'
  },
  {
    id: 'hot-potato',
    name: 'Hot Potato',
    tagline: 'Pass it fast. When the beep comes, whoever holds it is out.',
    category: 'physical',
    players: { min: 5, max: 20 },
    ages: ['kids', 'teens', 'adults', 'elders'],
    energy: 'medium',
    contact: 'light',
    props: [],
    phone: 'host',
    space: ['indoor', 'outdoor'],
    minutes: 10,
    teams: false,
    tool: 'random-stop',
    tags: ['classic', 'no-prep', 'quick'],
    setup: 'Sit or stand in a circle with any small object: a ball, a slipper, a rolled sock. Start the Random Stop tool.',
    rules: [
      'Pass the object around the circle as fast as possible.',
      'You may not hold it for more than one second or throw it across the circle.',
      'When the phone beeps, whoever is holding it is out.',
      'Last person left wins.'
    ],
    variations: [
      'Reverse direction every time someone claps.',
      'Two objects going in opposite directions.'
    ]
  },
  {
    id: 'human-bingo',
    name: 'Find Someone Who',
    tagline: 'Hunt the room for someone who matches each square.',
    category: 'icebreaker',
    players: { min: 8, max: 40 },
    ages: ['teens', 'adults'],
    energy: 'medium',
    contact: 'none',
    props: ['paper'],
    phone: 'host',
    space: ['indoor', 'outdoor'],
    minutes: 15,
    teams: false,
    tool: 'timer',
    tags: ['icebreaker', 'quick'],
    setup: 'The host writes a 3x3 grid of traits on each sheet: has a pet, can whistle, born in another state, hates coriander, has climbed a tree this year, and so on.',
    rules: [
      'Start a 10-minute timer.',
      'Walk around and find a different person for each square; they sign it.',
      'One person may sign only one square on your sheet.',
      'First full sheet shouts "bingo" and wins; the host verifies the signatures.'
    ],
    variations: [
      'Full-row bingo instead of full sheet for a faster game.'
    ],
    tips: 'Write at least two squares only a cousin from another town could sign; it forces people to cross the room.'
  },
  {
    id: 'lip-sync-battle',
    name: 'Lip Sync Battle',
    tagline: 'Perform a song without singing a note. Commitment is everything.',
    category: 'music',
    players: { min: 4, max: 20 },
    ages: ['kids', 'teens', 'adults'],
    energy: 'medium',
    contact: 'none',
    props: ['music'],
    phone: 'host',
    space: ['indoor', 'outdoor'],
    minutes: 25,
    teams: false,
    tool: 'picker',
    tags: ['loud', 'competitive'],
    setup: 'Everyone secretly picks a song they know by heart. The phone picks who performs first. Clear a stage area.',
    rules: [
      'Play the song and the performer lip-syncs with full dance and drama for one minute.',
      'No actual singing; the mouth must match the words.',
      'The audience scores each performer from 1 to 10 by show of fingers.',
      'Highest total wins; a tie goes to a dance-off.'
    ],
    variations: [
      'Duets: pairs perform a duet with both parts.',
      'Surprise song: the audience picks the song for you.'
    ]
  },
  {
    id: 'count-to-twenty',
    name: 'Count to Twenty',
    tagline: 'Count to twenty as a group. Two voices at once and you restart.',
    category: 'brain',
    players: { min: 5, max: 20 },
    ages: ['teens', 'adults', 'elders'],
    energy: 'chill',
    contact: 'none',
    props: [],
    phone: 'none',
    space: ['indoor', 'outdoor'],
    minutes: 10,
    teams: false,
    tags: ['quiet', 'no-prep', 'cooperative', 'quick'],
    setup: 'Everyone sits in a circle and closes their eyes, or faces outward so nobody can see anyone else.',
    rules: [
      'Anyone may say "one" to start.',
      'Anyone may say the next number, but nobody may speak twice in a row.',
      'If two people speak at the same time, start again from one.',
      'Reach twenty and the group wins; then try it faster.'
    ],
    variations: [
      'Count in another language.',
      'Count to 50 with the rule that multiples of 5 must be whispered.'
    ],
    tips: 'This looks easy and is not. Let the group fail five times before anyone suggests a strategy.'
  }
];
