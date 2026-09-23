# url_to_markdown_links

Turn bare URLs in a note into titled markdown links. Paste a list of links, run
the command, and each one becomes `[Page Title](https://…)`.

## Setup: turn off automatic link shortening first

**This command needs Antinote's link shortening switched off.** Open
**Settings → Editor → Links** and set **Shorten long links automatically** to
**Off**. (Leave *Detect and highlight links* on if you like — only the
shortening toggle matters.)

With shortening on, Antinote stores the note text with the URL already replaced
by a shortened form and keeps the full address in a separate link record. What
this command reads back is therefore something like:

```
+antinote.io/...user-manual+
```

There is no scheme and no complete address in that text, so the command finds
nothing it can convert and reports "No bare URLs found".

Turn the setting off **before you paste** the URLs you want linked. Flipping the
setting off does not rewrite notes that are already shortened — the shortened
text stays in the note — so paste those URLs again to get the full address back
into the note.

## Command

### `url_to_markdown_links(max_links?)`

| Parameter | Type | Required | Default | Meaning |
|---|---|---|---|---|
| `max_links` | int | no | `25` | Stop after this many URLs. Every URL costs one or two network requests. |

Command type is `replaceAll`: the whole note is replaced with the converted
version, and the notification reports what happened.

## Examples

```
::url_to_markdown_links
```
Converts every bare URL in the note, up to 25.

```
::url_to_markdown_links(5)
```
Converts only the first five, leaving the rest as plain text. Use this when you
have pasted a long list and want to check the output before committing to it.

A before and after:

```
Read https://en.wikipedia.org/wiki/Note-taking today
Read https://example.org/12345 today
```
becomes
```
Read [Note-taking](https://en.wikipedia.org/wiki/Note-taking) today
Read [Thinking in Systems](https://example.org/12345) today
```

## How a title is chosen

Three sources, in order, each one a fallback for the last:

1. **The URL path**, which is free and never fails. `/blog/the-art-of-note-taking`
   becomes `The Art Of Note Taking`. A path with nothing readable in it —
   `/12345`, `/?id=7`, or a hash — falls through.
2. **The page's `<title>`, or its `og:title`** if there is no title tag. Values
   are HTML-decoded and clipped to 80 characters.
3. **A DuckDuckGo search for the URL**, which sidesteps paywalls, bot walls, and
   soft 404s. JSTOR stable IDs get a JSTOR-specific query, because searching the
   ID finds the citation where fetching the page does not.

A URL is left exactly as it was if all three fail, and the notification says how
many were skipped and which ones. No URL is ever deleted or guessed at.

## What it deliberately leaves alone

- URLs that already have a title — `[Label](https://…)`, `<https://…>`, and
  `[Label][ref]`. The visible label is preserved untouched.
- Trailing sentence punctuation: `see https://example.com/page.` links the URL
  without the period.
- Balanced parentheses inside a URL are kept, so a Wikipedia link ending in
  `(letter)` stays intact.

## Notes and caveats

- **Data scope is `full`.** The command reads the entire note and replaces the
  entire note. Nothing is sent anywhere except the URLs themselves.
- **Antinote's link shortening must be off.** With it on, the note text holds the
  shortened form of each URL rather than the address, and the command cannot see
  anything to convert. Turn it off under Settings → Editor → Links.
- **The note goes over the network, one request per URL.** The extension fetches
  each URL to read its title, so it contacts the sites in your note, and falls
  back to DuckDuckGo when a page does not cooperate. Nothing else leaves the
  machine, and no API key is required.
- **No API key setup.** The extension uses no keys, so there is nothing to
  configure in Settings → Extensions → API Keys.
- The command makes up to two requests per URL and stops at `max_links`. On a
  note with a hundred links, pass a small number first.

## Errors you may see

| Notification | Meaning |
|---|---|
| "This note is empty." | There was no text to scan. |
| "No bare URLs found" | Every URL already has a title, or there were none. The note is unchanged. If you expected links here, check that link shortening is off — see the setup section above. |
| "could not fetch any titles" | The URLs were found but no title could be resolved. The note is unchanged. |
| "Left N unlinked" | Partial success. The named URLs stayed as plain text. |

## Development

From the root of the community repository:

```sh
npm install
npm run validate         # metadata, disclosures, data scope, version sync
npm run test             # everything CI runs
npm run calculate-sizes  # refreshes the "size" block in extension.json
```

The same tests run against the standalone Antinote extension harness, which is
handy when the repository is not checked out:

```sh
node <antinote-extensions-skill>/scripts/scaffold.js test .
node <antinote-extensions-skill>/scripts/scaffold.js check .
```

Tests stub the network on both seams — `global.__callAPI` for the standalone
harness and the runner's own `callAPI` for the repository runner — so no test
touches the real network. Unrouted URLs fail on purpose: a test that forgets to
route a URL breaks visibly instead of passing silently.
