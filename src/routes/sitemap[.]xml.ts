import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

interface SitemapEntry {
  path: string;
  changefreq?: "weekly" | "monthly" | "daily";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin;
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/tutorial", changefreq: "monthly", priority: "0.7" },
          { path: "/jogar/ia", changefreq: "weekly", priority: "0.8" },
          { path: "/estatisticas", changefreq: "monthly", priority: "0.4" },
        ];
        const urls = entries
          .map(
            (e) =>
              `  <url><loc>${origin}${e.path}</loc>` +
              (e.changefreq ? `<changefreq>${e.changefreq}</changefreq>` : "") +
              (e.priority ? `<priority>${e.priority}</priority>` : "") +
              `</url>`,
          )
          .join("\n");
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
        return new Response(xml, {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
