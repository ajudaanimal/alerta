---
layout: null
---
<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:atom="http://www.w3.org/2005/Atom">
  <xsl:output method="html" encoding="utf-8" indent="yes"/>
  <xsl:template match="/atom:feed">
    <html lang="pt">
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <title><xsl:value-of select="atom:title"/> — Canal RSS</title>
        <style>
          :root {
            --bg-color: #f8fafc;
            --text-main: #0f172a;
            --text-muted: #64748b;
            --card-bg: #ffffff;
            --border-color: #cbd5e1;
            --accent-color: #2563eb;
            --badge-bg: #f1f5f9;
          }
          @media (prefers-color-scheme: dark) {
            :root {
              --bg-color: #0f172a;
              --text-main: #f1f5f9;
              --text-muted: #94a3b8;
              --card-bg: #1e293b;
              --border-color: #334155;
              --accent-color: #3b82f6;
              --badge-bg: #334155;
            }
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background-color: var(--bg-color);
            color: var(--text-main);
            margin: 0;
            padding: 24px 16px;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .feed-container {
            width: 100%;
            max-width: 680px;
          }
          .nav-back {
            margin-bottom: 16px;
          }
          .nav-back a {
            color: var(--accent-color);
            text-decoration: none;
            font-size: 0.9rem;
            font-weight: 600;
          }
          .nav-back a:hover {
            text-decoration: underline;
          }
          header.feed-header {
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 20px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
            text-align: center;
          }
          header.feed-header h1 {
            margin: 0 0 6px 0;
            font-size: 1.25rem;
            font-weight: 800;
          }
          header.feed-header p {
            margin: 0 0 12px 0;
            font-size: 0.9rem;
            color: var(--text-muted);
          }
          .feed-url-box {
            background: var(--badge-bg);
            border: 1px solid var(--border-color);
            padding: 8px 12px;
            border-radius: 8px;
            font-size: 0.8rem;
            word-break: break-all;
            font-family: monospace;
            color: var(--text-main);
          }
          .section-title {
            font-size: 0.95rem;
            font-weight: 700;
            margin: 20px 0 12px 4px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--text-muted);
          }
          .entry-card {
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 16px;
            box-shadow: 0 1px 2px rgba(0,0,0,0.02);
          }
          .entry-meta {
            font-size: 0.75rem;
            color: var(--text-muted);
            margin-bottom: 6px;
            font-weight: 600;
            text-transform: uppercase;
          }
          .entry-title {
            margin: 0 0 12px 0;
            font-size: 1.15rem;
          }
          .entry-title a {
            color: var(--accent-color);
            text-decoration: none;
            font-weight: 700;
          }
          .entry-title a:hover {
            text-decoration: underline;
          }
          .entry-content {
            font-size: 0.95rem;
            color: var(--text-main);
            line-height: 1.6;
          }
          .entry-content img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
          }
        </style>
      </head>
      <body>
        <div class="feed-container">
          <div class="nav-back">
            <a href="{{ '/' | relative_url }}">← Voltar ao site principal</a>
          </div>

          <header class="feed-header">
            <h1>🐾 <xsl:value-of select="atom:title"/></h1>
            <p><xsl:value-of select="atom:subtitle"/></p>
            <div class="feed-url-box">
              <xsl:value-of select="atom:link[@rel='self']/@href"/>
            </div>
          </header>

          <div class="section-title">Últimas Ocorrências</div>

          <xsl:for-each select="atom:entry">
            <div class="entry-card">
              <div class="entry-meta">
                Publicado a <xsl:value-of select="atom:published"/>
              </div>
              <h2 class="entry-title">
                <xsl:element name="a">
                  <xsl:attribute name="href">
                    <xsl:value-of select="atom:link[@rel='alternate']/@href"/>
                  </xsl:attribute>
                  <xsl:value-of select="atom:title"/>
                </xsl:element>
              </h2>
              <div class="entry-content">
                <xsl:choose>
                  <xsl:when test="atom:content">
                    <xsl:value-of select="atom:content"/>
                  </xsl:when>
                  <xsl:otherwise>
                    <xsl:value-of select="atom:summary"/>
                  </xsl:otherwise>
                </xsl:choose>
              </div>
            </div>
          </xsl:for-each>
        </div>

        <script>
          document.querySelectorAll('.entry-content').forEach(function(el) {
            el.innerHTML = el.textContent;
          });
        </script>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
