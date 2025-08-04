const express = require('express');
const client = require('prom-client');
const path = require('path');
const history = require('connect-history-api-fallback');
const app = express();

// Endpoint /metrics
app.get('/metrics', async (req, res) => {
  console.log('Metrics endpoint hit');
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ register: client.register });

// Middleware fallback cho React Router
app.use(history());

// Serve static files
app.use(express.static('build'));

app.listen(80, () => console.log('Frontend running on port 80'));