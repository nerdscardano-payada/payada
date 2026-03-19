Deno.serve(async () => {
  const baseUrl = "https://payada.io";
  const today = new Date().toISOString().split("T")[0];

  const pages = [
    { url: "/", priority: "1.0", changefreq: "weekly" },
    { url: "/Features", priority: "0.9", changefreq: "monthly" },
    { url: "/Pricing", priority: "0.9", changefreq: "monthly" },
    { url: "/Roadmap", priority: "0.8", changefreq: "weekly" },
    { url: "/Security", priority: "0.8", changefreq: "monthly" },
    { url: "/Documentation", priority: "0.8", changefreq: "weekly" },
    { url: "/APIReference", priority: "0.7", changefreq: "monthly" },
    { url: "/Webhooks", priority: "0.7", changefreq: "monthly" },
    { url: "/About", priority: "0.7", changefreq: "monthly" },
    { url: "/Contact", priority: "0.6", changefreq: "monthly" },
    { url: "/Litepaper", priority: "0.6", changefreq: "monthly" },
    { url: "/PrivacyPolicy", priority: "0.4", changefreq: "yearly" },
    { url: "/TermsOfService", priority: "0.4", changefreq: "yearly" },
    { url: "/AcceptableUsePolicy", priority: "0.4", changefreq: "yearly" },
    { url: "/MerchantAgreement", priority: "0.4", changefreq: "yearly" },
    { url: "/Disclaimer", priority: "0.4", changefreq: "yearly" },
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join("\n")}
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
});