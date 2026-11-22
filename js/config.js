/* Site configuration. The same file ships in the website and inside the Android app.
 *
 * relayUrl: where live rooms are stored. Either
 *   - your Firebase Realtime Database URL, e.g. 'https://something-default-rtdb.asia-southeast1.firebasedatabase.app'
 *   - or a relay server (tools/relay.js), e.g. 'http://192.168.43.1:8787' on a hotspot, or a hosted one.
 *   Leave it empty and "Play together" is switched off.
 *
 * joinBase: the public address of the website. Join links and QR codes point here, so a player
 *   without the app lands on the website and still joins the same room. It is also the address the
 *   Android app claims as its own (see android/app/build.gradle), so it MUST be final before the
 *   first Play Store upload: installed apps keep printing whatever is written here.
 */
window.GP_CONFIG = {
  relayUrl: 'https://groupplay-5d2ca-default-rtdb.asia-southeast1.firebasedatabase.app',
  joinBase: 'https://whatweplay.netlify.app'
};
