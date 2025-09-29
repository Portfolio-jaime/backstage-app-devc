#!/usr/bin/env node

/**
 * Simple CORS Proxy for Grafana API
 * This proxy allows Backstage to access Grafana API without CORS issues
 *
 * Usage: node cors-proxy.js
 * Then configure Backstage to use http://localhost:3011 as Grafana URL
 */

const http = require('http');
const httpProxy = require('http-proxy');

// Configuration
const PROXY_PORT = 3011;
const GRAFANA_TARGET = 'http://localhost:3010';

// Create proxy server
const proxy = httpProxy.createProxyServer({
  target: GRAFANA_TARGET,
  changeOrigin: true,
  secure: false,
  timeout: 30000,
  proxyTimeout: 30000,
});

// Create HTTP server
const server = http.createServer((req, res) => {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Log requests for debugging
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);

  // Proxy the request
  proxy.web(req, res, {
    target: GRAFANA_TARGET,
    changeOrigin: true,
  }, (err) => {
    console.error('Proxy error:', err.message);
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Proxy Error: ' + err.message);
    }
  });
});

// Handle proxy errors
proxy.on('error', (err, req, res) => {
  console.error('Proxy error:', err);
  if (!res.headersSent) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Proxy Error: ' + err.message);
  }
});

// Start server
server.listen(PROXY_PORT, () => {
  console.log('\n🚀 CORS Proxy for Grafana Started');
  console.log('=======================================');
  console.log(`📡 Proxy Server: http://localhost:${PROXY_PORT}`);
  console.log(`🎯 Target Server: ${GRAFANA_TARGET}`);
  console.log('📋 Usage:');
  console.log('  - Update Backstage .env:');
  console.log(`    REACT_APP_GRAFANA_URL_LOCAL=http://localhost:${PROXY_PORT}`);
  console.log('  - Restart Backstage');
  console.log('=======================================\n');
});

// Handle server errors
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PROXY_PORT} is already in use`);
    console.log('💡 Try stopping other processes or use a different port');
  } else {
    console.error('❌ Server error:', err);
  }
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down CORS proxy...');
  server.close(() => {
    console.log('✅ CORS proxy stopped');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down CORS proxy...');
  server.close(() => {
    console.log('✅ CORS proxy stopped');
    process.exit(0);
  });
});