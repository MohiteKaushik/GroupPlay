# Getting PlayAnywhere onto Google Play

From "code on my PC" to "live on the Play Store", in order. Expect about **three to four weeks**, almost all of it waiting: Google's first review, then the compulsory 14-day test, then the production review.

What Google wants is a file ending in **`.aab`** (Android App Bundle). You never build it on your PC. GitHub builds it for you every time you push.

## How the app is put together (one paragraph)

The Android app is a small native shell (`android/`, one screen, no third-party libraries) with the whole website copied inside it, so it opens instantly and works with no internet. The website and the app are the same code. A room hosted in the app can be joined from the website and the other way round. Changing a game, a rule or a colour means editing the same files as before; the app picks the change up at its next build.

---

## Step 0 — Two decisions that are hard to undo

**The website address.** Join links and QR codes printed by the app point at the website (`joinBase` in `js/config.js`, currently `https://whatweplay.netlify.app`). Every installed copy of the app keeps using the address it was built with, and Netlify does not redirect an old site name to a new one. If you are going to rename the Netlify site, **do it now**, then change `joinBase`, then continue. The same address goes into the Play listing as the privacy policy URL.

**The name.** "Xbox Play Anywhere" is an active Microsoft games programme. A games app called PlayAnywhere may get a trademark complaint, and Google acts on those by removing the app. This is a legal judgement, not a technical one, and not one to take from an AI: search the Play Store and the Indian trademark register (ipindia.gov.in, class 9 and 41) for the name before you commit. The display name can be changed later in one place (`android/app/src/main/res/values/strings.xml` plus the listing). **The package ID `com.ospjnprojects.playanywhere` can never be changed after the first upload.** If you want a different one, change it in `android/app/build.gradle` (two lines), the folder path under `android/app/src/main/java/`, the first line of `MainActivity.java`, `privacy.html` and `.well-known/assetlinks.json` before Step 3.

## Step 1 — Push everything to GitHub

First, a one-time step. The build recipe that GitHub runs has to live in a special folder, `.github/workflows/`, and that folder is one place the assistant that prepared this project is not allowed to write. The file is waiting in `android/ci/`. Put it in place yourself, in a terminal in this folder:

```
mkdir .github\workflows
copy android\ci\android.yml .github\workflows\android.yml
```

(If you ever change one copy, change the other. Only the one in `.github/workflows/` is used by GitHub.)

Then:

```
node tools/release.js
git add .
git status
```

Look at the `git status` list. **`android/keys/` must not appear in it.** That folder holds your signing key and its password and is deliberately ignored. If you see it listed, stop and do not commit.

```
git commit -m "Android app"
git push
```

Netlify redeploys the website from the same push (this also publishes `privacy.html`, which Google requires).

## Step 2 — Give GitHub the signing key (once)

Google only accepts uploads signed with your **upload key**. It was generated on this PC and lives in `android/keys/`:

- `upload-keystore.jks` — the key itself
- `GITHUB-SECRETS.txt` — its password, and the key encoded as text for GitHub

**Back both files up now** (a USB stick, or a password manager). They are in your OneDrive folder already, which counts as one copy. If you lose them, Google can reset the key through Play Console support, but it takes days.

On GitHub: your repository → **Settings → Secrets and variables → Actions → New repository secret**. Create four secrets, copying each name and value from `GITHUB-SECRETS.txt`:

| Name | Value |
|---|---|
| `UPLOAD_KEY_ALIAS` | `upload` |
| `UPLOAD_KEYSTORE_PASSWORD` | the password line |
| `UPLOAD_KEY_PASSWORD` | the same password |
| `UPLOAD_KEYSTORE_BASE64` | the one very long line at the bottom (all of it, no spaces before or after) |

Secrets cannot be read back by anyone, including you, and are not visible in a public repository.

## Step 3 — Build the app

GitHub → **Actions** tab → **Android app** → **Run workflow** (or just push any change). After about five minutes the run turns green. Open it, scroll to **Artifacts**, download `PlayAnywhere-<version>`. Unzip it. Inside:

- `PlayAnywhere-<version>.aab` → this goes to Google Play
- `PlayAnywhere-<version>.apk` → this installs directly on a phone, for your own testing

If the run is red, open it, click the failed step, and send me the last 30 lines of the log. The build has not been run before today (see "What has and has not been tested" at the end).

## Step 4 — Try the APK on a real phone first

Send the `.apk` to your phone (WhatsApp to yourself, or USB), tap it, allow "install unknown apps" when asked. Then check, on at least two phones if you can, one of them old or cheap:

1. It opens to "What shall we play?" with the header clear of the clock and battery icons.
2. Find a game → answer the four questions → open a game → the animation plays; tap the speaker and it reads the caption aloud and waits for the voice before moving on.
3. Host tools → Timer → start it and leave the phone alone: the screen must stay on and the alarm must sound.
4. The phone's Back button goes to the previous screen, and from the first screen leaves the app.
5. Type in a name field: the keyboard must not cover what you are typing.
6. Turn on aeroplane mode, close the app completely, open it again: everything except Play together still works.
7. Play together → Host a room on mobile data. On a second phone, scan the QR with the camera: the website opens and joins the room. Play a round of Quick Vote across the two.
8. Switch the phone to dark mode and reopen the app.

Uninstall this test copy before installing from the Play Store later. Google re-signs the Play version with its own key, and Android refuses to install one over the other.

