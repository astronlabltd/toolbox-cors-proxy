#!/usr/bin/env node
// cli.js — entry point for `npx @astronlab/toolbox-cors-proxy`
'use strict';

import http from 'node:http';
import { URL } from 'node:url';

const args = process.argv.slice(2);
const port = parseInt(args.find(a => /^\d+$/.test(a)) ?? '8888', 10);

const server = http.createServer(async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Expose-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Parse target URL from query parameter or header
  const urlObj = new URL(req.url, `http://${req.headers.host || '127.0.0.1'}`);
  let targetUrl = urlObj.searchParams.get('url') || req.headers['x-target-url'];

  if (!targetUrl) {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('Missing target URL');
    return;
  }

  try {
    const headers = {};
    for (const [key, value] of Object.entries(req.headers)) {
      const keyLower = key.toLowerCase();
      if (keyLower !== 'host' && keyLower !== 'origin' && keyLower !== 'referer') {
        headers[key] = value;
      }
    }

    // Read body if applicable
    const hasBody = req.method !== 'GET' && req.method !== 'HEAD';
    let body;
    if (hasBody) {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      body = Buffer.concat(chunks);
    }

    // Forward request
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: headers,
      body: hasBody && body && body.length > 0 ? body : undefined,
      redirect: 'follow',
    });

    // Copy response headers
    for (const [key, value] of response.headers.entries()) {
      const keyLower = key.toLowerCase();
      if (
        !keyLower.startsWith('access-control-') &&
        keyLower !== 'transfer-encoding' &&
        keyLower !== 'content-encoding' &&
        keyLower !== 'content-length'
      ) {
        res.setHeader(key, value);
      }
    }

    res.writeHead(response.status);

    if (response.body) {
      if (typeof response.body[Symbol.asyncIterator] === 'function') {
        for await (const chunk of response.body) {
          res.write(chunk);
        }
      } else {
        const reader = response.body.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          res.write(value);
        }
      }
    }
    res.end();
  } catch (err) {
    console.error('Proxy Error:', err);
    res.writeHead(502, { 'Content-Type': 'text/plain' });
    res.end(`Proxy Gateway Error: ${err.message}`);
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`🚀 AstronLab CORS Proxy`);
  console.log(`   Listening on http://127.0.0.1:${port}`);
  console.log(`   Configure this URL in the Connection Settings on AstronLab Tools`);
  console.log(`   Press Ctrl+C to stop\n`);
});
