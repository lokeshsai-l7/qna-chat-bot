import axios from "axios";
import * as cheerio from "cheerio";
import { cleanText } from "../utils/cleanText.js";
import { URL } from "url";

export async function crawlWebsite(startUrl, maxPages = 10) {
  const visited = new Set();
  const queue = [startUrl];
  const pages = [];

  const baseDomain = new URL(startUrl).origin;

  while (queue.length > 0 && visited.size < maxPages) {
    const currentUrl = queue.shift();
    if (visited.has(currentUrl)) continue;
    visited.add(currentUrl);

    try {
      const { data } = await axios.get(currentUrl, { timeout: 10000 });
      const $ = cheerio.load(data);

      const title = $("title").text() || "";

      let pageText = "";
      $("p, h1, h2, h3, li").each((_, el) => {
        pageText += $(el).text() + " ";
      });

      const cleanedText = cleanText(pageText);

      if (cleanedText.length > 0) {
        pages.push({
          url: currentUrl,
          title,
          text: cleanedText,
        });
      }

      $("a[href]").each((_, el) => {
        const href = $(el).attr("href");
        if (!href) return;

        if (
          href.startsWith("#") ||
          href.startsWith("mailto:") ||
          href.match(/\.(pdf|jpg|png|svg|zip)$/)
        ) {
          return;
        }

        try {
          const absoluteUrl = new URL(href, currentUrl).href;
          if (absoluteUrl.startsWith(baseDomain) && !visited.has(absoluteUrl)) {
            queue.push(absoluteUrl);
          }
        } catch {}
      });
    } catch (err) {
      console.error(`❌ Failed to crawl ${currentUrl}`);
    }
  }

  return pages;
}
