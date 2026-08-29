/* ============================================================================
   SKILLBOOK — server.js
   Lightweight backend server for serving static assets & proxying AI requests
   ============================================================================ */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env manually if present
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...vals] = trimmed.split('=');
      if (key && vals.length > 0) {
        process.env[key.trim()] = vals.join('=').trim();
      }
    }
  });
}

const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
};

/* ------------------------------------------------------------------
   Dynamic Fallback Generator (Used if no API key is configured yet)
   ------------------------------------------------------------------ */
function generateFallbackSyllabus(payload) {
  const area = payload.area || 'General';
  const branch = payload.branch || 'Fundamentals';
  const topic = payload.topic || 'Self-Paced Learning';
  const level = payload.level || 'Intermediate';
  const count = Math.min(Math.max(Number(payload.chapters) || 6, 4), 10);

  const capitalTopic = topic.charAt(0).toUpperCase() + topic.slice(1);

  const sampleSections = [
    ['Core Definitions & Terms', 'Historical Background', 'Why This Subject Matters'],
    ['Foundational Axioms', 'Key Component Architecture', 'Common Misconceptions'],
    ['Step-by-Step Methodology', 'Standard Operations', 'Worked Problem Analysis'],
    ['Advanced Principles', 'Optimizing Workflows', 'Real-world Edge Cases'],
    ['Tooling & Ecosystem', 'Best Practices in Industry', 'Performance Considerations'],
    ['Case Study 1: Fundamentals in Action', 'Case Study 2: System Scale', 'Comparative Evaluation'],
    ['Troubleshooting & Diagnostics', 'Pattern Recognition', 'Error Prevention Strategies'],
    ['Future Directions', 'Synthesis & Integration', 'Final Practice Capstone']
  ];

  const chapters = [];
  for (let i = 1; i <= count; i++) {
    const secs = sampleSections[(i - 1) % sampleSections.length];
    chapters.push({
      n: i,
      title: `${capitalTopic}: Module ${i} — ${secs[0].split(' ')[0]} Focus`,
      kicker: `Chapter ${i} · ${level.toUpperCase()}`,
      mins: Math.floor(12 + Math.random() * 8),
      done: i === 1,
      sections: secs
    });
  }

  return {
    title: capitalTopic,
    subtitle: `${branch} (${area}) · ${level} Level Guide`,
    kicker: `${area.toUpperCase()} · ${branch.toUpperCase()}`,
    targetAudience: payload.target || 'General Learner',
    chapters
  };
}

/* ------------------------------------------------------------------
   AI Integration: Gemini API Call
   ------------------------------------------------------------------ */
async function callGeminiAPI(payload) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const prompt = `You are a master textbook author creating a structured Table of Contents for a book on "${payload.topic}".
Subject Area: ${payload.area}
Branch/Field: ${payload.branch}
Topic: ${payload.topic}
Target Audience / Level: ${payload.level} (${payload.target || 'Self-learner'})
Requested Chapter Count: ${payload.chapters || 6} chapters
Tone: ${payload.tone || 'Editorial, structured'}

Return ONLY a valid JSON object matching this exact schema:
{
  "title": "Clear Book Title",
  "subtitle": "Informative Subtitle",
  "kicker": "Category Tag",
  "targetAudience": "Description of target learner",
  "chapters": [
    {
      "n": 1,
      "title": "Chapter Title",
      "kicker": "Chapter 1 · Kicker",
      "mins": 15,
      "sections": ["Section Heading 1", "Section Heading 2", "Section Heading 3"]
    }
  ]
}`;

  const modelsToTry = ['gemini-3.6-flash', 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];

  for (const model of modelsToTry) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });

      if (!res.ok) {
        console.error(`Gemini API (${model}) HTTP Error:`, res.status, await res.text());
        continue;
      }

      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return JSON.parse(text);
    } catch (err) {
      console.error(`Gemini call failed for ${model}:`, err);
    }
  }

  return null;
}

/* ------------------------------------------------------------------
   HTTP Server Router
   ------------------------------------------------------------------ */
const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // API Endpoints
  if (pathname === '/api/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
    return;
  }

  if (pathname === '/api/syllabus' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body || '{}');
        console.log('Generating syllabus for:', payload.topic || 'Default Topic');

        let syllabus = await callGeminiAPI(payload);
        if (!syllabus) {
          console.log('Using smart fallback syllabus generator');
          syllabus = generateFallbackSyllabus(payload);
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, syllabus }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // Static File Serving
  let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(__dirname, 'index.html');
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end(`Server Error: ${err.code}`);
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

function startServer(portToTry) {
  server.listen(portToTry, () => {
    console.log(`\n📚 Skillbook server running at http://localhost:${portToTry}`);
    console.log(`- Health Check: http://localhost:${portToTry}/api/health`);
    console.log(`- Syllabus API: http://localhost:${portToTry}/api/syllabus (POST)\n`);
  });
}

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    const nextPort = Number(PORT) + 1;
    console.log(`Port ${PORT} in use, trying http://localhost:${nextPort}...`);
    startServer(nextPort);
  } else {
    console.error('Server error:', err);
  }
});

startServer(PORT);
