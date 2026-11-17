// Pictology: Eleventy configuration
// Content lives in src/artworks and src/notes (edited through Pages CMS).
import { HtmlBasePlugin } from "@11ty/eleventy";

const isLive = (item) => item.data.published !== false;
const byOrder = (a, b) => (a.data.order ?? 999) - (b.data.order ?? 999);
const newestFirst = (a, b) => b.date - a.date;

export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/images": "images" });
  eleventyConfig.addPassthroughCopy({ "src/css": "css" });
  eleventyConfig.addPassthroughCopy({ "src/js": "js" });
  eleventyConfig.addPassthroughCopy({ "src/favicon.svg": "favicon.svg" });
  eleventyConfig.addPassthroughCopy({ "src/icons": "icons" });

  // Rewrites /images/... etc. so the site works at anotterbryan.github.io/pictology/
  eleventyConfig.addPlugin(HtmlBasePlugin);

  eleventyConfig.addCollection("artworks", (api) =>
    api.getFilteredByGlob("src/artworks/*.md").filter(isLive).sort(byOrder)
  );
  // Hero: the featured piece. If more than one is ticked, the lowest order number wins.
  eleventyConfig.addCollection("featured", (api) =>
    api.getFilteredByGlob("src/artworks/*.md").filter((i) => isLive(i) && i.data.featured).sort(byOrder).slice(0, 1)
  );
  eleventyConfig.addCollection("notes", (api) =>
    api.getFilteredByGlob("src/notes/*.md").filter(isLive).sort(newestFirst)
  );

  eleventyConfig.addFilter("readableDate", (d) =>
    new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" })
  );
  eleventyConfig.addFilter("isoDate", (d) => new Date(d).toISOString().slice(0, 10));
  eleventyConfig.addFilter("priceNum", (s = "") => { const m = String(s).match(/\$\s*(\d+(?:\.\d+)?)/); return m ? m[1] : ""; });
  eleventyConfig.addFilter("json", (v) => JSON.stringify(v));
  eleventyConfig.addFilter("stripTags", (s = "") => String(s).replace(/<[^>]+>/g, ""));
  eleventyConfig.addFilter("buildDate", () => new Date().toISOString().slice(0, 10));
  eleventyConfig.addFilter("year", () => new Date().getFullYear());
  eleventyConfig.addFilter("paras", (s = "") =>
    String(s).split(/\n\s*\n/).filter(Boolean).map((p) => `<p>${p.trim()}</p>`).join("")
  );

  return {
    pathPrefix: process.env.PATH_PREFIX || "/",
    dir: { input: "src", includes: "_includes", data: "_data", output: "_site" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
