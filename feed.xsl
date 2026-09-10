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
        <title><xsl:value-of select="atom:title"/> — Feed RSS</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
            background: #f9fafb;
          }
          header {
            background: #ffffff;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            margin-bottom: 30px;
            text-align: center;
          }
          h1 { margin: 0 0 10px 0; color: #111827; font-size: 1.75rem; }
          p.subtitle { color: #4b5563; margin: 0 0 20px 0; font-size: 1rem; }
          .rss-info {
            background: #eff6ff;
            border: 1px solid #bfdbfe;
            color: #1e40af;
            padding: 15px 20px;
            border-radius: 8px;
            font-size: 0.9rem;
            text-align: left;
          }
          .rss-info code {
            background: #dbeafe;
            padding: 4px 8px;
            border-radius: 4px;
            font-family: monospace;
            word-break: break-all;
            display: inline-block;
            margin-top: 5px;
          }
          .entry {
            background: #ffffff;
            border: 1px solid #e5e7eb;
            padding: 25px;
            border-radius: 10px;
            margin-bottom: 20px;
            box-shadow: 0 1px 2px rgba(0,0,0,0.02);
          }
          .entry h2 {
            margin-top: 0;
            font-size: 1.2rem;
          }
          .entry h2 a {
            color: #2563eb;
            text-decoration: none;
          }
          .entry h2 a:hover {
            text-decoration: underline;
          }
          .meta {
            font-size: 0.85rem;
            color: #6b7280;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          .content img {
            max-width: 100%;
            height: auto;
            border-radius: 6px;
            margin-top: 10px;
          }
        </style>
      </head>
      <body>
        <header>
          <h1>🐾 <xsl:value-of select="atom:title"/></h1>
          <p class="subtitle"><xsl:value-of select="atom:subtitle"/></p>
          <div class="rss-info">
            <strong>ℹ️ Como usar este canal:</strong> Podes copiar o endereço abaixo e adicioná-lo ao teu leitor de RSS preferido ou a plataformas de integração (Make/Zapier):<br/>
            <code><xsl:value-of select="atom:link[@rel='self']/@href"/></code>
          </div>
        </header>

        <main>
          <h2 style="font-size: 1.25rem; margin-bottom: 20px;">Últimas Ocorrências Registadas</h2>
          <xsl:for-each select="atom:entry">
            <div class="entry">
              <div class="meta">Publicado a: <xsl:value-of select="atom:published"/></div>
              <h2>
                <xsl:element name="a">
                  <xsl:attribute name="href">
                    <xsl:value-of select="atom:link[@rel='alternate']/@href"/>
                  </xsl:attribute>
                  <xsl:value-of select="atom:title"/>
                </xsl:element>
              </h2>
              <div class="content">
                <xsl:value-of select="atom:content" disable-output-escaping="yes"/>
              </div>
            </div>
          </xsl:for-each>
        </main>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
