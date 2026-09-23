// Tests for the url_to_markdown_links extension.
//
// No framework to import: describe/it/expect are defined here, like the repo
// runner. The harness exposes the declared command as a global and installs
// global.__callAPI as the network seam, so no test touches the real network.

var fs = require('fs');
var path = require('path');

function describe(name, fn) {
  console.log('\n' + name);
  fn();
}

function it(name, fn) {
  try {
    fn();
    console.log('  \u2713 ' + name);
  } catch (e) {
    console.log('  \u2717 ' + name);
    console.log('    Error: ' + e.message);
  }
}

function expect(actual) {
  return {
    toBe: function (expected) {
      if (actual !== expected) { throw new Error('Expected ' + expected + ' but got ' + actual); }
    },
    toContain: function (expected) {
      if (String(actual).indexOf(expected) === -1) {
        throw new Error('Expected "' + actual + '" to contain "' + expected + '"');
      }
    },
    toNotContain: function (expected) {
      if (String(actual).indexOf(expected) !== -1) {
        throw new Error('Expected "' + actual + '" NOT to contain "' + expected + '"');
      }
    },
    toBeDefined: function () {
      if (actual === undefined || actual === null) { throw new Error('Expected value to be defined'); }
    },
    toBeArray: function () {
      if (!Array.isArray(actual)) { throw new Error('Expected an array'); }
    }
  };
}

var metadata = JSON.parse(fs.readFileSync(path.join(__dirname, 'extension.json'), 'utf8'));
var helpers = global.__EXTENSION_SHARED__.url_to_markdown_links;

// --- network stub ----------------------------------------------------------
// routes: exact URL -> string body, or {error: "..."} to fail the request.
// Unrouted URLs fail, which is what we want: a test that forgets to route a
// URL should visibly break rather than silently pass.
var routes = {};
var calls = [];

var stubCallAPI = function (apiKeyId, url, method, headers, body) {
  calls.push({apiKeyId: apiKeyId, url: url, method: method, headers: headers, body: body});
  if (Object.prototype.hasOwnProperty.call(routes, url)) {
    var route = routes[url];
    if (route && route.error) {
      return {success: false, error: route.error};
    }
    return {success: true, data: route};
  }
  return {success: false, error: 'no route for ' + url};
};

// Both runners concatenate this file after the extension code, but they expose
// the network seam differently: the skill's harness reads global.__callAPI,
// while the community repo's runner declares its own hardcoded callAPI that
// would shadow the stub. Install the stub on both, so the same tests mean the
// same thing locally and in CI.
function installCallAPI(fn) {
  global.__callAPI = fn;
  if (typeof callAPI !== 'undefined') {
    callAPI = fn;
  }
}

installCallAPI(stubCallAPI);

function reset(routesConfig) {
  routes = routesConfig || {};
  calls = [];
}

function run(parameters, fullText) {
  return url_to_markdown_links.execute({
    parameters: parameters || [],
    fullText: fullText === undefined ? '' : fullText,
    userSettings: {}
  });
}

var SEARCH = 'https://html.duckduckgo.com/html/?q=';

// ---------------------------------------------------------------------------

describe('url_to_markdown_links - metadata', function () {
  it('has the required fields', function () {
    expect(metadata.name).toBe('url_to_markdown_links');
    expect(metadata.version).toBe('1.0.0');
    expect(metadata.commands).toBeArray();
    expect(metadata.license).toBeDefined();
    expect(metadata.author).toBeDefined();
    expect(metadata.category).toBeDefined();
    expect(metadata.description).toBeDefined();
  });

  it('declares the scope the code actually needs', function () {
    expect(metadata.dataScope).toBe('full');
  });

  it('declares the search endpoint and no api keys', function () {
    expect(metadata.endpoints).toContain('https://html.duckduckgo.com');
    expect(metadata.requiredAPIKeys.length).toBe(0);
  });

  it('is an unofficial extension with a replaceAll command', function () {
    expect(metadata.official).toBe(false);
    expect(metadata.commands[0].type).toBe('replaceAll');
  });
});

