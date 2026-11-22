package com.ospjnprojects.playanywhere;

import android.annotation.SuppressLint;
import android.annotation.TargetApi;
import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.content.pm.ApplicationInfo;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowInsets;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.RenderProcessGoneDetail;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.TextView;
import android.window.OnBackInvokedCallback;
import android.window.OnBackInvokedDispatcher;

import org.json.JSONObject;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

/**
 * The whole app: one screen that shows the PlayAnywhere website from files bundled inside the app.
 *
 * <ul>
 *   <li>The site lives in {@code assets/www} (copied there by {@code tools/sync-android.js}) and is served
 *       to the web view under {@link #APP_ORIGIN}, so it loads instantly and works with no network.</li>
 *   <li>{@link Bridge} gives the page the three things Android's embedded web engine lacks: text to speech,
 *       keeping the screen on, and the share sheet. The page side is {@code js/native.js}.</li>
 *   <li>Links to anywhere else open in the phone's browser; nothing but our own files ever runs here.</li>
 * </ul>
 */
public class MainActivity extends Activity {

    /** A host name reserved by Google for apps serving their own files to a web view; it never reaches the network. */
    private static final String APP_HOST = "appassets.androidplatform.net";
    private static final String APP_ORIGIN = "https://" + APP_HOST;
    private static final String START_URL = APP_ORIGIN + "/index.html";
    private static final String ASSET_ROOT = "www";
    /** Fragment of a join link: https://site/#/join/ABC123 */
    private static final String JOIN_FRAGMENT = "/join/[A-Za-z0-9]{6}";

    private static final Map<String, String> MIME_TYPES = new HashMap<>();

    static {
        MIME_TYPES.put("html", "text/html");
        MIME_TYPES.put("css", "text/css");
        MIME_TYPES.put("js", "text/javascript");
        MIME_TYPES.put("json", "application/json");
        MIME_TYPES.put("webmanifest", "application/manifest+json");
        MIME_TYPES.put("svg", "image/svg+xml");
        MIME_TYPES.put("png", "image/png");
        MIME_TYPES.put("jpg", "image/jpeg");
        MIME_TYPES.put("webp", "image/webp");
        MIME_TYPES.put("ico", "image/x-icon");
        MIME_TYPES.put("txt", "text/plain");
    }

    private FrameLayout root;
    private WebView webView;

    private TextToSpeech tts;
    private boolean ttsReady;
    private boolean ttsFailed;
    /** An utterance requested before the speech engine finished starting: {text, id}. */
    private String[] pendingSpeech;

    // ------------------------------------------------------------------------------------ lifecycle

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        root = new FrameLayout(this);
        root.setBackgroundColor(getColor(R.color.app_bg));
        setContentView(root, new ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        keepClearOfSystemBars(root);

        try {
            webView = new WebView(this);
        } catch (RuntimeException e) {
            // The system web engine is missing or mid-update. Rare, but a crash here would look like a broken app.
            showWebViewMissing();
            return;
        }
        configureWebView(webView);
        root.addView(webView, new FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT));

        if (Build.VERSION.SDK_INT >= 33) {
            Api33.interceptBack(this, this::handleBack);
        }

