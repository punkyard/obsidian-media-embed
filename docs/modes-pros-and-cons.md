# Media Embed — mode comparison

> **TL;DR:** Use `md` for clean notes (works with **all** videos), `iframe` for a quick player, `div` for the most robust responsive embed (especially Shorts).

| Mode | Pros | Cons |
|---|---|---|
| `md` | Markdown-native output; clean note source; easy to edit and copy; works in normal preview; **displays all videos** — no embed restrictions since it links to YouTube directly | Not a true responsive embed; depends on viewer support; may render as a static image or broken embed in some environments; portrait Shorts can look poor |
| `iframe` | Simple HTML embed; generally renders as a video player; good for desktop preview and standard embed contexts | Less responsive for portrait Shorts; can show black bars in tall videos; may be stripped or blocked by some markdown renderers or mobile webviews; **some YouTube videos block embedding** (Error 153) — use [alternative server](#alternative-embed-server) to bypass |
| `div` | Responsive wrapper around iframe; best for variable widths and portrait Shorts; more robust in pane-based layouts and responsive layouts | Most verbose HTML output; more complex source; still depends on renderer accepting iframes; CSS support must be sufficient; **same embed restriction risk** as `iframe` |

## Edge cases that should guide your mode choice

### When to choose `md`

- You want notes that stay markdown-first and easy to read/edit.
- You mainly use desktop Obsidian preview or note-taking where markdown embedding is enough.
- **You want to guarantee every YouTube video displays** — md bypasses embed restrictions entirely.
- You do not need perfect responsive sizing for portrait Shorts.
- Use this if you prefer cleaner source and are willing to accept that some renderers may show a static image or may treat the embed differently.

### When to choose `iframe`

- You want a straight HTML video player and don't mind raw iframe code.
- You are mostly on desktop and want a fast, predictable embed.
- Use this if your environment supports iframes and you don't need the extra responsive wrapper.
- If some videos show a blank player, toggle the [alternative embed server](#alternative-embed-server) in settings.
- Avoid this if you need portrait Shorts to display without black bars or if your renderer may strip iframe tags.

### When to choose `div`

- You need the best compatibility for responsive layouts and portrait Shorts.
- You want the strongest layout handling inside Obsidian panes or narrow mobile views.
- Use this if you're okay with more verbose HTML source in exchange for better sizing.
- If some videos show a blank player, toggle the [alternative embed server](#alternative-embed-server) in settings.
- This is usually the safest HTML mode if `iframe` alone is too brittle in your renderer.

### Alternative embed server

Some YouTube videos have embedding disabled by the uploader. When pasted in `iframe` or `div` mode, they show a blank player (YouTube Error 153).

Enable **Use alternative embed server** in **Settings → Media Embed** to route embeds through an [Invidious](https://invidious.io) instance instead. Invidious proxies YouTube's stream without embed restrictions — all videos play inline.

⚠️ Alternative servers may load slower than YouTube's official CDN. Toggle off when you don't need it.

### Specific edge-case signals

- If you paste `shorts` URLs often, `div` is safer than `iframe` for portrait video sizing.
- If you want to support `youtu.be/`, `/shorts/`, `/embed/`, and canonical `watch?v=` links consistently, pick the mode that suits your rendering expectations, not just the URL shape.
- If you see iOS/webview permissions or iframe stripping warnings, prefer `md` or test `div` carefully.
- If `shortsWidth` is a setting, make sure it includes `%` when using `div` or `iframe` for Shorts.
- If you need the cleanest note source and the embed is only for personal note-taking, `md` is the least risky.
- If you need a reliable visual player and are willing to tolerate HTML, `div` is generally the better choice than plain `iframe`.
