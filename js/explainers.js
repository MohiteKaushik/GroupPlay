/* Animated explainers, keyed by game id. Format: EXPLAINERS.md. Validate: node tools/validate-explainers.js */
window.GP_EXPLAINERS = {
  'pass-the-parcel': [
    { say: 'Everyone sits in a circle. One person runs the music.', people: 8, layout: 'circle', states: { 0: 'host' }, labels: { 0: 'Music' }, props: [{ id: 'parcel', type: 'parcel', at: 'p2.hand' }] },
    { say: 'Music plays. Pass the parcel round the circle, hand to hand.', props: [{ id: 'parcel', type: 'parcel', at: 'p2' }], moves: [{ id: 'parcel', orbit: [2, 7], dur: 2.5, loop: true }], fx: ['music'], states: { 0: 'host' } },
    { say: 'Music stops! Whoever is holding it removes ONE layer only.', states: { 5: 'it', 0: 'host' }, props: [{ id: 'parcel', type: 'parcel', at: 'p5.hand' }], moves: [{ id: 'parcel', shake: true }], fx: ['stop'] },
    { say: 'Music again, keep passing. Whoever opens the last layer keeps the gift.', states: { 5: 'happy', 0: 'host' }, props: [{ id: 'parcel', type: 'gift', at: 'p5.hand' }], moves: [{ id: 'parcel', bounce: true }], fx: ['confetti'] }
  ],
  'musical-chairs': [
    { say: 'Chairs in the middle, one fewer than the players. Music on.', people: 6, layout: 'chairs', chairs: 5, states: { 0: 'host' }, labels: { 0: 'Music' }, fx: ['music'] },
    { say: 'Walk round the chairs while the music plays. No touching them.', states: { 0: 'host' }, moves: [{ id: 'p1', orbit: [1, 2], dur: 2, loop: true }, { id: 'p2', orbit: [2, 3], dur: 2, loop: true }, { id: 'p3', orbit: [3, 4], dur: 2, loop: true }, { id: 'p4', orbit: [4, 5], dur: 2, loop: true }, { id: 'p5', orbit: [5, 0], dur: 2, loop: true }], fx: ['music'] },
    { say: 'Music stops: sit! The one left standing is out.', states: { 0: 'host', 1: 'sit', 2: 'sit', 3: 'sit', 4: 'sit', 5: 'sad' }, moves: [{ id: 'p1', to: 'c0', dur: 0.8 }, { id: 'p2', to: 'c1', dur: 0.8 }, { id: 'p3', to: 'c2', dur: 0.8 }, { id: 'p4', to: 'c3', dur: 0.8 }], fx: ['stop'] },
    { say: 'Remove a chair, play again. Last one sitting wins.', people: 5, chairs: 4, states: { 0: 'host', 2: 'happy' }, fx: ['confetti'] }
  ],
  'imposter': [
    { say: 'Everyone secretly sees the same word, except one person: the Imposter.', people: 6, layout: 'circle', states: { 3: 'mafia' }, props: [{ id: 'ph', type: 'phone', at: 'p0.hand' }], bubbles: { 0: 'Mango' } },
    { say: 'Go round the circle. Each person says ONE word related to the secret word.', bubbles: { 0: 'Sweet', 1: 'Summer', 2: 'Yellow' }, states: { 3: 'mafia' } },
    { say: 'The Imposter has to bluff with a vague clue and listen for hints.', bubbles: { 3: 'Tasty...' }, states: { 3: 'mafia' }, moves: [{ id: 'p3', shake: true }] },
    { say: 'After two rounds, everyone points at who they think the Imposter is.', states: { 3: 'mafia' }, point: { 0: 3, 1: 3, 2: 3, 4: 3, 5: 3 } },
    { say: 'Caught? The Imposter gets one guess at the word. Right guess and they still win.', states: { 3: 'it' }, bubbles: { 3: 'Mango?' }, fx: ['timer'] }
  ],
  'dumb-charades': [
    { say: 'Two teams. Team A whispers a movie name to one player from Team B.', people: 8, layout: 'teams', states: { 0: 'it', 4: 'it' }, labels: { 3: 'Team A', 7: 'Team B' }, bubbles: { 0: 'Psst...' }, moves: [{ id: 'p4', to: 'mid:0,4', dur: 1.2 }] },
    { say: 'That player acts it out for their OWN team: no words, no lip movement.', states: { 4: 'hands' }, moves: [{ id: 'p4', to: 'center', dur: 0.8 }, { id: 'p4', shake: true }], fx: ['timer'] },
    { say: 'Fingers up for number of words, tap the forearm for syllables.', states: { 4: 'it' }, moves: [{ id: 'p4', to: 'center', dur: 0.5 }], bubbles: { 5: '3 words?', 6: 'Sholay!' } },
    { say: 'Guessed in time? Team B scores. Then swap sides. First to 10 wins.', states: { 5: 'happy', 6: 'happy', 7: 'happy', 4: 'happy' }, props: [{ id: 'score', type: 'text', text: 'A 2 - B 3', at: 'top' }], fx: ['confetti'] }
  ],
  'antakshari': [
    { say: 'Two teams sit facing each other. No instruments needed.', people: 8, layout: 'teams', labels: { 3: 'Team A', 7: 'Team B' } },
    { say: 'Team A sings at least two lines of any song.', states: { 0: 'shout', 1: 'shout', 2: 'shout' }, bubbles: { 1: '...tera naam' }, fx: ['music'] },
    { say: 'Team B must start a song with the letter the last song ended on.', states: { 4: 'it' }, props: [{ id: 'letter', type: 'text', text: 'Letter: M', at: 'top' }], bubbles: { 5: 'Mere...' }, fx: ['timer'] },
    { say: 'No answer in 30 seconds? Lose a point. No song may be repeated all game.', states: { 4: 'sad', 5: 'sad', 6: 'sad', 7: 'sad', 0: 'happy', 1: 'happy' }, props: [{ id: 'score', type: 'text', text: 'A 1 - B 0', at: 'top' }], fx: ['stop'] }
  ],
  'mafia': [
    { say: 'Night: everyone closes their eyes. The narrator stays awake and runs the game.', people: 8, layout: 'circle', states: { 0: 'host', 1: 'sleep', 2: 'sleep', 3: 'sleep', 4: 'sleep', 5: 'sleep', 6: 'sleep', 7: 'sleep' }, labels: { 0: 'Narrator' }, fx: ['night', 'zzz'] },
    { say: 'The Mafia open their eyes and silently point at a victim.', states: { 0: 'host', 2: 'mafia', 5: 'mafia', 1: 'sleep', 3: 'sleep', 4: 'sleep', 6: 'sleep', 7: 'sleep' }, point: { 2: 4, 5: 4 }, fx: ['night'] },
    { say: 'The Doctor picks one person to save. The Detective checks one suspect.', states: { 0: 'host', 1: 'sleep', 2: 'sleep', 3: 'it', 4: 'sleep', 5: 'sleep', 6: 'it', 7: 'sleep' }, labels: { 3: 'Doctor', 6: 'Detective' }, point: { 3: 7, 6: 2 }, fx: ['night'] },
    { say: 'Day: the narrator says who died. Everyone argues and accuses.', states: { 0: 'host', 4: 'out' }, bubbles: { 1: 'It was you!', 7: 'No way!' } },
    { say: 'Vote: most votes is out and shows their role. Repeat until one side wins.', states: { 0: 'host', 4: 'out', 2: 'mafia' }, point: { 1: 2, 3: 2, 6: 2, 7: 2 }, fx: ['confetti'] }
  ],
  'balloon-keep-up': [
    { say: 'Tap the balloon into the air. It must never touch the floor.', people: 5, layout: 'circle', props: [{ id: 'b', type: 'balloon', at: 'p0.hand' }], moves: [{ id: 'b', path: ['p0.head', 'p2.head', 'p4.head', 'p1.head'], dur: 3, loop: true }], states: { 0: 'hands' } },
    { say: 'You cannot hit it twice in a row. It must go to someone else.', props: [{ id: 'b', type: 'balloon', at: 'p2.head' }], moves: [{ id: 'b', path: ['p2.head', 'p3.head', 'p1.head'], dur: 2.5, loop: true }], states: { 2: 'hands', 3: 'hands' } },
    { say: 'Balloon hits the floor? The last person who touched it is out.', props: [{ id: 'b', type: 'balloon', at: 'p3.head' }], moves: [{ id: 'b', fall: true, dur: 1.2 }], states: { 3: 'sad' }, fx: ['stop'] },
    { say: 'Keep going until one person is left, or count hits in two minutes.', people: 4, states: { 1: 'happy' }, props: [{ id: 'b', type: 'balloon', at: 'p1.head' }], moves: [{ id: 'b', bounce: true }], fx: ['timer'] }
  ],
  'one-word-story': [
    { say: 'Sit in a circle. The host reads an opening line from the phone.', people: 7, layout: 'circle', states: { 0: 'host' }, props: [{ id: 'ph', type: 'phone', at: 'p0.hand' }], bubbles: { 0: 'Once upon' } },
    { say: 'Going round, each person adds exactly ONE word to the story.', bubbles: { 1: 'a', 3: 'tiger' }, states: { 3: 'it' } },
    { say: 'The word must make sense with what came before. No cheating with two words.', bubbles: { 4: 'ate', 6: 'homework' }, states: { 6: 'it' } },
    { say: 'Say "full stop" to end a sentence. After three, the next person retells it all.', bubbles: { 6: 'Full stop!' }, states: { 6: 'shout', 0: 'host' } }
  ],
  'thumb-war': [
    { say: 'Pair up. Lock the fingers of your right hands, thumbs up.', people: 2, layout: 'pair', states: { 0: 'it', 1: 'it' } },
    { say: 'Say the chant together. On "war", start!', bubbles: { 0: '1, 2, 3, 4', 1: 'thumb war!' }, states: { 0: 'shout', 1: 'shout' }, moves: [{ id: 'p0', shake: true }, { id: 'p1', shake: true }] },
    { say: 'Pin the other thumb flat and hold it for a count of three to win.', states: { 0: 'happy', 1: 'sad' }, bubbles: { 0: '1... 2... 3!' } },
    { say: 'Winners play winners until one champion remains.', people: 4, layout: 'row', states: { 0: 'out', 2: 'out', 1: 'it', 3: 'it' }, fx: ['confetti'] }
  ],
  'guess-how-many': [
    { say: 'The host shows something countable for ten seconds, then hides it.', people: 6, layout: 'circle', states: { 0: 'host' }, props: [{ id: 'bowl', type: 'bowl', at: 'p0.hand' }], fx: ['timer'] },
    { say: 'Everyone says a guess out loud, one at a time. No changing your number.', states: { 0: 'host' }, bubbles: { 1: '120', 2: '85', 3: '200', 4: '150', 5: '99' } },
    { say: 'Now count it together.', states: { 0: 'host', 1: 'shout', 2: 'shout' }, props: [{ id: 'bowl', type: 'bowl', at: 'center' }], bubbles: { 0: '...131, 132' } },
    { say: 'Closest guess wins the round and picks the next thing.', states: { 0: 'host', 4: 'happy' }, props: [{ id: 'n', type: 'text', text: '132!', at: 'top' }], fx: ['confetti'] }
  ],
  'chair-race': [
    { say: 'Each racer gets two chairs. Stand on one, place the other ahead.', people: 1, layout: 'row', states: { 0: 'it' }, props: [{ id: 'c1', type: 'chair', at: { x: 120, y: 140 } }, { id: 'c2', type: 'chair', at: { x: 160, y: 140 } }, { id: 'line', type: 'line', at: { x: 160, y: 185 } }], moves: [{ id: 'p0', to: { x: 120, y: 136 }, dur: 1 }] },
    { say: 'Step onto the front chair, reach back, move the back chair forward.', people: 1, props: [{ id: 'c1', type: 'chair', at: { x: 120, y: 140 } }, { id: 'c2', type: 'chair', at: { x: 160, y: 140 } }], moves: [{ id: 'p0', to: { x: 160, y: 136 }, dur: 1 }, { id: 'c1', path: [{ x: 120, y: 140 }, { x: 140, y: 100 }, { x: 200, y: 140 }], dur: 2.5 }] },
    { say: 'Touch the ground and you go back to the start.', states: { 0: 'sad' }, props: [{ id: 'c2', type: 'chair', at: { x: 160, y: 140 } }, { id: 'c1', type: 'chair', at: { x: 200, y: 140 } }], moves: [{ id: 'p0', to: 'left', dur: 1.5 }], fx: ['stop'] },
    { say: 'First team to get everyone across the line wins.', people: 4, layout: 'teams', states: { 0: 'happy', 1: 'happy' }, labels: { 1: 'Team A' }, fx: ['whistle', 'confetti'] }
  ],
  'lemon-and-spoon': [
    { say: 'Spoon handle in your mouth, lemon balanced on it. No hands!', people: 4, layout: 'row', props: [{ id: 's0', type: 'spoon', at: 'p0.hand' }, { id: 's1', type: 'spoon', at: 'p1.hand' }, { id: 's2', type: 'spoon', at: 'p2.hand' }, { id: 's3', type: 'spoon', at: 'p3.hand' }] },
    { say: 'On the whistle, walk to the finish line. Slow and steady.', people: 3, layout: 'teams', props: [{ id: 's0', type: 'spoon', at: 'p0.hand' }, { id: 's1', type: 'spoon', at: 'p1.hand' }, { id: 's2', type: 'spoon', at: 'p2.hand' }, { id: 'fin', type: 'line', at: { x: 160, y: 185 } }], moves: [{ id: 'p0', to: 'right', dur: 3 }, { id: 's0', to: { x: 296, y: 115 }, dur: 3 }], fx: ['whistle'] },
    { say: 'Lemon drops? Stop, pick it up, restart from where it fell.', people: 1, layout: 'pair', states: { 0: 'sad' }, props: [{ id: 's0', type: 'spoon', at: 'p0.hand' }], moves: [{ id: 's0', fall: true, dur: 1.2 }], fx: ['stop'] },
    { say: 'First across with the lemon still on the spoon wins.', people: 4, layout: 'row', states: { 2: 'happy' }, props: [{ id: 's2', type: 'spoon', at: 'p2.hand' }], fx: ['confetti'] }
  ],
  'kabaddi-lite': [
    { say: 'A centre line. Two teams, one on each side.', people: 8, layout: 'teams', labels: { 3: 'Team A', 7: 'Team B' }, props: [{ id: 'line', type: 'line', at: { x: 160, y: 120 }, size: 0.6 }] },
    { say: 'A raider crosses the line chanting "kabaddi kabaddi" on ONE breath.', states: { 1: 'shout' }, bubbles: { 1: 'kabaddi!' }, props: [{ id: 'line', type: 'line', at: { x: 160, y: 120 }, size: 0.6 }], moves: [{ id: 'p1', to: 'mid:1,5', dur: 1.5 }] },
    { say: 'Touch a defender and get back before the chant stops. Touched defenders are out.', states: { 1: 'it', 5: 'out' }, props: [{ id: 'line', type: 'line', at: { x: 160, y: 120 }, size: 0.6 }], moves: [{ id: 'p1', path: ['mid:1,5', 'p5', 'p1'], dur: 2.5 }] },
    { say: 'If defenders hold the raider until the chant stops, the raider is out.', states: { 1: 'sad', 4: 'it', 6: 'it' }, props: [{ id: 'line', type: 'line', at: { x: 160, y: 120 }, size: 0.6 }], moves: [{ id: 'p1', to: 'mid:4,6', dur: 1 }, { id: 'p4', to: 'mid:4,6', dur: 1 }, { id: 'p6', to: 'mid:4,6', dur: 1 }], fx: ['stop'] }
  ],
  'dog-and-the-bone': [
    { say: 'Two lines face each other. The cloth, the "bone", lies in the middle.', people: 8, layout: 'teams', labels: { 3: '4', 7: '4' }, props: [{ id: 'bone', type: 'potato', at: 'center' }] },
    { say: 'The host calls a number. That player from EACH team runs to the bone.', states: { 2: 'it', 6: 'it' }, props: [{ id: 'bone', type: 'potato', at: 'center' }, { id: 'call', type: 'text', text: 'Three!', at: 'top' }], moves: [{ id: 'p2', to: { x: 135, y: 125 }, dur: 1.2 }, { id: 'p6', to: { x: 185, y: 125 }, dur: 1.2 }] },
    { say: 'Grab it and run back to your line to score. Tagged while holding it? They score.', states: { 2: 'it', 6: 'shout' }, props: [{ id: 'bone', type: 'potato', at: { x: 135, y: 115 } }], moves: [{ id: 'p2', path: [{ x: 135, y: 125 }, 'p2'], dur: 1.5 }, { id: 'bone', path: [{ x: 135, y: 115 }, 'p2.hand'], dur: 1.5 }, { id: 'p6', path: [{ x: 185, y: 125 }, 'mid:2,6'], dur: 1.5 }] },
    { say: 'First team to 10 points wins.', states: { 0: 'happy', 1: 'happy', 2: 'happy', 3: 'happy' }, props: [{ id: 'score', type: 'text', text: 'A 10 - B 7', at: 'top' }], fx: ['confetti'] }
  ],
  'fire-in-the-mountain': [
    { say: 'The caller stands in the middle. Everyone else jogs in a wide circle.', people: 9, layout: 'circle', states: { 0: 'host' }, labels: { 0: 'Caller' }, moves: [{ id: 'p0', to: 'center' }, { id: 'p1', orbit: [1, 2], dur: 2, loop: true }, { id: 'p2', orbit: [2, 3], dur: 2, loop: true }, { id: 'p3', orbit: [3, 4], dur: 2, loop: true }, { id: 'p4', orbit: [4, 5], dur: 2, loop: true }, { id: 'p5', orbit: [5, 6], dur: 2, loop: true }, { id: 'p6', orbit: [6, 7], dur: 2, loop: true }, { id: 'p7', orbit: [7, 8], dur: 2, loop: true }, { id: 'p8', orbit: [8, 1], dur: 2, loop: true }] },
    { say: '"Fire in the mountain, run, run, run!" Then the caller shouts a number.', states: { 0: 'shout' }, props: [{ id: 'call', type: 'text', text: 'THREE!', at: 'top' }], moves: [{ id: 'p0', to: 'center' }, { id: 'p1', orbit: [1, 2], dur: 2, loop: true }, { id: 'p3', orbit: [3, 4], dur: 2, loop: true }, { id: 'p5', orbit: [5, 6], dur: 2, loop: true }, { id: 'p7', orbit: [7, 8], dur: 2, loop: true }] },
    { say: 'Grab others to make groups of EXACTLY that number. Fast!', states: { 0: 'host' }, moves: [{ id: 'p0', to: 'center' }, { id: 'p1', to: { x: 255, y: 100 }, dur: 1 }, { id: 'p2', to: { x: 285, y: 130 }, dur: 1 }, { id: 'p3', to: { x: 250, y: 150 }, dur: 1 }, { id: 'p4', to: { x: 95, y: 155 }, dur: 1 }, { id: 'p5', to: { x: 60, y: 130 }, dur: 1 }, { id: 'p6', to: { x: 90, y: 100 }, dur: 1 }, { id: 'p7', to: { x: 145, y: 185 }, dur: 1 }, { id: 'p8', to: { x: 180, y: 185 }, dur: 1 }] },
    { say: 'Wrong-sized group? You are out. Play until two or three remain.', states: { 0: 'host', 7: 'out', 8: 'out' }, moves: [{ id: 'p0', to: 'center' }, { id: 'p1', to: { x: 255, y: 100 }, dur: 0.5 }, { id: 'p2', to: { x: 285, y: 130 }, dur: 0.5 }, { id: 'p3', to: { x: 250, y: 150 }, dur: 0.5 }, { id: 'p4', to: { x: 95, y: 155 }, dur: 0.5 }, { id: 'p5', to: { x: 60, y: 130 }, dur: 0.5 }, { id: 'p6', to: { x: 90, y: 100 }, dur: 0.5 }, { id: 'p7', to: { x: 145, y: 185 }, dur: 0.5 }, { id: 'p8', to: { x: 180, y: 185 }, dur: 0.5 }], fx: ['stop'] }
  ],
  'poison-ball': [
    { say: 'One team inside the rectangle. The other team splits to both outside ends.', people: 8, layout: 'teams', labels: { 1: 'Outside', 5: 'Outside' }, moves: [{ id: 'p2', to: { x: 140, y: 110 } }, { id: 'p3', to: { x: 180, y: 130 } }, { id: 'p6', to: { x: 150, y: 150 } }, { id: 'p7', to: { x: 175, y: 95 } }], props: [{ id: 'ball', type: 'ball', at: 'p0.hand' }] },
    { say: 'Outside players throw at the inside players, below the waist only.', states: { 0: 'it' }, props: [{ id: 'ball', type: 'ball', at: 'p0.hand' }], moves: [{ id: 'p2', to: { x: 140, y: 110 } }, { id: 'p3', to: { x: 180, y: 130 } }, { id: 'p6', to: { x: 150, y: 150 } }, { id: 'p7', to: { x: 175, y: 95 } }, { id: 'ball', path: ['p0.hand', { x: 150, y: 150 }, 'p4.hand'], dur: 2.5, loop: true }] },
    { say: 'Hit? You are out. Catch it cleanly and you stay. Inside players only dodge.', states: { 6: 'out', 3: 'happy' }, props: [{ id: 'ball', type: 'ball', at: { x: 180, y: 120 } }], moves: [{ id: 'p2', to: { x: 140, y: 110 } }, { id: 'p3', to: { x: 180, y: 130 } }, { id: 'p6', to: { x: 150, y: 150 } }, { id: 'p7', to: { x: 175, y: 95 } }] },
    { say: 'Everyone inside out? Swap sides and time how long each team survives.', states: { 2: 'out', 3: 'out', 6: 'out', 7: 'out' }, moves: [{ id: 'p2', to: { x: 140, y: 110 } }, { id: 'p3', to: { x: 180, y: 130 } }, { id: 'p6', to: { x: 150, y: 150 } }, { id: 'p7', to: { x: 175, y: 95 } }], fx: ['timer', 'whistle'] }
  ],
  'kho-kho-lite': [
    { say: 'Chasers sit in a line, facing alternate ways. Three runners enter the field.', people: 8, layout: 'row', states: { 0: 'sit', 1: 'sit', 2: 'sit', 3: 'sit', 4: 'sit' }, labels: { 0: 'Chasers' }, moves: [{ id: 'p5', to: { x: 80, y: 92 } }, { id: 'p6', to: { x: 180, y: 90 } }, { id: 'p7', to: { x: 250, y: 185 } }] },
    { say: 'One chaser stands and chases the runners round the line. Never cross it.', states: { 0: 'sit', 1: 'sit', 3: 'sit', 4: 'sit', 2: 'it' }, moves: [{ id: 'p5', to: { x: 80, y: 92 } }, { id: 'p6', path: [{ x: 180, y: 90 }, { x: 260, y: 90 }, { x: 260, y: 185 }], dur: 2.5 }, { id: 'p7', to: { x: 250, y: 185 } }, { id: 'p2', path: ['p2', { x: 220, y: 92 }, { x: 290, y: 140 }], dur: 2.5 }] },
    { say: 'Tap a seated teammate and shout "kho!" Now THEY are the chaser.', states: { 0: 'sit', 1: 'sit', 2: 'sit', 4: 'sit', 3: 'it' }, bubbles: { 3: 'Kho!' }, moves: [{ id: 'p5', to: { x: 80, y: 92 } }, { id: 'p6', to: { x: 260, y: 90 } }, { id: 'p7', to: { x: 250, y: 185 } }, { id: 'p3', path: ['p3', { x: 230, y: 185 }], dur: 1.5 }] },
    { say: 'A tagged runner is out; the next runner enters. Swap roles after five minutes.', states: { 0: 'sit', 1: 'sit', 2: 'sit', 4: 'sit', 3: 'it', 7: 'out' }, moves: [{ id: 'p5', to: { x: 80, y: 92 } }, { id: 'p6', to: { x: 260, y: 90 } }, { id: 'p7', to: { x: 250, y: 185 } }, { id: 'p3', to: { x: 215, y: 185 } }], fx: ['timer'] }
  ],
  'tug-of-war': [
    { say: 'Two equal teams hold the rope. A cloth marks the middle of the rope.', people: 6, layout: 'teams', labels: { 2: 'Team A', 5: 'Team B' }, props: [{ id: 'rope', type: 'rope', at: 'center', size: 1.6 }, { id: 'mark', type: 'chit', at: 'center' }, { id: 'line', type: 'line', at: { x: 160, y: 170 }, size: 0.7 }] },
    { say: 'On the whistle, pull! Lean back, dig your heels in.', states: { 0: 'shout', 1: 'shout', 2: 'shout', 3: 'shout', 4: 'shout', 5: 'shout' }, props: [{ id: 'rope', type: 'rope', at: 'center', size: 1.6 }, { id: 'mark', type: 'chit', at: 'center' }, { id: 'line', type: 'line', at: { x: 160, y: 170 }, size: 0.7 }], moves: [{ id: 'rope', shake: true }, { id: 'mark', to: { x: 140, y: 118 }, dur: 2, loop: true }], fx: ['whistle'] },
    { say: 'Drag the cloth marker over the centre line to your side and you win.', states: { 0: 'happy', 1: 'happy', 2: 'happy', 3: 'sad', 4: 'sad', 5: 'sad' }, props: [{ id: 'rope', type: 'rope', at: { x: 120, y: 120 }, size: 1.6 }, { id: 'mark', type: 'chit', at: { x: 110, y: 118 } }, { id: 'line', type: 'line', at: { x: 160, y: 170 }, size: 0.7 }], fx: ['confetti'] },
    { say: 'Best of three, switching ends between pulls.', labels: { 2: 'Team B', 5: 'Team A' }, props: [{ id: 'rope', type: 'rope', at: 'center', size: 1.6 }, { id: 'mark', type: 'chit', at: 'center' }, { id: 'score', type: 'text', text: 'A 1 - B 0', at: 'top' }] }
  ],
  'chain-tag': [
    { say: 'One person starts as the chaser. Everyone else spreads out.', people: 8, layout: 'scatter', states: { 0: 'it' }, labels: { 0: 'Chaser' } },
    { say: 'Tag someone: now you hold hands and chase as a chain of two.', states: { 0: 'it', 5: 'it' }, moves: [{ id: 'p0', to: 'p5', dur: 1.2 }, { id: 'p4', to: { x: 110, y: 175 }, dur: 1.5 }] },
    { say: 'Tagged people join the chain at either end. Only the two ENDS can tag.', states: { 0: 'it', 5: 'it', 6: 'it' }, moves: [{ id: 'p0', to: 'mid:5,6', dur: 1 }, { id: 'p5', to: 'p6', dur: 1.2 }, { id: 'p2', to: 'corner2', dur: 1.5 }, { id: 'p7', to: { x: 60, y: 100 }, dur: 1.5 }] },
    { say: 'Last person free wins and starts the next game as the chaser.', layout: 'row', states: { 0: 'it', 1: 'it', 2: 'it', 3: 'it', 4: 'it', 5: 'it', 6: 'it', 7: 'happy' }, moves: [{ id: 'p7', to: { x: 160, y: 85 }, dur: 1 }, { id: 'p7', bounce: true }], fx: ['confetti'] }
  ],
  'simon-says': [
    { say: 'Simon stands in front. Everyone else spreads out and watches.', people: 7, layout: 'row', states: { 0: 'host' }, labels: { 0: 'Simon' }, moves: [{ id: 'p0', to: { x: 160, y: 78 } }] },
    { say: '"Simon says hands up!" Everyone obeys.', states: { 0: 'shout', 1: 'hands', 2: 'hands', 3: 'hands', 4: 'hands', 5: 'hands', 6: 'hands' }, bubbles: { 0: 'Simon says!' }, moves: [{ id: 'p0', to: { x: 160, y: 78 } }] },
    { say: '"Hands down!" without "Simon says"? Anyone who obeys is out.', states: { 0: 'shout', 1: 'hands', 2: 'hands', 3: 'out', 4: 'hands', 5: 'hands', 6: 'hands' }, bubbles: { 0: 'Hands down!' }, moves: [{ id: 'p0', to: { x: 160, y: 78 } }], fx: ['stop'] },
    { say: 'Simon speeds up and mixes in tricks. The last player in is the next Simon.', states: { 0: 'host', 3: 'out', 1: 'out', 5: 'out', 4: 'happy' }, moves: [{ id: 'p0', to: { x: 160, y: 78 } }], fx: ['confetti'] }
  ],
  'musical-statues': [
    { say: 'One person runs the music and judges. Everyone else dances. No standing still!', people: 7, layout: 'scatter', states: { 0: 'host' }, labels: { 0: 'Judge' }, moves: [{ id: 'p0', to: 'corner' }, { id: 'p1', bounce: true }, { id: 'p2', shake: true }, { id: 'p3', bounce: true }, { id: 'p4', shake: true }, { id: 'p5', bounce: true }, { id: 'p6', shake: true }], fx: ['music'] },
    { say: 'Music stops: FREEZE in whatever pose you are in.', states: { 0: 'host', 1: 'hands', 3: 'hands', 5: 'hands' }, moves: [{ id: 'p0', to: 'corner' }], fx: ['stop'] },
    { say: 'The judge walks around. Move, laugh or wobble and you are out.', states: { 0: 'host', 1: 'hands', 3: 'hands', 5: 'hands', 4: 'out' }, moves: [{ id: 'p0', path: ['corner', 'p4', 'p2'], dur: 3 }, { id: 'p4', shake: true }] },
    { say: 'Music again. Last dancer standing wins.', states: { 0: 'host', 4: 'out', 2: 'out', 6: 'out', 3: 'happy' }, moves: [{ id: 'p0', to: 'corner' }, { id: 'p1', bounce: true }, { id: 'p3', bounce: true }, { id: 'p5', shake: true }], fx: ['music', 'confetti'] }
  ],
  'treasure-hunt': [
    { say: 'The host hides 6 to 8 clues, each pointing to the next, and a prize at the end.', people: 1, layout: 'row', states: { 0: 'host' }, props: [{ id: 'c1', type: 'paper', at: { x: 60, y: 100 } }, { id: 'c2', type: 'paper', at: { x: 250, y: 90 } }, { id: 'c3', type: 'paper', at: { x: 230, y: 180 } }, { id: 'gift', type: 'gift', at: { x: 50, y: 185 } }], moves: [{ id: 'p0', path: [{ x: 60, y: 125 }, { x: 250, y: 115 }, { x: 230, y: 185 }], dur: 3 }] },
    { say: 'Teams of 3 or 4. Each team gets the first clue.', people: 6, layout: 'teams', states: { 0: 'it', 3: 'it' }, labels: { 2: 'Team A', 5: 'Team B' }, props: [{ id: 'c1', type: 'paper', at: 'p0.hand' }, { id: 'c1b', type: 'paper', at: 'p3.hand' }] },
    { say: 'Each clue leads to the next spot. Found one? Put it back for the other teams!', props: [{ id: 'c2', type: 'paper', at: { x: 160, y: 80 } }], moves: [{ id: 'p0', path: ['p0', { x: 135, y: 95 }, 'p0'], dur: 3 }, { id: 'p1', path: ['p1', { x: 165, y: 110 }, 'p1'], dur: 3 }, { id: 'p2', path: ['p2', { x: 140, y: 135 }, 'p2'], dur: 3 }] },
    { say: 'Teams stay together, no splitting up. First team to the prize keeps it.', states: { 3: 'happy', 4: 'happy', 5: 'happy' }, props: [{ id: 'gift', type: 'gift', at: 'p4.hand' }], fx: ['confetti'] }
  ],
  'blind-mans-buff': [
    { say: 'Blindfold one player and spin them round three times.', people: 7, layout: 'circle', states: { 0: 'blind' }, moves: [{ id: 'p0', to: 'center' }, { id: 'p0', spin: true, dur: 3 }] },
    { say: 'Everyone else moves around quietly inside the area. Stay in bounds!', states: { 0: 'blind' }, moves: [{ id: 'p0', to: 'center' }, { id: 'p1', orbit: [1, 2], dur: 2.5, loop: true }, { id: 'p3', orbit: [3, 4], dur: 2.5, loop: true }, { id: 'p5', orbit: [5, 6], dur: 2.5, loop: true }] },
    { say: 'The blindfolded player tries to catch someone.', states: { 0: 'blind', 4: 'it' }, moves: [{ id: 'p0', path: ['center', 'mid:3,4', 'p4'], dur: 2.5 }, { id: 'p2', to: 'mid:1,2', dur: 1.5 }] },
    { say: 'Caught! Guess who it is by touching only head and shoulders. Right? Swap blindfolds.', states: { 0: 'blind', 4: 'it' }, bubbles: { 0: 'Priya?' }, moves: [{ id: 'p0', to: 'mid:3,4', dur: 0.5 }, { id: 'p4', to: 'mid:3,4', dur: 0.5 }] }
  ],
  'balloon-knees-relay': [
    { say: 'Teams line up. The first racer grips a balloon between their knees.', people: 6, layout: 'teams', labels: { 2: 'Team A', 5: 'Team B' }, props: [{ id: 'bA', type: 'balloon', at: 'p0' }, { id: 'bB', type: 'balloon', at: 'p3' }, { id: 'turn', type: 'line', at: { x: 160, y: 185 }, size: 0.8 }] },
    { say: 'Waddle to the turn line and back. No hands!', states: { 0: 'it', 3: 'it' }, props: [{ id: 'bA', type: 'balloon', at: 'p0' }, { id: 'bB', type: 'balloon', at: 'p3' }], moves: [{ id: 'p0', path: ['p0', { x: 150, y: 185 }, 'p0'], dur: 3 }, { id: 'bA', path: ['p0', { x: 150, y: 185 }, 'p0'], dur: 3 }, { id: 'p3', path: ['p3', { x: 170, y: 185 }, 'p3'], dur: 3.4 }, { id: 'bB', path: ['p3', { x: 170, y: 185 }, 'p3'], dur: 3.4 }] },
    { say: 'Pass the balloon to the next teammate knees to knees, no hands.', states: { 1: 'it' }, props: [{ id: 'bA', type: 'balloon', at: 'p0' }, { id: 'bB', type: 'balloon', at: 'p3' }], moves: [{ id: 'bA', to: 'p1', dur: 1.5 }] },
    { say: 'Drop it or burst it? Back to the start with a fresh balloon. First team done wins.', states: { 4: 'sad', 0: 'happy', 1: 'happy', 2: 'happy' }, props: [{ id: 'bB', type: 'balloon', at: 'p4' }], moves: [{ id: 'bB', pop: true, at: 1 }], fx: ['stop'] }
  ],
  'cup-stacking-relay': [
    { say: 'Ten cups per team at the far end. Teams line up at the start.', people: 6, layout: 'teams', labels: { 2: 'Team A', 5: 'Team B' }, props: [{ id: 'cA', type: 'cup', at: { x: 150, y: 185 } }, { id: 'cB', type: 'cup', at: { x: 175, y: 185 } }] },
    { say: 'Run to the cups and stack a pyramid: 4, 3, 2, 1.', states: { 0: 'it', 3: 'it' }, props: [{ id: 'cA', type: 'cup', at: { x: 150, y: 185 } }, { id: 'cB', type: 'cup', at: { x: 175, y: 185 } }, { id: 'pyr', type: 'stones', at: { x: 150, y: 185 } }], moves: [{ id: 'p0', to: { x: 125, y: 185 }, dur: 1 }, { id: 'p3', to: { x: 200, y: 185 }, dur: 1.2 }, { id: 'pyr', grow: true, dur: 2 }] },
    { say: 'Unstack into one column, run back, tag the next racer. A collapse must be rebuilt.', states: { 1: 'it' }, props: [{ id: 'cA', type: 'cup', at: { x: 150, y: 185 } }, { id: 'cB', type: 'cup', at: { x: 175, y: 185 } }], moves: [{ id: 'p0', path: [{ x: 125, y: 185 }, 'p0'], dur: 1.5 }, { id: 'p1', path: ['p1', { x: 125, y: 185 }], dur: 2.5 }] },
    { say: 'First team to finish all racers wins.', states: { 0: 'happy', 1: 'happy', 2: 'happy' }, props: [{ id: 'cA', type: 'cup', at: { x: 150, y: 185 } }, { id: 'cB', type: 'cup', at: { x: 175, y: 185 } }], fx: ['whistle', 'confetti'] }
  ],
  'hopping-race': [
    { say: 'Line up behind the start line, on one leg.', people: 5, layout: 'row', props: [{ id: 'start', type: 'line', at: { x: 160, y: 168 }, size: 0.8 }, { id: 'fin', type: 'line', at: { x: 160, y: 62 }, size: 0.8 }], moves: [{ id: 'p0', bounce: true }, { id: 'p1', bounce: true }, { id: 'p2', bounce: true }, { id: 'p3', bounce: true }, { id: 'p4', bounce: true }] },
    { say: 'On the whistle, hop to the finish.', props: [{ id: 'start', type: 'line', at: { x: 160, y: 168 }, size: 0.8 }, { id: 'fin', type: 'line', at: { x: 160, y: 62 }, size: 0.8 }], moves: [{ id: 'p0', to: { x: 76, y: 118 }, dur: 3 }, { id: 'p1', to: { x: 118, y: 125 }, dur: 3 }, { id: 'p2', to: { x: 160, y: 108 }, dur: 3 }, { id: 'p3', to: { x: 202, y: 128 }, dur: 3 }, { id: 'p4', to: { x: 244, y: 115 }, dur: 3 }, { id: 'p0', bounce: true }, { id: 'p1', bounce: true }, { id: 'p2', bounce: true }, { id: 'p3', bounce: true }, { id: 'p4', bounce: true }], fx: ['whistle'] },
    { say: 'Other foot touches the ground? Back to the start.', states: { 3: 'sad' }, props: [{ id: 'start', type: 'line', at: { x: 160, y: 168 }, size: 0.8 }, { id: 'fin', type: 'line', at: { x: 160, y: 62 }, size: 0.8 }], moves: [{ id: 'p0', to: { x: 76, y: 112 } }, { id: 'p1', to: { x: 118, y: 120 } }, { id: 'p2', to: { x: 160, y: 104 } }, { id: 'p4', to: { x: 244, y: 110 } }, { id: 'p3', path: [{ x: 202, y: 122 }, 'p3'], dur: 1.5 }], fx: ['stop'] },
    { say: 'First across the line wins.', states: { 2: 'happy' }, props: [{ id: 'fin', type: 'line', at: { x: 160, y: 62 }, size: 0.8 }], moves: [{ id: 'p0', to: { x: 76, y: 112 } }, { id: 'p1', to: { x: 118, y: 120 } }, { id: 'p2', to: { x: 160, y: 74 } }, { id: 'p4', to: { x: 244, y: 110 } }], fx: ['confetti'] }
  ],
  'over-under-relay': [
    { say: 'Teams stand in single file. One ball per team at the front.', people: 5, layout: 'row', states: { 0: 'it' }, props: [{ id: 'ball', type: 'ball', at: 'p0.hand' }] },
    { say: 'Pass it OVER your head to the person behind...', states: { 1: 'hands' }, props: [{ id: 'ball', type: 'ball', at: 'p0.head' }], moves: [{ id: 'ball', path: ['p0.head', 'p1.head', 'p1.hand'], dur: 1.5 }] },
    { say: '...then UNDER the legs to the next. Over, under, over, under.', props: [{ id: 'ball', type: 'ball', at: 'p1' }], moves: [{ id: 'ball', path: ['p1', 'p2', 'p3.head', 'p4.head', 'p4.hand'], dur: 3 }] },
    { say: 'Ball at the back? That person runs to the front and starts again.', states: { 4: 'it' }, props: [{ id: 'ball', type: 'ball', at: 'p4.hand' }], moves: [{ id: 'p4', path: ['p4', { x: 160, y: 85 }, { x: 40, y: 140 }], dur: 2.5 }, { id: 'ball', path: ['p4.hand', { x: 176, y: 75 }, { x: 56, y: 130 }], dur: 2.5 }] },
    { say: 'First team whose original leader is back at the front wins.', states: { 0: 'happy', 1: 'happy', 2: 'happy', 3: 'happy', 4: 'happy' }, props: [{ id: 'ball', type: 'ball', at: 'p0.hand' }], fx: ['confetti'] }
  ],
  'seven-stones': [
    { say: 'Stack seven stones in the middle. Knockers on one side, fielders on the other.', people: 6, layout: 'teams', labels: { 2: 'Knockers', 5: 'Fielders' }, props: [{ id: 'stack', type: 'stones', at: 'center' }, { id: 'ball', type: 'ball', at: 'p0.hand' }] },
    { say: 'A knocker throws the ball to knock the stack down. Three tries per team.', states: { 0: 'it' }, props: [{ id: 'stack', type: 'stones', at: 'center' }, { id: 'ball', type: 'ball', at: 'p0.hand' }], moves: [{ id: 'ball', to: 'center', dur: 1 }, { id: 'stack', fall: true, dur: 2 }] },
    { say: 'It fell! Knockers rush to rebuild while fielders grab the ball.', states: { 1: 'it', 2: 'it', 4: 'it' }, props: [{ id: 'ball', type: 'ball', at: { x: 190, y: 150 } }, { id: 's1', type: 'cup', at: { x: 150, y: 125 } }, { id: 's2', type: 'cup', at: { x: 170, y: 130 } }], moves: [{ id: 'p1', to: { x: 140, y: 140 }, dur: 1.2 }, { id: 'p2', to: { x: 175, y: 150 }, dur: 1.2 }, { id: 'p4', to: { x: 205, y: 165 }, dur: 1 }, { id: 'ball', to: { x: 220, y: 150 }, dur: 1.5 }] },
    { say: 'Fielders hit knockers below the knee to get them out.', states: { 4: 'it', 2: 'out', 1: 'it' }, props: [{ id: 'ball', type: 'ball', at: 'p4.hand' }, { id: 's1', type: 'cup', at: { x: 150, y: 125 } }], moves: [{ id: 'p1', to: { x: 140, y: 140 } }, { id: 'p2', to: { x: 175, y: 150 } }, { id: 'ball', to: { x: 175, y: 150 }, dur: 1 }] },
    { say: 'Stack rebuilt and "Pithu!" shouted? Knockers win. Otherwise fielders. Swap.', states: { 1: 'shout', 0: 'happy' }, bubbles: { 1: 'Pithu!' }, props: [{ id: 'stack', type: 'stones', at: 'center' }], moves: [{ id: 'p1', to: { x: 140, y: 140 } }], fx: ['confetti'] }
  ],
  'memory-chain': [
    { say: '"I went to the market and bought..." The first person names one item.', people: 7, layout: 'circle', states: { 0: 'it' }, bubbles: { 0: 'a mango' } },
    { say: 'The next person repeats the whole list in order, then adds one more.', states: { 1: 'it' }, bubbles: { 1: 'mango, soap' } },
    { say: 'Round it goes. The list gets longer every turn.', states: { 3: 'it' }, bubbles: { 3: 'mango, soap..' }, props: [{ id: 'n', type: 'text', text: '4 items', at: { x: 62, y: 44 } }] },
    { say: 'Forget an item or mix up the order and you are out. Last one remembering wins.', states: { 5: 'sad', 6: 'happy' }, bubbles: { 5: 'umm...' }, props: [{ id: 'n', type: 'text', text: '9 items', at: { x: 62, y: 44 } }], fx: ['stop'] }
  ],
  'name-place-animal-thing': [
    { say: 'Four columns on paper: Name, Place, Animal, Thing. Someone calls a letter.', people: 4, layout: 'row', states: { 0: 'host' }, props: [{ id: 'l', type: 'text', text: 'Letter: K', at: 'top' }, { id: 'pa', type: 'paper', at: 'p1.hand' }, { id: 'pb', type: 'paper', at: 'p2.hand' }, { id: 'pc', type: 'paper', at: 'p3.hand' }] },
    { say: 'Write one word starting with that letter in every column. Fast!', props: [{ id: 'l', type: 'text', text: 'Letter: K', at: 'top' }, { id: 'pa', type: 'paper', at: 'p1.hand' }, { id: 'pb', type: 'paper', at: 'p2.hand' }, { id: 'pc', type: 'paper', at: 'p3.hand' }], moves: [{ id: 'pa', shake: true }, { id: 'pb', shake: true }, { id: 'pc', shake: true }], fx: ['timer'] },
    { say: 'First to finish shouts "stop!" Everyone puts pens down.', states: { 2: 'shout' }, bubbles: { 2: 'STOP!' }, props: [{ id: 'pa', type: 'paper', at: 'p1.hand' }, { id: 'pb', type: 'paper', at: 'p2.hand' }, { id: 'pc', type: 'paper', at: 'p3.hand' }], fx: ['stop'] },
    { say: 'Unique answer 10 points, same as someone else 5, blank 0. Ten letters, then total.', bubbles: { 1: 'Kolkata', 3: 'Kolkata' }, states: { 2: 'happy' }, props: [{ id: 'sc', type: 'text', text: '10 / 5 / 5', at: 'top' }] }
  ],
  'who-am-i': [
    { say: 'Write a famous name on a slip and stick it on the forehead of the person on your left.', people: 6, layout: 'circle', props: [{ id: 'n0', type: 'paper', at: { x: 160, y: 42 }, size: 0.7 }, { id: 'n1', type: 'paper', at: { x: 262, y: 72 }, size: 0.7 }, { id: 'n2', type: 'paper', at: { x: 262, y: 132 }, size: 0.7 }, { id: 'n3', type: 'paper', at: { x: 160, y: 162 }, size: 0.7 }, { id: 'n4', type: 'paper', at: { x: 58, y: 132 }, size: 0.7 }, { id: 'n5', type: 'paper', at: { x: 58, y: 72 }, size: 0.7 }] },
    { say: 'Everyone can see your name except you. Ask yes-or-no questions about yourself.', states: { 2: 'it' }, bubbles: { 2: 'Am I alive?', 4: 'Yes!' }, props: [{ id: 'n2', type: 'text', text: 'Dhoni', at: { x: 262, y: 134 }, size: 0.8 }] },
    { say: 'A "yes" lets you ask again. A "no" passes the turn to the next player.', states: { 2: 'sad', 3: 'it' }, bubbles: { 2: 'A singer?', 1: 'No!' }, props: [{ id: 'n2', type: 'text', text: 'Dhoni', at: { x: 262, y: 134 }, size: 0.8 }] },
    { say: 'Guess whenever you like. Wrong guess ends your turn; right guess and you are done.', states: { 2: 'happy' }, bubbles: { 2: 'Am I Dhoni?' }, props: [{ id: 'n2', type: 'text', text: 'Dhoni', at: { x: 262, y: 134 }, size: 0.8 }], fx: ['confetti'] }
  ],
  'hum-the-song': [
    { say: 'Two teams. Team B secretly gives a song to a hummer from Team A.', people: 8, layout: 'teams', states: { 0: 'it' }, labels: { 3: 'Team A', 7: 'Team B' }, bubbles: { 4: 'Psst...' }, moves: [{ id: 'p0', to: 'center', dur: 1 }] },
    { say: 'Hum ONLY the tune. No words, no lip-syncing, no clapping the beat.', states: { 0: 'shout' }, bubbles: { 0: 'hmm hmm hmmm' }, moves: [{ id: 'p0', to: 'center', dur: 0.3 }], fx: ['music'] },
    { say: 'Team A has 60 seconds to name the song.', states: { 0: 'it' }, bubbles: { 1: 'Tum Hi Ho?', 2: 'Kal Ho Na Ho!' }, moves: [{ id: 'p0', to: 'center', dur: 0.3 }], fx: ['timer'] },
    { say: 'Right? A point for Team A. Wrong? Team B scores. First to 7 wins.', states: { 0: 'happy', 1: 'happy', 2: 'happy', 3: 'happy' }, props: [{ id: 'score', type: 'text', text: 'A 3 - B 2', at: 'top' }], fx: ['confetti'] }
  ],
  'bluff-cards': [
    { say: 'Deal the whole deck out. Everyone holds their cards hidden.', people: 5, layout: 'circle', props: [{ id: 'c0', type: 'paper', at: 'p0.hand', size: 0.8 }, { id: 'c1', type: 'paper', at: 'p1.hand', size: 0.8 }, { id: 'c2', type: 'paper', at: 'p2.hand', size: 0.8 }, { id: 'c3', type: 'paper', at: 'p3.hand', size: 0.8 }, { id: 'c4', type: 'paper', at: 'p4.hand', size: 0.8 }] },
    { say: 'Play cards face down and announce a rank: "two aces". You may be lying.', states: { 0: 'it' }, bubbles: { 0: 'Two aces' }, props: [{ id: 'pile', type: 'paper', at: 'center' }], moves: [{ id: 'pile', path: ['p0.hand', 'center'], dur: 1 }] },
    { say: 'The next player must claim the next rank up: "one two", "three threes"...', states: { 1: 'it' }, bubbles: { 1: 'Three twos' }, props: [{ id: 'pile', type: 'paper', at: 'center' }], moves: [{ id: 'pile', grow: true, dur: 1.5 }] },
    { say: 'Anyone can shout "bluff!" Flip the cards to check.', states: { 3: 'shout', 1: 'it' }, bubbles: { 3: 'BLUFF!' }, point: { 3: 1 }, props: [{ id: 'pile', type: 'paper', at: 'center' }], moves: [{ id: 'pile', spin: true, dur: 2 }] },
    { say: 'Liar takes the whole pile. If it was true, the challenger takes it. Empty hand wins.', states: { 1: 'sad', 3: 'happy' }, props: [{ id: 'pile', type: 'paper', at: 'center' }], moves: [{ id: 'pile', to: 'p1.hand', dur: 1.5 }] }
  ],
  'tambola': [
    { say: 'Draw a grid and write 15 numbers between 1 and 90. The caller holds the chits.', people: 6, layout: 'circle', states: { 0: 'host' }, labels: { 0: 'Caller' }, props: [{ id: 'bowl', type: 'bowl', at: 'p0.hand' }, { id: 't1', type: 'paper', at: 'p1.hand' }, { id: 't2', type: 'paper', at: 'p2.hand' }, { id: 't3', type: 'paper', at: 'p3.hand' }, { id: 't4', type: 'paper', at: 'p4.hand' }, { id: 't5', type: 'paper', at: 'p5.hand' }] },
    { say: 'The caller picks a chit and reads the number. Strike it off if you have it.', states: { 0: 'shout' }, bubbles: { 0: 'Four seven!' }, props: [{ id: 'bowl', type: 'bowl', at: 'p0.hand' }, { id: 'chit', type: 'chit', at: 'p0.head' }, { id: 't2', type: 'paper', at: 'p2.hand' }, { id: 't4', type: 'paper', at: 'p4.hand' }], moves: [{ id: 't2', shake: true }] },
    { say: 'Full row done? Shout "line!" Early Five is the first to strike any five numbers.', states: { 0: 'host', 3: 'shout' }, bubbles: { 3: 'LINE!' }, props: [{ id: 'bowl', type: 'bowl', at: 'p0.hand' }, { id: 't3', type: 'paper', at: 'p3.hand' }], moves: [{ id: 't3', bounce: true }] },
    { say: 'The caller checks every claim. All fifteen struck off: Full House wins the big prize.', states: { 0: 'host', 5: 'happy' }, bubbles: { 5: 'Full house!' }, props: [{ id: 'bowl', type: 'bowl', at: 'p0.hand' }, { id: 'gift', type: 'gift', at: 'p5.hand' }], fx: ['confetti'] }
  ],
  'guess-the-spice': [
    { say: 'Raid the kitchen: 8 to 10 spices in small bowls, hidden from view.', people: 2, layout: 'pair', states: { 0: 'host' }, props: [{ id: 'b1', type: 'bowl', at: { x: 60, y: 185 } }, { id: 'b2', type: 'bowl', at: { x: 95, y: 185 } }, { id: 'b3', type: 'bowl', at: { x: 130, y: 185 } }, { id: 'b4', type: 'bowl', at: { x: 165, y: 185 } }] },
    { say: 'Blindfold a player. Hold a bowl under their nose for five seconds.', states: { 0: 'host', 1: 'blind' }, props: [{ id: 'b1', type: 'bowl', at: 'p0.hand' }], moves: [{ id: 'b1', to: { x: 196, y: 102 }, dur: 1.5 }], fx: ['timer'] },
    { say: 'One guess only. No touching, no tasting.', states: { 0: 'host', 1: 'blind' }, bubbles: { 1: 'Cardamom!' }, props: [{ id: 'b1', type: 'bowl', at: { x: 196, y: 102 } }] },
    { say: 'Correct? A point. Everyone takes a turn with the bowls in a different order.', states: { 0: 'host', 1: 'happy' }, props: [{ id: 'ok', type: 'tick', at: 'p1.head' }, { id: 'sc', type: 'text', text: '3 / 8', at: 'top' }], fx: ['confetti'] }
  ],
  'mystery-bag': [
    { say: 'Ten household objects go into a cloth bag: spoon, key, onion, comb, coin...', people: 5, layout: 'circle', states: { 0: 'host' }, props: [{ id: 'bag', type: 'bowl', at: 'center', size: 1.3 }, { id: 'sp', type: 'spoon', at: { x: 140, y: 100 }, size: 0.7 }, { id: 'co', type: 'potato', at: { x: 180, y: 100 }, size: 0.7 }], moves: [{ id: 'sp', to: 'center', dur: 1.5 }, { id: 'co', to: 'center', dur: 1.5 }] },
    { say: 'Reach in without looking. Feel ONE object for ten seconds.', states: { 0: 'host', 2: 'it' }, props: [{ id: 'bag', type: 'bowl', at: 'center', size: 1.3 }], moves: [{ id: 'p2', to: 'mid:2,0', dur: 1 }], fx: ['timer'] },
    { say: 'Name it out loud, then pull it out to check.', states: { 0: 'host', 2: 'it' }, bubbles: { 2: 'A spoon!' }, props: [{ id: 'bag', type: 'bowl', at: 'center', size: 1.3 }, { id: 'sp', type: 'spoon', at: 'center' }], moves: [{ id: 'p2', to: 'mid:2,0', dur: 0.3 }, { id: 'sp', to: 'p2.hand', dur: 1.5 }] },
    { say: 'Correct: keep it as a point. Wrong: back in the bag. Most objects wins.', states: { 0: 'host', 2: 'happy' }, props: [{ id: 'bag', type: 'bowl', at: 'center', size: 1.3 }, { id: 'sp', type: 'spoon', at: 'p2.hand' }, { id: 'ok', type: 'tick', at: 'p2.head' }], fx: ['confetti'] }
  ],
  'wink-murder': [
    { say: 'The Detective steps away. Eyes closed, the host taps one person: the Murderer.', people: 8, layout: 'circle', states: { 1: 'sleep', 2: 'sleep', 3: 'sleep', 4: 'host', 5: 'sleep', 6: 'sleep', 7: 'sleep' }, labels: { 0: 'Detective', 4: 'Host' }, point: { 4: 6 }, moves: [{ id: 'p0', to: { x: 160, y: 66 } }] },
    { say: 'The Detective stands in the middle. Everyone chats and looks around.', states: { 0: 'it', 4: 'host' }, labels: { 0: 'Detective' }, moves: [{ id: 'p0', to: 'center', dur: 1.2 }], bubbles: { 2: 'Nice day', 5: 'So hot' } },
    { say: 'The Murderer winks secretly. Winked at? Wait a few seconds, then die dramatically.', states: { 0: 'it', 4: 'host', 6: 'mafia', 2: 'out' }, moves: [{ id: 'p0', to: 'center', dur: 0.3 }, { id: 'p2', fall: true, dur: 2 }] },
    { say: 'The Detective gets three accusations. Kill everyone first and the Murderer wins.', states: { 0: 'it', 4: 'host', 6: 'mafia', 2: 'out', 7: 'out' }, point: { 0: 6 }, bubbles: { 0: 'It is YOU!' }, moves: [{ id: 'p0', to: 'center', dur: 0.3 }], fx: ['confetti'] }
  ],
  'telephone-charades': [
    { say: 'Five players in a line, all facing away. The host shows the word to the first only.', people: 6, layout: 'row', states: { 0: 'host' }, props: [{ id: 'w', type: 'text', text: 'Elephant', at: 'top' }], moves: [{ id: 'p0', to: 'corner' }] },
    { say: 'Player one taps player two, who turns. Act it out silently. Nobody else may look.', states: { 0: 'host', 1: 'hands', 2: 'it' }, moves: [{ id: 'p0', to: 'corner' }, { id: 'p1', shake: true }] },
    { say: 'Player two acts what they THINK they saw to player three, and so on down the line.', states: { 0: 'host', 2: 'hands', 3: 'it' }, moves: [{ id: 'p0', to: 'corner' }, { id: 'p2', shake: true }] },
    { say: 'The last player says what it was. Reveal the original and laugh.', states: { 0: 'host', 5: 'shout' }, bubbles: { 5: 'A dancing cow?' }, props: [{ id: 'w', type: 'text', text: 'Elephant', at: 'top' }], moves: [{ id: 'p0', to: 'corner' }], fx: ['confetti'] }
  ],
  'charades': [
    { say: 'Two teams. The phone deals a word to one player.', people: 8, layout: 'teams', states: { 0: 'it' }, labels: { 3: 'Team A', 7: 'Team B' }, props: [{ id: 'ph', type: 'phone', at: 'p0.hand' }], moves: [{ id: 'p0', to: 'center', dur: 1 }] },
    { say: 'Act it out for your team. No speaking, no mouthing, no pointing at real objects.', states: { 0: 'hands' }, moves: [{ id: 'p0', to: 'center', dur: 0.3 }, { id: 'p0', shake: true }], fx: ['timer'] },
    { say: 'Your team has 60 seconds to guess.', states: { 0: 'hands' }, bubbles: { 1: 'Bird?', 2: 'Aeroplane!', 3: 'Flying?' }, moves: [{ id: 'p0', to: 'center', dur: 0.3 }], fx: ['timer'] },
    { say: 'Correct guess: one point. Alternate teams. First to 10 wins.', states: { 0: 'happy', 1: 'happy', 2: 'happy', 3: 'happy' }, props: [{ id: 'score', type: 'text', text: 'A 4 - B 3', at: 'top' }], fx: ['confetti'] }
  ],
  'pictionary': [
    { say: 'Two teams, paper and pen each. The phone deals the word to the drawer.', people: 8, layout: 'teams', states: { 0: 'it' }, labels: { 3: 'Team A', 7: 'Team B' }, props: [{ id: 'ph', type: 'phone', at: 'p0.hand' }, { id: 'pa', type: 'paper', at: 'center', size: 1.4 }] },
    { say: 'Draw it in 60 seconds. No letters, no numbers, no talking, no gestures.', states: { 0: 'it' }, props: [{ id: 'pa', type: 'paper', at: 'center', size: 1.4 }], moves: [{ id: 'p0', to: 'mid:0,4', dur: 0.8 }, { id: 'pa', shake: true }], fx: ['timer'] },
    { say: 'Your team shouts guesses while you draw.', states: { 0: 'it' }, bubbles: { 1: 'House?', 2: 'Temple!', 3: 'A box?' }, props: [{ id: 'pa', type: 'paper', at: 'center', size: 1.4 }], moves: [{ id: 'p0', to: 'mid:0,4', dur: 0.3 }], fx: ['timer'] },
    { say: 'Guessed in time: a point. Rotate drawers. First team to 8 wins.', states: { 0: 'happy', 1: 'happy', 2: 'happy', 3: 'happy' }, props: [{ id: 'score', type: 'text', text: 'A 5 - B 4', at: 'top' }], fx: ['confetti'] }
  ],
  'taboo': [
    { say: 'The describer holds the phone. One rival sits beside them to watch for forbidden words.', people: 8, layout: 'teams', states: { 0: 'it', 4: 'mafia' }, labels: { 0: 'Describer', 4: 'Watcher' }, props: [{ id: 'ph', type: 'phone', at: 'p0.hand' }], moves: [{ id: 'p0', to: { x: 125, y: 125 }, dur: 1 }, { id: 'p4', to: { x: 200, y: 125 }, dur: 1 }] },
    { say: 'Explain the word without saying it or any of the five forbidden words.', states: { 0: 'shout', 4: 'mafia' }, bubbles: { 0: 'Round, sweet' }, props: [{ id: 'card', type: 'text', text: 'JALEBI', at: 'top' }], moves: [{ id: 'p0', to: { x: 125, y: 125 }, dur: 0.3 }, { id: 'p4', to: { x: 200, y: 125 }, dur: 0.3 }], fx: ['timer'] },
    { say: 'No gestures, no "sounds like", no spelling. Slip up? The watcher buzzes, card lost.', states: { 0: 'sad', 4: 'shout' }, bubbles: { 0: '...fried' }, props: [{ id: 'buzz', type: 'text', text: 'BUZZ!', at: { x: 240, y: 70 } }], moves: [{ id: 'p0', to: { x: 125, y: 125 }, dur: 0.3 }, { id: 'p4', to: { x: 200, y: 125 }, dur: 0.3 }, { id: 'p4', shake: true }], fx: ['stop'] },
    { say: 'Count correct cards in 60 seconds. Alternate teams; highest after three rounds wins.', states: { 1: 'happy', 2: 'happy', 3: 'happy' }, props: [{ id: 'score', type: 'text', text: 'A 6 - B 5', at: 'top' }], fx: ['confetti'] }
  ],
  'heads-up': [
    { say: 'Hold the phone on your forehead, screen facing the others. You cannot see it.', people: 4, layout: 'row', states: { 1: 'it' }, props: [{ id: 'ph', type: 'phone', at: 'p1.head' }], moves: [{ id: 'p1', to: { x: 160, y: 195 }, dur: 1 }, { id: 'ph', to: { x: 160, y: 160 }, dur: 1 }] },
    { say: 'Everyone else shouts clues without saying the word itself.', states: { 1: 'it', 0: 'shout', 2: 'shout', 3: 'shout' }, bubbles: { 0: 'Big, grey!', 2: 'Long nose!' }, props: [{ id: 'ph', type: 'phone', at: { x: 160, y: 160 } }, { id: 'w', type: 'text', text: 'Elephant', at: 'top' }], moves: [{ id: 'p1', to: { x: 160, y: 195 }, dur: 0.3 }], fx: ['timer'] },
    { say: 'Guessed right? A friend taps Correct. Stuck? Tap Pass.', states: { 1: 'happy', 2: 'it' }, bubbles: { 1: 'Elephant!' }, props: [{ id: 'ph', type: 'phone', at: { x: 160, y: 160 } }, { id: 'ok', type: 'tick', at: { x: 196, y: 160 } }], moves: [{ id: 'p1', to: { x: 160, y: 195 }, dur: 0.3 }] },
    { say: '60 seconds per turn. Then pass the phone to the next player. Highest score wins.', states: { 2: 'it' }, props: [{ id: 'ph', type: 'phone', at: 'p2.head' }, { id: 'sc', type: 'text', text: 'Score: 7', at: 'top' }], fx: ['confetti'] }
  ],
  'where-are-we': [
    { say: 'Everyone sees the same place on the phone, except the spy, who sees only "Imposter".', people: 6, layout: 'circle', states: { 4: 'mafia' }, props: [{ id: 'ph', type: 'phone', at: 'p0.hand' }, { id: 'w', type: 'text', text: 'Hospital', at: { x: 62, y: 44 } }] },
    { say: 'Take turns asking each other about the place without naming it.', states: { 4: 'mafia', 1: 'it' }, bubbles: { 1: 'Wear here?', 2: 'White coat' } },
    { say: 'Answers must prove you know it, but stay vague enough to keep the spy guessing.', states: { 4: 'mafia' }, bubbles: { 4: 'Umm... shoes' }, moves: [{ id: 'p4', shake: true }] },
    { say: 'After eight minutes, everyone votes on the spy.', states: { 4: 'mafia' }, point: { 0: 4, 1: 4, 2: 4, 3: 4, 5: 4 }, fx: ['timer'] },
    { say: 'Caught? The spy still wins by naming the location correctly.', states: { 4: 'it' }, bubbles: { 4: 'Hospital!' }, fx: ['confetti'] }
  ],
  'broken-telephone': [
    { say: 'Sit in a line. The first person thinks of a long, slightly odd sentence.', people: 7, layout: 'row', states: { 0: 'it' }, bubbles: { 0: 'Purple cows..' } },
    { say: 'Whisper it ONCE into the next ear. No repeating, no matter what.', states: { 0: 'it', 1: 'it' }, moves: [{ id: 'p0', to: 'mid:0,1', dur: 1 }] },
    { say: 'Each person passes on exactly what they heard, down the line.', states: { 3: 'it', 4: 'it' }, moves: [{ id: 'p3', to: 'mid:3,4', dur: 1 }] },
    { say: 'The last person says it out loud. Then the first reveals the original.', states: { 6: 'shout', 0: 'happy' }, bubbles: { 6: 'Purple cars?', 0: 'Purple cows!' }, fx: ['confetti'] }
  ],
  'raja-mantri-chor-sipahi': [
    { say: 'Groups of four. Four folded chits: Raja 1000, Mantri 800, Sipahi 500, Chor 0.', people: 4, layout: 'circle', props: [{ id: 'c1', type: 'chit', at: { x: 145, y: 120 } }, { id: 'c2', type: 'chit', at: { x: 175, y: 115 } }, { id: 'c3', type: 'chit', at: { x: 150, y: 140 } }, { id: 'c4', type: 'chit', at: { x: 178, y: 138 } }] },
    { say: 'Toss them in the middle. Everyone grabs one and reads it secretly.', props: [{ id: 'c1', type: 'chit', at: { x: 145, y: 120 } }, { id: 'c2', type: 'chit', at: { x: 175, y: 115 } }, { id: 'c3', type: 'chit', at: { x: 150, y: 140 } }, { id: 'c4', type: 'chit', at: { x: 178, y: 138 } }], moves: [{ id: 'c1', to: 'p0.hand', dur: 1.2 }, { id: 'c2', to: 'p1.hand', dur: 1.2 }, { id: 'c3', to: 'p2.hand', dur: 1.2 }, { id: 'c4', to: 'p3.hand', dur: 1.2 }] },
    { say: 'The Raja announces themselves and orders the Mantri to find the Chor.', states: { 0: 'host', 1: 'it' }, labels: { 0: 'Raja', 1: 'Mantri' }, bubbles: { 0: 'Mantri, find!' }, props: [{ id: 'c3', type: 'chit', at: 'p2.hand' }, { id: 'c4', type: 'chit', at: 'p3.hand' }] },
    { say: 'The Mantri watches the other two faces and names one as the Chor.', states: { 0: 'host', 1: 'it', 2: 'mafia' }, labels: { 0: 'Raja', 1: 'Mantri' }, point: { 1: 3 }, bubbles: { 1: 'You!' }, props: [{ id: 'c3', type: 'chit', at: 'p2.hand' }, { id: 'c4', type: 'chit', at: 'p3.hand' }] },
    { say: 'Right: everyone keeps their points. Wrong: Mantri and Chor swap. Ten rounds, total up.', states: { 0: 'host', 1: 'sad', 2: 'happy', 3: 'it' }, labels: { 1: 'Mantri 0', 3: 'Sipahi 500' }, bubbles: { 2: 'Chor: 800!' }, props: [{ id: 'sc', type: 'text', text: 'Wrong!', at: 'top' }], fx: ['stop'] }
  ],
  'human-knot': [
    { say: 'Stand in a tight circle, shoulder to shoulder.', people: 6, layout: 'circle', moves: [{ id: 'p0', to: { x: 160, y: 85 } }, { id: 'p1', to: { x: 200, y: 105 } }, { id: 'p2', to: { x: 200, y: 150 } }, { id: 'p3', to: { x: 160, y: 170 } }, { id: 'p4', to: { x: 120, y: 150 } }, { id: 'p5', to: { x: 120, y: 105 } }] },
    { say: 'Reach in and grab two different hands. Not the people next to you!', states: { 0: 'hands', 1: 'hands', 2: 'hands', 3: 'hands', 4: 'hands', 5: 'hands' }, point: { 0: 3, 1: 4, 2: 5 }, moves: [{ id: 'p0', to: { x: 160, y: 85 } }, { id: 'p1', to: { x: 200, y: 105 } }, { id: 'p2', to: { x: 200, y: 150 } }, { id: 'p3', to: { x: 160, y: 170 } }, { id: 'p4', to: { x: 120, y: 150 } }, { id: 'p5', to: { x: 120, y: 105 } }] },
    { say: 'Without letting go, untangle by stepping over and under arms.', states: { 0: 'hands', 1: 'hands', 2: 'hands', 3: 'hands', 4: 'hands', 5: 'hands' }, moves: [{ id: 'p0', path: [{ x: 160, y: 85 }, { x: 130, y: 120 }], dur: 2.5 }, { id: 'p3', path: [{ x: 160, y: 170 }, { x: 190, y: 130 }], dur: 2.5 }, { id: 'p1', to: { x: 200, y: 105 } }, { id: 'p2', to: { x: 200, y: 150 } }, { id: 'p4', to: { x: 120, y: 150 } }, { id: 'p5', to: { x: 120, y: 105 } }], fx: ['timer'] },
    { say: 'Let go at any point and you start again. Time it and beat your own record.', states: { 0: 'happy', 1: 'happy', 2: 'happy', 3: 'happy', 4: 'happy', 5: 'happy' }, props: [{ id: 't', type: 'text', text: '1:42', at: { x: 62, y: 44 } }], fx: ['confetti'] }
  ],
  'rps-evolution': [
    { say: 'Everyone starts as an Egg: crouch and waddle. Levels: Egg, Chicken, Dinosaur, Human.', people: 8, layout: 'scatter', labels: { 0: 'Egg', 1: 'Egg', 2: 'Egg', 3: 'Egg', 4: 'Egg', 5: 'Egg', 6: 'Egg', 7: 'Egg' }, moves: [{ id: 'p0', bounce: true }, { id: 'p3', bounce: true }, { id: 'p5', bounce: true }] },
    { say: 'Find someone at YOUR level and play rock paper scissors.', states: { 2: 'it', 6: 'it' }, labels: { 2: 'Egg', 6: 'Egg' }, bubbles: { 2: 'Rock!', 6: 'Paper!' }, moves: [{ id: 'p2', to: { x: 138, y: 138 }, dur: 1 }, { id: 'p6', to: { x: 184, y: 138 }, dur: 1 }, { id: 'p2', shake: true }, { id: 'p6', shake: true }] },
    { say: 'Winner evolves one level up. Loser drops one level. Eggs stay Eggs.', states: { 6: 'happy', 2: 'sad' }, labels: { 6: 'Chicken', 2: 'Egg' }, moves: [{ id: 'p2', to: { x: 138, y: 138 }, dur: 0.3 }, { id: 'p6', to: { x: 184, y: 138 }, dur: 0.3 }, { id: 'p6', bounce: true }] },
    { say: 'A Human who wins is finished and cheers from the side. Last Egg standing is the hero.', states: { 1: 'hands', 4: 'hands', 7: 'happy' }, labels: { 1: 'Human', 4: 'Human', 7: 'Last Egg' }, moves: [{ id: 'p1', to: 'corner' }, { id: 'p4', to: 'corner2' }, { id: 'p7', to: 'center', dur: 1 }, { id: 'p7', bounce: true }], fx: ['confetti'] }
  ],
  'balloon-stomp': [
    { say: 'Tie a balloon to each ankle with a short string. Stay inside the boundary.', people: 6, layout: 'scatter', props: [{ id: 'b0', type: 'balloon', at: 'p0', size: 0.7 }, { id: 'b1', type: 'balloon', at: 'p1', size: 0.7 }, { id: 'b2', type: 'balloon', at: 'p2', size: 0.7 }, { id: 'b3', type: 'balloon', at: 'p3', size: 0.7 }, { id: 'b4', type: 'balloon', at: 'p4', size: 0.7 }, { id: 'b5', type: 'balloon', at: 'p5', size: 0.7 }] },
    { say: 'On the whistle: stomp on other balloons while protecting your own.', states: { 1: 'it' }, props: [{ id: 'b0', type: 'balloon', at: 'p0', size: 0.7 }, { id: 'b1', type: 'balloon', at: 'p1', size: 0.7 }, { id: 'b2', type: 'balloon', at: 'p2', size: 0.7 }, { id: 'b3', type: 'balloon', at: 'p3', size: 0.7 }, { id: 'b4', type: 'balloon', at: 'p4', size: 0.7 }, { id: 'b5', type: 'balloon', at: 'p5', size: 0.7 }], moves: [{ id: 'p1', to: 'p3', dur: 1.5 }, { id: 'b1', to: 'p3', dur: 1.5 }, { id: 'b3', pop: true, at: 1.6 }], fx: ['whistle'] },
    { say: 'No hands to block or hold anyone. Burst? You are out, step outside.', states: { 3: 'out', 1: 'it' }, props: [{ id: 'b0', type: 'balloon', at: 'p0', size: 0.7 }, { id: 'b1', type: 'balloon', at: 'p1', size: 0.7 }, { id: 'b2', type: 'balloon', at: 'p2', size: 0.7 }, { id: 'b4', type: 'balloon', at: 'p4', size: 0.7 }, { id: 'b5', type: 'balloon', at: 'p5', size: 0.7 }], moves: [{ id: 'p3', to: 'corner2', dur: 1.5 }, { id: 'p4', to: 'p0', dur: 1.5 }, { id: 'b4', to: 'p0', dur: 1.5 }, { id: 'b0', pop: true, at: 1.6 }] },
    { say: 'Last balloon intact wins, or whoever survives the two-minute timer.', states: { 3: 'out', 0: 'out', 2: 'out', 4: 'out', 5: 'happy' }, props: [{ id: 'b5', type: 'balloon', at: 'p5', size: 0.7 }], moves: [{ id: 'p5', bounce: true }], fx: ['timer', 'confetti'] }
  ],
  'hot-potato': [
    { say: 'Circle up with any small object. Start the Random Stop tool on the phone.', people: 8, layout: 'circle', states: { 0: 'host' }, props: [{ id: 'ph', type: 'phone', at: 'p0.hand' }, { id: 'pot', type: 'potato', at: 'p1.hand' }] },
    { say: 'Pass it round as fast as you can. Never hold it more than a second.', props: [{ id: 'pot', type: 'potato', at: 'p1' }], moves: [{ id: 'pot', orbit: [1, 7], dur: 1.6, loop: true }], states: { 0: 'host' } },
    { say: 'No throwing across the circle. Hand to hand only.', props: [{ id: 'pot', type: 'potato', at: 'p3' }], moves: [{ id: 'pot', orbit: [3, 1], dur: 2, loop: true }], states: { 0: 'host' } },
    { say: 'Phone beeps! Whoever is holding it is out. Last one left wins.', states: { 0: 'host', 5: 'out' }, props: [{ id: 'pot', type: 'potato', at: 'p5.hand' }], moves: [{ id: 'pot', shake: true }], fx: ['stop'] }
  ],
  'human-bingo': [
    { say: 'Each sheet has a 3x3 grid of traits: has a pet, can whistle, hates coriander...', people: 8, layout: 'scatter', states: { 0: 'host' }, props: [{ id: 'pa', type: 'paper', at: 'p1.hand' }, { id: 'pb', type: 'paper', at: 'p3.hand' }, { id: 'pc', type: 'paper', at: 'p5.hand' }, { id: 'pd', type: 'paper', at: 'p7.hand' }], moves: [{ id: 'p0', to: 'corner2' }] },
    { say: 'Ten-minute timer. Walk around and find a different person for each square.', states: { 0: 'host', 3: 'it' }, bubbles: { 3: 'Got a pet?', 4: 'Yes, a goat' }, props: [{ id: 'pb', type: 'paper', at: 'p3.hand' }], moves: [{ id: 'p0', to: 'corner2' }, { id: 'p3', to: 'mid:3,4', dur: 1.2 }, { id: 'pb', to: 'mid:3,4', dur: 1.2 }], fx: ['timer'] },
    { say: 'They sign the square. One person may sign only ONE square on your sheet.', states: { 0: 'host', 4: 'it' }, props: [{ id: 'pb', type: 'paper', at: 'p4.hand' }, { id: 'ok', type: 'tick', at: 'p4.head' }], moves: [{ id: 'p0', to: 'corner2' }, { id: 'p3', to: 'mid:3,4', dur: 0.3 }] },
    { say: 'Full sheet? Shout "bingo!" The host checks the signatures.', states: { 0: 'host', 7: 'shout' }, bubbles: { 7: 'BINGO!' }, props: [{ id: 'pd', type: 'paper', at: 'p7.hand' }], moves: [{ id: 'p0', to: 'corner2' }, { id: 'pd', bounce: true }], fx: ['confetti'] }
  ],
  'lip-sync-battle': [
    { say: 'Everyone secretly picks a song they know by heart. The phone picks who goes first.', people: 7, layout: 'row', states: { 0: 'host' }, props: [{ id: 'pick', type: 'text', text: 'Priya!', at: 'top' }], moves: [{ id: 'p0', to: 'corner' }] },
    { say: 'Play the song. Lip-sync with full dance and drama for one minute.', states: { 0: 'host', 3: 'hands' }, moves: [{ id: 'p0', to: 'corner' }, { id: 'p3', to: { x: 160, y: 95 }, dur: 1 }, { id: 'p3', bounce: true }], fx: ['music', 'timer'] },
    { say: 'No real singing! The mouth must match the words.', states: { 0: 'host', 3: 'shout' }, moves: [{ id: 'p0', to: 'corner' }, { id: 'p3', to: { x: 160, y: 95 }, dur: 0.3 }, { id: 'p3', shake: true }], fx: ['music'] },
    { say: 'The audience scores 1 to 10 with fingers. Highest total wins; ties go to a dance-off.', states: { 0: 'host', 3: 'happy', 1: 'hands', 2: 'hands', 4: 'hands', 5: 'hands', 6: 'hands' }, bubbles: { 1: '9!', 5: '10!' }, moves: [{ id: 'p0', to: 'corner' }, { id: 'p3', to: { x: 160, y: 95 }, dur: 0.3 }], fx: ['confetti'] }
  ],
  'count-to-twenty': [
    { say: 'Sit in a circle. Close your eyes or face outward so nobody can see anyone.', people: 7, layout: 'circle', states: { 0: 'sleep', 1: 'sleep', 2: 'sleep', 3: 'sleep', 4: 'sleep', 5: 'sleep', 6: 'sleep' } },
    { say: 'Anyone may say "one". Anyone may say the next number. No signals, no order.', states: { 0: 'sleep', 1: 'sleep', 2: 'shout', 3: 'sleep', 4: 'sleep', 5: 'sleep', 6: 'sleep' }, bubbles: { 2: 'One' } },
    { say: 'Nobody may speak twice in a row.', states: { 0: 'sleep', 1: 'sleep', 2: 'sleep', 3: 'sleep', 4: 'sleep', 5: 'shout', 6: 'sleep' }, bubbles: { 5: 'Two' }, props: [{ id: 'n', type: 'text', text: '2', at: 'center' }] },
    { say: 'Two people speak at once? Back to one.', states: { 0: 'sleep', 1: 'shout', 2: 'sleep', 3: 'sleep', 4: 'shout', 5: 'sleep', 6: 'sleep' }, bubbles: { 1: 'Three', 4: 'Three' }, fx: ['stop'] },
    { say: 'Reach twenty and the whole group wins. Then try it faster.', states: { 0: 'happy', 1: 'happy', 2: 'happy', 3: 'happy', 4: 'happy', 5: 'happy', 6: 'happy' }, props: [{ id: 'n', type: 'text', text: '20!', at: 'center' }], fx: ['confetti'] }
  ]
};
