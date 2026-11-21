/**
 * omnistream - Built from src/omnistream/
 * Generated: 2026-11-21T18:26:22.495Z
 */
var __defProp = Object.defineProperty;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/omnistream/utils/http.js
var headers = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9"
};
function fetchPage(_0) {
  return __async(this, arguments, function* (url, customHeaders = {}, retries = 2) {
    try {
      const response = yield fetch(url, { method: "GET", headers: __spreadValues(__spreadValues({}, headers), customHeaders) });
      if (!response.ok)
        throw new Error(`HTTP Error: ${response.status}`);
      return yield response.text();
    } catch (error) {
      if (retries > 0) {
        yield new Promise((r) => setTimeout(r, 1e3));
        return fetchPage(url, customHeaders, retries - 1);
      }
      throw error;
    }
  });
}

// src/omnistream/utils/helpers.js
function sortStreamsByQuality(streams) {
  const qualityOrder = { "4K": 5, "2160p": 5, "1080p": 4, "720p": 3, "480p": 2, "CAM": 1, "Unknown": 0 };
  return streams.sort((a, b) => {
    const qA = qualityOrder[a.quality] || 0;
    const qB = qualityOrder[b.quality] || 0;
    if (qB !== qA)
      return qB - qA;
    return a.title.localeCompare(b.title);
  });
}
function extractQuality(label) {
  if (!label)
    return "1080p";
  label = label.toLowerCase();
  if (label.includes("4k") || label.includes("2160"))
    return "4K";
  if (label.includes("1080"))
    return "1080p";
  if (label.includes("720"))
    return "720p";
  if (label.includes("480"))
    return "480p";
  return "1080p";
}

// src/omnistream/scrapers/multisite.js
var cheerio = require("cheerio-without-node-native");
var SITES = [
  { name: "Atlantic", base: "https://atlantic.bz" },
  { name: "ShuttleTV", base: "https://shuttletv.pk" },
  { name: "FlyStream", base: "https://flystream.net" },
  { name: "Vivarium", base: "https://vivarium.st" },
  { name: "ArrowTV", base: "https://arrowtv.net" },
  { name: "Movy", base: "https://movy.sx" },
  { name: "Cinejoy", base: "https://cinejoy.pk" },
  { name: "7Movies", base: "https://7movies.ac" },
  { name: "Cinecat", base: "https://cinecat.eu" },
  { name: "PopcornMovies", base: "https://popcornmovies.st" },
  { name: "CineLite", base: "https://cinelite.xyz" },
  { name: "Ghostflix", base: "https://ghostflix.st" },
  { name: "dulo", base: "https://dulo.mov" },
  { name: "Spacedom", base: "https://spacedom.live" },
  { name: "Chillflix", base: "https://chillflix.lol" },
  { name: "Way2Movies", base: "https://beta.way2movies.live" },
  { name: "LFMX", base: "https://lfmx.app" },
  { name: "Reelix", base: "https://reelix.ac" },
  { name: "SweetFox", base: "https://sweetfox.app" },
  { name: "RiveStream", base: "https://rivestream.app" },
  { name: "MeowTV", base: "https://meowtv.ru" },
  { name: "Flixer", base: "https://flixer.gd" }
];
function getSmartStreams(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    let streams = [];
    for (const site of SITES) {
      try {
        let url = `${site.base}/${mediaType === "tv" ? "tv" : "movie"}/${tmdbId}`;
        if (mediaType === "tv")
          url += `/${season}/${episode}`;
        console.log(`[${site.name}] Scraping: ${url}`);
        const html = yield fetchPage(url);
        const $ = cheerio.load(html);
        $("iframe, source").each((i, el) => {
          let src = $(el).attr("src") || $(el).attr("data-src");
          if (src && src.startsWith("http")) {
            if (src.startsWith("//"))
              src = "https:" + src;
            const label = $(el).attr("title") || $(el).attr("label") || "1080p";
            streams.push({
              name: site.name,
              title: `${site.name} - ${label}`,
              url: src,
              quality: extractQuality(label),
              headers: { "Referer": site.base }
            });
          }
        });
      } catch (e) {
        console.warn(`[${site.name}] Error: ${e.message}`);
      }
    }
    return streams;
  });
}

// src/omnistream/index.js
function getStreams(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    console.log(`[OmniStream] Fetching for TMDB ID: ${tmdbId} (${mediaType})`);
    if (!tmdbId)
      return [];
    const streams = yield getSmartStreams(tmdbId, mediaType, season, episode).catch((e) => {
      console.error("[OmniStream] Scraper failed:", e.message);
      return [];
    });
    return sortStreamsByQuality(streams);
  });
}
module.exports = { getStreams };