        webView.loadUrl(startUrlFor(getIntent()));
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        String join = joinFragmentOf(intent);
        if (join != null && webView != null) {
            // Already running: move to the join screen without reloading the page.
            webView.evaluateJavascript("location.hash = " + JSONObject.quote("#" + join) + ";", null);
        }
    }

    @Override
    protected void onStart() {
        super.onStart();
        if (webView != null) webView.onResume();
    }

    @Override
    protected void onStop() {
        if (webView != null) webView.onPause(); // tells the page it is hidden (timers and narration pause themselves)
        super.onStop();
    }

    @Override
    protected void onDestroy() {
        if (tts != null) {
            tts.stop();
            tts.shutdown();
            tts = null;
        }
        if (webView != null) {
            root.removeView(webView);
            webView.destroy();
            webView = null;
        }
        super.onDestroy();
    }

    /** Back on Android 12 and older. Newer versions go through {@link Api33#interceptBack}. */
    @Override
    @SuppressWarnings("deprecation")
    public void onBackPressed() {
        handleBack();
    }

    /** Back goes to the previous screen inside the app; from the first screen it leaves the app. */
    private void handleBack() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            finish();
        }
    }

    // --------------------------------------------------------------------------------- deep links

    private String startUrlFor(Intent intent) {
        String join = joinFragmentOf(intent);
        return join != null ? START_URL + "#" + join : START_URL;
    }

    /** Returns "/join/CODE" when the app was opened from a join link or QR code, otherwise null. */
    private static String joinFragmentOf(Intent intent) {
        if (intent == null || !Intent.ACTION_VIEW.equals(intent.getAction())) return null;
        Uri data = intent.getData();
        if (data == null) return null;
        String fragment = data.getFragment();
        return fragment != null && fragment.matches(JOIN_FRAGMENT) ? fragment : null;
    }

    // ------------------------------------------------------------------------------------ web view

    @SuppressLint("SetJavaScriptEnabled")
    private void configureWebView(WebView view) {
        WebSettings settings = view.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);          // bookmarks, scores and settings live in localStorage
        settings.setMediaPlaybackRequiresUserGesture(false); // the timer alarm must sound without a tap
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setSupportZoom(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);

        view.setBackgroundColor(getColor(R.color.app_bg));
        view.setOverScrollMode(View.OVER_SCROLL_NEVER);
        view.setWebViewClient(new AppWebViewClient());
        view.setWebChromeClient(new WebChromeClient());
        view.addJavascriptInterface(new Bridge(), "GPNative");

        boolean debuggable = (getApplicationInfo().flags & ApplicationInfo.FLAG_DEBUGGABLE) != 0;
        WebView.setWebContentsDebuggingEnabled(debuggable); // chrome://inspect works on debug builds only
    }

    private final class AppWebViewClient extends WebViewClient {

        @Override
        public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
            Uri url = request.getUrl();
            if (!APP_HOST.equals(url.getHost())) return null; // e.g. the live-rooms database: use the network
            return openAsset(url.getPath());
        }

        @Override
        public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
            Uri url = request.getUrl();
            if (APP_HOST.equals(url.getHost())) return false; // our own pages stay here
            openInBrowser(url);
            return true;
        }

        @Override
        @TargetApi(26)
        public boolean onRenderProcessGone(WebView view, RenderProcessGoneDetail detail) {
            // The web engine's process was killed (low memory) or crashed. Without this the whole app dies;
            // with it the screen is rebuilt and the page reloads. Games in progress are kept by the page itself.
            if (webView != null) {
                root.removeView(webView);
                webView.destroy();
                webView = null;
            }
            recreate();
            return true;
        }
    }

    /** Serves one file from assets/www. Anything missing, or any attempt to climb out of the folder, is a 404. */
    private WebResourceResponse openAsset(String path) {
        if (path == null || path.isEmpty() || "/".equals(path)) path = "/index.html";
        Map<String, String> headers = new HashMap<>();
        headers.put("Cache-Control", "no-store"); // after an app update the new files must be used straight away
        if (path.contains("..") || path.contains("//")) return notFound(headers);
        int dot = path.lastIndexOf('.');
        String extension = dot >= 0 ? path.substring(dot + 1).toLowerCase(Locale.ROOT) : "";
        String mime = MIME_TYPES.get(extension);
        if (mime == null) mime = "application/octet-stream";
        boolean isText = mime.startsWith("text/") || mime.endsWith("json") || mime.endsWith("+xml");
        try {
            InputStream in = getAssets().open(ASSET_ROOT + path);
            return new WebResourceResponse(mime, isText ? "utf-8" : null, 200, "OK", headers, in);
        } catch (IOException e) {
            return notFound(headers);
        }
    }

    private static WebResourceResponse notFound(Map<String, String> headers) {
        return new WebResourceResponse("text/plain", "utf-8", 404, "Not Found", headers, new ByteArrayInputStream(new byte[0]));
    }

    private void openInBrowser(Uri url) {
        String scheme = url.getScheme();
        if (!"https".equals(scheme) && !"http".equals(scheme) && !"mailto".equals(scheme)) return;
        try {
            startActivity(new Intent(Intent.ACTION_VIEW, url));
        } catch (ActivityNotFoundException ignored) {
            // No browser or mail app installed: nothing sensible to do.
        }
    }

    private void showWebViewMissing() {
        TextView message = new TextView(this);
        message.setText(R.string.webview_missing);
        message.setTextSize(18);
        message.setGravity(Gravity.CENTER);
        int pad = Math.round(32 * getResources().getDisplayMetrics().density);
        message.setPadding(pad, pad, pad, pad);
        root.addView(message, new FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT));
    }

    // ------------------------------------------------------------------------------- system bars

    /**
     * From Android 15 the app is drawn behind the status and navigation bars. Pad the content by whatever
     * the system reports (bars, camera cut-out, on-screen keyboard) so nothing is hidden. On older versions
     * the system already keeps the app clear of the bars and reports nothing, so this pads by zero.
     */
    @SuppressWarnings("deprecation")
    private static void keepClearOfSystemBars(View content) {
        content.setOnApplyWindowInsetsListener((view, insets) -> {
            if (Build.VERSION.SDK_INT >= 30) {
                return Api30.padBy(view, insets);
            }
            view.setPadding(insets.getSystemWindowInsetLeft(), insets.getSystemWindowInsetTop(),
                    insets.getSystemWindowInsetRight(), insets.getSystemWindowInsetBottom());
            return insets.consumeSystemWindowInsets();
        });
    }

    // ------------------------------------------------------------------------------------- speech

    private void speak(String text, String id) {
        if (ttsFailed) {
            notifyPage("tts", id, "error");
            return;
        }
        if (tts == null) {
            pendingSpeech = new String[]{text, id};
            // post(), not a direct call: when no speech engine is installed Android reports the failure from
            // inside the constructor, before `tts` has been assigned.
            tts = new TextToSpeech(getApplicationContext(), status -> root.post(() -> onTtsInit(status)));
            return;
        }
        if (!ttsReady) { // still starting: the newest request wins
            if (pendingSpeech != null) notifyPage("tts", pendingSpeech[1], "error");
            pendingSpeech = new String[]{text, id};
            return;
        }
        int result = tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, id);
        if (result != TextToSpeech.SUCCESS) notifyPage("tts", id, "error");
    }

    private void onTtsInit(int status) {
        if (tts == null) return; // the screen was closed while the engine was starting
        if (status != TextToSpeech.SUCCESS) {
            ttsFailed = true;
            if (pendingSpeech != null) notifyPage("tts", pendingSpeech[1], "error");
            pendingSpeech = null;
            return;
        }
        // Indian English when the phone has it, otherwise whatever English it has, otherwise its default voice.
        int language = tts.setLanguage(Locale.forLanguageTag("en-IN"));
        if (language == TextToSpeech.LANG_MISSING_DATA || language == TextToSpeech.LANG_NOT_SUPPORTED) {
            tts.setLanguage(Locale.US);
        }
        tts.setSpeechRate(0.95f);
        tts.setOnUtteranceProgressListener(new UtteranceProgressListener() {
            @Override
            public void onStart(String utteranceId) {
            }

            @Override
            public void onDone(String utteranceId) {
                notifyPage("tts", utteranceId, "end");
            }

            @Override
            @SuppressWarnings("deprecation")
            public void onError(String utteranceId) {
                notifyPage("tts", utteranceId, "error");
            }

            @Override
            public void onStop(String utteranceId, boolean interrupted) {
                notifyPage("tts", utteranceId, "stopped");
            }
        });
        ttsReady = true;
        if (pendingSpeech != null) {
            String[] next = pendingSpeech;
            pendingSpeech = null;
            speak(next[0], next[1]);
        }
    }

    /** Calls window.GP_onNative(kind, id, event) in the page. Safe from any thread. */
    private void notifyPage(String kind, String id, String event) {
        String script = "window.GP_onNative && window.GP_onNative(" + JSONObject.quote(kind) + "," + JSONObject.quote(id) + "," + JSONObject.quote(event) + ");";
        runOnUiThread(() -> {
            if (webView != null) webView.evaluateJavascript(script, null);
        });
    }

    // -------------------------------------------------------------------------------------- bridge

    /**
     * Methods the page can call as {@code GPNative.name(...)}. They arrive on a background thread, so each one
     * hops to the main thread before touching anything. Only our bundled files can reach this object, because
     * no other page is ever loaded in the web view.
     */
    private final class Bridge {

        @JavascriptInterface
        public void speak(String text, String id) {
            if (text == null || id == null) return;
            final String clipped = text.length() > 600 ? text.substring(0, 600) : text;
            runOnUiThread(() -> MainActivity.this.speak(clipped, id));
        }

        @JavascriptInterface
        public void stopSpeaking() {
            runOnUiThread(() -> {
                pendingSpeech = null;
                if (tts != null && ttsReady) tts.stop();
            });
        }

        @JavascriptInterface
        public void keepAwake(boolean on) {
            runOnUiThread(() -> {
                if (on) getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
                else getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
            });
        }

        @JavascriptInterface
        public void share(String title, String text, String url) {
            runOnUiThread(() -> {
                String body = (text == null || text.isEmpty() ? "" : text + "\n") + (url == null ? "" : url);
                Intent send = new Intent(Intent.ACTION_SEND);
                send.setType("text/plain");
                send.putExtra(Intent.EXTRA_SUBJECT, title);
                send.putExtra(Intent.EXTRA_TEXT, body);
                try {
                    startActivity(Intent.createChooser(send, title));
                } catch (ActivityNotFoundException ignored) {
                    // No app can receive text: nothing to do.
                }
            });
        }
    }

    // -------------------------------------------------------- version-specific code, kept apart
    // Each helper touches classes that only exist from that Android version on. Keeping them in their own
    // nested classes means older phones never load them.

    @TargetApi(30)
    private static final class Api30 {
        static WindowInsets padBy(View view, WindowInsets insets) {
            android.graphics.Insets bars = insets.getInsets(
                    WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout() | WindowInsets.Type.ime());
            view.setPadding(bars.left, bars.top, bars.right, bars.bottom);
            return WindowInsets.CONSUMED;
        }
    }

    @TargetApi(33)
    private static final class Api33 {
        static void interceptBack(Activity activity, Runnable onBack) {
            OnBackInvokedCallback callback = onBack::run;
            activity.getOnBackInvokedDispatcher().registerOnBackInvokedCallback(OnBackInvokedDispatcher.PRIORITY_DEFAULT, callback);
        }
    }
}