## Step 5 — Play Console: create the app

1. Go to https://play.google.com/console. Finish anything the account home page still asks for (identity verification, phone number, and verifying that you own an Android device through the Play Console mobile app). Nothing can be published until that says complete.
2. **Create app.** Name: `PlayAnywhere: Party Games`. Default language: English. **Game**. **Free**. Tick the two declarations.
3. Work down the **Dashboard → Set up your app** list. Every answer is written out in `store/listing.md`: privacy policy URL, app access, ads, content rating, target audience, data safety, advertising ID.
4. **Store presence → Main store listing:** paste the texts and upload the images from `store/`.

## Step 6 — Internal testing (optional, takes an hour, do it)

**Test and release → Testing → Internal testing → Create new release.**

- The first time, Play asks about **Play App Signing**. Accept the default (Google manages the app signing key). Your upload key from Step 2 stays what you sign uploads with.
- Upload the `.aab`. Release name fills itself in. Paste the release notes from `store/listing.md`. Save → Review release → Start rollout.
- **Testers** tab → create an email list with your own Gmail and one or two others → copy the opt-in link → open it on your phone → install from Play.

Internal testing has no review wait. It proves the upload, the signing and the Play install all work before the 14-day clock matters. It does **not** count towards the 12-tester requirement.

### Make join links open the app (five minutes, after the first upload)

**Test and release → App integrity → App signing.** Copy the **SHA-256 certificate fingerprint** of the *App signing key certificate*. Open `.well-known/assetlinks.json` and add it as a second entry in `sha256_cert_fingerprints` (keep the one already there, which is your upload key and makes the test APK work):

```json
"sha256_cert_fingerprints": [
  "AA:A4:0D:51:...the one already there...",
  "PASTE:THE:PLAY:ONE:HERE"
]
```

Push. From then on, someone with the app who scans a room QR lands in the app; someone without it lands on the website. Both join the same room. Until you do this, everyone lands on the website, which still works.

## Step 7 — Closed testing: the 12 testers for 14 days

This rule applies to every personal developer account created after 13 November 2023.

1. **Testing → Closed testing → Create track** (or use the default "Alpha" track) → **Countries/regions:** add India and anywhere else your testers live.
2. **Testers:** create an email list. Add the Gmail address each tester uses on their phone's Play Store. Recruit **15 to 20 people, not 12.**
3. **Create new release** → "Add from library" → pick the bundle you already uploaded → roll out. This first one goes to Google for review; allow up to a week.
4. When it is approved, send testers the opt-in link (the message to send is in `store/listing.md`). Each tester must open the link on their phone, tap **Become a tester**, and install from the Play Store.

What actually counts:

- At least **12 testers opted in at the same time for 14 days in a row.** The Dashboard shows the count and the day.
- A tester who leaves the test and rejoins starts their own count again. Tell them to leave it installed.
- **Positive feedback is not required.** When you apply for production Google asks how you collected feedback, what testers said and what you changed. Real use matters: testers who never open the app can get the application sent back with "keep testing".
- So during the fortnight: ask people to actually play (one family evening does it), keep a short note of what they said, and **publish at least one update** to the closed track in response. An update does not reset the 14 days.

## Step 8 — Apply for production

When the Dashboard shows the requirement met: **Dashboard → Apply for production.** Three short sections. Answer plainly and specifically:

- *About your closed test:* how you recruited (family, friends, a WhatsApp group), how they used the app (which games, how many sessions), how you collected feedback.
- *About your app:* who it is for (families and friend groups deciding what to play, often with poor internet), what makes it useful (works offline, one phone is enough, mixed-age filtering), expected installs in year one (choose the honest low range).
- *Production readiness:* what you changed because of the test, and why you believe it is ready.

Review usually takes up to seven days. Once approved: **Production → Create new release → Add from library → choose countries → roll out.** The first production release is reviewed again, typically a day or two. Then it is public.

## Updating the app afterwards

```
node tools/release.js
git add . && git commit -m "what changed" && git push
```

Netlify updates the website at once. GitHub builds a new `.aab`; download it from Actions and upload it as a new release on the track you want (Play needs each upload to have a higher version code, which `release.js` takes care of: `2026.11.22-1` becomes `26112201`). Website users get changes immediately; app users get them when they update from the Play Store.

Once a year Google raises the minimum "target API level". When Play Console warns about it, the change is the two numbers `compileSdk` and `targetSdk` in `android/app/build.gradle`, plus a test on a phone running that Android version.

---

## What has and has not been tested

Tested here, automatically:

- The Java source type-checks against the Android classes it uses; every XML file parses; the build script's version and site-address logic runs under Gradle 8.14.
- The website running exactly as it does inside the app (same bundled files, same internal address, native bridge simulated): narration waits for the voice, the timer keeps the screen awake, sharing uses the share sheet, the privacy page opens from inside the app, no service worker is used.
- An app user and a website user in the same room, playing a round together; opening the app from a join link; automatic deletion of old rooms.
- The full website regression (wizard, tools, Mafia, Imposter, offline) and the ten-player online test.

**Not tested, because the environment this was written in cannot download Google's Android SDK or run a phone:**

- The Gradle build itself. Its first run is on GitHub in Step 3.
- The app on a real device. That is Step 4, and the eight checks there are exactly the places a WebView app can differ from a browser.

Until Step 4 passes on a real phone, treat the app as unproven.