describe('url_to_markdown_links - helpers', function () {
  it('extracts a readable title from a URL path', function () {
    expect(helpers.extractTitleFromUrl('https://example.com/blog/the-art-of-note-taking')).toBe('The Art Of Note Taking');
  });

  it('returns null when the path has nothing readable', function () {
    expect(helpers.extractTitleFromUrl('https://example.com/')).toBe(null);
    expect(helpers.extractTitleFromUrl('https://example.com/12345/6789')).toBe(null);
  });

  it('ignores a hash-like path segment', function () {
    expect(helpers.extractTitleFromUrl('https://example.com/e699f5808f4c08dfb7873ad8212dd40e')).toBe(null);
  });

  it('reads the title tag and decodes entities', function () {
    expect(helpers.extractHtmlTitle('<html><head><title>Research &amp; Writing</title>')).toBe('Research & Writing');
  });

  it('falls back to og:title in either attribute order', function () {
    expect(helpers.extractHtmlTitle('<meta property="og:title" content="Open Graph Title">')).toBe('Open Graph Title');
    expect(helpers.extractHtmlTitle('<meta content="Reversed Order" property="og:title">')).toBe('Reversed Order');
  });

  it('flags generic titles', function () {
    expect(helpers.isGenericTitle('Page Not Found')).toBe(true);
    expect(helpers.isGenericTitle('JSTOR Home')).toBe(true);
    expect(helpers.isGenericTitle('A Real Article About Things')).toBe(false);
  });

  it('flags a soft-404 that only returns the site name', function () {
    expect(helpers.isBareSiteTitle('Jstor', 'www.jstor.org')).toBe(true);
    expect(helpers.isBareSiteTitle('Example.com', 'www.example.com')).toBe(true);
    expect(helpers.isBareSiteTitle('Example Home', 'www.example.com')).toBe(true);
    // A real headline that starts with the site name is not a soft-404.
    expect(helpers.isBareSiteTitle('Example.com: Why Bees Matter', 'www.example.com')).toBe(false);
    expect(helpers.isBareSiteTitle('Why Bees Matter', 'www.example.com')).toBe(false);
  });

  it('reads a title out of search results', function () {
    var html = '<a class="result__a" href="x">The Real &quot;Title&quot; Here</a>';
    expect(helpers.parseSearchTitle(html)).toBe('The Real "Title" Here');
  });

  it('rejects a generic title in search results', function () {
    var html = '<a class="result__a" href="x">Access Denied</a>';
    expect(helpers.parseSearchTitle(html)).toBe(null);
  });

  it('masks text that is already linked', function () {
    var masked = helpers.maskAlreadyLinked('see [Title](https://a.com) and https://b.com');
    expect(helpers.findUrls(masked).length).toBe(1);
    expect(helpers.findUrls(masked)[0]).toBe('https://b.com');
  });

  it('masks a whole destination, including nested parens', function () {
    var original = 'see [Bee](https://en.wikipedia.org/wiki/Bee_(letter)).';
    var masked = helpers.maskAlreadyLinked(original);
    expect(masked.length).toBe(original.length);
    expect(helpers.findUrls(masked).length).toBe(0);
    expect(masked).toContain('[Bee]');
  });

  it('leaves a wikilink alone', function () {
    var original = 'see [[Some Page]] and https://b.com';
    var masked = helpers.maskAlreadyLinked(original);
    expect(masked).toBe(original);
  });

  it('masks an autolink destination', function () {
    var original = 'see <https://a.com/page> and https://b.com';
    var masked = helpers.maskAlreadyLinked(original);
    expect(masked.length).toBe(original.length);
    expect(helpers.findUrls(masked).length).toBe(1);
  });

  it('keeps a balanced paren inside a URL but drops sentence punctuation', function () {
    expect(helpers.findUrls('See https://en.wikipedia.org/wiki/Bee_(letter).')[0])
      .toBe('https://en.wikipedia.org/wiki/Bee_(letter)');
    expect(helpers.findUrls('Go to https://example.com/page).')[0]).toBe('https://example.com/page');
  });

  it('drops a dangling separator but keeps a real query string', function () {
    expect(helpers.findUrls('see https://example.com/?a=1&b=2')[0]).toBe('https://example.com/?a=1&b=2');
    expect(helpers.findUrls('see https://example.com/p?x=1&amp;')[0]).toBe('https://example.com/p?x=1');
  });

  it('builds a JSTOR-specific search query', function () {
    expect(helpers.searchQueryFor('https://www.jstor.org/stable/1234567'))
      .toBe('jstor 1234567 article title');
  });
});

