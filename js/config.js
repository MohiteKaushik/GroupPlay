/* Site configuration. The only file you need to edit to turn multiplayer on. See MULTIPLAYER.md.
 *
 * relayUrl: where live rooms are stored. Either
 *   - your Firebase Realtime Database URL, e.g. 'https://groupplay-12345-default-rtdb.asia-southeast1.firebasedatabase.app'
 *   - or a GroupPlay relay server (tools/relay.js), e.g. 'http://192.168.43.1:8787' on a hotspot, or a hosted one.
 * Leave it empty and the site works exactly as before, minus the "Play together online" section.
 */
window.GP_CONFIG = {
  relayUrl: 'https://groupplay-5d2ca-default-rtdb.asia-southeast1.firebasedatabase.app',
  // Players open this address to join; leave empty to use the address this page was loaded from.
  joinBase: ''
};
