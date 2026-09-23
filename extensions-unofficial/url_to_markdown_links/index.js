// url_to_markdown_links — turn bare URLs in a note into [title](url) links.
//
// Ported from a Drafts script. Everything the Drafts runtime provided has been
// replaced with the Antinote equivalents:
//
//   draft.content / draft.update()  ->  payload.fullText / a replaceAll payload
//   HTTP.create().request()         ->  callAPI("", url, "GET", headers, "")
//   app.displayInfoMessage()        ->  ReturnObject({message})
//   script.complete()               ->  returning from execute
//
// The extension is deliberately self-contained: no require, no fetch, no DOM.
// The only globals it touches are the ones Antinote injects.

// A plain function expression on purpose: at top level in a non-strict script
// `this` is the global object, which is the only fallback that works when the
// host does not name it `global` (JavaScriptCore does not).
(function () {
  const extensionName = "url_to_markdown_links";
  const globalScope =
    typeof global !== "undefined" ? global : typeof window !== "undefined" ? window : this;

  const DEFAULT_MAX_LINKS = 25;

  // -------------------------------------------------------------------------
  // Shared helpers
  //
  // Single-file extension, so nothing else consumes this namespace; it exists
  // so index.test.js can reach the pure helpers directly.
  // -------------------------------------------------------------------------
  if (typeof globalScope.__EXTENSION_SHARED__ === "undefined") {
    globalScope.__EXTENSION_SHARED__ = {};
  }
  const shared = globalScope.__EXTENSION_SHARED__;
  const helpers = (shared[extensionName] = shared[extensionName] || {});

  const USER_AGENT =
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
    "(KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36";

  const HTML_HEADERS = JSON.stringify({
    "User-Agent": USER_AGENT,
    Accept: "text/html,application/xhtml+xml"
  });

  const SEARCH_ENDPOINT = "https://html.duckduckgo.com/html/";

  // Titles that mean "this page did not really answer". Rejecting these is what
  // pushes a URL into the search fallback.
  const GENERIC_TITLES = [
    "jstor home",
    "jstor",
    "page not found",
    "404",
    "access denied",
    "forbidden",
    "just a moment",
    "attention required",
    "are you a robot",
    "error",
    "untitled"
  ];

  // -------------------------------------------------------------------------
  // Text utilities
  // -------------------------------------------------------------------------

  function decodeHtmlEntities(text) {
    if (typeof text !== "string") {
      return "";
    }
    return text
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#0?39;/g, "'")
      .replace(/&apos;/g, "'")
      .replace(/&nbsp;/g, " ")
      .replace(/&#8217;/g, "\u2019")
      .replace(/&#8216;/g, "\u2018")
      .replace(/&#8220;/g, "\u201c")
      .replace(/&#8221;/g, "\u201d")
      .replace(/&#8211;/g, "\u2013")
      .replace(/&#8212;/g, "\u2014")
      .replace(/&mdash;/g, "\u2014")
      .replace(/&ndash;/g, "\u2013");
  }

  function titleCase(text) {
    return text
      .split(" ")
      .map(function (word) {
        if (!word) {
          return word;
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(" ");
  }

  function clip(text, maxLength) {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength - 3) + "...";
  }

  function isGibberish(text) {
    // A hash, an object id, or a DOI-ish number string. Never a human title.
    if (/^[a-f0-9]+$/i.test(text) && text.length > 10) {
      return true;
    }
    if (/^\d+(\.\d+){2,}/.test(text)) {
      return true;
    }
    const letters = (text.match(/[a-z]/gi) || []).length;
    const digits = (text.match(/\d/g) || []).length;
    if (digits > letters && text.length > 6) {
      return true;
    }
    return false;
  }

  function isGenericTitle(title) {
    const lower = String(title).trim().toLowerCase();
    if (!lower) {
      return true;
    }
    for (let i = 0; i < GENERIC_TITLES.length; i++) {
      const generic = GENERIC_TITLES[i];
      if (lower === generic || lower.indexOf(generic) !== -1) {
        return true;
      }
    }
    return false;
  }

  // -------------------------------------------------------------------------
  // URL parsing
  // -------------------------------------------------------------------------

  function parseUrl(url) {
    const match = String(url).match(/^(https?):\/\/([^\/?#]+)([^?#]*)(\?[^#]*)?(#.*)?$/i);
    if (!match) {
      return null;
    }
    return {
      scheme: match[1].toLowerCase(),
      host: match[2].toLowerCase(),
      path: match[3] || "",
      query: match[4] || "",
      fragment: match[5] || ""
    };
  }

  function isHttpUrl(url) {
    return /^https?:\/\//i.test(String(url));
  }

  function hostTokens(host) {
    const withoutPort = String(host).replace(/:\d+$/, "");
    const parts = withoutPort.split(".");
    const tokens = {};
    for (let i = 0; i < parts.length; i++) {
      const token = parts[i];
      if (token && token !== "www" && token !== "com" && token !== "org" && token !== "net") {
        tokens[token] = true;
      }
    }
    return tokens;
  }

  // Short labels that sit next to a bare domain and mean "no real page here".
  const SITE_TITLE_SUFFIXES = [
    "home",
    "homepage",
    "home page",
    "official site",
    "official website",
    "website",
    "site"
  ];

  // A page that answers 200 with a soft-404 still returns a title — usually
  // just the publisher's name, sometimes with "Home" glued on. Those are worth
  // a search fallback. A real headline that merely starts with the site name
  // ("CNN: Something Happened") is not this, so keep the rule narrow: the
  // title must collapse to the domain word alone, or that word plus a suffix.
  function isBareSiteTitle(title, host) {
    const lower = String(title).trim().toLowerCase();
    if (!lower || lower.length > 40) {
      return false;
    }

    const names = Object.keys(hostTokens(host));
    if (!names.length) {
      return false;
    }

    // "Example.com" collapses to "examplecom", so drop a trailing TLD the same
    // way the domain itself would.
    const collapsed = lower
      .replace(/\.(com|org|net|io|co|edu|gov|dev|app|ai)\b/g, "")
      .replace(/[^a-z0-9]/g, "");
    if (!collapsed) {
      return false;
    }

    for (let i = 0; i < names.length; i++) {
      const name = names[i];
      if (collapsed === name) {
        return true;
      }
      for (let j = 0; j < SITE_TITLE_SUFFIXES.length; j++) {
        const suffix = SITE_TITLE_SUFFIXES[j].replace(/ /g, "");
        if (collapsed === name + suffix || collapsed === suffix + name) {
          return true;
        }
      }
    }

    return false;
  }

  // -------------------------------------------------------------------------
  // Title from the URL itself
  // -------------------------------------------------------------------------

  function extractTitleFromUrl(url) {
    const parts = parseUrl(url);
    if (!parts) {
      return null;
    }

    const segments = parts.path.split("/").filter(function (segment) {
      return segment.length > 0;
    });

    let best = null;
    let bestScore = 0;

    for (let i = segments.length - 1; i >= 0; i--) {
      let candidate = segments[i];
      try {
        candidate = decodeURIComponent(candidate);
      } catch (e) {
        // A malformed percent escape is not worth failing over; use it raw.
      }
      candidate = candidate.replace(/\.(html|php|aspx?|htm|pdf|jsp)$/i, "");

      if (candidate.length < 4 || /^\d+$/.test(candidate) || isGibberish(candidate)) {
        continue;
      }

      const hasSeparator = candidate.indexOf("-") !== -1 || candidate.indexOf("_") !== -1;
      const score = candidate.length + (hasSeparator ? 10 : 0);
      if (score > bestScore) {
        bestScore = score;
        best = candidate;
      }
    }

    if (!best) {
      return null;
    }

    const title = titleCase(best.replace(/[-_+]/g, " "));
    const words = title.split(" ").filter(function (word) {
      return word.length > 0;
    });

    if (words.length >= 2 || (words.length === 1 && words[0].length > 8)) {
      return clip(title, 80);
    }
    return null;
  }

  // -------------------------------------------------------------------------
  // Title from the page
  // -------------------------------------------------------------------------

  function extractHtmlTitle(html) {
    if (!html) {
      return null;
    }

    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    if (titleMatch && titleMatch[1]) {
      const cleaned = decodeHtmlEntities(titleMatch[1]).replace(/\s+/g, " ").trim();
      if (cleaned) {
        return cleaned;
      }
    }

    const ogMatch =
      html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["']/i) ||
      html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*property=["']og:title["']/i);
    if (ogMatch && ogMatch[1]) {
      const cleaned = decodeHtmlEntities(ogMatch[1]).replace(/\s+/g, " ").trim();
      if (cleaned) {
        return cleaned;
      }
    }

    return null;
  }

  // -------------------------------------------------------------------------
  // Network
  // -------------------------------------------------------------------------

  function request(url) {
    let result;
    try {
      result = callAPI("", url, "GET", HTML_HEADERS, "");
    } catch (e) {
      return {ok: false, error: e && e.message ? e.message : String(e)};
    }

    if (!result) {
      return {ok: false, error: "no response"};
    }
    if (result.success === false) {
      return {ok: false, error: result.error || "request failed"};
    }
    if (typeof result.data !== "string" || !result.data) {
      return {ok: false, error: "empty response body"};
    }
    return {ok: true, data: result.data};
  }

  // -------------------------------------------------------------------------
  // Search fallback
  // -------------------------------------------------------------------------

  function searchQueryFor(url) {
    // JSTOR stable ids are opaque; searching the id itself finds citations
    // where fetching the page does not.
    const stable = String(url).match(/jstor\.org\/stable\/(\d+)/);
    if (stable) {
      return "jstor " + stable[1] + " article title";
    }
    return String(url);
  }

  function parseSearchTitle(html) {
    const patterns = [
      /class=["'][^"']*result__a[^"']*["'][^>]*>([\s\S]*?)<\/a>/i,
      /class=["'][^"']*result__title[^"']*["'][^>]*>[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/i
    ];

    for (let i = 0; i < patterns.length; i++) {
      const match = html.match(patterns[i]);
      if (!match || !match[1]) {
        continue;
      }
      const title = decodeHtmlEntities(match[1].replace(/<[^>]*>/g, ""))
        .replace(/\s+/g, " ")
        .trim();
      if (title && !isGenericTitle(title)) {
        return clip(title, 80);
      }
    }
    return null;
  }

  function searchForTitle(url) {
    const searchUrl = SEARCH_ENDPOINT + "?q=" + encodeURIComponent(searchQueryFor(url));
    const response = request(searchUrl);
    if (!response.ok) {
      console.log("Search fallback failed for " + url + ": " + response.error);
      return null;
    }
    const title = parseSearchTitle(response.data);
    if (title) {
      console.log("Found title via search: " + title);
    }
    return title;
  }

  // -------------------------------------------------------------------------
  // Title resolution for one URL
  // -------------------------------------------------------------------------

  function fetchTitle(url) {
    if (!isHttpUrl(url)) {
      return {title: null, source: "unsupported"};
    }

    // 1. The URL path is free and never fails.
    const pathTitle = extractTitleFromUrl(url);
    if (pathTitle) {
      return {title: pathTitle, source: "path"};
    }

    const parts = parseUrl(url);
    const host = parts ? parts.host : "";

    // 2. The page itself.
    const response = request(url);
    if (response.ok) {
      const pageTitle = extractHtmlTitle(response.data);
      if (pageTitle && !isGenericTitle(pageTitle) && !isBareSiteTitle(pageTitle, host)) {
        return {title: clip(pageTitle, 80), source: "page"};
      }
      console.log("Page title unusable for " + url + ": " + (pageTitle || "none found"));
    } else {
      console.log("Fetch failed for " + url + ": " + response.error);
    }

    // 3. A web search, which sidesteps paywalls, bot walls, and soft 404s.
    const searchTitle = searchForTitle(url);
    if (searchTitle) {
      return {title: searchTitle, source: "search"};
    }

    return {title: null, source: "failed"};
  }

  // -------------------------------------------------------------------------
  // Finding plain URLs in note text
  // -------------------------------------------------------------------------

  function blank(text) {
    return new Array(text.length + 1).join(" ");
  }

  function maskAlreadyLinked(text) {
    // Hide the destination of anything that already has one, so a URL carrying
    // a title is never converted a second time. Only the URL is blanked; the
    // visible label is copied through unchanged, because it is part of the note
    // the user sees again in the payload. Every blank is the same length as
    // what it replaces, so offsets keep pointing at the same places.
    const autolinked = text.replace(/<https?:\/\/[^>\s]*>/gi, blank);

    // Destinations to blank, collected first: a URL may contain its own parens,
    // so the close paren has to be found by counting, not by the first match.
    const destinations = [];
    let i = 0;
    while (i < autolinked.length) {
      if (autolinked.charAt(i) !== "[") {
        i++;
        continue;
      }
      const labelStart = i + 1;
      if (autolinked.charAt(labelStart) === "[") {
        // A wikilink ("[[Page]]") is not a markdown link.
        i++;
        continue;
      }
      const labelEnd = autolinked.indexOf("]", labelStart);
      if (labelEnd === -1 || autolinked.charAt(labelEnd + 1) !== "(") {
        i++;
        continue;
      }

      let depth = 0;
      let k = labelEnd + 1;
      let closed = false;
      for (; k < autolinked.length; k++) {
        const c = autolinked.charAt(k);
        if (c === "\n") {
          break;
        }
        if (c === "(") {
          depth++;
        } else if (c === ")") {
          depth--;
          if (depth === 0) {
            closed = true;
            break;
          }
        }
      }
      if (!closed) {
        i = labelEnd + 1;
        continue;
      }

      destinations.push({start: labelEnd + 2, end: k});
      i = k + 1;
    }

    if (!destinations.length) {
      return autolinked;
    }

    let out = autolinked;
    for (let d = destinations.length - 1; d >= 0; d--) {
      const spot = destinations[d];
      out = out.slice(0, spot.start) + blank(out.slice(spot.start, spot.end)) + out.slice(spot.end);
    }
    return out;
  }

  function trimTrailingPunctuation(url) {
    // An HTML entity that was not decoded is not part of the URL.
    let trimmed = url.replace(/&[a-z]+;$/i, "");
    // A dangling separator is the sentence's, not the URL's.
    trimmed = trimmed.replace(/[.,;:!?'"&=]+$/, "");
    // A closing paren may be part of the URL (Wikipedia) or part of the
    // sentence. Keep it unless the parens are now unbalanced.
    while (trimmed.charAt(trimmed.length - 1) === ")") {
      const opens = (trimmed.match(/\(/g) || []).length;
      const closes = (trimmed.match(/\)/g) || []).length;
      if (closes <= opens) {
        break;
      }
      trimmed = trimmed.slice(0, -1);
    }
    return trimmed.replace(/[.,;:!?'"&=]+$/, "");
  }

  function findUrls(line) {
    const matches = line.match(/https?:\/\/[^\s<>"'`]+/gi);
    if (!matches) {
      return [];
    }
    const found = [];
    for (let i = 0; i < matches.length; i++) {
      const url = trimTrailingPunctuation(matches[i]);
      if (url) {
        found.push(url);
      }
    }
    return found;
  }

  // -------------------------------------------------------------------------
  // Command
  // -------------------------------------------------------------------------

  const extensionRoot = new Extension({
    name: extensionName,
    // Must match extension.json exactly; the validator compares the two.
    version: "1.0.0",
    endpoints: [
      "https://html.duckduckgo.com",
      // Any http(s) host may be fetched for its title.
      "http://",
      "https://"
    ],
    requiredAPIKeys: [],
    author: "kerim",
    category: "Utilities",
    dataScope: "full"
  });

  const url_to_markdown_links = new Command({
    name: "url_to_markdown_links",
    parameters: [
      new Parameter({
        type: "int",
        name: "max_links",
        helpText: "Stop after this many URLs (each one is a network request)",
        default: DEFAULT_MAX_LINKS,
        required: false
      })
    ],
    type: "replaceAll",
    helpText:
      "Replace every bare URL in the note with a [page title](URL) markdown link. " +
      "Turn off Settings > Editor > Links > Shorten long links automatically first.",
    tutorials: [
      new TutorialCommand({
        command: "url_to_markdown_links",
        description: "Link every URL in the note, up to 25"
      }),
      new TutorialCommand({
        command: "url_to_markdown_links(5)",
        description: "Link only the first 5 URLs"
      })
    ],
    extension: extensionRoot
  });

  url_to_markdown_links.execute = function (payload) {
    let params;
    try {
      params = this.getParsedParams(payload);
    } catch (e) {
      return new ReturnObject({status: "error", message: e.message});
    }

    let maxLinks = params[0];
    if (typeof maxLinks !== "number" || isNaN(maxLinks) || maxLinks < 1) {
      maxLinks = DEFAULT_MAX_LINKS;
    }

    const note = (payload && typeof payload.fullText === "string") ? payload.fullText : "";
    if (!note.trim()) {
      return new ReturnObject({status: "error", message: "This note is empty."});
    }

    const text = maskAlreadyLinked(note);
    const maskedLines = text.split("\n");
    const noteLines = note.split("\n");

    let converted = 0;
    const failed = [];
    const deferred = [];

    for (let i = 0; i < maskedLines.length; i++) {
      const line = maskedLines[i];
      const urls = findUrls(line);
      if (!urls.length) {
        continue;
      }

      // Replacement offsets come from the masked line, which is the same
      // length as the original. Edits are applied to the original line from
      // the end backwards, so a link destination blanked out by the mask is
      // restored verbatim and offsets never shift under us.
      const edits = [];
      let position = 0;

      for (let j = 0; j < urls.length; j++) {
        const url = urls[j];
        const start = line.indexOf(url, position);
        if (start === -1) {
          continue;
        }
        position = start + url.length;

        if (converted >= maxLinks) {
          deferred.push(url);
          continue;
        }

        const resolved = fetchTitle(url);
        if (resolved.title) {
          edits.push({
            start: start,
            end: position,
            text: "[" + resolved.title + "](" + url + ")"
          });
          converted++;
        } else {
          failed.push(url);
        }
      }

      let rebuilt = noteLines[i];
      for (let k = edits.length - 1; k >= 0; k--) {
        rebuilt = rebuilt.slice(0, edits[k].start) + edits[k].text + rebuilt.slice(edits[k].end);
      }
      noteLines[i] = rebuilt;
    }

    const result = noteLines.join("\n");

    if (converted === 0 && failed.length === 0 && deferred.length === 0) {
      return new ReturnObject({
        status: "success",
        message: "No bare URLs found — every link is already a markdown link.",
        payload: result
      });
    }

    if (converted === 0) {
      const total = failed.length + deferred.length;
      return new ReturnObject({
        status: "error",
        message:
          "Found " + total + " URL" + (total === 1 ? "" : "s") +
          " but could not fetch any titles. The note is unchanged.",
        payload: result
      });
    }

    let message = "Linked " + converted + " URL" + (converted === 1 ? "" : "s");
    if (failed.length) {
      message +=
        ". Left " + failed.length + " unlinked (no usable title): " +
        failed.slice(0, 3).join(", ") +
        (failed.length > 3 ? ", +" + (failed.length - 3) + " more" : "");
    }
    if (deferred.length) {
      message +=
        ". " + deferred.length + " past the " + maxLinks +
        "-link limit left alone — run again or raise the argument";
    }

    console.log("url_to_markdown_links: linked " + converted + ", skipped " + failed.length);

    return new ReturnObject({status: "success", message: message, payload: result});
  };

  // -------------------------------------------------------------------------
  // Test surface
  // -------------------------------------------------------------------------

  helpers.decodeHtmlEntities = decodeHtmlEntities;
  helpers.extractTitleFromUrl = extractTitleFromUrl;
  helpers.extractHtmlTitle = extractHtmlTitle;
  helpers.isGenericTitle = isGenericTitle;
  helpers.isGibberish = isGibberish;
  helpers.isBareSiteTitle = isBareSiteTitle;
  helpers.parseSearchTitle = parseSearchTitle;
  helpers.parseUrl = parseUrl;
  helpers.maskAlreadyLinked = maskAlreadyLinked;
  helpers.trimTrailingPunctuation = trimTrailingPunctuation;
  helpers.findUrls = findUrls;
  helpers.searchQueryFor = searchQueryFor;
  helpers.fetchTitle = fetchTitle;
  helpers.clip = clip;
  helpers.DEFAULT_MAX_LINKS = DEFAULT_MAX_LINKS;
})();