describe('url_to_markdown_links - execute', function () {
  it('links a URL using the page title when the path has none', function () {
    reset({'https://example.org/12345': '<html><head><title>Thinking in Systems - Example</title></head></html>'});
    var result = run([], 'Read https://example.org/12345 today');
    expect(result.status).toBe('success');
    expect(result.payload).toBe('Read [Thinking in Systems - Example](https://example.org/12345) today');
  });

  it('prefers the readable path title and makes no request for it', function () {
    reset({});
    var result = run([], 'Read https://example.org/thinking-in-systems today');
    expect(result.status).toBe('success');
    expect(result.payload).toBe('Read [Thinking In Systems](https://example.org/thinking-in-systems) today');
    expect(calls.length).toBe(0);
  });

  it('converts every URL across multiple lines', function () {
    reset({
      'https://a.com/one': '<title>First Page</title>',
      'https://b.com/two': '<title>Second Page</title>'
    });
    var result = run([], 'https://a.com/one\nhttps://b.com/two');
    expect(result.payload).toBe('[First Page](https://a.com/one)\n[Second Page](https://b.com/two)');
  });

  it('leaves an existing markdown link untouched, label and all', function () {
    reset({});
    var result = run([], 'Already [Linked](https://a.com/one) here');
    expect(result.status).toBe('success');
    expect(result.payload).toBe('Already [Linked](https://a.com/one) here');
    expect(calls.length).toBe(0);
  });

  it('preserves an existing link that itself contains parentheses', function () {
    reset({'https://b.com/two': '<title>Second Page</title>'});
    var result = run([], 'See [Bee](https://en.wikipedia.org/wiki/Bee_(letter)). And https://b.com/two');
    expect(result.status).toBe('success');
    expect(result.payload).toBe(
      'See [Bee](https://en.wikipedia.org/wiki/Bee_(letter)). And [Second Page](https://b.com/two)'
    );
  });

  it('still converts a bare URL that shares a line with a markdown link', function () {
    reset({'https://b.com/two': '<title>Second Page</title>'});
    var result = run([], 'Already [Linked](https://a.com/one) and https://b.com/two');
    expect(result.payload).toBe('Already [Linked](https://a.com/one) and [Second Page](https://b.com/two)');
  });

  it('falls back to the search endpoint when the page title is generic', function () {
    var searchRoute = {};
    searchRoute[SEARCH + encodeURIComponent('https://news.example.com/thing')] =
      '<a class="result__a" href="x">The Story Behind The Thing</a>';
    searchRoute['https://news.example.com/thing'] = '<title>Page Not Found</title>';
    reset(searchRoute);
    var result = run([], 'https://news.example.com/thing');
    expect(result.status).toBe('success');
    expect(result.payload).toBe('[The Story Behind The Thing](https://news.example.com/thing)');

    var searched = calls.filter(function (c) { return c.url.indexOf('duckduckgo') !== -1; });
    expect(searched.length).toBe(1);
  });

  it('leaves the URL alone when the fetch and the search both fail', function () {
    reset({'https://locked.example.com/paper': {error: 'HTTP 403'}});
    var result = run([], 'Paper: https://locked.example.com/paper');
    expect(result.status).toBe('error');
    expect(result.payload).toBe('Paper: https://locked.example.com/paper');
    expect(result.message).toContain('could not fetch');
  });

  it('reports partial success and names what was skipped', function () {
    reset({
      'https://good.example.com/a-real-page': '<title>A Real Page</title>',
      'https://bad.example.com/gone': {error: 'HTTP 404'}
    });
    var result = run([], 'https://good.example.com/a-real-page and https://bad.example.com/gone');
    expect(result.status).toBe('success');
    expect(result.payload).toBe('[A Real Page](https://good.example.com/a-real-page) and https://bad.example.com/gone');
    expect(result.message).toContain('Linked 1 URL');
    expect(result.message).toContain('bad.example.com/gone');
  });

  it('honours the max_links limit and says so', function () {
    reset({
      'https://a.com/x': '<title>X Page</title>',
      'https://b.com/y': '<title>Y Page</title>'
    });
    var result = run(['1'], 'https://a.com/x https://b.com/y');
    expect(result.status).toBe('success');
    expect(result.payload).toBe('[X Page](https://a.com/x) https://b.com/y');
    expect(result.message).toContain('past the 1-link limit');
  });

  it('rejects an empty note', function () {
    reset({});
    var result = run([], '   ');
    expect(result.status).toBe('error');
    expect(result.message).toContain('empty');
  });

  it('says so when there is nothing to convert', function () {
    reset({});
    var result = run([], 'A note with no links at all');
    expect(result.status).toBe('success');
    expect(result.message).toContain('No bare URLs found');
  });

  it('still returns a payload when the network throws', function () {
    reset({});
    installCallAPI(function () { throw new Error('bridge exploded'); });
    var result = run([], 'https://crashes.example.com/story');
    expect(result.status).toBe('error');
    expect(result.payload).toBe('https://crashes.example.com/story');
  });
});
