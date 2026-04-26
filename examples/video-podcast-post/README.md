# Fixture — Video / Podcast Post

Demonstrates audio/video embed support via `media.yaml` + an optional `transcript.md`. Adapters that support media (Hugo, Ghost) render the embed inline; adapters that don't (plain markdown) fall back to a link with duration label and append the transcript.

## What's here

```text
video-podcast-post/
└── 01_POSTS/
    └── 2026-04-26-screencast/
        ├── body.md            ← canonical body
        ├── media.yaml         ← audio/video declaration (validated against media.schema.json)
        ├── transcript.md      ← transcript (linked or inlined per adapter)
        ├── markdown.md        ← markdown adapter target
        └── hugo.md            ← Hugo adapter target (supports media shortcodes)
```

## What it demonstrates

- `media.yaml` declaring an external-host audio reference (URL, duration, thumbnail)
- Transcript file for accessibility / readability
- Hugo adapter renders an `{{< audio >}}` shortcode at the top of the body
- Markdown adapter falls back to a link with the duration

## Important

**Media files themselves live OUTSIDE the repo.** `media.yaml.url` references an external host (anchor.fm, YouTube, your own CDN). The repo stays small; the media stays where media tooling expects it.
