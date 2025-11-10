require('dotenv').config({ path: '.env.local' });
const dashboardKpis = require('./api/dashboard-kpis-fast.js');
const websiteProjectsReport = require('./api/website-projects-report.js');
const getAnalyticsKpis = require('./api/analytics/get-analytics-kpis.js');
const fetchGa4Metrics = require('./api/analytics/fetch-ga4-metrics.js');
const listProperties = require('./api/analytics/list-properties.js');
const getPropertyAnalytics = require('./api/analytics/get-property-analytics.js');
const syncMonthlyData = require('./api/analytics/sync-monthly-data.js');
const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs');

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Serve static files from public directory
  if (parsedUrl.pathname.startsWith('/') && !parsedUrl.pathname.startsWith('/api/')) {
    const filePath = parsedUrl.pathname === '/' ? '/index.html' : parsedUrl.pathname;
    const fullPath = path.join(__dirname, 'public', filePath);

    fs.readFile(fullPath, (err, content) => {
      if (err) {
        res.writeHead(404);
        res.end('File not found');
        return;
      }

      const ext = path.extname(filePath);
      const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.png': 'image/png',
        '.jpg': 'image/jpeg'
      };

      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/plain' });
      res.end(content);
    });
    return;
  }

  // Handle API routes
  if (parsedUrl.pathname === '/api/dashboard-kpis-fast') {
    req.query = parsedUrl.query;
    try {
      // Create a Vercel-compatible response wrapper
      const vercelRes = {
        status: (code) => ({
          json: (data) => {
            res.writeHead(code, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(data));
          }
        }),
        json: (data) => {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(data));
        }
      };

      await dashboardKpis(req, vercelRes);
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: error.message }));
    }
  } else if (parsedUrl.pathname === '/api/website-projects-report') {
    req.query = parsedUrl.query;
    try {
      // Create a Vercel-compatible response wrapper
      const vercelRes = {
        status: (code) => ({
          json: (data) => {
            res.writeHead(code, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(data));
          }
        }),
        json: (data) => {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(data));
        }
      };

      await websiteProjectsReport(req, vercelRes);
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: error.message }));
    }
  } else if (parsedUrl.pathname === '/api/analytics/get-analytics-kpis') {
    req.query = parsedUrl.query;
    try {
      // Create a Vercel-compatible response wrapper
      const vercelRes = {
        setHeader: (name, value) => res.setHeader(name, value),
        status: (code) => ({
          json: (data) => {
            res.writeHead(code, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(data));
          },
          end: () => {
            res.writeHead(code);
            res.end();
          }
        }),
        json: (data) => {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(data));
        }
      };

      await getAnalyticsKpis(req, vercelRes);
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: error.message }));
    }
  } else if (parsedUrl.pathname === '/api/analytics/fetch-ga4-metrics') {
    req.query = parsedUrl.query;

    // Handle POST body if needed
    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', async () => {
        try {
          req.body = body ? JSON.parse(body) : {};

          // Create a Vercel-compatible response wrapper
          const vercelRes = {
            setHeader: (name, value) => res.setHeader(name, value),
            status: (code) => ({
              json: (data) => {
                res.writeHead(code, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(data));
              },
              end: () => {
                res.writeHead(code);
                res.end();
              }
            }),
            json: (data) => {
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify(data));
            }
          };

          await fetchGa4Metrics(req, vercelRes);
        } catch (error) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: error.message }));
        }
      });
    } else {
      try {
        // Create a Vercel-compatible response wrapper
        const vercelRes = {
          setHeader: (name, value) => res.setHeader(name, value),
          status: (code) => ({
            json: (data) => {
              res.writeHead(code, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify(data));
            },
            end: () => {
              res.writeHead(code);
              res.end();
            }
          }),
          json: (data) => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(data));
          }
        };

        await fetchGa4Metrics(req, vercelRes);
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: error.message }));
      }
    }
  } else if (parsedUrl.pathname === '/api/analytics/list-properties') {
    req.query = parsedUrl.query;
    try {
      const vercelRes = {
        setHeader: (name, value) => res.setHeader(name, value),
        status: (code) => ({
          json: (data) => {
            res.writeHead(code, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(data));
          },
          end: () => {
            res.writeHead(code);
            res.end();
          }
        }),
        json: (data) => {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(data));
        }
      };

      await listProperties(req, vercelRes);
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: error.message }));
    }
  } else if (parsedUrl.pathname === '/api/analytics/get-property-analytics') {
    req.query = parsedUrl.query;
    try {
      const vercelRes = {
        setHeader: (name, value) => res.setHeader(name, value),
        status: (code) => ({
          json: (data) => {
            res.writeHead(code, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(data));
          },
          end: () => {
            res.writeHead(code);
            res.end();
          }
        }),
        json: (data) => {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(data));
        }
      };

      await getPropertyAnalytics(req, vercelRes);
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: error.message }));
    }
  } else if (parsedUrl.pathname === '/api/analytics/sync-monthly-data') {
    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', async () => {
        try {
          req.body = body ? JSON.parse(body) : {};

          const vercelRes = {
            setHeader: (name, value) => res.setHeader(name, value),
            status: (code) => ({
              json: (data) => {
                res.writeHead(code, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(data));
              },
              end: () => {
                res.writeHead(code);
                res.end();
              }
            }),
            json: (data) => {
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify(data));
            }
          };

          await syncMonthlyData(req, vercelRes);
        } catch (error) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: error.message }));
        }
      });
    } else {
      res.writeHead(405, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Method not allowed' }));
    }
  } else {
    res.writeHead(404);
    res.end('API endpoint not found');
  }
});

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});